
import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Link, Zap } from 'lucide-react';
import { Button } from './ui/Button';
import { createShortLink } from '../services/firebase';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, courseId, courseTitle }) => {
  const [shortCode, setShortCode] = useState('');
  const [isLoadingShort, setIsLoadingShort] = useState(false);
  const [copiedNormal, setCopiedNormal] = useState(false);
  const [copiedShort, setCopiedShort] = useState(false);

  // Generate short link when modal opens
  useEffect(() => {
    if (isOpen && courseId) {
      const generate = async () => {
        setIsLoadingShort(true);
        const code = await createShortLink(courseId);
        setShortCode(code);
        setIsLoadingShort(false);
      };
      generate();
    } else {
      setShortCode('');
      setCopiedNormal(false);
      setCopiedShort(false);
    }
  }, [isOpen, courseId]);

  if (!isOpen) return null;

  const baseUrl = window.location.origin + window.location.pathname;
  const normalLink = `${baseUrl}?c=${courseId}`;
  const shortLink = shortCode ? `${baseUrl}?s=${shortCode}` : 'Generating...';

  const copyToClipboard = (text: string, isShort: boolean) => {
    navigator.clipboard.writeText(text);
    if (isShort) {
      setCopiedShort(true);
      setTimeout(() => setCopiedShort(false), 2000);
    } else {
      setCopiedNormal(true);
      setTimeout(() => setCopiedNormal(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 overflow-hidden">
        
        <div className="bg-indigo-600 p-6 text-white text-center">
           <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Link size={24} />
           </div>
           <h3 className="font-bold text-lg">Share Course</h3>
           <p className="text-indigo-200 text-xs truncate px-4">{courseTitle}</p>
        </div>

        <div className="p-6 space-y-6">
           
           {/* Normal Link */}
           <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Standard Link</label>
              <div className="flex gap-2">
                 <input 
                   readOnly 
                   value={normalLink}
                   className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 outline-none"
                 />
                 <Button 
                    onClick={() => copyToClipboard(normalLink, false)}
                    className={copiedNormal ? "bg-green-600 hover:bg-green-700" : "bg-gray-800 hover:bg-gray-900"}
                 >
                    {copiedNormal ? <Check size={18}/> : <Copy size={18}/>}
                 </Button>
              </div>
           </div>

           {/* Short Link */}
           <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-1">
                 <Zap size={12} className="text-yellow-500 fill-current"/> Short Link
              </label>
              <div className="flex gap-2">
                 <input 
                   readOnly 
                   value={shortLink}
                   className="flex-1 px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-lg text-sm text-indigo-700 font-bold outline-none"
                 />
                 <Button 
                    onClick={() => copyToClipboard(shortLink, true)}
                    disabled={isLoadingShort}
                    className={copiedShort ? "bg-green-600 hover:bg-green-700" : "bg-indigo-600 hover:bg-indigo-700"}
                 >
                    {isLoadingShort ? '...' : (copiedShort ? <Check size={18}/> : <Copy size={18}/>)}
                 </Button>
              </div>
              <p className="text-[10px] text-gray-400 mt-2">
                 This short link will automatically redirect users to the course detail page.
              </p>
           </div>

        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 text-center">
           <button onClick={onClose} className="text-sm font-bold text-gray-500 hover:text-gray-800">
              Close Window
           </button>
        </div>

      </div>
    </div>
  );
};
