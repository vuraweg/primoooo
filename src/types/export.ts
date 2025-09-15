export type TemplateType = 'chronological' | 'functional' | 'combination' | 'minimalist' | 'two_column_safe';

export interface ExportOptions {
  template: TemplateType;
  fontFamily: string;
  nameSize: number;
  sectionHeaderSize: number;
  subHeaderSize: number;
  bodyTextSize: number;
  sectionSpacing: number; // in mm
  entrySpacing: number; // in mm (spacing between items in a list, e.g., bullets)
}

// Template configuration interface
export interface TemplateConfig {
  id: TemplateType;
  name: string;
  summary: string;
  bestFor: string[];
  layout: {
    type: 'one-column' | 'two-column';
    sidebar: boolean;
    mainRatio?: string;
    sideRatio?: string;
  };
  sections: string[] | {
    main: string[];
    sidebar: string[];
  };
  atsSafe: boolean;
  atsNotes: string[];
}

// Template configurations
export const templateConfigs: TemplateConfig[] = [
  {
    id: 'chronological',
    name: 'Chronological (Reverse-Chronological)',
    summary: 'Most popular and most ATS-friendly. Lists work experience first, starting with the most recent role.',
    bestFor: ['Steady career growth', 'Most candidates'],
    layout: { type: 'one-column', sidebar: false },
    sections: ['Header', 'Summary', 'Experience', 'Education', 'Skills', 'Projects/Extras'],
    atsSafe: true,
    atsNotes: ['Avoid tables/text boxes/images/icons', 'Use plain text bullets and headings']
  },
  {
    id: 'functional',
    name: 'Functional (Skills-Based)',
    summary: 'Focuses on skills and abilities instead of job history.',
    bestFor: ['Career changers', 'Employment gaps'],
    layout: { type: 'one-column', sidebar: false },
    sections: ['Header', 'Summary', 'Key Skills', 'Relevant Projects', 'Experience', 'Education'],
    atsSafe: true,
    atsNotes: ['Keep dates and employers in plain text', 'No graphics or multi-column tables']
  },
  {
    id: 'combination',
    name: 'Combination (Hybrid)',
    summary: 'Mix of chronological + functional; highlights skills/projects first, then detailed work history.',
    bestFor: ['Technical roles (IT/Engineering/Design)', 'Skill-heavy profiles'],
    layout: { type: 'one-column', sidebar: false },
    sections: ['Header', 'Summary', 'Key Skills', 'Projects', 'Experience', 'Education'],
    atsSafe: true,
    atsNotes: ['Consistent headings and simple bullet lists', 'No images or fancy icons']
  },
  {
    id: 'minimalist',
    name: 'Minimalist / One-Column',
    summary: 'Very clean, single-column layout prioritizing readability and ATS parsing.',
    bestFor: ['Freshers', 'Early-career candidates'],
    layout: { type: 'one-column', sidebar: false },
    sections: ['Header', 'Summary', 'Education', 'Projects', 'Skills', 'Experience'],
    atsSafe: true,
    atsNotes: ['Plain text only, strong typographic hierarchy', 'Avoid decorative elements']
  },
  {
    id: 'two_column_safe',
    name: 'Two-Column (ATS-Safe Variant)',
    summary: 'Wider column for experience/education; narrow sidebar for skills, links, certifications.',
    bestFor: ['Modern look while keeping ATS readability'],
    layout: { type: 'two-column', sidebar: true, mainRatio: '2/3', sideRatio: '1/3' },
    sections: {
      main: ['Header', 'Summary', 'Experience', 'Education'],
      sidebar: ['Skills', 'Links', 'Certifications']
    },
    atsSafe: true,
    atsNotes: ['Implement columns with CSS, not tables', 'No icons/images; use text labels for links']
  }
];
// Default export options
export const defaultExportOptions: ExportOptions = {
  template: 'chronological',
  fontFamily: 'Calibri',
  nameSize: 26,
  sectionHeaderSize: 11,
  subHeaderSize: 10.5,
  bodyTextSize: 10,
  sectionSpacing: 3, // mm
  entrySpacing: 2, // mm
};