import{coalesce as i}from"../../../../base/common/arrays.js";import{VSBuffer as n}from"../../../../base/common/buffer.js";class l{requestIdPool=0;dataTransferFiles=new Map;add(a){const e=this.requestIdPool++;return this.dataTransferFiles.set(e,i(Array.from(a,([,r])=>r.asFile()))),{id:e,dispose:()=>{this.dataTransferFiles.delete(e)}}}async resolveFileData(a,e){const r=this.dataTransferFiles.get(a);if(!r)throw new Error("No data transfer found");const s=r.find(t=>t.id===e);if(!s)throw new Error("No matching file found in data transfer");return n.wrap(await s.data())}dispose(){this.dataTransferFiles.clear()}}export{l as DataTransferFileCache};
