// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  devToolbar: {
    enabled: true,
    placement: 'bottom-right'
  },
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
      config: {
        kernel: 'nearest',
        background: 'transparent'
      }
    }
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "/src/styles/variables" as *;`
        }
      }
    }
  }
});
