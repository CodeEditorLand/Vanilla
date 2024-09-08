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
import { Color, RGBA } from "../../../../base/common/color.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IEditorWorkerService } from "../../../common/services/editorWorker.js";
import { ILanguageFeaturesService } from "../../../common/services/languageFeatures.js";
let DefaultDocumentColorProvider = class {
  constructor(_editorWorkerService) {
    this._editorWorkerService = _editorWorkerService;
  }
  async provideDocumentColors(model, _token) {
    return this._editorWorkerService.computeDefaultDocumentColors(
      model.uri
    );
  }
  provideColorPresentations(_model, colorInfo, _token) {
    const range = colorInfo.range;
    const colorFromInfo = colorInfo.color;
    const alpha = colorFromInfo.alpha;
    const color = new Color(
      new RGBA(
        Math.round(255 * colorFromInfo.red),
        Math.round(255 * colorFromInfo.green),
        Math.round(255 * colorFromInfo.blue),
        alpha
      )
    );
    const rgb = alpha ? Color.Format.CSS.formatRGB(color) : Color.Format.CSS.formatRGBA(color);
    const hsl = alpha ? Color.Format.CSS.formatHSL(color) : Color.Format.CSS.formatHSLA(color);
    const hex = alpha ? Color.Format.CSS.formatHex(color) : Color.Format.CSS.formatHexA(color);
    const colorPresentations = [];
    colorPresentations.push({
      label: rgb,
      textEdit: { range, text: rgb }
    });
    colorPresentations.push({
      label: hsl,
      textEdit: { range, text: hsl }
    });
    colorPresentations.push({
      label: hex,
      textEdit: { range, text: hex }
    });
    return colorPresentations;
  }
};
DefaultDocumentColorProvider = __decorateClass([
  __decorateParam(0, IEditorWorkerService)
], DefaultDocumentColorProvider);
let DefaultDocumentColorProviderFeature = class extends Disposable {
  constructor(_languageFeaturesService, editorWorkerService) {
    super();
    this._register(
      _languageFeaturesService.colorProvider.register(
        "*",
        new DefaultDocumentColorProvider(editorWorkerService)
      )
    );
  }
};
DefaultDocumentColorProviderFeature = __decorateClass([
  __decorateParam(0, ILanguageFeaturesService),
  __decorateParam(1, IEditorWorkerService)
], DefaultDocumentColorProviderFeature);
export {
  DefaultDocumentColorProvider,
  DefaultDocumentColorProviderFeature
};
