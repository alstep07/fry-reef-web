import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Ignore test files from node_modules
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    
    config.module.rules.push({
      test: /node_modules.*\.(test|spec)\.(js|ts|tsx)$/,
      use: 'ignore-loader',
    });

    // Ignore optional dependencies that are not needed in browser
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      'why-is-node-running': false,
      '@react-native-async-storage/async-storage': false,
      'pino-pretty': false,
    };

    return config;
  },
};

export default nextConfig;
