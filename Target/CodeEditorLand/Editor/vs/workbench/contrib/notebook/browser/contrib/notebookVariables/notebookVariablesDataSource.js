import{CancellationTokenSource as s}from"../../../../../../base/common/cancellation.js";import{localize as c}from"../../../../../../nls.js";import{variablePageSize as d}from"../../../common/notebookKernelService.js";class m{constructor(e){this.notebookKernelService=e;this.cancellationTokenSource=new s}cancellationTokenSource;hasChildren(e){return e.kind==="root"||e.hasNamedChildren||e.indexedChildrenCount>0}cancel(){this.cancellationTokenSource.cancel(),this.cancellationTokenSource.dispose(),this.cancellationTokenSource=new s}async getChildren(e){return e.kind==="root"?this.getRootVariables(e.notebook):this.getVariables(e)}async getVariables(e){const o=this.notebookKernelService.getMatchingKernel(e.notebook).selected;if(o&&o.hasVariableProvider){let t=[];if(e.hasNamedChildren){const r=await o.provideVariables(e.notebook.uri,e.extHostId,"named",0,this.cancellationTokenSource.token).map(i=>this.createVariableElement(i,e.notebook)).toPromise();t=t.concat(r)}if(e.indexedChildrenCount>0){const n=await this.getIndexedChildren(e,o);t=t.concat(n)}return t}return[]}async getIndexedChildren(e,o){const t=[];if(e.indexedChildrenCount>d){const n=Math.floor(Math.max(e.indexedChildrenCount/d,100)),r=1e6;let i=e.indexStart??0;const a=i+Math.min(e.indexedChildrenCount,r);for(;i<a;i+=n){let l=i+n;l>a&&(l=a),t.push({kind:"variable",notebook:e.notebook,id:e.id+`${i}`,extHostId:e.extHostId,name:`[${i}..${l-1}]`,value:"",indexedChildrenCount:l-i,indexStart:i,hasNamedChildren:!1})}e.indexedChildrenCount>r&&t.push({kind:"variable",notebook:e.notebook,id:e.id+`${a+1}`,extHostId:e.extHostId,name:c("notebook.indexedChildrenLimitReached","Display limit reached"),value:"",indexedChildrenCount:0,hasNamedChildren:!1})}else if(e.indexedChildrenCount>0){const n=o.provideVariables(e.notebook.uri,e.extHostId,"indexed",e.indexStart??0,this.cancellationTokenSource.token);for await(const r of n)if(t.push(this.createVariableElement(r,e.notebook)),t.length>=d)break}return t}async getRootVariables(e){const o=this.notebookKernelService.getMatchingKernel(e).selected;return o&&o.hasVariableProvider?await o.provideVariables(e.uri,void 0,"named",0,this.cancellationTokenSource.token).map(n=>this.createVariableElement(n,e)).toPromise():[]}createVariableElement(e,o){return{...e,kind:"variable",notebook:o,extHostId:e.id,id:`${e.id}`}}}export{m as NotebookVariableDataSource};
