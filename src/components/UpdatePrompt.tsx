'use client';

import { useEffect, useState } from 'react';

export default function UpdatePrompt() {
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        setShowUpdate(true);
      });
    }
  }, []);

  const reload = () => window.location.reload();

  if (!showUpdate) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 bg-orange-600 text-white p-4 rounded-2xl shadow-2xl z-[100] flex items-center gap-4 max-w-sm">
      <div className="flex-1">
        <p className="font-medium">New version available!</p>
        <p className="text-sm opacity-90">Reload to get the latest features</p>
      </div>
      <button
        onClick={reload}
        className="bg-white text-orange-600 px-6 py-2 rounded-xl font-medium hover:bg-orange-50 transition"
      >
        Update now
      </button>
    </div>
  );
}