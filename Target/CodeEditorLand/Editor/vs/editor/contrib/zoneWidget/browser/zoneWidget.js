import*as l from"../../../../base/browser/dom.js";import{Orientation as I,Sash as C,SashState as S}from"../../../../base/browser/ui/sash/sash.js";import{Color as N,RGBA as Z}from"../../../../base/common/color.js";import{IdGenerator as L}from"../../../../base/common/idGenerator.js";import{DisposableStore as W}from"../../../../base/common/lifecycle.js";import*as w from"../../../../base/common/objects.js";import"./zoneWidget.css";import{EditorOption as c}from"../../../common/config/editorOptions.js";import{Range as s}from"../../../common/core/range.js";import{ScrollType as f}from"../../../common/editorCommon.js";import{TrackedRangeStickiness as H}from"../../../common/model.js";import{ModelDecorationOptions as y}from"../../../common/model/textModel.js";const b=new N(new Z(0,122,204)),E={showArrow:!0,showFrame:!0,className:"",frameColor:b,arrowColor:b,keepEditorSelection:!1},M="vs.editor.contrib.zoneWidget";class x{domNode;id="";afterLineNumber;afterColumn;heightInLines;showInHiddenAreas;ordinal;_onDomNodeTop;_onComputedHeight;constructor(e,t,i,n,r,d,a,h){this.domNode=e,this.afterLineNumber=t,this.afterColumn=i,this.heightInLines=n,this.showInHiddenAreas=a,this.ordinal=h,this._onDomNodeTop=r,this._onComputedHeight=d}onDomNodeTop(e){this._onDomNodeTop(e)}onComputedHeight(e){this._onComputedHeight(e)}}class T{_id;_domNode;constructor(e,t){this._id=e,this._domNode=t}getId(){return this._id}getDomNode(){return this._domNode}getPosition(){return null}}class u{constructor(e){this._editor=e}static _IdGenerator=new L(".arrow-decoration-");_ruleName=u._IdGenerator.nextId();_decorations=this._editor.createDecorationsCollection();_color=null;_height=-1;dispose(){this.hide(),l.removeCSSRulesContainingSelector(this._ruleName)}set color(e){this._color!==e&&(this._color=e,this._updateStyle())}set height(e){this._height!==e&&(this._height=e,this._updateStyle())}_updateStyle(){l.removeCSSRulesContainingSelector(this._ruleName),l.createCSSRule(`.monaco-editor ${this._ruleName}`,`border-style: solid; border-color: transparent; border-bottom-color: ${this._color}; border-width: ${this._height}px; bottom: -${this._height}px !important; margin-left: -${this._height}px; `)}show(e){e.column===1&&(e={lineNumber:e.lineNumber,column:2}),this._decorations.set([{range:s.fromPositions(e),options:{description:"zone-widget-arrow",className:this._ruleName,stickiness:H.NeverGrowsWhenTypingAtEdges}}])}hide(){this._decorations.clear()}}class F{_arrow=null;_overlayWidget=null;_resizeSash=null;_positionMarkerId;_viewZone=null;_disposables=new W;container=null;domNode;editor;options;constructor(e,t={}){this.editor=e,this._positionMarkerId=this.editor.createDecorationsCollection(),this.options=w.deepClone(t),w.mixin(this.options,E,!1),this.domNode=document.createElement("div"),this.options.isAccessible||(this.domNode.setAttribute("aria-hidden","true"),this.domNode.setAttribute("role","presentation")),this._disposables.add(this.editor.onDidLayoutChange(i=>{const n=this._getWidth(i);this.domNode.style.width=n+"px",this.domNode.style.left=this._getLeft(i)+"px",this._onWidth(n)}))}dispose(){this._overlayWidget&&(this.editor.removeOverlayWidget(this._overlayWidget),this._overlayWidget=null),this._viewZone&&this.editor.changeViewZones(e=>{this._viewZone&&e.removeZone(this._viewZone.id),this._viewZone=null}),this._positionMarkerId.clear(),this._disposables.dispose()}create(){this.domNode.classList.add("zone-widget"),this.options.className&&this.domNode.classList.add(this.options.className),this.container=document.createElement("div"),this.container.classList.add("zone-widget-container"),this.domNode.appendChild(this.container),this.options.showArrow&&(this._arrow=new u(this.editor),this._disposables.add(this._arrow)),this._fillContainer(this.container),this._initSash(),this._applyStyles()}style(e){e.frameColor&&(this.options.frameColor=e.frameColor),e.arrowColor&&(this.options.arrowColor=e.arrowColor),this._applyStyles()}_applyStyles(){if(this.container&&this.options.frameColor){const e=this.options.frameColor.toString();this.container.style.borderTopColor=e,this.container.style.borderBottomColor=e}if(this._arrow&&this.options.arrowColor){const e=this.options.arrowColor.toString();this._arrow.color=e}}_getWidth(e){return e.width-e.minimap.minimapWidth-e.verticalScrollbarWidth}_getLeft(e){return e.minimap.minimapWidth>0&&e.minimap.minimapLeft===0?e.minimap.minimapWidth:0}_onViewZoneTop(e){this.domNode.style.top=e+"px"}_onViewZoneHeight(e){if(this.domNode.style.height=`${e}px`,this.container){const t=e-this._decoratingElementsHeight();this.container.style.height=`${t}px`;const i=this.editor.getLayoutInfo();this._doLayout(t,this._getWidth(i))}this._resizeSash?.layout()}get position(){const e=this._positionMarkerId.getRange(0);if(e)return e.getStartPosition()}hasFocus(){return this.domNode.contains(l.getActiveElement())}_isShowing=!1;show(e,t){const i=s.isIRange(e)?s.lift(e):s.fromPositions(e);this._isShowing=!0,this._showImpl(i,t),this._isShowing=!1,this._positionMarkerId.set([{range:i,options:y.EMPTY}])}updatePositionAndHeight(e,t){this._viewZone&&(e=s.isIRange(e)?s.getStartPosition(e):e,this._viewZone.afterLineNumber=e.lineNumber,this._viewZone.afterColumn=e.column,this._viewZone.heightInLines=t??this._viewZone.heightInLines,this.editor.changeViewZones(i=>{i.layoutZone(this._viewZone.id)}),this._positionMarkerId.set([{range:s.isIRange(e)?e:s.fromPositions(e),options:y.EMPTY}]))}hide(){this._viewZone&&(this.editor.changeViewZones(e=>{this._viewZone&&e.removeZone(this._viewZone.id)}),this._viewZone=null),this._overlayWidget&&(this.editor.removeOverlayWidget(this._overlayWidget),this._overlayWidget=null),this._arrow?.hide(),this._positionMarkerId.clear()}_decoratingElementsHeight(){const e=this.editor.getOption(c.lineHeight);let t=0;if(this.options.showArrow){const i=Math.round(e/3);t+=2*i}if(this.options.showFrame){const i=Math.round(e/9);t+=2*i}return t}_showImpl(e,t){const i=e.getStartPosition(),n=this.editor.getLayoutInfo(),r=this._getWidth(n);this.domNode.style.width=`${r}px`,this.domNode.style.left=this._getLeft(n)+"px";const d=document.createElement("div");d.style.overflow="hidden";const a=this.editor.getOption(c.lineHeight);if(!this.options.allowUnlimitedHeight){const o=Math.max(12,this.editor.getLayoutInfo().height/a*.8);t=Math.min(t,o)}let h=0,_=0;if(this._arrow&&this.options.showArrow&&(h=Math.round(a/3),this._arrow.height=h,this._arrow.show(i)),this.options.showFrame&&(_=Math.round(a/9)),this.editor.changeViewZones(o=>{this._viewZone&&o.removeZone(this._viewZone.id),this._overlayWidget&&(this.editor.removeOverlayWidget(this._overlayWidget),this._overlayWidget=null),this.domNode.style.top="-1000px",this._viewZone=new x(d,i.lineNumber,i.column,t,p=>this._onViewZoneTop(p),p=>this._onViewZoneHeight(p),this.options.showInHiddenAreas,this.options.ordinal),this._viewZone.id=o.addZone(this._viewZone),this._overlayWidget=new T(M+this._viewZone.id,this.domNode),this.editor.addOverlayWidget(this._overlayWidget)}),this.container&&this.options.showFrame){const o=this.options.frameWidth?this.options.frameWidth:_;this.container.style.borderTopWidth=o+"px",this.container.style.borderBottomWidth=o+"px"}const v=t*a-this._decoratingElementsHeight();this.container&&(this.container.style.top=h+"px",this.container.style.height=v+"px",this.container.style.overflow="hidden"),this._doLayout(v,r),this.options.keepEditorSelection||this.editor.setSelection(e);const m=this.editor.getModel();if(m){const o=m.validateRange(new s(e.startLineNumber,1,e.endLineNumber+1,1));this.revealRange(o,o.startLineNumber===m.getLineCount())}}revealRange(e,t){t?this.editor.revealLineNearTop(e.endLineNumber,f.Smooth):this.editor.revealRange(e,f.Smooth)}setCssClass(e,t){this.container&&(t&&this.container.classList.remove(t),this.container.classList.add(e))}_onWidth(e){}_doLayout(e,t){}_relayout(e){this._viewZone&&this._viewZone.heightInLines!==e&&this.editor.changeViewZones(t=>{this._viewZone&&(this._viewZone.heightInLines=e,t.layoutZone(this._viewZone.id))})}_initSash(){if(this._resizeSash)return;this._resizeSash=this._disposables.add(new C(this.domNode,this,{orientation:I.HORIZONTAL})),this.options.isResizeable||(this._resizeSash.state=S.Disabled);let e;this._disposables.add(this._resizeSash.onDidStart(t=>{this._viewZone&&(e={startY:t.startY,heightInLines:this._viewZone.heightInLines})})),this._disposables.add(this._resizeSash.onDidEnd(()=>{e=void 0})),this._disposables.add(this._resizeSash.onDidChange(t=>{if(e){const i=(t.currentY-e.startY)/this.editor.getOption(c.lineHeight),n=i<0?Math.ceil(i):Math.floor(i),r=e.heightInLines+n;r>5&&r<35&&this._relayout(r)}}))}getHorizontalSashLeft(){return 0}getHorizontalSashTop(){return(this.domNode.style.height===null?0:Number.parseInt(this.domNode.style.height))-this._decoratingElementsHeight()/2}getHorizontalSashWidth(){const e=this.editor.getLayoutInfo();return e.width-e.minimap.minimapWidth}}export{T as OverlayWidgetDelegate,F as ZoneWidget};
