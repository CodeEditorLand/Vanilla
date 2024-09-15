var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { CancelablePromise, createCancelablePromise, disposableTimeout, RunOnceScheduler } from "../../../../base/common/async.js";
import { onUnexpectedError, onUnexpectedExternalError } from "../../../../base/common/errors.js";
import { DisposableStore, toDisposable } from "../../../../base/common/lifecycle.js";
import { StableEditorScrollState } from "../../../browser/stableEditorScroll.js";
import { IActiveCodeEditor, ICodeEditor, IViewZoneChangeAccessor, MouseTargetType } from "../../../browser/editorBrowser.js";
import { EditorAction, EditorContributionInstantiation, registerEditorAction, registerEditorContribution, ServicesAccessor } from "../../../browser/editorExtensions.js";
import { EditorOption, EDITOR_FONT_DEFAULTS } from "../../../common/config/editorOptions.js";
import { IEditorContribution } from "../../../common/editorCommon.js";
import { EditorContextKeys } from "../../../common/editorContextKeys.js";
import { IModelDecorationsChangeAccessor } from "../../../common/model.js";
import { CodeLens, Command } from "../../../common/languages.js";
import { CodeLensItem, CodeLensModel, getCodeLensModel } from "./codelens.js";
import { ICodeLensCache } from "./codeLensCache.js";
import { CodeLensHelper, CodeLensWidget } from "./codelensWidget.js";
import { localize } from "../../../../nls.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import { IQuickInputService } from "../../../../platform/quickinput/common/quickInput.js";
import { IFeatureDebounceInformation, ILanguageFeatureDebounceService } from "../../../common/services/languageFeatureDebounce.js";
import { ILanguageFeaturesService } from "../../../common/services/languageFeatures.js";
let CodeLensContribution = class {
  constructor(_editor, _languageFeaturesService, debounceService, _commandService, _notificationService, _codeLensCache) {
    this._editor = _editor;
    this._languageFeaturesService = _languageFeaturesService;
    this._commandService = _commandService;
    this._notificationService = _notificationService;
    this._codeLensCache = _codeLensCache;
    this._provideCodeLensDebounce = debounceService.for(_languageFeaturesService.codeLensProvider, "CodeLensProvide", { min: 250 });
    this._resolveCodeLensesDebounce = debounceService.for(_languageFeaturesService.codeLensProvider, "CodeLensResolve", { min: 250, salt: "resolve" });
    this._resolveCodeLensesScheduler = new RunOnceScheduler(() => this._resolveCodeLensesInViewport(), this._resolveCodeLensesDebounce.default());
    this._disposables.add(this._editor.onDidChangeModel(() => this._onModelChange()));
    this._disposables.add(this._editor.onDidChangeModelLanguage(() => this._onModelChange()));
    this._disposables.add(this._editor.onDidChangeConfiguration((e) => {
      if (e.hasChanged(EditorOption.fontInfo) || e.hasChanged(EditorOption.codeLensFontSize) || e.hasChanged(EditorOption.codeLensFontFamily)) {
        this._updateLensStyle();
      }
      if (e.hasChanged(EditorOption.codeLens)) {
        this._onModelChange();
      }
    }));
    this._disposables.add(_languageFeaturesService.codeLensProvider.onDidChange(this._onModelChange, this));
    this._onModelChange();
    this._updateLensStyle();
  }
  static {
    __name(this, "CodeLensContribution");
  }
  static ID = "css.editor.codeLens";
  _disposables = new DisposableStore();
  _localToDispose = new DisposableStore();
  _lenses = [];
  _provideCodeLensDebounce;
  _resolveCodeLensesDebounce;
  _resolveCodeLensesScheduler;
  _getCodeLensModelPromise;
  _oldCodeLensModels = new DisposableStore();
  _currentCodeLensModel;
  _resolveCodeLensesPromise;
  dispose() {
    this._localDispose();
    this._disposables.dispose();
    this._oldCodeLensModels.dispose();
    this._currentCodeLensModel?.dispose();
  }
  _getLayoutInfo() {
    const lineHeightFactor = Math.max(1.3, this._editor.getOption(EditorOption.lineHeight) / this._editor.getOption(EditorOption.fontSize));
    let fontSize = this._editor.getOption(EditorOption.codeLensFontSize);
    if (!fontSize || fontSize < 5) {
      fontSize = this._editor.getOption(EditorOption.fontSize) * 0.9 | 0;
    }
    return {
      fontSize,
      codeLensHeight: fontSize * lineHeightFactor | 0
    };
  }
  _updateLensStyle() {
    const { codeLensHeight, fontSize } = this._getLayoutInfo();
    const fontFamily = this._editor.getOption(EditorOption.codeLensFontFamily);
    const editorFontInfo = this._editor.getOption(EditorOption.fontInfo);
    const { style } = this._editor.getContainerDomNode();
    style.setProperty("--vscode-editorCodeLens-lineHeight", `${codeLensHeight}px`);
    style.setProperty("--vscode-editorCodeLens-fontSize", `${fontSize}px`);
    style.setProperty("--vscode-editorCodeLens-fontFeatureSettings", editorFontInfo.fontFeatureSettings);
    if (fontFamily) {
      style.setProperty("--vscode-editorCodeLens-fontFamily", fontFamily);
      style.setProperty("--vscode-editorCodeLens-fontFamilyDefault", EDITOR_FONT_DEFAULTS.fontFamily);
    }
    this._editor.changeViewZones((accessor) => {
      for (const lens of this._lenses) {
        lens.updateHeight(codeLensHeight, accessor);
      }
    });
  }
  _localDispose() {
    this._getCodeLensModelPromise?.cancel();
    this._getCodeLensModelPromise = void 0;
    this._resolveCodeLensesPromise?.cancel();
    this._resolveCodeLensesPromise = void 0;
    this._localToDispose.clear();
    this._oldCodeLensModels.clear();
    this._currentCodeLensModel?.dispose();
  }
  _onModelChange() {
    this._localDispose();
    const model = this._editor.getModel();
    if (!model) {
      return;
    }
    if (!this._editor.getOption(EditorOption.codeLens) || model.isTooLargeForTokenization()) {
      return;
    }
    const cachedLenses = this._codeLensCache.get(model);
    if (cachedLenses) {
      this._renderCodeLensSymbols(cachedLenses);
    }
    if (!this._languageFeaturesService.codeLensProvider.has(model)) {
      if (cachedLenses) {
        disposableTimeout(() => {
          const cachedLensesNow = this._codeLensCache.get(model);
          if (cachedLenses === cachedLensesNow) {
            this._codeLensCache.delete(model);
            this._onModelChange();
          }
        }, 30 * 1e3, this._localToDispose);
      }
      return;
    }
    for (const provider of this._languageFeaturesService.codeLensProvider.all(model)) {
      if (typeof provider.onDidChange === "function") {
        const registration = provider.onDidChange(() => scheduler.schedule());
        this._localToDispose.add(registration);
      }
    }
    const scheduler = new RunOnceScheduler(() => {
      const t1 = Date.now();
      this._getCodeLensModelPromise?.cancel();
      this._getCodeLensModelPromise = createCancelablePromise((token) => getCodeLensModel(this._languageFeaturesService.codeLensProvider, model, token));
      this._getCodeLensModelPromise.then((result) => {
        if (this._currentCodeLensModel) {
          this._oldCodeLensModels.add(this._currentCodeLensModel);
        }
        this._currentCodeLensModel = result;
        this._codeLensCache.put(model, result);
        const newDelay = this._provideCodeLensDebounce.update(model, Date.now() - t1);
        scheduler.delay = newDelay;
        this._renderCodeLensSymbols(result);
        this._resolveCodeLensesInViewportSoon();
      }, onUnexpectedError);
    }, this._provideCodeLensDebounce.get(model));
    this._localToDispose.add(scheduler);
    this._localToDispose.add(toDisposable(() => this._resolveCodeLensesScheduler.cancel()));
    this._localToDispose.add(this._editor.onDidChangeModelContent(() => {
      this._editor.changeDecorations((decorationsAccessor) => {
        this._editor.changeViewZones((viewZonesAccessor) => {
          const toDispose = [];
          let lastLensLineNumber = -1;
          this._lenses.forEach((lens) => {
            if (!lens.isValid() || lastLensLineNumber === lens.getLineNumber()) {
              toDispose.push(lens);
            } else {
              lens.update(viewZonesAccessor);
              lastLensLineNumber = lens.getLineNumber();
            }
          });
          const helper = new CodeLensHelper();
          toDispose.forEach((l) => {
            l.dispose(helper, viewZonesAccessor);
            this._lenses.splice(this._lenses.indexOf(l), 1);
          });
          helper.commit(decorationsAccessor);
        });
      });
      scheduler.schedule();
      this._resolveCodeLensesScheduler.cancel();
      this._resolveCodeLensesPromise?.cancel();
      this._resolveCodeLensesPromise = void 0;
    }));
    this._localToDispose.add(this._editor.onDidFocusEditorText(() => {
      scheduler.schedule();
    }));
    this._localToDispose.add(this._editor.onDidBlurEditorText(() => {
      scheduler.cancel();
    }));
    this._localToDispose.add(this._editor.onDidScrollChange((e) => {
      if (e.scrollTopChanged && this._lenses.length > 0) {
        this._resolveCodeLensesInViewportSoon();
      }
    }));
    this._localToDispose.add(this._editor.onDidLayoutChange(() => {
      this._resolveCodeLensesInViewportSoon();
    }));
    this._localToDispose.add(toDisposable(() => {
      if (this._editor.getModel()) {
        const scrollState = StableEditorScrollState.capture(this._editor);
        this._editor.changeDecorations((decorationsAccessor) => {
          this._editor.changeViewZones((viewZonesAccessor) => {
            this._disposeAllLenses(decorationsAccessor, viewZonesAccessor);
          });
        });
        scrollState.restore(this._editor);
      } else {
        this._disposeAllLenses(void 0, void 0);
      }
    }));
    this._localToDispose.add(this._editor.onMouseDown((e) => {
      if (e.target.type !== MouseTargetType.CONTENT_WIDGET) {
        return;
      }
      let target = e.target.element;
      if (target?.tagName === "SPAN") {
        target = target.parentElement;
      }
      if (target?.tagName === "A") {
        for (const lens of this._lenses) {
          const command = lens.getCommand(target);
          if (command) {
            this._commandService.executeCommand(command.id, ...command.arguments || []).catch((err) => this._notificationService.error(err));
            break;
          }
        }
      }
    }));
    scheduler.schedule();
  }
  _disposeAllLenses(decChangeAccessor, viewZoneChangeAccessor) {
    const helper = new CodeLensHelper();
    for (const lens of this._lenses) {
      lens.dispose(helper, viewZoneChangeAccessor);
    }
    if (decChangeAccessor) {
      helper.commit(decChangeAccessor);
    }
    this._lenses.length = 0;
  }
  _renderCodeLensSymbols(symbols) {
    if (!this._editor.hasModel()) {
      return;
    }
    const maxLineNumber = this._editor.getModel().getLineCount();
    const groups = [];
    let lastGroup;
    for (const symbol of symbols.lenses) {
      const line = symbol.symbol.range.startLineNumber;
      if (line < 1 || line > maxLineNumber) {
        continue;
      } else if (lastGroup && lastGroup[lastGroup.length - 1].symbol.range.startLineNumber === line) {
        lastGroup.push(symbol);
      } else {
        lastGroup = [symbol];
        groups.push(lastGroup);
      }
    }
    if (!groups.length && !this._lenses.length) {
      return;
    }
    const scrollState = StableEditorScrollState.capture(this._editor);
    const layoutInfo = this._getLayoutInfo();
    this._editor.changeDecorations((decorationsAccessor) => {
      this._editor.changeViewZones((viewZoneAccessor) => {
        const helper = new CodeLensHelper();
        let codeLensIndex = 0;
        let groupsIndex = 0;
        while (groupsIndex < groups.length && codeLensIndex < this._lenses.length) {
          const symbolsLineNumber = groups[groupsIndex][0].symbol.range.startLineNumber;
          const codeLensLineNumber = this._lenses[codeLensIndex].getLineNumber();
          if (codeLensLineNumber < symbolsLineNumber) {
            this._lenses[codeLensIndex].dispose(helper, viewZoneAccessor);
            this._lenses.splice(codeLensIndex, 1);
          } else if (codeLensLineNumber === symbolsLineNumber) {
            this._lenses[codeLensIndex].updateCodeLensSymbols(groups[groupsIndex], helper);
            groupsIndex++;
            codeLensIndex++;
          } else {
            this._lenses.splice(codeLensIndex, 0, new CodeLensWidget(groups[groupsIndex], this._editor, helper, viewZoneAccessor, layoutInfo.codeLensHeight, () => this._resolveCodeLensesInViewportSoon()));
            codeLensIndex++;
            groupsIndex++;
          }
        }
        while (codeLensIndex < this._lenses.length) {
          this._lenses[codeLensIndex].dispose(helper, viewZoneAccessor);
          this._lenses.splice(codeLensIndex, 1);
        }
        while (groupsIndex < groups.length) {
          this._lenses.push(new CodeLensWidget(groups[groupsIndex], this._editor, helper, viewZoneAccessor, layoutInfo.codeLensHeight, () => this._resolveCodeLensesInViewportSoon()));
          groupsIndex++;
        }
        helper.commit(decorationsAccessor);
      });
    });
    scrollState.restore(this._editor);
  }
  _resolveCodeLensesInViewportSoon() {
    const model = this._editor.getModel();
    if (model) {
      this._resolveCodeLensesScheduler.schedule();
    }
  }
  _resolveCodeLensesInViewport() {
    this._resolveCodeLensesPromise?.cancel();
    this._resolveCodeLensesPromise = void 0;
    const model = this._editor.getModel();
    if (!model) {
      return;
    }
    const toResolve = [];
    const lenses = [];
    this._lenses.forEach((lens) => {
      const request = lens.computeIfNecessary(model);
      if (request) {
        toResolve.push(request);
        lenses.push(lens);
      }
    });
    if (toResolve.length === 0) {
      return;
    }
    const t1 = Date.now();
    const resolvePromise = createCancelablePromise((token) => {
      const promises = toResolve.map((request, i) => {
        const resolvedSymbols = new Array(request.length);
        const promises2 = request.map((request2, i2) => {
          if (!request2.symbol.command && typeof request2.provider.resolveCodeLens === "function") {
            return Promise.resolve(request2.provider.resolveCodeLens(model, request2.symbol, token)).then((symbol) => {
              resolvedSymbols[i2] = symbol;
            }, onUnexpectedExternalError);
          } else {
            resolvedSymbols[i2] = request2.symbol;
            return Promise.resolve(void 0);
          }
        });
        return Promise.all(promises2).then(() => {
          if (!token.isCancellationRequested && !lenses[i].isDisposed()) {
            lenses[i].updateCommands(resolvedSymbols);
          }
        });
      });
      return Promise.all(promises);
    });
    this._resolveCodeLensesPromise = resolvePromise;
    this._resolveCodeLensesPromise.then(() => {
      const newDelay = this._resolveCodeLensesDebounce.update(model, Date.now() - t1);
      this._resolveCodeLensesScheduler.delay = newDelay;
      if (this._currentCodeLensModel) {
        this._codeLensCache.put(model, this._currentCodeLensModel);
      }
      this._oldCodeLensModels.clear();
      if (resolvePromise === this._resolveCodeLensesPromise) {
        this._resolveCodeLensesPromise = void 0;
      }
    }, (err) => {
      onUnexpectedError(err);
      if (resolvePromise === this._resolveCodeLensesPromise) {
        this._resolveCodeLensesPromise = void 0;
      }
    });
  }
  async getModel() {
    await this._getCodeLensModelPromise;
    await this._resolveCodeLensesPromise;
    return !this._currentCodeLensModel?.isDisposed ? this._currentCodeLensModel : void 0;
  }
};
CodeLensContribution = __decorateClass([
  __decorateParam(1, ILanguageFeaturesService),
  __decorateParam(2, ILanguageFeatureDebounceService),
  __decorateParam(3, ICommandService),
  __decorateParam(4, INotificationService),
  __decorateParam(5, ICodeLensCache)
], CodeLensContribution);
registerEditorContribution(CodeLensContribution.ID, CodeLensContribution, EditorContributionInstantiation.AfterFirstRender);
registerEditorAction(class ShowLensesInCurrentLine extends EditorAction {
  static {
    __name(this, "ShowLensesInCurrentLine");
  }
  constructor() {
    super({
      id: "codelens.showLensesInCurrentLine",
      precondition: EditorContextKeys.hasCodeLensProvider,
      label: localize("showLensOnLine", "Show CodeLens Commands For Current Line"),
      alias: "Show CodeLens Commands For Current Line"
    });
  }
  async run(accessor, editor) {
    if (!editor.hasModel()) {
      return;
    }
    const quickInputService = accessor.get(IQuickInputService);
    const commandService = accessor.get(ICommandService);
    const notificationService = accessor.get(INotificationService);
    const lineNumber = editor.getSelection().positionLineNumber;
    const codelensController = editor.getContribution(CodeLensContribution.ID);
    if (!codelensController) {
      return;
    }
    const model = await codelensController.getModel();
    if (!model) {
      return;
    }
    const items = [];
    for (const lens of model.lenses) {
      if (lens.symbol.command && lens.symbol.range.startLineNumber === lineNumber) {
        items.push({
          label: lens.symbol.command.title,
          command: lens.symbol.command
        });
      }
    }
    if (items.length === 0) {
      return;
    }
    const item = await quickInputService.pick(items, {
      canPickMany: false,
      placeHolder: localize("placeHolder", "Select a command")
    });
    if (!item) {
      return;
    }
    let command = item.command;
    if (model.isDisposed) {
      const newModel = await codelensController.getModel();
      const newLens = newModel?.lenses.find((lens) => lens.symbol.range.startLineNumber === lineNumber && lens.symbol.command?.title === command.title);
      if (!newLens || !newLens.symbol.command) {
        return;
      }
      command = newLens.symbol.command;
    }
    try {
      await commandService.executeCommand(command.id, ...command.arguments || []);
    } catch (err) {
      notificationService.error(err);
    }
  }
});
export {
  CodeLensContribution
};
//# sourceMappingURL=codelensController.js.map
