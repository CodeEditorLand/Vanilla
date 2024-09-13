var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
const module = { exports: {} };
(() => {
  const isESM = true;
  function factory() {
    const regexp = /("[^"\\]*(?:\\.[^"\\]*)*")|('[^'\\]*(?:\\.[^'\\]*)*')|(\/\*[^/*]*(?:(?:\*|\/)[^/*]*)*?\*\/)|(\/{2,}.*?(?:(?:\r?\n)|$))|(,\s*[}\]])/g;
    function stripComments2(content) {
      return content.replace(regexp, (match, _m1, _m2, m3, m4, m5) => {
        if (m3) {
          return "";
        } else if (m4) {
          const length = m4.length;
          if (m4[length - 1] === "\n") {
            return m4[length - 2] === "\r" ? "\r\n" : "\n";
          } else {
            return "";
          }
        } else if (m5) {
          return match.substring(1);
        } else {
          return match;
        }
      });
    }
    __name(stripComments2, "stripComments");
    function parse2(content) {
      const commentsStripped = stripComments2(content);
      try {
        return JSON.parse(commentsStripped);
      } catch (error) {
        const trailingCommasStriped = commentsStripped.replace(
          /,\s*([}\]])/g,
          "$1"
        );
        return JSON.parse(trailingCommasStriped);
      }
    }
    __name(parse2, "parse");
    return {
      stripComments: stripComments2,
      parse: parse2
    };
  }
  __name(factory, "factory");
  if (!isESM && typeof define === "function") {
    define([], () => factory());
  } else if (typeof module === "object" && typeof module.exports === "object") {
    module.exports = factory();
  } else {
    console.trace(
      "jsonc defined in UNKNOWN context (neither requirejs or commonjs)"
    );
  }
})();
const stripComments = module.exports.stripComments;
const parse = module.exports.parse;
export {
  parse,
  stripComments
};
//# sourceMappingURL=jsonc.js.map
