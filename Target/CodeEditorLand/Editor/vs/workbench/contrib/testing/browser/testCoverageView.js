var J=Object.defineProperty;var X=Object.getOwnPropertyDescriptor;var b=(s,e,t,r)=>{for(var i=r>1?void 0:r?X(e,t):e,a=s.length-1,o;a>=0;a--)(o=s[a])&&(i=(r?o(e,t,i):o(i))||i);return r&&i&&J(e,t,i),i},c=(s,e)=>(t,r)=>e(t,r,s);import*as I from"../../../../base/browser/dom.js";import"../../../../base/browser/ui/list/list.js";import"../../../../base/browser/ui/tree/compressedObjectTreeModel.js";import"../../../../base/browser/ui/tree/objectTree.js";import"../../../../base/browser/ui/tree/tree.js";import{findLast as Y}from"../../../../base/common/arraysFind.js";import{assertNever as Z}from"../../../../base/common/assert.js";import{Codicon as w}from"../../../../base/common/codicons.js";import{memoize as ee}from"../../../../base/common/decorators.js";import{createMatches as te}from"../../../../base/common/filters.js";import{Iterable as h}from"../../../../base/common/iterator.js";import{Disposable as re,DisposableStore as C,MutableDisposable as oe}from"../../../../base/common/lifecycle.js";import{autorun as S,observableValue as ie}from"../../../../base/common/observable.js";import"../../../../base/common/prefixTree.js";import{basenameOrAuthority as y}from"../../../../base/common/resources.js";import{ThemeIcon as ae}from"../../../../base/common/themables.js";import"../../../../base/common/uri.js";import{Position as B}from"../../../../editor/common/core/position.js";import{Range as g}from"../../../../editor/common/core/range.js";import{localize as m,localize2 as H}from"../../../../nls.js";import{Categories as ne}from"../../../../platform/action/common/actionCommonCategories.js";import{Action2 as se,MenuId as P,registerAction2 as V}from"../../../../platform/actions/common/actions.js";import{IConfigurationService as le}from"../../../../platform/configuration/common/configuration.js";import{ContextKeyExpr as O,IContextKeyService as ce}from"../../../../platform/contextkey/common/contextkey.js";import{IContextMenuService as de}from"../../../../platform/contextview/browser/contextView.js";import{EditorOpenSource as me,TextEditorSelectionRevealType as pe}from"../../../../platform/editor/common/editor.js";import{FileKind as A}from"../../../../platform/files/common/files.js";import{IHoverService as ve}from"../../../../platform/hover/browser/hover.js";import{IInstantiationService as D}from"../../../../platform/instantiation/common/instantiation.js";import{IKeybindingService as ue}from"../../../../platform/keybinding/common/keybinding.js";import{ILabelService as ge}from"../../../../platform/label/common/label.js";import{WorkbenchCompressibleObjectTree as be}from"../../../../platform/list/browser/listService.js";import{IOpenerService as Ce}from"../../../../platform/opener/common/opener.js";import{IQuickInputService as _}from"../../../../platform/quickinput/common/quickInput.js";import{ITelemetryService as Te}from"../../../../platform/telemetry/common/telemetry.js";import{IThemeService as fe}from"../../../../platform/theme/common/themeService.js";import{ResourceLabels as Ie}from"../../../browser/labels.js";import{ViewAction as he,ViewPane as Se}from"../../../browser/parts/views/viewPane.js";import{IViewDescriptorService as ye}from"../../../common/views.js";import{ACTIVE_GROUP as De,IEditorService as Ee,SIDE_GROUP as Le}from"../../../services/editor/common/editorService.js";import{TestCommandId as K,Testing as x}from"../common/constants.js";import{onObservableChange as Fe}from"../common/observableUtils.js";import{BypassedFileCoverage as Ne,FileCoverage as U,getTotalCoveragePercent as we}from"../common/testCoverage.js";import{ITestCoverageService as W}from"../common/testCoverageService.js";import{TestId as Q}from"../common/testId.js";import{TestingContextKeys as z}from"../common/testingContextKeys.js";import{DetailType as j,TestResultState as Pe}from"../common/testTypes.js";import*as R from"./codeCoverageDisplayUtils.js";import{testingStatesToIcons as Oe,testingWasCovered as xe}from"./icons.js";import{ManagedTestCoverageBars as q}from"./testCoverageBars.js";var ze=(r=>(r[r.Coverage=0]="Coverage",r[r.Location=1]="Location",r[r.Name=2]="Name",r))(ze||{});let E=class extends Se{constructor(t,r,i,a,o,n,l,N,f,d,G,Ve){super(t,r,i,a,o,n,l,N,f,d,G);this.coverageService=Ve}tree=new oe;sortOrder=ie("sortOrder",1);renderBody(t){super.renderBody(t);const r=this._register(this.instantiationService.createInstance(Ie,{onDidChangeVisibility:this.onDidChangeBodyVisibility}));this._register(S(i=>{const a=this.coverageService.selected.read(i);a?(this.tree.value??=this.instantiationService.createInstance(T,t,r,this.sortOrder)).setInput(a,this.coverageService.filterToTest.read(i)):this.tree.clear()})),this._register(S(i=>{this.element.classList.toggle("coverage-view-is-filtered",!!this.coverageService.filterToTest.read(i))}))}layoutBody(t,r){super.layoutBody(t,r),this.tree.value?.layout(t,r)}};E=b([c(1,ue),c(2,de),c(3,le),c(4,ce),c(5,ye),c(6,D),c(7,Ce),c(8,fe),c(9,Te),c(10,ve),c(11,W)],E);let k=0;class M{constructor(e,t,r){this.uri=e;this.data=t;if(t.location instanceof g)for(const i of r)this.contains(i.location)&&this.containedDetails.add(i)}id=String(k++);containedDetails=new Set;children=[];get hits(){return this.data.count}get label(){return this.data.name}get location(){return this.data.location}get tpc(){const e=this.attributableCoverage();return e&&we(e.statement,e.branch,void 0)}contains(e){const t=this.data.location;return t instanceof g&&(e instanceof g?t.containsRange(e):t.containsPosition(e))}attributableCoverage(){const{location:e,count:t}=this.data;if(!(e instanceof g)||!t)return;const r={covered:0,total:0},i={covered:0,total:0};for(const a of this.containedDetails)if(a.type===j.Statement&&(r.covered+=a.count?1:0,r.total++,a.branches))for(const{count:o}of a.branches)i.covered+=o?1:0,i.total++;return{statement:r,branch:i}}}b([ee],M.prototype,"attributableCoverage",1);class Re{constructor(e){this.n=e}id=String(k++);get label(){return m("functionsWithoutCoverage","{0} declarations without coverage...",this.n)}}class ${id=String(k++);label=m("loadingCoverageDetails","Loading Coverage Details...")}const p=s=>typeof s=="object"&&"value"in s,L=s=>s instanceof M,ke=s=>p(s)&&s.value instanceof U&&!!s.value.declaration?.total;let T=class extends re{tree;inputDisposables=this._register(new C);constructor(e,t,r,i,a){super(),this.tree=i.createInstance(be,"TestCoverageView",e,new Me,[i.createInstance(v,t),i.createInstance(u),i.createInstance(F)],{expandOnlyOnTwistieClick:!0,sorter:new Be(r),keyboardNavigationLabelProvider:{getCompressedNodeKeyboardNavigationLabel(o){return o.map(n=>this.getKeyboardNavigationLabel(n)).join("/")},getKeyboardNavigationLabel(o){return p(o)?y(o.value.uri):o.label}},accessibilityProvider:{getAriaLabel(o){if(p(o)){const n=y(o.value.uri);return m("testCoverageItemLabel","{0} coverage: {0}%",n,(o.value.tpc*100).toFixed(2))}else return o.label},getWidgetAriaLabel(){return m("testCoverageTreeLabel","Test Coverage Explorer")}},identityProvider:new He}),this._register(S(o=>{r.read(o),this.tree.resort(null,!0)})),this._register(this.tree),this._register(this.tree.onDidChangeCollapseState(o=>{const n=o.node.element;!o.node.collapsed&&!o.node.children.length&&n&&ke(n)&&(n.value.hasSynchronousDetails&&this.tree.setChildren(n,[{element:new $,incompressible:!0}]),n.value.details().then(l=>this.updateWithDetails(n,l)))})),this._register(this.tree.onDidOpen(o=>{let n,l;o.element&&(p(o.element)&&!o.element.children?.size?n=o.element.value.uri:L(o.element)&&(n=o.element.uri,l=o.element.location)),n&&a.openEditor({resource:n,options:{selection:l instanceof B?g.fromPositions(l,l):l,revealIfOpened:!0,selectionRevealType:pe.NearTopIfOutsideViewport,preserveFocus:o.editorOptions.preserveFocus,pinned:o.editorOptions.pinned,source:me.USER}},o.sideBySide?Le:De)}))}setInput(e,t){this.inputDisposables.clear();let r=e.tree;t&&(r=e.filterTreeForTest(t));const i=[];for(let o of r.nodes){for(;!(o.value instanceof U)&&o.children?.size===1;)o=h.first(o.children.values());i.push(o)}const a=o=>{const n=!o.children?.size;return{element:o,incompressible:n,collapsed:n,collapsible:!n||!!o.value?.declaration?.total,children:o.children&&h.map(o.children?.values(),a)}};this.inputDisposables.add(Fe(e.didAddCoverage,o=>{const n=Y(o,l=>this.tree.hasElement(l));n&&this.tree.setChildren(n,h.map(n.children?.values()||[],a),{diffIdentityProvider:{getId:l=>l.value.id}})})),this.tree.setChildren(null,h.map(i,a))}layout(e,t){this.tree.layout(e,t)}updateWithDetails(e,t){if(!this.tree.hasElement(e))return;const r=[];for(const a of t){if(a.type!==j.Declaration)continue;let o=r;for(;;){const n=o.find(l=>l.containedDetails.has(a));if(n)o=n.children;else break}o.push(new M(e.value.uri,a,t))}const i=a=>({element:a,incompressible:!0,collapsed:!0,collapsible:a.children.length>0,children:a.children.map(i)});this.tree.setChildren(e,r.map(i))}};T=b([c(3,D),c(4,Ee)],T);class Me{getHeight(e){return 22}getTemplateId(e){if(p(e))return v.ID;if(L(e))return u.ID;if(e instanceof $||e instanceof Re)return F.ID;Z(e)}}class Be{constructor(e){this.order=e}compare(e,t){const r=this.order.get();if(p(e)&&p(t))switch(r){case 1:case 2:return e.value.uri.toString().localeCompare(t.value.uri.toString());case 0:return t.value.tpc-e.value.tpc}else if(L(e)&&L(t))switch(r){case 1:return B.compare(e.location instanceof g?e.location.getStartPosition():e.location,t.location instanceof g?t.location.getStartPosition():t.location);case 2:return e.label.localeCompare(t.label);case 0:{const i=e.tpc,a=t.tpc;return i!==void 0&&a!==void 0&&a-i||+t.hits-+e.hits||e.label.localeCompare(t.label)}}else return 0}}let v=class{constructor(e,t,r){this.labels=e;this.labelService=t;this.instantiationService=r}static ID="F";templateId=v.ID;renderTemplate(e){const t=new C;return e.classList.add("test-coverage-list-item"),{container:e,bars:t.add(this.instantiationService.createInstance(q,{compact:!1,container:e})),label:t.add(this.labels.create(e,{supportHighlights:!0})),elementsDisposables:t.add(new C),templateDisposables:t}}renderElement(e,t,r){this.doRender(e.element,r,e.filterData)}renderCompressedElements(e,t,r){this.doRender(e.element.elements,r,e.filterData)}disposeTemplate(e){e.templateDisposables.dispose()}doRender(e,t,r){t.elementsDisposables.clear();const i=e instanceof Array?e[e.length-1]:e,a=i.value,o=e instanceof Array?e.map(n=>y(n.value.uri)):y(a.uri);a instanceof Ne?t.bars.setCoverageInfo(void 0):(t.elementsDisposables.add(S(n=>{i.value?.didChange.read(n),t.bars.setCoverageInfo(a)})),t.bars.setCoverageInfo(a)),t.label.setResource({resource:a.uri,name:o},{fileKind:i.children?.size?A.FOLDER:A.FILE,matches:te(r),separator:this.labelService.getSeparator(a.uri.scheme,a.uri.authority),extraClasses:["test-coverage-list-item-label"]})}};v=b([c(1,ge),c(2,D)],v);let u=class{constructor(e){this.instantiationService=e}static ID="N";templateId=u.ID;renderTemplate(e){const t=new C;e.classList.add("test-coverage-list-item");const r=I.append(e,I.$(".state")),i=I.append(e,I.$(".name"));return{container:e,bars:t.add(this.instantiationService.createInstance(q,{compact:!1,container:e})),templateDisposables:t,icon:r,label:i}}renderElement(e,t,r){this.doRender(e.element,r,e.filterData)}renderCompressedElements(e,t,r){this.doRender(e.element.elements[e.element.elements.length-1],r,e.filterData)}disposeTemplate(e){e.templateDisposables.dispose()}doRender(e,t,r){const i=!!e.hits,a=i?xe:Oe.get(Pe.Unset);t.container.classList.toggle("not-covered",!i),t.icon.className=`computed-state ${ae.asClassName(a)}`,t.label.innerText=e.label,t.bars.setCoverageInfo(e.attributableCoverage())}};u=b([c(0,D)],u);class F{static ID="B";templateId=F.ID;renderCompressedElements(e,t,r){this.renderInner(e.element.elements[e.element.elements.length-1],r)}renderTemplate(e){return e}renderElement(e,t,r){this.renderInner(e.element,r)}disposeTemplate(){}renderInner(e,t){t.innerText=e.label}}class He{getId(e){return p(e)?e.value.uri.toString():e.id}}V(class extends se{constructor(){super({id:K.CoverageFilterToTest,category:ne.Test,title:H("testing.changeCoverageFilter","Filter Coverage by Test"),icon:w.filter,toggled:{icon:w.filterFilled,condition:z.isCoverageFilteredToTest},menu:[{id:P.CommandPalette,when:z.hasPerTestCoverage},{id:P.ViewTitle,when:O.and(z.hasPerTestCoverage,O.equals("view",x.CoverageViewId)),group:"navigation"}]})}run(e){const t=e.get(W),r=e.get(_),i=t.selected.get();if(!i)return;const a=[...i.allPerTestIDs()].map(Q.fromString),o=Q.getLengthOfCommonPrefix(a.length,d=>a[d]),n=i.result,l=t.filterToTest.get(),N=l?.toString(),f=[{label:R.labels.allTests,id:void 0},{type:"separator"},...a.map(d=>({label:R.getLabelForItem(n,d,o),testId:d}))];r.pick(f,{activeItem:f.find(d=>"testId"in d&&d.testId?.toString()===N),placeHolder:R.labels.pickShowCoverage,onDidFocus:d=>{t.filterToTest.set(d.testId,void 0)}}).then(d=>{t.filterToTest.set(d?d.testId:l,void 0)})}}),V(class extends he{constructor(){super({id:K.CoverageViewChangeSorting,viewId:x.CoverageViewId,title:H("testing.changeCoverageSort","Change Sort Order"),icon:w.sortPrecedence,menu:{id:P.ViewTitle,when:O.equals("view",x.CoverageViewId),group:"navigation"}})}runInView(e,t){const r=new C,i=r.add(e.get(_).createQuickPick()),a=[{label:m("testing.coverageSortByLocation","Sort by Location"),value:1,description:m("testing.coverageSortByLocationDescription","Files are sorted alphabetically, declarations are sorted by position")},{label:m("testing.coverageSortByCoverage","Sort by Coverage"),value:0,description:m("testing.coverageSortByCoverageDescription","Files and declarations are sorted by total coverage")},{label:m("testing.coverageSortByName","Sort by Name"),value:2,description:m("testing.coverageSortByNameDescription","Files and declarations are sorted alphabetically")}];i.placeholder=m("testing.coverageSortPlaceholder","Sort the Test Coverage view..."),i.items=a,i.show(),r.add(i.onDidHide(()=>r.dispose())),r.add(i.onDidAccept(()=>{const o=i.selectedItems[0]?.value;o!==void 0&&(t.sortOrder.set(o,void 0),i.dispose())}))}});export{E as TestCoverageView};
