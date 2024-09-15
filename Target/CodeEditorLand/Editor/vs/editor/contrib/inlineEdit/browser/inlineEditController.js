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
import { createStyleSheet2 } from "../../../../base/browser/dom.js";
import {
  CancellationTokenSource
} from "../../../../base/common/cancellation.js";
import { onUnexpectedExternalError } from "../../../../base/common/errors.js";
import {
  Disposable
} from "../../../../base/common/lifecycle.js";
import {
  autorun,
  constObservable,
  derivedDisposable,
  observableFromEvent,
  observableSignalFromEvent,
  observableValue,
  transaction
} from "../../../../base/common/observable.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import {
  IContextKeyService,
  RawContextKey
} from "../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IDiffProviderFactoryService } from "../../../browser/widget/diffEditor/diffProviderFactoryService.js";
import { EditorOption } from "../../../common/config/editorOptions.js";
import { EditOperation } from "../../../common/core/editOperation.js";
import { Position } from "../../../common/core/position.js";
import { Range } from "../../../common/core/range.js";
import {
  InlineEditTriggerKind
} from "../../../common/languages.js";
import { ILanguageFeaturesService } from "../../../common/services/languageFeatures.js";
import { IModelService } from "../../../common/services/model.js";
import {
  GhostText,
  GhostTextPart
} from "../../inlineCompletions/browser/model/ghostText.js";
import { GhostTextWidget } from "./ghostTextWidget.js";
import { InlineEditHintsWidget } from "./inlineEditHintsWidget.js";
import { InlineEditSideBySideWidget } from "./inlineEditSideBySideWidget.js";
let InlineEditController = class extends Disposable {
  constructor(editor, instantiationService, contextKeyService, languageFeaturesService, _commandService, _configurationService, _diffProviderFactoryService, _modelService) {
    super();
    this.editor = editor;
    this.instantiationService = instantiationService;
    this.contextKeyService = contextKeyService;
    this.languageFeaturesService = languageFeaturesService;
    this._commandService = _commandService;
    this._configurationService = _configurationService;
    this._diffProviderFactoryService = _diffProviderFactoryService;
    this._modelService = _modelService;
    const modelChangedSignal = observableSignalFromEvent(
      "InlineEditController.modelContentChangedSignal",
      editor.onDidChangeModelContent
    );
    this._register(
      autorun((reader) => {
        if (!this._enabled.read(reader)) {
          return;
        }
        modelChangedSignal.read(reader);
        if (this._isAccepting.read(reader)) {
          return;
        }
        this.getInlineEdit(editor, true);
      })
    );
    const cursorPosition = observableFromEvent(
      this,
      editor.onDidChangeCursorPosition,
      () => editor.getPosition()
    );
    this._register(
      autorun((reader) => {
        if (!this._enabled.read(reader)) {
          return;
        }
        const pos = cursorPosition.read(reader);
        if (pos) {
          this.checkCursorPosition(pos);
        }
      })
    );
    this._register(
      autorun((reader) => {
        const currentEdit = this._currentEdit.read(reader);
        this._isCursorAtInlineEditContext.set(false);
        if (!currentEdit) {
          this._isVisibleContext.set(false);
          return;
        }
        this._isVisibleContext.set(true);
        const pos = editor.getPosition();
        if (pos) {
          this.checkCursorPosition(pos);
        }
      })
    );
    const editorBlurSingal = observableSignalFromEvent(
      "InlineEditController.editorBlurSignal",
      editor.onDidBlurEditorWidget
    );
    this._register(
      autorun(async (reader) => {
        if (!this._enabled.read(reader)) {
          return;
        }
        editorBlurSingal.read(reader);
        if (this._configurationService.getValue(
          "editor.experimentalInlineEdit.keepOnBlur"
        ) || editor.getOption(EditorOption.inlineEdit).keepOnBlur) {
          return;
        }
        this._currentRequestCts?.dispose(true);
        this._currentRequestCts = void 0;
        await this.clear(false);
      })
    );
    const editorFocusSignal = observableSignalFromEvent(
      "InlineEditController.editorFocusSignal",
      editor.onDidFocusEditorText
    );
    this._register(
      autorun((reader) => {
        if (!this._enabled.read(reader)) {
          return;
        }
        editorFocusSignal.read(reader);
        this.getInlineEdit(editor, true);
      })
    );
    const styleElement = this._register(createStyleSheet2());
    this._register(
      autorun((reader) => {
        const fontFamily = this._fontFamily.read(reader);
        styleElement.setStyle(
          fontFamily === "" || fontFamily === "default" ? `` : `
.monaco-editor .inline-edit-decoration,
.monaco-editor .inline-edit-decoration-preview,
.monaco-editor .inline-edit {
	font-family: ${fontFamily};
}`
        );
      })
    );
    this._register(
      new InlineEditHintsWidget(
        this.editor,
        this._currentWidget,
        this.instantiationService
      )
    );
    this._register(
      new InlineEditSideBySideWidget(
        this.editor,
        this._currentEdit,
        this.instantiationService,
        this._diffProviderFactoryService,
        this._modelService
      )
    );
  }
  static {
    __name(this, "InlineEditController");
  }
  static ID = "editor.contrib.inlineEditController";
  static inlineEditVisibleKey = "inlineEditVisible";
  static inlineEditVisibleContext = new RawContextKey(this.inlineEditVisibleKey, false);
  _isVisibleContext = InlineEditController.inlineEditVisibleContext.bindTo(
    this.contextKeyService
  );
  static cursorAtInlineEditKey = "cursorAtInlineEdit";
  static cursorAtInlineEditContext = new RawContextKey(this.cursorAtInlineEditKey, false);
  _isCursorAtInlineEditContext = InlineEditController.cursorAtInlineEditContext.bindTo(
    this.contextKeyService
  );
  static get(editor) {
    return editor.getContribution(
      InlineEditController.ID
    );
  }
  _currentEdit = observableValue(this, void 0);
  _currentWidget = derivedDisposable(this._currentEdit, (reader) => {
    const edit = this._currentEdit.read(reader);
    if (!edit) {
      return void 0;
    }
    const line = edit.range.endLineNumber;
    const column = edit.range.endColumn;
    const textToDisplay = edit.text.endsWith("\n") && !(edit.range.startLineNumber === edit.range.endLineNumber && edit.range.startColumn === edit.range.endColumn) ? edit.text.slice(0, -1) : edit.text;
    const ghostText = new GhostText(line, [
      new GhostTextPart(column, textToDisplay, false)
    ]);
    const isSingleLine = edit.range.startLineNumber === edit.range.endLineNumber && ghostText.parts.length === 1 && ghostText.parts[0].lines.length === 1;
    const isPureRemoval = edit.text === "";
    if (!isSingleLine && !isPureRemoval) {
      return void 0;
    }
    const instance = this.instantiationService.createInstance(
      GhostTextWidget,
      this.editor,
      {
        ghostText: constObservable(ghostText),
        minReservedLineCount: constObservable(0),
        targetTextModel: constObservable(
          this.editor.getModel() ?? void 0
        ),
        range: constObservable(edit.range)
      }
    );
    return instance;
  });
  _currentRequestCts;
  _jumpBackPosition;
  _isAccepting = observableValue(
    this,
    false
  );
  _enabled = observableFromEvent(
    this,
    this.editor.onDidChangeConfiguration,
    () => this.editor.getOption(EditorOption.inlineEdit).enabled
  );
  _fontFamily = observableFromEvent(
    this,
    this.editor.onDidChangeConfiguration,
    () => this.editor.getOption(EditorOption.inlineEdit).fontFamily
  );
  checkCursorPosition(position) {
    if (!this._currentEdit) {
      this._isCursorAtInlineEditContext.set(false);
      return;
    }
    const gt = this._currentEdit.get();
    if (!gt) {
      this._isCursorAtInlineEditContext.set(false);
      return;
    }
    this._isCursorAtInlineEditContext.set(
      Range.containsPosition(gt.range, position)
    );
  }
  validateInlineEdit(editor, edit) {
    if (edit.text.includes("\n") && edit.range.startLineNumber !== edit.range.endLineNumber && edit.range.startColumn !== edit.range.endColumn) {
      const firstColumn = edit.range.startColumn;
      if (firstColumn !== 1) {
        return false;
      }
      const lastLine = edit.range.endLineNumber;
      const lastColumn = edit.range.endColumn;
      const lineLength = editor.getModel()?.getLineLength(lastLine) ?? 0;
      if (lastColumn !== lineLength + 1) {
        return false;
      }
    }
    return true;
  }
  async fetchInlineEdit(editor, auto) {
    if (this._currentRequestCts) {
      this._currentRequestCts.dispose(true);
    }
    const model = editor.getModel();
    if (!model) {
      return;
    }
    const modelVersion = model.getVersionId();
    const providers = this.languageFeaturesService.inlineEditProvider.all(model);
    if (providers.length === 0) {
      return;
    }
    const provider = providers[0];
    this._currentRequestCts = new CancellationTokenSource();
    const token = this._currentRequestCts.token;
    const triggerKind = auto ? InlineEditTriggerKind.Automatic : InlineEditTriggerKind.Invoke;
    const shouldDebounce = auto;
    if (shouldDebounce) {
      await wait(50, token);
    }
    if (token.isCancellationRequested || model.isDisposed() || model.getVersionId() !== modelVersion) {
      return;
    }
    const edit = await provider.provideInlineEdit(
      model,
      { triggerKind },
      token
    );
    if (!edit) {
      return;
    }
    if (token.isCancellationRequested || model.isDisposed() || model.getVersionId() !== modelVersion) {
      return;
    }
    if (!this.validateInlineEdit(editor, edit)) {
      return;
    }
    return edit;
  }
  async getInlineEdit(editor, auto) {
    this._isCursorAtInlineEditContext.set(false);
    await this.clear();
    const edit = await this.fetchInlineEdit(editor, auto);
    if (!edit) {
      return;
    }
    this._currentEdit.set(edit, void 0);
  }
  async trigger() {
    await this.getInlineEdit(this.editor, false);
  }
  async jumpBack() {
    if (!this._jumpBackPosition) {
      return;
    }
    this.editor.setPosition(this._jumpBackPosition);
    this.editor.revealPositionInCenterIfOutsideViewport(
      this._jumpBackPosition
    );
  }
  async accept() {
    this._isAccepting.set(true, void 0);
    const data = this._currentEdit.get();
    if (!data) {
      return;
    }
    let text = data.text;
    if (data.text.startsWith("\n")) {
      text = data.text.substring(1);
    }
    this.editor.pushUndoStop();
    this.editor.executeEdits("acceptCurrent", [
      EditOperation.replace(Range.lift(data.range), text)
    ]);
    if (data.accepted) {
      await this._commandService.executeCommand(
        data.accepted.id,
        ...data.accepted.arguments || []
      ).then(void 0, onUnexpectedExternalError);
    }
    this.freeEdit(data);
    transaction((tx) => {
      this._currentEdit.set(void 0, tx);
      this._isAccepting.set(false, tx);
    });
  }
  jumpToCurrent() {
    this._jumpBackPosition = this.editor.getSelection()?.getStartPosition();
    const data = this._currentEdit.get();
    if (!data) {
      return;
    }
    const position = Position.lift({
      lineNumber: data.range.startLineNumber,
      column: data.range.startColumn
    });
    this.editor.setPosition(position);
    this.editor.revealPositionInCenterIfOutsideViewport(position);
  }
  async clear(sendRejection = true) {
    const edit = this._currentEdit.get();
    if (edit && edit?.rejected && sendRejection) {
      await this._commandService.executeCommand(
        edit.rejected.id,
        ...edit.rejected.arguments || []
      ).then(void 0, onUnexpectedExternalError);
    }
    if (edit) {
      this.freeEdit(edit);
    }
    this._currentEdit.set(void 0, void 0);
  }
  freeEdit(edit) {
    const model = this.editor.getModel();
    if (!model) {
      return;
    }
    const providers = this.languageFeaturesService.inlineEditProvider.all(model);
    if (providers.length === 0) {
      return;
    }
    providers[0].freeInlineEdit(edit);
  }
  shouldShowHoverAt(range) {
    const currentEdit = this._currentEdit.get();
    const currentWidget = this._currentWidget.get();
    if (!currentEdit) {
      return false;
    }
    if (!currentWidget) {
      return false;
    }
    const edit = currentEdit;
    const model = currentWidget.model;
    const overReplaceRange = Range.containsPosition(edit.range, range.getStartPosition()) || Range.containsPosition(edit.range, range.getEndPosition());
    if (overReplaceRange) {
      return true;
    }
    const ghostText = model.ghostText.get();
    if (ghostText) {
      return ghostText.parts.some(
        (p) => range.containsPosition(
          new Position(ghostText.lineNumber, p.column)
        )
      );
    }
    return false;
  }
  shouldShowHoverAtViewZone(viewZoneId) {
    return this._currentWidget.get()?.ownsViewZone(viewZoneId) ?? false;
  }
};
InlineEditController = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, ILanguageFeaturesService),
  __decorateParam(4, ICommandService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, IDiffProviderFactoryService),
  __decorateParam(7, IModelService)
], InlineEditController);
function wait(ms, cancellationToken) {
  return new Promise((resolve) => {
    let d;
    const handle = setTimeout(() => {
      if (d) {
        d.dispose();
      }
      resolve();
    }, ms);
    if (cancellationToken) {
      d = cancellationToken.onCancellationRequested(() => {
        clearTimeout(handle);
        if (d) {
          d.dispose();
        }
        resolve();
      });
    }
  });
}
__name(wait, "wait");
export {
  InlineEditController
};
//# sourceMappingURL=inlineEditController.js.map
