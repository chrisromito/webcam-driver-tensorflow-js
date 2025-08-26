<<<<<<< HEAD
import { defineConfig } from 'vite'

export default defineConfig({
    build: {
        rollupOptions: {
            external: [
                'matter-js'
            ]
        }
    }
})
=======
export default {
  optimizeDeps: {
    exclude: ['matter-js']
  }
}
>>>>>>> main
