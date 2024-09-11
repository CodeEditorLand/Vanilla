var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { Disposable, IReference } from "../../../../base/common/lifecycle.js";
import { ResourceMap } from "../../../../base/common/map.js";
import { Schemas } from "../../../../base/common/network.js";
import { URI } from "../../../../base/common/uri.js";
import { Range } from "../../../../editor/common/core/range.js";
import { ILanguageService } from "../../../../editor/common/languages/language.js";
import { EndOfLinePreference } from "../../../../editor/common/model.js";
import { IResolvedTextEditorModel, ITextModelService } from "../../../../editor/common/services/resolverService.js";
import { IChatRequestViewModel, IChatResponseViewModel, isResponseVM } from "./chatViewModel.js";
import { extractVulnerabilitiesFromText, IMarkdownVulnerability } from "./annotations.js";
let CodeBlockModelCollection = class extends Disposable {
  constructor(languageService, textModelService) {
    super();
    this.languageService = languageService;
    this.textModelService = textModelService;
  }
  static {
    __name(this, "CodeBlockModelCollection");
  }
  _models = new ResourceMap();
  /**
   * Max number of models to keep in memory.
   *
   * Currently always maintains the most recently created models.
   */
  maxModelCount = 100;
  dispose() {
    super.dispose();
    this.clear();
  }
  get(sessionId, chat, codeBlockIndex) {
    const uri = this.getUri(sessionId, chat, codeBlockIndex);
    const entry = this._models.get(uri);
    if (!entry) {
      return;
    }
    return { model: entry.model.then((ref) => ref.object), vulns: entry.vulns };
  }
  getOrCreate(sessionId, chat, codeBlockIndex) {
    const existing = this.get(sessionId, chat, codeBlockIndex);
    if (existing) {
      return existing;
    }
    const uri = this.getUri(sessionId, chat, codeBlockIndex);
    const ref = this.textModelService.createModelReference(uri);
    this._models.set(uri, { model: ref, vulns: [] });
    while (this._models.size > this.maxModelCount) {
      const first = Array.from(this._models.keys()).at(0);
      if (!first) {
        break;
      }
      this.delete(first);
    }
    return { model: ref.then((ref2) => ref2.object), vulns: [] };
  }
  delete(codeBlockUri) {
    const entry = this._models.get(codeBlockUri);
    if (!entry) {
      return;
    }
    entry.model.then((ref) => ref.dispose());
    this._models.delete(codeBlockUri);
  }
  clear() {
    this._models.forEach(async (entry) => (await entry.model).dispose());
    this._models.clear();
  }
  async update(sessionId, chat, codeBlockIndex, content) {
    const entry = this.getOrCreate(sessionId, chat, codeBlockIndex);
    const extractedVulns = extractVulnerabilitiesFromText(content.text);
    const newText = fixCodeText(extractedVulns.newText, content.languageId);
    this.setVulns(sessionId, chat, codeBlockIndex, extractedVulns.vulnerabilities);
    const textModel = (await entry.model).textEditorModel;
    if (content.languageId) {
      const vscodeLanguageId = this.languageService.getLanguageIdByLanguageName(content.languageId);
      if (vscodeLanguageId && vscodeLanguageId !== textModel.getLanguageId()) {
        textModel.setLanguage(vscodeLanguageId);
      }
    }
    const currentText = textModel.getValue(EndOfLinePreference.LF);
    if (newText === currentText) {
      return;
    }
    if (newText.startsWith(currentText)) {
      const text = newText.slice(currentText.length);
      const lastLine = textModel.getLineCount();
      const lastCol = textModel.getLineMaxColumn(lastLine);
      textModel.applyEdits([{ range: new Range(lastLine, lastCol, lastLine, lastCol), text }]);
    } else {
      textModel.setValue(newText);
    }
  }
  setVulns(sessionId, chat, codeBlockIndex, vulnerabilities) {
    const uri = this.getUri(sessionId, chat, codeBlockIndex);
    const entry = this._models.get(uri);
    if (entry) {
      entry.vulns = vulnerabilities;
    }
  }
  getUri(sessionId, chat, index) {
    const metadata = this.getUriMetaData(chat);
    return URI.from({
      scheme: Schemas.vscodeChatCodeBlock,
      authority: sessionId,
      path: `/${chat.id}/${index}`,
      fragment: metadata ? JSON.stringify(metadata) : void 0
    });
  }
  getUriMetaData(chat) {
    if (!isResponseVM(chat)) {
      return void 0;
    }
    return {
      references: chat.contentReferences.map((ref) => {
        if (typeof ref.reference === "string") {
          return;
        }
        const uriOrLocation = "variableName" in ref.reference ? ref.reference.value : ref.reference;
        if (!uriOrLocation) {
          return;
        }
        if (URI.isUri(uriOrLocation)) {
          return {
            uri: uriOrLocation.toJSON()
          };
        }
        return {
          uri: uriOrLocation.uri.toJSON(),
          range: uriOrLocation.range
        };
      })
    };
  }
};
CodeBlockModelCollection = __decorateClass([
  __decorateParam(0, ILanguageService),
  __decorateParam(1, ITextModelService)
], CodeBlockModelCollection);
function fixCodeText(text, languageId) {
  if (languageId === "php") {
    if (!text.trim().startsWith("<")) {
      return `<?php
${text}`;
    }
  }
  return text;
}
__name(fixCodeText, "fixCodeText");
export {
  CodeBlockModelCollection
};
//# sourceMappingURL=codeBlockModelCollection.js.map
