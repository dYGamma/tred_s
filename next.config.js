// next.config.js

/** @type {import('next').NextConfig} */
const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [require('remark-gfm')],
    rehypePlugins: [
      require('rehype-slug'),
      require('rehype-autolink-headings'),
      require('rehype-prism-plus'),
    ],
  },
});

const nextConfig = withMDX({
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'mdx'],

  // Если хотите, чтобы все URL заканчивались на «/»:
  trailingSlash: true,

  // Пробрасываем секрет (если используете админку):
  env: {
    ADMIN_SECRET: process.env.ADMIN_SECRET,
  },

  reactStrictMode: true,
  swcMinify: true,
});

module.exports = nextConfig;
