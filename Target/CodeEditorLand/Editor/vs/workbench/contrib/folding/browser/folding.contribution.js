var x=Object.defineProperty;var u=Object.getOwnPropertyDescriptor;var m=(a,o,s,t)=>{for(var n=t>1?void 0:t?u(o,s):o,i=a.length-1,r;i>=0;i--)(r=a[i])&&(n=(t?r(o,s,n):r(n))||n);return t&&n&&x(o,s,n),n},c=(a,o)=>(s,t)=>o(s,t,a);import{Disposable as d}from"../../../../../vs/base/common/lifecycle.js";import{editorConfigurationBaseNode as f}from"../../../../../vs/editor/common/config/editorConfigurationSchema.js";import"../../../../../vs/editor/common/languages.js";import"../../../../../vs/editor/common/model.js";import{FoldingController as h}from"../../../../../vs/editor/contrib/folding/browser/folding.js";import*as p from"../../../../../vs/nls.js";import{IConfigurationService as g}from"../../../../../vs/platform/configuration/common/configuration.js";import{Extensions as I}from"../../../../../vs/platform/configuration/common/configurationRegistry.js";import"../../../../../vs/platform/extensions/common/extensions.js";import{Registry as l}from"../../../../../vs/platform/registry/common/platform.js";import{Extensions as b}from"../../../../../vs/workbench/common/contributions.js";import{IExtensionService as C}from"../../../../../vs/workbench/services/extensions/common/extensions.js";import{LifecyclePhase as v}from"../../../../../vs/workbench/services/lifecycle/common/lifecycle.js";let e=class extends d{constructor(s,t){super();this._extensionService=s;this._configurationService=t;this._store.add(this._extensionService.onDidChangeExtensions(this._updateConfigValues,this)),this._store.add(h.setFoldingRangeProviderSelector(this._selectFoldingRangeProvider.bind(this))),this._updateConfigValues()}static configName="editor.defaultFoldingRangeProvider";static extensionIds=[];static extensionItemLabels=[];static extensionDescriptions=[];async _updateConfigValues(){await this._extensionService.whenInstalledExtensionsRegistered(),e.extensionIds.length=0,e.extensionItemLabels.length=0,e.extensionDescriptions.length=0,e.extensionIds.push(null),e.extensionItemLabels.push(p.localize("null","All")),e.extensionDescriptions.push(p.localize("nullFormatterDescription","All active folding range providers"));const s=[],t=[];for(const i of this._extensionService.extensions)(i.main||i.browser)&&(i.categories?.find(r=>r==="Programming Languages")?s.push(i):t.push(i));const n=(i,r)=>i.name.localeCompare(r.name);for(const i of s.sort(n))e.extensionIds.push(i.identifier.value),e.extensionItemLabels.push(i.displayName??""),e.extensionDescriptions.push(i.description??"");for(const i of t.sort(n))e.extensionIds.push(i.identifier.value),e.extensionItemLabels.push(i.displayName??""),e.extensionDescriptions.push(i.description??"")}_selectFoldingRangeProvider(s,t){const n=this._configurationService.getValue(e.configName,{overrideIdentifier:t.getLanguageId()});if(n)return s.filter(i=>i.id===n)}};e=m([c(0,C),c(1,g)],e),l.as(I.Configuration).registerConfiguration({...f,properties:{[e.configName]:{description:p.localize("formatter.default","Defines a default folding range provider that takes precedence over all other folding range providers. Must be the identifier of an extension contributing a folding range provider."),type:["string","null"],default:null,enum:e.extensionIds,enumItemLabels:e.extensionItemLabels,markdownEnumDescriptions:e.extensionDescriptions}}}),l.as(b.Workbench).registerWorkbenchContribution(e,v.Restored);