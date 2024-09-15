var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Event } from "../../../../base/common/event.js";
import { ITextModel } from "../../../common/model.js";
import { ITreeSitterParserService, ITreeSitterParseResult } from "../../../common/services/treeSitterParserService.js";
class TestTreeSitterParserService {
  static {
    __name(this, "TestTreeSitterParserService");
  }
  onDidAddLanguage = Event.None;
  _serviceBrand;
  getOrInitLanguage(languageId) {
    throw new Error("Method not implemented.");
  }
  waitForLanguage(languageId) {
    throw new Error("Method not implemented.");
  }
  getParseResult(textModel) {
    throw new Error("Method not implemented.");
  }
}
export {
  TestTreeSitterParserService
};
//# sourceMappingURL=testTreeSitterService.js.map
