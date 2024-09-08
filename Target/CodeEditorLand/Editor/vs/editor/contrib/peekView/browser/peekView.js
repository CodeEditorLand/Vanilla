var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import * as dom from "../../../../base/browser/dom.js";
import {
  ActionBar,
  ActionsOrientation
} from "../../../../base/browser/ui/actionbar/actionbar.js";
import { Action } from "../../../../base/common/actions.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { Color } from "../../../../base/common/color.js";
import { Emitter } from "../../../../base/common/event.js";
import * as objects from "../../../../base/common/objects.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import "./media/peekViewWidget.css";
import * as nls from "../../../../nls.js";
import { createActionViewItem } from "../../../../platform/actions/browser/menuEntryActionViewItem.js";
import {
  IContextKeyService,
  RawContextKey
} from "../../../../platform/contextkey/common/contextkey.js";
import {
  InstantiationType,
  registerSingleton
} from "../../../../platform/instantiation/common/extensions.js";
import {
  IInstantiationService,
  createDecorator
} from "../../../../platform/instantiation/common/instantiation.js";
import {
  activeContrastBorder,
  contrastBorder,
  editorForeground,
  editorInfoForeground,
  registerColor
} from "../../../../platform/theme/common/colorRegistry.js";
import {
  EditorContributionInstantiation,
  registerEditorContribution
} from "../../../browser/editorExtensions.js";
import { ICodeEditorService } from "../../../browser/services/codeEditorService.js";
import { EmbeddedCodeEditorWidget } from "../../../browser/widget/codeEditor/embeddedCodeEditorWidget.js";
import { EditorOption } from "../../../common/config/editorOptions.js";
import {
  ZoneWidget
} from "../../zoneWidget/browser/zoneWidget.js";
const IPeekViewService = createDecorator("IPeekViewService");
registerSingleton(
  IPeekViewService,
  class {
    _widgets = /* @__PURE__ */ new Map();
    addExclusiveWidget(editor, widget) {
      const existing = this._widgets.get(editor);
      if (existing) {
        existing.listener.dispose();
        existing.widget.dispose();
      }
      const remove = () => {
        const data = this._widgets.get(editor);
        if (data && data.widget === widget) {
          data.listener.dispose();
          this._widgets.delete(editor);
        }
      };
      this._widgets.set(editor, {
        widget,
        listener: widget.onDidClose(remove)
      });
    }
  },
  InstantiationType.Delayed
);
var PeekContext;
((PeekContext2) => {
  PeekContext2.inPeekEditor = new RawContextKey(
    "inReferenceSearchEditor",
    true,
    nls.localize(
      "inReferenceSearchEditor",
      "Whether the current code editor is embedded inside peek"
    )
  );
  PeekContext2.notInPeekEditor = PeekContext2.inPeekEditor.toNegated();
})(PeekContext || (PeekContext = {}));
let PeekContextController = class {
  static ID = "editor.contrib.referenceController";
  constructor(editor, contextKeyService) {
    if (editor instanceof EmbeddedCodeEditorWidget) {
      PeekContext.inPeekEditor.bindTo(contextKeyService);
    }
  }
  dispose() {
  }
};
PeekContextController = __decorateClass([
  __decorateParam(1, IContextKeyService)
], PeekContextController);
registerEditorContribution(
  PeekContextController.ID,
  PeekContextController,
  EditorContributionInstantiation.Eager
);
function getOuterEditor(accessor) {
  const editor = accessor.get(ICodeEditorService).getFocusedCodeEditor();
  if (editor instanceof EmbeddedCodeEditorWidget) {
    return editor.getParentEditor();
  }
  return editor;
}
const defaultOptions = {
  headerBackgroundColor: Color.white,
  primaryHeadingColor: Color.fromHex("#333333"),
  secondaryHeadingColor: Color.fromHex("#6c6c6cb3")
};
let PeekViewWidget = class extends ZoneWidget {
  constructor(editor, options, instantiationService) {
    super(editor, options);
    this.instantiationService = instantiationService;
    objects.mixin(this.options, defaultOptions, false);
  }
  _onDidClose = new Emitter();
  onDidClose = this._onDidClose.event;
  disposed;
  _headElement;
  _titleElement;
  _primaryHeading;
  _secondaryHeading;
  _metaHeading;
  _actionbarWidget;
  _bodyElement;
  dispose() {
    if (!this.disposed) {
      this.disposed = true;
      super.dispose();
      this._onDidClose.fire(this);
    }
  }
  style(styles) {
    const options = this.options;
    if (styles.headerBackgroundColor) {
      options.headerBackgroundColor = styles.headerBackgroundColor;
    }
    if (styles.primaryHeadingColor) {
      options.primaryHeadingColor = styles.primaryHeadingColor;
    }
    if (styles.secondaryHeadingColor) {
      options.secondaryHeadingColor = styles.secondaryHeadingColor;
    }
    super.style(styles);
  }
  _applyStyles() {
    super._applyStyles();
    const options = this.options;
    if (this._headElement && options.headerBackgroundColor) {
      this._headElement.style.backgroundColor = options.headerBackgroundColor.toString();
    }
    if (this._primaryHeading && options.primaryHeadingColor) {
      this._primaryHeading.style.color = options.primaryHeadingColor.toString();
    }
    if (this._secondaryHeading && options.secondaryHeadingColor) {
      this._secondaryHeading.style.color = options.secondaryHeadingColor.toString();
    }
    if (this._bodyElement && options.frameColor) {
      this._bodyElement.style.borderColor = options.frameColor.toString();
    }
  }
  _fillContainer(container) {
    this.setCssClass("peekview-widget");
    this._headElement = dom.$(".head");
    this._bodyElement = dom.$(".body");
    this._fillHead(this._headElement);
    this._fillBody(this._bodyElement);
    container.appendChild(this._headElement);
    container.appendChild(this._bodyElement);
  }
  _fillHead(container, noCloseAction) {
    this._titleElement = dom.$(".peekview-title");
    if (this.options.supportOnTitleClick) {
      this._titleElement.classList.add("clickable");
      dom.addStandardDisposableListener(
        this._titleElement,
        "click",
        (event) => this._onTitleClick(event)
      );
    }
    dom.append(this._headElement, this._titleElement);
    this._fillTitleIcon(this._titleElement);
    this._primaryHeading = dom.$("span.filename");
    this._secondaryHeading = dom.$("span.dirname");
    this._metaHeading = dom.$("span.meta");
    dom.append(
      this._titleElement,
      this._primaryHeading,
      this._secondaryHeading,
      this._metaHeading
    );
    const actionsContainer = dom.$(".peekview-actions");
    dom.append(this._headElement, actionsContainer);
    const actionBarOptions = this._getActionBarOptions();
    this._actionbarWidget = new ActionBar(
      actionsContainer,
      actionBarOptions
    );
    this._disposables.add(this._actionbarWidget);
    if (!noCloseAction) {
      this._actionbarWidget.push(
        new Action(
          "peekview.close",
          nls.localize("label.close", "Close"),
          ThemeIcon.asClassName(Codicon.close),
          true,
          () => {
            this.dispose();
            return Promise.resolve();
          }
        ),
        { label: false, icon: true }
      );
    }
  }
  _fillTitleIcon(container) {
  }
  _getActionBarOptions() {
    return {
      actionViewItemProvider: createActionViewItem.bind(
        void 0,
        this.instantiationService
      ),
      orientation: ActionsOrientation.HORIZONTAL
    };
  }
  _onTitleClick(event) {
  }
  setTitle(primaryHeading, secondaryHeading) {
    if (this._primaryHeading && this._secondaryHeading) {
      this._primaryHeading.innerText = primaryHeading;
      this._primaryHeading.setAttribute("title", primaryHeading);
      if (secondaryHeading) {
        this._secondaryHeading.innerText = secondaryHeading;
      } else {
        dom.clearNode(this._secondaryHeading);
      }
    }
  }
  setMetaTitle(value) {
    if (this._metaHeading) {
      if (value) {
        this._metaHeading.innerText = value;
        dom.show(this._metaHeading);
      } else {
        dom.hide(this._metaHeading);
      }
    }
  }
  _doLayout(heightInPixel, widthInPixel) {
    if (!this._isShowing && heightInPixel < 0) {
      this.dispose();
      return;
    }
    const headHeight = Math.ceil(
      this.editor.getOption(EditorOption.lineHeight) * 1.2
    );
    const bodyHeight = Math.round(
      heightInPixel - (headHeight + 2)
    );
    this._doLayoutHead(headHeight, widthInPixel);
    this._doLayoutBody(bodyHeight, widthInPixel);
  }
  _doLayoutHead(heightInPixel, widthInPixel) {
    if (this._headElement) {
      this._headElement.style.height = `${heightInPixel}px`;
      this._headElement.style.lineHeight = this._headElement.style.height;
    }
  }
  _doLayoutBody(heightInPixel, widthInPixel) {
    if (this._bodyElement) {
      this._bodyElement.style.height = `${heightInPixel}px`;
    }
  }
};
PeekViewWidget = __decorateClass([
  __decorateParam(2, IInstantiationService)
], PeekViewWidget);
const peekViewTitleBackground = registerColor(
  "peekViewTitle.background",
  {
    dark: "#252526",
    light: "#F3F3F3",
    hcDark: Color.black,
    hcLight: Color.white
  },
  nls.localize(
    "peekViewTitleBackground",
    "Background color of the peek view title area."
  )
);
const peekViewTitleForeground = registerColor(
  "peekViewTitleLabel.foreground",
  {
    dark: Color.white,
    light: Color.black,
    hcDark: Color.white,
    hcLight: editorForeground
  },
  nls.localize("peekViewTitleForeground", "Color of the peek view title.")
);
const peekViewTitleInfoForeground = registerColor(
  "peekViewTitleDescription.foreground",
  {
    dark: "#ccccccb3",
    light: "#616161",
    hcDark: "#FFFFFF99",
    hcLight: "#292929"
  },
  nls.localize(
    "peekViewTitleInfoForeground",
    "Color of the peek view title info."
  )
);
const peekViewBorder = registerColor(
  "peekView.border",
  {
    dark: editorInfoForeground,
    light: editorInfoForeground,
    hcDark: contrastBorder,
    hcLight: contrastBorder
  },
  nls.localize("peekViewBorder", "Color of the peek view borders and arrow.")
);
const peekViewResultsBackground = registerColor(
  "peekViewResult.background",
  {
    dark: "#252526",
    light: "#F3F3F3",
    hcDark: Color.black,
    hcLight: Color.white
  },
  nls.localize(
    "peekViewResultsBackground",
    "Background color of the peek view result list."
  )
);
const peekViewResultsMatchForeground = registerColor(
  "peekViewResult.lineForeground",
  {
    dark: "#bbbbbb",
    light: "#646465",
    hcDark: Color.white,
    hcLight: editorForeground
  },
  nls.localize(
    "peekViewResultsMatchForeground",
    "Foreground color for line nodes in the peek view result list."
  )
);
const peekViewResultsFileForeground = registerColor(
  "peekViewResult.fileForeground",
  {
    dark: Color.white,
    light: "#1E1E1E",
    hcDark: Color.white,
    hcLight: editorForeground
  },
  nls.localize(
    "peekViewResultsFileForeground",
    "Foreground color for file nodes in the peek view result list."
  )
);
const peekViewResultsSelectionBackground = registerColor(
  "peekViewResult.selectionBackground",
  { dark: "#3399ff33", light: "#3399ff33", hcDark: null, hcLight: null },
  nls.localize(
    "peekViewResultsSelectionBackground",
    "Background color of the selected entry in the peek view result list."
  )
);
const peekViewResultsSelectionForeground = registerColor(
  "peekViewResult.selectionForeground",
  {
    dark: Color.white,
    light: "#6C6C6C",
    hcDark: Color.white,
    hcLight: editorForeground
  },
  nls.localize(
    "peekViewResultsSelectionForeground",
    "Foreground color of the selected entry in the peek view result list."
  )
);
const peekViewEditorBackground = registerColor(
  "peekViewEditor.background",
  {
    dark: "#001F33",
    light: "#F2F8FC",
    hcDark: Color.black,
    hcLight: Color.white
  },
  nls.localize(
    "peekViewEditorBackground",
    "Background color of the peek view editor."
  )
);
const peekViewEditorGutterBackground = registerColor(
  "peekViewEditorGutter.background",
  peekViewEditorBackground,
  nls.localize(
    "peekViewEditorGutterBackground",
    "Background color of the gutter in the peek view editor."
  )
);
const peekViewEditorStickyScrollBackground = registerColor(
  "peekViewEditorStickyScroll.background",
  peekViewEditorBackground,
  nls.localize(
    "peekViewEditorStickScrollBackground",
    "Background color of sticky scroll in the peek view editor."
  )
);
const peekViewResultsMatchHighlight = registerColor(
  "peekViewResult.matchHighlightBackground",
  { dark: "#ea5c004d", light: "#ea5c004d", hcDark: null, hcLight: null },
  nls.localize(
    "peekViewResultsMatchHighlight",
    "Match highlight color in the peek view result list."
  )
);
const peekViewEditorMatchHighlight = registerColor(
  "peekViewEditor.matchHighlightBackground",
  { dark: "#ff8f0099", light: "#f5d802de", hcDark: null, hcLight: null },
  nls.localize(
    "peekViewEditorMatchHighlight",
    "Match highlight color in the peek view editor."
  )
);
const peekViewEditorMatchHighlightBorder = registerColor(
  "peekViewEditor.matchHighlightBorder",
  {
    dark: null,
    light: null,
    hcDark: activeContrastBorder,
    hcLight: activeContrastBorder
  },
  nls.localize(
    "peekViewEditorMatchHighlightBorder",
    "Match highlight border in the peek view editor."
  )
);
export {
  IPeekViewService,
  PeekContext,
  PeekViewWidget,
  getOuterEditor,
  peekViewBorder,
  peekViewEditorBackground,
  peekViewEditorGutterBackground,
  peekViewEditorMatchHighlight,
  peekViewEditorMatchHighlightBorder,
  peekViewEditorStickyScrollBackground,
  peekViewResultsBackground,
  peekViewResultsFileForeground,
  peekViewResultsMatchForeground,
  peekViewResultsMatchHighlight,
  peekViewResultsSelectionBackground,
  peekViewResultsSelectionForeground,
  peekViewTitleBackground,
  peekViewTitleForeground,
  peekViewTitleInfoForeground
};
