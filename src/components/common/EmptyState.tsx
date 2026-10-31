import React from 'react';
import { BookOpen, Search, BookmarkCheck } from 'lucide-react';

interface EmptyStateProps {
  icon?: 'search' | 'bookmark' | 'quran';
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'quran',
  title,
  description,
  actionLabel,
  onAction,
}) => {
  const renderIcon = () => {
    switch (icon) {
      case 'search':
        return <Search className="w-8 h-8 text-[#126B50]" />;
      case 'bookmark':
        return <BookmarkCheck className="w-8 h-8 text-[#126B50]" />;
      default:
        return <BookOpen className="w-8 h-8 text-[#126B50]" />;
    }
  };

  return (
    <div className="py-12 px-4 text-center flex flex-col items-center justify-center bg-white rounded-2xl border border-[#E5E1D5]">
      <div className="w-16 h-16 rounded-full bg-[#126B50]/10 flex items-center justify-center mb-4">
        {renderIcon()}
      </div>
      <h3 className="text-base font-semibold text-[#24352B] mb-1">{title}</h3>
      <p className="text-sm text-[#576B60] max-w-sm mb-5 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 text-xs font-semibold text-white bg-[#126B50] rounded-lg hover:bg-[#0c4d39] transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
