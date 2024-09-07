import h from"assert";import"../../../../browser/ui/grid/grid.js";import{isGridBranchNode as u}from"../../../../browser/ui/grid/gridview.js";import{Emitter as r}from"../../../../common/event.js";class p{constructor(e,t,n,m){this._minimumWidth=e;this._maximumWidth=t;this._minimumHeight=n;this._maximumHeight=m;h(e<=t,"gridview view minimum width must be <= maximum width"),h(n<=m,"gridview view minimum height must be <= maximum height")}_onDidChange=new r;onDidChange=this._onDidChange.event;get minimumWidth(){return this._minimumWidth}set minimumWidth(e){this._minimumWidth=e,this._onDidChange.fire(void 0)}get maximumWidth(){return this._maximumWidth}set maximumWidth(e){this._maximumWidth=e,this._onDidChange.fire(void 0)}get minimumHeight(){return this._minimumHeight}set minimumHeight(e){this._minimumHeight=e,this._onDidChange.fire(void 0)}get maximumHeight(){return this._maximumHeight}set maximumHeight(e){this._maximumHeight=e,this._onDidChange.fire(void 0)}_element=document.createElement("div");get element(){return this._onDidGetElement.fire(),this._element}_onDidGetElement=new r;onDidGetElement=this._onDidGetElement.event;_width=0;get width(){return this._width}_height=0;get height(){return this._height}_top=0;get top(){return this._top}_left=0;get left(){return this._left}get size(){return[this.width,this.height]}_onDidLayout=new r;onDidLayout=this._onDidLayout.event;_onDidFocus=new r;onDidFocus=this._onDidFocus.event;layout(e,t,n,m){this._width=e,this._height=t,this._top=n,this._left=m,this._onDidLayout.fire({width:e,height:t,top:n,left:m})}focus(){this._onDidFocus.fire()}dispose(){this._onDidChange.dispose(),this._onDidGetElement.dispose(),this._onDidLayout.dispose(),this._onDidFocus.dispose()}}function d(i){return u(i)?i.children.map(d):i.view}export{p as TestView,d as nodesToArrays};