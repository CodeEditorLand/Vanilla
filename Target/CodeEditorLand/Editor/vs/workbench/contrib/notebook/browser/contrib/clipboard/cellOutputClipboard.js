var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { isTextStreamMime } from "../../../common/notebookCommon.js";
async function copyCellOutput(mimeType, outputViewModel, clipboardService, logService) {
  const cellOutput = outputViewModel.model;
  const output = mimeType && TEXT_BASED_MIMETYPES.includes(mimeType) ? cellOutput.outputs.find((output2) => output2.mime === mimeType) : cellOutput.outputs.find(
    (output2) => TEXT_BASED_MIMETYPES.includes(output2.mime)
  );
  mimeType = output?.mime;
  if (!mimeType || !output) {
    return;
  }
  const decoder = new TextDecoder();
  let text = decoder.decode(output.data.buffer);
  if (isTextStreamMime(mimeType)) {
    const cellViewModel = outputViewModel.cellViewModel;
    let index = cellViewModel.outputsViewModels.indexOf(outputViewModel) + 1;
    while (index < cellViewModel.model.outputs.length) {
      const nextCellOutput = cellViewModel.model.outputs[index];
      const nextOutput = nextCellOutput.outputs.find(
        (output2) => isTextStreamMime(output2.mime)
      );
      if (!nextOutput) {
        break;
      }
      text = text + decoder.decode(nextOutput.data.buffer);
      index = index + 1;
    }
  }
  if (mimeType.endsWith("error")) {
    text = text.replace(/\\u001b\[[0-9;]*m/gi, "").replaceAll("\\n", "\n");
  }
  try {
    await clipboardService.writeText(text);
  } catch (e) {
    logService.error(`Failed to copy content: ${e}`);
  }
}
__name(copyCellOutput, "copyCellOutput");
const TEXT_BASED_MIMETYPES = [
  "text/latex",
  "text/html",
  "application/vnd.code.notebook.error",
  "application/vnd.code.notebook.stdout",
  "application/x.notebook.stdout",
  "application/x.notebook.stream",
  "application/vnd.code.notebook.stderr",
  "application/x.notebook.stderr",
  "text/plain",
  "text/markdown",
  "application/json"
];
export {
  TEXT_BASED_MIMETYPES,
  copyCellOutput
};
//# sourceMappingURL=cellOutputClipboard.js.map
