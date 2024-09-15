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
import {
  createCancelablePromise,
  raceTimeout
} from "../../../../base/common/async.js";
import { StopWatch } from "../../../../base/common/stopwatch.js";
import {
  InstantiationType,
  registerSingleton
} from "../../../../platform/instantiation/common/extensions.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import {
  IAiRelatedInformationService
} from "./aiRelatedInformation.js";
let AiRelatedInformationService = class {
  constructor(logService) {
    this.logService = logService;
  }
  static {
    __name(this, "AiRelatedInformationService");
  }
  _serviceBrand;
  static DEFAULT_TIMEOUT = 1e3 * 10;
  // 10 seconds
  _providers = /* @__PURE__ */ new Map();
  isEnabled() {
    return this._providers.size > 0;
  }
  registerAiRelatedInformationProvider(type, provider) {
    const providers = this._providers.get(type) ?? [];
    providers.push(provider);
    this._providers.set(type, providers);
    return {
      dispose: /* @__PURE__ */ __name(() => {
        const providers2 = this._providers.get(type) ?? [];
        const index = providers2.indexOf(provider);
        if (index !== -1) {
          providers2.splice(index, 1);
        }
        if (providers2.length === 0) {
          this._providers.delete(type);
        }
      }, "dispose")
    };
  }
  async getRelatedInformation(query, types, token) {
    if (this._providers.size === 0) {
      throw new Error("No related information providers registered");
    }
    const providers = [];
    for (const type of types) {
      const typeProviders = this._providers.get(type);
      if (typeProviders) {
        providers.push(...typeProviders);
      }
    }
    if (providers.length === 0) {
      throw new Error(
        "No related information providers registered for the given types"
      );
    }
    const stopwatch = StopWatch.create();
    const cancellablePromises = providers.map((provider) => {
      return createCancelablePromise(async (t) => {
        try {
          const result = await provider.provideAiRelatedInformation(
            query,
            t
          );
          return result.filter((r) => types.includes(r.type));
        } catch (e) {
        }
        return [];
      });
    });
    try {
      const results = await raceTimeout(
        Promise.allSettled(cancellablePromises),
        AiRelatedInformationService.DEFAULT_TIMEOUT,
        () => {
          cancellablePromises.forEach((p) => p.cancel());
          this.logService.warn(
            "[AiRelatedInformationService]: Related information provider timed out"
          );
        }
      );
      if (!results) {
        return [];
      }
      const result = results.filter((r) => r.status === "fulfilled").flatMap(
        (r) => r.value
      );
      return result;
    } finally {
      stopwatch.stop();
      this.logService.trace(
        `[AiRelatedInformationService]: getRelatedInformation took ${stopwatch.elapsed()}ms`
      );
    }
  }
};
AiRelatedInformationService = __decorateClass([
  __decorateParam(0, ILogService)
], AiRelatedInformationService);
registerSingleton(
  IAiRelatedInformationService,
  AiRelatedInformationService,
  InstantiationType.Delayed
);
export {
  AiRelatedInformationService
};
//# sourceMappingURL=aiRelatedInformationService.js.map
