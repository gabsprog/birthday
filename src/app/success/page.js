'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import QRCode from 'qrcode.react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Button from '@/components/ui/Button';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [site, setSite] = useState(null);
  
  const siteId = searchParams.get('site_id');
  
  useEffect(() => {
    console.log('Success page loaded with site_id:', siteId);
    
    if (!siteId) {
      setError('Missing site information. Your payment may have been processed, but we could not locate your site.');
      setIsLoading(false);
      return;
    }
    
    const fetchSite = async () => {
      try {
        // For development testing without a real API
        if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
          console.log('DEV MODE: Simulating site fetch');
          // Create mock site data for testing
          const mockSite = {
            slug: `test-site-${Math.random().toString(36).substring(2, 7)}`,
            title: 'Test Site',
            customerEmail: 'test@example.com',
            paid: true
          };
          
          // Simulate loading delay
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          setSite(mockSite);
          setIsLoading(false);
          return;
        }
        
        // Real API call for production
        console.log('Fetching site data...');
        const response = await axios.get(`/api/site/${siteId}`);
        
        if (response.data.success) {
          console.log('Site data received:', response.data);
          setSite(response.data.site);
        } else {
          throw new Error('Failed to fetch site details');
        }
      } catch (error) {
        console.error('Error fetching site:', error);
        setError('We could not load your site details. Please check your email for the site link.');
      } finally {
        setIsLoading(false);
      }
    };
    
    // Add a small delay to allow the webhook to process the payment
    const timer = setTimeout(() => {
      fetchSite();
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [siteId]);
  
  const siteUrl = site ? `${window.location.origin}/${site.slug}` : '';
  
  return (
    <>
      <Header />
      
      <main className="mt-24 mb-16">
        <div className="container mx-auto px-4 max-w-lg">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            {isLoading ? (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">
                  Processing your payment...
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  This may take a few moments.
                </p>
              </div>
            ) : error ? (
              <div className="text-center py-6">
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6">
                  <p>{error}</p>
                </div>
                <p className="mb-6 text-gray-600 dark:text-gray-400">
                  If you've completed payment, you should receive an email with your site link shortly.
                </p>
                <Button
                  href="/"
                  className="inline-block"
                >
                  Return to Homepage
                </Button>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-4 rounded-lg mb-6">
                    <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
                    <p>Your special gift is now ready to share.</p>
                  </div>
                  
                  <div className="mt-8">
                    <h2 className="text-xl font-semibold mb-4">Your Site QR Code</h2>
                    <div className="bg-white p-4 rounded-lg mx-auto w-fit">
                      <QRCode 
                        value={siteUrl} 
                        size={200} 
                        level="H"
                        fgColor="#f05252"
                        renderAs="svg"
                      />
                    </div>
                    <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                      Scan this QR code to open your site
                    </p>
                  </div>
                  
                  <div className="mt-8">
                    <h2 className="text-xl font-semibold mb-4">Your Site Link</h2>
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg break-all">
                      <a 
                        href={siteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                      >
                        {siteUrl}
                      </a>
                    </div>
                    <div className="mt-4 flex gap-3 justify-center">
                      <Button
                        onClick={() => {
                          navigator.clipboard.writeText(siteUrl);
                          alert('Link copied to clipboard!');
                        }}
                        variant="outline"
                        size="sm"
                      >
                        Copy Link
                      </Button>
                      <Button
                        href={siteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="sm"
                      >
                        Visit Site
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-8">
                  <h3 className="font-medium mb-4">What happens next?</h3>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      We've sent an email to {site?.customerEmail || 'your email address'} with the site link and QR code.
                    </li>
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Your site will be available permanently.
                    </li>
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Share the link or QR code with your loved one to surprise them!
                    </li>
                  </ul>
                </div>
                
                <div className="mt-8 text-center">
                  <Button
                    href="/create"
                    variant="outline"
                  >
                    Create Another Gift
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
}