import{KeyCode as i,KeyMod as p}from"../../../../../vs/base/common/keyCodes.js";import"../../../../../vs/editor/browser/editorBrowser.js";import{EditorCommand as e,EditorContributionInstantiation as m,registerEditorCommand as t,registerEditorContribution as c}from"../../../../../vs/editor/browser/editorExtensions.js";import{editorConfigurationBaseNode as g}from"../../../../../vs/editor/common/config/editorConfigurationSchema.js";import{registerEditorFeature as f}from"../../../../../vs/editor/common/editorFeatures.js";import{DefaultDropProvidersFeature as u}from"../../../../../vs/editor/contrib/dropOrPasteInto/browser/defaultProviders.js";import*as C from"../../../../../vs/nls.js";import{Extensions as l,ConfigurationScope as E}from"../../../../../vs/platform/configuration/common/configurationRegistry.js";import{KeybindingWeight as n}from"../../../../../vs/platform/keybinding/common/keybindingsRegistry.js";import{Registry as y}from"../../../../../vs/platform/registry/common/platform.js";import{changeDropTypeCommandId as b,defaultProviderConfig as I,DropIntoEditorController as r,dropWidgetVisibleCtx as s}from"./dropIntoEditorController.js";c(r.ID,r,m.BeforeFirstInteraction),f(u),t(new class extends e{constructor(){super({id:b,precondition:s,kbOpts:{weight:n.EditorContrib,primary:p.CtrlCmd|i.Period}})}runEditorCommand(d,o,a){r.get(o)?.changeDropType()}}),t(new class extends e{constructor(){super({id:"editor.hideDropWidget",precondition:s,kbOpts:{weight:n.EditorContrib,primary:i.Escape}})}runEditorCommand(d,o,a){r.get(o)?.clearWidgets()}}),y.as(l.Configuration).registerConfiguration({...g,properties:{[I]:{type:"object",scope:E.LANGUAGE_OVERRIDABLE,description:C.localize("defaultProviderDescription","Configures the default drop provider to use for content of a given mime type."),default:{},additionalProperties:{type:"string"}}}});