/**
 * @type {import("tsup").Options}
 */
export default {
    bundle: true,
    cjsInterop: true,
    clean: true,
    dts: true,
    entry: ['src/index.ts', '!src/**/*.test.ts', '!src/**/*.test.tsx'],
    format: ['esm', 'cjs'],
    keepNames: true,
    minify: false,
    outDir: 'dist',
    shims: true,
    skipNodeModulesBundle: true,
    sourcemap: 'inline',
    splitting: true,
    treeshake: true,
    tsconfig: 'tsconfig.json'
};
