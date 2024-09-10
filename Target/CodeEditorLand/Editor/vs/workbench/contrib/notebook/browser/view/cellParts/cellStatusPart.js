var M=Object.defineProperty;var T=Object.getOwnPropertyDescriptor;var x=(u,d,t,i)=>{for(var e=i>1?void 0:i?T(d,t):d,r=u.length-1,n;r>=0;r--)(n=u[r])&&(e=(i?n(d,t,e):n(e))||e);return i&&e&&M(d,t,e),e},c=(u,d)=>(t,i)=>d(t,i,u);import*as a from"../../../../../../base/browser/dom.js";import{StandardKeyboardEvent as L}from"../../../../../../base/browser/keyboardEvent.js";import{SimpleIconLabel as A}from"../../../../../../base/browser/ui/iconLabel/simpleIconLabel.js";import{toErrorMessage as B}from"../../../../../../base/common/errorMessage.js";import{Emitter as N}from"../../../../../../base/common/event.js";import{stripIcons as W}from"../../../../../../base/common/iconLabels.js";import{KeyCode as E}from"../../../../../../base/common/keyCodes.js";import{Disposable as O,DisposableStore as D,dispose as k}from"../../../../../../base/common/lifecycle.js";import{MarshalledId as F}from"../../../../../../base/common/marshallingIds.js";import{isThemeColor as P}from"../../../../../../editor/common/editorCommon.js";import{ICommandService as R}from"../../../../../../platform/commands/common/commands.js";import{IInstantiationService as V}from"../../../../../../platform/instantiation/common/instantiation.js";import{INotificationService as K}from"../../../../../../platform/notification/common/notification.js";import{ITelemetryService as $}from"../../../../../../platform/telemetry/common/telemetry.js";import{IThemeService as S}from"../../../../../../platform/theme/common/themeService.js";import{CellFocusMode as C}from"../../notebookBrowser.js";import{CellContentPart as q}from"../cellPart.js";import{ClickTargetType as I}from"./cellWidgets.js";import{CodeCellViewModel as Y}from"../../viewModel/codeCellViewModel.js";import{CellStatusbarAlignment as w}from"../../../common/notebookCommon.js";import{IHoverService as H}from"../../../../../../platform/hover/browser/hover.js";import{IConfigurationService as j}from"../../../../../../platform/configuration/common/configuration.js";import{HoverPosition as X}from"../../../../../../base/browser/ui/hover/hoverWidget.js";const v=a.$;let g=class extends q{constructor(t,i,e,r,n,o,l,b){super();this._notebookEditor=t;this._cellContainer=i;this._editor=r;this._instantiationService=n;this._themeService=b;this.statusBarContainer=a.append(e,v(".cell-statusbar-container")),this.statusBarContainer.tabIndex=-1;const h=a.append(this.statusBarContainer,v(".cell-status-left")),m=a.append(this.statusBarContainer,v(".cell-status-right"));this.leftItemsContainer=a.append(h,v(".cell-contributed-items.cell-contributed-items-left")),this.rightItemsContainer=a.append(m,v(".cell-contributed-items.cell-contributed-items-right")),this.itemsDisposable=this._register(new D),this.hoverDelegate=new class{_lastHoverHideTime=0;showHover=s=>(s.position=s.position??{},s.position.hoverPosition=X.ABOVE,o.showHover(s));placement="element";get delay(){return Date.now()-this._lastHoverHideTime<200?0:l.getValue("workbench.hover.delay")}onDidHideHover(){this._lastHoverHideTime=Date.now()}},this._register(this._themeService.onDidColorThemeChange(()=>this.currentContext&&this.updateContext(this.currentContext))),this._register(a.addDisposableListener(this.statusBarContainer,a.EventType.CLICK,s=>{if(s.target===h||s.target===m||s.target===this.statusBarContainer)this._onDidClick.fire({type:I.Container,event:s});else{const p=s.target;let y=!1;if(p&&a.isHTMLElement(p)){const _=p;(_.classList.contains("cell-status-item-has-command")||_.parentElement&&_.parentElement.classList.contains("cell-status-item-has-command"))&&(y=!0)}y?this._onDidClick.fire({type:I.ContributedCommandItem,event:s}):this._onDidClick.fire({type:I.ContributedTextItem,event:s})}}))}statusBarContainer;leftItemsContainer;rightItemsContainer;itemsDisposable;leftItems=[];rightItems=[];width=0;currentContext;_onDidClick=this._register(new N);onDidClick=this._onDidClick.event;hoverDelegate;didRenderCell(t){if(this._notebookEditor.hasModel()){const i={ui:!0,cell:t,notebookEditor:this._notebookEditor,$mid:F.NotebookCellActionContext};this.updateContext(i)}if(this._editor){const i=()=>{if(this._editor&&(this._editor.hasWidgetFocus()||this.statusBarContainer.ownerDocument.activeElement&&this.statusBarContainer.contains(this.statusBarContainer.ownerDocument.activeElement)))t.focusMode=C.Editor;else{const e=t.focusMode;e===C.ChatInput?t.focusMode=C.ChatInput:e===C.Output&&this._notebookEditor.hasWebviewFocus()?t.focusMode=C.Output:t.focusMode=C.Container}};this.cellDisposables.add(this._editor.onDidFocusEditorWidget(()=>{i()})),this.cellDisposables.add(this._editor.onDidBlurEditorWidget(()=>{this._notebookEditor.hasEditorFocus()&&!(this.statusBarContainer.ownerDocument.activeElement&&this.statusBarContainer.contains(this.statusBarContainer.ownerDocument.activeElement))&&i()})),this.cellDisposables.add(this.onDidClick(e=>{if(this.currentCell instanceof Y&&e.type!==I.ContributedCommandItem&&this._editor){const r=this._editor.getTargetAtClientPoint(e.event.clientX,e.event.clientY-this._notebookEditor.notebookOptions.computeEditorStatusbarHeight(this.currentCell.internalMetadata,this.currentCell.uri));r?.position&&(this._editor.setPosition(r.position),this._editor.focus())}}))}}updateInternalLayoutNow(t){this._cellContainer.classList.toggle("cell-statusbar-hidden",this._notebookEditor.notebookOptions.computeEditorStatusbarHeight(t.internalMetadata,t.uri)===0);const e=t.layoutInfo.editorWidth;if(!e)return;this.width=e,this.statusBarContainer.style.width=`${e}px`;const r=this.getMaxItemWidth();this.leftItems.forEach(n=>n.maxWidth=r),this.rightItems.forEach(n=>n.maxWidth=r)}getMaxItemWidth(){return this.width/2}updateContext(t){this.currentContext=t,this.itemsDisposable.clear(),this.currentContext&&(this.itemsDisposable.add(this.currentContext.cell.onDidChangeLayout(()=>{this.currentContext&&this.updateInternalLayoutNow(this.currentContext.cell)})),this.itemsDisposable.add(this.currentContext.cell.onDidChangeCellStatusBarItems(()=>this.updateRenderedItems())),this.itemsDisposable.add(this.currentContext.notebookEditor.onDidChangeActiveCell(()=>this.updateActiveCell())),this.updateInternalLayoutNow(this.currentContext.cell),this.updateActiveCell(),this.updateRenderedItems())}updateActiveCell(){const t=this.currentContext.notebookEditor.getActiveCell()===this.currentContext?.cell;this.statusBarContainer.classList.toggle("is-active-cell",t)}updateRenderedItems(){const t=this.currentContext.cell.getCellStatusBarItems();t.sort((o,l)=>(l.priority??0)-(o.priority??0));const i=this.getMaxItemWidth(),e=t.filter(o=>o.alignment===w.Left),r=t.filter(o=>o.alignment===w.Right).reverse(),n=(o,l,b)=>{if(o.length>l.length){const h=o.splice(l.length,o.length-l.length);for(const m of h)m.container.remove(),m.dispose()}l.forEach((h,m)=>{const s=o[m];if(s)s.updateItem(h,i);else{const p=this._instantiationService.createInstance(f,this.currentContext,this.hoverDelegate,this._editor,h,i);o.push(p),b.appendChild(p.container)}})};n(this.leftItems,e,this.leftItemsContainer),n(this.rightItems,r,this.rightItemsContainer)}dispose(){super.dispose(),k(this.leftItems),k(this.rightItems)}};g=x([c(4,V),c(5,H),c(6,j),c(7,S)],g);let f=class extends O{constructor(t,i,e,r,n,o,l,b,h,m){super();this._context=t;this._hoverDelegate=i;this._editor=e;this._telemetryService=o;this._commandService=l;this._notificationService=b;this._themeService=h;this._hoverService=m;this.updateItem(r,n)}container=v(".cell-status-item");set maxWidth(t){this.container.style.maxWidth=t+"px"}_currentItem;_itemDisposables=this._register(new D);updateItem(t,i){this._itemDisposables.clear(),(!this._currentItem||this._currentItem.text!==t.text)&&(this._itemDisposables.add(new A(this.container)).text=t.text.replace(/\n/g," "));const e=o=>P(o)?this._themeService.getColorTheme().getColor(o.id)?.toString()||"":o;this.container.style.color=t.color?e(t.color):"",this.container.style.backgroundColor=t.backgroundColor?e(t.backgroundColor):"",this.container.style.opacity=t.opacity?t.opacity:"",this.container.classList.toggle("cell-status-item-show-when-active",!!t.onlyShowWhenActive),typeof i=="number"&&(this.maxWidth=i);let r,n;if(t.accessibilityInformation?(r=t.accessibilityInformation.label,n=t.accessibilityInformation.role):r=t.text?W(t.text).trim():"",this.container.setAttribute("aria-label",r),this.container.setAttribute("role",n||""),t.tooltip){const o=typeof t.tooltip=="string"?t.tooltip:{markdown:t.tooltip,markdownNotSupportedFallback:void 0};this._itemDisposables.add(this._hoverService.setupManagedHover(this._hoverDelegate,this.container,o))}this.container.classList.toggle("cell-status-item-has-command",!!t.command),t.command?(this.container.tabIndex=0,this._itemDisposables.add(a.addDisposableListener(this.container,a.EventType.CLICK,o=>{this.executeCommand()})),this._itemDisposables.add(a.addDisposableListener(this.container,a.EventType.KEY_DOWN,o=>{const l=new L(o);(l.equals(E.Space)||l.equals(E.Enter))&&this.executeCommand()}))):this.container.removeAttribute("tabIndex"),this._currentItem=t}async executeCommand(){const t=this._currentItem.command;if(!t)return;const i=typeof t=="string"?t:t.id,e=typeof t=="string"?[]:t.arguments??[];(typeof t=="string"||!t.arguments||!Array.isArray(t.arguments)||t.arguments.length===0)&&e.unshift(this._context),this._telemetryService.publicLog2("workbenchActionExecuted",{id:i,from:"cell status bar"});try{this._editor?.focus(),await this._commandService.executeCommand(i,...e)}catch(r){this._notificationService.error(B(r))}}};f=x([c(5,$),c(6,R),c(7,K),c(8,S),c(9,H)],f);export{g as CellEditorStatusBar};
