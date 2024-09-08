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
import { getWindow } from "../../../base/browser/dom.js";
import { CancellationToken } from "../../../base/common/cancellation.js";
import { Emitter } from "../../../base/common/event.js";
import { IConfigurationService } from "../../configuration/common/configuration.js";
import {
  IContextKeyService,
  RawContextKey
} from "../../contextkey/common/contextkey.js";
import { IInstantiationService } from "../../instantiation/common/instantiation.js";
import { ILayoutService } from "../../layout/browser/layoutService.js";
import { IOpenerService } from "../../opener/common/opener.js";
import {
  defaultButtonStyles,
  defaultCountBadgeStyles,
  defaultInputBoxStyles,
  defaultKeybindingLabelStyles,
  defaultProgressBarStyles,
  defaultToggleStyles,
  getListStyles
} from "../../theme/browser/defaultStyles.js";
import {
  activeContrastBorder,
  asCssVariable,
  pickerGroupBorder,
  pickerGroupForeground,
  quickInputBackground,
  quickInputForeground,
  quickInputListFocusBackground,
  quickInputListFocusForeground,
  quickInputListFocusIconForeground,
  quickInputTitleBackground,
  widgetBorder,
  widgetShadow
} from "../../theme/common/colorRegistry.js";
import { IThemeService, Themable } from "../../theme/common/themeService.js";
import { QuickAccessController } from "./quickAccess.js";
import {
  QuickInputHoverDelegate
} from "./quickInput.js";
import {
  QuickInputController
} from "./quickInputController.js";
let QuickInputService = class extends Themable {
  constructor(instantiationService, contextKeyService, themeService, layoutService, configurationService) {
    super(themeService);
    this.instantiationService = instantiationService;
    this.contextKeyService = contextKeyService;
    this.layoutService = layoutService;
    this.configurationService = configurationService;
  }
  get backButton() {
    return this.controller.backButton;
  }
  _onShow = this._register(new Emitter());
  onShow = this._onShow.event;
  _onHide = this._register(new Emitter());
  onHide = this._onHide.event;
  _controller;
  get controller() {
    if (!this._controller) {
      this._controller = this._register(this.createController());
    }
    return this._controller;
  }
  get hasController() {
    return !!this._controller;
  }
  get currentQuickInput() {
    return this.controller.currentQuickInput;
  }
  _quickAccess;
  get quickAccess() {
    if (!this._quickAccess) {
      this._quickAccess = this._register(
        this.instantiationService.createInstance(QuickAccessController)
      );
    }
    return this._quickAccess;
  }
  contexts = /* @__PURE__ */ new Map();
  createController(host = this.layoutService, options) {
    const defaultOptions = {
      idPrefix: "quickInput_",
      container: host.activeContainer,
      ignoreFocusOut: () => false,
      backKeybindingLabel: () => void 0,
      setContextKey: (id) => this.setContextKey(id),
      linkOpenerDelegate: (content) => {
        this.instantiationService.invokeFunction((accessor) => {
          const openerService = accessor.get(IOpenerService);
          openerService.open(content, {
            allowCommands: true,
            fromUserGesture: true
          });
        });
      },
      returnFocus: () => host.focus(),
      styles: this.computeStyles(),
      hoverDelegate: this._register(
        this.instantiationService.createInstance(
          QuickInputHoverDelegate
        )
      )
    };
    const controller = this._register(
      this.instantiationService.createInstance(QuickInputController, {
        ...defaultOptions,
        ...options
      })
    );
    controller.layout(
      host.activeContainerDimension,
      host.activeContainerOffset.quickPickTop
    );
    this._register(
      host.onDidLayoutActiveContainer((dimension) => {
        if (getWindow(host.activeContainer) === getWindow(controller.container)) {
          controller.layout(
            dimension,
            host.activeContainerOffset.quickPickTop
          );
        }
      })
    );
    this._register(
      host.onDidChangeActiveContainer(() => {
        if (controller.isVisible()) {
          return;
        }
        controller.layout(
          host.activeContainerDimension,
          host.activeContainerOffset.quickPickTop
        );
      })
    );
    this._register(
      controller.onShow(() => {
        this.resetContextKeys();
        this._onShow.fire();
      })
    );
    this._register(
      controller.onHide(() => {
        this.resetContextKeys();
        this._onHide.fire();
      })
    );
    return controller;
  }
  setContextKey(id) {
    let key;
    if (id) {
      key = this.contexts.get(id);
      if (!key) {
        key = new RawContextKey(id, false).bindTo(
          this.contextKeyService
        );
        this.contexts.set(id, key);
      }
    }
    if (key && key.get()) {
      return;
    }
    this.resetContextKeys();
    key?.set(true);
  }
  resetContextKeys() {
    this.contexts.forEach((context) => {
      if (context.get()) {
        context.reset();
      }
    });
  }
  pick(picks, options, token = CancellationToken.None) {
    return this.controller.pick(picks, options, token);
  }
  input(options = {}, token = CancellationToken.None) {
    return this.controller.input(options, token);
  }
  createQuickPick(options = { useSeparators: false }) {
    return this.controller.createQuickPick(options);
  }
  createInputBox() {
    return this.controller.createInputBox();
  }
  createQuickWidget() {
    return this.controller.createQuickWidget();
  }
  focus() {
    this.controller.focus();
  }
  toggle() {
    this.controller.toggle();
  }
  navigate(next, quickNavigate) {
    this.controller.navigate(next, quickNavigate);
  }
  accept(keyMods) {
    return this.controller.accept(keyMods);
  }
  back() {
    return this.controller.back();
  }
  cancel() {
    return this.controller.cancel();
  }
  updateStyles() {
    if (this.hasController) {
      this.controller.applyStyles(this.computeStyles());
    }
  }
  computeStyles() {
    return {
      widget: {
        quickInputBackground: asCssVariable(quickInputBackground),
        quickInputForeground: asCssVariable(quickInputForeground),
        quickInputTitleBackground: asCssVariable(
          quickInputTitleBackground
        ),
        widgetBorder: asCssVariable(widgetBorder),
        widgetShadow: asCssVariable(widgetShadow)
      },
      inputBox: defaultInputBoxStyles,
      toggle: defaultToggleStyles,
      countBadge: defaultCountBadgeStyles,
      button: defaultButtonStyles,
      progressBar: defaultProgressBarStyles,
      keybindingLabel: defaultKeybindingLabelStyles,
      list: getListStyles({
        listBackground: quickInputBackground,
        listFocusBackground: quickInputListFocusBackground,
        listFocusForeground: quickInputListFocusForeground,
        // Look like focused when inactive.
        listInactiveFocusForeground: quickInputListFocusForeground,
        listInactiveSelectionIconForeground: quickInputListFocusIconForeground,
        listInactiveFocusBackground: quickInputListFocusBackground,
        listFocusOutline: activeContrastBorder,
        listInactiveFocusOutline: activeContrastBorder
      }),
      pickerGroup: {
        pickerGroupBorder: asCssVariable(pickerGroupBorder),
        pickerGroupForeground: asCssVariable(pickerGroupForeground)
      }
    };
  }
};
QuickInputService = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, IThemeService),
  __decorateParam(3, ILayoutService),
  __decorateParam(4, IConfigurationService)
], QuickInputService);
export {
  QuickInputService
};
