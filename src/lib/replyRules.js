/**
 * Reply Assistant - Rule-based Intent Detection
 * Conservative pattern matching without external APIs
 */

// Intent types
export const INTENTS = {
  RESUME_REQUESTED: 'resume_requested',
  JOB_ID_REQUESTED: 'job_id_requested',
  JOB_DETAILS_REQUESTED: 'job_details_requested',
  EMPLOYEE_AGREES: 'employee_agrees',
  WILL_CHECK_HR: 'will_check_hr',
  WILL_CONTACT_HIRING_MANAGER: 'will_contact_hiring_manager',
  REFERRAL_SUBMITTED: 'referral_submitted',
  REFERRAL_DECLINED: 'referral_declined',
  NO_VACANCY: 'no_vacancy',
  REFERRAL_LINK_SHARED: 'referral_link_shared',
  FOLLOW_UP_REQUESTED: 'follow_up_requested',
  UNCLEAR: 'unclear'
};

// Confidence levels
export const CONFIDENCE = {
  HIGH: 'high',      // 80-100%
  MEDIUM: 'medium',  // 50-79%
  LOW: 'low'         // 20-49%
};

// Pattern matching rules for each intent
const intentPatterns = {
  [INTENTS.RESUME_REQUESTED]: {
    patterns: [
      /(?:send|share|forward|attach|provide|email|upload).*(?:resume|cv|curriculum vitae)/i,
      /(?:resume|cv).*(?:send|share|forward|attach|provide|email)/i,
      /(?:can you|could you|please).*(?:resume|cv)/i,
      /(?:need|require|want).*(?:your|the)?\s*(?:resume|cv)/i,
      /(?:upload|attach).*(?:resume|cv)/i
    ],
    evidence: 'Resume request detected',
    nextAction: 'Send your resume to the employee',
    suggestedReply: 'Thank you for your willingness to help! I\'ve attached my resume to this message. Please let me know if you need any additional information.',
    followUpDays: 5,
    suggestedStatus: 'details_requested'
  },

  [INTENTS.JOB_ID_REQUESTED]: {
    patterns: [
      /(?:what|which|send|share|provide).*(?:job\s*id|job\s*code|requisition|req\s*id|posting\s*id)/i,
      /(?:job\s*id|job\s*code|requisition).*(?:is|number|code)/i,
      /(?:need|require).*(?:job\s*id|posting\s*id|req)/i
    ],
    evidence: 'Job ID request detected',
    nextAction: 'Provide the job ID or requisition number',
    suggestedReply: 'The Job ID is [INSERT_JOB_ID]. You can also find it in the posting URL: [INSERT_JOB_URL]. Thank you for your help!',
    followUpDays: 5,
    suggestedStatus: 'details_requested'
  },

  [INTENTS.JOB_DETAILS_REQUESTED]: {
    patterns: [
      /(?:send|share|provide|forward).*(?:job description|jd|job posting|job details|posting)/i,
      /(?:job description|posting|details).*(?:send|share|link)/i,
      /(?:can you|could you).*(?:send|share).*(?:details|description|posting)/i,
      /(?:need|want|require).*(?:more|additional)?\s*(?:details|information|description)/i
    ],
    evidence: 'Job details request detected',
    nextAction: 'Send the job description or posting link',
    suggestedReply: 'Here\'s the job posting link: [INSERT_JOB_URL]. The role involves [BRIEF_DESCRIPTION]. Please let me know if you need any other information!',
    followUpDays: 5,
    suggestedStatus: 'details_requested'
  },

  [INTENTS.EMPLOYEE_AGREES]: {
    patterns: [
      /(?:sure|yes|yeah|okay|ok|certainly|absolutely|definitely|of course)/i,
      /(?:happy|glad|willing).*(?:to help|to refer|to submit)/i,
      /(?:i can|i will|i'll|ill).*(?:help|refer|submit|forward)/i,
      /(?:no problem|sounds good|will do)/i,
      /(?:let me|i'll|ill).*(?:refer|submit|forward|send)/i
    ],
    evidence: 'Employee agreed to help',
    nextAction: 'Provide resume and job details',
    suggestedReply: 'Thank you so much for agreeing to help! I really appreciate it. I\'ve attached my resume and here\'s the job posting: [INSERT_JOB_URL]. Please let me know if you need anything else.',
    followUpDays: 7,
    suggestedStatus: 'employee_agreed'
  },

  [INTENTS.WILL_CHECK_HR]: {
    patterns: [
      /(?:check|talk|speak|contact|reach out).*(?:with|to)?\s*(?:hr|human resources|recruiter|recruitment)/i,
      /(?:let me|i'll|ill).*(?:check|verify|confirm).*(?:hr|openings|positions)/i,
      /(?:need to|have to|should).*(?:check|verify).*(?:with|internally)/i,
      /(?:hr|human resources).*(?:check|verify|confirm)/i
    ],
    evidence: 'Employee will check with HR',
    nextAction: 'Wait for HR feedback',
    suggestedReply: 'Thank you for checking with HR! I appreciate you taking the time to verify. Please let me know what you find out.',
    followUpDays: 7,
    suggestedStatus: 'employee_agreed'
  },

  [INTENTS.WILL_CONTACT_HIRING_MANAGER]: {
    patterns: [
      /(?:check|talk|speak|contact|reach out).*(?:with|to)?\s*(?:hiring manager|manager|team lead)/i,
      /(?:let me|i'll|ill).*(?:talk|speak|check).*(?:manager|team)/i,
      /(?:forward|send|share).*(?:to|with)?\s*(?:manager|team)/i,
      /(?:manager|team lead).*(?:check|contact|reach)/i
    ],
    evidence: 'Employee will contact hiring manager',
    nextAction: 'Wait for manager feedback',
    suggestedReply: 'Thank you for reaching out to the hiring manager! I really appreciate your help. Looking forward to hearing back.',
    followUpDays: 7,
    suggestedStatus: 'employee_agreed'
  },

  [INTENTS.REFERRAL_SUBMITTED]: {
    patterns: [
      /(?:submitted|sent|forwarded|shared|uploaded).*(?:referral|resume|application|profile)/i,
      /(?:referral|application|resume).*(?:submitted|sent|forwarded)/i,
      /(?:already|just|have).*(?:submitted|sent|referred)/i,
      /(?:done|completed|finished).*(?:referral|submission)/i,
      /(?:you should|you'll|you will).*(?:hear|receive|get).*(?:from|contact)/i
    ],
    evidence: 'Referral has been submitted',
    nextAction: 'Thank the employee and wait for HR contact',
    suggestedReply: 'Thank you so much for submitting the referral! I really appreciate your help. I\'ll keep an eye out for updates from the recruiting team.',
    followUpDays: 14,
    suggestedStatus: 'referral_submitted'
  },

  [INTENTS.REFERRAL_DECLINED]: {
    patterns: [
      /(?:sorry|unfortunately|regret)/i,
      /(?:can't|cannot|unable|won't|will not).*(?:refer|help|submit)/i,
      /(?:not|no).*(?:able to|position to|comfortable).*(?:refer|help)/i,
      /(?:don't|do not).*(?:think|feel).*(?:good fit|right fit|appropriate)/i,
      /(?:have to|must).*(?:decline|pass)/i
    ],
    evidence: 'Employee declined to provide referral',
    nextAction: 'Thank them and move on',
    suggestedReply: 'I completely understand. Thank you for considering it and for your honest feedback. I appreciate your time!',
    followUpDays: null,
    suggestedStatus: 'rejected'
  },

  [INTENTS.NO_VACANCY]: {
    patterns: [
      /(?:no|not|don't have).*(?:openings?|positions?|vacancies|roles?|spots?)/i,
      /(?:position|role|job).*(?:filled|closed|no longer available)/i,
      /(?:not|no).*(?:hiring|recruiting).*(?:currently|right now|at the moment)/i,
      /(?:freeze|frozen).*(?:hiring|positions|headcount)/i
    ],
    evidence: 'No vacancy available',
    nextAction: 'Thank them and ask about future opportunities',
    suggestedReply: 'Thank you for letting me know! I appreciate you checking. Would you mind keeping me in mind if any similar positions open up in the future?',
    followUpDays: 30,
    suggestedStatus: 'closed'
  },

  [INTENTS.REFERRAL_LINK_SHARED]: {
    patterns: [
      /(?:here|here's|here is).*(?:link|url|referral)/i,
      /(?:check|visit|apply).*(?:link|url|portal)/i,
      /(?:link|url|referral).*(?:below|attached|here)/i,
      /(?:apply through|use this).*(?:link|url|referral)/i,
      /https?:\/\/[^\s]+/i  // Contains URL
    ],
    evidence: 'Referral link provided',
    nextAction: 'Use the referral link to apply',
    suggestedReply: 'Thank you so much for the referral link! I\'ll apply through it right away and let you know once it\'s done.',
    followUpDays: 3,
    suggestedStatus: 'details_requested'
  },

  [INTENTS.FOLLOW_UP_REQUESTED]: {
    patterns: [
      /(?:follow up|get back|check back|touch base|circle back)/i,
      /(?:let me know|reach out).*(?:later|next week|few days|after)/i,
      /(?:i'll|ill|i will).*(?:update|inform|let you know)/i,
      /(?:wait|hold on|give me).*(?:time|while|moment)/i
    ],
    evidence: 'Follow-up requested',
    nextAction: 'Wait for the specified time and follow up',
    suggestedReply: 'Sounds good! I\'ll follow up with you then. Thank you for your help!',
    followUpDays: 7,
    suggestedStatus: 'waiting_response'
  },

  [INTENTS.UNCLEAR]: {
    patterns: [],  // Default fallback
    evidence: 'Message intent is unclear',
    nextAction: 'Ask for clarification',
    suggestedReply: 'Thank you for your message! Just to make sure I understand correctly, could you please clarify what you need from me? Happy to provide any information!',
    followUpDays: 3,
    suggestedStatus: null  // Don't suggest status change
  }
};

/**
 * Analyze message and detect intent
 * @param {string} message - The employee's message
 * @returns {Object} Analysis result with intent, confidence, evidence, etc.
 */
export const analyzeMessage = (message) => {
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return {
      intent: INTENTS.UNCLEAR,
      confidence: CONFIDENCE.LOW,
      confidenceScore: 0,
      evidence: 'No message provided',
      matchedPhrase: null,
      nextAction: 'Provide a message to analyze',
      suggestedReply: null,
      followUpDays: null,
      suggestedStatus: null
    };
  }

  const normalizedMessage = message.trim();
  const matches = [];

  // Test each intent's patterns
  for (const [intent, config] of Object.entries(intentPatterns)) {
    if (intent === INTENTS.UNCLEAR) continue; // Skip unclear as fallback

    for (const pattern of config.patterns) {
      const match = normalizedMessage.match(pattern);
      if (match) {
        matches.push({
          intent,
          config,
          matchedPhrase: match[0],
          patternIndex: config.patterns.indexOf(pattern)
        });
      }
    }
  }

  // If no matches, return unclear
  if (matches.length === 0) {
    const unclearConfig = intentPatterns[INTENTS.UNCLEAR];
    return {
      intent: INTENTS.UNCLEAR,
      confidence: CONFIDENCE.LOW,
      confidenceScore: 25,
      evidence: unclearConfig.evidence,
      matchedPhrase: null,
      nextAction: unclearConfig.nextAction,
      suggestedReply: unclearConfig.suggestedReply,
      followUpDays: unclearConfig.followUpDays,
      suggestedStatus: unclearConfig.suggestedStatus
    };
  }

  // If multiple matches, check for conflicts
  const uniqueIntents = [...new Set(matches.map(m => m.intent))];
  
  // If only one unique intent, use it
  if (uniqueIntents.length === 1) {
    const match = matches[0];
    const confidence = calculateConfidence(matches.length, normalizedMessage);
    
    return {
      intent: match.intent,
      confidence: confidence.level,
      confidenceScore: confidence.score,
      evidence: match.config.evidence,
      matchedPhrase: match.matchedPhrase,
      nextAction: match.config.nextAction,
      suggestedReply: match.config.suggestedReply,
      followUpDays: match.config.followUpDays,
      suggestedStatus: match.config.suggestedStatus
    };
  }

  // Multiple intents detected - use most specific or first match
  // Prioritize specific actions over general responses
  const priority = [
    INTENTS.REFERRAL_SUBMITTED,
    INTENTS.REFERRAL_DECLINED,
    INTENTS.NO_VACANCY,
    INTENTS.REFERRAL_LINK_SHARED,
    INTENTS.RESUME_REQUESTED,
    INTENTS.JOB_ID_REQUESTED,
    INTENTS.JOB_DETAILS_REQUESTED,
    INTENTS.WILL_CONTACT_HIRING_MANAGER,
    INTENTS.WILL_CHECK_HR,
    INTENTS.EMPLOYEE_AGREES,
    INTENTS.FOLLOW_UP_REQUESTED
  ];

  for (const intent of priority) {
    const match = matches.find(m => m.intent === intent);
    if (match) {
      const confidence = calculateConfidence(matches.length, normalizedMessage, true);
      
      return {
        intent: match.intent,
        confidence: confidence.level,
        confidenceScore: confidence.score,
        evidence: `${match.config.evidence} (multiple intents detected, showing most relevant)`,
        matchedPhrase: match.matchedPhrase,
        nextAction: match.config.nextAction,
        suggestedReply: match.config.suggestedReply,
        followUpDays: match.config.followUpDays,
        suggestedStatus: match.config.suggestedStatus,
        multipleIntentsDetected: true,
        alternativeIntents: uniqueIntents.filter(i => i !== match.intent)
      };
    }
  }

  // Fallback to first match
  const match = matches[0];
  const confidence = calculateConfidence(matches.length, normalizedMessage, true);
  
  return {
    intent: match.intent,
    confidence: confidence.level,
    confidenceScore: confidence.score,
    evidence: match.config.evidence,
    matchedPhrase: match.matchedPhrase,
    nextAction: match.config.nextAction,
    suggestedReply: match.config.suggestedReply,
    followUpDays: match.config.followUpDays,
    suggestedStatus: match.config.suggestedStatus
  };
};

/**
 * Calculate confidence based on matches and message characteristics
 * @param {number} matchCount - Number of pattern matches
 * @param {string} message - The message text
 * @param {boolean} hasConflicts - Whether multiple intents were detected
 * @returns {Object} Confidence level and score
 */
const calculateConfidence = (matchCount, message, hasConflicts = false) => {
  let score = 70; // Base score

  // Multiple matches increase confidence
  if (matchCount > 1) {
    score += Math.min(matchCount * 5, 20);
  }

  // Short messages are less confident
  const wordCount = message.split(/\s+/).length;
  if (wordCount < 5) {
    score -= 15;
  } else if (wordCount > 20) {
    score += 10;
  }

  // Conflicts reduce confidence
  if (hasConflicts) {
    score -= 20;
  }

  // Presence of uncertainty words reduces confidence
  const uncertaintyWords = /(?:maybe|perhaps|might|possibly|not sure|unclear)/i;
  if (uncertaintyWords.test(message)) {
    score -= 15;
  }

  // Cap score
  score = Math.max(20, Math.min(100, score));

  // Determine level
  let level;
  if (score >= 80) {
    level = CONFIDENCE.HIGH;
  } else if (score >= 50) {
    level = CONFIDENCE.MEDIUM;
  } else {
    level = CONFIDENCE.LOW;
  }

  return { level, score };
};

/**
 * Get user-friendly intent label
 * @param {string} intent - Intent constant
 * @returns {string} Human-readable label
 */
export const getIntentLabel = (intent) => {
  const labels = {
    [INTENTS.RESUME_REQUESTED]: 'Resume Requested',
    [INTENTS.JOB_ID_REQUESTED]: 'Job ID Requested',
    [INTENTS.JOB_DETAILS_REQUESTED]: 'Job Details Requested',
    [INTENTS.EMPLOYEE_AGREES]: 'Employee Agrees to Help',
    [INTENTS.WILL_CHECK_HR]: 'Will Check with HR',
    [INTENTS.WILL_CONTACT_HIRING_MANAGER]: 'Will Contact Hiring Manager',
    [INTENTS.REFERRAL_SUBMITTED]: 'Referral Submitted',
    [INTENTS.REFERRAL_DECLINED]: 'Referral Declined',
    [INTENTS.NO_VACANCY]: 'No Vacancy Available',
    [INTENTS.REFERRAL_LINK_SHARED]: 'Referral Link Shared',
    [INTENTS.FOLLOW_UP_REQUESTED]: 'Follow-up Requested',
    [INTENTS.UNCLEAR]: 'Unclear Message'
  };

  return labels[intent] || 'Unknown Intent';
};

/**
 * Get confidence color for UI display
 * @param {string} confidence - Confidence level
 * @returns {string} Color class or value
 */
export const getConfidenceColor = (confidence) => {
  const colors = {
    [CONFIDENCE.HIGH]: 'green',
    [CONFIDENCE.MEDIUM]: 'yellow',
    [CONFIDENCE.LOW]: 'red'
  };

  return colors[confidence] || 'gray';
};
