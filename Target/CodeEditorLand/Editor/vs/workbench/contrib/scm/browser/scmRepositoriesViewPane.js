var y=Object.defineProperty;var b=Object.getOwnPropertyDescriptor;var h=(a,l,e,t)=>{for(var o=t>1?void 0:t?b(l,e):l,r=a.length-1,n;r>=0;r--)(n=a[r])&&(o=(t?n(l,e,o):n(o))||o);return t&&o&&y(l,e,o),o},c=(a,l)=>(e,t)=>l(e,t,a);import"vs/css!./media/scm";import{$ as M,append as L}from"../../../../../vs/base/browser/dom.js";import"../../../../../vs/base/browser/ui/list/list.js";import{Orientation as d}from"../../../../../vs/base/browser/ui/sash/sash.js";import{Event as w}from"../../../../../vs/base/common/event.js";import{Iterable as p}from"../../../../../vs/base/common/iterator.js";import{DisposableStore as R}from"../../../../../vs/base/common/lifecycle.js";import{localize as V}from"../../../../../vs/nls.js";import{MenuId as v}from"../../../../../vs/platform/actions/common/actions.js";import{IConfigurationService as x}from"../../../../../vs/platform/configuration/common/configuration.js";import{IContextKeyService as T}from"../../../../../vs/platform/contextkey/common/contextkey.js";import{IContextMenuService as D}from"../../../../../vs/platform/contextview/browser/contextView.js";import{IHoverService as E}from"../../../../../vs/platform/hover/browser/hover.js";import{IInstantiationService as A}from"../../../../../vs/platform/instantiation/common/instantiation.js";import{IKeybindingService as B}from"../../../../../vs/platform/keybinding/common/keybinding.js";import{WorkbenchList as O}from"../../../../../vs/platform/list/browser/listService.js";import{IOpenerService as _}from"../../../../../vs/platform/opener/common/opener.js";import{ITelemetryService as z}from"../../../../../vs/platform/telemetry/common/telemetry.js";import{IThemeService as N}from"../../../../../vs/platform/theme/common/themeService.js";import{ViewPane as P}from"../../../../../vs/workbench/browser/parts/views/viewPane.js";import{IViewDescriptorService as F}from"../../../../../vs/workbench/common/views.js";import{RepositoryActionRunner as H,RepositoryRenderer as u}from"../../../../../vs/workbench/contrib/scm/browser/scmRepositoryRenderer.js";import{collectContextMenuActions as W,getActionViewItemProvider as K}from"../../../../../vs/workbench/contrib/scm/browser/util.js";import{ISCMViewService as k}from"../../../../../vs/workbench/contrib/scm/common/scm.js";class Y{getHeight(){return 22}getTemplateId(){return u.TEMPLATE_ID}}let m=class extends P{constructor(e,t,o,r,n,s,i,S,g,I,f,C){super({...e,titleMenuId:v.SCMSourceControlTitle},o,r,S,i,s,n,g,I,f,C);this.scmViewService=t}list;disposables=new R;renderBody(e){super.renderBody(e);const t=L(e,M(".scm-view.scm-repositories-view")),o=()=>{const i=this.configurationService.getValue("scm.providerCountBadge");t.classList.toggle("hide-provider-counts",i==="hidden"),t.classList.toggle("auto-provider-counts",i==="auto")};this._register(w.filter(this.configurationService.onDidChangeConfiguration,i=>i.affectsConfiguration("scm.providerCountBadge"),this.disposables)(o)),o();const r=new Y,n=this.instantiationService.createInstance(u,v.SCMSourceControlInline,K(this.instantiationService)),s={getId:i=>i.provider.id};this.list=this.instantiationService.createInstance(O,"SCM Main",t,r,[n],{identityProvider:s,horizontalScrolling:!1,overrideStyles:this.getLocationBasedColors().listOverrideStyles,accessibilityProvider:{getAriaLabel(i){return i.provider.label},getWidgetAriaLabel(){return V("scm","Source Control Repositories")}}}),this._register(this.list),this._register(this.list.onDidChangeSelection(this.onListSelectionChange,this)),this._register(this.list.onContextMenu(this.onListContextMenu,this)),this._register(this.scmViewService.onDidChangeRepositories(this.onDidChangeRepositories,this)),this._register(this.scmViewService.onDidChangeVisibleRepositories(this.updateListSelection,this)),this.orientation===d.VERTICAL&&this._register(this.configurationService.onDidChangeConfiguration(i=>{i.affectsConfiguration("scm.repositories.visible")&&this.updateBodySize()})),this.onDidChangeRepositories(),this.updateListSelection()}onDidChangeRepositories(){this.list.splice(0,this.list.length,this.scmViewService.repositories),this.updateBodySize()}focus(){super.focus(),this.list.domFocus()}layoutBody(e,t){super.layoutBody(e,t),this.list.layout(e,t)}updateBodySize(){if(this.orientation===d.HORIZONTAL)return;const e=this.configurationService.getValue("scm.repositories.visible"),t=this.list.length===0,o=Math.min(this.list.length,e)*22;this.minimumBodySize=e===0?22:o,this.maximumBodySize=e===0||t?Number.POSITIVE_INFINITY:o}onListContextMenu(e){if(!e.element)return;const t=e.element.provider,r=this.scmViewService.menus.getRepositoryMenus(t).repositoryContextMenu,n=W(r),s=this._register(new H(()=>this.list.getSelectedElements()));s.onWillRun(()=>this.list.domFocus()),this.contextMenuService.showContextMenu({actionRunner:s,getAnchor:()=>e.anchor,getActions:()=>n,getActionsContext:()=>t})}onListSelectionChange(e){if(e.browserEvent&&e.elements.length>0){const t=this.list.scrollTop;this.scmViewService.visibleRepositories=e.elements,this.list.scrollTop=t}}updateListSelection(){const e=this.list.getSelection(),t=new Set(p.map(e,i=>this.list.element(i))),o=new Set(this.scmViewService.visibleRepositories),r=new Set(p.filter(o,i=>!t.has(i))),n=new Set(p.filter(t,i=>!o.has(i)));if(r.size===0&&n.size===0)return;const s=e.filter(i=>!n.has(this.list.element(i)));for(let i=0;i<this.list.length;i++)r.has(this.list.element(i))&&s.push(i);this.list.setSelection(s),s.length>0&&s.indexOf(this.list.getFocus()[0])===-1&&(this.list.setAnchor(s[0]),this.list.setFocus([s[0]]))}dispose(){this.disposables.dispose(),super.dispose()}};m=h([c(1,k),c(2,B),c(3,D),c(4,A),c(5,F),c(6,T),c(7,x),c(8,_),c(9,N),c(10,z),c(11,E)],m);export{m as SCMRepositoriesViewPane};
