var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { Disposable, DisposableStore } from "../../../../../base/common/lifecycle.js";
import { IReader, transaction } from "../../../../../base/common/observable.js";
import { isDefined } from "../../../../../base/common/types.js";
import { Range } from "../../../../../editor/common/core/range.js";
import { linesDiffComputers } from "../../../../../editor/common/diff/linesDiffComputers.js";
import { EndOfLinePreference, ITextModel } from "../../../../../editor/common/model.js";
import { createModelServices, createTextModel } from "../../../../../editor/test/common/testTextModel.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { NullTelemetryService } from "../../../../../platform/telemetry/common/telemetryUtils.js";
import { IMergeDiffComputer, IMergeDiffComputerResult, toLineRange, toRangeMapping } from "../../browser/model/diffComputer.js";
import { DetailedLineRangeMapping } from "../../browser/model/mapping.js";
import { MergeEditorModel } from "../../browser/model/mergeEditorModel.js";
import { MergeEditorTelemetry } from "../../browser/telemetry.js";
suite("merge editor model", () => {
  test("prepend line", async () => {
    await testMergeModel(
      {
        "languageId": "plaintext",
        "base": "line1\nline2",
        "input1": "0\nline1\nline2",
        "input2": "0\nline1\nline2",
        "result": ""
      },
      (model) => {
        assert.deepStrictEqual(model.getProjections(), {
          base: ["\u27E6\u27E7\u2080line1", "line2"],
          input1: ["\u27E60", "\u27E7\u2080line1", "line2"],
          input2: ["\u27E60", "\u27E7\u2080line1", "line2"],
          result: ["\u27E6\u27E7{unrecognized}\u2080"]
        });
        model.toggleConflict(0, 1);
        assert.deepStrictEqual(
          { result: model.getResult() },
          { result: "0\nline1\nline2" }
        );
        model.toggleConflict(0, 2);
        assert.deepStrictEqual(
          { result: model.getResult() },
          { result: "0\n0\nline1\nline2" }
        );
      }
    );
  });
  test("empty base", async () => {
    await testMergeModel(
      {
        "languageId": "plaintext",
        "base": "",
        "input1": "input1",
        "input2": "input2",
        "result": ""
      },
      (model) => {
        assert.deepStrictEqual(model.getProjections(), {
          base: ["\u27E6\u27E7\u2080"],
          input1: ["\u27E6input1\u27E7\u2080"],
          input2: ["\u27E6input2\u27E7\u2080"],
          result: ["\u27E6\u27E7{base}\u2080"]
        });
        model.toggleConflict(0, 1);
        assert.deepStrictEqual(
          { result: model.getResult() },
          { result: "input1" }
        );
        model.toggleConflict(0, 2);
        assert.deepStrictEqual(
          { result: model.getResult() },
          { result: "input2" }
        );
      }
    );
  });
  test("can merge word changes", async () => {
    await testMergeModel(
      {
        "languageId": "plaintext",
        "base": "hello",
        "input1": "hallo",
        "input2": "helloworld",
        "result": ""
      },
      (model) => {
        assert.deepStrictEqual(model.getProjections(), {
          base: ["\u27E6hello\u27E7\u2080"],
          input1: ["\u27E6hallo\u27E7\u2080"],
          input2: ["\u27E6helloworld\u27E7\u2080"],
          result: ["\u27E6\u27E7{unrecognized}\u2080"]
        });
        model.toggleConflict(0, 1);
        model.toggleConflict(0, 2);
        assert.deepStrictEqual(
          { result: model.getResult() },
          { result: "halloworld" }
        );
      }
    );
  });
  test("can combine insertions at end of document", async () => {
    await testMergeModel(
      {
        "languageId": "plaintext",
        "base": "Z\xFCrich\nBern\nBasel\nChur\nGenf\nThun",
        "input1": "Z\xFCrich\nBern\nChur\nDavos\nGenf\nThun\nfunction f(b:boolean) {}",
        "input2": "Z\xFCrich\nBern\nBasel (FCB)\nChur\nGenf\nThun\nfunction f(a:number) {}",
        "result": "Z\xFCrich\nBern\nBasel\nChur\nDavos\nGenf\nThun"
      },
      (model) => {
        assert.deepStrictEqual(model.getProjections(), {
          base: ["Z\xFCrich", "Bern", "\u27E6Basel", "\u27E7\u2080Chur", "\u27E6\u27E7\u2081Genf", "Thun\u27E6\u27E7\u2082"],
          input1: [
            "Z\xFCrich",
            "Bern",
            "\u27E6\u27E7\u2080Chur",
            "\u27E6Davos",
            "\u27E7\u2081Genf",
            "Thun",
            "\u27E6function f(b:boolean) {}\u27E7\u2082"
          ],
          input2: [
            "Z\xFCrich",
            "Bern",
            "\u27E6Basel (FCB)",
            "\u27E7\u2080Chur",
            "\u27E6\u27E7\u2081Genf",
            "Thun",
            "\u27E6function f(a:number) {}\u27E7\u2082"
          ],
          result: [
            "Z\xFCrich",
            "Bern",
            "\u27E6Basel",
            "\u27E7{base}\u2080Chur",
            "\u27E6Davos",
            "\u27E7{1\u2713}\u2081Genf",
            "Thun\u27E6\u27E7{base}\u2082"
          ]
        });
        model.toggleConflict(2, 1);
        model.toggleConflict(2, 2);
        assert.deepStrictEqual(
          { result: model.getResult() },
          {
            result: "Z\xFCrich\nBern\nBasel\nChur\nDavos\nGenf\nThun\nfunction f(b:boolean) {}\nfunction f(a:number) {}"
          }
        );
      }
    );
  });
  test("conflicts are reset", async () => {
    await testMergeModel(
      {
        "languageId": "typescript",
        "base": "import { h } from '../../../../../../vs/base/browser/dom.js';\nimport { Disposable, IDisposable } from '../../../../../../vs/base/common/lifecycle.js';\nimport { CodeEditorWidget } from 'vs/editor/browser/widget/codeEditorWidget';\nimport { EditorOption } from '../../../../../../vs/editor/common/config/editorOptions.js';\nimport { autorun, IReader, observableFromEvent, ObservableValue } from 'vs/workbench/contrib/audioCues/browser/observable';\nimport { LineRange } from '../../../../../../vs/workbench/contrib/mergeEditor/browser/model/lineRange.js';\n",
        "input1": "import { h } from '../../../../../../vs/base/browser/dom.js';\nimport { Disposable, IDisposable } from '../../../../../../vs/base/common/lifecycle.js';\nimport { observableSignalFromEvent } from '../../../../../../vs/base/common/observable.js';\nimport { CodeEditorWidget } from 'vs/editor/browser/widget/codeEditorWidget';\nimport { autorun, IReader, observableFromEvent } from 'vs/workbench/contrib/audioCues/browser/observable';\nimport { LineRange } from '../../../../../../vs/workbench/contrib/mergeEditor/browser/model/lineRange.js';\n",
        "input2": "import { h } from '../../../../../../vs/base/browser/dom.js';\nimport { Disposable, IDisposable } from '../../../../../../vs/base/common/lifecycle.js';\nimport { CodeEditorWidget } from 'vs/editor/browser/widget/codeEditorWidget';\nimport { autorun, IReader, observableFromEvent, ObservableValue } from 'vs/workbench/contrib/audioCues/browser/observable';\nimport { LineRange } from '../../../../../../vs/workbench/contrib/mergeEditor/browser/model/lineRange.js';\n",
        "result": "import { h } from '../../../../../../vs/base/browser/dom.js';\r\nimport { Disposable, IDisposable } from '../../../../../../vs/base/common/lifecycle.js';\r\nimport { observableSignalFromEvent } from '../../../../../../vs/base/common/observable.js';\r\nimport { CodeEditorWidget } from 'vs/editor/browser/widget/codeEditorWidget';\r\n<<<<<<< Updated upstream\r\nimport { autorun, IReader, observableFromEvent, ObservableValue } from 'vs/workbench/contrib/audioCues/browser/observable';\r\n=======\r\nimport { autorun, IReader, observableFromEvent } from 'vs/workbench/contrib/audioCues/browser/observable';\r\n>>>>>>> Stashed changes\r\nimport { LineRange } from '../../../../../../vs/workbench/contrib/mergeEditor/browser/model/lineRange.js';\r\n"
      },
      (model) => {
        assert.deepStrictEqual(model.getProjections(), {
          base: [
            "import { h } from '../../../../../../vs/base/browser/dom.js';",
            "import { Disposable, IDisposable } from '../../../../../../vs/base/common/lifecycle.js';",
            "\u27E6\u27E7\u2080import { CodeEditorWidget } from 'vs/editor/browser/widget/codeEditorWidget';",
            "\u27E6import { EditorOption } from '../../../../../../vs/editor/common/config/editorOptions.js';",
            "import { autorun, IReader, observableFromEvent, ObservableValue } from 'vs/workbench/contrib/audioCues/browser/observable';",
            "\u27E7\u2081import { LineRange } from '../../../../../../vs/workbench/contrib/mergeEditor/browser/model/lineRange.js';",
            ""
          ],
          input1: [
            "import { h } from '../../../../../../vs/base/browser/dom.js';",
            "import { Disposable, IDisposable } from '../../../../../../vs/base/common/lifecycle.js';",
            "\u27E6import { observableSignalFromEvent } from '../../../../../../vs/base/common/observable.js';",
            "\u27E7\u2080import { CodeEditorWidget } from 'vs/editor/browser/widget/codeEditorWidget';",
            "\u27E6import { autorun, IReader, observableFromEvent } from 'vs/workbench/contrib/audioCues/browser/observable';",
            "\u27E7\u2081import { LineRange } from '../../../../../../vs/workbench/contrib/mergeEditor/browser/model/lineRange.js';",
            ""
          ],
          input2: [
            "import { h } from '../../../../../../vs/base/browser/dom.js';",
            "import { Disposable, IDisposable } from '../../../../../../vs/base/common/lifecycle.js';",
            "\u27E6\u27E7\u2080import { CodeEditorWidget } from 'vs/editor/browser/widget/codeEditorWidget';",
            "\u27E6import { autorun, IReader, observableFromEvent, ObservableValue } from 'vs/workbench/contrib/audioCues/browser/observable';",
            "\u27E7\u2081import { LineRange } from '../../../../../../vs/workbench/contrib/mergeEditor/browser/model/lineRange.js';",
            ""
          ],
          result: [
            "import { h } from '../../../../../../vs/base/browser/dom.js';",
            "import { Disposable, IDisposable } from '../../../../../../vs/base/common/lifecycle.js';",
            "\u27E6import { observableSignalFromEvent } from '../../../../../../vs/base/common/observable.js';",
            "\u27E7{1\u2713}\u2080import { CodeEditorWidget } from 'vs/editor/browser/widget/codeEditorWidget';",
            "\u27E6<<<<<<< Updated upstream",
            "import { autorun, IReader, observableFromEvent, ObservableValue } from 'vs/workbench/contrib/audioCues/browser/observable';",
            "=======",
            "import { autorun, IReader, observableFromEvent } from 'vs/workbench/contrib/audioCues/browser/observable';",
            ">>>>>>> Stashed changes",
            "\u27E7{unrecognized}\u2081import { LineRange } from '../../../../../../vs/workbench/contrib/mergeEditor/browser/model/lineRange.js';",
            ""
          ]
        });
      }
    );
  });
  test("auto-solve equal edits", async () => {
    await testMergeModel(
      {
        "languageId": "javascript",
        "base": `const { readFileSync } = require('fs');

let paths = process.argv.slice(2);
main(paths);

function main(paths) {
    // print the welcome message
    printMessage();

    let data = getLineCountInfo(paths);
    console.log("Lines: " + data.totalLineCount);
}

/**
 * Prints the welcome message
*/
function printMessage() {
    console.log("Welcome To Line Counter");
}

/**
 * @param {string[]} paths
*/
function getLineCountInfo(paths) {
    let lineCounts = paths.map(path => ({ path, count: getLinesLength(readFileSync(path, 'utf8')) }));
    return {
        totalLineCount: lineCounts.reduce((acc, { count }) => acc + count, 0),
        lineCounts,
    };
}

/**
 * @param {string} str
 */
function getLinesLength(str) {
    return str.split('\\n').length;
}
`,
        "input1": `const { readFileSync } = require('fs');

let paths = process.argv.slice(2);
main(paths);

function main(paths) {
    // print the welcome message
    printMessage();

    const data = getLineCountInfo(paths);
    console.log("Lines: " + data.totalLineCount);
}

function printMessage() {
    console.log("Welcome To Line Counter");
}

/**
 * @param {string[]} paths
*/
function getLineCountInfo(paths) {
    let lineCounts = paths.map(path => ({ path, count: getLinesLength(readFileSync(path, 'utf8')) }));
    return {
        totalLineCount: lineCounts.reduce((acc, { count }) => acc + count, 0),
        lineCounts,
    };
}

/**
 * @param {string} str
 */
function getLinesLength(str) {
    return str.split('\\n').length;
}
`,
        "input2": `const { readFileSync } = require('fs');

let paths = process.argv.slice(2);
run(paths);

function run(paths) {
    // print the welcome message
    printMessage();

    const data = getLineCountInfo(paths);
    console.log("Lines: " + data.totalLineCount);
}

function printMessage() {
    console.log("Welcome To Line Counter");
}

/**
 * @param {string[]} paths
*/
function getLineCountInfo(paths) {
    let lineCounts = paths.map(path => ({ path, count: getLinesLength(readFileSync(path, 'utf8')) }));
    return {
        totalLineCount: lineCounts.reduce((acc, { count }) => acc + count, 0),
        lineCounts,
    };
}

/**
 * @param {string} str
 */
function getLinesLength(str) {
    return str.split('\\n').length;
}
`,
        "result": "<<<<<<< uiae\n>>>>>>> Stashed changes",
        resetResult: true
      },
      async (model) => {
        await model.mergeModel.reset();
        assert.deepStrictEqual(model.getResult(), `const { readFileSync } = require('fs');

let paths = process.argv.slice(2);
run(paths);

function run(paths) {
    // print the welcome message
    printMessage();

    const data = getLineCountInfo(paths);
    console.log("Lines: " + data.totalLineCount);
}

function printMessage() {
    console.log("Welcome To Line Counter");
}

/**
 * @param {string[]} paths
*/
function getLineCountInfo(paths) {
    let lineCounts = paths.map(path => ({ path, count: getLinesLength(readFileSync(path, 'utf8')) }));
    return {
        totalLineCount: lineCounts.reduce((acc, { count }) => acc + count, 0),
        lineCounts,
    };
}

/**
 * @param {string} str
 */
function getLinesLength(str) {
    return str.split('\\n').length;
}
`);
      }
    );
  });
});
async function testMergeModel(options, fn) {
  const disposables = new DisposableStore();
  const modelInterface = disposables.add(
    new MergeModelInterface(options, createModelServices(disposables))
  );
  await modelInterface.mergeModel.onInitialized;
  await fn(modelInterface);
  disposables.dispose();
}
__name(testMergeModel, "testMergeModel");
function toSmallNumbersDec(value) {
  const smallNumbers = ["\u2080", "\u2081", "\u2082", "\u2083", "\u2084", "\u2085", "\u2086", "\u2087", "\u2088", "\u2089"];
  return value.toString().split("").map((c) => smallNumbers[parseInt(c)]).join("");
}
__name(toSmallNumbersDec, "toSmallNumbersDec");
class MergeModelInterface extends Disposable {
  static {
    __name(this, "MergeModelInterface");
  }
  mergeModel;
  constructor(options, instantiationService) {
    super();
    const input1TextModel = this._register(createTextModel(options.input1, options.languageId));
    const input2TextModel = this._register(createTextModel(options.input2, options.languageId));
    const baseTextModel = this._register(createTextModel(options.base, options.languageId));
    const resultTextModel = this._register(createTextModel(options.result, options.languageId));
    const diffComputer = {
      async computeDiff(textModel1, textModel2, reader) {
        const result = await linesDiffComputers.getLegacy().computeDiff(
          textModel1.getLinesContent(),
          textModel2.getLinesContent(),
          { ignoreTrimWhitespace: false, maxComputationTimeMs: 1e4, computeMoves: false }
        );
        const changes = result.changes.map(
          (c) => new DetailedLineRangeMapping(
            toLineRange(c.original),
            textModel1,
            toLineRange(c.modified),
            textModel2,
            c.innerChanges?.map((ic) => toRangeMapping(ic)).filter(isDefined)
          )
        );
        return {
          diffs: changes
        };
      }
    };
    this.mergeModel = this._register(instantiationService.createInstance(
      MergeEditorModel,
      baseTextModel,
      {
        textModel: input1TextModel,
        description: "",
        detail: "",
        title: ""
      },
      {
        textModel: input2TextModel,
        description: "",
        detail: "",
        title: ""
      },
      resultTextModel,
      diffComputer,
      {
        resetResult: options.resetResult || false
      },
      new MergeEditorTelemetry(NullTelemetryService)
    ));
  }
  getProjections() {
    function applyRanges(textModel, ranges) {
      textModel.applyEdits(ranges.map(({ range, label }) => ({
        range,
        text: `\u27E6${textModel.getValueInRange(range)}\u27E7${label}`
      })));
    }
    __name(applyRanges, "applyRanges");
    const baseRanges = this.mergeModel.modifiedBaseRanges.get();
    const baseTextModel = createTextModel(this.mergeModel.base.getValue());
    applyRanges(
      baseTextModel,
      baseRanges.map((r, idx) => ({
        range: r.baseRange.toRange(),
        label: toSmallNumbersDec(idx)
      }))
    );
    const input1TextModel = createTextModel(this.mergeModel.input1.textModel.getValue());
    applyRanges(
      input1TextModel,
      baseRanges.map((r, idx) => ({
        range: r.input1Range.toRange(),
        label: toSmallNumbersDec(idx)
      }))
    );
    const input2TextModel = createTextModel(this.mergeModel.input2.textModel.getValue());
    applyRanges(
      input2TextModel,
      baseRanges.map((r, idx) => ({
        range: r.input2Range.toRange(),
        label: toSmallNumbersDec(idx)
      }))
    );
    const resultTextModel = createTextModel(this.mergeModel.resultTextModel.getValue());
    applyRanges(
      resultTextModel,
      baseRanges.map((r, idx) => ({
        range: this.mergeModel.getLineRangeInResult(r.baseRange).toRange(),
        label: `{${this.mergeModel.getState(r).get()}}${toSmallNumbersDec(idx)}`
      }))
    );
    const result = {
      base: baseTextModel.getValue(EndOfLinePreference.LF).split("\n"),
      input1: input1TextModel.getValue(EndOfLinePreference.LF).split("\n"),
      input2: input2TextModel.getValue(EndOfLinePreference.LF).split("\n"),
      result: resultTextModel.getValue(EndOfLinePreference.LF).split("\n")
    };
    baseTextModel.dispose();
    input1TextModel.dispose();
    input2TextModel.dispose();
    resultTextModel.dispose();
    return result;
  }
  toggleConflict(conflictIdx, inputNumber) {
    const baseRange = this.mergeModel.modifiedBaseRanges.get()[conflictIdx];
    if (!baseRange) {
      throw new Error();
    }
    const state = this.mergeModel.getState(baseRange).get();
    transaction((tx) => {
      this.mergeModel.setState(baseRange, state.toggle(inputNumber), true, tx);
    });
  }
  getResult() {
    return this.mergeModel.resultTextModel.getValue();
  }
}
//# sourceMappingURL=model.test.js.map
