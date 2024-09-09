var I=Object.defineProperty;var g=Object.getOwnPropertyDescriptor;var p=(a,t,i,e)=>{for(var r=e>1?void 0:e?g(t,i):t,o=a.length-1,n;o>=0;o--)(n=a[o])&&(r=(e?n(t,i,r):n(r))||r);return e&&r&&I(t,i,r),r},s=(a,t)=>(i,e)=>t(i,e,a);import{IExtensionService as m}from"../../../services/extensions/common/extensions.js";import{IContextMenuService as u}from"../../../../platform/contextview/browser/contextView.js";import{IViewDescriptorService as D}from"../../../common/views.js";import{ITelemetryService as S}from"../../../../platform/telemetry/common/telemetry.js";import{IThemeService as x}from"../../../../platform/theme/common/themeService.js";import{IInstantiationService as C}from"../../../../platform/instantiation/common/instantiation.js";import{IStorageService as M}from"../../../../platform/storage/common/storage.js";import{IWorkspaceContextService as E}from"../../../../platform/workspace/common/workspace.js";import{ViewPaneContainer as b}from"./viewPaneContainer.js";import"./viewPane.js";import"../../../../base/common/event.js";import{IConfigurationService as A}from"../../../../platform/configuration/common/configuration.js";import{IWorkbenchLayoutService as y}from"../../../services/layout/browser/layoutService.js";import"../../../../platform/extensions/common/extensions.js";let c=class extends b{constantViewDescriptors=new Map;allViews=new Map;filterValue;constructor(t,i,e,r,o,n,w,V,f,h,d,v){super(t,{mergeViewWithContainerWhenSingleView:!1},w,e,r,f,o,h,V,n,d,v),this._register(i(l=>{this.filterValue=l,this.onFilterChanged(l)})),this._register(this.viewContainerModel.onDidChangeActiveViewDescriptors(()=>{this.updateAllViews(this.viewContainerModel.activeViewDescriptors)}))}updateAllViews(t){t.forEach(i=>{const e=this.getFilterOn(i);e&&(this.allViews.has(e)||this.allViews.set(e,new Map),this.allViews.get(e).set(i.id,i),this.filterValue&&!this.filterValue.includes(e)&&this.panes.find(r=>r.id===i.id)&&this.viewContainerModel.setVisible(i.id,!1))})}addConstantViewDescriptors(t){t.forEach(i=>this.constantViewDescriptors.set(i.id,i))}onFilterChanged(t){this.allViews.size===0&&this.updateAllViews(this.viewContainerModel.activeViewDescriptors),this.getViewsNotForTarget(t).forEach(i=>this.viewContainerModel.setVisible(i.id,!1)),this.getViewsForTarget(t).forEach(i=>this.viewContainerModel.setVisible(i.id,!0))}getViewsForTarget(t){const i=[];for(let e=0;e<t.length;e++)this.allViews.has(t[e])&&i.push(...Array.from(this.allViews.get(t[e]).values()));return i}getViewsNotForTarget(t){const i=this.allViews.keys();let e=i.next(),r=[];for(;!e.done;){let o=!1;t.forEach(n=>{e.value===n&&(o=!0)}),o||(r=r.concat(this.getViewsForTarget([e.value]))),e=i.next()}return r}onDidAddViewDescriptors(t){const i=super.onDidAddViewDescriptors(t);for(let e=0;e<t.length;e++)this.constantViewDescriptors.has(t[e].viewDescriptor.id)&&i[e].setExpanded(!1);return this.allViews.size===0&&this.updateAllViews(this.viewContainerModel.activeViewDescriptors),i}openView(t,i){const e=super.openView(t,i);if(e){const r=Array.from(this.allViews.entries()).find(o=>o[1].has(t));r&&!this.filterValue?.includes(r[0])&&this.setFilter(r[1].get(t))}return e}};c=p([s(2,A),s(3,y),s(4,S),s(5,M),s(6,C),s(7,x),s(8,u),s(9,m),s(10,E),s(11,D)],c);export{c as FilterViewPaneContainer};
