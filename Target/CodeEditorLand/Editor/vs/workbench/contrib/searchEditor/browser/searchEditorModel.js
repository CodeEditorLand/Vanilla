import"../../../../base/common/uri.js";import"../../../../editor/common/model.js";import{IModelService as f}from"../../../../editor/common/services/model.js";import{ILanguageService as m}from"../../../../editor/common/languages/language.js";import{IInstantiationService as u}from"../../../../platform/instantiation/common/instantiation.js";import{parseSavedSearchEditor as v,parseSerializedSearchEditor as M}from"./searchEditorSerialization.js";import{IWorkingCopyBackupService as p}from"../../../services/workingCopy/common/workingCopyBackup.js";import"./searchEditorInput.js";import{assertIsDefined as y}from"../../../../base/common/types.js";import{createTextBufferFactoryFromStream as I}from"../../../../editor/common/model/textModel.js";import{SearchEditorWorkingCopyTypeId as E}from"./constants.js";import{Emitter as k}from"../../../../base/common/event.js";import{ResourceMap as w}from"../../../../base/common/map.js";import{SEARCH_RESULT_LANGUAGE_ID as l}from"../../../services/search/common/search.js";class g{constructor(e){this.config=e}_onConfigDidUpdate=new k;onConfigDidUpdate=this._onConfigDidUpdate.event;updateConfig(e){this.config=e,this._onConfigDidUpdate.fire(e)}}class q{constructor(e){this.resource=e}async resolve(){return y(F.models.get(this.resource)).resolve()}}class C{models=new w;constructor(){}initializeModelFromExistingModel(e,t,i){if(this.models.has(t))throw Error("Unable to contruct model for resource that already exists");const s=e.get(m),n=e.get(f),a=e.get(u),c=e.get(p);let o;this.models.set(t,{resolve:()=>(o||(o=(async()=>{const r=await this.tryFetchModelFromBackupService(t,s,n,c,a);return r||Promise.resolve({resultsModel:n.getModel(t)??n.createModel("",s.createById(l),t),configurationModel:new g(i)})})()),o)})}initializeModelFromRawData(e,t,i,s){if(this.models.has(t))throw Error("Unable to contruct model for resource that already exists");const n=e.get(m),a=e.get(f),c=e.get(u),o=e.get(p);let r;this.models.set(t,{resolve:()=>(r||(r=(async()=>{const d=await this.tryFetchModelFromBackupService(t,n,a,o,c);return d||Promise.resolve({resultsModel:a.createModel(s??"",n.createById(l),t),configurationModel:new g(i)})})()),r)})}initializeModelFromExistingFile(e,t,i){if(this.models.has(t))throw Error("Unable to contruct model for resource that already exists");const s=e.get(m),n=e.get(f),a=e.get(u),c=e.get(p);let o;this.models.set(t,{resolve:async()=>(o||(o=(async()=>{const r=await this.tryFetchModelFromBackupService(t,s,n,c,a);if(r)return r;const{text:d,config:h}=await a.invokeFunction(v,i);return{resultsModel:n.createModel(d??"",s.createById(l),t),configurationModel:new g(h)}})()),o)})}async tryFetchModelFromBackupService(e,t,i,s,n){const a=await s.resolve({resource:e,typeId:E});let c=i.getModel(e);if(!c&&a){const o=await I(a.value);c=i.createModel(o,t.createById(l),e)}if(c){const o=c.getValue(),{text:r,config:d}=M(o);return i.destroyModel(e),{resultsModel:i.createModel(r??"",t.createById(l),e),configurationModel:new g(d)}}else return}}const F=new C;export{g as SearchConfigurationModel,q as SearchEditorModel,F as searchEditorModelFactory};
