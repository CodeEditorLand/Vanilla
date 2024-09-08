import { EditorAction2 } from "../../../../../editor/browser/editorExtensions.js";
import { localize2 } from "../../../../../nls.js";
import {
  Action2
} from "../../../../../platform/actions/common/actions.js";
const defaultOptions = {
  category: localize2("snippets", "Snippets")
};
class SnippetsAction extends Action2 {
  constructor(desc) {
    super({ ...defaultOptions, ...desc });
  }
}
class SnippetEditorAction extends EditorAction2 {
  constructor(desc) {
    super({ ...defaultOptions, ...desc });
  }
}
export {
  SnippetEditorAction,
  SnippetsAction
};
