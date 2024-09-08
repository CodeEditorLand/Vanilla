import { equals } from "./arrays.js";
import { isThenable } from "./async.js";
import { CharCode } from "./charCode.js";
import { isEqualOrParent } from "./extpath.js";
import { LRUCache } from "./map.js";
import { basename, extname, posix, sep } from "./path.js";
import { isLinux } from "./platform.js";
import { escapeRegExpCharacters, ltrim } from "./strings.js";
function getEmptyExpression() {
  return /* @__PURE__ */ Object.create(null);
}
const GLOBSTAR = "**";
const GLOB_SPLIT = "/";
const PATH_REGEX = "[/\\\\]";
const NO_PATH_REGEX = "[^/\\\\]";
const ALL_FORWARD_SLASHES = /\//g;
function starsToRegExp(starCount, isLastPattern) {
  switch (starCount) {
    case 0:
      return "";
    case 1:
      return `${NO_PATH_REGEX}*?`;
    // 1 star matches any number of characters except path separator (/ and \) - non greedy (?)
    default:
      return `(?:${PATH_REGEX}|${NO_PATH_REGEX}+${PATH_REGEX}${isLastPattern ? `|${PATH_REGEX}${NO_PATH_REGEX}+` : ""})*?`;
  }
}
function splitGlobAware(pattern, splitChar) {
  if (!pattern) {
    return [];
  }
  const segments = [];
  let inBraces = false;
  let inBrackets = false;
  let curVal = "";
  for (const char of pattern) {
    switch (char) {
      case splitChar:
        if (!inBraces && !inBrackets) {
          segments.push(curVal);
          curVal = "";
          continue;
        }
        break;
      case "{":
        inBraces = true;
        break;
      case "}":
        inBraces = false;
        break;
      case "[":
        inBrackets = true;
        break;
      case "]":
        inBrackets = false;
        break;
    }
    curVal += char;
  }
  if (curVal) {
    segments.push(curVal);
  }
  return segments;
}
function parseRegExp(pattern) {
  if (!pattern) {
    return "";
  }
  let regEx = "";
  const segments = splitGlobAware(pattern, GLOB_SPLIT);
  if (segments.every((segment) => segment === GLOBSTAR)) {
    regEx = ".*";
  } else {
    let previousSegmentWasGlobStar = false;
    segments.forEach((segment, index) => {
      if (segment === GLOBSTAR) {
        if (previousSegmentWasGlobStar) {
          return;
        }
        regEx += starsToRegExp(2, index === segments.length - 1);
      } else {
        let inBraces = false;
        let braceVal = "";
        let inBrackets = false;
        let bracketVal = "";
        for (const char of segment) {
          if (char !== "}" && inBraces) {
            braceVal += char;
            continue;
          }
          if (inBrackets && (char !== "]" || !bracketVal)) {
            let res;
            if (char === "-") {
              res = char;
            } else if ((char === "^" || char === "!") && !bracketVal) {
              res = "^";
            } else if (char === GLOB_SPLIT) {
              res = "";
            } else {
              res = escapeRegExpCharacters(char);
            }
            bracketVal += res;
            continue;
          }
          switch (char) {
            case "{":
              inBraces = true;
              continue;
            case "[":
              inBrackets = true;
              continue;
            case "}": {
              const choices = splitGlobAware(braceVal, ",");
              const braceRegExp = `(?:${choices.map((choice) => parseRegExp(choice)).join("|")})`;
              regEx += braceRegExp;
              inBraces = false;
              braceVal = "";
              break;
            }
            case "]": {
              regEx += "[" + bracketVal + "]";
              inBrackets = false;
              bracketVal = "";
              break;
            }
            case "?":
              regEx += NO_PATH_REGEX;
              continue;
            case "*":
              regEx += starsToRegExp(1);
              continue;
            default:
              regEx += escapeRegExpCharacters(char);
          }
        }
        if (index < segments.length - 1 && // more segments to come after this
        (segments[index + 1] !== GLOBSTAR || // next segment is not **, or...
        index + 2 < segments.length)) {
          regEx += PATH_REGEX;
        }
      }
      previousSegmentWasGlobStar = segment === GLOBSTAR;
    });
  }
  return regEx;
}
const T1 = /^\*\*\/\*\.[\w\.-]+$/;
const T2 = /^\*\*\/([\w\.-]+)\/?$/;
const T3 = /^{\*\*\/\*?[\w\.-]+\/?(,\*\*\/\*?[\w\.-]+\/?)*}$/;
const T3_2 = /^{\*\*\/\*?[\w\.-]+(\/(\*\*)?)?(,\*\*\/\*?[\w\.-]+(\/(\*\*)?)?)*}$/;
const T4 = /^\*\*((\/[\w\.-]+)+)\/?$/;
const T5 = /^([\w\.-]+(\/[\w\.-]+)*)\/?$/;
const CACHE = new LRUCache(1e4);
const FALSE = () => false;
const NULL = () => null;
function parsePattern(arg1, options) {
  if (!arg1) {
    return NULL;
  }
  let pattern;
  if (typeof arg1 !== "string") {
    pattern = arg1.pattern;
  } else {
    pattern = arg1;
  }
  pattern = pattern.trim();
  const patternKey = `${pattern}_${!!options.trimForExclusions}`;
  let parsedPattern = CACHE.get(patternKey);
  if (parsedPattern) {
    return wrapRelativePattern(parsedPattern, arg1);
  }
  let match2;
  if (T1.test(pattern)) {
    parsedPattern = trivia1(pattern.substr(4), pattern);
  } else if (match2 = T2.exec(trimForExclusions(pattern, options))) {
    parsedPattern = trivia2(match2[1], pattern);
  } else if ((options.trimForExclusions ? T3_2 : T3).test(pattern)) {
    parsedPattern = trivia3(pattern, options);
  } else if (match2 = T4.exec(trimForExclusions(pattern, options))) {
    parsedPattern = trivia4and5(match2[1].substr(1), pattern, true);
  } else if (match2 = T5.exec(trimForExclusions(pattern, options))) {
    parsedPattern = trivia4and5(match2[1], pattern, false);
  } else {
    parsedPattern = toRegExp(pattern);
  }
  CACHE.set(patternKey, parsedPattern);
  return wrapRelativePattern(parsedPattern, arg1);
}
function wrapRelativePattern(parsedPattern, arg2) {
  if (typeof arg2 === "string") {
    return parsedPattern;
  }
  const wrappedPattern = (path, basename2) => {
    if (!isEqualOrParent(path, arg2.base, !isLinux)) {
      return null;
    }
    return parsedPattern(
      ltrim(path.substr(arg2.base.length), sep),
      basename2
    );
  };
  wrappedPattern.allBasenames = parsedPattern.allBasenames;
  wrappedPattern.allPaths = parsedPattern.allPaths;
  wrappedPattern.basenames = parsedPattern.basenames;
  wrappedPattern.patterns = parsedPattern.patterns;
  return wrappedPattern;
}
function trimForExclusions(pattern, options) {
  return options.trimForExclusions && pattern.endsWith("/**") ? pattern.substr(0, pattern.length - 2) : pattern;
}
function trivia1(base, pattern) {
  return (path, basename2) => typeof path === "string" && path.endsWith(base) ? pattern : null;
}
function trivia2(base, pattern) {
  const slashBase = `/${base}`;
  const backslashBase = `\\${base}`;
  const parsedPattern = (path, basename2) => {
    if (typeof path !== "string") {
      return null;
    }
    if (basename2) {
      return basename2 === base ? pattern : null;
    }
    return path === base || path.endsWith(slashBase) || path.endsWith(backslashBase) ? pattern : null;
  };
  const basenames = [base];
  parsedPattern.basenames = basenames;
  parsedPattern.patterns = [pattern];
  parsedPattern.allBasenames = basenames;
  return parsedPattern;
}
function trivia3(pattern, options) {
  const parsedPatterns = aggregateBasenameMatches(
    pattern.slice(1, -1).split(",").map((pattern2) => parsePattern(pattern2, options)).filter((pattern2) => pattern2 !== NULL),
    pattern
  );
  const patternsLength = parsedPatterns.length;
  if (!patternsLength) {
    return NULL;
  }
  if (patternsLength === 1) {
    return parsedPatterns[0];
  }
  const parsedPattern = (path, basename2) => {
    for (let i = 0, n = parsedPatterns.length; i < n; i++) {
      if (parsedPatterns[i](path, basename2)) {
        return pattern;
      }
    }
    return null;
  };
  const withBasenames = parsedPatterns.find(
    (pattern2) => !!pattern2.allBasenames
  );
  if (withBasenames) {
    parsedPattern.allBasenames = withBasenames.allBasenames;
  }
  const allPaths = parsedPatterns.reduce(
    (all, current) => current.allPaths ? all.concat(current.allPaths) : all,
    []
  );
  if (allPaths.length) {
    parsedPattern.allPaths = allPaths;
  }
  return parsedPattern;
}
function trivia4and5(targetPath, pattern, matchPathEnds) {
  const usingPosixSep = sep === posix.sep;
  const nativePath = usingPosixSep ? targetPath : targetPath.replace(ALL_FORWARD_SLASHES, sep);
  const nativePathEnd = sep + nativePath;
  const targetPathEnd = posix.sep + targetPath;
  let parsedPattern;
  if (matchPathEnds) {
    parsedPattern = (path, basename2) => typeof path === "string" && (path === nativePath || path.endsWith(nativePathEnd) || !usingPosixSep && (path === targetPath || path.endsWith(targetPathEnd))) ? pattern : null;
  } else {
    parsedPattern = (path, basename2) => typeof path === "string" && (path === nativePath || !usingPosixSep && path === targetPath) ? pattern : null;
  }
  parsedPattern.allPaths = [(matchPathEnds ? "*/" : "./") + targetPath];
  return parsedPattern;
}
function toRegExp(pattern) {
  try {
    const regExp = new RegExp(`^${parseRegExp(pattern)}$`);
    return (path) => {
      regExp.lastIndex = 0;
      return typeof path === "string" && regExp.test(path) ? pattern : null;
    };
  } catch (error) {
    return NULL;
  }
}
function match(arg1, path, hasSibling) {
  if (!arg1 || typeof path !== "string") {
    return false;
  }
  return parse(arg1)(path, void 0, hasSibling);
}
function parse(arg1, options = {}) {
  if (!arg1) {
    return FALSE;
  }
  if (typeof arg1 === "string" || isRelativePattern(arg1)) {
    const parsedPattern = parsePattern(arg1, options);
    if (parsedPattern === NULL) {
      return FALSE;
    }
    const resultPattern = (path, basename2) => !!parsedPattern(path, basename2);
    if (parsedPattern.allBasenames) {
      resultPattern.allBasenames = parsedPattern.allBasenames;
    }
    if (parsedPattern.allPaths) {
      resultPattern.allPaths = parsedPattern.allPaths;
    }
    return resultPattern;
  }
  return parsedExpression(arg1, options);
}
function isRelativePattern(obj) {
  const rp = obj;
  if (!rp) {
    return false;
  }
  return typeof rp.base === "string" && typeof rp.pattern === "string";
}
function getBasenameTerms(patternOrExpression) {
  return patternOrExpression.allBasenames || [];
}
function getPathTerms(patternOrExpression) {
  return patternOrExpression.allPaths || [];
}
function parsedExpression(expression, options) {
  const parsedPatterns = aggregateBasenameMatches(
    Object.getOwnPropertyNames(expression).map(
      (pattern) => parseExpressionPattern(pattern, expression[pattern], options)
    ).filter((pattern) => pattern !== NULL)
  );
  const patternsLength = parsedPatterns.length;
  if (!patternsLength) {
    return NULL;
  }
  if (!parsedPatterns.some(
    (parsedPattern) => !!parsedPattern.requiresSiblings
  )) {
    if (patternsLength === 1) {
      return parsedPatterns[0];
    }
    const resultExpression2 = (path, basename2) => {
      let resultPromises;
      for (let i = 0, n = parsedPatterns.length; i < n; i++) {
        const result = parsedPatterns[i](path, basename2);
        if (typeof result === "string") {
          return result;
        }
        if (isThenable(result)) {
          if (!resultPromises) {
            resultPromises = [];
          }
          resultPromises.push(result);
        }
      }
      if (resultPromises) {
        return (async () => {
          for (const resultPromise of resultPromises) {
            const result = await resultPromise;
            if (typeof result === "string") {
              return result;
            }
          }
          return null;
        })();
      }
      return null;
    };
    const withBasenames2 = parsedPatterns.find(
      (pattern) => !!pattern.allBasenames
    );
    if (withBasenames2) {
      resultExpression2.allBasenames = withBasenames2.allBasenames;
    }
    const allPaths2 = parsedPatterns.reduce(
      (all, current) => current.allPaths ? all.concat(current.allPaths) : all,
      []
    );
    if (allPaths2.length) {
      resultExpression2.allPaths = allPaths2;
    }
    return resultExpression2;
  }
  const resultExpression = (path, base, hasSibling) => {
    let name;
    let resultPromises;
    for (let i = 0, n = parsedPatterns.length; i < n; i++) {
      const parsedPattern = parsedPatterns[i];
      if (parsedPattern.requiresSiblings && hasSibling) {
        if (!base) {
          base = basename(path);
        }
        if (!name) {
          name = base.substr(0, base.length - extname(path).length);
        }
      }
      const result = parsedPattern(path, base, name, hasSibling);
      if (typeof result === "string") {
        return result;
      }
      if (isThenable(result)) {
        if (!resultPromises) {
          resultPromises = [];
        }
        resultPromises.push(result);
      }
    }
    if (resultPromises) {
      return (async () => {
        for (const resultPromise of resultPromises) {
          const result = await resultPromise;
          if (typeof result === "string") {
            return result;
          }
        }
        return null;
      })();
    }
    return null;
  };
  const withBasenames = parsedPatterns.find(
    (pattern) => !!pattern.allBasenames
  );
  if (withBasenames) {
    resultExpression.allBasenames = withBasenames.allBasenames;
  }
  const allPaths = parsedPatterns.reduce(
    (all, current) => current.allPaths ? all.concat(current.allPaths) : all,
    []
  );
  if (allPaths.length) {
    resultExpression.allPaths = allPaths;
  }
  return resultExpression;
}
function parseExpressionPattern(pattern, value, options) {
  if (value === false) {
    return NULL;
  }
  const parsedPattern = parsePattern(pattern, options);
  if (parsedPattern === NULL) {
    return NULL;
  }
  if (typeof value === "boolean") {
    return parsedPattern;
  }
  if (value) {
    const when = value.when;
    if (typeof when === "string") {
      const result = (path, basename2, name, hasSibling) => {
        if (!hasSibling || !parsedPattern(path, basename2)) {
          return null;
        }
        const clausePattern = when.replace("$(basename)", () => name);
        const matched = hasSibling(clausePattern);
        return isThenable(matched) ? matched.then((match2) => match2 ? pattern : null) : matched ? pattern : null;
      };
      result.requiresSiblings = true;
      return result;
    }
  }
  return parsedPattern;
}
function aggregateBasenameMatches(parsedPatterns, result) {
  const basenamePatterns = parsedPatterns.filter(
    (parsedPattern) => !!parsedPattern.basenames
  );
  if (basenamePatterns.length < 2) {
    return parsedPatterns;
  }
  const basenames = basenamePatterns.reduce((all, current) => {
    const basenames2 = current.basenames;
    return basenames2 ? all.concat(basenames2) : all;
  }, []);
  let patterns;
  if (result) {
    patterns = [];
    for (let i = 0, n = basenames.length; i < n; i++) {
      patterns.push(result);
    }
  } else {
    patterns = basenamePatterns.reduce((all, current) => {
      const patterns2 = current.patterns;
      return patterns2 ? all.concat(patterns2) : all;
    }, []);
  }
  const aggregate = (path, basename2) => {
    if (typeof path !== "string") {
      return null;
    }
    if (!basename2) {
      let i;
      for (i = path.length; i > 0; i--) {
        const ch = path.charCodeAt(i - 1);
        if (ch === CharCode.Slash || ch === CharCode.Backslash) {
          break;
        }
      }
      basename2 = path.substr(i);
    }
    const index = basenames.indexOf(basename2);
    return index !== -1 ? patterns[index] : null;
  };
  aggregate.basenames = basenames;
  aggregate.patterns = patterns;
  aggregate.allBasenames = basenames;
  const aggregatedPatterns = parsedPatterns.filter(
    (parsedPattern) => !parsedPattern.basenames
  );
  aggregatedPatterns.push(aggregate);
  return aggregatedPatterns;
}
function patternsEquals(patternsA, patternsB) {
  return equals(patternsA, patternsB, (a, b) => {
    if (typeof a === "string" && typeof b === "string") {
      return a === b;
    }
    if (typeof a !== "string" && typeof b !== "string") {
      return a.base === b.base && a.pattern === b.pattern;
    }
    return false;
  });
}
export {
  GLOBSTAR,
  GLOB_SPLIT,
  getBasenameTerms,
  getEmptyExpression,
  getPathTerms,
  isRelativePattern,
  match,
  parse,
  patternsEquals,
  splitGlobAware
};
