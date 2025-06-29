/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config: any) => {
    // Handle leaflet images
    config.resolve.alias = {
      ...config.resolve.alias,
      '~leaflet': 'leaflet',
    };
    
    // Add rule for handling images in CSS
    config.module.rules.push({
      test: /\.(png|jpe?g|gif|svg)$/,
      use: {
        loader: 'file-loader',
        options: {
          publicPath: '/_next/static/images/',
          outputPath: 'static/images/',
        },
      },
    });

    return config;
  },
};

module.exports = nextConfig;