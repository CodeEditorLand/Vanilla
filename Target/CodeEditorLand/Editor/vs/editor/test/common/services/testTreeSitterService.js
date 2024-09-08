import { Event } from "../../../../base/common/event.js";
class TestTreeSitterParserService {
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
