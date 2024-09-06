import*as S from"../../../../../vs/base/common/json.js";import{getParseErrorMessage as v}from"../../../../../vs/base/common/jsonErrorMessages.js";import*as w from"../../../../../vs/base/common/path.js";import*as y from"../../../../../vs/base/common/resources.js";import{ThemeIcon as E}from"../../../../../vs/base/common/themables.js";import{isObject as R,isString as d}from"../../../../../vs/base/common/types.js";import"../../../../../vs/base/common/uri.js";import*as a from"../../../../../vs/nls.js";import"../../../../../vs/platform/extensionResourceLoader/common/extensionResourceLoader.js";import"../../../../../vs/platform/log/common/log.js";import{StorageScope as P,StorageTarget as C}from"../../../../../vs/platform/storage/common/storage.js";import{getIconRegistry as L,IconFontDefinition as T}from"../../../../../vs/platform/theme/common/iconRegistry.js";import{fontFormatRegex as O,fontIdRegex as F,fontStyleRegex as z,fontWeightRegex as j}from"../../../../../vs/workbench/services/themes/common/productIconThemeSchema.js";import{ExtensionData as b,ThemeSettingDefaults as M}from"../../../../../vs/workbench/services/themes/common/workbenchThemeService.js";const k="";class l{static STORAGE_KEY="productIconThemeData";id;label;settingsId;description;isLoaded;location;extensionData;watch;iconThemeDocument={iconDefinitions:new Map};styleSheetContent;constructor(e,t,o){this.id=e,this.label=t,this.settingsId=o,this.isLoaded=!1}getIcon(e){return U(e,this.iconThemeDocument)}ensureLoaded(e,t){return this.isLoaded?Promise.resolve(this.styleSheetContent):this.load(e,t)}reload(e,t){return this.load(e,t)}async load(e,t){const o=this.location;if(!o)return Promise.resolve(this.styleSheetContent);const i=[];return this.iconThemeDocument=await A(e,o,i),this.isLoaded=!0,i.length&&t.error(a.localize("error.parseicondefs",`Problems processing product icons definitions in {0}:
{1}`,o.toString(),i.join(`
`))),this.styleSheetContent}static fromExtensionTheme(e,t,o){const i=o.extensionId+"-"+e.id,r=e.label||w.basename(e.path),c=e.id,s=new l(i,r,c);return s.description=e.description,s.location=t,s.extensionData=o,s.watch=e._watch,s.isLoaded=!1,s}static createUnloadedTheme(e){const t=new l(e,"","__"+e);return t.isLoaded=!1,t.extensionData=void 0,t.watch=!1,t}static _defaultProductIconTheme=null;static get defaultTheme(){let e=l._defaultProductIconTheme;return e||(e=l._defaultProductIconTheme=new l(k,a.localize("defaultTheme","Default"),M.PRODUCT_ICON_THEME),e.isLoaded=!0,e.extensionData=void 0,e.watch=!1),e}static fromStorageData(e){const t=e.get(l.STORAGE_KEY,P.PROFILE);if(t)try{const o=JSON.parse(t),i=new l("","","");for(const s in o)switch(s){case"id":case"label":case"description":case"settingsId":case"styleSheetContent":case"watch":i[s]=o[s];break;case"location":break;case"extensionData":i.extensionData=b.fromJSONObject(o.extensionData);break}const{iconDefinitions:r,iconFontDefinitions:c}=o;if(Array.isArray(r)&&R(c)){const s=new Map;for(const D of r){const{id:u,fontCharacter:n,fontId:f}=D;if(d(u)&&d(n))if(d(f)){const h=T.fromJSONObject(c[f]);h&&s.set(u,{fontCharacter:n,font:{id:f,definition:h}})}else s.set(u,{fontCharacter:n})}i.iconThemeDocument={iconDefinitions:s}}return i}catch{return}}toStorage(e){const t=[],o={};for(const r of this.iconThemeDocument.iconDefinitions.entries()){const c=r[1].font;t.push({id:r[0],fontCharacter:r[1].fontCharacter,fontId:c?.id}),c&&o[c.id]===void 0&&(o[c.id]=T.toJSONObject(c.definition))}const i=JSON.stringify({id:this.id,label:this.label,description:this.description,settingsId:this.settingsId,styleSheetContent:this.styleSheetContent,watch:this.watch,extensionData:b.toJSONObject(this.extensionData),iconDefinitions:t,iconFontDefinitions:o});e.store(l.STORAGE_KEY,i,P.PROFILE,C.MACHINE)}}function A(p,e,t){return p.readExtensionResource(e).then(o=>{const i=[],r=S.parse(o,i);if(i.length>0)return Promise.reject(new Error(a.localize("error.cannotparseicontheme","Problems parsing product icons file: {0}",i.map(n=>v(n.error)).join(", "))));if(S.getNodeType(r)!=="object")return Promise.reject(new Error(a.localize("error.invalidformat","Invalid format for product icons theme file: Object expected.")));if(!r.iconDefinitions||!Array.isArray(r.fonts)||!r.fonts.length)return Promise.reject(new Error(a.localize("error.missingProperties","Invalid format for product icons theme file: Must contain iconDefinitions and fonts.")));const c=y.dirname(e),s=new Map;for(const n of r.fonts)if(d(n.id)&&n.id.match(F)){const f=n.id;let h;d(n.weight)&&n.weight.match(j)?h=n.weight:t.push(a.localize("error.fontWeight","Invalid font weight in font '{0}'. Ignoring setting.",n.id));let m;d(n.style)&&n.style.match(z)?m=n.style:t.push(a.localize("error.fontStyle","Invalid font style in font '{0}'. Ignoring setting.",n.id));const g=[];if(Array.isArray(n.src))for(const I of n.src)if(d(I.path)&&d(I.format)&&I.format.match(O)){const x=y.joinPath(c,I.path);g.push({location:x,format:I.format})}else t.push(a.localize("error.fontSrc","Invalid font source in font '{0}'. Ignoring source.",n.id));g.length?s.set(f,{weight:h,style:m,src:g}):t.push(a.localize("error.noFontSrc","No valid font source in font '{0}'. Ignoring font definition.",n.id))}else t.push(a.localize("error.fontId","Missing or invalid font id '{0}'. Skipping font definition.",n.id));const D=new Map,u=r.fonts[0].id;for(const n in r.iconDefinitions){const f=r.iconDefinitions[n];if(d(f.fontCharacter)){const h=f.fontId??u,m=s.get(h);if(m){const g={id:`pi-${h}`,definition:m};D.set(n,{fontCharacter:f.fontCharacter,font:g})}else t.push(a.localize("error.icon.font","Skipping icon definition '{0}'. Unknown font.",n))}else t.push(a.localize("error.icon.fontCharacter","Skipping icon definition '{0}'. Unknown fontCharacter.",n))}return{iconDefinitions:D}})}const N=L();function U(p,e){const t=e.iconDefinitions;let o=t.get(p.id),i=p.defaults;for(;!o&&E.isThemeIcon(i);){const r=N.getIcon(i.id);if(r)o=t.get(r.id),i=r.defaults;else return}if(o)return o;if(!E.isThemeIcon(i))return i}export{k as DEFAULT_PRODUCT_ICON_THEME_ID,l as ProductIconThemeData};