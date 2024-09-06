var y=Object.defineProperty;var m=Object.getOwnPropertyDescriptor;var l=(u,n,e,t)=>{for(var i=t>1?void 0:t?m(n,e):n,r=u.length-1,o;r>=0;r--)(o=u[r])&&(i=(t?o(n,e,i):o(i))||i);return t&&i&&y(n,e,i),i},s=(u,n)=>(e,t)=>n(e,t,u);import{getWindow as p}from"../../../base/browser/dom.js";import{CancellationToken as k}from"../../../base/common/cancellation.js";import{Emitter as I}from"../../../base/common/event.js";import{IConfigurationService as S}from"../../configuration/common/configuration.js";import{IContextKeyService as C,RawContextKey as Q}from"../../contextkey/common/contextkey.js";import{IInstantiationService as x}from"../../instantiation/common/instantiation.js";import{ILayoutService as B}from"../../layout/browser/layoutService.js";import{IOpenerService as P}from"../../opener/common/opener.js";import{defaultButtonStyles as _,defaultCountBadgeStyles as T,defaultInputBoxStyles as b,defaultKeybindingLabelStyles as F,defaultProgressBarStyles as w,defaultToggleStyles as K,getListStyles as O}from"../../theme/browser/defaultStyles.js";import{activeContrastBorder as d,asCssVariable as c,pickerGroupBorder as q,pickerGroupForeground as A,quickInputBackground as g,quickInputForeground as L,quickInputListFocusBackground as f,quickInputListFocusForeground as v,quickInputListFocusIconForeground as H,quickInputTitleBackground as D,widgetBorder as G,widgetShadow as W}from"../../theme/common/colorRegistry.js";import{IThemeService as M,Themable as N}from"../../theme/common/themeService.js";import"../common/quickAccess.js";import"../common/quickInput.js";import{QuickAccessController as E}from"./quickAccess.js";import{QuickInputHoverDelegate as V}from"./quickInput.js";import{QuickInputController as R}from"./quickInputController.js";let a=class extends N{constructor(e,t,i,r,o){super(i);this.instantiationService=e;this.contextKeyService=t;this.layoutService=r;this.configurationService=o}get backButton(){return this.controller.backButton}_onShow=this._register(new I);onShow=this._onShow.event;_onHide=this._register(new I);onHide=this._onHide.event;_controller;get controller(){return this._controller||(this._controller=this._register(this.createController())),this._controller}get hasController(){return!!this._controller}get currentQuickInput(){return this.controller.currentQuickInput}_quickAccess;get quickAccess(){return this._quickAccess||(this._quickAccess=this._register(this.instantiationService.createInstance(E))),this._quickAccess}contexts=new Map;createController(e=this.layoutService,t){const i={idPrefix:"quickInput_",container:e.activeContainer,ignoreFocusOut:()=>!1,backKeybindingLabel:()=>{},setContextKey:o=>this.setContextKey(o),linkOpenerDelegate:o=>{this.instantiationService.invokeFunction(h=>{h.get(P).open(o,{allowCommands:!0,fromUserGesture:!0})})},returnFocus:()=>e.focus(),styles:this.computeStyles(),hoverDelegate:this._register(this.instantiationService.createInstance(V))},r=this._register(this.instantiationService.createInstance(R,{...i,...t}));return r.layout(e.activeContainerDimension,e.activeContainerOffset.quickPickTop),this._register(e.onDidLayoutActiveContainer(o=>{p(e.activeContainer)===p(r.container)&&r.layout(o,e.activeContainerOffset.quickPickTop)})),this._register(e.onDidChangeActiveContainer(()=>{r.isVisible()||r.layout(e.activeContainerDimension,e.activeContainerOffset.quickPickTop)})),this._register(r.onShow(()=>{this.resetContextKeys(),this._onShow.fire()})),this._register(r.onHide(()=>{this.resetContextKeys(),this._onHide.fire()})),r}setContextKey(e){let t;e&&(t=this.contexts.get(e),t||(t=new Q(e,!1).bindTo(this.contextKeyService),this.contexts.set(e,t))),!(t&&t.get())&&(this.resetContextKeys(),t?.set(!0))}resetContextKeys(){this.contexts.forEach(e=>{e.get()&&e.reset()})}pick(e,t,i=k.None){return this.controller.pick(e,t,i)}input(e={},t=k.None){return this.controller.input(e,t)}createQuickPick(e={useSeparators:!1}){return this.controller.createQuickPick(e)}createInputBox(){return this.controller.createInputBox()}createQuickWidget(){return this.controller.createQuickWidget()}focus(){this.controller.focus()}toggle(){this.controller.toggle()}navigate(e,t){this.controller.navigate(e,t)}accept(e){return this.controller.accept(e)}back(){return this.controller.back()}cancel(){return this.controller.cancel()}updateStyles(){this.hasController&&this.controller.applyStyles(this.computeStyles())}computeStyles(){return{widget:{quickInputBackground:c(g),quickInputForeground:c(L),quickInputTitleBackground:c(D),widgetBorder:c(G),widgetShadow:c(W)},inputBox:b,toggle:K,countBadge:T,button:_,progressBar:w,keybindingLabel:F,list:O({listBackground:g,listFocusBackground:f,listFocusForeground:v,listInactiveFocusForeground:v,listInactiveSelectionIconForeground:H,listInactiveFocusBackground:f,listFocusOutline:d,listInactiveFocusOutline:d}),pickerGroup:{pickerGroupBorder:c(q),pickerGroupForeground:c(A)}}}};a=l([s(0,x),s(1,C),s(2,M),s(3,B),s(4,S)],a);export{a as QuickInputService};
