var y=Object.defineProperty;var T=Object.getOwnPropertyDescriptor;var v=(f,n,e,r)=>{for(var o=r>1?void 0:r?T(n,e):n,t=f.length-1,s;t>=0;t--)(s=f[t])&&(o=(r?s(n,e,o):s(o))||o);return r&&o&&y(n,e,o),o},i=(f,n)=>(e,r)=>n(e,r,f);import"../../../../vs/base/common/lifecycle.js";import{Schemas as M}from"../../../../vs/base/common/network.js";import{isEqual as U}from"../../../../vs/base/common/resources.js";import"../../../../vs/base/common/uri.js";import{createTextBufferFactory as b}from"../../../../vs/editor/common/model/textModel.js";import{ITextModelService as P}from"../../../../vs/editor/common/services/resolverService.js";import{ITextResourceConfigurationService as m}from"../../../../vs/editor/common/services/textResourceConfiguration.js";import{IFileService as I}from"../../../../vs/platform/files/common/files.js";import{ILabelService as g}from"../../../../vs/platform/label/common/label.js";import{DEFAULT_EDITOR_ASSOCIATION as O,isResourceEditorInput as D}from"../../../../vs/workbench/common/editor.js";import"../../../../vs/workbench/common/editor/editorInput.js";import{AbstractResourceEditorInput as w}from"../../../../vs/workbench/common/editor/resourceEditorInput.js";import{TextResourceEditorModel as G}from"../../../../vs/workbench/common/editor/textResourceEditorModel.js";import{ICustomEditorLabelService as h}from"../../../../vs/workbench/services/editor/common/customEditorLabelService.js";import{IEditorService as S}from"../../../../vs/workbench/services/editor/common/editorService.js";import{IFilesConfigurationService as x}from"../../../../vs/workbench/services/filesConfiguration/common/filesConfigurationService.js";import{ITextFileService as L}from"../../../../vs/workbench/services/textfile/common/textfiles.js";let a=class extends w{constructor(e,r,o,t,s,l,c,u,p){super(e,r,s,l,c,u,p);this.editorService=o;this.textFileService=t}save(e,r){return this.resource.scheme!==M.untitled&&!this.fileService.hasProvider(this.resource)?this.saveAs(e,r):this.doSave(r,!1,e)}saveAs(e,r){return this.doSave(r,!0,e)}async doSave(e,r,o){let t;if(r?t=await this.textFileService.saveAs(this.resource,void 0,{...e,suggestedTarget:this.preferredResource}):t=await this.textFileService.save(this.resource,e),!!t)return{resource:t}}async revert(e,r){await this.textFileService.revert(this.resource,r)}};a=v([i(2,S),i(3,L),i(4,g),i(5,I),i(6,x),i(7,m),i(8,h)],a);let d=class extends a{constructor(e,r,o,t,s,l,c,u,p,R,E,F,C){super(e,void 0,u,c,R,p,E,F,C);this.name=r;this.description=o;this.preferredLanguageId=t;this.preferredContents=s;this.textModelService=l}static ID="workbench.editors.resourceEditorInput";get typeId(){return d.ID}get editorId(){return O.id}cachedModel=void 0;modelReference=void 0;getName(){return this.name||super.getName()}setName(e){this.name!==e&&(this.name=e,this._onDidChangeLabel.fire())}getDescription(){return this.description}setDescription(e){this.description!==e&&(this.description=e,this._onDidChangeLabel.fire())}setLanguageId(e,r){this.setPreferredLanguageId(e),this.cachedModel?.setLanguageId(e,r)}setPreferredLanguageId(e){this.preferredLanguageId=e}setPreferredContents(e){this.preferredContents=e}async resolve(){const e=this.preferredContents,r=this.preferredLanguageId;this.preferredContents=void 0,this.preferredLanguageId=void 0,this.modelReference||(this.modelReference=this.textModelService.createModelReference(this.resource));const o=await this.modelReference,t=o.object;if(!(t instanceof G))throw o.dispose(),this.modelReference=void 0,new Error(`Unexpected model for TextResourceEditorInput: ${this.resource}`);return this.cachedModel=t,(typeof e=="string"||typeof r=="string")&&t.updateTextEditorModel(typeof e=="string"?b(e):void 0,r),t}matches(e){return this===e?!0:e instanceof d?U(e.resource,this.resource):D(e)?super.matches(e):!1}dispose(){this.modelReference&&(this.modelReference.then(e=>e.dispose()),this.modelReference=void 0),this.cachedModel=void 0,super.dispose()}};d=v([i(5,P),i(6,L),i(7,S),i(8,I),i(9,g),i(10,x),i(11,m),i(12,h)],d);export{a as AbstractTextResourceEditorInput,d as TextResourceEditorInput};