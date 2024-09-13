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
import {
  EventHelper,
  EventType,
  addDisposableListener,
  append,
  hide,
  show
} from "../../../../base/browser/dom.js";
import { StandardKeyboardEvent } from "../../../../base/browser/keyboardEvent.js";
import {
  Gesture,
  EventType as TouchEventType
} from "../../../../base/browser/touch.js";
import {
  renderIcon,
  renderLabelWithIcons
} from "../../../../base/browser/ui/iconLabel/iconLabels.js";
import { SimpleIconLabel } from "../../../../base/browser/ui/iconLabel/simpleIconLabel.js";
import { toErrorMessage } from "../../../../base/common/errorMessage.js";
import {
  isMarkdownString,
  markdownStringEqual
} from "../../../../base/common/htmlContent.js";
import { KeyCode } from "../../../../base/common/keyCodes.js";
import {
  Disposable,
  MutableDisposable
} from "../../../../base/common/lifecycle.js";
import { assertIsDefined } from "../../../../base/common/types.js";
import { isThemeColor } from "../../../../editor/common/editorCommon.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import {
  spinningLoading,
  syncing
} from "../../../../platform/theme/common/iconRegistry.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import {
  ShowTooltipCommand,
  StatusbarEntryKinds
} from "../../../services/statusbar/browser/statusbar.js";
let StatusbarEntryItem = class extends Disposable {
  constructor(container, entry, hoverDelegate, commandService, hoverService, notificationService, telemetryService, themeService) {
    super();
    this.container = container;
    this.hoverDelegate = hoverDelegate;
    this.commandService = commandService;
    this.hoverService = hoverService;
    this.notificationService = notificationService;
    this.telemetryService = telemetryService;
    this.themeService = themeService;
    this.labelContainer = document.createElement("a");
    this.labelContainer.tabIndex = -1;
    this.labelContainer.setAttribute("role", "button");
    this.labelContainer.className = "statusbar-item-label";
    this._register(Gesture.addTarget(this.labelContainer));
    this.label = this._register(new StatusBarCodiconLabel(this.labelContainer));
    this.container.appendChild(this.labelContainer);
    this.beakContainer = document.createElement("div");
    this.beakContainer.className = "status-bar-item-beak-container";
    this.container.appendChild(this.beakContainer);
    this.update(entry);
  }
  static {
    __name(this, "StatusbarEntryItem");
  }
  label;
  entry = void 0;
  foregroundListener = this._register(
    new MutableDisposable()
  );
  backgroundListener = this._register(
    new MutableDisposable()
  );
  commandMouseListener = this._register(
    new MutableDisposable()
  );
  commandTouchListener = this._register(
    new MutableDisposable()
  );
  commandKeyboardListener = this._register(
    new MutableDisposable()
  );
  focusListener = this._register(new MutableDisposable());
  focusOutListener = this._register(new MutableDisposable());
  hover = void 0;
  labelContainer;
  beakContainer;
  get name() {
    return assertIsDefined(this.entry).name;
  }
  get hasCommand() {
    return typeof this.entry?.command !== "undefined";
  }
  update(entry) {
    this.label.showProgress = entry.showProgress ?? false;
    if (!this.entry || entry.text !== this.entry.text) {
      this.label.text = entry.text;
      if (entry.text) {
        show(this.labelContainer);
      } else {
        hide(this.labelContainer);
      }
    }
    if (!this.entry || entry.ariaLabel !== this.entry.ariaLabel) {
      this.container.setAttribute("aria-label", entry.ariaLabel);
      this.labelContainer.setAttribute("aria-label", entry.ariaLabel);
    }
    if (!this.entry || entry.role !== this.entry.role) {
      this.labelContainer.setAttribute("role", entry.role || "button");
    }
    if (!this.entry || !this.isEqualTooltip(this.entry, entry)) {
      const hoverContents = isMarkdownString(entry.tooltip) ? {
        markdown: entry.tooltip,
        markdownNotSupportedFallback: void 0
      } : entry.tooltip;
      if (this.hover) {
        this.hover.update(hoverContents);
      } else {
        this.hover = this._register(
          this.hoverService.setupManagedHover(
            this.hoverDelegate,
            this.container,
            hoverContents
          )
        );
      }
      if (entry.command !== ShowTooltipCommand) {
        this.focusListener.value = addDisposableListener(
          this.labelContainer,
          EventType.FOCUS,
          (e) => {
            EventHelper.stop(e);
            this.hover?.show(false);
          }
        );
        this.focusOutListener.value = addDisposableListener(
          this.labelContainer,
          EventType.FOCUS_OUT,
          (e) => {
            EventHelper.stop(e);
            this.hover?.hide();
          }
        );
      }
    }
    if (!this.entry || entry.command !== this.entry.command) {
      this.commandMouseListener.clear();
      this.commandTouchListener.clear();
      this.commandKeyboardListener.clear();
      const command = entry.command;
      if (command && (command !== ShowTooltipCommand || this.hover)) {
        this.commandMouseListener.value = addDisposableListener(
          this.labelContainer,
          EventType.CLICK,
          () => this.executeCommand(command)
        );
        this.commandTouchListener.value = addDisposableListener(
          this.labelContainer,
          TouchEventType.Tap,
          () => this.executeCommand(command)
        );
        this.commandKeyboardListener.value = addDisposableListener(
          this.labelContainer,
          EventType.KEY_DOWN,
          (e) => {
            const event = new StandardKeyboardEvent(e);
            if (event.equals(KeyCode.Space) || event.equals(KeyCode.Enter)) {
              EventHelper.stop(e);
              this.executeCommand(command);
            } else if (event.equals(KeyCode.Escape) || event.equals(KeyCode.LeftArrow) || event.equals(KeyCode.RightArrow)) {
              EventHelper.stop(e);
              this.hover?.hide();
            }
          }
        );
        this.labelContainer.classList.remove("disabled");
      } else {
        this.labelContainer.classList.add("disabled");
      }
    }
    if (!this.entry || entry.showBeak !== this.entry.showBeak) {
      if (entry.showBeak) {
        this.container.classList.add("has-beak");
      } else {
        this.container.classList.remove("has-beak");
      }
    }
    const hasBackgroundColor = !!entry.backgroundColor || entry.kind && entry.kind !== "standard";
    if (!this.entry || entry.kind !== this.entry.kind) {
      for (const kind of StatusbarEntryKinds) {
        this.container.classList.remove(`${kind}-kind`);
      }
      if (entry.kind && entry.kind !== "standard") {
        this.container.classList.add(`${entry.kind}-kind`);
      }
      this.container.classList.toggle(
        "has-background-color",
        hasBackgroundColor
      );
    }
    if (!this.entry || entry.color !== this.entry.color) {
      this.applyColor(this.labelContainer, entry.color);
    }
    if (!this.entry || entry.backgroundColor !== this.entry.backgroundColor) {
      this.container.classList.toggle(
        "has-background-color",
        hasBackgroundColor
      );
      this.applyColor(this.container, entry.backgroundColor, true);
    }
    this.entry = entry;
  }
  isEqualTooltip({ tooltip }, { tooltip: otherTooltip }) {
    if (tooltip === void 0) {
      return otherTooltip === void 0;
    }
    if (isMarkdownString(tooltip)) {
      return isMarkdownString(otherTooltip) && markdownStringEqual(tooltip, otherTooltip);
    }
    return tooltip === otherTooltip;
  }
  async executeCommand(command) {
    if (command === ShowTooltipCommand) {
      this.hover?.show(
        true
        /* focus */
      );
    } else {
      const id = typeof command === "string" ? command : command.id;
      const args = typeof command === "string" ? [] : command.arguments ?? [];
      this.telemetryService.publicLog2("workbenchActionExecuted", { id, from: "status bar" });
      try {
        await this.commandService.executeCommand(id, ...args);
      } catch (error) {
        this.notificationService.error(toErrorMessage(error));
      }
    }
  }
  applyColor(container, color, isBackground) {
    let colorResult;
    if (isBackground) {
      this.backgroundListener.clear();
    } else {
      this.foregroundListener.clear();
    }
    if (color) {
      if (isThemeColor(color)) {
        colorResult = this.themeService.getColorTheme().getColor(color.id)?.toString();
        const listener = this.themeService.onDidColorThemeChange(
          (theme) => {
            const colorValue = theme.getColor(color.id)?.toString();
            if (isBackground) {
              container.style.backgroundColor = colorValue ?? "";
            } else {
              container.style.color = colorValue ?? "";
            }
          }
        );
        if (isBackground) {
          this.backgroundListener.value = listener;
        } else {
          this.foregroundListener.value = listener;
        }
      } else {
        colorResult = color;
      }
    }
    if (isBackground) {
      container.style.backgroundColor = colorResult ?? "";
    } else {
      container.style.color = colorResult ?? "";
    }
  }
};
StatusbarEntryItem = __decorateClass([
  __decorateParam(3, ICommandService),
  __decorateParam(4, IHoverService),
  __decorateParam(5, INotificationService),
  __decorateParam(6, ITelemetryService),
  __decorateParam(7, IThemeService)
], StatusbarEntryItem);
class StatusBarCodiconLabel extends SimpleIconLabel {
  constructor(container) {
    super(container);
    this.container = container;
  }
  static {
    __name(this, "StatusBarCodiconLabel");
  }
  progressCodicon = renderIcon(syncing);
  currentText = "";
  currentShowProgress = false;
  set showProgress(showProgress) {
    if (this.currentShowProgress !== showProgress) {
      this.currentShowProgress = showProgress;
      this.progressCodicon = renderIcon(
        showProgress === "syncing" ? syncing : spinningLoading
      );
      this.text = this.currentText;
    }
  }
  set text(text) {
    if (this.currentShowProgress) {
      if (this.container.firstChild !== this.progressCodicon) {
        this.container.appendChild(this.progressCodicon);
      }
      for (const node of Array.from(this.container.childNodes)) {
        if (node !== this.progressCodicon) {
          node.remove();
        }
      }
      let textContent = text ?? "";
      if (textContent) {
        textContent = ` ${textContent}`;
      }
      append(this.container, ...renderLabelWithIcons(textContent));
    } else {
      super.text = text;
    }
  }
}
export {
  StatusbarEntryItem
};
//# sourceMappingURL=statusbarItem.js.map
