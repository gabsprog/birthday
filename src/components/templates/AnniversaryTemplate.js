'use client';

import React, { useState, useEffect } from 'react';
import { formatDate, getTimeDifference } from '@/lib/utils';

const AnniversaryTemplate = ({
  title,
  message,
  specialDate,
  youtubeLink = '',
  images = [],
  mode = 'view' // 'view' or 'preview'
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [timeDifference, setTimeDifference] = useState(null);
  const [isCounterRunning, setIsCounterRunning] = useState(true);
  
  // Auto-rotate images if there are more than 1
  useEffect(() => {
    if (images.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, [images.length]);
  
  // Update time difference counter
  useEffect(() => {
    if (!specialDate || !isCounterRunning) return;
    
    const updateTimeDifference = () => {
      setTimeDifference(getTimeDifference(specialDate));
    };
    
    // Initial update
    updateTimeDifference();
    
    // Update every second
    const timer = setInterval(updateTimeDifference, 1000);
    
    return () => clearInterval(timer);
  }, [specialDate, isCounterRunning]);
  
  // Handle manual navigation
  const goToNextImage = () => {
    if (images.length <= 1) return;
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };
  
  const goToPrevImage = () => {
    if (images.length <= 1) return;
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };
  
  // Format anniversary date
  const formattedDate = specialDate ? formatDate(specialDate) : '';
  
  // Extract YouTube video ID
  const getYoutubeEmbedUrl = () => {
    if (!youtubeLink) return '';
    
    const regExp = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([^?&]+)(?:\?.*)?$/;
    const match = youtubeLink.match(regExp);
    
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=0`;
    }
    
    return '';
  };
  
  return (
    <div className={`min-h-screen flex flex-col ${mode === 'preview' ? 'scale-[0.6] origin-top' : ''}`}>
      {/* Header with title and floating hearts animation */}
      <header className="relative flex flex-col items-center justify-center px-4 py-20 bg-gradient-to-br from-red-400 to-purple-500 text-white overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          {/* Animated hearts elements */}
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-float"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5 + 0.3,
                animationDuration: `${Math.random() * 8 + 10}s`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            >
              <svg
                className="w-6 h-6 text-white/80"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
          ))}
        </div>

        <h1 className="text-4xl md:text-5xl font-bold mb-3 text-center z-10">
          Happy Anniversary!
        </h1>
        <h2 className="text-xl md:text-2xl font-medium text-center z-10">
          {title}
        </h2>
        {formattedDate && (
          <p className="mt-2 text-center text-white/80 z-10">Anniversary: {formattedDate}</p>
        )}
      </header>

      {/* Time counter section */}
      {timeDifference && (
        <div className="bg-red-50 dark:bg-red-900/20 py-8 px-4">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-xl md:text-2xl font-semibold text-center text-red-600 dark:text-red-400 mb-6">
              Time Together
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {timeDifference.years > 0 && (
                <div className="flex flex-col items-center bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                  <span className="text-3xl md:text-4xl font-bold text-red-500 dark:text-red-400">
                    {timeDifference.years}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
                    {timeDifference.years === 1 ? 'Year' : 'Years'}
                  </span>
                </div>
              )}
              
              <div className="flex flex-col items-center bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                <span className="text-3xl md:text-4xl font-bold text-red-500 dark:text-red-400">
                  {timeDifference.months}
                </span>
                <span className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
                  {timeDifference.months === 1 ? 'Month' : 'Months'}
                </span>
              </div>
              
              <div className="flex flex-col items-center bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                <span className="text-3xl md:text-4xl font-bold text-red-500 dark:text-red-400">
                  {timeDifference.days}
                </span>
                <span className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
                  {timeDifference.days === 1 ? 'Day' : 'Days'}
                </span>
              </div>
              
              <div className="flex flex-col items-center bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                <span className="text-3xl md:text-4xl font-bold text-red-500 dark:text-red-400">
                  {timeDifference.totalDays}
                </span>
                <span className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
                  Total Days
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-grow">
        {/* Image carousel */}
        {images.length > 0 && (
          <div className="relative max-w-3xl mx-auto my-8 px-4">
            <div className="aspect-w-16 aspect-h-9 bg-gray-100 dark:bg-gray-800 overflow-hidden rounded-lg shadow-lg">
              <img
                src={images[currentImageIndex]}
                alt={`Anniversary image ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
              />
              
              {/* Image navigation buttons (if more than 1 image) */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={goToPrevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition-colors"
                    aria-label="Previous image"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={goToNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition-colors"
                    aria-label="Next image"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  
                  {/* Image indicators */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                        aria-label={`Go to image ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Anniversary message */}
        <div className="max-w-3xl mx-auto px-4 my-8">
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 md:p-8">
            <h3 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
              Anniversary Message
            </h3>
            <div className="prose dark:prose-invert max-w-none">
              {message.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4 last:mb-0 text-gray-700 dark:text-gray-300">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* YouTube video (if provided) */}
        {youtubeLink && getYoutubeEmbedUrl() && (
          <div className="max-w-3xl mx-auto px-4 my-8">
            <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow-lg">
              <iframe
                src={getYoutubeEmbedUrl()}
                title="YouTube video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-red-100 dark:bg-red-900/30 py-6 mt-10">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-red-600 dark:text-red-300">
            Made with ❤️ on BirthdayLove.site
          </p>
        </div>
      </footer>

      {/* Custom animation style */}
      <style jsx global>{`
        @keyframes float {
          0% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(10deg);
          }
          100% {
            transform: translateY(0) rotate(0deg);
          }
        }
        
        .animate-float {
          animation: float ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default AnniversaryTemplate;