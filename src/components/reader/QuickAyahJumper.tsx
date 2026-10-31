import React, { useState } from 'react';
import { Navigation } from 'lucide-react';

interface QuickAyahJumperProps {
  totalAyat: number;
  currentAyat?: number;
  onJumpToAyat: (nomorAyat: number) => void;
}

export const QuickAyahJumper: React.FC<QuickAyahJumperProps> = ({
  totalAyat,
  currentAyat = 1,
  onJumpToAyat,
}) => {
  const [selected, setSelected] = useState<number>(currentAyat);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      setSelected(val);
      onJumpToAyat(val);
    }
  };

  return (
    <div className="flex items-center gap-1.5 bg-white border border-[#E5E1D5] px-2.5 py-1 rounded-xl shadow-2xs">
      <Navigation className="w-3.5 h-3.5 text-[#126B50]" />
      <span className="text-[11px] font-semibold text-[#576B60] hidden sm:inline">
        Ayat:
      </span>
      <select
        value={selected}
        onChange={handleChange}
        className="text-xs font-bold text-[#24352B] bg-transparent focus:outline-hidden cursor-pointer"
        aria-label="Pilih nomor ayat"
      >
        {Array.from({ length: totalAyat }, (_, i) => i + 1).map((num) => (
          <option key={num} value={num}>
            Ayat {num}
          </option>
        ))}
      </select>
    </div>
  );
};
