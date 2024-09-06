import{Orientation as c}from"../../../../../vs/base/browser/ui/sash/sash.js";import{equals as z,tail2 as l}from"../../../../../vs/base/common/arrays.js";import"../../../../../vs/base/common/event.js";import{Disposable as O}from"../../../../../vs/base/common/lifecycle.js";import"vs/css!./gridview";import{GridView as f,Sizing as w,orthogonal as b}from"./gridview.js";import{LayoutPriority as ie,Orientation as te,orthogonal as re}from"./gridview.js";var E=(n=>(n[n.Up=0]="Up",n[n.Down=1]="Down",n[n.Left=2]="Left",n[n.Right=3]="Right",n))(E||{});function B(t){switch(t){case 0:return 1;case 1:return 0;case 2:return 3;case 3:return 2}}function p(t){return!!t.children}function S(t,e){if(e.length===0)return t;if(!p(t))throw new Error("Invalid location");const[i,...r]=e;return S(t.children[i],r)}function R(t,e){return!(t.start>=e.end||e.start>=t.end)}function x(t,e){const i=v(e),r=e===0?t.top:e===3?t.left+t.width:e===1?t.top+t.height:t.left,n={start:i===c.HORIZONTAL?t.top:t.left,end:i===c.HORIZONTAL?t.top+t.height:t.left+t.width};return{offset:r,range:n}}function C(t,e,i){const r=[];function n(o,s,a){if(p(o))for(const d of o.children)n(d,s,a);else{const{offset:d,range:h}=x(o.box,s);d===a.offset&&R(h,a.range)&&r.push(o)}}return n(t,e,i),r}function V(t,e){return e.length%2===0?b(t):t}function v(t){return t===0||t===1?c.VERTICAL:c.HORIZONTAL}function y(t,e,i){const r=V(t,e),n=v(i);if(r===n){let[o,s]=l(e);return(i===3||i===1)&&(s+=1),[...o,s]}else{const o=i===3||i===1?1:0;return[...e,o]}}function A(t){const e=t.parentElement;if(!e)throw new Error("Invalid grid element");let i=e.firstElementChild,r=0;for(;i!==t&&i!==e.lastElementChild&&i;)i=i.nextElementSibling,r++;return r}function T(t){const e=t.parentElement;if(!e)throw new Error("Invalid grid element");if(/\bmonaco-grid-view\b/.test(e.className))return[];const i=A(e),r=e.parentElement.parentElement.parentElement.parentElement;return[...T(r),i]}var L;(n=>{n.Distribute={type:"distribute"},n.Split={type:"split"},n.Auto={type:"auto"};function r(o){return{type:"invisible",cachedVisibleSize:o}}n.Invisible=r})(L||={});class M extends O{gridview;views=new Map;get orientation(){return this.gridview.orientation}set orientation(e){this.gridview.orientation=e}get width(){return this.gridview.width}get height(){return this.gridview.height}get minimumWidth(){return this.gridview.minimumWidth}get minimumHeight(){return this.gridview.minimumHeight}get maximumWidth(){return this.gridview.maximumWidth}get maximumHeight(){return this.gridview.maximumHeight}onDidChange;onDidScroll;get boundarySashes(){return this.gridview.boundarySashes}set boundarySashes(e){this.gridview.boundarySashes=e}set edgeSnapping(e){this.gridview.edgeSnapping=e}get element(){return this.gridview.element}didLayout=!1;onDidChangeViewMaximized;constructor(e,i={}){super(),e instanceof f?(this.gridview=e,this.gridview.getViewMap(this.views)):this.gridview=new f(i),this._register(this.gridview),this._register(this.gridview.onDidSashReset(this.onDidSashReset,this)),e instanceof f||this._addView(e,0,[0]),this.onDidChange=this.gridview.onDidChange,this.onDidScroll=this.gridview.onDidScroll,this.onDidChangeViewMaximized=this.gridview.onDidChangeViewMaximized}style(e){this.gridview.style(e)}layout(e,i,r=0,n=0){this.gridview.layout(e,i,r,n),this.didLayout=!0}addView(e,i,r,n){if(this.views.has(e))throw new Error("Can't add same view twice");const o=v(n);this.views.size===1&&this.orientation!==o&&(this.orientation=o);const s=this.getViewLocation(r),a=y(this.gridview.orientation,s,n);let d;if(typeof i=="number")d=i;else if(i.type==="split"){const[,h]=l(s);d=w.Split(h)}else if(i.type==="distribute")d=w.Distribute;else if(i.type==="auto"){const[,h]=l(s);d=w.Auto(h)}else d=i;this._addView(e,d,a)}addViewAt(e,i,r){if(this.views.has(e))throw new Error("Can't add same view twice");let n;typeof i=="number"?n=i:i.type==="distribute"?n=w.Distribute:n=i,this._addView(e,n,r)}_addView(e,i,r){this.views.set(e,e.element),this.gridview.addView(e,i,r)}removeView(e,i){if(this.views.size===1)throw new Error("Can't remove last view");const r=this.getViewLocation(e);let n;if(i?.type==="distribute")n=w.Distribute;else if(i?.type==="auto"){const o=r[r.length-1];n=w.Auto(o===0?1:o-1)}this.gridview.removeView(r,n),this.views.delete(e)}moveView(e,i,r,n){const o=this.getViewLocation(e),[s,a]=l(o),d=this.getViewLocation(r),h=y(this.gridview.orientation,d,n),[g,m]=l(h);z(s,g)?this.gridview.moveView(s,a,m):(this.removeView(e,typeof i=="number"?void 0:i),this.addView(e,i,r,n))}moveViewTo(e,i){const r=this.getViewLocation(e),[n,o]=l(r),[s,a]=l(i);if(z(n,s))this.gridview.moveView(n,o,a);else{const d=this.getViewSize(e),h=V(this.gridview.orientation,r),g=this.getViewCachedVisibleSize(e),m=typeof g>"u"?h===c.HORIZONTAL?d.width:d.height:L.Invisible(g);this.removeView(e),this.addViewAt(e,m,i)}}swapViews(e,i){const r=this.getViewLocation(e),n=this.getViewLocation(i);return this.gridview.swapViews(r,n)}resizeView(e,i){const r=this.getViewLocation(e);return this.gridview.resizeView(r,i)}isViewExpanded(e){const i=this.getViewLocation(e);return this.gridview.isViewExpanded(i)}isViewMaximized(e){const i=this.getViewLocation(e);return this.gridview.isViewMaximized(i)}hasMaximizedView(){return this.gridview.hasMaximizedView()}getViewSize(e){if(!e)return this.gridview.getViewSize();const i=this.getViewLocation(e);return this.gridview.getViewSize(i)}getViewCachedVisibleSize(e){const i=this.getViewLocation(e);return this.gridview.getViewCachedVisibleSize(i)}maximizeView(e){if(this.views.size<2)throw new Error("At least two views are required to maximize a view");const i=this.getViewLocation(e);this.gridview.maximizeView(i)}exitMaximizedView(){this.gridview.exitMaximizedView()}expandView(e){const i=this.getViewLocation(e);this.gridview.expandView(i)}distributeViewSizes(){this.gridview.distributeViewSizes()}isViewVisible(e){const i=this.getViewLocation(e);return this.gridview.isViewVisible(i)}setViewVisible(e,i){const r=this.getViewLocation(e);this.gridview.setViewVisible(r,i)}getViews(){return this.gridview.getView()}getNeighborViews(e,i,r=!1){if(!this.didLayout)throw new Error("Can't call getNeighborViews before first layout");const n=this.getViewLocation(e),o=this.getViews(),s=S(o,n);let a=x(s.box,i);return r&&(i===0&&s.box.top===0?a={offset:o.box.top+o.box.height,range:a.range}:i===3&&s.box.left+s.box.width===o.box.width?a={offset:0,range:a.range}:i===1&&s.box.top+s.box.height===o.box.height?a={offset:0,range:a.range}:i===2&&s.box.left===0&&(a={offset:o.box.left+o.box.width,range:a.range})),C(o,B(i),a).map(d=>d.view)}getViewLocation(e){const i=this.views.get(e);if(!i)throw new Error("View not found");return T(i)}onDidSashReset(e){const i=o=>{const s=this.gridview.getView(o);if(p(s))return!1;const a=V(this.orientation,o),d=a===c.HORIZONTAL?s.view.preferredWidth:s.view.preferredHeight;if(typeof d!="number")return!1;const h=a===c.HORIZONTAL?{width:Math.round(d)}:{height:Math.round(d)};return this.gridview.resizeView(o,h),!0};if(i(e))return;const[r,n]=l(e);i([...r,n+1])||this.gridview.distributeViewSizes(r)}}class u extends M{static serializeNode(e,i){const r=i===c.VERTICAL?e.box.width:e.box.height;if(!p(e)){const o={type:"leaf",data:e.view.toJSON(),size:r};return typeof e.cachedVisibleSize=="number"?(o.size=e.cachedVisibleSize,o.visible=!1):e.maximized&&(o.maximized=!0),o}const n=e.children.map(o=>u.serializeNode(o,b(i)));return n.some(o=>o.visible!==!1)?{type:"branch",data:n,size:r}:{type:"branch",data:n,size:r,visible:!1}}static deserialize(e,i,r={}){if(typeof e.orientation!="number")throw new Error("Invalid JSON: 'orientation' property must be a number.");if(typeof e.width!="number")throw new Error("Invalid JSON: 'width' property must be a number.");if(typeof e.height!="number")throw new Error("Invalid JSON: 'height' property must be a number.");const n=f.deserialize(e,i,r);return new u(n,r)}static from(e,i={}){return u.deserialize(H(e),{fromJSON:r=>r},i)}initialLayoutContext=!0;serialize(){return{root:u.serializeNode(this.getViews(),this.orientation),orientation:this.orientation,width:this.width,height:this.height}}layout(e,i,r=0,n=0){super.layout(e,i,r,n),this.initialLayoutContext&&(this.initialLayoutContext=!1,this.gridview.trySet2x2())}}function I(t){return!!t.groups}function G(t,e){if(!e&&t.groups&&t.groups.length<=1&&(t.groups=void 0),!I(t))return;let i=0,r=0;for(const a of t.groups)G(a,!1),a.size&&(i+=a.size,r++);const n=r>0?i:1,o=t.groups.length-r,s=n/o;for(const a of t.groups)a.size||(a.size=s)}function D(t){return I(t)?{type:"branch",data:t.groups.map(e=>D(e)),size:t.size}:{type:"leaf",data:t.data,size:t.size}}function N(t,e){if(t.type==="branch"){const i=t.data.map(r=>N(r,b(e)));if(e===c.VERTICAL){const r=t.size||(i.length===0?void 0:Math.max(...i.map(o=>o.width||0))),n=i.length===0?void 0:i.reduce((o,s)=>o+(s.height||0),0);return{width:r,height:n}}else{const r=i.length===0?void 0:i.reduce((o,s)=>o+(s.width||0),0),n=t.size||(i.length===0?void 0:Math.max(...i.map(o=>o.height||0)));return{width:r,height:n}}}else{const i=e===c.VERTICAL?t.size:void 0,r=e===c.VERTICAL?void 0:t.size;return{width:i,height:r}}}function H(t){G(t,!0);const e=D(t),{width:i,height:r}=N(e,t.orientation);return{root:e,orientation:t.orientation,width:i||1,height:r||1}}export{E as Direction,M as Grid,ie as LayoutPriority,te as Orientation,u as SerializableGrid,L as Sizing,H as createSerializedGrid,y as getRelativeLocation,p as isGridBranchNode,re as orthogonal,G as sanitizeGridNodeDescriptor};