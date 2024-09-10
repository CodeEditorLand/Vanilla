import"./scrollDecoration.css";import{createFastDomNode as s}from"../../../../base/browser/fastDomNode.js";import{ViewPart as r}from"../../view/viewPart.js";import{EditorOption as i}from"../../../common/config/editorOptions.js";class S extends r{_domNode;_scrollTop;_width;_shouldShow;_useShadows;constructor(o){super(o),this._scrollTop=0,this._width=0,this._updateWidth(),this._shouldShow=!1;const e=this._context.configuration.options.get(i.scrollbar);this._useShadows=e.useShadows,this._domNode=s(document.createElement("div")),this._domNode.setAttribute("role","presentation"),this._domNode.setAttribute("aria-hidden","true")}dispose(){super.dispose()}_updateShouldShow(){const o=this._useShadows&&this._scrollTop>0;return this._shouldShow!==o?(this._shouldShow=o,!0):!1}getDomNode(){return this._domNode}_updateWidth(){const t=this._context.configuration.options.get(i.layoutInfo);t.minimap.renderMinimap===0||t.minimap.minimapWidth>0&&t.minimap.minimapLeft===0?this._width=t.width:this._width=t.width-t.verticalScrollbarWidth}onConfigurationChanged(o){const e=this._context.configuration.options.get(i.scrollbar);return this._useShadows=e.useShadows,this._updateWidth(),this._updateShouldShow(),!0}onScrollChanged(o){return this._scrollTop=o.scrollTop,this._updateShouldShow()}prepareRender(o){}render(o){this._domNode.setWidth(this._width),this._domNode.setClassName(this._shouldShow?"scroll-decoration":"")}}export{S as ScrollDecorationViewPart};
