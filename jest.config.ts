import type { Config } from 'jest';
import { createJsWithBabelPreset } from 'ts-jest';

const jsWithBabelPreset = createJsWithBabelPreset({
    tsconfig: 'tsconfig.test.json'
});

const jestConfig: Config = {
    globals: {
        __DEV__: true
    },
    preset: 'react-native',
    collectCoverage: true,
    coverageProvider: 'v8',
    coverageReporters: ['json', 'json-summary', 'text-summary'],
    collectCoverageFrom: ['<rootDir>/src/**/*.*', '!**/node_modules/**'],
    testEnvironment: 'node',
    transform: jsWithBabelPreset.transform,
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    testPathIgnorePatterns: ['<rootDir>/build/', '<rootDir>/node_modules/'],
    transformIgnorePatterns: ['/node_modules/(?!(@react-native|react-native|react-native-gesture-handler)/).*/'],
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.[mc]?[jt]sx?$',
    clearMocks: true,
    useStderr: true
};

export default jestConfig;
