var Q=Object.defineProperty;var G=Object.getOwnPropertyDescriptor;var k=(f,d,e,t)=>{for(var i=t>1?void 0:t?G(d,e):d,n=f.length-1,a;n>=0;n--)(a=f[n])&&(i=(t?a(d,e,i):a(i))||i);return t&&i&&Q(d,e,i),i},N=(f,d)=>(e,t)=>d(e,t,f);import"./textAreaEditContext.css";import*as A from"../../../../../base/browser/browser.js";import{createFastDomNode as D}from"../../../../../base/browser/fastDomNode.js";import{MOUSE_CURSOR_TEXT_CSS_CLASS_NAME as O}from"../../../../../base/browser/ui/mouseCursor/mouseCursor.js";import{Color as ee}from"../../../../../base/common/color.js";import{IME as z}from"../../../../../base/common/ime.js";import*as L from"../../../../../base/common/platform.js";import*as te from"../../../../../base/common/strings.js";import*as ie from"../../../../../nls.js";import{AccessibilitySupport as w}from"../../../../../platform/accessibility/common/accessibility.js";import{IInstantiationService as oe}from"../../../../../platform/instantiation/common/instantiation.js";import{IKeybindingService as ne}from"../../../../../platform/keybinding/common/keybinding.js";import{EditorOption as s,EditorOptions as re,RenderLineNumbersType as se}from"../../../../common/config/editorOptions.js";import{Position as R}from"../../../../common/core/position.js";import{Range as W}from"../../../../common/core/range.js";import{Selection as B}from"../../../../common/core/selection.js";import{WordCharacterClass as H,getMapForWordSeparators as $}from"../../../../common/core/wordCharacterClassifier.js";import{ScrollType as ae}from"../../../../common/editorCommon.js";import{ColorId as le}from"../../../../common/encodedTokenAttributes.js";import{TokenizationRegistry as he}from"../../../../common/languages.js";import{EndOfLinePreference as K}from"../../../../common/model.js";import*as de from"../../../../common/viewEvents.js";import{applyFontInfo as U}from"../../../config/domFontInfo.js";import{PartFingerprint as ce,PartFingerprints as ue}from"../../../view/viewPart.js";import{LineNumbersOverlay as pe}from"../../../viewParts/lineNumbers/lineNumbers.js";import{Margin as fe}from"../../../viewParts/margin/margin.js";import{getDataToCopy as me}from"../clipboardUtils.js";import{AbstractEditContext as ge}from"../editContextUtils.js";import{PagedScreenReaderStrategy as be,ariaLabelForScreenReaderContent as j,newlinecount as q}from"../screenReaderUtils.js";import{TextAreaInput as _e,TextAreaWrapper as xe}from"./textAreaEditContextInput.js";import{TextAreaState as C,_debugComposition as Z}from"./textAreaEditContextState.js";class ve{constructor(d,e,t,i,n){this._context=d;this.modelLineNumber=e;this.distanceToModelLineStart=t;this.widthOfHiddenLineTextBefore=i;this.distanceToModelLineEnd=n}_visibleTextAreaBrand=void 0;startPosition=null;endPosition=null;visibleTextareaStart=null;visibleTextareaEnd=null;_previousPresentation=null;prepareRender(d){const e=new R(this.modelLineNumber,this.distanceToModelLineStart+1),t=new R(this.modelLineNumber,this._context.viewModel.model.getLineMaxColumn(this.modelLineNumber)-this.distanceToModelLineEnd);this.startPosition=this._context.viewModel.coordinatesConverter.convertModelPositionToViewPosition(e),this.endPosition=this._context.viewModel.coordinatesConverter.convertModelPositionToViewPosition(t),this.startPosition.lineNumber===this.endPosition.lineNumber?(this.visibleTextareaStart=d.visibleRangeForPosition(this.startPosition),this.visibleTextareaEnd=d.visibleRangeForPosition(this.endPosition)):(this.visibleTextareaStart=null,this.visibleTextareaEnd=null)}definePresentation(d){return this._previousPresentation||(d?this._previousPresentation=d:this._previousPresentation={foreground:le.DefaultForeground,italic:!1,bold:!1,underline:!1,strikethrough:!1}),this._previousPresentation}}const V=A.isFirefox;let M=class extends ge{constructor(e,t,i,n,a){super(e);this._keybindingService=n;this._instantiationService=a;this._viewController=t,this._visibleRangeProvider=i,this._scrollLeft=0,this._scrollTop=0;const l=this._context.configuration.options,p=l.get(s.layoutInfo);this._setAccessibilityOptions(l),this._contentLeft=p.contentLeft,this._contentWidth=p.contentWidth,this._contentHeight=p.height,this._fontInfo=l.get(s.fontInfo),this._lineHeight=l.get(s.lineHeight),this._emptySelectionClipboard=l.get(s.emptySelectionClipboard),this._copyWithSyntaxHighlighting=l.get(s.copyWithSyntaxHighlighting),this._visibleTextArea=null,this._selections=[new B(1,1,1,1)],this._modelSelections=[new B(1,1,1,1)],this._lastRenderPosition=null,this.textArea=D(document.createElement("textarea")),ue.write(this.textArea,ce.TextArea),this.textArea.setClassName(`inputarea ${O}`),this.textArea.setAttribute("wrap",this._textAreaWrapping&&!this._visibleTextArea?"on":"off");const{tabSize:b}=this._context.viewModel.model.getOptions();this.textArea.domNode.style.tabSize=`${b*this._fontInfo.spaceWidth}px`,this.textArea.setAttribute("autocorrect","off"),this.textArea.setAttribute("autocapitalize","off"),this.textArea.setAttribute("autocomplete","off"),this.textArea.setAttribute("spellcheck","false"),this.textArea.setAttribute("aria-label",j(l,this._keybindingService)),this.textArea.setAttribute("aria-required",l.get(s.ariaRequired)?"true":"false"),this.textArea.setAttribute("tabindex",String(l.get(s.tabIndex))),this.textArea.setAttribute("role","textbox"),this.textArea.setAttribute("aria-roledescription",ie.localize("editor","editor")),this.textArea.setAttribute("aria-multiline","true"),this.textArea.setAttribute("aria-autocomplete",l.get(s.readOnly)?"none":"both"),this._ensureReadOnlyAttribute(),this.textAreaCover=D(document.createElement("div")),this.textAreaCover.setPosition("absolute");const g={getLineCount:()=>this._context.viewModel.getLineCount(),getLineMaxColumn:o=>this._context.viewModel.getLineMaxColumn(o),getValueInRange:(o,r)=>this._context.viewModel.getValueInRange(o,r),getValueLengthInRange:(o,r)=>this._context.viewModel.getValueLengthInRange(o,r),modifyPosition:(o,r)=>this._context.viewModel.modifyPosition(o,r)},m={getDataToCopy:()=>me(this._context.viewModel,this._modelSelections,this._emptySelectionClipboard,this._copyWithSyntaxHighlighting),getScreenReaderContent:()=>{if(this._accessibilitySupport===w.Disabled){const r=this._selections[0];if(L.isMacintosh&&r.isEmpty()){const h=r.getStartPosition();let c=this._getWordBeforePosition(h);if(c.length===0&&(c=this._getCharacterBeforePosition(h)),c.length>0)return new C(c,c.length,c.length,W.fromPositions(h),0)}if(L.isMacintosh&&!r.isEmpty()&&g.getValueLengthInRange(r,K.TextDefined)<500){const h=g.getValueInRange(r,K.TextDefined);return new C(h,0,h.length,r,0)}if(A.isSafari&&!r.isEmpty()){const h="vscode-placeholder";return new C(h,0,h.length,null,void 0)}return C.EMPTY}if(A.isAndroid){const r=this._selections[0];if(r.isEmpty()){const u=r.getStartPosition(),[h,c]=this._getAndroidWordAtPosition(u);if(h.length>0)return new C(h,c,c,W.fromPositions(u),0)}return C.EMPTY}const o=be.fromEditorSelection(g,this._selections[0],this._accessibilityPageSize,this._accessibilitySupport===w.Unknown);return C.fromScreenReaderContentState(o)},deduceModelPosition:(o,r,u)=>this._context.viewModel.deduceModelPositionRelativeToViewPosition(o,r,u)},_=this._register(new xe(this.textArea.domNode));this._textAreaInput=this._register(this._instantiationService.createInstance(_e,m,_,L.OS,{isAndroid:A.isAndroid,isChrome:A.isChrome,isFirefox:A.isFirefox,isSafari:A.isSafari})),this._register(this._textAreaInput.onKeyDown(o=>{this._viewController.emitKeyDown(o)})),this._register(this._textAreaInput.onKeyUp(o=>{this._viewController.emitKeyUp(o)})),this._register(this._textAreaInput.onPaste(o=>{let r=!1,u=null,h=null;o.metadata&&(r=this._emptySelectionClipboard&&!!o.metadata.isFromEmptySelection,u=typeof o.metadata.multicursorText<"u"?o.metadata.multicursorText:null,h=o.metadata.mode),this._viewController.paste(o.text,r,u,h)})),this._register(this._textAreaInput.onCut(()=>{this._viewController.cut()})),this._register(this._textAreaInput.onType(o=>{o.replacePrevCharCnt||o.replaceNextCharCnt||o.positionDelta?this._viewController.compositionType(o.text,o.replacePrevCharCnt,o.replaceNextCharCnt,o.positionDelta):this._viewController.type(o.text)})),this._register(this._textAreaInput.onSelectionChangeRequest(o=>{this._viewController.setSelection(o)})),this._register(this._textAreaInput.onCompositionStart(o=>{const r=this.textArea.domNode,u=this._modelSelections[0],{distanceToModelLineStart:h,widthOfHiddenTextBefore:c}=(()=>{const y=r.value.substring(0,Math.min(r.selectionStart,r.selectionEnd)),P=y.lastIndexOf(`
`),x=y.substring(P+1),T=x.lastIndexOf("	"),E=x.length-T-1,v=u.getStartPosition(),I=Math.min(v.column-1,E),F=v.column-1-I,Y=x.substring(0,x.length-I),{tabSize:X}=this._context.viewModel.model.getOptions(),J=Ae(this.textArea.domNode.ownerDocument,Y,this._fontInfo,X);return{distanceToModelLineStart:F,widthOfHiddenTextBefore:J}})(),{distanceToModelLineEnd:S}=(()=>{const y=r.value.substring(Math.max(r.selectionStart,r.selectionEnd)),P=y.indexOf(`
`),x=P===-1?y:y.substring(0,P),T=x.indexOf("	"),E=T===-1?x.length:x.length-T-1,v=u.getEndPosition(),I=Math.min(this._context.viewModel.model.getLineMaxColumn(v.lineNumber)-v.column,E);return{distanceToModelLineEnd:this._context.viewModel.model.getLineMaxColumn(v.lineNumber)-v.column-I}})();this._context.viewModel.revealRange("keyboard",!0,W.fromPositions(this._selections[0].getStartPosition()),de.VerticalRevealType.Simple,ae.Immediate),this._visibleTextArea=new ve(this._context,u.startLineNumber,h,c,S),this.textArea.setAttribute("wrap",this._textAreaWrapping&&!this._visibleTextArea?"on":"off"),this._visibleTextArea.prepareRender(this._visibleRangeProvider),this._render(),this.textArea.setClassName(`inputarea ${O} ime-input`),this._viewController.compositionStart(),this._context.viewModel.onCompositionStart()})),this._register(this._textAreaInput.onCompositionUpdate(o=>{this._visibleTextArea&&(this._visibleTextArea.prepareRender(this._visibleRangeProvider),this._render())})),this._register(this._textAreaInput.onCompositionEnd(()=>{this._visibleTextArea=null,this.textArea.setAttribute("wrap",this._textAreaWrapping&&!this._visibleTextArea?"on":"off"),this._render(),this.textArea.setClassName(`inputarea ${O}`),this._viewController.compositionEnd(),this._context.viewModel.onCompositionEnd()})),this._register(this._textAreaInput.onFocus(()=>{this._context.viewModel.setHasFocus(!0)})),this._register(this._textAreaInput.onBlur(()=>{this._context.viewModel.setHasFocus(!1)})),this._register(z.onDidChange(()=>{this._ensureReadOnlyAttribute()}))}_viewController;_visibleRangeProvider;_scrollLeft;_scrollTop;_accessibilitySupport;_accessibilityPageSize;_textAreaWrapping;_textAreaWidth;_contentLeft;_contentWidth;_contentHeight;_fontInfo;_lineHeight;_emptySelectionClipboard;_copyWithSyntaxHighlighting;_visibleTextArea;_selections;_modelSelections;_lastRenderPosition;textArea;textAreaCover;_textAreaInput;get domNode(){return this.textArea}appendTo(e){e.appendChild(this.textArea),e.appendChild(this.textAreaCover)}writeScreenReaderContent(e){this._textAreaInput.writeNativeTextAreaContent(e)}dispose(){super.dispose(),this.textArea.domNode.remove(),this.textAreaCover.domNode.remove()}_getAndroidWordAtPosition(e){const t='`~!@#$%^&*()-=+[{]}\\|;:",.<>/?',i=this._context.viewModel.getLineContent(e.lineNumber),n=$(t,[]);let a=!0,l=e.column,p=!0,b=e.column,g=0;for(;g<50&&(a||p);){if(a&&l<=1&&(a=!1),a){const m=i.charCodeAt(l-2);n.get(m)!==H.Regular?a=!1:l--}if(p&&b>i.length&&(p=!1),p){const m=i.charCodeAt(b-1);n.get(m)!==H.Regular?p=!1:b++}g++}return[i.substring(l-1,b-1),e.column-l]}_getWordBeforePosition(e){const t=this._context.viewModel.getLineContent(e.lineNumber),i=$(this._context.configuration.options.get(s.wordSeparators),[]);let n=e.column,a=0;for(;n>1;){const l=t.charCodeAt(n-2);if(i.get(l)!==H.Regular||a>50)return t.substring(n-1,e.column-1);a++,n--}return t.substring(0,e.column-1)}_getCharacterBeforePosition(e){if(e.column>1){const i=this._context.viewModel.getLineContent(e.lineNumber).charAt(e.column-2);if(!te.isHighSurrogate(i.charCodeAt(0)))return i}return""}_setAccessibilityOptions(e){this._accessibilitySupport=e.get(s.accessibilitySupport);const t=e.get(s.accessibilityPageSize);this._accessibilitySupport===w.Enabled&&t===re.accessibilityPageSize.defaultValue?this._accessibilityPageSize=500:this._accessibilityPageSize=t;const n=e.get(s.layoutInfo).wrappingColumn;if(n!==-1&&this._accessibilitySupport!==w.Disabled){const a=e.get(s.fontInfo);this._textAreaWrapping=!0,this._textAreaWidth=Math.round(n*a.typicalHalfwidthCharacterWidth)}else this._textAreaWrapping=!1,this._textAreaWidth=V?0:1}onConfigurationChanged(e){const t=this._context.configuration.options,i=t.get(s.layoutInfo);this._setAccessibilityOptions(t),this._contentLeft=i.contentLeft,this._contentWidth=i.contentWidth,this._contentHeight=i.height,this._fontInfo=t.get(s.fontInfo),this._lineHeight=t.get(s.lineHeight),this._emptySelectionClipboard=t.get(s.emptySelectionClipboard),this._copyWithSyntaxHighlighting=t.get(s.copyWithSyntaxHighlighting),this.textArea.setAttribute("wrap",this._textAreaWrapping&&!this._visibleTextArea?"on":"off");const{tabSize:n}=this._context.viewModel.model.getOptions();return this.textArea.domNode.style.tabSize=`${n*this._fontInfo.spaceWidth}px`,this.textArea.setAttribute("aria-label",j(t,this._keybindingService)),this.textArea.setAttribute("aria-required",t.get(s.ariaRequired)?"true":"false"),this.textArea.setAttribute("tabindex",String(t.get(s.tabIndex))),(e.hasChanged(s.domReadOnly)||e.hasChanged(s.readOnly))&&this._ensureReadOnlyAttribute(),e.hasChanged(s.accessibilitySupport)&&this._textAreaInput.writeNativeTextAreaContent("strategy changed"),!0}onCursorStateChanged(e){return this._selections=e.selections.slice(0),this._modelSelections=e.modelSelections.slice(0),this._textAreaInput.writeNativeTextAreaContent("selection changed"),!0}onDecorationsChanged(e){return!0}onFlushed(e){return!0}onLinesChanged(e){return!0}onLinesDeleted(e){return!0}onLinesInserted(e){return!0}onScrollChanged(e){return this._scrollLeft=e.scrollLeft,this._scrollTop=e.scrollTop,!0}onZonesChanged(e){return!0}isFocused(){return this._textAreaInput.isFocused()}focus(){this._textAreaInput.focusTextArea()}refreshFocusState(){this._textAreaInput.refreshFocusState()}getLastRenderData(){return this._lastRenderPosition}setAriaOptions(e){e.activeDescendant?(this.textArea.setAttribute("aria-haspopup","true"),this.textArea.setAttribute("aria-autocomplete","list"),this.textArea.setAttribute("aria-activedescendant",e.activeDescendant)):(this.textArea.setAttribute("aria-haspopup","false"),this.textArea.setAttribute("aria-autocomplete","both"),this.textArea.removeAttribute("aria-activedescendant")),e.role&&this.textArea.setAttribute("role",e.role)}_ensureReadOnlyAttribute(){const e=this._context.configuration.options;!z.enabled||e.get(s.domReadOnly)&&e.get(s.readOnly)?this.textArea.setAttribute("readonly","true"):this.textArea.removeAttribute("readonly")}_primaryCursorPosition=new R(1,1);_primaryCursorVisibleRange=null;prepareRender(e){this._primaryCursorPosition=new R(this._selections[0].positionLineNumber,this._selections[0].positionColumn),this._primaryCursorVisibleRange=e.visibleRangeForPosition(this._primaryCursorPosition),this._visibleTextArea?.prepareRender(e)}render(e){this._textAreaInput.writeNativeTextAreaContent("render"),this._render()}_render(){if(this._visibleTextArea){const i=this._visibleTextArea.visibleTextareaStart,n=this._visibleTextArea.visibleTextareaEnd,a=this._visibleTextArea.startPosition,l=this._visibleTextArea.endPosition;if(a&&l&&i&&n&&n.left>=this._scrollLeft&&i.left<=this._scrollLeft+this._contentWidth){const p=this._context.viewLayout.getVerticalOffsetForLineNumber(this._primaryCursorPosition.lineNumber)-this._scrollTop,b=q(this.textArea.domNode.value.substr(0,this.textArea.domNode.selectionStart));let g=this._visibleTextArea.widthOfHiddenLineTextBefore,m=this._contentLeft+i.left-this._scrollLeft,_=n.left-i.left+1;if(m<this._contentLeft){const S=this._contentLeft-m;m+=S,g+=S,_-=S}_>this._contentWidth&&(_=this._contentWidth);const o=this._context.viewModel.getViewLineData(a.lineNumber),r=o.tokens.findTokenIndexAtOffset(a.column-1),u=o.tokens.findTokenIndexAtOffset(l.column-1),h=r===u,c=this._visibleTextArea.definePresentation(h?o.tokens.getPresentation(r):null);this.textArea.domNode.scrollTop=b*this._lineHeight,this.textArea.domNode.scrollLeft=g,this._doRender({lastRenderPosition:null,top:p,left:m,width:_,height:this._lineHeight,useCover:!1,color:(he.getColorMap()||[])[c.foreground],italic:c.italic,bold:c.bold,underline:c.underline,strikethrough:c.strikethrough})}return}if(!this._primaryCursorVisibleRange){this._renderAtTopLeft();return}const e=this._contentLeft+this._primaryCursorVisibleRange.left-this._scrollLeft;if(e<this._contentLeft||e>this._contentLeft+this._contentWidth){this._renderAtTopLeft();return}const t=this._context.viewLayout.getVerticalOffsetForLineNumber(this._selections[0].positionLineNumber)-this._scrollTop;if(t<0||t>this._contentHeight){this._renderAtTopLeft();return}if(L.isMacintosh||this._accessibilitySupport===w.Enabled){this._doRender({lastRenderPosition:this._primaryCursorPosition,top:t,left:this._textAreaWrapping?this._contentLeft:e,width:this._textAreaWidth,height:this._lineHeight,useCover:!1}),this.textArea.domNode.scrollLeft=this._primaryCursorVisibleRange.left;const i=this._textAreaInput.textAreaState.newlineCountBeforeSelection??q(this.textArea.domNode.value.substring(0,this.textArea.domNode.selectionStart));this.textArea.domNode.scrollTop=i*this._lineHeight;return}this._doRender({lastRenderPosition:this._primaryCursorPosition,top:t,left:this._textAreaWrapping?this._contentLeft:e,width:this._textAreaWidth,height:V?0:1,useCover:!1})}_renderAtTopLeft(){this._doRender({lastRenderPosition:null,top:0,left:0,width:this._textAreaWidth,height:V?0:1,useCover:!0})}_doRender(e){this._lastRenderPosition=e.lastRenderPosition;const t=this.textArea,i=this.textAreaCover;U(t,this._fontInfo),t.setTop(e.top),t.setLeft(e.left),t.setWidth(e.width),t.setHeight(e.height),t.setColor(e.color?ee.Format.CSS.formatHex(e.color):""),t.setFontStyle(e.italic?"italic":""),e.bold&&t.setFontWeight("bold"),t.setTextDecoration(`${e.underline?" underline":""}${e.strikethrough?" line-through":""}`),i.setTop(e.useCover?e.top:0),i.setLeft(e.useCover?e.left:0),i.setWidth(e.useCover?e.width:0),i.setHeight(e.useCover?e.height:0);const n=this._context.configuration.options;n.get(s.glyphMargin)?i.setClassName("monaco-editor-background textAreaCover "+fe.OUTER_CLASS_NAME):n.get(s.lineNumbers).renderType!==se.Off?i.setClassName("monaco-editor-background textAreaCover "+pe.CLASS_NAME):i.setClassName("monaco-editor-background textAreaCover")}};M=k([N(3,ne),N(4,oe)],M);function Ae(f,d,e,t){if(d.length===0)return 0;const i=f.createElement("div");i.style.position="absolute",i.style.top="-50000px",i.style.width="50000px";const n=f.createElement("span");U(n,e),n.style.whiteSpace="pre",n.style.tabSize=`${t*e.spaceWidth}px`,n.append(d),i.appendChild(n),f.body.appendChild(i);const a=n.offsetWidth;return i.remove(),a}export{M as TextAreaEditContext};
