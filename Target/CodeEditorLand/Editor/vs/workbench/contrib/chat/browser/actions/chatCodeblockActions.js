var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { coalesce } from "../../../../../base/common/arrays.js";
import { AsyncIterableObject } from "../../../../../base/common/async.js";
import { CancellationTokenSource } from "../../../../../base/common/cancellation.js";
import { CharCode } from "../../../../../base/common/charCode.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { KeyCode, KeyMod } from "../../../../../base/common/keyCodes.js";
import { ResourceMap } from "../../../../../base/common/map.js";
import { isEqual } from "../../../../../base/common/resources.js";
import * as strings from "../../../../../base/common/strings.js";
import { URI } from "../../../../../base/common/uri.js";
import {
  isCodeEditor,
  isDiffEditor
} from "../../../../../editor/browser/editorBrowser.js";
import {
  IBulkEditService,
  ResourceTextEdit
} from "../../../../../editor/browser/services/bulkEditService.js";
import { ICodeEditorService } from "../../../../../editor/browser/services/codeEditorService.js";
import { Range } from "../../../../../editor/common/core/range.js";
import { EditorContextKeys } from "../../../../../editor/common/editorContextKeys.js";
import {
  isLocation
} from "../../../../../editor/common/languages.js";
import { ILanguageService } from "../../../../../editor/common/languages/language.js";
import { ILanguageFeaturesService } from "../../../../../editor/common/services/languageFeatures.js";
import { CopyAction } from "../../../../../editor/contrib/clipboard/browser/clipboard.js";
import { localize, localize2 } from "../../../../../nls.js";
import {
  Action2,
  MenuId,
  registerAction2
} from "../../../../../platform/actions/common/actions.js";
import { IClipboardService } from "../../../../../platform/clipboard/common/clipboardService.js";
import { ContextKeyExpr } from "../../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { KeybindingWeight } from "../../../../../platform/keybinding/common/keybindingsRegistry.js";
import {
  INotificationService,
  Severity
} from "../../../../../platform/notification/common/notification.js";
import {
  IProgressService,
  ProgressLocation
} from "../../../../../platform/progress/common/progress.js";
import { TerminalLocation } from "../../../../../platform/terminal/common/terminal.js";
import { IEditorService } from "../../../../services/editor/common/editorService.js";
import { ITextFileService } from "../../../../services/textfile/common/textfiles.js";
import { accessibleViewInCodeBlock } from "../../../accessibility/browser/accessibilityConfiguration.js";
import { InlineChatController } from "../../../inlineChat/browser/inlineChatController.js";
import { insertCell } from "../../../notebook/browser/controller/cellOperations.js";
import {
  CellKind,
  NOTEBOOK_EDITOR_ID
} from "../../../notebook/common/notebookCommon.js";
import {
  ITerminalEditorService,
  ITerminalGroupService,
  ITerminalService
} from "../../../terminal/browser/terminal.js";
import {
  CONTEXT_CHAT_EDIT_APPLIED,
  CONTEXT_CHAT_ENABLED,
  CONTEXT_IN_CHAT_INPUT,
  CONTEXT_IN_CHAT_SESSION
} from "../../common/chatContextKeys.js";
import {
  ChatCopyKind,
  IChatService
} from "../../common/chatService.js";
import {
  isRequestVM,
  isResponseVM
} from "../../common/chatViewModel.js";
import {
  IChatCodeBlockContextProviderService,
  IChatWidgetService
} from "../chat.js";
import {
  DefaultChatTextEditor
} from "../codeBlockPart.js";
import { CHAT_CATEGORY } from "./chatActions.js";
const shellLangIds = [
  "fish",
  "ps1",
  "pwsh",
  "powershell",
  "sh",
  "shellscript",
  "zsh"
];
function isCodeBlockActionContext(thing) {
  return typeof thing === "object" && thing !== null && "code" in thing && "element" in thing;
}
__name(isCodeBlockActionContext, "isCodeBlockActionContext");
function isCodeCompareBlockActionContext(thing) {
  return typeof thing === "object" && thing !== null && "element" in thing;
}
__name(isCodeCompareBlockActionContext, "isCodeCompareBlockActionContext");
function isResponseFiltered(context) {
  return isResponseVM(context.element) && context.element.errorDetails?.responseIsFiltered;
}
__name(isResponseFiltered, "isResponseFiltered");
function getUsedDocuments(context) {
  return isResponseVM(context.element) ? context.element.usedContext?.documents : void 0;
}
__name(getUsedDocuments, "getUsedDocuments");
function getReferencesAsDocumentContext(res) {
  const map = new ResourceMap();
  for (const r of res) {
    let uri;
    let range;
    if (URI.isUri(r.reference)) {
      uri = r.reference;
    } else if (isLocation(r.reference)) {
      uri = r.reference.uri;
      range = r.reference.range;
    }
    if (uri) {
      const item = map.get(uri);
      if (item) {
        if (range) {
          item.ranges.push(range);
        }
      } else {
        map.set(uri, {
          uri,
          version: -1,
          ranges: range ? [range] : []
        });
      }
    }
  }
  return [...map.values()];
}
__name(getReferencesAsDocumentContext, "getReferencesAsDocumentContext");
function getChatConversation(context) {
  if (isResponseVM(context.element)) {
    return [
      {
        type: "response",
        message: context.element.response.toMarkdown(),
        references: getReferencesAsDocumentContext(
          context.element.contentReferences
        )
      }
    ];
  } else if (isRequestVM(context.element)) {
    return [
      {
        type: "request",
        message: context.element.messageText
      }
    ];
  } else {
    return [];
  }
}
__name(getChatConversation, "getChatConversation");
class ChatCodeBlockAction extends Action2 {
  static {
    __name(this, "ChatCodeBlockAction");
  }
  run(accessor, ...args) {
    let context = args[0];
    if (!isCodeBlockActionContext(context)) {
      const codeEditorService = accessor.get(ICodeEditorService);
      const editor = codeEditorService.getFocusedCodeEditor() || codeEditorService.getActiveCodeEditor();
      if (!editor) {
        return;
      }
      context = getContextFromEditor(editor, accessor);
      if (!isCodeBlockActionContext(context)) {
        return;
      }
    }
    return this.runWithContext(accessor, context);
  }
}
class InsertCodeBlockAction extends ChatCodeBlockAction {
  static {
    __name(this, "InsertCodeBlockAction");
  }
  async runWithContext(accessor, context) {
    const editorService = accessor.get(IEditorService);
    const textFileService = accessor.get(ITextFileService);
    const bulkEditService = accessor.get(IBulkEditService);
    const codeEditorService = accessor.get(ICodeEditorService);
    const chatService = accessor.get(IChatService);
    const languageFeaturesService = accessor.get(ILanguageFeaturesService);
    const notificationService = accessor.get(INotificationService);
    const progressService = accessor.get(IProgressService);
    const languageService = accessor.get(ILanguageService);
    if (isResponseFiltered(context)) {
      return;
    }
    if (context.codemapperUri) {
      await editorService.openEditor({ resource: context.codemapperUri });
    }
    if (editorService.activeEditorPane?.getId() === NOTEBOOK_EDITOR_ID) {
      return this.handleNotebookEditor(
        languageService,
        progressService,
        notificationService,
        languageFeaturesService,
        bulkEditService,
        codeEditorService,
        chatService,
        editorService.activeEditorPane.getControl(),
        context
      );
    }
    let activeEditorControl = editorService.activeTextEditorControl;
    if (isDiffEditor(activeEditorControl)) {
      activeEditorControl = activeEditorControl.getOriginalEditor().hasTextFocus() ? activeEditorControl.getOriginalEditor() : activeEditorControl.getModifiedEditor();
    }
    if (!isCodeEditor(activeEditorControl)) {
      return;
    }
    if (!activeEditorControl.hasModel()) {
      return;
    }
    const activeModelUri = activeEditorControl.getModel().uri;
    const activeTextModel = textFileService.files.get(activeModelUri) ?? textFileService.untitled.get(activeModelUri);
    if (!activeTextModel || activeTextModel.isReadonly()) {
      return;
    }
    await this.handleTextEditor(
      progressService,
      notificationService,
      languageFeaturesService,
      bulkEditService,
      codeEditorService,
      chatService,
      activeEditorControl,
      context
    );
  }
  async handleNotebookEditor(languageService, progressService, notificationService, languageFeaturesService, bulkEditService, codeEditorService, chatService, notebookEditor, context) {
    if (!notebookEditor.hasModel()) {
      return;
    }
    if (notebookEditor.isReadOnly) {
      return;
    }
    if (notebookEditor.activeCodeEditor?.hasTextFocus()) {
      const codeEditor = notebookEditor.activeCodeEditor;
      if (codeEditor.hasModel()) {
        return this.handleTextEditor(
          progressService,
          notificationService,
          languageFeaturesService,
          bulkEditService,
          codeEditorService,
          chatService,
          codeEditor,
          context
        );
      }
    }
    const focusRange = notebookEditor.getFocus();
    const next = Math.max(focusRange.end - 1, 0);
    insertCell(
      languageService,
      notebookEditor,
      next,
      CellKind.Code,
      "below",
      context.code,
      true
    );
    this.notifyUserAction(chatService, context);
  }
  async computeEdits(progressService, notificationService, languageFeaturesService, bulkEditService, codeEditorService, chatService, codeEditor, codeBlockActionContext) {
    const activeModel = codeEditor.getModel();
    const range = codeEditor.getSelection() ?? new Range(
      activeModel.getLineCount(),
      1,
      activeModel.getLineCount(),
      1
    );
    const text = reindent(
      codeBlockActionContext.code,
      activeModel,
      range.startLineNumber
    );
    if (text !== void 0) {
      return {
        edits: [new ResourceTextEdit(activeModel.uri, { range, text })]
      };
    }
    return void 0;
  }
  get showPreview() {
    return false;
  }
  async handleTextEditor(progressService, notificationService, languageFeaturesService, bulkEditService, codeEditorService, chatService, codeEditor, codeBlockActionContext) {
    const result = await this.computeEdits(
      progressService,
      notificationService,
      languageFeaturesService,
      bulkEditService,
      codeEditorService,
      chatService,
      codeEditor,
      codeBlockActionContext
    );
    this.notifyUserAction(chatService, codeBlockActionContext, result);
    if (!result) {
      return;
    }
    if (this.showPreview) {
      const showWithPreview = await this.applyWithInlinePreview(
        codeEditorService,
        result.edits,
        codeEditor
      );
      if (!showWithPreview) {
        await bulkEditService.apply(result.edits, {
          showPreview: true
        });
        const activeModel = codeEditor.getModel();
        codeEditorService.listCodeEditors().find(
          (editor) => editor.getModel()?.uri.toString() === activeModel.uri.toString()
        )?.focus();
      }
    } else {
      await bulkEditService.apply(result.edits);
      const activeModel = codeEditor.getModel();
      codeEditorService.listCodeEditors().find(
        (editor) => editor.getModel()?.uri.toString() === activeModel.uri.toString()
      )?.focus();
    }
  }
  async applyWithInlinePreview(codeEditorService, edits, codeEditor) {
    const firstEdit = edits[0];
    if (!ResourceTextEdit.is(firstEdit)) {
      return false;
    }
    const resource = firstEdit.resource;
    const textEdits = coalesce(
      edits.map(
        (edit) => ResourceTextEdit.is(edit) && isEqual(resource, edit.resource) ? edit.textEdit : void 0
      )
    );
    if (textEdits.length !== edits.length) {
      return false;
    }
    const editorToApply = await codeEditorService.openCodeEditor(
      { resource },
      codeEditor
    );
    if (editorToApply) {
      const inlineChatController = InlineChatController.get(editorToApply);
      if (inlineChatController) {
        const cancellationTokenSource = new CancellationTokenSource();
        try {
          return await inlineChatController.reviewEdits(
            textEdits[0].range,
            AsyncIterableObject.fromArray(textEdits),
            cancellationTokenSource.token
          );
        } finally {
          cancellationTokenSource.dispose();
        }
      }
    }
    return false;
  }
  notifyUserAction(chatService, context, result) {
    if (isResponseVM(context.element)) {
      chatService.notifyUserAction({
        agentId: context.element.agent?.id,
        command: context.element.slashCommand?.name,
        sessionId: context.element.sessionId,
        requestId: context.element.requestId,
        result: context.element.result,
        action: {
          kind: "insert",
          codeBlockIndex: context.codeBlockIndex,
          totalCharacters: context.code.length,
          userAction: this.desc.id,
          codeMapper: result?.codeMapper
        }
      });
    }
  }
}
function reindent(codeBlockContent, model, seletionStartLine) {
  const newContent = strings.splitLines(codeBlockContent);
  if (newContent.length === 0) {
    return void 0;
  }
  const formattingOptions = model.getFormattingOptions();
  const codeIndentLevel = computeIndentation(
    model.getLineContent(seletionStartLine),
    formattingOptions.tabSize
  ).level;
  const indents = newContent.map(
    (line) => computeIndentation(line, formattingOptions.tabSize)
  );
  const newContentIndentLevel = indents.reduce(
    (min, indent, index) => {
      if (indent.length !== newContent[index].length) {
        return Math.min(indent.level, min);
      }
      return min;
    },
    Number.MAX_VALUE
  );
  if (newContentIndentLevel === Number.MAX_VALUE || newContentIndentLevel === codeIndentLevel) {
    return void 0;
  }
  const newLines = [];
  for (let i = 0; i < newContent.length; i++) {
    const { level, length } = indents[i];
    const newLevel = Math.max(
      0,
      codeIndentLevel + level - newContentIndentLevel
    );
    const newIndentation = formattingOptions.insertSpaces ? " ".repeat(formattingOptions.tabSize * newLevel) : "	".repeat(newLevel);
    newLines.push(newIndentation + newContent[i].substring(length));
  }
  return newLines.join("\n");
}
__name(reindent, "reindent");
function computeIndentation(line, tabSize) {
  let nSpaces = 0;
  let level = 0;
  let i = 0;
  let length = 0;
  const len = line.length;
  while (i < len) {
    const chCode = line.charCodeAt(i);
    if (chCode === CharCode.Space) {
      nSpaces++;
      if (nSpaces === tabSize) {
        level++;
        nSpaces = 0;
        length = i + 1;
      }
    } else if (chCode === CharCode.Tab) {
      level++;
      nSpaces = 0;
      length = i + 1;
    } else {
      break;
    }
    i++;
  }
  return { level, length };
}
__name(computeIndentation, "computeIndentation");
function registerChatCodeBlockActions() {
  registerAction2(
    class CopyCodeBlockAction extends Action2 {
      static {
        __name(this, "CopyCodeBlockAction");
      }
      constructor() {
        super({
          id: "workbench.action.chat.copyCodeBlock",
          title: localize2("interactive.copyCodeBlock.label", "Copy"),
          f1: false,
          category: CHAT_CATEGORY,
          icon: Codicon.copy,
          menu: {
            id: MenuId.ChatCodeBlock,
            group: "navigation",
            order: 30
          }
        });
      }
      run(accessor, ...args) {
        const context = args[0];
        if (!isCodeBlockActionContext(context) || isResponseFiltered(context)) {
          return;
        }
        const clipboardService = accessor.get(IClipboardService);
        clipboardService.writeText(context.code);
        if (isResponseVM(context.element)) {
          const chatService = accessor.get(IChatService);
          chatService.notifyUserAction({
            agentId: context.element.agent?.id,
            command: context.element.slashCommand?.name,
            sessionId: context.element.sessionId,
            requestId: context.element.requestId,
            result: context.element.result,
            action: {
              kind: "copy",
              codeBlockIndex: context.codeBlockIndex,
              copyKind: ChatCopyKind.Toolbar,
              copiedCharacters: context.code.length,
              totalCharacters: context.code.length,
              copiedText: context.code
            }
          });
        }
      }
    }
  );
  CopyAction?.addImplementation(5e4, "chat-codeblock", (accessor) => {
    const editor = accessor.get(ICodeEditorService).getFocusedCodeEditor();
    if (!editor) {
      return false;
    }
    const editorModel = editor.getModel();
    if (!editorModel) {
      return false;
    }
    const context = getContextFromEditor(editor, accessor);
    if (!context) {
      return false;
    }
    const noSelection = editor.getSelections()?.length === 1 && editor.getSelection()?.isEmpty();
    const copiedText = noSelection ? editorModel.getValue() : editor.getSelections()?.reduce(
      (acc, selection) => acc + editorModel.getValueInRange(selection),
      ""
    ) ?? "";
    const totalCharacters = editorModel.getValueLength();
    const chatService = accessor.get(IChatService);
    const element = context.element;
    if (element) {
      chatService.notifyUserAction({
        agentId: element.agent?.id,
        command: element.slashCommand?.name,
        sessionId: element.sessionId,
        requestId: element.requestId,
        result: element.result,
        action: {
          kind: "copy",
          codeBlockIndex: context.codeBlockIndex,
          copyKind: ChatCopyKind.Action,
          copiedText,
          copiedCharacters: copiedText.length,
          totalCharacters
        }
      });
    }
    if (noSelection) {
      accessor.get(IClipboardService).writeText(context.code);
      return true;
    }
    return false;
  });
  registerAction2(
    class SmartApplyInEditorAction extends InsertCodeBlockAction {
      static {
        __name(this, "SmartApplyInEditorAction");
      }
      constructor() {
        super({
          id: "workbench.action.chat.applyInEditor",
          title: localize2(
            "interactive.applyInEditor.label",
            "Apply in Editor"
          ),
          precondition: CONTEXT_CHAT_ENABLED,
          f1: true,
          category: CHAT_CATEGORY,
          icon: Codicon.sparkle,
          menu: {
            id: MenuId.ChatCodeBlock,
            group: "navigation",
            when: ContextKeyExpr.and(
              CONTEXT_IN_CHAT_SESSION,
              ...shellLangIds.map(
                (e) => ContextKeyExpr.notEquals(
                  EditorContextKeys.languageId.key,
                  e
                )
              )
            ),
            order: 10
          },
          keybinding: {
            when: ContextKeyExpr.or(
              ContextKeyExpr.and(
                CONTEXT_IN_CHAT_SESSION,
                CONTEXT_IN_CHAT_INPUT.negate()
              ),
              accessibleViewInCodeBlock
            ),
            primary: KeyMod.CtrlCmd | KeyCode.Enter,
            mac: { primary: KeyMod.WinCtrl | KeyCode.Enter },
            weight: KeybindingWeight.ExternalExtension + 1
          }
        });
      }
      async computeEdits(progressService, notificationService, languageFeaturesService, bulkEditService, codeEditorService, chatService, codeEditor, codeBlockActionContext) {
        const activeModel = codeEditor.getModel();
        const mappedEditsProviders = languageFeaturesService.mappedEditsProvider.ordered(
          activeModel
        );
        if (mappedEditsProviders.length > 0) {
          const docRefs = [];
          const currentDocUri = activeModel.uri;
          const currentDocVersion = activeModel.getVersionId();
          const selections = codeEditor.getSelections();
          if (selections.length > 0) {
            docRefs.push([
              {
                uri: currentDocUri,
                version: currentDocVersion,
                ranges: selections
              }
            ]);
          }
          const usedDocuments = getUsedDocuments(
            codeBlockActionContext
          );
          if (usedDocuments) {
            docRefs.push(usedDocuments);
          }
          const cancellationTokenSource = new CancellationTokenSource();
          try {
            const edits = await progressService.withProgress(
              {
                location: ProgressLocation.Notification,
                delay: 500,
                sticky: true,
                cancellable: true
              },
              async (progress) => {
                for (const provider of mappedEditsProviders) {
                  progress.report({
                    message: localize(
                      "applyCodeBlock.progress",
                      "Applying code block using {0}...",
                      provider.displayName
                    )
                  });
                  const mappedEdits = await provider.provideMappedEdits(
                    activeModel,
                    [codeBlockActionContext.code],
                    {
                      documents: docRefs,
                      conversation: getChatConversation(
                        codeBlockActionContext
                      )
                    },
                    cancellationTokenSource.token
                  );
                  if (mappedEdits) {
                    return {
                      edits: mappedEdits.edits,
                      codeMapper: provider.displayName
                    };
                  }
                }
                return void 0;
              },
              () => cancellationTokenSource.cancel()
            );
            if (edits) {
              return edits;
            }
          } catch (e) {
            notificationService.notify({
              severity: Severity.Error,
              message: localize(
                "applyCodeBlock.error",
                "Failed to apply code block: {0}",
                e.message
              )
            });
          } finally {
            cancellationTokenSource.dispose();
          }
        }
        return void 0;
      }
      get showPreview() {
        return true;
      }
    }
  );
  registerAction2(
    class SmartApplyInEditorAction extends InsertCodeBlockAction {
      static {
        __name(this, "SmartApplyInEditorAction");
      }
      constructor() {
        super({
          id: "workbench.action.chat.insertCodeBlock",
          title: localize2(
            "interactive.insertCodeBlock.label",
            "Insert At Cursor"
          ),
          precondition: CONTEXT_CHAT_ENABLED,
          f1: true,
          category: CHAT_CATEGORY,
          icon: Codicon.insert,
          menu: {
            id: MenuId.ChatCodeBlock,
            group: "navigation",
            when: CONTEXT_IN_CHAT_SESSION,
            order: 20
          },
          keybinding: {
            when: ContextKeyExpr.or(
              ContextKeyExpr.and(
                CONTEXT_IN_CHAT_SESSION,
                CONTEXT_IN_CHAT_INPUT.negate()
              ),
              accessibleViewInCodeBlock
            ),
            primary: KeyMod.CtrlCmd | KeyCode.Enter,
            mac: { primary: KeyMod.WinCtrl | KeyCode.Enter },
            weight: KeybindingWeight.ExternalExtension + 1
          }
        });
      }
    }
  );
  registerAction2(
    class InsertIntoNewFileAction extends ChatCodeBlockAction {
      static {
        __name(this, "InsertIntoNewFileAction");
      }
      constructor() {
        super({
          id: "workbench.action.chat.insertIntoNewFile",
          title: localize2(
            "interactive.insertIntoNewFile.label",
            "Insert into New File"
          ),
          precondition: CONTEXT_CHAT_ENABLED,
          f1: true,
          category: CHAT_CATEGORY,
          icon: Codicon.newFile,
          menu: {
            id: MenuId.ChatCodeBlock,
            group: "navigation",
            isHiddenByDefault: true,
            order: 40
          }
        });
      }
      async runWithContext(accessor, context) {
        if (isResponseFiltered(context)) {
          return;
        }
        const editorService = accessor.get(IEditorService);
        const chatService = accessor.get(IChatService);
        editorService.openEditor({
          contents: context.code,
          languageId: context.languageId,
          resource: void 0
        });
        if (isResponseVM(context.element)) {
          chatService.notifyUserAction({
            agentId: context.element.agent?.id,
            command: context.element.slashCommand?.name,
            sessionId: context.element.sessionId,
            requestId: context.element.requestId,
            result: context.element.result,
            action: {
              kind: "insert",
              codeBlockIndex: context.codeBlockIndex,
              totalCharacters: context.code.length,
              newFile: true,
              userAction: this.desc.id
            }
          });
        }
      }
    }
  );
  registerAction2(
    class RunInTerminalAction extends ChatCodeBlockAction {
      static {
        __name(this, "RunInTerminalAction");
      }
      constructor() {
        super({
          id: "workbench.action.chat.runInTerminal",
          title: localize2(
            "interactive.runInTerminal.label",
            "Insert into Terminal"
          ),
          precondition: CONTEXT_CHAT_ENABLED,
          f1: true,
          category: CHAT_CATEGORY,
          icon: Codicon.terminal,
          menu: [
            {
              id: MenuId.ChatCodeBlock,
              group: "navigation",
              when: ContextKeyExpr.and(
                CONTEXT_IN_CHAT_SESSION,
                ContextKeyExpr.or(
                  ...shellLangIds.map(
                    (e) => ContextKeyExpr.equals(
                      EditorContextKeys.languageId.key,
                      e
                    )
                  )
                )
              )
            },
            {
              id: MenuId.ChatCodeBlock,
              group: "navigation",
              isHiddenByDefault: true,
              when: ContextKeyExpr.and(
                CONTEXT_IN_CHAT_SESSION,
                ...shellLangIds.map(
                  (e) => ContextKeyExpr.notEquals(
                    EditorContextKeys.languageId.key,
                    e
                  )
                )
              )
            }
          ],
          keybinding: [
            {
              primary: KeyMod.CtrlCmd | KeyMod.Alt | KeyCode.Enter,
              mac: {
                primary: KeyMod.WinCtrl | KeyMod.Alt | KeyCode.Enter
              },
              weight: KeybindingWeight.EditorContrib,
              when: ContextKeyExpr.or(
                CONTEXT_IN_CHAT_SESSION,
                accessibleViewInCodeBlock
              )
            }
          ]
        });
      }
      async runWithContext(accessor, context) {
        if (isResponseFiltered(context)) {
          return;
        }
        const chatService = accessor.get(IChatService);
        const terminalService = accessor.get(ITerminalService);
        const editorService = accessor.get(IEditorService);
        const terminalEditorService = accessor.get(
          ITerminalEditorService
        );
        const terminalGroupService = accessor.get(
          ITerminalGroupService
        );
        let terminal = await terminalService.getActiveOrCreateInstance();
        const unusableTerminal = terminal.xterm?.isStdinDisabled || terminal.shellLaunchConfig.isFeatureTerminal;
        terminal = unusableTerminal ? await terminalService.createTerminal() : terminal;
        terminalService.setActiveInstance(terminal);
        await terminal.focusWhenReady(true);
        if (terminal.target === TerminalLocation.Editor) {
          const existingEditors = editorService.findEditors(
            terminal.resource
          );
          terminalEditorService.openEditor(terminal, {
            viewColumn: existingEditors?.[0].groupId
          });
        } else {
          terminalGroupService.showPanel(true);
        }
        terminal.runCommand(context.code, false);
        if (isResponseVM(context.element)) {
          chatService.notifyUserAction({
            agentId: context.element.agent?.id,
            command: context.element.slashCommand?.name,
            sessionId: context.element.sessionId,
            requestId: context.element.requestId,
            result: context.element.result,
            action: {
              kind: "runInTerminal",
              codeBlockIndex: context.codeBlockIndex,
              languageId: context.languageId
            }
          });
        }
      }
    }
  );
  function navigateCodeBlocks(accessor, reverse) {
    const codeEditorService = accessor.get(ICodeEditorService);
    const chatWidgetService = accessor.get(IChatWidgetService);
    const widget = chatWidgetService.lastFocusedWidget;
    if (!widget) {
      return;
    }
    const editor = codeEditorService.getFocusedCodeEditor();
    const editorUri = editor?.getModel()?.uri;
    const curCodeBlockInfo = editorUri ? widget.getCodeBlockInfoForEditor(editorUri) : void 0;
    const focused = !widget.inputEditor.hasWidgetFocus() && widget.getFocus();
    const focusedResponse = isResponseVM(focused) ? focused : void 0;
    const currentResponse = curCodeBlockInfo ? curCodeBlockInfo.element : focusedResponse ?? widget.viewModel?.getItems().reverse().find(
      (item) => isResponseVM(item)
    );
    if (!currentResponse || !isResponseVM(currentResponse)) {
      return;
    }
    widget.reveal(currentResponse);
    const responseCodeblocks = widget.getCodeBlockInfosForResponse(currentResponse);
    const focusIdx = curCodeBlockInfo ? (curCodeBlockInfo.codeBlockIndex + (reverse ? -1 : 1) + responseCodeblocks.length) % responseCodeblocks.length : reverse ? responseCodeblocks.length - 1 : 0;
    responseCodeblocks[focusIdx]?.focus();
  }
  __name(navigateCodeBlocks, "navigateCodeBlocks");
  registerAction2(
    class NextCodeBlockAction extends Action2 {
      static {
        __name(this, "NextCodeBlockAction");
      }
      constructor() {
        super({
          id: "workbench.action.chat.nextCodeBlock",
          title: localize2(
            "interactive.nextCodeBlock.label",
            "Next Code Block"
          ),
          keybinding: {
            primary: KeyMod.CtrlCmd | KeyMod.Alt | KeyCode.PageDown,
            mac: {
              primary: KeyMod.CtrlCmd | KeyMod.Alt | KeyCode.PageDown
            },
            weight: KeybindingWeight.WorkbenchContrib,
            when: CONTEXT_IN_CHAT_SESSION
          },
          precondition: CONTEXT_CHAT_ENABLED,
          f1: true,
          category: CHAT_CATEGORY
        });
      }
      run(accessor, ...args) {
        navigateCodeBlocks(accessor);
      }
    }
  );
  registerAction2(
    class PreviousCodeBlockAction extends Action2 {
      static {
        __name(this, "PreviousCodeBlockAction");
      }
      constructor() {
        super({
          id: "workbench.action.chat.previousCodeBlock",
          title: localize2(
            "interactive.previousCodeBlock.label",
            "Previous Code Block"
          ),
          keybinding: {
            primary: KeyMod.CtrlCmd | KeyMod.Alt | KeyCode.PageUp,
            mac: {
              primary: KeyMod.CtrlCmd | KeyMod.Alt | KeyCode.PageUp
            },
            weight: KeybindingWeight.WorkbenchContrib,
            when: CONTEXT_IN_CHAT_SESSION
          },
          precondition: CONTEXT_CHAT_ENABLED,
          f1: true,
          category: CHAT_CATEGORY
        });
      }
      run(accessor, ...args) {
        navigateCodeBlocks(accessor, true);
      }
    }
  );
}
__name(registerChatCodeBlockActions, "registerChatCodeBlockActions");
function getContextFromEditor(editor, accessor) {
  const chatWidgetService = accessor.get(IChatWidgetService);
  const chatCodeBlockContextProviderService = accessor.get(
    IChatCodeBlockContextProviderService
  );
  const model = editor.getModel();
  if (!model) {
    return;
  }
  const widget = chatWidgetService.lastFocusedWidget;
  const codeBlockInfo = widget?.getCodeBlockInfoForEditor(model.uri);
  if (!codeBlockInfo) {
    for (const provider of chatCodeBlockContextProviderService.providers) {
      const context = provider.getCodeBlockContext(editor);
      if (context) {
        return context;
      }
    }
    return;
  }
  return {
    element: codeBlockInfo.element,
    codeBlockIndex: codeBlockInfo.codeBlockIndex,
    code: editor.getValue(),
    languageId: editor.getModel().getLanguageId(),
    codemapperUri: codeBlockInfo.codemapperUri
  };
}
__name(getContextFromEditor, "getContextFromEditor");
function registerChatCodeCompareBlockActions() {
  class ChatCompareCodeBlockAction extends Action2 {
    static {
      __name(this, "ChatCompareCodeBlockAction");
    }
    run(accessor, ...args) {
      const context = args[0];
      if (!isCodeCompareBlockActionContext(context)) {
        return;
      }
      return this.runWithContext(accessor, context);
    }
  }
  registerAction2(
    class ApplyEditsCompareBlockAction extends ChatCompareCodeBlockAction {
      static {
        __name(this, "ApplyEditsCompareBlockAction");
      }
      constructor() {
        super({
          id: "workbench.action.chat.applyCompareEdits",
          title: localize2(
            "interactive.compare.apply",
            "Apply Edits"
          ),
          f1: false,
          category: CHAT_CATEGORY,
          icon: Codicon.check,
          precondition: ContextKeyExpr.and(
            EditorContextKeys.hasChanges,
            CONTEXT_CHAT_EDIT_APPLIED.negate()
          ),
          menu: {
            id: MenuId.ChatCompareBlock,
            group: "navigation",
            order: 1
          }
        });
      }
      async runWithContext(accessor, context) {
        const editorService = accessor.get(IEditorService);
        const instaService = accessor.get(IInstantiationService);
        const editor = instaService.createInstance(
          DefaultChatTextEditor
        );
        await editor.apply(
          context.element,
          context.edit,
          context.diffEditor
        );
        await editorService.openEditor({
          resource: context.edit.uri,
          options: { revealIfVisible: true }
        });
      }
    }
  );
  registerAction2(
    class DiscardEditsCompareBlockAction extends ChatCompareCodeBlockAction {
      static {
        __name(this, "DiscardEditsCompareBlockAction");
      }
      constructor() {
        super({
          id: "workbench.action.chat.discardCompareEdits",
          title: localize2(
            "interactive.compare.discard",
            "Discard Edits"
          ),
          f1: false,
          category: CHAT_CATEGORY,
          icon: Codicon.trash,
          precondition: ContextKeyExpr.and(
            EditorContextKeys.hasChanges,
            CONTEXT_CHAT_EDIT_APPLIED.negate()
          ),
          menu: {
            id: MenuId.ChatCompareBlock,
            group: "navigation",
            order: 2
          }
        });
      }
      async runWithContext(accessor, context) {
        const instaService = accessor.get(IInstantiationService);
        const editor = instaService.createInstance(
          DefaultChatTextEditor
        );
        editor.discard(context.element, context.edit);
      }
    }
  );
}
__name(registerChatCodeCompareBlockActions, "registerChatCodeCompareBlockActions");
export {
  isCodeBlockActionContext,
  isCodeCompareBlockActionContext,
  registerChatCodeBlockActions,
  registerChatCodeCompareBlockActions
};
//# sourceMappingURL=chatCodeblockActions.js.map
