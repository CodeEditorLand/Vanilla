import { AccessibilitySupport } from "../../../../platform/accessibility/common/accessibility.js";
import { TestAccessibilityService } from "../../../../platform/accessibility/test/common/testAccessibilityService.js";
import { MenuId } from "../../../../platform/actions/common/actions.js";
import {
  EditorConfiguration
} from "../../../browser/config/editorConfiguration.js";
import {
  EditorFontLigatures,
  EditorFontVariations
} from "../../../common/config/editorOptions.js";
import {
  FontInfo
} from "../../../common/config/fontInfo.js";
class TestConfiguration extends EditorConfiguration {
  constructor(opts) {
    super(
      false,
      MenuId.EditorContext,
      opts,
      null,
      new TestAccessibilityService()
    );
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
    return new FontInfo(
      {
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
      },
      true
    );
  }
}
export {
  TestConfiguration
};
