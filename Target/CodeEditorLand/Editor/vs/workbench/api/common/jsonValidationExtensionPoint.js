import*as e from"../../../nls.js";import{ExtensionsRegistry as p}from"../../services/extensions/common/extensionsRegistry.js";import*as d from"../../../base/common/resources.js";import{isString as c}from"../../../base/common/types.js";import{Disposable as h}from"../../../base/common/lifecycle.js";import{Extensions as m}from"../../services/extensionManagement/common/extensionFeatures.js";import"../../../platform/extensions/common/extensions.js";import{Registry as g}from"../../../platform/registry/common/platform.js";import{SyncDescriptor as x}from"../../../platform/instantiation/common/descriptors.js";import{MarkdownString as y}from"../../../base/common/htmlContent.js";const u=p.registerExtensionPoint({extensionPoint:"jsonValidation",defaultExtensionKind:["workspace","web"],jsonSchema:{description:e.localize("contributes.jsonValidation","Contributes json schema configuration."),type:"array",defaultSnippets:[{body:[{fileMatch:"${1:file.json}",url:"${2:url}"}]}],items:{type:"object",defaultSnippets:[{body:{fileMatch:"${1:file.json}",url:"${2:url}"}}],properties:{fileMatch:{type:["string","array"],description:e.localize("contributes.jsonValidation.fileMatch",`The file pattern (or an array of patterns) to match, for example "package.json" or "*.launch". Exclusion patterns start with '!'`),items:{type:["string"]}},url:{description:e.localize("contributes.jsonValidation.url","A schema URL ('http:', 'https:') or relative path to the extension folder ('./')."),type:"string"}}}}});class F{constructor(){u.setHandler(a=>{for(const n of a){const o=n.value,t=n.collector,i=n.description.extensionLocation;if(!o||!Array.isArray(o)){t.error(e.localize("invalid.jsonValidation","'configuration.jsonValidation' must be a array"));return}o.forEach(r=>{if(!c(r.fileMatch)&&!(Array.isArray(r.fileMatch)&&r.fileMatch.every(c))){t.error(e.localize("invalid.fileMatch","'configuration.jsonValidation.fileMatch' must be defined as a string or an array of strings."));return}const s=r.url;if(!c(s)){t.error(e.localize("invalid.url","'configuration.jsonValidation.url' must be a URL or relative path"));return}if(s.startsWith("./"))try{const l=d.joinPath(i,s);d.isEqualOrParent(l,i)||t.warn(e.localize("invalid.path.1","Expected `contributes.{0}.url` ({1}) to be included inside extension's folder ({2}). This might make the extension non-portable.",u.name,l.toString(),i.path))}catch(l){t.error(e.localize("invalid.url.fileschema","'configuration.jsonValidation.url' is an invalid relative URL: {0}",l.message))}else if(!/^[^:/?#]+:\/\//.test(s)){t.error(e.localize("invalid.url.schema","'configuration.jsonValidation.url' must be an absolute URL or start with './'  to reference schemas located in the extension."));return}})}})}}class b extends h{type="table";shouldRender(a){return!!a.contributes?.jsonValidation}render(a){const n=a.contributes?.jsonValidation||[];if(!n.length)return{data:{headers:[],rows:[]},dispose:()=>{}};const o=[e.localize("fileMatch","File Match"),e.localize("schema","Schema")],t=n.map(i=>[new y().appendMarkdown(`\`${Array.isArray(i.fileMatch)?i.fileMatch.join(", "):i.fileMatch}\``),i.url]);return{data:{headers:o,rows:t},dispose:()=>{}}}}g.as(m.ExtensionFeaturesRegistry).registerExtensionFeature({id:"jsonValidation",label:e.localize("jsonValidation","JSON Validation"),access:{canToggle:!1},renderer:new x(b)});export{F as JSONValidationExtensionPoint};
