import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,                         // 외부 접속 허용
    port: 5273,                         // 원하는 포트
    allowedHosts: ['shkim3000.cafe24.com'],   // 접속 허용 도메인
  },
})
