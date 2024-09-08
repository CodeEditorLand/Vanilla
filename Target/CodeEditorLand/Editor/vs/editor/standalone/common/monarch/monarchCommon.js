var MonarchBracket = /* @__PURE__ */ ((MonarchBracket2) => {
  MonarchBracket2[MonarchBracket2["None"] = 0] = "None";
  MonarchBracket2[MonarchBracket2["Open"] = 1] = "Open";
  MonarchBracket2[MonarchBracket2["Close"] = -1] = "Close";
  return MonarchBracket2;
})(MonarchBracket || {});
function isFuzzyActionArr(what) {
  return Array.isArray(what);
}
function isFuzzyAction(what) {
  return !isFuzzyActionArr(what);
}
function isString(what) {
  return typeof what === "string";
}
function isIAction(what) {
  return !isString(what);
}
function empty(s) {
  return s ? false : true;
}
function fixCase(lexer, str) {
  return lexer.ignoreCase && str ? str.toLowerCase() : str;
}
function sanitize(s) {
  return s.replace(/[&<>'"_]/g, "-");
}
function log(lexer, msg) {
  console.log(`${lexer.languageId}: ${msg}`);
}
function createError(lexer, msg) {
  return new Error(`${lexer.languageId}: ${msg}`);
}
function substituteMatches(lexer, str, id, matches, state) {
  const re = /\$((\$)|(#)|(\d\d?)|[sS](\d\d?)|@(\w+))/g;
  let stateMatches = null;
  return str.replace(
    re,
    (full, sub, dollar, hash, n, s, attr, ofs, total) => {
      if (!empty(dollar)) {
        return "$";
      }
      if (!empty(hash)) {
        return fixCase(lexer, id);
      }
      if (!empty(n) && n < matches.length) {
        return fixCase(lexer, matches[n]);
      }
      if (!empty(attr) && lexer && typeof lexer[attr] === "string") {
        return lexer[attr];
      }
      if (stateMatches === null) {
        stateMatches = state.split(".");
        stateMatches.unshift(state);
      }
      if (!empty(s) && s < stateMatches.length) {
        return fixCase(lexer, stateMatches[s]);
      }
      return "";
    }
  );
}
function substituteMatchesRe(lexer, str, state) {
  const re = /\$[sS](\d\d?)/g;
  let stateMatches = null;
  return str.replace(re, (full, s) => {
    if (stateMatches === null) {
      stateMatches = state.split(".");
      stateMatches.unshift(state);
    }
    if (!empty(s) && s < stateMatches.length) {
      return fixCase(lexer, stateMatches[s]);
    }
    return "";
  });
}
function findRules(lexer, inState) {
  let state = inState;
  while (state && state.length > 0) {
    const rules = lexer.tokenizer[state];
    if (rules) {
      return rules;
    }
    const idx = state.lastIndexOf(".");
    if (idx < 0) {
      state = null;
    } else {
      state = state.substr(0, idx);
    }
  }
  return null;
}
function stateExists(lexer, inState) {
  let state = inState;
  while (state && state.length > 0) {
    const exist = lexer.stateNames[state];
    if (exist) {
      return true;
    }
    const idx = state.lastIndexOf(".");
    if (idx < 0) {
      state = null;
    } else {
      state = state.substr(0, idx);
    }
  }
  return false;
}
export {
  MonarchBracket,
  createError,
  empty,
  findRules,
  fixCase,
  isFuzzyAction,
  isFuzzyActionArr,
  isIAction,
  isString,
  log,
  sanitize,
  stateExists,
  substituteMatches,
  substituteMatchesRe
};
