'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Button from '@/components/ui/Button';

// Load Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const clientSecret = searchParams.get('client_secret');
  const siteId = searchParams.get('site_id');
  
  useEffect(() => {
    if (!clientSecret || !siteId) {
      setError('Missing payment information. Please try creating your gift again.');
      setIsLoading(false);
      return;
    }
    
    const initializePayment = async () => {
      try {
        const stripe = await stripePromise;
        
        if (!stripe) {
          throw new Error('Failed to load payment provider');
        }
        
        // Initialize Stripe Elements
        const { error } = await stripe.confirmPayment({
          clientSecret,
          confirmParams: {
            return_url: `${window.location.origin}/success?site_id=${siteId}`,
          },
          elements: {
            appearance: {
              theme: 'stripe',
              variables: {
                colorPrimary: '#f05252',
                colorBackground: '#ffffff',
                colorText: '#30313d',
                colorDanger: '#df1b41',
                fontFamily: 'Poppins, system-ui, sans-serif',
                spacingUnit: '4px',
                borderRadius: '8px',
              },
            },
          },
        });
        
        if (error) {
          // Payment failed, display error
          setError(error.message || 'Payment failed. Please try again.');
        }
      } catch (error) {
        console.error('Payment initialization error:', error);
        setError('Something went wrong. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    initializePayment();
  }, [clientSecret, siteId]);
  
  const handleTryAgain = () => {
    router.push('/create');
  };
  
  return (
    <>
      <Header />
      
      <main className="mt-24 mb-16">
        <div className="container mx-auto px-4 max-w-lg">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center">
              Complete Your Payment
            </h1>
            
            {isLoading ? (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">
                  Loading payment form...
                </p>
              </div>
            ) : error ? (
              <div className="text-center py-6">
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6">
                  <p>{error}</p>
                </div>
                
                <Button onClick={handleTryAgain}>
                  Try Again
                </Button>
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">
                  Processing your payment...
                </p>
              </div>
            )}
            
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium mb-4">Payment Summary</h3>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600 dark:text-gray-400">Digital Gift Creation</span>
                <span className="font-medium">$4.00</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600 dark:text-gray-400">Processing Fee</span>
                <span className="font-medium">$0.00</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700 mt-2">
                <span className="font-medium">Total</span>
                <span className="font-bold">$4.00</span>
              </div>
            </div>
            
            <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
              <p>Your site will be available immediately after payment</p>
              <p className="mt-2">
                By proceeding with the payment, you agree to our{' '}
                <a href="/terms" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
                  Terms of Service
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
}