'use client';

import React, { useState, useEffect } from 'react';
import { formatDate } from '@/lib/utils';

const DeclarationTemplate = ({
  title,
  message,
  specialDate,
  youtubeLink = '',
  images = [],
  mode = 'view' // 'view' or 'preview'
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Auto-rotate images if there are more than 1
  useEffect(() => {
    if (images.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, [images.length]);
  
  // Handle manual navigation
  const goToNextImage = () => {
    if (images.length <= 1) return;
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };
  
  const goToPrevImage = () => {
    if (images.length <= 1) return;
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };
  
  // Format date
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
      {/* Header with title and stars background */}
      <header className="relative flex flex-col items-center justify-center px-4 py-20 bg-gradient-to-br from-blue-500 to-purple-600 text-white overflow-hidden">
        <div className="absolute inset-0 overflow-hidden stars-container">
          {/* Animated stars */}
          <div className="stars"></div>
          <div className="stars2"></div>
          <div className="stars3"></div>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold mb-3 text-center z-10">
          From My Heart to Yours
        </h1>
        <h2 className="text-xl md:text-2xl font-medium text-center z-10">
          {title}
        </h2>
        {formattedDate && (
          <p className="mt-2 text-center text-white/80 z-10">{formattedDate}</p>
        )}
      </header>

      {/* Main content */}
      <main className="flex-grow">
        {/* Image carousel */}
        {images.length > 0 && (
          <div className="relative max-w-3xl mx-auto my-8 px-4">
            <div className="aspect-w-16 aspect-h-9 bg-gray-100 dark:bg-gray-800 overflow-hidden rounded-lg shadow-lg">
              <img
                src={images[currentImageIndex]}
                alt={`Image ${currentImageIndex + 1}`}
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

        {/* Message */}
        <div className="max-w-3xl mx-auto px-4 my-8">
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 md:p-8 relative overflow-hidden">
            {/* Decorative design elements */}
            <div className="absolute top-0 left-0 w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-br-full"></div>
            <div className="absolute bottom-0 right-0 w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-tl-full"></div>
            
            <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-6 relative">
              My Declaration of Love
            </h3>
            
            <div className="prose dark:prose-invert max-w-none relative">
              {message.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4 last:mb-0 text-gray-700 dark:text-gray-300 leading-relaxed">
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
      <footer className="bg-purple-100 dark:bg-purple-900/30 py-6 mt-10">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-purple-600 dark:text-purple-300">
            Made with ❤️ on BirthdayLove.site
          </p>
        </div>
      </footer>

      {/* Custom animation style for stars */}
      <style jsx global>{`
        .stars-container {
          background: radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%);
        }
        
        @keyframes animStar {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(-2000px);
          }
        }
        
        .stars {
          width: 1px;
          height: 1px;
          background: transparent;
          box-shadow: ${generateStars(700)};
          animation: animStar 50s linear infinite;
        }
        
        .stars:after {
          content: " ";
          position: absolute;
          top: 2000px;
          width: 1px;
          height: 1px;
          background: transparent;
          box-shadow: ${generateStars(700)};
        }
        
        .stars2 {
          width: 2px;
          height: 2px;
          background: transparent;
          box-shadow: ${generateStars(200)};
          animation: animStar 100s linear infinite;
        }
        
        .stars2:after {
          content: " ";
          position: absolute;
          top: 2000px;
          width: 2px;
          height: 2px;
          background: transparent;
          box-shadow: ${generateStars(200)};
        }
        
        .stars3 {
          width: 3px;
          height: 3px;
          background: transparent;
          box-shadow: ${generateStars(100)};
          animation: animStar 150s linear infinite;
        }
        
        .stars3:after {
          content: " ";
          position: absolute;
          top: 2000px;
          width: 3px;
          height: 3px;
          background: transparent;
          box-shadow: ${generateStars(100)};
        }
      `}</style>
    </div>
  );
};

// Helper function to generate random stars
function generateStars(count) {
  let stars = '';
  for (let i = 0; i < count; i++) {
    const x = Math.floor(Math.random() * 2000);
    const y = Math.floor(Math.random() * 2000);
    
    stars += `${x}px ${y}px #FFF${i === count - 1 ? '' : ', '}`;
  }
  return stars;
}

export default DeclarationTemplate;