import type { NextConfig } from "next";
import path from 'path';

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  compress: true,
  eslint: {
    // Disable ESLint during builds for production deployment
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
      '@/components': path.resolve(__dirname, 'src/components'),
      '@/lib': path.resolve(__dirname, 'src/lib'),
      '@/contexts': path.resolve(__dirname, 'src/contexts'),
      '@/app': path.resolve(__dirname, 'src/app'),
    };
    
    // Ensure module resolution works correctly
    config.resolve.modules = [
      path.resolve(__dirname, 'src'),
      'node_modules'
    ];
    
    return config;
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', '*.vercel.app']
    }
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
