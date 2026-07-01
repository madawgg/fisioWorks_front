import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Separa FullCalendar (y preact, que usa internamente) en su propio chunk.
        // La agenda es la página de inicio, así que este chunk se carga en paralelo
        // con el bundle principal, manteniendo ambos por debajo del límite de aviso.
        manualChunks(id) {
          if (
            id.includes('node_modules/@fullcalendar') ||
            id.includes('node_modules/preact')
          ) {
            return 'fullcalendar'
          }
          // react-select y sus dependencias exclusivas (lo arrastra la agenda
          // vía el modal de citas); en su propio chunk para no inflar el inicial.
          if (
            id.includes('node_modules/react-select') ||
            id.includes('node_modules/@emotion') ||
            id.includes('node_modules/@floating-ui') ||
            id.includes('node_modules/stylis') ||
            id.includes('node_modules/memoize-one')
          ) {
            return 'react-select'
          }
        },
      },
    },
  },
})
