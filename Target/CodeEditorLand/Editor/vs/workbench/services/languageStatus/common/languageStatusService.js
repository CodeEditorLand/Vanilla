import { compare } from "../../../../base/common/strings.js";
import { LanguageFeatureRegistry } from "../../../../editor/common/languageFeatureRegistry.js";
import {
  InstantiationType,
  registerSingleton
} from "../../../../platform/instantiation/common/extensions.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
const ILanguageStatusService = createDecorator(
  "ILanguageStatusService"
);
class LanguageStatusServiceImpl {
  _provider = new LanguageFeatureRegistry();
  onDidChange = this._provider.onDidChange;
  addStatus(status) {
    return this._provider.register(status.selector, status);
  }
  getLanguageStatus(model) {
    return this._provider.ordered(model).sort((a, b) => {
      let res = b.severity - a.severity;
      if (res === 0) {
        res = compare(a.source, b.source);
      }
      if (res === 0) {
        res = compare(a.id, b.id);
      }
      return res;
    });
  }
}
registerSingleton(
  ILanguageStatusService,
  LanguageStatusServiceImpl,
  InstantiationType.Delayed
);
export {
  ILanguageStatusService
};
