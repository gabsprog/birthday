'use client';

import React, { useState, useEffect, useRef } from 'react';
import { formatDate } from '@/lib/utils';

const BirthdayCake = ({ age = '', customStyles = {} }) => {
  const defaultStyles = {
    containerWidth: '220px',
    containerHeight: '250px',

    numberColor: '#ff4081',
    numberSize: '64px',
    numberShadow: '2px 2px 5px rgba(0,0,0,0.2)',

    bottomLayerGradient: 'linear-gradient(90deg, #ffccd5, #ffc3e0)',
    bottomLayerWidth: '180px',
    bottomLayerHeight: '40px',

    middleLayerGradient: 'linear-gradient(90deg, #ffe0ec, #ffd4e5)',
    middleLayerWidth: '160px',
    middleLayerHeight: '40px',

    topLayerGradient: 'linear-gradient(90deg, #fff0f5, #ffeaf3)',
    topLayerWidth: '140px',
    topLayerHeight: '40px',

    candleColor: 'linear-gradient(to top, #ff80ab, #ff4081)',
    candleWidth: '8px',
    candleHeight: '40px',
    flameColor: 'gold',
    flameShadow: '0 0 8px 4px rgba(255, 215, 0, 0.6)',

    flickerAnimation: 'flicker 0.4s infinite alternate',
  };

  const styles = { ...defaultStyles, ...customStyles };

  const numberOfCandles = age === '?' ? 3 : Math.min(parseInt(age), 5);

  const candlePositions = [
    { left: 'calc(50% - 25px)' },
    { left: 'calc(50%)' },
    { left: 'calc(50% + 25px)' },
    { left: 'calc(50% - 40px)' },
    { left: 'calc(50% + 40px)' },
  ];

  const top = parseInt(styles.topLayerHeight);
  const mid = parseInt(styles.middleLayerHeight);
  const bot = parseInt(styles.bottomLayerHeight);

  return (
    <div className="cake-container relative w-64 h-64 my-8 mx-auto text-center">
      {/* Age Number */}
      <div
        className="number-fifteen absolute top-[-50px] left-1/2 transform -translate-x-1/2 font-bold"
        style={{
          fontSize: styles.numberSize,
          color: styles.numberColor,
          textShadow: styles.numberShadow,
        }}
      >
        {age}
      </div>

      {/* Cake Structure */}
      <div className="cake absolute bottom-8 left-1/2 transform -translate-x-1/2">
        {/* Bottom Layer */}
        <div
          className="cake-layer bottom-layer absolute rounded-t-lg shadow-lg"
          style={{
            background: styles.bottomLayerGradient,
            width: styles.bottomLayerWidth,
            height: styles.bottomLayerHeight,
            bottom: 0,
            left: `calc(50% - ${parseInt(styles.bottomLayerWidth) / 2}px)`,
            zIndex: 1,
          }}
        ></div>

        {/* Middle Layer */}
        <div
          className="cake-layer middle-layer absolute rounded-t-lg shadow-lg"
          style={{
            background: styles.middleLayerGradient,
            width: styles.middleLayerWidth,
            height: styles.middleLayerHeight,
            bottom: `${bot}px`,
            left: `calc(50% - ${parseInt(styles.middleLayerWidth) / 2}px)`,
            zIndex: 2,
          }}
        ></div>

        {/* Top Layer */}
        <div
          className="cake-layer top-layer absolute rounded-t-lg shadow-lg"
          style={{
            background: styles.topLayerGradient,
            width: styles.topLayerWidth,
            height: styles.topLayerHeight,
            bottom: `${bot + mid}px`,
            left: `calc(50% - ${parseInt(styles.topLayerWidth) / 2}px)`,
            zIndex: 3,
          }}
        ></div>

        {/* Plate */}
        <div
          className="plate absolute w-56 h-4 bg-gray-200 rounded-full shadow-md"
          style={{
            bottom: '-10px',
            left: `calc(50% - 112px)`, // 224 / 2
          }}
        ></div>
      </div>

      {/* Candles */}
      {Array.from({ length: numberOfCandles }).map((_, i) => (
        <div
          key={i}
          className="candle absolute"
          style={{
            width: styles.candleWidth,
            height: styles.candleHeight,
            background: styles.candleColor,
            bottom: `${bot + mid + top + 40}px`,
            left: candlePositions[i].left,
            borderRadius: '4px',
            zIndex: 10,
            animation: styles.flickerAnimation,
          }}
        >
          {/* Flame */}
          <div
            className="flame absolute w-3 h-3 rounded-full"
            style={{
              top: '-10px',
              left: '-2px',
              background: styles.flameColor,
              boxShadow: styles.flameShadow,
              animation: 'flicker 0.4s infinite alternate',
              animationDelay: `${i * 0.1}s`,
            }}
          ></div>
        </div>
      ))}

      {/* Flicker Animation */}
      <style jsx>{`
        @keyframes flicker {
          0% {
            box-shadow: 0 0 10px 5px rgba(255, 214, 94, 0.5);
            transform: scale(1.1);
          }
          100% {
            box-shadow: 0 0 15px 8px rgba(255, 214, 94, 0.7);
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

// Main Birthday Template Component
const BirthdayTemplate = ({ 
  title, 
  message, 
  specialDate, 
  youtubeLink = '', 
  images = [],
  mode = 'view', // 'view' or 'preview'
  customTexts = {} // Add this prop to accept custom texts
}) => {
  // Default texts that will be overridden by customTexts if provided
  const defaultTexts = {
    headerTitle: 'Happy Birthday!',
    aboutSectionTitle: 'About You',
    favoritesSectionTitle: 'What I Love About You',
    gallerySectionTitle: 'Memory Gallery',
    messageSectionTitle: 'Birthday Message',
    buttonText: 'Click For Birthday Surprise',
    footerText: 'Made with love',
    customAge: '',
    // Default cake styles
    cakeStyles: {
      // These can all be overridden by the user
      bottomLayerGradient: 'linear-gradient(90deg, #ffccd5, #ffc3e0)',
      middleLayerGradient: 'linear-gradient(90deg, #ffe0ec, #ffd4e5)',
      topLayerGradient: 'linear-gradient(90deg, #fff0f5, #ffeaf3)',
      numberColor: '#ff4081',
      candleColor: 'linear-gradient(to top, #ff80ab, #ff4081)',
    },
    favorites: [
      { title: 'Your Smile', description: 'A smile that lights up any room and brightens everyone around. Your smile has the power to transform bad days into special moments.' },
      { title: 'Your Intelligence', description: 'The way you think and solve problems is admirable. Your brilliant mind sees solutions where others only see obstacles.' },
      { title: 'Your Heart', description: 'A heart full of love and compassion, always ready to help others and make a difference in the lives of those around you.' },
      { title: 'Your Determination', description: 'When you set your mind to something, there\'s no obstacle that can stop you. Your willpower and perseverance are inspiring.' },
      { title: 'Your Authenticity', description: 'You are genuinely yourself, without masks or pretensions. Your authenticity is rare and precious in today\'s world.' }
    ],
    aboutCards: [
      { title: 'Amazing Person ❤️', description: 'You are the most incredible person I\'ve ever met. A life journey marked by achievements, smiles, and special moments. Your presence brightens any room, and your smile can transform the gloomiest days into colorful ones.' },
      { title: 'Our Story', description: 'From the very first moment, I knew you were special. The way we met, every moment together, every shared laugh. We\'ve built memories that I\'ll cherish forever.' },
      { title: 'Unforgettable Moments', description: 'Every moment by your side becomes unforgettable. Your unique way of seeing the world, your determination, and your generous heart make any experience more special.' }
    ]
  };
  
  // Merge custom texts with default texts
  const texts = { ...defaultTexts, ...customTexts };
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [hiddenContent, setHiddenContent] = useState(mode === 'preview' ? false : true);
  const [showConfetti, setShowConfetti] = useState(false);
  const canvasRef = useRef(null);
  const confettiAnimationRef = useRef(null);
  
  // Get age from specialDate if provided
  const getAge = () => {
    // Se há uma idade personalizada definida, use-a
    if (texts.customAge) {
        return texts.customAge;
    }

    // Caso contrário, calcule a partir da data
    if (!specialDate) return '?';
    const birthDate = new Date(specialDate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age;
  };
  
  // Auto-rotate images if there are more than 1
  useEffect(() => {
    if (images.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, [images.length]);
  
  // Handle canvas confetti animation
  useEffect(() => {
    if (!showConfetti || !canvasRef.current || mode === 'preview') return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const W = window.innerWidth;
    const H = canvas.height;
    
    canvas.width = W;
    
    // Confetti particles
    const particles = [];
    const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', 
                    '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4CAF50', 
                    '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722'];
    
    // Create initial particles
    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * W, // x-coordinate
        y: Math.random() * H / 2, // y-coordinate
        r: Math.random() * 5 + 2, // radius
        d: Math.random() * 5 + 2, // density
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.floor(Math.random() * 10) - 10,
        tick: 0,
        totalTicks: Math.random() * 100 + 100,
        shape: Math.random() > 0.5 ? 'circle' : 'square'
      });
    }
    
    // Animation function
    function draw() {
      ctx.clearRect(0, 0, W, H);
      
      particles.forEach((p, i) => {
        ctx.beginPath();
        
        if (p.shape === 'circle') {
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2, false);
        } else {
          ctx.rect(p.x, p.y, p.r * 2, p.r * 2);
        }
        
        ctx.fillStyle = p.color;
        ctx.fill();
        
        // Move particles
        p.y += p.d;
        p.tilt += p.d / 2;
        p.tick++;
        
        // Reset if out of screen or reached max ticks
        if (p.y > H || p.tick > p.totalTicks) {
          particles[i] = {
            x: Math.random() * W,
            y: -20,
            r: p.r,
            d: p.d,
            color: colors[Math.floor(Math.random() * colors.length)],
            tilt: Math.floor(Math.random() * 10) - 10,
            tick: 0,
            totalTicks: p.totalTicks,
            shape: Math.random() > 0.5 ? 'circle' : 'square'
          };
        }
      });
      
      confettiAnimationRef.current = requestAnimationFrame(draw);
    }
    
    draw();
    
    // Cleanup
    return () => {
      if (confettiAnimationRef.current) {
        cancelAnimationFrame(confettiAnimationRef.current);
      }
    };
  }, [showConfetti, mode]);
  
  // Handle manual navigation for image carousel
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
        setShowConfetti(true);
        
        // Scroll to hidden content after revealing
        setTimeout(() => {
            const content = document.getElementById('hiddenBirthdayContent');
            if (content) content.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };
  
  return (
    <div className={`${mode === 'preview' ? 'scale-[0.6] origin-top' : ''}`}>
      {/* Confetti Canvas (Absolute positioned) */}
      {showConfetti && mode !== 'preview' && (
        <canvas 
          ref={canvasRef} 
          className="fixed top-0 left-0 w-full h-full pointer-events-none z-50" 
          style={{ height: '100vh', width: '100vw' }}
        />
      )}
      
      {/* Birthday Header */}
      <header className="relative flex flex-col items-center justify-center px-4 py-20 bg-gradient-to-br from-pink-500 to-rose-400 text-white min-h-screen overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          {/* Animated confetti elements (Background version) */}
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
          {texts.headerTitle}
        </h1>
        <h2 className="text-xl md:text-2xl font-medium text-center z-10">
          {title}
        </h2>
        {formattedDate && (
          <p className="mt-2 text-center text-white/80 z-10">{formattedDate}</p>
        )}

        {/* Use the new cake component */}
        <BirthdayCake age={getAge()} customStyles={texts.cakeStyles} />

        {/* Surprise button */}
        {hiddenContent && mode !== 'preview' && (
          <button 
            onClick={handleSurpriseClick}
            className="mt-6 py-3 px-6 bg-white text-pink-500 font-bold rounded-full shadow-lg transition-all hover:transform hover:-translate-y-1 hover:shadow-xl animate-pulse"
          >
            {texts.buttonText}
          </button>
        )}
      </header>

      {/* Hidden content that appears after clicking the button */}
      <div id="hiddenBirthdayContent" className={hiddenContent && mode !== 'preview' ? 'hidden' : 'block'}>
        {/* Fixed Navigation Menu */}
        {mode !== 'preview' && (
          <nav className="fixed bottom-0 left-0 w-full bg-white/95 dark:bg-gray-800/95 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] z-40 flex justify-around py-3 backdrop-blur-sm">
            <a href="#top" className="flex flex-col items-center text-pink-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-xs mt-1">Home</span>
            </a>
            <a href="#music" className="flex flex-col items-center text-pink-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
              <span className="text-xs mt-1">Music</span>
            </a>
            <a href="#about" className="flex flex-col items-center text-pink-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-xs mt-1">About</span>
            </a>
            <a href="#favorites" className="flex flex-col items-center text-pink-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="text-xs mt-1">Favorites</span>
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
            {texts.aboutSectionTitle}
            <span className="absolute bottom-[-10px] left-1/2 transform -translate-x-1/2 w-20 h-1 bg-pink-500 rounded-full"></span>
          </h2>
          
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Dynamic Cards from customTexts.aboutCards */}
            {texts.aboutCards && texts.aboutCards.map((card, index) => (
              index < images.length ? (
                <div key={index} className="bg-white dark:bg-gray-700 rounded-xl overflow-hidden shadow-xl transform transition-all hover:scale-[1.01] opacity-0 animate-fadeIn" style={{animationDelay: `${0.1 * (index + 1)}s`, animationFillMode: 'forwards'}}>
                  <div className="relative">
                    <img 
                      src={images[index]} 
                      alt={`Special Moment ${index + 1}`} 
                      className="w-full h-96 object-cover" 
                    />
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-3 text-pink-600 dark:text-pink-400">{card.title}</h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </div>
              ) : (
                <div key={index} className="bg-white dark:bg-gray-700 rounded-xl overflow-hidden shadow-xl transform transition-all hover:scale-[1.01] opacity-0 animate-fadeIn" style={{animationDelay: `${0.1 * (index + 1)}s`, animationFillMode: 'forwards'}}>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-3 text-pink-600 dark:text-pink-400">{card.title}</h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </div>
              )
            ))}
          </div>
        </section>

        {/* Favorites Section */}
        <section id="favorites" className="py-16 px-4 min-h-screen flex flex-col justify-center bg-pink-50 dark:bg-gray-900">
          <h2 className="text-3xl font-bold mb-12 text-center text-pink-600 dark:text-pink-400 relative">
            {texts.favoritesSectionTitle}
            <span className="absolute bottom-[-10px] left-1/2 transform -translate-x-1/2 w-20 h-1 bg-pink-500 rounded-full"></span>
          </h2>
          
          <div className="max-w-2xl mx-auto space-y-4">
            {/* Favorites list from customTexts.favorites */}
            {texts.favorites && texts.favorites.map((favorite, index) => (
              <div key={index} className="flex items-center p-4 bg-white dark:bg-gray-700 rounded-xl shadow-md transform transition-all hover:scale-[1.01] opacity-0 animate-fadeIn" style={{animationDelay: `${0.1 * (index + 1)}s`, animationFillMode: 'forwards'}}>
                <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center mr-4 text-white font-bold shadow-md">{index + 1}</div>
                <div>
                  <h3 className="text-lg font-bold text-pink-600 dark:text-pink-400">{favorite.title}</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {favorite.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Gallery Section */}
        <section id="gallery" className="py-16 px-4 min-h-screen flex flex-col justify-center bg-white dark:bg-gray-800">
          <h2 className="text-3xl font-bold mb-12 text-center text-pink-600 dark:text-pink-400 relative">
            {texts.gallerySectionTitle}
            <span className="absolute bottom-[-10px] left-1/2 transform -translate-x-1/2 w-20 h-1 bg-pink-500 rounded-full"></span>
          </h2>
          
          <div className="max-w-3xl mx-auto">
            {images.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((image, index) => (
                  <div 
                    key={index}
                    className={`group overflow-hidden rounded-lg shadow-lg ${index === 0 ? 'col-span-2 row-span-2 md:col-span-2 md:row-span-2' : ''} opacity-0 animate-fadeIn`} 
                    style={{
                      animationDelay: `${0.1 * index}s`,
                      animationFillMode: 'forwards'
                    }}
                  >
                    <div className="relative h-full w-full overflow-hidden">
                      <img 
                        src={image} 
                        alt={`Memory ${index + 1}`} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                        <p className="text-white p-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                          Special Memory #{index + 1}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400">
                <p>Add images to create a beautiful memory gallery</p>
              </div>
            )}
          </div>
        </section>

        {/* Final Message Section */}
        <section id="message" className="py-16 px-4 min-h-screen flex flex-col justify-center items-center bg-pink-50 dark:bg-gray-900">
          <h2 className="text-3xl font-bold mb-12 text-center text-pink-600 dark:text-pink-400 relative">
            {texts.messageSectionTitle}
            <span className="absolute bottom-[-10px] left-1/2 transform -translate-x-1/2 w-20 h-1 bg-pink-500 rounded-full"></span>
          </h2>
          
          <div className="max-w-2xl mx-auto bg-white dark:bg-gray-700 rounded-xl p-8 shadow-xl opacity-0 animate-fadeIn" style={{animationDelay: '0.3s', animationFillMode: 'forwards'}}>
            <div className="relative">
              {/* Decorative elements */}
              <div className="absolute -top-6 -left-6 w-12 h-12 bg-pink-200 dark:bg-pink-900/30 rounded-full opacity-70"></div>
              <div className="absolute -bottom-6 -right-6 w-12 h-12 bg-purple-200 dark:bg-purple-900/30 rounded-full opacity-70"></div>
              
              <h3 className="text-2xl font-bold mb-6 text-pink-600 dark:text-pink-400 text-center">
                For You, On Your Special Day
              </h3>
              
              <div className="prose prose-pink dark:prose-invert max-w-none relative">
                {message.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>

              <div className="mt-8 text-center">
                <p className="text-pink-600 dark:text-pink-400 font-bold text-xl">
                  {texts.headerTitle} &#10024;
                </p>
              </div>
            </div>
          </div>
          
          {/* Birthday cake emoji animation */}
          <div className="mt-16 relative">
            <div className="text-6xl animate-bounce">
              🎂
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 bg-gradient-to-br from-pink-500 to-rose-400 text-white text-center">
          <p className="text-lg">{texts.footerText} ❤️</p>
          <p className="text-sm mt-2 opacity-80">Created on BirthdayLove.site</p>
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
          0%, 100% {
            box-shadow: 0 0 10px 5px rgba(255, 214, 94, 0.5);
            transform: scale(1.1);
          }
          50% {
            box-shadow: 0 0 15px 8px rgba(255, 214, 94, 0.7);
            transform: scale(1);
          }
        }
        
        @keyframes flicker1 {
          0%, 100% {
            opacity: 0.8;
            height: 7px;
          }
          50% {
            opacity: 1;
            height: 8px;
          }
        }
        
        @keyframes flicker2 {
          0%, 100% {
            opacity: 0.9;
            transform: scale(1) rotate(-2deg);
          }
          50% {
            opacity: 1;
            transform: scale(1.1) rotate(2deg);
          }
        }

        .animate-flicker1 {
          animation: flicker1 0.5s infinite alternate;
        }
        
        .animate-flicker2 {
          animation: flicker2 0.8s infinite alternate;
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