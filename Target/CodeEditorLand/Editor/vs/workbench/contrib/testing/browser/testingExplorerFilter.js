var A=Object.defineProperty;var F=Object.getOwnPropertyDescriptor;var f=(d,a,e,r)=>{for(var s=r>1?void 0:r?F(a,e):a,i=d.length-1,t;i>=0;i--)(t=d[i])&&(s=(r?t(a,e,s):t(s))||s);return r&&s&&A(a,e,s),s},u=(d,a)=>(e,r)=>a(e,r,d);import*as m from"../../../../../vs/base/browser/dom.js";import{ActionBar as T}from"../../../../../vs/base/browser/ui/actionbar/actionbar.js";import{BaseActionViewItem as b}from"../../../../../vs/base/browser/ui/actionbar/actionViewItems.js";import{AnchorAlignment as w}from"../../../../../vs/base/browser/ui/contextview/contextview.js";import{DropdownMenuActionViewItem as E}from"../../../../../vs/base/browser/ui/dropdown/dropdownActionViewItem.js";import{Action as H,Separator as v}from"../../../../../vs/base/common/actions.js";import{Delayer as C}from"../../../../../vs/base/common/async.js";import{Emitter as O}from"../../../../../vs/base/common/event.js";import{Iterable as V}from"../../../../../vs/base/common/iterator.js";import{ThemeIcon as z}from"../../../../../vs/base/common/themables.js";import{localize as o}from"../../../../../vs/nls.js";import{IContextMenuService as _}from"../../../../../vs/platform/contextview/browser/contextView.js";import{IInstantiationService as k}from"../../../../../vs/platform/instantiation/common/instantiation.js";import{StorageScope as D,StorageTarget as R}from"../../../../../vs/platform/storage/common/storage.js";import{ContextScopedSuggestEnabledInputWithHistory as $}from"../../../../../vs/workbench/contrib/codeEditor/browser/suggestEnabledInput/suggestEnabledInput.js";import{testingFilterIcon as L}from"../../../../../vs/workbench/contrib/testing/browser/icons.js";import{StoredValue as M}from"../../../../../vs/workbench/contrib/testing/common/storedValue.js";import{ITestExplorerFilterState as P,TestFilterTerm as l}from"../../../../../vs/workbench/contrib/testing/common/testExplorerFilterState.js";import{ITestService as S}from"../../../../../vs/workbench/contrib/testing/common/testService.js";import{denamespaceTestTag as B}from"../../../../../vs/workbench/contrib/testing/common/testTypes.js";const y={[l.Failed]:o("testing.filters.showOnlyFailed","Show Only Failed Tests"),[l.Executed]:o("testing.filters.showOnlyExecuted","Show Only Executed Tests"),[l.CurrentDoc]:o("testing.filters.currentFile","Show in Active File Only"),[l.OpenedFiles]:o("testing.filters.openedFiles","Show in Opened Files Only"),[l.Hidden]:o("testing.filters.showExcludedTests","Show Hidden Tests")};let g=class extends b{constructor(e,r,s,i,t){super(null,e,r);this.state=s;this.instantiationService=i;this.testService=t;this.updateFilterActiveState(),this._register(t.excluded.onTestExclusionsChanged(this.updateFilterActiveState,this))}input;wrapper;focusEmitter=this._register(new O);onDidFocus=this.focusEmitter.event;history=this._register(this.instantiationService.createInstance(M,{key:"testing.filterHistory2",scope:D.WORKSPACE,target:R.MACHINE}));filtersAction=new H("markersFiltersAction",o("testing.filters.menu","More Filters..."),"testing-filter-button "+z.asClassName(L));render(e){e.classList.add("testing-filter-action-item");const r=this._register(new C(400)),s=this.wrapper=m.$(".testing-filter-wrapper");e.appendChild(s);let i=this.history.get({lastValue:"",values:[]});i instanceof Array&&(i={lastValue:"",values:i}),i.lastValue&&this.state.setText(i.lastValue);const t=this.input=this._register(this.instantiationService.createInstance($,{id:"testing.explorer.filter",ariaLabel:o("testExplorerFilterLabel","Filter text for tests in the explorer"),parent:s,suggestionProvider:{triggerCharacters:["@"],provideResults:()=>[...Object.entries(y).map(([n,c])=>({label:n,detail:c})),...V.map(this.testService.collection.tags.values(),n=>{const{ctrlId:c,tagId:h}=B(n.id),x=`@${c}:${h}`;return{label:`@${c}:${h}`,detail:this.testService.collection.getNodeById(c)?.item.label,insertText:h.includes(" ")?`@${c}:"${h.replace(/(["\\])/g,"\\$1")}"`:x}})].filter(n=>!this.state.text.value.includes(n.label))},resourceHandle:"testing:filter",suggestOptions:{value:this.state.text.value,placeholderText:o("testExplorerFilter","Filter (e.g. text, !exclude, @tag)")},history:i.values}));this._register(this.state.text.onDidChange(n=>{t.getValue()!==n&&t.setValue(n)})),this._register(this.state.onDidRequestInputFocus(()=>{t.focus()})),this._register(t.onDidFocus(()=>{this.focusEmitter.fire()})),this._register(t.onInputDidChange(()=>r.trigger(()=>{t.addToHistory(),this.state.setText(t.getValue())}))),this._register(new T(e,{actionViewItemProvider:(n,c)=>{if(n.id===this.filtersAction.id)return this.instantiationService.createInstance(p,n,c,this.state,this.actionRunner)}})).push(this.filtersAction,{icon:!0,label:!1}),this.layout(this.wrapper.clientWidth)}layout(e){this.input.layout(new m.Dimension(e-24-8-22,20))}focus(){this.input.focus()}saveState(){this.history.store({lastValue:this.input.getValue(),values:this.input.getHistory()})}dispose(){this.saveState(),super.dispose()}updateFilterActiveState(){this.filtersAction.checked=this.testService.excluded.hasAny}};g=f([u(2,P),u(3,k),u(4,S)],g);let p=class extends E{constructor(e,r,s,i,t,I){super(e,{getActions:()=>this.getActions()},t,{actionRunner:i,classNames:e.class,anchorAlignmentProvider:()=>w.RIGHT,menuAsChild:!0});this.filters=s;this.testService=I}render(e){super.render(e),this.updateChecked()}getActions(){return[...[l.Failed,l.Executed,l.CurrentDoc,l.OpenedFiles].map(e=>({checked:this.filters.isFilteringFor(e),class:void 0,enabled:!0,id:e,label:y[e],run:()=>this.filters.toggleFilteringFor(e),tooltip:"",dispose:()=>null})),new v,{checked:this.filters.fuzzy.value,class:void 0,enabled:!0,id:"fuzzy",label:o("testing.filters.fuzzyMatch","Fuzzy Match"),run:()=>this.filters.fuzzy.value=!this.filters.fuzzy.value,tooltip:""},new v,{checked:this.filters.isFilteringFor(l.Hidden),class:void 0,enabled:this.testService.excluded.hasAny,id:"showExcluded",label:o("testing.filters.showExcludedTests","Show Hidden Tests"),run:()=>this.filters.toggleFilteringFor(l.Hidden),tooltip:""},{class:void 0,enabled:this.testService.excluded.hasAny,id:"removeExcluded",label:o("testing.filters.removeTestExclusions","Unhide All Tests"),run:async()=>this.testService.excluded.clear(),tooltip:""}]}updateChecked(){this.element.classList.toggle("checked",this._action.checked)}};p=f([u(4,_),u(5,S)],p);export{g as TestingExplorerFilter};