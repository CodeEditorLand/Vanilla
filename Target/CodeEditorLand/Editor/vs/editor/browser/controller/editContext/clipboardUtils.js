import { isWindows } from "../../../../base/common/platform.js";
function getDataToCopy(viewModel, modelSelections, emptySelectionClipboard, copyWithSyntaxHighlighting) {
  const rawTextToCopy = viewModel.getPlainTextToCopy(
    modelSelections,
    emptySelectionClipboard,
    isWindows
  );
  const newLineCharacter = viewModel.model.getEOL();
  const isFromEmptySelection = emptySelectionClipboard && modelSelections.length === 1 && modelSelections[0].isEmpty();
  const multicursorText = Array.isArray(rawTextToCopy) ? rawTextToCopy : null;
  const text = Array.isArray(rawTextToCopy) ? rawTextToCopy.join(newLineCharacter) : rawTextToCopy;
  let html;
  let mode = null;
  if (CopyOptions.forceCopyWithSyntaxHighlighting || copyWithSyntaxHighlighting && text.length < 65536) {
    const richText = viewModel.getRichTextToCopy(
      modelSelections,
      emptySelectionClipboard
    );
    if (richText) {
      html = richText.html;
      mode = richText.mode;
    }
  }
  const dataToCopy = {
    isFromEmptySelection,
    multicursorText,
    text,
    html,
    mode
  };
  return dataToCopy;
}
class InMemoryClipboardMetadataManager {
  static INSTANCE = new InMemoryClipboardMetadataManager();
  _lastState;
  constructor() {
    this._lastState = null;
  }
  set(lastCopiedValue, data) {
    this._lastState = { lastCopiedValue, data };
  }
  get(pastedText) {
    if (this._lastState && this._lastState.lastCopiedValue === pastedText) {
      return this._lastState.data;
    }
    this._lastState = null;
    return null;
  }
}
const CopyOptions = {
  forceCopyWithSyntaxHighlighting: false
};
export {
  CopyOptions,
  InMemoryClipboardMetadataManager,
  getDataToCopy
};
