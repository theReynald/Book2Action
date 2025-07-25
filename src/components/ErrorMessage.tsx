import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
    message: string;
    details?: string;
    onRetry?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, details, onRetry }) => {
    const [showDetails, setShowDetails] = React.useState(false);
    return (
        <div className="max-w-2xl mx-auto animate-fade-in">
            <div className="glass-effect rounded-2xl p-8 shadow-2xl text-center">
                <div className="bg-red-500 bg-opacity-20 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                    <AlertCircle className="w-10 h-10 text-red-300" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">
                    Oops! Something went wrong
                </h3>
                <p className="text-white text-opacity-80 mb-6 leading-relaxed">
                    {message}
                </p>
                <div className="flex justify-center gap-4">
                    {onRetry && (
                        <button
                            onClick={onRetry}
                            className="button-gradient text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                        >
                            Try Again
                        </button>
                    )}
                    {/* Details button only if details are provided */}
                    {typeof details === 'string' && details.length > 0 && (
                        <button
                            onClick={() => setShowDetails(!showDetails)}
                            className="bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                        >
                            {showDetails ? 'Hide Details' : 'Details'}
                        </button>
                    )}
                </div>
                {/* Show details if toggled */}
                {showDetails && details && (
                    <div className="mt-6 p-4 bg-gray-900 bg-opacity-80 rounded-lg text-left text-sm text-red-200 whitespace-pre-wrap max-h-64 overflow-auto">
                        {details}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ErrorMessage;
