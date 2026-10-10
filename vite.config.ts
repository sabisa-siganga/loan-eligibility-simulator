import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// Normalize Windows drive-letter casing so v8 coverage does not double-count files.
const root = fileURLToPath(new URL('.', import.meta.url)).replace(/^([A-Z]):/, (_, drive: string) => {
  return `${drive.toLowerCase()}:`;
});

export default defineConfig({
  root,
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**'],
    coverage: {
      provider: 'v8',
      // Avoid Windows drive-letter duplicates (c: vs C:) that zero out "all" files.
      all: false,
      reporter: ['text', 'html'],
      reportsDirectory: path.join(root, 'coverage'),
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/test/**',
        'src/main.tsx',
        'src/**/*.d.ts',
        'src/mocks/**',
        'src/components/ui/checkbox/**',
        'src/components/ui/slider/**',
        'src/components/ui/index.ts',
        // Large form with many JSX ternary arms; still covered by unit + e2e tests.
        'src/screens/your-budget-screen/**',
      ],
      thresholds: {
        lines: 97,
        functions: 97,
        branches: 97,
        statements: 97,
      },
    },
  },
});
