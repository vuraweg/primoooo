import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Eye,
  User,
  Briefcase,
  Target,
  GraduationCap,
  Code,
  Award,
  Sparkles,
  Loader2,
  Mail,
  Phone,
  Linkedin,
  Github,
  MapPin,
  FileText,
  Plus,
  X,
  Building,
  Calendar,
  Link,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- Mock Implementations to Resolve Imports ---

// Mock of types from ../types/resume
interface ResumeData {
  name: string;
  phone: string;
  email: string;
  linkedin: string;
  github: string;
  location: string;
  targetRole?: string;
  summary?: string;
  careerObjective?: string;
  education: Education[];
  workExperience: WorkExperience[];
  projects: Project[];
  skills: Skill[];
  certifications: Certification[];
  achievements?: string[];
  extraCurricularActivities?: string[];
  languagesKnown?: string[];
  personalDetails?: string;
  origin?: 'guided' | 'upload' | 'manual';
}
type UserType = 'student' | 'fresher' | 'experienced';
interface Education { degree: string; school: string; year: string; cgpa?: string; location?: string; relevantCoursework?: string[]; }
interface WorkExperience { role: string; company: string; year: string; bullets: string[]; }
interface Project { title: string; bullets: string[]; githubUrl?: string; }
interface Skill { category: string; list: string[]; }
interface Certification { title: string; description: string; }

// Mock of useAuth from ../contexts/AuthContext
const mockAuthContext = {
    user: { id: 'mock-user-123', name: 'Aisha Sharma', email: 'a.sharma@example.com', phone: '+91 98765 43210', linkedin: 'linkedin.com/in/aishasharma', github: 'github.com/aishasharma' }
};
const useAuth = () => mockAuthContext;

// Mock of ResumePreview from ./ResumePreview
const ResumePreview: React.FC<{ resumeData: ResumeData; userType: UserType; }> = ({ resumeData, userType }) => (
    <div className="p-6 border rounded-lg bg-gray-50 dark:bg-dark-100 dark:border-dark-300 h-full overflow-y-auto">
        <h3 className="font-bold text-xl text-center mb-2">{resumeData.name}</h3>
        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-4">{resumeData.email} | {resumeData.phone}</p>
        <hr className="my-2 dark:border-dark-300"/>
        <h4 className="font-bold mt-4">Summary</h4>
        <p className="text-sm text-gray-700 dark:text-gray-300">{resumeData.summary || resumeData.careerObjective}</p>
        <h4 className="font-bold mt-4">Experience</h4>
        {resumeData.workExperience?.map((job, i) => <p key={i} className="text-sm">{job.role} at {job.company}</p>)}
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
        await new Promise(res => setTimeout(res, 500));
        return { success: true };
    }
};

// Mock of scoringService from ../services/scoringService
const getDetailedResumeScore = async (data: ResumeData, jd: string, setLoading: React.Dispatch<React.SetStateAction<boolean>>) => {
    console.log('Mock: Calculating score...');
    await new Promise(res => setTimeout(res, 1000));
    return { totalScore: Math.floor(Math.random() * 25) + 75 };
};


// --- Interfaces (Copied from separate files) ---
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
  githubUrl?: string;
}

interface SkillData {
  category: string;
  count: number;
  list: string[];
}

interface CertificationData {
  title: string;
  description: string;
}

// --- Main Component ---
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
  const [certifications, setCertifications] = useState<CertificationData[]>([
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
      certifications: certifications.filter(c => c.title.trim() || c.description.trim()),
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

  // --- Inline Component Logic ---

  // GuidedPersonalInfo Logic
  const handlePersonalInfoChange = (data: PersonalInfoData) => {
    setPersonalInfo(data);
  };

  // GuidedExperienceLevel Logic
  const handleUserTypeChange = (type: UserType) => {
    setUserType(type);
  };

  // GuidedEducation Logic
  const addEducation = () => {
    setEducation([...education, { degree: '', school: '', year: '', cgpa: '', location: '' }]);
  };
  const updateEducation = (index: number, field: keyof EducationData, value: string) => {
    const updated = [...education];
    updated[index] = { ...updated[index], [field]: value };
    setEducation(updated);
  };
  const removeEducation = (index: number) => {
    if (education.length > 1) {
      setEducation(education.filter((_, i) => i !== index));
    } else {
      setEducation([{ degree: '', school: '', year: '', cgpa: '', location: '' }]);
    }
  };

  // GuidedWorkExperience Logic
  const addWorkExperience = () => {
    setWorkExperience([...workExperience, { role: '', company: '', year: '', bullets: [''] }]);
  };
  const updateWorkExperience = (index: number, field: keyof WorkExperienceData, value: string | string[]) => {
    const updated = [...workExperience];
    (updated[index] as any)[field] = value;
    setWorkExperience(updated);
  };
  const removeWorkExperience = (index: number) => {
    if (workExperience.length > 1) {
      setWorkExperience(workExperience.filter((_, i) => i !== index));
    } else {
      setWorkExperience([{ role: '', company: '', year: '', bullets: [''] }]);
    }
  };
  const addWorkBullet = (workIndex: number) => {
    const updated = [...workExperience];
    updated[workIndex].bullets.push('');
    setWorkExperience(updated);
  };
  const updateWorkBullet = (workIndex: number, bulletIndex: number, value: string) => {
    const updated = [...workExperience];
    updated[workIndex].bullets[bulletIndex] = value;
    setWorkExperience(updated);
  };
  const removeWorkBullet = (workIndex: number, bulletIndex: number) => {
    const updated = [...workExperience];
    if (updated[workIndex].bullets.length > 1) {
      updated[workIndex].bullets.splice(bulletIndex, 1);
      setWorkExperience(updated);
    }
  };

  // GuidedProjects Logic
  const addProject = () => {
    setProjects([...projects, { title: '', bullets: [''], githubUrl: '' }]);
  };
  const updateProject = (index: number, field: keyof ProjectData, value: string | string[]) => {
    const updated = [...projects];
    (updated[index] as any)[field] = value;
    setProjects(updated);
  };
  const removeProject = (index: number) => {
    if (projects.length > 1) {
      setProjects(projects.filter((_, i) => i !== index));
    } else {
      setProjects([{ title: '', bullets: [''], githubUrl: '' }]);
    }
  };
  const addProjectBullet = (projectIndex: number) => {
    const updated = [...projects];
    updated[projectIndex].bullets.push('');
    setProjects(updated);
  };
  const updateProjectBullet = (projectIndex: number, bulletIndex: number, value: string) => {
    const updated = [...projects];
    updated[projectIndex].bullets[bulletIndex] = value;
    setProjects(updated);
  };
  const removeProjectBullet = (projectIndex: number, bulletIndex: number) => {
    const updated = [...projects];
    if (updated[projectIndex].bullets.length > 1) {
      updated[projectIndex].bullets.splice(bulletIndex, 1);
      setProjects(updated);
    }
  };

  // GuidedSkills Logic
  const addSkillCategory = () => {
    setSkills([...skills, { category: '', count: 0, list: [] }]);
  };
  const updateSkillCategory = (index: number, field: keyof SkillData, value: string | string[]) => {
    const updated = [...skills];
    if (field === 'list') {
      (updated[index] as any)[field] = value;
       updated[index].count = (value as string[]).length;
    } else {
      (updated[index] as any)[field] = value;
    }
    setSkills(updated);
  };
  const removeSkillCategory = (index: number) => {
    if (skills.length > 1) {
      setSkills(skills.filter((_, i) => i !== index));
    } else {
      setSkills([{ category: '', count: 0, list: [] }]);
    }
  };
  const addSkillToCategory = (categoryIndex: number, skill: string) => {
    if (skill.trim()) {
      const updated = [...skills];
      const newSkillList = [...updated[categoryIndex].list, skill.trim()];
      updateSkillCategory(categoryIndex, 'list', newSkillList);
    }
  };
  const removeSkillFromCategory = (categoryIndex: number, skillIndex: number) => {
    const updated = [...skills];
    const newSkillList = updated[categoryIndex].list.filter((_, i) => i !== skillIndex);
    updateSkillCategory(categoryIndex, 'list', newSkillList);
  };

  // GuidedCertifications Logic
  const addCertification = () => {
    setCertifications([...certifications, { title: '', description: '' }]);
  };
  const updateCertification = (index: number, field: keyof CertificationData, value: string) => {
    const updated = [...certifications];
    updated[index] = { ...updated[index], [field]: value };
    setCertifications(updated);
  };
  const removeCertification = (index: number) => {
    if (certifications.length > 1) {
      setCertifications(certifications.filter((_, i) => i !== index));
    } else {
      setCertifications([{ title: '', description: '' }]);
    }
  };

  // GuidedAchievements Logic
  const addAchievement = () => {
    setAchievements([...achievements, '']);
  };
  const updateAchievement = (index: number, value: string) => {
    const updated = [...achievements];
    updated[index] = value;
    setAchievements(updated);
  };
  const removeAchievement = (index: number) => {
    if (achievements.length > 1) {
      setAchievements(achievements.filter((_, i) => i !== index));
    } else {
      setAchievements(['']);
    }
  };


  const steps = [
    {
      id: 'personalInfo',
      title: 'Personal Information',
      icon: <User className="w-6 h-6" />,
      component: (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 dark:bg-dark-50 dark:border-dark-400">
           <div className="text-center mb-6">
             <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><User className="w-8 h-8 text-blue-600" /></div>
             <h3 className="text-xl font-semibold text-gray-900 mb-2">Personal Information</h3>
             <p className="text-base text-gray-600">Let's start with your basic contact details.</p>
           </div>
          <div className="space-y-6">
              <input type="text" value={personalInfo.fullName} onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })} placeholder="Full Name *" className="w-full p-3 border rounded-lg" />
              <input type="email" value={personalInfo.email} onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })} placeholder="Email *" className="w-full p-3 border rounded-lg" />
              <input type="tel" value={personalInfo.phone} onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })} placeholder="Phone" className="w-full p-3 border rounded-lg" />
              <input type="text" value={personalInfo.location} onChange={(e) => setPersonalInfo({ ...personalInfo, location: e.target.value })} placeholder="Location" className="w-full p-3 border rounded-lg" />
              <input type="url" value={personalInfo.linkedin} onChange={(e) => setPersonalInfo({ ...personalInfo, linkedin: e.target.value })} placeholder="LinkedIn URL" className="w-full p-3 border rounded-lg" />
              <input type="url" value={personalInfo.github} onChange={(e) => setPersonalInfo({ ...personalInfo, github: e.target.value })} placeholder="GitHub URL" className="w-full p-3 border rounded-lg" />
              <input type="text" value={personalInfo.targetRole} onChange={(e) => setPersonalInfo({ ...personalInfo, targetRole: e.target.value })} placeholder="Target Role" className="w-full p-3 border rounded-lg" />
              <textarea value={personalInfo.summary} onChange={(e) => setPersonalInfo({ ...personalInfo, summary: e.target.value })} placeholder="Professional Summary" className="w-full p-3 border rounded-lg" rows={4}></textarea>
              <textarea value={personalInfo.careerObjective} onChange={(e) => setPersonalInfo({ ...personalInfo, careerObjective: e.target.value })} placeholder="Career Objective" className="w-full p-3 border rounded-lg" rows={3}></textarea>
          </div>
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
            <GuidedExperienceLevel userType={userType} onUserTypeChange={handleUserTypeChange} />
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
            <h3 className="text-xl font-semibold mb-4">Education</h3>
             {education.map((edu, index) => (
                 <div key={index} className="space-y-3 border-b pb-4 mb-4">
                     <input type="text" value={edu.degree} onChange={(e) => updateEducation(index, 'degree', e.target.value)} placeholder="Degree *" className="w-full p-3 border rounded-lg" />
                     <input type="text" value={edu.school} onChange={(e) => updateEducation(index, 'school', e.target.value)} placeholder="School/University *" className="w-full p-3 border rounded-lg" />
                     <input type="text" value={edu.year} onChange={(e) => updateEducation(index, 'year', e.target.value)} placeholder="Year of Completion *" className="w-full p-3 border rounded-lg" />
                     <button onClick={() => removeEducation(index)} className="text-red-500">Remove</button>
                 </div>
             ))}
             <button onClick={addEducation} className="mt-2 p-2 bg-blue-500 text-white rounded-lg">Add Education</button>
         </div>
       ),
      isValid: education.some(
        (edu) => edu.degree.trim() !== '' && edu.school.trim() !== '' && edu.year.trim() !== ''
      ),
    },
    // ... other steps will be fully fleshed out similarly
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
          <div className="min-h-screen bg-gray-50 p-8">
              <h2 className="text-3xl font-bold text-center mb-8">Your Resume is Ready!</h2>
              <div className="max-w-4xl mx-auto">
                  <ResumePreview resumeData={generatedResume} userType={userType} />
                  <div className="mt-8 flex justify-center gap-4">
                      <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold">Download PDF</button>
                      <button className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold">Download DOCX</button>
                      <button onClick={() => setGeneratedResume(null)} className="px-6 py-3 bg-gray-300 text-black rounded-lg font-semibold">Start Over</button>
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

