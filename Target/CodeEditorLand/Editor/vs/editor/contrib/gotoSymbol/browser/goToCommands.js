var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { alert } from "../../../../base/browser/ui/aria/aria.js";
import {
  createCancelablePromise,
  raceCancellation
} from "../../../../base/common/async.js";
import { Iterable } from "../../../../base/common/iterator.js";
import { KeyChord, KeyCode, KeyMod } from "../../../../base/common/keyCodes.js";
import { assertType } from "../../../../base/common/types.js";
import { URI } from "../../../../base/common/uri.js";
import * as nls from "../../../../nls.js";
import {
  MenuId,
  MenuRegistry,
  registerAction2
} from "../../../../platform/actions/common/actions.js";
import {
  CommandsRegistry,
  ICommandService
} from "../../../../platform/commands/common/commands.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { IsWebContext } from "../../../../platform/contextkey/common/contextkeys.js";
import {
  TextEditorSelectionRevealType,
  TextEditorSelectionSource
} from "../../../../platform/editor/common/editor.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { KeybindingWeight } from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import { IEditorProgressService } from "../../../../platform/progress/common/progress.js";
import {
  isCodeEditor
} from "../../../browser/editorBrowser.js";
import {
  EditorAction2
} from "../../../browser/editorExtensions.js";
import { ICodeEditorService } from "../../../browser/services/codeEditorService.js";
import { EmbeddedCodeEditorWidget } from "../../../browser/widget/codeEditor/embeddedCodeEditorWidget.js";
import {
  EditorOption
} from "../../../common/config/editorOptions.js";
import * as corePosition from "../../../common/core/position.js";
import { Range } from "../../../common/core/range.js";
import { ScrollType } from "../../../common/editorCommon.js";
import { EditorContextKeys } from "../../../common/editorContextKeys.js";
import {
  isLocationLink
} from "../../../common/languages.js";
import { ILanguageFeaturesService } from "../../../common/services/languageFeatures.js";
import {
  CodeEditorStateFlag,
  EditorStateCancellationTokenSource
} from "../../editorState/browser/editorState.js";
import { MessageController } from "../../message/browser/messageController.js";
import { PeekContext } from "../../peekView/browser/peekView.js";
import {
  getDeclarationsAtPosition,
  getDefinitionsAtPosition,
  getImplementationsAtPosition,
  getReferencesAtPosition,
  getTypeDefinitionsAtPosition
} from "./goToSymbol.js";
import { ReferencesController } from "./peek/referencesController.js";
import { ReferencesModel } from "./referencesModel.js";
import { ISymbolNavigationService } from "./symbolNavigation.js";
MenuRegistry.appendMenuItem(MenuId.EditorContext, {
  submenu: MenuId.EditorContextPeek,
  title: nls.localize("peek.submenu", "Peek"),
  group: "navigation",
  order: 100
});
class SymbolNavigationAnchor {
  constructor(model, position) {
    this.model = model;
    this.position = position;
  }
  static {
    __name(this, "SymbolNavigationAnchor");
  }
  static is(thing) {
    if (!thing || typeof thing !== "object") {
      return false;
    }
    if (thing instanceof SymbolNavigationAnchor) {
      return true;
    }
    if (corePosition.Position.isIPosition(
      thing.position
    ) && thing.model) {
      return true;
    }
    return false;
  }
}
class SymbolNavigationAction extends EditorAction2 {
  static {
    __name(this, "SymbolNavigationAction");
  }
  static _allSymbolNavigationCommands = /* @__PURE__ */ new Map();
  static _activeAlternativeCommands = /* @__PURE__ */ new Set();
  static all() {
    return SymbolNavigationAction._allSymbolNavigationCommands.values();
  }
  static _patchConfig(opts) {
    const result = { ...opts, f1: true };
    if (result.menu) {
      for (const item of Iterable.wrap(result.menu)) {
        if (item.id === MenuId.EditorContext || item.id === MenuId.EditorContextPeek) {
          item.when = ContextKeyExpr.and(
            opts.precondition,
            item.when
          );
        }
      }
    }
    return result;
  }
  configuration;
  constructor(configuration, opts) {
    super(SymbolNavigationAction._patchConfig(opts));
    this.configuration = configuration;
    SymbolNavigationAction._allSymbolNavigationCommands.set(opts.id, this);
  }
  runEditorCommand(accessor, editor, arg, range) {
    if (!editor.hasModel()) {
      return Promise.resolve(void 0);
    }
    const notificationService = accessor.get(INotificationService);
    const editorService = accessor.get(ICodeEditorService);
    const progressService = accessor.get(IEditorProgressService);
    const symbolNavService = accessor.get(ISymbolNavigationService);
    const languageFeaturesService = accessor.get(ILanguageFeaturesService);
    const instaService = accessor.get(IInstantiationService);
    const model = editor.getModel();
    const position = editor.getPosition();
    const anchor = SymbolNavigationAnchor.is(arg) ? arg : new SymbolNavigationAnchor(model, position);
    const cts = new EditorStateCancellationTokenSource(
      editor,
      CodeEditorStateFlag.Value | CodeEditorStateFlag.Position
    );
    const promise = raceCancellation(
      this._getLocationModel(
        languageFeaturesService,
        anchor.model,
        anchor.position,
        cts.token
      ),
      cts.token
    ).then(
      async (references) => {
        if (!references || cts.token.isCancellationRequested) {
          return;
        }
        alert(references.ariaMessage);
        let altAction;
        if (references.referenceAt(model.uri, position)) {
          const altActionId = this._getAlternativeCommand(editor);
          if (!SymbolNavigationAction._activeAlternativeCommands.has(
            altActionId
          ) && SymbolNavigationAction._allSymbolNavigationCommands.has(
            altActionId
          )) {
            altAction = SymbolNavigationAction._allSymbolNavigationCommands.get(
              altActionId
            );
          }
        }
        const referenceCount = references.references.length;
        if (referenceCount === 0) {
          if (!this.configuration.muteMessage) {
            const info = model.getWordAtPosition(position);
            MessageController.get(editor)?.showMessage(
              this._getNoResultFoundMessage(info),
              position
            );
          }
        } else if (referenceCount === 1 && altAction) {
          SymbolNavigationAction._activeAlternativeCommands.add(
            this.desc.id
          );
          instaService.invokeFunction(
            (accessor2) => altAction.runEditorCommand(accessor2, editor, arg, range).finally(() => {
              SymbolNavigationAction._activeAlternativeCommands.delete(
                this.desc.id
              );
            })
          );
        } else {
          return this._onResult(
            editorService,
            symbolNavService,
            editor,
            references,
            range
          );
        }
      },
      (err) => {
        notificationService.error(err);
      }
    ).finally(() => {
      cts.dispose();
    });
    progressService.showWhile(promise, 250);
    return promise;
  }
  async _onResult(editorService, symbolNavService, editor, model, range) {
    const gotoLocation = this._getGoToPreference(editor);
    if (!(editor instanceof EmbeddedCodeEditorWidget) && (this.configuration.openInPeek || gotoLocation === "peek" && model.references.length > 1)) {
      this._openInPeek(editor, model, range);
    } else {
      const next = model.firstReference();
      const peek = model.references.length > 1 && gotoLocation === "gotoAndPeek";
      const targetEditor = await this._openReference(
        editor,
        editorService,
        next,
        this.configuration.openToSide,
        !peek
      );
      if (peek && targetEditor) {
        this._openInPeek(targetEditor, model, range);
      } else {
        model.dispose();
      }
      if (gotoLocation === "goto") {
        symbolNavService.put(next);
      }
    }
  }
  async _openReference(editor, editorService, reference, sideBySide, highlight) {
    let range;
    if (isLocationLink(reference)) {
      range = reference.targetSelectionRange;
    }
    if (!range) {
      range = reference.range;
    }
    if (!range) {
      return void 0;
    }
    const targetEditor = await editorService.openCodeEditor(
      {
        resource: reference.uri,
        options: {
          selection: Range.collapseToStart(range),
          selectionRevealType: TextEditorSelectionRevealType.NearTopIfOutsideViewport,
          selectionSource: TextEditorSelectionSource.JUMP
        }
      },
      editor,
      sideBySide
    );
    if (!targetEditor) {
      return void 0;
    }
    if (highlight) {
      const modelNow = targetEditor.getModel();
      const decorations = targetEditor.createDecorationsCollection([
        {
          range,
          options: {
            description: "symbol-navigate-action-highlight",
            className: "symbolHighlight"
          }
        }
      ]);
      setTimeout(() => {
        if (targetEditor.getModel() === modelNow) {
          decorations.clear();
        }
      }, 350);
    }
    return targetEditor;
  }
  _openInPeek(target, model, range) {
    const controller = ReferencesController.get(target);
    if (controller && target.hasModel()) {
      controller.toggleWidget(
        range ?? target.getSelection(),
        createCancelablePromise((_) => Promise.resolve(model)),
        this.configuration.openInPeek
      );
    } else {
      model.dispose();
    }
  }
}
class DefinitionAction extends SymbolNavigationAction {
  static {
    __name(this, "DefinitionAction");
  }
  async _getLocationModel(languageFeaturesService, model, position, token) {
    return new ReferencesModel(
      await getDefinitionsAtPosition(
        languageFeaturesService.definitionProvider,
        model,
        position,
        false,
        token
      ),
      nls.localize("def.title", "Definitions")
    );
  }
  _getNoResultFoundMessage(info) {
    return info && info.word ? nls.localize(
      "noResultWord",
      "No definition found for '{0}'",
      info.word
    ) : nls.localize("generic.noResults", "No definition found");
  }
  _getAlternativeCommand(editor) {
    return editor.getOption(EditorOption.gotoLocation).alternativeDefinitionCommand;
  }
  _getGoToPreference(editor) {
    return editor.getOption(EditorOption.gotoLocation).multipleDefinitions;
  }
}
registerAction2(
  class GoToDefinitionAction extends DefinitionAction {
    static {
      __name(this, "GoToDefinitionAction");
    }
    static id = "editor.action.revealDefinition";
    constructor() {
      super(
        {
          openToSide: false,
          openInPeek: false,
          muteMessage: false
        },
        {
          id: GoToDefinitionAction.id,
          title: {
            ...nls.localize2(
              "actions.goToDecl.label",
              "Go to Definition"
            ),
            mnemonicTitle: nls.localize(
              {
                key: "miGotoDefinition",
                comment: ["&& denotes a mnemonic"]
              },
              "Go to &&Definition"
            )
          },
          precondition: EditorContextKeys.hasDefinitionProvider,
          keybinding: [
            {
              when: EditorContextKeys.editorTextFocus,
              primary: KeyCode.F12,
              weight: KeybindingWeight.EditorContrib
            },
            {
              when: ContextKeyExpr.and(
                EditorContextKeys.editorTextFocus,
                IsWebContext
              ),
              primary: KeyMod.CtrlCmd | KeyCode.F12,
              weight: KeybindingWeight.EditorContrib
            }
          ],
          menu: [
            {
              id: MenuId.EditorContext,
              group: "navigation",
              order: 1.1
            },
            {
              id: MenuId.MenubarGoMenu,
              precondition: null,
              group: "4_symbol_nav",
              order: 2
            }
          ]
        }
      );
      CommandsRegistry.registerCommandAlias(
        "editor.action.goToDeclaration",
        GoToDefinitionAction.id
      );
    }
  }
);
registerAction2(
  class OpenDefinitionToSideAction extends DefinitionAction {
    static {
      __name(this, "OpenDefinitionToSideAction");
    }
    static id = "editor.action.revealDefinitionAside";
    constructor() {
      super(
        {
          openToSide: true,
          openInPeek: false,
          muteMessage: false
        },
        {
          id: OpenDefinitionToSideAction.id,
          title: nls.localize2(
            "actions.goToDeclToSide.label",
            "Open Definition to the Side"
          ),
          precondition: ContextKeyExpr.and(
            EditorContextKeys.hasDefinitionProvider,
            EditorContextKeys.isInEmbeddedEditor.toNegated()
          ),
          keybinding: [
            {
              when: EditorContextKeys.editorTextFocus,
              primary: KeyChord(
                KeyMod.CtrlCmd | KeyCode.KeyK,
                KeyCode.F12
              ),
              weight: KeybindingWeight.EditorContrib
            },
            {
              when: ContextKeyExpr.and(
                EditorContextKeys.editorTextFocus,
                IsWebContext
              ),
              primary: KeyChord(
                KeyMod.CtrlCmd | KeyCode.KeyK,
                KeyMod.CtrlCmd | KeyCode.F12
              ),
              weight: KeybindingWeight.EditorContrib
            }
          ]
        }
      );
      CommandsRegistry.registerCommandAlias(
        "editor.action.openDeclarationToTheSide",
        OpenDefinitionToSideAction.id
      );
    }
  }
);
registerAction2(
  class PeekDefinitionAction extends DefinitionAction {
    static {
      __name(this, "PeekDefinitionAction");
    }
    static id = "editor.action.peekDefinition";
    constructor() {
      super(
        {
          openToSide: false,
          openInPeek: true,
          muteMessage: false
        },
        {
          id: PeekDefinitionAction.id,
          title: nls.localize2(
            "actions.previewDecl.label",
            "Peek Definition"
          ),
          precondition: ContextKeyExpr.and(
            EditorContextKeys.hasDefinitionProvider,
            PeekContext.notInPeekEditor,
            EditorContextKeys.isInEmbeddedEditor.toNegated()
          ),
          keybinding: {
            when: EditorContextKeys.editorTextFocus,
            primary: KeyMod.Alt | KeyCode.F12,
            linux: {
              primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.F10
            },
            weight: KeybindingWeight.EditorContrib
          },
          menu: {
            id: MenuId.EditorContextPeek,
            group: "peek",
            order: 2
          }
        }
      );
      CommandsRegistry.registerCommandAlias(
        "editor.action.previewDeclaration",
        PeekDefinitionAction.id
      );
    }
  }
);
class DeclarationAction extends SymbolNavigationAction {
  static {
    __name(this, "DeclarationAction");
  }
  async _getLocationModel(languageFeaturesService, model, position, token) {
    return new ReferencesModel(
      await getDeclarationsAtPosition(
        languageFeaturesService.declarationProvider,
        model,
        position,
        false,
        token
      ),
      nls.localize("decl.title", "Declarations")
    );
  }
  _getNoResultFoundMessage(info) {
    return info && info.word ? nls.localize(
      "decl.noResultWord",
      "No declaration found for '{0}'",
      info.word
    ) : nls.localize("decl.generic.noResults", "No declaration found");
  }
  _getAlternativeCommand(editor) {
    return editor.getOption(EditorOption.gotoLocation).alternativeDeclarationCommand;
  }
  _getGoToPreference(editor) {
    return editor.getOption(EditorOption.gotoLocation).multipleDeclarations;
  }
}
registerAction2(
  class GoToDeclarationAction extends DeclarationAction {
    static {
      __name(this, "GoToDeclarationAction");
    }
    static id = "editor.action.revealDeclaration";
    constructor() {
      super(
        {
          openToSide: false,
          openInPeek: false,
          muteMessage: false
        },
        {
          id: GoToDeclarationAction.id,
          title: {
            ...nls.localize2(
              "actions.goToDeclaration.label",
              "Go to Declaration"
            ),
            mnemonicTitle: nls.localize(
              {
                key: "miGotoDeclaration",
                comment: ["&& denotes a mnemonic"]
              },
              "Go to &&Declaration"
            )
          },
          precondition: ContextKeyExpr.and(
            EditorContextKeys.hasDeclarationProvider,
            EditorContextKeys.isInEmbeddedEditor.toNegated()
          ),
          menu: [
            {
              id: MenuId.EditorContext,
              group: "navigation",
              order: 1.3
            },
            {
              id: MenuId.MenubarGoMenu,
              precondition: null,
              group: "4_symbol_nav",
              order: 3
            }
          ]
        }
      );
    }
    _getNoResultFoundMessage(info) {
      return info && info.word ? nls.localize(
        "decl.noResultWord",
        "No declaration found for '{0}'",
        info.word
      ) : nls.localize(
        "decl.generic.noResults",
        "No declaration found"
      );
    }
  }
);
registerAction2(
  class PeekDeclarationAction extends DeclarationAction {
    static {
      __name(this, "PeekDeclarationAction");
    }
    constructor() {
      super(
        {
          openToSide: false,
          openInPeek: true,
          muteMessage: false
        },
        {
          id: "editor.action.peekDeclaration",
          title: nls.localize2(
            "actions.peekDecl.label",
            "Peek Declaration"
          ),
          precondition: ContextKeyExpr.and(
            EditorContextKeys.hasDeclarationProvider,
            PeekContext.notInPeekEditor,
            EditorContextKeys.isInEmbeddedEditor.toNegated()
          ),
          menu: {
            id: MenuId.EditorContextPeek,
            group: "peek",
            order: 3
          }
        }
      );
    }
  }
);
class TypeDefinitionAction extends SymbolNavigationAction {
  static {
    __name(this, "TypeDefinitionAction");
  }
  async _getLocationModel(languageFeaturesService, model, position, token) {
    return new ReferencesModel(
      await getTypeDefinitionsAtPosition(
        languageFeaturesService.typeDefinitionProvider,
        model,
        position,
        false,
        token
      ),
      nls.localize("typedef.title", "Type Definitions")
    );
  }
  _getNoResultFoundMessage(info) {
    return info && info.word ? nls.localize(
      "goToTypeDefinition.noResultWord",
      "No type definition found for '{0}'",
      info.word
    ) : nls.localize(
      "goToTypeDefinition.generic.noResults",
      "No type definition found"
    );
  }
  _getAlternativeCommand(editor) {
    return editor.getOption(EditorOption.gotoLocation).alternativeTypeDefinitionCommand;
  }
  _getGoToPreference(editor) {
    return editor.getOption(EditorOption.gotoLocation).multipleTypeDefinitions;
  }
}
registerAction2(
  class GoToTypeDefinitionAction extends TypeDefinitionAction {
    static {
      __name(this, "GoToTypeDefinitionAction");
    }
    static ID = "editor.action.goToTypeDefinition";
    constructor() {
      super(
        {
          openToSide: false,
          openInPeek: false,
          muteMessage: false
        },
        {
          id: GoToTypeDefinitionAction.ID,
          title: {
            ...nls.localize2(
              "actions.goToTypeDefinition.label",
              "Go to Type Definition"
            ),
            mnemonicTitle: nls.localize(
              {
                key: "miGotoTypeDefinition",
                comment: ["&& denotes a mnemonic"]
              },
              "Go to &&Type Definition"
            )
          },
          precondition: EditorContextKeys.hasTypeDefinitionProvider,
          keybinding: {
            when: EditorContextKeys.editorTextFocus,
            primary: 0,
            weight: KeybindingWeight.EditorContrib
          },
          menu: [
            {
              id: MenuId.EditorContext,
              group: "navigation",
              order: 1.4
            },
            {
              id: MenuId.MenubarGoMenu,
              precondition: null,
              group: "4_symbol_nav",
              order: 3
            }
          ]
        }
      );
    }
  }
);
registerAction2(
  class PeekTypeDefinitionAction extends TypeDefinitionAction {
    static {
      __name(this, "PeekTypeDefinitionAction");
    }
    static ID = "editor.action.peekTypeDefinition";
    constructor() {
      super(
        {
          openToSide: false,
          openInPeek: true,
          muteMessage: false
        },
        {
          id: PeekTypeDefinitionAction.ID,
          title: nls.localize2(
            "actions.peekTypeDefinition.label",
            "Peek Type Definition"
          ),
          precondition: ContextKeyExpr.and(
            EditorContextKeys.hasTypeDefinitionProvider,
            PeekContext.notInPeekEditor,
            EditorContextKeys.isInEmbeddedEditor.toNegated()
          ),
          menu: {
            id: MenuId.EditorContextPeek,
            group: "peek",
            order: 4
          }
        }
      );
    }
  }
);
class ImplementationAction extends SymbolNavigationAction {
  static {
    __name(this, "ImplementationAction");
  }
  async _getLocationModel(languageFeaturesService, model, position, token) {
    return new ReferencesModel(
      await getImplementationsAtPosition(
        languageFeaturesService.implementationProvider,
        model,
        position,
        false,
        token
      ),
      nls.localize("impl.title", "Implementations")
    );
  }
  _getNoResultFoundMessage(info) {
    return info && info.word ? nls.localize(
      "goToImplementation.noResultWord",
      "No implementation found for '{0}'",
      info.word
    ) : nls.localize(
      "goToImplementation.generic.noResults",
      "No implementation found"
    );
  }
  _getAlternativeCommand(editor) {
    return editor.getOption(EditorOption.gotoLocation).alternativeImplementationCommand;
  }
  _getGoToPreference(editor) {
    return editor.getOption(EditorOption.gotoLocation).multipleImplementations;
  }
}
registerAction2(
  class GoToImplementationAction extends ImplementationAction {
    static {
      __name(this, "GoToImplementationAction");
    }
    static ID = "editor.action.goToImplementation";
    constructor() {
      super(
        {
          openToSide: false,
          openInPeek: false,
          muteMessage: false
        },
        {
          id: GoToImplementationAction.ID,
          title: {
            ...nls.localize2(
              "actions.goToImplementation.label",
              "Go to Implementations"
            ),
            mnemonicTitle: nls.localize(
              {
                key: "miGotoImplementation",
                comment: ["&& denotes a mnemonic"]
              },
              "Go to &&Implementations"
            )
          },
          precondition: EditorContextKeys.hasImplementationProvider,
          keybinding: {
            when: EditorContextKeys.editorTextFocus,
            primary: KeyMod.CtrlCmd | KeyCode.F12,
            weight: KeybindingWeight.EditorContrib
          },
          menu: [
            {
              id: MenuId.EditorContext,
              group: "navigation",
              order: 1.45
            },
            {
              id: MenuId.MenubarGoMenu,
              precondition: null,
              group: "4_symbol_nav",
              order: 4
            }
          ]
        }
      );
    }
  }
);
registerAction2(
  class PeekImplementationAction extends ImplementationAction {
    static {
      __name(this, "PeekImplementationAction");
    }
    static ID = "editor.action.peekImplementation";
    constructor() {
      super(
        {
          openToSide: false,
          openInPeek: true,
          muteMessage: false
        },
        {
          id: PeekImplementationAction.ID,
          title: nls.localize2(
            "actions.peekImplementation.label",
            "Peek Implementations"
          ),
          precondition: ContextKeyExpr.and(
            EditorContextKeys.hasImplementationProvider,
            PeekContext.notInPeekEditor,
            EditorContextKeys.isInEmbeddedEditor.toNegated()
          ),
          keybinding: {
            when: EditorContextKeys.editorTextFocus,
            primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.F12,
            weight: KeybindingWeight.EditorContrib
          },
          menu: {
            id: MenuId.EditorContextPeek,
            group: "peek",
            order: 5
          }
        }
      );
    }
  }
);
class ReferencesAction extends SymbolNavigationAction {
  static {
    __name(this, "ReferencesAction");
  }
  _getNoResultFoundMessage(info) {
    return info ? nls.localize(
      "references.no",
      "No references found for '{0}'",
      info.word
    ) : nls.localize("references.noGeneric", "No references found");
  }
  _getAlternativeCommand(editor) {
    return editor.getOption(EditorOption.gotoLocation).alternativeReferenceCommand;
  }
  _getGoToPreference(editor) {
    return editor.getOption(EditorOption.gotoLocation).multipleReferences;
  }
}
registerAction2(
  class GoToReferencesAction extends ReferencesAction {
    static {
      __name(this, "GoToReferencesAction");
    }
    constructor() {
      super(
        {
          openToSide: false,
          openInPeek: false,
          muteMessage: false
        },
        {
          id: "editor.action.goToReferences",
          title: {
            ...nls.localize2(
              "goToReferences.label",
              "Go to References"
            ),
            mnemonicTitle: nls.localize(
              {
                key: "miGotoReference",
                comment: ["&& denotes a mnemonic"]
              },
              "Go to &&References"
            )
          },
          precondition: ContextKeyExpr.and(
            EditorContextKeys.hasReferenceProvider,
            PeekContext.notInPeekEditor,
            EditorContextKeys.isInEmbeddedEditor.toNegated()
          ),
          keybinding: {
            when: EditorContextKeys.editorTextFocus,
            primary: KeyMod.Shift | KeyCode.F12,
            weight: KeybindingWeight.EditorContrib
          },
          menu: [
            {
              id: MenuId.EditorContext,
              group: "navigation",
              order: 1.45
            },
            {
              id: MenuId.MenubarGoMenu,
              precondition: null,
              group: "4_symbol_nav",
              order: 5
            }
          ]
        }
      );
    }
    async _getLocationModel(languageFeaturesService, model, position, token) {
      return new ReferencesModel(
        await getReferencesAtPosition(
          languageFeaturesService.referenceProvider,
          model,
          position,
          true,
          false,
          token
        ),
        nls.localize("ref.title", "References")
      );
    }
  }
);
registerAction2(
  class PeekReferencesAction extends ReferencesAction {
    static {
      __name(this, "PeekReferencesAction");
    }
    constructor() {
      super(
        {
          openToSide: false,
          openInPeek: true,
          muteMessage: false
        },
        {
          id: "editor.action.referenceSearch.trigger",
          title: nls.localize2(
            "references.action.label",
            "Peek References"
          ),
          precondition: ContextKeyExpr.and(
            EditorContextKeys.hasReferenceProvider,
            PeekContext.notInPeekEditor,
            EditorContextKeys.isInEmbeddedEditor.toNegated()
          ),
          menu: {
            id: MenuId.EditorContextPeek,
            group: "peek",
            order: 6
          }
        }
      );
    }
    async _getLocationModel(languageFeaturesService, model, position, token) {
      return new ReferencesModel(
        await getReferencesAtPosition(
          languageFeaturesService.referenceProvider,
          model,
          position,
          false,
          false,
          token
        ),
        nls.localize("ref.title", "References")
      );
    }
  }
);
class GenericGoToLocationAction extends SymbolNavigationAction {
  constructor(config, _references, _gotoMultipleBehaviour) {
    super(config, {
      id: "editor.action.goToLocation",
      title: nls.localize2("label.generic", "Go to Any Symbol"),
      precondition: ContextKeyExpr.and(
        PeekContext.notInPeekEditor,
        EditorContextKeys.isInEmbeddedEditor.toNegated()
      )
    });
    this._references = _references;
    this._gotoMultipleBehaviour = _gotoMultipleBehaviour;
  }
  static {
    __name(this, "GenericGoToLocationAction");
  }
  async _getLocationModel(languageFeaturesService, _model, _position, _token) {
    return new ReferencesModel(
      this._references,
      nls.localize("generic.title", "Locations")
    );
  }
  _getNoResultFoundMessage(info) {
    return info && nls.localize(
      "generic.noResult",
      "No results for '{0}'",
      info.word
    ) || "";
  }
  _getGoToPreference(editor) {
    return this._gotoMultipleBehaviour ?? editor.getOption(EditorOption.gotoLocation).multipleReferences;
  }
  _getAlternativeCommand() {
    return "";
  }
}
CommandsRegistry.registerCommand({
  id: "editor.action.goToLocations",
  metadata: {
    description: "Go to locations from a position in a file",
    args: [
      {
        name: "uri",
        description: "The text document in which to start",
        constraint: URI
      },
      {
        name: "position",
        description: "The position at which to start",
        constraint: corePosition.Position.isIPosition
      },
      {
        name: "locations",
        description: "An array of locations.",
        constraint: Array
      },
      {
        name: "multiple",
        description: "Define what to do when having multiple results, either `peek`, `gotoAndPeek`, or `goto`"
      },
      {
        name: "noResultsMessage",
        description: "Human readable message that shows when locations is empty."
      }
    ]
  },
  handler: /* @__PURE__ */ __name(async (accessor, resource, position, references, multiple, noResultsMessage, openInPeek) => {
    assertType(URI.isUri(resource));
    assertType(corePosition.Position.isIPosition(position));
    assertType(Array.isArray(references));
    assertType(
      typeof multiple === "undefined" || typeof multiple === "string"
    );
    assertType(
      typeof openInPeek === "undefined" || typeof openInPeek === "boolean"
    );
    const editorService = accessor.get(ICodeEditorService);
    const editor = await editorService.openCodeEditor(
      { resource },
      editorService.getFocusedCodeEditor()
    );
    if (isCodeEditor(editor)) {
      editor.setPosition(position);
      editor.revealPositionInCenterIfOutsideViewport(
        position,
        ScrollType.Smooth
      );
      return editor.invokeWithinContext((accessor2) => {
        const command = new class extends GenericGoToLocationAction {
          _getNoResultFoundMessage(info) {
            return noResultsMessage || super._getNoResultFoundMessage(info);
          }
        }(
          {
            muteMessage: !Boolean(noResultsMessage),
            openInPeek: Boolean(openInPeek),
            openToSide: false
          },
          references,
          multiple
        );
        accessor2.get(IInstantiationService).invokeFunction(command.run.bind(command), editor);
      });
    }
  }, "handler")
});
CommandsRegistry.registerCommand({
  id: "editor.action.peekLocations",
  metadata: {
    description: "Peek locations from a position in a file",
    args: [
      {
        name: "uri",
        description: "The text document in which to start",
        constraint: URI
      },
      {
        name: "position",
        description: "The position at which to start",
        constraint: corePosition.Position.isIPosition
      },
      {
        name: "locations",
        description: "An array of locations.",
        constraint: Array
      },
      {
        name: "multiple",
        description: "Define what to do when having multiple results, either `peek`, `gotoAndPeek`, or `goto`"
      }
    ]
  },
  handler: /* @__PURE__ */ __name(async (accessor, resource, position, references, multiple) => {
    accessor.get(ICommandService).executeCommand(
      "editor.action.goToLocations",
      resource,
      position,
      references,
      multiple,
      void 0,
      true
    );
  }, "handler")
});
CommandsRegistry.registerCommand({
  id: "editor.action.findReferences",
  handler: /* @__PURE__ */ __name((accessor, resource, position) => {
    assertType(URI.isUri(resource));
    assertType(corePosition.Position.isIPosition(position));
    const languageFeaturesService = accessor.get(ILanguageFeaturesService);
    const codeEditorService = accessor.get(ICodeEditorService);
    return codeEditorService.openCodeEditor(
      { resource },
      codeEditorService.getFocusedCodeEditor()
    ).then((control) => {
      if (!isCodeEditor(control) || !control.hasModel()) {
        return void 0;
      }
      const controller = ReferencesController.get(control);
      if (!controller) {
        return void 0;
      }
      const references = createCancelablePromise(
        (token) => getReferencesAtPosition(
          languageFeaturesService.referenceProvider,
          control.getModel(),
          corePosition.Position.lift(position),
          false,
          false,
          token
        ).then(
          (references2) => new ReferencesModel(
            references2,
            nls.localize("ref.title", "References")
          )
        )
      );
      const range = new Range(
        position.lineNumber,
        position.column,
        position.lineNumber,
        position.column
      );
      return Promise.resolve(
        controller.toggleWidget(range, references, false)
      );
    });
  }, "handler")
});
CommandsRegistry.registerCommandAlias(
  "editor.action.showReferences",
  "editor.action.peekLocations"
);
export {
  DefinitionAction,
  SymbolNavigationAction,
  SymbolNavigationAnchor
};
//# sourceMappingURL=goToCommands.js.map
