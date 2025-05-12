'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/90 dark:bg-dark/90 backdrop-blur-sm shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <img
            src="/images/logo.svg"
            alt="BirthdayLove"
            className="h-8 md:h-10"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/"
            className="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors"
          >
            Home
          </Link>
          <Link
            href="/create"
            className="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors"
          >
            Create
          </Link>
          <a
            href="mailto:birthdayloveenterprise@gmail.com"
            className="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors"
          >
            Contact
          </a>
          <Link
            href="/create"
            className="bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Get Started
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="md:hidden text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-dark shadow-lg">
          <div className="container mx-auto px-4 py-3 flex flex-col space-y-3">
            <Link
              href="/"
              className="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 font-medium py-2 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/create"
              className="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 font-medium py-2 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Create
            </Link>
            <a
              href="mailto:birthdayloveenterprise@gmail.com"
              className="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 font-medium py-2 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact
            </a>
            <Link
              href="/create"
              className="bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 py-2 rounded-lg transition-colors text-center"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;