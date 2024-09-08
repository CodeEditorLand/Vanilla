import assert from "assert";
import { timeout } from "../../../../base/common/async.js";
import { mock } from "../../../../base/test/common/mock.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
import {
  ConsoleMainLogger
} from "../../../../platform/log/common/log.js";
import { LogService } from "../../../../platform/log/common/logService.js";
import {
  TextModelTreeSitter,
  TreeSitterImporter,
  TreeSitterLanguages
} from "../../../browser/services/treeSitter/treeSitterParserService.js";
import { createTextModel } from "../../common/testTextModel.js";
class MockParser {
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
  async getParserClass() {
    return MockParser;
  }
}
class MockTree {
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
suite("TreeSitterParserService", () => {
  const treeSitterImporter = new MockTreeSitterImporter();
  let logService;
  let telemetryService;
  setup(() => {
    logService = new LogService(new ConsoleMainLogger());
    telemetryService = new class extends mock() {
      async publicLog2() {
      }
    }();
  });
  const store = ensureNoDisposablesAreLeakedInTestSuite();
  test("TextModelTreeSitter race condition: first language is slow to load", async () => {
    class MockTreeSitterLanguages extends TreeSitterLanguages {
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
    const treeSitterParser = store.add(
      new MockTreeSitterLanguages(
        treeSitterImporter,
        {},
        { isBuilt: false },
        /* @__PURE__ */ new Map()
      )
    );
    const textModel = store.add(
      createTextModel('console.log("Hello, world!");', "javascript")
    );
    const textModelTreeSitter = store.add(
      new TextModelTreeSitter(
        textModel,
        treeSitterParser,
        treeSitterImporter,
        logService,
        telemetryService
      )
    );
    textModel.setLanguage("typescript");
    await timeout(300);
    assert.strictEqual(
      (textModelTreeSitter.parseResult?.language).languageId,
      "typescript"
    );
  });
});
