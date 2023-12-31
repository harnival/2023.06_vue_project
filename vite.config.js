import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  	plugins: [
		vue(),
	],
	proxy: {
		'/api': {
		  target: 'http://localhost:5173', 
		  changeOrigin: true,
		  rewrite: (path) => path.replace(/^\/api/, ''),
		}
	},
	optimizeDeps : {
		exclude : ['fsevents']
	}
	
})
