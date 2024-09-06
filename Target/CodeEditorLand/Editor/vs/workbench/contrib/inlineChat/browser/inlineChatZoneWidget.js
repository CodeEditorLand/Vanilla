var b=Object.defineProperty;var S=Object.getOwnPropertyDescriptor;var v=(h,n,e,t)=>{for(var i=t>1?void 0:t?S(n,e):n,r=h.length-1,d;r>=0;r--)(d=h[r])&&(i=(t?d(n,e,i):d(i))||i);return t&&i&&b(n,e,i),i},c=(h,n)=>(e,t)=>n(e,t,h);import{addDisposableListener as C,Dimension as w}from"../../../../../vs/base/browser/dom.js";import*as T from"../../../../../vs/base/browser/ui/aria/aria.js";import{toDisposable as E}from"../../../../../vs/base/common/lifecycle.js";import{isEqual as y}from"../../../../../vs/base/common/resources.js";import{assertType as L}from"../../../../../vs/base/common/types.js";import"../../../../../vs/editor/browser/editorBrowser.js";import{StableEditorBottomScrollState as I}from"../../../../../vs/editor/browser/stableEditorScroll.js";import{EditorOption as x}from"../../../../../vs/editor/common/config/editorOptions.js";import"../../../../../vs/editor/common/core/position.js";import"../../../../../vs/editor/common/core/range.js";import{ScrollType as N}from"../../../../../vs/editor/common/editorCommon.js";import{ZoneWidget as P}from"../../../../../vs/editor/contrib/zoneWidget/browser/zoneWidget.js";import{localize as H}from"../../../../../vs/nls.js";import{MenuId as W}from"../../../../../vs/platform/actions/common/actions.js";import{IConfigurationService as A}from"../../../../../vs/platform/configuration/common/configuration.js";import{IContextKeyService as R}from"../../../../../vs/platform/contextkey/common/contextkey.js";import{IInstantiationService as M}from"../../../../../vs/platform/instantiation/common/instantiation.js";import{ILogService as O}from"../../../../../vs/platform/log/common/log.js";import"../../../../../vs/workbench/contrib/chat/browser/chatWidget.js";import{isResponseVM as F}from"../../../../../vs/workbench/contrib/chat/common/chatViewModel.js";import{ACTION_REGENERATE_RESPONSE as V,ACTION_REPORT_ISSUE as D,ACTION_TOGGLE_DIFF as K,CTX_INLINE_CHAT_OUTER_CURSOR_POSITION as B,EditMode as U,InlineChatConfigKeys as Z,MENU_INLINE_CHAT_WIDGET_STATUS as z}from"../../../../../vs/workbench/contrib/inlineChat/common/inlineChat.js";import{EditorBasedInlineChatWidget as G}from"./inlineChatWidget.js";let m=class extends P{constructor(e,t,i,r,d,g){super(t,{showFrame:!1,showArrow:!1,isAccessible:!0,className:"inline-chat-widget",keepEditorSelection:!0,showInHiddenAreas:!0,ordinal:5e4});this._instaService=i;this._logService=r;this._ctxCursorPosition=B.bindTo(d),this._disposables.add(E(()=>{this._ctxCursorPosition.reset()})),this.widget=this._instaService.createInstance(G,e,this.editor,{statusMenuId:{menu:z,options:{buttonConfigProvider:(o,p)=>{const l=p>0;return new Set([V,K,D]).has(o.id)?{isSecondary:l,showIcon:!0,showLabel:!1}:{isSecondary:l}}}},chatWidgetViewOptions:{menus:{executeToolbar:W.ChatExecute,telemetrySource:"interactiveEditorWidget-toolbar"},rendererOptions:{renderTextEditsAsSummary:o=>y(o,t.getModel()?.uri)&&g.getValue(Z.Mode)===U.Live}}}),this._disposables.add(this.widget);let a;this._disposables.add(this.widget.chatWidget.onWillMaybeChangeHeight(()=>{this.position&&(a=this._createZoneAndScrollRestoreFn(this.position))})),this._disposables.add(this.widget.onDidChangeHeight(()=>{if(this.position){a??=this._createZoneAndScrollRestoreFn(this.position);const o=this._computeHeight();this._relayout(o.linesValue),a(),a=void 0}})),this.create(),this._disposables.add(C(this.domNode,"click",o=>{!this.editor.hasWidgetFocus()&&!this.widget.hasFocus()&&this.editor.focus()},!0));const s=()=>{!this.position||!this.editor.hasModel()?this._ctxCursorPosition.reset():this.position.lineNumber===this.editor.getPosition().lineNumber?this._ctxCursorPosition.set("above"):this.position.lineNumber+1===this.editor.getPosition().lineNumber?this._ctxCursorPosition.set("below"):this._ctxCursorPosition.reset()};this._disposables.add(this.editor.onDidChangeCursorPosition(o=>s())),this._disposables.add(this.editor.onDidFocusEditorText(o=>s())),s()}widget;_ctxCursorPosition;_dimension;_fillContainer(e){e.appendChild(this.widget.domNode)}_doLayout(e){const t=this.editor.getLayoutInfo();let i=t.contentWidth-(t.glyphMarginWidth+t.decorationsWidth);i=Math.min(640,i),this._dimension=new w(i,e),this.widget.layout(this._dimension)}_computeHeight(){const e=this.widget.contentHeight,t=this.editor.getLayoutInfo().height,i=Math.min(e,Math.max(this.widget.minHeight,t*.42));return{linesValue:i/this.editor.getOption(x.lineHeight),pixelsValue:i}}_onWidth(e){this._dimension&&this._doLayout(this._dimension.height)}show(e){L(this.container);const t=this.editor.getLayoutInfo(),i=t.glyphMarginWidth+t.decorationsWidth+t.lineNumbersWidth;this.container.style.marginLeft=`${i}px`;const r=this._createZoneAndScrollRestoreFn(e);super.show(e,this._computeHeight().linesValue),this.widget.chatWidget.setVisible(!0),this.widget.focus(),r()}updatePositionAndHeight(e){const t=this._createZoneAndScrollRestoreFn(e);super.updatePositionAndHeight(e,this._computeHeight().linesValue),t()}_createZoneAndScrollRestoreFn(e){const t=I.capture(this.editor),i=e.lineNumber<=1?1:1+e.lineNumber,r=this.editor.getScrollTop(),g=this.editor.getTopForLineNumber(i)-this._computeHeight().pixelsValue;return this.widget.chatWidget.viewModel?.getItems().find(s=>F(s)&&s.response.value.length>0)&&g<r?()=>{t.restore(this.editor)}:()=>{t.restore(this.editor);const s=this.editor.getScrollTop(),o=this.editor.getTopForLineNumber(i),p=o-this._computeHeight().pixelsValue,l=this.editor.getLayoutInfo().height,f=this.editor.getBottomForLineNumber(i);let u=p,_=!1;f>=s+l&&(u=f-l,_=!0),(u<s||_)&&(this._logService.trace("[IE] REVEAL zone",{zoneTop:p,lineTop:o,lineBottom:f,scrollTop:s,newScrollTop:u,forceScrollTop:_}),this.editor.setScrollTop(u,N.Immediate))}}revealRange(e,t){}_getWidth(e){return e.width-e.minimap.minimapWidth}hide(){const e=I.capture(this.editor);this._ctxCursorPosition.reset(),this.widget.reset(),this.widget.chatWidget.setVisible(!1),super.hide(),T.status(H("inlineChatClosed","Closed inline chat widget")),e.restore(this.editor)}};m=v([c(2,M),c(3,O),c(4,R),c(5,A)],m);export{m as InlineChatZoneWidget};