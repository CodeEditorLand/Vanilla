var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter } from "../../../../base/common/event.js";
import { RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
const OUTPUT_MIME = "text/x-code-output";
const OUTPUT_MODE_ID = "Log";
const LOG_MIME = "text/x-code-log-output";
const LOG_MODE_ID = "log";
const OUTPUT_VIEW_ID = "workbench.panel.output";
const CONTEXT_IN_OUTPUT = new RawContextKey("inOutput", false);
const CONTEXT_ACTIVE_FILE_OUTPUT = new RawContextKey(
  "activeLogOutput",
  false
);
const CONTEXT_ACTIVE_OUTPUT_LEVEL_SETTABLE = new RawContextKey(
  "activeLogOutput.levelSettable",
  false
);
const CONTEXT_ACTIVE_OUTPUT_LEVEL = new RawContextKey(
  "activeLogOutput.level",
  ""
);
const CONTEXT_ACTIVE_OUTPUT_LEVEL_IS_DEFAULT = new RawContextKey("activeLogOutput.levelIsDefault", false);
const CONTEXT_OUTPUT_SCROLL_LOCK = new RawContextKey(
  `outputView.scrollLock`,
  false
);
const IOutputService = createDecorator("outputService");
var OutputChannelUpdateMode = /* @__PURE__ */ ((OutputChannelUpdateMode2) => {
  OutputChannelUpdateMode2[OutputChannelUpdateMode2["Append"] = 1] = "Append";
  OutputChannelUpdateMode2[OutputChannelUpdateMode2["Replace"] = 2] = "Replace";
  OutputChannelUpdateMode2[OutputChannelUpdateMode2["Clear"] = 3] = "Clear";
  return OutputChannelUpdateMode2;
})(OutputChannelUpdateMode || {});
const Extensions = {
  OutputChannels: "workbench.contributions.outputChannels"
};
class OutputChannelRegistry {
  static {
    __name(this, "OutputChannelRegistry");
  }
  channels = /* @__PURE__ */ new Map();
  _onDidRegisterChannel = new Emitter();
  onDidRegisterChannel = this._onDidRegisterChannel.event;
  _onDidRemoveChannel = new Emitter();
  onDidRemoveChannel = this._onDidRemoveChannel.event;
  registerChannel(descriptor) {
    if (!this.channels.has(descriptor.id)) {
      this.channels.set(descriptor.id, descriptor);
      this._onDidRegisterChannel.fire(descriptor.id);
    }
  }
  getChannels() {
    const result = [];
    this.channels.forEach((value) => result.push(value));
    return result;
  }
  getChannel(id) {
    return this.channels.get(id);
  }
  removeChannel(id) {
    this.channels.delete(id);
    this._onDidRemoveChannel.fire(id);
  }
}
Registry.add(Extensions.OutputChannels, new OutputChannelRegistry());
const ACTIVE_OUTPUT_CHANNEL_CONTEXT = new RawContextKey(
  "activeOutputChannel",
  ""
);
export {
  ACTIVE_OUTPUT_CHANNEL_CONTEXT,
  CONTEXT_ACTIVE_FILE_OUTPUT,
  CONTEXT_ACTIVE_OUTPUT_LEVEL,
  CONTEXT_ACTIVE_OUTPUT_LEVEL_IS_DEFAULT,
  CONTEXT_ACTIVE_OUTPUT_LEVEL_SETTABLE,
  CONTEXT_IN_OUTPUT,
  CONTEXT_OUTPUT_SCROLL_LOCK,
  Extensions,
  IOutputService,
  LOG_MIME,
  LOG_MODE_ID,
  OUTPUT_MIME,
  OUTPUT_MODE_ID,
  OUTPUT_VIEW_ID,
  OutputChannelUpdateMode
};
//# sourceMappingURL=output.js.map
