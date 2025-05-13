'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Button from '@/components/ui/Button';

// Initialize Stripe with proper error handling
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  .catch(error => {
    console.error('Error loading Stripe:', error);
    return null;
  });

// Checkout Form Component - Using Stripe Elements properly
function CheckoutForm({ clientSecret, siteId }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      // Stripe.js has not yet loaded
      return;
    }
    
    setIsLoading(true);
    console.log('Processing payment...');
    
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/success?site_id=${siteId}`,
      },
    });
    
    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`.
    if (error) {
      console.error('Payment error:', error);
      setErrorMessage(error.message || 'An unexpected error occurred.');
    }
    
    setIsLoading(false);
  };
  
  return (
    <form onSubmit={handleSubmit} className="mt-6">
      {/* This is the official Stripe Elements component */}
      <PaymentElement />
      
      {errorMessage && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mt-4">
          {errorMessage}
        </div>
      )}
      
      <button
        type="submit"
        disabled={!stripe || isLoading}
        className="w-full mt-6 bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 rounded-lg shadow-md transition-colors disabled:bg-gray-400"
      >
        {isLoading ? 'Processing...' : 'Pay $4.00'}
      </button>
    </form>
  );
}

// Component that requires searchParams - wrapped with client-side logic
function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const clientSecret = searchParams.get('client_secret');
  const siteId = searchParams.get('site_id');
  
  // Log params for debugging
  useEffect(() => {
    console.log('Payment page loaded with params:', { 
      clientSecret: clientSecret ? `${clientSecret.substring(0, 10)}...` : null,
      siteId,
      stripeKeyAvailable: Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
    });
    
    if (!clientSecret || !siteId) {
      console.error('Missing required parameters:', {
        hasClientSecret: Boolean(clientSecret),
        hasSiteId: Boolean(siteId)
      });
      setError('Missing payment information. Please try creating your gift again.');
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [clientSecret, siteId]);
  
  const handleTryAgain = () => {
    router.push('/create');
  };
  
  // Stripe Elements configuration
  const stripeOptions = clientSecret ? {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#f05252',
        colorBackground: '#ffffff',
        colorText: '#30313d',
        colorDanger: '#df1b41',
        fontFamily: 'system-ui, sans-serif',
        borderRadius: '8px',
      },
    },
  } : null;
  
  return (
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
          <>
            {/* Stripe Elements */}
            {clientSecret && stripeOptions && (
              <Elements stripe={stripePromise} options={stripeOptions}>
                <CheckoutForm clientSecret={clientSecret} siteId={siteId} />
              </Elements>
            )}
          </>
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
  );
}

// Main Payment Page with Suspense boundary
export default function PaymentPage() {
  return (
    <>
      <Header />
      
      <main className="mt-24 mb-16">
        <Suspense fallback={
          <div className="container mx-auto px-4 max-w-lg">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
              <p>Loading payment information...</p>
            </div>
          </div>
        }>
          <PaymentContent />
        </Suspense>
      </main>
      
      <Footer />
    </>
  );
}