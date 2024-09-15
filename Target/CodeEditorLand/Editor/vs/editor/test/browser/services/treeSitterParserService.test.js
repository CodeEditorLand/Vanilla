var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
import { TextModelTreeSitter, TreeSitterImporter, TreeSitterLanguages } from "../../../browser/services/treeSitter/treeSitterParserService.js";
import { createTextModel } from "../../common/testTextModel.js";
import { timeout } from "../../../../base/common/async.js";
import { ConsoleMainLogger, ILogService } from "../../../../platform/log/common/log.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { LogService } from "../../../../platform/log/common/logService.js";
import { mock } from "../../../../base/test/common/mock.js";
class MockParser {
  static {
    __name(this, "MockParser");
  }
  static async init() {
  }
  delete() {
  }
  parse(input, oldTree, options) {
    return new MockTree();
  }
  getIncludedRanges() {
    return [];
  }
  getTimeoutMicros() {
    return 0;
  }
  setTimeoutMicros(timeout2) {
  }
  reset() {
  }
  getLanguage() {
    return {};
  }
  setLanguage() {
  }
  getLogger() {
    throw new Error("Method not implemented.");
  }
  setLogger(logFunc) {
    throw new Error("Method not implemented.");
  }
}
class MockTreeSitterImporter extends TreeSitterImporter {
  static {
    __name(this, "MockTreeSitterImporter");
  }
  async getParserClass() {
    return MockParser;
  }
}
class MockTree {
  static {
    __name(this, "MockTree");
  }
  editorLanguage = "";
  editorContents = "";
  rootNode = {};
  rootNodeWithOffset(offsetBytes, offsetExtent) {
    throw new Error("Method not implemented.");
  }
  copy() {
    throw new Error("Method not implemented.");
  }
  delete() {
  }
  edit(edit) {
    return this;
  }
  walk() {
    throw new Error("Method not implemented.");
  }
  getChangedRanges(other) {
    throw new Error("Method not implemented.");
  }
  getIncludedRanges() {
    throw new Error("Method not implemented.");
  }
  getEditedRange(other) {
    throw new Error("Method not implemented.");
  }
  getLanguage() {
    throw new Error("Method not implemented.");
  }
}
class MockLanguage {
  static {
    __name(this, "MockLanguage");
  }
  version = 0;
  fieldCount = 0;
  stateCount = 0;
  nodeTypeCount = 0;
  fieldNameForId(fieldId) {
    throw new Error("Method not implemented.");
  }
  fieldIdForName(fieldName) {
    throw new Error("Method not implemented.");
  }
  idForNodeType(type, named) {
    throw new Error("Method not implemented.");
  }
  nodeTypeForId(typeId) {
    throw new Error("Method not implemented.");
  }
  nodeTypeIsNamed(typeId) {
    throw new Error("Method not implemented.");
  }
  nodeTypeIsVisible(typeId) {
    throw new Error("Method not implemented.");
  }
  nextState(stateId, typeId) {
    throw new Error("Method not implemented.");
  }
  query(source) {
    throw new Error("Method not implemented.");
  }
  lookaheadIterator(stateId) {
    throw new Error("Method not implemented.");
  }
  languageId = "";
}
suite("TreeSitterParserService", function() {
  const treeSitterImporter = new MockTreeSitterImporter();
  let logService;
  let telemetryService;
  setup(function() {
    logService = new LogService(new ConsoleMainLogger());
    telemetryService = new class extends mock() {
      async publicLog2() {
      }
    }();
  });
  const store = ensureNoDisposablesAreLeakedInTestSuite();
  test("TextModelTreeSitter race condition: first language is slow to load", async function() {
    class MockTreeSitterLanguages extends TreeSitterLanguages {
      static {
        __name(this, "MockTreeSitterLanguages");
      }
      async _fetchJavascript() {
        await timeout(200);
        const language = new MockLanguage();
        language.languageId = "javascript";
        this._onDidAddLanguage.fire({ id: "javascript", language });
      }
      getOrInitLanguage(languageId) {
        if (languageId === "javascript") {
          this._fetchJavascript();
          return void 0;
        }
        const language = new MockLanguage();
        language.languageId = languageId;
        return language;
      }
    }
    const treeSitterParser = store.add(new MockTreeSitterLanguages(treeSitterImporter, {}, { isBuilt: false }, /* @__PURE__ */ new Map()));
    const textModel = store.add(createTextModel('console.log("Hello, world!");', "javascript"));
    const textModelTreeSitter = store.add(new TextModelTreeSitter(textModel, treeSitterParser, treeSitterImporter, logService, telemetryService));
    textModel.setLanguage("typescript");
    await timeout(300);
    assert.strictEqual((textModelTreeSitter.parseResult?.language).languageId, "typescript");
  });
});
//# sourceMappingURL=treeSitterParserService.test.js.map
