import type { Config } from "stylelint";

const config: Config = {
  plugins: ["stylelint-order"],

  overrides: [
    {
      files: ["**/*.vue"],
      customSyntax: "postcss-html",
    },
    {
      files: ["**/*.scss"],
      customSyntax: "postcss-scss",
    },
  ],

  rules: {
    "order/properties-order": [
      [
        "position",
        "top",
        "right",
        "bottom",
        "left",
        "z-index",

        "display",
        "flex",
        "flex-direction",
        "align-items",
        "justify-content",
        "gap",

        "width",
        "min-width",
        "max-width",
        "height",
        "padding",
        "margin",

        "font-size",
        "font-weight",
        "line-height",
        "color",

        "background",
        "border",
        "border-radius",
        "box-shadow",

        "transition",
        "transform",
      ],
      {
        unspecified: "bottomAlphabetical",
      },
    ],
  },
};

export default config;
