import{range as m}from"../../../common/arrays.js";import{CancellationTokenSource as u}from"../../../common/cancellation.js";import{Event as o}from"../../../common/event.js";import{Disposable as p}from"../../../common/lifecycle.js";import"./list.css";import{isActiveElement as c}from"../../dom.js";import{List as g}from"./listWidget.js";class v{constructor(e,t){this.renderer=e;this.modelProvider=t}get templateId(){return this.renderer.templateId}renderTemplate(e){return{data:this.renderer.renderTemplate(e),disposable:p.None}}renderElement(e,t,i,s){if(i.disposable?.dispose(),!i.data)return;const r=this.modelProvider();if(r.isResolved(e))return this.renderer.renderElement(r.get(e),e,i.data,s);const n=new u,a=r.resolve(e,n.token);i.disposable={dispose:()=>n.cancel()},this.renderer.renderPlaceholder(e,i.data),a.then(d=>this.renderer.renderElement(d,e,i.data,s))}disposeTemplate(e){e.disposable&&(e.disposable.dispose(),e.disposable=void 0),e.data&&(this.renderer.disposeTemplate(e.data),e.data=void 0)}}class h{constructor(e,t){this.modelProvider=e;this.accessibilityProvider=t}getWidgetAriaLabel(){return this.accessibilityProvider.getWidgetAriaLabel()}getAriaLabel(e){const t=this.modelProvider();return t.isResolved(e)?this.accessibilityProvider.getAriaLabel(t.get(e)):null}}function b(l,e){return{...e,accessibilityProvider:e.accessibilityProvider&&new h(l,e.accessibilityProvider)}}class E{list;_model;constructor(e,t,i,s,r={}){const n=()=>this.model,a=s.map(d=>new v(d,n));this.list=new g(e,t,i,a,b(n,r))}updateOptions(e){this.list.updateOptions(e)}getHTMLElement(){return this.list.getHTMLElement()}isDOMFocused(){return c(this.getHTMLElement())}domFocus(){this.list.domFocus()}get onDidFocus(){return this.list.onDidFocus}get onDidBlur(){return this.list.onDidBlur}get widget(){return this.list}get onDidDispose(){return this.list.onDidDispose}get onMouseClick(){return o.map(this.list.onMouseClick,({element:e,index:t,browserEvent:i})=>({element:e===void 0?void 0:this._model.get(e),index:t,browserEvent:i}))}get onMouseDblClick(){return o.map(this.list.onMouseDblClick,({element:e,index:t,browserEvent:i})=>({element:e===void 0?void 0:this._model.get(e),index:t,browserEvent:i}))}get onTap(){return o.map(this.list.onTap,({element:e,index:t,browserEvent:i})=>({element:e===void 0?void 0:this._model.get(e),index:t,browserEvent:i}))}get onPointer(){return o.map(this.list.onPointer,({element:e,index:t,browserEvent:i})=>({element:e===void 0?void 0:this._model.get(e),index:t,browserEvent:i}))}get onDidChangeFocus(){return o.map(this.list.onDidChangeFocus,({elements:e,indexes:t,browserEvent:i})=>({elements:e.map(s=>this._model.get(s)),indexes:t,browserEvent:i}))}get onDidChangeSelection(){return o.map(this.list.onDidChangeSelection,({elements:e,indexes:t,browserEvent:i})=>({elements:e.map(s=>this._model.get(s)),indexes:t,browserEvent:i}))}get onContextMenu(){return o.map(this.list.onContextMenu,({element:e,index:t,anchor:i,browserEvent:s})=>typeof e>"u"?{element:e,index:t,anchor:i,browserEvent:s}:{element:this._model.get(e),index:t,anchor:i,browserEvent:s})}get model(){return this._model}set model(e){this._model=e,this.list.splice(0,this.list.length,m(e.length))}get length(){return this.list.length}get scrollTop(){return this.list.scrollTop}set scrollTop(e){this.list.scrollTop=e}get scrollLeft(){return this.list.scrollLeft}set scrollLeft(e){this.list.scrollLeft=e}setAnchor(e){this.list.setAnchor(e)}getAnchor(){return this.list.getAnchor()}setFocus(e){this.list.setFocus(e)}focusNext(e,t){this.list.focusNext(e,t)}focusPrevious(e,t){this.list.focusPrevious(e,t)}focusNextPage(){return this.list.focusNextPage()}focusPreviousPage(){return this.list.focusPreviousPage()}focusLast(){this.list.focusLast()}focusFirst(){this.list.focusFirst()}getFocus(){return this.list.getFocus()}setSelection(e,t){this.list.setSelection(e,t)}getSelection(){return this.list.getSelection()}getSelectedElements(){return this.getSelection().map(e=>this.model.get(e))}layout(e,t){this.list.layout(e,t)}triggerTypeNavigation(){this.list.triggerTypeNavigation()}reveal(e,t){this.list.reveal(e,t)}style(e){this.list.style(e)}dispose(){this.list.dispose()}}export{E as PagedList};
