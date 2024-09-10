var N=Object.defineProperty;var A=Object.getOwnPropertyDescriptor;var H=(v,e,i,t)=>{for(var o=t>1?void 0:t?A(e,i):e,a=v.length-1,h;a>=0;a--)(h=v[a])&&(o=(t?h(e,i,o):h(o))||o);return t&&o&&N(e,i,o),o},y=(v,e)=>(i,t)=>e(i,t,v);import*as d from"../../../../base/browser/dom.js";import"../../../../base/browser/ui/codicons/codiconStyles.js";import{List as T}from"../../../../base/browser/ui/list/listWidget.js";import{createCancelablePromise as O,disposableTimeout as F,TimeoutTimer as k}from"../../../../base/common/async.js";import{onUnexpectedError as B}from"../../../../base/common/errors.js";import{Emitter as C,PauseableEmitter as M}from"../../../../base/common/event.js";import{DisposableStore as R,MutableDisposable as x}from"../../../../base/common/lifecycle.js";import{clamp as V}from"../../../../base/common/numbers.js";import*as G from"../../../../base/common/strings.js";import"./media/suggest.css";import{ContentWidgetPositionPreference as W}from"../../../browser/editorBrowser.js";import{EmbeddedCodeEditorWidget as K}from"../../../browser/widget/codeEditor/embeddedCodeEditorWidget.js";import{EditorOption as _}from"../../../common/config/editorOptions.js";import{SuggestWidgetStatus as U}from"./suggestWidgetStatus.js";import"../../symbolIcons/browser/symbolIcons.js";import*as r from"../../../../nls.js";import{IContextKeyService as $}from"../../../../platform/contextkey/common/contextkey.js";import{IInstantiationService as q}from"../../../../platform/instantiation/common/instantiation.js";import{IStorageService as J,StorageScope as I,StorageTarget as z}from"../../../../platform/storage/common/storage.js";import{activeContrastBorder as j,editorForeground as Q,editorWidgetBackground as X,editorWidgetBorder as Y,listFocusHighlightForeground as Z,listHighlightForeground as ee,quickInputListFocusBackground as te,quickInputListFocusForeground as ie,quickInputListFocusIconForeground as se,registerColor as m,transparent as oe}from"../../../../platform/theme/common/colorRegistry.js";import{isHighContrast as ne}from"../../../../platform/theme/common/theme.js";import{IThemeService as de}from"../../../../platform/theme/common/themeService.js";import{ResizableHTMLElement as ae}from"../../../../base/browser/ui/resizable/resizable.js";import{Context as L,suggestWidgetStatusbarMenu as re}from"./suggest.js";import{canExpandCompletionItem as le,SuggestDetailsOverlay as he,SuggestDetailsWidget as ge}from"./suggestWidgetDetails.js";import{getAriaId as ue,ItemRenderer as ce}from"./suggestWidgetRenderer.js";import{getListStyles as _e}from"../../../../platform/theme/browser/defaultStyles.js";import{status as P}from"../../../../base/browser/ui/aria/aria.js";m("editorSuggestWidget.background",X,r.localize("editorSuggestWidgetBackground","Background color of the suggest widget.")),m("editorSuggestWidget.border",Y,r.localize("editorSuggestWidgetBorder","Border color of the suggest widget."));const me=m("editorSuggestWidget.foreground",Q,r.localize("editorSuggestWidgetForeground","Foreground color of the suggest widget."));m("editorSuggestWidget.selectedForeground",ie,r.localize("editorSuggestWidgetSelectedForeground","Foreground color of the selected entry in the suggest widget.")),m("editorSuggestWidget.selectedIconForeground",se,r.localize("editorSuggestWidgetSelectedIconForeground","Icon foreground color of the selected entry in the suggest widget."));const pe=m("editorSuggestWidget.selectedBackground",te,r.localize("editorSuggestWidgetSelectedBackground","Background color of the selected entry in the suggest widget."));m("editorSuggestWidget.highlightForeground",ee,r.localize("editorSuggestWidgetHighlightForeground","Color of the match highlights in the suggest widget.")),m("editorSuggestWidget.focusHighlightForeground",Z,r.localize("editorSuggestWidgetFocusHighlightForeground","Color of the match highlights in the suggest widget when an item is focused.")),m("editorSuggestWidgetStatus.foreground",oe(me,.5),r.localize("editorSuggestWidgetStatusForeground","Foreground color of the suggest widget status."));var fe=(n=>(n[n.Hidden=0]="Hidden",n[n.Loading=1]="Loading",n[n.Empty=2]="Empty",n[n.Open=3]="Open",n[n.Frozen=4]="Frozen",n[n.Details=5]="Details",n[n.onDetailsKeyDown=6]="onDetailsKeyDown",n))(fe||{});class Se{constructor(e,i){this._service=e;this._key=`suggestWidget.size/${i.getEditorType()}/${i instanceof K}`}_key;restore(){const e=this._service.get(this._key,I.PROFILE)??"";try{const i=JSON.parse(e);if(d.Dimension.is(i))return d.Dimension.lift(i)}catch{}}store(e){this._service.store(this._key,JSON.stringify(e),I.PROFILE,z.MACHINE)}reset(){this._service.remove(this._key,I.PROFILE)}}let p=class{constructor(e,i,t,o,a){this.editor=e;this._storageService=i;this.element=new ae,this.element.domNode.classList.add("editor-widget","suggest-widget"),this._contentWidget=new ve(this,e),this._persistedSize=new Se(i,e);class h{constructor(l,u,f=!1,g=!1){this.persistedSize=l;this.currentSize=u;this.persistHeight=f;this.persistWidth=g}}let n;this._disposables.add(this.element.onDidWillResize(()=>{this._contentWidget.lockPreference(),n=new h(this._persistedSize.restore(),this.element.size)})),this._disposables.add(this.element.onDidResize(s=>{if(this._resize(s.dimension.width,s.dimension.height),n&&(n.persistHeight=n.persistHeight||!!s.north||!!s.south,n.persistWidth=n.persistWidth||!!s.east||!!s.west),!!s.done){if(n){const{itemHeight:l,defaultSize:u}=this.getLayoutInfo(),f=Math.round(l/2);let{width:g,height:c}=this.element.size;(!n.persistHeight||Math.abs(n.currentSize.height-c)<=f)&&(c=n.persistedSize?.height??u.height),(!n.persistWidth||Math.abs(n.currentSize.width-g)<=f)&&(g=n.persistedSize?.width??u.width),this._persistedSize.store(new d.Dimension(g,c))}this._contentWidget.unlockPreference(),n=void 0}})),this._messageElement=d.append(this.element.domNode,d.$(".message")),this._listElement=d.append(this.element.domNode,d.$(".tree"));const S=this._disposables.add(a.createInstance(ge,this.editor));S.onDidClose(()=>this.toggleDetails(),this,this._disposables),this._details=new he(S,this.editor);const b=()=>this.element.domNode.classList.toggle("no-icons",!this.editor.getOption(_.suggest).showIcons);b();const w=a.createInstance(ce,this.editor);this._disposables.add(w),this._disposables.add(w.onDidToggleDetails(()=>this.toggleDetails())),this._list=new T("SuggestWidget",this._listElement,{getHeight:s=>this.getLayoutInfo().itemHeight,getTemplateId:s=>"suggestion"},[w],{alwaysConsumeMouseWheel:!0,useShadows:!1,mouseSupport:!1,multipleSelectionSupport:!1,accessibilityProvider:{getRole:()=>"option",getWidgetAriaLabel:()=>r.localize("suggest","Suggest"),getWidgetRole:()=>"listbox",getAriaLabel:s=>{let l=s.textLabel;if(typeof s.completion.label!="string"){const{detail:c,description:E}=s.completion.label;c&&E?l=r.localize("label.full","{0} {1}, {2}",l,c,E):c?l=r.localize("label.detail","{0} {1}",l,c):E&&(l=r.localize("label.desc","{0}, {1}",l,E))}if(!s.isResolved||!this._isDetailsVisible())return l;const{documentation:u,detail:f}=s.completion,g=G.format("{0}{1}",f||"",u?typeof u=="string"?u:u.value:"");return r.localize("ariaCurrenttSuggestionReadDetails","{0}, docs: {1}",l,g)}}}),this._list.style(_e({listInactiveFocusBackground:pe,listInactiveFocusOutline:j})),this._status=a.createInstance(U,this.element.domNode,re);const D=()=>this.element.domNode.classList.toggle("with-status-bar",this.editor.getOption(_.suggest).showStatusBar);D(),this._disposables.add(o.onDidColorThemeChange(s=>this._onThemeChange(s))),this._onThemeChange(o.getColorTheme()),this._disposables.add(this._list.onMouseDown(s=>this._onListMouseDownOrTap(s))),this._disposables.add(this._list.onTap(s=>this._onListMouseDownOrTap(s))),this._disposables.add(this._list.onDidChangeSelection(s=>this._onListSelection(s))),this._disposables.add(this._list.onDidChangeFocus(s=>this._onListFocus(s))),this._disposables.add(this.editor.onDidChangeCursorSelection(()=>this._onCursorSelectionChanged())),this._disposables.add(this.editor.onDidChangeConfiguration(s=>{s.hasChanged(_.suggest)&&(D(),b()),this._completionModel&&(s.hasChanged(_.fontInfo)||s.hasChanged(_.suggestFontSize)||s.hasChanged(_.suggestLineHeight))&&this._list.splice(0,this._list.length,this._completionModel.items)})),this._ctxSuggestWidgetVisible=L.Visible.bindTo(t),this._ctxSuggestWidgetDetailsVisible=L.DetailsVisible.bindTo(t),this._ctxSuggestWidgetMultipleSuggestions=L.MultipleSuggestions.bindTo(t),this._ctxSuggestWidgetHasFocusedSuggestion=L.HasFocusedSuggestion.bindTo(t),this._disposables.add(d.addStandardDisposableListener(this._details.widget.domNode,"keydown",s=>{this._onDetailsKeydown.fire(s)})),this._disposables.add(this.editor.onMouseDown(s=>this._onEditorMouseDown(s)))}static LOADING_MESSAGE=r.localize("suggestWidget.loading","Loading...");static NO_SUGGESTIONS_MESSAGE=r.localize("suggestWidget.noSuggestions","No suggestions.");_state=0;_isAuto=!1;_loadingTimeout;_pendingLayout=new x;_pendingShowDetails=new x;_currentSuggestionDetails;_focusedItem;_ignoreFocusEvents=!1;_completionModel;_cappedHeight;_forceRenderingAbove=!1;_explainMode=!1;element;_messageElement;_listElement;_list;_status;_details;_contentWidget;_persistedSize;_ctxSuggestWidgetVisible;_ctxSuggestWidgetDetailsVisible;_ctxSuggestWidgetMultipleSuggestions;_ctxSuggestWidgetHasFocusedSuggestion;_showTimeout=new k;_disposables=new R;_onDidSelect=new M;_onDidFocus=new M;_onDidHide=new C;_onDidShow=new C;onDidSelect=this._onDidSelect.event;onDidFocus=this._onDidFocus.event;onDidHide=this._onDidHide.event;onDidShow=this._onDidShow.event;_onDetailsKeydown=new C;onDetailsKeyDown=this._onDetailsKeydown.event;dispose(){this._details.widget.dispose(),this._details.dispose(),this._list.dispose(),this._status.dispose(),this._disposables.dispose(),this._loadingTimeout?.dispose(),this._pendingLayout.dispose(),this._pendingShowDetails.dispose(),this._showTimeout.dispose(),this._contentWidget.dispose(),this.element.dispose()}_onEditorMouseDown(e){this._details.widget.domNode.contains(e.target.element)?this._details.widget.domNode.focus():this.element.domNode.contains(e.target.element)&&this.editor.focus()}_onCursorSelectionChanged(){this._state!==0&&this._contentWidget.layout()}_onListMouseDownOrTap(e){typeof e.element>"u"||typeof e.index>"u"||(e.browserEvent.preventDefault(),e.browserEvent.stopPropagation(),this._select(e.element,e.index))}_onListSelection(e){e.elements.length&&this._select(e.elements[0],e.indexes[0])}_select(e,i){const t=this._completionModel;t&&(this._onDidSelect.fire({item:e,index:i,model:t}),this.editor.focus())}_onThemeChange(e){this._details.widget.borderWidth=ne(e.type)?2:1}_onListFocus(e){if(this._ignoreFocusEvents)return;if(this._state===5&&this._setState(3),!e.elements.length){this._currentSuggestionDetails&&(this._currentSuggestionDetails.cancel(),this._currentSuggestionDetails=void 0,this._focusedItem=void 0),this.editor.setAriaOptions({activeDescendant:void 0}),this._ctxSuggestWidgetHasFocusedSuggestion.set(!1);return}if(!this._completionModel)return;this._ctxSuggestWidgetHasFocusedSuggestion.set(!0);const i=e.elements[0],t=e.indexes[0];i!==this._focusedItem&&(this._currentSuggestionDetails?.cancel(),this._currentSuggestionDetails=void 0,this._focusedItem=i,this._list.reveal(t),this._currentSuggestionDetails=O(async o=>{const a=F(()=>{this._isDetailsVisible()&&this._showDetails(!0,!1)},250),h=o.onCancellationRequested(()=>a.dispose());try{return await i.resolve(o)}finally{a.dispose(),h.dispose()}}),this._currentSuggestionDetails.then(()=>{t>=this._list.length||i!==this._list.element(t)||(this._ignoreFocusEvents=!0,this._list.splice(t,1,[i]),this._list.setFocus([t]),this._ignoreFocusEvents=!1,this._isDetailsVisible()?this._showDetails(!1,!1):this.element.domNode.classList.remove("docs-side"),this.editor.setAriaOptions({activeDescendant:ue(t)}))}).catch(B)),this._onDidFocus.fire({item:i,index:t,model:this._completionModel})}_setState(e){if(this._state!==e)switch(this._state=e,this.element.domNode.classList.toggle("frozen",e===4),this.element.domNode.classList.remove("message"),e){case 0:d.hide(this._messageElement,this._listElement,this._status.element),this._details.hide(!0),this._status.hide(),this._contentWidget.hide(),this._ctxSuggestWidgetVisible.reset(),this._ctxSuggestWidgetMultipleSuggestions.reset(),this._ctxSuggestWidgetHasFocusedSuggestion.reset(),this._showTimeout.cancel(),this.element.domNode.classList.remove("visible"),this._list.splice(0,this._list.length),this._focusedItem=void 0,this._cappedHeight=void 0,this._explainMode=!1;break;case 1:this.element.domNode.classList.add("message"),this._messageElement.textContent=p.LOADING_MESSAGE,d.hide(this._listElement,this._status.element),d.show(this._messageElement),this._details.hide(),this._show(),this._focusedItem=void 0,P(p.LOADING_MESSAGE);break;case 2:this.element.domNode.classList.add("message"),this._messageElement.textContent=p.NO_SUGGESTIONS_MESSAGE,d.hide(this._listElement,this._status.element),d.show(this._messageElement),this._details.hide(),this._show(),this._focusedItem=void 0,P(p.NO_SUGGESTIONS_MESSAGE);break;case 3:d.hide(this._messageElement),d.show(this._listElement,this._status.element),this._show();break;case 4:d.hide(this._messageElement),d.show(this._listElement,this._status.element),this._show();break;case 5:d.hide(this._messageElement),d.show(this._listElement,this._status.element),this._details.show(),this._show(),this._details.widget.focus();break}}_show(){this._status.show(),this._contentWidget.show(),this._layout(this._persistedSize.restore()),this._ctxSuggestWidgetVisible.set(!0),this._showTimeout.cancelAndSet(()=>{this.element.domNode.classList.add("visible"),this._onDidShow.fire(this)},100)}showTriggered(e,i){this._state===0&&(this._contentWidget.setPosition(this.editor.getPosition()),this._isAuto=!!e,this._isAuto||(this._loadingTimeout=F(()=>this._setState(1),i)))}showSuggestions(e,i,t,o,a){if(this._contentWidget.setPosition(this.editor.getPosition()),this._loadingTimeout?.dispose(),this._currentSuggestionDetails?.cancel(),this._currentSuggestionDetails=void 0,this._completionModel!==e&&(this._completionModel=e),t&&this._state!==2&&this._state!==0){this._setState(4);return}const h=this._completionModel.items.length,n=h===0;if(this._ctxSuggestWidgetMultipleSuggestions.set(h>1),n){this._setState(o?0:2),this._completionModel=void 0;return}this._focusedItem=void 0,this._onDidFocus.pause(),this._onDidSelect.pause();try{this._list.splice(0,this._list.length,this._completionModel.items),this._setState(t?4:3),this._list.reveal(i,0),this._list.setFocus(a?[]:[i])}finally{this._onDidFocus.resume(),this._onDidSelect.resume()}this._pendingLayout.value=d.runAtThisOrScheduleAtNextAnimationFrame(d.getWindow(this.element.domNode),()=>{this._pendingLayout.clear(),this._layout(this.element.size),this._details.widget.domNode.classList.remove("focused")})}focusSelected(){this._list.length>0&&this._list.setFocus([0])}selectNextPage(){switch(this._state){case 0:return!1;case 5:return this._details.widget.pageDown(),!0;case 1:return!this._isAuto;default:return this._list.focusNextPage(),!0}}selectNext(){switch(this._state){case 0:return!1;case 1:return!this._isAuto;default:return this._list.focusNext(1,!0),!0}}selectLast(){switch(this._state){case 0:return!1;case 5:return this._details.widget.scrollBottom(),!0;case 1:return!this._isAuto;default:return this._list.focusLast(),!0}}selectPreviousPage(){switch(this._state){case 0:return!1;case 5:return this._details.widget.pageUp(),!0;case 1:return!this._isAuto;default:return this._list.focusPreviousPage(),!0}}selectPrevious(){switch(this._state){case 0:return!1;case 1:return!this._isAuto;default:return this._list.focusPrevious(1,!0),!1}}selectFirst(){switch(this._state){case 0:return!1;case 5:return this._details.widget.scrollTop(),!0;case 1:return!this._isAuto;default:return this._list.focusFirst(),!0}}getFocusedItem(){if(this._state!==0&&this._state!==2&&this._state!==1&&this._completionModel&&this._list.getFocus().length>0)return{item:this._list.getFocusedElements()[0],index:this._list.getFocus()[0],model:this._completionModel}}toggleDetailsFocus(){this._state===5?(this._list.setFocus(this._list.getFocus()),this._setState(3)):this._state===3&&(this._setState(5),this._isDetailsVisible()?this._details.widget.focus():this.toggleDetails(!0))}toggleDetails(e=!1){this._isDetailsVisible()?(this._pendingShowDetails.clear(),this._ctxSuggestWidgetDetailsVisible.set(!1),this._setDetailsVisible(!1),this._details.hide(),this.element.domNode.classList.remove("shows-details")):(le(this._list.getFocusedElements()[0])||this._explainMode)&&(this._state===3||this._state===5||this._state===4)&&(this._ctxSuggestWidgetDetailsVisible.set(!0),this._setDetailsVisible(!0),this._showDetails(!1,e))}_showDetails(e,i){this._pendingShowDetails.value=d.runAtThisOrScheduleAtNextAnimationFrame(d.getWindow(this.element.domNode),()=>{this._pendingShowDetails.clear(),this._details.show();let t=!1;e?this._details.widget.renderLoading():this._details.widget.renderItem(this._list.getFocusedElements()[0],this._explainMode),this._details.widget.isEmpty?this._details.hide():(this._positionDetails(),this.element.domNode.classList.add("shows-details"),i&&(this._details.widget.focus(),t=!0)),t||this.editor.focus()})}toggleExplainMode(){this._list.getFocusedElements()[0]&&(this._explainMode=!this._explainMode,this._isDetailsVisible()?this._showDetails(!1,!1):this.toggleDetails())}resetPersistedSize(){this._persistedSize.reset()}hideWidget(){this._pendingLayout.clear(),this._pendingShowDetails.clear(),this._loadingTimeout?.dispose(),this._setState(0),this._onDidHide.fire(this),this.element.clearSashHoverState();const e=this._persistedSize.restore(),i=Math.ceil(this.getLayoutInfo().itemHeight*4.3);e&&e.height<i&&this._persistedSize.store(e.with(void 0,i))}isFrozen(){return this._state===4}_afterRender(e){if(e===null){this._isDetailsVisible()&&this._details.hide();return}this._state===2||this._state===1||(this._isDetailsVisible()&&!this._details.widget.isEmpty&&this._details.show(),this._positionDetails())}_layout(e){if(!this.editor.hasModel()||!this.editor.getDomNode())return;const i=d.getClientArea(this.element.domNode.ownerDocument.body),t=this.getLayoutInfo();e||(e=t.defaultSize);let o=e.height,a=e.width;if(this._status.element.style.height=`${t.itemHeight}px`,this._state===2||this._state===1)o=t.itemHeight+t.borderHeight,a=t.defaultSize.width/2,this.element.enableSashes(!1,!1,!1,!1),this.element.minSize=this.element.maxSize=new d.Dimension(a,o),this._contentWidget.setPreference(W.BELOW);else{const h=i.width-t.borderHeight-2*t.horizontalPadding;a>h&&(a=h);const n=this._completionModel?this._completionModel.stats.pLabelLen*t.typicalHalfwidthCharacterWidth:a,S=t.statusBarHeight+this._list.contentHeight+t.borderHeight,b=t.itemHeight+t.statusBarHeight,w=d.getDomNodePagePosition(this.editor.getDomNode()),D=this.editor.getScrolledVisiblePosition(this.editor.getPosition()),s=w.top+D.top+D.height,l=Math.min(i.height-s-t.verticalPadding,S),u=w.top+D.top-t.verticalPadding,f=Math.min(u,S);let g=Math.min(Math.max(f,l)+t.borderHeight,S);o===this._cappedHeight?.capped&&(o=this._cappedHeight.wanted),o<b&&(o=b),o>g&&(o=g);const c=150;o>l||this._forceRenderingAbove&&u>c?(this._contentWidget.setPreference(W.ABOVE),this.element.enableSashes(!0,!0,!1,!1),g=f):(this._contentWidget.setPreference(W.BELOW),this.element.enableSashes(!1,!0,!0,!1),g=l),this.element.preferredSize=new d.Dimension(n,t.defaultSize.height),this.element.maxSize=new d.Dimension(h,g),this.element.minSize=new d.Dimension(220,b),this._cappedHeight=o===S?{wanted:this._cappedHeight?.wanted??e.height,capped:o}:void 0}this._resize(a,o)}_resize(e,i){const{width:t,height:o}=this.element.maxSize;e=Math.min(t,e),i=Math.min(o,i);const{statusBarHeight:a}=this.getLayoutInfo();this._list.layout(i-a,e),this._listElement.style.height=`${i-a}px`,this.element.layout(i,e),this._contentWidget.layout(),this._positionDetails()}_positionDetails(){this._isDetailsVisible()&&this._details.placeAtAnchor(this.element.domNode,this._contentWidget.getPosition()?.preference[0]===W.BELOW)}getLayoutInfo(){const e=this.editor.getOption(_.fontInfo),i=V(this.editor.getOption(_.suggestLineHeight)||e.lineHeight,8,1e3),t=!this.editor.getOption(_.suggest).showStatusBar||this._state===2||this._state===1?0:i,o=this._details.widget.borderWidth,a=2*o;return{itemHeight:i,statusBarHeight:t,borderWidth:o,borderHeight:a,typicalHalfwidthCharacterWidth:e.typicalHalfwidthCharacterWidth,verticalPadding:22,horizontalPadding:14,defaultSize:new d.Dimension(430,t+12*i+a)}}_isDetailsVisible(){return this._storageService.getBoolean("expandSuggestionDocs",I.PROFILE,!1)}_setDetailsVisible(e){this._storageService.store("expandSuggestionDocs",e,I.PROFILE,z.USER)}forceRenderingAbove(){this._forceRenderingAbove||(this._forceRenderingAbove=!0,this._layout(this._persistedSize.restore()))}stopForceRenderingAbove(){this._forceRenderingAbove=!1}};p=H([y(1,J),y(2,$),y(3,de),y(4,q)],p);class ve{constructor(e,i){this._widget=e;this._editor=i}allowEditorOverflow=!0;suppressMouseDown=!1;_position;_preference;_preferenceLocked=!1;_added=!1;_hidden=!1;dispose(){this._added&&(this._added=!1,this._editor.removeContentWidget(this))}getId(){return"editor.widget.suggestWidget"}getDomNode(){return this._widget.element.domNode}show(){this._hidden=!1,this._added||(this._added=!0,this._editor.addContentWidget(this))}hide(){this._hidden||(this._hidden=!0,this.layout())}layout(){this._editor.layoutContentWidget(this)}getPosition(){return this._hidden||!this._position||!this._preference?null:{position:this._position,preference:[this._preference]}}beforeRender(){const{height:e,width:i}=this._widget.element.size,{borderWidth:t,horizontalPadding:o}=this._widget.getLayoutInfo();return new d.Dimension(i+2*t+o,e+2*t)}afterRender(e){this._widget._afterRender(e)}setPreference(e){this._preferenceLocked||(this._preference=e)}lockPreference(){this._preferenceLocked=!0}unlockPreference(){this._preferenceLocked=!1}setPosition(e){this._position=e}}export{ve as SuggestContentWidget,p as SuggestWidget,pe as editorSuggestWidgetSelectedBackground};
