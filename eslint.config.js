import modern from "@peggyjs/eslint-config/modern.js";
import module from "@peggyjs/eslint-config/module.js";

export default [
  {
    ignores: [
      "node_modules/**",
      "lib/test_md.js",
      "test/badGenerate.peggy",
      "vendor/**",
      "**/*.md",
    ],
  },
  ...module,
  ...modern,
];
