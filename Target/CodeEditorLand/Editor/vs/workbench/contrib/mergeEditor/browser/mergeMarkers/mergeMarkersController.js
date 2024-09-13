var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { h } from "../../../../../base/browser/dom.js";
import {
  Disposable,
  DisposableStore
} from "../../../../../base/common/lifecycle.js";
import {
  autorun
} from "../../../../../base/common/observable.js";
import * as nls from "../../../../../nls.js";
import { LineRange } from "../model/lineRange.js";
const conflictMarkers = {
  start: "<<<<<<<",
  end: ">>>>>>>"
};
class MergeMarkersController extends Disposable {
  constructor(editor, mergeEditorViewModel) {
    super();
    this.editor = editor;
    this.mergeEditorViewModel = mergeEditorViewModel;
    this._register(
      editor.onDidChangeModelContent((e) => {
        this.updateDecorations();
      })
    );
    this._register(
      editor.onDidChangeModel((e) => {
        this.updateDecorations();
      })
    );
    this.updateDecorations();
  }
  static {
    __name(this, "MergeMarkersController");
  }
  viewZoneIds = [];
  disposableStore = new DisposableStore();
  updateDecorations() {
    const model = this.editor.getModel();
    const blocks = model ? getBlocks(model, {
      blockToRemoveStartLinePrefix: conflictMarkers.start,
      blockToRemoveEndLinePrefix: conflictMarkers.end
    }) : { blocks: [] };
    this.editor.setHiddenAreas(
      blocks.blocks.map((b) => b.lineRange.deltaEnd(-1).toRange()),
      this
    );
    this.editor.changeViewZones((c) => {
      this.disposableStore.clear();
      for (const id of this.viewZoneIds) {
        c.removeZone(id);
      }
      this.viewZoneIds.length = 0;
      for (const b of blocks.blocks) {
        const startLine = model.getLineContent(b.lineRange.startLineNumber).substring(0, 20);
        const endLine = model.getLineContent(b.lineRange.endLineNumberExclusive - 1).substring(0, 20);
        const conflictingLinesCount = b.lineRange.lineCount - 2;
        const domNode = h("div", [
          h("div.conflict-zone-root", [
            h("pre", [startLine]),
            h("span.dots", ["..."]),
            h("pre", [endLine]),
            h("span.text", [
              conflictingLinesCount === 1 ? nls.localize(
                "conflictingLine",
                "1 Conflicting Line"
              ) : nls.localize(
                "conflictingLines",
                "{0} Conflicting Lines",
                conflictingLinesCount
              )
            ])
          ])
        ]).root;
        this.viewZoneIds.push(
          c.addZone({
            afterLineNumber: b.lineRange.endLineNumberExclusive - 1,
            domNode,
            heightInLines: 1.5
          })
        );
        const updateWidth = /* @__PURE__ */ __name(() => {
          const layoutInfo = this.editor.getLayoutInfo();
          domNode.style.width = `${layoutInfo.contentWidth - layoutInfo.verticalScrollbarWidth}px`;
        }, "updateWidth");
        this.disposableStore.add(
          this.editor.onDidLayoutChange(() => {
            updateWidth();
          })
        );
        updateWidth();
        this.disposableStore.add(
          autorun((reader) => {
            const vm = this.mergeEditorViewModel.read(reader);
            if (!vm) {
              return;
            }
            const activeRange = vm.activeModifiedBaseRange.read(reader);
            const classNames = [];
            classNames.push("conflict-zone");
            if (activeRange) {
              const activeRangeInResult = vm.model.getLineRangeInResult(
                activeRange.baseRange,
                reader
              );
              if (activeRangeInResult.intersects(b.lineRange)) {
                classNames.push("focused");
              }
            }
            domNode.className = classNames.join(" ");
          })
        );
      }
    });
  }
}
function getBlocks(document, configuration) {
  const blocks = [];
  const transformedContent = [];
  let inBlock = false;
  let startLineNumber = -1;
  let curLine = 0;
  for (const line of document.getLinesContent()) {
    curLine++;
    if (inBlock) {
      if (line.startsWith(configuration.blockToRemoveEndLinePrefix)) {
        inBlock = false;
        blocks.push(
          new Block(
            new LineRange(
              startLineNumber,
              curLine - startLineNumber + 1
            )
          )
        );
        transformedContent.push("");
      }
    } else if (line.startsWith(configuration.blockToRemoveStartLinePrefix)) {
      inBlock = true;
      startLineNumber = curLine;
    } else {
      transformedContent.push(line);
    }
  }
  return {
    blocks,
    transformedContent: transformedContent.join("\n")
  };
}
__name(getBlocks, "getBlocks");
class Block {
  constructor(lineRange) {
    this.lineRange = lineRange;
  }
  static {
    __name(this, "Block");
  }
}
export {
  MergeMarkersController,
  conflictMarkers
};
//# sourceMappingURL=mergeMarkersController.js.map
