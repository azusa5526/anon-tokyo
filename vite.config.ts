import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import Icons from 'unplugin-icons/vite';
import IconsResolver from 'unplugin-icons/resolver';
import Components from 'unplugin-vue-components/vite';

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve('./src'),
    },
  },
  plugins: [
    vue(),
    tailwindcss(),
    Components({
      dts: true,
      resolvers: [IconsResolver({ prefix: 'icon' })],
    }),
    ,
    Icons({ compiler: 'vue3' }),
  ],
});
