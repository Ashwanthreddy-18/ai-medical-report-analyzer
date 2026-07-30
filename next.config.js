/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Prevent client-side bundling of Node.js-only modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
      };
    }

    // Ignore native .node binary files
    config.module.rules.push({
      test: /\.node$/,
      use: "ignore-loader",
    });

    // Suppress known third-party warnings from llamaindex / huggingface internals
    config.ignoreWarnings = [
      ...(config.ignoreWarnings ?? []),
      {
        module: /@huggingface\/transformers/,
        message: /Critical dependency/,
      },
    ];

    return config;
  },
  // Increase body size limit for file uploads (10 MB)
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

module.exports = nextConfig;
