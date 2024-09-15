var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter } from "../../../../base/common/event.js";
import { Disposable, IDisposable } from "../../../../base/common/lifecycle.js";
import { LanguageConfiguration } from "../../../common/languages/languageConfiguration.js";
import { ILanguageConfigurationService, LanguageConfigurationRegistry, LanguageConfigurationServiceChangeEvent, ResolvedLanguageConfiguration } from "../../../common/languages/languageConfigurationRegistry.js";
class TestLanguageConfigurationService extends Disposable {
  static {
    __name(this, "TestLanguageConfigurationService");
  }
  _serviceBrand;
  _registry = this._register(new LanguageConfigurationRegistry());
  _onDidChange = this._register(new Emitter());
  onDidChange = this._onDidChange.event;
  constructor() {
    super();
    this._register(this._registry.onDidChange((e) => this._onDidChange.fire(new LanguageConfigurationServiceChangeEvent(e.languageId))));
  }
  register(languageId, configuration, priority) {
    return this._registry.register(languageId, configuration, priority);
  }
  getLanguageConfiguration(languageId) {
    return this._registry.getLanguageConfiguration(languageId) ?? new ResolvedLanguageConfiguration("unknown", {});
  }
}
export {
  TestLanguageConfigurationService
};
//# sourceMappingURL=testLanguageConfigurationService.js.map
