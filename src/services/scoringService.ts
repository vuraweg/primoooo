// src/services/scoringService.ts
import { ResumeData } from '../types/resume';

const SCORE_FLOOR = 90;

const hasAllRequiredSections = (resume: ResumeData): boolean => {
  return (
    !!resume.summary &&
    resume.education?.length > 0 &&
    resume.workExperience?.length > 0 &&
    resume.projects?.length > 0 &&
    resume.skills?.length > 0
  );
};

export const applyScoreFloor = (score: number, resume: ResumeData): number => {
  const meetsFloorCriteria =
    resume.origin === 'guided' ||
    resume.origin === 'jd_optimized' ||
    hasAllRequiredSections(resume);

  if (meetsFloorCriteria) {
    return Math.max(score, SCORE_FLOOR);
  }
  return score;
};


// The following are mock functions to simulate API calls.
// The syntax for the Authorization header has been corrected as requested.

const getComprehensiveScore = async (resume: ResumeData, apiKey: string): Promise<number> => {
    const url = "https://api.example.com/comprehensive-score";
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ resume }),
    });
    if (!response.ok) {
        throw new Error('Failed to fetch comprehensive score');
    }
    const data = await response.json();
    return data.score;
};

const getMatchScore = async (resume: ResumeData, jobDescription: string, apiKey: string): Promise<number> => {
    const url = "https://api.example.com/match-score";
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ resume, jobDescription }),
    });
    if (!response.ok) {
        throw new Error('Failed to fetch match score');
    }
    const data = await response.json();
    return data.score;
};

const getDetailedResumeScore = async (resume: ResumeData, apiKey: string): Promise<object> => {
    const url = "https://api.example.com/detailed-score";
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ resume }),
    });
    if (!response.ok) {
        throw new Error('Failed to fetch detailed resume score');
    }
    const data = await response.json();
    return data.scores;
};