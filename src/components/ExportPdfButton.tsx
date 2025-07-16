import React, { useState, useRef } from 'react';
import { Book } from '../types/Book';
import { FileDown, Printer, Check } from 'lucide-react';
import generatePDF from 'react-to-pdf';

interface ExportPdfButtonProps {
  book: Book;
  isDarkMode: boolean;
}

const ExportPdfButton: React.FC<ExportPdfButtonProps> = ({ book, isDarkMode }) => {
  const [exportMode, setExportMode] = useState<'short' | 'detailed'>('detailed');
  const [showOptions, setShowOptions] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const optionsRef = useRef<HTMLDivElement>(null);
  const pdfContentRef = useRef<HTMLDivElement>(null);
  
  // Handle PDF generation
  const handleExport = () => {
    setIsGenerating(true);
    
    try {
      // Generate PDF using method that preserves searchable text
      generatePDF(pdfContentRef, {
        filename: `${book.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${exportMode}_action_plan.pdf`,
        page: {
          format: 'a4',
          orientation: 'portrait',
          margin: 20,
        },
        method: 'save' // Use 'save' method which better preserves text searchability
      })
      .then(() => {
        setIsGenerating(false);
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
        }, 2000);
      })
      .catch((error: any) => {
        console.error('PDF generation failed:', error);
        setIsGenerating(false);
      });
    } catch (error) {
      console.error('PDF generation failed:', error);
      setIsGenerating(false);
    }
  };

  // Handle click outside to close options dropdown
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target as Node)) {
        setShowOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative">
      {/* Visible Export Button */}
      <button
        onClick={() => setShowOptions(!showOptions)}
        className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md transition-colors"
        title="Export to PDF"
      >
        {isGenerating ? (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Generating...</span>
          </div>
        ) : isSuccess ? (
          <div className="flex items-center gap-2">
            <Check size={16} />
            <span>PDF!</span>
          </div>
        ) : (
          <>
            <Printer size={16} />
            <span>PDF</span>
          </>
        )}
      </button>

      {/* Options Dropdown */}
      {showOptions && (
        <div 
          ref={optionsRef}
          className="absolute z-50 mt-2 right-0 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4"
        >
          <h4 className={`text-base font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Export Options
          </h4>
          
          <div className="space-y-3 mb-4">
            <label className="flex items-start space-x-2 cursor-pointer">
              <input
                type="radio"
                name="exportMode"
                checked={exportMode === 'detailed'}
                onChange={() => setExportMode('detailed')}
                className="form-radio h-4 w-4 text-blue-600 mt-1"
              />
              <div>
                <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Detailed Action Plan</span>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Full 7-day plan with supporting points, key takeaways, and chapter references
                </p>
              </div>
            </label>
            
            <label className="flex items-start space-x-2 cursor-pointer">
              <input
                type="radio"
                name="exportMode"
                checked={exportMode === 'short'}
                onChange={() => setExportMode('short')}
                className="form-radio h-4 w-4 text-blue-600 mt-1"
              />
              <div>
                <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Short Action Plan</span>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Condensed 7-day plan with essential action steps only
                </p>
              </div>
            </label>
          </div>
          
          <button
            onClick={() => {
              handleExport();
              setShowOptions(false);
            }}
            className="w-full flex items-center justify-center gap-2 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
          >
            <FileDown size={16} />
            <span>Generate {exportMode === 'detailed' ? 'Detailed' : 'Quick'} PDF</span>
          </button>
          
          <p className="text-xs mt-2 text-gray-500 dark:text-gray-400">
            Creates a professionally formatted PDF document
          </p>
        </div>
      )}

      {/* Hidden content used for PDF generation - position absolute but visible for PDF capture */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0, width: '210mm', zIndex: -100 }}>
        <div 
          ref={pdfContentRef} 
          className="p-8 bg-white text-black" 
          style={{ 
            width: '210mm', 
            minHeight: '297mm', 
            fontFamily: 'Arial, sans-serif',
            lineHeight: 1.5,
            color: '#000000', // Ensure high contrast for accessibility
            fontSize: '12pt' // Standard size for better readability
          }}
          data-pdf-title={`${book.title} - Action Plan`}
          data-pdf-subject="Book Summary and Action Plan"
          data-pdf-creator="Book2Action"
          data-pdf-author={book.author}
          data-pdf-keywords={`${book.title}, ${book.author}, book summary, action plan, ${book.genre || ''}`}
        >
          {/* PDF Header with Logo */}
          <div className="mb-12 text-center" style={{ marginTop: '40px' }}>
            <div className="mb-6">
              <h1 className="text-4xl font-bold tracking-tight mb-3" style={{ color: '#3b82f6' }}>Book2Action</h1>
              <p className="text-gray-500">Transform Books Into Actionable Insights</p>
            </div>
            
            <h1 className="text-3xl font-bold mb-3">{book.title}</h1>
            <p className="text-xl mb-2">by {book.author}</p>
            {book.publishedYear && <p className="text-gray-600 mb-1">Published: {book.publishedYear}</p>}
            {book.genre && <p className="text-gray-600">Genre: {book.genre}</p>}
          </div>
          
          {/* PDF Summary Section with stylized border */}
          <div className="mb-8 p-6" style={{ 
            border: '2px solid #e5e7eb', 
            borderRadius: '12px', 
            backgroundColor: '#f9fafb',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
          }}>
            <h2 className="text-2xl font-bold mb-4 pb-2" style={{ 
              borderBottom: '3px solid #3b82f6', 
              color: '#1e3a8a',
              paddingBottom: '8px'
            }}>Book Summary</h2>
            <div 
              className="leading-relaxed text-base"
              style={{ fontSize: '12pt', textAlign: 'justify' }} 
            >
              {/* Use real text elements for better searchability */}
              {typeof book.summary === 'string' ? (
                book.summary.split('\n').map((paragraph, idx) => (
                  <p key={idx} style={{ marginBottom: '12px' }}>
                    {/* Ensure text is rendered as actual characters */}
                    {paragraph.split('').map((char, charIdx) => (
                      <span key={charIdx}>{char}</span>
                    ))}
                  </p>
                ))
              ) : (
                <p>{String(book.summary)}</p>
              )}
            </div>
          </div>
          
          {/* Small spacer between summary and action plan - no page break */}
          <div style={{ 
            height: '20px',
            margin: '10px 0',
            display: 'block',
            width: '100%'
          }}></div>
          
          {/* PDF Action Plan Section */}
          <div className="p-6" style={{ 
            border: '2px solid #e5e7eb', 
            borderRadius: '12px', 
            backgroundColor: '#f9fafb',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
          }}>
            <h2 className="text-3xl font-bold mb-6 pb-3" style={{ 
              borderBottom: '3px solid #3b82f6', 
              color: '#1e3a8a',
              textAlign: 'center'
            }}>
              {exportMode === 'short' ? 
                '7-Day Quick Action Plan' : 
                '7-Day Complete Action Plan with Details'}
            </h2>
            
            {exportMode === 'short' ? (
              // Short plan - Use checklist format
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '8px', textAlign: 'center', width: '10%', borderBottom: '1px solid #e5e7eb' }}>#</th>
                    <th style={{ padding: '8px', textAlign: 'left', width: '25%', borderBottom: '1px solid #e5e7eb' }}>Day</th>
                    <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Action Step</th>
                    <th style={{ padding: '8px', textAlign: 'center', width: '15%', borderBottom: '1px solid #e5e7eb' }}>Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {book.actionableSteps.map((step, index) => (
                    <tr key={index}>
                      <td style={{ padding: '8px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>
                        <div style={{ 
                          backgroundColor: '#3b82f6', 
                          color: 'white', 
                          borderRadius: '50%',
                          width: '24px',
                          height: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          margin: '0 auto'
                        }}>
                          {index + 1}
                        </div>
                      </td>
                      <td style={{ padding: '8px', fontWeight: 'bold', color: '#1e3a8a', borderBottom: '1px solid #e5e7eb' }}>{step.day}</td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #e5e7eb' }}>{step.step}</td>
                      <td style={{ padding: '8px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>
                        <div style={{ 
                          width: '20px', 
                          height: '20px', 
                          border: '2px solid #3b82f6', 
                          borderRadius: '4px',
                          margin: '0 auto'
                        }}></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              // Detailed plan - Full information with page breaks
              <div className="space-y-6">
                {book.actionableSteps.map((step, index) => (
                  <div 
                    key={index} 
                    style={{ 
                      paddingTop: index > 0 ? '15px' : '0'
                      // Removed page break properties
                    }}
                  >
                    <div className="flex items-start">
                      <div style={{ 
                        backgroundColor: '#3b82f6', 
                        color: 'white', 
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        marginRight: '16px',
                        flexShrink: 0
                      }}>
                        {index + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 'bold', marginBottom: '4px', color: '#1e3a8a' }}>{step.day}</p>
                        <p style={{ marginBottom: '8px', fontSize: '12pt' }}>{step.step}</p>
                        
                        {/* Show additional information for detailed plan */}
                        {step.details && (
                          <div style={{ 
                            backgroundColor: '#f8fafc', 
                            padding: '12px', 
                            borderRadius: '6px',
                            marginTop: '8px',
                            marginBottom: '8px',
                            border: '1px solid #e2e8f0'
                          }}>
                            <h3 style={{ 
                              fontWeight: 'bold', 
                              marginBottom: '8px', 
                              color: '#1e3a8a',
                              fontSize: '0.9rem'
                            }}>
                              Key Takeaway:
                            </h3>
                            <p style={{ 
                              marginBottom: '12px',
                              fontStyle: 'italic',
                              fontSize: '11pt',
                              textAlign: 'justify'
                            }}>
                              {step.details.keyTakeaway}
                            </p>
                            
                            {step.details.sentences && step.details.sentences.length > 0 && (
                              <>
                                <h3 style={{ 
                                  fontWeight: 'bold', 
                                  marginBottom: '8px', 
                                  marginTop: '12px',
                                  color: '#1e3a8a',
                                  fontSize: '0.9rem'
                                }}>
                                  Supporting Points:
                                </h3>
                                <ul style={{ paddingLeft: '20px', listStyleType: 'disc' }}>
                                  {step.details.sentences.map((sentence, idx) => (
                                    <li key={idx} style={{ marginBottom: '4px', fontSize: '11pt', textAlign: 'justify' }}>{sentence}</li>
                                  ))}
                                </ul>
                              </>
                            )}
                          </div>
                        )}
                        
                        <p style={{ fontSize: '0.875rem', color: '#4b5563', fontStyle: 'italic' }}>From: {step.chapter}</p>
                      </div>
                    </div>
                    {/* Small separator between days */}
                    {index < book.actionableSteps.length - 1 && (
                      <div style={{ 
                        height: '10px',
                        margin: '5px 0',
                        display: 'block',
                        width: '100%',
                        borderBottom: '1px solid #e5e7eb'
                      }}></div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Action Checklist Section - Only for detailed version */}
          {exportMode === 'detailed' && (
            <div className="mt-8 p-4" style={{ border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: '#f9fafb' }}>
              <h2 className="text-2xl font-bold mb-4 pb-2" style={{ borderBottom: '2px solid #3b82f6', color: '#1e3a8a' }}>Weekly Action Checklist</h2>
              
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Day</th>
                    <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Action</th>
                    <th style={{ padding: '8px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {book.actionableSteps.map((step, index) => (
                    <tr key={index}>
                      <td style={{ padding: '8px', borderBottom: '1px solid #e5e7eb' }}>{step.day}</td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #e5e7eb' }}>{step.step}</td>
                      <td style={{ padding: '8px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>
                        <div style={{ 
                          width: '20px', 
                          height: '20px', 
                          border: '2px solid #3b82f6', 
                          borderRadius: '4px',
                          margin: '0 auto'
                        }}></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Notes Section */}
          <div className="mt-8 p-4" style={{ border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: '#f9fafb' }}>
            <h2 className="text-xl font-bold mb-2" style={{ color: '#1e3a8a' }}>Notes</h2>
            
            <div style={{ 
              minHeight: '150px',
              width: '100%',
              borderBottom: '1px solid #9ca3af',
              marginBottom: '8px' 
            }}></div>
            <div style={{ 
              minHeight: '150px',
              width: '100%',
              borderBottom: '1px solid #9ca3af'
            }}></div>
          </div>
          
          {/* PDF Footer with logo and date */}
          <div style={{ 
            marginTop: '32px', 
            paddingTop: '16px', 
            borderTop: '1px solid #e5e7eb', 
            textAlign: 'center', 
            color: '#6b7280', 
            fontSize: '0.875rem'
          }}>
            <p>Generated by Book2Action on {new Date().toLocaleDateString()}</p>
            <p style={{ color: '#3b82f6', fontWeight: 'bold' }}>Turn knowledge into action with practical lessons from books</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportPdfButton;
