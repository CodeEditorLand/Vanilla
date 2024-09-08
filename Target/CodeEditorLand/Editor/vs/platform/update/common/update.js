import { createDecorator } from "../../instantiation/common/instantiation.js";
var StateType = /* @__PURE__ */ ((StateType2) => {
  StateType2["Uninitialized"] = "uninitialized";
  StateType2["Idle"] = "idle";
  StateType2["Disabled"] = "disabled";
  StateType2["CheckingForUpdates"] = "checking for updates";
  StateType2["AvailableForDownload"] = "available for download";
  StateType2["Downloading"] = "downloading";
  StateType2["Downloaded"] = "downloaded";
  StateType2["Updating"] = "updating";
  StateType2["Ready"] = "ready";
  return StateType2;
})(StateType || {});
var UpdateType = /* @__PURE__ */ ((UpdateType2) => {
  UpdateType2[UpdateType2["Setup"] = 0] = "Setup";
  UpdateType2[UpdateType2["Archive"] = 1] = "Archive";
  UpdateType2[UpdateType2["Snap"] = 2] = "Snap";
  return UpdateType2;
})(UpdateType || {});
var DisablementReason = /* @__PURE__ */ ((DisablementReason2) => {
  DisablementReason2[DisablementReason2["NotBuilt"] = 0] = "NotBuilt";
  DisablementReason2[DisablementReason2["DisabledByEnvironment"] = 1] = "DisabledByEnvironment";
  DisablementReason2[DisablementReason2["ManuallyDisabled"] = 2] = "ManuallyDisabled";
  DisablementReason2[DisablementReason2["MissingConfiguration"] = 3] = "MissingConfiguration";
  DisablementReason2[DisablementReason2["InvalidConfiguration"] = 4] = "InvalidConfiguration";
  DisablementReason2[DisablementReason2["RunningAsAdmin"] = 5] = "RunningAsAdmin";
  return DisablementReason2;
})(DisablementReason || {});
const State = {
  Uninitialized: { type: "uninitialized" /* Uninitialized */ },
  Disabled: (reason) => ({ type: "disabled" /* Disabled */, reason }),
  Idle: (updateType, error) => ({ type: "idle" /* Idle */, updateType, error }),
  CheckingForUpdates: (explicit) => ({
    type: "checking for updates" /* CheckingForUpdates */,
    explicit
  }),
  AvailableForDownload: (update) => ({
    type: "available for download" /* AvailableForDownload */,
    update
  }),
  Downloading: { type: "downloading" /* Downloading */ },
  Downloaded: (update) => ({
    type: "downloaded" /* Downloaded */,
    update
  }),
  Updating: (update) => ({
    type: "updating" /* Updating */,
    update
  }),
  Ready: (update) => ({ type: "ready" /* Ready */, update })
};
const IUpdateService = createDecorator("updateService");
export {
  DisablementReason,
  IUpdateService,
  State,
  StateType,
  UpdateType
};
