const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.externals = {
        ...config.externals,
        "onnxruntime-node": "commonjs onnxruntime-node",
      };
    }

    // Ignore binary files to avoid Webpack processing them
    config.module.rules.push({
      test: /\.node$/,
      use: "ignore-loader",
    });

    return config;
  },
};

export default nextConfig;
