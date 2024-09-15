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
import { createDecorator } from "../../instantiation/common/instantiation.js";
import { Disposable, DisposableStore } from "../../../base/common/lifecycle.js";
import { IHoverDelegate, IHoverDelegateOptions } from "../../../base/browser/ui/hover/hoverDelegate.js";
import { IConfigurationService } from "../../configuration/common/configuration.js";
import { addStandardDisposableListener, isHTMLElement } from "../../../base/browser/dom.js";
import { KeyCode } from "../../../base/common/keyCodes.js";
const IHoverService = createDecorator("hoverService");
let WorkbenchHoverDelegate = class extends Disposable {
  constructor(placement, instantHover, overrideOptions = {}, configurationService, hoverService) {
    super();
    this.placement = placement;
    this.instantHover = instantHover;
    this.overrideOptions = overrideOptions;
    this.configurationService = configurationService;
    this.hoverService = hoverService;
    this._delay = this.configurationService.getValue("workbench.hover.delay");
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("workbench.hover.delay")) {
        this._delay = this.configurationService.getValue("workbench.hover.delay");
      }
    }));
  }
  static {
    __name(this, "WorkbenchHoverDelegate");
  }
  lastHoverHideTime = 0;
  timeLimit = 200;
  _delay;
  get delay() {
    if (this.isInstantlyHovering()) {
      return 0;
    }
    return this._delay;
  }
  hoverDisposables = this._register(new DisposableStore());
  showHover(options, focus) {
    const overrideOptions = typeof this.overrideOptions === "function" ? this.overrideOptions(options, focus) : this.overrideOptions;
    this.hoverDisposables.clear();
    const targets = isHTMLElement(options.target) ? [options.target] : options.target.targetElements;
    for (const target of targets) {
      this.hoverDisposables.add(addStandardDisposableListener(target, "keydown", (e) => {
        if (e.equals(KeyCode.Escape)) {
          this.hoverService.hideHover();
        }
      }));
    }
    const id = isHTMLElement(options.content) ? void 0 : options.content.toString();
    return this.hoverService.showHover({
      ...options,
      ...overrideOptions,
      persistence: {
        hideOnKeyDown: true,
        ...overrideOptions.persistence
      },
      id,
      appearance: {
        ...options.appearance,
        compact: true,
        skipFadeInAnimation: this.isInstantlyHovering(),
        ...overrideOptions.appearance
      }
    }, focus);
  }
  isInstantlyHovering() {
    return this.instantHover && Date.now() - this.lastHoverHideTime < this.timeLimit;
  }
  setInstantHoverTimeLimit(timeLimit) {
    if (!this.instantHover) {
      throw new Error("Instant hover is not enabled");
    }
    this.timeLimit = timeLimit;
  }
  onDidHideHover() {
    this.hoverDisposables.clear();
    if (this.instantHover) {
      this.lastHoverHideTime = Date.now();
    }
  }
};
WorkbenchHoverDelegate = __decorateClass([
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IHoverService)
], WorkbenchHoverDelegate);
const nativeHoverDelegate = {
  showHover: /* @__PURE__ */ __name(function() {
    throw new Error("Native hover function not implemented.");
  }, "showHover"),
  delay: 0,
  showNativeHover: true
};
export {
  IHoverService,
  WorkbenchHoverDelegate,
  nativeHoverDelegate
};
//# sourceMappingURL=hover.js.map
