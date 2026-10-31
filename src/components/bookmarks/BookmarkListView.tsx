import React, { useState, useEffect } from 'react';
import { Bookmark, Trash2, ArrowRight, MessageSquare, Edit3 } from 'lucide-react';
import { Bookmark as BookmarkType } from '../../types/quran';
import { db } from '../../storage/db';
import { EmptyState } from '../common/EmptyState';
import { useToast } from '../common/Toast';

interface BookmarkListViewProps {
  onNavigateToAyat: (nomorSurat: number, nomorAyat: number) => void;
  onExploreSurah: () => void;
}

export const BookmarkListView: React.FC<BookmarkListViewProps> = ({
  onNavigateToAyat,
  onExploreSurah,
}) => {
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNoteText, setTempNoteText] = useState('');
  const { showToast } = useToast();

  const loadBookmarks = () => {
    setBookmarks(db.getBookmarks());
  };

  useEffect(() => {
    loadBookmarks();
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    db.removeBookmark(id);
    loadBookmarks();
    showToast('Bookmark berhasil dihapus.');
  };

  const handleStartEditNote = (b: BookmarkType, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingNoteId(b.id);
    setTempNoteText(b.note || '');
  };

  const handleSaveNote = (b: BookmarkType, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated: BookmarkType = {
      ...b,
      note: tempNoteText.trim() || undefined,
    };
    db.saveBookmark(updated);
    setEditingNoteId(null);
    loadBookmarks();
    showToast('Catatan bookmark berhasil diperbarui.');
  };

  if (bookmarks.length === 0) {
    return (
      <EmptyState
        icon="bookmark"
        title="Belum Ada Bookmark"
        description="Simpan ayat yang berkesan saat membaca Al-Qur'an untuk dibaca kembali kapan saja atau tambahkan catatan refleksi pribadi."
        actionLabel="Mulai Membaca Surat"
        onAction={onExploreSurah}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-[#24352B]">Bookmark & Catatan Pribadi</h2>
          <p className="text-xs text-[#576B60]">
            Tersimpan <strong className="text-[#126B50]">{bookmarks.length}</strong> ayat pilihan
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {bookmarks.map((b) => (
          <div
            key={b.id}
            onClick={() => onNavigateToAyat(b.nomorSurat, b.nomorAyat)}
            className="p-4 sm:p-5 bg-white rounded-2xl border border-[#E5E1D5] hover:border-[#126B50] hover:shadow-xs transition cursor-pointer group"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#126B50]/10 text-[#126B50] font-bold text-xs flex items-center justify-center tabular-nums">
                  {b.nomorAyat}
                </span>
                <span className="text-xs font-bold text-[#24352B]">
                  QS. {b.namaSuratLatin} : Ayat {b.nomorAyat}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => handleStartEditNote(b, e)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-[#126B50] hover:bg-slate-50 transition-colors"
                  title="Edit Catatan"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => handleDelete(b.id, e)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Hapus Bookmark"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Arabic text snippet */}
            <p className="font-arabic text-right text-lg sm:text-xl text-[#24352B] mb-2 leading-relaxed">
              {b.teksArab}
            </p>

            {/* Translation snippet */}
            <p className="text-xs text-[#576B60] leading-relaxed line-clamp-2 mb-3">
              "{b.teksIndonesia}"
            </p>

            {/* Personal Note Section */}
            {editingNoteId === b.id ? (
              <div
                className="mt-2 p-3 bg-[#FAF9F4] rounded-xl border border-[#E5E1D5] space-y-2"
                onClick={(e) => e.stopPropagation()}
              >
                <textarea
                  value={tempNoteText}
                  onChange={(e) => setTempNoteText(e.target.value)}
                  placeholder="Tuliskan catatan tadabbur..."
                  rows={3}
                  className="w-full p-2 text-xs bg-white rounded-lg border border-[#E5E1D5] focus:outline-hidden focus:border-[#126B50]"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setEditingNoteId(null)}
                    className="px-3 py-1 text-[11px] text-[#576B60] hover:text-[#24352B]"
                  >
                    Batal
                  </button>
                  <button
                    onClick={(e) => handleSaveNote(b, e)}
                    className="px-3 py-1 text-[11px] font-bold text-white bg-[#126B50] rounded-lg hover:bg-[#0c4d39]"
                  >
                    Simpan
                  </button>
                </div>
              </div>
            ) : b.note ? (
              <div className="mt-2 p-2.5 bg-[#F5F0D9]/50 rounded-xl border border-[#E5E1D5] flex items-start gap-2 text-xs text-[#24352B]">
                <MessageSquare className="w-3.5 h-3.5 text-[#B89B58] shrink-0 mt-0.5" />
                <p className="italic leading-snug">{b.note}</p>
              </div>
            ) : null}

            <div className="flex items-center justify-between text-[11px] text-[#84968C] pt-3 mt-2 border-t border-slate-50">
              <span>
                Disimpan pada {new Date(b.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-1 font-semibold text-[#126B50] group-hover:translate-x-0.5 transition-transform">
                <span>Buka Ayat</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
