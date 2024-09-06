var P=Object.defineProperty;var W=Object.getOwnPropertyDescriptor;var f=(M,t,r,e)=>{for(var a=e>1?void 0:e?W(t,r):t,i=M.length-1,o;i>=0;i--)(o=M[i])&&(a=(e?o(t,r,a):o(a))||a);return e&&a&&P(t,r,a),a},p=(M,t)=>(r,e)=>t(r,e,M);import*as l from"../../../../base/browser/dom.js";import{DomEmitter as D}from"../../../../base/browser/event.js";import{ActionBar as V}from"../../../../base/browser/ui/actionbar/actionbar.js";import{HighlightedLabel as k}from"../../../../base/browser/ui/highlightedlabel/highlightedLabel.js";import"../../../../base/browser/ui/table/table.js";import"../../../../base/common/actions.js";import{Event as T}from"../../../../base/common/event.js";import{Disposable as R,DisposableStore as N}from"../../../../base/common/lifecycle.js";import B from"../../../../base/common/severity.js";import{isUndefinedOrNull as $}from"../../../../base/common/types.js";import{Range as Q}from"../../../../editor/common/core/range.js";import{localize as S}from"../../../../nls.js";import"../../../../platform/contextkey/common/contextkey.js";import{IHoverService as U}from"../../../../platform/hover/browser/hover.js";import{IInstantiationService as O}from"../../../../platform/instantiation/common/instantiation.js";import{ILabelService as A}from"../../../../platform/label/common/label.js";import{WorkbenchTable as q}from"../../../../platform/list/browser/listService.js";import{MarkerSeverity as I}from"../../../../platform/markers/common/markers.js";import{unsupportedSchemas as j}from"../../../../platform/markers/common/markerService.js";import{Link as K}from"../../../../platform/opener/browser/link.js";import{IOpenerService as G}from"../../../../platform/opener/common/opener.js";import{SeverityIcon as z}from"../../../../platform/severityIcon/browser/severityIcon.js";import{FilterOptions as v}from"./markersFilterOptions.js";import{compareMarkersByUri as Y,Marker as J,MarkerTableItem as F}from"./markersModel.js";import"./markersTreeViewer.js";import"./markersView.js";import{QuickFixAction as X,QuickFixActionViewItem as Z}from"./markersViewActions.js";import ee from"./messages.js";const m=l.$;let d=class{constructor(t,r){this.markersViewModel=t;this.instantiationService=r}static TEMPLATE_ID="severity";templateId=d.TEMPLATE_ID;renderTemplate(t){const r=l.append(t,m(".severity")),e=l.append(r,m("")),a=l.append(t,m(".actions"));return{actionBar:new V(a,{actionViewItemProvider:(o,s)=>o.id===X.ID?this.instantiationService.createInstance(Z,o,s):void 0}),icon:e}}renderElement(t,r,e,a){const i=s=>{$(s)||l.findParentWithClass(e.icon,"monaco-table-td").classList.toggle("quickFix",s)};e.icon.title=I.toString(t.marker.severity),e.icon.className=`marker-icon ${B.toString(I.toSeverity(t.marker.severity))} codicon ${z.className(I.toSeverity(t.marker.severity))}`,e.actionBar.clear();const o=this.markersViewModel.getViewModel(t);if(o){const s=o.quickFixAction;e.actionBar.push([s],{icon:!0,label:!1}),i(o.quickFixAction.enabled),s.onDidChange(({enabled:c})=>i(c)),s.onShowQuickFixes(()=>{const c=e.actionBar.viewItems[0];c&&c.showQuickFixes()})}}disposeTemplate(t){}};d=f([p(1,O)],d);let h=class{constructor(t,r){this.hoverService=t;this.openerService=r}static TEMPLATE_ID="code";templateId=h.TEMPLATE_ID;renderTemplate(t){const r=new N,e=l.append(t,m(".code")),a=r.add(new k(e));a.element.classList.add("source-label");const i=r.add(new k(e));i.element.classList.add("code-label");const o=r.add(new K(e,{href:"",label:""},{},this.hoverService,this.openerService));return{codeColumn:e,sourceLabel:a,codeLabel:i,codeLink:o,templateDisposable:r}}renderElement(t,r,e,a){if(e.codeColumn.classList.remove("code-label"),e.codeColumn.classList.remove("code-link"),t.marker.source&&t.marker.code)if(typeof t.marker.code=="string")e.codeColumn.classList.add("code-label"),e.codeColumn.title=`${t.marker.source} (${t.marker.code})`,e.sourceLabel.set(t.marker.source,t.sourceMatches),e.codeLabel.set(t.marker.code,t.codeMatches);else{e.codeColumn.classList.add("code-link"),e.codeColumn.title=`${t.marker.source} (${t.marker.code.value})`,e.sourceLabel.set(t.marker.source,t.sourceMatches);const i=e.templateDisposable.add(new k(m(".code-link-label")));i.set(t.marker.code.value,t.codeMatches),e.codeLink.link={href:t.marker.code.target.toString(!0),title:t.marker.code.target.toString(!0),label:i.element}}else e.codeColumn.title="",e.sourceLabel.set("-")}disposeTemplate(t){t.templateDisposable.dispose()}};h=f([p(0,U),p(1,G)],h);class x{static TEMPLATE_ID="message";templateId=x.TEMPLATE_ID;renderTemplate(t){const r=l.append(t,m(".message")),e=new k(r);return{columnElement:r,highlightedLabel:e}}renderElement(t,r,e,a){e.columnElement.title=t.marker.message,e.highlightedLabel.set(t.marker.message,t.messageMatches)}disposeTemplate(t){t.highlightedLabel.dispose()}}let u=class{constructor(t){this.labelService=t}static TEMPLATE_ID="file";templateId=u.TEMPLATE_ID;renderTemplate(t){const r=l.append(t,m(".file")),e=new k(r);e.element.classList.add("file-label");const a=new k(r);return a.element.classList.add("file-position"),{columnElement:r,fileLabel:e,positionLabel:a}}renderElement(t,r,e,a){const i=ee.MARKERS_PANEL_AT_LINE_COL_NUMBER(t.marker.startLineNumber,t.marker.startColumn);e.columnElement.title=`${this.labelService.getUriLabel(t.marker.resource,{relative:!1})} ${i}`,e.fileLabel.set(this.labelService.getUriLabel(t.marker.resource,{relative:!0}),t.fileMatches),e.positionLabel.set(i,void 0)}disposeTemplate(t){t.fileLabel.dispose(),t.positionLabel.dispose()}};u=f([p(0,A)],u);class H{static TEMPLATE_ID="owner";templateId=H.TEMPLATE_ID;renderTemplate(t){const r=l.append(t,m(".owner")),e=new k(r);return{columnElement:r,highlightedLabel:e}}renderElement(t,r,e,a){e.columnElement.title=t.marker.owner,e.highlightedLabel.set(t.marker.owner,t.ownerMatches)}disposeTemplate(t){t.highlightedLabel.dispose()}}class C{static HEADER_ROW_HEIGHT=24;static ROW_HEIGHT=24;headerRowHeight=C.HEADER_ROW_HEIGHT;getHeight(t){return C.ROW_HEIGHT}}let w=class extends R{constructor(r,e,a,i,o,s,c){super();this.container=r;this.markersViewModel=e;this.resourceMarkers=a;this.filterOptions=i;this.instantiationService=s;this.labelService=c;this.table=this.instantiationService.createInstance(q,"Markers",this.container,new C,[{label:"",tooltip:"",weight:0,minimumWidth:36,maximumWidth:36,templateId:d.TEMPLATE_ID,project(n){return n}},{label:S("codeColumnLabel","Code"),tooltip:"",weight:1,minimumWidth:100,maximumWidth:300,templateId:h.TEMPLATE_ID,project(n){return n}},{label:S("messageColumnLabel","Message"),tooltip:"",weight:4,templateId:x.TEMPLATE_ID,project(n){return n}},{label:S("fileColumnLabel","File"),tooltip:"",weight:2,templateId:u.TEMPLATE_ID,project(n){return n}},{label:S("sourceColumnLabel","Source"),tooltip:"",weight:1,minimumWidth:100,maximumWidth:300,templateId:H.TEMPLATE_ID,project(n){return n}}],[this.instantiationService.createInstance(d,this.markersViewModel),this.instantiationService.createInstance(h),this.instantiationService.createInstance(x),this.instantiationService.createInstance(u),this.instantiationService.createInstance(H)],o);const g=this.table.domNode.querySelector(".monaco-list-rows"),L=T.chain(this._register(new D(g,"mouseover")).event,n=>n.map(b=>l.findParentWithClass(b.target,"monaco-list-row","monaco-list-rows")).filter(b=>!!b).map(b=>parseInt(b.getAttribute("data-index")))),E=T.map(this._register(new D(g,"mouseleave")).event,()=>-1),y=T.latch(T.any(L,E)),_=T.debounce(y,(n,b)=>b,500);this._register(_(n=>{n!==-1&&this.table.row(n)&&this.markersViewModel.onMarkerMouseHover(this.table.row(n))}))}_itemCount=0;table;get contextKeyService(){return this.table.contextKeyService}get onContextMenu(){return this.table.onContextMenu}get onDidOpen(){return this.table.onDidOpen}get onDidChangeFocus(){return this.table.onDidChangeFocus}get onDidChangeSelection(){return this.table.onDidChangeSelection}collapseMarkers(){}domFocus(){this.table.domFocus()}filterMarkers(r,e){this.filterOptions=e,this.reset(r)}getFocus(){const r=this.table.getFocus();return r.length>0?[...r.map(e=>this.table.row(e))]:[]}getHTMLElement(){return this.table.getHTMLElement()}getRelativeTop(r){return r?this.table.getRelativeTop(this.table.indexOf(r)):null}getSelection(){const r=this.table.getSelection();return r.length>0?[...r.map(e=>this.table.row(e))]:[]}getVisibleItemCount(){return this._itemCount}isVisible(){return!this.container.classList.contains("hidden")}layout(r,e){this.container.style.height=`${r}px`,this.table.layout(r,e)}reset(r){this.resourceMarkers=r;const e=[];for(const a of this.resourceMarkers)for(const i of a.markers){if(j.has(i.resource.scheme)||this.filterOptions.excludesMatcher.matches(i.resource))continue;if(this.filterOptions.includesMatcher.matches(i.resource)){e.push(new F(i));continue}if(this.filterOptions.showErrors&&I.Error===i.marker.severity||this.filterOptions.showWarnings&&I.Warning===i.marker.severity||this.filterOptions.showInfos&&I.Info===i.marker.severity){if(this.filterOptions.textFilter.text){const s=i.marker.source?v._filter(this.filterOptions.textFilter.text,i.marker.source)??void 0:void 0,c=i.marker.code?v._filter(this.filterOptions.textFilter.text,typeof i.marker.code=="string"?i.marker.code:i.marker.code.value)??void 0:void 0,g=v._messageFilter(this.filterOptions.textFilter.text,i.marker.message)??void 0,L=v._messageFilter(this.filterOptions.textFilter.text,this.labelService.getUriLabel(i.resource,{relative:!0}))??void 0,E=v._messageFilter(this.filterOptions.textFilter.text,i.marker.owner)??void 0,y=s||c||g||L||E;(y&&!this.filterOptions.textFilter.negate||!y&&this.filterOptions.textFilter.negate)&&e.push(new F(i,s,c,g,L,E));continue}e.push(new F(i))}}this._itemCount=e.length,this.table.splice(0,Number.POSITIVE_INFINITY,e.sort((a,i)=>{let o=I.compare(a.marker.severity,i.marker.severity);return o===0&&(o=Y(a.marker,i.marker)),o===0&&(o=Q.compareRangesUsingStarts(a.marker,i.marker)),o}))}revealMarkers(r,e,a){if(r){const i=this.resourceMarkers.indexOf(r);if(i!==-1)if(this.hasSelectedMarkerFor(r)){const o=this.table.getSelection();this.table.reveal(o[0],a),e&&this.table.setFocus(o)}else this.table.reveal(i,0),e&&(this.table.setFocus([i]),this.table.setSelection([i]))}else e&&(this.table.setSelection([]),this.table.focusFirst())}setAriaLabel(r){this.table.domNode.ariaLabel=r}setMarkerSelection(r,e){this.isVisible()&&(r&&r.length>0?(this.table.setSelection(r.map(a=>this.findMarkerIndex(a))),e&&e.length>0?this.table.setFocus(e.map(a=>this.findMarkerIndex(a))):this.table.setFocus([this.findMarkerIndex(r[0])]),this.table.reveal(this.findMarkerIndex(r[0]))):this.getSelection().length===0&&this.getVisibleItemCount()>0&&(this.table.setSelection([0]),this.table.setFocus([0]),this.table.reveal(0)))}toggleVisibility(r){this.container.classList.toggle("hidden",r)}update(r){for(const e of r){const a=this.resourceMarkers.indexOf(e);this.resourceMarkers.splice(a,1,e)}this.reset(this.resourceMarkers)}updateMarker(r){this.table.rerender()}findMarkerIndex(r){for(let e=0;e<this.table.length;e++)if(this.table.row(e).marker===r.marker)return e;return-1}hasSelectedMarkerFor(r){const e=this.getSelection();return!!(e&&e.length>0&&e[0]instanceof J&&r.has(e[0].marker.resource))}};w=f([p(5,O),p(6,A)],w);export{w as MarkersTable};
