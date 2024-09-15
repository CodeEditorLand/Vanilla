var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { illegalArgument, onUnexpectedExternalError } from "../../../../base/common/errors.js";
import { DisposableStore } from "../../../../base/common/lifecycle.js";
import { assertType } from "../../../../base/common/types.js";
import { URI } from "../../../../base/common/uri.js";
import { ITextModel } from "../../../common/model.js";
import { CodeLens, CodeLensList, CodeLensProvider } from "../../../common/languages.js";
import { IModelService } from "../../../common/services/model.js";
import { CommandsRegistry } from "../../../../platform/commands/common/commands.js";
import { LanguageFeatureRegistry } from "../../../common/languageFeatureRegistry.js";
import { ILanguageFeaturesService } from "../../../common/services/languageFeatures.js";
class CodeLensModel {
  static {
    __name(this, "CodeLensModel");
  }
  lenses = [];
  _disposables = new DisposableStore();
  dispose() {
    this._disposables.dispose();
  }
  get isDisposed() {
    return this._disposables.isDisposed;
  }
  add(list, provider) {
    this._disposables.add(list);
    for (const symbol of list.lenses) {
      this.lenses.push({ symbol, provider });
    }
  }
}
async function getCodeLensModel(registry, model, token) {
  const provider = registry.ordered(model);
  const providerRanks = /* @__PURE__ */ new Map();
  const result = new CodeLensModel();
  const promises = provider.map(async (provider2, i) => {
    providerRanks.set(provider2, i);
    try {
      const list = await Promise.resolve(provider2.provideCodeLenses(model, token));
      if (list) {
        result.add(list, provider2);
      }
    } catch (err) {
      onUnexpectedExternalError(err);
    }
  });
  await Promise.all(promises);
  result.lenses = result.lenses.sort((a, b) => {
    if (a.symbol.range.startLineNumber < b.symbol.range.startLineNumber) {
      return -1;
    } else if (a.symbol.range.startLineNumber > b.symbol.range.startLineNumber) {
      return 1;
    } else if (providerRanks.get(a.provider) < providerRanks.get(b.provider)) {
      return -1;
    } else if (providerRanks.get(a.provider) > providerRanks.get(b.provider)) {
      return 1;
    } else if (a.symbol.range.startColumn < b.symbol.range.startColumn) {
      return -1;
    } else if (a.symbol.range.startColumn > b.symbol.range.startColumn) {
      return 1;
    } else {
      return 0;
    }
  });
  return result;
}
__name(getCodeLensModel, "getCodeLensModel");
CommandsRegistry.registerCommand("_executeCodeLensProvider", function(accessor, ...args) {
  let [uri, itemResolveCount] = args;
  assertType(URI.isUri(uri));
  assertType(typeof itemResolveCount === "number" || !itemResolveCount);
  const { codeLensProvider } = accessor.get(ILanguageFeaturesService);
  const model = accessor.get(IModelService).getModel(uri);
  if (!model) {
    throw illegalArgument();
  }
  const result = [];
  const disposables = new DisposableStore();
  return getCodeLensModel(codeLensProvider, model, CancellationToken.None).then((value) => {
    disposables.add(value);
    const resolve = [];
    for (const item of value.lenses) {
      if (itemResolveCount === void 0 || itemResolveCount === null || Boolean(item.symbol.command)) {
        result.push(item.symbol);
      } else if (itemResolveCount-- > 0 && item.provider.resolveCodeLens) {
        resolve.push(Promise.resolve(item.provider.resolveCodeLens(model, item.symbol, CancellationToken.None)).then((symbol) => result.push(symbol || item.symbol)));
      }
    }
    return Promise.all(resolve);
  }).then(() => {
    return result;
  }).finally(() => {
    setTimeout(() => disposables.dispose(), 100);
  });
});
export {
  CodeLensModel,
  getCodeLensModel
};
//# sourceMappingURL=codelens.js.map
