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
    // Fix __dirname context for Docker compatibility
    // In Docker, we're always in /app, so use absolute path
    const isDocker = process.env.DOCKER_BUILD === 'true' || process.cwd() === '/app';
    const rootPath = isDocker ? '/app' : __dirname;
    const srcPath = path.resolve(rootPath, 'src');
    
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
    
    // Debug logging
    console.log('=== WEBPACK DEBUG ===');
    console.log('isDocker:', isDocker);
    console.log('rootPath:', rootPath);
    console.log('srcPath:', srcPath);
    console.log('Current working directory:', process.cwd());
    console.log('Webpack aliases:', config.resolve.alias);
    console.log('====================');
    
    return config;
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', '*.vercel.app']
    }
  },
  turbopack: {
    resolveAlias: {
      '@': './src',
      '@/components': './src/components',
      '@/lib': './src/lib',
      '@/contexts': './src/contexts',
      '@/app': './src/app',
    },
    resolveExtensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
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
