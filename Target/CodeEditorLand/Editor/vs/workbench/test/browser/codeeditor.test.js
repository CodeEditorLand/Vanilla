import assert from "assert";
import { DisposableStore } from "../../../base/common/lifecycle.js";
import { URI } from "../../../base/common/uri.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../base/test/common/utils.js";
import { CoreNavigationCommands } from "../../../editor/browser/coreCommands.js";
import { Position } from "../../../editor/common/core/position.js";
import { Range } from "../../../editor/common/core/range.js";
import { ILanguageService } from "../../../editor/common/languages/language.js";
import { LanguageService } from "../../../editor/common/services/languageService.js";
import { IModelService } from "../../../editor/common/services/model.js";
import { ModelService } from "../../../editor/common/services/modelService.js";
import { createTestCodeEditor } from "../../../editor/test/browser/testCodeEditor.js";
import { createTextModel } from "../../../editor/test/common/testTextModel.js";
import { IConfigurationService } from "../../../platform/configuration/common/configuration.js";
import { TestConfigurationService } from "../../../platform/configuration/test/common/testConfigurationService.js";
import { IThemeService } from "../../../platform/theme/common/themeService.js";
import { TestThemeService } from "../../../platform/theme/test/common/testThemeService.js";
import { RangeHighlightDecorations } from "../../browser/codeeditor.js";
import { IEditorService } from "../../services/editor/common/editorService.js";
import {
  TestEditorService,
  workbenchInstantiationService
} from "./workbenchTestServices.js";
suite("Editor - Range decorations", () => {
  let disposables;
  let instantiationService;
  let codeEditor;
  let model;
  let text;
  let testObject;
  const modelsToDispose = [];
  setup(() => {
    disposables = new DisposableStore();
    instantiationService = workbenchInstantiationService(
      void 0,
      disposables
    );
    instantiationService.stub(IEditorService, new TestEditorService());
    instantiationService.stub(ILanguageService, LanguageService);
    instantiationService.stub(
      IModelService,
      stubModelService(instantiationService)
    );
    text = "LINE1\nLINE2\nLINE3\nLINE4\r\nLINE5";
    model = disposables.add(aModel(URI.file("some_file")));
    codeEditor = disposables.add(createTestCodeEditor(model));
    instantiationService.stub(IEditorService, "activeEditor", {
      get resource() {
        return codeEditor.getModel().uri;
      }
    });
    instantiationService.stub(
      IEditorService,
      "activeTextEditorControl",
      codeEditor
    );
    testObject = disposables.add(
      instantiationService.createInstance(RangeHighlightDecorations)
    );
  });
  teardown(() => {
    codeEditor.dispose();
    modelsToDispose.forEach((model2) => model2.dispose());
    disposables.dispose();
  });
  ensureNoDisposablesAreLeakedInTestSuite();
  test("highlight range for the resource if it is an active editor", () => {
    const range = new Range(1, 1, 1, 1);
    testObject.highlightRange({ resource: model.uri, range });
    const actuals = rangeHighlightDecorations(model);
    assert.deepStrictEqual(actuals, [range]);
  });
  test("remove highlight range", () => {
    testObject.highlightRange({
      resource: model.uri,
      range: {
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: 1,
        endColumn: 1
      }
    });
    testObject.removeHighlightRange();
    const actuals = rangeHighlightDecorations(model);
    assert.deepStrictEqual(actuals, []);
  });
  test("highlight range for the resource removes previous highlight", () => {
    testObject.highlightRange({
      resource: model.uri,
      range: {
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: 1,
        endColumn: 1
      }
    });
    const range = new Range(2, 2, 4, 3);
    testObject.highlightRange({ resource: model.uri, range });
    const actuals = rangeHighlightDecorations(model);
    assert.deepStrictEqual(actuals, [range]);
  });
  test("highlight range for a new resource removes highlight of previous resource", () => {
    testObject.highlightRange({
      resource: model.uri,
      range: {
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: 1,
        endColumn: 1
      }
    });
    const anotherModel = prepareActiveEditor("anotherModel");
    const range = new Range(2, 2, 4, 3);
    testObject.highlightRange({ resource: anotherModel.uri, range });
    let actuals = rangeHighlightDecorations(model);
    assert.deepStrictEqual(actuals, []);
    actuals = rangeHighlightDecorations(anotherModel);
    assert.deepStrictEqual(actuals, [range]);
  });
  test("highlight is removed on model change", () => {
    testObject.highlightRange({
      resource: model.uri,
      range: {
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: 1,
        endColumn: 1
      }
    });
    prepareActiveEditor("anotherModel");
    const actuals = rangeHighlightDecorations(model);
    assert.deepStrictEqual(actuals, []);
  });
  test("highlight is removed on cursor position change", () => {
    testObject.highlightRange({
      resource: model.uri,
      range: {
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: 1,
        endColumn: 1
      }
    });
    codeEditor.trigger("mouse", CoreNavigationCommands.MoveTo.id, {
      position: new Position(2, 1)
    });
    const actuals = rangeHighlightDecorations(model);
    assert.deepStrictEqual(actuals, []);
  });
  test("range is not highlight if not active editor", () => {
    const model2 = aModel(URI.file("some model"));
    testObject.highlightRange({
      resource: model2.uri,
      range: {
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: 1,
        endColumn: 1
      }
    });
    const actuals = rangeHighlightDecorations(model2);
    assert.deepStrictEqual(actuals, []);
  });
  test("previous highlight is not removed if not active editor", () => {
    const range = new Range(1, 1, 1, 1);
    testObject.highlightRange({ resource: model.uri, range });
    const model1 = aModel(URI.file("some model"));
    testObject.highlightRange({
      resource: model1.uri,
      range: {
        startLineNumber: 2,
        startColumn: 1,
        endLineNumber: 2,
        endColumn: 1
      }
    });
    const actuals = rangeHighlightDecorations(model);
    assert.deepStrictEqual(actuals, [range]);
  });
  function prepareActiveEditor(resource) {
    const model2 = aModel(URI.file(resource));
    codeEditor.setModel(model2);
    return model2;
  }
  function aModel(resource, content = text) {
    const model2 = createTextModel(content, void 0, void 0, resource);
    modelsToDispose.push(model2);
    return model2;
  }
  function rangeHighlightDecorations(m) {
    const rangeHighlights = [];
    for (const dec of m.getAllDecorations()) {
      if (dec.options.className === "rangeHighlight") {
        rangeHighlights.push(dec.range);
      }
    }
    rangeHighlights.sort(Range.compareRangesUsingStarts);
    return rangeHighlights;
  }
  function stubModelService(instantiationService2) {
    instantiationService2.stub(
      IConfigurationService,
      new TestConfigurationService()
    );
    instantiationService2.stub(IThemeService, new TestThemeService());
    return instantiationService2.createInstance(ModelService);
  }
});
