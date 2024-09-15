var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class ExplorerFileNestingTrie {
  static {
    __name(this, "ExplorerFileNestingTrie");
  }
  root = new PreTrie();
  constructor(config) {
    for (const [parentPattern, childPatterns] of config) {
      for (const childPattern of childPatterns) {
        this.root.add(parentPattern, childPattern);
      }
    }
  }
  toString() {
    return this.root.toString();
  }
  getAttributes(filename, dirname) {
    const lastDot = filename.lastIndexOf(".");
    if (lastDot < 1) {
      return {
        dirname,
        basename: filename,
        extname: ""
      };
    } else {
      return {
        dirname,
        basename: filename.substring(0, lastDot),
        extname: filename.substring(lastDot + 1)
      };
    }
  }
  nest(files, dirname) {
    const parentFinder = new PreTrie();
    for (const potentialParent of files) {
      const attributes = this.getAttributes(potentialParent, dirname);
      const children = this.root.get(potentialParent, attributes);
      for (const child of children) {
        parentFinder.add(child, potentialParent);
      }
    }
    const findAllRootAncestors = /* @__PURE__ */ __name((file, seen = /* @__PURE__ */ new Set()) => {
      if (seen.has(file)) {
        return [];
      }
      seen.add(file);
      const attributes = this.getAttributes(file, dirname);
      const ancestors = parentFinder.get(file, attributes);
      if (ancestors.length === 0) {
        return [file];
      }
      if (ancestors.length === 1 && ancestors[0] === file) {
        return [file];
      }
      return ancestors.flatMap((a) => findAllRootAncestors(a, seen));
    }, "findAllRootAncestors");
    const result = /* @__PURE__ */ new Map();
    for (const file of files) {
      let ancestors = findAllRootAncestors(file);
      if (ancestors.length === 0) {
        ancestors = [file];
      }
      for (const ancestor of ancestors) {
        let existing = result.get(ancestor);
        if (!existing) {
          result.set(ancestor, existing = /* @__PURE__ */ new Set());
        }
        if (file !== ancestor) {
          existing.add(file);
        }
      }
    }
    return result;
  }
}
class PreTrie {
  static {
    __name(this, "PreTrie");
  }
  value = new SufTrie();
  map = /* @__PURE__ */ new Map();
  constructor() {
  }
  add(key, value) {
    if (key === "") {
      this.value.add(key, value);
    } else if (key[0] === "*") {
      this.value.add(key, value);
    } else {
      const head = key[0];
      const rest = key.slice(1);
      let existing = this.map.get(head);
      if (!existing) {
        this.map.set(head, existing = new PreTrie());
      }
      existing.add(rest, value);
    }
  }
  get(key, attributes) {
    const results = [];
    results.push(...this.value.get(key, attributes));
    const head = key[0];
    const rest = key.slice(1);
    const existing = this.map.get(head);
    if (existing) {
      results.push(...existing.get(rest, attributes));
    }
    return results;
  }
  toString(indentation = "") {
    const lines = [];
    if (this.value.hasItems) {
      lines.push("* => \n" + this.value.toString(indentation + "  "));
    }
    [...this.map.entries()].map(([key, trie]) => lines.push("^" + key + " => \n" + trie.toString(indentation + "  ")));
    return lines.map((l) => indentation + l).join("\n");
  }
}
class SufTrie {
  static {
    __name(this, "SufTrie");
  }
  star = [];
  epsilon = [];
  map = /* @__PURE__ */ new Map();
  hasItems = false;
  constructor() {
  }
  add(key, value) {
    this.hasItems = true;
    if (key === "*") {
      this.star.push(new SubstitutionString(value));
    } else if (key === "") {
      this.epsilon.push(new SubstitutionString(value));
    } else {
      const tail = key[key.length - 1];
      const rest = key.slice(0, key.length - 1);
      if (tail === "*") {
        throw Error("Unexpected star in SufTrie key: " + key);
      } else {
        let existing = this.map.get(tail);
        if (!existing) {
          this.map.set(tail, existing = new SufTrie());
        }
        existing.add(rest, value);
      }
    }
  }
  get(key, attributes) {
    const results = [];
    if (key === "") {
      results.push(...this.epsilon.map((ss) => ss.substitute(attributes)));
    }
    if (this.star.length) {
      results.push(...this.star.map((ss) => ss.substitute(attributes, key)));
    }
    const tail = key[key.length - 1];
    const rest = key.slice(0, key.length - 1);
    const existing = this.map.get(tail);
    if (existing) {
      results.push(...existing.get(rest, attributes));
    }
    return results;
  }
  toString(indentation = "") {
    const lines = [];
    if (this.star.length) {
      lines.push("* => " + this.star.join("; "));
    }
    if (this.epsilon.length) {
      lines.push("\u03B5 => " + this.epsilon.join("; "));
    }
    [...this.map.entries()].map(([key, trie]) => lines.push(key + "$ => \n" + trie.toString(indentation + "  ")));
    return lines.map((l) => indentation + l).join("\n");
  }
}
var SubstitutionType = /* @__PURE__ */ ((SubstitutionType2) => {
  SubstitutionType2["capture"] = "capture";
  SubstitutionType2["basename"] = "basename";
  SubstitutionType2["dirname"] = "dirname";
  SubstitutionType2["extname"] = "extname";
  return SubstitutionType2;
})(SubstitutionType || {});
const substitutionStringTokenizer = /\$[({](capture|basename|dirname|extname)[)}]/g;
class SubstitutionString {
  static {
    __name(this, "SubstitutionString");
  }
  tokens = [];
  constructor(pattern) {
    substitutionStringTokenizer.lastIndex = 0;
    let token;
    let lastIndex = 0;
    while (token = substitutionStringTokenizer.exec(pattern)) {
      const prefix = pattern.slice(lastIndex, token.index);
      this.tokens.push(prefix);
      const type = token[1];
      switch (type) {
        case "basename" /* basename */:
        case "dirname" /* dirname */:
        case "extname" /* extname */:
        case "capture" /* capture */:
          this.tokens.push({ capture: type });
          break;
        default:
          throw Error("unknown substitution type: " + type);
      }
      lastIndex = token.index + token[0].length;
    }
    if (lastIndex !== pattern.length) {
      const suffix = pattern.slice(lastIndex, pattern.length);
      this.tokens.push(suffix);
    }
  }
  substitute(attributes, capture) {
    return this.tokens.map((t) => {
      if (typeof t === "string") {
        return t;
      }
      switch (t.capture) {
        case "basename" /* basename */:
          return attributes.basename;
        case "dirname" /* dirname */:
          return attributes.dirname;
        case "extname" /* extname */:
          return attributes.extname;
        case "capture" /* capture */:
          return capture || "";
      }
    }).join("");
  }
}
export {
  ExplorerFileNestingTrie,
  PreTrie,
  SufTrie
};
//# sourceMappingURL=explorerFileNestingTrie.js.map
