var B=Object.defineProperty;var _=Object.getOwnPropertyDescriptor;var M=(f,c,t,e)=>{for(var o=e>1?void 0:e?_(c,t):c,i=f.length-1,s;i>=0;i--)(s=f[i])&&(o=(e?s(c,t,o):s(o))||o);return e&&o&&B(c,t,o),o},n=(f,c)=>(t,e)=>c(t,e,f);import"../../../../../vs/workbench/contrib/welcomeWalkthrough/common/walkThroughUtils.js";import"vs/css!./media/walkThroughPart";import{addDisposableListener as $,isHTMLAnchorElement as j,isHTMLButtonElement as J,isHTMLElement as P,safeInnerHtml as H,size as Y}from"../../../../../vs/base/browser/dom.js";import{Gesture as Q,EventType as X}from"../../../../../vs/base/browser/touch.js";import{DomScrollableElement as Z}from"../../../../../vs/base/browser/ui/scrollbar/scrollableElement.js";import"../../../../../vs/base/common/cancellation.js";import{UILabelProvider as tt}from"../../../../../vs/base/common/keybindingLabels.js";import{DisposableStore as O,dispose as k,toDisposable as et}from"../../../../../vs/base/common/lifecycle.js";import{deepClone as ot}from"../../../../../vs/base/common/objects.js";import{OperatingSystem as it,OS as K}from"../../../../../vs/base/common/platform.js";import{ScrollbarVisibility as A}from"../../../../../vs/base/common/scrollable.js";import*as st from"../../../../../vs/base/common/strings.js";import{isObject as nt}from"../../../../../vs/base/common/types.js";import{URI as F}from"../../../../../vs/base/common/uri.js";import{CodeEditorWidget as R}from"../../../../../vs/editor/browser/widget/codeEditor/codeEditorWidget.js";import{EditorOption as N}from"../../../../../vs/editor/common/config/editorOptions.js";import{ITextResourceConfigurationService as rt}from"../../../../../vs/editor/common/services/textResourceConfiguration.js";import{localize as z}from"../../../../../vs/nls.js";import{CommandsRegistry as lt}from"../../../../../vs/platform/commands/common/commands.js";import{IConfigurationService as at}from"../../../../../vs/platform/configuration/common/configuration.js";import{IContextKeyService as ct,RawContextKey as dt}from"../../../../../vs/platform/contextkey/common/contextkey.js";import"../../../../../vs/platform/editor/common/editor.js";import{IInstantiationService as ht}from"../../../../../vs/platform/instantiation/common/instantiation.js";import{IKeybindingService as pt}from"../../../../../vs/platform/keybinding/common/keybinding.js";import{INotificationService as mt}from"../../../../../vs/platform/notification/common/notification.js";import{IOpenerService as ut}from"../../../../../vs/platform/opener/common/opener.js";import{IStorageService as gt}from"../../../../../vs/platform/storage/common/storage.js";import{ITelemetryService as ft}from"../../../../../vs/platform/telemetry/common/telemetry.js";import{IThemeService as vt}from"../../../../../vs/platform/theme/common/themeService.js";import{EditorPane as St}from"../../../../../vs/workbench/browser/parts/editor/editorPane.js";import"../../../../../vs/workbench/common/editor.js";import{WalkThroughInput as p}from"../../../../../vs/workbench/contrib/welcomeWalkthrough/browser/walkThroughInput.js";import{IEditorGroupsService as bt}from"../../../../../vs/workbench/services/editor/common/editorGroupsService.js";import{IExtensionService as Et}from"../../../../../vs/workbench/services/extensions/common/extensions.js";const Tt=new dt("interactivePlaygroundFocus",!1),V=z("walkThrough.unboundCommand","unbound"),yt="walkThroughEditorViewState";let m=class extends St{constructor(t,e,o,i,s,d,u,r,y,l,C,h,E){super(m.ID,t,e,o,r);this.instantiationService=s;this.openerService=d;this.keybindingService=u;this.contextKeyService=y;this.configurationService=l;this.notificationService=C;this.extensionService=h;this.editorFocus=Tt.bindTo(this.contextKeyService),this.editorMemento=this.getEditorMemento(E,i,yt)}static ID="workbench.editor.walkThroughPart";disposables=new O;contentDisposables=[];content;scrollbar;editorFocus;lastFocus;size;editorMemento;createEditor(t){this.content=document.createElement("div"),this.content.classList.add("welcomePageFocusElement"),this.content.tabIndex=0,this.content.style.outlineStyle="none",this.scrollbar=new Z(this.content,{horizontal:A.Auto,vertical:A.Auto}),this.disposables.add(this.scrollbar),t.appendChild(this.scrollbar.getDomNode()),this.registerFocusHandlers(),this.registerClickHandler(),this.disposables.add(this.scrollbar.onScroll(e=>this.updatedScrollPosition()))}updatedScrollPosition(){const t=this.scrollbar.getScrollDimensions(),e=this.scrollbar.getScrollPosition(),o=t.scrollHeight;if(o&&this.input instanceof p){const i=e.scrollTop,s=t.height;this.input.relativeScrollPosition(i/o,(i+s)/o)}}onTouchChange(t){t.preventDefault(),t.stopPropagation();const e=this.scrollbar.getScrollPosition();this.scrollbar.setScrollPosition({scrollTop:e.scrollTop-t.translationY})}addEventListener(t,e,o,i){return t.addEventListener(e,o,i),et(()=>{t.removeEventListener(e,o,i)})}registerFocusHandlers(){this.disposables.add(this.addEventListener(this.content,"mousedown",t=>{this.focus()})),this.disposables.add(this.addEventListener(this.content,"focus",t=>{this.editorFocus.set(!0)})),this.disposables.add(this.addEventListener(this.content,"blur",t=>{this.editorFocus.reset()})),this.disposables.add(this.addEventListener(this.content,"focusin",t=>{if(P(t.target)&&t.target.classList.contains("zone-widget-container")){const e=this.scrollbar.getScrollPosition();this.content.scrollTop=e.scrollTop,this.content.scrollLeft=e.scrollLeft}P(t.target)&&(this.lastFocus=t.target)}))}registerClickHandler(){this.content.addEventListener("click",t=>{for(let e=t.target;e;e=e.parentNode)if(j(e)&&e.href){const o=e.ownerDocument.getElementsByTagName("base")[0]||this.window.location;if(o&&e.href.indexOf(o.href)>=0&&e.hash){const i=this.content.querySelector(e.hash),s=this.content.firstElementChild;if(i&&s){const d=i.getBoundingClientRect().top-20,u=s.getBoundingClientRect().top;this.scrollbar.setScrollPosition({scrollTop:d-u})}}else this.open(F.parse(e.href));t.preventDefault();break}else if(J(e)){const o=e.getAttribute("data-href");o&&this.open(F.parse(o));break}else if(e===t.currentTarget)break})}open(t){if(t.scheme==="command"&&t.path==="git.clone"&&!lt.getCommand("git.clone")){this.notificationService.info(z("walkThrough.gitNotFound","It looks like Git is not installed on your system."));return}this.openerService.open(this.addFrom(t),{allowCommands:!0})}addFrom(t){if(t.scheme!=="command"||!(this.input instanceof p))return t;const e=t.query?JSON.parse(t.query):{};return e.from=this.input.getTelemetryFrom(),t.with({query:JSON.stringify(e)})}layout(t){this.size=t,Y(this.content,t.width,t.height),this.updateSizeClasses(),this.contentDisposables.forEach(o=>{o instanceof R&&o.layout()});const e=this.input instanceof p&&this.input;e&&e.layout&&e.layout(t),this.scrollbar.scanDomNode()}updateSizeClasses(){const t=this.content.firstElementChild;this.size&&t&&t.classList.toggle("max-height-685px",this.size.height<=685)}focus(){super.focus();let t=this.content.ownerDocument.activeElement;for(;t&&t!==this.content;)t=t.parentElement;t||(this.lastFocus||this.content).focus(),this.editorFocus.set(!0)}arrowUp(){const t=this.scrollbar.getScrollPosition();this.scrollbar.setScrollPosition({scrollTop:t.scrollTop-this.getArrowScrollHeight()})}arrowDown(){const t=this.scrollbar.getScrollPosition();this.scrollbar.setScrollPosition({scrollTop:t.scrollTop+this.getArrowScrollHeight()})}getArrowScrollHeight(){let t=this.configurationService.getValue("editor.fontSize");return(typeof t!="number"||t<1)&&(t=12),3*t}pageUp(){const t=this.scrollbar.getScrollDimensions(),e=this.scrollbar.getScrollPosition();this.scrollbar.setScrollPosition({scrollTop:e.scrollTop-t.height})}pageDown(){const t=this.scrollbar.getScrollDimensions(),e=this.scrollbar.getScrollPosition();this.scrollbar.setScrollPosition({scrollTop:e.scrollTop+t.height})}setInput(t,e,o,i){const s=new O;return this.contentDisposables.push(s),this.content.innerText="",super.setInput(t,e,o,i).then(async()=>(t.resource.path.endsWith(".md")&&await this.extensionService.whenInstalledExtensionsRegistered(),t.resolve())).then(d=>{if(i.isCancellationRequested)return;const u=d.main;if(!t.resource.path.endsWith(".md")){H(this.content,u),this.updateSizeClasses(),this.decorateContent(),this.contentDisposables.push(this.keybindingService.onDidUpdateKeybindings(()=>this.decorateContent())),t.onReady?.(this.content.firstElementChild,s),this.scrollbar.scanDomNode(),this.loadTextEditorViewState(t),this.updatedScrollPosition();return}const r=document.createElement("div");r.classList.add("walkThroughContent");const y=this.expandMacros(u);H(r,y),this.content.appendChild(r),d.snippets.forEach((l,C)=>{const h=l.textEditorModel;if(!h)return;const E=`snippet-${h.uri.fragment}`,v=r.querySelector(`#${E.replace(/[\\.]/g,"\\$&")}`),U=this.getEditorOptions(h.getLanguageId()),G={target:this.input instanceof p?this.input.getTelemetryFrom():void 0,snippet:C},a=this.instantiationService.createInstance(R,v,U,{telemetryData:G});a.setModel(h),this.contentDisposables.push(a);const I=g=>{const S=a.getOption(N.lineHeight),b=`${Math.max(h.getLineCount()+1,4)*S}px`;v.style.height!==b&&(v.style.height=b,a.layout(),g||this.scrollbar.scanDomNode())};I(!0),this.contentDisposables.push(a.onDidChangeModelContent(()=>I(!1))),this.contentDisposables.push(a.onDidChangeCursorPosition(g=>{const S=this.content.firstElementChild;if(S){const b=v.getBoundingClientRect().top,W=S.getBoundingClientRect().top,D=a.getOption(N.lineHeight),T=b+(g.position.lineNumber-1)*D-W,w=T+D,q=this.scrollbar.getScrollDimensions(),L=this.scrollbar.getScrollPosition().scrollTop,x=q.height;L>T?this.scrollbar.setScrollPosition({scrollTop:T}):L<w-x&&this.scrollbar.setScrollPosition({scrollTop:w-x})}})),this.contentDisposables.push(this.configurationService.onDidChangeConfiguration(g=>{g.affectsConfiguration("editor")&&l.textEditorModel&&a.updateOptions(this.getEditorOptions(l.textEditorModel.getLanguageId()))}))}),this.updateSizeClasses(),this.multiCursorModifier(),this.contentDisposables.push(this.configurationService.onDidChangeConfiguration(l=>{l.affectsConfiguration("editor.multiCursorModifier")&&this.multiCursorModifier()})),t.onReady?.(r,s),this.scrollbar.scanDomNode(),this.loadTextEditorViewState(t),this.updatedScrollPosition(),this.contentDisposables.push(Q.addTarget(r)),this.contentDisposables.push($(r,X.Change,l=>this.onTouchChange(l)))})}getEditorOptions(t){const e=ot(this.configurationService.getValue("editor",{overrideIdentifier:t}));return{...nt(e)?e:Object.create(null),scrollBeyondLastLine:!1,scrollbar:{verticalScrollbarSize:14,horizontal:"auto",useShadows:!0,verticalHasArrows:!1,horizontalHasArrows:!1,alwaysConsumeMouseWheel:!1},overviewRulerLanes:3,fixedOverflowWidgets:!1,lineNumbersMinChars:1,minimap:{enabled:!1}}}expandMacros(t){return t.replace(/kb\(([a-z.\d\-]+)\)/gi,(e,o)=>{const i=this.keybindingService.lookupKeybinding(o),s=i?i.getLabel()||"":V;return`<span class="shortcut">${st.escape(s)}</span>`})}decorateContent(){const t=this.content.querySelectorAll(".shortcut[data-command]");Array.prototype.forEach.call(t,o=>{const i=o.getAttribute("data-command"),s=i&&this.keybindingService.lookupKeybinding(i),d=s?s.getLabel()||"":V;for(;o.firstChild;)o.firstChild.remove();o.appendChild(document.createTextNode(d))});const e=this.content.querySelectorAll(".if_shortcut[data-command]");Array.prototype.forEach.call(e,o=>{const i=o.getAttribute("data-command"),s=i&&this.keybindingService.lookupKeybinding(i);o.style.display=s?"":"none"})}multiCursorModifier(){const t=tt.modifierLabels[K],e=this.configurationService.getValue("editor.multiCursorModifier"),o=t[e==="ctrlCmd"?K===it.Macintosh?"metaKey":"ctrlKey":"altKey"],i=this.content.querySelectorAll(".multi-cursor-modifier");Array.prototype.forEach.call(i,s=>{for(;s.firstChild;)s.firstChild.remove();s.appendChild(document.createTextNode(o))})}saveTextEditorViewState(t){const e=this.scrollbar.getScrollPosition();this.editorMemento.saveEditorState(this.group,t,{viewState:{scrollTop:e.scrollTop,scrollLeft:e.scrollLeft}})}loadTextEditorViewState(t){const e=this.editorMemento.loadEditorState(this.group,t);e&&this.scrollbar.setScrollPosition(e.viewState)}clearInput(){this.input instanceof p&&this.saveTextEditorViewState(this.input),this.contentDisposables=k(this.contentDisposables),super.clearInput()}saveState(){this.input instanceof p&&this.saveTextEditorViewState(this.input),super.saveState()}dispose(){this.editorFocus.reset(),this.contentDisposables=k(this.contentDisposables),this.disposables.dispose(),super.dispose()}};m=M([n(1,ft),n(2,vt),n(3,rt),n(4,ht),n(5,ut),n(6,pt),n(7,gt),n(8,ct),n(9,at),n(10,mt),n(11,Et),n(12,bt)],m);export{Tt as WALK_THROUGH_FOCUS,m as WalkThroughPart};
