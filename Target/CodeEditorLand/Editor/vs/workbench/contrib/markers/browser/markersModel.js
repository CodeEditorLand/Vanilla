import{isNonEmptyArray as M}from"../../../../base/common/arrays.js";import{Emitter as R}from"../../../../base/common/event.js";import"../../../../base/common/filters.js";import{Hasher as v}from"../../../../base/common/hash.js";import{ResourceMap as _}from"../../../../base/common/map.js";import{basename as S,extUri as c}from"../../../../base/common/resources.js";import{splitLines as U}from"../../../../base/common/strings.js";import"../../../../base/common/uri.js";import{Range as C}from"../../../../editor/common/core/range.js";import{IMarkerData as w,MarkerSeverity as f}from"../../../../platform/markers/common/markers.js";import{unsupportedSchemas as B}from"../../../../platform/markers/common/markerService.js";function Q(a,r){return c.compare(a.resource,r.resource)}function x(a,r){const[e]=a.markers,[s]=r.markers;let o=0;return e&&s&&(o=f.compare(e.marker.severity,s.marker.severity)),o===0&&(o=a.path.localeCompare(r.path)||a.name.localeCompare(r.name)),o}class m{constructor(r,e){this.id=r;this.resource=e;this.path=this.resource.fsPath,this.name=S(this.resource)}path;name;_markersMap=new _;_cachedMarkers;_total=0;get markers(){return this._cachedMarkers||(this._cachedMarkers=[...this._markersMap.values()].flat().sort(m._compareMarkers)),this._cachedMarkers}has(r){return this._markersMap.has(r)}set(r,e){this.delete(r),M(e)&&(this._markersMap.set(r,e),this._total+=e.length,this._cachedMarkers=void 0)}delete(r){const e=this._markersMap.get(r);e&&(this._total-=e.length,this._cachedMarkers=void 0,this._markersMap.delete(r))}get total(){return this._total}static _compareMarkers(r,e){return f.compare(r.marker.severity,e.marker.severity)||c.compare(r.resource,e.resource)||C.compareRangesUsingStarts(r.marker,e.marker)}}class g{constructor(r,e,s=[]){this.id=r;this.marker=e;this.relatedInformation=s}get resource(){return this.marker.resource}get range(){return this.marker}_lines;get lines(){return this._lines||(this._lines=U(this.marker.message)),this._lines}toString(){return JSON.stringify({...this.marker,resource:this.marker.resource.path,relatedInformation:this.relatedInformation.length?this.relatedInformation.map(r=>({...r.raw,resource:r.raw.resource.path})):void 0},null,"	")}}class V extends g{constructor(e,s,o,d,t,u){super(e.id,e.marker,e.relatedInformation);this.sourceMatches=s;this.codeMatches=o;this.messageMatches=d;this.fileMatches=t;this.ownerMatches=u}}class E{constructor(r,e,s){this.id=r;this.marker=e;this.raw=s}}class W{cachedSortedResources=void 0;_onDidChange=new R;onDidChange=this._onDidChange.event;get resourceMarkers(){return this.cachedSortedResources||(this.cachedSortedResources=[...this.resourcesByUri.values()].sort(x)),this.cachedSortedResources}resourcesByUri;constructor(){this.resourcesByUri=new Map}reset(){const r=new Set;for(const e of this.resourcesByUri.values())r.add(e);this.resourcesByUri.clear(),this._total=0,this._onDidChange.fire({removed:r,added:new Set,updated:new Set})}_total=0;get total(){return this._total}getResourceMarkers(r){return this.resourcesByUri.get(c.getComparisonKey(r,!0))??null}setResourceMarkers(r){const e={added:new Set,removed:new Set,updated:new Set};for(const[s,o]of r){if(B.has(s.scheme))continue;const d=c.getComparisonKey(s,!0);let t=this.resourcesByUri.get(d);if(M(o)){if(t)e.updated.add(t);else{const n=this.id(s.toString());t=new m(n,s.with({fragment:null})),this.resourcesByUri.set(d,t),e.added.add(t)}const u=new Map,y=o.map(n=>{const h=w.makeKey(n),l=u.get(h)||0;u.set(h,l+1);const k=this.id(t.id,h,l,n.resource.toString());let p;return n.relatedInformation&&(p=n.relatedInformation.map((i,I)=>new E(this.id(k,i.resource.toString(),i.startLineNumber,i.startColumn,i.endLineNumber,i.endColumn,I),n,i))),new g(k,n,p)});this._total-=t.total,t.set(s,y),this._total+=t.total}else t&&(this._total-=t.total,t.delete(s),this._total+=t.total,t.total===0?(this.resourcesByUri.delete(d),e.removed.add(t)):e.updated.add(t))}this.cachedSortedResources=void 0,(e.added.size||e.removed.size||e.updated.size)&&this._onDidChange.fire(e)}id(...r){const e=new v;for(const s of r)e.hash(s);return`${e.value}`}dispose(){this._onDidChange.dispose(),this.resourcesByUri.clear()}}export{g as Marker,V as MarkerTableItem,W as MarkersModel,E as RelatedInformation,m as ResourceMarkers,Q as compareMarkersByUri};
