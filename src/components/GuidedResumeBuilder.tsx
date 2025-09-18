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
  Plus,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ResumeData, UserType, Certification, WorkExperience, Education, Project, Skill } from '../types/resume';

// --- Mock Implementations to Resolve Imports ---

// Mock of useAuth from ../contexts/AuthContext
const mockAuthContext = {
    user: { id: 'mock-user-123', name: 'John Doe', email: 'john.doe@example.com', phone: '123-456-7890', linkedin: 'linkedin.com/in/johndoe', github: 'github.com/johndoe' }
};
const useAuth = () => mockAuthContext;

// Mock of ResumePreview from ./ResumePreview
const ResumePreview: React.FC<{ resumeData: ResumeData; userType: UserType; }> = ({ resumeData, userType }) => (
    <div className="p-6 border rounded-lg bg-gray-50 dark:bg-dark-100 dark:border-dark-300 h-full">
        <h3 className="font-bold text-xl text-center mb-2">{resumeData.name}</h3>
        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-4">{resumeData.email} | {resumeData.phone}</p>
        <hr className="my-2 dark:border-dark-300"/>
        <h4 className="font-bold mt-4">Summary</h4>
        <p className="text-sm text-gray-700 dark:text-gray-300">{resumeData.summary || resumeData.careerObjective}</p>
        <h4 className="font-bold mt-4">Experience</h4>
        {resumeData.workExperience?.map((job, i) => <p key={i} className="text-sm">{job.role} at {job.company}</p>)}
        {/* Add other sections as needed for a more complete preview */}
    </div>
);

// Mock of LoadingAnimation from ./LoadingAnimation
const LoadingAnimation: React.FC<{ message: string; submessage?: string; }> = ({ message, submessage }) => (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-8">
        <Loader2 className="animate-spin w-12 h-12 mx-auto mb-4 text-blue-500" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{message}</h3>
        {submessage && <p className="text-gray-500 dark:text-gray-400 mt-2">{submessage}</p>}
    </div>
);

// Mock of paymentService from ../services/paymentService
const paymentService = {
    useGuidedBuild: async (userId: string) => {
        console.log(`Mock: Using guided build credit for user ${userId}`);
        await new Promise(res => setTimeout(res, 500)); // simulate network delay
        return { success: true };
    }
};

// Mock of scoringService from ../services/scoringService
const getDetailedResumeScore = async (data: ResumeData, jd: string, setLoading: React.Dispatch<React.SetStateAction<boolean>>) => {
    console.log('Mock: Calculating score...');
    await new Promise(res => setTimeout(res, 1000)); // simulate network delay
    return { totalScore: Math.floor(Math.random() * 25) + 75 }; // Random score between 75-99
};


// --- Local Step Component Definitions ---

const GuidedPersonalInfo: React.FC<{ personalInfo: Partial<ResumeData>; onPersonalInfoChange: (data: Partial<ResumeData>) => void; }> = ({ personalInfo, onPersonalInfoChange }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        onPersonalInfoChange({ ...personalInfo, [e.target.name]: e.target.value });
    };

    return (
        <div className="space-y-4">
             <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="name" value={personalInfo.name || ''} onChange={handleChange} placeholder="Full Name *" className="p-3 border rounded-lg w-full dark:bg-dark-100 dark:border-dark-300" />
                <input name="email" value={personalInfo.email || ''} onChange={handleChange} placeholder="Email *" className="p-3 border rounded-lg w-full dark:bg-dark-100 dark:border-dark-300" />
                <input name="phone" value={personalInfo.phone || ''} onChange={handleChange} placeholder="Phone *" className="p-3 border rounded-lg w-full dark:bg-dark-100 dark:border-dark-300" />
                <input name="location" value={personalInfo.location || ''} onChange={handleChange} placeholder="Location (e.g., City, Country)" className="p-3 border rounded-lg w-full dark:bg-dark-100 dark:border-dark-300" />
                <input name="linkedin" value={personalInfo.linkedin || ''} onChange={handleChange} placeholder="LinkedIn Profile URL" className="p-3 border rounded-lg w-full dark:bg-dark-100 dark:border-dark-300" />
                <input name="github" value={personalInfo.github || ''} onChange={handleChange} placeholder="GitHub Profile URL" className="p-3 border rounded-lg w-full dark:bg-dark-100 dark:border-dark-300" />
            </div>
            <input name="targetRole" value={personalInfo.targetRole || ''} onChange={handleChange} placeholder="Target Role (e.g., Senior Software Engineer)" className="p-3 border rounded-lg w-full dark:bg-dark-100 dark:border-dark-300" />
            <textarea name="summary" value={personalInfo.summary || ''} onChange={handleChange} placeholder="Professional Summary" className="p-3 border rounded-lg w-full min-h-[100px] dark:bg-dark-100 dark:border-dark-300" />
            <textarea name="careerObjective" value={personalInfo.careerObjective || ''} onChange={handleChange} placeholder="Career Objective (for students/freshers)" className="p-3 border rounded-lg w-full min-h-[100px] dark:bg-dark-100 dark:border-dark-300" />
        </div>
    );
};

const GuidedExperienceLevel: React.FC<{ userType: UserType; onUserTypeChange: (type: UserType) => void; }> = ({ userType, onUserTypeChange }) => (
    <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Experience Level</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button onClick={() => onUserTypeChange('student')} className={`p-6 border-2 rounded-lg text-center transition-all ${userType === 'student' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/50 dark:border-blue-400' : 'hover:border-blue-400 dark:border-dark-300'}`}><GraduationCap className="mx-auto mb-2 w-8 h-8"/> Student</button>
            <button onClick={() => onUserTypeChange('fresher')} className={`p-6 border-2 rounded-lg text-center transition-all ${userType === 'fresher' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/50 dark:border-blue-400' : 'hover:border-blue-400 dark:border-dark-300'}`}><User className="mx-auto mb-2 w-8 h-8"/> Fresher</button>
            <button onClick={() => onUserTypeChange('experienced')} className={`p-6 border-2 rounded-lg text-center transition-all ${userType === 'experienced' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/50 dark:border-blue-400' : 'hover:border-blue-400 dark:border-dark-300'}`}><Briefcase className="mx-auto mb-2 w-8 h-8"/> Experienced</button>
        </div>
    </div>
);

const GuidedEducation: React.FC<{ education: Partial<Education>[]; onEducationChange: (data: Partial<Education>[]) => void; }> = ({ education, onEducationChange }) => {
    // Component logic to add, remove, and update education entries
    return <div>Education Component Placeholder</div>;
};
const GuidedWorkExperience: React.FC<{ workExperience: Partial<WorkExperience>[]; onWorkExperienceChange: (data: Partial<WorkExperience>[]) => void; }> = ({ workExperience, onWorkExperienceChange }) => {
    return <div>Work Experience Component Placeholder</div>;
};
const GuidedProjects: React.FC<{ projects: Partial<Project>[]; onProjectsChange: (data: Partial<Project>[]) => void; }> = ({ projects, onProjectsChange }) => {
    return <div>Projects Component Placeholder</div>;
};
const GuidedSkills: React.FC<{ skills: Partial<Skill>[]; onSkillsChange: (data: Partial<Skill>[]) => void; }> = ({ skills, onSkillsChange }) => {
    return <div>Skills Component Placeholder</div>;
};
const GuidedCertifications: React.FC<{ certifications: Partial<Certification>[]; onCertificationsChange: (data: Partial<Certification>[]) => void; }> = ({ certifications, onCertificationsChange }) => {
    return <div>Certifications Component Placeholder</div>;
};
const GuidedAchievements: React.FC<{ achievements: string[]; onAchievementsChange: (data: string[]) => void; }> = ({ achievements, onAchievementsChange }) => {
    return <div>Achievements Component Placeholder</div>;
};


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
  const [personalInfo, setPersonalInfo] = useState<Partial<ResumeData>>({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    linkedin: user?.linkedin || '',
    github: user?.github || '',
    location: '',
    summary: '',
    careerObjective: '',
    targetRole: '',
  });
  const [education, setEducation] = useState<Partial<Education>[]>([
    { degree: '', school: '', year: '', cgpa: '', location: '' },
  ]);
  const [workExperience, setWorkExperience] = useState<Partial<WorkExperience>[]>([
    { role: '', company: '', year: '', bullets: [''] },
  ]);
  const [projects, setProjects] = useState<Partial<Project>[]>([
    { title: '', bullets: [''] },
  ]);
  const [skills, setSkills] = useState<Partial<Skill>[]>([
    { category: '', list: [] },
  ]);
  const [certifications, setCertifications] = useState<Partial<Certification>[]>([
    { title: '', description: '' },
  ]);
  const [achievements, setAchievements] = useState<string[]>([
    '',
  ]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResume, setGeneratedResume] = useState<ResumeData | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [loadingScore, setLoadingScore] = useState(false);

  const generateResumeData = useCallback((): ResumeData => {
    return {
      name: personalInfo.name || '',
      phone: personalInfo.phone || '',
      email: personalInfo.email || '',
      linkedin: personalInfo.linkedin || '',
      github: personalInfo.github || '',
      location: personalInfo.location || '',
      targetRole: personalInfo.targetRole || '',
      summary: userType === 'experienced' ? personalInfo.summary : undefined,
      careerObjective: userType !== 'experienced' ? personalInfo.careerObjective : undefined,
      education: education.filter(edu => edu.degree?.trim() || edu.school?.trim() || edu.year?.trim()) as Education[],
      workExperience: workExperience.filter(we => we.role?.trim() || we.company?.trim() || we.year?.trim()).map(we => ({
        ...we,
        bullets: we.bullets?.filter(b => b.trim()) || [],
      })) as WorkExperience[],
      projects: projects.filter(p => p.title?.trim() || p.bullets?.some(b => b.trim())).map(p => ({
        ...p,
        bullets: p.bullets?.filter(b => b.trim()) || [],
      })) as Project[],
      skills: skills.filter(s => s.category?.trim() || s.list?.some(item => item.trim())).map(s => ({
        ...s,
        list: s.list?.filter(item => item.trim()) || [],
      })) as Skill[],
      certifications: certifications.filter(c => c.title?.trim() || c.description?.trim()) as Certification[],
      achievements: achievements.filter(a => a.trim()),
      origin: 'guided',
    };
  }, [personalInfo, userType, education, workExperience, projects, skills, certifications, achievements]);

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

      const usageResult = await paymentService.useGuidedBuild(userSubscription.userId);
      if (usageResult.success) {
        await refreshUserSubscription();
      } else {
        console.error('Failed to decrement guided build usage:', usageResult.error);
      }

      setLoadingScore(true);
      const detailedScore = await getDetailedResumeScore(resumeData, '', setLoadingScore);
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
      isValid: (personalInfo.name?.trim() ?? '') !== '' && (personalInfo.email?.trim() ?? '') !== '',
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
        (edu) => (edu.degree?.trim() ?? '') !== '' && (edu.school?.trim() ?? '') !== '' && (edu.year?.trim() ?? '') !== ''
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
        (we) => (we.role?.trim() ?? '') !== '' && (we.company?.trim() ?? '') !== '' && (we.year?.trim() ?? '') !== ''
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
      isValid: projects.some((p) => (p.title?.trim() ?? '') !== '' && (p.bullets ?? []).some((b) => b.trim() !== '')),
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
      isValid: skills.some((s) => (s.category?.trim() ?? '') !== '' && (s.list ?? []).some((item) => item.trim() !== '')),
    },
    { 
      id: 'certifications',
      title: 'Certifications',
      icon: <Award className="w-6 h-6" />,
      component: (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 dark:bg-dark-50 dark:border-dark-400">
          <GuidedCertifications certifications={certifications} onCertificationsChange={setCertifications} />
        </div>
      ),
      isValid: true 
    },
    { 
      id: 'achievements',
      title: 'Achievements',
      icon: <Award className="w-6 h-6" />,
      component: (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 dark:bg-dark-50 dark:border-dark-400">
          <GuidedAchievements achievements={achievements} onAchievementsChange={setAchievements} />
        </div>
      ),
      isValid: true
    },
    {
      id: 'review',
      title: 'Review & Generate',
      icon: <Eye className="w-6 h-6" />,
      component: (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 dark:bg-dark-50 dark:border-dark-400">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center dark:text-gray-100">
            <Eye className="w-5 h-5 mr-2 text-blue-600" />
            Review Your Resume
          </h2>
          <div className="mb-6">
            <ResumePreview resumeData={generateResumeData()} userType={userType} />
          </div>
          <button
            onClick={handleGenerateResume}
            disabled={isGenerating || loadingScore}
            className="w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
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
            <div className="mt-4 text-center text-lg font-semibold text-gray-900 dark:text-gray-100">
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

  if (generatedResume) {
      return (
          <div className="min-h-screen bg-gray-50 p-8 dark:bg-dark-200">
              <h2 className="text-3xl font-bold text-center mb-8 dark:text-gray-100">Your Resume is Ready!</h2>
              <div className="max-w-4xl mx-auto">
                  <ResumePreview resumeData={generatedResume} userType={userType} />
                  <div className="mt-8 flex justify-center gap-4">
                      <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow-lg hover:bg-blue-700">Download PDF</button>
                      <button className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold shadow-lg hover:bg-green-700">Download DOCX</button>
                      <button onClick={() => setGeneratedResume(null)} className="px-6 py-3 bg-gray-300 text-black rounded-lg font-semibold hover:bg-gray-400">Start Over</button>
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

        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200 dark:bg-dark-100 dark:border-dark-300">
             <div className="flex items-center justify-between mb-4">
               <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Guided Resume Builder</h1>
               <div className="text-sm text-gray-500 dark:text-gray-400">Step {currentStep + 1} of {steps.length}</div>
             </div>
             <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}></div>
             </div>
          </div>

          <div className="transition-all duration-300">
            {currentStepData.component}
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200 dark:bg-dark-100 dark:border-dark-300">
            <div className="flex justify-between items-center gap-4">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-gray-600 text-white"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Previous</span>
              </button>
              
              {currentStep < steps.length - 1 && (
                <button
                  onClick={handleNext}
                  disabled={!currentStepData.isValid}
                  className="flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 text-white"
                >
                  <span>Next</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

