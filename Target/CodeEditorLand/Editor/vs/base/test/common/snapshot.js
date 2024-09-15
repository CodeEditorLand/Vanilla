var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Lazy } from "../../common/lazy.js";
import { FileAccess } from "../../common/network.js";
import { URI } from "../../common/uri.js";
let context;
const sanitizeName = /* @__PURE__ */ __name((name) => name.replace(/[^a-z0-9_-]/gi, "_"), "sanitizeName");
const normalizeCrlf = /* @__PURE__ */ __name((str) => str.replace(/\r\n/g, "\n"), "normalizeCrlf");
class SnapshotContext {
  constructor(test) {
    this.test = test;
    if (!test) {
      throw new Error("assertSnapshot can only be used in a test");
    }
    if (!test.file) {
      throw new Error("currentTest.file is not set, please open an issue with the test you're trying to run");
    }
    const src = FileAccess.asFileUri("");
    const parts = test.file.split(/[/\\]/g);
    this.namePrefix = sanitizeName(test.fullTitle()) + ".";
    this.snapshotsDir = URI.joinPath(src, ...[...parts.slice(0, -1), "__snapshots__"]);
  }
  static {
    __name(this, "SnapshotContext");
  }
  nextIndex = 0;
  snapshotsDir;
  namePrefix;
  usedNames = /* @__PURE__ */ new Set();
  async assert(value, options) {
    const originalStack = new Error().stack;
    const nameOrIndex = options?.name ? sanitizeName(options.name) : this.nextIndex++;
    const fileName = this.namePrefix + nameOrIndex + "." + (options?.extension || "snap");
    this.usedNames.add(fileName);
    const fpath = URI.joinPath(this.snapshotsDir, fileName).fsPath;
    const actual = formatValue(value);
    let expected;
    try {
      expected = await __readFileInTests(fpath);
    } catch {
      console.info(`Creating new snapshot in: ${fpath}`);
      await __mkdirPInTests(this.snapshotsDir.fsPath);
      await __writeFileInTests(fpath, actual);
      return;
    }
    if (normalizeCrlf(expected) !== normalizeCrlf(actual)) {
      await __writeFileInTests(fpath + ".actual", actual);
      const err = new Error(`Snapshot #${nameOrIndex} does not match expected output`);
      err.expected = expected;
      err.actual = actual;
      err.snapshotPath = fpath;
      err.stack = err.stack.split("\n").slice(0, 1).concat(originalStack.split("\n").slice(3)).join("\n");
      throw err;
    }
  }
  async removeOldSnapshots() {
    const contents = await __readDirInTests(this.snapshotsDir.fsPath);
    const toDelete = contents.filter((f) => f.startsWith(this.namePrefix) && !this.usedNames.has(f));
    if (toDelete.length) {
      console.info(`Deleting ${toDelete.length} old snapshots for ${this.test?.fullTitle()}`);
    }
    await Promise.all(toDelete.map((f) => __unlinkInTests(URI.joinPath(this.snapshotsDir, f).fsPath)));
  }
}
const debugDescriptionSymbol = Symbol.for("debug.description");
function formatValue(value, level = 0, seen = []) {
  switch (typeof value) {
    case "bigint":
    case "boolean":
    case "number":
    case "symbol":
    case "undefined":
      return String(value);
    case "string":
      return level === 0 ? value : JSON.stringify(value);
    case "function":
      return `[Function ${value.name}]`;
    case "object": {
      if (value === null) {
        return "null";
      }
      if (value instanceof RegExp) {
        return String(value);
      }
      if (seen.includes(value)) {
        return "[Circular]";
      }
      if (debugDescriptionSymbol in value && typeof value[debugDescriptionSymbol] === "function") {
        return value[debugDescriptionSymbol]();
      }
      const oi = "  ".repeat(level);
      const ci = "  ".repeat(level + 1);
      if (Array.isArray(value)) {
        const children = value.map((v) => formatValue(v, level + 1, [...seen, value]));
        const multiline = children.some((c) => c.includes("\n")) || children.join(", ").length > 80;
        return multiline ? `[
${ci}${children.join(`,
${ci}`)}
${oi}]` : `[ ${children.join(", ")} ]`;
      }
      let entries;
      let prefix = "";
      if (value instanceof Map) {
        prefix = "Map ";
        entries = [...value.entries()];
      } else if (value instanceof Set) {
        prefix = "Set ";
        entries = [...value.entries()];
      } else {
        entries = Object.entries(value);
      }
      const lines = entries.map(([k, v]) => `${k}: ${formatValue(v, level + 1, [...seen, value])}`);
      return prefix + (lines.length > 1 ? `{
${ci}${lines.join(`,
${ci}`)}
${oi}}` : `{ ${lines.join(",\n")} }`);
    }
    default:
      throw new Error(`Unknown type ${value}`);
  }
}
__name(formatValue, "formatValue");
setup(function() {
  const currentTest = this.currentTest;
  context = new Lazy(() => new SnapshotContext(currentTest));
});
teardown(async function() {
  if (this.currentTest?.state === "passed") {
    await context?.rawValue?.removeOldSnapshots();
  }
  context = void 0;
});
function assertSnapshot(value, options) {
  if (!context) {
    throw new Error("assertSnapshot can only be used in a test");
  }
  return context.value.assert(value, options);
}
__name(assertSnapshot, "assertSnapshot");
export {
  SnapshotContext,
  assertSnapshot
};
//# sourceMappingURL=snapshot.js.map
