// src/components/ResumePreview.tsx
import React from 'react';
import { ResumeData, UserType } from '../types/resume';
import { ExportOptions, layoutConfigs, paperSizeConfigs } from '../types/export';

interface ResumePreviewProps {
  resumeData: ResumeData;
  userType?: UserType;
  exportOptions?: ExportOptions;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({
  resumeData,
  userType = 'experienced',
  exportOptions
}) => {
  const layoutType = exportOptions?.layoutType || 'standard';
  const paperSize = exportOptions?.paperSize || 'a4';

  // Debug logging to check what data we're receiving
  console.log('ResumePreview received data:', resumeData);

  // Add validation to ensure we have valid resume data
  if (!resumeData) {
    return (
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-8 text-center">
          <div className="text-gray-500 mb-4">No resume data available</div>
          <div className="text-sm text-gray-400">Please ensure your resume has been properly optimized</div>
        </div>
      </div>
    );
  }

  // Ensure we have at least a name to display
  if (!resumeData.name || resumeData.name.trim() === '') {
    return (
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-8 text-center">
          <div className="text-gray-500 mb-4">Invalid resume data</div>
          <div className="text-sm text-gray-400">Resume name is missing or empty</div>
        </div>
      </div>
    );
  }

  // --- Moved style constants here (top of component function body) ---
  // Helper function to convert mm to px (1mm = 3.779528px at 96 DPI)
  const mmToPx = (mm: number) => mm * 3.779528;

  // Helper function to convert pt to px (1pt = 1.333px at 96 DPI)
  const ptToPx = (pt: number) => pt * 1.333;

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: exportOptions ? `${ptToPx(exportOptions.sectionHeaderSize)}px` : '13.33px', // Default 10pt converted to px
    fontWeight: 'bold',
    marginBottom: exportOptions ? `${mmToPx(exportOptions.sectionSpacing * 0.4)}px` : '5.33px',
    marginTop: exportOptions ? `${mmToPx(exportOptions.sectionSpacing)}px` : '11.34px',
    fontFamily: exportOptions ? `${exportOptions.fontFamily}, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif` : 'Calibri, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    letterSpacing: '0.5pt', // This is a constant value, not dependent on template
    textTransform: layoutType === 'minimalist' ? 'none' : 'uppercase',
    ...(layoutType === 'minimalist' && {
      borderBottom: '1px solid #e5e7eb',
      paddingBottom: '4px'
    })
  } as const;

  const sectionUnderlineStyle: React.CSSProperties = {
    borderBottomWidth: '0.5pt',
    borderColor: '#404040',
    height: '1px',
    marginBottom: exportOptions ? `${mmToPx(exportOptions.sectionSpacing * 0.6)}px` : '8px'
  };

  const bodyTextStyle: React.CSSProperties = {
    fontSize: exportOptions ? `${ptToPx(exportOptions.bodyTextSize)}px` : '12.67px',
    fontFamily: exportOptions ? `${exportOptions.fontFamily}, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif` : 'Calibri, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    lineHeight: '1.25'
  };

  // NEW: Define a common style for list items to ensure consistency
  const listItemStyle: React.CSSProperties = {
    ...bodyTextStyle,
    marginBottom: exportOptions ? `${mmToPx(exportOptions.entrySpacing * 0.25)}px` : '1.89px',
    position: 'relative', // Crucial for ::before absolute positioning
    paddingLeft: '15px', // Space for the custom bullet
  };

  // Build contact information with proper separators
  const buildContactInfo = () => {
    console.log('[ResumePreview] buildContactInfo - resumeData:', resumeData);
    console.log('[ResumePreview] Individual contact fields:');
    console.log('  - phone:', resumeData.phone);
    console.log('  - email:', resumeData.email);
    console.log('  - location:', resumeData.location);
    console.log('  - linkedin:', resumeData.linkedin);
    console.log('  - github:', resumeData.github);
    
    const parts: React.ReactNode[] = [];

    // Helper function to validate fields (matching exportUtils.ts logic)
    const isValidField = (field?: string | null, fieldType: 'phone' | 'email' | 'url' | 'text' = 'text'): boolean => {
      if (!field || field.trim() === '') return false;
      
      const lower = field.trim().toLowerCase();
      const invalidValues = ['n/a', 'not specified', 'none'];
      if (invalidValues.includes(lower)) return false;
      
      switch (fieldType) {
        case 'phone': {
          const digitCount = (field.match(/\d/g) || []).length;
          return digitCount >= 7 && digitCount <= 15;
        }
        case 'email':
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field);
        case 'url':
          return /^https?:\/\//.test(field) || 
                 /^(www\.)?linkedin\.com\/in\//.test(field) ||
                 /^(www\.)?github\.com\//.test(field) ||
                 /linkedin\.com\/in\//.test(field) ||
                 /github\.com\//.test(field);
        case 'text':
        default:
          return true;
      }
    };

    // Add contact fields in the same order as PDF export
    if (isValidField(resumeData.phone, 'phone')) {
      parts.push(
        <span key="phone" style={{ fontSize: exportOptions ? `${ptToPx(exportOptions.bodyTextSize - 0.5)}px` : '12px' }}>
          {resumeData.phone}
        </span>
      );
      console.log('[ResumePreview] Added phone:', resumeData.phone);
    }

    if (isValidField(resumeData.email, 'email')) {
      parts.push(
        <span key="email" style={{ fontSize: exportOptions ? `${ptToPx(exportOptions.bodyTextSize - 0.5)}px` : '12px' }}>
          {resumeData.email}
        </span>
      );
      console.log('[ResumePreview] Added email:', resumeData.email);
    }

    if (isValidField(resumeData.location, 'text')) {
      parts.push(
        <span key="location" style={{ fontSize: exportOptions ? `${ptToPx(exportOptions.bodyTextSize - 0.5)}px` : '12px' }}>
          {resumeData.location}
        </span>
      );
      console.log('[ResumePreview] Added location:', resumeData.location);
    }

    if (isValidField(resumeData.linkedin, 'url')) {
      let processedLinkedin = resumeData.linkedin;
      if (!processedLinkedin.startsWith('http')) {
        processedLinkedin = `https://${processedLinkedin}`;
      }
      parts.push(
        <span key="linkedin" style={{ fontSize: exportOptions ? `${ptToPx(exportOptions.bodyTextSize - 0.5)}px` : '12px' }}>
          {processedLinkedin}
        </span>
      );
      console.log('[ResumePreview] Added linkedin:', processedLinkedin);
    }

    if (isValidField(resumeData.github, 'url')) {
      let processedGithub = resumeData.github;
      if (!processedGithub.startsWith('http')) {
        processedGithub = `https://${processedGithub}`;
      }
      parts.push(
        <span key="github" style={{ fontSize: exportOptions ? `${ptToPx(exportOptions.bodyTextSize - 0.5)}px` : '12px' }}>
          {processedGithub}
        </span>
      );
      console.log('[ResumePreview] Added github:', processedGithub);
    }

    console.log('[ResumePreview] Total contact parts:', parts.length);
    
    // Join with | separator
    return parts.map((part, index) => (
      <React.Fragment key={index}>
        {part}
        {index < parts.length - 1 && <span className="mx-1" style={{ fontSize: exportOptions ? `${ptToPx(exportOptions.bodyTextSize)}px` : '13.33px' }}>|</span>}
      </React.Fragment>
    ));
  };

  const contactElements = buildContactInfo();

  // Define section order based on user type
  const getSectionOrder = () => {
    
    // Fallback to user type based ordering
    if (userType === 'experienced') {
      return ['summary', 'workExperience', 'skills