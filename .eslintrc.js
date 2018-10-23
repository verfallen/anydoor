module.exports = {
  env: {
    es6: true,
    node: true
  },
  extends: "eslint:recommended",
  parserOptions: {
    ecmaVersion: 2017
  },
  rules: {
    indent: ["error", 2],
    "linebreak-style": ["error", "unix"],
    quotes: ["error", "single"],
    semi: ["error", "always"],
    "no-console": ["error", { allow: ["info", "warn", "error"] }],
    "no-multiple-empty-lines": ["error", { "max": 1, "maxEOF": 1 }]
  }
};
