'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

function SuccessContent() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [site, setSite] = useState(null);
  const [error, setError] = useState('');
  const [siteUrl, setSiteUrl] = useState('');

  const siteId = searchParams.get('site_id');

  useEffect(() => {
    console.log('Success page loaded with params:', {
      siteId: siteId,
      allParams: Object.fromEntries([...searchParams.entries()])
    });

    if (!siteId) {
      setError('Missing site information. Your payment may have been processed, but we could not locate your site.');
      setIsLoading(false);
      return;
    }

    const fetchSite = async () => {
      try {
        console.log('Fetching site data for ID:', siteId);
        const response = await axios.get(`/api/site/${siteId}`);
        console.log('API response:', response.data);

        if (response.data.success && response.data.site) {
          setSite(response.data.site);
          console.log('Site data loaded successfully:', response.data.site);

          if (response.data.site.slug) {
            const origin = window.location.origin;
            setSiteUrl(`${origin}/${response.data.site.slug}`);
          }
        } else {
          throw new Error('No site data in response');
        }
      } catch (error) {
        console.error('Error fetching site:', error);
        if (error.response) {
          console.error('Error response:', error.response.data);
          console.error('Error status:', error.response.status);
        }

        setError('We could not load your site details. The payment was processed, but please check your email for the site link.');
      } finally {
        setIsLoading(false);
      }
    };

    console.log('Waiting for webhook processing...');
    const timer = setTimeout(() => {
      fetchSite();
    }, 5000);

    return () => clearTimeout(timer);
  }, [siteId, searchParams]);

  return (
    <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
      {isLoading ? (
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Processing your payment...</p>
          <p className="text-sm text-gray-500 mt-2">This may take a few moments.</p>
        </div>
      ) : error ? (
        <div className="text-center">
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            <p>{error}</p>
          </div>
          <p className="mb-6 text-gray-600">
            Your payment was successfully processed. You will receive an email with your site link shortly.
          </p>
          <Link 
            href="/"
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
          >
            Back to Homepage
          </Link>
        </div>
      ) : (
        <div className="text-center">
          <div className="bg-green-50 text-green-600 p-4 rounded-lg mb-6">
            <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
            <p>Your special gift is ready to be shared.</p>
          </div>

          {site && siteUrl && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2">Your Site Link</h2>
              <div className="bg-gray-50 p-3 rounded-lg mb-4 text-left overflow-x-auto">
                <code className="text-blue-600 text-sm break-all">{siteUrl}</code>
              </div>

              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(siteUrl);
                    alert('Link copied to clipboard!');
                  }}
                  className="border border-blue-500 text-blue-500 py-2 px-4 rounded hover:bg-blue-50"
                >
                  Copy Link
                </button>

                <a
                  href={siteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded font-medium"
                >
                  Visit Your Site
                </a>
              </div>
            </div>
          )}

          <div className="border-t border-gray-200 mt-8 pt-6">
            <p className="text-gray-600 mb-6">
              Your payment was successfully processed. We’ve also sent an email with your site link.
            </p>
            <Link 
              href="/create"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded"
            >
              Create Another Gift
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <Suspense fallback={
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      }>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
