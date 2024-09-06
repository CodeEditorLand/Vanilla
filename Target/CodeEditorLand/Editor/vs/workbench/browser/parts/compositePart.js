import"vs/css!./media/compositepart";import{$ as p,append as d,Dimension as A,hide as S,show as y}from"../../../../vs/base/browser/dom.js";import{ActionsOrientation as b,prepareActions as g}from"../../../../vs/base/browser/ui/actionbar/actionbar.js";import"../../../../vs/base/browser/ui/actionbar/actionViewItems.js";import{AnchorAlignment as T}from"../../../../vs/base/browser/ui/contextview/contextview.js";import"../../../../vs/base/browser/ui/hover/hoverDelegate.js";import{createInstantHoverDelegate as B,getDefaultHoverDelegate as L}from"../../../../vs/base/browser/ui/hover/hoverDelegateFactory.js";import{ProgressBar as w}from"../../../../vs/base/browser/ui/progressbar/progressbar.js";import"../../../../vs/base/browser/ui/sash/sash.js";import"../../../../vs/base/common/actions.js";import{isCancellationError as D}from"../../../../vs/base/common/errors.js";import{Emitter as v}from"../../../../vs/base/common/event.js";import{defaultGenerator as P}from"../../../../vs/base/common/idGenerator.js";import{DisposableStore as H,dispose as u,MutableDisposable as M}from"../../../../vs/base/common/lifecycle.js";import{assertIsDefined as m}from"../../../../vs/base/common/types.js";import{localize as h}from"../../../../vs/nls.js";import{createActionViewItem as O}from"../../../../vs/platform/actions/browser/menuEntryActionViewItem.js";import{WorkbenchToolBar as E}from"../../../../vs/platform/actions/browser/toolbar.js";import"../../../../vs/platform/contextview/browser/contextView.js";import"../../../../vs/platform/instantiation/common/instantiation.js";import{ServiceCollection as k}from"../../../../vs/platform/instantiation/common/serviceCollection.js";import"../../../../vs/platform/keybinding/common/keybinding.js";import"../../../../vs/platform/notification/common/notification.js";import{IEditorProgressService as x}from"../../../../vs/platform/progress/common/progress.js";import{StorageScope as C,StorageTarget as V}from"../../../../vs/platform/storage/common/storage.js";import{defaultProgressBarStyles as R}from"../../../../vs/platform/theme/browser/defaultStyles.js";import"../../../../vs/platform/theme/common/themeService.js";import"../../../../vs/workbench/browser/composite.js";import{Part as K}from"../../../../vs/workbench/browser/part.js";import"../../../../vs/workbench/common/composite.js";import"../../../../vs/workbench/services/layout/browser/layoutService.js";import{AbstractProgressScope as _,ScopedProgressIndicator as z}from"../../../../vs/workbench/services/progress/browser/progressIndicator.js";class Ne extends K{constructor(e,t,i,o,r,a,n,s,l,c,N,U,$,G,I,f){super(I,f,s,t,o);this.notificationService=e;this.storageService=t;this.contextMenuService=i;this.keybindingService=r;this.hoverService=a;this.instantiationService=n;this.registry=l;this.activeCompositeSettingsKey=c;this.defaultCompositeId=N;this.nameForTelemetry=U;this.compositeCSSClass=$;this.titleForegroundColor=G;this.lastActiveCompositeId=t.get(c,C.WORKSPACE,this.defaultCompositeId),this.toolbarHoverDelegate=this._register(B())}onDidCompositeOpen=this._register(new v);onDidCompositeClose=this._register(new v);toolBar;titleLabelElement;toolbarHoverDelegate;mapCompositeToCompositeContainer=new Map;mapActionsBindingToComposite=new Map;activeComposite;lastActiveCompositeId;instantiatedCompositeItems=new Map;titleLabel;progressBar;contentAreaSize;actionsListener=this._register(new M);currentCompositeOpenToken;boundarySashes;openComposite(e,t){if(this.activeComposite?.getId()===e)return t&&this.activeComposite.focus(),this.activeComposite;if(this.element)return this.doOpenComposite(e,t)}doOpenComposite(e,t=!1){const i=P.nextId();this.currentCompositeOpenToken=i,this.activeComposite&&this.hideActiveComposite(),this.updateTitle(e);const o=this.createComposite(e,!0);if(!(this.currentCompositeOpenToken!==i||this.activeComposite&&this.activeComposite.getId()!==o.getId()))return this.activeComposite?.getId()===o.getId()?(t&&o.focus(),this.onDidCompositeOpen.fire({composite:o,focus:t}),o):(this.showComposite(o),t&&o.focus(),o&&this.onDidCompositeOpen.fire({composite:o,focus:t}),o)}createComposite(e,t){const i=this.instantiatedCompositeItems.get(e);if(i)return i.composite;const o=this.registry.getComposite(e);if(o){const r=this,a=new z(m(this.progressBar),new class extends _{constructor(){super(o.id,!!t),this._register(r.onDidCompositeOpen.event(c=>this.onScopeOpened(c.composite.getId()))),this._register(r.onDidCompositeClose.event(c=>this.onScopeClosed(c.getId())))}}),n=this._register(this.instantiationService.createChild(new k([x,a]))),s=o.instantiate(n),l=new H;return this.instantiatedCompositeItems.set(e,{composite:s,disposable:l,progress:a}),l.add(s.onTitleAreaUpdate(()=>this.onTitleAreaUpdate(s.getId()),this)),l.add(n),s}throw new Error(`Unable to find composite with id ${e}`)}showComposite(e){this.activeComposite=e;const t=this.activeComposite.getId();t!==this.defaultCompositeId?this.storageService.store(this.activeCompositeSettingsKey,t,C.WORKSPACE,V.MACHINE):this.storageService.remove(this.activeCompositeSettingsKey,C.WORKSPACE),this.lastActiveCompositeId=this.activeComposite.getId();let i=this.mapCompositeToCompositeContainer.get(e.getId());if(i||(i=p(".composite"),i.classList.add(...this.compositeCSSClass.split(" ")),i.id=e.getId(),e.create(i),e.updateStyles(),this.mapCompositeToCompositeContainer.set(e.getId(),i)),!this.activeComposite||e.getId()!==this.activeComposite.getId())return;this.getContentArea()?.appendChild(i),y(i);const r=m(this.toolBar);r.actionRunner=e.getActionRunner();const a=this.registry.getComposite(e.getId());a&&a.name!==e.getTitle()&&this.updateTitle(e.getId(),e.getTitle());let n=this.mapActionsBindingToComposite.get(e.getId());n||(n=this.collectCompositeActions(e),this.mapActionsBindingToComposite.set(e.getId(),n)),n(),this.actionsListener.value=r.actionRunner.onDidRun(s=>{s.error&&!D(s.error)&&this.notificationService.error(s.error)}),e.setVisible(!0),!(!this.activeComposite||e.getId()!==this.activeComposite.getId())&&(this.contentAreaSize&&e.layout(this.contentAreaSize),this.boundarySashes&&e.setBoundarySashes(this.boundarySashes))}onTitleAreaUpdate(e){const t=this.instantiatedCompositeItems.get(e);if(t&&this.updateTitle(e,t.composite.getTitle()),this.activeComposite?.getId()===e){const i=this.collectCompositeActions(this.activeComposite);this.mapActionsBindingToComposite.set(this.activeComposite.getId(),i),i()}else this.mapActionsBindingToComposite.delete(e)}updateTitle(e,t){const i=this.registry.getComposite(e);if(!i||!this.titleLabel)return;t||(t=i.name);const o=this.keybindingService.lookupKeybinding(e);this.titleLabel.updateTitle(e,t,o?.getLabel()??void 0),m(this.toolBar).setAriaLabel(h("ariaCompositeToolbarLabel","{0} actions",t))}collectCompositeActions(e){const t=e?.getMenuIds(),i=e?.getActions().slice(0)||[],o=e?.getSecondaryActions().slice(0)||[],r=m(this.toolBar);return r.context=this.actionsContextProvider(),()=>r.setActions(g(i),g(o),t)}getActiveComposite(){return this.activeComposite}getLastActiveCompositeId(){return this.lastActiveCompositeId}hideActiveComposite(){if(!this.activeComposite)return;const e=this.activeComposite;this.activeComposite=void 0;const t=this.mapCompositeToCompositeContainer.get(e.getId());return e.setVisible(!1),t&&(t.remove(),S(t)),this.progressBar?.stop().hide(),this.toolBar&&this.collectCompositeActions()(),this.onDidCompositeClose.fire(e),e}createTitleArea(e){const t=d(e,p(".composite"));t.classList.add("title"),this.titleLabel=this.createTitleLabel(t);const i=d(t,p(".title-actions"));return this.toolBar=this._register(this.instantiationService.createInstance(E,i,{actionViewItemProvider:(o,r)=>this.actionViewItemProvider(o,r),orientation:b.HORIZONTAL,getKeyBinding:o=>this.keybindingService.lookupKeybinding(o.id),anchorAlignmentProvider:()=>this.getTitleAreaDropDownAnchorAlignment(),toggleMenuTitle:h("viewsAndMoreActions","Views and More Actions..."),telemetrySource:this.nameForTelemetry,hoverDelegate:this.toolbarHoverDelegate})),this.collectCompositeActions()(),t}createTitleLabel(e){const t=d(e,p(".title-label")),i=d(t,p("h2"));this.titleLabelElement=i;const o=this._register(this.hoverService.setupManagedHover(L("mouse"),i,"")),r=this;return{updateTitle:(a,n,s)=>{(!this.activeComposite||this.activeComposite.getId()===a)&&(i.innerText=n,o.update(s?h("titleTooltip","{0} ({1})",n,s):n))},updateStyles:()=>{i.style.color=r.titleForegroundColor&&r.getColor(r.titleForegroundColor)||""}}}createHeaderArea(){return p(".composite")}createFooterArea(){return p(".composite")}updateStyles(){super.updateStyles(),m(this.titleLabel).updateStyles()}actionViewItemProvider(e,t){return this.activeComposite?this.activeComposite.getActionViewItem(e,t):O(this.instantiationService,e,t)}actionsContextProvider(){return this.activeComposite?this.activeComposite.getActionsContext():null}createContentArea(e){const t=d(e,p(".content"));return this.progressBar=this._register(new w(t,R)),this.progressBar.hide(),t}getProgressIndicator(e){const t=this.instantiatedCompositeItems.get(e);return t?t.progress:void 0}getTitleAreaDropDownAnchorAlignment(){return T.RIGHT}layout(e,t,i,o){super.layout(e,t,i,o),this.contentAreaSize=A.lift(super.layoutContents(e,t).contentSize),this.activeComposite?.layout(this.contentAreaSize)}setBoundarySashes(e){this.boundarySashes=e,this.activeComposite?.setBoundarySashes(e)}removeComposite(e){if(this.activeComposite?.getId()===e)return!1;this.mapCompositeToCompositeContainer.delete(e),this.mapActionsBindingToComposite.delete(e);const t=this.instantiatedCompositeItems.get(e);return t&&(t.composite.dispose(),u(t.disposable),this.instantiatedCompositeItems.delete(e)),!0}dispose(){this.mapCompositeToCompositeContainer.clear(),this.mapActionsBindingToComposite.clear(),this.instantiatedCompositeItems.forEach(e=>{e.composite.dispose(),u(e.disposable)}),this.instantiatedCompositeItems.clear(),super.dispose()}}export{Ne as CompositePart};
