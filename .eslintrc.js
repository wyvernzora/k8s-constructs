/* eslint-env node */
const OFF = 0, WARN = 1, ERROR = 2;

module.exports = {
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    root: true,
    rules: {
        "no-trailing-spaces": ERROR,
        "@typescript-eslint/no-namespace": OFF,
    },
    ignorePatterns: ["src/imports/**"]
};
