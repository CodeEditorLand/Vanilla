import { EditorOptions, WrappingIndent, EditorAutoIndentStrategy } from "./common/config/editorOptions.js";
import { createMonacoBaseAPI } from "./common/services/editorBaseApi.js";
import { createMonacoEditorAPI } from "./standalone/browser/standaloneEditor.js";
import { createMonacoLanguagesAPI } from "./standalone/browser/standaloneLanguages.js";
import { FormattingConflicts } from "./contrib/format/browser/format.js";
EditorOptions.wrappingIndent.defaultValue = WrappingIndent.None;
EditorOptions.glyphMargin.defaultValue = false;
EditorOptions.autoIndent.defaultValue = EditorAutoIndentStrategy.Advanced;
EditorOptions.overviewRulerLanes.defaultValue = 2;
FormattingConflicts.setFormatterSelector((formatter, document, mode) => Promise.resolve(formatter[0]));
const api = createMonacoBaseAPI();
api.editor = createMonacoEditorAPI();
api.languages = createMonacoLanguagesAPI();
const CancellationTokenSource = api.CancellationTokenSource;
const Emitter = api.Emitter;
const KeyCode = api.KeyCode;
const KeyMod = api.KeyMod;
const Position = api.Position;
const Range = api.Range;
const Selection = api.Selection;
const SelectionDirection = api.SelectionDirection;
const MarkerSeverity = api.MarkerSeverity;
const MarkerTag = api.MarkerTag;
const Uri = api.Uri;
const Token = api.Token;
const editor = api.editor;
const languages = api.languages;
const monacoEnvironment = globalThis.MonacoEnvironment;
if (monacoEnvironment?.globalAPI || typeof define === "function" && define.amd) {
  globalThis.monaco = api;
}
if (typeof globalThis.require !== "undefined" && typeof globalThis.require.config === "function") {
  globalThis.require.config({
    ignoreDuplicateModules: [
      "vscode-languageserver-types",
      "vscode-languageserver-types/main",
      "vscode-languageserver-textdocument",
      "vscode-languageserver-textdocument/main",
      "vscode-nls",
      "vscode-nls/vscode-nls",
      "jsonc-parser",
      "jsonc-parser/main",
      "vscode-uri",
      "vscode-uri/index",
      "vs/basic-languages/typescript/typescript"
    ]
  });
}
export {
  CancellationTokenSource,
  Emitter,
  KeyCode,
  KeyMod,
  MarkerSeverity,
  MarkerTag,
  Position,
  Range,
  Selection,
  SelectionDirection,
  Token,
  Uri,
  editor,
  languages
};
//# sourceMappingURL=editor.api.js.map
