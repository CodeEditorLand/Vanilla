import*as d from"../../../../base/browser/dom.js";import{createFastDomNode as y}from"../../../../base/browser/fastDomNode.js";import{SmoothScrollableElement as f}from"../../../../base/browser/ui/scrollbar/scrollableElement.js";import{getThemeTypeSelector as S}from"../../../../platform/theme/common/themeService.js";import{EditorOption as r}from"../../../common/config/editorOptions.js";import{ScrollType as w}from"../../../common/editorCommon.js";import{PartFingerprint as E,PartFingerprints as N,ViewPart as L}from"../../view/viewPart.js";class T extends L{scrollbar;scrollbarDomNode;constructor(e,o,l,n){super(e);const s=this._context.configuration.options,t=s.get(r.scrollbar),m=s.get(r.mouseWheelScrollSensitivity),p=s.get(r.fastScrollSensitivity),u=s.get(r.scrollPredominantAxis),v={listenOnDomNode:l.domNode,className:"editor-scrollable "+S(e.theme.type),useShadows:!1,lazyRender:!0,vertical:t.vertical,horizontal:t.horizontal,verticalHasArrows:t.verticalHasArrows,horizontalHasArrows:t.horizontalHasArrows,verticalScrollbarSize:t.verticalScrollbarSize,verticalSliderSize:t.verticalSliderSize,horizontalScrollbarSize:t.horizontalScrollbarSize,horizontalSliderSize:t.horizontalSliderSize,handleMouseWheel:t.handleMouseWheel,alwaysConsumeMouseWheel:t.alwaysConsumeMouseWheel,arrowSize:t.arrowSize,mouseWheelScrollSensitivity:m,fastScrollSensitivity:p,scrollPredominantAxis:u,scrollByPage:t.scrollByPage};this.scrollbar=this._register(new f(o.domNode,v,this._context.viewLayout.getScrollable())),N.write(this.scrollbar.getDomNode(),E.ScrollableElement),this.scrollbarDomNode=y(this.scrollbar.getDomNode()),this.scrollbarDomNode.setPosition("absolute"),this._setLayout();const c=(i,b,g)=>{const h={};if(b){const a=i.scrollTop;a&&(h.scrollTop=this._context.viewLayout.getCurrentScrollTop()+a,i.scrollTop=0)}if(g){const a=i.scrollLeft;a&&(h.scrollLeft=this._context.viewLayout.getCurrentScrollLeft()+a,i.scrollLeft=0)}this._context.viewModel.viewLayout.setScrollPosition(h,w.Immediate)};this._register(d.addDisposableListener(l.domNode,"scroll",i=>c(l.domNode,!0,!0))),this._register(d.addDisposableListener(o.domNode,"scroll",i=>c(o.domNode,!0,!1))),this._register(d.addDisposableListener(n.domNode,"scroll",i=>c(n.domNode,!0,!1))),this._register(d.addDisposableListener(this.scrollbarDomNode.domNode,"scroll",i=>c(this.scrollbarDomNode.domNode,!0,!1)))}dispose(){super.dispose()}_setLayout(){const e=this._context.configuration.options,o=e.get(r.layoutInfo);this.scrollbarDomNode.setLeft(o.contentLeft),e.get(r.minimap).side==="right"?this.scrollbarDomNode.setWidth(o.contentWidth+o.minimap.minimapWidth):this.scrollbarDomNode.setWidth(o.contentWidth),this.scrollbarDomNode.setHeight(o.height)}getOverviewRulerLayoutInfo(){return this.scrollbar.getOverviewRulerLayoutInfo()}getDomNode(){return this.scrollbarDomNode}delegateVerticalScrollbarPointerDown(e){this.scrollbar.delegateVerticalScrollbarPointerDown(e)}delegateScrollFromMouseWheelEvent(e){this.scrollbar.delegateScrollFromMouseWheelEvent(e)}onConfigurationChanged(e){if(e.hasChanged(r.scrollbar)||e.hasChanged(r.mouseWheelScrollSensitivity)||e.hasChanged(r.fastScrollSensitivity)){const o=this._context.configuration.options,l=o.get(r.scrollbar),n=o.get(r.mouseWheelScrollSensitivity),s=o.get(r.fastScrollSensitivity),t=o.get(r.scrollPredominantAxis),m={vertical:l.vertical,horizontal:l.horizontal,verticalScrollbarSize:l.verticalScrollbarSize,horizontalScrollbarSize:l.horizontalScrollbarSize,scrollByPage:l.scrollByPage,handleMouseWheel:l.handleMouseWheel,mouseWheelScrollSensitivity:n,fastScrollSensitivity:s,scrollPredominantAxis:t};this.scrollbar.updateOptions(m)}return e.hasChanged(r.layoutInfo)&&this._setLayout(),!0}onScrollChanged(e){return!0}onThemeChanged(e){return this.scrollbar.updateClassName("editor-scrollable "+S(this._context.theme.type)),!0}prepareRender(e){}render(e){this.scrollbar.renderNow()}}export{T as EditorScrollbar};
