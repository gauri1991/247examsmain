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
  webpack: (config, { isServer }) => {
    // Force absolute path resolution
    const srcPath = path.resolve(__dirname, 'src');
    
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': srcPath,
      '@/components': path.resolve(srcPath, 'components'),
      '@/lib': path.resolve(srcPath, 'lib'),
      '@/contexts': path.resolve(srcPath, 'contexts'),
      '@/app': path.resolve(srcPath, 'app'),
    };
    
    // Ensure module resolution works correctly
    config.resolve.modules = [
      srcPath,
      'node_modules'
    ];
    
    // Additional resolve options for better compatibility
    config.resolve.extensions = [
      '.js', '.jsx', '.ts', '.tsx', '.json', '.mjs'
    ];
    
    // Debug logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Webpack aliases configured:', config.resolve.alias);
    }
    
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
