import "./media/style.css";
import { isSafari, isStandalone } from "../../base/browser/browser.js";
import { createMetaElement } from "../../base/browser/dom.js";
import { mainWindow } from "../../base/browser/window.js";
import { isIOS, isWeb } from "../../base/common/platform.js";
import { selectionBackground } from "../../platform/theme/common/colorRegistry.js";
import { registerThemingParticipant } from "../../platform/theme/common/themeService.js";
import {
  TITLE_BAR_ACTIVE_BACKGROUND,
  WORKBENCH_BACKGROUND
} from "../common/theme.js";
registerThemingParticipant((theme, collector) => {
  const workbenchBackground = WORKBENCH_BACKGROUND(theme);
  collector.addRule(
    `.monaco-workbench { background-color: ${workbenchBackground}; }`
  );
  const windowSelectionBackground = theme.getColor(selectionBackground);
  if (windowSelectionBackground) {
    collector.addRule(
      `.monaco-workbench ::selection { background-color: ${windowSelectionBackground}; }`
    );
  }
  if (isWeb) {
    const titleBackground = theme.getColor(TITLE_BAR_ACTIVE_BACKGROUND);
    if (titleBackground) {
      const metaElementId = "monaco-workbench-meta-theme-color";
      let metaElement = mainWindow.document.getElementById(
        metaElementId
      );
      if (!metaElement) {
        metaElement = createMetaElement();
        metaElement.name = "theme-color";
        metaElement.id = metaElementId;
      }
      metaElement.content = titleBackground.toString();
    }
  }
  if (isSafari) {
    collector.addRule(`
			body.web {
				touch-action: none;
			}
			.monaco-workbench .monaco-editor .view-lines {
				user-select: text;
				-webkit-user-select: text;
			}
		`);
  }
  if (isIOS && isStandalone()) {
    collector.addRule(`body { background-color: ${workbenchBackground}; }`);
  }
});
//# sourceMappingURL=style.js.map
