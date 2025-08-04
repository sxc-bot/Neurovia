import React, { useState, useEffect } from 'react';
import { X, Save, Trash2 } from 'lucide-react';
import { type JournalEntry } from '../hooks/useLocalJournal';

interface JournalEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry?: JournalEntry | null;
  onSave: (content: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  language: string;
}

const JournalEntryModal: React.FC<JournalEntryModalProps> = ({
  isOpen,
  onClose,
  entry,
  onSave,
  onDelete,
  language,
}) => {
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (entry) {
      setContent(entry.content);
    } else {
      setContent('');
    }
  }, [entry]);

  const getContent = () => {
    if (language === 'id') {
      return {
        title: entry ? 'Edit Entri Jurnal' : 'Entri Jurnal Baru',
        placeholder: 'Bagaimana perasaan Anda hari ini? Bagikan pemikiran, pengalaman, dan emosi Anda...',
        save: 'Simpan',
        delete: 'Hapus',
        cancel: 'Batal',
        saving: 'Menyimpan...',
        deleting: 'Menghapus...',
        characters: 'karakter',
        words: 'kata',
        confirmDelete: 'Apakah Anda yakin ingin menghapus entri ini?',
      };
    } else {
      return {
        title: entry ? 'Edit Journal Entry' : 'New Journal Entry',
        placeholder: 'How are you feeling today? Share your thoughts, experiences, and emotions...',
        save: 'Save',
        delete: 'Delete',
        cancel: 'Cancel',
        saving: 'Saving...',
        deleting: 'Deleting...',
        characters: 'characters',
        words: 'words',
        confirmDelete: 'Are you sure you want to delete this entry?',
      };
    }
  };

  const modalContent = getContent();

  const handleSave = async () => {
    if (!content.trim()) return;
    
    try {
      setIsSaving(true);
      await onSave(content);
      onClose();
    } catch (error) {
      console.error('Failed to save entry:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!entry || !onDelete) return;
    
    if (window.confirm(modalContent.confirmDelete)) {
      try {
        setIsDeleting(true);
        await onDelete(entry.id);
        onClose();
      } catch (error) {
        console.error('Failed to delete entry:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  if (!isOpen) return null;

  const wordCount = content.split(' ').filter(word => word.length > 0).length;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200/50 dark:border-slate-700/50">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
            {modalContent.title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={modalContent.placeholder}
            className="w-full h-64 p-4 bg-slate-50/50 dark:bg-slate-700/50 rounded-xl border border-slate-200/50 dark:border-slate-600/50 focus:ring-2 focus:ring-blue-500/50 focus:border-transparent outline-none resize-none text-slate-700 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            autoFocus
          />
          
          <div className="flex items-center justify-between mt-4 text-sm text-slate-500 dark:text-slate-400">
            <div className="flex items-center space-x-2">
              <span>{content.length} {modalContent.characters}</span>
              <span>•</span>
              <span>{wordCount} {modalContent.words}</span>
            </div>
            
            {entry && (
              <span>
                {language === 'id' ? 'Dibuat' : 'Created'}: {new Date(entry.created_at).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US')}
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-200/50 dark:border-slate-700/50">
          <div>
            {entry && onDelete && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center space-x-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>{modalContent.deleting}</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>{modalContent.delete}</span>
                  </>
                )}
              </button>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              {modalContent.cancel}
            </button>
            
            <button
              onClick={handleSave}
              disabled={!content.trim() || isSaving}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{modalContent.saving}</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{modalContent.save}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JournalEntryModal;