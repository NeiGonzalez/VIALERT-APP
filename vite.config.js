import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  // En desarrollo local: http://localhost:5173/
  // En GitHub Pages: https://neigonzalez.github.io/VIALERT-APP/
  base: command === 'serve' ? '/' : '/VIALERT-APP/',
}))
