var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import {
  addDisposableListener,
  getActiveDocument
} from "../../../../base/browser/dom.js";
import { coalesce } from "../../../../base/common/arrays.js";
import {
  DeferredPromise,
  createCancelablePromise,
  raceCancellation
} from "../../../../base/common/async.js";
import {
  CancellationTokenSource
} from "../../../../base/common/cancellation.js";
import {
  UriList,
  createStringDataTransferItem,
  matchesMimeType
} from "../../../../base/common/dataTransfer.js";
import {
  CancellationError,
  isCancellationError
} from "../../../../base/common/errors.js";
import { HierarchicalKind } from "../../../../base/common/hierarchicalKind.js";
import {
  Disposable,
  DisposableStore
} from "../../../../base/common/lifecycle.js";
import { Mimes } from "../../../../base/common/mime.js";
import * as platform from "../../../../base/common/platform.js";
import { generateUuid } from "../../../../base/common/uuid.js";
import { localize } from "../../../../nls.js";
import { IClipboardService } from "../../../../platform/clipboard/common/clipboardService.js";
import { RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import {
  IProgressService,
  ProgressLocation
} from "../../../../platform/progress/common/progress.js";
import {
  IQuickInputService
} from "../../../../platform/quickinput/common/quickInput.js";
import { ClipboardEventUtils } from "../../../browser/controller/editContext/textArea/textAreaEditContextInput.js";
import {
  toExternalVSDataTransfer,
  toVSDataTransfer
} from "../../../browser/dnd.js";
import { IBulkEditService } from "../../../browser/services/bulkEditService.js";
import { EditorOption } from "../../../common/config/editorOptions.js";
import { Range } from "../../../common/core/range.js";
import {
  Handler
} from "../../../common/editorCommon.js";
import {
  DocumentPasteTriggerKind
} from "../../../common/languages.js";
import { ILanguageFeaturesService } from "../../../common/services/languageFeatures.js";
import {
  CodeEditorStateFlag,
  EditorStateCancellationTokenSource
} from "../../editorState/browser/editorState.js";
import { InlineProgressManager } from "../../inlineProgress/browser/inlineProgress.js";
import { MessageController } from "../../message/browser/messageController.js";
import { DefaultTextPasteOrDropEditProvider } from "./defaultProviders.js";
import { createCombinedWorkspaceEdit, sortEditsByYieldTo } from "./edit.js";
import { PostEditWidgetManager } from "./postEditWidget.js";
const changePasteTypeCommandId = "editor.changePasteType";
const pasteWidgetVisibleCtx = new RawContextKey(
  "pasteWidgetVisible",
  false,
  localize("pasteWidgetVisible", "Whether the paste widget is showing")
);
const vscodeClipboardMime = "application/vnd.code.copyMetadata";
let CopyPasteController = class extends Disposable {
  constructor(editor, instantiationService, _bulkEditService, _clipboardService, _languageFeaturesService, _quickInputService, _progressService) {
    super();
    this._bulkEditService = _bulkEditService;
    this._clipboardService = _clipboardService;
    this._languageFeaturesService = _languageFeaturesService;
    this._quickInputService = _quickInputService;
    this._progressService = _progressService;
    this._editor = editor;
    const container = editor.getContainerDomNode();
    this._register(addDisposableListener(container, "copy", (e) => this.handleCopy(e)));
    this._register(addDisposableListener(container, "cut", (e) => this.handleCopy(e)));
    this._register(addDisposableListener(container, "paste", (e) => this.handlePaste(e), true));
    this._pasteProgressManager = this._register(new InlineProgressManager("pasteIntoEditor", editor, instantiationService));
    this._postPasteWidgetManager = this._register(instantiationService.createInstance(PostEditWidgetManager, "pasteIntoEditor", editor, pasteWidgetVisibleCtx, { id: changePasteTypeCommandId, label: localize("postPasteWidgetTitle", "Show paste options...") }));
  }
  static ID = "editor.contrib.copyPasteActionController";
  static get(editor) {
    return editor.getContribution(
      CopyPasteController.ID
    );
  }
  /**
   * Global tracking the last copy operation.
   *
   * This is shared across all editors so that you can copy and paste between groups.
   *
   * TODO: figure out how to make this work with multiple windows
   */
  static _currentCopyOperation;
  _editor;
  _currentPasteOperation;
  _pasteAsActionContext;
  _pasteProgressManager;
  _postPasteWidgetManager;
  changePasteType() {
    this._postPasteWidgetManager.tryShowSelector();
  }
  pasteAs(preferred) {
    this._editor.focus();
    try {
      this._pasteAsActionContext = { preferred };
      getActiveDocument().execCommand("paste");
    } finally {
      this._pasteAsActionContext = void 0;
    }
  }
  clearWidgets() {
    this._postPasteWidgetManager.clear();
  }
  isPasteAsEnabled() {
    return this._editor.getOption(EditorOption.pasteAs).enabled;
  }
  async finishedPaste() {
    await this._currentPasteOperation;
  }
  handleCopy(e) {
    if (!this._editor.hasTextFocus()) {
      return;
    }
    this._clipboardService.clearInternalState?.();
    if (!e.clipboardData || !this.isPasteAsEnabled()) {
      return;
    }
    const model = this._editor.getModel();
    const selections = this._editor.getSelections();
    if (!model || !selections?.length) {
      return;
    }
    const enableEmptySelectionClipboard = this._editor.getOption(
      EditorOption.emptySelectionClipboard
    );
    let ranges = selections;
    const wasFromEmptySelection = selections.length === 1 && selections[0].isEmpty();
    if (wasFromEmptySelection) {
      if (!enableEmptySelectionClipboard) {
        return;
      }
      ranges = [
        new Range(
          ranges[0].startLineNumber,
          1,
          ranges[0].startLineNumber,
          1 + model.getLineLength(ranges[0].startLineNumber)
        )
      ];
    }
    const toCopy = this._editor._getViewModel()?.getPlainTextToCopy(
      selections,
      enableEmptySelectionClipboard,
      platform.isWindows
    );
    const multicursorText = Array.isArray(toCopy) ? toCopy : null;
    const defaultPastePayload = {
      multicursorText,
      pasteOnNewLine: wasFromEmptySelection,
      mode: null
    };
    const providers = this._languageFeaturesService.documentPasteEditProvider.ordered(model).filter((x) => !!x.prepareDocumentPaste);
    if (!providers.length) {
      this.setCopyMetadata(e.clipboardData, { defaultPastePayload });
      return;
    }
    const dataTransfer = toVSDataTransfer(e.clipboardData);
    const providerCopyMimeTypes = providers.flatMap(
      (x) => x.copyMimeTypes ?? []
    );
    const handle = generateUuid();
    this.setCopyMetadata(e.clipboardData, {
      id: handle,
      providerCopyMimeTypes,
      defaultPastePayload
    });
    const promise = createCancelablePromise(async (token) => {
      const results = coalesce(
        await Promise.all(
          providers.map(async (provider) => {
            try {
              return await provider.prepareDocumentPaste(
                model,
                ranges,
                dataTransfer,
                token
              );
            } catch (err) {
              console.error(err);
              return void 0;
            }
          })
        )
      );
      results.reverse();
      for (const result of results) {
        for (const [mime, value] of result) {
          dataTransfer.replace(mime, value);
        }
      }
      return dataTransfer;
    });
    CopyPasteController._currentCopyOperation?.dataTransferPromise.cancel();
    CopyPasteController._currentCopyOperation = {
      handle,
      dataTransferPromise: promise
    };
  }
  async handlePaste(e) {
    if (!e.clipboardData || !this._editor.hasTextFocus()) {
      return;
    }
    MessageController.get(this._editor)?.closeMessage();
    this._currentPasteOperation?.cancel();
    this._currentPasteOperation = void 0;
    const model = this._editor.getModel();
    const selections = this._editor.getSelections();
    if (!selections?.length || !model) {
      return;
    }
    if (this._editor.getOption(EditorOption.readOnly) || // Never enabled if editor is readonly.
    !this.isPasteAsEnabled() && !this._pasteAsActionContext) {
      return;
    }
    const metadata = this.fetchCopyMetadata(e);
    const dataTransfer = toExternalVSDataTransfer(e.clipboardData);
    dataTransfer.delete(vscodeClipboardMime);
    const allPotentialMimeTypes = [
      ...e.clipboardData.types,
      ...metadata?.providerCopyMimeTypes ?? [],
      // TODO: always adds `uri-list` because this get set if there are resources in the system clipboard.
      // However we can only check the system clipboard async. For this early check, just add it in.
      // We filter providers again once we have the final dataTransfer we will use.
      Mimes.uriList
    ];
    const allProviders = this._languageFeaturesService.documentPasteEditProvider.ordered(model).filter((provider) => {
      const preference = this._pasteAsActionContext?.preferred;
      if (preference) {
        if (provider.providedPasteEditKinds && !this.providerMatchesPreference(
          provider,
          preference
        )) {
          return false;
        }
      }
      return provider.pasteMimeTypes?.some(
        (type) => matchesMimeType(type, allPotentialMimeTypes)
      );
    });
    if (!allProviders.length) {
      if (this._pasteAsActionContext?.preferred) {
        this.showPasteAsNoEditMessage(
          selections,
          this._pasteAsActionContext.preferred
        );
      }
      return;
    }
    e.preventDefault();
    e.stopImmediatePropagation();
    if (this._pasteAsActionContext) {
      this.showPasteAsPick(
        this._pasteAsActionContext.preferred,
        allProviders,
        selections,
        dataTransfer,
        metadata
      );
    } else {
      this.doPasteInline(
        allProviders,
        selections,
        dataTransfer,
        metadata,
        e
      );
    }
  }
  showPasteAsNoEditMessage(selections, preference) {
    MessageController.get(this._editor)?.showMessage(
      localize(
        "pasteAsError",
        "No paste edits for '{0}' found",
        preference instanceof HierarchicalKind ? preference.value : preference.providerId
      ),
      selections[0].getStartPosition()
    );
  }
  doPasteInline(allProviders, selections, dataTransfer, metadata, clipboardEvent) {
    const editor = this._editor;
    if (!editor.hasModel()) {
      return;
    }
    const editorStateCts = new EditorStateCancellationTokenSource(
      editor,
      CodeEditorStateFlag.Value | CodeEditorStateFlag.Selection,
      void 0
    );
    const p = createCancelablePromise(async (pToken) => {
      const editor2 = this._editor;
      if (!editor2.hasModel()) {
        return;
      }
      const model = editor2.getModel();
      const disposables = new DisposableStore();
      const cts = disposables.add(new CancellationTokenSource(pToken));
      disposables.add(
        editorStateCts.token.onCancellationRequested(
          () => cts.cancel()
        )
      );
      const token = cts.token;
      try {
        await this.mergeInDataFromCopy(dataTransfer, metadata, token);
        if (token.isCancellationRequested) {
          return;
        }
        const supportedProviders = allProviders.filter(
          (provider) => this.isSupportedPasteProvider(provider, dataTransfer)
        );
        if (!supportedProviders.length || supportedProviders.length === 1 && supportedProviders[0] instanceof DefaultTextPasteOrDropEditProvider) {
          return this.applyDefaultPasteHandler(
            dataTransfer,
            metadata,
            token,
            clipboardEvent
          );
        }
        const context = {
          triggerKind: DocumentPasteTriggerKind.Automatic
        };
        const editSession = await this.getPasteEdits(
          supportedProviders,
          dataTransfer,
          model,
          selections,
          context,
          token
        );
        disposables.add(editSession);
        if (token.isCancellationRequested) {
          return;
        }
        if (editSession.edits.length === 1 && editSession.edits[0].provider instanceof DefaultTextPasteOrDropEditProvider) {
          return this.applyDefaultPasteHandler(
            dataTransfer,
            metadata,
            token,
            clipboardEvent
          );
        }
        if (editSession.edits.length) {
          const canShowWidget = editor2.getOption(EditorOption.pasteAs).showPasteSelector === "afterPaste";
          return this._postPasteWidgetManager.applyEditAndShowIfNeeded(
            selections,
            { activeEditIndex: 0, allEdits: editSession.edits },
            canShowWidget,
            (edit, token2) => {
              return new Promise(
                (resolve, reject) => {
                  (async () => {
                    try {
                      const resolveP = edit.provider.resolveDocumentPasteEdit?.(
                        edit,
                        token2
                      );
                      const showP = new DeferredPromise();
                      const resolved = resolveP && await this._pasteProgressManager.showWhile(
                        selections[0].getEndPosition(),
                        localize(
                          "resolveProcess",
                          "Resolving paste edit. Click to cancel"
                        ),
                        Promise.race([
                          showP.p,
                          resolveP
                        ]),
                        {
                          cancel: () => {
                            showP.cancel();
                            return reject(
                              new CancellationError()
                            );
                          }
                        },
                        0
                      );
                      if (resolved) {
                        edit.additionalEdit = resolved.additionalEdit;
                      }
                      return resolve(edit);
                    } catch (err) {
                      return reject(err);
                    }
                  })();
                }
              );
            },
            token
          );
        }
        await this.applyDefaultPasteHandler(
          dataTransfer,
          metadata,
          token,
          clipboardEvent
        );
      } finally {
        disposables.dispose();
        if (this._currentPasteOperation === p) {
          this._currentPasteOperation = void 0;
        }
      }
    });
    this._pasteProgressManager.showWhile(
      selections[0].getEndPosition(),
      localize(
        "pasteIntoEditorProgress",
        "Running paste handlers. Click to cancel and do basic paste"
      ),
      p,
      {
        cancel: async () => {
          try {
            p.cancel();
            if (editorStateCts.token.isCancellationRequested) {
              return;
            }
            await this.applyDefaultPasteHandler(
              dataTransfer,
              metadata,
              editorStateCts.token,
              clipboardEvent
            );
          } finally {
            editorStateCts.dispose();
          }
        }
      }
    ).then(() => {
      editorStateCts.dispose();
    });
    this._currentPasteOperation = p;
  }
  showPasteAsPick(preference, allProviders, selections, dataTransfer, metadata) {
    const p = createCancelablePromise(async (token) => {
      const editor = this._editor;
      if (!editor.hasModel()) {
        return;
      }
      const model = editor.getModel();
      const disposables = new DisposableStore();
      const tokenSource = disposables.add(
        new EditorStateCancellationTokenSource(
          editor,
          CodeEditorStateFlag.Value | CodeEditorStateFlag.Selection,
          void 0,
          token
        )
      );
      try {
        await this.mergeInDataFromCopy(
          dataTransfer,
          metadata,
          tokenSource.token
        );
        if (tokenSource.token.isCancellationRequested) {
          return;
        }
        let supportedProviders = allProviders.filter(
          (provider) => this.isSupportedPasteProvider(
            provider,
            dataTransfer,
            preference
          )
        );
        if (preference) {
          supportedProviders = supportedProviders.filter(
            (provider) => this.providerMatchesPreference(provider, preference)
          );
        }
        const context = {
          triggerKind: DocumentPasteTriggerKind.PasteAs,
          only: preference && preference instanceof HierarchicalKind ? preference : void 0
        };
        let editSession = disposables.add(
          await this.getPasteEdits(
            supportedProviders,
            dataTransfer,
            model,
            selections,
            context,
            tokenSource.token
          )
        );
        if (tokenSource.token.isCancellationRequested) {
          return;
        }
        if (preference) {
          editSession = {
            edits: editSession.edits.filter((edit) => {
              if (preference instanceof HierarchicalKind) {
                return preference.contains(edit.kind);
              } else {
                return preference.providerId === edit.provider.id;
              }
            }),
            dispose: editSession.dispose
          };
        }
        if (!editSession.edits.length) {
          if (context.only) {
            this.showPasteAsNoEditMessage(selections, context.only);
          }
          return;
        }
        let pickedEdit;
        if (preference) {
          pickedEdit = editSession.edits.at(0);
        } else {
          const selected = await this._quickInputService.pick(
            editSession.edits.map(
              (edit) => ({
                label: edit.title,
                description: edit.kind?.value,
                edit
              })
            ),
            {
              placeHolder: localize(
                "pasteAsPickerPlaceholder",
                "Select Paste Action"
              )
            }
          );
          pickedEdit = selected?.edit;
        }
        if (!pickedEdit) {
          return;
        }
        const combinedWorkspaceEdit = createCombinedWorkspaceEdit(
          model.uri,
          selections,
          pickedEdit
        );
        await this._bulkEditService.apply(combinedWorkspaceEdit, {
          editor: this._editor
        });
      } finally {
        disposables.dispose();
        if (this._currentPasteOperation === p) {
          this._currentPasteOperation = void 0;
        }
      }
    });
    this._progressService.withProgress(
      {
        location: ProgressLocation.Window,
        title: localize("pasteAsProgress", "Running paste handlers")
      },
      () => p
    );
  }
  setCopyMetadata(dataTransfer, metadata) {
    dataTransfer.setData(vscodeClipboardMime, JSON.stringify(metadata));
  }
  fetchCopyMetadata(e) {
    if (!e.clipboardData) {
      return;
    }
    const rawMetadata = e.clipboardData.getData(vscodeClipboardMime);
    if (rawMetadata) {
      try {
        return JSON.parse(rawMetadata);
      } catch {
        return void 0;
      }
    }
    const [_, metadata] = ClipboardEventUtils.getTextData(e.clipboardData);
    if (metadata) {
      return {
        defaultPastePayload: {
          mode: metadata.mode,
          multicursorText: metadata.multicursorText ?? null,
          pasteOnNewLine: !!metadata.isFromEmptySelection
        }
      };
    }
    return void 0;
  }
  async mergeInDataFromCopy(dataTransfer, metadata, token) {
    if (metadata?.id && CopyPasteController._currentCopyOperation?.handle === metadata.id) {
      const toMergeDataTransfer = await CopyPasteController._currentCopyOperation.dataTransferPromise;
      if (token.isCancellationRequested) {
        return;
      }
      for (const [key, value] of toMergeDataTransfer) {
        dataTransfer.replace(key, value);
      }
    }
    if (!dataTransfer.has(Mimes.uriList)) {
      const resources = await this._clipboardService.readResources();
      if (token.isCancellationRequested) {
        return;
      }
      if (resources.length) {
        dataTransfer.append(
          Mimes.uriList,
          createStringDataTransferItem(UriList.create(resources))
        );
      }
    }
  }
  async getPasteEdits(providers, dataTransfer, model, selections, context, token) {
    const disposables = new DisposableStore();
    const results = await raceCancellation(
      Promise.all(
        providers.map(async (provider) => {
          try {
            const edits2 = await provider.provideDocumentPasteEdits?.(
              model,
              selections,
              dataTransfer,
              context,
              token
            );
            if (edits2) {
              disposables.add(edits2);
            }
            return edits2?.edits?.map((edit) => ({
              ...edit,
              provider
            }));
          } catch (err) {
            if (!isCancellationError(err)) {
              console.error(err);
            }
            return void 0;
          }
        })
      ),
      token
    );
    const edits = coalesce(results ?? []).flat().filter((edit) => {
      return !context.only || context.only.contains(edit.kind);
    });
    return {
      edits: sortEditsByYieldTo(edits),
      dispose: () => disposables.dispose()
    };
  }
  async applyDefaultPasteHandler(dataTransfer, metadata, token, clipboardEvent) {
    const textDataTransfer = dataTransfer.get(Mimes.text) ?? dataTransfer.get("text");
    const text = await textDataTransfer?.asString() ?? "";
    if (token.isCancellationRequested) {
      return;
    }
    const payload = {
      clipboardEvent,
      text,
      pasteOnNewLine: metadata?.defaultPastePayload.pasteOnNewLine ?? false,
      multicursorText: metadata?.defaultPastePayload.multicursorText ?? null,
      mode: null
    };
    this._editor.trigger("keyboard", Handler.Paste, payload);
  }
  /**
   * Filter out providers if they:
   * - Don't handle any of the data transfer types we have
   * - Don't match the preferred paste kind
   */
  isSupportedPasteProvider(provider, dataTransfer, preference) {
    if (!provider.pasteMimeTypes?.some((type) => dataTransfer.matches(type))) {
      return false;
    }
    return !preference || this.providerMatchesPreference(provider, preference);
  }
  providerMatchesPreference(provider, preference) {
    if (preference instanceof HierarchicalKind) {
      if (!provider.providedPasteEditKinds) {
        return true;
      }
      return provider.providedPasteEditKinds.some(
        (providedKind) => preference.contains(providedKind)
      );
    } else {
      return provider.id === preference.providerId;
    }
  }
};
CopyPasteController = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IBulkEditService),
  __decorateParam(3, IClipboardService),
  __decorateParam(4, ILanguageFeaturesService),
  __decorateParam(5, IQuickInputService),
  __decorateParam(6, IProgressService)
], CopyPasteController);
export {
  CopyPasteController,
  changePasteTypeCommandId,
  pasteWidgetVisibleCtx
};
