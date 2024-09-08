const javascriptAutoClosingPairsRules = [
  { open: "{", close: "}" },
  { open: "[", close: "]" },
  { open: "(", close: ")" },
  { open: "'", close: "'", notIn: ["string", "comment"] },
  { open: '"', close: '"', notIn: ["string"] },
  { open: "`", close: "`", notIn: ["string", "comment"] },
  { open: "/**", close: " */", notIn: ["string"] }
];
const latexAutoClosingPairsRules = [
  { open: "\\left(", close: "\\right)" },
  { open: "\\left[", close: "\\right]" },
  { open: "\\left\\{", close: "\\right\\}" },
  { open: "\\bigl(", close: "\\bigr)" },
  { open: "\\bigl[", close: "\\bigr]" },
  { open: "\\bigl\\{", close: "\\bigr\\}" },
  { open: "\\Bigl(", close: "\\Bigr)" },
  { open: "\\Bigl[", close: "\\Bigr]" },
  { open: "\\Bigl\\{", close: "\\Bigr\\}" },
  { open: "\\biggl(", close: "\\biggr)" },
  { open: "\\biggl[", close: "\\biggr]" },
  { open: "\\biggl\\{", close: "\\biggr\\}" },
  { open: "\\Biggl(", close: "\\Biggr)" },
  { open: "\\Biggl[", close: "\\Biggr]" },
  { open: "\\Biggl\\{", close: "\\Biggr\\}" },
  { open: "\\(", close: "\\)" },
  { open: "\\[", close: "\\]" },
  { open: "\\{", close: "\\}" },
  { open: "{", close: "}" },
  { open: "[", close: "]" },
  { open: "(", close: ")" },
  { open: "`", close: "'" }
];
export {
  javascriptAutoClosingPairsRules,
  latexAutoClosingPairsRules
};
