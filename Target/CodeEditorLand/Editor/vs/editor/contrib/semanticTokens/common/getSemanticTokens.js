import { CancellationToken } from "../../../../base/common/cancellation.js";
import { onUnexpectedExternalError } from "../../../../base/common/errors.js";
import { assertType } from "../../../../base/common/types.js";
import { URI } from "../../../../base/common/uri.js";
import {
  CommandsRegistry,
  ICommandService
} from "../../../../platform/commands/common/commands.js";
import { Range } from "../../../common/core/range.js";
import { ILanguageFeaturesService } from "../../../common/services/languageFeatures.js";
import { IModelService } from "../../../common/services/model.js";
import { encodeSemanticTokensDto } from "../../../common/services/semanticTokensDto.js";
function isSemanticTokens(v) {
  return v && !!v.data;
}
function isSemanticTokensEdits(v) {
  return v && Array.isArray(v.edits);
}
class DocumentSemanticTokensResult {
  constructor(provider, tokens, error) {
    this.provider = provider;
    this.tokens = tokens;
    this.error = error;
  }
}
function hasDocumentSemanticTokensProvider(registry, model) {
  return registry.has(model);
}
function getDocumentSemanticTokensProviders(registry, model) {
  const groups = registry.orderedGroups(model);
  return groups.length > 0 ? groups[0] : [];
}
async function getDocumentSemanticTokens(registry, model, lastProvider, lastResultId, token) {
  const providers = getDocumentSemanticTokensProviders(registry, model);
  const results = await Promise.all(
    providers.map(async (provider) => {
      let result;
      let error = null;
      try {
        result = await provider.provideDocumentSemanticTokens(
          model,
          provider === lastProvider ? lastResultId : null,
          token
        );
      } catch (err) {
        error = err;
        result = null;
      }
      if (!result || !isSemanticTokens(result) && !isSemanticTokensEdits(result)) {
        result = null;
      }
      return new DocumentSemanticTokensResult(provider, result, error);
    })
  );
  for (const result of results) {
    if (result.error) {
      throw result.error;
    }
    if (result.tokens) {
      return result;
    }
  }
  if (results.length > 0) {
    return results[0];
  }
  return null;
}
function _getDocumentSemanticTokensProviderHighestGroup(registry, model) {
  const result = registry.orderedGroups(model);
  return result.length > 0 ? result[0] : null;
}
class DocumentRangeSemanticTokensResult {
  constructor(provider, tokens) {
    this.provider = provider;
    this.tokens = tokens;
  }
}
function hasDocumentRangeSemanticTokensProvider(providers, model) {
  return providers.has(model);
}
function getDocumentRangeSemanticTokensProviders(providers, model) {
  const groups = providers.orderedGroups(model);
  return groups.length > 0 ? groups[0] : [];
}
async function getDocumentRangeSemanticTokens(registry, model, range, token) {
  const providers = getDocumentRangeSemanticTokensProviders(registry, model);
  const results = await Promise.all(
    providers.map(async (provider) => {
      let result;
      try {
        result = await provider.provideDocumentRangeSemanticTokens(
          model,
          range,
          token
        );
      } catch (err) {
        onUnexpectedExternalError(err);
        result = null;
      }
      if (!result || !isSemanticTokens(result)) {
        result = null;
      }
      return new DocumentRangeSemanticTokensResult(provider, result);
    })
  );
  for (const result of results) {
    if (result.tokens) {
      return result;
    }
  }
  if (results.length > 0) {
    return results[0];
  }
  return null;
}
CommandsRegistry.registerCommand(
  "_provideDocumentSemanticTokensLegend",
  async (accessor, ...args) => {
    const [uri] = args;
    assertType(uri instanceof URI);
    const model = accessor.get(IModelService).getModel(uri);
    if (!model) {
      return void 0;
    }
    const { documentSemanticTokensProvider } = accessor.get(
      ILanguageFeaturesService
    );
    const providers = _getDocumentSemanticTokensProviderHighestGroup(
      documentSemanticTokensProvider,
      model
    );
    if (!providers) {
      return accessor.get(ICommandService).executeCommand(
        "_provideDocumentRangeSemanticTokensLegend",
        uri
      );
    }
    return providers[0].getLegend();
  }
);
CommandsRegistry.registerCommand(
  "_provideDocumentSemanticTokens",
  async (accessor, ...args) => {
    const [uri] = args;
    assertType(uri instanceof URI);
    const model = accessor.get(IModelService).getModel(uri);
    if (!model) {
      return void 0;
    }
    const { documentSemanticTokensProvider } = accessor.get(
      ILanguageFeaturesService
    );
    if (!hasDocumentSemanticTokensProvider(
      documentSemanticTokensProvider,
      model
    )) {
      return accessor.get(ICommandService).executeCommand(
        "_provideDocumentRangeSemanticTokens",
        uri,
        model.getFullModelRange()
      );
    }
    const r = await getDocumentSemanticTokens(
      documentSemanticTokensProvider,
      model,
      null,
      null,
      CancellationToken.None
    );
    if (!r) {
      return void 0;
    }
    const { provider, tokens } = r;
    if (!tokens || !isSemanticTokens(tokens)) {
      return void 0;
    }
    const buff = encodeSemanticTokensDto({
      id: 0,
      type: "full",
      data: tokens.data
    });
    if (tokens.resultId) {
      provider.releaseDocumentSemanticTokens(tokens.resultId);
    }
    return buff;
  }
);
CommandsRegistry.registerCommand(
  "_provideDocumentRangeSemanticTokensLegend",
  async (accessor, ...args) => {
    const [uri, range] = args;
    assertType(uri instanceof URI);
    const model = accessor.get(IModelService).getModel(uri);
    if (!model) {
      return void 0;
    }
    const { documentRangeSemanticTokensProvider } = accessor.get(
      ILanguageFeaturesService
    );
    const providers = getDocumentRangeSemanticTokensProviders(
      documentRangeSemanticTokensProvider,
      model
    );
    if (providers.length === 0) {
      return void 0;
    }
    if (providers.length === 1) {
      return providers[0].getLegend();
    }
    if (!range || !Range.isIRange(range)) {
      console.warn(
        `provideDocumentRangeSemanticTokensLegend might be out-of-sync with provideDocumentRangeSemanticTokens unless a range argument is passed in`
      );
      return providers[0].getLegend();
    }
    const result = await getDocumentRangeSemanticTokens(
      documentRangeSemanticTokensProvider,
      model,
      Range.lift(range),
      CancellationToken.None
    );
    if (!result) {
      return void 0;
    }
    return result.provider.getLegend();
  }
);
CommandsRegistry.registerCommand(
  "_provideDocumentRangeSemanticTokens",
  async (accessor, ...args) => {
    const [uri, range] = args;
    assertType(uri instanceof URI);
    assertType(Range.isIRange(range));
    const model = accessor.get(IModelService).getModel(uri);
    if (!model) {
      return void 0;
    }
    const { documentRangeSemanticTokensProvider } = accessor.get(
      ILanguageFeaturesService
    );
    const result = await getDocumentRangeSemanticTokens(
      documentRangeSemanticTokensProvider,
      model,
      Range.lift(range),
      CancellationToken.None
    );
    if (!result || !result.tokens) {
      return void 0;
    }
    return encodeSemanticTokensDto({
      id: 0,
      type: "full",
      data: result.tokens.data
    });
  }
);
export {
  DocumentSemanticTokensResult,
  getDocumentRangeSemanticTokens,
  getDocumentSemanticTokens,
  hasDocumentRangeSemanticTokensProvider,
  hasDocumentSemanticTokensProvider,
  isSemanticTokens,
  isSemanticTokensEdits
};
