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
    return parts.map((part, index) => ( // Line 103
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
      return ['summary', 'workExperience', 'skills', 'projects', 'certifications', 'education'];
    } else if (userType === 'student') {
      return ['summary', 'education', 'skills', 'projects', 'workExperience', 'certifications', 'achievementsAndExtras'];
    } else { // 'fresher'
      return ['summary', 'education', 'skills', 'projects', 'workExperience', 'certifications', 'achievementsAndExtras'];
    }
  };

  const sectionOrder = getSectionOrder();

  const renderSection = (sectionName: string) => {
    // Style constants are now accessible from outside this function scope
    // No need to redefine them here.

    switch (sectionName) {
      case 'summary':
        // Conditional logic for 'Professional Summary' or 'Career Objective' based on layoutType
        const summaryLayout = layoutType;
        
              if (userType === 'student' || userType === 'fresher') { // Modified condition
          if (!resumeData.careerObjective || resumeData.careerObjective.trim() === '') return null;
          return (
            <div style={{ marginBottom: exportOptions ? `${mmToPx(exportOptions.sectionSpacing * 0.5)}px` : '16px' }}>
              <h2 style={sectionTitleStyle}>
                CAREER OBJECTIVE
              </h2> {/* No template-specific underline for objective */}
              <p style={{ ...bodyTextStyle, marginBottom: exportOptions ? `${mmToPx(exportOptions.entrySpacing)}px` : '7.56px' }}>
                {resumeData.careerObjective}
              </p>
            </div>
          );
        } else { // This will now only be for 'experienced'
          if (!resumeData.summary || resumeData.summary.trim() === '') return null;
          return (
            <div style={{
              marginBottom: exportOptions ? `${mmToPx(exportOptions.sectionSpacing * 0.5)}px` : '16px',
              ...(summaryLayout === 'compact' && { // Apply compact styling for summary
                backgroundColor: '#f8f9fa',
                padding: exportOptions ? `${mmToPx(exportOptions.entrySpacing)}px` : '7.56px',
                borderRadius: '4px'
              })
            }}>
              <h2 style={sectionTitleStyle}>
                PROFESSIONAL SUMMARY
              </h2>
              {summaryLayout !== 'minimalist' && <div style={sectionUnderlineStyle}></div>}
              <p style={{ ...bodyTextStyle, marginBottom: exportOptions ? `${mmToPx(exportOptions.entrySpacing)}px` : '7.56px' }}>
                {resumeData.summary}
              </p>
            </div>
          );
        }


      case 'workExperience':
        if (!resumeData.workExperience || resumeData.workExperience.length === 0) return null;
        
        const isCompactLayout = layoutType === 'compact';

        return (
          <div style={{ marginBottom: exportOptions ? `${mmToPx(exportOptions.sectionSpacing * 0.5)}px` : '16px' }}>
            <h2 style={sectionTitleStyle}>
              {userType === 'fresher' || userType === 'student' ? 'INTERNSHIPS & TRAINING' : 'PROFESSIONAL EXPERIENCE'}
            </h2>
            <div style={sectionUnderlineStyle}></div>

            {resumeData.workExperience.map((job, index) => (
              <div key={index} style={{ 
                marginBottom: exportOptions ? `${mmToPx(exportOptions.entrySpacing * 2)}px` : '15.12px',
                ...(isCompactLayout && { 
                  borderLeft: '2px solid #e5e7eb',
                  paddingLeft: exportOptions ? `${mmToPx(exportOptions.entrySpacing)}px` : '7.56px'
                })
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: exportOptions ? `${mmToPx(exportOptions.entrySpacing * 0.5)}px` : '3.78px' }}>
                  <div>
                    <div style={{
                      fontSize: exportOptions ? `${ptToPx(exportOptions.subHeaderSize)}px` : '12.67px',
                      fontWeight: 'bold',
                      fontFamily: exportOptions ? `${exportOptions.fontFamily}, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif` : 'Calibri, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
                    }}>
                      {job.role}
                    </div>
                    <div style={{
                      fontSize: exportOptions ? `${ptToPx(exportOptions.subHeaderSize)}px` : '12.67px',
                      fontWeight: 'bold',
                      fontFamily: exportOptions ? `${exportOptions.fontFamily}, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif` : 'Calibri, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
                    }}>
                      {job.company}{job.location ? `, ${job.location}` : ''}
                    </div>
                  </div>
                  <div style={{
                    fontSize: exportOptions ? `${ptToPx(exportOptions.subHeaderSize)}px` : '12.67px',
                    fontFamily: exportOptions ? `${exportOptions.fontFamily}, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif` : 'Calibri, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
                  }}>
                    {job.year}
                  </div>
                </div>
                {job.bullets && job.bullets.length > 0 && (
                  // MODIFIED: listStyleType to 'none'
                  <ul style={{ marginLeft: exportOptions ? `${mmToPx(exportOptions.entrySpacing * 2)}px` : '15.12px', listStyleType: 'none' }}> // Line 198
                    {job.bullets.map((bullet, bulletIndex) => (
                      // MODIFIED: Use listItemStyle
                      <li key={bulletIndex} style={listItemStyle}>
                        {typeof bullet === 'string' ? bullet : (bullet as any).description || JSON.stringify(bullet)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        );

      case 'education':
        if (!resumeData.education || resumeData.education.length === 0) return null;
        
        const isEducationPriority = userType === 'student';
        
        return (
          <div style={{ marginBottom: exportOptions ? `${mmToPx(exportOptions.sectionSpacing * 0.5)}px` : '16px' }}>
            <h2 style={sectionTitleStyle}>
              EDUCATION
            </h2>
            <div style={sectionUnderlineStyle}></div>

            {resumeData.education.map((edu, index) => (
              <div key={index} style={{ 
                marginBottom: exportOptions ? `${mmToPx(exportOptions.entrySpacing * 2)}px` : '15.12px',
                ...(isEducationPriority && {
                  backgroundColor: '#f8f9fa',
                  padding: exportOptions ? `${mmToPx(exportOptions.entrySpacing)}px` : '7.56px',
                  borderRadius: '4px'
                })
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{
                      fontSize: exportOptions ? `${ptToPx(exportOptions.subHeaderSize)}px` : '12.67px',
                      fontWeight: 'bold',
                      fontFamily: exportOptions ? `${exportOptions.fontFamily}, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif` : 'Calibri, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
                    }}>
                      {edu.degree}
                    </div>
                    <div style={{
                      fontSize: exportOptions ? `${ptToPx(exportOptions.subHeaderSize)}px` : '12.67px',
                      fontWeight: 'bold',
                      fontFamily: exportOptions ? `${exportOptions.fontFamily}, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif` : 'Calibri, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
                    }}>
                      {edu.school}{edu.location ? `, ${edu.location}` : ''}
                    </div>
                    {edu.cgpa && (
                      <div style={{
                        fontSize: exportOptions ? `${ptToPx(exportOptions.bodyTextSize)}px` : '12.67px',
                        fontFamily: exportOptions ? `${exportOptions.fontFamily}, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif` : 'Calibri, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
                        color: '#4B5563'
                      }}>
                        CGPA: {edu.cgpa}
                      </div>
                    )}
                    {edu.relevantCoursework && edu.relevantCoursework.length > 0 && (
                        <div style={{
                          fontSize: exportOptions ? `${ptToPx(exportOptions.bodyTextSize)}px` : '12.67px',
                          fontFamily: exportOptions ? `${exportOptions.fontFamily}, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif` : 'Calibri, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
                          color: '#4B5563'
                        }}>
                          Relevant Coursework: {edu.relevantCoursework.join(', ')}
                        </div>
                    )}
                  </div>
                  <div style={{
                    fontSize: exportOptions ? `${ptToPx(exportOptions.subHeaderSize)}px` : '12.67px',
                    fontFamily: exportOptions ? `${exportOptions.fontFamily}, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif` : 'Calibri, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
                  }}>
                    {edu.year}
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'projects':
        if (!resumeData.projects || resumeData.projects.length === 0) return null;
        
        const isProjectsFocused = layoutType === 'compact';
        
        return (
          <div style={{ marginBottom: exportOptions ? `${mmToPx(exportOptions.sectionSpacing * 0.5)}px` : '16px' }}>
            <h2 style={sectionTitleStyle}>
              {userType === 'fresher' || userType === 'student' ? 'ACADEMIC PROJECTS' : 'PROJECTS'}
            </h2>
            <div style={sectionUnderlineStyle}></div>

            {resumeData.projects.map((project, index) => (
              <div key={index} style={{ 
                marginBottom: exportOptions ? `${mmToPx(exportOptions.entrySpacing * 2)}px` : '15.12px',
                ...(isProjectsFocused && {
                  backgroundColor: '#f8f9fa',
                  padding: exportOptions ? `${mmToPx(exportOptions.entrySpacing)}px` : '7.56px',
                  borderRadius: '4px',
                  border: '1px solid #e9ecef'
                })
              }}>
                <div style={{
                  fontSize: exportOptions ? `${ptToPx(exportOptions.subHeaderSize)}px` : '12.67px',
                  fontWeight: 'bold',
                  fontFamily: exportOptions ? `${exportOptions.fontFamily}, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif` : 'Calibri, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
                  marginBottom: exportOptions ? `${mmToPx(exportOptions.entrySpacing * 0.5)}px` : '3.78px'
                }}>
                  {project.title}
                </div>
                {project.bullets && project.bullets.length > 0 && (
                  // MODIFIED: listStyleType to 'none'
                  <ul style={{ marginLeft: exportOptions ? `${mmToPx(exportOptions.entrySpacing * 2)}px` : '15.12px', listStyleType: 'none' }}> // Line 289
                    {project.bullets.map((bullet, bulletIndex) => (
                      // MODIFIED: Use listItemStyle
                      <li key={bulletIndex} style={listItemStyle}>
                        {typeof bullet === 'string' ? bullet : (bullet as any).description || JSON.stringify(bullet)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        );

      case 'skills':
        if (!resumeData.skills || resumeData.skills.length === 0) return null;
        
        // Enhanced skills rendering for functional and combination templates
        const isSkillsFocused = layoutType === 'compact';
        
        return (
          <div style={{ marginBottom: exportOptions ? `${mmToPx(exportOptions.sectionSpacing * 0.5)}px` : '16px' }}>
            <h2 style={sectionTitleStyle}>
              TECHNICAL SKILLS
            </h2>
            <div style={sectionUnderlineStyle}></div>

            {isSkillsFocused ? (
              // Enhanced skills display for functional/combination templates
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: exportOptions ? `${mmToPx(exportOptions.entrySpacing)}px` : '7.56px' }}>
                {resumeData.skills.map((skill, index) => (
                  <div key={index} style={{ 
                    backgroundColor: '#f8f9fa',
                    padding: exportOptions ? `${mmToPx(exportOptions.entrySpacing)}px` : '7.56px',
                    borderRadius: '4px',
                    marginBottom: exportOptions ? `${mmToPx(exportOptions.entrySpacing * 0.5)}px` : '3.78px'
                  }}>
                    <div style={{
                      fontSize: exportOptions ? `${ptToPx(exportOptions.subHeaderSize)}px` : '12.67px',
                      fontWeight: 'bold',
                      fontFamily: exportOptions ? `${exportOptions.fontFamily}, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif` : 'Calibri, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
                    }}>
                      {skill.category}
                    </div>
                    <div style={{
                      fontSize: exportOptions ? `${ptToPx(exportOptions.bodyTextSize)}px` : '12.67px',
                      fontFamily: exportOptions ? `${exportOptions.fontFamily}, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif` : 'Calibri, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
                    }}>
                      {skill.list && skill.list.join(' • ')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Standard skills display
              resumeData.skills.map((skill, index) => (
                <div key={index} style={{ marginBottom: exportOptions ? `${mmToPx(exportOptions.entrySpacing * 0.5)}px` : '3.78px' }}>
                  <span style={{
                    fontSize: exportOptions ? `${ptToPx(exportOptions.bodyTextSize)}px` : '12.67px',
                    fontFamily: exportOptions ? `${exportOptions.fontFamily}, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif` : 'Calibri, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
                  }}>
                    <strong style={{ fontWeight: 'bold' }}>• {skill.category}:</strong>{' '}
                    {skill.list && skill.list.join(', ')}
                  </span>
                </div>
              ))
            )}
          </div>
        );

      case 'certifications':
        if (!resumeData.certifications || resumeData.certifications.length === 0) return null;
        
        const isSidebarTemplate = false; // Simplified for now
        
        return (
          <div style={{ 
            marginBottom: exportOptions ? `${mmToPx(exportOptions.sectionSpacing * 0.5)}px` : '16px',
            ...(isSidebarTemplate && {
              backgroundColor: '#f8f9fa',
              padding: exportOptions ? `${mmToPx(exportOptions.entrySpacing)}px` : '7.56px',
              borderRadius: '4px'
            })
          }}>
            <h2 style={sectionTitleStyle}>
              CERTIFICATIONS
            </h2>
            {!isSidebarTemplate && layoutType !== 'minimalist' && <div style={sectionUnderlineStyle}></div>}

            // MODIFIED: listStyleType to 'none'
            <ul style={{ // Line 353
              marginLeft: isSidebarTemplate ? '0' : exportOptions ? `${mmToPx(exportOptions.entrySpacing * 2)}px` : '15.12px', 
              listStyleType: 'none' // Changed from isSidebarTemplate ? 'none' : 'disc' to always 'none'
            }}>
              {resumeData.certifications.map((cert, index) => {
                let certText = '';
                if (typeof cert === 'string') {
                  certText = cert;
                } else if (cert && typeof cert === 'object') {
                  if ('title' in cert && 'issuer' in cert) {
                    certText = `${String(cert.title)} - ${String(cert.issuer)}`;
                  } else if ('title' in cert && 'description' in cert) {
                    certText = `${String(cert.title)} - ${String(cert.description)}`;
                  } else if ('name' in cert) {
                    certText = String(cert.name);
                  } else if ('title' in cert) {
                    certText = String(cert.title);
                  } else if ('description' in cert) {
                    certText = (cert as any).description;
                  } else {
                    certText = Object.values(cert).filter(Boolean).join(' - ');
                  }
                } else {
                  certText = String(cert);
                }

                return (
                  // MODIFIED: Use listItemStyle
                  <li key={index} style={{
                    ...listItemStyle,
                    '::before': {
                      content: '"•"',
                      position: 'absolute',
                      left: '0',
                      color: 'inherit'
                    },
                    ...(isSidebarTemplate && {
                      padding: '4px 0',
                      borderBottom: '1px solid #e5e7eb'
                    })
                  }}>
                    {isSidebarTemplate && <span style={{ fontWeight: 'bold', marginRight: '4px' }}>•</span>}
                    {certText}
                  </li>
                );
              })}
            </ul>
          </div>
        );

      case 'achievementsAndExtras': // Combined section for freshers and students
        const hasAchievements = resumeData.achievements && resumeData.achievements.length > 0;
        const hasExtraCurricular = resumeData.extraCurricularActivities && resumeData.extraCurricularActivities.length > 0;
        const hasLanguages = resumeData.languagesKnown && resumeData.languagesKnown.length > 0;
        const hasPersonalDetails = resumeData.personalDetails && resumeData.personalDetails.trim() !== '';

        if (!hasAchievements && !hasExtraCurricular && !hasLanguages && !hasPersonalDetails) return null;

        return (
          <div style={{ marginBottom: exportOptions ? `${mmToPx(exportOptions.sectionSpacing * 0.5)}px` : '16px' }}>
            <h2 style={sectionTitleStyle}>
              {userType === 'student' ? 'ACHIEVEMENTS & EXTRACURRICULAR' : 'ACHIEVEMENTS & EXTRAS'}
            </h2>
            <div style={sectionUnderlineStyle}></div>

            {hasAchievements && (
              <div style={{ marginBottom: exportOptions ? `${mmToPx(exportOptions.entrySpacing)}px` : '7.56px' }}>
                <p style={{ ...bodyTextStyle, fontWeight: 'bold', marginBottom: exportOptions ? `${mmToPx(exportOptions.entrySpacing * 0.5)}px` : '3.78px' }}>Achievements:</p>
                // MODIFIED: listStyleType to 'none' // Line 412
                <ul style={{ marginLeft: exportOptions ? `${mmToPx(exportOptions.entrySpacing * 3)}px` : '22.68px', listStyleType: 'none' }}>
                  {resumeData.achievements!.map((item, index) => (
                    // MODIFIED: Use listItemStyle
                    <li key={index} style={listItemStyle}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {hasExtraCurricular && (
              <div style={{ marginBottom: exportOptions ? `${mmToPx(exportOptions.entrySpacing)}px` : '7.56px' }}>
                <p style={{ ...bodyTextStyle, fontWeight: 'bold', marginBottom: exportOptions ? `${mmToPx(exportOptions.entrySpacing * 0.5)}px` : '3.78px' }}>Extra-curricular Activities:</p> // Line 422
                // MODIFIED: listStyleType to 'none'
                <ul style={{ marginLeft: exportOptions ? `${mmToPx(exportOptions.entrySpacing * 3)}px` : '22.68px', listStyleType: 'none' }}>
                  {resumeData.extraCurricularActivities!.map((item, index) => (
                    // MODIFIED: Use listItemStyle
                    <li key={index} style={listItemStyle}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {hasLanguages && (
              <div style={{ marginBottom: exportOptions ? `${mmToPx(exportOptions.entrySpacing)}px` : '7.56px' }}>
                <p style={{ ...bodyTextStyle, fontWeight: 'bold', marginBottom: exportOptions ? `${mmToPx(exportOptions.entrySpacing * 0.5)}px` : '3.78px' }}>Languages Known:</p> // Line 432
                // MODIFIED: listStyleType to 'none'
                <ul style={{ marginLeft: exportOptions ? `${mmToPx(exportOptions.entrySpacing * 3)}px` : '22.68px', listStyleType: 'none' }}>
                  {resumeData.languagesKnown!.map((item, index) => (
                    // MODIFIED: Use listItemStyle
                    <li key={index} style={listItemStyle}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {hasPersonalDetails && (
              <div style={{ marginBottom: exportOptions ? `${mmToPx(exportOptions.entrySpacing)}px` : '7.56px' }}>
                <p style={{ ...bodyTextStyle, fontWeight: 'bold', marginBottom: exportOptions ? `${mmToPx(exportOptions.entrySpacing * 0.5)}px` : '3.78px' }}>Personal Details:</p>
                <p style={{ ...bodyTextStyle, marginLeft: exportOptions ? `${mmToPx(exportOptions.entrySpacing * 3)}px` : '22.68px' }}>{resumeData.personalDetails}</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`card dark:bg-dark-100 dark:border-dark-300 resume-one-column ${
      layoutType === 'compact' ? 'resume-compact' : 'resume-standard'
    } ${ // Use the local layoutType and paperSize variables
      paperSize === 'letter' ? 'resume-letter' : 'resume-a4'
    }`}>
      <div
        className="max-h-[70vh] sm:max-h-[80vh] lg:max-h-[800px] overflow-y-auto dark:bg-dark-100"
        style={{
          fontFamily: exportOptions ? `${exportOptions.fontFamily}, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif` : 'Calibri, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
          fontSize: exportOptions ? `${ptToPx(exportOptions.bodyTextSize)}px` : '12.67px',
          lineHeight: '1.25', /* PDF_CONFIG.spacing.lineHeight */
          color: 'inherit',
          marginTop: exportOptions?.margins?.top ? `${mmToPx(exportOptions.margins.top)}px` : '15px',
          marginBottom: exportOptions?.margins?.bottom ? `${mmToPx(exportOptions.margins.bottom)}px` : '15px',
          marginLeft: exportOptions?.margins?.left ? `${mmToPx(exportOptions.margins.left)}px` : '20px',
          marginRight: exportOptions?.margins?.right ? `${mmToPx(exportOptions.margins.right)}px` : '20px',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '18pt' }}>
          <h1 style={{
            fontSize: exportOptions ? `${ptToPx(exportOptions.nameSize)}px` : '24px',
            fontWeight: 'bold',
            letterSpacing: '1pt',
            marginBottom: exportOptions ? `${mmToPx(exportOptions.sectionSpacing * 0.4)}px` : '5.33px',
            fontFamily: exportOptions ? `${exportOptions.fontFamily}, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif` : 'Calibri, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
            textTransform: 'uppercase'
          }}>
            {resumeData.name}
          </h1>

          {contactElements.length > 0 && (
            <div style={{
              fontSize: exportOptions ? `${ptToPx(exportOptions.bodyTextSize - 0.5)}px` : '12px',
              fontWeight: 'bold',
              fontFamily: exportOptions ? `${exportOptions.fontFamily}, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif` : 'Calibri, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
              marginBottom: exportOptions ? `${mmToPx(exportOptions.sectionSpacing * 0.6)}px` : '8px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
              {contactElements}
            </div>
          )}

          <div style={{
            borderBottomWidth: '0.5pt',
            borderColor: '#404040',
            height: '1px',
            margin: '0 auto',
            width: 'calc(100% - 20mm)'
          }}></div>
        </div>

        {/* Dynamic sections */}
        {(Array.isArray(sectionOrder) ? sectionOrder : []).map((sectionName) => renderSection(sectionName))}
      </div>
    </div>
  );
};