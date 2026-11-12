import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node', // логика не зависит от DOM
    globals: true, // чтобы не импортировать describe/it/expect в каждом файле
    passWithNoTests: true, // КРИТИЧЕСКИ ВАЖНО для первого коммита
  },
});
