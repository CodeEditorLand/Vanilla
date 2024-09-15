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
import { INativeWorkbenchEnvironmentService } from "../../../services/environment/electron-sandbox/environmentService.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { IConfigurationNode, IConfigurationRegistry, Extensions, IConfigurationPropertySchema } from "../../../../platform/configuration/common/configurationRegistry.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { VSBuffer } from "../../../../base/common/buffer.js";
import { URI } from "../../../../base/common/uri.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
let DefaultConfigurationExportHelper = class {
  constructor(environmentService, extensionService, commandService, fileService, productService) {
    this.extensionService = extensionService;
    this.commandService = commandService;
    this.fileService = fileService;
    this.productService = productService;
    const exportDefaultConfigurationPath = environmentService.args["export-default-configuration"];
    if (exportDefaultConfigurationPath) {
      this.writeConfigModelAndQuit(URI.file(exportDefaultConfigurationPath));
    }
  }
  static {
    __name(this, "DefaultConfigurationExportHelper");
  }
  async writeConfigModelAndQuit(target) {
    try {
      await this.extensionService.whenInstalledExtensionsRegistered();
      await this.writeConfigModel(target);
    } finally {
      this.commandService.executeCommand("workbench.action.quit");
    }
  }
  async writeConfigModel(target) {
    const config = this.getConfigModel();
    const resultString = JSON.stringify(config, void 0, "  ");
    await this.fileService.writeFile(target, VSBuffer.fromString(resultString));
  }
  getConfigModel() {
    const configRegistry = Registry.as(Extensions.Configuration);
    const configurations = configRegistry.getConfigurations().slice();
    const settings = [];
    const processedNames = /* @__PURE__ */ new Set();
    const processProperty = /* @__PURE__ */ __name((name, prop) => {
      if (processedNames.has(name)) {
        console.warn("Setting is registered twice: " + name);
        return;
      }
      processedNames.add(name);
      const propDetails = {
        name,
        description: prop.description || prop.markdownDescription || "",
        default: prop.default,
        type: prop.type
      };
      if (prop.enum) {
        propDetails.enum = prop.enum;
      }
      if (prop.enumDescriptions || prop.markdownEnumDescriptions) {
        propDetails.enumDescriptions = prop.enumDescriptions || prop.markdownEnumDescriptions;
      }
      settings.push(propDetails);
    }, "processProperty");
    const processConfig = /* @__PURE__ */ __name((config) => {
      if (config.properties) {
        for (const name in config.properties) {
          processProperty(name, config.properties[name]);
        }
      }
      config.allOf?.forEach(processConfig);
    }, "processConfig");
    configurations.forEach(processConfig);
    const excludedProps = configRegistry.getExcludedConfigurationProperties();
    for (const name in excludedProps) {
      processProperty(name, excludedProps[name]);
    }
    const result = {
      settings: settings.sort((a, b) => a.name.localeCompare(b.name)),
      buildTime: Date.now(),
      commit: this.productService.commit,
      buildNumber: this.productService.settingsSearchBuildId
    };
    return result;
  }
};
DefaultConfigurationExportHelper = __decorateClass([
  __decorateParam(0, INativeWorkbenchEnvironmentService),
  __decorateParam(1, IExtensionService),
  __decorateParam(2, ICommandService),
  __decorateParam(3, IFileService),
  __decorateParam(4, IProductService)
], DefaultConfigurationExportHelper);
export {
  DefaultConfigurationExportHelper
};
//# sourceMappingURL=configurationExportHelper.js.map
