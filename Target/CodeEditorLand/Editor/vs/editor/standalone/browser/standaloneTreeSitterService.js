var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Event } from "../../../base/common/event.js";
class StandaloneTreeSitterParserService {
  static {
    __name(this, "StandaloneTreeSitterParserService");
  }
  _serviceBrand;
  onDidAddLanguage = Event.None;
  getOrInitLanguage(_languageId) {
    return void 0;
  }
  getParseResult(textModel) {
    return void 0;
  }
}
export {
  StandaloneTreeSitterParserService
};
//# sourceMappingURL=standaloneTreeSitterService.js.map
