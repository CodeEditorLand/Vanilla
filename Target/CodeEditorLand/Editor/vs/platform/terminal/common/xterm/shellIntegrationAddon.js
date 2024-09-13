import{Emitter as C}from"../../../../base/common/event.js";import{Disposable as f,dispose as g,toDisposable as S}from"../../../../base/common/lifecycle.js";import{removeAnsiEscapeCodesFromPrompt as D}from"../../../../base/common/strings.js";import{URI as b}from"../../../../base/common/uri.js";import{BufferMarkCapability as y}from"../capabilities/bufferMarkCapability.js";import{TerminalCapability as n}from"../capabilities/capabilities.js";import{CommandDetectionCapability as v}from"../capabilities/commandDetectionCapability.js";import{CwdDetectionCapability as w}from"../capabilities/cwdDetectionCapability.js";import{PartialCommandDetectionCapability as T}from"../capabilities/partialCommandDetectionCapability.js";import{TerminalCapabilityStore as I}from"../capabilities/terminalCapabilityStore.js";import{ShellIntegrationStatus as u}from"../terminal.js";import{sanitizeCwd as O}from"../terminalEnvironment.js";var P=(r=>(r[r.FinalTerm=133]="FinalTerm",r[r.VSCode=633]="VSCode",r[r.ITerm=1337]="ITerm",r[r.SetCwd=7]="SetCwd",r[r.SetWindowsFriendlyCwd=9]="SetWindowsFriendlyCwd",r))(P||{}),k=(i=>(i.PromptStart="A",i.CommandStart="B",i.CommandExecuted="C",i.CommandFinished="D",i))(k||{}),G=(a=>(a.PromptStart="A",a.CommandStart="B",a.CommandExecuted="C",a.CommandFinished="D",a.CommandLine="E",a.ContinuationStart="F",a.ContinuationEnd="G",a.RightPromptStart="H",a.RightPromptEnd="I",a.Property="P",a.SetMark="SetMark",a))(G||{}),M=(e=>(e.SetMark="SetMark",e.CurrentDir="CurrentDir",e))(M||{});class N extends f{constructor(e,t,i,r){super();this._nonce=e;this._disableTelemetry=t;this._telemetryService=i;this._logService=r;this._register(S(()=>{this._clearActivationTimeout(),this._disposeCommonProtocol()}))}_terminal;capabilities=this._register(new I);_hasUpdatedTelemetry=!1;_activationTimeout;_commonProtocolDisposables=[];_status=u.Off;get status(){return this._status}_onDidChangeStatus=new C;onDidChangeStatus=this._onDidChangeStatus.event;_disposeCommonProtocol(){g(this._commonProtocolDisposables),this._commonProtocolDisposables.length=0}activate(e){this._terminal=e,this.capabilities.add(n.PartialCommandDetection,this._register(new T(this._terminal))),this._register(e.parser.registerOscHandler(633,t=>this._handleVSCodeSequence(t))),this._register(e.parser.registerOscHandler(1337,t=>this._doHandleITermSequence(t))),this._commonProtocolDisposables.push(e.parser.registerOscHandler(133,t=>this._handleFinalTermSequence(t))),this._register(e.parser.registerOscHandler(7,t=>this._doHandleSetCwd(t))),this._register(e.parser.registerOscHandler(9,t=>this._doHandleSetWindowsFriendlyCwd(t))),this._ensureCapabilitiesOrAddFailureTelemetry()}getMarkerId(e,t){this._createOrGetBufferMarkDetection(e).getMark(t)}_handleFinalTermSequence(e){const t=this._doHandleFinalTermSequence(e);return this._status===u.Off&&(this._status=u.FinalTerm,this._onDidChangeStatus.fire(this._status)),t}_doHandleFinalTermSequence(e){if(!this._terminal)return!1;const[t,...i]=e.split(";");switch(t){case"A":return this._createOrGetCommandDetection(this._terminal).handlePromptStart(),!0;case"B":return this._createOrGetCommandDetection(this._terminal).handleCommandStart({ignoreCommandLine:!0}),!0;case"C":return this._createOrGetCommandDetection(this._terminal).handleCommandExecuted(),!0;case"D":{const r=i.length===1?Number.parseInt(i[0]):void 0;return this._createOrGetCommandDetection(this._terminal).handleCommandFinished(r),!0}}return!1}_handleVSCodeSequence(e){const t=this._doHandleVSCodeSequence(e);return!this._hasUpdatedTelemetry&&t&&(this._telemetryService?.publicLog2("terminal/shellIntegrationActivationSucceeded"),this._hasUpdatedTelemetry=!0,this._clearActivationTimeout()),this._status!==u.VSCode&&(this._status=u.VSCode,this._onDidChangeStatus.fire(this._status)),t}async _ensureCapabilitiesOrAddFailureTelemetry(){!this._telemetryService||this._disableTelemetry||(this._activationTimeout=setTimeout(()=>{!this.capabilities.get(n.CommandDetection)&&!this.capabilities.get(n.CwdDetection)&&(this._telemetryService?.publicLog2("terminal/shellIntegrationActivationTimeout"),this._logService.warn("Shell integration failed to add capabilities within 10 seconds")),this._hasUpdatedTelemetry=!0},1e4))}_clearActivationTimeout(){this._activationTimeout!==void 0&&(clearTimeout(this._activationTimeout),this._activationTimeout=void 0)}_doHandleVSCodeSequence(e){if(!this._terminal)return!1;const t=e.indexOf(";"),i=t===-1?e:e.substring(0,t),r=t===-1?[]:e.substring(t+1).split(";");switch(i){case"A":return this._createOrGetCommandDetection(this._terminal).handlePromptStart(),!0;case"B":return this._createOrGetCommandDetection(this._terminal).handleCommandStart(),!0;case"C":return this._createOrGetCommandDetection(this._terminal).handleCommandExecuted(),!0;case"D":{const d=r[0],m=d!==void 0?Number.parseInt(d):void 0;return this._createOrGetCommandDetection(this._terminal).handleCommandFinished(m),!0}case"E":{const d=r[0],m=r[1];let l;return d!==void 0?l=h(d):l="",this._createOrGetCommandDetection(this._terminal).setCommandLine(l,m===this._nonce),!0}case"F":return this._createOrGetCommandDetection(this._terminal).handleContinuationStart(),!0;case"G":return this._createOrGetCommandDetection(this._terminal).handleContinuationEnd(),!0;case"H":return this._createOrGetCommandDetection(this._terminal).handleRightPromptStart(),!0;case"I":return this._createOrGetCommandDetection(this._terminal).handleRightPromptEnd(),!0;case"P":{const d=r[0],m=d!==void 0?h(d):"",{key:l,value:c}=p(m);if(c===void 0)return!0;switch(l){case"ContinuationPrompt":return this._updateContinuationPrompt(D(c)),!0;case"Cwd":return this._updateCwd(c),!0;case"IsWindows":return this._createOrGetCommandDetection(this._terminal).setIsWindowsPty(c==="True"),!0;case"Prompt":{const _=c.replace(/\x1b\[[0-9;]*m/g,"");return this._updatePromptTerminator(_),!0}case"Task":return this._createOrGetBufferMarkDetection(this._terminal),this.capabilities.get(n.CommandDetection)?.setIsCommandStorageDisabled(),!0}}case"SetMark":return this._createOrGetBufferMarkDetection(this._terminal).addMark(F(r)),!0}return!1}_updateContinuationPrompt(e){this._terminal&&this._createOrGetCommandDetection(this._terminal).setContinuationPrompt(e)}_updatePromptTerminator(e){if(!this._terminal)return;const t=e.substring(e.lastIndexOf(`
`)+1),i=t.substring(t.lastIndexOf(" "));i&&this._createOrGetCommandDetection(this._terminal).setPromptTerminator(i,t)}_updateCwd(e){e=O(e),this._createOrGetCwdDetection().updateCwd(e),this.capabilities.get(n.CommandDetection)?.setCwd(e)}_doHandleITermSequence(e){if(!this._terminal)return!1;const[t]=e.split(";");switch(t){case"SetMark":this._createOrGetBufferMarkDetection(this._terminal).addMark();default:{const{key:i,value:r}=p(t);if(r===void 0)return!0;switch(i){case"CurrentDir":return this._updateCwd(r),!0}}}return!1}_doHandleSetWindowsFriendlyCwd(e){if(!this._terminal)return!1;const[t,...i]=e.split(";");switch(t){case"9":return i.length&&this._updateCwd(i[0]),!0}return!1}_doHandleSetCwd(e){if(!this._terminal)return!1;const[t]=e.split(";");if(t.match(/^file:\/\/.*\//)){const i=b.parse(t);if(i.path&&i.path.length>0)return this._updateCwd(i.path),!0}return!1}serialize(){return!this._terminal||!this.capabilities.has(n.CommandDetection)?{isWindowsPty:!1,commands:[],promptInputModel:void 0}:this._createOrGetCommandDetection(this._terminal).serialize()}deserialize(e){if(!this._terminal)throw new Error("Cannot restore commands before addon is activated");this._createOrGetCommandDetection(this._terminal).deserialize(e)}_createOrGetCwdDetection(){let e=this.capabilities.get(n.CwdDetection);return e||(e=this._register(new w),this.capabilities.add(n.CwdDetection,e)),e}_createOrGetCommandDetection(e){let t=this.capabilities.get(n.CommandDetection);return t||(t=this._register(new v(e,this._logService)),this.capabilities.add(n.CommandDetection,t)),t}_createOrGetBufferMarkDetection(e){let t=this.capabilities.get(n.BufferMarkDetection);return t||(t=this._register(new y(e)),this.capabilities.add(n.BufferMarkDetection,t)),t}}function h(o){return o.replaceAll(/\\(\\|x([0-9a-f]{2}))/gi,(s,e,t)=>t?String.fromCharCode(Number.parseInt(t,16)):e)}function p(o){const s=o.indexOf("=");return s===-1?{key:o,value:void 0}:{key:o.substring(0,s),value:o.substring(1+s)}}function F(o){let s,e=!1;for(const t of o)t!==void 0&&(t==="Hidden"&&(e=!0),t.startsWith("Id=")&&(s=t.substring(3)));return{id:s,hidden:e}}export{N as ShellIntegrationAddon,P as ShellIntegrationOscPs,h as deserializeMessage,p as parseKeyValueAssignment,F as parseMarkSequence};
