// src/utils/exportUtils.ts
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import React from 'react';
import ReactDOM from 'react-dom'; // Import ReactDOM for client-side rendering
import { ResumePreview } from '../components/ResumePreview';
import { ResumeData, UserType } from '../types/resume';
import { ExportOptions, defaultExportOptions } from '../types/export';

// Helper function to convert mm to px (at 96 DPI)
const mmToPx = (mm: number) => mm * 3.779528;

export const exportToPDF = async (
  resumeData: ResumeData,
  userType: UserType,
  options: ExportOptions = defaultExportOptions
) => {
  // Create a temporary div to render the ResumePreview component into
  const tempDiv = document.createElement('div');
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px'; // Hide it off-screen
  tempDiv.style.width = '210mm'; // A4 width
  tempDiv.style.padding = '0'; // Margins will be handled by jsPDF
  tempDiv.style.backgroundColor = 'white'; // Ensure white background
  tempDiv.style.color = 'black'; // Ensure text is black
  document.body.appendChild(tempDiv);

  // Render the React component into the temporary div
  // This requires a client-side React DOM render.
  // We create a temporary root and render the component.
  const root = ReactDOM.createRoot(tempDiv);
  root.render(<ResumePreview resumeData={resumeData} userType={userType} exportOptions={options} />);

  // Wait for the component to render and apply styles
  await new Promise(resolve => setTimeout(resolve, 100)); // Small delay to ensure rendering is complete

  const canvas = await html2canvas(tempDiv, {
    scale: 2, // Higher scale for better resolution
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  });

  // Clean up the temporary div and unmount the React component
  root.unmount();
  document.body.removeChild(tempDiv);

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const margin = 15; // 15mm margin on all sides
  const contentWidth = pdfWidth - 2 * margin;
  const contentHeight = pdfHeight - 2 * margin;

  const imgProps = canvas.width / canvas.height;
  let imgHeight = contentWidth / imgProps;

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, imgHeight);
  heightLeft -= contentHeight;

  while (heightLeft >= -1) { // Allow a small overlap to prevent gaps
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', margin, position + margin, contentWidth, imgHeight);
    heightLeft -= contentHeight;
  }

  pdf.save(`${resumeData.name.replace(/\s/g, '_')}_resume.pdf`);
};

export const exportToWord = (
  resumeData: ResumeData,
  userType: UserType
) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${resumeData.name}'s Resume</title>
      <style>
        body { font-family: Calibri, sans-serif; margin: 25mm; color: #333; }
        h1 { font-size: 24pt; text-align: center; margin-bottom: 10pt; }
        h2 { font-size: 14pt; border-bottom: 1px solid #ccc; padding-bottom: 5pt; margin-top: 20pt; margin-bottom: 10pt; text-transform: uppercase; }
        h3 { font-size: 12pt; font-weight: bold; margin-bottom: 5pt; }
        p { font-size: 11pt; line-height: 1.5; margin-bottom: 10pt; }
        ul { list-style-type: disc; margin-left: 20pt; margin-bottom: 10pt; }
        li { font-size: 11pt; line-height: 1.5; margin-bottom: 5pt; }
        .contact-info { text-align: center; font-size: 10pt; margin-bottom: 20pt; }
        .job-title, .company-name, .degree, .school { font-weight: bold; }
        .dates { float: right; }
      </style>
    </head>
    <body>
      <h1>${resumeData.name}</h1>
      <div class="contact-info">
        ${resumeData.phone} | ${resumeData.email} | ${resumeData.linkedin} | ${resumeData.github}
      </div>

      ${resumeData.summary ? `<h2>Professional Summary</h2><p>${resumeData.summary}</p>` : ''}
      ${resumeData.careerObjective ? `<h2>Career Objective</h2><p>${resumeData.careerObjective}</p>` : ''}

      ${resumeData.workExperience && resumeData.workExperience.length > 0 ? `
        <h2>Work Experience</h2>
        ${resumeData.workExperience.map(job => `
          <div>
            <h3><span class="job-title">${job.role}</span>, <span class="company-name">${job.company}</span> <span class="dates">${job.year}</span></h3>
            <ul>
              ${job.bullets.map(bullet => `<li>${bullet}</li>`).join('')}
            </ul>
          </div>
        `).join('')}
      ` : ''}

      ${resumeData.education && resumeData.education.length > 0 ? `
        <h2>Education</h2>
        ${resumeData.education.map(edu => `
          <div>
            <h3><span class="degree">${edu.degree}</span>, <span class="school">${edu.school}</span> <span class="dates">${edu.year}</span></h3>
            ${edu.cgpa ? `<p>CGPA: ${edu.cgpa}</p>` : ''}
          </div>
        `).join('')}
      ` : ''}

      ${resumeData.projects && resumeData.projects.length > 0 ? `
        <h2>Projects</h2>
        ${resumeData.projects.map(project => `
          <div>
            <h3>${project.title}</h3>
            <ul>
              ${project.bullets.map(bullet => `<li>${bullet}</li>`).join('')}
            </ul>
          </div>
        `).join('')}
      ` : ''}

      ${resumeData.skills && resumeData.skills.length > 0 ? `
        <h2>Skills</h2>
        ${resumeData.skills.map(skill => `
          <p><strong>${skill.category}:</strong> ${skill.list.join(', ')}</p>
        `).join('')}
      ` : ''}

      ${resumeData.certifications && resumeData.certifications.length > 0 ? `
        <h2>Certifications</h2>
        <ul>
          ${resumeData.certifications.map(cert => `<li>${cert}</li>`).join('')}
        </ul>
      ` : ''}
    </body>
    </html>
  `;

  const blob = new Blob([htmlContent], { type: 'application/msword;charset=utf-8' });
  saveAs(blob, `${resumeData.name.replace(/\s/g, '_')}_resume.doc`);
};
