import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import mkcert from 'vite-plugin-mkcert'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    mkcert(),
    react(),
    tailwindcss()
  ],
  server: {
    headers: {
      "Permissions-Policy": "publickey-credentials-create=*, publickey-credentials-get=*",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
