var v=Object.defineProperty;var b=Object.getOwnPropertyDescriptor;var u=(n,t,e,i)=>{for(var r=i>1?void 0:i?b(t,e):t,o=n.length-1,s;o>=0;o--)(s=n[o])&&(r=(i?s(t,e,r):s(r))||r);return i&&r&&v(t,e,r),r},d=(n,t)=>(e,i)=>t(e,i,n);import{Disposable as h}from"../../../../../../vs/base/common/lifecycle.js";import{isEqual as a}from"../../../../../../vs/base/common/resources.js";import{URI as I}from"../../../../../../vs/base/common/uri.js";import{IFileService as y}from"../../../../../../vs/platform/files/common/files.js";import"../../../../../../vs/platform/instantiation/common/instantiation.js";import"../../../../../../vs/workbench/common/contributions.js";import"../../../../../../vs/workbench/common/editor.js";import"../../../../../../vs/workbench/common/editor/editorInput.js";import"../../../../../../vs/workbench/contrib/files/browser/editors/fileEditorInput.js";import{ITextEditorService as l}from"../../../../../../vs/workbench/services/textfile/common/textEditorService.js";import{NO_TYPE_ID as f}from"../../../../../../vs/workbench/services/workingCopy/common/workingCopy.js";import{IWorkingCopyEditorService as F}from"../../../../../../vs/workbench/services/workingCopy/common/workingCopyEditorService.js";class G{canSerialize(t){return!0}serialize(t){const e=t,i=e.resource,r=e.preferredResource,o={resourceJSON:i.toJSON(),preferredResourceJSON:a(i,r)?void 0:r,name:e.getPreferredName(),description:e.getPreferredDescription(),encoding:e.getEncoding(),modeId:e.getPreferredLanguageId()};return JSON.stringify(o)}deserialize(t,e){return t.invokeFunction(i=>{const r=JSON.parse(e),o=I.revive(r.resourceJSON),s=I.revive(r.preferredResourceJSON),m=r.name,S=r.description,E=r.encoding,g=r.modeId,p=i.get(l).createTextEditor({resource:o,label:m,description:S,encoding:E,languageId:g,forceFile:!0});return s&&p.setPreferredResource(s),p})}}let c=class extends h{constructor(e,i,r){super();this.textEditorService=i;this.fileService=r;this._register(e.registerHandler(this))}static ID="workbench.contrib.fileEditorWorkingCopyEditorHandler";handles(e){return e.typeId===f&&this.fileService.canHandleResource(e.resource)}handlesSync(e){return e.typeId===f&&this.fileService.hasProvider(e.resource)}isOpen(e,i){return this.handlesSync(e)?a(e.resource,i.resource):!1}createEditor(e){return this.textEditorService.createTextEditor({resource:e.resource,forceFile:!0})}};c=u([d(0,F),d(1,l),d(2,y)],c);export{G as FileEditorInputSerializer,c as FileEditorWorkingCopyEditorHandler};
