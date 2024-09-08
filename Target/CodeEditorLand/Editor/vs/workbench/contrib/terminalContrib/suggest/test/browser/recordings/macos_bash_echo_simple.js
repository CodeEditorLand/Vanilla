const events = [
  {
    type: "resize",
    cols: 129,
    rows: 21
  },
  {
    type: "output",
    data: "starting...\r\n"
  },
  {
    type: "output",
    data: "starting...\r\n"
  },
  {
    type: "output",
    data: "\x1B]633;P;ContinuationPrompt=\\[\\x1b[90m\\]\u2219\\[\\x1b[0m\\] \x07"
  },
  {
    type: "output",
    data: "\x1B]633;P;Prompt=\\\\[\\\\e]0\\x3b\\\\u@\\\\h: \\\\w\\\\a\\\\]\\\\[\\\\e]0\\x3b\\\\u@\\\\h: \\\\w\\\\a\\\\]\\\\h:\\\\W \\\\u\\\\$ \x07\x1B[?1034h\x1B]633;A\x07\r\n\x1B[31m\uE0B6\x1B[0m\x1B[41;38;2;17;17;17mextensions/vscode-api-tests/testWorkspace\x1B[0m\x1B[41m \x1B[0m\x1B[43;31m\uE0B0\x1B[0m\x1B[43;38;2;17;17;17m \x1B[0m\x1B[43;38;2;17;17;17m\uE0A0 \x1B[0m\x1B[43;38;2;17;17;17mtyriar/211869\x1B[0m\x1B[43;38;2;17;17;17m \x1B[0m\x1B[44;33m\uE0B0\x1B[0m\x1B[44;38;2;17;17;17m \x1B[0m\x1B[44;38;2;17;17;17m!\x1B[0m\x1B[44;38;2;17;17;17m?\x1B[0m\x1B[44;38;2;17;17;17m\u21E1\x1B[0m\x1B[44;38;2;17;17;17m \x1B[0m\x1B[34m\uE0B0\x1B[0m via \x1B[1;32m\uE718 \x1B[0m\x1B[1;32mv18.17.1\x1B[0m\x1B[1;32m \x1B[0m\r\n\x1B[1;32m\u276F\x1B[0m \x1B]633;B\x07"
  },
  {
    type: "promptInputChange",
    data: "|"
  },
  {
    type: "input",
    data: "e"
  },
  {
    type: "output",
    data: "e"
  },
  {
    type: "promptInputChange",
    data: "e|"
  },
  {
    type: "input",
    data: "c"
  },
  {
    type: "output",
    data: "c"
  },
  {
    type: "promptInputChange",
    data: "ec|"
  },
  {
    type: "input",
    data: "h"
  },
  {
    type: "output",
    data: "h"
  },
  {
    type: "promptInputChange",
    data: "ech|"
  },
  {
    type: "input",
    data: "o"
  },
  {
    type: "output",
    data: "o"
  },
  {
    type: "promptInputChange",
    data: "echo|"
  },
  {
    type: "input",
    data: " "
  },
  {
    type: "output",
    data: " "
  },
  {
    type: "promptInputChange",
    data: "echo |"
  },
  {
    type: "input",
    data: "a"
  },
  {
    type: "output",
    data: "a"
  },
  {
    type: "promptInputChange",
    data: "echo a|"
  },
  {
    type: "input",
    data: "\r"
  },
  {
    type: "output",
    data: "\r\n\x1B]633;E;echo a;d4a6d6d5-dcdc-4a92-a347-23af8e049888\x07\x1B]633;C\x07"
  },
  {
    type: "promptInputChange",
    data: "echo a"
  },
  {
    type: "output",
    data: "a\r\n"
  },
  {
    type: "output",
    data: "\x1B]633;D;0\x07"
  },
  {
    type: "output",
    data: "\x1B]633;P;Cwd=/Users/tyriar/dev/microsoft/vscode/extensions/vscode-api-tests/testWorkspace\x07"
  },
  {
    type: "output",
    data: "\x1B]633;P;Prompt=\\x0a\\\\[\\x1b[31m\\\\]\uE0B6\\\\[\\x1b[0m\\\\]\\\\[\\x1b[41\\x3b38\\x3b2\\x3b17\\x3b17\\x3b17m\\\\]extensions/vscode-api-tests/testWorkspace\\\\[\\x1b[0m\\\\]\\\\[\\x1b[41m\\\\] \\\\[\\x1b[0m\\\\]\\\\[\\x1b[43\\x3b31m\\\\]\uE0B0\\\\[\\x1b[0m\\\\]\\\\[\\x1b[43\\x3b38\\x3b2\\x3b17\\x3b17\\x3b17m\\\\] \\\\[\\x1b[0m\\\\]\\\\[\\x1b[43\\x3b38\\x3b2\\x3b17\\x3b17\\x3b17m\\\\]\uE0A0 \\\\[\\x1b[0m\\\\]\\\\[\\x1b[43\\x3b38\\x3b2\\x3b17\\x3b17\\x3b17m\\\\]tyriar/211869\\\\[\\x1b[0m\\\\]\\\\[\\x1b[43\\x3b38\\x3b2\\x3b17\\x3b17\\x3b17m\\\\] \\\\[\\x1b[0m\\\\]\\\\[\\x1b[44\\x3b33m\\\\]\uE0B0\\\\[\\x1b[0m\\\\]\\\\[\\x1b[44\\x3b38\\x3b2\\x3b17\\x3b17\\x3b17m\\\\] \\\\[\\x1b[0m\\\\]\\\\[\\x1b[44\\x3b38\\x3b2\\x3b17\\x3b17\\x3b17m\\\\]!\\\\[\\x1b[0m\\\\]\\\\[\\x1b[44\\x3b38\\x3b2\\x3b17\\x3b17\\x3b17m\\\\]?\\\\[\\x1b[0m\\\\]\\\\[\\x1b[44\\x3b38\\x3b2\\x3b17\\x3b17\\x3b17m\\\\]\u21E1\\\\[\\x1b[0m\\\\]\\\\[\\x1b[44\\x3b38\\x3b2\\x3b17\\x3b17\\x3b17m\\\\] \\\\[\\x1b[0m\\\\]\\\\[\\x1b[34m\\\\]\uE0B0\\\\[\\x1b[0m\\\\] via \\\\[\\x1b[1\\x3b32m\\\\]\uE718 \\\\[\\x1b[0m\\\\]\\\\[\\x1b[1\\x3b32m\\\\]v18.17.1\\\\[\\x1b[0m\\\\]\\\\[\\x1b[1\\x3b32m\\\\] \\\\[\\x1b[0m\\\\]\\x0a\\\\[\\x1b[1\\x3b32m\\\\]\u276F\\\\[\\x1b[0m\\\\] \x07\x1B]633;A\x07\r\n\x1B[31m\uE0B6\x1B[0m\x1B[41;38;2;17;17;17mextensions/vscode-api-tests/testWorkspace\x1B[0m\x1B[41m \x1B[0m\x1B[43;31m\uE0B0\x1B[0m\x1B[43;38;2;17;17;17m \x1B[0m\x1B[43;38;2;17;17;17m\uE0A0 \x1B[0m\x1B[43;38;2;17;17;17mtyriar/211869\x1B[0m\x1B[43;38;2;17;17;17m \x1B[0m\x1B[44;33m\uE0B0\x1B[0m\x1B[44;38;2;17;17;17m \x1B[0m\x1B[44;38;2;17;17;17m!\x1B[0m\x1B[44;38;2;17;17;17m?\x1B[0m\x1B[44;38;2;17;17;17m\u21E1\x1B[0m\x1B[44;38;2;17;17;17m \x1B[0m\x1B[34m\uE0B0\x1B[0m via \x1B[1;32m\uE718 \x1B[0m\x1B[1;32mv18.17.1\x1B[0m\x1B[1;32m \x1B[0m\r\n\x1B[1;32m\u276F\x1B[0m \x1B]633;B\x07"
  },
  {
    type: "promptInputChange",
    data: "|"
  }
];
export {
  events
};
