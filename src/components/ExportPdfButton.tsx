import React, { useState, useRef } from 'react';
import { Book } from '../types/Book';
import { FileDown, Printer, Check } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

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

    // Handle PDF generation using jsPDF + html2canvas
    const handleExport = async () => {
        setIsGenerating(true);

        try {
            if (!pdfContentRef.current) {
                throw new Error('PDF content not available');
            }

            // Create a new jsPDF instance
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'pt',
                format: 'a4'
            });

            // Set PDF metadata for searchability
            pdf.setProperties({
                title: `${book.title} - ${exportMode === 'short' ? 'Quick' : 'Detailed'} Action Plan`,
                subject: `Action plan for ${book.title}`,
                author: book.author,
                keywords: `${book.title}, ${book.author}, action plan, book summary, self-improvement`,
                creator: 'Book2Action'
            });

            const pdfContent = pdfContentRef.current;

            // Get sections that should be on separate pages (for detailed mode)
            const sections = exportMode === 'detailed'
                ? pdfContent.querySelectorAll('.pdf-page-section')
                : [pdfContent.querySelector('.pdf-content')];

            const pageWidth = pdf.internal.pageSize.getWidth();
            const margin = 40;

            // Process each section
            for (let i = 0; i < sections.length; i++) {
                if (!sections[i]) continue;

                // Add new page for each section after the first
                if (i > 0) {
                    pdf.addPage();
                }

                const section = sections[i] as HTMLElement;

                // Capture section as high-quality image
                const canvas = await html2canvas(section, {
                    scale: 2, // Higher quality
                    useCORS: true,
                    logging: false,
                    allowTaint: true,
                    backgroundColor: '#ffffff'
                });

                const imgData = canvas.toDataURL('image/png');
                const imgWidth = pageWidth - (margin * 2);
                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                // Add the visual content
                pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);

                // Add invisible searchable text layer
                pdf.setTextColor(255, 255, 255, 0); // Transparent text
                pdf.setFontSize(1);

                // Get text content from this section
                const sectionText = section.innerText || section.textContent || '';
                const textLines = pdf.splitTextToSize(sectionText, imgWidth);

                // Place invisible text at the top of the page for search indexing
                pdf.text(textLines, margin, margin + 10, {
                    renderingMode: 'invisible',
                    maxWidth: imgWidth
                });
            }

            // Generate filename
            const sanitizedTitle = book.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
            const filename = `${sanitizedTitle}_${exportMode}_action_plan.pdf`;

            // Save the PDF
            pdf.save(filename);

            setIsGenerating(false);
            setIsSuccess(true);
            setTimeout(() => {
                setIsSuccess(false);
            }, 2000);

        } catch (error) {
            console.error('PDF generation failed:', error);
            setIsGenerating(false);
            alert('Failed to generate PDF. Please try again.');
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

            {/* Hidden content used for PDF generation */}
            <div ref={pdfContentRef} style={{ position: 'absolute', left: '-9999px', top: 0, width: '800px', zIndex: -100 }}>
                {exportMode === 'detailed' ? (
                    // Detailed mode: Each section on separate pages
                    <>
                        {/* Page 1: Header and Summary */}
                        <div className="pdf-page-section" style={{
                            width: '800px',
                            padding: '40px',
                            backgroundColor: '#ffffff',
                            color: '#000000',
                            fontFamily: 'Arial, sans-serif',
                            minHeight: '1000px'
                        }}>
                            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                                <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#3b82f6', marginBottom: '10px' }}>
                                    Book2Action
                                </h1>
                                <p style={{ fontSize: '16px', color: '#666666', marginBottom: '30px' }}>
                                    Transform Books Into Actionable Insights
                                </p>
                                <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '10px' }}>
                                    {book.title}
                                </h1>
                                <p style={{ fontSize: '18px', marginBottom: '5px' }}>by {book.author}</p>
                                {book.publishedYear && <p style={{ fontSize: '14px', color: '#666666', marginBottom: '5px' }}>Published: {book.publishedYear}</p>}
                                <h2 style={{ fontSize: '20px', color: '#1e3a8a', marginTop: '20px' }}>
                                    7-Day Complete Action Plan with Details
                                </h2>
                            </div>

                            <div style={{
                                border: '2px solid #e5e7eb',
                                borderRadius: '12px',
                                padding: '30px',
                                backgroundColor: '#f9fafb'
                            }}>
                                <h2 style={{
                                    fontSize: '24px',
                                    fontWeight: 'bold',
                                    marginBottom: '20px',
                                    borderBottom: '3px solid #3b82f6',
                                    paddingBottom: '10px',
                                    color: '#1e3a8a'
                                }}>
                                    Book Summary
                                </h2>
                                <p style={{
                                    fontSize: '16px',
                                    lineHeight: '1.6',
                                    textAlign: 'justify',
                                    color: '#333333'
                                }}>
                                    {book.summary}
                                </p>
                            </div>
                        </div>

                        {/* Individual pages for each day */}
                        {book.actionableSteps.map((step, index) => (
                            <div key={index} className="pdf-page-section" style={{
                                width: '800px',
                                padding: '40px',
                                backgroundColor: '#ffffff',
                                color: '#000000',
                                fontFamily: 'Arial, sans-serif',
                                minHeight: '1000px'
                            }}>
                                <div style={{
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '12px',
                                    padding: '30px',
                                    backgroundColor: '#f9fafb'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                                        <div style={{
                                            backgroundColor: '#3b82f6',
                                            color: 'white',
                                            borderRadius: '50%',
                                            width: '50px',
                                            height: '50px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 'bold',
                                            fontSize: '24px',
                                            marginRight: '20px'
                                        }}>
                                            {index + 1}
                                        </div>
                                        <div>
                                            <h2 style={{
                                                fontSize: '28px',
                                                fontWeight: 'bold',
                                                margin: '0',
                                                color: '#1e3a8a'
                                            }}>
                                                {step.day}
                                            </h2>
                                        </div>
                                    </div>

                                    <h3 style={{
                                        fontSize: '20px',
                                        fontWeight: 'bold',
                                        marginBottom: '15px',
                                        color: '#1e3a8a'
                                    }}>
                                        Action Step:
                                    </h3>
                                    <p style={{
                                        fontSize: '18px',
                                        lineHeight: '1.6',
                                        marginBottom: '25px',
                                        padding: '20px',
                                        backgroundColor: '#ffffff',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px'
                                    }}>
                                        {step.step}
                                    </p>

                                    {step.details && (
                                        <>
                                            <h3 style={{
                                                fontSize: '18px',
                                                fontWeight: 'bold',
                                                marginBottom: '15px',
                                                color: '#1e3a8a'
                                            }}>
                                                Key Takeaway:
                                            </h3>
                                            <p style={{
                                                fontSize: '16px',
                                                fontStyle: 'italic',
                                                lineHeight: '1.6',
                                                marginBottom: '25px',
                                                padding: '20px',
                                                backgroundColor: '#f8fafc',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '8px'
                                            }}>
                                                {step.details.keyTakeaway}
                                            </p>

                                            {step.details.sentences && step.details.sentences.length > 0 && (
                                                <>
                                                    <h3 style={{
                                                        fontSize: '18px',
                                                        fontWeight: 'bold',
                                                        marginBottom: '15px',
                                                        color: '#1e3a8a'
                                                    }}>
                                                        Supporting Points:
                                                    </h3>
                                                    <ul style={{
                                                        fontSize: '16px',
                                                        lineHeight: '1.6',
                                                        paddingLeft: '20px',
                                                        marginBottom: '20px'
                                                    }}>
                                                        {step.details.sentences.map((sentence, idx) => (
                                                            <li key={idx} style={{
                                                                marginBottom: '10px',
                                                                padding: '10px',
                                                                backgroundColor: '#ffffff',
                                                                border: '1px solid #e2e8f0',
                                                                borderRadius: '6px',
                                                                listStyleType: 'disc'
                                                            }}>
                                                                {sentence}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </>
                                            )}

                                            <p style={{
                                                fontSize: '14px',
                                                fontStyle: 'italic',
                                                color: '#666666',
                                                textAlign: 'right',
                                                marginTop: '20px'
                                            }}>
                                                Referenced from: {step.chapter}
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Final page: Weekly checklist */}
                        <div className="pdf-page-section" style={{
                            width: '800px',
                            padding: '40px',
                            backgroundColor: '#ffffff',
                            color: '#000000',
                            fontFamily: 'Arial, sans-serif',
                            minHeight: '1000px'
                        }}>
                            <h2 style={{
                                fontSize: '28px',
                                fontWeight: 'bold',
                                textAlign: 'center',
                                marginBottom: '30px',
                                color: '#1e3a8a',
                                borderBottom: '3px solid #3b82f6',
                                paddingBottom: '15px'
                            }}>
                                Weekly Action Checklist
                            </h2>

                            <div style={{
                                border: '2px solid #e5e7eb',
                                borderRadius: '12px',
                                padding: '30px',
                                backgroundColor: '#f9fafb'
                            }}>
                                {book.actionableSteps.map((step, index) => (
                                    <div key={index} style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        marginBottom: '20px',
                                        padding: '15px',
                                        backgroundColor: '#ffffff',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px'
                                    }}>
                                        <div style={{
                                            minWidth: '30px',
                                            height: '30px',
                                            border: '2px solid #3b82f6',
                                            borderRadius: '6px',
                                            marginRight: '15px',
                                            marginTop: '2px'
                                        }}></div>
                                        <div>
                                            <h3 style={{
                                                fontSize: '18px',
                                                fontWeight: 'bold',
                                                marginBottom: '5px',
                                                color: '#1e3a8a'
                                            }}>
                                                {step.day}
                                            </h3>
                                            <p style={{
                                                fontSize: '16px',
                                                lineHeight: '1.5',
                                                color: '#333333'
                                            }}>
                                                {step.step}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    // Short mode: All content on fewer pages
                    <div className="pdf-content" style={{
                        width: '800px',
                        padding: '40px',
                        backgroundColor: '#ffffff',
                        color: '#000000',
                        fontFamily: 'Arial, sans-serif'
                    }}>
                        {/* Header */}
                        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                            <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#3b82f6', marginBottom: '10px' }}>
                                Book2Action
                            </h1>
                            <p style={{ fontSize: '16px', color: '#666666', marginBottom: '30px' }}>
                                Transform Books Into Actionable Insights
                            </p>
                            <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '10px' }}>
                                {book.title}
                            </h1>
                            <p style={{ fontSize: '18px', marginBottom: '5px' }}>by {book.author}</p>
                            <h2 style={{ fontSize: '20px', color: '#1e3a8a', marginTop: '20px' }}>
                                7-Day Quick Action Plan
                            </h2>
                        </div>

                        {/* Summary */}
                        <div style={{
                            border: '2px solid #e5e7eb',
                            borderRadius: '12px',
                            padding: '25px',
                            backgroundColor: '#f9fafb',
                            marginBottom: '30px'
                        }}>
                            <h2 style={{
                                fontSize: '22px',
                                fontWeight: 'bold',
                                marginBottom: '15px',
                                borderBottom: '2px solid #3b82f6',
                                paddingBottom: '8px',
                                color: '#1e3a8a'
                            }}>
                                Book Summary
                            </h2>
                            <p style={{
                                fontSize: '16px',
                                lineHeight: '1.6',
                                textAlign: 'justify',
                                color: '#333333'
                            }}>
                                {book.summary}
                            </p>
                        </div>

                        {/* Checklist Table */}
                        <div style={{
                            border: '2px solid #e5e7eb',
                            borderRadius: '12px',
                            padding: '25px',
                            backgroundColor: '#f9fafb'
                        }}>
                            <h2 style={{
                                fontSize: '22px',
                                fontWeight: 'bold',
                                marginBottom: '20px',
                                borderBottom: '2px solid #3b82f6',
                                paddingBottom: '8px',
                                color: '#1e3a8a'
                            }}>
                                Weekly Action Checklist
                            </h2>

                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#e2e8f0' }}>
                                        <th style={{
                                            padding: '12px',
                                            textAlign: 'left',
                                            width: '30%',
                                            borderBottom: '2px solid #3b82f6',
                                            fontSize: '16px',
                                            fontWeight: 'bold'
                                        }}>
                                            Day
                                        </th>
                                        <th style={{
                                            padding: '12px',
                                            textAlign: 'left',
                                            borderBottom: '2px solid #3b82f6',
                                            fontSize: '16px',
                                            fontWeight: 'bold'
                                        }}>
                                            Action Step
                                        </th>
                                        <th style={{
                                            padding: '12px',
                                            textAlign: 'center',
                                            width: '15%',
                                            borderBottom: '2px solid #3b82f6',
                                            fontSize: '16px',
                                            fontWeight: 'bold'
                                        }}>
                                            Done
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {book.actionableSteps.map((step, index) => (
                                        <tr key={index} style={{
                                            backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc'
                                        }}>
                                            <td style={{
                                                padding: '12px',
                                                fontWeight: 'bold',
                                                color: '#1e3a8a',
                                                borderBottom: '1px solid #e5e7eb',
                                                fontSize: '16px'
                                            }}>
                                                {step.day}
                                            </td>
                                            <td style={{
                                                padding: '12px',
                                                borderBottom: '1px solid #e5e7eb',
                                                fontSize: '15px',
                                                lineHeight: '1.4'
                                            }}>
                                                {step.step}
                                            </td>
                                            <td style={{
                                                padding: '12px',
                                                textAlign: 'center',
                                                borderBottom: '1px solid #e5e7eb'
                                            }}>
                                                <div style={{
                                                    width: '25px',
                                                    height: '25px',
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

                        {/* Footer */}
                        <div style={{
                            marginTop: '40px',
                            paddingTop: '20px',
                            borderTop: '1px solid #e5e7eb',
                            textAlign: 'center',
                            color: '#666666',
                            fontSize: '14px'
                        }}>
                            <p>Generated by Book2Action on {new Date().toLocaleDateString()}</p>
                            <p style={{ color: '#3b82f6', fontWeight: 'bold', marginTop: '5px' }}>
                                Turn knowledge into action with practical lessons from books
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExportPdfButton;
