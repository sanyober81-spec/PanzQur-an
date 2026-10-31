import React from 'react';
import { Target, CheckCircle2, ChevronRight } from 'lucide-react';
import { AppSettings } from '../../types/quran';

interface TilawahTargetCardProps {
  settings: AppSettings;
  onOpenSettings: () => void;
}

export const TilawahTargetCard: React.FC<TilawahTargetCardProps> = ({
  settings,
  onOpenSettings,
}) => {
  const target = settings.dailyReadingTarget || 10;
  const current = settings.completedTodayAyatCount || 0;
  const percent = Math.min(100, Math.round((current / target) * 100));
  const isReached = current >= target;

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E5E1D5] flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
          isReached ? 'bg-emerald-50 text-emerald-700' : 'bg-[#126B50]/10 text-[#126B50]'
        }`}>
          {isReached ? <CheckCircle2 className="w-6 h-6" /> : <Target className="w-6 h-6" />}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-sm font-bold text-[#24352B]">Target Tilawah Harian</h3>
            <span className="text-[11px] font-medium text-[#576B60]">
              {current} / {target} Ayat
            </span>
          </div>
          <div className="w-36 sm:w-48 bg-slate-100 h-2 rounded-full overflow-hidden mt-1.5">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                isReached ? 'bg-emerald-600' : 'bg-[#126B50]'
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="text-[11px] text-[#84968C] mt-1">
            {isReached
              ? 'Alhamdulillah, target harian tercapai!'
              : `${target - current} ayat lagi untuk mencapai target hari ini.`}
          </p>
        </div>
      </div>

      <button
        onClick={onOpenSettings}
        className="p-2 text-slate-400 hover:text-[#126B50] hover:bg-slate-50 rounded-lg transition-colors shrink-0"
        title="Ubah Target Tilawah"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};
