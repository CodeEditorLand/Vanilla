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
import * as dom from "../../../../../base/browser/dom.js";
import { Delayer } from "../../../../../base/common/async.js";
import { fromNow, getDurationString } from "../../../../../base/common/date.js";
import { MarkdownString } from "../../../../../base/common/htmlContent.js";
import {
  Disposable,
  combinedDisposable
} from "../../../../../base/common/lifecycle.js";
import { localize } from "../../../../../nls.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { IContextMenuService } from "../../../../../platform/contextview/browser/contextView.js";
import { IHoverService } from "../../../../../platform/hover/browser/hover.js";
import { TerminalSettingId } from "../../../../../platform/terminal/common/terminal.js";
var DecorationStyles = /* @__PURE__ */ ((DecorationStyles2) => {
  DecorationStyles2[DecorationStyles2["DefaultDimension"] = 16] = "DefaultDimension";
  DecorationStyles2[DecorationStyles2["MarginLeft"] = -17] = "MarginLeft";
  return DecorationStyles2;
})(DecorationStyles || {});
var DecorationSelector = /* @__PURE__ */ ((DecorationSelector2) => {
  DecorationSelector2["CommandDecoration"] = "terminal-command-decoration";
  DecorationSelector2["Hide"] = "hide";
  DecorationSelector2["ErrorColor"] = "error";
  DecorationSelector2["DefaultColor"] = "default-color";
  DecorationSelector2["Default"] = "default";
  DecorationSelector2["Codicon"] = "codicon";
  DecorationSelector2["XtermDecoration"] = "xterm-decoration";
  DecorationSelector2["OverviewRuler"] = ".xterm-decoration-overview-ruler";
  return DecorationSelector2;
})(DecorationSelector || {});
let TerminalDecorationHoverManager = class extends Disposable {
  constructor(_hoverService, configurationService, contextMenuService) {
    super();
    this._hoverService = _hoverService;
    this._register(contextMenuService.onDidShowContextMenu(() => this._contextMenuVisible = true));
    this._register(contextMenuService.onDidHideContextMenu(() => this._contextMenuVisible = false));
    this._hoverDelayer = this._register(new Delayer(configurationService.getValue("workbench.hover.delay")));
  }
  _hoverDelayer;
  _contextMenuVisible = false;
  hideHover() {
    this._hoverDelayer.cancel();
    this._hoverService.hideHover();
  }
  createHover(element, command, hoverMessage) {
    return combinedDisposable(
      dom.addDisposableListener(
        element,
        dom.EventType.MOUSE_ENTER,
        () => {
          if (this._contextMenuVisible) {
            return;
          }
          this._hoverDelayer.trigger(() => {
            let hoverContent = `${localize("terminalPromptContextMenu", "Show Command Actions")}`;
            hoverContent += "\n\n---\n\n";
            if (!command) {
              if (hoverMessage) {
                hoverContent = hoverMessage;
              } else {
                return;
              }
            } else if (command.markProperties || hoverMessage) {
              if (command.markProperties?.hoverMessage || hoverMessage) {
                hoverContent = command.markProperties?.hoverMessage || hoverMessage || "";
              } else {
                return;
              }
            } else if (command.duration) {
              const durationText = getDurationString(
                command.duration
              );
              if (command.exitCode) {
                if (command.exitCode === -1) {
                  hoverContent += localize(
                    "terminalPromptCommandFailed.duration",
                    "Command executed {0}, took {1} and failed",
                    fromNow(command.timestamp, true),
                    durationText
                  );
                } else {
                  hoverContent += localize(
                    "terminalPromptCommandFailedWithExitCode.duration",
                    "Command executed {0}, took {1} and failed (Exit Code {2})",
                    fromNow(command.timestamp, true),
                    durationText,
                    command.exitCode
                  );
                }
              } else {
                hoverContent += localize(
                  "terminalPromptCommandSuccess.duration",
                  "Command executed {0} and took {1}",
                  fromNow(command.timestamp, true),
                  durationText
                );
              }
            } else if (command.exitCode) {
              if (command.exitCode === -1) {
                hoverContent += localize(
                  "terminalPromptCommandFailed",
                  "Command executed {0} and failed",
                  fromNow(command.timestamp, true)
                );
              } else {
                hoverContent += localize(
                  "terminalPromptCommandFailedWithExitCode",
                  "Command executed {0} and failed (Exit Code {1})",
                  fromNow(command.timestamp, true),
                  command.exitCode
                );
              }
            } else {
              hoverContent += localize(
                "terminalPromptCommandSuccess",
                "Command executed {0}",
                fromNow(command.timestamp, true)
              );
            }
            this._hoverService.showHover({
              content: new MarkdownString(hoverContent),
              target: element
            });
          });
        }
      ),
      dom.addDisposableListener(
        element,
        dom.EventType.MOUSE_LEAVE,
        () => this.hideHover()
      ),
      dom.addDisposableListener(
        element,
        dom.EventType.MOUSE_OUT,
        () => this.hideHover()
      )
    );
  }
};
TerminalDecorationHoverManager = __decorateClass([
  __decorateParam(0, IHoverService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IContextMenuService)
], TerminalDecorationHoverManager);
function updateLayout(configurationService, element) {
  if (!element) {
    return;
  }
  const fontSize = configurationService.inspect(
    TerminalSettingId.FontSize
  ).value;
  const defaultFontSize = configurationService.inspect(
    TerminalSettingId.FontSize
  ).defaultValue;
  const lineHeight = configurationService.inspect(
    TerminalSettingId.LineHeight
  ).value;
  if (typeof fontSize === "number" && typeof defaultFontSize === "number" && typeof lineHeight === "number") {
    const scalar = fontSize / defaultFontSize <= 1 ? fontSize / defaultFontSize : 1;
    element.style.width = `${scalar * 16 /* DefaultDimension */}px`;
    element.style.height = `${scalar * 16 /* DefaultDimension */ * lineHeight}px`;
    element.style.fontSize = `${scalar * 16 /* DefaultDimension */}px`;
    element.style.marginLeft = `${scalar * -17 /* MarginLeft */}px`;
  }
}
export {
  DecorationSelector,
  TerminalDecorationHoverManager,
  updateLayout
};
