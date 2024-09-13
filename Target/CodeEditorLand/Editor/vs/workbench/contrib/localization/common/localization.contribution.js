import{Disposable as o}from"../../../../base/common/lifecycle.js";import{localize as e}from"../../../../nls.js";import{registerAction2 as i}from"../../../../platform/actions/common/actions.js";import{SyncDescriptor as c}from"../../../../platform/instantiation/common/descriptors.js";import{Registry as g}from"../../../../platform/registry/common/platform.js";import{Extensions as u}from"../../../services/extensionManagement/common/extensionFeatures.js";import{ExtensionsRegistry as p}from"../../../services/extensions/common/extensionsRegistry.js";import{ClearDisplayLanguageAction as m,ConfigureDisplayLanguageAction as b}from"./localizationsActions.js";class N extends o{constructor(){super(),i(b),i(m),p.registerExtensionPoint({extensionPoint:"localizations",defaultExtensionKind:["ui","workspace"],jsonSchema:{description:e("vscode.extension.contributes.localizations","Contributes localizations to the editor"),type:"array",default:[],items:{type:"object",required:["languageId","translations"],defaultSnippets:[{body:{languageId:"",languageName:"",localizedLanguageName:"",translations:[{id:"vscode",path:""}]}}],properties:{languageId:{description:e("vscode.extension.contributes.localizations.languageId","Id of the language into which the display strings are translated."),type:"string"},languageName:{description:e("vscode.extension.contributes.localizations.languageName","Name of the language in English."),type:"string"},localizedLanguageName:{description:e("vscode.extension.contributes.localizations.languageNameLocalized","Name of the language in contributed language."),type:"string"},translations:{description:e("vscode.extension.contributes.localizations.translations","List of translations associated to the language."),type:"array",default:[{id:"vscode",path:""}],items:{type:"object",required:["id","path"],properties:{id:{type:"string",description:e("vscode.extension.contributes.localizations.translations.id","Id of VS Code or Extension for which this translation is contributed to. Id of VS Code is always `vscode` and of extension should be in format `publisherId.extensionName`."),pattern:"^((vscode)|([a-z0-9A-Z][a-z0-9A-Z-]*)\\.([a-z0-9A-Z][a-z0-9A-Z-]*))$",patternErrorMessage:e("vscode.extension.contributes.localizations.translations.id.pattern","Id should be `vscode` or in format `publisherId.extensionName` for translating VS code or an extension respectively.")},path:{type:"string",description:e("vscode.extension.contributes.localizations.translations.path","A relative path to a file containing translations for the language.")}},defaultSnippets:[{body:{id:"",path:""}}]}}}}}})}}class f extends o{type="table";shouldRender(a){return!!a.contributes?.localizations}render(a){const n=a.contributes?.localizations||[];if(!n.length)return{data:{headers:[],rows:[]},dispose:()=>{}};const r=[e("language id","Language ID"),e("localizations language name","Language Name"),e("localizations localized language name","Language Name (Localized)")],l=n.sort((t,d)=>t.languageId.localeCompare(d.languageId)).map(t=>[t.languageId,t.languageName??"",t.localizedLanguageName??""]);return{data:{headers:r,rows:l},dispose:()=>{}}}}g.as(u.ExtensionFeaturesRegistry).registerExtensionFeature({id:"localizations",label:e("localizations","Langauage Packs"),access:{canToggle:!1},renderer:new c(f)});export{N as BaseLocalizationWorkbenchContribution};
