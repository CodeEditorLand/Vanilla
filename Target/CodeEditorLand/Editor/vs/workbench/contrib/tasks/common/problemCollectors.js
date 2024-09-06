import"../../../../base/common/collections.js";import{Emitter as h,Event as g}from"../../../../base/common/event.js";import{Disposable as M,DisposableStore as f}from"../../../../base/common/lifecycle.js";import{isWindows as v}from"../../../../base/common/platform.js";import{URI as m}from"../../../../base/common/uri.js";import{generateUuid as k}from"../../../../base/common/uuid.js";import"../../../../editor/common/services/model.js";import"../../../../platform/files/common/files.js";import{IMarkerData as b}from"../../../../platform/markers/common/markers.js";import{ApplyToKind as c,createLineMatcher as y,getResource as w}from"./problemMatcher.js";var I=(e=>(e.BackgroundProcessingBegins="backgroundProcessingBegins",e.BackgroundProcessingEnds="backgroundProcessingEnds",e))(I||{}),l;(o=>{function d(e){return Object.freeze({kind:e})}o.create=d})(l||={});class u extends M{constructor(e,r,i,s){super();this.problemMatchers=e;this.markerService=r;this.modelService=i;this.matchers=Object.create(null),this.bufferLength=1,e.map(t=>y(t,s)).forEach(t=>{const n=t.matchLength;n>this.bufferLength&&(this.bufferLength=n);let a=this.matchers[n];a||(a=[],this.matchers[n]=a),a.push(t)}),this.buffer=[],this.activeMatcher=null,this._numberOfMatches=0,this._maxMarkerSeverity=void 0,this.openModels=Object.create(null),this.applyToByOwner=new Map;for(const t of e){const n=this.applyToByOwner.get(t.owner);n===void 0?this.applyToByOwner.set(t.owner,t.applyTo):this.applyToByOwner.set(t.owner,this.mergeApplyTo(n,t.applyTo))}this.resourcesToClean=new Map,this.markers=new Map,this.deliveredMarkers=new Map,this._register(this.modelService.onModelAdded(t=>{this.openModels[t.uri.toString()]=!0},this,this.modelListeners)),this._register(this.modelService.onModelRemoved(t=>{delete this.openModels[t.uri.toString()]},this,this.modelListeners)),this.modelService.getModels().forEach(t=>this.openModels[t.uri.toString()]=!0),this._onDidStateChange=new h}matchers;activeMatcher;_numberOfMatches;_maxMarkerSeverity;buffer;bufferLength;openModels;modelListeners=new f;tail;applyToByOwner;resourcesToClean;markers;deliveredMarkers;_onDidStateChange;_onDidFindFirstMatch=new h;onDidFindFirstMatch=this._onDidFindFirstMatch.event;_onDidFindErrors=new h;onDidFindErrors=this._onDidFindErrors.event;_onDidRequestInvalidateLastMarker=new h;onDidRequestInvalidateLastMarker=this._onDidRequestInvalidateLastMarker.event;get onDidStateChange(){return this._onDidStateChange.event}processLine(e){if(this.tail){const r=this.tail;this.tail=r.then(()=>this.processLineInternal(e))}else this.tail=this.processLineInternal(e)}dispose(){super.dispose(),this.modelListeners.dispose()}get numberOfMatches(){return this._numberOfMatches}get maxMarkerSeverity(){return this._maxMarkerSeverity}tryFindMarker(e){let r=null;if(this.activeMatcher){if(r=this.activeMatcher.next(e),r)return this.captureMatch(r),r;this.clearBuffer(),this.activeMatcher=null}if(this.buffer.length<this.bufferLength)this.buffer.push(e);else{const i=this.buffer.length-1;for(let s=0;s<i;s++)this.buffer[s]=this.buffer[s+1];this.buffer[i]=e}return r=this.tryMatchers(),r&&this.clearBuffer(),r}async shouldApplyMatch(e){switch(e.description.applyTo){case c.allDocuments:return!0;case c.openDocuments:return!!this.openModels[(await e.resource).toString()];case c.closedDocuments:return!this.openModels[(await e.resource).toString()];default:return!0}}mergeApplyTo(e,r){return e===r||e===c.allDocuments?e:c.allDocuments}tryMatchers(){this.activeMatcher=null;const e=this.buffer.length;for(let r=0;r<e;r++){const i=this.matchers[e-r];if(i)for(const s of i){const t=s.handle(this.buffer,r);if(t.match)return this.captureMatch(t.match),t.continue&&(this.activeMatcher=s),t.match}}return null}captureMatch(e){this._numberOfMatches++,(this._maxMarkerSeverity===void 0||e.marker.severity>this._maxMarkerSeverity)&&(this._maxMarkerSeverity=e.marker.severity)}clearBuffer(){this.buffer.length>0&&(this.buffer=[])}recordResourcesToClean(e){const r=this.getResourceSetToClean(e);this.markerService.read({owner:e}).forEach(i=>r.set(i.resource.toString(),i.resource))}recordResourceToClean(e,r){this.getResourceSetToClean(e).set(r.toString(),r)}removeResourceToClean(e,r){this.resourcesToClean.get(e)?.delete(r)}getResourceSetToClean(e){let r=this.resourcesToClean.get(e);return r||(r=new Map,this.resourcesToClean.set(e,r)),r}cleanAllMarkers(){this.resourcesToClean.forEach((e,r)=>{this._cleanMarkers(r,e)}),this.resourcesToClean=new Map}cleanMarkers(e){const r=this.resourcesToClean.get(e);r&&(this._cleanMarkers(e,r),this.resourcesToClean.delete(e))}_cleanMarkers(e,r){const i=[],s=this.applyToByOwner.get(e);r.forEach((t,n)=>{(s===c.allDocuments||s===c.openDocuments&&this.openModels[n]||s===c.closedDocuments&&!this.openModels[n])&&i.push(t)}),this.markerService.remove(e,i)}recordMarker(e,r,i){let s=this.markers.get(r);s||(s=new Map,this.markers.set(r,s));let t=s.get(i);t||(t=new Map,s.set(i,t));const n=b.makeKeyOptionalMessage(e,!1);let a;t.has(n)?(a=t.get(n))!==void 0&&a.message.length<e.message.length&&v&&t.set(n,e):t.set(n,e)}reportMarkers(){this.markers.forEach((e,r)=>{const i=this.getDeliveredMarkersPerOwner(r);e.forEach((s,t)=>{this.deliverMarkersPerOwnerAndResourceResolved(r,t,s,i)})})}deliverMarkersPerOwnerAndResource(e,r){const i=this.markers.get(e);if(!i)return;const s=this.getDeliveredMarkersPerOwner(e),t=i.get(r);t&&this.deliverMarkersPerOwnerAndResourceResolved(e,r,t,s)}deliverMarkersPerOwnerAndResourceResolved(e,r,i,s){if(i.size!==s.get(r)){const t=[];i.forEach(n=>t.push(n)),this.markerService.changeOne(e,m.parse(r),t),s.set(r,i.size)}}getDeliveredMarkersPerOwner(e){let r=this.deliveredMarkers.get(e);return r||(r=new Map,this.deliveredMarkers.set(e,r)),r}cleanMarkerCaches(){this._numberOfMatches=0,this._maxMarkerSeverity=void 0,this.markers.clear(),this.deliveredMarkers.clear()}done(){this.reportMarkers(),this.cleanAllMarkers()}}var P=(o=>(o[o.Clean=0]="Clean",o))(P||{});class H extends u{owners;currentOwner;currentResource;constructor(o,e,r,i=0,s){super(o,e,r,s);const t=Object.create(null);o.forEach(n=>t[n.owner]=!0),this.owners=Object.keys(t),this.owners.forEach(n=>{this.recordResourcesToClean(n)})}async processLineInternal(o){const e=this.tryFindMarker(o);if(!e)return;const r=e.description.owner,s=(await e.resource).toString();this.removeResourceToClean(r,s),await this.shouldApplyMatch(e)&&(this.recordMarker(e.marker,r,s),(this.currentOwner!==r||this.currentResource!==s)&&(this.currentOwner&&this.currentResource&&this.deliverMarkersPerOwnerAndResource(this.currentOwner,this.currentResource),this.currentOwner=r,this.currentResource=s))}}class J extends u{backgroundPatterns;_activeBackgroundMatchers;currentOwner;currentResource;lines=[];beginPatterns=[];constructor(o,e,r,i){super(o,e,r,i),this.resetCurrentResource(),this.backgroundPatterns=[],this._activeBackgroundMatchers=new Set,this.problemMatchers.forEach(s=>{if(s.watching){const t=k();this.backgroundPatterns.push({key:t,matcher:s,begin:s.watching.beginsPattern,end:s.watching.endsPattern}),this.beginPatterns.push(s.watching.beginsPattern.regexp)}}),this.modelListeners.add(this.modelService.onModelRemoved(s=>{let t=g.debounce(this.markerService.onMarkerChanged,(n,a)=>(n??[]).concat(a),500,!1,!0)(async n=>{if(t?.dispose(),t=void 0,!n||!n.includes(s.uri)||this.markerService.read({resource:s.uri}).length!==0)return;const a=Array.from(this.lines);for(const p of a)await this.processLineInternal(p)});setTimeout(async()=>{const n=t;t=void 0,n?.dispose()},600)}))}aboutToStart(){for(const o of this.backgroundPatterns)o.matcher.watching&&o.matcher.watching.activeOnStart&&(this._activeBackgroundMatchers.add(o.key),this._onDidStateChange.fire(l.create("backgroundProcessingBegins")),this.recordResourcesToClean(o.matcher.owner))}async processLineInternal(o){if(await this.tryBegin(o)||this.tryFinish(o))return;this.lines.push(o);const e=this.tryFindMarker(o);if(!e)return;const r=await e.resource,i=e.description.owner,s=r.toString();this.removeResourceToClean(i,s),await this.shouldApplyMatch(e)&&(this.recordMarker(e.marker,i,s),(this.currentOwner!==i||this.currentResource!==s)&&(this.reportMarkersForCurrentResource(),this.currentOwner=i,this.currentResource=s))}forceDelivery(){this.reportMarkersForCurrentResource()}async tryBegin(o){let e=!1;for(const r of this.backgroundPatterns){const i=r.begin.regexp.exec(o);if(i){if(this._activeBackgroundMatchers.has(r.key))continue;this._activeBackgroundMatchers.add(r.key),e=!0,this._onDidFindFirstMatch.fire(),this.lines=[],this.lines.push(o),this._onDidStateChange.fire(l.create("backgroundProcessingBegins")),this.cleanMarkerCaches(),this.resetCurrentResource();const s=r.matcher.owner,t=i[r.begin.file];if(t){const n=w(t,r.matcher);this.recordResourceToClean(s,await n)}else this.recordResourcesToClean(s)}}return e}tryFinish(o){let e=!1;for(const r of this.backgroundPatterns)if(r.end.regexp.exec(o)&&(this._numberOfMatches>0?this._onDidFindErrors.fire():this._onDidRequestInvalidateLastMarker.fire(),this._activeBackgroundMatchers.has(r.key))){this._activeBackgroundMatchers.delete(r.key),this.resetCurrentResource(),this._onDidStateChange.fire(l.create("backgroundProcessingEnds")),e=!0,this.lines.push(o);const s=r.matcher.owner;this.cleanMarkers(s),this.cleanMarkerCaches()}return e}resetCurrentResource(){this.reportMarkersForCurrentResource(),this.currentOwner=void 0,this.currentResource=void 0}reportMarkersForCurrentResource(){this.currentOwner&&this.currentResource&&this.deliverMarkersPerOwnerAndResource(this.currentOwner,this.currentResource)}done(){[...this.applyToByOwner.keys()].forEach(o=>{this.recordResourcesToClean(o)}),super.done()}isWatching(){return this.backgroundPatterns.length>0}}export{u as AbstractProblemCollector,I as ProblemCollectorEventKind,P as ProblemHandlingStrategy,H as StartStopProblemCollector,J as WatchingProblemCollector};
