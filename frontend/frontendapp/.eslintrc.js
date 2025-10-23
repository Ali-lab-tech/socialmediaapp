module.exports = {
  root: true,
  env: {
    node: true,
    browser: true
  },
  globals: {
    toastr: 'readonly'
  },
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended'
  ],
  parserOptions: {
    parser: '@babel/eslint-parser',
    requireConfigFile: false
  },
  rules: {}
}
