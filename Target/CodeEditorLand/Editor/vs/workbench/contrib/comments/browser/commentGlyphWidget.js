import { Color } from "../../../../base/common/color.js";
import { Emitter } from "../../../../base/common/event.js";
import { Disposable, toDisposable } from "../../../../base/common/lifecycle.js";
import {
  ContentWidgetPositionPreference
} from "../../../../editor/browser/editorBrowser.js";
import { CommentThreadState } from "../../../../editor/common/languages.js";
import {
  OverviewRulerLane
} from "../../../../editor/common/model.js";
import { ModelDecorationOptions } from "../../../../editor/common/model/textModel.js";
import * as nls from "../../../../nls.js";
import {
  darken,
  editorBackground,
  editorForeground,
  listInactiveSelectionBackground,
  opaque,
  registerColor
} from "../../../../platform/theme/common/colorRegistry.js";
import { themeColorFromId } from "../../../../platform/theme/common/themeService.js";
const overviewRulerCommentingRangeForeground = registerColor(
  "editorGutter.commentRangeForeground",
  {
    dark: opaque(listInactiveSelectionBackground, editorBackground),
    light: darken(
      opaque(listInactiveSelectionBackground, editorBackground),
      0.05
    ),
    hcDark: Color.white,
    hcLight: Color.black
  },
  nls.localize(
    "editorGutterCommentRangeForeground",
    "Editor gutter decoration color for commenting ranges. This color should be opaque."
  )
);
const overviewRulerCommentForeground = registerColor(
  "editorOverviewRuler.commentForeground",
  overviewRulerCommentingRangeForeground,
  nls.localize(
    "editorOverviewRuler.commentForeground",
    "Editor overview ruler decoration color for resolved comments. This color should be opaque."
  )
);
const overviewRulerCommentUnresolvedForeground = registerColor(
  "editorOverviewRuler.commentUnresolvedForeground",
  overviewRulerCommentForeground,
  nls.localize(
    "editorOverviewRuler.commentUnresolvedForeground",
    "Editor overview ruler decoration color for unresolved comments. This color should be opaque."
  )
);
const editorGutterCommentGlyphForeground = registerColor(
  "editorGutter.commentGlyphForeground",
  {
    dark: editorForeground,
    light: editorForeground,
    hcDark: Color.black,
    hcLight: Color.white
  },
  nls.localize(
    "editorGutterCommentGlyphForeground",
    "Editor gutter decoration color for commenting glyphs."
  )
);
registerColor(
  "editorGutter.commentUnresolvedGlyphForeground",
  editorGutterCommentGlyphForeground,
  nls.localize(
    "editorGutterCommentUnresolvedGlyphForeground",
    "Editor gutter decoration color for commenting glyphs for unresolved comment threads."
  )
);
class CommentGlyphWidget extends Disposable {
  static description = "comment-glyph-widget";
  _lineNumber;
  _editor;
  _threadState;
  _commentsDecorations;
  _commentsOptions;
  _onDidChangeLineNumber = this._register(
    new Emitter()
  );
  onDidChangeLineNumber = this._onDidChangeLineNumber.event;
  constructor(editor, lineNumber) {
    super();
    this._commentsOptions = this.createDecorationOptions();
    this._editor = editor;
    this._commentsDecorations = this._editor.createDecorationsCollection();
    this._register(
      this._commentsDecorations.onDidChange((e) => {
        const range = this._commentsDecorations.length > 0 ? this._commentsDecorations.getRange(0) : null;
        if (range && range.endLineNumber !== this._lineNumber) {
          this._lineNumber = range.endLineNumber;
          this._onDidChangeLineNumber.fire(this._lineNumber);
        }
      })
    );
    this._register(toDisposable(() => this._commentsDecorations.clear()));
    this.setLineNumber(lineNumber);
  }
  createDecorationOptions() {
    const unresolved = this._threadState === CommentThreadState.Unresolved;
    const decorationOptions = {
      description: CommentGlyphWidget.description,
      isWholeLine: true,
      overviewRuler: {
        color: themeColorFromId(
          unresolved ? overviewRulerCommentUnresolvedForeground : overviewRulerCommentForeground
        ),
        position: OverviewRulerLane.Center
      },
      collapseOnReplaceEdit: true,
      linesDecorationsClassName: `comment-range-glyph comment-thread${unresolved ? "-unresolved" : ""}`
    };
    return ModelDecorationOptions.createDynamic(decorationOptions);
  }
  setThreadState(state) {
    if (this._threadState !== state) {
      this._threadState = state;
      this._commentsOptions = this.createDecorationOptions();
      this._updateDecorations();
    }
  }
  _updateDecorations() {
    const commentsDecorations = [
      {
        range: {
          startLineNumber: this._lineNumber,
          startColumn: 1,
          endLineNumber: this._lineNumber,
          endColumn: 1
        },
        options: this._commentsOptions
      }
    ];
    this._commentsDecorations.set(commentsDecorations);
  }
  setLineNumber(lineNumber) {
    this._lineNumber = lineNumber;
    this._updateDecorations();
  }
  getPosition() {
    const range = this._commentsDecorations.length > 0 ? this._commentsDecorations.getRange(0) : null;
    return {
      position: {
        lineNumber: range ? range.endLineNumber : this._lineNumber,
        column: 1
      },
      preference: [ContentWidgetPositionPreference.EXACT]
    };
  }
}
export {
  CommentGlyphWidget,
  overviewRulerCommentingRangeForeground
};
