var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { autorunWithStore, IObservable } from "../../../../../base/common/observable.js";
import { CodeEditorWidget } from "../../../../../editor/browser/widget/codeEditor/codeEditorWidget.js";
import { ScrollType } from "../../../../../editor/common/editorCommon.js";
import { DocumentLineRangeMap } from "../model/mapping.js";
import { ReentrancyBarrier } from "../../../../../base/common/controlFlow.js";
import { BaseCodeEditorView } from "./editors/baseCodeEditorView.js";
import { IMergeEditorLayout } from "./mergeEditor.js";
import { MergeEditorViewModel } from "./viewModel.js";
import { InputCodeEditorView } from "./editors/inputCodeEditorView.js";
import { ResultCodeEditorView } from "./editors/resultCodeEditorView.js";
class ScrollSynchronizer extends Disposable {
  constructor(viewModel, input1View, input2View, baseView, inputResultView, layout) {
    super();
    this.viewModel = viewModel;
    this.input1View = input1View;
    this.input2View = input2View;
    this.baseView = baseView;
    this.inputResultView = inputResultView;
    this.layout = layout;
    const handleInput1OnScroll = this.updateScrolling = () => {
      if (!this.model) {
        return;
      }
      this.input2View.editor.setScrollTop(this.input1View.editor.getScrollTop(), ScrollType.Immediate);
      if (this.shouldAlignResult) {
        this.inputResultView.editor.setScrollTop(this.input1View.editor.getScrollTop(), ScrollType.Immediate);
      } else {
        const mappingInput1Result = this.model.input1ResultMapping.get();
        this.synchronizeScrolling(this.input1View.editor, this.inputResultView.editor, mappingInput1Result);
      }
      const baseView2 = this.baseView.get();
      if (baseView2) {
        if (this.shouldAlignBase) {
          this.baseView.get()?.editor.setScrollTop(this.input1View.editor.getScrollTop(), ScrollType.Immediate);
        } else {
          const mapping = new DocumentLineRangeMap(this.model.baseInput1Diffs.get(), -1).reverse();
          this.synchronizeScrolling(this.input1View.editor, baseView2.editor, mapping);
        }
      }
    };
    this._store.add(
      this.input1View.editor.onDidScrollChange(
        this.reentrancyBarrier.makeExclusiveOrSkip((c) => {
          if (c.scrollTopChanged) {
            handleInput1OnScroll();
          }
          if (c.scrollLeftChanged) {
            this.baseView.get()?.editor.setScrollLeft(c.scrollLeft, ScrollType.Immediate);
            this.input2View.editor.setScrollLeft(c.scrollLeft, ScrollType.Immediate);
            this.inputResultView.editor.setScrollLeft(c.scrollLeft, ScrollType.Immediate);
          }
        })
      )
    );
    this._store.add(
      this.input2View.editor.onDidScrollChange(
        this.reentrancyBarrier.makeExclusiveOrSkip((c) => {
          if (!this.model) {
            return;
          }
          if (c.scrollTopChanged) {
            this.input1View.editor.setScrollTop(c.scrollTop, ScrollType.Immediate);
            if (this.shouldAlignResult) {
              this.inputResultView.editor.setScrollTop(this.input2View.editor.getScrollTop(), ScrollType.Immediate);
            } else {
              const mappingInput2Result = this.model.input2ResultMapping.get();
              this.synchronizeScrolling(this.input2View.editor, this.inputResultView.editor, mappingInput2Result);
            }
            const baseView2 = this.baseView.get();
            if (baseView2 && this.model) {
              if (this.shouldAlignBase) {
                this.baseView.get()?.editor.setScrollTop(c.scrollTop, ScrollType.Immediate);
              } else {
                const mapping = new DocumentLineRangeMap(this.model.baseInput2Diffs.get(), -1).reverse();
                this.synchronizeScrolling(this.input2View.editor, baseView2.editor, mapping);
              }
            }
          }
          if (c.scrollLeftChanged) {
            this.baseView.get()?.editor.setScrollLeft(c.scrollLeft, ScrollType.Immediate);
            this.input1View.editor.setScrollLeft(c.scrollLeft, ScrollType.Immediate);
            this.inputResultView.editor.setScrollLeft(c.scrollLeft, ScrollType.Immediate);
          }
        })
      )
    );
    this._store.add(
      this.inputResultView.editor.onDidScrollChange(
        this.reentrancyBarrier.makeExclusiveOrSkip((c) => {
          if (c.scrollTopChanged) {
            if (this.shouldAlignResult) {
              this.input1View.editor.setScrollTop(c.scrollTop, ScrollType.Immediate);
              this.input2View.editor.setScrollTop(c.scrollTop, ScrollType.Immediate);
            } else {
              const mapping1 = this.model?.resultInput1Mapping.get();
              this.synchronizeScrolling(this.inputResultView.editor, this.input1View.editor, mapping1);
              const mapping2 = this.model?.resultInput2Mapping.get();
              this.synchronizeScrolling(this.inputResultView.editor, this.input2View.editor, mapping2);
            }
            const baseMapping = this.model?.resultBaseMapping.get();
            const baseView2 = this.baseView.get();
            if (baseView2 && this.model) {
              this.synchronizeScrolling(this.inputResultView.editor, baseView2.editor, baseMapping);
            }
          }
          if (c.scrollLeftChanged) {
            this.baseView.get()?.editor?.setScrollLeft(c.scrollLeft, ScrollType.Immediate);
            this.input1View.editor.setScrollLeft(c.scrollLeft, ScrollType.Immediate);
            this.input2View.editor.setScrollLeft(c.scrollLeft, ScrollType.Immediate);
          }
        })
      )
    );
    this._store.add(
      autorunWithStore((reader, store) => {
        const baseView2 = this.baseView.read(reader);
        if (baseView2) {
          store.add(baseView2.editor.onDidScrollChange(
            this.reentrancyBarrier.makeExclusiveOrSkip((c) => {
              if (c.scrollTopChanged) {
                if (!this.model) {
                  return;
                }
                if (this.shouldAlignBase) {
                  this.input1View.editor.setScrollTop(c.scrollTop, ScrollType.Immediate);
                  this.input2View.editor.setScrollTop(c.scrollTop, ScrollType.Immediate);
                } else {
                  const baseInput1Mapping = new DocumentLineRangeMap(this.model.baseInput1Diffs.get(), -1);
                  this.synchronizeScrolling(baseView2.editor, this.input1View.editor, baseInput1Mapping);
                  const baseInput2Mapping = new DocumentLineRangeMap(this.model.baseInput2Diffs.get(), -1);
                  this.synchronizeScrolling(baseView2.editor, this.input2View.editor, baseInput2Mapping);
                }
                const baseMapping = this.model?.baseResultMapping.get();
                this.synchronizeScrolling(baseView2.editor, this.inputResultView.editor, baseMapping);
              }
              if (c.scrollLeftChanged) {
                this.inputResultView.editor.setScrollLeft(c.scrollLeft, ScrollType.Immediate);
                this.input1View.editor.setScrollLeft(c.scrollLeft, ScrollType.Immediate);
                this.input2View.editor.setScrollLeft(c.scrollLeft, ScrollType.Immediate);
              }
            })
          ));
        }
      })
    );
  }
  static {
    __name(this, "ScrollSynchronizer");
  }
  get model() {
    return this.viewModel.get()?.model;
  }
  reentrancyBarrier = new ReentrancyBarrier();
  updateScrolling;
  get shouldAlignResult() {
    return this.layout.get().kind === "columns";
  }
  get shouldAlignBase() {
    return this.layout.get().kind === "mixed" && !this.layout.get().showBaseAtTop;
  }
  synchronizeScrolling(scrollingEditor, targetEditor, mapping) {
    if (!mapping) {
      return;
    }
    const visibleRanges = scrollingEditor.getVisibleRanges();
    if (visibleRanges.length === 0) {
      return;
    }
    const topLineNumber = visibleRanges[0].startLineNumber - 1;
    const result = mapping.project(topLineNumber);
    const sourceRange = result.inputRange;
    const targetRange = result.outputRange;
    const resultStartTopPx = targetEditor.getTopForLineNumber(targetRange.startLineNumber);
    const resultEndPx = targetEditor.getTopForLineNumber(targetRange.endLineNumberExclusive);
    const sourceStartTopPx = scrollingEditor.getTopForLineNumber(sourceRange.startLineNumber);
    const sourceEndPx = scrollingEditor.getTopForLineNumber(sourceRange.endLineNumberExclusive);
    const factor = Math.min((scrollingEditor.getScrollTop() - sourceStartTopPx) / (sourceEndPx - sourceStartTopPx), 1);
    const resultScrollPosition = resultStartTopPx + (resultEndPx - resultStartTopPx) * factor;
    targetEditor.setScrollTop(resultScrollPosition, ScrollType.Immediate);
  }
}
export {
  ScrollSynchronizer
};
//# sourceMappingURL=scrollSynchronizer.js.map
