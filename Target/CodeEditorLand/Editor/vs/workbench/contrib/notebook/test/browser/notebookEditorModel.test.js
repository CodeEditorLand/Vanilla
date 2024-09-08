import assert from "assert";
import { VSBuffer } from "../../../../../base/common/buffer.js";
import { CancellationToken } from "../../../../../base/common/cancellation.js";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { Mimes } from "../../../../../base/common/mime.js";
import { URI } from "../../../../../base/common/uri.js";
import { mock } from "../../../../../base/test/common/mock.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { TestConfigurationService } from "../../../../../platform/configuration/test/common/testConfigurationService.js";
import { ExtensionIdentifier } from "../../../../../platform/extensions/common/extensions.js";
import { SnapshotContext } from "../../../../services/workingCopy/common/fileWorkingCopy.js";
import { NotebookTextModel } from "../../common/model/notebookTextModel.js";
import {
  CellKind,
  NotebookSetting
} from "../../common/notebookCommon.js";
import { NotebookFileWorkingCopyModel } from "../../common/notebookEditorModel.js";
import {
  SimpleNotebookProviderInfo
} from "../../common/notebookService.js";
import { setupInstantiationService } from "./testNotebookEditor.js";
suite("NotebookFileWorkingCopyModel", () => {
  let disposables;
  let instantiationService;
  const configurationService = new TestConfigurationService();
  const telemetryService = new class extends mock() {
    publicLogError2() {
    }
  }();
  const logservice = new class extends mock() {
  }();
  teardown(() => disposables.dispose());
  ensureNoDisposablesAreLeakedInTestSuite();
  setup(() => {
    disposables = new DisposableStore();
    instantiationService = setupInstantiationService(disposables);
  });
  test("no transient output is send to serializer", async () => {
    const notebook = instantiationService.createInstance(
      NotebookTextModel,
      "notebook",
      URI.file("test"),
      [
        {
          cellKind: CellKind.Code,
          language: "foo",
          mime: "foo",
          source: "foo",
          outputs: [
            {
              outputId: "id",
              outputs: [
                {
                  mime: Mimes.text,
                  data: VSBuffer.fromString("Hello Out")
                }
              ]
            }
          ]
        }
      ],
      {},
      {
        transientCellMetadata: {},
        transientDocumentMetadata: {},
        cellContentMetadata: {},
        transientOutputs: false
      }
    );
    {
      let callCount = 0;
      const model = disposables.add(
        new NotebookFileWorkingCopyModel(
          notebook,
          mockNotebookService(
            notebook,
            new class extends mock() {
              options = {
                transientOutputs: true,
                transientCellMetadata: {},
                transientDocumentMetadata: {},
                cellContentMetadata: {}
              };
              async notebookToData(notebook2) {
                callCount += 1;
                assert.strictEqual(notebook2.cells.length, 1);
                assert.strictEqual(
                  notebook2.cells[0].outputs.length,
                  0
                );
                return VSBuffer.fromString("");
              }
            }()
          ),
          configurationService,
          telemetryService,
          logservice
        )
      );
      await model.snapshot(SnapshotContext.Save, CancellationToken.None);
      assert.strictEqual(callCount, 1);
    }
    {
      let callCount = 0;
      const model = disposables.add(
        new NotebookFileWorkingCopyModel(
          notebook,
          mockNotebookService(
            notebook,
            new class extends mock() {
              options = {
                transientOutputs: false,
                transientCellMetadata: {},
                transientDocumentMetadata: {},
                cellContentMetadata: {}
              };
              async notebookToData(notebook2) {
                callCount += 1;
                assert.strictEqual(notebook2.cells.length, 1);
                assert.strictEqual(
                  notebook2.cells[0].outputs.length,
                  1
                );
                return VSBuffer.fromString("");
              }
            }()
          ),
          configurationService,
          telemetryService,
          logservice
        )
      );
      await model.snapshot(SnapshotContext.Save, CancellationToken.None);
      assert.strictEqual(callCount, 1);
    }
  });
  test("no transient metadata is send to serializer", async () => {
    const notebook = instantiationService.createInstance(
      NotebookTextModel,
      "notebook",
      URI.file("test"),
      [
        {
          cellKind: CellKind.Code,
          language: "foo",
          mime: "foo",
          source: "foo",
          outputs: []
        }
      ],
      { foo: 123, bar: 456 },
      {
        transientCellMetadata: {},
        transientDocumentMetadata: {},
        cellContentMetadata: {},
        transientOutputs: false
      }
    );
    disposables.add(notebook);
    {
      let callCount = 0;
      const model = disposables.add(
        new NotebookFileWorkingCopyModel(
          notebook,
          mockNotebookService(
            notebook,
            new class extends mock() {
              options = {
                transientOutputs: true,
                transientCellMetadata: {},
                transientDocumentMetadata: { bar: true },
                cellContentMetadata: {}
              };
              async notebookToData(notebook2) {
                callCount += 1;
                assert.strictEqual(notebook2.metadata.foo, 123);
                assert.strictEqual(
                  notebook2.metadata.bar,
                  void 0
                );
                return VSBuffer.fromString("");
              }
            }()
          ),
          configurationService,
          telemetryService,
          logservice
        )
      );
      await model.snapshot(SnapshotContext.Save, CancellationToken.None);
      assert.strictEqual(callCount, 1);
    }
    {
      let callCount = 0;
      const model = disposables.add(
        new NotebookFileWorkingCopyModel(
          notebook,
          mockNotebookService(
            notebook,
            new class extends mock() {
              options = {
                transientOutputs: false,
                transientCellMetadata: {},
                transientDocumentMetadata: {},
                cellContentMetadata: {}
              };
              async notebookToData(notebook2) {
                callCount += 1;
                assert.strictEqual(notebook2.metadata.foo, 123);
                assert.strictEqual(notebook2.metadata.bar, 456);
                return VSBuffer.fromString("");
              }
            }()
          ),
          configurationService,
          telemetryService,
          logservice
        )
      );
      await model.snapshot(SnapshotContext.Save, CancellationToken.None);
      assert.strictEqual(callCount, 1);
    }
  });
  test("no transient cell metadata is send to serializer", async () => {
    const notebook = instantiationService.createInstance(
      NotebookTextModel,
      "notebook",
      URI.file("test"),
      [
        {
          cellKind: CellKind.Code,
          language: "foo",
          mime: "foo",
          source: "foo",
          outputs: [],
          metadata: { foo: 123, bar: 456 }
        }
      ],
      {},
      {
        transientCellMetadata: {},
        transientDocumentMetadata: {},
        cellContentMetadata: {},
        transientOutputs: false
      }
    );
    disposables.add(notebook);
    {
      let callCount = 0;
      const model = disposables.add(
        new NotebookFileWorkingCopyModel(
          notebook,
          mockNotebookService(
            notebook,
            new class extends mock() {
              options = {
                transientOutputs: true,
                transientDocumentMetadata: {},
                transientCellMetadata: { bar: true },
                cellContentMetadata: {}
              };
              async notebookToData(notebook2) {
                callCount += 1;
                assert.strictEqual(
                  notebook2.cells[0].metadata.foo,
                  123
                );
                assert.strictEqual(
                  notebook2.cells[0].metadata.bar,
                  void 0
                );
                return VSBuffer.fromString("");
              }
            }()
          ),
          configurationService,
          telemetryService,
          logservice
        )
      );
      await model.snapshot(SnapshotContext.Save, CancellationToken.None);
      assert.strictEqual(callCount, 1);
    }
    {
      let callCount = 0;
      const model = disposables.add(
        new NotebookFileWorkingCopyModel(
          notebook,
          mockNotebookService(
            notebook,
            new class extends mock() {
              options = {
                transientOutputs: false,
                transientCellMetadata: {},
                transientDocumentMetadata: {},
                cellContentMetadata: {}
              };
              async notebookToData(notebook2) {
                callCount += 1;
                assert.strictEqual(
                  notebook2.cells[0].metadata.foo,
                  123
                );
                assert.strictEqual(
                  notebook2.cells[0].metadata.bar,
                  456
                );
                return VSBuffer.fromString("");
              }
            }()
          ),
          configurationService,
          telemetryService,
          logservice
        )
      );
      await model.snapshot(SnapshotContext.Save, CancellationToken.None);
      assert.strictEqual(callCount, 1);
    }
  });
  test("Notebooks with outputs beyond the size threshold will throw for backup snapshots", async () => {
    const outputLimit = 100;
    await configurationService.setUserConfiguration(
      NotebookSetting.outputBackupSizeLimit,
      outputLimit * 1 / 1024
    );
    const largeOutput = {
      outputId: "123",
      outputs: [
        {
          mime: Mimes.text,
          data: VSBuffer.fromString("a".repeat(outputLimit + 1))
        }
      ]
    };
    const notebook = instantiationService.createInstance(
      NotebookTextModel,
      "notebook",
      URI.file("test"),
      [
        {
          cellKind: CellKind.Code,
          language: "foo",
          mime: "foo",
          source: "foo",
          outputs: [largeOutput],
          metadata: { foo: 123, bar: 456 }
        }
      ],
      {},
      {
        transientCellMetadata: {},
        transientDocumentMetadata: {},
        cellContentMetadata: {},
        transientOutputs: false
      }
    );
    disposables.add(notebook);
    let callCount = 0;
    const model = disposables.add(
      new NotebookFileWorkingCopyModel(
        notebook,
        mockNotebookService(
          notebook,
          new class extends mock() {
            options = {
              transientOutputs: true,
              transientDocumentMetadata: {},
              transientCellMetadata: { bar: true },
              cellContentMetadata: {}
            };
            async notebookToData(notebook2) {
              callCount += 1;
              assert.strictEqual(
                notebook2.cells[0].metadata.foo,
                123
              );
              assert.strictEqual(
                notebook2.cells[0].metadata.bar,
                void 0
              );
              return VSBuffer.fromString("");
            }
          }()
        ),
        configurationService,
        telemetryService,
        logservice
      )
    );
    try {
      await model.snapshot(
        SnapshotContext.Backup,
        CancellationToken.None
      );
      assert.fail("Expected snapshot to throw an error for large output");
    } catch (e) {
      assert.notEqual(e.code, "ERR_ASSERTION", e.message);
    }
    await model.snapshot(SnapshotContext.Save, CancellationToken.None);
    assert.strictEqual(callCount, 1);
  });
  test("Notebook model will not return a save delegate if the serializer has not been retreived", async () => {
    const notebook = instantiationService.createInstance(
      NotebookTextModel,
      "notebook",
      URI.file("test"),
      [
        {
          cellKind: CellKind.Code,
          language: "foo",
          mime: "foo",
          source: "foo",
          outputs: [],
          metadata: { foo: 123, bar: 456 }
        }
      ],
      {},
      {
        transientCellMetadata: {},
        transientDocumentMetadata: {},
        cellContentMetadata: {},
        transientOutputs: false
      }
    );
    disposables.add(notebook);
    const serializer = new class extends mock() {
      save() {
        return Promise.resolve({
          name: "savedFile"
        });
      }
    }();
    serializer.test = "yes";
    let resolveSerializer = () => {
    };
    const serializerPromise = new Promise(
      (resolve) => {
        resolveSerializer = resolve;
      }
    );
    const notebookService = mockNotebookService(
      notebook,
      serializerPromise
    );
    configurationService.setUserConfiguration(
      NotebookSetting.remoteSaving,
      true
    );
    const model = disposables.add(
      new NotebookFileWorkingCopyModel(
        notebook,
        notebookService,
        configurationService,
        telemetryService,
        logservice
      )
    );
    const notExist = model.save;
    assert.strictEqual(notExist, void 0);
    resolveSerializer(serializer);
    await model.getNotebookSerializer();
    const result = await model.save?.({}, {});
    assert.strictEqual(result.name, "savedFile");
  });
});
function mockNotebookService(notebook, notebookSerializer) {
  return new class extends mock() {
    serializer = void 0;
    async withNotebookDataProvider(viewType) {
      this.serializer = await notebookSerializer;
      return new SimpleNotebookProviderInfo(
        notebook.viewType,
        this.serializer,
        {
          id: new ExtensionIdentifier("test"),
          location: void 0
        }
      );
    }
    tryGetDataProviderSync(viewType) {
      if (!this.serializer) {
        return void 0;
      }
      return new SimpleNotebookProviderInfo(
        notebook.viewType,
        this.serializer,
        {
          id: new ExtensionIdentifier("test"),
          location: void 0
        }
      );
    }
  }();
}
