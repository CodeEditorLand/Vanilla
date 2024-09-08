import { Emitter } from "../../../../base/common/event.js";
import {
  Disposable
} from "../../../../base/common/lifecycle.js";
import {
  LanguageConfigurationRegistry,
  LanguageConfigurationServiceChangeEvent,
  ResolvedLanguageConfiguration
} from "../../../common/languages/languageConfigurationRegistry.js";
class TestLanguageConfigurationService extends Disposable {
  _serviceBrand;
  _registry = this._register(
    new LanguageConfigurationRegistry()
  );
  _onDidChange = this._register(
    new Emitter()
  );
  onDidChange = this._onDidChange.event;
  constructor() {
    super();
    this._register(
      this._registry.onDidChange(
        (e) => this._onDidChange.fire(
          new LanguageConfigurationServiceChangeEvent(e.languageId)
        )
      )
    );
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
