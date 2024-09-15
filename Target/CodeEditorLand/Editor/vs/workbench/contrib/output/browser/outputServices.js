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
import { Event, Emitter } from "../../../../base/common/event.js";
import { Schemas } from "../../../../base/common/network.js";
import { URI } from "../../../../base/common/uri.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IStorageService, StorageScope, StorageTarget } from "../../../../platform/storage/common/storage.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { IOutputChannel, IOutputService, OUTPUT_VIEW_ID, LOG_MIME, OUTPUT_MIME, OutputChannelUpdateMode, IOutputChannelDescriptor, Extensions, IOutputChannelRegistry, ACTIVE_OUTPUT_CHANNEL_CONTEXT, CONTEXT_ACTIVE_FILE_OUTPUT, CONTEXT_ACTIVE_OUTPUT_LEVEL_SETTABLE, CONTEXT_ACTIVE_OUTPUT_LEVEL, CONTEXT_ACTIVE_OUTPUT_LEVEL_IS_DEFAULT } from "../../../services/output/common/output.js";
import { OutputLinkProvider } from "./outputLinkProvider.js";
import { ITextModelService, ITextModelContentProvider } from "../../../../editor/common/services/resolverService.js";
import { ITextModel } from "../../../../editor/common/model.js";
import { ILogService, ILoggerService, LogLevelToString } from "../../../../platform/log/common/log.js";
import { ILifecycleService } from "../../../services/lifecycle/common/lifecycle.js";
import { IOutputChannelModel } from "../common/outputChannelModel.js";
import { IViewsService } from "../../../services/views/common/viewsService.js";
import { OutputViewPane } from "./outputView.js";
import { IOutputChannelModelService } from "../common/outputChannelModelService.js";
import { ILanguageService } from "../../../../editor/common/languages/language.js";
import { IContextKey, IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { SetLogLevelAction } from "../../logs/common/logsActions.js";
import { IDefaultLogLevelsService } from "../../logs/common/defaultLogLevels.js";
const OUTPUT_ACTIVE_CHANNEL_KEY = "output.activechannel";
let OutputChannel = class extends Disposable {
  constructor(outputChannelDescriptor, outputChannelModelService, languageService) {
    super();
    this.outputChannelDescriptor = outputChannelDescriptor;
    this.id = outputChannelDescriptor.id;
    this.label = outputChannelDescriptor.label;
    this.uri = URI.from({ scheme: Schemas.outputChannel, path: this.id });
    this.model = this._register(outputChannelModelService.createOutputChannelModel(this.id, this.uri, outputChannelDescriptor.languageId ? languageService.createById(outputChannelDescriptor.languageId) : languageService.createByMimeType(outputChannelDescriptor.log ? LOG_MIME : OUTPUT_MIME), outputChannelDescriptor.file));
  }
  static {
    __name(this, "OutputChannel");
  }
  scrollLock = false;
  model;
  id;
  label;
  uri;
  append(output) {
    this.model.append(output);
  }
  update(mode, till) {
    this.model.update(mode, till, true);
  }
  clear() {
    this.model.clear();
  }
  replace(value) {
    this.model.replace(value);
  }
};
OutputChannel = __decorateClass([
  __decorateParam(1, IOutputChannelModelService),
  __decorateParam(2, ILanguageService)
], OutputChannel);
let OutputService = class extends Disposable {
  constructor(storageService, instantiationService, textModelResolverService, logService, loggerService, lifecycleService, viewsService, contextKeyService, defaultLogLevelsService) {
    super();
    this.storageService = storageService;
    this.instantiationService = instantiationService;
    this.logService = logService;
    this.loggerService = loggerService;
    this.lifecycleService = lifecycleService;
    this.viewsService = viewsService;
    this.defaultLogLevelsService = defaultLogLevelsService;
    this.activeChannelIdInStorage = this.storageService.get(OUTPUT_ACTIVE_CHANNEL_KEY, StorageScope.WORKSPACE, "");
    this.activeOutputChannelContext = ACTIVE_OUTPUT_CHANNEL_CONTEXT.bindTo(contextKeyService);
    this.activeOutputChannelContext.set(this.activeChannelIdInStorage);
    this._register(this.onActiveOutputChannel((channel) => this.activeOutputChannelContext.set(channel)));
    this.activeFileOutputChannelContext = CONTEXT_ACTIVE_FILE_OUTPUT.bindTo(contextKeyService);
    this.activeOutputChannelLevelSettableContext = CONTEXT_ACTIVE_OUTPUT_LEVEL_SETTABLE.bindTo(contextKeyService);
    this.activeOutputChannelLevelContext = CONTEXT_ACTIVE_OUTPUT_LEVEL.bindTo(contextKeyService);
    this.activeOutputChannelLevelIsDefaultContext = CONTEXT_ACTIVE_OUTPUT_LEVEL_IS_DEFAULT.bindTo(contextKeyService);
    this._register(textModelResolverService.registerTextModelContentProvider(Schemas.outputChannel, this));
    this._register(instantiationService.createInstance(OutputLinkProvider));
    const registry = Registry.as(Extensions.OutputChannels);
    for (const channelIdentifier of registry.getChannels()) {
      this.onDidRegisterChannel(channelIdentifier.id);
    }
    this._register(registry.onDidRegisterChannel(this.onDidRegisterChannel, this));
    if (!this.activeChannel) {
      const channels = this.getChannelDescriptors();
      this.setActiveChannel(channels && channels.length > 0 ? this.getChannel(channels[0].id) : void 0);
    }
    this._register(Event.filter(this.viewsService.onDidChangeViewVisibility, (e) => e.id === OUTPUT_VIEW_ID && e.visible)(() => {
      if (this.activeChannel) {
        this.viewsService.getActiveViewWithId(OUTPUT_VIEW_ID)?.showChannel(this.activeChannel, true);
      }
    }));
    this._register(this.loggerService.onDidChangeLogLevel((_level) => {
      this.setLevelContext();
      this.setLevelIsDefaultContext();
    }));
    this._register(this.defaultLogLevelsService.onDidChangeDefaultLogLevels(() => {
      this.setLevelIsDefaultContext();
    }));
    this._register(this.lifecycleService.onDidShutdown(() => this.dispose()));
  }
  static {
    __name(this, "OutputService");
  }
  channels = /* @__PURE__ */ new Map();
  activeChannelIdInStorage;
  activeChannel;
  _onActiveOutputChannel = this._register(new Emitter());
  onActiveOutputChannel = this._onActiveOutputChannel.event;
  activeOutputChannelContext;
  activeFileOutputChannelContext;
  activeOutputChannelLevelSettableContext;
  activeOutputChannelLevelContext;
  activeOutputChannelLevelIsDefaultContext;
  provideTextContent(resource) {
    const channel = this.getChannel(resource.path);
    if (channel) {
      return channel.model.loadModel();
    }
    return null;
  }
  async showChannel(id, preserveFocus) {
    const channel = this.getChannel(id);
    if (this.activeChannel?.id !== channel?.id) {
      this.setActiveChannel(channel);
      this._onActiveOutputChannel.fire(id);
    }
    const outputView = await this.viewsService.openView(OUTPUT_VIEW_ID, !preserveFocus);
    if (outputView && channel) {
      outputView.showChannel(channel, !!preserveFocus);
    }
  }
  getChannel(id) {
    return this.channels.get(id);
  }
  getChannelDescriptor(id) {
    return Registry.as(Extensions.OutputChannels).getChannel(id);
  }
  getChannelDescriptors() {
    return Registry.as(Extensions.OutputChannels).getChannels();
  }
  getActiveChannel() {
    return this.activeChannel;
  }
  async onDidRegisterChannel(channelId) {
    const channel = this.createChannel(channelId);
    this.channels.set(channelId, channel);
    if (!this.activeChannel || this.activeChannelIdInStorage === channelId) {
      this.setActiveChannel(channel);
      this._onActiveOutputChannel.fire(channelId);
      const outputView = this.viewsService.getActiveViewWithId(OUTPUT_VIEW_ID);
      outputView?.showChannel(channel, true);
    }
  }
  createChannel(id) {
    const channel = this.instantiateChannel(id);
    this._register(Event.once(channel.model.onDispose)(() => {
      if (this.activeChannel === channel) {
        const channels = this.getChannelDescriptors();
        const channel2 = channels.length ? this.getChannel(channels[0].id) : void 0;
        if (channel2 && this.viewsService.isViewVisible(OUTPUT_VIEW_ID)) {
          this.showChannel(channel2.id);
        } else {
          this.setActiveChannel(void 0);
        }
      }
      Registry.as(Extensions.OutputChannels).removeChannel(id);
    }));
    return channel;
  }
  instantiateChannel(id) {
    const channelData = Registry.as(Extensions.OutputChannels).getChannel(id);
    if (!channelData) {
      this.logService.error(`Channel '${id}' is not registered yet`);
      throw new Error(`Channel '${id}' is not registered yet`);
    }
    return this.instantiationService.createInstance(OutputChannel, channelData);
  }
  setLevelContext() {
    const descriptor = this.activeChannel?.outputChannelDescriptor;
    const channelLogLevel = descriptor?.log ? this.loggerService.getLogLevel(descriptor.file) : void 0;
    this.activeOutputChannelLevelContext.set(channelLogLevel !== void 0 ? LogLevelToString(channelLogLevel) : "");
  }
  async setLevelIsDefaultContext() {
    const descriptor = this.activeChannel?.outputChannelDescriptor;
    if (descriptor?.log) {
      const channelLogLevel = this.loggerService.getLogLevel(descriptor.file);
      const channelDefaultLogLevel = await this.defaultLogLevelsService.getDefaultLogLevel(descriptor.extensionId);
      this.activeOutputChannelLevelIsDefaultContext.set(channelDefaultLogLevel === channelLogLevel);
    } else {
      this.activeOutputChannelLevelIsDefaultContext.set(false);
    }
  }
  setActiveChannel(channel) {
    this.activeChannel = channel;
    const descriptor = channel?.outputChannelDescriptor;
    this.activeFileOutputChannelContext.set(!!descriptor?.file);
    this.activeOutputChannelLevelSettableContext.set(descriptor !== void 0 && SetLogLevelAction.isLevelSettable(descriptor));
    this.setLevelIsDefaultContext();
    this.setLevelContext();
    if (this.activeChannel) {
      this.storageService.store(OUTPUT_ACTIVE_CHANNEL_KEY, this.activeChannel.id, StorageScope.WORKSPACE, StorageTarget.MACHINE);
    } else {
      this.storageService.remove(OUTPUT_ACTIVE_CHANNEL_KEY, StorageScope.WORKSPACE);
    }
  }
};
OutputService = __decorateClass([
  __decorateParam(0, IStorageService),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, ITextModelService),
  __decorateParam(3, ILogService),
  __decorateParam(4, ILoggerService),
  __decorateParam(5, ILifecycleService),
  __decorateParam(6, IViewsService),
  __decorateParam(7, IContextKeyService),
  __decorateParam(8, IDefaultLogLevelsService)
], OutputService);
export {
  OutputService
};
//# sourceMappingURL=outputServices.js.map
