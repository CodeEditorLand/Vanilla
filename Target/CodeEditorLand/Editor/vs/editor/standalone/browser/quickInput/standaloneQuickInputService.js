var f=Object.defineProperty;var h=Object.getOwnPropertyDescriptor;var v=(n,e,t,i)=>{for(var r=i>1?void 0:i?h(e,t):e,c=n.length-1,u;c>=0;c--)(u=n[c])&&(r=(i?u(e,t,r):u(r))||r);return i&&r&&f(e,t,r),r},o=(n,e)=>(t,i)=>e(t,i,n);import"./standaloneQuickInput.css";import{CancellationToken as S}from"../../../../base/common/cancellation.js";import{Event as I}from"../../../../base/common/event.js";import{createSingleCallFunction as y}from"../../../../base/common/functional.js";import{IConfigurationService as P}from"../../../../platform/configuration/common/configuration.js";import{IContextKeyService as Q}from"../../../../platform/contextkey/common/contextkey.js";import{IInstantiationService as g}from"../../../../platform/instantiation/common/instantiation.js";import{QuickInputService as E}from"../../../../platform/quickinput/browser/quickInputService.js";import{IThemeService as T}from"../../../../platform/theme/common/themeService.js";import{OverlayWidgetPositionPreference as D}from"../../../browser/editorBrowser.js";import{EditorContributionInstantiation as b,registerEditorContribution as O}from"../../../browser/editorExtensions.js";import{ICodeEditorService as l}from"../../../browser/services/codeEditorService.js";import{EditorScopedLayoutService as w}from"../standaloneLayoutService.js";let s=class extends E{host=void 0;constructor(e,t,i,r,c,u){super(t,i,r,new w(e.getContainerDomNode(),c),u);const k=d.get(e);if(k){const a=k.widget;this.host={_serviceBrand:void 0,get mainContainer(){return a.getDomNode()},getContainer(){return a.getDomNode()},whenContainerStylesLoaded(){},get containers(){return[a.getDomNode()]},get activeContainer(){return a.getDomNode()},get mainContainerDimension(){return e.getLayoutInfo()},get activeContainerDimension(){return e.getLayoutInfo()},get onDidLayoutMainContainer(){return e.onDidLayoutChange},get onDidLayoutActiveContainer(){return e.onDidLayoutChange},get onDidLayoutContainer(){return I.map(e.onDidLayoutChange,C=>({container:a.getDomNode(),dimension:C}))},get onDidChangeActiveContainer(){return I.None},get onDidAddContainer(){return I.None},get mainContainerOffset(){return{top:0,quickPickTop:0}},get activeContainerOffset(){return{top:0,quickPickTop:0}},focus:()=>e.focus()}}else this.host=void 0}createController(){return super.createController(this.host)}};s=v([o(1,g),o(2,Q),o(3,T),o(4,l),o(5,P)],s);let p=class{constructor(e,t){this.instantiationService=e;this.codeEditorService=t}mapEditorToService=new Map;get activeService(){const e=this.codeEditorService.getFocusedCodeEditor();if(!e)throw new Error("Quick input service needs a focused editor to work.");let t=this.mapEditorToService.get(e);if(!t){const i=t=this.instantiationService.createInstance(s,e);this.mapEditorToService.set(e,t),y(e.onDidDispose)(()=>{i.dispose(),this.mapEditorToService.delete(e)})}return t}get currentQuickInput(){return this.activeService.currentQuickInput}get quickAccess(){return this.activeService.quickAccess}get backButton(){return this.activeService.backButton}get onShow(){return this.activeService.onShow}get onHide(){return this.activeService.onHide}pick(e,t,i=S.None){return this.activeService.pick(e,t,i)}input(e,t){return this.activeService.input(e,t)}createQuickPick(e={useSeparators:!1}){return this.activeService.createQuickPick(e)}createInputBox(){return this.activeService.createInputBox()}createQuickWidget(){return this.activeService.createQuickWidget()}focus(){return this.activeService.focus()}toggle(){return this.activeService.toggle()}navigate(e,t){return this.activeService.navigate(e,t)}accept(){return this.activeService.accept()}back(){return this.activeService.back()}cancel(){return this.activeService.cancel()}};p=v([o(0,g),o(1,l)],p);class d{constructor(e){this.editor=e}static ID="editor.controller.quickInput";static get(e){return e.getContribution(d.ID)}widget=new m(this.editor);dispose(){this.widget.dispose()}}class m{constructor(e){this.codeEditor=e;this.domNode=document.createElement("div"),this.codeEditor.addOverlayWidget(this)}static ID="editor.contrib.quickInputWidget";domNode;getId(){return m.ID}getDomNode(){return this.domNode}getPosition(){return{preference:D.TOP_CENTER}}dispose(){this.codeEditor.removeOverlayWidget(this)}}O(d.ID,d,b.Lazy);export{d as QuickInputEditorContribution,m as QuickInputEditorWidget,p as StandaloneQuickInputService};
