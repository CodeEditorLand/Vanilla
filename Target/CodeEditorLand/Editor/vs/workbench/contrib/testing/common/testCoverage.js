import{CancellationToken as d}from"../../../../base/common/cancellation.js";import{ResourceMap as m}from"../../../../base/common/map.js";import{deepClone as b}from"../../../../base/common/objects.js";import{observableSignal as h}from"../../../../base/common/observable.js";import{WellDefinedPrefixTree as p}from"../../../../base/common/prefixTree.js";import{URI as I}from"../../../../base/common/uri.js";import"../../../../platform/uriIdentity/common/uriIdentity.js";import"./testId.js";import"./testResult.js";import{DetailType as T,ICoverageCount as u}from"./testTypes.js";let v=0;class E{constructor(e,t,r,a){this.result=e;this.fromTaskId=t;this.uriIdentityService=r;this.accessor=a}fileCoverage=new m;didAddCoverage=h(this);tree=new p;associatedData=new Map;*allPerTestIDs(){const e=new Set;for(const t of this.tree.nodes)if(t.value&&t.value.perTestData)for(const r of t.value.perTestData)e.has(r)||(e.add(r),yield r)}append(e,t){const r=this.getComputedForUri(e.uri),a=this.result,l=(i,s)=>{s[i]?(s[i].covered+=(e[i]?.covered||0)-(r?.[i]?.covered||0),s[i].total+=(e[i]?.total||0)-(r?.[i]?.total||0)):e[i]&&(s[i]={...e[i]})},n=[...this.treePathForUri(e.uri,!0)],c=[];this.tree.mutatePath(this.treePathForUri(e.uri,!1),i=>{if(c.push(i),c.length===n.length)if(i.value){const s=i.value;s.id=e.id,s.statement=e.statement,s.branch=e.branch,s.declaration=e.declaration}else{const s=i.value=new C(e,a,this.accessor);this.fileCoverage.set(e.uri,s)}else if(i.value)l("statement",i.value),l("branch",i.value),l("declaration",i.value),i.value.didChange.trigger(t);else{const s=b(e);s.id=String(v++),s.uri=this.treePathToUri(n.slice(0,c.length)),i.value=new g(s,a)}if(e.testIds){i.value.perTestData??=new Set;for(const s of e.testIds)i.value.perTestData.add(s)}}),c&&this.didAddCoverage.trigger(t,c)}filterTreeForTest(e){const t=new p;for(const r of this.tree.values())if(r instanceof C){if(!r.perTestData?.has(e.toString()))continue;const a=[...this.treePathForUri(r.uri,!0)],l=[];t.mutatePath(this.treePathForUri(r.uri,!1),n=>{l.push(n),n.value??=new F(this.treePathToUri(a.slice(0,l.length)),r.fromResult)})}return t}getAllFiles(){return this.fileCoverage}getUri(e){return this.fileCoverage.get(e)}getComputedForUri(e){return this.tree.find(this.treePathForUri(e,!1))}*treePathForUri(e,t){yield e.scheme,yield e.authority,yield*(!t&&this.uriIdentityService.extUri.ignorePathCasing(e)?e.path.toLowerCase():e.path).split("/")}treePathToUri(e){return I.from({scheme:e[0],authority:e[1],path:e.slice(2).join("/")})}}const y=(o,e,t)=>{let r=o.covered,a=o.total;return e&&(r+=e.covered,a+=e.total),t&&(r+=t.covered,a+=t.total),a===0?1:r/a};class f{constructor(e,t){this.fromResult=t;this.id=e.id,this.uri=e.uri,this.statement=e.statement,this.branch=e.branch,this.declaration=e.declaration}id;uri;statement;branch;declaration;didChange=h(this);get tpc(){return y(this.statement,this.branch,this.declaration)}perTestData}class g extends f{}class F extends g{constructor(e,t){super({id:String(v++),uri:e,statement:{covered:0,total:0}},t)}}class C extends f{constructor(t,r,a){super(t,r);this.accessor=a}_details;resolved;_detailsForTest;get hasSynchronousDetails(){return this._details instanceof Array||this.resolved}async detailsForTest(t,r=d.None){this._detailsForTest??=new Map;const a=t.toString(),l=this._detailsForTest.get(a);if(l)return l;const n=(async()=>{try{return await this.accessor.getCoverageDetails(this.id,a,r)}catch(c){throw this._detailsForTest?.delete(a),c}})();return this._detailsForTest.set(a,n),n}async details(t=d.None){this._details??=this.accessor.getCoverageDetails(this.id,void 0,t);try{const r=await this._details;return this.resolved=!0,r}catch(r){throw this._details=void 0,r}}}const G=(o,e)=>{const t={id:"",uri:o,statement:u.empty()};for(const r of e)if(r.type===T.Statement){t.statement.total++,t.statement.total+=r.count?1:0;for(const a of r.branches||[])t.branch??=u.empty(),t.branch.total++,t.branch.covered+=a.count?1:0}else t.declaration??=u.empty(),t.declaration.total++,t.declaration.covered+=r.count?1:0;return t};export{f as AbstractFileCoverage,F as BypassedFileCoverage,g as ComputedFileCoverage,C as FileCoverage,E as TestCoverage,y as getTotalCoveragePercent,G as totalFromCoverageDetails};
