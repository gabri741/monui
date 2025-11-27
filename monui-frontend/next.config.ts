import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  
  // ✅ Desabilitar verificações no build de produção
  eslint: {
    ignoreDuringBuilds: true, // Ignora erros de ESLint
  },
  typescript: {
    ignoreBuildErrors: true, // Ignora erros de TypeScript
  },
  
  // Outras configs...
}

module.exports = nextConfig

export default nextConfig;
