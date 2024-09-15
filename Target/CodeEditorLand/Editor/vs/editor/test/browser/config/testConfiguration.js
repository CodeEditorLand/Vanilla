var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { EditorConfiguration, IEnvConfiguration } from "../../../browser/config/editorConfiguration.js";
import { EditorFontLigatures, EditorFontVariations } from "../../../common/config/editorOptions.js";
import { BareFontInfo, FontInfo } from "../../../common/config/fontInfo.js";
import { TestCodeEditorCreationOptions } from "../testCodeEditor.js";
import { AccessibilitySupport } from "../../../../platform/accessibility/common/accessibility.js";
import { TestAccessibilityService } from "../../../../platform/accessibility/test/common/testAccessibilityService.js";
import { MenuId } from "../../../../platform/actions/common/actions.js";
class TestConfiguration extends EditorConfiguration {
  static {
    __name(this, "TestConfiguration");
  }
  constructor(opts) {
    super(false, MenuId.EditorContext, opts, null, new TestAccessibilityService());
  }
  _readEnvConfiguration() {
    const envConfig = this.getRawOptions().envConfig;
    return {
      extraEditorClassName: envConfig?.extraEditorClassName ?? "",
      outerWidth: envConfig?.outerWidth ?? 100,
      outerHeight: envConfig?.outerHeight ?? 100,
      emptySelectionClipboard: envConfig?.emptySelectionClipboard ?? true,
      pixelRatio: envConfig?.pixelRatio ?? 1,
      accessibilitySupport: envConfig?.accessibilitySupport ?? AccessibilitySupport.Unknown
    };
  }
  _readFontInfo(styling) {
    return new FontInfo({
      pixelRatio: 1,
      fontFamily: "mockFont",
      fontWeight: "normal",
      fontSize: 14,
      fontFeatureSettings: EditorFontLigatures.OFF,
      fontVariationSettings: EditorFontVariations.OFF,
      lineHeight: 19,
      letterSpacing: 1.5,
      isMonospace: true,
      typicalHalfwidthCharacterWidth: 10,
      typicalFullwidthCharacterWidth: 20,
      canUseHalfwidthRightwardsArrow: true,
      spaceWidth: 10,
      middotWidth: 10,
      wsmiddotWidth: 10,
      maxDigitWidth: 10
    }, true);
  }
}
export {
  TestConfiguration
};
//# sourceMappingURL=testConfiguration.js.map
