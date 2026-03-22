import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


export default {
  base: 'betsyze/my-calendar/',   // must match your GitHub repo name exactly
  plugins: [react()],
}