import React from "react";
import { BookCandidate } from "../types/Book";
import { BookOpen, ArrowLeft } from "lucide-react";

interface BookCandidatesProps {
  candidates: BookCandidate[];
  query: string;
  onSelect: (candidate: BookCandidate) => void;
  onBack: () => void;
  isDarkMode: boolean;
}

const BookCandidates: React.FC<BookCandidatesProps> = ({
  candidates,
  query,
  onSelect,
  onBack,
  isDarkMode,
}) => {
  return (
    <div className="max-w-4xl mx-auto animate-slide-up">
      <div className="glass-effect rounded-2xl p-8">
        <div className="flex items-center justify-between mb-2">
          <h3
            className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
          >
            Select a Book
          </h3>
          <button
            onClick={onBack}
            className={`flex items-center gap-1 px-3 py-1.5 ${
              isDarkMode
                ? "bg-gray-800 bg-opacity-70 hover:bg-opacity-90 text-white"
                : "bg-gray-200 bg-opacity-70 hover:bg-opacity-90 text-gray-800"
            } rounded-md transition-colors`}
          >
            <ArrowLeft size={16} />
            <span>New Search</span>
          </button>
        </div>
        <p
          className={`text-opacity-70 text-center mb-6 ${isDarkMode ? "text-white" : "text-gray-700"}`}
        >
          We found these books matching "<strong>{query}</strong>" — pick one to
          analyze
        </p>
        <div className="space-y-3">
          {candidates.map((candidate, index) => (
            <button
              key={index}
              onClick={() => onSelect(candidate)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                isDarkMode
                  ? "border-gray-700 hover:border-blue-500 hover:bg-gray-800 hover:bg-opacity-50"
                  : "border-gray-200 hover:border-blue-500 hover:bg-blue-50"
              }`}
            >
              <div className="w-16 h-24 flex-shrink-0 flex items-center justify-center">
                {candidate.coverImageUrl ? (
                  <img
                    src={candidate.coverImageUrl}
                    alt={`${candidate.title} cover`}
                    className="w-full h-full object-cover rounded-lg shadow-md"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      const parent = target.parentElement;
                      if (parent) {
                        parent.classList.add(
                          "bg-gradient-to-br",
                          "from-blue-500",
                          "to-purple-600",
                          "rounded-lg",
                        );
                        const icon = document.createElement("div");
                        icon.innerHTML = "📚";
                        icon.className = "text-2xl";
                        parent.appendChild(icon);
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <BookOpen className="text-white" size={24} />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4
                  className={`font-semibold text-lg truncate ${isDarkMode ? "text-white" : "text-gray-900"}`}
                >
                  {candidate.title}
                </h4>
                <p
                  className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  by {candidate.author}
                </p>
                <div className="flex gap-3 mt-1">
                  {candidate.publishedYear && (
                    <span
                      className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}
                    >
                      {candidate.publishedYear}
                    </span>
                  )}
                  {candidate.genre && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        isDarkMode
                          ? "bg-blue-900 bg-opacity-50 text-blue-300"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {candidate.genre}
                    </span>
                  )}
                </div>
              </div>
              <div
                className={`flex-shrink-0 text-sm font-medium ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}
              >
                Analyze →
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BookCandidates;
