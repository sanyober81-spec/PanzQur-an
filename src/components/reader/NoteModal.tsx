import React, { useState } from 'react';
import { X, MessageSquare, Save } from 'lucide-react';
import { Ayah, Bookmark } from '../../types/quran';
import { db } from '../../storage/db';
import { useToast } from '../common/Toast';

interface NoteModalProps {
  ayah: Ayah;
  nomorSurat: number;
  namaSuratLatin: string;
  onClose: () => void;
  onSaved: () => void;
}

export const NoteModal: React.FC<NoteModalProps> = ({
  ayah,
  nomorSurat,
  namaSuratLatin,
  onClose,
  onSaved,
}) => {
  const existingBookmark = db.getBookmark(nomorSurat, ayah.nomorAyat);
  const [noteText, setNoteText] = useState(existingBookmark?.note || '');
  const { showToast } = useToast();

  const handleSave = () => {
    const bookmark: Bookmark = {
      id: `${nomorSurat}:${ayah.nomorAyat}`,
      nomorSurat,
      namaSuratLatin,
      nomorAyat: ayah.nomorAyat,
      teksArab: ayah.teksArab,
      teksIndonesia: ayah.teksIndonesia,
      timestamp: Date.now(),
      note: noteText.trim() || undefined,
    };

    db.saveBookmark(bookmark);
    showToast(
      noteText.trim()
        ? `Catatan ayat ${ayah.nomorAyat} tersimpan di Bookmark!`
        : `Ayat ${ayah.nomorAyat} tersimpan di Bookmark!`
    );
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-[#E5E1D5] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#E5E1D5] bg-[#FAF9F4]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#B89B58]/15 text-[#B89B58] flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#24352B]">
                Catatan Refleksi Ayat
              </h3>
              <p className="text-xs text-[#576B60]">
                QS. {namaSuratLatin} : Ayat {ayah.nomorAyat}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Snippet Ayat */}
        <div className="p-4 bg-[#FAF9F4]/60 border-b border-slate-100 text-xs text-[#576B60] italic line-clamp-2">
          "{ayah.teksIndonesia}"
        </div>

        {/* Text Area */}
        <div className="p-4 sm:p-5 space-y-3">
          <label className="block text-xs font-semibold text-[#24352B]">
            Tuliskan tadabbur, catatan, atau pengingat pribadi:
          </label>
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Tuliskan pelajaran berharga atau doa dari ayat ini..."
            rows={5}
            className="w-full p-3 text-xs sm:text-sm text-[#24352B] bg-[#FAF9F4] rounded-xl border border-[#E5E1D5] focus:outline-hidden focus:border-[#126B50] focus:ring-1 focus:ring-[#126B50]"
          />
          <p className="text-[11px] text-[#84968C]">
            Catatan ini disimpan secara persisten di peramban Anda dan terhubung ke menu Bookmark.
          </p>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-[#E5E1D5] bg-[#FAF9F4] flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#576B60] hover:text-[#24352B] transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#126B50] hover:bg-[#0c4d39] rounded-xl transition-colors shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Simpan Catatan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
