var b=Object.defineProperty;var p=Object.getOwnPropertyDescriptor;var u=(c,o,e,s)=>{for(var t=s>1?void 0:s?p(o,e):o,l=c.length-1,r;l>=0;l--)(r=c[l])&&(t=(s?r(o,e,t):r(t))||t);return s&&t&&b(o,e,t),t},d=(c,o)=>(e,s)=>o(e,s,c);import{CachedFunction as y}from"../../../base/common/cache.js";import{getStructuralKey as S}from"../../../base/common/equals.js";import{Disposable as f,toDisposable as h}from"../../../base/common/lifecycle.js";import{FileAccess as v}from"../../../base/common/network.js";import{ValueWithChangeEventFromObservable as C,derived as K,observableFromEvent as k}from"../../../base/common/observable.js";import{localize as n}from"../../../nls.js";import{IAccessibilityService as R}from"../../accessibility/common/accessibility.js";import{IConfigurationService as A}from"../../configuration/common/configuration.js";import{createDecorator as M}from"../../instantiation/common/instantiation.js";import{observableConfigValue as F}from"../../observable/common/platformObservableUtils.js";import{ITelemetryService as I}from"../../telemetry/common/telemetry.js";const G=M("accessibilitySignalService"),z=Symbol("AcknowledgeDocCommentsToken");let g=class extends f{constructor(e,s,t){super();this.configurationService=e;this.accessibilityService=s;this.telemetryService=t}_serviceBrand;sounds=new Map;screenReaderAttached=k(this,this.accessibilityService.onDidChangeScreenReaderOptimized,()=>this.accessibilityService.isScreenReaderOptimized());sentTelemetry=new Set;getEnabledState(e,s,t){return new C(this._signalEnabledState.get({signal:e,userGesture:s,modality:t}))}async playSignal(e,s={}){const t=s.modality==="announcement"||s.modality===void 0,l=e.announcementMessage;t&&this.isAnnouncementEnabled(e,s.userGesture)&&l&&this.accessibilityService.status(l),(s.modality==="sound"||s.modality===void 0)&&this.isSoundEnabled(e,s.userGesture)&&(this.sendSignalTelemetry(e,s.source),await this.playSound(e.sound.getSound(),s.allowManyInParallel))}async playSignals(e){for(const r of e)this.sendSignalTelemetry("signal"in r?r.signal:r,"source"in r?r.source:void 0);const s=e.map(r=>"signal"in r?r.signal:r),t=s.filter(r=>this.isAnnouncementEnabled(r)).map(r=>r.announcementMessage);t.length&&this.accessibilityService.status(t.join(", "));const l=new Set(s.filter(r=>this.isSoundEnabled(r)).map(r=>r.sound.getSound()));await Promise.all(Array.from(l).map(r=>this.playSound(r,!0)))}sendSignalTelemetry(e,s){const t=this.accessibilityService.isScreenReaderOptimized(),l=e.name+(s?`::${s}`:"")+(t?"{screenReaderOptimized}":"");this.sentTelemetry.has(l)||this.getVolumeInPercent()===0||(this.sentTelemetry.add(l),this.telemetryService.publicLog2("signal.played",{signal:e.name,source:s??"",isScreenReaderOptimized:t}))}getVolumeInPercent(){const e=this.configurationService.getValue("accessibility.signalOptions.volume");return typeof e!="number"?50:Math.max(Math.min(e,100),0)}playingSounds=new Set;async playSound(e,s=!1){if(!s&&this.playingSounds.has(e))return;this.playingSounds.add(e);const t=v.asBrowserUri(`vs/platform/accessibilitySignal/browser/media/${e.fileName}`).toString(!0);try{const l=this.sounds.get(t);if(l)l.volume=this.getVolumeInPercent()/100,l.currentTime=0,await l.play();else{const r=await E(t,this.getVolumeInPercent()/100);this.sounds.set(t,r)}}catch(l){l.message.includes("play() can only be initiated by a user gesture")}finally{this.playingSounds.delete(e)}}playSignalLoop(e,s){let t=!0;const l=()=>{t&&this.playSignal(e,{allowManyInParallel:!0}).finally(()=>{setTimeout(()=>{t&&l()},s)})};return l(),h(()=>t=!1)}_signalConfigValue=new y(e=>F(e.settingsKey,{sound:"off",announcement:"off"},this.configurationService));_signalEnabledState=new y({getCacheKey:S},e=>K(s=>{const t=this._signalConfigValue.get(e.signal).read(s);return!!((e.modality==="sound"||e.modality===void 0)&&m(t.sound,()=>this.screenReaderAttached.read(s),e.userGesture)||(e.modality==="announcement"||e.modality===void 0)&&m(t.announcement,()=>this.screenReaderAttached.read(s),e.userGesture))}).recomputeInitiallyAndOnChange(this._store));isAnnouncementEnabled(e,s){return e.announcementMessage?this._signalEnabledState.get({signal:e,userGesture:!!s,modality:"announcement"}).get():!1}isSoundEnabled(e,s){return this._signalEnabledState.get({signal:e,userGesture:!!s,modality:"sound"}).get()}onSoundEnabledChanged(e){return this.getEnabledState(e,!1).onDidChange}getDelayMs(e,s,t){if(!this.configurationService.getValue("accessibility.signalOptions.debouncePositionChanges"))return 0;let l;return e.name===a.errorAtPosition.name&&t==="positional"?l=this.configurationService.getValue("accessibility.signalOptions.experimental.delays.errorAtPosition"):e.name===a.warningAtPosition.name&&t==="positional"?l=this.configurationService.getValue("accessibility.signalOptions.experimental.delays.warningAtPosition"):l=this.configurationService.getValue("accessibility.signalOptions.experimental.delays.general"),s==="sound"?l.sound:l.announcement}};g=u([d(0,A),d(1,R),d(2,I)],g);function m(c,o,e){return c==="on"||c==="always"||c==="auto"&&o()||c==="userGesture"&&e}function E(c,o){return new Promise((e,s)=>{const t=new Audio(c);t.volume=o,t.addEventListener("ended",()=>{e(t)}),t.addEventListener("error",l=>{s(l.error)}),t.play().catch(l=>{s(l)})})}class i{constructor(o){this.fileName=o}static register(o){return new i(o.fileName)}static error=i.register({fileName:"error.mp3"});static warning=i.register({fileName:"warning.mp3"});static success=i.register({fileName:"success.mp3"});static foldedArea=i.register({fileName:"foldedAreas.mp3"});static break=i.register({fileName:"break.mp3"});static quickFixes=i.register({fileName:"quickFixes.mp3"});static taskCompleted=i.register({fileName:"taskCompleted.mp3"});static taskFailed=i.register({fileName:"taskFailed.mp3"});static terminalBell=i.register({fileName:"terminalBell.mp3"});static diffLineInserted=i.register({fileName:"diffLineInserted.mp3"});static diffLineDeleted=i.register({fileName:"diffLineDeleted.mp3"});static diffLineModified=i.register({fileName:"diffLineModified.mp3"});static chatRequestSent=i.register({fileName:"chatRequestSent.mp3"});static chatResponseReceived1=i.register({fileName:"chatResponseReceived1.mp3"});static chatResponseReceived2=i.register({fileName:"chatResponseReceived2.mp3"});static chatResponseReceived3=i.register({fileName:"chatResponseReceived3.mp3"});static chatResponseReceived4=i.register({fileName:"chatResponseReceived4.mp3"});static clear=i.register({fileName:"clear.mp3"});static save=i.register({fileName:"save.mp3"});static format=i.register({fileName:"format.mp3"});static voiceRecordingStarted=i.register({fileName:"voiceRecordingStarted.mp3"});static voiceRecordingStopped=i.register({fileName:"voiceRecordingStopped.mp3"});static progress=i.register({fileName:"progress.mp3"})}class w{constructor(o){this.randomOneOf=o}getSound(o=!1){if(o||this.randomOneOf.length===1)return this.randomOneOf[0];{const e=Math.floor(Math.random()*this.randomOneOf.length);return this.randomOneOf[e]}}}class a{constructor(o,e,s,t,l,r){this.sound=o;this.name=e;this.legacySoundSettingsKey=s;this.settingsKey=t;this.legacyAnnouncementSettingsKey=l;this.announcementMessage=r}static _signals=new Set;static register(o){const e=new w("randomOneOf"in o.sound?o.sound.randomOneOf:[o.sound]),s=new a(e,o.name,o.legacySoundSettingsKey,o.settingsKey,o.legacyAnnouncementSettingsKey,o.announcementMessage);return a._signals.add(s),s}static get allAccessibilitySignals(){return[...this._signals]}static errorAtPosition=a.register({name:n("accessibilitySignals.positionHasError.name","Error at Position"),sound:i.error,announcementMessage:n("accessibility.signals.positionHasError","Error"),settingsKey:"accessibility.signals.positionHasError",delaySettingsKey:"accessibility.signalOptions.delays.errorAtPosition"});static warningAtPosition=a.register({name:n("accessibilitySignals.positionHasWarning.name","Warning at Position"),sound:i.warning,announcementMessage:n("accessibility.signals.positionHasWarning","Warning"),settingsKey:"accessibility.signals.positionHasWarning",delaySettingsKey:"accessibility.signalOptions.delays.warningAtPosition"});static errorOnLine=a.register({name:n("accessibilitySignals.lineHasError.name","Error on Line"),sound:i.error,legacySoundSettingsKey:"audioCues.lineHasError",legacyAnnouncementSettingsKey:"accessibility.alert.error",announcementMessage:n("accessibility.signals.lineHasError","Error on Line"),settingsKey:"accessibility.signals.lineHasError"});static warningOnLine=a.register({name:n("accessibilitySignals.lineHasWarning.name","Warning on Line"),sound:i.warning,legacySoundSettingsKey:"audioCues.lineHasWarning",legacyAnnouncementSettingsKey:"accessibility.alert.warning",announcementMessage:n("accessibility.signals.lineHasWarning","Warning on Line"),settingsKey:"accessibility.signals.lineHasWarning"});static foldedArea=a.register({name:n("accessibilitySignals.lineHasFoldedArea.name","Folded Area on Line"),sound:i.foldedArea,legacySoundSettingsKey:"audioCues.lineHasFoldedArea",legacyAnnouncementSettingsKey:"accessibility.alert.foldedArea",announcementMessage:n("accessibility.signals.lineHasFoldedArea","Folded"),settingsKey:"accessibility.signals.lineHasFoldedArea"});static break=a.register({name:n("accessibilitySignals.lineHasBreakpoint.name","Breakpoint on Line"),sound:i.break,legacySoundSettingsKey:"audioCues.lineHasBreakpoint",legacyAnnouncementSettingsKey:"accessibility.alert.breakpoint",announcementMessage:n("accessibility.signals.lineHasBreakpoint","Breakpoint"),settingsKey:"accessibility.signals.lineHasBreakpoint"});static inlineSuggestion=a.register({name:n("accessibilitySignals.lineHasInlineSuggestion.name","Inline Suggestion on Line"),sound:i.quickFixes,legacySoundSettingsKey:"audioCues.lineHasInlineSuggestion",settingsKey:"accessibility.signals.lineHasInlineSuggestion"});static terminalQuickFix=a.register({name:n("accessibilitySignals.terminalQuickFix.name","Terminal Quick Fix"),sound:i.quickFixes,legacySoundSettingsKey:"audioCues.terminalQuickFix",legacyAnnouncementSettingsKey:"accessibility.alert.terminalQuickFix",announcementMessage:n("accessibility.signals.terminalQuickFix","Quick Fix"),settingsKey:"accessibility.signals.terminalQuickFix"});static onDebugBreak=a.register({name:n("accessibilitySignals.onDebugBreak.name","Debugger Stopped on Breakpoint"),sound:i.break,legacySoundSettingsKey:"audioCues.onDebugBreak",legacyAnnouncementSettingsKey:"accessibility.alert.onDebugBreak",announcementMessage:n("accessibility.signals.onDebugBreak","Breakpoint"),settingsKey:"accessibility.signals.onDebugBreak"});static noInlayHints=a.register({name:n("accessibilitySignals.noInlayHints","No Inlay Hints on Line"),sound:i.error,legacySoundSettingsKey:"audioCues.noInlayHints",legacyAnnouncementSettingsKey:"accessibility.alert.noInlayHints",announcementMessage:n("accessibility.signals.noInlayHints","No Inlay Hints"),settingsKey:"accessibility.signals.noInlayHints"});static taskCompleted=a.register({name:n("accessibilitySignals.taskCompleted","Task Completed"),sound:i.taskCompleted,legacySoundSettingsKey:"audioCues.taskCompleted",legacyAnnouncementSettingsKey:"accessibility.alert.taskCompleted",announcementMessage:n("accessibility.signals.taskCompleted","Task Completed"),settingsKey:"accessibility.signals.taskCompleted"});static taskFailed=a.register({name:n("accessibilitySignals.taskFailed","Task Failed"),sound:i.taskFailed,legacySoundSettingsKey:"audioCues.taskFailed",legacyAnnouncementSettingsKey:"accessibility.alert.taskFailed",announcementMessage:n("accessibility.signals.taskFailed","Task Failed"),settingsKey:"accessibility.signals.taskFailed"});static terminalCommandFailed=a.register({name:n("accessibilitySignals.terminalCommandFailed","Terminal Command Failed"),sound:i.error,legacySoundSettingsKey:"audioCues.terminalCommandFailed",legacyAnnouncementSettingsKey:"accessibility.alert.terminalCommandFailed",announcementMessage:n("accessibility.signals.terminalCommandFailed","Command Failed"),settingsKey:"accessibility.signals.terminalCommandFailed"});static terminalCommandSucceeded=a.register({name:n("accessibilitySignals.terminalCommandSucceeded","Terminal Command Succeeded"),sound:i.success,announcementMessage:n("accessibility.signals.terminalCommandSucceeded","Command Succeeded"),settingsKey:"accessibility.signals.terminalCommandSucceeded"});static terminalBell=a.register({name:n("accessibilitySignals.terminalBell","Terminal Bell"),sound:i.terminalBell,legacySoundSettingsKey:"audioCues.terminalBell",legacyAnnouncementSettingsKey:"accessibility.alert.terminalBell",announcementMessage:n("accessibility.signals.terminalBell","Terminal Bell"),settingsKey:"accessibility.signals.terminalBell"});static notebookCellCompleted=a.register({name:n("accessibilitySignals.notebookCellCompleted","Notebook Cell Completed"),sound:i.taskCompleted,legacySoundSettingsKey:"audioCues.notebookCellCompleted",legacyAnnouncementSettingsKey:"accessibility.alert.notebookCellCompleted",announcementMessage:n("accessibility.signals.notebookCellCompleted","Notebook Cell Completed"),settingsKey:"accessibility.signals.notebookCellCompleted"});static notebookCellFailed=a.register({name:n("accessibilitySignals.notebookCellFailed","Notebook Cell Failed"),sound:i.taskFailed,legacySoundSettingsKey:"audioCues.notebookCellFailed",legacyAnnouncementSettingsKey:"accessibility.alert.notebookCellFailed",announcementMessage:n("accessibility.signals.notebookCellFailed","Notebook Cell Failed"),settingsKey:"accessibility.signals.notebookCellFailed"});static diffLineInserted=a.register({name:n("accessibilitySignals.diffLineInserted","Diff Line Inserted"),sound:i.diffLineInserted,legacySoundSettingsKey:"audioCues.diffLineInserted",settingsKey:"accessibility.signals.diffLineInserted"});static diffLineDeleted=a.register({name:n("accessibilitySignals.diffLineDeleted","Diff Line Deleted"),sound:i.diffLineDeleted,legacySoundSettingsKey:"audioCues.diffLineDeleted",settingsKey:"accessibility.signals.diffLineDeleted"});static diffLineModified=a.register({name:n("accessibilitySignals.diffLineModified","Diff Line Modified"),sound:i.diffLineModified,legacySoundSettingsKey:"audioCues.diffLineModified",settingsKey:"accessibility.signals.diffLineModified"});static chatRequestSent=a.register({name:n("accessibilitySignals.chatRequestSent","Chat Request Sent"),sound:i.chatRequestSent,legacySoundSettingsKey:"audioCues.chatRequestSent",legacyAnnouncementSettingsKey:"accessibility.alert.chatRequestSent",announcementMessage:n("accessibility.signals.chatRequestSent","Chat Request Sent"),settingsKey:"accessibility.signals.chatRequestSent"});static chatResponseReceived=a.register({name:n("accessibilitySignals.chatResponseReceived","Chat Response Received"),legacySoundSettingsKey:"audioCues.chatResponseReceived",sound:{randomOneOf:[i.chatResponseReceived1,i.chatResponseReceived2,i.chatResponseReceived3,i.chatResponseReceived4]},settingsKey:"accessibility.signals.chatResponseReceived"});static progress=a.register({name:n("accessibilitySignals.progress","Progress"),sound:i.progress,legacySoundSettingsKey:"audioCues.chatResponsePending",legacyAnnouncementSettingsKey:"accessibility.alert.progress",announcementMessage:n("accessibility.signals.progress","Progress"),settingsKey:"accessibility.signals.progress"});static clear=a.register({name:n("accessibilitySignals.clear","Clear"),sound:i.clear,legacySoundSettingsKey:"audioCues.clear",legacyAnnouncementSettingsKey:"accessibility.alert.clear",announcementMessage:n("accessibility.signals.clear","Clear"),settingsKey:"accessibility.signals.clear"});static save=a.register({name:n("accessibilitySignals.save","Save"),sound:i.save,legacySoundSettingsKey:"audioCues.save",legacyAnnouncementSettingsKey:"accessibility.alert.save",announcementMessage:n("accessibility.signals.save","Save"),settingsKey:"accessibility.signals.save"});static format=a.register({name:n("accessibilitySignals.format","Format"),sound:i.format,legacySoundSettingsKey:"audioCues.format",legacyAnnouncementSettingsKey:"accessibility.alert.format",announcementMessage:n("accessibility.signals.format","Format"),settingsKey:"accessibility.signals.format"});static voiceRecordingStarted=a.register({name:n("accessibilitySignals.voiceRecordingStarted","Voice Recording Started"),sound:i.voiceRecordingStarted,legacySoundSettingsKey:"audioCues.voiceRecordingStarted",settingsKey:"accessibility.signals.voiceRecordingStarted"});static voiceRecordingStopped=a.register({name:n("accessibilitySignals.voiceRecordingStopped","Voice Recording Stopped"),sound:i.voiceRecordingStopped,legacySoundSettingsKey:"audioCues.voiceRecordingStopped",settingsKey:"accessibility.signals.voiceRecordingStopped"})}export{a as AccessibilitySignal,g as AccessibilitySignalService,z as AcknowledgeDocCommentsToken,G as IAccessibilitySignalService,i as Sound,w as SoundSource};
