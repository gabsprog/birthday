// src/app/[slug]/UpdateNotification.js
'use client';

import { useEffect, useState } from 'react';

export default function UpdateNotification() {
  const [visible, setVisible] = useState(true);
  
  // Check if we have the updated parameter in the URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isUpdated = urlParams.get('updated') === 'true';
    
    setVisible(isUpdated);
    
    if (isUpdated) {
      // Auto-hide the notification after 5 seconds
      const timer = setTimeout(() => {
        setVisible(false);
        
        // Remove the 'updated' parameter from the URL
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('updated');
        window.history.replaceState({}, '', newUrl);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, []);
  
  if (!visible) return null;
  
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
      <div className="flex items-center">
        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <span>Site updated!</span>
      </div>
    </div>
  );
}   