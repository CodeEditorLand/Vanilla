var E=Object.defineProperty;var x=Object.getOwnPropertyDescriptor;var I=(p,c,t,e)=>{for(var i=e>1?void 0:e?x(c,t):c,r=p.length-1,s;r>=0;r--)(s=p[r])&&(i=(e?s(c,t,i):s(i))||i);return e&&i&&E(c,t,i),i},a=(p,c)=>(t,e)=>c(t,e,p);import{RunOnceScheduler as A}from"../../../../base/common/async.js";import{Emitter as y,Event as C}from"../../../../base/common/event.js";import"../../../../base/common/jsonSchema.js";import{Disposable as k}from"../../../../base/common/lifecycle.js";import T from"../../../../base/common/severity.js";import*as L from"../../../../base/common/strings.js";import{isCodeEditor as F}from"../../../../editor/browser/editorBrowser.js";import"../../../../editor/common/editorCommon.js";import{ILanguageService as N}from"../../../../editor/common/languages/language.js";import"../../../../editor/common/model.js";import*as g from"../../../../nls.js";import{IMenuService as P,MenuId as O,MenuItemAction as M}from"../../../../platform/actions/common/actions.js";import{ICommandService as _}from"../../../../platform/commands/common/commands.js";import{IConfigurationService as R}from"../../../../platform/configuration/common/configuration.js";import{IContextKeyService as w}from"../../../../platform/contextkey/common/contextkey.js";import{IDialogService as B}from"../../../../platform/dialogs/common/dialogs.js";import{IInstantiationService as z}from"../../../../platform/instantiation/common/instantiation.js";import{Extensions as K}from"../../../../platform/jsonschemas/common/jsonContributionRegistry.js";import{IQuickInputService as J}from"../../../../platform/quickinput/common/quickInput.js";import{Registry as W}from"../../../../platform/registry/common/platform.js";import"../../../../platform/workspace/common/workspace.js";import{launchSchemaId as V}from"../../../services/configuration/common/configuration.js";import{IEditorService as H}from"../../../services/editor/common/editorService.js";import{IExtensionService as q}from"../../../services/extensions/common/extensions.js";import{ILifecycleService as Q,LifecyclePhase as G}from"../../../services/lifecycle/common/lifecycle.js";import{TaskDefinitionRegistry as X}from"../../tasks/common/taskDefinitionRegistry.js";import{ITaskService as $}from"../../tasks/common/taskService.js";import{Breakpoints as j}from"../common/breakpoints.js";import{CONTEXT_DEBUG_EXTENSION_AVAILABLE as U,CONTEXT_DEBUGGERS_AVAILABLE as Y,INTERNAL_CONSOLE_OPTIONS_SCHEMA as Z}from"../common/debug.js";import{Debugger as ee}from"../common/debugger.js";import{breakpointsExtPoint as te,debuggersExtPoint as ie,launchSchema as v,presentationSchema as re}from"../common/debugSchemas.js";const ne=W.as(K.JSONContribution);let f=class extends k{constructor(t,e,i,r,s,u,l,d,D,S,n,o,b){super();this.editorService=e;this.configurationService=i;this.quickInputService=r;this.instantiationService=s;this.commandService=u;this.extensionService=l;this.contextKeyService=d;this.languageService=D;this.dialogService=S;this.lifecycleService=n;this.tasksService=o;this.menuService=b;this.adapterDescriptorFactories=[],this.debuggers=[],this.registerListeners(),this.contextKeyService.bufferChangeEvents(()=>{this.debuggersAvailable=Y.bindTo(d),this.debugExtensionsAvailable=U.bindTo(d)}),this._register(this.contextKeyService.onDidChangeContext(m=>{m.affectsSome(this.debuggerWhenKeys)&&(this.debuggersAvailable.set(this.hasEnabledDebuggers()),this.updateDebugAdapterSchema())})),this._register(this.onDidDebuggersExtPointRead(()=>{this.debugExtensionsAvailable.set(this.debuggers.length>0)}));const h=this._register(new A(()=>this.updateTaskLabels(),5e3));this._register(C.any(o.onDidChangeTaskConfig,o.onDidChangeTaskProviders)(()=>{h.cancel(),h.schedule()})),this.lifecycleService.when(G.Eventually).then(()=>this.debugExtensionsAvailable.set(this.debuggers.length>0)),this._register(t.onDidNewSession(m=>{this.usedDebugTypes.add(m.configuration.type)})),h.schedule()}debuggers;adapterDescriptorFactories;debugAdapterFactories=new Map;debuggersAvailable;debugExtensionsAvailable;_onDidRegisterDebugger=new y;_onDidDebuggersExtPointRead=new y;breakpointContributions=[];debuggerWhenKeys=new Set;taskLabels=[];earlyActivatedExtensions;usedDebugTypes=new Set;registerListeners(){ie.setHandler((t,e)=>{e.added.forEach(i=>{i.value.forEach(r=>{if((!r.type||typeof r.type!="string")&&i.collector.error(g.localize("debugNoType","Debugger 'type' can not be omitted and must be of type 'string'.")),r.type!=="*"){const s=this.getDebugger(r.type);if(s)s.merge(r,i.description);else{const u=this.instantiationService.createInstance(ee,this,r,i.description);u.when?.keys().forEach(l=>this.debuggerWhenKeys.add(l)),this.debuggers.push(u)}}})}),t.forEach(i=>{i.value.forEach(r=>{r.type==="*"&&this.debuggers.forEach(s=>s.merge(r,i.description))})}),e.removed.forEach(i=>{const r=i.value.map(s=>s.type);this.debuggers=this.debuggers.filter(s=>r.indexOf(s.type)===-1)}),this.updateDebugAdapterSchema(),this._onDidDebuggersExtPointRead.fire()}),te.setHandler(t=>{this.breakpointContributions=t.flatMap(e=>e.value.map(i=>this.instantiationService.createInstance(j,i)))})}updateTaskLabels(){this.tasksService.getKnownTasks().then(t=>{this.taskLabels=t.map(e=>e._label),this.updateDebugAdapterSchema()})}updateDebugAdapterSchema(){const t=v.properties.configurations.items,e=X.getJsonSchema(),i={common:{properties:{name:{type:"string",description:g.localize("debugName","Name of configuration; appears in the launch configuration dropdown menu."),default:"Launch"},debugServer:{type:"number",description:g.localize("debugServer","For debug extension development only: if a port is specified VS Code tries to connect to a debug adapter running in server mode"),default:4711},preLaunchTask:{anyOf:[e,{type:["string"]}],default:"",defaultSnippets:[{body:{task:"",type:""}}],description:g.localize("debugPrelaunchTask","Task to run before debug session starts."),examples:this.taskLabels},postDebugTask:{anyOf:[e,{type:["string"]}],default:"",defaultSnippets:[{body:{task:"",type:""}}],description:g.localize("debugPostDebugTask","Task to run after debug session ends."),examples:this.taskLabels},presentation:re,internalConsoleOptions:Z,suppressMultipleSessionWarning:{type:"boolean",description:g.localize("suppressMultipleSessionWarning","Disable the warning when trying to start the same debug configuration more than once."),default:!0}}}};v.definitions=i,t.oneOf=[],t.defaultSnippets=[],this.debuggers.forEach(r=>{const s=r.getSchemaAttributes(i);s&&t.oneOf&&t.oneOf.push(...s);const u=r.configurationSnippets;u&&t.defaultSnippets&&t.defaultSnippets.push(...u)}),ne.registerSchema(V,v)}registerDebugAdapterFactory(t,e){return t.forEach(i=>this.debugAdapterFactories.set(i,e)),this.debuggersAvailable.set(this.hasEnabledDebuggers()),this._onDidRegisterDebugger.fire(),{dispose:()=>{t.forEach(i=>this.debugAdapterFactories.delete(i))}}}hasEnabledDebuggers(){for(const[t]of this.debugAdapterFactories){const e=this.getDebugger(t);if(e&&e.enabled)return!0}return!1}createDebugAdapter(t){const e=this.debugAdapterFactories.get(t.configuration.type);if(e)return e.createDebugAdapter(t)}substituteVariables(t,e,i){const r=this.debugAdapterFactories.get(t);return r?r.substituteVariables(e,i):Promise.resolve(i)}runInTerminal(t,e,i){const r=this.debugAdapterFactories.get(t);return r?r.runInTerminal(e,i):Promise.resolve(void 0)}registerDebugAdapterDescriptorFactory(t){return this.adapterDescriptorFactories.push(t),{dispose:()=>{this.unregisterDebugAdapterDescriptorFactory(t)}}}unregisterDebugAdapterDescriptorFactory(t){const e=this.adapterDescriptorFactories.indexOf(t);e>=0&&this.adapterDescriptorFactories.splice(e,1)}getDebugAdapterDescriptor(t){const e=t.configuration,i=this.adapterDescriptorFactories.filter(r=>r.type===e.type&&r.createDebugAdapterDescriptor);return i.length===1?i[0].createDebugAdapterDescriptor(t):Promise.resolve(void 0)}getDebuggerLabel(t){const e=this.getDebugger(t);if(e)return e.label}get onDidRegisterDebugger(){return this._onDidRegisterDebugger.event}get onDidDebuggersExtPointRead(){return this._onDidDebuggersExtPointRead.event}canSetBreakpointsIn(t){const e=t.getLanguageId();return!e||e==="jsonc"||e==="log"?!1:this.configurationService.getValue("debug").allowBreakpointsEverywhere?!0:this.breakpointContributions.some(i=>i.language===e&&i.enabled)}getDebugger(t){return this.debuggers.find(e=>L.equalsIgnoreCase(e.type,t))}getEnabledDebugger(t){const e=this.getDebugger(t);return e&&e.enabled?e:void 0}someDebuggerInterestedInLanguage(t){return!!this.debuggers.filter(e=>e.enabled).find(e=>e.interestedInLanguage(t))}async guessDebugger(t){const e=this.editorService.activeTextEditorControl;let i=[],r=null,s=null;if(F(e)){s=e.getModel();const n=s?s.getLanguageId():void 0;n&&(r=this.languageService.getLanguageName(n));const o=this.debuggers.filter(b=>b.enabled).filter(b=>n&&b.interestedInLanguage(n));if(o.length===1)return o[0];o.length>1&&(i=o)}if((!r||t||s&&this.canSetBreakpointsIn(s))&&i.length===0&&(await this.activateDebuggers("onDebugInitialConfigurations"),i=this.debuggers.filter(n=>n.enabled).filter(n=>n.hasInitialConfiguration()||n.hasDynamicConfigurationProviders()||n.hasConfigurationProvider())),i.length===0&&r){r.indexOf(" ")>=0&&(r=`'${r}'`);const{confirmed:n}=await this.dialogService.confirm({type:T.Warning,message:g.localize("CouldNotFindLanguage","You don't have an extension for debugging {0}. Should we find a {0} extension in the Marketplace?",r),primaryButton:g.localize({key:"findExtension",comment:["&& denotes a mnemonic"]},"&&Find {0} extension",r)});n&&await this.commandService.executeCommand("debug.installAdditionalDebuggers",r);return}this.initExtensionActivationsIfNeeded(),i.sort((n,o)=>n.label.localeCompare(o.label)),i=i.filter(n=>!n.isHiddenFromDropdown);const u=[],l=[];i.forEach(n=>{const o=n.getMainExtensionDescriptor();o.id&&this.earlyActivatedExtensions?.has(o.id)||this.usedDebugTypes.has(n.type)?u.push(n):l.push(n)});const d=[];u.length>0&&d.push({type:"separator",label:g.localize("suggestedDebuggers","Suggested")},...u.map(n=>({label:n.label,debugger:n}))),l.length>0&&(d.length>0&&d.push({type:"separator",label:""}),d.push(...l.map(n=>({label:n.label,debugger:n})))),d.push({type:"separator",label:""},{label:r?g.localize("installLanguage","Install an extension for {0}...",r):g.localize("installExt","Install extension...")});const D=this.menuService.getMenuActions(O.DebugCreateConfiguration,this.contextKeyService);for(const[,n]of D)for(const o of n)d.push(o);const S=g.localize("selectDebug","Select debugger");return this.quickInputService.pick(d,{activeItem:d[0],placeHolder:S}).then(async n=>{if(n&&"debugger"in n&&n.debugger)return n.debugger;if(n instanceof M){n.run();return}n&&this.commandService.executeCommand("debug.installAdditionalDebuggers",r)})}initExtensionActivationsIfNeeded(){if(!this.earlyActivatedExtensions){this.earlyActivatedExtensions=new Set;const t=this.extensionService.getExtensionsStatus();for(const e in t)t[e].activationTimes&&this.earlyActivatedExtensions.add(e)}}async activateDebuggers(t,e){this.initExtensionActivationsIfNeeded();const i=[this.extensionService.activateByEvent(t),this.extensionService.activateByEvent("onDebug")];e&&i.push(this.extensionService.activateByEvent(`${t}:${e}`)),await Promise.all(i)}};f=I([a(1,H),a(2,R),a(3,J),a(4,z),a(5,_),a(6,q),a(7,w),a(8,N),a(9,B),a(10,Q),a(11,$),a(12,P)],f);export{f as AdapterManager};
