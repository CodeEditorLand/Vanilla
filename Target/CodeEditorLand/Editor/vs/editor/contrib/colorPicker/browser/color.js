import{CancellationToken as C}from"../../../../base/common/cancellation.js";import{illegalArgument as d,onUnexpectedExternalError as f}from"../../../../base/common/errors.js";import{IConfigurationService as p}from"../../../../platform/configuration/common/configuration.js";import{ILanguageFeaturesService as I}from"../../../common/services/languageFeatures.js";import{IModelService as D}from"../../../common/services/model.js";import{DefaultDocumentColorProvider as g}from"./defaultDocumentColorProvider.js";async function R(n,o,r,e=!0){return v(new P,n,o,r,e)}function E(n,o,r,e){return Promise.resolve(r.provideColorPresentations(n,o,e))}class P{constructor(){}async compute(o,r,e,l){const t=await o.provideDocumentColors(r,e);if(Array.isArray(t))for(const a of t)l.push({colorInfo:a,provider:o});return Array.isArray(t)}}class k{constructor(){}async compute(o,r,e,l){const t=await o.provideDocumentColors(r,e);if(Array.isArray(t))for(const a of t)l.push({range:a.range,color:[a.color.red,a.color.green,a.color.blue,a.color.alpha]});return Array.isArray(t)}}class h{constructor(o){this.colorInfo=o}async compute(o,r,e,l){const t=await o.provideColorPresentations(r,this.colorInfo,C.None);return Array.isArray(t)&&l.push(...t),Array.isArray(t)}}async function v(n,o,r,e,l){let t=!1,a;const i=[],m=o.ordered(r);for(let c=m.length-1;c>=0;c--){const s=m[c];if(s instanceof g)a=s;else try{await n.compute(s,r,e,i)&&(t=!0)}catch(u){f(u)}}return t?i:a&&l?(await n.compute(a,r,e,i),i):[]}function w(n,o){const{colorProvider:r}=n.get(I),e=n.get(D).getModel(o);if(!e)throw d();const l=n.get(p).getValue("editor.defaultColorDecorators",{resource:o});return{model:e,colorProviderRegistry:r,isDefaultColorDecoratorsEnabled:l}}export{h as ColorPresentationsCollector,k as ExtColorDataCollector,v as _findColorData,w as _setupColorCommand,E as getColorPresentations,R as getColors};
