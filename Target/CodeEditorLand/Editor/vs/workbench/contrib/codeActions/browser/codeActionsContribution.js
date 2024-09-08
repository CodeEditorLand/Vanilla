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
import { Emitter } from "../../../../base/common/event.js";
import { HierarchicalKind } from "../../../../base/common/hierarchicalKind.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { editorConfigurationBaseNode } from "../../../../editor/common/config/editorConfigurationSchema.js";
import { ILanguageFeaturesService } from "../../../../editor/common/services/languageFeatures.js";
import {
  codeActionCommandId,
  refactorCommandId,
  sourceActionCommandId
} from "../../../../editor/contrib/codeAction/browser/codeAction.js";
import { CodeActionKind } from "../../../../editor/contrib/codeAction/common/types.js";
import * as nls from "../../../../nls.js";
import {
  ConfigurationScope,
  Extensions
} from "../../../../platform/configuration/common/configurationRegistry.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
const createCodeActionsAutoSave = (description) => {
  return {
    type: "string",
    enum: ["always", "explicit", "never", true, false],
    enumDescriptions: [
      nls.localize(
        "alwaysSave",
        "Triggers Code Actions on explicit saves and auto saves triggered by window or focus changes."
      ),
      nls.localize(
        "explicitSave",
        "Triggers Code Actions only when explicitly saved"
      ),
      nls.localize("neverSave", "Never triggers Code Actions on save"),
      nls.localize(
        "explicitSaveBoolean",
        'Triggers Code Actions only when explicitly saved. This value will be deprecated in favor of "explicit".'
      ),
      nls.localize(
        "neverSaveBoolean",
        'Never triggers Code Actions on save. This value will be deprecated in favor of "never".'
      )
    ],
    default: "explicit",
    description
  };
};
const createNotebookCodeActionsAutoSave = (description) => {
  return {
    type: ["string", "boolean"],
    enum: ["explicit", "never", true, false],
    enumDescriptions: [
      nls.localize(
        "explicit",
        "Triggers Code Actions only when explicitly saved."
      ),
      nls.localize("never", "Never triggers Code Actions on save."),
      nls.localize(
        "explicitBoolean",
        'Triggers Code Actions only when explicitly saved. This value will be deprecated in favor of "explicit".'
      ),
      nls.localize(
        "neverBoolean",
        'Triggers Code Actions only when explicitly saved. This value will be deprecated in favor of "never".'
      )
    ],
    default: "explicit",
    description
  };
};
const codeActionsOnSaveSchema = {
  oneOf: [
    {
      type: "object",
      additionalProperties: {
        type: "string"
      }
    },
    {
      type: "array",
      items: { type: "string" }
    }
  ],
  markdownDescription: nls.localize(
    "editor.codeActionsOnSave",
    'Run Code Actions for the editor on save. Code Actions must be specified and the editor must not be shutting down. Example: `"source.organizeImports": "explicit" `'
  ),
  type: ["object", "array"],
  additionalProperties: {
    type: "string",
    enum: ["always", "explicit", "never", true, false]
  },
  default: {},
  scope: ConfigurationScope.LANGUAGE_OVERRIDABLE
};
const editorConfiguration = Object.freeze({
  ...editorConfigurationBaseNode,
  properties: {
    "editor.codeActionsOnSave": codeActionsOnSaveSchema
  }
});
const notebookCodeActionsOnSaveSchema = {
  oneOf: [
    {
      type: "object",
      additionalProperties: {
        type: "string"
      }
    },
    {
      type: "array",
      items: { type: "string" }
    }
  ],
  markdownDescription: nls.localize(
    "notebook.codeActionsOnSave",
    'Run a series of Code Actions for a notebook on save. Code Actions must be specified, the file must not be saved after delay, and the editor must not be shutting down. Example: `"notebook.source.organizeImports": "explicit"`'
  ),
  type: "object",
  additionalProperties: {
    type: ["string", "boolean"],
    enum: ["explicit", "never", true, false]
    // enum: ['explicit', 'always', 'never'], -- autosave support needs to be built first
    // nls.localize('always', 'Always triggers Code Actions on save, including autosave, focus, and window change events.'),
  },
  default: {}
};
const notebookEditorConfiguration = Object.freeze({
  ...editorConfigurationBaseNode,
  properties: {
    "notebook.codeActionsOnSave": notebookCodeActionsOnSaveSchema
  }
});
let CodeActionsContribution = class extends Disposable {
  constructor(codeActionsExtensionPoint, keybindingService, languageFeatures) {
    super();
    this.languageFeatures = languageFeatures;
    languageFeatures.codeActionProvider.onDidChange(() => {
      this.updateSettingsFromCodeActionProviders();
      this.updateConfigurationSchemaFromContribs();
    }, 2e3);
    codeActionsExtensionPoint.setHandler((extensionPoints) => {
      this._contributedCodeActions = extensionPoints.flatMap((x) => x.value).filter((x) => Array.isArray(x.actions));
      this.updateConfigurationSchema(this._contributedCodeActions);
      this._onDidChangeContributions.fire();
    });
    keybindingService.registerSchemaContribution({
      getSchemaAdditions: () => this.getSchemaAdditions(),
      onDidChange: this._onDidChangeContributions.event
    });
  }
  _contributedCodeActions = [];
  settings = /* @__PURE__ */ new Set();
  _onDidChangeContributions = this._register(
    new Emitter()
  );
  updateSettingsFromCodeActionProviders() {
    const providers = this.languageFeatures.codeActionProvider.allNoModel();
    providers.forEach((provider) => {
      if (provider.providedCodeActionKinds) {
        provider.providedCodeActionKinds.forEach((kind) => {
          if (!this.settings.has(kind) && CodeActionKind.Source.contains(
            new HierarchicalKind(kind)
          )) {
            this.settings.add(kind);
          }
        });
      }
    });
  }
  updateConfigurationSchema(codeActionContributions) {
    const newProperties = {};
    const newNotebookProperties = {};
    for (const [sourceAction, props] of this.getSourceActions(
      codeActionContributions
    )) {
      this.settings.add(sourceAction);
      newProperties[sourceAction] = createCodeActionsAutoSave(
        nls.localize(
          "codeActionsOnSave.generic",
          "Controls whether '{0}' actions should be run on file save.",
          props.title
        )
      );
      newNotebookProperties[sourceAction] = createNotebookCodeActionsAutoSave(
        nls.localize(
          "codeActionsOnSave.generic",
          "Controls whether '{0}' actions should be run on file save.",
          props.title
        )
      );
    }
    codeActionsOnSaveSchema.properties = newProperties;
    notebookCodeActionsOnSaveSchema.properties = newNotebookProperties;
    Registry.as(
      Extensions.Configuration
    ).notifyConfigurationSchemaUpdated(editorConfiguration);
  }
  updateConfigurationSchemaFromContribs() {
    const properties = {
      ...codeActionsOnSaveSchema.properties
    };
    const notebookProperties = {
      ...notebookCodeActionsOnSaveSchema.properties
    };
    for (const codeActionKind of this.settings) {
      if (!properties[codeActionKind]) {
        properties[codeActionKind] = createCodeActionsAutoSave(
          nls.localize(
            "codeActionsOnSave.generic",
            "Controls whether '{0}' actions should be run on file save.",
            codeActionKind
          )
        );
        notebookProperties[codeActionKind] = createNotebookCodeActionsAutoSave(
          nls.localize(
            "codeActionsOnSave.generic",
            "Controls whether '{0}' actions should be run on file save.",
            codeActionKind
          )
        );
      }
    }
    codeActionsOnSaveSchema.properties = properties;
    notebookCodeActionsOnSaveSchema.properties = notebookProperties;
    Registry.as(
      Extensions.Configuration
    ).notifyConfigurationSchemaUpdated(editorConfiguration);
  }
  getSourceActions(contributions) {
    const sourceActions = /* @__PURE__ */ new Map();
    for (const contribution of contributions) {
      for (const action of contribution.actions) {
        const kind = new HierarchicalKind(action.kind);
        if (CodeActionKind.Source.contains(kind)) {
          sourceActions.set(kind.value, action);
        }
      }
    }
    return sourceActions;
  }
  getSchemaAdditions() {
    const conditionalSchema = (command, actions) => {
      return {
        if: {
          required: ["command"],
          properties: {
            command: { const: command }
          }
        },
        then: {
          properties: {
            args: {
              required: ["kind"],
              properties: {
                kind: {
                  anyOf: [
                    {
                      enum: actions.map(
                        (action) => action.kind
                      ),
                      enumDescriptions: actions.map(
                        (action) => action.description ?? action.title
                      )
                    },
                    { type: "string" }
                  ]
                }
              }
            }
          }
        }
      };
    };
    const getActions = (ofKind) => {
      const allActions = this._contributedCodeActions.flatMap(
        (desc) => desc.actions
      );
      const out = /* @__PURE__ */ new Map();
      for (const action of allActions) {
        if (!out.has(action.kind) && ofKind.contains(new HierarchicalKind(action.kind))) {
          out.set(action.kind, action);
        }
      }
      return Array.from(out.values());
    };
    return [
      conditionalSchema(
        codeActionCommandId,
        getActions(HierarchicalKind.Empty)
      ),
      conditionalSchema(
        refactorCommandId,
        getActions(CodeActionKind.Refactor)
      ),
      conditionalSchema(
        sourceActionCommandId,
        getActions(CodeActionKind.Source)
      )
    ];
  }
};
CodeActionsContribution = __decorateClass([
  __decorateParam(1, IKeybindingService),
  __decorateParam(2, ILanguageFeaturesService)
], CodeActionsContribution);
export {
  CodeActionsContribution,
  editorConfiguration,
  notebookEditorConfiguration
};
