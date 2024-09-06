var f=Object.defineProperty;var S=Object.getOwnPropertyDescriptor;var u=(s,i,e,r)=>{for(var t=r>1?void 0:r?S(i,e):i,o=s.length-1,d;o>=0;o--)(d=s[o])&&(t=(r?d(i,e,t):d(t))||t);return r&&t&&f(i,e,t),t},n=(s,i)=>(e,r)=>i(e,r,s);import{Disposable as h}from"../../../../../vs/base/common/lifecycle.js";import{Schemas as E}from"../../../../../vs/base/common/network.js";import{isEqual as g,toLocalResource as l}from"../../../../../vs/base/common/resources.js";import{URI as x}from"../../../../../vs/base/common/uri.js";import{PLAINTEXT_LANGUAGE_ID as y}from"../../../../../vs/editor/common/languages/modesRegistry.js";import"../../../../../vs/platform/instantiation/common/instantiation.js";import"../../../../../vs/workbench/common/contributions.js";import"../../../../../vs/workbench/common/editor.js";import"../../../../../vs/workbench/common/editor/editorInput.js";import{IWorkbenchEnvironmentService as I}from"../../../../../vs/workbench/services/environment/common/environmentService.js";import{IFilesConfigurationService as b}from"../../../../../vs/workbench/services/filesConfiguration/common/filesConfigurationService.js";import{IPathService as m}from"../../../../../vs/workbench/services/path/common/pathService.js";import{ITextEditorService as p}from"../../../../../vs/workbench/services/textfile/common/textEditorService.js";import{UntitledTextEditorInput as T}from"../../../../../vs/workbench/services/untitled/common/untitledTextEditorInput.js";import{IUntitledTextEditorService as U}from"../../../../../vs/workbench/services/untitled/common/untitledTextEditorService.js";import{NO_TYPE_ID as W}from"../../../../../vs/workbench/services/workingCopy/common/workingCopy.js";import{IWorkingCopyEditorService as C}from"../../../../../vs/workbench/services/workingCopy/common/workingCopyEditorService.js";let c=class{constructor(i,e,r){this.filesConfigurationService=i;this.environmentService=e;this.pathService=r}canSerialize(i){return this.filesConfigurationService.isHotExitEnabled&&!i.isDisposed()}serialize(i){if(!this.canSerialize(i))return;const e=i;let r=e.resource;e.hasAssociatedFilePath&&(r=l(r,this.environmentService.remoteAuthority,this.pathService.defaultUriScheme));let t;const o=e.getLanguageId();(o!==y||e.hasLanguageSetExplicitly)&&(t=o);const d={resourceJSON:r.toJSON(),modeId:t,encoding:e.getEncoding()};return JSON.stringify(d)}deserialize(i,e){return i.invokeFunction(r=>{const t=JSON.parse(e),o=x.revive(t.resourceJSON),d=t.modeId,v=t.encoding;return r.get(p).createTextEditor({resource:o,languageId:d,encoding:v,forceUntitled:!0})})}};c=u([n(0,b),n(1,I),n(2,m)],c);let a=class extends h{constructor(e,r,t,o,d){super();this.environmentService=r;this.pathService=t;this.textEditorService=o;this.untitledTextEditorService=d;this._register(e.registerHandler(this))}static ID="workbench.contrib.untitledTextEditorWorkingCopyEditorHandler";handles(e){return e.resource.scheme===E.untitled&&e.typeId===W}isOpen(e,r){return this.handles(e)?r instanceof T&&g(e.resource,r.resource):!1}createEditor(e){let r;return this.untitledTextEditorService.isUntitledWithAssociatedResource(e.resource)?r=l(e.resource,this.environmentService.remoteAuthority,this.pathService.defaultUriScheme):r=e.resource,this.textEditorService.createTextEditor({resource:r,forceUntitled:!0})}};a=u([n(0,C),n(1,I),n(2,m),n(3,p),n(4,U)],a);export{c as UntitledTextEditorInputSerializer,a as UntitledTextEditorWorkingCopyEditorHandler};
