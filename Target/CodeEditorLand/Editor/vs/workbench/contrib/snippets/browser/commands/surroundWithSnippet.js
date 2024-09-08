import { EditorContextKeys } from "../../../../../editor/common/editorContextKeys.js";
import { SnippetController2 } from "../../../../../editor/contrib/snippet/browser/snippetController2.js";
import { localize2 } from "../../../../../nls.js";
import { IClipboardService } from "../../../../../platform/clipboard/common/clipboardService.js";
import { ContextKeyExpr } from "../../../../../platform/contextkey/common/contextkey.js";
import {
  IInstantiationService
} from "../../../../../platform/instantiation/common/instantiation.js";
import { pickSnippet } from "../snippetPicker.js";
import { ISnippetsService } from "../snippets.js";
import { SnippetEditorAction } from "./abstractSnippetsActions.js";
async function getSurroundableSnippets(snippetsService, model, position, includeDisabledSnippets) {
  const { lineNumber, column } = position;
  model.tokenization.tokenizeIfCheap(lineNumber);
  const languageId = model.getLanguageIdAtPosition(lineNumber, column);
  const allSnippets = await snippetsService.getSnippets(languageId, {
    includeNoPrefixSnippets: true,
    includeDisabledSnippets
  });
  return allSnippets.filter((snippet) => snippet.usesSelection);
}
class SurroundWithSnippetEditorAction extends SnippetEditorAction {
  static options = {
    id: "editor.action.surroundWithSnippet",
    title: localize2("label", "Surround with Snippet...")
  };
  constructor() {
    super({
      ...SurroundWithSnippetEditorAction.options,
      precondition: ContextKeyExpr.and(
        EditorContextKeys.writable,
        EditorContextKeys.hasNonEmptySelection
      ),
      f1: true
    });
  }
  async runEditorCommand(accessor, editor) {
    if (!editor.hasModel()) {
      return;
    }
    const instaService = accessor.get(IInstantiationService);
    const snippetsService = accessor.get(ISnippetsService);
    const clipboardService = accessor.get(IClipboardService);
    const snippets = await getSurroundableSnippets(
      snippetsService,
      editor.getModel(),
      editor.getPosition(),
      true
    );
    if (!snippets.length) {
      return;
    }
    const snippet = await instaService.invokeFunction(
      pickSnippet,
      snippets
    );
    if (!snippet) {
      return;
    }
    let clipboardText;
    if (snippet.needsClipboard) {
      clipboardText = await clipboardService.readText();
    }
    editor.focus();
    SnippetController2.get(editor)?.insert(snippet.codeSnippet, {
      clipboardText
    });
    snippetsService.updateUsageTimestamp(snippet);
  }
}
export {
  SurroundWithSnippetEditorAction,
  getSurroundableSnippets
};
