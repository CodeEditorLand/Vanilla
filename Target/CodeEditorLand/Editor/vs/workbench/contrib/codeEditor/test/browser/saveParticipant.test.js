import assert from "assert";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import {
  ensureNoDisposablesAreLeakedInTestSuite,
  toResource
} from "../../../../../base/test/common/utils.js";
import { Range } from "../../../../../editor/common/core/range.js";
import { Selection } from "../../../../../editor/common/core/selection.js";
import { TestConfigurationService } from "../../../../../platform/configuration/test/common/testConfigurationService.js";
import { SaveReason } from "../../../../common/editor.js";
import { TextFileEditorModel } from "../../../../services/textfile/common/textFileEditorModel.js";
import {
  snapshotToString
} from "../../../../services/textfile/common/textfiles.js";
import {
  TestServiceAccessor,
  workbenchInstantiationService
} from "../../../../test/browser/workbenchTestServices.js";
import {
  FinalNewLineParticipant,
  TrimFinalNewLinesParticipant,
  TrimWhitespaceParticipant
} from "../../browser/saveParticipants.js";
suite("Save Participants", () => {
  const disposables = new DisposableStore();
  let instantiationService;
  let accessor;
  setup(() => {
    instantiationService = workbenchInstantiationService(
      void 0,
      disposables
    );
    accessor = instantiationService.createInstance(TestServiceAccessor);
    disposables.add(
      accessor.textFileService.files
    );
  });
  teardown(() => {
    disposables.clear();
  });
  test("insert final new line", async function() {
    const model = disposables.add(
      instantiationService.createInstance(
        TextFileEditorModel,
        toResource.call(this, "/path/final_new_line.txt"),
        "utf8",
        void 0
      )
    );
    await model.resolve();
    const configService = new TestConfigurationService();
    configService.setUserConfiguration("files", {
      insertFinalNewline: true
    });
    const participant = new FinalNewLineParticipant(
      configService,
      void 0
    );
    let lineContent = "";
    model.textEditorModel.setValue(lineContent);
    await participant.participate(model, { reason: SaveReason.EXPLICIT });
    assert.strictEqual(
      snapshotToString(model.createSnapshot()),
      lineContent
    );
    lineContent = `Hello New Line${model.textEditorModel.getEOL()}`;
    model.textEditorModel.setValue(lineContent);
    await participant.participate(model, { reason: SaveReason.EXPLICIT });
    assert.strictEqual(
      snapshotToString(model.createSnapshot()),
      lineContent
    );
    lineContent = "Hello New Line";
    model.textEditorModel.setValue(lineContent);
    await participant.participate(model, { reason: SaveReason.EXPLICIT });
    assert.strictEqual(
      snapshotToString(model.createSnapshot()),
      `${lineContent}${model.textEditorModel.getEOL()}`
    );
    lineContent = `Hello New Line${model.textEditorModel.getEOL()}Hello New Line${model.textEditorModel.getEOL()}Hello New Line`;
    model.textEditorModel.setValue(lineContent);
    await participant.participate(model, { reason: SaveReason.EXPLICIT });
    assert.strictEqual(
      snapshotToString(model.createSnapshot()),
      `${lineContent}${model.textEditorModel.getEOL()}`
    );
  });
  test("trim final new lines", async function() {
    const model = disposables.add(
      instantiationService.createInstance(
        TextFileEditorModel,
        toResource.call(this, "/path/trim_final_new_line.txt"),
        "utf8",
        void 0
      )
    );
    await model.resolve();
    const configService = new TestConfigurationService();
    configService.setUserConfiguration("files", {
      trimFinalNewlines: true
    });
    const participant = new TrimFinalNewLinesParticipant(
      configService,
      void 0
    );
    const textContent = "Trim New Line";
    const eol = `${model.textEditorModel.getEOL()}`;
    let lineContent = `${textContent}`;
    model.textEditorModel.setValue(lineContent);
    await participant.participate(model, { reason: SaveReason.EXPLICIT });
    assert.strictEqual(
      snapshotToString(model.createSnapshot()),
      lineContent
    );
    lineContent = `${textContent}${eol}`;
    model.textEditorModel.setValue(lineContent);
    await participant.participate(model, { reason: SaveReason.EXPLICIT });
    assert.strictEqual(
      snapshotToString(model.createSnapshot()),
      lineContent
    );
    lineContent = `${textContent}${eol}${eol}`;
    model.textEditorModel.setValue(lineContent);
    await participant.participate(model, { reason: SaveReason.EXPLICIT });
    assert.strictEqual(
      snapshotToString(model.createSnapshot()),
      `${textContent}${eol}`
    );
    lineContent = `${textContent}${eol}${textContent}${eol}${eol}${eol}`;
    model.textEditorModel.setValue(lineContent);
    await participant.participate(model, { reason: SaveReason.EXPLICIT });
    assert.strictEqual(
      snapshotToString(model.createSnapshot()),
      `${textContent}${eol}${textContent}${eol}`
    );
  });
  test("trim final new lines bug#39750", async function() {
    const model = disposables.add(
      instantiationService.createInstance(
        TextFileEditorModel,
        toResource.call(this, "/path/trim_final_new_line.txt"),
        "utf8",
        void 0
      )
    );
    await model.resolve();
    const configService = new TestConfigurationService();
    configService.setUserConfiguration("files", {
      trimFinalNewlines: true
    });
    const participant = new TrimFinalNewLinesParticipant(
      configService,
      void 0
    );
    const textContent = "Trim New Line";
    const lineContent = `${textContent}`;
    model.textEditorModel.setValue(lineContent);
    const textEdits = [
      {
        range: new Range(1, 14, 1, 14),
        text: ".",
        forceMoveMarkers: false
      }
    ];
    model.textEditorModel.pushEditOperations(
      [new Selection(1, 14, 1, 14)],
      textEdits,
      () => {
        return [new Selection(1, 15, 1, 15)];
      }
    );
    await model.textEditorModel.undo();
    assert.strictEqual(
      snapshotToString(model.createSnapshot()),
      `${textContent}`
    );
    await participant.participate(model, { reason: SaveReason.EXPLICIT });
    await model.textEditorModel.redo();
    assert.strictEqual(
      snapshotToString(model.createSnapshot()),
      `${textContent}.`
    );
  });
  test("trim final new lines bug#46075", async function() {
    const model = disposables.add(
      instantiationService.createInstance(
        TextFileEditorModel,
        toResource.call(this, "/path/trim_final_new_line.txt"),
        "utf8",
        void 0
      )
    );
    await model.resolve();
    const configService = new TestConfigurationService();
    configService.setUserConfiguration("files", {
      trimFinalNewlines: true
    });
    const participant = new TrimFinalNewLinesParticipant(
      configService,
      void 0
    );
    const textContent = "Test";
    const eol = `${model.textEditorModel.getEOL()}`;
    const content = `${textContent}${eol}${eol}`;
    model.textEditorModel.setValue(content);
    for (let i = 0; i < 10; i++) {
      await participant.participate(model, {
        reason: SaveReason.EXPLICIT
      });
    }
    assert.strictEqual(
      snapshotToString(model.createSnapshot()),
      `${textContent}${eol}`
    );
    await model.textEditorModel.undo();
    assert.strictEqual(
      snapshotToString(model.createSnapshot()),
      `${textContent}${eol}${eol}`
    );
    await model.textEditorModel.redo();
    assert.strictEqual(
      snapshotToString(model.createSnapshot()),
      `${textContent}${eol}`
    );
  });
  test("trim whitespace", async function() {
    const model = disposables.add(
      instantiationService.createInstance(
        TextFileEditorModel,
        toResource.call(this, "/path/trim_final_new_line.txt"),
        "utf8",
        void 0
      )
    );
    await model.resolve();
    const configService = new TestConfigurationService();
    configService.setUserConfiguration("files", {
      trimTrailingWhitespace: true
    });
    const participant = new TrimWhitespaceParticipant(
      configService,
      void 0
    );
    const textContent = "Test";
    const content = `${textContent} 	`;
    model.textEditorModel.setValue(content);
    for (let i = 0; i < 10; i++) {
      await participant.participate(model, {
        reason: SaveReason.EXPLICIT
      });
    }
    assert.strictEqual(
      snapshotToString(model.createSnapshot()),
      `${textContent}`
    );
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
