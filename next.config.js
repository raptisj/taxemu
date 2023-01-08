/** @type {import('next').NextConfig} */
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

module.exports = nextConfig;



  // async redirects() {
  //   return [
  //     {
  //       source: "/welcome", // make '/' in v2 release
  //       destination: "/welcome",
  //       permanent: true,
  //     },
  //   ];
  // },