import React, { useState, useEffect } from 'react';
import { X, Download, Settings, Type, Layout, Ruler, CheckCircle, AlertCircle } from 'lucide-react';
import { ExportOptions, defaultExportOptions, TemplateType } from '../types/export';
import { ResumePreview } from './ResumePreview';
import { ResumeData, UserType } from '../types/resume';

interface ExportOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: ExportOptions) => void;
  resumeData: ResumeData;
  userType?: UserType;
}

export const ExportOptionsModal: React.FC<ExportOptionsModalProps> = ({
  isOpen,
  onClose,
  onExport,
  resumeData,
  userType = 'experienced'
}) => {
  const [options, setOptions] = useState<ExportOptions>(defaultExportOptions);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setOptions(defaultExportOptions); // Reset to defaults when opening
      setStatusMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleOptionChange = (key: keyof ExportOptions, value: any) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const handleExportClick = () => {
    try {
      onExport(options);
      setStatusMessage('Export initiated successfully!');
      setTimeout(() => {
        setStatusMessage(null);
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error during export:', error);
      setStatusMessage('Error initiating export. Please try again.');
    }
  };

  const fontFamilies = ['Calibri', 'Times New Roman', 'Arial', 'Verdana', 'Georgia'];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2 sm:p-4 backdrop-blur-sm dark:bg-black/80" onClick={handleBackdropClick}>
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col dark:bg-dark-100">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 p-3 sm:p-6 border-b border-gray-200 dark:from-dark-200 dark:to-dark-300 dark:border-dark-400">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 sm:top-4 sm:right-4 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-white/50 min-w-[44px] min-h-[44px] dark:text-gray-500 dark:hover:text-gray-300 dark:hover:bg-dark-300/50"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          
          <div className="text-center">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
              <Settings className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2 px-4 dark:text-gray-100">
              Export Options
            </h1>
            <p className="text-sm sm:text-base text-gray-600 px-4 dark:text-gray-300">
              Customize your resume's appearance before export
            </p>
          </div>
        </div>

        {/* Content - This div will handle the main scrolling */}
        <div className="p-3 sm:p-6 overflow-y-auto flex-1 min-h-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {/* Left Side - Controls (Removed overflow-y-auto) */}
            <div className="space-y-6"> {/* Removed overflow-y-auto */}
            {/* Template Selection */}
            <div className="card p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Layout className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600 dark:text-neon-cyan-400" />
                Resume Template
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleOptionChange('template', 'standard')}
                  className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all dark:bg-dark-100 ${
                    options.template === 'standard' ? 'border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/20' : 'border-gray-200 hover:border-blue-300 dark:border-gray-700 dark:hover:border-blue-500'
                  }`}
                >
                  <div className="w-20 h-28 bg-gray-100 rounded mb-2 flex items-center justify-center text-xs text-gray-500">
                    Standard
                  </div>
                  <span className="font-medium text-sm dark:text-gray-100">Standard</span>
                  <span className="text-xs text-gray-500 text-center dark:text-gray-300">Recommended</span>
                </button>
                <button
                  onClick={() => handleOptionChange('template', 'compact')}
                  className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all dark:bg-dark-100 ${
                    options.template === 'compact' ? 'border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/20' : 'border-gray-200 hover:border-blue-300 dark:border-gray-700 dark:hover:border-blue-500'
                  }`}
                >
                  <div className="w-20 h-28 bg-gray-100 rounded mb-2 flex items-center justify-center text-xs text-gray-500">
                    Compact
                  </div>
                  <span className="font-medium text-sm dark:text-gray-100">Compact</span>
                  <span className="text-xs text-gray-500 text-center dark:text-gray-300">More content</span>
                </button>
              </div>
            </div>

            {/* Font Settings */}
            <div className="card p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Type className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-600 dark:text-neon-purple-400" />
                Font Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Font Family</label>
                  <select
                    value={options.fontFamily}
                    onChange={(e) => handleOptionChange('fontFamily', e.target.value)}
                    className="input-base"
                  >
                    {fontFamilies.map(font => (
                      <option key={font} value={font}>{font}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Name Size (pt)</label>
                    <input
                      type="number"
                      value={options.nameSize}
                      onChange={(e) => handleOptionChange('nameSize', parseFloat(e.target.value))}
                      className="input-base"
                      min="16" max="30" step="0.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Section Header Size (pt)</label>
                    <input
                      type="number"
                      value={options.sectionHeaderSize}
                      onChange={(e) => handleOptionChange('sectionHeaderSize', parseFloat(e.target.value))}
                      className="input-base"
                      min="8" max="14" step="0.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Sub-Header Size (pt)</label>
                    <input
                      type="number"
                      value={options.subHeaderSize}
                      onChange={(e) => handleOptionChange('subHeaderSize', parseFloat(e.target.value))}
                      className="input-base"
                      min="8" max="12" step="0.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Body Text Size (pt)</label>
                    <input
                      type="number"
                      value={options.bodyTextSize}
                      onChange={(e) => handleOptionChange('bodyTextSize', parseFloat(e.target.value))}
                      className="input-base"
                      min="8" max="12" step="0.5"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Spacing & Margin Settings */}
            <div className="card p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Ruler className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-600 dark:text-neon-green-400" />
                Spacing & Margins
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Section Spacing (mm)</label>
                  <input
                    type="range"
                    value={options.sectionSpacing}
                    onChange={(e) => handleOptionChange('sectionSpacing', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    min="0" max="10" step="0.5"
                  />
                  <div className="text-right text-sm text-gray-600">{options.sectionSpacing} mm</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Entry Spacing (mm)</label>
                  <input
                    type="range"
                    value={options.entrySpacing}
                    onChange={(e) => handleOptionChange('entrySpacing', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    min="0" max="5" step="0.25"
                  />
                  <div className="text-right text-sm text-gray-600">{options.entrySpacing} mm</div>
                </div>
              </div>
            </div>
          </div>

            {/* Right Side - Live Preview */}
            <div className="hidden lg:block">
              <div className="bg-gray-50 rounded-xl p-4 h-full flex flex-col dark:bg-dark-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center dark:text-gray-100">
                  <Layout className="w-5 h-5 mr-2 text-green-600 dark:text-neon-green-400" />
                  Live Preview
                </h3>
                {/* Removed overflow-y-auto from this div */}
                <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-dark-100 dark:border-dark-300"> {/* Removed overflow-y-auto */}
                  <div className="h-full overflow-y-auto"> {/* This inner div retains its overflow for the actual ResumePreview content */}
                    <ResumePreview
                      resumeData={resumeData}
                      userType={userType}
                      exportOptions={options}
                    />
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-500 text-center dark:text-gray-400">
                  Preview updates as you change settings
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-3 sm:p-6 border-t border-gray-200 flex justify-end items-center pb-safe-bottom dark:bg-dark-200 dark:border-dark-300">
          {statusMessage && (
            <div className={`flex items-center mr-4 text-sm font-medium ${
              statusMessage.includes('Error') ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
            }`}>
              {statusMessage.includes('Error') ? <AlertCircle className="w-4 h-4 mr-2 dark:text-red-400" /> : <CheckCircle className="w-4 h-4 mr-2 dark:text-green-400" />}
              {statusMessage}
            </div>
          )}
          <button
            onClick={handleExportClick}
            className="btn-primary flex items-center space-x-2 px-6 py-3"
          >
            <Download className="w-5 h-5" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
