var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { PixelRatio } from "../../../../base/browser/pixelRatio.js";
import { CodeWindow } from "../../../../base/browser/window.js";
import { Emitter } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { isObject } from "../../../../base/common/types.js";
import { URI } from "../../../../base/common/uri.js";
import { FontMeasurements } from "../../../../editor/browser/config/fontMeasurements.js";
import { ICodeEditorService } from "../../../../editor/browser/services/codeEditorService.js";
import { IEditorOptions } from "../../../../editor/common/config/editorOptions.js";
import { BareFontInfo } from "../../../../editor/common/config/fontInfo.js";
import { ConfigurationTarget, IConfigurationChangeEvent, IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { InteractiveWindowCollapseCodeCells, NotebookCellDefaultCollapseConfig, NotebookCellInternalMetadata, NotebookSetting, ShowCellStatusBarType } from "../common/notebookCommon.js";
import { INotebookExecutionStateService } from "../common/notebookExecutionStateService.js";
const SCROLLABLE_ELEMENT_PADDING_TOP = 18;
const OutputInnerContainerTopPadding = 4;
const defaultConfigConstants = Object.freeze({
  codeCellLeftMargin: 28,
  cellRunGutter: 32,
  markdownCellTopMargin: 8,
  markdownCellBottomMargin: 8,
  markdownCellLeftMargin: 0,
  markdownCellGutter: 32,
  focusIndicatorLeftMargin: 4
});
const compactConfigConstants = Object.freeze({
  codeCellLeftMargin: 8,
  cellRunGutter: 36,
  markdownCellTopMargin: 6,
  markdownCellBottomMargin: 6,
  markdownCellLeftMargin: 8,
  markdownCellGutter: 36,
  focusIndicatorLeftMargin: 4
});
let NotebookOptions = class extends Disposable {
  constructor(targetWindow, isReadonly, overrides, configurationService, notebookExecutionStateService, codeEditorService) {
    super();
    this.targetWindow = targetWindow;
    this.isReadonly = isReadonly;
    this.overrides = overrides;
    this.configurationService = configurationService;
    this.notebookExecutionStateService = notebookExecutionStateService;
    this.codeEditorService = codeEditorService;
    const showCellStatusBar = this.configurationService.getValue(NotebookSetting.showCellStatusBar);
    const globalToolbar = overrides?.globalToolbar ?? this.configurationService.getValue(NotebookSetting.globalToolbar) ?? true;
    const stickyScrollEnabled = overrides?.stickyScrollEnabled ?? this.configurationService.getValue(NotebookSetting.stickyScrollEnabled) ?? false;
    const stickyScrollMode = this._computeStickyScrollModeOption();
    const consolidatedOutputButton = this.configurationService.getValue(NotebookSetting.consolidatedOutputButton) ?? true;
    const consolidatedRunButton = this.configurationService.getValue(NotebookSetting.consolidatedRunButton) ?? false;
    const dragAndDropEnabled = overrides?.dragAndDropEnabled ?? this.configurationService.getValue(NotebookSetting.dragAndDropEnabled) ?? true;
    const cellToolbarLocation = this.configurationService.getValue(NotebookSetting.cellToolbarLocation) ?? { "default": "right" };
    const cellToolbarInteraction = overrides?.cellToolbarInteraction ?? this.configurationService.getValue(NotebookSetting.cellToolbarVisibility);
    const compactView = this.configurationService.getValue(NotebookSetting.compactView) ?? true;
    const focusIndicator = this._computeFocusIndicatorOption();
    const insertToolbarPosition = this._computeInsertToolbarPositionOption(this.isReadonly);
    const insertToolbarAlignment = this._computeInsertToolbarAlignmentOption();
    const showFoldingControls = this._computeShowFoldingControlsOption();
    const fontSize = this.configurationService.getValue("editor.fontSize");
    const markupFontSize = this.configurationService.getValue(NotebookSetting.markupFontSize);
    const markdownLineHeight = this.configurationService.getValue(NotebookSetting.markdownLineHeight);
    let editorOptionsCustomizations = this.configurationService.getValue(NotebookSetting.cellEditorOptionsCustomizations) ?? {};
    editorOptionsCustomizations = isObject(editorOptionsCustomizations) ? editorOptionsCustomizations : {};
    const interactiveWindowCollapseCodeCells = this.configurationService.getValue(NotebookSetting.interactiveWindowCollapseCodeCells);
    let outputLineHeightSettingValue;
    const deprecatedOutputLineHeightSetting = this.configurationService.getValue(NotebookSetting.outputLineHeightDeprecated);
    if (deprecatedOutputLineHeightSetting !== void 0) {
      this._migrateDeprecatedSetting(NotebookSetting.outputLineHeightDeprecated, NotebookSetting.outputLineHeight);
      outputLineHeightSettingValue = deprecatedOutputLineHeightSetting;
    } else {
      outputLineHeightSettingValue = this.configurationService.getValue(NotebookSetting.outputLineHeight);
    }
    let outputFontSize;
    const deprecatedOutputFontSizeSetting = this.configurationService.getValue(NotebookSetting.outputFontSizeDeprecated);
    if (deprecatedOutputFontSizeSetting !== void 0) {
      this._migrateDeprecatedSetting(NotebookSetting.outputFontSizeDeprecated, NotebookSetting.outputFontSize);
      outputFontSize = deprecatedOutputFontSizeSetting;
    } else {
      outputFontSize = this.configurationService.getValue(NotebookSetting.outputFontSize) || fontSize;
    }
    let outputFontFamily;
    const deprecatedOutputFontFamilySetting = this.configurationService.getValue(NotebookSetting.outputFontFamilyDeprecated);
    if (deprecatedOutputFontFamilySetting !== void 0) {
      this._migrateDeprecatedSetting(NotebookSetting.outputFontFamilyDeprecated, NotebookSetting.outputFontFamily);
      outputFontFamily = deprecatedOutputFontFamilySetting;
    } else {
      outputFontFamily = this.configurationService.getValue(NotebookSetting.outputFontFamily);
    }
    let outputScrolling;
    const deprecatedOutputScrollingSetting = this.configurationService.getValue(NotebookSetting.outputScrollingDeprecated);
    if (deprecatedOutputScrollingSetting !== void 0) {
      this._migrateDeprecatedSetting(NotebookSetting.outputScrollingDeprecated, NotebookSetting.outputScrolling);
      outputScrolling = deprecatedOutputScrollingSetting;
    } else {
      outputScrolling = this.configurationService.getValue(NotebookSetting.outputScrolling);
    }
    const outputLineHeight = this._computeOutputLineHeight(outputLineHeightSettingValue, outputFontSize);
    const outputWordWrap = this.configurationService.getValue(NotebookSetting.outputWordWrap);
    const outputLineLimit = this.configurationService.getValue(NotebookSetting.textOutputLineLimit) ?? 30;
    const linkifyFilePaths = this.configurationService.getValue(NotebookSetting.LinkifyOutputFilePaths) ?? true;
    const minimalErrors = this.configurationService.getValue(NotebookSetting.minimalErrorRendering);
    const editorTopPadding = this._computeEditorTopPadding();
    this._layoutConfiguration = {
      ...compactView ? compactConfigConstants : defaultConfigConstants,
      cellTopMargin: 6,
      cellBottomMargin: 6,
      cellRightMargin: 16,
      cellStatusBarHeight: 22,
      cellOutputPadding: 8,
      markdownPreviewPadding: 8,
      // bottomToolbarHeight: bottomToolbarHeight,
      // bottomToolbarGap: bottomToolbarGap,
      editorToolbarHeight: 0,
      editorTopPadding,
      editorBottomPadding: 4,
      editorBottomPaddingWithoutStatusBar: 12,
      collapsedIndicatorHeight: 28,
      showCellStatusBar,
      globalToolbar,
      stickyScrollEnabled,
      stickyScrollMode,
      consolidatedOutputButton,
      consolidatedRunButton,
      dragAndDropEnabled,
      cellToolbarLocation,
      cellToolbarInteraction,
      compactView,
      focusIndicator,
      insertToolbarPosition,
      insertToolbarAlignment,
      showFoldingControls,
      fontSize,
      outputFontSize,
      outputFontFamily,
      outputLineHeight,
      markupFontSize,
      markdownLineHeight,
      editorOptionsCustomizations,
      focusIndicatorGap: 3,
      interactiveWindowCollapseCodeCells,
      markdownFoldHintHeight: 22,
      outputScrolling,
      outputWordWrap,
      outputLineLimit,
      outputLinkifyFilePaths: linkifyFilePaths,
      outputMinimalError: minimalErrors
    };
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      this._updateConfiguration(e);
    }));
  }
  static {
    __name(this, "NotebookOptions");
  }
  _layoutConfiguration;
  _onDidChangeOptions = this._register(new Emitter());
  onDidChangeOptions = this._onDidChangeOptions.event;
  _editorTopPadding = 12;
  updateOptions(isReadonly) {
    if (this.isReadonly !== isReadonly) {
      this.isReadonly = isReadonly;
      this._updateConfiguration({
        affectsConfiguration(configuration) {
          return configuration === NotebookSetting.insertToolbarLocation;
        },
        source: ConfigurationTarget.DEFAULT,
        affectedKeys: /* @__PURE__ */ new Set([NotebookSetting.insertToolbarLocation]),
        change: { keys: [NotebookSetting.insertToolbarLocation], overrides: [] }
      });
    }
  }
  _computeEditorTopPadding() {
    let decorationTriggeredAdjustment = false;
    const updateEditorTopPadding = /* @__PURE__ */ __name((top) => {
      this._editorTopPadding = top;
      const configuration = Object.assign({}, this._layoutConfiguration);
      configuration.editorTopPadding = this._editorTopPadding;
      this._layoutConfiguration = configuration;
      this._onDidChangeOptions.fire({ editorTopPadding: true });
    }, "updateEditorTopPadding");
    const decorationCheckSet = /* @__PURE__ */ new Set();
    const onDidAddDecorationType = /* @__PURE__ */ __name((e) => {
      if (decorationTriggeredAdjustment) {
        return;
      }
      if (decorationCheckSet.has(e)) {
        return;
      }
      try {
        const options = this.codeEditorService.resolveDecorationOptions(e, true);
        if (options.afterContentClassName || options.beforeContentClassName) {
          const cssRules = this.codeEditorService.resolveDecorationCSSRules(e);
          if (cssRules !== null) {
            for (let i = 0; i < cssRules.length; i++) {
              if ((cssRules[i].selectorText.endsWith("::after") || cssRules[i].selectorText.endsWith("::after")) && cssRules[i].cssText.indexOf("top:") > -1) {
                const editorOptions = this.configurationService.getValue("editor");
                updateEditorTopPadding(BareFontInfo.createFromRawSettings(editorOptions, PixelRatio.getInstance(this.targetWindow).value).lineHeight + 2);
                decorationTriggeredAdjustment = true;
                break;
              }
            }
          }
        }
        decorationCheckSet.add(e);
      } catch (_ex) {
      }
    }, "onDidAddDecorationType");
    this._register(this.codeEditorService.onDecorationTypeRegistered(onDidAddDecorationType));
    this.codeEditorService.listDecorationTypes().forEach(onDidAddDecorationType);
    return this._editorTopPadding;
  }
  _migrateDeprecatedSetting(deprecatedKey, key) {
    const deprecatedSetting = this.configurationService.inspect(deprecatedKey);
    if (deprecatedSetting.application !== void 0) {
      this.configurationService.updateValue(deprecatedKey, void 0, ConfigurationTarget.APPLICATION);
      this.configurationService.updateValue(key, deprecatedSetting.application.value, ConfigurationTarget.APPLICATION);
    }
    if (deprecatedSetting.user !== void 0) {
      this.configurationService.updateValue(deprecatedKey, void 0, ConfigurationTarget.USER);
      this.configurationService.updateValue(key, deprecatedSetting.user.value, ConfigurationTarget.USER);
    }
    if (deprecatedSetting.userLocal !== void 0) {
      this.configurationService.updateValue(deprecatedKey, void 0, ConfigurationTarget.USER_LOCAL);
      this.configurationService.updateValue(key, deprecatedSetting.userLocal.value, ConfigurationTarget.USER_LOCAL);
    }
    if (deprecatedSetting.userRemote !== void 0) {
      this.configurationService.updateValue(deprecatedKey, void 0, ConfigurationTarget.USER_REMOTE);
      this.configurationService.updateValue(key, deprecatedSetting.userRemote.value, ConfigurationTarget.USER_REMOTE);
    }
    if (deprecatedSetting.workspace !== void 0) {
      this.configurationService.updateValue(deprecatedKey, void 0, ConfigurationTarget.WORKSPACE);
      this.configurationService.updateValue(key, deprecatedSetting.workspace.value, ConfigurationTarget.WORKSPACE);
    }
    if (deprecatedSetting.workspaceFolder !== void 0) {
      this.configurationService.updateValue(deprecatedKey, void 0, ConfigurationTarget.WORKSPACE_FOLDER);
      this.configurationService.updateValue(key, deprecatedSetting.workspaceFolder.value, ConfigurationTarget.WORKSPACE_FOLDER);
    }
  }
  _computeOutputLineHeight(lineHeight, outputFontSize) {
    const minimumLineHeight = 9;
    if (lineHeight === 0) {
      const editorOptions = this.configurationService.getValue("editor");
      const fontInfo = FontMeasurements.readFontInfo(this.targetWindow, BareFontInfo.createFromRawSettings(editorOptions, PixelRatio.getInstance(this.targetWindow).value));
      lineHeight = fontInfo.lineHeight;
    } else if (lineHeight < minimumLineHeight) {
      let fontSize = outputFontSize;
      if (fontSize === 0) {
        fontSize = this.configurationService.getValue("editor.fontSize");
      }
      lineHeight = lineHeight * fontSize;
    }
    lineHeight = Math.round(lineHeight);
    if (lineHeight < minimumLineHeight) {
      lineHeight = minimumLineHeight;
    }
    return lineHeight;
  }
  _updateConfiguration(e) {
    const cellStatusBarVisibility = e.affectsConfiguration(NotebookSetting.showCellStatusBar);
    const cellToolbarLocation = e.affectsConfiguration(NotebookSetting.cellToolbarLocation);
    const cellToolbarInteraction = e.affectsConfiguration(NotebookSetting.cellToolbarVisibility);
    const compactView = e.affectsConfiguration(NotebookSetting.compactView);
    const focusIndicator = e.affectsConfiguration(NotebookSetting.focusIndicator);
    const insertToolbarPosition = e.affectsConfiguration(NotebookSetting.insertToolbarLocation);
    const insertToolbarAlignment = e.affectsConfiguration(NotebookSetting.experimentalInsertToolbarAlignment);
    const globalToolbar = e.affectsConfiguration(NotebookSetting.globalToolbar);
    const stickyScrollEnabled = e.affectsConfiguration(NotebookSetting.stickyScrollEnabled);
    const stickyScrollMode = e.affectsConfiguration(NotebookSetting.stickyScrollMode);
    const consolidatedOutputButton = e.affectsConfiguration(NotebookSetting.consolidatedOutputButton);
    const consolidatedRunButton = e.affectsConfiguration(NotebookSetting.consolidatedRunButton);
    const showFoldingControls = e.affectsConfiguration(NotebookSetting.showFoldingControls);
    const dragAndDropEnabled = e.affectsConfiguration(NotebookSetting.dragAndDropEnabled);
    const fontSize = e.affectsConfiguration("editor.fontSize");
    const outputFontSize = e.affectsConfiguration(NotebookSetting.outputFontSize);
    const markupFontSize = e.affectsConfiguration(NotebookSetting.markupFontSize);
    const markdownLineHeight = e.affectsConfiguration(NotebookSetting.markdownLineHeight);
    const fontFamily = e.affectsConfiguration("editor.fontFamily");
    const outputFontFamily = e.affectsConfiguration(NotebookSetting.outputFontFamily);
    const editorOptionsCustomizations = e.affectsConfiguration(NotebookSetting.cellEditorOptionsCustomizations);
    const interactiveWindowCollapseCodeCells = e.affectsConfiguration(NotebookSetting.interactiveWindowCollapseCodeCells);
    const outputLineHeight = e.affectsConfiguration(NotebookSetting.outputLineHeight);
    const outputScrolling = e.affectsConfiguration(NotebookSetting.outputScrolling);
    const outputWordWrap = e.affectsConfiguration(NotebookSetting.outputWordWrap);
    const outputLinkifyFilePaths = e.affectsConfiguration(NotebookSetting.LinkifyOutputFilePaths);
    const minimalError = e.affectsConfiguration(NotebookSetting.minimalErrorRendering);
    if (!cellStatusBarVisibility && !cellToolbarLocation && !cellToolbarInteraction && !compactView && !focusIndicator && !insertToolbarPosition && !insertToolbarAlignment && !globalToolbar && !stickyScrollEnabled && !stickyScrollMode && !consolidatedOutputButton && !consolidatedRunButton && !showFoldingControls && !dragAndDropEnabled && !fontSize && !outputFontSize && !markupFontSize && !markdownLineHeight && !fontFamily && !outputFontFamily && !editorOptionsCustomizations && !interactiveWindowCollapseCodeCells && !outputLineHeight && !outputScrolling && !outputWordWrap && !outputLinkifyFilePaths && !minimalError) {
      return;
    }
    let configuration = Object.assign({}, this._layoutConfiguration);
    if (cellStatusBarVisibility) {
      configuration.showCellStatusBar = this.configurationService.getValue(NotebookSetting.showCellStatusBar);
    }
    if (cellToolbarLocation) {
      configuration.cellToolbarLocation = this.configurationService.getValue(NotebookSetting.cellToolbarLocation) ?? { "default": "right" };
    }
    if (cellToolbarInteraction && !this.overrides?.cellToolbarInteraction) {
      configuration.cellToolbarInteraction = this.configurationService.getValue(NotebookSetting.cellToolbarVisibility);
    }
    if (focusIndicator) {
      configuration.focusIndicator = this._computeFocusIndicatorOption();
    }
    if (compactView) {
      const compactViewValue = this.configurationService.getValue(NotebookSetting.compactView) ?? true;
      configuration = Object.assign(configuration, {
        ...compactViewValue ? compactConfigConstants : defaultConfigConstants
      });
      configuration.compactView = compactViewValue;
    }
    if (insertToolbarAlignment) {
      configuration.insertToolbarAlignment = this._computeInsertToolbarAlignmentOption();
    }
    if (insertToolbarPosition) {
      configuration.insertToolbarPosition = this._computeInsertToolbarPositionOption(this.isReadonly);
    }
    if (globalToolbar && this.overrides?.globalToolbar === void 0) {
      configuration.globalToolbar = this.configurationService.getValue(NotebookSetting.globalToolbar) ?? true;
    }
    if (stickyScrollEnabled && this.overrides?.stickyScrollEnabled === void 0) {
      configuration.stickyScrollEnabled = this.configurationService.getValue(NotebookSetting.stickyScrollEnabled) ?? false;
    }
    if (stickyScrollMode) {
      configuration.stickyScrollMode = this.configurationService.getValue(NotebookSetting.stickyScrollMode) ?? "flat";
    }
    if (consolidatedOutputButton) {
      configuration.consolidatedOutputButton = this.configurationService.getValue(NotebookSetting.consolidatedOutputButton) ?? true;
    }
    if (consolidatedRunButton) {
      configuration.consolidatedRunButton = this.configurationService.getValue(NotebookSetting.consolidatedRunButton) ?? true;
    }
    if (showFoldingControls) {
      configuration.showFoldingControls = this._computeShowFoldingControlsOption();
    }
    if (dragAndDropEnabled) {
      configuration.dragAndDropEnabled = this.configurationService.getValue(NotebookSetting.dragAndDropEnabled) ?? true;
    }
    if (fontSize) {
      configuration.fontSize = this.configurationService.getValue("editor.fontSize");
    }
    if (outputFontSize || fontSize) {
      configuration.outputFontSize = this.configurationService.getValue(NotebookSetting.outputFontSize) || configuration.fontSize;
    }
    if (markupFontSize) {
      configuration.markupFontSize = this.configurationService.getValue(NotebookSetting.markupFontSize);
    }
    if (markdownLineHeight) {
      configuration.markdownLineHeight = this.configurationService.getValue(NotebookSetting.markdownLineHeight);
    }
    if (outputFontFamily) {
      configuration.outputFontFamily = this.configurationService.getValue(NotebookSetting.outputFontFamily);
    }
    if (editorOptionsCustomizations) {
      configuration.editorOptionsCustomizations = this.configurationService.getValue(NotebookSetting.cellEditorOptionsCustomizations);
    }
    if (interactiveWindowCollapseCodeCells) {
      configuration.interactiveWindowCollapseCodeCells = this.configurationService.getValue(NotebookSetting.interactiveWindowCollapseCodeCells);
    }
    if (outputLineHeight || fontSize || outputFontSize) {
      const lineHeight = this.configurationService.getValue(NotebookSetting.outputLineHeight);
      configuration.outputLineHeight = this._computeOutputLineHeight(lineHeight, configuration.outputFontSize);
    }
    if (outputWordWrap) {
      configuration.outputWordWrap = this.configurationService.getValue(NotebookSetting.outputWordWrap);
    }
    if (outputScrolling) {
      configuration.outputScrolling = this.configurationService.getValue(NotebookSetting.outputScrolling);
    }
    if (outputLinkifyFilePaths) {
      configuration.outputLinkifyFilePaths = this.configurationService.getValue(NotebookSetting.LinkifyOutputFilePaths);
    }
    if (minimalError) {
      configuration.outputMinimalError = this.configurationService.getValue(NotebookSetting.minimalErrorRendering);
    }
    this._layoutConfiguration = Object.freeze(configuration);
    this._onDidChangeOptions.fire({
      cellStatusBarVisibility,
      cellToolbarLocation,
      cellToolbarInteraction,
      compactView,
      focusIndicator,
      insertToolbarPosition,
      insertToolbarAlignment,
      globalToolbar,
      stickyScrollEnabled,
      stickyScrollMode,
      showFoldingControls,
      consolidatedOutputButton,
      consolidatedRunButton,
      dragAndDropEnabled,
      fontSize,
      outputFontSize,
      markupFontSize,
      markdownLineHeight,
      fontFamily,
      outputFontFamily,
      editorOptionsCustomizations,
      interactiveWindowCollapseCodeCells,
      outputLineHeight,
      outputScrolling,
      outputWordWrap,
      outputLinkifyFilePaths,
      minimalError
    });
  }
  _computeInsertToolbarPositionOption(isReadOnly) {
    return isReadOnly ? "hidden" : this.configurationService.getValue(NotebookSetting.insertToolbarLocation) ?? "both";
  }
  _computeInsertToolbarAlignmentOption() {
    return this.configurationService.getValue(NotebookSetting.experimentalInsertToolbarAlignment) ?? "center";
  }
  _computeShowFoldingControlsOption() {
    return this.configurationService.getValue(NotebookSetting.showFoldingControls) ?? "mouseover";
  }
  _computeFocusIndicatorOption() {
    return this.configurationService.getValue(NotebookSetting.focusIndicator) ?? "gutter";
  }
  _computeStickyScrollModeOption() {
    return this.configurationService.getValue(NotebookSetting.stickyScrollMode) ?? "flat";
  }
  getCellCollapseDefault() {
    return this._layoutConfiguration.interactiveWindowCollapseCodeCells === "never" ? {
      codeCell: {
        inputCollapsed: false
      }
    } : {
      codeCell: {
        inputCollapsed: true
      }
    };
  }
  getLayoutConfiguration() {
    return this._layoutConfiguration;
  }
  getDisplayOptions() {
    return this._layoutConfiguration;
  }
  getCellEditorContainerLeftMargin() {
    const {
      codeCellLeftMargin,
      cellRunGutter
    } = this._layoutConfiguration;
    return codeCellLeftMargin + cellRunGutter;
  }
  computeCollapsedMarkdownCellHeight(viewType) {
    const { bottomToolbarGap } = this.computeBottomToolbarDimensions(viewType);
    return this._layoutConfiguration.markdownCellTopMargin + this._layoutConfiguration.collapsedIndicatorHeight + bottomToolbarGap + this._layoutConfiguration.markdownCellBottomMargin;
  }
  computeBottomToolbarOffset(totalHeight, viewType) {
    const { bottomToolbarGap, bottomToolbarHeight } = this.computeBottomToolbarDimensions(viewType);
    return totalHeight - bottomToolbarGap - bottomToolbarHeight / 2;
  }
  computeCodeCellEditorWidth(outerWidth) {
    return outerWidth - (this._layoutConfiguration.codeCellLeftMargin + this._layoutConfiguration.cellRunGutter + this._layoutConfiguration.cellRightMargin);
  }
  computeMarkdownCellEditorWidth(outerWidth) {
    return outerWidth - this._layoutConfiguration.markdownCellGutter - this._layoutConfiguration.markdownCellLeftMargin - this._layoutConfiguration.cellRightMargin;
  }
  computeStatusBarHeight() {
    return this._layoutConfiguration.cellStatusBarHeight;
  }
  _computeBottomToolbarDimensions(compactView, insertToolbarPosition, insertToolbarAlignment, cellToolbar) {
    if (insertToolbarAlignment === "left" || cellToolbar !== "hidden") {
      return {
        bottomToolbarGap: 18,
        bottomToolbarHeight: 18
      };
    }
    if (insertToolbarPosition === "betweenCells" || insertToolbarPosition === "both") {
      return compactView ? {
        bottomToolbarGap: 12,
        bottomToolbarHeight: 20
      } : {
        bottomToolbarGap: 20,
        bottomToolbarHeight: 20
      };
    } else {
      return {
        bottomToolbarGap: 0,
        bottomToolbarHeight: 0
      };
    }
  }
  computeBottomToolbarDimensions(viewType) {
    const configuration = this._layoutConfiguration;
    const cellToolbarPosition = this.computeCellToolbarLocation(viewType);
    const { bottomToolbarGap, bottomToolbarHeight } = this._computeBottomToolbarDimensions(configuration.compactView, configuration.insertToolbarPosition, configuration.insertToolbarAlignment, cellToolbarPosition);
    return {
      bottomToolbarGap,
      bottomToolbarHeight
    };
  }
  computeCellToolbarLocation(viewType) {
    const cellToolbarLocation = this._layoutConfiguration.cellToolbarLocation;
    if (typeof cellToolbarLocation === "string") {
      if (cellToolbarLocation === "left" || cellToolbarLocation === "right" || cellToolbarLocation === "hidden") {
        return cellToolbarLocation;
      }
    } else {
      if (viewType) {
        const notebookSpecificSetting = cellToolbarLocation[viewType] ?? cellToolbarLocation["default"];
        let cellToolbarLocationForCurrentView = "right";
        switch (notebookSpecificSetting) {
          case "left":
            cellToolbarLocationForCurrentView = "left";
            break;
          case "right":
            cellToolbarLocationForCurrentView = "right";
            break;
          case "hidden":
            cellToolbarLocationForCurrentView = "hidden";
            break;
          default:
            cellToolbarLocationForCurrentView = "right";
            break;
        }
        return cellToolbarLocationForCurrentView;
      }
    }
    return "right";
  }
  computeTopInsertToolbarHeight(viewType) {
    if (this._layoutConfiguration.insertToolbarPosition === "betweenCells" || this._layoutConfiguration.insertToolbarPosition === "both") {
      return SCROLLABLE_ELEMENT_PADDING_TOP;
    }
    const cellToolbarLocation = this.computeCellToolbarLocation(viewType);
    if (cellToolbarLocation === "left" || cellToolbarLocation === "right") {
      return SCROLLABLE_ELEMENT_PADDING_TOP;
    }
    return 0;
  }
  computeEditorPadding(internalMetadata, cellUri) {
    return {
      top: this._editorTopPadding,
      bottom: this.statusBarIsVisible(internalMetadata, cellUri) ? this._layoutConfiguration.editorBottomPadding : this._layoutConfiguration.editorBottomPaddingWithoutStatusBar
    };
  }
  computeEditorStatusbarHeight(internalMetadata, cellUri) {
    return this.statusBarIsVisible(internalMetadata, cellUri) ? this.computeStatusBarHeight() : 0;
  }
  statusBarIsVisible(internalMetadata, cellUri) {
    const exe = this.notebookExecutionStateService.getCellExecution(cellUri);
    if (this._layoutConfiguration.showCellStatusBar === "visible") {
      return true;
    } else if (this._layoutConfiguration.showCellStatusBar === "visibleAfterExecute") {
      return typeof internalMetadata.lastRunSuccess === "boolean" || exe !== void 0;
    } else {
      return false;
    }
  }
  computeWebviewOptions() {
    return {
      outputNodePadding: this._layoutConfiguration.cellOutputPadding,
      outputNodeLeftPadding: this._layoutConfiguration.cellOutputPadding,
      previewNodePadding: this._layoutConfiguration.markdownPreviewPadding,
      markdownLeftMargin: this._layoutConfiguration.markdownCellGutter + this._layoutConfiguration.markdownCellLeftMargin,
      leftMargin: this._layoutConfiguration.codeCellLeftMargin,
      rightMargin: this._layoutConfiguration.cellRightMargin,
      runGutter: this._layoutConfiguration.cellRunGutter,
      dragAndDropEnabled: this._layoutConfiguration.dragAndDropEnabled,
      fontSize: this._layoutConfiguration.fontSize,
      outputFontSize: this._layoutConfiguration.outputFontSize,
      outputFontFamily: this._layoutConfiguration.outputFontFamily,
      markupFontSize: this._layoutConfiguration.markupFontSize,
      markdownLineHeight: this._layoutConfiguration.markdownLineHeight,
      outputLineHeight: this._layoutConfiguration.outputLineHeight,
      outputScrolling: this._layoutConfiguration.outputScrolling,
      outputWordWrap: this._layoutConfiguration.outputWordWrap,
      outputLineLimit: this._layoutConfiguration.outputLineLimit,
      outputLinkifyFilePaths: this._layoutConfiguration.outputLinkifyFilePaths,
      minimalError: this._layoutConfiguration.outputMinimalError
    };
  }
  computeDiffWebviewOptions() {
    return {
      outputNodePadding: this._layoutConfiguration.cellOutputPadding,
      outputNodeLeftPadding: 0,
      previewNodePadding: this._layoutConfiguration.markdownPreviewPadding,
      markdownLeftMargin: 0,
      leftMargin: 32,
      rightMargin: 0,
      runGutter: 0,
      dragAndDropEnabled: false,
      fontSize: this._layoutConfiguration.fontSize,
      outputFontSize: this._layoutConfiguration.outputFontSize,
      outputFontFamily: this._layoutConfiguration.outputFontFamily,
      markupFontSize: this._layoutConfiguration.markupFontSize,
      markdownLineHeight: this._layoutConfiguration.markdownLineHeight,
      outputLineHeight: this._layoutConfiguration.outputLineHeight,
      outputScrolling: this._layoutConfiguration.outputScrolling,
      outputWordWrap: this._layoutConfiguration.outputWordWrap,
      outputLineLimit: this._layoutConfiguration.outputLineLimit,
      outputLinkifyFilePaths: false,
      minimalError: false
    };
  }
  computeIndicatorPosition(totalHeight, foldHintHeight, viewType) {
    const { bottomToolbarGap } = this.computeBottomToolbarDimensions(viewType);
    return {
      bottomIndicatorTop: totalHeight - bottomToolbarGap - this._layoutConfiguration.cellBottomMargin - foldHintHeight,
      verticalIndicatorHeight: totalHeight - bottomToolbarGap - foldHintHeight
    };
  }
};
NotebookOptions = __decorateClass([
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, INotebookExecutionStateService),
  __decorateParam(5, ICodeEditorService)
], NotebookOptions);
export {
  NotebookOptions,
  OutputInnerContainerTopPadding
};
//# sourceMappingURL=notebookOptions.js.map
