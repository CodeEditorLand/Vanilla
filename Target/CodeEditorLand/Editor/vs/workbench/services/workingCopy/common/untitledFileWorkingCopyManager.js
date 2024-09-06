var W=Object.defineProperty;var k=Object.getOwnPropertyDescriptor;var d=(s,r,e,i)=>{for(var t=i>1?void 0:i?k(r,e):r,o=s.length-1,l;o>=0;o--)(l=s[o])&&(t=(i?l(r,e,t):l(t))||t);return i&&t&&W(r,e,t),t},n=(s,r)=>(e,i)=>r(e,i,s);import{Emitter as c}from"../../../../base/common/event.js";import{DisposableStore as u,dispose as g}from"../../../../base/common/lifecycle.js";import{ResourceMap as m}from"../../../../base/common/map.js";import{Schemas as a}from"../../../../base/common/network.js";import{URI as y}from"../../../../base/common/uri.js";import{IFileService as h}from"../../../../platform/files/common/files.js";import{ILabelService as F}from"../../../../platform/label/common/label.js";import{ILogService as v}from"../../../../platform/log/common/log.js";import{BaseFileWorkingCopyManager as U}from"./abstractFileWorkingCopyManager.js";import{UntitledFileWorkingCopy as O}from"./untitledFileWorkingCopy.js";import{IWorkingCopyBackupService as f}from"./workingCopyBackup.js";import{IWorkingCopyService as R}from"./workingCopyService.js";let p=class extends U{constructor(e,i,t,o,l,I,C,M){super(o,I,C);this.workingCopyTypeId=e;this.modelFactory=i;this.saveDelegate=t;this.labelService=l;this.workingCopyService=M}_onDidChangeDirty=this._register(new c);onDidChangeDirty=this._onDidChangeDirty.event;_onWillDispose=this._register(new c);onWillDispose=this._onWillDispose.event;mapResourceToWorkingCopyListeners=new m;async resolve(e){const i=this.doCreateOrGet(e);return await i.resolve(),i}doCreateOrGet(e=Object.create(null)){const i=this.massageOptions(e);if(i.untitledResource){const t=this.get(i.untitledResource);if(t)return t}return this.doCreate(i)}massageOptions(e){const i=Object.create(null);return e.associatedResource?(i.untitledResource=y.from({scheme:a.untitled,authority:e.associatedResource.authority,fragment:e.associatedResource.fragment,path:e.associatedResource.path,query:e.associatedResource.query}),i.associatedResource=e.associatedResource):(e.untitledResource?.scheme===a.untitled&&(i.untitledResource=e.untitledResource),i.isScratchpad=e.isScratchpad),i.contents=e.contents,i}doCreate(e){let i=e.untitledResource;if(!i){let o=1;do i=y.from({scheme:a.untitled,path:e.isScratchpad?`Scratchpad-${o}`:`Untitled-${o}`,query:this.workingCopyTypeId?`typeId=${this.workingCopyTypeId}`:void 0}),o++;while(this.has(i))}const t=new O(this.workingCopyTypeId,i,this.labelService.getUriBasenameLabel(i),!!e.associatedResource,!!e.isScratchpad,e.contents,this.modelFactory,this.saveDelegate,this.workingCopyService,this.workingCopyBackupService,this.logService);return this.registerWorkingCopy(t),t}registerWorkingCopy(e){const i=new u;i.add(e.onDidChangeDirty(()=>this._onDidChangeDirty.fire(e))),i.add(e.onWillDispose(()=>this._onWillDispose.fire(e))),this.mapResourceToWorkingCopyListeners.set(e.resource,i),this.add(e.resource,e),e.isDirty()&&this._onDidChangeDirty.fire(e)}remove(e){const i=super.remove(e),t=this.mapResourceToWorkingCopyListeners.get(e);return t&&(g(t),this.mapResourceToWorkingCopyListeners.delete(e)),i}dispose(){super.dispose(),g(this.mapResourceToWorkingCopyListeners.values()),this.mapResourceToWorkingCopyListeners.clear()}};p=d([n(3,h),n(4,F),n(5,v),n(6,f),n(7,R)],p);export{p as UntitledFileWorkingCopyManager};
