/** @type {import('next').NextConfig} */
const repo = 'Web3-Learning';
const isProd = process.env.NODE_ENV === 'production';
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
  basePath: isProd ? `/${repo}` : undefined,
  assetPrefix: isProd ? `/${repo}/` : undefined,
};

module.exports = nextConfig;
