'use client';

import React, { useState, useEffect } from 'react';
import { formatDate } from '@/lib/utils';

const BirthdayTemplate = ({ 
  title, 
  message, 
  specialDate, 
  youtubeLink = '', 
  images = [],
  mode = 'view' // 'view' or 'preview'
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [hiddenContent, setHiddenContent] = useState(mode === 'preview' ? false : true);
  
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
  
  // Format birthday date
  const formattedDate = specialDate ? formatDate(specialDate) : '';
  
  // Extract YouTube video ID
  const getYoutubeEmbedUrl = () => {
    if (!youtubeLink) return '';
    
    const regExp = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([^?&]+)(?:\?.*)?$/;
    const match = youtubeLink.match(regExp);
    
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}?autoplay=${mode === 'preview' ? '0' : '1'}&mute=${mode === 'preview' ? '1' : '0'}`;
    }
    
    return '';
  };

  const handleSurpriseClick = (e) => {
    e.preventDefault();
    setHiddenContent(false);
    // Scroll to hidden content after revealing
    setTimeout(() => {
      const content = document.getElementById('hiddenBirthdayContent');
      if (content) content.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };
  
  return (
    <div className={`${mode === 'preview' ? 'scale-[0.6] origin-top' : ''}`}>
      {/* Birthday Header */}
      <header className="relative flex flex-col items-center justify-center px-4 py-20 bg-gradient-to-br from-pink-500 to-rose-400 text-white min-h-screen overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          {/* Animated confetti elements */}
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 10 + 5}px`,
                height: `${Math.random() * 10 + 5}px`,
                backgroundColor: `hsl(${Math.random() * 360}, 80%, 60%)`,
                borderRadius: Math.random() > 0.5 ? '50%' : '0',
                transform: `rotate(${Math.random() * 360}deg)`,
                animation: `fall ${Math.random() * 5 + 3}s linear infinite`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>

        <h1 className="text-4xl md:text-5xl font-bold mb-3 text-center z-10 animate-bounce">
          Happy Birthday!
        </h1>
        <h2 className="text-xl md:text-2xl font-medium text-center z-10">
          {title}
        </h2>
        {formattedDate && (
          <p className="mt-2 text-center text-white/80 z-10">{formattedDate}</p>
        )}

        {/* Birthday Cake */}
        <div className="relative w-60 h-64 my-10 text-center z-10">
          {/* Birthday number */}
          <div className="absolute top-[-50px] left-1/2 -translate-x-1/2 text-6xl font-bold text-pink-600" 
               style={{textShadow: '2px 2px 5px rgba(0,0,0,0.2)'}}>
            {specialDate ? new Date().getFullYear() - new Date(specialDate).getFullYear() : '?'}
          </div>

          {/* Cake layers */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
            <div className="w-32 h-10 rounded-lg shadow-md bg-gradient-to-r from-rose-300 to-pink-300" 
                 style={{boxShadow: '0 5px 15px rgba(0,0,0,0.1)'}}></div>
            <div className="w-40 h-10 -mt-2 rounded-lg shadow-md bg-gradient-to-r from-pink-200 to-rose-200"
                 style={{boxShadow: '0 5px 15px rgba(0,0,0,0.1)'}}></div>
            <div className="w-48 h-10 -mt-2 rounded-lg shadow-md bg-gradient-to-r from-rose-100 to-pink-100"
                 style={{boxShadow: '0 5px 15px rgba(0,0,0,0.1)'}}></div>
          </div>

          {/* Candles */}
          <div className="absolute bottom-[130px] left-[80px] w-2 h-10 bg-gradient-to-t from-pink-500 to-pink-300 rounded-sm animate-flicker"
               style={{
                 animation: 'flicker 0.4s infinite alternate',
                 boxShadow: '0 0 10px 5px rgba(255, 214, 94, 0.5)'
               }}>
            <div className="w-3 h-3 absolute -top-3 -left-0.5 bg-yellow-300 rounded-full"
                 style={{boxShadow: '0 0 8px 4px rgba(255, 215, 0, 0.6)'}}></div>
          </div>
          <div className="absolute bottom-[130px] left-[105px] w-2 h-10 bg-gradient-to-t from-pink-500 to-pink-300 rounded-sm animate-flicker"
               style={{
                 animation: 'flicker 0.4s infinite alternate',
                 boxShadow: '0 0 10px 5px rgba(255, 214, 94, 0.5)',
                 animationDelay: '0.2s'
               }}>
            <div className="w-3 h-3 absolute -top-3 -left-0.5 bg-yellow-300 rounded-full"
                 style={{boxShadow: '0 0 8px 4px rgba(255, 215, 0, 0.6)'}}></div>
          </div>
          <div className="absolute bottom-[130px] left-[130px] w-2 h-10 bg-gradient-to-t from-pink-500 to-pink-300 rounded-sm animate-flicker"
               style={{
                 animation: 'flicker 0.4s infinite alternate',
                 boxShadow: '0 0 10px 5px rgba(255, 214, 94, 0.5)',
                 animationDelay: '0.1s'
               }}>
            <div className="w-3 h-3 absolute -top-3 -left-0.5 bg-yellow-300 rounded-full"
                 style={{boxShadow: '0 0 8px 4px rgba(255, 215, 0, 0.6)'}}></div>
          </div>
        </div>

        {/* Surprise button */}
        {hiddenContent && mode !== 'preview' && (
          <button 
            onClick={handleSurpriseClick}
            className="mt-6 py-3 px-6 bg-white text-pink-500 font-bold rounded-full shadow-lg transition-all hover:transform hover:-translate-y-1 hover:shadow-xl animate-pulse"
          >
            Surprise
          </button>
        )}
      </header>

      {/* Hidden content that appears after clicking the button */}
      <div id="hiddenBirthdayContent" className={hiddenContent && mode !== 'preview' ? 'hidden' : 'block'}>
        {/* Fixed Navigation Menu */}
        {mode !== 'preview' && (
          <nav className="fixed bottom-0 left-0 w-full bg-white/95 dark:bg-gray-800/95 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] z-50 flex justify-around py-3">
            <a href="#top" className="flex flex-col items-center text-pink-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-xs mt-1">Home</span>
            </a>
            <a href="#about" className="flex flex-col items-center text-pink-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-xs mt-1">About</span>
            </a>
            <a href="#reasons" className="flex flex-col items-center text-pink-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="text-xs mt-1">Reasons</span>
            </a>
            <a href="#gallery" className="flex flex-col items-center text-pink-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs mt-1">Photos</span>
            </a>
            <a href="#message" className="flex flex-col items-center text-pink-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <span className="text-xs mt-1">Message</span>
            </a>
          </nav>
        )}

        {/* YouTube Music Section */}
        {youtubeLink && getYoutubeEmbedUrl() && (
          <section id="music" className="py-16 px-4 flex flex-col items-center justify-center min-h-screen bg-pink-50 dark:bg-gray-900">
            <h2 className="text-3xl font-bold mb-8 text-pink-600 dark:text-pink-400 text-center">
              A Special Song For You
            </h2>
            <div className="w-full max-w-3xl mx-auto aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow-lg">
              <iframe
                src={getYoutubeEmbedUrl()}
                title="YouTube video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
          </section>
        )}

        {/* About You Section */}
        <section id="about" className="py-16 px-4 min-h-screen flex flex-col justify-center bg-white dark:bg-gray-800">
          <h2 className="text-3xl font-bold mb-12 text-center text-pink-600 dark:text-pink-400 relative">
            About You
            <span className="absolute bottom-[-10px] left-1/2 transform -translate-x-1/2 w-20 h-1 bg-pink-500 rounded-full"></span>
          </h2>
          
          <div className="max-w-3xl mx-auto space-y-8">
            {/* First card - taller with main image */}
            {images.length > 0 && (
              <div className="bg-white dark:bg-gray-700 rounded-xl overflow-hidden shadow-xl transform transition-all hover:scale-[1.01] opacity-0 animate-fadeIn" style={{animationDelay: '0.1s', animationFillMode: 'forwards'}}>
                <img 
                  src={images[0]} 
                  alt="Special Image" 
                  className="w-full h-96 object-cover" 
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3 text-pink-600 dark:text-pink-400">Amazing Person ❤️</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    You are the most incredible person I've ever met. A life journey marked by achievements, smiles, and special moments. Your presence brightens any room, and your smile can transform the gloomiest days into colorful ones. Every little gesture of yours is a reminder of the extraordinary person you are.
                  </p>
                </div>
              </div>
            )}
            
            {/* Optional additional cards if there are more images */}
            {images.length > 1 && (
              <div className="bg-white dark:bg-gray-700 rounded-xl overflow-hidden shadow-xl transform transition-all hover:scale-[1.01] opacity-0 animate-fadeIn" style={{animationDelay: '0.3s', animationFillMode: 'forwards'}}>
                <img 
                  src={images[1]} 
                  alt="Special Moment" 
                  className="w-full h-72 object-cover" 
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3 text-pink-600 dark:text-pink-400">Our Story</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    From the very first moment, I knew you were special. The way we met, every moment together, every shared laugh. We've built memories that I'll cherish forever. Our journey is a story of friendship, affection, and mutual care.
                  </p>
                </div>
              </div>
            )}
            
            {images.length > 2 && (
              <div className="bg-white dark:bg-gray-700 rounded-xl overflow-hidden shadow-xl transform transition-all hover:scale-[1.01] opacity-0 animate-fadeIn" style={{animationDelay: '0.5s', animationFillMode: 'forwards'}}>
                <img 
                  src={images[2]} 
                  alt="Special Moment 2" 
                  className="w-full h-72 object-cover" 
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3 text-pink-600 dark:text-pink-400">Unforgettable Moments</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    Every moment by your side becomes unforgettable. Your unique way of seeing the world, your determination, and your generous heart make any experience more special. I'm grateful for all the moments we've shared and for all those we'll share in the future.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Reasons Section */}
        <section id="reasons" className="py-16 px-4 min-h-screen flex flex-col justify-center bg-pink-50 dark:bg-gray-900">
          <h2 className="text-3xl font-bold mb-12 text-center text-pink-600 dark:text-pink-400 relative">
            Reasons To Admire You
            <span className="absolute bottom-[-10px] left-1/2 transform -translate-x-1/2 w-20 h-1 bg-pink-500 rounded-full"></span>
          </h2>
          
          <div className="max-w-2xl mx-auto space-y-4">
            {/* Reasons list */}
            <div className="flex items-center p-4 bg-white dark:bg-gray-700 rounded-xl shadow-md transform transition-all hover:scale-[1.01] opacity-0 animate-fadeIn" style={{animationDelay: '0.1s', animationFillMode: 'forwards'}}>
              <div className="flex-shrink-0 w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center mr-4 text-white font-bold">1</div>
              <div>
                <h3 className="text-lg font-bold text-pink-600 dark:text-pink-400">Your Smile</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  A smile that lights up any room and brightens everyone around. Your smile has the power to transform bad days into special moments.
                </p>
              </div>
            </div>
            
            <div className="flex items-center p-4 bg-white dark:bg-gray-700 rounded-xl shadow-md transform transition-all hover:scale-[1.01] opacity-0 animate-fadeIn" style={{animationDelay: '0.2s', animationFillMode: 'forwards'}}>
              <div className="flex-shrink-0 w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center mr-4 text-white font-bold">2</div>
              <div>
                <h3 className="text-lg font-bold text-pink-600 dark:text-pink-400">Your Intelligence</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  The way you think and solve problems is admirable. Your brilliant mind sees solutions where others only see obstacles.
                </p>
              </div>
            </div>
            
            <div className="flex items-center p-4 bg-white dark:bg-gray-700 rounded-xl shadow-md transform transition-all hover:scale-[1.01] opacity-0 animate-fadeIn" style={{animationDelay: '0.3s', animationFillMode: 'forwards'}}>
              <div className="flex-shrink-0 w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center mr-4 text-white font-bold">3</div>
              <div>
                <h3 className="text-lg font-bold text-pink-600 dark:text-pink-400">Your Heart</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  A heart full of love and compassion, always ready to help others and make a difference in the lives of those around you.
                </p>
              </div>
            </div>
            
            <div className="flex items-center p-4 bg-white dark:bg-gray-700 rounded-xl shadow-md transform transition-all hover:scale-[1.01] opacity-0 animate-fadeIn" style={{animationDelay: '0.4s', animationFillMode: 'forwards'}}>
              <div className="flex-shrink-0 w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center mr-4 text-white font-bold">4</div>
              <div>
                <h3 className="text-lg font-bold text-pink-600 dark:text-pink-400">Your Determination</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  When you set your mind to something, there's no obstacle that can stop you. Your willpower and perseverance are inspiring.
                </p>
              </div>
            </div>
            
            <div className="flex items-center p-4 bg-white dark:bg-gray-700 rounded-xl shadow-md transform transition-all hover:scale-[1.01] opacity-0 animate-fadeIn" style={{animationDelay: '0.5s', animationFillMode: 'forwards'}}>
              <div className="flex-shrink-0 w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center mr-4 text-white font-bold">5</div>
              <div>
                <h3 className="text-lg font-bold text-pink-600 dark:text-pink-400">Your Authenticity</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  You are genuinely yourself, without masks or pretensions. Your authenticity is rare and precious in today's world.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <section id="gallery" className="py-16 px-4 min-h-screen flex flex-col justify-center bg-white dark:bg-gray-800">
          <h2 className="text-3xl font-bold mb-12 text-center text-pink-600 dark:text-pink-400 relative">
            Memory Gallery
            <span className="absolute bottom-[-10px] left-1/2 transform -translate-x-1/2 w-20 h-1 bg-pink-500 rounded-full"></span>
          </h2>
          
          <div className="max-w-3xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((image, index) => (
                <div 
                  key={index}
                  className={`overflow-hidden rounded-lg shadow-lg ${index === 0 ? 'col-span-2 row-span-2 md:col-span-2 md:row-span-2' : ''} opacity-0 animate-fadeIn`} 
                  style={{
                    animationDelay: `${0.1 * index}s`,
                    animationFillMode: 'forwards'
                  }}
                >
                  <img 
                    src={image} 
                    alt={`Memory ${index + 1}`} 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" 
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final Message Section */}
        <section id="message" className="py-16 px-4 min-h-screen flex flex-col justify-center items-center bg-pink-50 dark:bg-gray-900">
          <h2 className="text-3xl font-bold mb-12 text-center text-pink-600 dark:text-pink-400 relative">
            Special Message
            <span className="absolute bottom-[-10px] left-1/2 transform -translate-x-1/2 w-20 h-1 bg-pink-500 rounded-full"></span>
          </h2>
          
          <div className="max-w-2xl mx-auto bg-white dark:bg-gray-700 rounded-xl p-8 shadow-xl opacity-0 animate-fadeIn" style={{animationDelay: '0.3s', animationFillMode: 'forwards'}}>
            <h3 className="text-2xl font-bold mb-6 text-pink-600 dark:text-pink-400 text-center">
              For You, On Your Special Day
            </h3>
            
            <div className="prose prose-pink dark:prose-invert max-w-none">
              {message.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="mt-8 text-center">
              <p className="text-pink-600 dark:text-pink-400 font-bold text-xl">
                Happy Birthday! &#10024;
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 bg-gradient-to-br from-pink-500 to-rose-400 text-white text-center">
          <p className="text-lg">With love ❤️</p>
        </footer>
      </div>

      {/* Custom animation styles */}
      <style jsx global>{`
        @keyframes fall {
          0% {
            transform: translateY(-10vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        
        .animate-confetti {
          animation: fall linear infinite;
        }

        @keyframes flicker {
          0% {
            box-shadow: 0 0 10px 5px rgba(255, 214, 94, 0.5);
            transform: scale(1.05);
          }
          100% {
            box-shadow: 0 0 15px 8px rgba(255, 214, 94, 0.7);
            transform: scale(1);
          }
        }

        .animate-flicker {
          animation: flicker 0.4s infinite alternate;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 1s ease-out;
        }
      `}</style>
    </div>
  );
};

export default BirthdayTemplate;