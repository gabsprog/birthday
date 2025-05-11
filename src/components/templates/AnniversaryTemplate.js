'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  const [animateHearts, setAnimateHearts] = useState(false);
  const canvasRef = useRef(null);
  const heartAnimationRef = useRef(null);
  
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
  
  // Heart animation using Canvas
  useEffect(() => {
    if (!animateHearts || !canvasRef.current || mode === 'preview') return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const W = window.innerWidth;
    const H = canvas.height;
    
    canvas.width = W;
    
    // Heart particles
    const hearts = [];
    const colors = ['#ff5e8d', '#ff8da8', '#e11b5c', '#de437a', '#b20837', '#FF9ACD'];
    
    // Create initial hearts
    for (let i = 0; i < 50; i++) {
      hearts.push({
        x: Math.random() * W,
        y: H + Math.random() * 100,
        size: Math.random() * 20 + 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: Math.random() * 2 + 1,
        rotation: Math.random() * 90,
        rotationSpeed: (Math.random() - 0.5) * 2,
        opacity: Math.random() * 0.5 + 0.5
      });
    }
    
    // Draw heart shape
    function drawHeart(x, y, size, rotation) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation * Math.PI / 180);
      
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(
        -size/2, -size/2,
        -size, -size/4,
        0, size
      );
      ctx.bezierCurveTo(
        size, -size/4,
        size/2, -size/2,
        0, 0
      );
      ctx.closePath();
      
      ctx.restore();
    }
    
    // Animation function
    function animate() {
      ctx.clearRect(0, 0, W, H);
      
      hearts.forEach((heart, i) => {
        ctx.save();
        ctx.globalAlpha = heart.opacity;
        ctx.fillStyle = heart.color;
        
        drawHeart(heart.x, heart.y, heart.size, heart.rotation);
        ctx.fill();
        ctx.restore();
        
        // Move hearts upward
        heart.y -= heart.speed;
        heart.rotation += heart.rotationSpeed;
        
        // Reset if out of screen
        if (heart.y < -heart.size * 2) {
          hearts[i] = {
            x: Math.random() * W,
            y: H + Math.random() * 100,
            size: Math.random() * 20 + 10,
            color: colors[Math.floor(Math.random() * colors.length)],
            speed: Math.random() * 2 + 1,
            rotation: Math.random() * 90,
            rotationSpeed: (Math.random() - 0.5) * 2,
            opacity: Math.random() * 0.5 + 0.5
          };
        }
      });
      
      heartAnimationRef.current = requestAnimationFrame(animate);
    }
    
    animate();
    
    // Cleanup
    return () => {
      if (heartAnimationRef.current) {
        cancelAnimationFrame(heartAnimationRef.current);
      }
    };
  }, [animateHearts, mode]);
  
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
      return `https://www.youtube.com/embed/${match[1]}?autoplay=${mode === 'preview' ? '0' : '1'}&mute=${mode === 'preview' ? '1' : '0'}`;
    }
    
    return '';
  };
  
  // Toggle heart animation
  const toggleHeartAnimation = () => {
    setAnimateHearts(!animateHearts);
  };
  
  return (
    <div className={`min-h-screen flex flex-col ${mode === 'preview' ? 'scale-[0.6] origin-top' : ''}`}>
      {/* Heart Canvas (Absolute positioned) */}
      {animateHearts && mode !== 'preview' && (
        <canvas 
          ref={canvasRef} 
          className="fixed top-0 left-0 w-full h-full pointer-events-none z-50" 
          style={{ height: '100vh', width: '100vw' }}
        />
      )}
      
      {/* Header with title and floating hearts animation */}
      <header className="relative flex flex-col items-center justify-center px-4 py-20 bg-gradient-to-br from-red-400 via-purple-400 to-indigo-400 text-white overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          {/* Animated hearts elements */}
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-float"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5 + 0.3,
                animationDuration: `${Math.random() * 8 + 8}s`,
                animationDelay: `${Math.random() * 5}s`,
                transform: `scale(${Math.random() * 0.5 + 0.7})`,
              }}
            >
              <svg
                className="w-10 h-10 text-white/80"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
          ))}
        </div>

        {/* Toggle heart animation button */}
        {mode !== 'preview' && (
          <button 
            onClick={toggleHeartAnimation}
            className="absolute top-4 right-4 bg-white/30 hover:bg-white/50 text-white p-2 rounded-full transition-colors z-10"
            aria-label="Toggle heart animation"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </button>
        )}

        <div className="text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            <span className="text-white/80">Our</span> Anniversary
          </h1>
          <h2 className="text-xl md:text-2xl font-medium text-center">
            {title}
          </h2>
          
          <div className="mt-4 inline-block relative">
            <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-lg">
              {formattedDate && (
                <p className="text-lg text-white/95">Anniversary: {formattedDate}</p>
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 w-full h-full border border-white/30 rounded-lg"></div>
          </div>
        </div>
      </header>

      {/* Time counter section with enhanced visual design */}
      {timeDifference && (
        <div className="py-12 px-4 bg-gradient-to-r from-red-50 to-purple-50 dark:from-red-900/20 dark:to-purple-900/20">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-semibold text-center mb-8">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-purple-500">
                Time Together
              </span>
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {timeDifference.years > 0 && (
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-purple-500 opacity-70 blur-xl rounded-xl transform group-hover:scale-105 transition-transform"></div>
                  <div className="flex flex-col items-center relative bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
                    <span className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-purple-500">
                      {timeDifference.years}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400 text-sm md:text-base font-medium mt-2">
                      {timeDifference.years === 1 ? 'Year' : 'Years'}
                    </span>
                  </div>
                </div>
              )}
              
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-400 to-red-500 opacity-70 blur-xl rounded-xl transform group-hover:scale-105 transition-transform"></div>
                <div className="flex flex-col items-center relative bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
                  <span className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-red-500">
                    {timeDifference.months}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 text-sm md:text-base font-medium mt-2">
                    {timeDifference.months === 1 ? 'Month' : 'Months'}
                  </span>
                </div>
              </div>
              
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-indigo-500 opacity-70 blur-xl rounded-xl transform group-hover:scale-105 transition-transform"></div>
                <div className="flex flex-col items-center relative bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
                  <span className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-indigo-500">
                    {timeDifference.days}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 text-sm md:text-base font-medium mt-2">
                    {timeDifference.days === 1 ? 'Day' : 'Days'}
                  </span>
                </div>
              </div>
              
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-blue-500 opacity-70 blur-xl rounded-xl transform group-hover:scale-105 transition-transform"></div>
                <div className="flex flex-col items-center relative bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
                  <span className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-blue-500">
                    {timeDifference.totalDays}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 text-sm md:text-base font-medium mt-2">
                    Total Days
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Journey Timeline Section */}
      <section className="py-16 px-4 bg-white dark:bg-gray-800">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-2xl md:text-3xl font-semibold text-center mb-12">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-purple-500">
              Our Journey Together
            </span>
          </h3>
          
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 md:left-1/2 transform md:-translate-x-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-red-300 via-purple-300 to-blue-300 dark:from-red-900 dark:via-purple-900 dark:to-blue-900"></div>
            
            {/* Timeline items */}
            <div className="space-y-12">
              {/* First meeting */}
              <div className="relative">
                <div className="flex flex-col md:flex-row items-center">
                  <div className="md:w-1/2 flex md:justify-end mb-8 md:mb-0 md:pr-8">
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg shadow-md max-w-md">
                      <h4 className="text-lg font-bold text-red-600 dark:text-red-400 mb-2">First Meeting</h4>
                      <p className="text-gray-700 dark:text-gray-300">
                        The day our paths crossed for the first time. It was the beginning of a beautiful journey.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center z-10 md:absolute md:left-1/2 md:transform md:-translate-x-1/2">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white shadow-lg">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="md:w-1/2 md:pl-8">
                    {/* Empty on first timeline item for left side layout */}
                  </div>
                </div>
              </div>
              
              {/* First date */}
              <div className="relative">
                <div className="flex flex-col md:flex-row items-center">
                  <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
                    {/* Empty on second timeline item for right side layout */}
                  </div>
                  <div className="flex items-center justify-center z-10 md:absolute md:left-1/2 md:transform md:-translate-x-1/2">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white shadow-lg">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="md:w-1/2 md:pl-8">
                    <div className="bg-pink-50 dark:bg-pink-900/20 p-4 rounded-lg shadow-md max-w-md">
                      <h4 className="text-lg font-bold text-pink-600 dark:text-pink-400 mb-2">First Date</h4>
                      <p className="text-gray-700 dark:text-gray-300">
                        The butterflies, the excitement, the conversations that seemed to never end.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Official relationship */}
              <div className="relative">
                <div className="flex flex-col md:flex-row items-center">
                  <div className="md:w-1/2 flex md:justify-end mb-8 md:mb-0 md:pr-8">
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg shadow-md max-w-md">
                      <h4 className="text-lg font-bold text-purple-600 dark:text-purple-400 mb-2">Official Relationship</h4>
                      <p className="text-gray-700 dark:text-gray-300">
                        The day we decided to commit to each other, beginning this beautiful journey together.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center z-10 md:absolute md:left-1/2 md:transform md:-translate-x-1/2">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white shadow-lg">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                  </div>
                  <div className="md:w-1/2 md:pl-8">
                    {/* Empty on third timeline item for left side layout */}
                  </div>
                </div>
              </div>
              
              {/* Special Milestone */}
              <div className="relative">
                <div className="flex flex-col md:flex-row items-center">
                  <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
                    {/* Empty on fourth timeline item for right side layout */}
                  </div>
                  <div className="flex items-center justify-center z-10 md:absolute md:left-1/2 md:transform md:-translate-x-1/2">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </div>
                  </div>
                  <div className="md:w-1/2 md:pl-8">
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg shadow-md max-w-md">
                      <h4 className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mb-2">Special Milestone</h4>
                      <p className="text-gray-700 dark:text-gray-300">
                        A significant moment that made our bond even stronger. The journey continues with love growing each day.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Image carousel with enhanced interaction */}
      {images.length > 0 && (
        <section className="py-16 px-4 bg-gradient-to-r from-red-50 to-purple-50 dark:from-red-900/20 dark:to-purple-900/20">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-semibold text-center mb-8">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-purple-500">
                Our Special Moments
              </span>
            </h3>
            
            <div className="relative overflow-hidden rounded-xl shadow-2xl">
              <div className="aspect-w-16 aspect-h-9 bg-gray-100 dark:bg-gray-800">
                <img
                  src={images[currentImageIndex]}
                  alt={`Special moment ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover transition-opacity duration-500"
                />
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-70"></div>
              </div>
              
              {/* Image navigation buttons (if more than 1 image) */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={goToPrevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 text-white rounded-full p-3 transition-colors backdrop-blur-sm"
                    aria-label="Previous image"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={goToNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 text-white rounded-full p-3 transition-colors backdrop-blur-sm"
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
                        className={`w-3 h-3 rounded-full transition-colors ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                        aria-label={`Go to image ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
              
              {/* Image caption */}
              <div className="absolute bottom-0 left-0 right-0 px-6 py-4 text-white">
                <p className="text-lg font-medium">Memory #{currentImageIndex + 1}</p>
              </div>
            </div>
            
            {/* Thumbnail preview */}
            {images.length > 1 && (
              <div className="mt-4 flex justify-center gap-2 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-16 h-16 flex-shrink-0 rounded-md overflow-hidden border-2 transition-all ${
                      index === currentImageIndex 
                        ? 'border-red-500 scale-110 shadow-lg' 
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img 
                      src={image} 
                      alt={`Thumbnail ${index + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* YouTube video (if provided) */}
      {youtubeLink && getYoutubeEmbedUrl() && (
        <section className="py-16 px-4 bg-white dark:bg-gray-800">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-semibold text-center mb-8">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-purple-500">
                Our Special Song
              </span>
            </h3>
            
            <div className="relative rounded-xl overflow-hidden shadow-2xl">
              <div className="aspect-w-16 aspect-h-9">
                <iframe
                  src={getYoutubeEmbedUrl()}
                  title="YouTube video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Anniversary message */}
      <section className="py-16 px-4 bg-gradient-to-r from-red-50 to-purple-50 dark:from-red-900/20 dark:to-purple-900/20">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-2xl md:text-3xl font-semibold text-center mb-8">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-purple-500">
              Anniversary Message
            </span>
          </h3>
          
          <div className="relative">
            {/* Decorative elements */}
            <div className="absolute -top-6 -left-6 w-20 h-20 bg-red-200 dark:bg-red-900/30 rounded-full blur-xl opacity-70"></div>
            <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-purple-200 dark:bg-purple-900/30 rounded-full blur-xl opacity-70"></div>
            
            <div className="relative bg-white dark:bg-gray-800 shadow-xl rounded-xl p-8 md:p-10 overflow-hidden">
              <div className="prose dark:prose-invert max-w-none">
                {message.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 last:mb-0 text-gray-700 dark:text-gray-300 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
          
          {/* Heart animation at the bottom */}
          <div className="mt-12 text-center">
            <div className="inline-block">
              <div className="text-6xl animate-pulse">
                ❤️
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-red-400 via-purple-500 to-indigo-500 text-white py-6">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-lg font-medium">Happy Anniversary!</p>
          <p className="text-sm mt-2 opacity-80">Created with love on BirthdayLove.site</p>
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