var n=Object.defineProperty;var u=Object.getOwnPropertyDescriptor;var g=(m,r,i,o)=>{for(var e=o>1?void 0:o?u(r,i):r,a=m.length-1,c;a>=0;a--)(c=m[a])&&(e=(o?c(r,i,e):c(e))||e);return o&&e&&n(r,i,e),e},t=(m,r)=>(i,o)=>r(i,o,m);import{WorkerDescriptor as p}from"../../../../../vs/base/browser/defaultWorkerFactory.js";import{EditorWorkerService as f}from"../../../../../vs/editor/browser/services/editorWorkerService.js";import{ILanguageConfigurationService as v}from"../../../../../vs/editor/common/languages/languageConfigurationRegistry.js";import{ILanguageFeaturesService as I}from"../../../../../vs/editor/common/services/languageFeatures.js";import{IModelService as S}from"../../../../../vs/editor/common/services/model.js";import{ITextResourceConfigurationService as L}from"../../../../../vs/editor/common/services/textResourceConfiguration.js";import{ILogService as x}from"../../../../../vs/platform/log/common/log.js";let s=class extends f{constructor(r,i,o,e,a){const c=new p("vs/editor/common/services/editorSimpleWorker","TextEditorWorker");super(c,r,i,o,e,a)}};s=g([t(0,S),t(1,L),t(2,x),t(3,v),t(4,I)],s);export{s as WorkbenchEditorWorkerService};