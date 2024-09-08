import { isNonEmptyArray } from "../../../../base/common/arrays.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { onUnexpectedExternalError } from "../../../../base/common/errors.js";
import {
  RefCountedDisposable
} from "../../../../base/common/lifecycle.js";
import { assertType } from "../../../../base/common/types.js";
import { URI } from "../../../../base/common/uri.js";
import {
  Position
} from "../../../../editor/common/core/position.js";
import { Range } from "../../../../editor/common/core/range.js";
import { LanguageFeatureRegistry } from "../../../../editor/common/languageFeatureRegistry.js";
import { IModelService } from "../../../../editor/common/services/model.js";
import { ITextModelService } from "../../../../editor/common/services/resolverService.js";
import { CommandsRegistry } from "../../../../platform/commands/common/commands.js";
var TypeHierarchyDirection = /* @__PURE__ */ ((TypeHierarchyDirection2) => {
  TypeHierarchyDirection2["Subtypes"] = "subtypes";
  TypeHierarchyDirection2["Supertypes"] = "supertypes";
  return TypeHierarchyDirection2;
})(TypeHierarchyDirection || {});
const TypeHierarchyProviderRegistry = new LanguageFeatureRegistry();
class TypeHierarchyModel {
  constructor(id, provider, roots, ref) {
    this.id = id;
    this.provider = provider;
    this.roots = roots;
    this.ref = ref;
    this.root = roots[0];
  }
  static async create(model, position, token) {
    const [provider] = TypeHierarchyProviderRegistry.ordered(model);
    if (!provider) {
      return void 0;
    }
    const session = await provider.prepareTypeHierarchy(
      model,
      position,
      token
    );
    if (!session) {
      return void 0;
    }
    return new TypeHierarchyModel(
      session.roots.reduce((p, c) => p + c._sessionId, ""),
      provider,
      session.roots,
      new RefCountedDisposable(session)
    );
  }
  root;
  dispose() {
    this.ref.release();
  }
  fork(item) {
    const that = this;
    return new class extends TypeHierarchyModel {
      constructor() {
        super(that.id, that.provider, [item], that.ref.acquire());
      }
    }();
  }
  async provideSupertypes(item, token) {
    try {
      const result = await this.provider.provideSupertypes(item, token);
      if (isNonEmptyArray(result)) {
        return result;
      }
    } catch (e) {
      onUnexpectedExternalError(e);
    }
    return [];
  }
  async provideSubtypes(item, token) {
    try {
      const result = await this.provider.provideSubtypes(item, token);
      if (isNonEmptyArray(result)) {
        return result;
      }
    } catch (e) {
      onUnexpectedExternalError(e);
    }
    return [];
  }
}
const _models = /* @__PURE__ */ new Map();
CommandsRegistry.registerCommand(
  "_executePrepareTypeHierarchy",
  async (accessor, ...args) => {
    const [resource, position] = args;
    assertType(URI.isUri(resource));
    assertType(Position.isIPosition(position));
    const modelService = accessor.get(IModelService);
    let textModel = modelService.getModel(resource);
    let textModelReference;
    if (!textModel) {
      const textModelService = accessor.get(ITextModelService);
      const result = await textModelService.createModelReference(resource);
      textModel = result.object.textEditorModel;
      textModelReference = result;
    }
    try {
      const model = await TypeHierarchyModel.create(
        textModel,
        position,
        CancellationToken.None
      );
      if (!model) {
        return [];
      }
      _models.set(model.id, model);
      _models.forEach((value, key, map) => {
        if (map.size > 10) {
          value.dispose();
          _models.delete(key);
        }
      });
      return [model.root];
    } finally {
      textModelReference?.dispose();
    }
  }
);
function isTypeHierarchyItemDto(obj) {
  const item = obj;
  return typeof obj === "object" && typeof item.name === "string" && typeof item.kind === "number" && URI.isUri(item.uri) && Range.isIRange(item.range) && Range.isIRange(item.selectionRange);
}
CommandsRegistry.registerCommand(
  "_executeProvideSupertypes",
  async (_accessor, ...args) => {
    const [item] = args;
    assertType(isTypeHierarchyItemDto(item));
    const model = _models.get(item._sessionId);
    if (!model) {
      return void 0;
    }
    return model.provideSupertypes(item, CancellationToken.None);
  }
);
CommandsRegistry.registerCommand(
  "_executeProvideSubtypes",
  async (_accessor, ...args) => {
    const [item] = args;
    assertType(isTypeHierarchyItemDto(item));
    const model = _models.get(item._sessionId);
    if (!model) {
      return void 0;
    }
    return model.provideSubtypes(item, CancellationToken.None);
  }
);
export {
  TypeHierarchyDirection,
  TypeHierarchyModel,
  TypeHierarchyProviderRegistry
};
