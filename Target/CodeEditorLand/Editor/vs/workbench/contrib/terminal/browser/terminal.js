import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
const ITerminalService = createDecorator("terminalService");
const ITerminalConfigurationService = createDecorator(
  "terminalConfigurationService"
);
const ITerminalEditorService = createDecorator(
  "terminalEditorService"
);
const ITerminalGroupService = createDecorator(
  "terminalGroupService"
);
const ITerminalInstanceService = createDecorator("terminalInstanceService");
var Direction = /* @__PURE__ */ ((Direction2) => {
  Direction2[Direction2["Left"] = 0] = "Left";
  Direction2[Direction2["Right"] = 1] = "Right";
  Direction2[Direction2["Up"] = 2] = "Up";
  Direction2[Direction2["Down"] = 3] = "Down";
  return Direction2;
})(Direction || {});
var TerminalConnectionState = /* @__PURE__ */ ((TerminalConnectionState2) => {
  TerminalConnectionState2[TerminalConnectionState2["Connecting"] = 0] = "Connecting";
  TerminalConnectionState2[TerminalConnectionState2["Connected"] = 1] = "Connected";
  return TerminalConnectionState2;
})(TerminalConnectionState || {});
const isDetachedTerminalInstance = (t) => typeof t.instanceId !== "number";
class TerminalLinkQuickPickEvent extends MouseEvent {
}
const terminalEditorId = "terminalEditor";
var XtermTerminalConstants = /* @__PURE__ */ ((XtermTerminalConstants2) => {
  XtermTerminalConstants2[XtermTerminalConstants2["SearchHighlightLimit"] = 1e3] = "SearchHighlightLimit";
  return XtermTerminalConstants2;
})(XtermTerminalConstants || {});
var LinuxDistro = /* @__PURE__ */ ((LinuxDistro2) => {
  LinuxDistro2[LinuxDistro2["Unknown"] = 1] = "Unknown";
  LinuxDistro2[LinuxDistro2["Fedora"] = 2] = "Fedora";
  LinuxDistro2[LinuxDistro2["Ubuntu"] = 3] = "Ubuntu";
  return LinuxDistro2;
})(LinuxDistro || {});
var TerminalDataTransfers = /* @__PURE__ */ ((TerminalDataTransfers2) => {
  TerminalDataTransfers2["Terminals"] = "Terminals";
  return TerminalDataTransfers2;
})(TerminalDataTransfers || {});
export {
  Direction,
  ITerminalConfigurationService,
  ITerminalEditorService,
  ITerminalGroupService,
  ITerminalInstanceService,
  ITerminalService,
  LinuxDistro,
  TerminalConnectionState,
  TerminalDataTransfers,
  TerminalLinkQuickPickEvent,
  XtermTerminalConstants,
  isDetachedTerminalInstance,
  terminalEditorId
};
