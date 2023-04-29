/** @type {import('next').NextConfig} */
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig = {
  reactStrictMode: true,
};

module.exports = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/welcome",
      },
    ];
  },
};

module.exports = withPWA(nextConfig);

// module.exports = withPWA({
//   // next.js config
// })

// async redirects() {
//   return [
//     {
//       source: "/", // make '/' in v2 release
//       destination: "/welcome",
//       permanent: true,
//     },
//   ];
// },
