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
import { RunOnceScheduler } from "../../../../base/common/async.js";
import { DisposableStore } from "../../../../base/common/lifecycle.js";
import { LRUCache } from "../../../../base/common/map.js";
import { TernarySearchTree } from "../../../../base/common/ternarySearchTree.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import {
  InstantiationType,
  registerSingleton
} from "../../../../platform/instantiation/common/extensions.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import {
  IStorageService,
  StorageScope,
  StorageTarget,
  WillSaveStateReason
} from "../../../../platform/storage/common/storage.js";
import {
  CompletionItemKinds
} from "../../../common/languages.js";
class Memory {
  constructor(name) {
    this.name = name;
  }
  static {
    __name(this, "Memory");
  }
  select(model, pos, items) {
    if (items.length === 0) {
      return 0;
    }
    const topScore = items[0].score[0];
    for (let i = 0; i < items.length; i++) {
      const { score, completion: suggestion } = items[i];
      if (score[0] !== topScore) {
        break;
      }
      if (suggestion.preselect) {
        return i;
      }
    }
    return 0;
  }
}
class NoMemory extends Memory {
  static {
    __name(this, "NoMemory");
  }
  constructor() {
    super("first");
  }
  memorize(model, pos, item) {
  }
  toJSON() {
    return void 0;
  }
  fromJSON() {
  }
}
class LRUMemory extends Memory {
  static {
    __name(this, "LRUMemory");
  }
  constructor() {
    super("recentlyUsed");
  }
  _cache = new LRUCache(300, 0.66);
  _seq = 0;
  memorize(model, pos, item) {
    const key = `${model.getLanguageId()}/${item.textLabel}`;
    this._cache.set(key, {
      touch: this._seq++,
      type: item.completion.kind,
      insertText: item.completion.insertText
    });
  }
  select(model, pos, items) {
    if (items.length === 0) {
      return 0;
    }
    const lineSuffix = model.getLineContent(pos.lineNumber).substr(pos.column - 10, pos.column - 1);
    if (/\s$/.test(lineSuffix)) {
      return super.select(model, pos, items);
    }
    const topScore = items[0].score[0];
    let indexPreselect = -1;
    let indexRecency = -1;
    let seq = -1;
    for (let i = 0; i < items.length; i++) {
      if (items[i].score[0] !== topScore) {
        break;
      }
      const key = `${model.getLanguageId()}/${items[i].textLabel}`;
      const item = this._cache.peek(key);
      if (item && item.touch > seq && item.type === items[i].completion.kind && item.insertText === items[i].completion.insertText) {
        seq = item.touch;
        indexRecency = i;
      }
      if (items[i].completion.preselect && indexPreselect === -1) {
        return indexPreselect = i;
      }
    }
    if (indexRecency !== -1) {
      return indexRecency;
    } else if (indexPreselect !== -1) {
      return indexPreselect;
    } else {
      return 0;
    }
  }
  toJSON() {
    return this._cache.toJSON();
  }
  fromJSON(data) {
    this._cache.clear();
    const seq = 0;
    for (const [key, value] of data) {
      value.touch = seq;
      value.type = typeof value.type === "number" ? value.type : CompletionItemKinds.fromString(value.type);
      this._cache.set(key, value);
    }
    this._seq = this._cache.size;
  }
}
class PrefixMemory extends Memory {
  static {
    __name(this, "PrefixMemory");
  }
  constructor() {
    super("recentlyUsedByPrefix");
  }
  _trie = TernarySearchTree.forStrings();
  _seq = 0;
  memorize(model, pos, item) {
    const { word } = model.getWordUntilPosition(pos);
    const key = `${model.getLanguageId()}/${word}`;
    this._trie.set(key, {
      type: item.completion.kind,
      insertText: item.completion.insertText,
      touch: this._seq++
    });
  }
  select(model, pos, items) {
    const { word } = model.getWordUntilPosition(pos);
    if (!word) {
      return super.select(model, pos, items);
    }
    const key = `${model.getLanguageId()}/${word}`;
    let item = this._trie.get(key);
    if (!item) {
      item = this._trie.findSubstr(key);
    }
    if (item) {
      for (let i = 0; i < items.length; i++) {
        const { kind, insertText } = items[i].completion;
        if (kind === item.type && insertText === item.insertText) {
          return i;
        }
      }
    }
    return super.select(model, pos, items);
  }
  toJSON() {
    const entries = [];
    this._trie.forEach((value, key) => entries.push([key, value]));
    entries.sort((a, b) => -(a[1].touch - b[1].touch)).forEach((value, i) => value[1].touch = i);
    return entries.slice(0, 200);
  }
  fromJSON(data) {
    this._trie.clear();
    if (data.length > 0) {
      this._seq = data[0][1].touch + 1;
      for (const [key, value] of data) {
        value.type = typeof value.type === "number" ? value.type : CompletionItemKinds.fromString(value.type);
        this._trie.set(key, value);
      }
    }
  }
}
let SuggestMemoryService = class {
  constructor(_storageService, _configService) {
    this._storageService = _storageService;
    this._configService = _configService;
    this._persistSoon = new RunOnceScheduler(() => this._saveState(), 500);
    this._disposables.add(_storageService.onWillSaveState((e) => {
      if (e.reason === WillSaveStateReason.SHUTDOWN) {
        this._saveState();
      }
    }));
  }
  static {
    __name(this, "SuggestMemoryService");
  }
  static _strategyCtors = /* @__PURE__ */ new Map([
    ["recentlyUsedByPrefix", PrefixMemory],
    ["recentlyUsed", LRUMemory],
    ["first", NoMemory]
  ]);
  static _storagePrefix = "suggest/memories";
  _serviceBrand;
  _persistSoon;
  _disposables = new DisposableStore();
  _strategy;
  dispose() {
    this._disposables.dispose();
    this._persistSoon.dispose();
  }
  memorize(model, pos, item) {
    this._withStrategy(model, pos).memorize(model, pos, item);
    this._persistSoon.schedule();
  }
  select(model, pos, items) {
    return this._withStrategy(model, pos).select(model, pos, items);
  }
  _withStrategy(model, pos) {
    const mode = this._configService.getValue(
      "editor.suggestSelection",
      {
        overrideIdentifier: model.getLanguageIdAtPosition(
          pos.lineNumber,
          pos.column
        ),
        resource: model.uri
      }
    );
    if (this._strategy?.name !== mode) {
      this._saveState();
      const ctor = SuggestMemoryService._strategyCtors.get(mode) || NoMemory;
      this._strategy = new ctor();
      try {
        const share = this._configService.getValue(
          "editor.suggest.shareSuggestSelections"
        );
        const scope = share ? StorageScope.PROFILE : StorageScope.WORKSPACE;
        const raw = this._storageService.get(
          `${SuggestMemoryService._storagePrefix}/${mode}`,
          scope
        );
        if (raw) {
          this._strategy.fromJSON(JSON.parse(raw));
        }
      } catch (e) {
      }
    }
    return this._strategy;
  }
  _saveState() {
    if (this._strategy) {
      const share = this._configService.getValue(
        "editor.suggest.shareSuggestSelections"
      );
      const scope = share ? StorageScope.PROFILE : StorageScope.WORKSPACE;
      const raw = JSON.stringify(this._strategy);
      this._storageService.store(
        `${SuggestMemoryService._storagePrefix}/${this._strategy.name}`,
        raw,
        scope,
        StorageTarget.MACHINE
      );
    }
  }
};
SuggestMemoryService = __decorateClass([
  __decorateParam(0, IStorageService),
  __decorateParam(1, IConfigurationService)
], SuggestMemoryService);
const ISuggestMemoryService = createDecorator("ISuggestMemories");
registerSingleton(
  ISuggestMemoryService,
  SuggestMemoryService,
  InstantiationType.Delayed
);
export {
  ISuggestMemoryService,
  LRUMemory,
  Memory,
  NoMemory,
  PrefixMemory,
  SuggestMemoryService
};
//# sourceMappingURL=suggestMemory.js.map
