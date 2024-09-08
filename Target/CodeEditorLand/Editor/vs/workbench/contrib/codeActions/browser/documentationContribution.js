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
import { HierarchicalKind } from "../../../../base/common/hierarchicalKind.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { ILanguageFeaturesService } from "../../../../editor/common/services/languageFeatures.js";
import { CodeActionKind } from "../../../../editor/contrib/codeAction/common/types.js";
import {
  ContextKeyExpr,
  IContextKeyService
} from "../../../../platform/contextkey/common/contextkey.js";
let CodeActionDocumentationContribution = class extends Disposable {
  constructor(extensionPoint, contextKeyService, languageFeaturesService) {
    super();
    this.contextKeyService = contextKeyService;
    this._register(languageFeaturesService.codeActionProvider.register("*", this));
    extensionPoint.setHandler((points) => {
      this.contributions = [];
      for (const documentation of points) {
        if (!documentation.value.refactoring) {
          continue;
        }
        for (const contribution of documentation.value.refactoring) {
          const precondition = ContextKeyExpr.deserialize(contribution.when);
          if (!precondition) {
            continue;
          }
          this.contributions.push({
            title: contribution.title,
            when: precondition,
            command: contribution.command
          });
        }
      }
    });
  }
  contributions = [];
  emptyCodeActionsList = {
    actions: [],
    dispose: () => {
    }
  };
  async provideCodeActions(_model, _range, context, _token) {
    return this.emptyCodeActionsList;
  }
  _getAdditionalMenuItems(context, actions) {
    if (context.only !== CodeActionKind.Refactor.value) {
      if (!actions.some(
        (action) => action.kind && CodeActionKind.Refactor.contains(
          new HierarchicalKind(action.kind)
        )
      )) {
        return [];
      }
    }
    return this.contributions.filter(
      (contribution) => this.contextKeyService.contextMatchesRules(contribution.when)
    ).map((contribution) => {
      return {
        id: contribution.command,
        title: contribution.title
      };
    });
  }
};
CodeActionDocumentationContribution = __decorateClass([
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, ILanguageFeaturesService)
], CodeActionDocumentationContribution);
export {
  CodeActionDocumentationContribution
};
