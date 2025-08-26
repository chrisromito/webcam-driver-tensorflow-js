import { defineConfig } from 'vite'

export default defineConfig({
    base: '/webcam-driver/',
    build: {
        rollupOptions: {
            external: [
                'matter-js'
            ]
        }
    }
})