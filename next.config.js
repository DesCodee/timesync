const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  cacheOnFrontEndNav: true,
  reloadOnOnline: true,
  disable: false,
  workboxOptions: { disableDevLogs: true },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
};

module.exports = withPWA(nextConfig);
