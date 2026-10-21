const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for Docker standalone builds
  output: 'standalone',
  outputFileTracingRoot: path.resolve(__dirname, '..'),
  outputFileTracingExcludes: {
    '*': ['.next/package.json'],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {
    root: path.resolve(__dirname, '..'),
    resolveAlias: {
      ethers: '../node_modules/ethers',
    },
  },
};

module.exports = nextConfig;
