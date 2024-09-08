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
import { Disposable } from "../../../../base/common/lifecycle.js";
import { ResourceMap } from "../../../../base/common/map.js";
import { USUAL_WORD_SEPARATORS } from "../../../common/core/wordHelper.js";
import {
  DocumentHighlightKind
} from "../../../common/languages.js";
import { ILanguageFeaturesService } from "../../../common/services/languageFeatures.js";
class TextualDocumentHighlightProvider {
  selector = { language: "*" };
  provideDocumentHighlights(model, position, token) {
    const result = [];
    const word = model.getWordAtPosition({
      lineNumber: position.lineNumber,
      column: position.column
    });
    if (!word) {
      return Promise.resolve(result);
    }
    if (model.isDisposed()) {
      return;
    }
    const matches = model.findMatches(
      word.word,
      true,
      false,
      true,
      USUAL_WORD_SEPARATORS,
      false
    );
    return matches.map((m) => ({
      range: m.range,
      kind: DocumentHighlightKind.Text
    }));
  }
  provideMultiDocumentHighlights(primaryModel, position, otherModels, token) {
    const result = new ResourceMap();
    const word = primaryModel.getWordAtPosition({
      lineNumber: position.lineNumber,
      column: position.column
    });
    if (!word) {
      return Promise.resolve(result);
    }
    for (const model of [primaryModel, ...otherModels]) {
      if (model.isDisposed()) {
        continue;
      }
      const matches = model.findMatches(
        word.word,
        true,
        false,
        true,
        USUAL_WORD_SEPARATORS,
        false
      );
      const highlights = matches.map((m) => ({
        range: m.range,
        kind: DocumentHighlightKind.Text
      }));
      if (highlights) {
        result.set(model.uri, highlights);
      }
    }
    return result;
  }
}
let TextualMultiDocumentHighlightFeature = class extends Disposable {
  constructor(languageFeaturesService) {
    super();
    this._register(languageFeaturesService.documentHighlightProvider.register("*", new TextualDocumentHighlightProvider()));
    this._register(languageFeaturesService.multiDocumentHighlightProvider.register("*", new TextualDocumentHighlightProvider()));
  }
};
TextualMultiDocumentHighlightFeature = __decorateClass([
  __decorateParam(0, ILanguageFeaturesService)
], TextualMultiDocumentHighlightFeature);
export {
  TextualMultiDocumentHighlightFeature
};
