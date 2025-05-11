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
  // Ensure module resolution works correctly
  webpack(config) {
    return config;
  },
  // Remover a seção experimental com appDir
};

module.exports = nextConfig;