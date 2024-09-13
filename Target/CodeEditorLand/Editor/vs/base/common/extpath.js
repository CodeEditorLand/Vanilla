var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CharCode } from "./charCode.js";
import { isAbsolute, join, normalize, posix, sep } from "./path.js";
import { isWindows } from "./platform.js";
import { equalsIgnoreCase, rtrim, startsWithIgnoreCase } from "./strings.js";
import { isNumber } from "./types.js";
function isPathSeparator(code) {
  return code === CharCode.Slash || code === CharCode.Backslash;
}
__name(isPathSeparator, "isPathSeparator");
function toSlashes(osPath) {
  return osPath.replace(/[\\/]/g, posix.sep);
}
__name(toSlashes, "toSlashes");
function toPosixPath(osPath) {
  if (osPath.indexOf("/") === -1) {
    osPath = toSlashes(osPath);
  }
  if (/^[a-zA-Z]:(\/|$)/.test(osPath)) {
    osPath = "/" + osPath;
  }
  return osPath;
}
__name(toPosixPath, "toPosixPath");
function getRoot(path, sep2 = posix.sep) {
  if (!path) {
    return "";
  }
  const len = path.length;
  const firstLetter = path.charCodeAt(0);
  if (isPathSeparator(firstLetter)) {
    if (isPathSeparator(path.charCodeAt(1))) {
      if (!isPathSeparator(path.charCodeAt(2))) {
        let pos2 = 3;
        const start = pos2;
        for (; pos2 < len; pos2++) {
          if (isPathSeparator(path.charCodeAt(pos2))) {
            break;
          }
        }
        if (start !== pos2 && !isPathSeparator(path.charCodeAt(pos2 + 1))) {
          pos2 += 1;
          for (; pos2 < len; pos2++) {
            if (isPathSeparator(path.charCodeAt(pos2))) {
              return path.slice(0, pos2 + 1).replace(/[\\/]/g, sep2);
            }
          }
        }
      }
    }
    return sep2;
  } else if (isWindowsDriveLetter(firstLetter)) {
    if (path.charCodeAt(1) === CharCode.Colon) {
      if (isPathSeparator(path.charCodeAt(2))) {
        return path.slice(0, 2) + sep2;
      } else {
        return path.slice(0, 2);
      }
    }
  }
  let pos = path.indexOf("://");
  if (pos !== -1) {
    pos += 3;
    for (; pos < len; pos++) {
      if (isPathSeparator(path.charCodeAt(pos))) {
        return path.slice(0, pos + 1);
      }
    }
  }
  return "";
}
__name(getRoot, "getRoot");
function isUNC(path) {
  if (!isWindows) {
    return false;
  }
  if (!path || path.length < 5) {
    return false;
  }
  let code = path.charCodeAt(0);
  if (code !== CharCode.Backslash) {
    return false;
  }
  code = path.charCodeAt(1);
  if (code !== CharCode.Backslash) {
    return false;
  }
  let pos = 2;
  const start = pos;
  for (; pos < path.length; pos++) {
    code = path.charCodeAt(pos);
    if (code === CharCode.Backslash) {
      break;
    }
  }
  if (start === pos) {
    return false;
  }
  code = path.charCodeAt(pos + 1);
  if (isNaN(code) || code === CharCode.Backslash) {
    return false;
  }
  return true;
}
__name(isUNC, "isUNC");
const WINDOWS_INVALID_FILE_CHARS = /[\\/:*?"<>|]/g;
const UNIX_INVALID_FILE_CHARS = /[/]/g;
const WINDOWS_FORBIDDEN_NAMES = /^(con|prn|aux|clock\$|nul|lpt[0-9]|com[0-9])(\.(.*?))?$/i;
function isValidBasename(name, isWindowsOS = isWindows) {
  const invalidFileChars = isWindowsOS ? WINDOWS_INVALID_FILE_CHARS : UNIX_INVALID_FILE_CHARS;
  if (!name || name.length === 0 || /^\s+$/.test(name)) {
    return false;
  }
  invalidFileChars.lastIndex = 0;
  if (invalidFileChars.test(name)) {
    return false;
  }
  if (isWindowsOS && WINDOWS_FORBIDDEN_NAMES.test(name)) {
    return false;
  }
  if (name === "." || name === "..") {
    return false;
  }
  if (isWindowsOS && name[name.length - 1] === ".") {
    return false;
  }
  if (isWindowsOS && name.length !== name.trim().length) {
    return false;
  }
  if (name.length > 255) {
    return false;
  }
  return true;
}
__name(isValidBasename, "isValidBasename");
function isEqual(pathA, pathB, ignoreCase) {
  const identityEquals = pathA === pathB;
  if (!ignoreCase || identityEquals) {
    return identityEquals;
  }
  if (!pathA || !pathB) {
    return false;
  }
  return equalsIgnoreCase(pathA, pathB);
}
__name(isEqual, "isEqual");
function isEqualOrParent(base, parentCandidate, ignoreCase, separator = sep) {
  if (base === parentCandidate) {
    return true;
  }
  if (!base || !parentCandidate) {
    return false;
  }
  if (parentCandidate.length > base.length) {
    return false;
  }
  if (ignoreCase) {
    const beginsWith = startsWithIgnoreCase(base, parentCandidate);
    if (!beginsWith) {
      return false;
    }
    if (parentCandidate.length === base.length) {
      return true;
    }
    let sepOffset = parentCandidate.length;
    if (parentCandidate.charAt(parentCandidate.length - 1) === separator) {
      sepOffset--;
    }
    return base.charAt(sepOffset) === separator;
  }
  if (parentCandidate.charAt(parentCandidate.length - 1) !== separator) {
    parentCandidate += separator;
  }
  return base.indexOf(parentCandidate) === 0;
}
__name(isEqualOrParent, "isEqualOrParent");
function isWindowsDriveLetter(char0) {
  return char0 >= CharCode.A && char0 <= CharCode.Z || char0 >= CharCode.a && char0 <= CharCode.z;
}
__name(isWindowsDriveLetter, "isWindowsDriveLetter");
function sanitizeFilePath(candidate, cwd) {
  if (isWindows && candidate.endsWith(":")) {
    candidate += sep;
  }
  if (!isAbsolute(candidate)) {
    candidate = join(cwd, candidate);
  }
  candidate = normalize(candidate);
  return removeTrailingPathSeparator(candidate);
}
__name(sanitizeFilePath, "sanitizeFilePath");
function removeTrailingPathSeparator(candidate) {
  if (isWindows) {
    candidate = rtrim(candidate, sep);
    if (candidate.endsWith(":")) {
      candidate += sep;
    }
  } else {
    candidate = rtrim(candidate, sep);
    if (!candidate) {
      candidate = sep;
    }
  }
  return candidate;
}
__name(removeTrailingPathSeparator, "removeTrailingPathSeparator");
function isRootOrDriveLetter(path) {
  const pathNormalized = normalize(path);
  if (isWindows) {
    if (path.length > 3) {
      return false;
    }
    return hasDriveLetter(pathNormalized) && (path.length === 2 || pathNormalized.charCodeAt(2) === CharCode.Backslash);
  }
  return pathNormalized === posix.sep;
}
__name(isRootOrDriveLetter, "isRootOrDriveLetter");
function hasDriveLetter(path, isWindowsOS = isWindows) {
  if (isWindowsOS) {
    return isWindowsDriveLetter(path.charCodeAt(0)) && path.charCodeAt(1) === CharCode.Colon;
  }
  return false;
}
__name(hasDriveLetter, "hasDriveLetter");
function getDriveLetter(path, isWindowsOS = isWindows) {
  return hasDriveLetter(path, isWindowsOS) ? path[0] : void 0;
}
__name(getDriveLetter, "getDriveLetter");
function indexOfPath(path, candidate, ignoreCase) {
  if (candidate.length > path.length) {
    return -1;
  }
  if (path === candidate) {
    return 0;
  }
  if (ignoreCase) {
    path = path.toLowerCase();
    candidate = candidate.toLowerCase();
  }
  return path.indexOf(candidate);
}
__name(indexOfPath, "indexOfPath");
function parseLineAndColumnAware(rawPath) {
  const segments = rawPath.split(":");
  let path;
  let line;
  let column;
  for (const segment of segments) {
    const segmentAsNumber = Number(segment);
    if (!isNumber(segmentAsNumber)) {
      path = !!path ? [path, segment].join(":") : segment;
    } else if (line === void 0) {
      line = segmentAsNumber;
    } else if (column === void 0) {
      column = segmentAsNumber;
    }
  }
  if (!path) {
    throw new Error("Format for `--goto` should be: `FILE:LINE(:COLUMN)`");
  }
  return {
    path,
    line: line !== void 0 ? line : void 0,
    column: column !== void 0 ? column : line !== void 0 ? 1 : void 0
    // if we have a line, make sure column is also set
  };
}
__name(parseLineAndColumnAware, "parseLineAndColumnAware");
const pathChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const windowsSafePathFirstChars = "BDEFGHIJKMOQRSTUVWXYZbdefghijkmoqrstuvwxyz0123456789";
function randomPath(parent, prefix, randomLength = 8) {
  let suffix = "";
  for (let i = 0; i < randomLength; i++) {
    let pathCharsTouse;
    if (i === 0 && isWindows && !prefix && (randomLength === 3 || randomLength === 4)) {
      pathCharsTouse = windowsSafePathFirstChars;
    } else {
      pathCharsTouse = pathChars;
    }
    suffix += pathCharsTouse.charAt(
      Math.floor(Math.random() * pathCharsTouse.length)
    );
  }
  let randomFileName;
  if (prefix) {
    randomFileName = `${prefix}-${suffix}`;
  } else {
    randomFileName = suffix;
  }
  if (parent) {
    return join(parent, randomFileName);
  }
  return randomFileName;
}
__name(randomPath, "randomPath");
export {
  getDriveLetter,
  getRoot,
  hasDriveLetter,
  indexOfPath,
  isEqual,
  isEqualOrParent,
  isPathSeparator,
  isRootOrDriveLetter,
  isUNC,
  isValidBasename,
  isWindowsDriveLetter,
  parseLineAndColumnAware,
  randomPath,
  removeTrailingPathSeparator,
  sanitizeFilePath,
  toPosixPath,
  toSlashes
};
//# sourceMappingURL=extpath.js.map
