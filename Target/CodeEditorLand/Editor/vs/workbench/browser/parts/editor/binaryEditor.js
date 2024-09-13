var h=Object.defineProperty;var f=Object.getOwnPropertyDescriptor;var s=(n,o,e,r)=>{for(var t=r>1?void 0:r?f(o,e):o,i=n.length-1,a;i>=0;i--)(a=n[i])&&(t=(r?a(o,e,t):a(t))||t);return r&&t&&h(o,e,t),t},m=(n,o)=>(e,r)=>o(e,r,n);import{Emitter as l}from"../../../../base/common/event.js";import{localize as p}from"../../../../nls.js";import{ByteSize as y}from"../../../../platform/files/common/files.js";import{IStorageService as I}from"../../../../platform/storage/common/storage.js";import{BinaryEditorModel as g}from"../../../common/editor/binaryEditorModel.js";import{EditorPlaceholder as v}from"./editorPlaceholder.js";let d=class extends v{constructor(e,r,t,i,a,c){super(e,r,i,a,c);this.callbacks=t}_onDidChangeMetadata=this._register(new l);onDidChangeMetadata=this._onDidChangeMetadata.event;_onDidOpenInPlace=this._register(new l);onDidOpenInPlace=this._onDidOpenInPlace.event;metadata;getTitle(){return this.input?this.input.getName():p("binaryEditor","Binary Viewer")}async getContents(e,r){const t=await e.resolve();if(!(t instanceof g))throw new Error("Unable to open file as binary");const i=t.getSize();return this.handleMetadataChanged(typeof i=="number"?y.formatSize(i):""),{icon:"$(warning)",label:p("binaryError","The file is not displayed in the text editor because it is either binary or uses an unsupported text encoding."),actions:[{label:p("openAnyway","Open Anyway"),run:async()=>{await this.callbacks.openInternal(e,r),this._onDidOpenInPlace.fire()}}]}}handleMetadataChanged(e){this.metadata=e,this._onDidChangeMetadata.fire()}getMetadata(){return this.metadata}};d=s([m(5,I)],d);export{d as BaseBinaryResourceEditor};
