import { Event } from "../../../base/common/event.js";
class StandaloneTreeSitterParserService {
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
