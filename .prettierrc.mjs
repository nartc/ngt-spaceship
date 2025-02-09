/** @type {import("prettier").Config} */
export default {
  singleQuote: true,
  useTabs: true,
  htmlWhitespaceSensitivity: 'ignore',
  tabWidth: 4,
  printWidth: 120,
  plugins: ['prettier-plugin-organize-imports', 'prettier-plugin-tailwindcss'],
};
