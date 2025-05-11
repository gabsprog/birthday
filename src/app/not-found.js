import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20 text-center">
      <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800 dark:text-white">
        Site Not Found
      </h1>
      <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8">
        We couldn't find the gift you're looking for. It might have been removed or the URL is incorrect.
      </p>
      <Link
        href="/"
        className="bg-primary-600 hover:bg-primary-700 text-white font-medium px-6 py-3 rounded-lg inline-block shadow-md transition-colors"
      >
        Go to Homepage
      </Link>
    </div>
  );
}