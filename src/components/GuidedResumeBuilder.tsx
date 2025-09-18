// src/components/GuidedResumeBuilder.tsx
import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  PlusCircle,
  User,
  Briefcase,
  GraduationCap,
  Code,
  Award,
  Save,
  Download,
  Loader2,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Target,
  FileText,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Linkedin,
  Github,
  Plus,
  X,
  ArrowRight,
  Eye
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ResumeData, UserType } from '../types/resume';
import { ResumePreview } from './ResumePreview';
import { ExportButtons } from './ExportButtons';
import { paymentService } from '../services/paymentService';
import { useNavigate } from 'react-router-dom';
import { LoadingAnimation } from './LoadingAnimation'; // Import LoadingAnimation

interface GuidedResumeBuilderProps {
  onNavigateBack: () => void;
  isAuthenticated: boolean;
  onShowAuth: () => void;
  userSubscription: any;
  onShowSubscriptionPlans: (featureId?: string) => void;
  onShowAlert: (title: string, message: string, type?: 'info' | 'success' | 'warning' | 'error', actionText?: string, onAction?: () => void) => void;
  refreshUserSubscription: () => Promise<void>;
  // NEW PROPS: For triggering tool process after add-on purchase
  toolProcessTrigger: (() => void) | null;
  setToolProcessTrigger: React.Dispatch<React.SetStateAction<(() => void) | null>>;
}

export const GuidedResumeBuilder: React.FC<GuidedResumeBuilderProps> = ({
  onNavigateBack,
  isAuthenticated,
  onShowAuth,
  userSubscription,
  onShowSubscriptionPlans,
  onShowAlert,
  refreshUserSubscription,
  toolProcessTrigger, // Destructure
  setToolProcessTrigger, // Destructure
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [resumeData, setResumeData] = useState<ResumeData>({
    name: '',
    phone: '',
    email: '',
    linkedin: '',
    github: '',
    location: '',
    targetRole: '',
    summary: '',
    education: [],
    workExperience: [],
    projects: [],
    skills: [],
    certifications: []
  });
  const [userType, setUserType] = useState<UserType>('fresher');
  const [showPreview, setShowPreview] = useState(false);

  // NEW STATE: To track if generation was interrupted due to credit
  const [generationInterrupted, setGenerationInterrupted] = useState(false);

  useEffect(() => {
    if (user) {
      setResumeData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        linkedin: user.linkedin || '',
        github: user.github || ''
      }));
    }
  }, [user]);

  // Register the handleGenerate function with the App.tsx trigger
  useEffect(() => {
    setToolProcessTrigger(() => handleGenerate);
    return () => {
      setToolProcessTrigger(null); // Clean up on unmount
    };
  }, [setToolProcessTrigger, isAuthenticated, userSubscription]); // Add dependencies for handleGenerate

  // NEW EFFECT: Re-trigger generation if it was interrupted and credits are now available
  useEffect(() => {
    if (generationInterrupted && userSubscription) { // Check userSubscription for existence
      // Explicitly refresh userSubscription to get the latest data
      refreshUserSubscription().then(() => {
        // After refresh, check if credits are now available
        if (userSubscription && (userSubscription.guidedBuildsTotal - userSubscription.guidedBuildsUsed) > 0) {
          console.log('GuidedResumeBuilder: Credits replenished, re-attempting generation.');
          setGenerationInterrupted(false); // Reset the flag immediately
          handleGenerate(); // Re-run the generation function
        }
      });
    }
  }, [generationInterrupted, refreshUserSubscription, userSubscription]); // Add refreshUserSubscription to dependencies

  const steps = [
    {
      id: 'personal',
      title: 'Personal Information',
      icon: <User className="w-6 h-6" />,
      component: <PersonalInfoStep resumeData={resumeData} setResumeData={setResumeData} />
    },
    {
      id: 'experience',
      title: 'Experience Level',
      icon: <Briefcase className="w-6 h-6" />,
      component: <ExperienceLevelStep userType={userType} setUserType={setUserType} />
    },
    {
      id: 'education',
      title: 'Education',
      icon: <GraduationCap className="w-6 h-6" />,
      component: <EducationStep resumeData={resumeData} setResumeData={setResumeData} />
    },
    {
      id: 'work',
      title: 'Work Experience',
      icon: <Briefcase className="w-6 h-6" />,
      component: <WorkExperienceStep resumeData={resumeData} setResumeData={setResumeData} userType={userType} />
    },
    {
      id: 'projects',
      title: 'Projects',
      icon: <Code className="w-6 h-6" />,
      component: <ProjectsStep resumeData={resumeData} setResumeData={setResumeData} />
    },
   {
      id: 'skills',
      title: 'Skills',
      icon: <Target className="w-6 h-6" />,
      component: (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 dark:bg-dark-50 dark:border-dark-400">
          <GuidedSkills skills={skills} onSkillsChange={setSkills} />
        </div>
      ),
      isValid: skills.some((s) => s.category.trim() !== '' && s.list.some((item) => item.trim() !== '')),
    },
    { // NEW STEP: Certifications
      id: 'certifications',
      title: 'Certifications',
      icon: <Award className="w-6 h-6" />,
      component: (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 dark:bg-dark-50 dark:border-dark-400">
          <GuidedCertifications certifications={certifications} onCertificationsChange={setCertifications} />
        </div>
      ),
      isValid: true // Certifications are optional, so always valid to proceed
    },
    { // NEW STEP: Achievements
      id: 'achievements',
      title: 'Achievements',
      icon: <Award className="w-6 h-6" />,
      component: (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 dark:bg-dark-50 dark:border-dark-400">
          <GuidedAchievements achievements={achievements} onAchievementsChange={setAchievements} />
        </div>
      ),
      isValid: true // Achievements are optional, so always valid to proceed
    },
    {
      id: 'review',
      title: 'Review & Generate',
      icon: <Eye className="w-6 h-6" />,
      component: (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 dark:bg-dark-50 dark:border-dark-400">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Eye className="w-5 h-5 mr-2 text-blue-600" />
            Review Your Resume
          </h2>
          <div className="mb-6">
            <ResumePreview resumeData={generateResumeData()} userType={userType} />
          </div>
          <button
            onClick={handleGenerateResume}
            disabled={isGenerating || loadingScore}
            className="w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl"
          >
            {isGenerating || loadingScore ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{loadingScore ? 'Calculating Score...' : 'Generating Resume...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6" />
                <span>Generate Final Resume</span>
              </>
            )}
          </button>
          {score !== null && (
            <div className="mt-4 text-center text-lg font-semibold text-gray-900">
              Resume Score: {score}%
            </div>
          )}
        </div>
      ),
      isValid: true,
    },
  ];

  async function handleGenerate() {
    console.log('GuidedResumeBuilder: handleGenerate called.'); // New log
    if (!isAuthenticated) {
      console.log('GuidedResumeBuilder: User not authenticated. Showing auth alert.'); // New log
      onShowAlert('Authentication Required', 'Please sign in to generate your resume.', 'error', 'Sign In', onShowAuth);
      return;
    }

    // Check subscription and guided build credits
    await refreshUserSubscription(); // Ensure userSubscription is up-to-date

    if (!userSubscription || (userSubscription.guidedBuildsTotal - userSubscription.guidedBuildsUsed) <= 0) {
      console.log('GuidedResumeBuilder: Guided build credits exhausted or no subscription. Calling onShowSubscriptionPlans.'); // New log
      setGenerationInterrupted(true); // Set flag: generation was interrupted
      onShowSubscriptionPlans('guided-builder'); // This should trigger the modal
      return;
    }
    console.log('GuidedResumeBuilder: Credits available. Proceeding with generation.'); // New log
    setIsGenerating(true);
    try {
      // Simulate AI generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Use guided build credit
      const usageResult = await paymentService.useGuidedBuild(user!.id);
      if (usageResult.success) {
        await refreshUserSubscription();
        setShowPreview(true);
        onShowAlert('Resume Generated!', 'Your professional resume has been created successfully.', 'success');
      } else {
        onShowAlert('Credit Usage Failed', 'Failed to record guided build usage. Please contact support.', 'error');
      }
    } catch (error) {
      onShowAlert('Generation Failed', 'Failed to generate resume. Please try again.', 'error');
    } finally {
      setIsGenerating(false);
    }
  }

  // New validation function for the current step
  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 0: // Personal Information
        return !!resumeData.name.trim() && !!resumeData.email.trim() && !!resumeData.phone.trim();
      case 1: // Experience Level
        return !!userType;
      case 2: // Education
        return resumeData.education.some(edu => 
          !!edu.degree.trim() && !!edu.school.trim() && !!edu.year.trim()
        );
      case 3: // Work Experience
        return resumeData.workExperience.some(work => 
          !!work.role.trim() && !!work.company.trim() && !!work.year.trim()
        );
      case 4: // Projects
        return resumeData.projects.some(project => 
          !!project.title.trim() && project.bullets.some(bullet => !!bullet.trim())
        );
      case 5: // Skills
        return resumeData.skills.some(skillCategory => 
          !!skillCategory.category.trim() && skillCategory.list.some(skill => !!skill.trim())
        );
      case 6: // Review & Generate (valid if basic info is there)
        return !!resumeData.name.trim() && !!resumeData.email.trim();
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateCurrentStep()) { // Only proceed if current step is valid
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      onShowAlert('Missing Information', 'Please fill in all required fields before proceeding.', 'warning');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Conditional rendering for LoadingAnimation
  if (isGenerating) {
    return (
      <LoadingAnimation
        message="Generating Your Professional Resume..."
        submessage="Our AI is crafting your resume based on your inputs..."
        type="generation"
      />
    );
  }

  if (showPreview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-dark-50 dark:to-dark-200 px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <button
              onClick={() => setShowPreview(false)}
              className="mb-6 bg-gradient-to-r from-neon-cyan-500 to-neon-blue-500 text-white hover:from-neon-cyan-400 hover:to-neon-blue-400 shadow-md hover:shadow-neon-cyan py-3 px-5 rounded-xl inline-flex items-center space-x-2 transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Builder</span>
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Your Professional Resume</h1>
            <p className="text-gray-600 dark:text-gray-300">Review and download your AI-generated resume</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ResumePreview resumeData={resumeData} userType={userType} />
            <ExportButtons resumeData={resumeData} userType={userType} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-dark-50 dark:to-dark-200 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate('/')}
            className="mb-6 bg-gradient-to-r from-neon-cyan-500 to-neon-blue-500 text-white hover:from-neon-cyan-400 hover:to-neon-blue-400 shadow-md hover:shadow-neon-cyan py-3 px-5 rounded-xl inline-flex items-center space-x-2 transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </button>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Guided Resume Builder
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Create a professional resume step-by-step with AI assistance
          </p>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200 dark:bg-dark-100 dark:border-dark-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Step {currentStep + 1} of {steps.length}</h2>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {steps[currentStep].title}
            </div>
          </div>

          <div className="flex items-center space-x-4 mb-6">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      index < currentStep
                        ? 'bg-green-500 text-white'
                        : index === currentStep
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-500 dark:bg-dark-200 dark:text-gray-400'
                    }`}
                  >
                    {index < currentStep ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      step.icon
                    )}
                  </div>
                  <span className={`text-xs mt-2 font-medium text-center ${
                    index <= currentStep ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                    index < currentStep ? 'bg-green-500' : 'bg-gray-200 dark:bg-dark-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Current Step Content */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200 dark:bg-dark-100 dark:border-dark-300">
          {steps[currentStep].component}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              currentStep === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-dark-200 dark:text-gray-500'
                : 'bg-gray-600 hover:bg-gray-700 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Previous</span>
          </button>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={!validateCurrentStep()} // Disable if current step is not valid
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                !validateCurrentStep()
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
              }`}
            >
              <span>Next</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

// Step Components
const PersonalInfoStep: React.FC<{ resumeData: ResumeData; setResumeData: React.Dispatch<React.SetStateAction<ResumeData>> }> = ({
  resumeData,
  setResumeData
}) => {
  const updateField = (field: keyof ResumeData, value: string) => {
    setResumeData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Personal Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            value={resumeData.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="John Doe"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-200 dark:border-dark-300 dark:text-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            value={resumeData.email}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder="john@example.com"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-200 dark:border-dark-300 dark:text-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            value={resumeData.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            placeholder="+1 (555) 123-4567"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-200 dark:border-dark-300 dark:text-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Location
          </label>
          <input
            type="text"
            value={resumeData.location || ''}
            onChange={(e) => updateField('location', e.target.value)}
            placeholder="City, State"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-200 dark:border-dark-300 dark:text-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            LinkedIn Profile
          </label>
          <input
            type="url"
            value={resumeData.linkedin}
            onChange={(e) => updateField('linkedin', e.target.value)}
            placeholder="https://linkedin.com/in/johndoe"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-200 dark:border-dark-300 dark:text-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            GitHub Profile
          </label>
          <input
            type="url"
            value={resumeData.github}
            onChange={(e) => updateField('github', e.target.value)}
            placeholder="https://github.com/johndoe"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-200 dark:border-dark-300 dark:text-gray-100"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Target Role
        </label>
        <input
          type="text"
          value={resumeData.targetRole || ''}
          onChange={(e) => updateField('targetRole', e.target.value)}
          placeholder="Software Engineer, Product Manager, etc."
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-200 dark:border-dark-300 dark:text-gray-100"
        />
      </div>
    </div>
  );
};

const ExperienceLevelStep: React.FC<{ userType: UserType; setUserType: React.Dispatch<React.SetStateAction<UserType>> }> = ({
  userType,
  setUserType
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Experience Level</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { id: 'student', title: 'Student', description: 'Currently studying or recent graduate', icon: <GraduationCap className="w-8 h-8" /> },
          { id: 'fresher', title: 'Fresher', description: 'New graduate or entry-level professional', icon: <User className="w-8 h-8" /> },
          { id: 'experienced', title: 'Experienced', description: 'Professional with 1+ years of work experience', icon: <Briefcase className="w-8 h-8" /> }
        ].map((type) => (
          <button
            key={type.id}
            onClick={() => setUserType(type.id as UserType)}
            className={`p-6 rounded-xl border-2 transition-all duration-300 ${
              userType === type.id
                ? 'border-blue-500 bg-blue-50 shadow-lg dark:border-neon-cyan-500 dark:bg-neon-cyan-500/20'
                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 dark:border-dark-300 dark:hover:border-neon-cyan-400'
            }`}
          >
            <div className={`mb-4 ${userType === type.id ? 'text-blue-600 dark:text-neon-cyan-400' : 'text-gray-500'}`}>
              {type.icon}
            </div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{type.title}</h4>
            <p className="text-gray-600 dark:text-gray-300 text-sm">{type.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

const EducationStep: React.FC<{ resumeData: ResumeData; setResumeData: React.Dispatch<React.SetStateAction<ResumeData>> }> = ({
  resumeData,
  setResumeData
}) => {
  const addEducation = () => {
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, { degree: '', school: '', year: '', cgpa: '', location: '' }]
    }));
  };

  const updateEducation = (index: number, field: string, value: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const removeEducation = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Education</h3>
        <button
          onClick={addEducation}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Education</span>
        </button>
      </div>

      {resumeData.education.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <GraduationCap className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No education added yet. Click "Add Education" to get started.</p>
        </div>
      )}

      {resumeData.education.map((edu, index) => (
        <div key={index} className="border border-gray-200 rounded-xl p-6 space-y-4 dark:border-dark-300">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">Education #{index + 1}</h4>
            {resumeData.education.length > 1 && (
              <button
                onClick={() => removeEducation(index)}
                className="text-red-600 hover:text-red-700 p-2"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Degree *</label>
              <input
                type="text"
                value={edu.degree}
                onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                placeholder="Bachelor of Technology"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-200 dark:border-dark-300 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Institution *</label>
              <input
                type="text"
                value={edu.school}
                onChange={(e) => updateEducation(index, 'school', e.target.value)}
                placeholder="University Name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-200 dark:border-dark-300 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Year *</label>
              <input
                type="text"
                value={edu.year}
                onChange={(e) => updateEducation(index, 'year', e.target.value)}
                placeholder="2020-2024"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-200 dark:border-dark-300 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">CGPA/GPA</label>
              <input
                type="text"
                value={edu.cgpa || ''}
                onChange={(e) => updateEducation(index, 'cgpa', e.target.value)}
                placeholder="8.5/10"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-200 dark:border-dark-300 dark:text-gray-100"
              />
            </div>
          </div>
        </div>
      ))}

      {resumeData.education.length === 0 && (
        <button
          onClick={addEducation}
          className="w-full border-2 border-dashed border-gray-300 rounded-xl p-8 text-gray-600 hover:text-gray-800 hover:border-gray-400 transition-colors flex flex-col items-center"
        >
          <Plus className="w-8 h-8 mb-2" />
          <span>Add Your First Education</span>
        </button>
      )}
    </div>
  );
};

const WorkExperienceStep: React.FC<{ 
  resumeData: ResumeData; 
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
  userType: UserType;
}> = ({ resumeData, setResumeData, userType }) => {
  const addWorkExperience = () => {
    setResumeData(prev => ({
      ...prev,
      workExperience: [...prev.workExperience, { role: '', company: '', year: '', bullets: [''] }]
    }));
  };

  const updateWorkExperience = (index: number, field: string, value: any) => {
    setResumeData(prev => ({
      ...prev,
      workExperience: prev.workExperience.map((work, i) => 
        i === index ? { ...work, [field]: value } : work
      )
    }));
  };

  const removeWorkExperience = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      workExperience: prev.workExperience.filter((_, i) => i !== index)
    }));
  };

  const addBullet = (workIndex: number) => {
    const updated = [...resumeData.workExperience];
    updated[workIndex].bullets.push('');
    setResumeData(prev => ({ ...prev, workExperience: updated }));
  };

  const updateBullet = (workIndex: number, bulletIndex: number, value: string) => {
    const updated = [...resumeData.workExperience];
    updated[workIndex].bullets[bulletIndex] = value;
    setResumeData(prev => ({ ...prev, workExperience: updated }));
  };

  const removeBullet = (workIndex: number, bulletIndex: number) => {
    const updated = [...resumeData.workExperience];
    if (updated[workIndex].bullets.length > 1) {
      updated[workIndex].bullets.splice(bulletIndex, 1);
      setResumeData(prev => ({ ...prev, workExperience: updated }));
    }
  };

  const sectionTitle = userType === 'student' ? 'Internships & Training' : 
                       userType === 'fresher' ? 'Internships & Work Experience' : 
                       'Professional Experience';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{sectionTitle}</h3>
        <button
          onClick={addWorkExperience}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Experience</span>
        </button>
      </div>

      {resumeData.workExperience.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No work experience added yet. {userType === 'student' ? 'Add internships or training programs.' : 'Add your professional experience.'}</p>
        </div>
      )}

      {resumeData.workExperience.map((work, index) => (
        <div key={index} className="border border-gray-200 rounded-xl p-6 space-y-4 dark:border-dark-300">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">Experience #{index + 1}</h4>
            {resumeData.workExperience.length > 1 && (
              <button
                onClick={() => removeWorkExperience(index)}
                className="text-red-600 hover:text-red-700 p-2"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Job Title *</label>
              <input
                type="text"
                value={work.role}
                onChange={(e) => updateWorkExperience(index, 'role', e.target.value)}
                placeholder="Software Engineer"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-200 dark:border-dark-300 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Company *</label>
              <input
                type="text"
                value={work.company}
                onChange={(e) => updateWorkExperience(index, 'company', e.target.value)}
                placeholder="TechCorp Inc."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-200 dark:border-dark-300 dark:text-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Duration *</label>
            <input
              type="text"
              value={work.year}
              onChange={(e) => updateWorkExperience(index, 'year', e.target.value)}
              placeholder="Jan 2023 - Present"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-200 dark:border-dark-300 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Key Responsibilities</label>
            {work.bullets.map((bullet, bulletIndex) => (
              <div key={bulletIndex} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={bullet}
                  onChange={(e) => updateBullet(index, bulletIndex, e.target.value)}
                  placeholder="Describe your responsibility/achievement"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-200 dark:border-dark-300 dark:text-gray-100"
                />
                {work.bullets.length > 1 && (
                  <button
                    onClick={() => removeBullet(index, bulletIndex)}
                    className="text-red-600 hover:text-red-700 p-2"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() => addBullet(index)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Responsibility
            </button>
          </div>
        </div>
      ))}

      {resumeData.workExperience.length === 0 && (
        <button
          onClick={addWorkExperience}
          className="w-full border-2 border-dashed border-gray-300 rounded-xl p-8 text-gray-600 hover:text-gray-800 hover:border-gray-400 transition-colors flex flex-col items-center"
        >
          <Plus className="w-8 h-8 mb-2" />
          <span>Add Your First Experience</span>
        </button>
      )}
    </div>
  );
};

const ProjectsStep: React.FC<{ resumeData: ResumeData; setResumeData: React.Dispatch<React.SetStateAction<ResumeData>> }> = ({
  resumeData,
  setResumeData
}) => {
  const addProject = () => {
    setResumeData(prev => ({
      ...prev,
      projects: [...prev.projects, { title: '', bullets: [''] }]
    }));
  };

  const updateProject = (index: number, field: string, value: any) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.map((project, i) => 
        i === index ? { ...project, [field]: value } : project
      )
    }));
  };

  const removeProject = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index)
    }));
  };

  const addProjectBullet = (projectIndex: number) => {
    const updated = [...resumeData.projects];
    updated[projectIndex].bullets.push('');
    setResumeData(prev => ({ ...prev, projects: updated }));
  };

  const updateProjectBullet = (projectIndex: number, bulletIndex: number, value: string) => {
    const updated = [...resumeData.projects];
    updated[projectIndex].bullets[bulletIndex] = value;
    setResumeData(prev => ({ ...prev, projects: updated }));
  };

  const removeProjectBullet = (projectIndex: number, bulletIndex: number) => {
    const updated = [...resumeData.projects];
    if (updated[projectIndex].bullets.length > 1) {
      updated[projectIndex].bullets.splice(bulletIndex, 1);
      setResumeData(prev => ({ ...prev, projects: updated }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Projects</h3>
        <button
          onClick={addProject}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Project</span>
        </button>
      </div>

      {resumeData.projects.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Code className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No projects added yet. Showcase your best work!</p>
        </div>
      )}

      {resumeData.projects.map((project, index) => (
        <div key={index} className="border border-gray-200 rounded-xl p-6 space-y-4 dark:border-dark-300">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">Project #{index + 1}</h4>
            {resumeData.projects.length > 1 && (
              <button
                onClick={() => removeProject(index)}
                className="text-red-600 hover:text-red-700 p-2"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Project Title *</label>
            <input
              type="text"
              value={project.title}
              onChange={(e) => updateProject(index, 'title', e.target.value)}
              placeholder="E-commerce Website"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-200 dark:border-dark-300 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Project Details</label>
            {project.bullets.map((bullet, bulletIndex) => (
              <div key={bulletIndex} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={bullet}
                  onChange={(e) => updateProjectBullet(index, bulletIndex, e.target.value)}
                  placeholder="Describe what you built/achieved"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-200 dark:border-dark-300 dark:text-gray-100"
                />
                {project.bullets.length > 1 && (
                  <button
                    onClick={() => removeProjectBullet(index, bulletIndex)}
                    className="text-red-600 hover:text-red-700 p-2"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() => addProjectBullet(index)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Detail
            </button>
          </div>
        </div>
      ))}

      {resumeData.projects.length === 0 && (
        <button
          onClick={addProject}
          className="w-full border-2 border-dashed border-gray-300 rounded-xl p-8 text-gray-600 hover:text-gray-800 hover:border-gray-400 transition-colors flex flex-col items-center"
        >
          <Plus className="w-8 h-8 mb-2" />
          <span>Add Your First Project</span>
        </button>
      )}
    </div>
  );
};

const SkillsStep: React.FC<{ resumeData: ResumeData; setResumeData: React.Dispatch<React.SetStateAction<ResumeData>> }> = ({
  resumeData,
  setResumeData
}) => {
  const addSkillCategory = () => {
    setResumeData(prev => ({
      ...prev,
      skills: [...prev.skills, { category: '', count: 0, list: [] }]
    }));
  };

  const updateSkillCategory = (index: number, field: string, value: any) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.map((skill, i) => 
        i === index ? { ...skill, [field]: value, count: field === 'list' ? value.length : skill.count } : skill
      )
    }));
  };

  const removeSkillCategory = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const addSkillToCategory = (categoryIndex: number, skill: string) => {
    if (skill.trim()) {
      const updated = [...resumeData.skills];
      updated[categoryIndex].list.push(skill.trim());
      updated[categoryIndex].count = updated[categoryIndex].list.length;
      setResumeData(prev => ({ ...prev, skills: updated }));
    }
  };

  const removeSkillFromCategory = (categoryIndex: number, skillIndex: number) => {
    const updated = [...resumeData.skills];
    updated[categoryIndex].list.splice(skillIndex, 1);
    updated[categoryIndex].count = updated[categoryIndex].list.length;
    setResumeData(prev => ({ ...prev, skills: updated }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Technical Skills</h3>
        <button
          onClick={addSkillCategory}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {resumeData.skills.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No skills added yet. Organize your skills by category.</p>
        </div>
      )}

      {resumeData.skills.map((skillCategory, index) => (
        <SkillCategoryCard
          key={index}
          skillCategory={skillCategory}
          index={index}
          onUpdateCategory={updateSkillCategory}
          onRemoveCategory={removeSkillCategory}
          onAddSkill={addSkillToCategory}
          onRemoveSkill={removeSkillFromCategory}
          canRemove={resumeData.skills.length > 1}
        />
      ))}

      {resumeData.skills.length === 0 && (
        <button
          onClick={addSkillCategory}
          className="w-full border-2 border-dashed border-gray-300 rounded-xl p-8 text-gray-600 hover:text-gray-800 hover:border-gray-400 transition-colors flex flex-col items-center"
        >
          <Plus className="w-8 h-8 mb-2" />
          <span>Add Your First Skill Category</span>
        </button>
      )}
    </div>
  );
};

const SkillCategoryCard: React.FC<{
  skillCategory: any;
  index: number;
  onUpdateCategory: (index: number, field: string, value: any) => void;
  onRemoveCategory: (index: number) => void;
  onAddSkill: (categoryIndex: number, skill: string) => void;
  onRemoveSkill: (categoryIndex: number, skillIndex: number) => void;
  canRemove: boolean;
}> = ({ skillCategory, index, onUpdateCategory, onRemoveCategory, onAddSkill, onRemoveSkill, canRemove }) => {
  const [newSkill, setNewSkill] = useState('');

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      onAddSkill(index, newSkill); // Use 'index' here
      setNewSkill('');
    }
  };

  return (
    <div className="border border-gray-200 rounded-xl p-6 space-y-4 dark:border-dark-300">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900 dark:text-gray-100">Category #{index + 1}</h4>
        {canRemove && (
          <button
            onClick={() => onRemoveCategory(index)}
            className="text-red-600 hover:text-red-700 p-2"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category Name *</label>
        <input
          type="text"
          value={skillCategory.category}
          onChange={(e) => onUpdateCategory(index, 'category', e.target.value)}
          placeholder="Programming Languages, Frameworks, etc."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-200 dark:border-dark-300 dark:text-gray-100"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Skills</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newSkill} // CORRECTED: Use newSkill state
            onChange={(e) => setNewSkill(e.target.value)} // CORRECTED: Update newSkill state
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddSkill(); // Call the handler
              }
            }}
            placeholder="e.g., JavaScript, React, Node.js"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-200 dark:border-dark-300 dark:text-gray-100"
          />
          <button
            onClick={handleAddSkill} // CORRECTED: Call the handler
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-3 py-3 rounded-lg transition-colors text-sm min-h-[44px]"
          >
            Add
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {skillCategory.list.map((skill: string, skillIndex: number) => (
            <span
              key={skillIndex}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
            >
              {skill}
              <button
                onClick={() => onRemoveSkill(index, skillIndex)} // CORRECTED: Use 'index'
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

const ReviewStep: React.FC<{
  resumeData: ResumeData;
  userType: UserType;
  onGenerate: () => void;
  isGenerating: boolean;
}> = ({ resumeData, userType, onGenerate, isGenerating }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Review & Generate</h3>
      
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 dark:from-dark-200 dark:to-dark-300">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Resume Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-white rounded-lg p-4 dark:bg-dark-100">
            <div className="text-2xl font-bold text-blue-600 dark:text-neon-cyan-400">{resumeData.education.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Education</div>
          </div>
          <div className="bg-white rounded-lg p-4 dark:bg-dark-100">
            <div className="text-2xl font-bold text-green-600 dark:text-neon-blue-400">{resumeData.workExperience.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Experience</div>
          </div>
          <div className="bg-white rounded-lg p-4 dark:bg-dark-100">
            <div className="text-2xl font-bold text-purple-600 dark:text-neon-purple-400">{resumeData.projects.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Projects</div>
          </div>
          <div className="bg-white rounded-lg p-4 dark:bg-dark-100">
            <div className="text-2xl font-bold text-orange-600 dark:text-neon-pink-400">{resumeData.skills.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Skill Categories</div>
          </div>
        </div>
      </div>

      {/* Detailed Review Section */}
      <div className="space-y-8 mt-8 border-t pt-8 dark:border-dark-300">
        {/* Personal Information */}
        <div className="bg-gray-50 dark:bg-dark-200 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center"><User className="w-5 h-5 mr-2" />Personal Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-700 dark:text-gray-300">
            <p><strong>Name:</strong> {resumeData.name}</p>
            <p><strong>Email:</strong> {resumeData.email}</p>
            <p><strong>Phone:</strong> {resumeData.phone}</p>
            {resumeData.location && <p><strong>Location:</strong> {resumeData.location}</p>}
            {resumeData.linkedin && <p><strong>LinkedIn:</strong> {resumeData.linkedin}</p>}
            {resumeData.github && <p><strong>GitHub:</strong> {resumeData.github}</p>}
            {resumeData.targetRole && <p><strong>Target Role:</strong> {resumeData.targetRole}</p>}
          </div>
        </div>

        {/* Education */}
        {resumeData.education.length > 0 && (
          <div className="bg-gray-50 dark:bg-dark-200 p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center"><GraduationCap className="w-5 h-5 mr-2" />Education</h4>
            <div className="space-y-4">
              {resumeData.education.map((edu, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 text-sm text-gray-700 dark:text-gray-300">
                  <p><strong>{edu.degree}</strong></p>
                  <p>{edu.school}</p>
                  <p className="text-gray-500">{edu.year}</p>
                  {edu.cgpa && <p className="text-gray-500">CGPA: {edu.cgpa}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Work Experience */}
        {resumeData.workExperience.length > 0 && (
          <div className="bg-gray-50 dark:bg-dark-200 p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center"><Briefcase className="w-5 h-5 mr-2" />Work Experience</h4>
            <div className="space-y-4">
              {resumeData.workExperience.map((work, index) => (
                <div key={index} className="border-l-4 border-green-500 pl-4 text-sm text-gray-700 dark:text-gray-300">
                  <p><strong>{work.role}</strong> at {work.company}</p>
                  <p className="text-gray-500">{work.year}</p>
                  {work.bullets.some(b => b.trim()) && (
                    <ul className="list-disc list-inside mt-1 text-gray-600 dark:text-gray-400">
                      {work.bullets.map((bullet, bIndex) => bullet && <li key={bIndex}>{bullet}</li>)}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {resumeData.projects.length > 0 && (
          <div className="bg-gray-50 dark:bg-dark-200 p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center"><Code className="w-5 h-5 mr-2" />Projects</h4>
            <div className="space-y-4">
              {resumeData.projects.map((project, index) => (
                <div key={index} className="border-l-4 border-purple-500 pl-4 text-sm text-gray-700 dark:text-gray-300">
                  <p><strong>{project.title}</strong></p>
                  {project.bullets.some(b => b.trim()) && (
                    <ul className="list-disc list-inside mt-1 text-gray-600 dark:text-gray-400">
                      {project.bullets.map((bullet, bIndex) => bullet && <li key={bIndex}>{bullet}</li>)}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {resumeData.skills.length > 0 && (
          <div className="bg-gray-50 dark:bg-dark-200 p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center"><Target className="w-5 h-5 mr-2" />Skills</h4>
            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              {resumeData.skills.map((skillCat, index) => (
                skillCat.list.length > 0 && (
                  <div key={index}>
                    <p><strong>{skillCat.category}:</strong> {skillCat.list.join(', ')}</p>
                  </div>
                )
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="text-center">
        <button
          onClick={onGenerate}
          disabled={isGenerating || !resumeData.name || !resumeData.email}
          className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center space-x-3 mx-auto shadow-xl hover:shadow-2xl ${
            isGenerating || !resumeData.name || !resumeData.email
              ? 'bg-gray-400 cursor-not-allowed text-white'
              : 'bg-gradient-to-r from-neon-cyan-500 to-neon-purple-500 hover:from-neon-cyan-400 hover:to-neon-purple-400 text-white hover:shadow-neon-cyan transform hover:scale-105'
          }`}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Generating Your Resume...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-6 h-6" />
              <span>Generate Professional Resume</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};