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
import { reset } from "../../../../../base/browser/dom.js";
import {
  SerializableGrid
} from "../../../../../base/browser/ui/grid/grid.js";
import { Orientation } from "../../../../../base/browser/ui/splitview/splitview.js";
import { Color } from "../../../../../base/common/color.js";
import {
  BugIndicatingError,
  onUnexpectedError
} from "../../../../../base/common/errors.js";
import { Emitter } from "../../../../../base/common/event.js";
import {
  Disposable,
  DisposableStore,
  MutableDisposable,
  toDisposable
} from "../../../../../base/common/lifecycle.js";
import {
  autorun,
  autorunWithStore,
  observableValue,
  transaction
} from "../../../../../base/common/observable.js";
import { basename, isEqual } from "../../../../../base/common/resources.js";
import { isDefined } from "../../../../../base/common/types.js";
import "./media/mergeEditor.css";
import { ICodeEditorService } from "../../../../../editor/browser/services/codeEditorService.js";
import {
  ScrollType
} from "../../../../../editor/common/editorCommon.js";
import { ITextResourceConfigurationService } from "../../../../../editor/common/services/textResourceConfiguration.js";
import { localize } from "../../../../../nls.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import {
  IContextKeyService
} from "../../../../../platform/contextkey/common/contextkey.js";
import { IFileService } from "../../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { observableConfigValue } from "../../../../../platform/observable/common/platformObservableUtils.js";
import {
  IStorageService,
  StorageScope,
  StorageTarget
} from "../../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../../platform/telemetry/common/telemetry.js";
import { IThemeService } from "../../../../../platform/theme/common/themeService.js";
import { AbstractTextEditor } from "../../../../browser/parts/editor/textEditor.js";
import {
  DEFAULT_EDITOR_ASSOCIATION
} from "../../../../common/editor.js";
import { applyTextEditorOptions } from "../../../../common/editor/editorOptions.js";
import {
  IEditorGroupsService
} from "../../../../services/editor/common/editorGroupsService.js";
import {
  IEditorResolverService,
  RegisteredEditorPriority
} from "../../../../services/editor/common/editorResolverService.js";
import { IEditorService } from "../../../../services/editor/common/editorService.js";
import {
  readTransientState,
  writeTransientState
} from "../../../codeEditor/browser/toggleWordWrap.js";
import { settingsSashBorder } from "../../../preferences/common/settingsEditorColorRegistry.js";
import {
  ctxIsMergeEditor,
  ctxMergeBaseUri,
  ctxMergeEditorLayout,
  ctxMergeEditorShowBase,
  ctxMergeEditorShowBaseAtTop,
  ctxMergeEditorShowNonConflictingChanges,
  ctxMergeResultUri
} from "../../common/mergeEditor.js";
import { MergeEditorInput } from "../mergeEditorInput.js";
import { deepMerge, PersistentStore, thenIfNotDisposed } from "../utils.js";
import { BaseCodeEditorView } from "./editors/baseCodeEditorView.js";
import { ScrollSynchronizer } from "./scrollSynchronizer.js";
import { MergeEditorViewModel } from "./viewModel.js";
import { ViewZoneComputer } from "./viewZones.js";
import "./colors.js";
import { InputCodeEditorView } from "./editors/inputCodeEditorView.js";
import { ResultCodeEditorView } from "./editors/resultCodeEditorView.js";
let MergeEditor = class extends AbstractTextEditor {
  constructor(group, instantiation, contextKeyService, telemetryService, storageService, themeService, textResourceConfigurationService, _configurationService, editorService, editorGroupService, fileService, _codeEditorService, configurationService) {
    super(
      MergeEditor.ID,
      group,
      telemetryService,
      instantiation,
      storageService,
      textResourceConfigurationService,
      themeService,
      editorService,
      editorGroupService,
      fileService
    );
    this.contextKeyService = contextKeyService;
    this._configurationService = _configurationService;
    this._codeEditorService = _codeEditorService;
    this.configurationService = configurationService;
  }
  static ID = "mergeEditor";
  _sessionDisposables = new DisposableStore();
  _viewModel = observableValue(this, void 0);
  get viewModel() {
    return this._viewModel;
  }
  rootHtmlElement;
  _grid = this._register(
    new MutableDisposable()
  );
  input1View = this._register(
    this.instantiationService.createInstance(
      InputCodeEditorView,
      1,
      this._viewModel
    )
  );
  baseView = observableValue(
    this,
    void 0
  );
  baseViewOptions = observableValue(this, void 0);
  input2View = this._register(
    this.instantiationService.createInstance(
      InputCodeEditorView,
      2,
      this._viewModel
    )
  );
  inputResultView = this._register(
    this.instantiationService.createInstance(
      ResultCodeEditorView,
      this._viewModel
    )
  );
  _layoutMode = this.instantiationService.createInstance(
    MergeEditorLayoutStore
  );
  _layoutModeObs = observableValue(
    this,
    this._layoutMode.value
  );
  _ctxIsMergeEditor = ctxIsMergeEditor.bindTo(this.contextKeyService);
  _ctxUsesColumnLayout = ctxMergeEditorLayout.bindTo(this.contextKeyService);
  _ctxShowBase = ctxMergeEditorShowBase.bindTo(this.contextKeyService);
  _ctxShowBaseAtTop = ctxMergeEditorShowBaseAtTop.bindTo(
    this.contextKeyService
  );
  _ctxResultUri = ctxMergeResultUri.bindTo(this.contextKeyService);
  _ctxBaseUri = ctxMergeBaseUri.bindTo(
    this.contextKeyService
  );
  _ctxShowNonConflictingChanges = ctxMergeEditorShowNonConflictingChanges.bindTo(this.contextKeyService);
  _inputModel = observableValue(this, void 0);
  get inputModel() {
    return this._inputModel;
  }
  get model() {
    return this.inputModel.get()?.model;
  }
  get inputsWritable() {
    return !!this._configurationService.getValue(
      "mergeEditor.writableInputs"
    );
  }
  viewZoneComputer = new ViewZoneComputer(
    this.input1View.editor,
    this.input2View.editor,
    this.inputResultView.editor
  );
  codeLensesVisible = observableConfigValue(
    "mergeEditor.showCodeLenses",
    true,
    this.configurationService
  );
  scrollSynchronizer = this._register(
    new ScrollSynchronizer(
      this._viewModel,
      this.input1View,
      this.input2View,
      this.baseView,
      this.inputResultView,
      this._layoutModeObs
    )
  );
  dispose() {
    this._sessionDisposables.dispose();
    this._ctxIsMergeEditor.reset();
    this._ctxUsesColumnLayout.reset();
    this._ctxShowNonConflictingChanges.reset();
    super.dispose();
  }
  // #region layout constraints
  _onDidChangeSizeConstraints = new Emitter();
  onDidChangeSizeConstraints = this._onDidChangeSizeConstraints.event;
  get minimumWidth() {
    return this._layoutMode.value.kind === "mixed" ? this.input1View.view.minimumWidth + this.input2View.view.minimumWidth : this.input1View.view.minimumWidth + this.input2View.view.minimumWidth + this.inputResultView.view.minimumWidth;
  }
  // #endregion
  getTitle() {
    if (this.input) {
      return this.input.getName();
    }
    return localize("mergeEditor", "Text Merge Editor");
  }
  createEditorControl(parent, initialOptions) {
    this.rootHtmlElement = parent;
    parent.classList.add("merge-editor");
    this.applyLayout(this._layoutMode.value);
    this.applyOptions(initialOptions);
  }
  updateEditorControlOptions(options) {
    this.applyOptions(options);
  }
  applyOptions(options) {
    const inputOptions = deepMerge(
      options,
      {
        minimap: { enabled: false },
        glyphMargin: false,
        lineNumbersMinChars: 2,
        readOnly: !this.inputsWritable
      }
    );
    this.input1View.updateOptions(inputOptions);
    this.input2View.updateOptions(inputOptions);
    this.baseViewOptions.set(
      { ...this.input2View.editor.getRawOptions() },
      void 0
    );
    this.inputResultView.updateOptions(options);
  }
  getMainControl() {
    return this.inputResultView.editor;
  }
  layout(dimension) {
    this._grid.value?.layout(dimension.width, dimension.height);
  }
  async setInput(input, options, context, token) {
    if (!(input instanceof MergeEditorInput)) {
      throw new BugIndicatingError("ONLY MergeEditorInput is supported");
    }
    await super.setInput(input, options, context, token);
    this._sessionDisposables.clear();
    transaction((tx) => {
      this._viewModel.set(void 0, tx);
      this._inputModel.set(void 0, tx);
    });
    const inputModel = await input.resolve();
    const model = inputModel.model;
    const viewModel = this.instantiationService.createInstance(
      MergeEditorViewModel,
      model,
      this.input1View,
      this.input2View,
      this.inputResultView,
      this.baseView,
      this.showNonConflictingChanges
    );
    model.telemetry.reportMergeEditorOpened({
      combinableConflictCount: model.combinableConflictCount,
      conflictCount: model.conflictCount,
      baseTop: this._layoutModeObs.get().showBaseAtTop,
      baseVisible: this._layoutModeObs.get().showBase,
      isColumnView: this._layoutModeObs.get().kind === "columns"
    });
    transaction((tx) => {
      this._viewModel.set(viewModel, tx);
      this._inputModel.set(inputModel, tx);
    });
    this._sessionDisposables.add(viewModel);
    this._ctxResultUri.set(inputModel.resultUri.toString());
    this._ctxBaseUri.set(model.base.uri.toString());
    this._sessionDisposables.add(
      toDisposable(() => {
        this._ctxBaseUri.reset();
        this._ctxResultUri.reset();
      })
    );
    this._sessionDisposables.add(
      autorunWithStore((reader, store) => {
        const baseView = this.baseView.read(reader);
        this.inputResultView.editor.changeViewZones(
          (resultViewZoneAccessor) => {
            const layout = this._layoutModeObs.read(reader);
            const shouldAlignResult = layout.kind === "columns";
            const shouldAlignBase = layout.kind === "mixed" && !layout.showBaseAtTop;
            this.input1View.editor.changeViewZones(
              (input1ViewZoneAccessor) => {
                this.input2View.editor.changeViewZones(
                  (input2ViewZoneAccessor) => {
                    if (baseView) {
                      baseView.editor.changeViewZones(
                        (baseViewZoneAccessor) => {
                          store.add(
                            this.setViewZones(
                              reader,
                              viewModel,
                              this.input1View.editor,
                              input1ViewZoneAccessor,
                              this.input2View.editor,
                              input2ViewZoneAccessor,
                              baseView.editor,
                              baseViewZoneAccessor,
                              shouldAlignBase,
                              this.inputResultView.editor,
                              resultViewZoneAccessor,
                              shouldAlignResult
                            )
                          );
                        }
                      );
                    } else {
                      store.add(
                        this.setViewZones(
                          reader,
                          viewModel,
                          this.input1View.editor,
                          input1ViewZoneAccessor,
                          this.input2View.editor,
                          input2ViewZoneAccessor,
                          void 0,
                          void 0,
                          false,
                          this.inputResultView.editor,
                          resultViewZoneAccessor,
                          shouldAlignResult
                        )
                      );
                    }
                  }
                );
              }
            );
          }
        );
        this.scrollSynchronizer.updateScrolling();
      })
    );
    const viewState = this.loadEditorViewState(input, context);
    if (viewState) {
      this._applyViewState(viewState);
    } else {
      this._sessionDisposables.add(
        thenIfNotDisposed(model.onInitialized, () => {
          const firstConflict = model.modifiedBaseRanges.get().find((r) => r.isConflicting);
          if (!firstConflict) {
            return;
          }
          this.input1View.editor.revealLineInCenter(
            firstConflict.input1Range.startLineNumber
          );
          transaction((tx) => {
            viewModel.setActiveModifiedBaseRange(firstConflict, tx);
          });
        })
      );
    }
    const mirrorWordWrapTransientState = (candidate) => {
      const candidateState = readTransientState(
        candidate,
        this._codeEditorService
      );
      writeTransientState(
        model.input2.textModel,
        candidateState,
        this._codeEditorService
      );
      writeTransientState(
        model.input1.textModel,
        candidateState,
        this._codeEditorService
      );
      writeTransientState(
        model.resultTextModel,
        candidateState,
        this._codeEditorService
      );
      const baseTextModel = this.baseView.get()?.editor.getModel();
      if (baseTextModel) {
        writeTransientState(
          baseTextModel,
          candidateState,
          this._codeEditorService
        );
      }
    };
    this._sessionDisposables.add(
      this._codeEditorService.onDidChangeTransientModelProperty(
        (candidate) => {
          mirrorWordWrapTransientState(candidate);
        }
      )
    );
    mirrorWordWrapTransientState(this.inputResultView.editor.getModel());
    const that = this;
    this._sessionDisposables.add(
      new class {
        _disposable = new DisposableStore();
        constructor() {
          for (const model2 of this.baseInput1Input2()) {
            this._disposable.add(
              model2.onDidChangeContent(
                () => this._checkBaseInput1Input2AllEmpty()
              )
            );
          }
        }
        dispose() {
          this._disposable.dispose();
        }
        *baseInput1Input2() {
          yield model.base;
          yield model.input1.textModel;
          yield model.input2.textModel;
        }
        _checkBaseInput1Input2AllEmpty() {
          for (const model2 of this.baseInput1Input2()) {
            if (model2.getValueLength() > 0) {
              return;
            }
          }
          that.editorService.replaceEditors(
            [
              {
                editor: input,
                replacement: {
                  resource: input.result,
                  options: { preserveFocus: true }
                },
                forceReplaceDirty: true
              }
            ],
            that.group
          );
        }
      }()
    );
  }
  setViewZones(reader, viewModel, input1Editor, input1ViewZoneAccessor, input2Editor, input2ViewZoneAccessor, baseEditor, baseViewZoneAccessor, shouldAlignBase, resultEditor, resultViewZoneAccessor, shouldAlignResult) {
    const input1ViewZoneIds = [];
    const input2ViewZoneIds = [];
    const baseViewZoneIds = [];
    const resultViewZoneIds = [];
    const viewZones = this.viewZoneComputer.computeViewZones(
      reader,
      viewModel,
      {
        codeLensesVisible: this.codeLensesVisible.read(reader),
        showNonConflictingChanges: this.showNonConflictingChanges.read(reader),
        shouldAlignBase,
        shouldAlignResult
      }
    );
    const disposableStore = new DisposableStore();
    if (baseViewZoneAccessor) {
      for (const v of viewZones.baseViewZones) {
        v.create(
          baseViewZoneAccessor,
          baseViewZoneIds,
          disposableStore
        );
      }
    }
    for (const v of viewZones.resultViewZones) {
      v.create(
        resultViewZoneAccessor,
        resultViewZoneIds,
        disposableStore
      );
    }
    for (const v of viewZones.input1ViewZones) {
      v.create(
        input1ViewZoneAccessor,
        input1ViewZoneIds,
        disposableStore
      );
    }
    for (const v of viewZones.input2ViewZones) {
      v.create(
        input2ViewZoneAccessor,
        input2ViewZoneIds,
        disposableStore
      );
    }
    disposableStore.add({
      dispose: () => {
        input1Editor.changeViewZones((a) => {
          for (const zone of input1ViewZoneIds) {
            a.removeZone(zone);
          }
        });
        input2Editor.changeViewZones((a) => {
          for (const zone of input2ViewZoneIds) {
            a.removeZone(zone);
          }
        });
        baseEditor?.changeViewZones((a) => {
          for (const zone of baseViewZoneIds) {
            a.removeZone(zone);
          }
        });
        resultEditor.changeViewZones((a) => {
          for (const zone of resultViewZoneIds) {
            a.removeZone(zone);
          }
        });
      }
    });
    return disposableStore;
  }
  setOptions(options) {
    super.setOptions(options);
    if (options) {
      applyTextEditorOptions(
        options,
        this.inputResultView.editor,
        ScrollType.Smooth
      );
    }
  }
  clearInput() {
    super.clearInput();
    this._sessionDisposables.clear();
    for (const { editor } of [
      this.input1View,
      this.input2View,
      this.inputResultView
    ]) {
      editor.setModel(null);
    }
  }
  focus() {
    super.focus();
    (this.getControl() ?? this.inputResultView.editor).focus();
  }
  hasFocus() {
    for (const { editor } of [
      this.input1View,
      this.input2View,
      this.inputResultView
    ]) {
      if (editor.hasTextFocus()) {
        return true;
      }
    }
    return super.hasFocus();
  }
  setEditorVisible(visible) {
    super.setEditorVisible(visible);
    for (const { editor } of [
      this.input1View,
      this.input2View,
      this.inputResultView
    ]) {
      if (visible) {
        editor.onVisible();
      } else {
        editor.onHide();
      }
    }
    this._ctxIsMergeEditor.set(visible);
  }
  // ---- interact with "outside world" via`getControl`, `scopedContextKeyService`: we only expose the result-editor keep the others internal
  getControl() {
    return this.inputResultView.editor;
  }
  get scopedContextKeyService() {
    const control = this.getControl();
    return control?.invokeWithinContext(
      (accessor) => accessor.get(IContextKeyService)
    );
  }
  // --- layout
  toggleBase() {
    this.setLayout({
      ...this._layoutMode.value,
      showBase: !this._layoutMode.value.showBase
    });
  }
  toggleShowBaseTop() {
    const showBaseTop = this._layoutMode.value.showBase && this._layoutMode.value.showBaseAtTop;
    this.setLayout({
      ...this._layoutMode.value,
      showBaseAtTop: true,
      showBase: !showBaseTop
    });
  }
  toggleShowBaseCenter() {
    const showBaseCenter = this._layoutMode.value.showBase && !this._layoutMode.value.showBaseAtTop;
    this.setLayout({
      ...this._layoutMode.value,
      showBaseAtTop: false,
      showBase: !showBaseCenter
    });
  }
  setLayoutKind(kind) {
    this.setLayout({
      ...this._layoutMode.value,
      kind
    });
  }
  setLayout(newLayout) {
    const value = this._layoutMode.value;
    if (JSON.stringify(value) === JSON.stringify(newLayout)) {
      return;
    }
    this.model?.telemetry.reportLayoutChange({
      baseTop: newLayout.showBaseAtTop,
      baseVisible: newLayout.showBase,
      isColumnView: newLayout.kind === "columns"
    });
    this.applyLayout(newLayout);
  }
  baseViewDisposables = this._register(
    new DisposableStore()
  );
  applyLayout(layout) {
    transaction((tx) => {
      if (layout.showBase && !this.baseView.get()) {
        this.baseViewDisposables.clear();
        const baseView = this.baseViewDisposables.add(
          this.instantiationService.createInstance(
            BaseCodeEditorView,
            this.viewModel
          )
        );
        this.baseViewDisposables.add(
          autorun((reader) => {
            const options = this.baseViewOptions.read(reader);
            if (options) {
              baseView.updateOptions(options);
            }
          })
        );
        this.baseView.set(baseView, tx);
      } else if (!layout.showBase && this.baseView.get()) {
        this.baseView.set(void 0, tx);
        this.baseViewDisposables.clear();
      }
      if (layout.kind === "mixed") {
        this.setGrid(
          [
            layout.showBaseAtTop && layout.showBase ? {
              size: 38,
              data: this.baseView.get().view
            } : void 0,
            {
              size: 38,
              groups: [
                { data: this.input1View.view },
                !layout.showBaseAtTop && layout.showBase ? { data: this.baseView.get().view } : void 0,
                { data: this.input2View.view }
              ].filter(isDefined)
            },
            {
              size: 62,
              data: this.inputResultView.view
            }
          ].filter(isDefined)
        );
      } else if (layout.kind === "columns") {
        this.setGrid(
          [
            layout.showBase ? {
              size: 40,
              data: this.baseView.get().view
            } : void 0,
            {
              size: 60,
              groups: [
                { data: this.input1View.view },
                { data: this.inputResultView.view },
                { data: this.input2View.view }
              ]
            }
          ].filter(isDefined)
        );
      }
      this._layoutMode.value = layout;
      this._ctxUsesColumnLayout.set(layout.kind);
      this._ctxShowBase.set(layout.showBase);
      this._ctxShowBaseAtTop.set(layout.showBaseAtTop);
      this._onDidChangeSizeConstraints.fire();
      this._layoutModeObs.set(layout, tx);
    });
  }
  setGrid(descriptor) {
    let width = -1;
    let height = -1;
    if (this._grid.value) {
      width = this._grid.value.width;
      height = this._grid.value.height;
    }
    this._grid.value = SerializableGrid.from(
      {
        orientation: Orientation.VERTICAL,
        size: 100,
        groups: descriptor
      },
      {
        styles: {
          separatorBorder: this.theme.getColor(settingsSashBorder) ?? Color.transparent
        },
        proportionalLayout: true
      }
    );
    reset(this.rootHtmlElement, this._grid.value.element);
    if (width !== -1) {
      this._grid.value.layout(width, height);
    }
  }
  _applyViewState(state) {
    if (!state) {
      return;
    }
    this.inputResultView.editor.restoreViewState(state);
    if (state.input1State) {
      this.input1View.editor.restoreViewState(state.input1State);
    }
    if (state.input2State) {
      this.input2View.editor.restoreViewState(state.input2State);
    }
    if (state.focusIndex >= 0) {
      [
        this.input1View.editor,
        this.input2View.editor,
        this.inputResultView.editor
      ][state.focusIndex].focus();
    }
  }
  computeEditorViewState(resource) {
    if (!isEqual(this.inputModel.get()?.resultUri, resource)) {
      return void 0;
    }
    const result = this.inputResultView.editor.saveViewState();
    if (!result) {
      return void 0;
    }
    const input1State = this.input1View.editor.saveViewState() ?? void 0;
    const input2State = this.input2View.editor.saveViewState() ?? void 0;
    const focusIndex = [
      this.input1View.editor,
      this.input2View.editor,
      this.inputResultView.editor
    ].findIndex((editor) => editor.hasWidgetFocus());
    return { ...result, input1State, input2State, focusIndex };
  }
  tracksEditorViewState(input) {
    return input instanceof MergeEditorInput;
  }
  showNonConflictingChangesStore = this.instantiationService.createInstance(
    PersistentStore,
    "mergeEditor/showNonConflictingChanges"
  );
  showNonConflictingChanges = observableValue(
    this,
    this.showNonConflictingChangesStore.get() ?? false
  );
  toggleShowNonConflictingChanges() {
    this.showNonConflictingChanges.set(
      !this.showNonConflictingChanges.get(),
      void 0
    );
    this.showNonConflictingChangesStore.set(
      this.showNonConflictingChanges.get()
    );
    this._ctxShowNonConflictingChanges.set(
      this.showNonConflictingChanges.get()
    );
  }
};
MergeEditor = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, ITelemetryService),
  __decorateParam(4, IStorageService),
  __decorateParam(5, IThemeService),
  __decorateParam(6, ITextResourceConfigurationService),
  __decorateParam(7, IConfigurationService),
  __decorateParam(8, IEditorService),
  __decorateParam(9, IEditorGroupsService),
  __decorateParam(10, IFileService),
  __decorateParam(11, ICodeEditorService),
  __decorateParam(12, IConfigurationService)
], MergeEditor);
let MergeEditorLayoutStore = class {
  constructor(_storageService) {
    this._storageService = _storageService;
    const value = _storageService.get(
      MergeEditorLayoutStore._key,
      StorageScope.PROFILE,
      "mixed"
    );
    if (value === "mixed" || value === "columns") {
      this._value = { kind: value, showBase: false, showBaseAtTop: true };
    } else if (value) {
      try {
        this._value = JSON.parse(value);
      } catch (e) {
        onUnexpectedError(e);
      }
    }
  }
  static _key = "mergeEditor/layout";
  _value = {
    kind: "mixed",
    showBase: false,
    showBaseAtTop: true
  };
  get value() {
    return this._value;
  }
  set value(value) {
    if (this._value !== value) {
      this._value = value;
      this._storageService.store(
        MergeEditorLayoutStore._key,
        JSON.stringify(this._value),
        StorageScope.PROFILE,
        StorageTarget.USER
      );
    }
  }
};
MergeEditorLayoutStore = __decorateClass([
  __decorateParam(0, IStorageService)
], MergeEditorLayoutStore);
let MergeEditorOpenHandlerContribution = class extends Disposable {
  constructor(_editorService, codeEditorService) {
    super();
    this._editorService = _editorService;
    this._store.add(
      codeEditorService.registerCodeEditorOpenHandler(
        this.openCodeEditorFromMergeEditor.bind(this)
      )
    );
  }
  async openCodeEditorFromMergeEditor(input, _source, sideBySide) {
    const activePane = this._editorService.activeEditorPane;
    if (!sideBySide && input.options && activePane instanceof MergeEditor && activePane.getControl() && activePane.input instanceof MergeEditorInput && isEqual(input.resource, activePane.input.result)) {
      const targetEditor = activePane.getControl();
      applyTextEditorOptions(
        input.options,
        targetEditor,
        ScrollType.Smooth
      );
      return targetEditor;
    }
    return null;
  }
};
MergeEditorOpenHandlerContribution = __decorateClass([
  __decorateParam(0, IEditorService),
  __decorateParam(1, ICodeEditorService)
], MergeEditorOpenHandlerContribution);
let MergeEditorResolverContribution = class extends Disposable {
  static ID = "workbench.contrib.mergeEditorResolver";
  constructor(editorResolverService, instantiationService) {
    super();
    const mergeEditorInputFactory = (mergeEditor) => {
      return {
        editor: instantiationService.createInstance(
          MergeEditorInput,
          mergeEditor.base.resource,
          {
            uri: mergeEditor.input1.resource,
            title: mergeEditor.input1.label ?? basename(mergeEditor.input1.resource),
            description: mergeEditor.input1.description ?? "",
            detail: mergeEditor.input1.detail
          },
          {
            uri: mergeEditor.input2.resource,
            title: mergeEditor.input2.label ?? basename(mergeEditor.input2.resource),
            description: mergeEditor.input2.description ?? "",
            detail: mergeEditor.input2.detail
          },
          mergeEditor.result.resource
        )
      };
    };
    this._register(
      editorResolverService.registerEditor(
        `*`,
        {
          id: DEFAULT_EDITOR_ASSOCIATION.id,
          label: DEFAULT_EDITOR_ASSOCIATION.displayName,
          detail: DEFAULT_EDITOR_ASSOCIATION.providerDisplayName,
          priority: RegisteredEditorPriority.builtin
        },
        {},
        {
          createMergeEditorInput: mergeEditorInputFactory
        }
      )
    );
  }
};
MergeEditorResolverContribution = __decorateClass([
  __decorateParam(0, IEditorResolverService),
  __decorateParam(1, IInstantiationService)
], MergeEditorResolverContribution);
export {
  MergeEditor,
  MergeEditorOpenHandlerContribution,
  MergeEditorResolverContribution
};
