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
import { InstantiationType, registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { IWorkbenchEnvironmentService } from "../../../services/environment/common/environmentService.js";
import { createDecorator, IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { toLocalISOString } from "../../../../base/common/date.js";
import { joinPath } from "../../../../base/common/resources.js";
import { DelegatedOutputChannelModel, FileOutputChannelModel, IOutputChannelModel } from "./outputChannelModel.js";
import { URI } from "../../../../base/common/uri.js";
import { ILanguageSelection } from "../../../../editor/common/languages/language.js";
const IOutputChannelModelService = createDecorator("outputChannelModelService");
let OutputChannelModelService = class {
  constructor(fileService, instantiationService, environmentService) {
    this.fileService = fileService;
    this.instantiationService = instantiationService;
    this.outputLocation = joinPath(environmentService.windowLogsPath, `output_${toLocalISOString(/* @__PURE__ */ new Date()).replace(/-|:|\.\d+Z$/g, "")}`);
  }
  static {
    __name(this, "OutputChannelModelService");
  }
  outputLocation;
  createOutputChannelModel(id, modelUri, language, file) {
    return file ? this.instantiationService.createInstance(FileOutputChannelModel, modelUri, language, file) : this.instantiationService.createInstance(DelegatedOutputChannelModel, id, modelUri, language, this.outputDir);
  }
  _outputDir = null;
  get outputDir() {
    if (!this._outputDir) {
      this._outputDir = this.fileService.createFolder(this.outputLocation).then(() => this.outputLocation);
    }
    return this._outputDir;
  }
};
OutputChannelModelService = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IWorkbenchEnvironmentService)
], OutputChannelModelService);
registerSingleton(IOutputChannelModelService, OutputChannelModelService, InstantiationType.Delayed);
export {
  IOutputChannelModelService,
  OutputChannelModelService
};
//# sourceMappingURL=outputChannelModelService.js.map
