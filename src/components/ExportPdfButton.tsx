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

            // Color theme definitions - matching home page theme
            const colors = {
                primary: [49, 130, 206],       // #3182ce - Steel Blue (main blue from home page)
                secondary: [66, 153, 225],     // #4299e1 - Lighter Blue (gradient end from home page)
                accent: [59, 130, 246],        // #3b82f6 - Blue-500 (accent color)
                text: [30, 41, 59],            // #1e293b - Slate-800 (dark text)
                lightText: [100, 116, 139],    // #64748b - Slate-500 (medium gray)
                success: [34, 197, 94],        // #22c55e - Green-500 (for success states)
                background: [248, 250, 252],   // #f8fafc - Slate-50 (light background)
                darkBlue: [30, 58, 138],       // #1e3a8a - Blue-900 (dark blue for headers)
                lightBg: [239, 246, 255]       // #eff6ff - Blue-50 (light blue background)
            };

            // Helper function to add colored background
            const addColoredBackground = (x: number, y: number, width: number, height: number, color: number[]) => {
                pdf.setFillColor(color[0], color[1], color[2]);
                pdf.rect(x, y - height + 5, width, height, 'F');
            };

            // Helper function to add text with word wrapping and color options
            const addText = (
                text: string,
                fontSize: number,
                isBold: boolean = false,
                isCenter: boolean = false,
                color: number[] = colors.text,
                hasBackground: boolean = false,
                backgroundColorOverride?: number[]
            ) => {
                pdf.setFontSize(fontSize);
                pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
                pdf.setTextColor(color[0], color[1], color[2]);

                const lines = pdf.splitTextToSize(text, contentWidth);
                const lineHeight = fontSize * 1.2;

                // Check if we need a new page
                if (yPosition + (lines.length * lineHeight) > pageHeight - margin) {
                    pdf.addPage();
                    yPosition = margin;
                }

                lines.forEach((line: string) => {
                    const x = isCenter ? (pageWidth - pdf.getTextWidth(line)) / 2 : margin;

                    // Add background if requested
                    if (hasBackground) {
                        const bgColor = backgroundColorOverride || colors.background;
                        const textWidth = pdf.getTextWidth(line);
                        const bgWidth = isCenter ? textWidth + 20 : contentWidth;
                        const bgX = isCenter ? x - 10 : margin - 10;
                        addColoredBackground(bgX, yPosition, bgWidth, lineHeight, bgColor);
                    }

                    pdf.text(line, x, yPosition);
                    yPosition += lineHeight;
                });

                return yPosition;
            };

            // Helper function to add book cover image
            const addBookCoverImage = async () => {
                if (!book.coverImageUrl) return;

                try {
                    // Create a temporary image element to load the book cover
                    const img = new Image();
                    img.crossOrigin = 'anonymous';

                    return new Promise<void>((resolve) => {
                        img.onload = () => {
                            try {
                                // Create a canvas to draw the image
                                const canvas = document.createElement('canvas');
                                const ctx = canvas.getContext('2d');

                                if (ctx) {
                                    // Set canvas size (small book cover size)
                                    const maxWidth = 60;
                                    const maxHeight = 80;
                                    const aspectRatio = img.width / img.height;

                                    let width, height;
                                    if (aspectRatio > maxWidth / maxHeight) {
                                        width = maxWidth;
                                        height = maxWidth / aspectRatio;
                                    } else {
                                        height = maxHeight;
                                        width = maxHeight * aspectRatio;
                                    }

                                    canvas.width = width;
                                    canvas.height = height;

                                    // Draw the image onto canvas
                                    ctx.drawImage(img, 0, 0, width, height);

                                    // Convert to data URL
                                    const dataURL = canvas.toDataURL('image/jpeg', 0.8);

                                    // Add image to PDF (positioned to the right of the title)
                                    const imageX = pageWidth - margin - width - 10;
                                    const imageY = yPosition - 40;

                                    pdf.addImage(dataURL, 'JPEG', imageX, imageY, width, height);
                                }
                            } catch (error) {
                                console.log('Error processing book cover image:', error);
                            }
                            resolve();
                        };

                        img.onerror = () => {
                            console.log('Failed to load book cover image');
                            resolve();
                        };

                        // Only set src if coverImageUrl exists
                        if (book.coverImageUrl) {
                            img.src = book.coverImageUrl;
                        } else {
                            resolve();
                        }
                    });
                } catch (error) {
                    console.log('Error loading book cover:', error);
                }
            };

            // Helper function to add numbered text with proper indentation
            const addNumberedText = (
                number: number,
                text: string,
                fontSize: number = 12,
                color: number[] = colors.darkBlue,
                chapterText?: string
            ) => {
                pdf.setFontSize(fontSize);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(color[0], color[1], color[2]);

                const numberText = `${number}.`;
                const numberWidth = pdf.getTextWidth(numberText + ' ');
                const indentX = margin + numberWidth;
                const textWidth = contentWidth - numberWidth;
                const lineHeight = fontSize * 1.2;

                // Check if we need a new page
                if (yPosition + lineHeight > pageHeight - margin) {
                    pdf.addPage();
                    yPosition = margin;
                }

                // Add the number
                pdf.text(numberText, margin, yPosition);

                // Split the main text to fit the remaining width
                const lines = pdf.splitTextToSize(text, textWidth);

                // Add each line with proper indentation
                lines.forEach((line: string, index: number) => {
                    if (index > 0 && yPosition + lineHeight > pageHeight - margin) {
                        pdf.addPage();
                        yPosition = margin;
                    }

                    pdf.text(line, indentX, yPosition);
                    yPosition += lineHeight;
                });

                // Add chapter reference if provided
                if (chapterText) {
                    pdf.setFont('helvetica', 'normal');
                    pdf.setFontSize(11);
                    pdf.setTextColor(colors.lightText[0], colors.lightText[1], colors.lightText[2]);

                    const chapterLines = pdf.splitTextToSize(`Chapter: ${chapterText}`, textWidth);
                    chapterLines.forEach((line: string) => {
                        if (yPosition + lineHeight > pageHeight - margin) {
                            pdf.addPage();
                            yPosition = margin;
                        }
                        pdf.text(line, indentX, yPosition);
                        yPosition += lineHeight * 0.8; // Slightly smaller line height for chapter text
                    });
                }

                yPosition += 8; // Add some spacing after each item
            };            // Helper function to add spacing
            const addSpacing = (space: number) => {
                yPosition += space;
                if (yPosition > pageHeight - margin) {
                    pdf.addPage();
                    yPosition = margin;
                }
            };

            // Title Page
            yPosition = margin + 60;

            // Add a colored header background
            addColoredBackground(0, yPosition + 20, pageWidth, 80, colors.primary);

            addText(book.title, 24, true, true, [255, 255, 255]); // White text on blue background
            addSpacing(10);
            addText(`by ${book.author}`, 16, false, true, colors.secondary);
            addSpacing(30);
            addText(`${exportMode === 'short' ? 'Quick' : '7-Day Complete'} Action Plan`, 18, true, true, colors.accent);

            // Add book cover image to the top right
            await addBookCoverImage();

            addSpacing(40);

            if (exportMode === 'short') {
                // Short Plan Implementation
                addText('Quick Action Plan', 20, true, false, colors.primary);
                addSpacing(20);

                addText('Summary:', 16, true, false, colors.secondary);
                addSpacing(10);
                addText(book.summary, 12, false, false, colors.text);
                addSpacing(20);

                addText('Action Steps:', 16, true, false, colors.secondary);
                addSpacing(15);

                book.actionableSteps.forEach((step, index) => {
                    // Use the new numbered text function for proper alignment
                    addNumberedText(index + 1, step.step, 12, colors.darkBlue, step.chapter);
                });

            } else {
                // Detailed Plan Implementation
                addText('Book Summary', 20, true, false, colors.primary, true, colors.lightBg);
                addSpacing(15);
                addText(book.summary, 12, false, false, colors.text);
                addSpacing(30);

                // Add each day as a separate section
                book.actionableSteps.forEach((step, index) => {
                    // Add page break for each day (except the first)
                    if (index > 0) {
                        pdf.addPage();
                        yPosition = margin;
                    }

                    // Day header with colored background
                    addText(`Day ${index + 1}: ${step.step}`, 18, true, false, [255, 255, 255], true, colors.primary);
                    addSpacing(20);

                    addText('Action:', 14, true, false, colors.secondary);
                    addSpacing(10);
                    addText(step.step, 12, false, false, colors.text);
                    addSpacing(15);

                    if (step.details?.keyTakeaway) {
                        addText('Key Takeaway:', 14, true, false, colors.accent);
                        addSpacing(10);
                        addText(step.details.keyTakeaway, 12, false, false, colors.text);
                        addSpacing(15);
                    }

                    if (step.details?.sentences && step.details.sentences.length > 0) {
                        addText('Supporting Details:', 14, true, false, colors.secondary);
                        addSpacing(10);
                        step.details.sentences.forEach(sentence => {
                            addText(`• ${sentence}`, 12, false, false, colors.text);
                            addSpacing(8);
                        });
                        addSpacing(15);
                    }

                    if (step.chapter) {
                        addText('Source Chapter:', 14, true, false, colors.lightText);
                        addSpacing(10);
                        addText(step.chapter, 12, false, false, colors.lightText);
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