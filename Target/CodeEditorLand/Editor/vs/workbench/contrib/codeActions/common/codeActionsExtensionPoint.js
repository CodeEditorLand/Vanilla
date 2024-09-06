import{MarkdownString as r}from"../../../../../vs/base/common/htmlContent.js";import{Disposable as d}from"../../../../../vs/base/common/lifecycle.js";import*as e from"../../../../../vs/nls.js";import"../../../../../vs/platform/configuration/common/configurationRegistry.js";import"../../../../../vs/platform/extensions/common/extensions.js";import{SyncDescriptor as l}from"../../../../../vs/platform/instantiation/common/descriptors.js";import{Registry as p}from"../../../../../vs/platform/registry/common/platform.js";import{Extensions as g}from"../../../../../vs/workbench/services/extensionManagement/common/extensionFeatures.js";import{languagesExtPoint as u}from"../../../../../vs/workbench/services/language/common/languageService.js";var m=(o=>(o.languages="languages",o.actions="actions",o.kind="kind",o.title="title",o.description="description",o))(m||{});const A=Object.freeze({type:"array",markdownDescription:e.localize("contributes.codeActions","Configure which editor to use for a resource."),items:{type:"object",required:["languages","actions"],properties:{languages:{type:"array",description:e.localize("contributes.codeActions.languages","Language modes that the code actions are enabled for."),items:{type:"string"}},actions:{type:"object",required:["kind","title"],properties:{kind:{type:"string",markdownDescription:e.localize("contributes.codeActions.kind","`CodeActionKind` of the contributed code action.")},title:{type:"string",description:e.localize("contributes.codeActions.title","Label for the code action used in the UI.")},description:{type:"string",description:e.localize("contributes.codeActions.description","Description of what the code action does.")}}}}}}),S={extensionPoint:"codeActions",deps:[u],jsonSchema:A};class x extends d{type="table";shouldRender(i){return!!i.contributes?.codeActions}render(i){const s=i.contributes?.codeActions||[];if(!s.length)return{data:{headers:[],rows:[]},dispose:()=>{}};const a=s.map(t=>t.actions.map(n=>({...n,languages:t.languages}))).flat(),c=[e.localize("codeActions.title","Title"),e.localize("codeActions.kind","Kind"),e.localize("codeActions.description","Description"),e.localize("codeActions.languages","Languages")],o=a.sort((t,n)=>t.title.localeCompare(n.title)).map(t=>[t.title,new r().appendMarkdown(`\`${t.kind}\``),t.description??"",new r().appendMarkdown(`${t.languages.map(n=>`\`${n}\``).join("&nbsp;")}`)]);return{data:{headers:c,rows:o},dispose:()=>{}}}}p.as(g.ExtensionFeaturesRegistry).registerExtensionFeature({id:"codeActions",label:e.localize("codeactions","Code Actions"),access:{canToggle:!1},renderer:new l(x)});export{S as codeActionsExtensionPointDescriptor};
