import React, { useState, useRef } from 'react';
import { Book } from '../types/Book';
import { FileDown, Printer, Check } from 'lucide-react';
import { jsPDF } from 'jspdf';

// Export PDF Button Component

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

    // Handle PDF generation using pure jsPDF text methods for searchability
    const handleExport = async () => {
        setIsGenerating(true);

        try {
            // Create a new jsPDF instance with compression
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'pt',
                format: 'a4',
                compress: true,
                precision: 2
            });

            // Set PDF metadata for searchability
            pdf.setProperties({
                title: `${book.title} - ${exportMode === 'short' ? 'Quick' : 'Detailed'} Action Plan`,
                subject: `Action plan for ${book.title}`,
                author: book.author,
                keywords: `${book.title}, ${book.author}, action plan, book summary, self-improvement`,
                creator: 'Book2Action'
            });

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 40;
            const contentWidth = pageWidth - (margin * 2);
            let yPosition = margin;

            // Helper function to add text with word wrapping
            const addText = (text: string, fontSize: number, isBold: boolean = false, isCenter: boolean = false) => {
                pdf.setFontSize(fontSize);
                pdf.setFont('helvetica', isBold ? 'bold' : 'normal');

                const lines = pdf.splitTextToSize(text, contentWidth);
                const lineHeight = fontSize * 1.2;

                // Check if we need a new page
                if (yPosition + (lines.length * lineHeight) > pageHeight - margin) {
                    pdf.addPage();
                    yPosition = margin;
                }

                lines.forEach((line: string) => {
                    const x = isCenter ? (pageWidth - pdf.getTextWidth(line)) / 2 : margin;
                    pdf.text(line, x, yPosition);
                    yPosition += lineHeight;
                });

                return yPosition;
            };

            // Helper function to add spacing
            const addSpacing = (space: number) => {
                yPosition += space;
                if (yPosition > pageHeight - margin) {
                    pdf.addPage();
                    yPosition = margin;
                }
            };

            // Title Page
            pdf.setTextColor(0, 0, 0);
            yPosition = margin + 60;

            addText(book.title, 24, true, true);
            addSpacing(10);
            addText(`by ${book.author}`, 16, false, true);
            addSpacing(30);
            addText(`${exportMode === 'short' ? 'Quick' : '7-Day Complete'} Action Plan`, 18, true, true);
            addSpacing(40);

            if (exportMode === 'short') {
                // Short Plan Implementation
                addText('Quick Action Plan', 20, true);
                addSpacing(20);

                addText('Summary:', 16, true);
                addSpacing(10);
                addText(book.summary, 12);
                addSpacing(20);

                addText('Action Steps:', 16, true);
                addSpacing(15);

                book.actionableSteps.forEach((step, index) => {
                    addText(`• ${step.step}`, 12);
                    addSpacing(5);
                    if (step.details?.keyTakeaway) {
                        addText(`  ${step.details.keyTakeaway}`, 11);
                    }
                    addSpacing(12);
                });

            } else {
                // Detailed Plan Implementation
                addText('Book Summary', 20, true);
                addSpacing(15);
                addText(book.summary, 12);
                addSpacing(30);

                // Add each day as a separate section
                book.actionableSteps.forEach((step, index) => {
                    // Add page break for each day (except the first)
                    if (index > 0) {
                        pdf.addPage();
                        yPosition = margin;
                    }

                    addText(`Day ${index + 1}: ${step.step}`, 18, true);
                    addSpacing(20);

                    addText('Action:', 14, true);
                    addSpacing(10);
                    addText(step.step, 12);
                    addSpacing(15);

                    if (step.details?.keyTakeaway) {
                        addText('Key Takeaway:', 14, true);
                        addSpacing(10);
                        addText(step.details.keyTakeaway, 12);
                        addSpacing(15);
                    }

                    if (step.details?.sentences && step.details.sentences.length > 0) {
                        addText('Supporting Details:', 14, true);
                        addSpacing(10);
                        step.details.sentences.forEach(sentence => {
                            addText(`• ${sentence}`, 12);
                            addSpacing(8);
                        });
                        addSpacing(15);
                    }

                    if (step.chapter) {
                        addText('Source Chapter:', 14, true);
                        addSpacing(10);
                        addText(step.chapter, 12);
                        addSpacing(15);
                    }
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
        </div>
    );
};

export default ExportPdfButton;