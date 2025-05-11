import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <Header />
      
      <main className="flex-grow pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary-500 to-primary-700 text-white py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="md:w-1/2">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                  Create Beautiful Digital Gifts for Your Loved Ones
                </h1>
                <p className="text-xl mb-8 text-white/90 max-w-lg">
                  Celebrate birthdays, anniversaries, or express your love with personalized digital sites they'll never forget.
                </p>
                <Link
                  href="/create"
                  className="bg-white text-primary-600 hover:bg-gray-100 font-bold px-8 py-4 rounded-lg inline-block shadow-lg transition-colors text-lg"
                >
                  Create Your Gift
                </Link>
              </div>
              <div className="md:w-1/2 flex justify-center">
                <div className="relative">
                  <div className="absolute -top-4 -left-4 w-full h-full bg-white/10 rounded-lg"></div>
                  <img
                    src="/images/templates/placeholder.jpg"
                    alt="Digital gift preview"
                    className="relative z-10 max-w-full rounded-lg shadow-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Creating a beautiful digital gift is easy and only takes a few minutes.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="bg-white dark:bg-gray-700 p-8 rounded-lg shadow-md text-center">
                <div className="bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  1
                </div>
                <h3 className="text-xl font-bold mb-4">Choose a Template</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Select from our beautiful birthday, anniversary, or love declaration templates.
                </p>
              </div>
              
              {/* Step 2 */}
              <div className="bg-white dark:bg-gray-700 p-8 rounded-lg shadow-md text-center">
                <div className="bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  2
                </div>
                <h3 className="text-xl font-bold mb-4">Personalize Your Gift</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Add your message, photos, special date, and even a YouTube video.
                </p>
              </div>
              
              {/* Step 3 */}
              <div className="bg-white dark:bg-gray-700 p-8 rounded-lg shadow-md text-center">
                <div className="bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  3
                </div>
                <h3 className="text-xl font-bold mb-4">Share with Your Loved One</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Get a unique link and QR code to share your special gift.
                </p>
              </div>
            </div>
            
            <div className="text-center mt-12">
              <Link
                href="/create"
                className="bg-primary-600 hover:bg-primary-700 text-white font-medium px-6 py-3 rounded-lg inline-block shadow-md transition-colors"
              >
                Create Your Gift Now
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Create Your Special Gift?</h2>
            <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              It only takes a few minutes to create a memorable digital gift that will last forever.
            </p>
            <Link
              href="/create"
              className="bg-white text-primary-600 hover:bg-gray-100 font-bold px-8 py-4 rounded-lg inline-block shadow-lg transition-colors text-lg"
            >
              Get Started Now
            </Link>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}