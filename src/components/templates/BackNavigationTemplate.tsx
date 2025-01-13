import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface BackNavigationTemplateProps {
  children: React.ReactNode;
  title?: string;
  showBackArrow?: boolean;
  className?: string;
}

const BackNavigationTemplate = ({
  children,
  title,
  showBackArrow = true,
  className = ''
}: BackNavigationTemplateProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="px-4 py-2 flex items-center gap-4">
          {showBackArrow && (
            <button
              onClick={handleBack}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
          )}
          {title && (
            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className={className}>
        {children}
      </div>
    </div>
  );
};

export default BackNavigationTemplate;