import { renderMarkdownAsPlaintext } from "../../../../../base/browser/markdownRenderer.js";
import { localize } from "../../../../../nls.js";
import { CellKind } from "../../common/notebookCommon.js";
import { getMarkdownHeadersInCell } from "./foldingModel.js";
import { OutlineEntry } from "./OutlineEntry.js";
var NotebookOutlineConstants = /* @__PURE__ */ ((NotebookOutlineConstants2) => {
  NotebookOutlineConstants2[NotebookOutlineConstants2["NonHeaderOutlineLevel"] = 7] = "NonHeaderOutlineLevel";
  return NotebookOutlineConstants2;
})(NotebookOutlineConstants || {});
function getMarkdownHeadersInCellFallbackToHtmlTags(fullContent) {
  const headers = Array.from(getMarkdownHeadersInCell(fullContent));
  if (headers.length) {
    return headers;
  }
  const match = fullContent.match(/<h([1-6]).*>(.*)<\/h\1>/i);
  if (match) {
    const level = Number.parseInt(match[1]);
    const text = match[2].trim();
    headers.push({ depth: level, text });
  }
  return headers;
}
class NotebookOutlineEntryFactory {
  constructor(executionStateService) {
    this.executionStateService = executionStateService;
  }
  cellOutlineEntryCache = {};
  cachedMarkdownOutlineEntries = /* @__PURE__ */ new WeakMap();
  getOutlineEntries(cell, index) {
    const entries = [];
    const isMarkdown = cell.cellKind === CellKind.Markup;
    let content = getCellFirstNonEmptyLine(cell);
    let hasHeader = false;
    if (isMarkdown) {
      const fullContent = cell.getText().substring(0, 1e4);
      const cache = this.cachedMarkdownOutlineEntries.get(cell);
      const headers = cache?.alternativeId === cell.getAlternativeId() ? cache.headers : Array.from(
        getMarkdownHeadersInCellFallbackToHtmlTags(
          fullContent
        )
      );
      this.cachedMarkdownOutlineEntries.set(cell, {
        alternativeId: cell.getAlternativeId(),
        headers
      });
      for (const { depth, text } of headers) {
        hasHeader = true;
        entries.push(
          new OutlineEntry(index++, depth, cell, text, false, false)
        );
      }
      if (!hasHeader) {
        content = renderMarkdownAsPlaintext({ value: content });
      }
    }
    if (!hasHeader) {
      const exeState = !isMarkdown && this.executionStateService.getCellExecution(cell.uri);
      let preview = content.trim();
      if (!isMarkdown && cell.model.textModel) {
        const cachedEntries = this.cellOutlineEntryCache[cell.model.textModel.id];
        if (cachedEntries) {
          entries.push(
            new OutlineEntry(
              index++,
              7 /* NonHeaderOutlineLevel */,
              cell,
              preview,
              !!exeState,
              exeState ? exeState.isPaused : false
            )
          );
          cachedEntries.forEach((cached) => {
            entries.push(
              new OutlineEntry(
                index++,
                cached.level,
                cell,
                cached.name,
                false,
                false,
                cached.range,
                cached.kind
              )
            );
          });
        }
      }
      if (entries.length === 0) {
        if (preview.length === 0) {
          preview = localize("empty", "empty cell");
        }
        entries.push(
          new OutlineEntry(
            index++,
            7 /* NonHeaderOutlineLevel */,
            cell,
            preview,
            !!exeState,
            exeState ? exeState.isPaused : false
          )
        );
      }
    }
    return entries;
  }
  async cacheSymbols(cell, outlineModelService, cancelToken) {
    const textModel = await cell.resolveTextModel();
    const outlineModel = await outlineModelService.getOrCreate(
      textModel,
      cancelToken
    );
    const entries = createOutlineEntries(
      outlineModel.getTopLevelSymbols(),
      8
    );
    this.cellOutlineEntryCache[textModel.id] = entries;
  }
}
function createOutlineEntries(symbols, level) {
  const entries = [];
  symbols.forEach((symbol) => {
    entries.push({
      name: symbol.name,
      range: symbol.range,
      level,
      kind: symbol.kind
    });
    if (symbol.children) {
      entries.push(...createOutlineEntries(symbol.children, level + 1));
    }
  });
  return entries;
}
function getCellFirstNonEmptyLine(cell) {
  const textBuffer = cell.textBuffer;
  for (let i = 0; i < textBuffer.getLineCount(); i++) {
    const firstNonWhitespace = textBuffer.getLineFirstNonWhitespaceColumn(
      i + 1
    );
    const lineLength = textBuffer.getLineLength(i + 1);
    if (firstNonWhitespace < lineLength) {
      return textBuffer.getLineContent(i + 1);
    }
  }
  return cell.getText().substring(0, 100);
}
export {
  NotebookOutlineConstants,
  NotebookOutlineEntryFactory
};
