module.exports = {
    env: {
        node: true,
        es2021: true,
        browser: false,
    },
    extends: ['eslint:recommended'],
    parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module',
    },
    globals: {
        process: 'readonly',
    },
    rules: {
        'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        'no-console': 'off',
    },
};