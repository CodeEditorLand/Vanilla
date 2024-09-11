var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { localize, localize2 } from "../../../nls.js";
import product from "../../../platform/product/common/product.js";
import { isMacintosh, isLinux, language, isWeb } from "../../../base/common/platform.js";
import { ITelemetryService } from "../../../platform/telemetry/common/telemetry.js";
import { IOpenerService } from "../../../platform/opener/common/opener.js";
import { URI } from "../../../base/common/uri.js";
import { MenuId, Action2, registerAction2 } from "../../../platform/actions/common/actions.js";
import { KeyChord, KeyMod, KeyCode } from "../../../base/common/keyCodes.js";
import { IProductService } from "../../../platform/product/common/productService.js";
import { ServicesAccessor } from "../../../platform/instantiation/common/instantiation.js";
import { KeybindingWeight } from "../../../platform/keybinding/common/keybindingsRegistry.js";
import { Categories } from "../../../platform/action/common/actionCommonCategories.js";
class KeybindingsReferenceAction extends Action2 {
  static {
    __name(this, "KeybindingsReferenceAction");
  }
  static ID = "workbench.action.keybindingsReference";
  static AVAILABLE = !!(isLinux ? product.keyboardShortcutsUrlLinux : isMacintosh ? product.keyboardShortcutsUrlMac : product.keyboardShortcutsUrlWin);
  constructor() {
    super({
      id: KeybindingsReferenceAction.ID,
      title: {
        ...localize2("keybindingsReference", "Keyboard Shortcuts Reference"),
        mnemonicTitle: localize({ key: "miKeyboardShortcuts", comment: ["&& denotes a mnemonic"] }, "&&Keyboard Shortcuts Reference")
      },
      category: Categories.Help,
      f1: true,
      keybinding: {
        weight: KeybindingWeight.WorkbenchContrib,
        when: null,
        primary: KeyChord(KeyMod.CtrlCmd | KeyCode.KeyK, KeyMod.CtrlCmd | KeyCode.KeyR)
      },
      menu: {
        id: MenuId.MenubarHelpMenu,
        group: "2_reference",
        order: 1
      }
    });
  }
  run(accessor) {
    const productService = accessor.get(IProductService);
    const openerService = accessor.get(IOpenerService);
    const url = isLinux ? productService.keyboardShortcutsUrlLinux : isMacintosh ? productService.keyboardShortcutsUrlMac : productService.keyboardShortcutsUrlWin;
    if (url) {
      openerService.open(URI.parse(url));
    }
  }
}
class OpenIntroductoryVideosUrlAction extends Action2 {
  static {
    __name(this, "OpenIntroductoryVideosUrlAction");
  }
  static ID = "workbench.action.openVideoTutorialsUrl";
  static AVAILABLE = !!product.introductoryVideosUrl;
  constructor() {
    super({
      id: OpenIntroductoryVideosUrlAction.ID,
      title: {
        ...localize2("openVideoTutorialsUrl", "Video Tutorials"),
        mnemonicTitle: localize({ key: "miVideoTutorials", comment: ["&& denotes a mnemonic"] }, "&&Video Tutorials")
      },
      category: Categories.Help,
      f1: true,
      menu: {
        id: MenuId.MenubarHelpMenu,
        group: "2_reference",
        order: 2
      }
    });
  }
  run(accessor) {
    const productService = accessor.get(IProductService);
    const openerService = accessor.get(IOpenerService);
    if (productService.introductoryVideosUrl) {
      openerService.open(URI.parse(productService.introductoryVideosUrl));
    }
  }
}
class OpenTipsAndTricksUrlAction extends Action2 {
  static {
    __name(this, "OpenTipsAndTricksUrlAction");
  }
  static ID = "workbench.action.openTipsAndTricksUrl";
  static AVAILABLE = !!product.tipsAndTricksUrl;
  constructor() {
    super({
      id: OpenTipsAndTricksUrlAction.ID,
      title: {
        ...localize2("openTipsAndTricksUrl", "Tips and Tricks"),
        mnemonicTitle: localize({ key: "miTipsAndTricks", comment: ["&& denotes a mnemonic"] }, "Tips and Tri&&cks")
      },
      category: Categories.Help,
      f1: true,
      menu: {
        id: MenuId.MenubarHelpMenu,
        group: "2_reference",
        order: 3
      }
    });
  }
  run(accessor) {
    const productService = accessor.get(IProductService);
    const openerService = accessor.get(IOpenerService);
    if (productService.tipsAndTricksUrl) {
      openerService.open(URI.parse(productService.tipsAndTricksUrl));
    }
  }
}
class OpenDocumentationUrlAction extends Action2 {
  static {
    __name(this, "OpenDocumentationUrlAction");
  }
  static ID = "workbench.action.openDocumentationUrl";
  static AVAILABLE = !!(isWeb ? product.serverDocumentationUrl : product.documentationUrl);
  constructor() {
    super({
      id: OpenDocumentationUrlAction.ID,
      title: {
        ...localize2("openDocumentationUrl", "Documentation"),
        mnemonicTitle: localize({ key: "miDocumentation", comment: ["&& denotes a mnemonic"] }, "&&Documentation")
      },
      category: Categories.Help,
      f1: true,
      menu: {
        id: MenuId.MenubarHelpMenu,
        group: "1_welcome",
        order: 3
      }
    });
  }
  run(accessor) {
    const productService = accessor.get(IProductService);
    const openerService = accessor.get(IOpenerService);
    const url = isWeb ? productService.serverDocumentationUrl : productService.documentationUrl;
    if (url) {
      openerService.open(URI.parse(url));
    }
  }
}
class OpenNewsletterSignupUrlAction extends Action2 {
  static {
    __name(this, "OpenNewsletterSignupUrlAction");
  }
  static ID = "workbench.action.openNewsletterSignupUrl";
  static AVAILABLE = !!product.newsletterSignupUrl;
  constructor() {
    super({
      id: OpenNewsletterSignupUrlAction.ID,
      title: localize2("newsletterSignup", "Signup for the VS Code Newsletter"),
      category: Categories.Help,
      f1: true
    });
  }
  run(accessor) {
    const productService = accessor.get(IProductService);
    const openerService = accessor.get(IOpenerService);
    const telemetryService = accessor.get(ITelemetryService);
    openerService.open(URI.parse(`${productService.newsletterSignupUrl}?machineId=${encodeURIComponent(telemetryService.machineId)}`));
  }
}
class OpenYouTubeUrlAction extends Action2 {
  static {
    __name(this, "OpenYouTubeUrlAction");
  }
  static ID = "workbench.action.openYouTubeUrl";
  static AVAILABLE = !!product.youTubeUrl;
  constructor() {
    super({
      id: OpenYouTubeUrlAction.ID,
      title: {
        ...localize2("openYouTubeUrl", "Join Us on YouTube"),
        mnemonicTitle: localize({ key: "miYouTube", comment: ["&& denotes a mnemonic"] }, "&&Join Us on YouTube")
      },
      category: Categories.Help,
      f1: true,
      menu: {
        id: MenuId.MenubarHelpMenu,
        group: "3_feedback",
        order: 1
      }
    });
  }
  run(accessor) {
    const productService = accessor.get(IProductService);
    const openerService = accessor.get(IOpenerService);
    if (productService.youTubeUrl) {
      openerService.open(URI.parse(productService.youTubeUrl));
    }
  }
}
class OpenRequestFeatureUrlAction extends Action2 {
  static {
    __name(this, "OpenRequestFeatureUrlAction");
  }
  static ID = "workbench.action.openRequestFeatureUrl";
  static AVAILABLE = !!product.requestFeatureUrl;
  constructor() {
    super({
      id: OpenRequestFeatureUrlAction.ID,
      title: {
        ...localize2("openUserVoiceUrl", "Search Feature Requests"),
        mnemonicTitle: localize({ key: "miUserVoice", comment: ["&& denotes a mnemonic"] }, "&&Search Feature Requests")
      },
      category: Categories.Help,
      f1: true,
      menu: {
        id: MenuId.MenubarHelpMenu,
        group: "3_feedback",
        order: 2
      }
    });
  }
  run(accessor) {
    const productService = accessor.get(IProductService);
    const openerService = accessor.get(IOpenerService);
    if (productService.requestFeatureUrl) {
      openerService.open(URI.parse(productService.requestFeatureUrl));
    }
  }
}
class OpenLicenseUrlAction extends Action2 {
  static {
    __name(this, "OpenLicenseUrlAction");
  }
  static ID = "workbench.action.openLicenseUrl";
  static AVAILABLE = !!(isWeb ? product.serverLicense : product.licenseUrl);
  constructor() {
    super({
      id: OpenLicenseUrlAction.ID,
      title: {
        ...localize2("openLicenseUrl", "View License"),
        mnemonicTitle: localize({ key: "miLicense", comment: ["&& denotes a mnemonic"] }, "View &&License")
      },
      category: Categories.Help,
      f1: true,
      menu: {
        id: MenuId.MenubarHelpMenu,
        group: "4_legal",
        order: 1
      }
    });
  }
  run(accessor) {
    const productService = accessor.get(IProductService);
    const openerService = accessor.get(IOpenerService);
    const url = isWeb ? productService.serverLicenseUrl : productService.licenseUrl;
    if (url) {
      if (language) {
        const queryArgChar = url.indexOf("?") > 0 ? "&" : "?";
        openerService.open(URI.parse(`${url}${queryArgChar}lang=${language}`));
      } else {
        openerService.open(URI.parse(url));
      }
    }
  }
}
class OpenPrivacyStatementUrlAction extends Action2 {
  static {
    __name(this, "OpenPrivacyStatementUrlAction");
  }
  static ID = "workbench.action.openPrivacyStatementUrl";
  static AVAILABE = !!product.privacyStatementUrl;
  constructor() {
    super({
      id: OpenPrivacyStatementUrlAction.ID,
      title: {
        ...localize2("openPrivacyStatement", "Privacy Statement"),
        mnemonicTitle: localize({ key: "miPrivacyStatement", comment: ["&& denotes a mnemonic"] }, "Privac&&y Statement")
      },
      category: Categories.Help,
      f1: true,
      menu: {
        id: MenuId.MenubarHelpMenu,
        group: "4_legal",
        order: 2
      }
    });
  }
  run(accessor) {
    const productService = accessor.get(IProductService);
    const openerService = accessor.get(IOpenerService);
    if (productService.privacyStatementUrl) {
      openerService.open(URI.parse(productService.privacyStatementUrl));
    }
  }
}
if (KeybindingsReferenceAction.AVAILABLE) {
  registerAction2(KeybindingsReferenceAction);
}
if (OpenIntroductoryVideosUrlAction.AVAILABLE) {
  registerAction2(OpenIntroductoryVideosUrlAction);
}
if (OpenTipsAndTricksUrlAction.AVAILABLE) {
  registerAction2(OpenTipsAndTricksUrlAction);
}
if (OpenDocumentationUrlAction.AVAILABLE) {
  registerAction2(OpenDocumentationUrlAction);
}
if (OpenNewsletterSignupUrlAction.AVAILABLE) {
  registerAction2(OpenNewsletterSignupUrlAction);
}
if (OpenYouTubeUrlAction.AVAILABLE) {
  registerAction2(OpenYouTubeUrlAction);
}
if (OpenRequestFeatureUrlAction.AVAILABLE) {
  registerAction2(OpenRequestFeatureUrlAction);
}
if (OpenLicenseUrlAction.AVAILABLE) {
  registerAction2(OpenLicenseUrlAction);
}
if (OpenPrivacyStatementUrlAction.AVAILABE) {
  registerAction2(OpenPrivacyStatementUrlAction);
}
//# sourceMappingURL=helpActions.js.map
