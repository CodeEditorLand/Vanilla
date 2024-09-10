import{Emitter as n}from"../../../../../base/common/event.js";import{Disposable as a}from"../../../../../base/common/lifecycle.js";import{compressOutputItemStreams as o,isTextStreamMime as u}from"../notebookCommon.js";class c extends a{constructor(t){super();this._rawOutput=t;this._alternativeOutputId=this._rawOutput.outputId}_onDidChangeData=this._register(new n);onDidChangeData=this._onDidChangeData.event;get outputs(){return this._rawOutput.outputs||[]}get metadata(){return this._rawOutput.metadata}get outputId(){return this._rawOutput.outputId}_alternativeOutputId;get alternativeOutputId(){return this._alternativeOutputId}_versionId=0;get versionId(){return this._versionId}replaceData(t){this.versionedBufferLengths={},this._rawOutput=t,this.optimizeOutputItems(),this._versionId=this._versionId+1,this._onDidChangeData.fire()}appendData(t){this.trackBufferLengths(),this._rawOutput.outputs.push(...t),this.optimizeOutputItems(),this._versionId=this._versionId+1,this._onDidChangeData.fire()}trackBufferLengths(){this.outputs.forEach(t=>{u(t.mime)&&(this.versionedBufferLengths[t.mime]||(this.versionedBufferLengths[t.mime]={}),this.versionedBufferLengths[t.mime][this.versionId]=t.data.byteLength)})}versionedBufferLengths={};appendedSinceVersion(t,s){const e=this.versionedBufferLengths[s]?.[t],i=this.outputs.find(r=>r.mime===s);if(e&&i)return i.data.slice(e)}optimizeOutputItems(){if(this.outputs.length>1&&this.outputs.every(t=>u(t.mime))){const t=new Map,s=[];this.outputs.forEach(e=>{let i;t.has(e.mime)?i=t.get(e.mime):(i=[],t.set(e.mime,i),s.push(e.mime)),i.push(e.data.buffer)}),this.outputs.length=0,s.forEach(e=>{const i=o(t.get(e));this.outputs.push({mime:e,data:i.data}),i.didCompression&&(this.versionedBufferLengths={})})}}asDto(){return{metadata:this._rawOutput.metadata,outputs:this._rawOutput.outputs,outputId:this._rawOutput.outputId}}bumpVersion(){this._versionId=this._versionId+1}}export{c as NotebookCellOutputTextModel};
