/**
 * DocumentationPage
 * Comprehensive user guide with flowcharts and visual diagrams
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Book,
  Sparkles,
  Users,
  Bell,
  MessageSquare,
  CheckCircle,
  TrendingUp,
  Search,
  FileText,
  Zap,
  Shield,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

function DocumentationPage() {
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    gettingStarted: false,
    features: false,
    workflow: false,
    tips: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="min-h-screen bg-[#121212]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-gray-300 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </button>

          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <Book className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Documentation</h1>
              <p className="text-gray-300 mt-1">Complete guide to using ReferralSaathi</p>
            </div>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="bg-[#1a1a1a] border border-[#282828] rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-500" />
            Table of Contents
          </h2>
          <ul className="space-y-2 text-gray-300">
            <li><a href="#overview" className="hover:text-green-500 transition-colors">1. Overview</a></li>
            <li><a href="#getting-started" className="hover:text-green-500 transition-colors">2. Getting Started</a></li>
            <li><a href="#features" className="hover:text-green-500 transition-colors">3. Core Features</a></li>
            <li><a href="#workflow" className="hover:text-green-500 transition-colors">4. Complete Workflow</a></li>
            <li><a href="#tips" className="hover:text-green-500 transition-colors">5. Tips & Best Practices</a></li>
          </ul>
        </div>

        {/* Overview Section */}
        <Section
          id="overview"
          title="1. Overview"
          icon={<Sparkles className="w-6 h-6 text-green-500" />}
          expanded={expandedSections.overview}
          onToggle={() => toggleSection('overview')}
        >
          <p className="text-gray-300 mb-4">
            <strong className="text-white">ReferralSaathi</strong> is your personal assistant for managing job referrals. 
            Track conversations, set reminders, and use AI-powered tools to craft perfect responses to employees.
          </p>
          
          <div className="bg-[#121212] border border-[#282828] rounded-lg p-4 mb-6">
            <h4 className="text-white font-semibold mb-3">Key Benefits:</h4>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Never lose track of referral opportunities</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Stay on top of follow-ups with smart reminders</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Craft professional responses with AI assistance</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Organize all referral data in one place</span>
              </li>
            </ul>
          </div>

          {/* System Architecture Diagram */}
          <div className="bg-[#121212] border border-[#282828] rounded-lg p-6 mb-4">
            <h4 className="text-white font-semibold mb-4 text-center">Application Structure</h4>
            <div className="flex flex-col items-center space-y-4">
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <FeatureBox icon={<TrendingUp />} label="Dashboard" color="green" />
                <FeatureBox icon={<Users />} label="Referrals" color="blue" />
                <FeatureBox icon={<Bell />} label="Reminders" color="yellow" />
                <FeatureBox icon={<MessageSquare />} label="Reply Assistant" color="purple" />
              </div>
              <div className="text-center text-gray-400 text-sm">↓</div>
              <div className="bg-[#1a1a1a] border border-[#282828] rounded-lg p-4 text-center">
                <Shield className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-white font-semibold">Firebase Backend</p>
                <p className="text-gray-400 text-sm">Secure Cloud Storage</p>
              </div>
            </div>
          </div>
        </Section>

        {/* Getting Started Section */}
        <Section
          id="getting-started"
          title="2. Getting Started"
          icon={<Zap className="w-6 h-6 text-green-500" />}
          expanded={expandedSections.gettingStarted}
          onToggle={() => toggleSection('gettingStarted')}
        >
          <div className="space-y-6">
            <Step
              number="1"
              title="Create Your Account"
              description="Sign up using your email or Google account. Your data is securely stored and encrypted."
            />
            
            <Step
              number="2"
              title="Add Your First Referral"
              description="Click 'Add Referral' on the dashboard and fill in the job details and employee information."
            />
            
            <Step
              number="3"
              title="Track Conversations"
              description="Log every interaction with the employee to maintain a complete history."
            />
            
            <Step
              number="4"
              title="Set Reminders"
              description="Never miss a follow-up by setting smart reminders for important actions."
            />

            {/* Visual Flow */}
            <div className="bg-[#121212] border border-[#282828] rounded-lg p-6 mt-6">
              <h4 className="text-white font-semibold mb-4 text-center">Quick Start Flow</h4>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <FlowStep step="1" label="Sign Up" />
                <Arrow />
                <FlowStep step="2" label="Add Referral" />
                <Arrow />
                <FlowStep step="3" label="Track Progress" />
                <Arrow />
                <FlowStep step="4" label="Get Referred!" />
              </div>
            </div>
          </div>
        </Section>

        {/* Features Section */}
        <Section
          id="features"
          title="3. Core Features"
          icon={<Users className="w-6 h-6 text-green-500" />}
          expanded={expandedSections.features}
          onToggle={() => toggleSection('features')}
        >
          <div className="space-y-6">
            {/* Dashboard */}
            <FeatureCard
              icon={<TrendingUp className="w-6 h-6 text-green-500" />}
              title="Dashboard"
              description="Your command center with quick stats and actionable insights."
              features={[
                "Active referrals count",
                "Pending replies tracking",
                "Overdue reminders alerts",
                "Quick action buttons"
              ]}
            />

            {/* Referrals Management */}
            <FeatureCard
              icon={<Users className="w-6 h-6 text-blue-500" />}
              title="Referrals Management"
              description="Complete CRUD operations for managing all your referral opportunities."
              features={[
                "Add/Edit/Delete referrals",
                "Track application status",
                "Store employee contact details",
                "Conversation history logging",
                "Search and filter capabilities"
              ]}
            />

            {/* Reminders */}
            <FeatureCard
              icon={<Bell className="w-6 h-6 text-yellow-500" />}
              title="Smart Reminders"
              description="Never miss important follow-ups with intelligent reminder system."
              features={[
                "Create custom reminders",
                "Set due dates and priorities",
                "Link reminders to referrals",
                "Mark as complete",
                "Overdue notifications"
              ]}
            />

            {/* Reply Assistant */}
            <FeatureCard
              icon={<MessageSquare className="w-6 h-6 text-purple-500" />}
              title="AI Reply Assistant"
              description="Craft professional responses with AI-powered analysis."
              features={[
                "Sentiment analysis",
                "Intent detection",
                "Urgency assessment",
                "Suggested reply generation",
                "Context-aware responses"
              ]}
            />
          </div>
        </Section>

        {/* Workflow Section */}
        <Section
          id="workflow"
          title="4. Complete Workflow"
          icon={<FileText className="w-6 h-6 text-green-500" />}
          expanded={expandedSections.workflow}
          onToggle={() => toggleSection('workflow')}
        >
          <div className="bg-[#121212] border border-[#282828] rounded-lg p-6 mb-6">
            <h4 className="text-white font-semibold mb-4 text-center">Typical Referral Journey</h4>
            
            {/* Workflow Diagram */}
            <div className="space-y-4">
              <WorkflowStep
                step="1"
                title="Job Discovery"
                description="Find a job opportunity you're interested in"
                action="Note down job details and find employee"
              />
              
              <WorkflowStep
                step="2"
                title="Initial Contact"
                description="Reach out to employee on LinkedIn/Email"
                action="Add referral to ReferralSaathi with status 'Not Contacted'"
              />
              
              <WorkflowStep
                step="3"
                title="Employee Response"
                description="Employee replies to your message"
                action="Use Reply Assistant to analyze and craft response"
              />
              
              <WorkflowStep
                step="4"
                title="Information Exchange"
                description="Share resume, job ID, and other details"
                action="Log conversation and update status to 'Resume Shared'"
              />
              
              <WorkflowStep
                step="5"
                title="Follow-ups"
                description="Regular check-ins on application status"
                action="Set reminders for follow-ups every few days"
              />
              
              <WorkflowStep
                step="6"
                title="Application Submitted"
                description="Employee submits your referral"
                action="Update status to 'Application Submitted'"
              />
              
              <WorkflowStep
                step="7"
                title="Interview Process"
                description="HR reaches out for interviews"
                action="Update status and add interview details"
              />
              
              <WorkflowStep
                step="8"
                title="Final Outcome"
                description="Offer received or position closed"
                action="Mark as 'Successful' or 'Rejected' and thank employee"
              />
            </div>
          </div>

          {/* Status Flow Diagram */}
          <div className="bg-[#121212] border border-[#282828] rounded-lg p-6">
            <h4 className="text-white font-semibold mb-4 text-center">Status Progression</h4>
            <div className="flex flex-wrap justify-center gap-3">
              <StatusBadge label="Not Contacted" color="gray" />
              <span className="text-gray-500 self-center">→</span>
              <StatusBadge label="Message Sent" color="blue" />
              <span className="text-gray-500 self-center">→</span>
              <StatusBadge label="Resume Shared" color="yellow" />
              <span className="text-gray-500 self-center">→</span>
              <StatusBadge label="Application Submitted" color="purple" />
              <span className="text-gray-500 self-center">→</span>
              <StatusBadge label="Interview Scheduled" color="orange" />
              <span className="text-gray-500 self-center">→</span>
              <StatusBadge label="Successful" color="green" />
            </div>
          </div>
        </Section>

        {/* Tips Section */}
        <Section
          id="tips"
          title="5. Tips & Best Practices"
          icon={<Search className="w-6 h-6 text-green-500" />}
          expanded={expandedSections.tips}
          onToggle={() => toggleSection('tips')}
        >
          <div className="space-y-4">
            <TipCard
              title="🎯 Be Specific with Job Details"
              description="Always include job title, company name, and job ID. This helps you stay organized when managing multiple referrals."
            />
            
            <TipCard
              title="📝 Log Every Interaction"
              description="Document all conversations immediately. Details fade from memory, but recorded conversations help you track progress accurately."
            />
            
            <TipCard
              title="⏰ Set Realistic Reminders"
              description="Don't overwhelm employees with frequent follow-ups. Set reminders for 3-5 days apart unless they specify otherwise."
            />
            
            <TipCard
              title="🤖 Use Reply Assistant Wisely"
              description="Let AI analyze messages for sentiment and intent, but always personalize the suggested replies before sending."
            />
            
            <TipCard
              title="🔄 Keep Status Updated"
              description="Update referral status as soon as it changes. This helps you prioritize and avoid confusion."
            />
            
            <TipCard
              title="🙏 Show Gratitude"
              description="Always thank the employee, regardless of outcome. Maintaining good relationships opens doors for future opportunities."
            />
            
            <TipCard
              title="📊 Review Dashboard Regularly"
              description="Check your dashboard daily for overdue reminders and pending replies. Stay proactive, not reactive."
            />
            
            <TipCard
              title="🔒 Privacy Matters"
              description="Your referral data is private and secure. Never share your login credentials with anyone."
            />
          </div>
        </Section>

        {/* Quick Reference */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 mt-8">
          <h3 className="text-xl font-bold text-white mb-4">Quick Reference</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2">Keyboard Shortcuts</h4>
              <ul className="text-green-50 text-sm space-y-1">
                <li>• <code className="bg-black/20 px-2 py-0.5 rounded">Ctrl + K</code> Search</li>
                <li>• <code className="bg-black/20 px-2 py-0.5 rounded">Ctrl + N</code> New Referral</li>
                <li>• <code className="bg-black/20 px-2 py-0.5 rounded">Esc</code> Close Modal</li>
              </ul>
            </div>
            
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2">Need Help?</h4>
              <p className="text-green-50 text-sm">
                Contact support at:<br />
                <a href="mailto:support@referralsaathi.com" className="underline">
                  support@referralsaathi.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function Section({ id, title, icon, children, expanded, onToggle }) {
  return (
    <div id={id} className="bg-[#1a1a1a] border border-[#282828] rounded-xl mb-6 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-6 hover:bg-[#282828] transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon}
          <h2 className="text-2xl font-bold text-white">{title}</h2>
        </div>
        {expanded ? (
          <ChevronDown className="w-6 h-6 text-gray-400" />
        ) : (
          <ChevronRight className="w-6 h-6 text-gray-400" />
        )}
      </button>
      {expanded && (
        <div className="p-6 pt-0 border-t border-[#282828]">
          {children}
        </div>
      )}
    </div>
  );
}

function Step({ number, title, description }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
        {number}
      </div>
      <div className="flex-1">
        <h4 className="text-white font-semibold mb-1">{title}</h4>
        <p className="text-gray-300 text-sm">{description}</p>
      </div>
    </div>
  );
}

function FeatureBox({ icon, label, color }) {
  const colors = {
    green: 'bg-green-500/10 border-green-500/30 text-green-400',
    blue: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    yellow: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
    purple: 'bg-purple-500/10 border-purple-500/30 text-purple-400'
  };

  return (
    <div className={`${colors[color]} border rounded-lg p-4 text-center min-w-[140px]`}>
      <div className="flex justify-center mb-2">
        {React.cloneElement(icon, { className: 'w-8 h-8' })}
      </div>
      <p className="font-semibold">{label}</p>
    </div>
  );
}

function FlowStep({ step, label }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mb-2">
        {step}
      </div>
      <p className="text-gray-300 text-sm text-center">{label}</p>
    </div>
  );
}

function Arrow() {
  return (
    <div className="hidden sm:block text-gray-500 text-2xl">→</div>
  );
}

function FeatureCard({ icon, title, description, features }) {
  return (
    <div className="bg-[#121212] border border-[#282828] rounded-lg p-5">
      <div className="flex items-start gap-3 mb-3">
        <div className="mt-1">{icon}</div>
        <div>
          <h4 className="text-white font-semibold text-lg mb-1">{title}</h4>
          <p className="text-gray-300 text-sm">{description}</p>
        </div>
      </div>
      <ul className="ml-9 space-y-1 text-gray-400 text-sm">
        {features.map((feature, index) => (
          <li key={index}>• {feature}</li>
        ))}
      </ul>
    </div>
  );
}

function WorkflowStep({ step, title, description, action }) {
  return (
    <div className="bg-[#1a1a1a] border border-[#282828] rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-green-500/20 border border-green-500/40 rounded-full flex items-center justify-center flex-shrink-0 text-green-400 font-bold text-sm">
          {step}
        </div>
        <div className="flex-1">
          <h5 className="text-white font-semibold mb-1">{title}</h5>
          <p className="text-gray-400 text-sm mb-2">{description}</p>
          <div className="bg-[#121212] border border-[#282828] rounded px-3 py-2">
            <p className="text-gray-300 text-sm">
              <span className="text-green-400 font-medium">Action:</span> {action}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ label, color }) {
  const colors = {
    gray: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    yellow: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    purple: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    orange: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    green: 'bg-green-500/20 text-green-300 border-green-500/30'
  };

  return (
    <div className={`${colors[color]} border rounded-lg px-3 py-2 text-sm font-medium`}>
      {label}
    </div>
  );
}

function TipCard({ title, description }) {
  return (
    <div className="bg-[#121212] border border-[#282828] rounded-lg p-4">
      <h4 className="text-white font-semibold mb-2">{title}</h4>
      <p className="text-gray-300 text-sm">{description}</p>
    </div>
  );
}

export default DocumentationPage;
