var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { asArray } from "../../../../base/common/arrays.js";
import { MarkdownString } from "../../../../base/common/htmlContent.js";
import { localize } from "../../../../nls.js";
import { TerminalCapability } from "../../../../platform/terminal/common/capabilities/capabilities.js";
function getInstanceHoverInfo(instance) {
  let statusString = "";
  const statuses = instance.statusList.statuses;
  const actions = [];
  for (const status of statuses) {
    statusString += `

---

${status.icon ? `$(${status.icon?.id}) ` : ""}${status.tooltip || status.id}`;
    if (status.hoverActions) {
      actions.push(...status.hoverActions);
    }
  }
  const shellProcessString = getShellProcessTooltip(instance, true);
  const shellIntegrationString = getShellIntegrationTooltip(instance, true);
  const content = new MarkdownString(
    instance.title + shellProcessString + shellIntegrationString + statusString,
    { supportThemeIcons: true }
  );
  return { content, actions };
}
__name(getInstanceHoverInfo, "getInstanceHoverInfo");
function getShellIntegrationTooltip(instance, markdown) {
  const shellIntegrationCapabilities = [];
  if (instance.capabilities.has(TerminalCapability.CommandDetection)) {
    shellIntegrationCapabilities.push(TerminalCapability.CommandDetection);
  }
  if (instance.capabilities.has(TerminalCapability.CwdDetection)) {
    shellIntegrationCapabilities.push(TerminalCapability.CwdDetection);
  }
  let shellIntegrationString = "";
  if (shellIntegrationCapabilities.length > 0) {
    shellIntegrationString += `${markdown ? "\n\n---\n\n" : "\n\n"}${localize("shellIntegration.enabled", "Shell integration activated")}`;
  } else if (instance.shellLaunchConfig.ignoreShellIntegration) {
    shellIntegrationString += `${markdown ? "\n\n---\n\n" : "\n\n"}${localize("launchFailed.exitCodeOnlyShellIntegration", "The terminal process failed to launch. Disabling shell integration with terminal.integrated.shellIntegration.enabled might help.")}`;
  } else if (instance.usedShellIntegrationInjection) {
    shellIntegrationString += `${markdown ? "\n\n---\n\n" : "\n\n"}${localize("shellIntegration.activationFailed", "Shell integration failed to activate")}`;
  }
  return shellIntegrationString;
}
__name(getShellIntegrationTooltip, "getShellIntegrationTooltip");
function getShellProcessTooltip(instance, markdown) {
  const lines = [];
  if (instance.processId && instance.processId > 0) {
    lines.push(
      localize(
        {
          key: "shellProcessTooltip.processId",
          comment: [
            `The first arg is "PID" which shouldn't be translated`
          ]
        },
        "Process ID ({0}): {1}",
        "PID",
        instance.processId
      ) + "\n"
    );
  }
  if (instance.shellLaunchConfig.executable) {
    let commandLine = instance.shellLaunchConfig.executable;
    const args = asArray(
      instance.injectedArgs || instance.shellLaunchConfig.args || []
    ).map((x) => `'${x}'`).join(" ");
    if (args) {
      commandLine += ` ${args}`;
    }
    lines.push(
      localize(
        "shellProcessTooltip.commandLine",
        "Command line: {0}",
        commandLine
      )
    );
  }
  return lines.length ? `${markdown ? "\n\n---\n\n" : "\n\n"}${lines.join("\n")}` : "";
}
__name(getShellProcessTooltip, "getShellProcessTooltip");
export {
  getInstanceHoverInfo,
  getShellIntegrationTooltip,
  getShellProcessTooltip
};
//# sourceMappingURL=terminalTooltip.js.map
