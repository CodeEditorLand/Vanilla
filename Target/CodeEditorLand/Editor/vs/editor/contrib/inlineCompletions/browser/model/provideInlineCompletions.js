var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { assertNever } from "../../../../../base/common/assert.js";
import { DeferredPromise } from "../../../../../base/common/async.js";
import { CancellationToken } from "../../../../../base/common/cancellation.js";
import { SetMap } from "../../../../../base/common/map.js";
import { onUnexpectedExternalError } from "../../../../../base/common/errors.js";
import { IDisposable } from "../../../../../base/common/lifecycle.js";
import { ISingleEditOperation } from "../../../../common/core/editOperation.js";
import { Position } from "../../../../common/core/position.js";
import { Range } from "../../../../common/core/range.js";
import { LanguageFeatureRegistry } from "../../../../common/languageFeatureRegistry.js";
import { Command, InlineCompletion, InlineCompletionContext, InlineCompletionProviderGroupId, InlineCompletions, InlineCompletionsProvider } from "../../../../common/languages.js";
import { ILanguageConfigurationService } from "../../../../common/languages/languageConfigurationRegistry.js";
import { ITextModel } from "../../../../common/model.js";
import { fixBracketsInLine } from "../../../../common/model/bracketPairsTextModelPart/fixBrackets.js";
import { SingleTextEdit } from "../../../../common/core/textEdit.js";
import { getReadonlyEmptyArray } from "../utils.js";
import { SnippetParser, Text } from "../../../snippet/browser/snippetParser.js";
import { LineEditWithAdditionalLines } from "../../../../common/tokenizationTextModelPart.js";
import { OffsetRange } from "../../../../common/core/offsetRange.js";
async function provideInlineCompletions(registry, positionOrRange, model, context, token = CancellationToken.None, languageConfigurationService) {
  const defaultReplaceRange = positionOrRange instanceof Position ? getDefaultRange(positionOrRange, model) : positionOrRange;
  const providers = registry.all(model);
  const multiMap = new SetMap();
  for (const provider of providers) {
    if (provider.groupId) {
      multiMap.add(provider.groupId, provider);
    }
  }
  function getPreferredProviders(provider) {
    if (!provider.yieldsToGroupIds) {
      return [];
    }
    const result = [];
    for (const groupId of provider.yieldsToGroupIds || []) {
      const providers2 = multiMap.get(groupId);
      for (const p of providers2) {
        result.push(p);
      }
    }
    return result;
  }
  __name(getPreferredProviders, "getPreferredProviders");
  const states = /* @__PURE__ */ new Map();
  const seen = /* @__PURE__ */ new Set();
  function findPreferredProviderCircle(provider, stack) {
    stack = [...stack, provider];
    if (seen.has(provider)) {
      return stack;
    }
    seen.add(provider);
    try {
      const preferred = getPreferredProviders(provider);
      for (const p of preferred) {
        const c = findPreferredProviderCircle(p, stack);
        if (c) {
          return c;
        }
      }
    } finally {
      seen.delete(provider);
    }
    return void 0;
  }
  __name(findPreferredProviderCircle, "findPreferredProviderCircle");
  function processProvider(provider) {
    const state = states.get(provider);
    if (state) {
      return state;
    }
    const circle = findPreferredProviderCircle(provider, []);
    if (circle) {
      onUnexpectedExternalError(new Error(`Inline completions: cyclic yield-to dependency detected. Path: ${circle.map((s) => s.toString ? s.toString() : "" + s).join(" -> ")}`));
    }
    const deferredPromise = new DeferredPromise();
    states.set(provider, deferredPromise.p);
    (async () => {
      if (!circle) {
        const preferred = getPreferredProviders(provider);
        for (const p of preferred) {
          const result = await processProvider(p);
          if (result && result.items.length > 0) {
            return void 0;
          }
        }
      }
      try {
        if (positionOrRange instanceof Position) {
          const completions = await provider.provideInlineCompletions(model, positionOrRange, context, token);
          return completions;
        } else {
          const completions = await provider.provideInlineEditsForRange?.(model, positionOrRange, context, token);
          return completions;
        }
      } catch (e) {
        onUnexpectedExternalError(e);
        return void 0;
      }
    })().then((c) => deferredPromise.complete(c), (e) => deferredPromise.error(e));
    return deferredPromise.p;
  }
  __name(processProvider, "processProvider");
  const providerResults = await Promise.all(providers.map(async (provider) => ({ provider, completions: await processProvider(provider) })));
  const itemsByHash = /* @__PURE__ */ new Map();
  const lists = [];
  for (const result of providerResults) {
    const completions = result.completions;
    if (!completions) {
      continue;
    }
    const list = new InlineCompletionList(completions, result.provider);
    lists.push(list);
    for (const item of completions.items) {
      const inlineCompletionItem = InlineCompletionItem.from(
        item,
        list,
        defaultReplaceRange,
        model,
        languageConfigurationService
      );
      itemsByHash.set(inlineCompletionItem.hash(), inlineCompletionItem);
    }
  }
  return new InlineCompletionProviderResult(Array.from(itemsByHash.values()), new Set(itemsByHash.keys()), lists);
}
__name(provideInlineCompletions, "provideInlineCompletions");
class InlineCompletionProviderResult {
  constructor(completions, hashs, providerResults) {
    this.completions = completions;
    this.hashs = hashs;
    this.providerResults = providerResults;
  }
  static {
    __name(this, "InlineCompletionProviderResult");
  }
  has(item) {
    return this.hashs.has(item.hash());
  }
  dispose() {
    for (const result of this.providerResults) {
      result.removeRef();
    }
  }
}
class InlineCompletionList {
  constructor(inlineCompletions, provider) {
    this.inlineCompletions = inlineCompletions;
    this.provider = provider;
  }
  static {
    __name(this, "InlineCompletionList");
  }
  refCount = 1;
  addRef() {
    this.refCount++;
  }
  removeRef() {
    this.refCount--;
    if (this.refCount === 0) {
      this.provider.freeInlineCompletions(this.inlineCompletions);
    }
  }
}
class InlineCompletionItem {
  constructor(filterText, command, range, insertText, snippetInfo, additionalTextEdits, sourceInlineCompletion, source) {
    this.filterText = filterText;
    this.command = command;
    this.range = range;
    this.insertText = insertText;
    this.snippetInfo = snippetInfo;
    this.additionalTextEdits = additionalTextEdits;
    this.sourceInlineCompletion = sourceInlineCompletion;
    this.source = source;
    filterText = filterText.replace(/\r\n|\r/g, "\n");
    insertText = filterText.replace(/\r\n|\r/g, "\n");
  }
  static {
    __name(this, "InlineCompletionItem");
  }
  static from(inlineCompletion, source, defaultReplaceRange, textModel, languageConfigurationService) {
    let insertText;
    let snippetInfo;
    let range = inlineCompletion.range ? Range.lift(inlineCompletion.range) : defaultReplaceRange;
    if (typeof inlineCompletion.insertText === "string") {
      insertText = inlineCompletion.insertText;
      if (languageConfigurationService && inlineCompletion.completeBracketPairs) {
        insertText = closeBrackets(
          insertText,
          range.getStartPosition(),
          textModel,
          languageConfigurationService
        );
        const diff = insertText.length - inlineCompletion.insertText.length;
        if (diff !== 0) {
          range = new Range(range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn + diff);
        }
      }
      snippetInfo = void 0;
    } else if ("snippet" in inlineCompletion.insertText) {
      const preBracketCompletionLength = inlineCompletion.insertText.snippet.length;
      if (languageConfigurationService && inlineCompletion.completeBracketPairs) {
        inlineCompletion.insertText.snippet = closeBrackets(
          inlineCompletion.insertText.snippet,
          range.getStartPosition(),
          textModel,
          languageConfigurationService
        );
        const diff = inlineCompletion.insertText.snippet.length - preBracketCompletionLength;
        if (diff !== 0) {
          range = new Range(range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn + diff);
        }
      }
      const snippet = new SnippetParser().parse(inlineCompletion.insertText.snippet);
      if (snippet.children.length === 1 && snippet.children[0] instanceof Text) {
        insertText = snippet.children[0].value;
        snippetInfo = void 0;
      } else {
        insertText = snippet.toString();
        snippetInfo = {
          snippet: inlineCompletion.insertText.snippet,
          range
        };
      }
    } else {
      assertNever(inlineCompletion.insertText);
    }
    return new InlineCompletionItem(
      insertText,
      inlineCompletion.command,
      range,
      insertText,
      snippetInfo,
      inlineCompletion.additionalTextEdits || getReadonlyEmptyArray(),
      inlineCompletion,
      source
    );
  }
  withRange(updatedRange) {
    return new InlineCompletionItem(
      this.filterText,
      this.command,
      updatedRange,
      this.insertText,
      this.snippetInfo,
      this.additionalTextEdits,
      this.sourceInlineCompletion,
      this.source
    );
  }
  hash() {
    return JSON.stringify({ insertText: this.insertText, range: this.range.toString() });
  }
  toSingleTextEdit() {
    return new SingleTextEdit(this.range, this.insertText);
  }
}
function getDefaultRange(position, model) {
  const word = model.getWordAtPosition(position);
  const maxColumn = model.getLineMaxColumn(position.lineNumber);
  return word ? new Range(position.lineNumber, word.startColumn, position.lineNumber, maxColumn) : Range.fromPositions(position, position.with(void 0, maxColumn));
}
__name(getDefaultRange, "getDefaultRange");
function closeBrackets(text, position, model, languageConfigurationService) {
  const lineStart = model.getLineContent(position.lineNumber).substring(0, position.column - 1);
  const newLine = lineStart + text;
  const edit = LineEditWithAdditionalLines.replace(OffsetRange.ofStartAndLength(position.column - 1, newLine.length - (position.column - 1)), text);
  const newTokens = model.tokenization.tokenizeLineWithEdit(position.lineNumber, edit);
  const slicedTokens = newTokens?.mainLineTokens?.sliceAndInflate(position.column - 1, newLine.length, 0);
  if (!slicedTokens) {
    return text;
  }
  const newText = fixBracketsInLine(slicedTokens, languageConfigurationService);
  return newText;
}
__name(closeBrackets, "closeBrackets");
export {
  InlineCompletionItem,
  InlineCompletionList,
  InlineCompletionProviderResult,
  provideInlineCompletions
};
//# sourceMappingURL=provideInlineCompletions.js.map
