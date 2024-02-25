import modern from "@peggyjs/eslint-config/flat/modern.js";
import module from "@peggyjs/eslint-config/flat/module.js";
import peggy from "@peggyjs/eslint-plugin/lib/flat/recommended.js";

export default [
  {
    ignores: [
      "node_modules/**",
      "lib/test_md.js",
      "test/badGenerate.peggy",
      "vendor/**",
    ],
  },
  {
    ...module,
    ...modern,
  },
  peggy,
  {
    files: [
      "**/*.peggy",
    ],
    rules: {
      "@peggyjs/equal-next-line": ["error", "always"],
    },
  },
];
