'use client';

import React, { useState, useEffect, useRef } from 'react';
import { formatDate } from '@/lib/utils';

const DeclarationTemplate = ({
  title,
  message,
  specialDate,
  youtubeLink = '',
  images = [],
  mode = 'view', // 'view' or 'preview'
  customTexts = {} // Adicionando propriedade customTexts
}) => {
  const defaultTexts = {
    headerTitle: 'Declaration of Love',
    headerQuote: 'Just as the stars are constant in the night sky, so is my love for you: eternal, bright, and guiding my way.',
    journeyTitle: 'Our Journey Among the Stars',
    universeTitle: 'The Universe of Our Love',
    universeSymbols: [
      { title: 'Loyalty', description: 'Like a distant star that remains constant, my loyalty to you will never waver.' },
      { title: 'Infinite Love', description: 'As vast as the universe itself, my love for you knows no limits or boundaries.' },
      { title: 'Destiny', description: 'Like celestial bodies drawn together by gravity, we were meant to find each other.' }
    ],
    songTitle: 'The Soundtrack of Our Love',
    songCaption: 'This melody speaks the words my heart cannot express',
    messageTitle: 'My Declaration of Love',
    signatureText: 'With all my love,',
    signatureName: 'Always Yours',
    promiseTitle: 'My Promise',
    promiseText: 'I promise to love you, to cherish you, and to stand by your side through all of life\'s adventures. Like the stars that light up the darkest night, I will be there to illuminate your path, forever and always.',
  };

  const texts = { ...defaultTexts, ...customTexts };
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isStarfieldActive, setIsStarfieldActive] = useState(true);
  const [showNova, setShowNova] = useState(false);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  
  // Auto-rotate images if there are more than 1
  useEffect(() => {
    if (images.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, [images.length]);
  
  // Starfield effect using Canvas
  useEffect(() => {
    if (!isStarfieldActive || !canvasRef.current || mode === 'preview') return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Create stars
    const stars = [];
    const numStars = 200;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    for (let i = 0; i < numStars; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * (canvas.width / 2) * 0.8;
      
      stars.push({
        x: Math.cos(angle) * distance + centerX,
        y: Math.sin(angle) * distance + centerY,
        radius: Math.random() * 2 + 0.5,
        color: `rgba(255, 255, 255, ${Math.random() * 0.8 + 0.2})`,
        speed: Math.random() * 0.2 + 0.1,
        angle: angle,
        distance: distance,
        twinkleSpeed: Math.random() * 0.03 + 0.01,
        twinklePhase: Math.random() * Math.PI * 2
      });
    }
    
    // Animation function
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw stars
      stars.forEach(star => {
        // Update twinkle
        star.twinklePhase += star.twinkleSpeed;
        const opacity = 0.5 + 0.5 * Math.sin(star.twinklePhase);
        
        // Draw star
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = star.color.replace(')', `, ${opacity})`).replace('rgba', 'rgba');
        ctx.fill();
        
        // Rotate star slightly
        star.angle += star.speed * 0.001;
        star.x = Math.cos(star.angle) * star.distance + centerX;
        star.y = Math.sin(star.angle) * star.distance + centerY;
      });
      
      // Draw nova effect
      if (showNova) {
        const novaRadius = 200;
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, novaRadius);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.2, 'rgba(255, 215, 140, 0.6)');
        gradient.addColorStop(0.4, 'rgba(255, 150, 100, 0.4)');
        gradient.addColorStop(0.6, 'rgba(200, 100, 255, 0.2)');
        gradient.addColorStop(1, 'rgba(50, 50, 200, 0)');
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, novaRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [isStarfieldActive, showNova, mode]);
  
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
      return `https://www.youtube.com/embed/${match[1]}?autoplay=${mode === 'preview' ? '0' : '1'}&mute=${mode === 'preview' ? '1' : '0'}`;
    }
    
    return '';
  };
  
  // Toggle starfield animation
  const toggleStarfield = () => {
    setIsStarfieldActive(!isStarfieldActive);
  };
  
  // Trigger nova effect
  const triggerNova = () => {
    setShowNova(true);
    setTimeout(() => setShowNova(false), 3000);
  };
  
  return (
    <div className={`min-h-screen flex flex-col ${mode === 'preview' ? 'scale-[0.6] origin-top' : ''}`}>
      {/* Starfield Canvas (Absolute positioned) */}
      {isStarfieldActive && mode !== 'preview' && (
        <canvas 
          ref={canvasRef} 
          className="fixed top-0 left-0 w-full h-full pointer-events-none z-10" 
          style={{ height: '100vh', width: '100vw' }}
        />
      )}
      
      {/* Header with title and cosmic background */}
      <header className="relative flex flex-col items-center justify-center px-4 py-24 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white overflow-hidden">
        <div className="absolute inset-0 overflow-hidden opacity-60">
          {/* Animated stars (background version) */}
          <div className="stars"></div>
          <div className="stars2"></div>
          <div className="stars3"></div>
        </div>
        
        {/* Toggle starfield animation button */}
        {mode !== 'preview' && (
          <div className="absolute top-4 right-4 flex space-x-2 z-20">
            <button 
              onClick={toggleStarfield}
              className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors backdrop-blur-sm"
              aria-label="Toggle stars animation"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </button>
            
            <button 
              onClick={triggerNova}
              className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors backdrop-blur-sm"
              aria-label="Trigger nova effect"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </button>
          </div>
        )}

        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center z-20 leading-tight">
          <span className="block text-blue-300 text-2xl md:text-3xl mb-2 font-normal">A Heartfelt</span>
          {texts.headerTitle}
        </h1>
        
        <h2 className="text-xl md:text-2xl font-medium text-center z-20 mb-4 max-w-2xl">
          {title}
        </h2>
        
        {formattedDate && (
          <div className="z-20 mt-2 inline-block backdrop-blur-sm bg-white/10 px-4 py-2 rounded-full">
            <p className="text-white/90">{formattedDate}</p>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-grow">
        {/* Cosmic quote section */}
        <section className="py-16 px-4 bg-gradient-to-b from-indigo-900 to-blue-900 text-white text-center">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              {/* Decorative star elements */}
              <span className="absolute -top-4 -left-4 text-yellow-300 text-2xl opacity-60">✦</span>
              <span className="absolute -bottom-4 -right-4 text-yellow-300 text-2xl opacity-60">✦</span>
              
              <blockquote className="text-xl md:text-2xl leading-relaxed font-medium italic">
                "{texts.headerQuote}"
              </blockquote>
            </div>
          </div>
        </section>
        
        {/* Image sequence with elegant design */}
        {images.length > 0 && (
          <section className="py-16 px-4 bg-gradient-to-b from-blue-900 to-black">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-2xl md:text-3xl font-semibold text-center mb-10 text-white">
                {texts.journeyTitle}
              </h3>
              
              <div className="relative overflow-hidden rounded-2xl shadow-[0_0_30px_rgba(147,197,253,0.3)]">
                <div className="aspect-w-16 aspect-h-9 bg-gray-100 dark:bg-gray-800">
                  <img
                    src={images[currentImageIndex]}
                    alt={`Our journey moment ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Overlay with cosmic gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 via-transparent to-transparent"></div>
                </div>
                
                {/* Image navigation buttons (if more than 1 image) */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={goToPrevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-colors backdrop-blur-sm"
                      aria-label="Previous image"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={goToNextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-colors backdrop-blur-sm"
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
                
                {/* Image caption */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <p className="text-lg font-medium">Our Constellation: Memory {currentImageIndex + 1}</p>
                </div>
              </div>
            </div>
          </section>
        )}
        
        {/* Cosmic symbols for our relationship */}
        <section className="py-16 px-4 bg-black text-white">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-semibold text-center mb-10">
              {texts.universeTitle}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Symbol 1 */}
              {texts.universeSymbols.map((symbol, index) => {
                const colors = [
                  { bg: 'bg-blue-900/40', icon: 'bg-blue-500/20', text: 'text-blue-300', desc: 'text-blue-100/80' },
                  { bg: 'bg-purple-900/40', icon: 'bg-purple-500/20', text: 'text-purple-300', desc: 'text-purple-100/80' },
                  { bg: 'bg-indigo-900/40', icon: 'bg-indigo-500/20', text: 'text-indigo-300', desc: 'text-indigo-100/80' }
                ][index % 3];
                
                const icons = [
                  <svg key={1} className="w-10 h-10 text-blue-300" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>,
                  <svg key={2} className="w-10 h-10 text-purple-300" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>,
                  <svg key={3} className="w-10 h-10 text-indigo-300" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                ][index % 3];
                
                return (
                  <div key={index} className={`${colors.bg} backdrop-blur-sm rounded-xl p-6 transform transition-transform hover:scale-105`}>
                    <div className="flex flex-col items-center text-center">
                      <div className={`w-16 h-16 rounded-full ${colors.icon} flex items-center justify-center mb-4`}>
                        {icons}
                      </div>
                      <h4 className={`text-xl font-bold mb-2 ${colors.text}`}>{symbol.title}</h4>
                      <p className={colors.desc}>
                        {symbol.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* YouTube video (if provided) */}
        {youtubeLink && getYoutubeEmbedUrl() && (
          <section className="py-16 px-4 bg-gradient-to-b from-black to-blue-900">
            <div className="max-w-3xl mx-auto">
              <h3 className="text-2xl md:text-3xl font-semibold text-center mb-8 text-white">
                {texts.songTitle}
              </h3>
              
              <div className="relative rounded-xl overflow-hidden shadow-[0_0_30px_rgba(147,197,253,0.3)]">
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
              
              <div className="mt-6 text-center text-white/80 italic">
                <p>{texts.songCaption}</p>
              </div>
            </div>
          </section>
        )}

        {/* Declaration message with cosmic design */}
        <section className="py-16 px-4 bg-gradient-to-b from-blue-900 to-indigo-900 text-white">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-semibold text-center mb-12">
              {texts.messageTitle}
            </h3>
            
            <div className="relative">
              {/* Decorative elements */}
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-blue-500/10 rounded-full blur-xl"></div>
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-purple-500/10 rounded-full blur-xl"></div>
              
              <div className="relative bg-gradient-to-br from-blue-900/60 to-purple-900/60 backdrop-blur-md shadow-xl rounded-xl p-8 md:p-10 border border-white/10">
                <div className="prose prose-invert max-w-none">
                  {message.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 last:mb-0 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
                
                {/* Signature area */}
                <div className="mt-10 flex justify-end">
                  <div className="text-right">
                    <p className="text-lg font-medium italic">{texts.signatureText}</p>
                    <p className="text-xl font-script mt-2">{texts.signatureName}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Promise seal section */}
        <section className="py-16 px-4 bg-black text-white">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-6">
              <div className="inline-block p-6 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center shadow-[0_0_20px_rgba(147,197,253,0.5)]">
                  <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"></path>
                  </svg>
                </div>
              </div>
            </div>
            
            <h3 className="text-2xl md:text-3xl font-semibold mb-4">{texts.promiseTitle}</h3>
            <p className="text-lg text-white/80">
              {texts.promiseText}
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-6">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-white/80">Made with love on BirthdayLove.site</p>
          <div className="mt-2 text-blue-300 text-sm">
            <span className="mx-1">✦</span>
            <span className="mx-1">✧</span>
            <span className="mx-1">✦</span>
          </div>
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
          z-index: 1;
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
          z-index: 1;
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
          z-index: 1;
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
        
        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(147, 197, 253, 0.5);
          }
          50% {
            box-shadow: 0 0 40px rgba(147, 197, 253, 0.8);
          }
        }
        
        .font-script {
          font-family: 'Dancing Script', cursive, var(--font-playfair);
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