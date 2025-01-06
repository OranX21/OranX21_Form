import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  i18n: {
    locales: ['en', 'es'],
    defaultLocale: 'es',
  },
  env: {
    API_URL: process.env.API_URL,
  },
}

export default nextConfig
