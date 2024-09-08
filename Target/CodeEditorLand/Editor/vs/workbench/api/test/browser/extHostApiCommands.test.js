import "../../../../editor/contrib/codeAction/browser/codeAction.js";
import "../../../../editor/contrib/codelens/browser/codelens.js";
import "../../../../editor/contrib/colorPicker/browser/colorPickerContribution.js";
import "../../../../editor/contrib/format/browser/format.js";
import "../../../../editor/contrib/gotoSymbol/browser/goToCommands.js";
import "../../../../editor/contrib/documentSymbols/browser/documentSymbols.js";
import "../../../../editor/contrib/hover/browser/getHover.js";
import "../../../../editor/contrib/links/browser/getLinks.js";
import "../../../../editor/contrib/parameterHints/browser/provideSignatureHelp.js";
import "../../../../editor/contrib/smartSelect/browser/smartSelect.js";
import "../../../../editor/contrib/suggest/browser/suggest.js";
import "../../../../editor/contrib/rename/browser/rename.js";
import "../../../../editor/contrib/inlayHints/browser/inlayHintsController.js";
import assert from "assert";
import {
  errorHandler,
  setUnexpectedErrorHandler
} from "../../../../base/common/errors.js";
import { Event } from "../../../../base/common/event.js";
import { URI } from "../../../../base/common/uri.js";
import { IModelService } from "../../../../editor/common/services/model.js";
import { createTextModel } from "../../../../editor/test/common/testTextModel.js";
import {
  CommandsRegistry,
  ICommandService
} from "../../../../platform/commands/common/commands.js";
import { MarkerService } from "../../../../platform/markers/common/markerService.js";
import { IMarkerService } from "../../../../platform/markers/common/markers.js";
import { MainThreadCommands } from "../../browser/mainThreadCommands.js";
import { MainThreadLanguageFeatures } from "../../browser/mainThreadLanguageFeatures.js";
import { ExtHostContext, MainContext } from "../../common/extHost.protocol.js";
import { ExtHostApiCommands } from "../../common/extHostApiCommands.js";
import { ExtHostCommands } from "../../common/extHostCommands.js";
import { ExtHostDiagnostics } from "../../common/extHostDiagnostics.js";
import { ExtHostDocuments } from "../../common/extHostDocuments.js";
import { ExtHostDocumentsAndEditors } from "../../common/extHostDocumentsAndEditors.js";
import { ExtHostLanguageFeatures } from "../../common/extHostLanguageFeatures.js";
import * as types from "../../common/extHostTypes.js";
import { TestRPCProtocol } from "../common/testRPCProtocol.js";
import "../../../contrib/search/browser/search.contribution.js";
import { timeout } from "../../../../base/common/async.js";
import {
  ImmortalReference,
  dispose
} from "../../../../base/common/lifecycle.js";
import { assertType } from "../../../../base/common/types.js";
import { mock } from "../../../../base/test/common/mock.js";
import { runWithFakedTimers } from "../../../../base/test/common/timeTravelScheduler.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
import { IEditorWorkerService } from "../../../../editor/common/services/editorWorker.js";
import {
  ILanguageFeatureDebounceService,
  LanguageFeatureDebounceService
} from "../../../../editor/common/services/languageFeatureDebounce.js";
import { ILanguageFeaturesService } from "../../../../editor/common/services/languageFeatures.js";
import { LanguageFeaturesService } from "../../../../editor/common/services/languageFeaturesService.js";
import {
  ITextModelService
} from "../../../../editor/common/services/resolverService.js";
import {
  IOutlineModelService,
  OutlineModelService
} from "../../../../editor/contrib/documentSymbols/browser/outlineModel.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { TestConfigurationService } from "../../../../platform/configuration/test/common/testConfigurationService.js";
import { IEnvironmentService } from "../../../../platform/environment/common/environment.js";
import { SyncDescriptor } from "../../../../platform/instantiation/common/descriptors.js";
import { ServiceCollection } from "../../../../platform/instantiation/common/serviceCollection.js";
import { TestInstantiationService } from "../../../../platform/instantiation/test/common/instantiationServiceMock.js";
import {
  ILogService,
  NullLogService
} from "../../../../platform/log/common/log.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import {
  IExtensionService,
  nullExtensionDescription
} from "../../../services/extensions/common/extensions.js";
import { NullApiDeprecationService } from "../../common/extHostApiDeprecationService.js";
import { URITransformerService } from "../../common/extHostUriTransformerService.js";
function assertRejects(fn, message = "Expected rejection") {
  return fn().then(
    () => assert.ok(false, message),
    (_err) => assert.ok(true)
  );
}
function isLocation(value) {
  const candidate = value;
  return candidate && candidate.uri instanceof URI && candidate.range instanceof types.Range;
}
suite("ExtHostLanguageFeatureCommands", () => {
  const defaultSelector = { scheme: "far" };
  let model;
  let insta;
  let rpcProtocol;
  let extHost;
  let mainThread;
  let commands;
  let disposables = [];
  let originalErrorHandler;
  suiteSetup(() => {
    model = createTextModel(
      [
        "This is the first line",
        "This is the second line",
        "This is the third line"
      ].join("\n"),
      void 0,
      void 0,
      URI.parse("far://testing/file.b")
    );
    originalErrorHandler = errorHandler.getUnexpectedErrorHandler();
    setUnexpectedErrorHandler(() => {
    });
    rpcProtocol = new TestRPCProtocol();
    const services = new ServiceCollection();
    services.set(
      IUriIdentityService,
      new class extends mock() {
        asCanonicalUri(uri) {
          return uri;
        }
      }()
    );
    services.set(
      ILanguageFeaturesService,
      new SyncDescriptor(LanguageFeaturesService)
    );
    services.set(
      IExtensionService,
      new class extends mock() {
        async activateByEvent() {
        }
        activationEventIsDone(activationEvent) {
          return true;
        }
      }()
    );
    services.set(
      ICommandService,
      new SyncDescriptor(
        class extends mock() {
          executeCommand(id, ...args) {
            const command = CommandsRegistry.getCommands().get(id);
            if (!command) {
              return Promise.reject(new Error(id + " NOT known"));
            }
            const { handler } = command;
            return Promise.resolve(
              insta.invokeFunction(handler, ...args)
            );
          }
        }
      )
    );
    services.set(
      IEnvironmentService,
      new class extends mock() {
        isBuilt = true;
        isExtensionDevelopment = false;
      }()
    );
    services.set(IMarkerService, new MarkerService());
    services.set(ILogService, new SyncDescriptor(NullLogService));
    services.set(
      ILanguageFeatureDebounceService,
      new SyncDescriptor(LanguageFeatureDebounceService)
    );
    services.set(
      IModelService,
      new class extends mock() {
        getModel() {
          return model;
        }
        onModelRemoved = Event.None;
      }()
    );
    services.set(
      ITextModelService,
      new class extends mock() {
        async createModelReference() {
          return new ImmortalReference(
            new class extends mock() {
              textEditorModel = model;
            }()
          );
        }
      }()
    );
    services.set(
      IEditorWorkerService,
      new class extends mock() {
        async computeMoreMinimalEdits(_uri, edits) {
          return edits || void 0;
        }
      }()
    );
    services.set(
      ILanguageFeatureDebounceService,
      new SyncDescriptor(LanguageFeatureDebounceService)
    );
    services.set(
      IOutlineModelService,
      new SyncDescriptor(OutlineModelService)
    );
    services.set(IConfigurationService, new TestConfigurationService());
    insta = new TestInstantiationService(services);
    const extHostDocumentsAndEditors = new ExtHostDocumentsAndEditors(
      rpcProtocol,
      new NullLogService()
    );
    extHostDocumentsAndEditors.$acceptDocumentsAndEditorsDelta({
      addedDocuments: [
        {
          isDirty: false,
          versionId: model.getVersionId(),
          languageId: model.getLanguageId(),
          uri: model.uri,
          lines: model.getValue().split(model.getEOL()),
          EOL: model.getEOL()
        }
      ]
    });
    const extHostDocuments = new ExtHostDocuments(
      rpcProtocol,
      extHostDocumentsAndEditors
    );
    rpcProtocol.set(ExtHostContext.ExtHostDocuments, extHostDocuments);
    commands = new ExtHostCommands(
      rpcProtocol,
      new NullLogService(),
      new class extends mock() {
        onExtensionError() {
          return true;
        }
      }()
    );
    rpcProtocol.set(ExtHostContext.ExtHostCommands, commands);
    rpcProtocol.set(
      MainContext.MainThreadCommands,
      insta.createInstance(MainThreadCommands, rpcProtocol)
    );
    ExtHostApiCommands.register(commands);
    const diagnostics = new ExtHostDiagnostics(
      rpcProtocol,
      new NullLogService(),
      new class extends mock() {
      }(),
      extHostDocumentsAndEditors
    );
    rpcProtocol.set(ExtHostContext.ExtHostDiagnostics, diagnostics);
    extHost = new ExtHostLanguageFeatures(
      rpcProtocol,
      new URITransformerService(null),
      extHostDocuments,
      commands,
      diagnostics,
      new NullLogService(),
      NullApiDeprecationService,
      new class extends mock() {
        onExtensionError() {
          return true;
        }
      }()
    );
    rpcProtocol.set(ExtHostContext.ExtHostLanguageFeatures, extHost);
    mainThread = rpcProtocol.set(
      MainContext.MainThreadLanguageFeatures,
      insta.createInstance(MainThreadLanguageFeatures, rpcProtocol)
    );
    insta.get(IOutlineModelService);
    return rpcProtocol.sync();
  });
  suiteTeardown(() => {
    setUnexpectedErrorHandler(originalErrorHandler);
    model.dispose();
    mainThread.dispose();
    insta.get(IOutlineModelService).dispose();
    insta.dispose();
  });
  teardown(() => {
    disposables = dispose(disposables);
    return rpcProtocol.sync();
  });
  ensureNoDisposablesAreLeakedInTestSuite();
  function testApiCmd(name, fn) {
    test(name, async () => {
      await runWithFakedTimers({}, async () => {
        await fn();
        await timeout(1e4);
      });
    });
  }
  test("WorkspaceSymbols, invalid arguments", () => {
    const promises = [
      assertRejects(
        () => commands.executeCommand(
          "vscode.executeWorkspaceSymbolProvider"
        )
      ),
      assertRejects(
        () => commands.executeCommand(
          "vscode.executeWorkspaceSymbolProvider",
          null
        )
      ),
      assertRejects(
        () => commands.executeCommand(
          "vscode.executeWorkspaceSymbolProvider",
          void 0
        )
      ),
      assertRejects(
        () => commands.executeCommand(
          "vscode.executeWorkspaceSymbolProvider",
          true
        )
      )
    ];
    return Promise.all(promises);
  });
  test("WorkspaceSymbols, back and forth", () => {
    disposables.push(
      extHost.registerWorkspaceSymbolProvider(nullExtensionDescription, {
        provideWorkspaceSymbols(query) {
          return [
            new types.SymbolInformation(
              query,
              types.SymbolKind.Array,
              new types.Range(0, 0, 1, 1),
              URI.parse("far://testing/first")
            ),
            new types.SymbolInformation(
              query,
              types.SymbolKind.Array,
              new types.Range(0, 0, 1, 1),
              URI.parse("far://testing/second")
            )
          ];
        }
      })
    );
    disposables.push(
      extHost.registerWorkspaceSymbolProvider(nullExtensionDescription, {
        provideWorkspaceSymbols(query) {
          return [
            new types.SymbolInformation(
              query,
              types.SymbolKind.Array,
              new types.Range(0, 0, 1, 1),
              URI.parse("far://testing/first")
            )
          ];
        }
      })
    );
    return rpcProtocol.sync().then(() => {
      return commands.executeCommand(
        "vscode.executeWorkspaceSymbolProvider",
        "testing"
      ).then((value) => {
        assert.strictEqual(value.length, 2);
        for (const info of value) {
          assert.strictEqual(
            info instanceof types.SymbolInformation,
            true
          );
          assert.strictEqual(info.name, "testing");
          assert.strictEqual(info.kind, types.SymbolKind.Array);
        }
      });
    });
  });
  test("executeWorkspaceSymbolProvider should accept empty string, #39522", async () => {
    disposables.push(
      extHost.registerWorkspaceSymbolProvider(nullExtensionDescription, {
        provideWorkspaceSymbols() {
          return [
            new types.SymbolInformation(
              "hello",
              types.SymbolKind.Array,
              new types.Range(0, 0, 0, 0),
              URI.parse("foo:bar")
            )
          ];
        }
      })
    );
    await rpcProtocol.sync();
    let symbols = await commands.executeCommand(
      "vscode.executeWorkspaceSymbolProvider",
      ""
    );
    assert.strictEqual(symbols.length, 1);
    await rpcProtocol.sync();
    symbols = await commands.executeCommand(
      "vscode.executeWorkspaceSymbolProvider",
      "*"
    );
    assert.strictEqual(symbols.length, 1);
  });
  test("executeFormatDocumentProvider, back and forth", async () => {
    disposables.push(
      extHost.registerDocumentFormattingEditProvider(
        nullExtensionDescription,
        defaultSelector,
        new class {
          provideDocumentFormattingEdits() {
            return [
              types.TextEdit.insert(
                new types.Position(0, 0),
                "42"
              )
            ];
          }
        }()
      )
    );
    await rpcProtocol.sync();
    const edits = await commands.executeCommand(
      "vscode.executeFormatDocumentProvider",
      model.uri
    );
    assert.strictEqual(edits.length, 1);
  });
  test("vscode.prepareRename", async () => {
    disposables.push(
      extHost.registerRenameProvider(
        nullExtensionDescription,
        defaultSelector,
        new class {
          prepareRename(document, position) {
            return {
              range: new types.Range(0, 12, 0, 24),
              placeholder: "foooPlaceholder"
            };
          }
          provideRenameEdits(document, position, newName) {
            const edit = new types.WorkspaceEdit();
            edit.insert(
              document.uri,
              position,
              newName
            );
            return edit;
          }
        }()
      )
    );
    await rpcProtocol.sync();
    const data = await commands.executeCommand("vscode.prepareRename", model.uri, new types.Position(0, 12));
    assert.ok(data);
    assert.strictEqual(data.placeholder, "foooPlaceholder");
    assert.strictEqual(data.range.start.line, 0);
    assert.strictEqual(data.range.start.character, 12);
    assert.strictEqual(data.range.end.line, 0);
    assert.strictEqual(data.range.end.character, 24);
  });
  test("vscode.executeDocumentRenameProvider", async () => {
    disposables.push(
      extHost.registerRenameProvider(
        nullExtensionDescription,
        defaultSelector,
        new class {
          provideRenameEdits(document, position, newName) {
            const edit2 = new types.WorkspaceEdit();
            edit2.insert(
              document.uri,
              position,
              newName
            );
            return edit2;
          }
        }()
      )
    );
    await rpcProtocol.sync();
    const edit = await commands.executeCommand(
      "vscode.executeDocumentRenameProvider",
      model.uri,
      new types.Position(0, 12),
      "newNameOfThis"
    );
    assert.ok(edit);
    assert.strictEqual(edit.has(model.uri), true);
    const textEdits = edit.get(model.uri);
    assert.strictEqual(textEdits.length, 1);
    assert.strictEqual(textEdits[0].newText, "newNameOfThis");
  });
  test("Definition, invalid arguments", () => {
    const promises = [
      assertRejects(
        () => commands.executeCommand("vscode.executeDefinitionProvider")
      ),
      assertRejects(
        () => commands.executeCommand(
          "vscode.executeDefinitionProvider",
          null
        )
      ),
      assertRejects(
        () => commands.executeCommand(
          "vscode.executeDefinitionProvider",
          void 0
        )
      ),
      assertRejects(
        () => commands.executeCommand(
          "vscode.executeDefinitionProvider",
          true,
          false
        )
      )
    ];
    return Promise.all(promises);
  });
  test("Definition, back and forth", () => {
    disposables.push(
      extHost.registerDefinitionProvider(
        nullExtensionDescription,
        defaultSelector,
        {
          provideDefinition(doc) {
            return new types.Location(
              doc.uri,
              new types.Range(1, 0, 0, 0)
            );
          }
        }
      )
    );
    disposables.push(
      extHost.registerDefinitionProvider(
        nullExtensionDescription,
        defaultSelector,
        {
          provideDefinition(doc) {
            return new types.Location(
              doc.uri,
              new types.Range(1, 0, 0, 0)
            );
          }
        }
      )
    );
    disposables.push(
      extHost.registerDefinitionProvider(
        nullExtensionDescription,
        defaultSelector,
        {
          provideDefinition(doc) {
            return [
              new types.Location(
                doc.uri,
                new types.Range(2, 0, 0, 0)
              ),
              new types.Location(
                doc.uri,
                new types.Range(3, 0, 0, 0)
              ),
              new types.Location(
                doc.uri,
                new types.Range(4, 0, 0, 0)
              )
            ];
          }
        }
      )
    );
    return rpcProtocol.sync().then(() => {
      return commands.executeCommand(
        "vscode.executeDefinitionProvider",
        model.uri,
        new types.Position(0, 0)
      ).then((values) => {
        assert.strictEqual(values.length, 4);
        for (const v of values) {
          assert.ok(v.uri instanceof URI);
          assert.ok(v.range instanceof types.Range);
        }
      });
    });
  });
  test("Definition, back and forth (sorting & de-deduping)", () => {
    disposables.push(
      extHost.registerDefinitionProvider(
        nullExtensionDescription,
        defaultSelector,
        {
          provideDefinition(doc) {
            return new types.Location(
              URI.parse("file:///b"),
              new types.Range(1, 0, 0, 0)
            );
          }
        }
      )
    );
    disposables.push(
      extHost.registerDefinitionProvider(
        nullExtensionDescription,
        defaultSelector,
        {
          provideDefinition(doc) {
            return new types.Location(
              URI.parse("file:///b"),
              new types.Range(1, 0, 0, 0)
            );
          }
        }
      )
    );
    disposables.push(
      extHost.registerDefinitionProvider(
        nullExtensionDescription,
        defaultSelector,
        {
          provideDefinition(doc) {
            return [
              new types.Location(
                URI.parse("file:///a"),
                new types.Range(2, 0, 0, 0)
              ),
              new types.Location(
                URI.parse("file:///c"),
                new types.Range(3, 0, 0, 0)
              ),
              new types.Location(
                URI.parse("file:///d"),
                new types.Range(4, 0, 0, 0)
              )
            ];
          }
        }
      )
    );
    return rpcProtocol.sync().then(() => {
      return commands.executeCommand(
        "vscode.executeDefinitionProvider",
        model.uri,
        new types.Position(0, 0)
      ).then((values) => {
        assert.strictEqual(values.length, 4);
        assert.strictEqual(values[0].uri.path, "/a");
        assert.strictEqual(values[1].uri.path, "/b");
        assert.strictEqual(values[2].uri.path, "/c");
        assert.strictEqual(values[3].uri.path, "/d");
      });
    });
  });
  test("Definition Link", () => {
    disposables.push(
      extHost.registerDefinitionProvider(
        nullExtensionDescription,
        defaultSelector,
        {
          provideDefinition(doc) {
            return [
              new types.Location(
                doc.uri,
                new types.Range(0, 0, 0, 0)
              ),
              {
                targetUri: doc.uri,
                targetRange: new types.Range(1, 0, 0, 0),
                targetSelectionRange: new types.Range(
                  1,
                  1,
                  1,
                  1
                ),
                originSelectionRange: new types.Range(
                  2,
                  2,
                  2,
                  2
                )
              }
            ];
          }
        }
      )
    );
    return rpcProtocol.sync().then(() => {
      return commands.executeCommand(
        "vscode.executeDefinitionProvider",
        model.uri,
        new types.Position(0, 0)
      ).then((values) => {
        assert.strictEqual(values.length, 2);
        for (const v of values) {
          if (isLocation(v)) {
            assert.ok(v.uri instanceof URI);
            assert.ok(v.range instanceof types.Range);
          } else {
            assert.ok(v.targetUri instanceof URI);
            assert.ok(v.targetRange instanceof types.Range);
            assert.ok(
              v.targetSelectionRange instanceof types.Range
            );
            assert.ok(
              v.originSelectionRange instanceof types.Range
            );
          }
        }
      });
    });
  });
  test("Declaration, back and forth", () => {
    disposables.push(
      extHost.registerDeclarationProvider(
        nullExtensionDescription,
        defaultSelector,
        {
          provideDeclaration(doc) {
            return new types.Location(
              doc.uri,
              new types.Range(1, 0, 0, 0)
            );
          }
        }
      )
    );
    disposables.push(
      extHost.registerDeclarationProvider(
        nullExtensionDescription,
        defaultSelector,
        {
          provideDeclaration(doc) {
            return new types.Location(
              doc.uri,
              new types.Range(1, 0, 0, 0)
            );
          }
        }
      )
    );
    disposables.push(
      extHost.registerDeclarationProvider(
        nullExtensionDescription,
        defaultSelector,
        {
          provideDeclaration(doc) {
            return [
              new types.Location(
                doc.uri,
                new types.Range(2, 0, 0, 0)
              ),
              new types.Location(
                doc.uri,
                new types.Range(3, 0, 0, 0)
              ),
              new types.Location(
                doc.uri,
                new types.Range(4, 0, 0, 0)
              )
            ];
          }
        }
      )
    );
    return rpcProtocol.sync().then(() => {
      return commands.executeCommand(
        "vscode.executeDeclarationProvider",
        model.uri,
        new types.Position(0, 0)
      ).then((values) => {
        assert.strictEqual(values.length, 4);
        for (const v of values) {
          assert.ok(v.uri instanceof URI);
          assert.ok(v.range instanceof types.Range);
        }
      });
    });
  });
  test("Declaration Link", () => {
    disposables.push(
      extHost.registerDeclarationProvider(
        nullExtensionDescription,
        defaultSelector,
        {
          provideDeclaration(doc) {
            return [
              new types.Location(
                doc.uri,
                new types.Range(0, 0, 0, 0)
              ),
              {
                targetUri: doc.uri,
                targetRange: new types.Range(1, 0, 0, 0),
                targetSelectionRange: new types.Range(
                  1,
                  1,
                  1,
                  1
                ),
                originSelectionRange: new types.Range(
                  2,
                  2,
                  2,
                  2
                )
              }
            ];
          }
        }
      )
    );
    return rpcProtocol.sync().then(() => {
      return commands.executeCommand(
        "vscode.executeDeclarationProvider",
        model.uri,
        new types.Position(0, 0)
      ).then((values) => {
        assert.strictEqual(values.length, 2);
        for (const v of values) {
          if (isLocation(v)) {
            assert.ok(v.uri instanceof URI);
            assert.ok(v.range instanceof types.Range);
          } else {
            assert.ok(v.targetUri instanceof URI);
            assert.ok(v.targetRange instanceof types.Range);
            assert.ok(
              v.targetSelectionRange instanceof types.Range
            );
            assert.ok(
              v.originSelectionRange instanceof types.Range
            );
          }
        }
      });
    });
  });
  test("Type Definition, invalid arguments", () => {
    const promises = [
      assertRejects(
        () => commands.executeCommand("vscode.executeTypeDefinitionProvider")
      ),
      assertRejects(
        () => commands.executeCommand(
          "vscode.executeTypeDefinitionProvider",
          null
        )
      ),
      assertRejects(
        () => commands.executeCommand(
          "vscode.executeTypeDefinitionProvider",
          void 0
        )
      ),
      assertRejects(
        () => commands.executeCommand(
          "vscode.executeTypeDefinitionProvider",
          true,
          false
        )
      )
    ];
    return Promise.all(promises);
  });
  test("Type Definition, back and forth", () => {
    disposables.push(
      extHost.registerTypeDefinitionProvider(
        nullExtensionDescription,
        defaultSelector,
        {
          provideTypeDefinition(doc) {
            return new types.Location(
              doc.uri,
              new types.Range(1, 0, 0, 0)
            );
          }
        }
      )
    );
    disposables.push(
      extHost.registerTypeDefinitionProvider(
        nullExtensionDescription,
        defaultSelector,
        {
          provideTypeDefinition(doc) {
            return new types.Location(
              doc.uri,
              new types.Range(1, 0, 0, 0)
            );
          }
        }
      )
    );
    disposables.push(
      extHost.registerTypeDefinitionProvider(
        nullExtensionDescription,
        defaultSelector,
        {
          provideTypeDefinition(doc) {
            return [
              new types.Location(
                doc.uri,
                new types.Range(2, 0, 0, 0)
              ),
              new types.Location(
                doc.uri,
                new types.Range(3, 0, 0, 0)
              ),
              new types.Location(
                doc.uri,
                new types.Range(4, 0, 0, 0)
              )
            ];
          }
        }
      )
    );
    return rpcProtocol.sync().then(() => {
      return commands.executeCommand(
        "vscode.executeTypeDefinitionProvider",
        model.uri,
        new types.Position(0, 0)
      ).then((values) => {
        assert.strictEqual(values.length, 4);
        for (const v of values) {
          assert.ok(v.uri instanceof URI);
          assert.ok(v.range instanceof types.Range);
        }
      });
    });
  });
  test("Type Definition Link", () => {
    disposables.push(
      extHost.registerTypeDefinitionProvider(
        nullExtensionDescription,
        defaultSelector,
        {
          provideTypeDefinition(doc) {
            return [
              new types.Location(
                doc.uri,
                new types.Range(0, 0, 0, 0)
              ),
              {
                targetUri: doc.uri,
                targetRange: new types.Range(1, 0, 0, 0),
                targetSelectionRange: new types.Range(
                  1,
                  1,
                  1,
                  1
                ),
                originSelectionRange: new types.Range(
                  2,
                  2,
                  2,
                  2
                )
              }
            ];
          }
        }
      )
    );
    return rpcProtocol.sync().then(() => {
      return commands.executeCommand(
        "vscode.executeTypeDefinitionProvider",
        model.uri,
        new types.Position(0, 0)
      ).then((values) => {
        assert.strictEqual(values.length, 2);
        for (const v of values) {
          if (isLocation(v)) {
            assert.ok(v.uri instanceof URI);
            assert.ok(v.range instanceof types.Range);
          } else {
            assert.ok(v.targetUri instanceof URI);
            assert.ok(v.targetRange instanceof types.Range);
            assert.ok(
              v.targetSelectionRange instanceof types.Range
            );
            assert.ok(
              v.originSelectionRange instanceof types.Range
            );
          }
        }
      });
    });
  });
  test("Implementation, invalid arguments", () => {
    const promises = [
      assertRejects(
        () => commands.executeCommand("vscode.executeImplementationProvider")
      ),
      assertRejects(
        () => commands.executeCommand(
          "vscode.executeImplementationProvider",
          null
        )
      ),
      assertRejects(
        () => commands.executeCommand(
          "vscode.executeImplementationProvider",
          void 0
        )
      ),
      assertRejects(
        () => commands.executeCommand(
          "vscode.executeImplementationProvider",
          true,
          false
        )
      )
    ];
    return Promise.all(promises);
  });
  test("Implementation, back and forth", () => {
    disposables.push(
      extHost.registerImplementationProvider(
        nullExtensionDescription,
        defaultSelector,
        {
          provideImplementation(doc) {
            return new types.Location(
              doc.uri,
              new types.Range(1, 0, 0, 0)
            );
          }
        }
      )
    );
    disposables.push(
      extHost.registerImplementationProvider(
        nullExtensionDescription,
        defaultSelector,
        {
          provideImplementation(doc) {
            return new types.Location(
              doc.uri,
              new types.Range(1, 0, 0, 0)
            );
          }
        }
      )
    );
    disposables.push(
      extHost.registerImplementationProvider(
        nullExtensionDescription,
        defaultSelector,
        {
          provideImplementation(doc) {
            return [
              new types.Location(
                doc.uri,
                new types.Range(2, 0, 0, 0)
              ),
              new types.Location(
                doc.uri,
                new types.Range(3, 0, 0, 0)
              ),
              new types.Location(
                doc.uri,
                new types.Range(4, 0, 0, 0)
              )
            ];
          }
        }
      )
    );
    return rpcProtocol.sync().then(() => {
      return commands.executeCommand(
        "vscode.executeImplementationProvider",
        model.uri,
        new types.Position(0, 0)
      ).then((values) => {
        assert.strictEqual(values.length, 4);
        for (const v of values) {
          assert.ok(v.uri instanceof URI);
          assert.ok(v.range instanceof types.Range);
        }
      });
    });
  });
  test("Implementation Definition Link", () => {
    disposables.push(
      extHost.registerImplementationProvider(
        nullExtensionDescription,
        defaultSelector,
        {
          provideImplementation(doc) {
            return [
              new types.Location(
                doc.uri,
                new types.Range(0, 0, 0, 0)
              ),
              {
                targetUri: doc.uri,
                targetRange: new types.Range(1, 0, 0, 0),
                targetSelectionRange: new types.Range(
                  1,
                  1,
                  1,
                  1
                ),
                originSelectionRange: new types.Range(
                  2,
                  2,
                  2,
                  2
                )
              }
            ];
          }
        }
      )
    );
    return rpcProtocol.sync().then(() => {
      return commands.executeCommand(
        "vscode.executeImplementationProvider",
        model.uri,
        new types.Position(0, 0)
      ).then((values) => {
        assert.strictEqual(values.length, 2);
        for (const v of values) {
          if (isLocation(v)) {
            assert.ok(v.uri instanceof URI);
            assert.ok(v.range instanceof types.Range);
          } else {
            assert.ok(v.targetUri instanceof URI);
            assert.ok(v.targetRange instanceof types.Range);
            assert.ok(
              v.targetSelectionRange instanceof types.Range
            );
            assert.ok(
              v.originSelectionRange instanceof types.Range
            );
          }
        }
      });
    });
  });
  test("reference search, back and forth", () => {
    disposables.push(
      extHost.registerReferenceProvider(
        nullExtensionDescription,
        defaultSelector,
        {
          provideReferences() {
            return [
              new types.Location(
                URI.parse("some:uri/path"),
                new types.Range(0, 1, 0, 5)
              )
            ];
          }
        }
      )
    );
    return commands.executeCommand(
      "vscode.executeReferenceProvider",
      model.uri,
      new types.Position(0, 0)
    ).then((values) => {
      assert.strictEqual(values.length, 1);
      const [first] = values;
      assert.strictEqual(first.uri.toString(), "some:uri/path");
      assert.strictEqual(first.range.start.line, 0);
      assert.strictEqual(first.range.start.character, 1);
      assert.strictEqual(first.range.end.line, 0);
      assert.strictEqual(first.range.end.character, 5);
    });
  });
  test('"vscode.executeDocumentHighlights" API has stopped returning DocumentHighlight[]#200056', async () => {
    disposables.push(
      extHost.registerDocumentHighlightProvider(
        nullExtensionDescription,
        defaultSelector,
        {
          provideDocumentHighlights() {
            return [
              new types.DocumentHighlight(
                new types.Range(0, 17, 0, 25),
                types.DocumentHighlightKind.Read
              )
            ];
          }
        }
      )
    );
    await rpcProtocol.sync();
    return commands.executeCommand(
      "vscode.executeDocumentHighlights",
      model.uri,
      new types.Position(0, 0)
    ).then((values) => {
      assert.ok(Array.isArray(values));
      assert.strictEqual(values.length, 1);
      const [first] = values;
      assert.strictEqual(first.range.start.line, 0);
      assert.strictEqual(first.range.start.character, 17);
      assert.strictEqual(first.range.end.line, 0);
      assert.strictEqual(first.range.end.character, 25);
    });
  });
  test("Outline, back and forth", () => {
    disposables.push(
      extHost.registerDocumentSymbolProvider(
        nullExtensionDescription,
        defaultSelector,
        {
          provideDocumentSymbols() {
            return [
              new types.SymbolInformation(
                "testing1",
                types.SymbolKind.Enum,
                new types.Range(1, 0, 1, 0)
              ),
              new types.SymbolInformation(
                "testing2",
                types.SymbolKind.Enum,
                new types.Range(0, 1, 0, 3)
              )
            ];
          }
        }
      )
    );
    return rpcProtocol.sync().then(() => {
      return commands.executeCommand(
        "vscode.executeDocumentSymbolProvider",
        model.uri
      ).then((values) => {
        assert.strictEqual(values.length, 2);
        const [first, second] = values;
        assert.strictEqual(
          first instanceof types.SymbolInformation,
          true
        );
        assert.strictEqual(
          second instanceof types.SymbolInformation,
          true
        );
        assert.strictEqual(first.name, "testing2");
        assert.strictEqual(second.name, "testing1");
      });
    });
  });
  test("vscode.executeDocumentSymbolProvider command only returns SymbolInformation[] rather than DocumentSymbol[] #57984", () => {
    disposables.push(
      extHost.registerDocumentSymbolProvider(
        nullExtensionDescription,
        defaultSelector,
        {
          provideDocumentSymbols() {
            return [
              new types.SymbolInformation(
                "SymbolInformation",
                types.SymbolKind.Enum,
                new types.Range(1, 0, 1, 0)
              )
            ];
          }
        }
      )
    );
    disposables.push(
      extHost.registerDocumentSymbolProvider(
        nullExtensionDescription,
        defaultSelector,
        {
          provideDocumentSymbols() {
            const root = new types.DocumentSymbol(
              "DocumentSymbol",
              "DocumentSymbol#detail",
              types.SymbolKind.Enum,
              new types.Range(1, 0, 1, 0),
              new types.Range(1, 0, 1, 0)
            );
            root.children = [
              new types.DocumentSymbol(
                "DocumentSymbol#child",
                "DocumentSymbol#detail#child",
                types.SymbolKind.Enum,
                new types.Range(1, 0, 1, 0),
                new types.Range(1, 0, 1, 0)
              )
            ];
            return [root];
          }
        }
      )
    );
    return rpcProtocol.sync().then(() => {
      return commands.executeCommand("vscode.executeDocumentSymbolProvider", model.uri).then((values) => {
        assert.strictEqual(values.length, 2);
        const [first, second] = values;
        assert.strictEqual(
          first instanceof types.SymbolInformation,
          true
        );
        assert.strictEqual(
          first instanceof types.DocumentSymbol,
          false
        );
        assert.strictEqual(
          second instanceof types.SymbolInformation,
          true
        );
        assert.strictEqual(first.name, "DocumentSymbol");
        assert.strictEqual(first.children.length, 1);
        assert.strictEqual(second.name, "SymbolInformation");
      });
    });
  });
  testApiCmd(
    "triggerCharacter is null when completion provider is called programmatically #159914",
    async () => {
      let actualContext;
      disposables.push(
        extHost.registerCompletionItemProvider(
          nullExtensionDescription,
          defaultSelector,
          {
            provideCompletionItems(_doc, _pos, _tok, context) {
              actualContext = context;
              return [];
            }
          },
          []
        )
      );
      await rpcProtocol.sync();
      await commands.executeCommand(
        "vscode.executeCompletionItemProvider",
        model.uri,
        new types.Position(0, 4)
      );
      assert.ok(actualContext);
      assert.deepStrictEqual(actualContext, {
        triggerKind: types.CompletionTriggerKind.Invoke,
        triggerCharacter: void 0
      });
    }
  );
  testApiCmd("Suggest, back and forth", async () => {
    disposables.push(
      extHost.registerCompletionItemProvider(
        nullExtensionDescription,
        defaultSelector,
        {
          provideCompletionItems() {
            const a = new types.CompletionItem("item1");
            a.documentation = new types.MarkdownString(
              "hello_md_string"
            );
            const b = new types.CompletionItem("item2");
            b.textEdit = types.TextEdit.replace(
              new types.Range(0, 4, 0, 8),
              "foo"
            );
            const c = new types.CompletionItem("item3");
            c.textEdit = types.TextEdit.replace(
              new types.Range(0, 1, 0, 6),
              "foobar"
            );
            const d = new types.CompletionItem("item4");
            d.range = new types.Range(0, 1, 0, 4);
            d.insertText = new types.SnippetString("foo$0bar");
            return [a, b, c, d];
          }
        },
        []
      )
    );
    await rpcProtocol.sync();
    const list = await commands.executeCommand(
      "vscode.executeCompletionItemProvider",
      model.uri,
      new types.Position(0, 4)
    );
    assert.ok(list instanceof types.CompletionList);
    const values = list.items;
    assert.ok(Array.isArray(values));
    assert.strictEqual(values.length, 4);
    const [first, second, third, fourth] = values;
    assert.strictEqual(first.label, "item1");
    assert.strictEqual(first.textEdit, void 0);
    assert.ok(!types.Range.isRange(first.range));
    assert.strictEqual(
      first.documentation.value,
      "hello_md_string"
    );
    assert.strictEqual(second.label, "item2");
    assert.strictEqual(second.textEdit.newText, "foo");
    assert.strictEqual(second.textEdit.range.start.line, 0);
    assert.strictEqual(second.textEdit.range.start.character, 4);
    assert.strictEqual(second.textEdit.range.end.line, 0);
    assert.strictEqual(second.textEdit.range.end.character, 8);
    assert.strictEqual(third.label, "item3");
    assert.strictEqual(third.textEdit.newText, "foobar");
    assert.strictEqual(third.textEdit.range.start.line, 0);
    assert.strictEqual(third.textEdit.range.start.character, 1);
    assert.strictEqual(third.textEdit.range.end.line, 0);
    assert.strictEqual(third.textEdit.range.end.character, 6);
    assert.strictEqual(fourth.label, "item4");
    assert.strictEqual(fourth.textEdit, void 0);
    const range = fourth.range;
    assert.ok(types.Range.isRange(range));
    assert.strictEqual(range.start.line, 0);
    assert.strictEqual(range.start.character, 1);
    assert.strictEqual(range.end.line, 0);
    assert.strictEqual(range.end.character, 4);
    assert.ok(fourth.insertText instanceof types.SnippetString);
    assert.strictEqual(
      fourth.insertText.value,
      "foo$0bar"
    );
  });
  testApiCmd("Suggest, return CompletionList !array", async () => {
    disposables.push(
      extHost.registerCompletionItemProvider(
        nullExtensionDescription,
        defaultSelector,
        {
          provideCompletionItems() {
            const a = new types.CompletionItem("item1");
            const b = new types.CompletionItem("item2");
            return new types.CompletionList([a, b], true);
          }
        },
        []
      )
    );
    await rpcProtocol.sync();
    const list = await commands.executeCommand(
      "vscode.executeCompletionItemProvider",
      model.uri,
      new types.Position(0, 4)
    );
    assert.ok(list instanceof types.CompletionList);
    assert.strictEqual(list.isIncomplete, true);
  });
  testApiCmd("Suggest, resolve completion items", async () => {
    let resolveCount = 0;
    disposables.push(
      extHost.registerCompletionItemProvider(
        nullExtensionDescription,
        defaultSelector,
        {
          provideCompletionItems() {
            const a = new types.CompletionItem("item1");
            const b = new types.CompletionItem("item2");
            const c = new types.CompletionItem("item3");
            const d = new types.CompletionItem("item4");
            return new types.CompletionList([a, b, c, d], false);
          },
          resolveCompletionItem(item) {
            resolveCount += 1;
            return item;
          }
        },
        []
      )
    );
    await rpcProtocol.sync();
    const list = await commands.executeCommand(
      "vscode.executeCompletionItemProvider",
      model.uri,
      new types.Position(0, 4),
      void 0,
      2
      // maxItemsToResolve
    );
    assert.ok(list instanceof types.CompletionList);
    assert.strictEqual(resolveCount, 2);
  });
  testApiCmd(
    '"vscode.executeCompletionItemProvider" doesnot return a preselect field #53749',
    async () => {
      disposables.push(
        extHost.registerCompletionItemProvider(
          nullExtensionDescription,
          defaultSelector,
          {
            provideCompletionItems() {
              const a2 = new types.CompletionItem("item1");
              a2.preselect = true;
              const b2 = new types.CompletionItem("item2");
              const c2 = new types.CompletionItem("item3");
              c2.preselect = true;
              const d2 = new types.CompletionItem("item4");
              return new types.CompletionList(
                [a2, b2, c2, d2],
                false
              );
            }
          },
          []
        )
      );
      await rpcProtocol.sync();
      const list = await commands.executeCommand(
        "vscode.executeCompletionItemProvider",
        model.uri,
        new types.Position(0, 4),
        void 0
      );
      assert.ok(list instanceof types.CompletionList);
      assert.strictEqual(list.items.length, 4);
      const [a, b, c, d] = list.items;
      assert.strictEqual(a.preselect, true);
      assert.strictEqual(b.preselect, void 0);
      assert.strictEqual(c.preselect, true);
      assert.strictEqual(d.preselect, void 0);
    }
  );
  testApiCmd(
    "executeCompletionItemProvider doesn't capture commitCharacters #58228",
    async () => {
      disposables.push(
        extHost.registerCompletionItemProvider(
          nullExtensionDescription,
          defaultSelector,
          {
            provideCompletionItems() {
              const a2 = new types.CompletionItem("item1");
              a2.commitCharacters = ["a", "b"];
              const b2 = new types.CompletionItem("item2");
              return new types.CompletionList([a2, b2], false);
            }
          },
          []
        )
      );
      await rpcProtocol.sync();
      const list = await commands.executeCommand(
        "vscode.executeCompletionItemProvider",
        model.uri,
        new types.Position(0, 4),
        void 0
      );
      assert.ok(list instanceof types.CompletionList);
      assert.strictEqual(list.items.length, 2);
      const [a, b] = list.items;
      assert.deepStrictEqual(a.commitCharacters, ["a", "b"]);
      assert.strictEqual(b.commitCharacters, void 0);
    }
  );
  testApiCmd(
    "vscode.executeCompletionItemProvider returns the wrong CompletionItemKinds in insiders #95715",
    async () => {
      disposables.push(
        extHost.registerCompletionItemProvider(
          nullExtensionDescription,
          defaultSelector,
          {
            provideCompletionItems() {
              return [
                new types.CompletionItem(
                  "My Method",
                  types.CompletionItemKind.Method
                ),
                new types.CompletionItem(
                  "My Property",
                  types.CompletionItemKind.Property
                )
              ];
            }
          },
          []
        )
      );
      await rpcProtocol.sync();
      const list = await commands.executeCommand(
        "vscode.executeCompletionItemProvider",
        model.uri,
        new types.Position(0, 4),
        void 0
      );
      assert.ok(list instanceof types.CompletionList);
      assert.strictEqual(list.items.length, 2);
      const [a, b] = list.items;
      assert.strictEqual(a.kind, types.CompletionItemKind.Method);
      assert.strictEqual(b.kind, types.CompletionItemKind.Property);
    }
  );
  test("Parameter Hints, back and forth", async () => {
    disposables.push(
      extHost.registerSignatureHelpProvider(
        nullExtensionDescription,
        defaultSelector,
        new class {
          provideSignatureHelp(_document, _position, _token, context) {
            return {
              activeSignature: 0,
              activeParameter: 1,
              signatures: [
                {
                  label: "abc",
                  documentation: `${context.triggerKind === 1 ? "invoked" : "unknown"} ${context.triggerCharacter}`,
                  parameters: []
                }
              ]
            };
          }
        }(),
        []
      )
    );
    await rpcProtocol.sync();
    const firstValue = await commands.executeCommand(
      "vscode.executeSignatureHelpProvider",
      model.uri,
      new types.Position(0, 1),
      ","
    );
    assert.strictEqual(firstValue.activeSignature, 0);
    assert.strictEqual(firstValue.activeParameter, 1);
    assert.strictEqual(firstValue.signatures.length, 1);
    assert.strictEqual(firstValue.signatures[0].label, "abc");
    assert.strictEqual(firstValue.signatures[0].documentation, "invoked ,");
  });
  testApiCmd("QuickFix, back and forth", () => {
    disposables.push(
      extHost.registerCodeActionProvider(
        nullExtensionDescription,
        defaultSelector,
        {
          provideCodeActions() {
            return [
              {
                command: "testing",
                title: "Title",
                arguments: [1, 2, true]
              }
            ];
          }
        }
      )
    );
    return rpcProtocol.sync().then(() => {
      return commands.executeCommand(
        "vscode.executeCodeActionProvider",
        model.uri,
        new types.Range(0, 0, 1, 1)
      ).then((value) => {
        assert.strictEqual(value.length, 1);
        const [first] = value;
        assert.strictEqual(first.title, "Title");
        assert.strictEqual(first.command, "testing");
        assert.deepStrictEqual(first.arguments, [1, 2, true]);
      });
    });
  });
  testApiCmd(
    "vscode.executeCodeActionProvider results seem to be missing their `command` property #45124",
    () => {
      disposables.push(
        extHost.registerCodeActionProvider(
          nullExtensionDescription,
          defaultSelector,
          {
            provideCodeActions(document, range) {
              return [
                {
                  command: {
                    arguments: [document, range],
                    command: "command",
                    title: "command_title"
                  },
                  kind: types.CodeActionKind.Empty.append(
                    "foo"
                  ),
                  title: "title"
                }
              ];
            }
          }
        )
      );
      return rpcProtocol.sync().then(() => {
        return commands.executeCommand(
          "vscode.executeCodeActionProvider",
          model.uri,
          new types.Range(0, 0, 1, 1)
        ).then((value) => {
          assert.strictEqual(value.length, 1);
          const [first] = value;
          assert.ok(first.command);
          assert.strictEqual(first.command.command, "command");
          assert.strictEqual(
            first.command.title,
            "command_title"
          );
          assert.strictEqual(first.kind.value, "foo");
          assert.strictEqual(first.title, "title");
        });
      });
    }
  );
  testApiCmd(
    "vscode.executeCodeActionProvider passes Range to provider although Selection is passed in #77997",
    () => {
      disposables.push(
        extHost.registerCodeActionProvider(
          nullExtensionDescription,
          defaultSelector,
          {
            provideCodeActions(document, rangeOrSelection) {
              return [
                {
                  command: {
                    arguments: [document, rangeOrSelection],
                    command: "command",
                    title: "command_title"
                  },
                  kind: types.CodeActionKind.Empty.append(
                    "foo"
                  ),
                  title: "title"
                }
              ];
            }
          }
        )
      );
      const selection = new types.Selection(0, 0, 1, 1);
      return rpcProtocol.sync().then(() => {
        return commands.executeCommand(
          "vscode.executeCodeActionProvider",
          model.uri,
          selection
        ).then((value) => {
          assert.strictEqual(value.length, 1);
          const [first] = value;
          assert.ok(first.command);
          assert.ok(
            first.command.arguments[1] instanceof types.Selection
          );
          assert.ok(
            first.command.arguments[1].isEqual(selection)
          );
        });
      });
    }
  );
  testApiCmd(
    "vscode.executeCodeActionProvider results seem to be missing their `isPreferred` property #78098",
    () => {
      disposables.push(
        extHost.registerCodeActionProvider(
          nullExtensionDescription,
          defaultSelector,
          {
            provideCodeActions(document, rangeOrSelection) {
              return [
                {
                  command: {
                    arguments: [document, rangeOrSelection],
                    command: "command",
                    title: "command_title"
                  },
                  kind: types.CodeActionKind.Empty.append(
                    "foo"
                  ),
                  title: "title",
                  isPreferred: true
                }
              ];
            }
          }
        )
      );
      const selection = new types.Selection(0, 0, 1, 1);
      return rpcProtocol.sync().then(() => {
        return commands.executeCommand(
          "vscode.executeCodeActionProvider",
          model.uri,
          selection
        ).then((value) => {
          assert.strictEqual(value.length, 1);
          const [first] = value;
          assert.strictEqual(first.isPreferred, true);
        });
      });
    }
  );
  testApiCmd("resolving code action", async () => {
    let didCallResolve = 0;
    class MyAction extends types.CodeAction {
    }
    disposables.push(
      extHost.registerCodeActionProvider(
        nullExtensionDescription,
        defaultSelector,
        {
          provideCodeActions(document, rangeOrSelection) {
            return [
              new MyAction(
                "title",
                types.CodeActionKind.Empty.append("foo")
              )
            ];
          },
          resolveCodeAction(action) {
            assert.ok(action instanceof MyAction);
            didCallResolve += 1;
            action.title = "resolved title";
            action.edit = new types.WorkspaceEdit();
            return action;
          }
        }
      )
    );
    const selection = new types.Selection(0, 0, 1, 1);
    await rpcProtocol.sync();
    const value = await commands.executeCommand(
      "vscode.executeCodeActionProvider",
      model.uri,
      selection,
      void 0,
      1e3
    );
    assert.strictEqual(didCallResolve, 1);
    assert.strictEqual(value.length, 1);
    const [first] = value;
    assert.strictEqual(first.title, "title");
    assert.ok(first.edit);
  });
  testApiCmd("CodeLens, back and forth", () => {
    const complexArg = {
      foo() {
      },
      bar() {
      },
      big: extHost
    };
    disposables.push(
      extHost.registerCodeLensProvider(
        nullExtensionDescription,
        defaultSelector,
        {
          provideCodeLenses() {
            return [
              new types.CodeLens(new types.Range(0, 0, 1, 1), {
                title: "Title",
                command: "cmd",
                arguments: [1, true, complexArg]
              })
            ];
          }
        }
      )
    );
    return rpcProtocol.sync().then(() => {
      return commands.executeCommand(
        "vscode.executeCodeLensProvider",
        model.uri
      ).then((value) => {
        assert.strictEqual(value.length, 1);
        const [first] = value;
        assert.strictEqual(first.command.title, "Title");
        assert.strictEqual(first.command.command, "cmd");
        assert.strictEqual(first.command.arguments[0], 1);
        assert.strictEqual(first.command.arguments[1], true);
        assert.strictEqual(
          first.command.arguments[2],
          complexArg
        );
      });
    });
  });
  testApiCmd("CodeLens, resolve", async () => {
    let resolveCount = 0;
    disposables.push(
      extHost.registerCodeLensProvider(
        nullExtensionDescription,
        defaultSelector,
        {
          provideCodeLenses() {
            return [
              new types.CodeLens(new types.Range(0, 0, 1, 1)),
              new types.CodeLens(new types.Range(0, 0, 1, 1)),
              new types.CodeLens(new types.Range(0, 0, 1, 1)),
              new types.CodeLens(new types.Range(0, 0, 1, 1), {
                title: "Already resolved",
                command: "fff"
              })
            ];
          },
          resolveCodeLens(codeLens) {
            codeLens.command = {
              title: resolveCount.toString(),
              command: "resolved"
            };
            resolveCount += 1;
            return codeLens;
          }
        }
      )
    );
    await rpcProtocol.sync();
    let value = await commands.executeCommand(
      "vscode.executeCodeLensProvider",
      model.uri,
      2
    );
    assert.strictEqual(value.length, 3);
    assert.strictEqual(resolveCount, 2);
    resolveCount = 0;
    value = await commands.executeCommand(
      "vscode.executeCodeLensProvider",
      model.uri
    );
    assert.strictEqual(value.length, 4);
    assert.strictEqual(resolveCount, 0);
  });
  testApiCmd("Links, back and forth", () => {
    disposables.push(
      extHost.registerDocumentLinkProvider(
        nullExtensionDescription,
        defaultSelector,
        {
          provideDocumentLinks() {
            return [
              new types.DocumentLink(
                new types.Range(0, 0, 0, 20),
                URI.parse("foo:bar")
              )
            ];
          }
        }
      )
    );
    return rpcProtocol.sync().then(() => {
      return commands.executeCommand(
        "vscode.executeLinkProvider",
        model.uri
      ).then((value) => {
        assert.strictEqual(value.length, 1);
        const [first] = value;
        assert.strictEqual(first.target + "", "foo:bar");
        assert.strictEqual(first.range.start.line, 0);
        assert.strictEqual(first.range.start.character, 0);
        assert.strictEqual(first.range.end.line, 0);
        assert.strictEqual(first.range.end.character, 20);
      });
    });
  });
  testApiCmd(
    "What's the condition for DocumentLink target to be undefined? #106308",
    async () => {
      disposables.push(
        extHost.registerDocumentLinkProvider(
          nullExtensionDescription,
          defaultSelector,
          {
            provideDocumentLinks() {
              return [
                new types.DocumentLink(
                  new types.Range(0, 0, 0, 20),
                  void 0
                )
              ];
            },
            resolveDocumentLink(link) {
              link.target = URI.parse("foo:bar");
              return link;
            }
          }
        )
      );
      await rpcProtocol.sync();
      const links1 = await commands.executeCommand(
        "vscode.executeLinkProvider",
        model.uri
      );
      assert.strictEqual(links1.length, 1);
      assert.strictEqual(links1[0].target, void 0);
      const links2 = await commands.executeCommand(
        "vscode.executeLinkProvider",
        model.uri,
        1e3
      );
      assert.strictEqual(links2.length, 1);
      assert.strictEqual(
        links2[0].target.toString(),
        URI.parse("foo:bar").toString()
      );
    }
  );
  testApiCmd(
    "DocumentLink[] vscode.executeLinkProvider returns lack tooltip #213970",
    async () => {
      disposables.push(
        extHost.registerDocumentLinkProvider(
          nullExtensionDescription,
          defaultSelector,
          {
            provideDocumentLinks() {
              const link = new types.DocumentLink(
                new types.Range(0, 0, 0, 20),
                URI.parse("foo:bar")
              );
              link.tooltip = "Link Tooltip";
              return [link];
            }
          }
        )
      );
      await rpcProtocol.sync();
      const links1 = await commands.executeCommand(
        "vscode.executeLinkProvider",
        model.uri
      );
      assert.strictEqual(links1.length, 1);
      assert.strictEqual(links1[0].tooltip, "Link Tooltip");
    }
  );
  test("Color provider", () => {
    disposables.push(
      extHost.registerColorProvider(
        nullExtensionDescription,
        defaultSelector,
        {
          provideDocumentColors() {
            return [
              new types.ColorInformation(
                new types.Range(0, 0, 0, 20),
                new types.Color(0.1, 0.2, 0.3, 0.4)
              )
            ];
          },
          provideColorPresentations() {
            const cp = new types.ColorPresentation("#ABC");
            cp.textEdit = types.TextEdit.replace(
              new types.Range(1, 0, 1, 20),
              "#ABC"
            );
            cp.additionalTextEdits = [
              types.TextEdit.insert(
                new types.Position(2, 20),
                "*"
              )
            ];
            return [cp];
          }
        }
      )
    );
    return rpcProtocol.sync().then(() => {
      return commands.executeCommand(
        "vscode.executeDocumentColorProvider",
        model.uri
      ).then((value) => {
        assert.strictEqual(value.length, 1);
        const [first] = value;
        assert.strictEqual(first.color.red, 0.1);
        assert.strictEqual(first.color.green, 0.2);
        assert.strictEqual(first.color.blue, 0.3);
        assert.strictEqual(first.color.alpha, 0.4);
        assert.strictEqual(first.range.start.line, 0);
        assert.strictEqual(first.range.start.character, 0);
        assert.strictEqual(first.range.end.line, 0);
        assert.strictEqual(first.range.end.character, 20);
      });
    }).then(() => {
      const color = new types.Color(0.5, 0.6, 0.7, 0.8);
      const range = new types.Range(0, 0, 0, 20);
      return commands.executeCommand(
        "vscode.executeColorPresentationProvider",
        color,
        { uri: model.uri, range }
      ).then((value) => {
        assert.strictEqual(value.length, 1);
        const [first] = value;
        assert.strictEqual(first.label, "#ABC");
        assert.strictEqual(first.textEdit.newText, "#ABC");
        assert.strictEqual(first.textEdit.range.start.line, 1);
        assert.strictEqual(
          first.textEdit.range.start.character,
          0
        );
        assert.strictEqual(first.textEdit.range.end.line, 1);
        assert.strictEqual(
          first.textEdit.range.end.character,
          20
        );
        assert.strictEqual(
          first.additionalTextEdits.length,
          1
        );
        assert.strictEqual(
          first.additionalTextEdits[0].range.start.line,
          2
        );
        assert.strictEqual(
          first.additionalTextEdits[0].range.start.character,
          20
        );
        assert.strictEqual(
          first.additionalTextEdits[0].range.end.line,
          2
        );
        assert.strictEqual(
          first.additionalTextEdits[0].range.end.character,
          20
        );
      });
    });
  });
  test('"TypeError: e.onCancellationRequested is not a function" calling hover provider in Insiders #54174', () => {
    disposables.push(
      extHost.registerHoverProvider(
        nullExtensionDescription,
        defaultSelector,
        {
          provideHover() {
            return new types.Hover("fofofofo");
          }
        }
      )
    );
    return rpcProtocol.sync().then(() => {
      return commands.executeCommand(
        "vscode.executeHoverProvider",
        model.uri,
        new types.Position(1, 1)
      ).then((value) => {
        assert.strictEqual(value.length, 1);
        assert.strictEqual(value[0].contents.length, 1);
      });
    });
  });
  testApiCmd("Inlay Hints, back and forth", async () => {
    disposables.push(
      extHost.registerInlayHintsProvider(
        nullExtensionDescription,
        defaultSelector,
        {
          provideInlayHints() {
            return [
              new types.InlayHint(
                new types.Position(0, 1),
                "Foo"
              )
            ];
          }
        }
      )
    );
    await rpcProtocol.sync();
    const value = await commands.executeCommand(
      "vscode.executeInlayHintProvider",
      model.uri,
      new types.Range(0, 0, 20, 20)
    );
    assert.strictEqual(value.length, 1);
    const [first] = value;
    assert.strictEqual(first.label, "Foo");
    assert.strictEqual(first.position.line, 0);
    assert.strictEqual(first.position.character, 1);
  });
  testApiCmd("Inline Hints, merge", async () => {
    disposables.push(
      extHost.registerInlayHintsProvider(
        nullExtensionDescription,
        defaultSelector,
        {
          provideInlayHints() {
            const part = new types.InlayHintLabelPart("Bar");
            part.tooltip = "part_tooltip";
            part.command = { command: "cmd", title: "part" };
            const hint = new types.InlayHint(
              new types.Position(10, 11),
              [part]
            );
            hint.tooltip = "hint_tooltip";
            hint.paddingLeft = true;
            hint.paddingRight = false;
            return [hint];
          }
        }
      )
    );
    disposables.push(
      extHost.registerInlayHintsProvider(
        nullExtensionDescription,
        defaultSelector,
        {
          provideInlayHints() {
            const hint = new types.InlayHint(
              new types.Position(0, 1),
              "Foo",
              types.InlayHintKind.Parameter
            );
            hint.textEdits = [
              types.TextEdit.insert(
                new types.Position(0, 0),
                "Hello"
              )
            ];
            return [hint];
          }
        }
      )
    );
    await rpcProtocol.sync();
    const value = await commands.executeCommand(
      "vscode.executeInlayHintProvider",
      model.uri,
      new types.Range(0, 0, 20, 20)
    );
    assert.strictEqual(value.length, 2);
    const [first, second] = value;
    assert.strictEqual(first.label, "Foo");
    assert.strictEqual(first.position.line, 0);
    assert.strictEqual(first.position.character, 1);
    assert.strictEqual(first.textEdits?.length, 1);
    assert.strictEqual(first.textEdits[0].newText, "Hello");
    assert.strictEqual(second.position.line, 10);
    assert.strictEqual(second.position.character, 11);
    assert.strictEqual(second.paddingLeft, true);
    assert.strictEqual(second.paddingRight, false);
    assert.strictEqual(second.tooltip, "hint_tooltip");
    const label = second.label[0];
    assertType(label instanceof types.InlayHintLabelPart);
    assert.strictEqual(label.value, "Bar");
    assert.strictEqual(label.tooltip, "part_tooltip");
    assert.strictEqual(label.command?.command, "cmd");
    assert.strictEqual(label.command?.title, "part");
  });
  testApiCmd("Inline Hints, bad provider", async () => {
    disposables.push(
      extHost.registerInlayHintsProvider(
        nullExtensionDescription,
        defaultSelector,
        {
          provideInlayHints() {
            return [
              new types.InlayHint(
                new types.Position(0, 1),
                "Foo"
              )
            ];
          }
        }
      )
    );
    disposables.push(
      extHost.registerInlayHintsProvider(
        nullExtensionDescription,
        defaultSelector,
        {
          provideInlayHints() {
            throw new Error();
          }
        }
      )
    );
    await rpcProtocol.sync();
    const value = await commands.executeCommand(
      "vscode.executeInlayHintProvider",
      model.uri,
      new types.Range(0, 0, 20, 20)
    );
    assert.strictEqual(value.length, 1);
    const [first] = value;
    assert.strictEqual(first.label, "Foo");
    assert.strictEqual(first.position.line, 0);
    assert.strictEqual(first.position.character, 1);
  });
  test("Selection Range, back and forth", async () => {
    disposables.push(
      extHost.registerSelectionRangeProvider(
        nullExtensionDescription,
        defaultSelector,
        {
          provideSelectionRanges() {
            return [
              new types.SelectionRange(
                new types.Range(0, 10, 0, 18),
                new types.SelectionRange(
                  new types.Range(0, 2, 0, 20)
                )
              )
            ];
          }
        }
      )
    );
    await rpcProtocol.sync();
    const value = await commands.executeCommand(
      "vscode.executeSelectionRangeProvider",
      model.uri,
      [new types.Position(0, 10)]
    );
    assert.strictEqual(value.length, 1);
    assert.ok(value[0].parent);
  });
  test("CallHierarchy, back and forth", async () => {
    disposables.push(
      extHost.registerCallHierarchyProvider(
        nullExtensionDescription,
        defaultSelector,
        new class {
          prepareCallHierarchy(document, position) {
            return new types.CallHierarchyItem(
              types.SymbolKind.Constant,
              "ROOT",
              "ROOT",
              document.uri,
              new types.Range(0, 0, 0, 0),
              new types.Range(0, 0, 0, 0)
            );
          }
          provideCallHierarchyIncomingCalls(item, token) {
            return [
              new types.CallHierarchyIncomingCall(
                new types.CallHierarchyItem(
                  types.SymbolKind.Constant,
                  "INCOMING",
                  "INCOMING",
                  item.uri,
                  new types.Range(0, 0, 0, 0),
                  new types.Range(0, 0, 0, 0)
                ),
                [new types.Range(0, 0, 0, 0)]
              )
            ];
          }
          provideCallHierarchyOutgoingCalls(item, token) {
            return [
              new types.CallHierarchyOutgoingCall(
                new types.CallHierarchyItem(
                  types.SymbolKind.Constant,
                  "OUTGOING",
                  "OUTGOING",
                  item.uri,
                  new types.Range(0, 0, 0, 0),
                  new types.Range(0, 0, 0, 0)
                ),
                [new types.Range(0, 0, 0, 0)]
              )
            ];
          }
        }()
      )
    );
    await rpcProtocol.sync();
    const root = await commands.executeCommand(
      "vscode.prepareCallHierarchy",
      model.uri,
      new types.Position(0, 0)
    );
    assert.ok(Array.isArray(root));
    assert.strictEqual(root.length, 1);
    assert.strictEqual(root[0].name, "ROOT");
    const incoming = await commands.executeCommand("vscode.provideIncomingCalls", root[0]);
    assert.strictEqual(incoming.length, 1);
    assert.strictEqual(incoming[0].from.name, "INCOMING");
    const outgoing = await commands.executeCommand("vscode.provideOutgoingCalls", root[0]);
    assert.strictEqual(outgoing.length, 1);
    assert.strictEqual(outgoing[0].to.name, "OUTGOING");
  });
  test("prepareCallHierarchy throws TypeError if clangd returns empty result #137415", async () => {
    disposables.push(
      extHost.registerCallHierarchyProvider(
        nullExtensionDescription,
        defaultSelector,
        new class {
          prepareCallHierarchy(document, position) {
            return [];
          }
          provideCallHierarchyIncomingCalls(item, token) {
            return [];
          }
          provideCallHierarchyOutgoingCalls(item, token) {
            return [];
          }
        }()
      )
    );
    await rpcProtocol.sync();
    const root = await commands.executeCommand(
      "vscode.prepareCallHierarchy",
      model.uri,
      new types.Position(0, 0)
    );
    assert.ok(Array.isArray(root));
    assert.strictEqual(root.length, 0);
  });
  test("TypeHierarchy, back and forth", async () => {
    disposables.push(
      extHost.registerTypeHierarchyProvider(
        nullExtensionDescription,
        defaultSelector,
        new class {
          prepareTypeHierarchy(document, position, token) {
            return [
              new types.TypeHierarchyItem(
                types.SymbolKind.Constant,
                "ROOT",
                "ROOT",
                document.uri,
                new types.Range(0, 0, 0, 0),
                new types.Range(0, 0, 0, 0)
              )
            ];
          }
          provideTypeHierarchySupertypes(item, token) {
            return [
              new types.TypeHierarchyItem(
                types.SymbolKind.Constant,
                "SUPER",
                "SUPER",
                item.uri,
                new types.Range(0, 0, 0, 0),
                new types.Range(0, 0, 0, 0)
              )
            ];
          }
          provideTypeHierarchySubtypes(item, token) {
            return [
              new types.TypeHierarchyItem(
                types.SymbolKind.Constant,
                "SUB",
                "SUB",
                item.uri,
                new types.Range(0, 0, 0, 0),
                new types.Range(0, 0, 0, 0)
              )
            ];
          }
        }()
      )
    );
    await rpcProtocol.sync();
    const root = await commands.executeCommand(
      "vscode.prepareTypeHierarchy",
      model.uri,
      new types.Position(0, 0)
    );
    assert.ok(Array.isArray(root));
    assert.strictEqual(root.length, 1);
    assert.strictEqual(root[0].name, "ROOT");
    const incoming = await commands.executeCommand("vscode.provideSupertypes", root[0]);
    assert.strictEqual(incoming.length, 1);
    assert.strictEqual(incoming[0].name, "SUPER");
    const outgoing = await commands.executeCommand("vscode.provideSubtypes", root[0]);
    assert.strictEqual(outgoing.length, 1);
    assert.strictEqual(outgoing[0].name, "SUB");
  });
  test("selectionRangeProvider on inner array always returns outer array #91852", async () => {
    disposables.push(
      extHost.registerSelectionRangeProvider(
        nullExtensionDescription,
        defaultSelector,
        {
          provideSelectionRanges(_doc, positions) {
            const [first] = positions;
            return [
              new types.SelectionRange(
                new types.Range(
                  first.line,
                  first.character,
                  first.line,
                  first.character
                )
              )
            ];
          }
        }
      )
    );
    await rpcProtocol.sync();
    const value = await commands.executeCommand(
      "vscode.executeSelectionRangeProvider",
      model.uri,
      [new types.Position(0, 10)]
    );
    assert.strictEqual(value.length, 1);
    assert.strictEqual(value[0].range.start.line, 0);
    assert.strictEqual(value[0].range.start.character, 10);
    assert.strictEqual(value[0].range.end.line, 0);
    assert.strictEqual(value[0].range.end.character, 10);
  });
  test("more element test of selectionRangeProvider on inner array always returns outer array #91852", async () => {
    disposables.push(
      extHost.registerSelectionRangeProvider(
        nullExtensionDescription,
        defaultSelector,
        {
          provideSelectionRanges(_doc, positions) {
            const [first, second] = positions;
            return [
              new types.SelectionRange(
                new types.Range(
                  first.line,
                  first.character,
                  first.line,
                  first.character
                )
              ),
              new types.SelectionRange(
                new types.Range(
                  second.line,
                  second.character,
                  second.line,
                  second.character
                )
              )
            ];
          }
        }
      )
    );
    await rpcProtocol.sync();
    const value = await commands.executeCommand(
      "vscode.executeSelectionRangeProvider",
      model.uri,
      [new types.Position(0, 0), new types.Position(0, 10)]
    );
    assert.strictEqual(value.length, 2);
    assert.strictEqual(value[0].range.start.line, 0);
    assert.strictEqual(value[0].range.start.character, 0);
    assert.strictEqual(value[0].range.end.line, 0);
    assert.strictEqual(value[0].range.end.character, 0);
    assert.strictEqual(value[1].range.start.line, 0);
    assert.strictEqual(value[1].range.start.character, 10);
    assert.strictEqual(value[1].range.end.line, 0);
    assert.strictEqual(value[1].range.end.character, 10);
  });
});
