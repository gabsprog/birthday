/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'res.cloudinary.com', // For Cloudinary images
    ],
  },
  // For Stripe webhook
  async headers() {
    return [
      {
        source: '/api/webhook',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/json',
          },
        ],
      },
    ];
  },
  // Ensure module resolution works correctly and fix memory issues
  webpack(config) {
    // Increase memory limit for the webpack process
    config.performance = {
      ...config.performance,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000,
    };
    
    return config;
  },
  // Add Node.js flags to increase call stack size
  experimental: {
    nodeOptions: ['--stack-size=4000'],
  },
};

module.exports = nextConfig;