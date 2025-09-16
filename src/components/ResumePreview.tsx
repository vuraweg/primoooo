// src/components/ResumePreview.tsx
import React from 'react';
import { ResumeData, UserType } from '../types/resume';
import { ExportOptions, templateConfigs } from '../types/export';

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
    letterSpacing: '0.5pt',
    textTransform: exportOptions?.template === 'minimalist' ? 'none' : 'uppercase',
    ...(exportOptions?.template === 'minimalist' && {
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
    const parts: React.ReactNode[] = [];

    if (resumeData.email) {
      parts.push(
        <span key="email" style={{ fontSize: exportOptions ? `${ptToPx(exportOptions.bodyTextSize - 0.5)}px` : '12px' }}>
          {resumeData.email}
        </span>
      );
    }

    if (resumeData.phone) {
      parts.push(
        <span key="phone" style={{ fontSize: exportOptions ? `${ptToPx(exportOptions.bodyTextSize - 0.5)}px` : '12px' }}>
          {resumeData.phone}
        </span>
      );
    }

    if (resumeData.location) {
      parts.push(
        <span key="location" style={{ fontSize: exportOptions ? `${ptToPx(exportOptions.bodyTextSize - 0.5)}px` : '12px' }}>
          {resumeData.location}
        </span>
      );
    }

    if (resumeData.linkedin) {
      parts.push(
        <span key="linkedin" style={{ fontSize: exportOptions ? `${ptToPx(exportOptions.bodyTextSize - 0.5)}px` : '12px' }}>
          {resumeData.linkedin}
        </span>
      );
    }

    if (resumeData.github) {
      parts.push(
        <span key="github" style={{ fontSize: exportOptions ? `${ptToPx(exportOptions.bodyTextSize - 0.5)}px` : '12px' }}>
          {resumeData.github}
        </span>
      );
    }

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
    const template = exportOptions?.template || 'chronological';
    const templateConfig = templateConfigs.find(t => t.id === template);
    
    if (templateConfig) {
      if (template === 'two_column_safe') {
        // For two-column layout, we'll handle this differently
        return {
          main: ['summary', 'workExperience', 'education'],
          sidebar: ['skills', 'certifications', 'achievementsAndExtras']
        };
      } else {
        // Map template sections to our internal section names
        const sectionMapping: { [key: string]: string } = {
          'Header': 'header',
          'Summary': 'summary',
          'Experience': 'workExperience',
          'Education': 'education',
          'Skills': 'skills',
          'Key Skills': 'skills',
          'Projects': 'projects',
          'Projects/Extras': 'projects',
          'Relevant Projects': 'projects',
          'Certifications': 'certifications'
        };
        
        return (templateConfig.sections as string[]).map(section => 
          sectionMapping[section] || section.toLowerCase()
        ).filter(section => section !== 'header'); // Header is handled separately
      }
    }
    
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
        // Conditional logic for 'Professional Summary' or 'Career Objective'
        const summaryTemplate = exportOptions?.template || 'chronological';
        
        if (userType === 'student') {
          if (!resumeData.careerObjective || resumeData.careerObjective.trim() === '') return null;
          return (
            <div style={{ marginBottom: exportOptions ? `${mmToPx(exportOptions.sectionSpacing * 0.5)}px` : '16px' }}>
              <h2 style={sectionTitleStyle}>
                CAREER OBJECTIVE
              </h2>
              {summaryTemplate !== 'minimalist' && <div style={sectionUnderlineStyle}></div>}
              <p style={{ ...bodyTextStyle, marginBottom: exportOptions ? `${mmToPx(exportOptions.entrySpacing)}px` : '7.56px' }}>
                {resumeData.careerObjective}
              </p>
            </div>
          );
        } else { // 'experienced' or 'fresher'
          if (!resumeData.summary || resumeData.summary.trim() === '') return null;
          return (
            <div style={{ 
              marginBottom: exportOptions ? `${mmToPx(exportOptions.sectionSpacing * 0.5)}px` : '16px',
              ...(summaryTemplate === 'functional' && {
                backgroundColor: '#f8f9fa',
                padding: exportOptions ? `${mmToPx(exportOptions.entrySpacing)}px` : '7.56px',
                borderRadius: '4px'
              })
            }}>
              <h2 style={sectionTitleStyle}>
                {summaryTemplate === 'functional' ? 'PROFESSIONAL PROFILE' : 'PROFESSIONAL SUMMARY'}
              </h2>
              {summaryTemplate !== 'minimalist' && <div style={sectionUnderlineStyle}></div>}
              <p style={{ ...bodyTextStyle, marginBottom: exportOptions ? `${mmToPx(exportOptions.entrySpacing)}px` : '7.56px' }}>
                {resumeData.summary}
              </p>
            </div>
          );
        }

      case 'workExperience':
        if (!resumeData.workExperience || resumeData.workExperience.length === 0) return null;
        
        const template = exportOptions?.template || 'chronological';
        const isExperienceFocused = template === 'chronological';
        
        return (
          <div style={{ marginBottom: exportOptions ? `${mmToPx(exportOptions.sectionSpacing * 0.5)}px` : '16px' }}>
            <h2 style={sectionTitleStyle}>
              {template === 'functional' ? 'WORK HISTORY' : 
                userType === 'fresher' || userType === 'student' ? 'INTERNSHIPS & TRAINING' : 'PROFESSIONAL EXPERIENCE'}
            </h2>
            <div style={sectionUnderlineStyle}></div>

            {resumeData.workExperience.map((job, index) => (
              <div key={index} style={{ 
                marginBottom: exportOptions ? `${mmToPx(exportOptions.entrySpacing * 2)}px` : '15.12px',
                ...(isExperienceFocused && { 
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
                {job.bullets && job.bullets.length > 0 && template !== 'functional' && (
                  // MODIFIED: listStyleType to 'none'
                  <ul style={{ marginLeft: exportOptions ? `${mmToPx(exportOptions.entrySpacing * 2)}px` : '15.12px', listStyleType: 'none' }}>
                    {job.bullets.map((bullet, bulletIndex) => (
                      // MODIFIED: Use listItemStyle
                      <li key={bulletIndex} style={listItemStyle}>
                        {typeof bullet === 'string' ? bullet : (bullet as any).description || JSON.stringify(bullet)}
                      </li>
                    ))}
                  </ul>
                )}
                {template === 'functional' && job.bullets && job.bullets.length > 0 && (
                  <div style={{ 
                    fontSize: exportOptions ? `${ptToPx(exportOptions.bodyTextSize)}px` : '12.67px',
                    fontFamily: exportOptions ? `${exportOptions.fontFamily}, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif` : 'Calibri, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
                    marginLeft: exportOptions ? `${mmToPx(exportOptions.entrySpacing)}px` : '7.56px'
                  }}>
                    {job.bullets[0]}
                  </div>
                )}
              </div>
            ))}
          </div>
        );

      case 'education':
        if (!resumeData.education || resumeData.education.length === 0) return null;
        
        const isEducationPriority = exportOptions?.template === 'minimalist' || userType === 'student';
        
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
        
        const isProjectsFocused = exportOptions?.template === 'combination' || exportOptions?.template === 'functional';
        
        return (
          <div style={{ marginBottom: exportOptions ? `${mmToPx(exportOptions.sectionSpacing * 0.5)}px` : '16px' }}>
            <h2 style={sectionTitleStyle}>
              {isProjectsFocused ? 'RELEVANT PROJECTS' : 
                userType === 'fresher' || userType === 'student' ? 'ACADEMIC PROJECTS' : 'PROJECTS'}
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
                  <ul style={{ marginLeft: exportOptions ? `${mmToPx(exportOptions.entrySpacing * 2)}px` : '15.12px', listStyleType: 'none' }}>
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
        const isSkillsFocused = exportOptions?.template === 'functional' || exportOptions?.template === 'combination';
        
        return (
          <div style={{ marginBottom: exportOptions ? `${mmToPx(exportOptions.sectionSpacing * 0.5)}px` : '16px' }}>
            <h2 style={sectionTitleStyle}>
              {isSkillsFocused ? 'KEY SKILLS' : 'TECHNICAL SKILLS'}
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
                      fontFamily: exportOptions ? `${exportOptions.fontFamily}, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif` : 'Calibri, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
                      marginBottom: exportOptions ? `${mmToPx(exportOptions.entrySpacing * 0.25)}px` : '1.89px'
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
        
        const isSidebarTemplate = exportOptions?.template === 'two_column_safe';
        
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
            {!isSidebarTemplate && exportOptions?.template !== 'minimalist' && <div style={sectionUnderlineStyle}></div>}

            {/* MODIFIED: listStyleType to 'none' */}
            <ul style={{ 
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
                    ...listItemStyle, // Apply common list item style
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

      case 'achievementsAndExtras': // MODIFIED: This section is now simplified
        const hasAchievements = resumeData.achievements && resumeData.achievements.length > 0;

        if (!hasAchievements) return null;

        return (
          <div style={{ marginBottom: exportOptions ? `${mmToPx(exportOptions.sectionSpacing * 0.5)}px` : '16px' }}>
            <h2 style={sectionTitleStyle}>
              ACHIEVEMENTS
            </h2>
            <div style={sectionUnderlineStyle}></div>

            {hasAchievements && (
              <div style={{ marginBottom: exportOptions ? `${mmToPx(exportOptions.entrySpacing)}px` : '7.56px' }}>
                <p style={{ ...bodyTextStyle, fontWeight: 'bold', marginBottom: exportOptions ? `${mmToPx(exportOptions.entrySpacing * 0.5)}px` : '3.78px' }}>Achievements:</p>
                <ul style={{ marginLeft: exportOptions ? `${mmToPx(exportOptions.entrySpacing * 3)}px` : '22.68px', listStyleType: 'none' }}>
                  {resumeData.achievements!.map((item, index) => (
                    <li key={index} style={listItemStyle}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`card dark:bg-dark-100 dark:border-dark-300 ${
      exportOptions?.template === 'two_column_safe' ? 'resume-two-column' : 'resume-one-column'
    }`}>
      <div
        className={`pt-4 px-4 pb-6 sm:pt-6 sm:px-6 sm:pb-8 lg:px-8 max-h-[70vh] sm:max-h-[80vh] lg:max-h-[800px] overflow-y-auto dark:bg-dark-100 ${
          exportOptions?.template === 'minimalist' ? 'resume-minimalist' : ''
        }`}
        style={{
          fontFamily: exportOptions ? `${exportOptions.fontFamily}, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif` : 'Calibri, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
          fontSize: exportOptions ? `${ptToPx(exportOptions.bodyTextSize)}px` : '12.67px',
          lineHeight: '1.25', /* PDF_CONFIG.spacing.lineHeight */
          color: 'inherit',
          padding: exportOptions?.template === 'minimalist' ? '20px' : '15px' /* Adjust padding based on template */
        }}
      >
        {exportOptions?.template === 'two_column_safe' ? (
          /* Two-Column Layout */
          <div className="resume-two-column-container">
            {/* Header spans full width */}
            <div className="resume-header-full" style={{ textAlign: 'center', marginBottom: '18pt' }}>
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

            {/* Two-column content */}
            <div className="resume-two-column-content">
              {/* Main column */}
              <div className="resume-main-column">
                {(sectionOrder as any).main?.map((sectionName: string) => renderSection(sectionName))}
              </div>
              
              {/* Sidebar column */}
              <div className="resume-sidebar-column">
                {(sectionOrder as any).sidebar?.map((sectionName: string) => renderSection(sectionName))}
              </div>
            </div>
          </div>
        ) : (
          /* One-Column Layout */
          <>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '18pt' }}>
              <h1 style={{
                fontSize: exportOptions ? `${ptToPx(exportOptions.nameSize)}px` : '24px',
                fontWeight: 'bold',
                letterSpacing: exportOptions?.template === 'minimalist' ? '2pt' : '1pt',
                marginBottom: exportOptions ? `${mmToPx(exportOptions.sectionSpacing * 0.4)}px` : '5.33px',
                fontFamily: exportOptions ? `${exportOptions.fontFamily}, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif` : 'Calibri, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
                textTransform: exportOptions?.template === 'minimalist' ? 'none' : 'uppercase'
              }}>
                {resumeData.name}
              </h1>

              {contactElements.length > 0 && (
                <div style={{
                  fontSize: exportOptions ? `${ptToPx(exportOptions.bodyTextSize - 0.5)}px` : '12px',
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

              {exportOptions?.template !== 'minimalist' && (
                <div style={{
                  borderBottomWidth: '0.5pt',
                  borderColor: '#404040',
                  height: '1px',
                  margin: '0 auto',
                  width: 'calc(100% - 20mm)'
                }}></div>
              )}
            </div>

            {/* Dynamic sections based on template */}
            {(Array.isArray(sectionOrder) ? sectionOrder : []).map((sectionName) => renderSection(sectionName))}
          </>
        )}
      </div>
    </div>
  );
};