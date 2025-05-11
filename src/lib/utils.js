'use client';

import { v4 as uuidv4 } from 'uuid';
import CryptoJS from 'crypto-js';

// Generate a URL-friendly slug
export function generateSlug() {
  const uuid = uuidv4();
  return uuid.substring(0, 8);
}

// Validate YouTube URL and extract video ID
export function validateYoutubeUrl(url) {
  if (!url) return { isValid: false };
  
  const regExp = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([^?&]+)(?:\?.*)?$/;
  const match = url.match(regExp);
  
  if (match && match[1]) {
    return {
      isValid: true,
      videoId: match[1],
      embedUrl: `https://www.youtube.com/embed/${match[1]}`
    };
  }
  
  return { isValid: false };
}

// Format date for display
export function formatDate(date) {
  if (!date) return '';
  
  const d = new Date(date);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return d.toLocaleDateString('en-US', options);
}

// Calculate time difference between dates
export function getTimeDifference(fromDate) {
  if (!fromDate) return null;
  
  const start = new Date(fromDate);
  const now = new Date();
  
  const diffTime = Math.abs(now - start);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);
  
  return {
    days: diffDays % 30,
    months: diffMonths % 12,
    years: diffYears,
    totalDays: diffDays
  };
}

// Hash a string using SHA-256
export function hashString(str) {
  return CryptoJS.SHA256(str).toString(CryptoJS.enc.Hex);
}

// Validate email format
export function isValidEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

// Validate image file (type and size)
export function validateImage(file) {
  // Check file type
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'File must be a valid image (JPEG, PNG, GIF, or WEBP)'
    };
  }
  
  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'Image must be less than 5MB'
    };
  }
  
  return { isValid: true };
}