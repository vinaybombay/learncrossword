import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

type UploadTab = 'file' | 'url';

interface UploadedCrossword {
  id: string;
  title: string;
  source: string;
  uploadedAt: string;
  type: 'pdf' | 'image' | 'url';
}

// Mock store for uploaded crosswords (uses localStorage)
const STORAGE_KEY = 'uploaded_crosswords';

function getUploaded(): UploadedCrossword[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveUploaded(items: UploadedCrossword[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

const UploadCrossword: React.FC = () => {
  const [activeTab, setActiveTab] = useState<UploadTab>('file');
  const [urlInput, setUrlInput] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState<UploadedCrossword[]>(getUploaded());
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const ACCEPTED = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ];

  const typeFromFile = (file: File): 'pdf' | 'image' => {
    return file.type === 'application/pdf' ? 'pdf' : 'image';
  };

  const handleFile = async (file: File) => {
    setError('');
    if (!ACCEPTED.includes(file.type)) {
      setError('Only PDF, JPG, PNG or GIF files are supported.');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError('File must be under 20 MB.');
      return;
    }

    setUploading(true);
    // Simulate upload delay (replace with real API call when backend supports it)
    await new Promise((r) => setTimeout(r, 1200));

    const entry: UploadedCrossword = {
      id: `upload-${Date.now()}`,
      title: file.name.replace(/\.[^/.]+$/, ''),
      source: file.name,
      uploadedAt: new Date().toISOString(),
      type: typeFromFile(file),
    };

    const updated = [entry, ...uploaded];
    setUploaded(updated);
    saveUploaded(updated);
    setUploading(false);
    setSuccess(`"${entry.title}" added to your library!`);
    setTimeout(() => setSuccess(''), 4000);
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const trimmed = urlInput.trim();
    if (!trimmed) return;

    let url: URL;
    try {
      url = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    } catch {
      setError('Please enter a valid URL.');
      return;
    }

    setUploading(true);
    await new Promise((r) => setTimeout(r, 800));

    const isPdf = url.pathname.toLowerCase().endsWith('.pdf');
    const entry: UploadedCrossword = {
      id: `url-${Date.now()}`,
      title: url.hostname + url.pathname.split('/').pop(),
      source: url.toString(),
      uploadedAt: new Date().toISOString(),
      type: isPdf ? 'pdf' : 'url',
    };

    const updated = [entry, ...uploaded];
    setUploaded(updated);
    saveUploaded(updated);
    setUrlInput('');
    setUploading(false);
    setSuccess('Crossword link saved to your library!');
    setTimeout(() => setSuccess(''), 4000);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDelete = (id: string) => {
    const updated = uploaded.filter((u) => u.id !== id);
    setUploaded(updated);
    saveUploaded(updated);
  };

  const typeIcon = (type: UploadedCrossword['type']) => {
    if (type === 'pdf') return '📄';
    if (type === 'image') return '🖼️';
    return '🔗';
  };

  const typeLabel = (type: UploadedCrossword['type']) => {
    if (type === 'pdf') return 'PDF';
    if (type === 'image') return 'Image';
    return 'Link';
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Link to="/crosswords" className="text-slate-400 hover:text-slate-600 text-sm">
            ← Library
          </Link>
          <span className="text-slate-300">/</span>
          <h1 className="text-2xl font-bold text-slate-900">Bring Your Own Crossword</h1>
        </div>
        <p className="text-slate-500 text-sm max-w-xl">
          Upload a PDF or image of any crossword puzzle, or paste a link (e.g. Guardian, Times, NYT).
          Your uploads are saved locally and shared with the community library.
        </p>
      </div>

      {/* Upload card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          {(['file', 'url'] as UploadTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setError(''); }}
              className={`flex-1 py-3 text-sm font-semibold transition ${
                activeTab === tab
                  ? 'bg-white text-slate-900 border-b-2 border-slate-800'
                  : 'bg-slate-50 text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab === 'file' ? '📎 Upload File' : '🔗 Paste URL'}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* File upload tab */}
          {activeTab === 'file' && (
            <div>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition ${
                  dragOver
                    ? 'border-indigo-400 bg-indigo-50'
                    : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
                }`}
              >
                <div className="text-4xl mb-3">{uploading ? '⏳' : '📂'}</div>
                <p className="font-semibold text-slate-700 mb-1">
                  {uploading ? 'Saving…' : 'Drop your crossword here'}
                </p>
                <p className="text-sm text-slate-400">
                  PDF, JPG, PNG, GIF · max 20 MB
                </p>
                <p className="text-xs text-slate-400 mt-2">or click to browse</p>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                  e.target.value = '';
                }}
              />

              {/* Supported sources hint */}
              <div className="mt-4 flex flex-wrap gap-2">
                {['Guardian', 'Times', 'Telegraph', 'NYT', 'Economic Times', 'Any PDF'].map((src) => (
                  <span key={src} className="px-2 py-1 bg-slate-100 text-slate-500 text-xs rounded-full">
                    {src}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* URL tab */}
          {activeTab === 'url' && (
            <form onSubmit={handleUrlSubmit}>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Crossword URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://crosswords-static.guim.co.uk/gdn.quick.20260228.pdf"
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={uploading || !urlInput.trim()}
                  className="px-5 py-2 bg-slate-800 text-white rounded-lg text-sm font-semibold hover:bg-slate-700 transition disabled:opacity-50"
                >
                  {uploading ? '…' : 'Save'}
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Supports direct PDF links, Guardian crossword URLs, and any publicly accessible crossword page.
              </p>

              {/* Quick-add Guardian examples */}
              <div className="mt-4">
                <p className="text-xs font-medium text-slate-500 mb-2">Quick add — Guardian crosswords:</p>
                <div className="space-y-1">
                  {[
                    { label: 'Guardian Cryptic (Feb 27)', url: 'https://crosswords-static.guim.co.uk/gdn.cryptic.20260227.pdf' },
                    { label: 'Guardian Quick (Feb 28)', url: 'https://crosswords-static.guim.co.uk/gdn.quick.20260228.pdf' },
                    { label: 'Guardian Quick Cryptic (Jan 24)', url: 'https://crosswords-static.guim.co.uk/gdn.quick-cryptic.20260124.pdf' },
                  ].map((item) => (
                    <button
                      key={item.url}
                      type="button"
                      onClick={() => setUrlInput(item.url)}
                      className="block w-full text-left px-3 py-1.5 text-xs text-indigo-600 hover:bg-indigo-50 rounded transition"
                    >
                      + {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </form>
          )}

          {/* Error / success feedback */}
          {error && (
            <p className="mt-4 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}
          {success && (
            <p className="mt-4 text-sm text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg">✓ {success}</p>
          )}
        </div>
      </div>

      {/* Uploaded library */}
      {uploaded.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-3">Your Uploaded Crosswords</h2>
          <div className="space-y-2">
            {uploaded.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg border border-slate-200 px-4 py-3 flex items-center gap-3"
              >
                <span className="text-2xl flex-shrink-0">{typeIcon(item.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 text-sm truncate">{item.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                      {typeLabel(item.type)}
                    </span>
                    <span className="text-xs text-slate-400 truncate">{item.source}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Added {new Date(item.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {item.type === 'url' || item.type === 'pdf' ? (
                    <a
                      href={item.source.startsWith('http') ? item.source : '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs px-3 py-1 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 transition"
                    >
                      Open ↗
                    </a>
                  ) : null}
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-xs px-3 py-1 bg-red-50 text-red-500 rounded hover:bg-red-100 transition"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {uploaded.length === 0 && (
        <div className="text-center py-8 text-slate-400 text-sm">
          <p className="text-3xl mb-2">🧩</p>
          <p>No crosswords uploaded yet. Add your first one above!</p>
        </div>
      )}
    </motion.div>
  );
};

export default UploadCrossword;
