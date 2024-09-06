var K=Object.defineProperty;var G=Object.getOwnPropertyDescriptor;var w=(f,e,t,n)=>{for(var o=n>1?void 0:n?G(e,t):e,a=f.length-1,i;a>=0;a--)(i=f[a])&&(o=(n?i(e,t,o):i(o))||o);return n&&o&&K(e,t,o),o},_=(f,e)=>(t,n)=>e(t,n,f);import{isHTMLElement as z,ModifierKeyEmitter as X}from"../../../../../vs/base/browser/dom.js";import{isNonEmptyArray as N}from"../../../../../vs/base/common/arrays.js";import{RunOnceScheduler as V}from"../../../../../vs/base/common/async.js";import{CancellationToken as P,CancellationTokenSource as A}from"../../../../../vs/base/common/cancellation.js";import{onUnexpectedError as q}from"../../../../../vs/base/common/errors.js";import{DisposableStore as x,toDisposable as L}from"../../../../../vs/base/common/lifecycle.js";import{LRUCache as J}from"../../../../../vs/base/common/map.js";import"../../../../../vs/base/common/range.js";import{assertType as O}from"../../../../../vs/base/common/types.js";import{URI as Q}from"../../../../../vs/base/common/uri.js";import{MouseTargetType as Y}from"../../../../../vs/editor/browser/editorBrowser.js";import{DynamicCssRules as Z}from"../../../../../vs/editor/browser/editorDom.js";import{StableEditorScrollState as ee}from"../../../../../vs/editor/browser/stableEditorScroll.js";import{EDITOR_FONT_DEFAULTS as te,EditorOption as D}from"../../../../../vs/editor/common/config/editorOptions.js";import{EditOperation as ie}from"../../../../../vs/editor/common/core/editOperation.js";import{Range as I}from"../../../../../vs/editor/common/core/range.js";import"../../../../../vs/editor/common/editorCommon.js";import*as F from"../../../../../vs/editor/common/languages.js";import{InjectedTextCursorStops as S,TrackedRangeStickiness as ne}from"../../../../../vs/editor/common/model.js";import{ModelDecorationInjectedTextOptions as oe}from"../../../../../vs/editor/common/model/textModel.js";import{ILanguageFeatureDebounceService as ae}from"../../../../../vs/editor/common/services/languageFeatureDebounce.js";import{ILanguageFeaturesService as $}from"../../../../../vs/editor/common/services/languageFeatures.js";import{ITextModelService as se}from"../../../../../vs/editor/common/services/resolverService.js";import{ClickLinkGesture as re}from"../../../../../vs/editor/contrib/gotoSymbol/browser/link/clickLinkGesture.js";import{InlayHintAnchor as de,InlayHintsFragments as U}from"../../../../../vs/editor/contrib/inlayHints/browser/inlayHints.js";import{goToDefinitionWithLocation as le,showGoToContextMenu as ce}from"../../../../../vs/editor/contrib/inlayHints/browser/inlayHintsLocations.js";import{CommandsRegistry as pe,ICommandService as he}from"../../../../../vs/platform/commands/common/commands.js";import{InstantiationType as me,registerSingleton as ue}from"../../../../../vs/platform/instantiation/common/extensions.js";import{createDecorator as fe,IInstantiationService as ge}from"../../../../../vs/platform/instantiation/common/instantiation.js";import{INotificationService as ye,Severity as Ie}from"../../../../../vs/platform/notification/common/notification.js";import*as v from"../../../../../vs/platform/theme/common/colorRegistry.js";import{themeColorFromId as b}from"../../../../../vs/platform/theme/common/themeService.js";class T{_entries=new J(50);get(e){const t=T._key(e);return this._entries.get(t)}set(e,t){const n=T._key(e);this._entries.set(n,t)}static _key(e){return`${e.uri.toString()}/${e.getVersionId()}`}}const j=fe("IInlayHintsCache");ue(j,T,me.Delayed);class B{constructor(e,t){this.item=e;this.index=t}get part(){const e=this.item.hint.label;return typeof e=="string"?{label:e}:e[this.index]}}class _e{constructor(e,t){this.part=e;this.hasTriggerModifier=t}}var ve=(t=>(t[t.Normal=0]="Normal",t[t.Invisible=1]="Invisible",t))(ve||{});let y=class{constructor(e,t,n,o,a,i,r){this._editor=e;this._languageFeaturesService=t;this._inlayHintsCache=o;this._commandService=a;this._notificationService=i;this._instaService=r;this._debounceInfo=n.for(t.inlayHintsProvider,"InlayHint",{min:25}),this._disposables.add(t.inlayHintsProvider.onDidChange(()=>this._update())),this._disposables.add(e.onDidChangeModel(()=>this._update())),this._disposables.add(e.onDidChangeModelLanguage(()=>this._update())),this._disposables.add(e.onDidChangeConfiguration(l=>{l.hasChanged(D.inlayHints)&&this._update()})),this._update()}static ID="editor.contrib.InlayHints";static _MAX_DECORATORS=1500;static _MAX_LABEL_LEN=43;static get(e){return e.getContribution(y.ID)??void 0}_disposables=new x;_sessionDisposables=new x;_debounceInfo;_decorationsMetadata=new Map;_ruleFactory=new Z(this._editor);_activeRenderMode=0;_activeInlayHintPart;dispose(){this._sessionDisposables.dispose(),this._removeAllDecorations(),this._disposables.dispose()}_update(){this._sessionDisposables.clear(),this._removeAllDecorations();const e=this._editor.getOption(D.inlayHints);if(e.enabled==="off")return;const t=this._editor.getModel();if(!t||!this._languageFeaturesService.inlayHintsProvider.has(t))return;if(e.enabled==="on")this._activeRenderMode=0;else{let r,l;e.enabled==="onUnlessPressed"?(r=0,l=1):(r=1,l=0),this._activeRenderMode=r,this._sessionDisposables.add(X.getInstance().event(p=>{if(!this._editor.hasModel())return;const h=p.altKey&&p.ctrlKey&&!(p.shiftKey||p.metaKey)?l:r;if(h!==this._activeRenderMode){this._activeRenderMode=h;const c=this._editor.getModel(),R=this._copyInlayHintsWithCurrentAnchor(c);this._updateHintsDecorators([c.getFullModelRange()],R),i.schedule(0)}}))}const n=this._inlayHintsCache.get(t);n&&this._updateHintsDecorators([t.getFullModelRange()],n),this._sessionDisposables.add(L(()=>{t.isDisposed()||this._cacheHintsForFastRestore(t)}));let o;const a=new Set,i=new V(async()=>{const r=Date.now();o?.dispose(!0),o=new A;const l=t.onWillDispose(()=>o?.cancel());try{const p=o.token,h=await U.create(this._languageFeaturesService.inlayHintsProvider,t,this._getHintsRanges(),p);if(i.delay=this._debounceInfo.update(t,Date.now()-r),p.isCancellationRequested){h.dispose();return}for(const c of h.provider)typeof c.onDidChangeInlayHints=="function"&&!a.has(c)&&(a.add(c),this._sessionDisposables.add(c.onDidChangeInlayHints(()=>{i.isScheduled()||i.schedule()})));this._sessionDisposables.add(h),this._updateHintsDecorators(h.ranges,h.items),this._cacheHintsForFastRestore(t)}catch(p){q(p)}finally{o.dispose(),l.dispose()}},this._debounceInfo.get(t));this._sessionDisposables.add(i),this._sessionDisposables.add(L(()=>o?.dispose(!0))),i.schedule(0),this._sessionDisposables.add(this._editor.onDidScrollChange(r=>{(r.scrollTopChanged||!i.isScheduled())&&i.schedule()})),this._sessionDisposables.add(this._editor.onDidChangeModelContent(r=>{o?.cancel();const l=Math.max(i.delay,1250);i.schedule(l)})),this._sessionDisposables.add(this._installDblClickGesture(()=>i.schedule(0))),this._sessionDisposables.add(this._installLinkGesture()),this._sessionDisposables.add(this._installContextMenu())}_installLinkGesture(){const e=new x,t=e.add(new re(this._editor)),n=new x;return e.add(n),e.add(t.onMouseMoveOrRelevantKeyDown(o=>{const[a]=o,i=this._getInlayHintLabelPart(a),r=this._editor.getModel();if(!i||!r){n.clear();return}const l=new A;n.add(L(()=>l.dispose(!0))),i.item.resolve(l.token),this._activeInlayHintPart=i.part.command||i.part.location?new _e(i,a.hasTriggerModifier):void 0;const p=r.validatePosition(i.item.hint.position).lineNumber,h=new I(p,1,p,r.getLineMaxColumn(p)),c=this._getInlineHintsForRange(h);this._updateHintsDecorators([h],c),n.add(L(()=>{this._activeInlayHintPart=void 0,this._updateHintsDecorators([h],c)}))})),e.add(t.onCancel(()=>n.clear())),e.add(t.onExecute(async o=>{const a=this._getInlayHintLabelPart(o);if(a){const i=a.part;i.location?this._instaService.invokeFunction(le,o,this._editor,i.location):F.Command.is(i.command)&&await this._invokeCommand(i.command,a.item)}})),e}_getInlineHintsForRange(e){const t=new Set;for(const n of this._decorationsMetadata.values())e.containsRange(n.item.anchor.range)&&t.add(n.item);return Array.from(t)}_installDblClickGesture(e){return this._editor.onMouseUp(async t=>{if(t.event.detail!==2)return;const n=this._getInlayHintLabelPart(t);if(n&&(t.event.preventDefault(),await n.item.resolve(P.None),N(n.item.hint.textEdits))){const o=n.item.hint.textEdits.map(a=>ie.replace(I.lift(a.range),a.text));this._editor.executeEdits("inlayHint.default",o),e()}})}_installContextMenu(){return this._editor.onContextMenu(async e=>{if(!z(e.event.target))return;const t=this._getInlayHintLabelPart(e);t&&await this._instaService.invokeFunction(ce,this._editor,e.event.target,t)})}_getInlayHintLabelPart(e){if(e.target.type!==Y.CONTENT_TEXT)return;const t=e.target.detail.injectedText?.options;if(t instanceof oe&&t?.attachedData instanceof B)return t.attachedData}async _invokeCommand(e,t){try{await this._commandService.executeCommand(e.id,...e.arguments??[])}catch(n){this._notificationService.notify({severity:Ie.Error,source:t.provider.displayName,message:n})}}_cacheHintsForFastRestore(e){const t=this._copyInlayHintsWithCurrentAnchor(e);this._inlayHintsCache.set(e,t)}_copyInlayHintsWithCurrentAnchor(e){const t=new Map;for(const[n,o]of this._decorationsMetadata){if(t.has(o.item))continue;const a=e.getDecorationRange(n);if(a){const i=new de(a,o.item.anchor.direction),r=o.item.with({anchor:i});t.set(o.item,r)}}return Array.from(t.values())}_getHintsRanges(){const t=this._editor.getModel(),n=this._editor.getVisibleRangesPlusViewportAboveBelow(),o=[];for(const a of n.sort(I.compareRangesUsingStarts)){const i=t.validateRange(new I(a.startLineNumber-30,a.startColumn,a.endLineNumber+30,a.endColumn));o.length===0||!I.areIntersectingOrTouching(o[o.length-1],i)?o.push(i):o[o.length-1]=I.plusRange(o[o.length-1],i)}return o}_updateHintsDecorators(e,t){const n=[],o=(s,m,d,g,C)=>{const H={content:d,inlineClassNameAffectsLetterSpacing:!0,inlineClassName:m.className,cursorStops:g,attachedData:C};n.push({item:s,classNameRef:m,decoration:{range:s.anchor.range,options:{description:"InlayHint",showIfCollapsed:s.anchor.range.isEmpty(),collapseOnReplaceEdit:!s.anchor.range.isEmpty(),stickiness:ne.AlwaysGrowsWhenTypingAtEdges,[s.anchor.direction]:this._activeRenderMode===0?H:void 0}}})},a=(s,m)=>{const d=this._ruleFactory.createClassNameRef({width:`${i/3|0}px`,display:"inline-block"});o(s,d,"\u200A",m?S.Right:S.None)},{fontSize:i,fontFamily:r,padding:l,isUniform:p}=this._getLayoutInfo(),h="--code-editorInlayHintsFontFamily";this._editor.getContainerDomNode().style.setProperty(h,r);let c={line:0,totalLen:0};for(const s of t){if(c.line!==s.anchor.range.startLineNumber&&(c={line:s.anchor.range.startLineNumber,totalLen:0}),c.totalLen>y._MAX_LABEL_LEN)continue;s.hint.paddingLeft&&a(s,!1);const m=typeof s.hint.label=="string"?[{label:s.hint.label}]:s.hint.label;for(let d=0;d<m.length;d++){const g=m[d],C=d===0,H=d===m.length-1,u={fontSize:`${i}px`,fontFamily:`var(${h}), ${te.fontFamily}`,verticalAlign:p?"baseline":"middle",unicodeBidi:"isolate"};N(s.hint.textEdits)&&(u.cursor="default"),this._fillInColors(u,s.hint),(g.command||g.location)&&this._activeInlayHintPart?.part.item===s&&this._activeInlayHintPart.part.index===d&&(u.textDecoration="underline",this._activeInlayHintPart.hasTriggerModifier&&(u.color=b(v.editorActiveLinkForeground),u.cursor="pointer")),l&&(C&&H?(u.padding=`1px ${Math.max(1,i/4)|0}px`,u.borderRadius=`${i/4|0}px`):C?(u.padding=`1px 0 1px ${Math.max(1,i/4)|0}px`,u.borderRadius=`${i/4|0}px 0 0 ${i/4|0}px`):H?(u.padding=`1px ${Math.max(1,i/4)|0}px 1px 0`,u.borderRadius=`0 ${i/4|0}px ${i/4|0}px 0`):u.padding="1px 0 1px 0");let M=g.label;c.totalLen+=M.length;let E=!1;const k=c.totalLen-y._MAX_LABEL_LEN;if(k>0&&(M=M.slice(0,-k)+"\u2026",E=!0),o(s,this._ruleFactory.createClassNameRef(u),be(M),H&&!s.hint.paddingRight?S.Right:S.None,new B(s,d)),E)break}if(s.hint.paddingRight&&a(s,!0),n.length>y._MAX_DECORATORS)break}const R=[];for(const[s,m]of this._decorationsMetadata){const d=this._editor.getModel()?.getDecorationRange(s);d&&e.some(g=>g.containsRange(d))&&(R.push(s),m.classNameRef.dispose(),this._decorationsMetadata.delete(s))}const W=ee.capture(this._editor);this._editor.changeDecorations(s=>{const m=s.deltaDecorations(R,n.map(d=>d.decoration));for(let d=0;d<m.length;d++){const g=n[d];this._decorationsMetadata.set(m[d],g)}}),W.restore(this._editor)}_fillInColors(e,t){t.kind===F.InlayHintKind.Parameter?(e.backgroundColor=b(v.editorInlayHintParameterBackground),e.color=b(v.editorInlayHintParameterForeground)):t.kind===F.InlayHintKind.Type?(e.backgroundColor=b(v.editorInlayHintTypeBackground),e.color=b(v.editorInlayHintTypeForeground)):(e.backgroundColor=b(v.editorInlayHintBackground),e.color=b(v.editorInlayHintForeground))}_getLayoutInfo(){const e=this._editor.getOption(D.inlayHints),t=e.padding,n=this._editor.getOption(D.fontSize),o=this._editor.getOption(D.fontFamily);let a=e.fontSize;(!a||a<5||a>n)&&(a=n);const i=e.fontFamily||o;return{fontSize:a,fontFamily:i,padding:t,isUniform:!t&&i===o&&a===n}}_removeAllDecorations(){this._editor.removeDecorations(Array.from(this._decorationsMetadata.keys()));for(const e of this._decorationsMetadata.values())e.classNameRef.dispose();this._decorationsMetadata.clear()}getInlayHintsForLine(e){if(!this._editor.hasModel())return[];const t=new Set,n=[];for(const o of this._editor.getLineDecorations(e)){const a=this._decorationsMetadata.get(o.id);a&&!t.has(a.item.hint)&&(t.add(a.item.hint),n.push(a.item))}return n}};y=w([_(1,$),_(2,ae),_(3,j),_(4,he),_(5,ye),_(6,ge)],y);function be(f){return f.replace(/[ \t]/g,"\xA0")}pe.registerCommand("_executeInlayHintProvider",async(f,...e)=>{const[t,n]=e;O(Q.isUri(t)),O(I.isIRange(n));const{inlayHintsProvider:o}=f.get($),a=await f.get(se).createModelReference(t);try{const i=await U.create(o,a.object.textEditorModel,[I.lift(n)],P.None),r=i.items.map(l=>l.hint);return setTimeout(()=>i.dispose(),0),r}finally{a.dispose()}});export{y as InlayHintsController,B as RenderedInlayHintLabelPart};