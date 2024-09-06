var L=Object.defineProperty;var R=Object.getOwnPropertyDescriptor;var I=(i,t,a,r)=>{for(var s=r>1?void 0:r?R(t,a):t,f=i.length-1,u;f>=0;f--)(u=i[f])&&(s=(r?u(t,a,s):u(s))||s);return r&&s&&L(t,a,s),s},c=(i,t)=>(a,r)=>t(a,r,i);import{index as P}from"../../../../base/common/arrays.js";import{MarkdownString as w}from"../../../../base/common/htmlContent.js";import{Disposable as C}from"../../../../base/common/lifecycle.js";import{joinPath as x}from"../../../../base/common/resources.js";import{isString as E}from"../../../../base/common/types.js";import"../../../../base/common/uri.js";import{ILanguageService as D}from"../../../../editor/common/languages/language.js";import{clearConfiguredLanguageAssociations as F,registerConfiguredLanguageAssociation as _}from"../../../../editor/common/services/languagesAssociations.js";import{LanguageService as M}from"../../../../editor/common/services/languageService.js";import{localize as n}from"../../../../nls.js";import{IConfigurationService as A}from"../../../../platform/configuration/common/configuration.js";import{IEnvironmentService as j}from"../../../../platform/environment/common/environment.js";import"../../../../platform/extensions/common/extensions.js";import{FILES_ASSOCIATIONS_CONFIG as T}from"../../../../platform/files/common/files.js";import{SyncDescriptor as $}from"../../../../platform/instantiation/common/descriptors.js";import{InstantiationType as G,registerSingleton as k}from"../../../../platform/instantiation/common/extensions.js";import{ILogService as O}from"../../../../platform/log/common/log.js";import{Registry as U}from"../../../../platform/registry/common/platform.js";import{Extensions as N}from"../../extensionManagement/common/extensionFeatures.js";import{IExtensionService as B}from"../../extensions/common/extensions.js";import{ExtensionsRegistry as V}from"../../extensions/common/extensionsRegistry.js";const h=V.registerExtensionPoint({extensionPoint:"languages",jsonSchema:{description:n("vscode.extension.contributes.languages","Contributes language declarations."),type:"array",items:{type:"object",defaultSnippets:[{body:{id:"${1:languageId}",aliases:["${2:label}"],extensions:["${3:extension}"],configuration:"./language-configuration.json"}}],properties:{id:{description:n("vscode.extension.contributes.languages.id","ID of the language."),type:"string"},aliases:{description:n("vscode.extension.contributes.languages.aliases","Name aliases for the language."),type:"array",items:{type:"string"}},extensions:{description:n("vscode.extension.contributes.languages.extensions","File extensions associated to the language."),default:[".foo"],type:"array",items:{type:"string"}},filenames:{description:n("vscode.extension.contributes.languages.filenames","File names associated to the language."),type:"array",items:{type:"string"}},filenamePatterns:{description:n("vscode.extension.contributes.languages.filenamePatterns","File name glob patterns associated to the language."),type:"array",items:{type:"string"}},mimetypes:{description:n("vscode.extension.contributes.languages.mimetypes","Mime types associated to the language."),type:"array",items:{type:"string"}},firstLine:{description:n("vscode.extension.contributes.languages.firstLine","A regular expression matching the first line of a file of the language."),type:"string"},configuration:{description:n("vscode.extension.contributes.languages.configuration","A relative path to a file containing configuration options for the language."),type:"string",default:"./language-configuration.json"},icon:{type:"object",description:n("vscode.extension.contributes.languages.icon","A icon to use as file icon, if no icon theme provides one for the language."),properties:{light:{description:n("vscode.extension.contributes.languages.icon.light","Icon path when a light theme is used"),type:"string"},dark:{description:n("vscode.extension.contributes.languages.icon.dark","Icon path when a dark theme is used"),type:"string"}}}}}},activationEventsGenerator:(i,t)=>{for(const a of i)a.id&&a.configuration&&t.push(`onLanguage:${a.id}`)}});class q extends C{type="table";shouldRender(t){return!!t.contributes?.languages}render(t){const a=t.contributes,r=a?.languages||[],s=[];for(const e of r)v(e)&&s.push({id:e.id,name:(e.aliases||[])[0]||e.id,extensions:e.extensions||[],hasGrammar:!1,hasSnippets:!1});const f=P(s,e=>e.id);if((a?.grammars||[]).forEach(e=>{if(!E(e.language))return;let o=f[e.language];o?o.hasGrammar=!0:(o={id:e.language,name:e.language,extensions:[],hasGrammar:!0,hasSnippets:!1},f[o.id]=o,s.push(o))}),(a?.snippets||[]).forEach(e=>{if(!E(e.language))return;let o=f[e.language];o?o.hasSnippets=!0:(o={id:e.language,name:e.language,extensions:[],hasGrammar:!1,hasSnippets:!0},f[o.id]=o,s.push(o))}),!s.length)return{data:{headers:[],rows:[]},dispose:()=>{}};const p=[n("language id","ID"),n("language name","Name"),n("file extensions","File Extensions"),n("grammar","Grammar"),n("snippets","Snippets")],y=s.sort((e,o)=>e.id.localeCompare(o.id)).map(e=>[e.id,e.name,new w().appendMarkdown(`${e.extensions.map(o=>`\`${o}\``).join("&nbsp;")}`),e.hasGrammar?"\u2714\uFE0E":"\u2014",e.hasSnippets?"\u2714\uFE0E":"\u2014"]);return{data:{headers:p,rows:y},dispose:()=>{}}}}U.as(N.ExtensionFeaturesRegistry).registerExtensionFeature({id:"languages",label:n("languages","Programming Languages"),access:{canToggle:!1},renderer:new $(q)});let d=class extends M{constructor(a,r,s,f){super(s.verbose||s.isExtensionDevelopment||!s.isBuilt);this.logService=f;this._configurationService=r,this._extensionService=a,h.setHandler(u=>{const m=[];for(let p=0,y=u.length;p<y;p++){const e=u[p];if(!Array.isArray(e.value)){e.collector.error(n("invalid","Invalid `contributes.{0}`. Expected an array.",h.name));continue}for(let o=0,S=e.value.length;o<S;o++){const g=e.value[o];if(v(g,e.collector)){let b;g.configuration&&(b=x(e.description.extensionLocation,g.configuration)),m.push({id:g.id,extensions:g.extensions,filenames:g.filenames,filenamePatterns:g.filenamePatterns,firstLine:g.firstLine,aliases:g.aliases,mimetypes:g.mimetypes,configuration:b,icon:g.icon&&{light:x(e.description.extensionLocation,g.icon.light),dark:x(e.description.extensionLocation,g.icon.dark)}})}}}this._registry.setDynamicLanguages(m)}),this.updateMime(),this._register(this._configurationService.onDidChangeConfiguration(u=>{u.affectsConfiguration(T)&&this.updateMime()})),this._extensionService.whenInstalledExtensionsRegistered().then(()=>{this.updateMime()}),this._register(this.onDidRequestRichLanguageFeatures(u=>{this._extensionService.activateByEvent(`onLanguage:${u}`),this._extensionService.activateByEvent("onLanguage")}))}_configurationService;_extensionService;updateMime(){const a=this._configurationService.getValue();F(),a.files?.associations&&Object.keys(a.files.associations).forEach(r=>{const s=a.files.associations[r];if(typeof s!="string"){this.logService.warn(`Ignoring configured 'files.associations' for '${r}' because its type is not a string but '${typeof s}'`);return}const f=this.getMimeType(s)||`text/x-${s}`;_({id:s,mime:f,filepattern:r})}),this._onDidChange.fire()}};d=I([c(0,B),c(1,A),c(2,j),c(3,O)],d);function l(i){return typeof i>"u"?!0:Array.isArray(i)?i.every(t=>typeof t=="string"):!1}function v(i,t){return i?typeof i.id!="string"?(t?.error(n("require.id","property `{0}` is mandatory and must be of type `string`","id")),!1):l(i.extensions)?l(i.filenames)?typeof i.firstLine<"u"&&typeof i.firstLine!="string"?(t?.error(n("opt.firstLine","property `{0}` can be omitted and must be of type `string`","firstLine")),!1):typeof i.configuration<"u"&&typeof i.configuration!="string"?(t?.error(n("opt.configuration","property `{0}` can be omitted and must be of type `string`","configuration")),!1):l(i.aliases)?l(i.mimetypes)?typeof i.icon<"u"&&(typeof i.icon!="object"||typeof i.icon.light!="string"||typeof i.icon.dark!="string")?(t?.error(n("opt.icon","property `{0}` can be omitted and must be of type `object` with properties `{1}` and `{2}` of type `string`","icon","light","dark")),!1):!0:(t?.error(n("opt.mimetypes","property `{0}` can be omitted and must be of type `string[]`","mimetypes")),!1):(t?.error(n("opt.aliases","property `{0}` can be omitted and must be of type `string[]`","aliases")),!1):(t?.error(n("opt.filenames","property `{0}` can be omitted and must be of type `string[]`","filenames")),!1):(t?.error(n("opt.extensions","property `{0}` can be omitted and must be of type `string[]`","extensions")),!1):(t?.error(n("invalid.empty","Empty value for `contributes.{0}`",h.name)),!1)}k(D,d,G.Eager);export{d as WorkbenchLanguageService,h as languagesExtPoint};
