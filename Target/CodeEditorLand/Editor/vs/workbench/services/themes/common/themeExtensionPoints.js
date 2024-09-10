import*as o from"../../../../nls.js";import*as d from"../../../../base/common/types.js";import*as h from"../../../../base/common/resources.js";import{ExtensionsRegistry as c}from"../../extensions/common/extensionsRegistry.js";import{ExtensionData as u,VS_LIGHT_THEME as T,VS_DARK_THEME as l,VS_HC_THEME as f,VS_HC_LIGHT_THEME as x}from"./workbenchThemeService.js";import{Emitter as b}from"../../../../base/common/event.js";import"../../../../base/common/uri.js";import{Disposable as E}from"../../../../base/common/lifecycle.js";import{Extensions as g}from"../../extensionManagement/common/extensionFeatures.js";import"../../../../platform/extensions/common/extensions.js";import{MarkdownString as I}from"../../../../base/common/htmlContent.js";import{Registry as y}from"../../../../platform/registry/common/platform.js";import{SyncDescriptor as v}from"../../../../platform/instantiation/common/descriptors.js";function K(){return c.registerExtensionPoint({extensionPoint:"themes",jsonSchema:{description:o.localize("vscode.extension.contributes.themes","Contributes textmate color themes."),type:"array",items:{type:"object",defaultSnippets:[{body:{label:"${1:label}",id:"${2:id}",uiTheme:l,path:"./themes/${3:id}.tmTheme."}}],properties:{id:{description:o.localize("vscode.extension.contributes.themes.id","Id of the color theme as used in the user settings."),type:"string"},label:{description:o.localize("vscode.extension.contributes.themes.label","Label of the color theme as shown in the UI."),type:"string"},uiTheme:{description:o.localize("vscode.extension.contributes.themes.uiTheme","Base theme defining the colors around the editor: 'vs' is the light color theme, 'vs-dark' is the dark color theme. 'hc-black' is the dark high contrast theme, 'hc-light' is the light high contrast theme."),enum:[T,l,f,x]},path:{description:o.localize("vscode.extension.contributes.themes.path","Path of the tmTheme file. The path is relative to the extension folder and is typically './colorthemes/awesome-color-theme.json'."),type:"string"}},required:["path","uiTheme"]}}})}function N(){return c.registerExtensionPoint({extensionPoint:"iconThemes",jsonSchema:{description:o.localize("vscode.extension.contributes.iconThemes","Contributes file icon themes."),type:"array",items:{type:"object",defaultSnippets:[{body:{id:"${1:id}",label:"${2:label}",path:"./fileicons/${3:id}-icon-theme.json"}}],properties:{id:{description:o.localize("vscode.extension.contributes.iconThemes.id","Id of the file icon theme as used in the user settings."),type:"string"},label:{description:o.localize("vscode.extension.contributes.iconThemes.label","Label of the file icon theme as shown in the UI."),type:"string"},path:{description:o.localize("vscode.extension.contributes.iconThemes.path","Path of the file icon theme definition file. The path is relative to the extension folder and is typically './fileicons/awesome-icon-theme.json'."),type:"string"}},required:["path","id"]}}})}function J(){return c.registerExtensionPoint({extensionPoint:"productIconThemes",jsonSchema:{description:o.localize("vscode.extension.contributes.productIconThemes","Contributes product icon themes."),type:"array",items:{type:"object",defaultSnippets:[{body:{id:"${1:id}",label:"${2:label}",path:"./producticons/${3:id}-product-icon-theme.json"}}],properties:{id:{description:o.localize("vscode.extension.contributes.productIconThemes.id","Id of the product icon theme as used in the user settings."),type:"string"},label:{description:o.localize("vscode.extension.contributes.productIconThemes.label","Label of the product icon theme as shown in the UI."),type:"string"},path:{description:o.localize("vscode.extension.contributes.productIconThemes.path","Path of the product icon theme definition file. The path is relative to the extension folder and is typically './producticons/awesome-product-icon-theme.json'."),type:"string"}},required:["path","id"]}}})}class P extends E{type="markdown";shouldRender(e){return!!e.contributes?.themes||!!e.contributes?.iconThemes||!!e.contributes?.productIconThemes}render(e){const t=new I;if(e.contributes?.themes){t.appendMarkdown(`### ${o.localize("color themes","Color Themes")}

`);for(const n of e.contributes.themes)t.appendMarkdown(`- ${n.label}
`)}if(e.contributes?.iconThemes){t.appendMarkdown(`### ${o.localize("file icon themes","File Icon Themes")}

`);for(const n of e.contributes.iconThemes)t.appendMarkdown(`- ${n.label}
`)}if(e.contributes?.productIconThemes){t.appendMarkdown(`### ${o.localize("product icon themes","Product Icon Themes")}

`);for(const n of e.contributes.productIconThemes)t.appendMarkdown(`- ${n.label}
`)}return{data:t,dispose:()=>{}}}}y.as(g.ExtensionFeaturesRegistry).registerExtensionFeature({id:"themes",label:o.localize("themes","Themes"),access:{canToggle:!1},renderer:new v(P)});class Q{constructor(e,t,n=!1,s=void 0){this.themesExtPoint=e;this.create=t;this.idRequired=n;this.builtInTheme=s;this.extensionThemes=[],this.initialize()}extensionThemes;onDidChangeEmitter=new b;onDidChange=this.onDidChangeEmitter.event;dispose(){this.themesExtPoint.setHandler(()=>{})}initialize(){this.themesExtPoint.setHandler((e,t)=>{const n={},s=[];for(const i of this.extensionThemes)n[i.id]=i;this.extensionThemes.length=0;for(const i of e){const a=u.fromName(i.description.publisher,i.description.name,i.description.isBuiltin);this.onThemes(a,i.description.extensionLocation,i.value,this.extensionThemes,i.collector)}for(const i of this.extensionThemes)n[i.id]?delete n[i.id]:s.push(i);const r=Object.values(n);this.onDidChangeEmitter.fire({themes:this.extensionThemes,added:s,removed:r})})}onThemes(e,t,n,s=[],r){return Array.isArray(n)?(n.forEach(i=>{if(!i.path||!d.isString(i.path)){r?.error(o.localize("reqpath","Expected string in `contributes.{0}.path`. Provided value: {1}",this.themesExtPoint.name,String(i.path)));return}if(this.idRequired&&(!i.id||!d.isString(i.id))){r?.error(o.localize("reqid","Expected string in `contributes.{0}.id`. Provided value: {1}",this.themesExtPoint.name,String(i.id)));return}const a=h.joinPath(t,i.path);h.isEqualOrParent(a,t)||r?.warn(o.localize("invalid.path.1","Expected `contributes.{0}.path` ({1}) to be included inside extension's folder ({2}). This might make the extension non-portable.",this.themesExtPoint.name,a.path,t.path));const p=this.create(i,a,e);s.push(p)}),s):(r?.error(o.localize("reqarray","Extension point `{0}` must be an array.",this.themesExtPoint.name)),s)}findThemeById(e){if(this.builtInTheme&&this.builtInTheme.id===e)return this.builtInTheme;const t=this.getThemes();for(const n of t)if(n.id===e)return n}findThemeBySettingsId(e,t){if(this.builtInTheme&&this.builtInTheme.settingsId===e)return this.builtInTheme;const n=this.getThemes();let s;for(const r of n){if(r.settingsId===e)return r;r.settingsId===t&&(s=r)}return s}findThemeByExtensionLocation(e){return e?this.getThemes().filter(t=>t.location&&h.isEqualOrParent(t.location,e)):[]}getThemes(){return this.extensionThemes}getMarketplaceThemes(e,t,n){const s=e?.contributes?.[this.themesExtPoint.name];return Array.isArray(s)?this.onThemes(n,t,s):[]}}export{Q as ThemeRegistry,K as registerColorThemeExtensionPoint,N as registerFileIconThemeExtensionPoint,J as registerProductIconThemeExtensionPoint};
