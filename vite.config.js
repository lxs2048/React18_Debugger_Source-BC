import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path";
// https://vitejs.dev/config/
export default defineConfig({
  define: {
    __DEV__: false, // 设置为false跳过 if(__dev__)的开发逻辑
    __EXPERIMENTAL__: true,
    __PROFILE__: true,
  },
  resolve: {
    alias: {
      react: path.posix.resolve("src/react/packages/react"),
      "react-dom": path.posix.resolve("src/react/packages/react-dom"),
      "react-dom-bindings": path.posix.resolve(
        "src/react/packages/react-dom-bindings"
      ),
      "react-reconciler": path.posix.resolve(
        "src/react/packages/react-reconciler"
      ),
      scheduler: path.posix.resolve("src/react/packages/scheduler"),
      shared: path.posix.resolve("src/react/packages/shared"),
    },
},

  plugins: [react({
    // jsxRuntime:'automatic'
    // jsxRuntime:'classic'
  })],
})
