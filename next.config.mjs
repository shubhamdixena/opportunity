/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Enable caching for visitor-focused app
  experimental: {
    staleTimes: {
      dynamic: 30, // 30 seconds for dynamic content
      static: 180, // 3 minutes for static content
    },
  },
  // Set headers for better caching
  async headers() {
    return [
      {
        source: '/api/opportunities',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=600', // 5min browser, 10min CDN
          },
        ],
      },
      {
        source: '/api/categories',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=1800, s-maxage=3600', // 30min browser, 1hr CDN
          },
        ],
      },
    ]
  },
}

export default nextConfig
