/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    setupFiles: [],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        '.next/',
        'coverage/',
        'playwright-report/',
        'test-results/',
        'tests/fixtures/',
        'tests/utils/',
        '**/*.d.ts',
        '**/*.config.*',
        'scripts/'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        },
        // Critical components require 100% coverage
        'lib/theology/**': {
          branches: 100,
          functions: 100,
          lines: 100,
          statements: 100
        },
        'lib/safety/**': {
          branches: 100,
          functions: 100,
          lines: 100,
          statements: 100
        }
      }
    },
    include: [
      'tests/unit/**/*.{test,spec}.{js,ts,tsx}',
      'components/**/__tests__/**/*.{test,spec}.{js,ts,tsx}',
      'lib/**/__tests__/**/*.{test,spec}.{js,ts,tsx}'
    ],
    exclude: [
      'node_modules/',
      '.next/',
      'tests/e2e/',
      'tests/fixtures/',
      'playwright-report/'
    ],
    testTimeout: 10000,
    hookTimeout: 10000
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      '@/components': path.resolve(__dirname, './components'),
      '@/lib': path.resolve(__dirname, './lib'),
      '@/app': path.resolve(__dirname, './app'),
      '@/types': path.resolve(__dirname, './types'),
      '@/hooks': path.resolve(__dirname, './hooks'),
      '@/utils': path.resolve(__dirname, './utils')
    }
  }
});