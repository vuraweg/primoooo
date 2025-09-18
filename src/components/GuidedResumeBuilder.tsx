// src/components/GuidedResumeBuilder.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Eye,
  Home,
  Info,
  BookOpen,
  Phone,
  FileText,
  LogIn,
  LogOut,
  User,
  Wallet,
  Briefcase,
  Target,
  GraduationCap,
  Code,
  Award, // For Certifications and Achievements
  Sparkles,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ResumeData, UserType } from '../types/resume';

import { GuidedExperienceLevel } from './GuidedExperienceLevel';
import { GuidedEducation } from './GuidedEducation';
import { GuidedWorkExperience } from './GuidedWorkExperience';
import { GuidedProjects } from './GuidedProjects';
import { GuidedSkills } from './GuidedSkills';

import { ResumePreview } from './ResumePreview';
import { LoadingAnimation } from './LoadingAnimation';
import { paymentService } from '../services/paymentService';
import { getDetailedResumeScore } from '../services/scoringService';

interface GuidedResumeBuilderProps {
  isAuthenticated: boolean;
  onShowAuth: () => void;
  onShowProfile: (mode?: 'profile' | 'wallet') => void;
  onNavigateBack: () => void;
  userSubscription: any;
  refreshUserSubscription: () => Promise<void>;
  onShowSubscriptionPlans: (featureId?: string) => void;
  toolProcessTrigger: (() => void) | null;
  setToolProcessTrigger: React.Dispatch<React.SetStateAction<(() => void) | null>>;
}

interface PersonalInfoData {
  fullName: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  location: string;
  summary: string;
  careerObjective: string;
  targetRole: string;
}

interface EducationData {
  degree: string;
  school: string;
  year: string;
  cgpa?: string;
  location?: string;
}

interface WorkExperienceData {
  role: string;
  company: string;
  year: string;
  bullets: string[];
}

interface ProjectData {
  title: string;
  bullets: string[];
}

interface SkillData {
  category: string;
  count: number;
  list: string[];
}

interface CertificationData { // Ensure this matches src/types/resume.ts
  title: string;
  description: string;
}


export const GuidedResumeBuilder: React.FC<GuidedResumeBuilderProps> = ({
  isAuthenticated,
  onShowAuth,
  onShowProfile,
  onNavigateBack,
  userSubscription,
  refreshUserSubscription,
  onShowSubscriptionPlans,
  toolProcessTrigger,
  setToolProcessTrigger,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(0);
  const [userType, setUserType] = useState<UserType>('fresher');
  const [personalInfo, setPersonalInfo] = useState<PersonalInfoData>({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    linkedin: user?.linkedin || '',
    github: user?.github || '',
    location: '',
    summary: '',
    careerObjective: '',
    targetRole: '',
  });
  const [education, setEducation] = useState<EducationData[]>([
    { degree: '', school: '', year: '', cgpa: '', location: '' },
  ]);
  const [workExperience, setWorkExperience] = useState<WorkExperienceData[]>([
    { role: '', company: '', year: '', bullets: [''] },
  ]);
  const [projects, setProjects] = useState<ProjectData[]>([
    { title: '', bullets: [''] },
  ]);
  const [skills, setSkills] = useState<SkillData[]>([
    { category: '', count: 0, list: [] },
  ]);
  const [certifications, setCertifications] = useState<CertificationData[]>([ // NEW STATE
    { title: '', description: '' },
  ]);
  const [achievements, setAchievements] = useState<string[]>([ // NEW STATE
    '',
  ]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResume, setGeneratedResume] = useState<ResumeData | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [loadingScore, setLoadingScore] = useState(false);

  const generateResumeData = useCallback((): ResumeData => {
    return {
      name: personalInfo.fullName,
      phone: personalInfo.phone,
      email: personalInfo.email,
      linkedin: personalInfo.linkedin,
      github: personalInfo.github,
      location: personalInfo.location,
      targetRole: personalInfo.targetRole,
      summary: userType === 'experienced' ? personalInfo.summary : undefined,
      careerObjective: userType !== 'experienced' ? personalInfo.careerObjective : undefined,
      education: education.filter(edu => edu.degree.trim() || edu.school.trim() || edu.year.trim()),
      workExperience: workExperience.filter(we => we.role.trim() || we.company.trim() || we.year.trim()).map(we => ({
        ...we,
        bullets: we.bullets.filter(b => b.trim()),
      })),
      projects: projects.filter(p => p.title.trim() || p.bullets.some(b => b.trim())).map(p => ({
        ...p,
        bullets: p.bullets.filter(b => b.trim()),
      })),
      skills: skills.filter(s => s.category.trim() || s.list.some(item => item.trim())).map(s => ({
        ...s,
        list: s.list.filter(item => item.trim()),
      })),
      certifications: certifications.filter(c => c.title.trim() || c.description.trim()), // NEW: Filter empty certifications
      achievements: achievements.filter(a => a.trim()), // NEW: Filter empty achievements
      origin: 'guided',
    };
  }, [personalInfo, userType, education, workExperience, projects, skills, certifications, achievements]); // Add new states to dependencies

  const handleGenerateResume = useCallback(async () => {
    if (!isAuthenticated) {
      onShowAuth();
      return;
    }

    const creditsLeft =
      (userSubscription?.guidedBuildsTotal || 0) - (userSubscription?.guidedBuildsUsed || 0);

    if (!userSubscription || creditsLeft <= 0) {
      onShowSubscriptionPlans('guided-builder');
      return;
    }

    setIsGenerating(true);
    try {
      const resumeData = generateResumeData();
      setGeneratedResume(resumeData);

      // Decrement usage
      const usageResult = await paymentService.useGuidedBuild(userSubscription.userId);
      if (usageResult.success) {
        await refreshUserSubscription();
      } else {
        console.error('Failed to decrement guided build usage:', usageResult.error);
      }

      // Calculate score
      setLoadingScore(true);
      const detailedScore = await getDetailedResumeScore(resumeData, '', setLoadingScore); // Pass empty JD for general score
      setScore(detailedScore.totalScore);
    } catch (error) {
      console.error('Error generating resume:', error);
      alert('Failed to generate resume. Please try again.');
    } finally {
      setIsGenerating(false);
      setLoadingScore(false);
    }
  }, [
    isAuthenticated,
    onShowAuth,
    userSubscription,
    onShowSubscriptionPlans,
    generateResumeData,
    refreshUserSubscription,
  ]);

  useEffect(() => {
    setToolProcessTrigger(() => handleGenerateResume);
    return () => {
      setToolProcessTrigger(null);
    };
  }, [setToolProcessTrigger, handleGenerateResume]);

  const steps = [
    {
      id: 'personalInfo',
      title: 'Personal Information',
      icon: <User className="w-6 h-6" />,
      component: (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 dark:bg-dark-50 dark:border-dark-400">
          <GuidedPersonalInfo personalInfo={personalInfo} onPersonalInfoChange={setPersonalInfo} />
        </div>
      ),
      isValid: personalInfo.fullName.trim() !== '' && personalInfo.email.trim() !== '',
    },
    {
      id: 'experienceLevel',
      title: 'Experience Level',
      icon: <Briefcase className="w-6 h-6" />,
      component: (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 dark:bg-dark-50 dark:border-dark-400">
          <GuidedExperienceLevel userType={userType} onUserTypeChange={setUserType} />
        </div>
      ),
      isValid: true,
    },
    {
      id: 'education',
      title: 'Education',
      icon: <GraduationCap className="w-6 h-6" />,
      component: (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 dark:bg-dark-50 dark:border-dark-400">
          <GuidedEducation education={education} onEducationChange={setEducation} />
        </div>
      ),
      isValid: education.some(
        (edu) => edu.degree.trim() !== '' && edu.school.trim() !== '' && edu.year.trim() !== ''
      ),
    },
    {
      id: 'workExperience',
      title: 'Work Experience',
      icon: <Briefcase className="w-6 h-6" />,
      component: (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 dark:bg-dark-50 dark:border-dark-400">
          <GuidedWorkExperience workExperience={workExperience} onWorkExperienceChange={setWorkExperience} />
        </div>
      ),
      isValid: workExperience.some(
        (we) => we.role.trim() !== '' && we.company.trim() !== '' && we.year.trim() !== ''
      ),
    },
    {
      id: 'projects',
      title: 'Projects',
      icon: <Code className="w-6 h-6" />,
      component: (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 dark:bg-dark-50 dark:border-dark-400">
          <GuidedProjects projects={projects} onProjectsChange={setProjects} />
        </div>
      ),
      isValid: projects.some((p) => p.title.trim() !== '' && p.bullets.some((b) => b.trim() !== '')),
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

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = steps[currentStep];

  if (isGenerating || loadingScore) {
    return (
      <LoadingAnimation
        message={loadingScore ? 'Calculating Resume Score...' : 'Generating Your Resume...'}
        submessage={loadingScore ? 'Analyzing your resume against ATS standards.' : 'Compiling your details into a professional resume.'}
      />
    );
  }

  if (generatedResume && currentStep === steps.length - 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pb-16 dark:from-dark-50 dark:to-dark-200 transition-colors duration-300">
        <div className="container-responsive py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 dark:bg-dark-100 dark:border-dark-300">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center dark:text-gray-100">
                <CheckCircle className="w-6 h-6 mr-2 text-green-600" />
                Your Resume is Ready!
              </h2>
              <p className="text-gray-600 mb-6 dark:text-gray-300">
                You can now review, download, or further optimize your new resume.
              </p>
              <ResumePreview resumeData={generatedResume} userType={userType} />
              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => alert('Download PDF functionality here')}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-lg"
                >
                  Download PDF
                </button>
                <button
                  onClick={() => alert('Download DOCX functionality here')}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-lg"
                >
                  Download DOCX
                </button>
              </div>
              <button
                onClick={() => {
                  setGeneratedResume(null);
                  setCurrentStep(0);
                  setPersonalInfo({
                    fullName: user?.name || '',
                    email: user?.email || '',
                    phone: user?.phone || '',
                    linkedin: user?.linkedin || '',
                    github: user?.github || '',
                    location: '',
                    summary: '',
                    careerObjective: '',
                    targetRole: '',
                  });
                  setEducation([{ degree: '', school: '', year: '', cgpa: '', location: '' }]);
                  setWorkExperience([{ role: '', company: '', year: '', bullets: [''] }]);
                  setProjects([{ title: '', bullets: [''] }]);
                  setSkills([{ category: '', count: 0, list: [] }]);
                  setCertifications([{ title: '', description: '' }]); // Reset new state
                  setAchievements(['']); // Reset new state
                }}
                className="mt-6 w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                Start New Resume
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pb-16 dark:from-dark-50 dark:to-dark-200 transition-colors duration-300">
      <div className="container-responsive py-8">
        <button
          onClick={onNavigateBack}
          className="mb-6 bg-gradient-to-r from-neon-cyan-500 to-neon-blue-500 text-white hover:from-neon-cyan-400 hover:to-neon-blue-400 active:from-neon-cyan-600 active:to-neon-blue-600 shadow-md hover:shadow-neon-cyan py-3 px-5 rounded-xl inline-flex items-center space-x-2 transition-all duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:block">Back to Home</span>
        </button>

        <div className="max-w-7xl mx-auto space-y-6">
          {/* Progress Indicator */}
          <div className="bg-white rounded-xl shadow-lg p-3 border border-gray-200 dark:bg-dark-50 dark:border-dark-400">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Guided Resume Builder</h1>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Step {currentStep + 1} of {steps.length}
              </div>
            </div>

            {/* Step Progress Bar - Carousel Effect */}
            <div className="relative overflow-x-auto overflow-hidden w-[320px] mx-auto md:w-auto">
              <div
                className="flex items-center space-x-4 mb-6 transition-transform duration-300"
                style={{ transform: `translateX(-${currentStep * 96}px)` }}
              >
                {steps.map((step, index) => (
                  <React.Fragment key={step.id}>
                    <div className="flex flex-col items-center w-24 flex-shrink-0">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                          index < currentStep
                            ? 'bg-green-500 text-white'
                            : index === currentStep
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-500 dark:bg-dark-200 dark:text-gray-400'
                        }`}
                      >
                        {index < currentStep ? (
                          <CheckCircle className="w-5 h-5" />
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
          </div>

          {/* Current Step Content */}
          <div className="transition-all duration-300">
            {currentStepData.component}
          </div>

          {/* Navigation Buttons */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 dark:bg-dark-50 dark:border-dark-400">
            <div className="flex justify-between items-center gap-2">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 sm:w-auto flex-shrink-0 ${
                  currentStep === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-dark-200 dark:text-gray-500'
                    : 'bg-gray-600 hover:bg-gray-700 text-white shadow-lg hover:shadow-xl dark:bg-gray-700 dark:hover:bg-gray-800'
                }`}
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Previous</span>
              </button>

              <div className="text-center flex-grow sm:w-48 flex-shrink-0">
                <div className="text-sm text-gray-500 mb-1 dark:text-gray-400">Progress</div>
                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-dark-200">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                  />
                </div>
              </div>

              {currentStep < steps.length - 1 ? (
                <button
                  onClick={handleNext}
                  disabled={!currentStepData.isValid}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 sm:w-auto flex-shrink-0 ${
                    !currentStepData.isValid
                      ? 'bg-gray-400 text-gray-400 cursor-not-allowed dark:bg-dark-200 dark:text-gray-500'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl dark:bg-blue-700 dark:hover:bg-blue-800'
                  }`}
                >
                  <span>Next</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <div className="sm:w-24 flex-shrink-0" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
