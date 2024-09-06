var m=Object.defineProperty;var p=Object.getOwnPropertyDescriptor;var d=(e,a,t,o)=>{for(var i=o>1?void 0:o?p(a,t):a,y=e.length-1,n;y>=0;y--)(n=e[y])&&(i=(o?n(a,t,i):n(i))||i);return o&&i&&m(a,t,i),i},s=(e,a)=>(t,o)=>a(t,o,e);import{Emitter as c}from"../../../../vs/base/common/event.js";import{Disposable as b}from"../../../../vs/base/common/lifecycle.js";import*as L from"../../../../vs/base/common/platform.js";import{createDecorator as l}from"../../../../vs/platform/instantiation/common/instantiation.js";import"../../../../vs/platform/keyboardLayout/common/keyboardLayoutService.js";import{ILifecycleMainService as h,LifecycleMainPhase as v}from"../../../../vs/platform/lifecycle/electron-main/lifecycleMainService.js";const C=l("keyboardLayoutMainService");let r=class extends b{_onDidChangeKeyboardLayout=this._register(new c);onDidChangeKeyboardLayout=this._onDidChangeKeyboardLayout.event;_initPromise;_keyboardLayoutData;constructor(a){super(),this._initPromise=null,this._keyboardLayoutData=null,a.when(v.AfterWindowOpen).then(()=>this._initialize())}_initialize(){return this._initPromise||(this._initPromise=this._doInitialize()),this._initPromise}async _doInitialize(){const a=await import("native-keymap");this._keyboardLayoutData=u(a),L.isCI||a.onDidChangeKeyboardLayout(()=>{this._keyboardLayoutData=u(a),this._onDidChangeKeyboardLayout.fire(this._keyboardLayoutData)})}async getKeyboardLayoutData(){return await this._initialize(),this._keyboardLayoutData}};r=d([s(0,h)],r);function u(e){const a=e.getKeyMap(),t=e.getCurrentKeyboardLayout();return{keyboardMapping:a,keyboardLayoutInfo:t}}export{C as IKeyboardLayoutMainService,r as KeyboardLayoutMainService};
