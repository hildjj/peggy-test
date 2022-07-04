"use strict";

module.exports = {
  root: true,
  extends: "@peggyjs",
  ignorePatterns: [
    "lib/test_md.js", // Generated
    "node_modules/",
  ],
  overrides: [
    {
      files: ["*.js"],
      parserOptions: {
        sourceType: "module",
        ecmaVersion: 2020,
      },
      rules: {
        "comma-dangle": ["error", {
          arrays: "always-multiline",
          objects: "always-multiline",
          imports: "always-multiline",
          exports: "always-multiline",
          functions: "never",
        }],
        "capitalized-comments": ["error", "always", {
          "ignorePattern": "c8",
          "ignoreConsecutiveComments": true,
        }],
      },
    },
  ],
};
