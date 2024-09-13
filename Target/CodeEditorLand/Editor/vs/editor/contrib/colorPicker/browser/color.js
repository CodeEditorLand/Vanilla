var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CancellationToken } from "../../../../base/common/cancellation.js";
import {
  illegalArgument,
  onUnexpectedExternalError
} from "../../../../base/common/errors.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { ILanguageFeaturesService } from "../../../common/services/languageFeatures.js";
import { IModelService } from "../../../common/services/model.js";
import { DefaultDocumentColorProvider } from "./defaultDocumentColorProvider.js";
async function getColors(colorProviderRegistry, model, token, isDefaultColorDecoratorsEnabled = true) {
  return _findColorData(
    new ColorDataCollector(),
    colorProviderRegistry,
    model,
    token,
    isDefaultColorDecoratorsEnabled
  );
}
__name(getColors, "getColors");
function getColorPresentations(model, colorInfo, provider, token) {
  return Promise.resolve(
    provider.provideColorPresentations(model, colorInfo, token)
  );
}
__name(getColorPresentations, "getColorPresentations");
class ColorDataCollector {
  static {
    __name(this, "ColorDataCollector");
  }
  constructor() {
  }
  async compute(provider, model, token, colors) {
    const documentColors = await provider.provideDocumentColors(
      model,
      token
    );
    if (Array.isArray(documentColors)) {
      for (const colorInfo of documentColors) {
        colors.push({ colorInfo, provider });
      }
    }
    return Array.isArray(documentColors);
  }
}
class ExtColorDataCollector {
  static {
    __name(this, "ExtColorDataCollector");
  }
  constructor() {
  }
  async compute(provider, model, token, colors) {
    const documentColors = await provider.provideDocumentColors(
      model,
      token
    );
    if (Array.isArray(documentColors)) {
      for (const colorInfo of documentColors) {
        colors.push({
          range: colorInfo.range,
          color: [
            colorInfo.color.red,
            colorInfo.color.green,
            colorInfo.color.blue,
            colorInfo.color.alpha
          ]
        });
      }
    }
    return Array.isArray(documentColors);
  }
}
class ColorPresentationsCollector {
  constructor(colorInfo) {
    this.colorInfo = colorInfo;
  }
  static {
    __name(this, "ColorPresentationsCollector");
  }
  async compute(provider, model, _token, colors) {
    const documentColors = await provider.provideColorPresentations(
      model,
      this.colorInfo,
      CancellationToken.None
    );
    if (Array.isArray(documentColors)) {
      colors.push(...documentColors);
    }
    return Array.isArray(documentColors);
  }
}
async function _findColorData(collector, colorProviderRegistry, model, token, isDefaultColorDecoratorsEnabled) {
  let validDocumentColorProviderFound = false;
  let defaultProvider;
  const colorData = [];
  const documentColorProviders = colorProviderRegistry.ordered(model);
  for (let i = documentColorProviders.length - 1; i >= 0; i--) {
    const provider = documentColorProviders[i];
    if (provider instanceof DefaultDocumentColorProvider) {
      defaultProvider = provider;
    } else {
      try {
        if (await collector.compute(provider, model, token, colorData)) {
          validDocumentColorProviderFound = true;
        }
      } catch (e) {
        onUnexpectedExternalError(e);
      }
    }
  }
  if (validDocumentColorProviderFound) {
    return colorData;
  }
  if (defaultProvider && isDefaultColorDecoratorsEnabled) {
    await collector.compute(defaultProvider, model, token, colorData);
    return colorData;
  }
  return [];
}
__name(_findColorData, "_findColorData");
function _setupColorCommand(accessor, resource) {
  const { colorProvider: colorProviderRegistry } = accessor.get(
    ILanguageFeaturesService
  );
  const model = accessor.get(IModelService).getModel(resource);
  if (!model) {
    throw illegalArgument();
  }
  const isDefaultColorDecoratorsEnabled = accessor.get(IConfigurationService).getValue("editor.defaultColorDecorators", { resource });
  return { model, colorProviderRegistry, isDefaultColorDecoratorsEnabled };
}
__name(_setupColorCommand, "_setupColorCommand");
export {
  ColorPresentationsCollector,
  ExtColorDataCollector,
  _findColorData,
  _setupColorCommand,
  getColorPresentations,
  getColors
};
//# sourceMappingURL=color.js.map
