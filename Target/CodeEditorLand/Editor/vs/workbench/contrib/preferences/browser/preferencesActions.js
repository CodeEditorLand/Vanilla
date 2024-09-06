var v=Object.defineProperty;var S=Object.getOwnPropertyDescriptor;var u=(r,o,n,e)=>{for(var i=e>1?void 0:e?S(o,n):o,t=r.length-1,a;t>=0;t--)(a=r[t])&&(i=(e?a(o,n,i):a(i))||i);return e&&i&&v(o,n,i),i},s=(r,o)=>(n,e)=>o(n,e,r);import{Action as I}from"../../../../../vs/base/common/actions.js";import{URI as p}from"../../../../../vs/base/common/uri.js";import{EditorExtensionsRegistry as k}from"../../../../../vs/editor/browser/editorExtensions.js";import{ILanguageService as b}from"../../../../../vs/editor/common/languages/language.js";import{getIconClasses as h}from"../../../../../vs/editor/common/services/getIconClasses.js";import{IModelService as L}from"../../../../../vs/editor/common/services/model.js";import*as d from"../../../../../vs/nls.js";import{isLocalizedString as f}from"../../../../../vs/platform/action/common/action.js";import{isIMenuItem as R,MenuId as C,MenuRegistry as P}from"../../../../../vs/platform/actions/common/actions.js";import{CommandsRegistry as y}from"../../../../../vs/platform/commands/common/commands.js";import{Extensions as x}from"../../../../../vs/platform/configuration/common/configurationRegistry.js";import{IKeybindingService as z}from"../../../../../vs/platform/keybinding/common/keybinding.js";import{IQuickInputService as E}from"../../../../../vs/platform/quickinput/common/quickInput.js";import{Registry as M}from"../../../../../vs/platform/registry/common/platform.js";import{IPreferencesService as Q}from"../../../../../vs/workbench/services/preferences/common/preferences.js";let m=class extends I{constructor(n,e,i,t,a,c){super(n,e);this.modelService=i;this.languageService=t;this.quickInputService=a;this.preferencesService=c}static ID="workbench.action.configureLanguageBasedSettings";static LABEL=d.localize2("configureLanguageBasedSettings","Configure Language Specific Settings...");async run(){const e=this.languageService.getSortedRegisteredLanguageNames().map(({languageName:i,languageId:t})=>{const a=d.localize("languageDescriptionConfigured","({0})",t);let c;const g=this.languageService.getExtensions(t);if(g.length)c=p.file(g[0]);else{const l=this.languageService.getFilenames(t);l.length&&(c=p.file(l[0]))}return{label:i,iconClasses:h(this.modelService,this.languageService,c),description:a}});await this.quickInputService.pick(e,{placeHolder:d.localize("pickLanguage","Select Language")}).then(i=>{if(i){const t=this.languageService.getLanguageIdByLanguageName(i.label);if(typeof t=="string")return this.preferencesService.openLanguageSpecificSettings(t)}})}};m=u([s(2,L),s(3,b),s(4,E),s(5,Q)],m),y.registerCommand({id:"_getAllSettings",handler:()=>M.as(x.Configuration).getConfigurationProperties()}),y.registerCommand("_getAllCommands",function(r){const o=r.get(z),n=[];for(const e of k.getEditorActions()){const i=o.lookupKeybinding(e.id);n.push({command:e.id,label:e.label,description:f(e.metadata?.description)?e.metadata.description.value:e.metadata?.description,precondition:e.precondition?.serialize(),keybinding:i?.getLabel()??"Not set"})}for(const e of P.getMenuItems(C.CommandPalette))if(R(e)){const i=typeof e.command.title=="string"?e.command.title:e.command.title.value,t=e.command.category?typeof e.command.category=="string"?e.command.category:e.command.category.value:void 0,a=t?`${t}: ${i}`:i,c=f(e.command.metadata?.description)?e.command.metadata.description.value:e.command.metadata?.description,g=o.lookupKeybinding(e.command.id);n.push({command:e.command.id,label:a,description:c,precondition:e.when?.serialize(),keybinding:g?.getLabel()??"Not set"})}return n});export{m as ConfigureLanguageBasedSettingsAction};
