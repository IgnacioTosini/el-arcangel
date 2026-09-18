import { defineConfig } from 'vitest/config';

import config from './vitest.config.mts';

export default defineConfig({
    ...config,
    test: {
        ...config.test,
        include: ['tests/integration/**/*.test.ts'],
        exclude: [],
        fileParallelism: false,
        testTimeout: 60000,
        hookTimeout: 15000,
    },
});
