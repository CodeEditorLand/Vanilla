var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { Emitter, Event } from "../../../../../../base/common/event.js";
import { DisposableStore } from "../../../../../../base/common/lifecycle.js";
import { ResourceMap } from "../../../../../../base/common/map.js";
import { waitForState } from "../../../../../../base/common/observable.js";
import { URI } from "../../../../../../base/common/uri.js";
import { mock } from "../../../../../../base/test/common/mock.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../../base/test/common/utils.js";
import { IConfigurationService } from "../../../../../../platform/configuration/common/configuration.js";
import { TestConfigurationService } from "../../../../../../platform/configuration/test/common/testConfigurationService.js";
import { TestInstantiationService } from "../../../../../../platform/instantiation/test/common/instantiationServiceMock.js";
import { IMarkerData, IMarkerService } from "../../../../../../platform/markers/common/markers.js";
import { ChatAgentLocation, IChatAgent, IChatAgentData, IChatAgentService } from "../../../../chat/common/chatAgents.js";
import { CellDiagnostics } from "../../../browser/contrib/cellDiagnostics/cellDiagnosticEditorContrib.js";
import { CodeCellViewModel } from "../../../browser/viewModel/codeCellViewModel.js";
import { CellKind, NotebookSetting } from "../../../common/notebookCommon.js";
import { ICellExecutionStateChangedEvent, IExecutionStateChangedEvent, INotebookCellExecution, INotebookExecutionStateService, NotebookExecutionType } from "../../../common/notebookExecutionStateService.js";
import { setupInstantiationService, TestNotebookExecutionStateService, withTestNotebook } from "../testNotebookEditor.js";
import { nullExtensionDescription } from "../../../../../services/extensions/common/extensions.js";
suite("notebookCellDiagnostics", () => {
  let instantiationService;
  let disposables;
  let testExecutionService;
  let markerService;
  teardown(() => {
    disposables.dispose();
  });
  ensureNoDisposablesAreLeakedInTestSuite();
  class TestExecutionService extends TestNotebookExecutionStateService {
    static {
      __name(this, "TestExecutionService");
    }
    _onDidChangeExecution = new Emitter();
    onDidChangeExecution = this._onDidChangeExecution.event;
    fireExecutionChanged(notebook, cellHandle, changed) {
      this._onDidChangeExecution.fire({
        type: NotebookExecutionType.cell,
        cellHandle,
        notebook,
        affectsNotebook: /* @__PURE__ */ __name(() => true, "affectsNotebook"),
        affectsCell: /* @__PURE__ */ __name(() => true, "affectsCell"),
        changed
      });
    }
  }
  setup(function() {
    disposables = new DisposableStore();
    instantiationService = setupInstantiationService(disposables);
    testExecutionService = new TestExecutionService();
    instantiationService.stub(INotebookExecutionStateService, testExecutionService);
    const agentData = {
      extensionId: nullExtensionDescription.identifier,
      extensionDisplayName: "",
      extensionPublisherId: "",
      name: "testEditorAgent",
      isDefault: true,
      locations: [ChatAgentLocation.Editor],
      metadata: {},
      slashCommands: [],
      disambiguation: []
    };
    const chatAgentService = new class extends mock() {
      getAgents() {
        return [{
          id: "testEditorAgent",
          ...agentData
        }];
      }
      onDidChangeAgents = Event.None;
    }();
    instantiationService.stub(IChatAgentService, chatAgentService);
    markerService = new class extends mock() {
      markers = new ResourceMap();
      changeOne(owner, resource, markers) {
        this.markers.set(resource, markers);
      }
    }();
    instantiationService.stub(IMarkerService, markerService);
    const config = instantiationService.get(IConfigurationService);
    config.setUserConfiguration(NotebookSetting.cellFailureDiagnostics, true);
  });
  test("diagnostic is added for cell execution failure", async function() {
    await withTestNotebook([
      ["print(x)", "python", CellKind.Code, [], {}]
    ], async (editor, viewModel, store, accessor) => {
      const cell = viewModel.viewCells[0];
      disposables.add(instantiationService.createInstance(CellDiagnostics, editor));
      cell.model.internalMetadata.error = {
        message: "error",
        stack: "line 1 : print(x)",
        uri: cell.uri,
        location: { startColumn: 1, endColumn: 5, startLineNumber: 1, endLineNumber: 1 }
      };
      testExecutionService.fireExecutionChanged(editor.textModel.uri, cell.handle);
      await waitForState(cell.excecutionError, (error) => !!error);
      assert.strictEqual(cell?.excecutionError.get()?.message, "error");
      assert.equal(markerService.markers.get(cell.uri)?.length, 1);
    }, instantiationService);
  });
  test("diagnostics are cleared only for cell with new execution", async function() {
    await withTestNotebook([
      ["print(x)", "python", CellKind.Code, [], {}],
      ["print(y)", "python", CellKind.Code, [], {}]
    ], async (editor, viewModel, store, accessor) => {
      const cell = viewModel.viewCells[0];
      const cell2 = viewModel.viewCells[1];
      disposables.add(instantiationService.createInstance(CellDiagnostics, editor));
      cell.model.internalMetadata.error = {
        message: "error",
        stack: "line 1 : print(x)",
        uri: cell.uri,
        location: { startColumn: 1, endColumn: 5, startLineNumber: 1, endLineNumber: 1 }
      };
      cell2.model.internalMetadata.error = {
        message: "another error",
        stack: "line 1 : print(y)",
        uri: cell.uri,
        location: { startColumn: 1, endColumn: 5, startLineNumber: 1, endLineNumber: 1 }
      };
      testExecutionService.fireExecutionChanged(editor.textModel.uri, cell.handle);
      testExecutionService.fireExecutionChanged(editor.textModel.uri, cell2.handle);
      await waitForState(cell.excecutionError, (error) => !!error);
      await waitForState(cell2.excecutionError, (error) => !!error);
      cell.model.internalMetadata.error = void 0;
      testExecutionService.fireExecutionChanged(editor.textModel.uri, cell.handle, {});
      await waitForState(cell.excecutionError, (error) => error === void 0);
      assert.strictEqual(cell?.excecutionError.get(), void 0);
      assert.strictEqual(cell2?.excecutionError.get()?.message, "another error", "cell that was not executed should still have an error");
      assert.equal(markerService.markers.get(cell.uri)?.length, 0);
      assert.equal(markerService.markers.get(cell2.uri)?.length, 1);
    }, instantiationService);
  });
});
//# sourceMappingURL=notebookCellDiagnostics.test.js.map
