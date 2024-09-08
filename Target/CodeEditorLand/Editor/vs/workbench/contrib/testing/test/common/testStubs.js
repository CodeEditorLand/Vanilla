import{URI as l}from"../../../../../base/common/uri.js";import{MainThreadTestCollection as u}from"../../common/mainThreadTestCollection.js";import"../../common/testTypes.js";import{TestId as n}from"../../common/testId.js";import{createTestItemChildren as T,TestItemCollection as f,TestItemEventOp as a}from"../../common/testItemCollection.js";class r{constructor(e,t,s){this._extId=e;this.props={extId:e.toString(),busy:!1,description:null,error:null,label:t,range:null,sortText:null,tags:[],uri:s}}props;_canResolveChildren=!1;get tags(){return this.props.tags.map(e=>({id:e}))}set tags(e){this.api.listener?.({op:a.SetTags,new:e,old:this.props.tags.map(t=>({id:t}))}),this.props.tags=e.map(t=>t.id)}get canResolveChildren(){return this._canResolveChildren}set canResolveChildren(e){this._canResolveChildren=e,this.api.listener?.({op:a.UpdateCanResolveChildren,state:e})}get parent(){return this.api.parent}get id(){return this._extId.localId}api={controllerId:this._extId.controllerId};children=T(this.api,e=>e.api,r);get(e){return this.props[e]}set(e,t){this.props[e]=t,this.api.listener?.({op:a.SetProp,update:{[e]:t}})}toTestItem(){const e={...this.props};return e.extId=this._extId.toString(),e}}class I extends f{constructor(e="ctrlId"){const t=new r(new n([e]),"root");t._isRoot=!0,super({controllerId:e,getApiFor:s=>s.api,toITestItem:s=>s.toTestItem(),getChildren:s=>s.children,getDocumentVersion:()=>{},root:t})}get currentDiff(){return this.diff}setDiff(e){this.diff=e}}const v=async(i=m.nested())=>{const e=new u({asCanonicalUri:t=>t},async(t,s)=>i.expand(t,s));return await i.expand(i.root.id,1/0),e.apply(i.collectDiff()),i.dispose(),e},D=i=>{const e=new I,t=(s,o,p)=>{for(const d of Object.keys(o)){const c=new r(new n([...p,d]),d);s.children.add(c),o[d]&&t(c,o[d],[...p,d])}};return t(e.root,i,["ctrlId"]),e},m={nested:(i="id-")=>{const e=new I;return e.resolveHandler=t=>{if(t===void 0){const s=new r(new n(["ctrlId","id-a"]),"a",l.file("/"));s.canResolveChildren=!0;const o=new r(new n(["ctrlId","id-b"]),"b",l.file("/"));e.root.children.add(s),e.root.children.add(o)}else t.id===i+"a"&&(t.children.add(new r(new n(["ctrlId","id-a","id-aa"]),"aa",l.file("/"))),t.children.add(new r(new n(["ctrlId","id-a","id-ab"]),"ab",l.file("/"))))},e}};export{I as TestTestCollection,r as TestTestItem,v as getInitializedMainTestCollection,D as makeSimpleStubTree,m as testStubs};
