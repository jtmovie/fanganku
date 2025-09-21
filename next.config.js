/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['www.fanganku.cn'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3002/api/:path*',
      },
    ];
  },
}

module.exports = nextConfig