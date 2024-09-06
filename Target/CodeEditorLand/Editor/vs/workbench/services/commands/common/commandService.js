var E=Object.defineProperty;var u=Object.getOwnPropertyDescriptor;var v=(r,o,e,t)=>{for(var n=t>1?void 0:t?u(o,e):o,i=r.length-1,a;i>=0;i--)(a=r[i])&&(n=(t?a(o,e,n):a(n))||n);return t&&n&&E(o,e,n),n},s=(r,o)=>(e,t)=>o(e,t,r);import{timeout as _}from"../../../../base/common/async.js";import{Emitter as d,Event as l}from"../../../../base/common/event.js";import{Disposable as x}from"../../../../base/common/lifecycle.js";import{CommandsRegistry as c,ICommandService as y}from"../../../../platform/commands/common/commands.js";import{InstantiationType as h,registerSingleton as C}from"../../../../platform/instantiation/common/extensions.js";import{IInstantiationService as I}from"../../../../platform/instantiation/common/instantiation.js";import{ILogService as p}from"../../../../platform/log/common/log.js";import{IExtensionService as S}from"../../extensions/common/extensions.js";let m=class extends x{constructor(e,t,n){super();this._instantiationService=e;this._extensionService=t;this._logService=n;this._extensionService.whenInstalledExtensionsRegistered().then(i=>this._extensionHostIsReady=i),this._starActivation=null}_extensionHostIsReady=!1;_starActivation;_onWillExecuteCommand=this._register(new d);onWillExecuteCommand=this._onWillExecuteCommand.event;_onDidExecuteCommand=new d;onDidExecuteCommand=this._onDidExecuteCommand.event;_activateStar(){return this._starActivation||(this._starActivation=Promise.race([this._extensionService.activateByEvent("*"),_(3e4)])),this._starActivation}async executeCommand(e,...t){this._logService.trace("CommandService#executeCommand",e);const n=`onCommand:${e}`;return c.getCommand(e)?this._extensionService.activationEventIsDone(n)?this._tryExecuteCommand(e,t):this._extensionHostIsReady?(await this._extensionService.activateByEvent(n),this._tryExecuteCommand(e,t)):(this._extensionService.activateByEvent(n),this._tryExecuteCommand(e,t)):(await Promise.all([this._extensionService.activateByEvent(n),Promise.race([this._activateStar(),l.toPromise(l.filter(c.onDidRegisterCommand,a=>a===e))])]),this._tryExecuteCommand(e,t))}_tryExecuteCommand(e,t){const n=c.getCommand(e);if(!n)return Promise.reject(new Error(`command '${e}' not found`));try{this._onWillExecuteCommand.fire({commandId:e,args:t});const i=this._instantiationService.invokeFunction(n.handler,...t);return this._onDidExecuteCommand.fire({commandId:e,args:t}),Promise.resolve(i)}catch(i){return Promise.reject(i)}}};m=v([s(0,I),s(1,S),s(2,p)],m),C(y,m,h.Delayed);export{m as CommandService};
