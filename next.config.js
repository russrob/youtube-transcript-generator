const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Force fresh deployment to apply production Clerk environment variables
  // Vercel deployment timestamp: 2025-08-13T19:58:00Z
  // Temporarily disable TypeScript and ESLint errors during build
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Security headers
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/(.*)',
        headers: [
          // Prevent XSS attacks
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          // Prevent clickjacking
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          // Prevent MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          // Referrer policy
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          // Permissions policy
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()'
          },
          // HSTS - only enable in production with HTTPS
          ...(process.env.NODE_ENV === 'production' ? [{
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          }] : []),
          // Content Security Policy - moved to vercel.json
          // {
          //   key: 'Content-Security-Policy',
          //   value: "CSP configuration moved to vercel.json"
          // }
        ]
      }
    ]
  },
  
  // Environment-based configuration
  env: {
    CUSTOM_KEY: process.env.NODE_ENV,
  },
  
  // Production optimizations
  ...(process.env.NODE_ENV === 'production' && {
    // Enable gzip compression
    compress: true,
    
    // Optimize images
    images: {
      domains: ['localhost'],
      formats: ['image/avif', 'image/webp'],
      minimumCacheTTL: 60,
    },
    
    // Bundle analyzer in production
    webpack: (config, { isServer }) => {
      if (!isServer) {
        config.resolve.fallback = {
          ...config.resolve.fallback,
          fs: false,
        };
      }
      return config;
    },
  }),
  
  // Development configuration
  ...(process.env.NODE_ENV === 'development' && {
    // Enable source maps for better debugging
    productionBrowserSourceMaps: false,
  }),
}

// Sentry configuration
const sentryWebpackPluginOptions = {
  // Additional config options for the Sentry Webpack plugin.
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  
  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,
  
  // Upload source maps in production only
  dryRun: process.env.NODE_ENV !== 'production',
  
  // Disable source map upload if no auth token
  disableServerWebpackPlugin: !process.env.SENTRY_AUTH_TOKEN,
  disableClientWebpackPlugin: !process.env.SENTRY_AUTH_TOKEN,
  
  // Hide source maps in production
  hideSourceMaps: true,
  
  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,
};

// Export the config with or without Sentry based on environment
module.exports = process.env.SENTRY_DSN 
  ? withSentryConfig(nextConfig, sentryWebpackPluginOptions)
  : nextConfig;