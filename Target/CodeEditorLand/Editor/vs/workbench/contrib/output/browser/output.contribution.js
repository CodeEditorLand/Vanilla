var M=Object.defineProperty;var Q=Object.getOwnPropertyDescriptor;var E=(I,w,e,t)=>{for(var c=t>1?void 0:t?Q(w,e):w,n=I.length-1,i;n>=0;n--)(i=I[n])&&(c=(t?i(w,e,c):i(c))||c);return t&&c&&M(w,e,c),c},A=(I,w)=>(e,t)=>w(e,t,I);import{Codicon as C}from"../../../../../vs/base/common/codicons.js";import{KeyChord as q,KeyCode as b,KeyMod as L}from"../../../../../vs/base/common/keyCodes.js";import{Disposable as X,dispose as K,toDisposable as H}from"../../../../../vs/base/common/lifecycle.js";import{assertIsDefined as B}from"../../../../../vs/base/common/types.js";import{ModesRegistry as P}from"../../../../../vs/editor/common/languages/modesRegistry.js";import*as s from"../../../../../vs/nls.js";import{AccessibilitySignal as G,IAccessibilitySignalService as Y}from"../../../../../vs/platform/accessibilitySignal/browser/accessibilitySignalService.js";import{Categories as _}from"../../../../../vs/platform/action/common/actionCommonCategories.js";import{Action2 as g,MenuId as p,MenuRegistry as V,registerAction2 as h}from"../../../../../vs/platform/actions/common/actions.js";import{Extensions as $,ConfigurationScope as j}from"../../../../../vs/platform/configuration/common/configurationRegistry.js";import{ContextKeyExpr as m}from"../../../../../vs/platform/contextkey/common/contextkey.js";import{SyncDescriptor as x}from"../../../../../vs/platform/instantiation/common/descriptors.js";import{InstantiationType as J,registerSingleton as Z}from"../../../../../vs/platform/instantiation/common/extensions.js";import"../../../../../vs/platform/instantiation/common/instantiation.js";import{ILoggerService as F,LogLevel as O,LogLevelToLocalizedString as ee,LogLevelToString as te}from"../../../../../vs/platform/log/common/log.js";import{IQuickInputService as D}from"../../../../../vs/platform/quickinput/common/quickInput.js";import{Registry as S}from"../../../../../vs/platform/registry/common/platform.js";import{registerIcon as ie}from"../../../../../vs/platform/theme/common/iconRegistry.js";import{ViewPaneContainer as oe}from"../../../../../vs/workbench/browser/parts/views/viewPaneContainer.js";import{Extensions as ne}from"../../../../../vs/workbench/common/contributions.js";import{Extensions as U,ViewContainerLocation as re}from"../../../../../vs/workbench/common/views.js";import{IDefaultLogLevelsService as se}from"../../../../../vs/workbench/contrib/logs/common/defaultLogLevels.js";import{OutputService as ce}from"../../../../../vs/workbench/contrib/output/browser/outputServices.js";import{OutputViewPane as le}from"../../../../../vs/workbench/contrib/output/browser/outputView.js";import{AUX_WINDOW_GROUP as ue,IEditorService as R}from"../../../../../vs/workbench/services/editor/common/editorService.js";import{IFilesConfigurationService as W}from"../../../../../vs/workbench/services/filesConfiguration/common/filesConfigurationService.js";import{LifecyclePhase as ae}from"../../../../../vs/workbench/services/lifecycle/common/lifecycle.js";import{ACTIVE_OUTPUT_CHANNEL_CONTEXT as pe,CONTEXT_ACTIVE_FILE_OUTPUT as z,CONTEXT_ACTIVE_OUTPUT_LEVEL as ge,CONTEXT_ACTIVE_OUTPUT_LEVEL_IS_DEFAULT as he,CONTEXT_ACTIVE_OUTPUT_LEVEL_SETTABLE as de,CONTEXT_IN_OUTPUT as ve,CONTEXT_OUTPUT_SCROLL_LOCK as me,Extensions as fe,IOutputService as f,LOG_MIME as we,LOG_MODE_ID as Ce,OUTPUT_MIME as Oe,OUTPUT_MODE_ID as Ie,OUTPUT_VIEW_ID as d}from"../../../../../vs/workbench/services/output/common/output.js";import{IViewsService as Se}from"../../../../../vs/workbench/services/views/common/viewsService.js";Z(f,ce,J.Delayed),P.registerLanguage({id:Ie,extensions:[],mimetypes:[Oe]}),P.registerLanguage({id:Ce,extensions:[],mimetypes:[we]});const N=ie("output-view-icon",C.output,s.localize("outputViewIcon","View icon of the output view.")),ye=S.as(U.ViewContainersRegistry).registerViewContainer({id:d,title:s.localize2("output","Output"),icon:N,order:1,ctorDescriptor:new x(oe,[d,{mergeViewWithContainerWhenSingleView:!0}]),storageId:d,hideIfEmpty:!0},re.Panel,{doNotRegisterOpenCommand:!0});S.as(U.ViewsRegistry).registerViews([{id:d,name:s.localize2("output","Output"),containerIcon:N,canMoveView:!0,canToggleVisibility:!1,ctorDescriptor:new x(le),openCommandActionDescriptor:{id:"workbench.action.output.toggleOutput",mnemonicTitle:s.localize({key:"miToggleOutput",comment:["&& denotes a mnemonic"]},"&&Output"),keybindings:{primary:L.CtrlCmd|L.Shift|b.KeyU,linux:{primary:q(L.CtrlCmd|b.KeyK,L.CtrlCmd|b.KeyH)}},order:1}}],ye);let y=class extends X{constructor(e,t,c){super();this.outputService=e;this.editorService=t;this.fileConfigurationService=c;this.registerActions()}registerActions(){this.registerSwitchOutputAction(),this.registerShowOutputChannelsAction(),this.registerClearOutputAction(),this.registerToggleAutoScrollAction(),this.registerOpenActiveOutputFileAction(),this.registerOpenActiveOutputFileInAuxWindowAction(),this.registerShowLogsAction(),this.registerOpenLogFileAction(),this.registerConfigureActiveOutputLogLevelAction()}registerSwitchOutputAction(){this._register(h(class extends g{constructor(){super({id:"workbench.output.action.switchBetweenOutputs",title:s.localize("switchBetweenOutputs.label","Switch Output")})}async run(i,o){o&&i.get(f).showChannel(o,!0)}}));const e=new p("workbench.output.menu.switchOutput");this._register(V.appendMenuItem(p.ViewTitle,{submenu:e,title:s.localize("switchToOutput.label","Switch Output"),group:"navigation",when:m.equals("view",d),order:1,isSelection:!0}));const t=new Map;this._register(H(()=>K(t.values())));const c=i=>{for(const o of i){const l=o.label,r=o.extensionId?"0_ext_outputchannels":"1_core_outputchannels";t.set(o.id,h(class extends g{constructor(){super({id:`workbench.action.output.show.${o.id}`,title:l,toggled:pe.isEqualTo(o.id),menu:{id:e,group:r}})}async run(a){return a.get(f).showChannel(o.id,!0)}}))}};c(this.outputService.getChannelDescriptors());const n=S.as(fe.OutputChannels);this._register(n.onDidRegisterChannel(i=>{const o=this.outputService.getChannelDescriptor(i);o&&c([o])})),this._register(n.onDidRemoveChannel(i=>{t.get(i)?.dispose(),t.delete(i)}))}registerShowOutputChannelsAction(){this._register(h(class extends g{constructor(){super({id:"workbench.action.showOutputChannels",title:s.localize2("showOutputChannels","Show Output Channels..."),category:s.localize2("output","Output"),f1:!0})}async run(e){const t=e.get(f),c=e.get(D),n=[],i=[];for(const r of t.getChannelDescriptors())r.extensionId?n.push(r):i.push(r);const o=[];for(const{id:r,label:a}of n)o.push({id:r,label:a});n.length&&i.length&&o.push({type:"separator"});for(const{id:r,label:a}of i)o.push({id:r,label:a});const l=await c.pick(o,{placeHolder:s.localize("selectOutput","Select Output Channel")});if(l)return t.showChannel(l.id)}}))}registerClearOutputAction(){this._register(h(class extends g{constructor(){super({id:"workbench.output.action.clearOutput",title:s.localize2("clearOutput.label","Clear Output"),category:_.View,menu:[{id:p.ViewTitle,when:m.equals("view",d),group:"navigation",order:2},{id:p.CommandPalette},{id:p.EditorContext,when:ve}],icon:C.clearAll})}async run(e){const t=e.get(f),c=e.get(Y),n=t.getActiveChannel();n&&(n.clear(),c.playSignal(G.clear))}}))}registerToggleAutoScrollAction(){this._register(h(class extends g{constructor(){super({id:"workbench.output.action.toggleAutoScroll",title:s.localize2("toggleAutoScroll","Toggle Auto Scrolling"),tooltip:s.localize("outputScrollOff","Turn Auto Scrolling Off"),menu:{id:p.ViewTitle,when:m.and(m.equals("view",d)),group:"navigation",order:3},icon:C.lock,toggled:{condition:me,icon:C.unlock,tooltip:s.localize("outputScrollOn","Turn Auto Scrolling On")}})}async run(e){const t=e.get(Se).getActiveViewWithId(d);t.scrollLock=!t.scrollLock}}))}registerOpenActiveOutputFileAction(){const e=this;this._register(h(class extends g{constructor(){super({id:"workbench.action.openActiveLogOutputFile",title:s.localize2("openActiveOutputFile","Open Output in Editor"),menu:[{id:p.ViewTitle,when:m.equals("view",d),group:"navigation",order:4,isHiddenByDefault:!0}],icon:C.goToFile,precondition:z})}async run(){e.openActiveOutoutFile()}}))}registerOpenActiveOutputFileInAuxWindowAction(){const e=this;this._register(h(class extends g{constructor(){super({id:"workbench.action.openActiveLogOutputFileInNewWindow",title:s.localize2("openActiveOutputFileInNewWindow","Open Output in New Window"),menu:[{id:p.ViewTitle,when:m.equals("view",d),group:"navigation",order:5,isHiddenByDefault:!0}],icon:C.emptyWindow,precondition:z})}async run(){e.openActiveOutoutFile(ue)}}))}async openActiveOutoutFile(e){const t=this.getFileOutputChannelDescriptor();t&&(await this.fileConfigurationService.updateReadonly(t.file,!0),await this.editorService.openEditor({resource:t.file,options:{pinned:!0}},e))}getFileOutputChannelDescriptor(){const e=this.outputService.getActiveChannel();if(e){const t=this.outputService.getChannelDescriptors().filter(c=>c.id===e.id)[0];if(t?.file)return t}return null}registerConfigureActiveOutputLogLevelAction(){const e=this,t=new p("workbench.output.menu.logLevel");this._register(V.appendMenuItem(p.ViewTitle,{submenu:t,title:s.localize("logLevel.label","Set Log Level..."),group:"navigation",when:m.and(m.equals("view",d),de),icon:C.gear,order:6}));let c=0;const n=i=>{this._register(h(class extends g{constructor(){super({id:`workbench.action.output.activeOutputLogLevel.${i}`,title:ee(i).value,toggled:ge.isEqualTo(te(i)),menu:{id:t,order:c++,group:"0_level"}})}async run(o){const l=e.outputService.getActiveChannel();if(l){const r=e.outputService.getChannelDescriptor(l.id);if(r?.log&&r.file)return o.get(F).setLogLevel(r.file,i)}}}))};n(O.Trace),n(O.Debug),n(O.Info),n(O.Warning),n(O.Error),n(O.Off),this._register(h(class extends g{constructor(){super({id:"workbench.action.output.activeOutputLogLevelDefault",title:s.localize("logLevelDefault.label","Set As Default"),menu:{id:t,order:c,group:"1_default"},precondition:he.negate()})}async run(i){const o=e.outputService.getActiveChannel();if(o){const l=e.outputService.getChannelDescriptor(o.id);if(l?.log&&l.file){const r=i.get(F).getLogLevel(l.file);return await i.get(se).setDefaultLogLevel(r,l.extensionId)}}}}))}registerShowLogsAction(){this._register(h(class extends g{constructor(){super({id:"workbench.action.showLogs",title:s.localize2("showLogs","Show Logs..."),category:_.Developer,menu:{id:p.CommandPalette}})}async run(e){const t=e.get(f),c=e.get(D),n=[],i=[];for(const r of t.getChannelDescriptors())r.log&&(r.extensionId?n.push(r):i.push(r));const o=[];for(const{id:r,label:a}of i)o.push({id:r,label:a});n.length&&i.length&&o.push({type:"separator",label:s.localize("extensionLogs","Extension Logs")});for(const{id:r,label:a}of n)o.push({id:r,label:a});const l=await c.pick(o,{placeHolder:s.localize("selectlog","Select Log")});if(l)return t.showChannel(l.id)}}))}registerOpenLogFileAction(){this._register(h(class extends g{constructor(){super({id:"workbench.action.openLogFile",title:s.localize2("openLogFile","Open Log File..."),category:_.Developer,menu:{id:p.CommandPalette},metadata:{description:"workbench.action.openLogFile",args:[{name:"logFile",schema:{markdownDescription:s.localize("logFile",'The id of the log file to open, for example `"window"`. Currently the best way to get this is to get the ID by checking the `workbench.action.output.show.<id>` commands'),type:"string"}}]}})}async run(e,t){const c=e.get(f),n=e.get(D),i=e.get(R),o=e.get(W);let l;const r=t&&typeof t=="string"?t:void 0,a=[],T=[];for(const u of c.getChannelDescriptors())if(u.file&&u.log){const v={id:u.id,label:u.label,channel:u};u.extensionId?a.push(v):T.push(v),v.id===r&&(l=v)}if(!l){const u=[...a.sort((v,k)=>v.label.localeCompare(k.label))];u.length&&T.length&&(u.push({type:"separator"}),u.push(...T.sort((v,k)=>v.label.localeCompare(k.label)))),l=await n.pick(u,{placeHolder:s.localize("selectlogFile","Select Log File")})}if(l){const u=B(l.channel.file);await o.updateReadonly(u,!0),await i.openEditor({resource:u,options:{pinned:!0}})}}}))}};y=E([A(0,f),A(1,R),A(2,W)],y),S.as(ne.Workbench).registerWorkbenchContribution(y,ae.Restored),S.as($.Configuration).registerConfiguration({id:"output",order:30,title:s.localize("output","Output"),type:"object",properties:{"output.smartScroll.enabled":{type:"boolean",description:s.localize("output.smartScroll.enabled","Enable/disable the ability of smart scrolling in the output view. Smart scrolling allows you to lock scrolling automatically when you click in the output view and unlocks when you click in the last line."),default:!0,scope:j.WINDOW,tags:["output"]}}});
