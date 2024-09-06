import{IconLabel as p}from"../../../../base/browser/ui/iconLabel/iconLabel.js";import"../../../../base/browser/ui/list/list.js";import"../../../../base/browser/ui/list/listWidget.js";import"../../../../base/browser/ui/tree/tree.js";import{CancellationToken as c}from"../../../../base/common/cancellation.js";import{createMatches as u}from"../../../../base/common/filters.js";import{compare as g}from"../../../../base/common/strings.js";import{ThemeIcon as C}from"../../../../base/common/themables.js";import{Range as y}from"../../../../editor/common/core/range.js";import{SymbolKinds as f,SymbolTag as h}from"../../../../editor/common/languages.js";import{localize as n}from"../../../../nls.js";import{CallHierarchyDirection as m,CallHierarchyModel as I}from"../common/callHierarchy.js";class o{constructor(e,r,t,i){this.item=e;this.locations=r;this.model=t;this.parent=i}static compare(e,r){let t=g(e.item.uri.toString(),r.item.uri.toString());return t===0&&(t=y.compareRangesUsingStarts(e.item.range,r.item.range)),t}}class U{constructor(e){this.getDirection=e}hasChildren(){return!0}async getChildren(e){if(e instanceof I)return e.roots.map(i=>new o(i,void 0,e,void 0));const{model:r,item:t}=e;return this.getDirection()===m.CallsFrom?(await r.resolveOutgoingCalls(t,c.None)).map(i=>new o(i.to,i.fromRanges.map(a=>({range:a,uri:t.uri})),r,e)):(await r.resolveIncomingCalls(t,c.None)).map(i=>new o(i.from,i.fromRanges.map(a=>({range:a,uri:i.from.uri})),r,e))}}class W{compare(e,r){return o.compare(e,r)}}class j{constructor(e){this.getDirection=e}getId(e){let r=this.getDirection()+JSON.stringify(e.item.uri)+JSON.stringify(e.item.range);return e.parent&&(r+=this.getId(e.parent)),r}}class b{constructor(e,r){this.icon=e;this.label=r}}class s{static id="CallRenderer";templateId=s.id;renderTemplate(e){e.classList.add("callhierarchy-element");const r=document.createElement("div");e.appendChild(r);const t=new p(e,{supportHighlights:!0});return new b(r,t)}renderElement(e,r,t){const{element:i,filterData:a}=e,d=i.item.tags?.includes(h.Deprecated);t.icon.className="",t.icon.classList.add("inline",...C.asClassNameArray(f.toIcon(i.item.kind))),t.label.setLabel(i.item.name,i.item.detail,{labelEscapeNewLines:!0,matches:u(a),strikethrough:d})}disposeTemplate(e){e.label.dispose()}}class q{getHeight(e){return 22}getTemplateId(e){return s.id}}class B{constructor(e){this.getDirection=e}getWidgetAriaLabel(){return n("tree.aria","Call Hierarchy")}getAriaLabel(e){return this.getDirection()===m.CallsFrom?n("from","calls from {0}",e.item.name):n("to","callers of {0}",e.item.name)}}export{B as AccessibilityProvider,o as Call,s as CallRenderer,U as DataSource,j as IdentityProvider,W as Sorter,q as VirtualDelegate};
