/**
 * ReferralSaathi Gemini API Worker
 * Secure proxy for Gemini API with Firebase authentication
 */

import { jwtVerify, createRemoteJWKSet } from 'jose';

// Configuration constants
const MAX_MESSAGE_LENGTH = 5000;
const MAX_REQUEST_SIZE = 10240; // 10KB
const REQUEST_TIMEOUT = 30000; // 30 seconds
const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * Main request handler
 */
export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleCORS(env.ALLOWED_ORIGIN);
    }

    // Only accept POST requests
    if (request.method !== 'POST') {
      return jsonResponse(
        { error: 'Method not allowed' },
        405,
        env.ALLOWED_ORIGIN
      );
    }

    try {
      // Validate origin
      const origin = request.headers.get('Origin');
      if (!isOriginAllowed(origin, env.ALLOWED_ORIGIN)) {
        return jsonResponse(
          { error: 'Origin not allowed' },
          403,
          env.ALLOWED_ORIGIN
        );
      }

      // Check request size
      const contentLength = request.headers.get('Content-Length');
      if (contentLength && parseInt(contentLength) > MAX_REQUEST_SIZE) {
        return jsonResponse(
          { error: 'Request too large' },
          413,
          env.ALLOWED_ORIGIN
        );
      }

      // Parse and validate request body
      let body;
      try {
        body = await request.json();
      } catch (error) {
        return jsonResponse(
          { error: 'Invalid JSON' },
          400,
          env.ALLOWED_ORIGIN
        );
      }

      // Extract Authorization header
      const authHeader = request.headers.get('Authorization');
      const token = authHeader?.startsWith('Bearer ') 
        ? authHeader.substring(7) 
        : null;

      // Validate required fields
      if (!token) {
        return jsonResponse(
          { error: 'Missing or invalid authentication token' },
          401,
          env.ALLOWED_ORIGIN
        );
      }

      const { message, context } = body;

      if (!message || typeof message !== 'string') {
        return jsonResponse(
          { error: 'Missing or invalid message' },
          400,
          env.ALLOWED_ORIGIN
        );
      }

      // Validate message length
      if (message.length > MAX_MESSAGE_LENGTH) {
        return jsonResponse(
          { error: `Message too long. Maximum ${MAX_MESSAGE_LENGTH} characters` },
          400,
          env.ALLOWED_ORIGIN
        );
      }

      if (message.trim().length < 5) {
        return jsonResponse(
          { error: 'Message too short. Minimum 5 characters' },
          400,
          env.ALLOWED_ORIGIN
        );
      }

      // Verify Firebase ID token
      const userId = await verifyFirebaseToken(token, env.FIREBASE_PROJECT_ID);
      if (!userId) {
        return jsonResponse(
          { error: 'Invalid or expired authentication token' },
          401,
          env.ALLOWED_ORIGIN
        );
      }

      // Check if Gemini API key is configured
      if (!env.GEMINI_API_KEY) {
        return jsonResponse(
          { 
            error: 'Gemini API not configured',
            fallback: true,
            message: 'Using rule-based assistant. Configure GEMINI_API_KEY for AI-powered analysis.'
          },
          503,
          env.ALLOWED_ORIGIN
        );
      }

      // Call Gemini API with context
      const analysis = await analyzeWithGemini(
        message,
        context || {},
        env.GEMINI_API_KEY,
        env.GEMINI_MODEL || 'gemini-1.5-flash'
      );

      // Return successful response
      return jsonResponse(
        analysis,
        200,
        env.ALLOWED_ORIGIN
      );

    } catch (error) {
      console.error('Worker error:', error.message);
      
      // Don't expose internal error details
      return jsonResponse(
        { 
          error: 'Internal server error',
          fallback: true
        },
        500,
        env.ALLOWED_ORIGIN
      );
    }
  }
};

/**
 * Verify Firebase ID token using JWT verification
 * @param {string} token - Firebase ID token
 * @param {string} projectId - Firebase project ID
 * @returns {Promise<string|null>} User ID if valid, null otherwise
 */
async function verifyFirebaseToken(token, projectId) {
  try {
    // Firebase uses Google's public keys
    const JWKS = createRemoteJWKSet(
      new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com')
    );

    // Verify the token
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
      algorithms: ['RS256']
    });

    // Extract user ID
    return payload.sub || payload.user_id || null;

  } catch (error) {
    console.error('Token verification failed:', error.message);
    return null;
  }
}

/**
 * Analyze message using Gemini API with strict guidelines
 * @param {string} message - Employee's message to analyze
 * @param {Object} context - Additional context (referral status, company, job)
 * @param {string} apiKey - Gemini API key
 * @param {string} model - Gemini model name
 * @returns {Promise<Object>} Analysis result
 */
async function analyzeWithGemini(message, context, apiKey, model) {
  const systemInstruction = `You are an AI assistant helping users manage job referral communications professionally and ethically.

STRICT RULES - YOU MUST FOLLOW THESE:
1. NEVER invent or assume employee commitments they didn't explicitly make
2. NEVER mark a referral as submitted unless the employee explicitly confirms it
3. NEVER infer positive responses from ambiguous or unclear language
4. NEVER generate aggressive, pushy, or manipulative replies
5. ALWAYS keep suggested messages professional, polite, and concise (2-3 sentences maximum)
6. If the message is unclear, set confidence to LOW and intent to "unclear"
7. Do not make promises on behalf of the employee
8. Do not suggest following up more than once every 3-7 days unless employee requests it
9. Respect professional boundaries - if employee seems hesitant, suggest backing off

Your role is to HELP the user communicate professionally, not to maximize referral success at any cost.`;

  const contextInfo = context.referralStatus 
    ? `\n\nContext:\n- Current referral status: ${context.referralStatus}\n- Company: ${context.companyName || 'Not specified'}\n- Job title: ${context.jobTitle || 'Not specified'}`
    : '';

  const prompt = `${systemInstruction}

Analyze the following message from an employee regarding a job referral request.${contextInfo}

Employee message:
"""
${message}
"""

Provide your analysis in the following JSON format. Be accurate and conservative in your assessment:

{
  "intent": "intent_code",
  "confidence": confidence_percentage,
  "evidence": "brief explanation of detected intent",
  "recommendedAction": "what the user should do next",
  "suggestedReply": "professional 2-3 sentence reply",
  "followUpDays": suggested_days_to_follow_up,
  "statusSuggestion": "suggested_status_update_or_null"
}

Intent codes (choose the most accurate):
- "resume_requested": Employee asks for resume/CV
- "details_requested": Employee asks for job details, job ID, or requisition number
- "employee_agrees": Employee clearly agrees to help/refer
- "will_check": Employee will check with HR or hiring manager
- "referral_submitted": Employee confirms referral was submitted (must be explicit)
- "referral_declined": Employee declines to provide referral
- "positive_response": Positive but non-committal response
- "awaiting_update": Employee is waiting for information
- "no_vacancy": No current positions available
- "link_shared": Employee shares referral portal/link
- "follow_up_later": Employee asks to follow up later
- "unclear": Intent is unclear or ambiguous

Confidence: Number from 0-100 representing your confidence level

Status suggestion: Only suggest status changes when clearly warranted:
- "employee_agreed": Only when employee explicitly agrees to refer
- "details_requested": Only when employee explicitly asks for information
- "referral_submitted": Only when employee explicitly confirms submission
- "rejected": Only when employee explicitly declines
- null: For all other cases (default)

Follow-up days: Suggest 3-7 days for normal follow-up, 1-2 for urgent employee requests, 14+ if employee seems hesitant

Return ONLY the JSON object, no other text.`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(
      `${GEMINI_API_ENDPOINT}/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.2, // Very low temperature for consistent, conservative analysis
            topK: 20,
            topP: 0.9,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            }
          ]
        }),
        signal: controller.signal
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText.substring(0, 200));
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract generated text
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!generatedText) {
      throw new Error('No response from Gemini API');
    }

    // Parse JSON from generated text
    // Remove markdown code blocks if present
    let jsonText = generatedText.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\s*/g, '');
    }

    const analysis = JSON.parse(jsonText);

    // Validate and normalize response structure
    const validatedAnalysis = {
      intent: analysis.intent || 'unclear',
      confidence: typeof analysis.confidence === 'number' 
        ? analysis.confidence 
        : (analysis.confidence === 'high' ? 80 : analysis.confidence === 'medium' ? 50 : 30),
      evidence: analysis.evidence || 'Unable to determine clear intent',
      recommendedAction: analysis.recommendedAction || 'Review message carefully',
      suggestedReply: analysis.suggestedReply || '',
      followUpDays: typeof analysis.followUpDays === 'number' 
        ? Math.max(1, Math.min(30, analysis.followUpDays))
        : 5,
      statusSuggestion: analysis.statusSuggestion || null
    };

    return validatedAnalysis;

  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    
    console.error('Gemini API call failed:', error.message);
    throw error;
  }
}

/**
 * Check if origin is allowed
 * @param {string} origin - Request origin
 * @param {string} allowedOrigin - Configured allowed origin
 * @returns {boolean}
 */
function isOriginAllowed(origin, allowedOrigin) {
  if (!origin) return false;
  
  // Allow exact match
  if (origin === allowedOrigin) return true;
  
  // For development, allow localhost with any port
  if (allowedOrigin.includes('localhost') && origin.includes('localhost')) {
    return true;
  }
  
  return false;
}

/**
 * Handle CORS preflight request
 * @param {string} allowedOrigin - Allowed origin
 * @returns {Response}
 */
function handleCORS(allowedOrigin) {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': allowedOrigin || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
}

/**
 * Create JSON response with CORS headers
 * @param {Object} data - Response data
 * @param {number} status - HTTP status code
 * @param {string} allowedOrigin - Allowed origin
 * @returns {Response}
 */
function jsonResponse(data, status, allowedOrigin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': allowedOrigin || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}
