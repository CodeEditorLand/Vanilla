import"../list/list.js";import"./indexTreeModel.js";import{ObjectTreeModel as M}from"./objectTreeModel.js";import{TreeError as I,WeakMapper as y}from"./tree.js";import{equals as F}from"../../../common/arrays.js";import{Event as m}from"../../../common/event.js";import{Iterable as l}from"../../../common/iterator.js";function T(o){const e=[o.element],t=o.incompressible||!1;return{element:{elements:e,incompressible:t},children:l.map(l.from(o.children),T),collapsible:o.collapsible,collapsed:o.collapsed}}function u(o){const e=[o.element],t=o.incompressible||!1;let r,n;for(;[n,r]=l.consume(l.from(o.children),2),!(n.length!==1||n[0].incompressible);)o=n[0],e.push(o.element);return{element:{elements:e,incompressible:t},children:l.map(l.concat(n,r),u),collapsible:o.collapsible,collapsed:o.collapsed}}function h(o,e=0){let t;return e<o.element.elements.length-1?t=[h(o,e+1)]:t=l.map(l.from(o.children),r=>h(r,0)),e===0&&o.element.incompressible?{element:o.element.elements[e],children:t,incompressible:!0,collapsible:o.collapsible,collapsed:o.collapsed}:{element:o.element.elements[e],children:t,collapsible:o.collapsible,collapsed:o.collapsed}}function b(o){return h(o,0)}function N(o,e,t){return o.element===e?{...o,children:t}:{...o,children:l.map(l.from(o.children),r=>N(r,e,t))}}const O=o=>({getId(e){return e.elements.map(t=>o.getId(t).toString()).join("\0")}});class S{constructor(e,t={}){this.user=e;this.model=new M(e,t),this.enabled=typeof t.compressionEnabled>"u"?!0:t.compressionEnabled,this.identityProvider=t.identityProvider}rootRef=null;get onDidSpliceRenderedNodes(){return this.model.onDidSpliceRenderedNodes}get onDidSpliceModel(){return this.model.onDidSpliceModel}get onDidChangeCollapseState(){return this.model.onDidChangeCollapseState}get onDidChangeRenderNodeCount(){return this.model.onDidChangeRenderNodeCount}model;nodes=new Map;enabled;identityProvider;get size(){return this.nodes.size}setChildren(e,t=l.empty(),r){const n=r.diffIdentityProvider&&O(r.diffIdentityProvider);if(e===null){const p=l.map(t,this.enabled?u:T);this._setChildren(null,p,{diffIdentityProvider:n,diffDepth:1/0});return}const d=this.nodes.get(e);if(!d)throw new I(this.user,"Unknown compressed tree node");const i=this.model.getNode(d),a=this.model.getParentNodeLocation(d),s=this.model.getNode(a),f=b(i),g=N(f,e,t),c=(this.enabled?u:T)(g),D=r.diffIdentityProvider?(p,E)=>r.diffIdentityProvider.getId(p)===r.diffIdentityProvider.getId(E):void 0;if(F(c.element.elements,i.element.elements,D)){this._setChildren(d,c.children||l.empty(),{diffIdentityProvider:n,diffDepth:1});return}const v=s.children.map(p=>p===i?c:p);this._setChildren(s.element,v,{diffIdentityProvider:n,diffDepth:i.depth-s.depth})}isCompressionEnabled(){return this.enabled}setCompressionEnabled(e){if(e===this.enabled)return;this.enabled=e;const r=this.model.getNode().children,n=l.map(r,b),d=l.map(n,e?u:T);this._setChildren(null,d,{diffIdentityProvider:this.identityProvider,diffDepth:1/0})}_setChildren(e,t,r){const n=new Set,d=a=>{for(const s of a.element.elements)n.add(s),this.nodes.set(s,a.element)},i=a=>{for(const s of a.element.elements)n.has(s)||this.nodes.delete(s)};this.model.setChildren(e,t,{...r,onDidCreateNode:d,onDidDeleteNode:i})}has(e){return this.nodes.has(e)}getListIndex(e){const t=this.getCompressedNode(e);return this.model.getListIndex(t)}getListRenderCount(e){const t=this.getCompressedNode(e);return this.model.getListRenderCount(t)}getNode(e){if(typeof e>"u")return this.model.getNode();const t=this.getCompressedNode(e);return this.model.getNode(t)}getNodeLocation(e){const t=this.model.getNodeLocation(e);return t===null?null:t.elements[t.elements.length-1]}getParentNodeLocation(e){const t=this.getCompressedNode(e),r=this.model.getParentNodeLocation(t);return r===null?null:r.elements[r.elements.length-1]}getFirstElementChild(e){const t=this.getCompressedNode(e);return this.model.getFirstElementChild(t)}getLastElementAncestor(e){const t=typeof e>"u"?void 0:this.getCompressedNode(e);return this.model.getLastElementAncestor(t)}isCollapsible(e){const t=this.getCompressedNode(e);return this.model.isCollapsible(t)}setCollapsible(e,t){const r=this.getCompressedNode(e);return this.model.setCollapsible(r,t)}isCollapsed(e){const t=this.getCompressedNode(e);return this.model.isCollapsed(t)}setCollapsed(e,t,r){const n=this.getCompressedNode(e);return this.model.setCollapsed(n,t,r)}expandTo(e){const t=this.getCompressedNode(e);this.model.expandTo(t)}rerender(e){const t=this.getCompressedNode(e);this.model.rerender(t)}refilter(){this.model.refilter()}resort(e=null,t=!0){const r=this.getCompressedNode(e);this.model.resort(r,t)}getCompressedNode(e){if(e===null)return null;const t=this.nodes.get(e);if(!t)throw new I(this.user,`Tree element not found: ${e}`);return t}}const x=o=>o[o.length-1];class C{constructor(e,t){this.unwrapper=e;this.node=t}get element(){return this.node.element===null?null:this.unwrapper(this.node.element)}get children(){return this.node.children.map(e=>new C(this.unwrapper,e))}get depth(){return this.node.depth}get visibleChildrenCount(){return this.node.visibleChildrenCount}get visibleChildIndex(){return this.node.visibleChildIndex}get collapsible(){return this.node.collapsible}get collapsed(){return this.node.collapsed}get visible(){return this.node.visible}get filterData(){return this.node.filterData}}function P(o,e){return{...e,identityProvider:e.identityProvider&&{getId(t){return e.identityProvider.getId(o(t))}},sorter:e.sorter&&{compare(t,r){return e.sorter.compare(t.elements[0],r.elements[0])}},filter:e.filter&&{filter(t,r){return e.filter.filter(o(t),r)}}}}class Y{rootRef=null;get onDidSpliceModel(){return m.map(this.model.onDidSpliceModel,({insertedNodes:e,deletedNodes:t})=>({insertedNodes:e.map(r=>this.nodeMapper.map(r)),deletedNodes:t.map(r=>this.nodeMapper.map(r))}))}get onDidSpliceRenderedNodes(){return m.map(this.model.onDidSpliceRenderedNodes,({start:e,deleteCount:t,elements:r})=>({start:e,deleteCount:t,elements:r.map(n=>this.nodeMapper.map(n))}))}get onDidChangeCollapseState(){return m.map(this.model.onDidChangeCollapseState,({node:e,deep:t})=>({node:this.nodeMapper.map(e),deep:t}))}get onDidChangeRenderNodeCount(){return m.map(this.model.onDidChangeRenderNodeCount,e=>this.nodeMapper.map(e))}elementMapper;nodeMapper;model;constructor(e,t={}){this.elementMapper=t.elementMapper||x;const r=n=>this.elementMapper(n.elements);this.nodeMapper=new y(n=>new C(r,n)),this.model=new S(e,P(r,t))}setChildren(e,t=l.empty(),r={}){this.model.setChildren(e,t,r)}isCompressionEnabled(){return this.model.isCompressionEnabled()}setCompressionEnabled(e){this.model.setCompressionEnabled(e)}has(e){return this.model.has(e)}getListIndex(e){return this.model.getListIndex(e)}getListRenderCount(e){return this.model.getListRenderCount(e)}getNode(e){return this.nodeMapper.map(this.model.getNode(e))}getNodeLocation(e){return e.element}getParentNodeLocation(e){return this.model.getParentNodeLocation(e)}getFirstElementChild(e){const t=this.model.getFirstElementChild(e);return t===null||typeof t>"u"?t:this.elementMapper(t.elements)}getLastElementAncestor(e){const t=this.model.getLastElementAncestor(e);return t===null||typeof t>"u"?t:this.elementMapper(t.elements)}isCollapsible(e){return this.model.isCollapsible(e)}setCollapsible(e,t){return this.model.setCollapsible(e,t)}isCollapsed(e){return this.model.isCollapsed(e)}setCollapsed(e,t,r){return this.model.setCollapsed(e,t,r)}expandTo(e){return this.model.expandTo(e)}rerender(e){return this.model.rerender(e)}refilter(){return this.model.refilter()}resort(e=null,t=!0){return this.model.resort(e,t)}getCompressedTreeNode(e=null){return this.model.getNode(e)}}export{S as CompressedObjectTreeModel,Y as CompressibleObjectTreeModel,x as DefaultElementMapper,u as compress,b as decompress};
