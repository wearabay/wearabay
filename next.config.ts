import type { NextConfig } from "next";


const nextConfig: NextConfig = {

  images: {

    remotePatterns: [

      {
        protocol: "https",
        hostname: "ksvbcvormvucelrwhagb.supabase.co",
        pathname:
          "/storage/v1/object/public/wearabay-media/**",
      },

    ],

  },


  experimental: {

    serverActions: {

      allowedOrigins: [

        "localhost:3000",

        "*.app.github.dev",

      ],

    },

  },

};


export default nextConfig;