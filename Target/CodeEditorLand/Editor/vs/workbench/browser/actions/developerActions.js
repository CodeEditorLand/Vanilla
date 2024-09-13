import"./media/actions.css";import{$ as L,append as T,createCSSRule as ue,createStyleSheet as ge,getActiveDocument as fe,getDomNodePagePosition as ye,getWindows as se,onDidRegisterWindow as ie}from"../../../base/browser/dom.js";import{DomEmitter as b}from"../../../base/browser/event.js";import{StandardKeyboardEvent as ve}from"../../../base/browser/keyboardEvent.js";import{RunOnceScheduler as be}from"../../../base/common/async.js";import{Color as Se}from"../../../base/common/color.js";import{Emitter as I,Event as V}from"../../../base/common/event.js";import{KeyCode as R}from"../../../base/common/keyCodes.js";import{DisposableStore as j,DisposableTracker as he,dispose as ke,setDisposableTracker as ae,toDisposable as N}from"../../../base/common/lifecycle.js";import{clamp as W}from"../../../base/common/numbers.js";import{localize as a,localize2 as S}from"../../../nls.js";import{Categories as h}from"../../../platform/action/common/actionCommonCategories.js";import{Action2 as k,MenuRegistry as Ce,registerAction2 as C}from"../../../platform/actions/common/actions.js";import{CommandsRegistry as we}from"../../../platform/commands/common/commands.js";import{IConfigurationService as Ie}from"../../../platform/configuration/common/configuration.js";import{Extensions as De}from"../../../platform/configuration/common/configurationRegistry.js";import{ContextKeyExpr as Me,IContextKeyService as F,RawContextKey as xe}from"../../../platform/contextkey/common/contextkey.js";import{IDialogService as ce}from"../../../platform/dialogs/common/dialogs.js";import{IEnvironmentService as Ee}from"../../../platform/environment/common/environment.js";import{ByteSize as Ke}from"../../../platform/files/common/files.js";import{IKeybindingService as Le}from"../../../platform/keybinding/common/keybinding.js";import{ResultKind as de}from"../../../platform/keybinding/common/keybindingResolver.js";import{ILayoutService as Te}from"../../../platform/layout/browser/layoutService.js";import{ILogService as Re}from"../../../platform/log/common/log.js";import Ae from"../../../platform/product/common/product.js";import{IQuickInputService as Oe}from"../../../platform/quickinput/common/quickInput.js";import{Registry as Pe}from"../../../platform/registry/common/platform.js";import{IStorageService as le,StorageScope as A,StorageTarget as q}from"../../../platform/storage/common/storage.js";import{IEditorService as ze}from"../../services/editor/common/editorService.js";import{windowLogId as $e}from"../../services/log/common/logConstants.js";import{IOutputService as Be}from"../../services/output/common/output.js";import{IUserDataProfileService as We}from"../../services/userDataProfile/common/userDataProfile.js";import{IWorkingCopyBackupService as Fe}from"../../services/workingCopy/common/workingCopyBackup.js";import{IWorkingCopyService as Ge}from"../../services/workingCopy/common/workingCopyService.js";class He extends k{constructor(){super({id:"workbench.action.inspectContextKeys",title:S("inspect context keys","Inspect Context Keys"),category:h.Developer,f1:!0})}run(n){const r=n.get(F),t=new j,f=ge(void 0,void 0,t);ue("*","cursor: crosshair !important;",f);const e=document.createElement("div"),u=fe();u.body.appendChild(e),t.add(N(()=>e.remove())),e.style.position="absolute",e.style.pointerEvents="none",e.style.backgroundColor="rgba(255, 0, 0, 0.5)",e.style.zIndex="1000";const l=t.add(new b(u,"mousemove",!0));t.add(l.event(g=>{const d=g.target,m=ye(d);e.style.top=`${m.top}px`,e.style.left=`${m.left}px`,e.style.width=`${m.width}px`,e.style.height=`${m.height}px`}));const c=t.add(new b(u,"mousedown",!0));V.once(c.event)(g=>{g.preventDefault(),g.stopPropagation()},null,t);const x=t.add(new b(u,"mouseup",!0));V.once(x.event)(g=>{g.preventDefault(),g.stopPropagation();const d=r.getContext(g.target);ke(t)},null,t)}}class O extends k{static disposable;constructor(){super({id:"workbench.action.toggleScreencastMode",title:S("toggle screencast mode","Toggle Screencast Mode"),category:h.Developer,f1:!0})}run(n){if(O.disposable){O.disposable.dispose(),O.disposable=void 0;return}const r=n.get(Te),t=n.get(Ie),f=n.get(Le),e=new j,u=r.activeContainer,l=T(u,L(".screencast-mouse"));e.add(N(()=>l.remove()));const c=T(u,L(".screencast-keyboard"));e.add(N(()=>c.remove()));const x=e.add(new I),g=e.add(new I),d=e.add(new I);function m(o,s){s.add(s.add(new b(o,"mousedown",!0)).event(i=>x.fire(i))),s.add(s.add(new b(o,"mouseup",!0)).event(i=>g.fire(i))),s.add(s.add(new b(o,"mousemove",!0)).event(i=>d.fire(i)))}for(const{window:o,disposables:s}of se())m(r.getContainer(o),s);e.add(ie(({window:o,disposables:s})=>m(r.getContainer(o),s))),e.add(r.onDidChangeActiveContainer(()=>{r.activeContainer.appendChild(l),r.activeContainer.appendChild(c)}));const p=()=>{l.style.borderColor=Se.fromHex(t.getValue("screencastMode.mouseIndicatorColor")).toString()};let y;const X=()=>{y=W(t.getValue("screencastMode.mouseIndicatorSize")||20,20,100),l.style.height=`${y}px`,l.style.width=`${y}px`};p(),X(),e.add(x.event(o=>{l.style.top=`${o.clientY-y/2}px`,l.style.left=`${o.clientX-y/2}px`,l.style.display="block",l.style.transform="scale(1)",l.style.transition="transform 0.1s";const s=d.event(i=>{l.style.top=`${i.clientY-y/2}px`,l.style.left=`${i.clientX-y/2}px`,l.style.transform=`scale(${.8})`});V.once(g.event)(()=>{l.style.display="none",s.dispose()})}));const Y=()=>{c.style.fontSize=`${W(t.getValue("screencastMode.fontSize")||56,20,100)}px`},Z=()=>{c.style.bottom=`${W(t.getValue("screencastMode.verticalOffset")||0,0,90)}%`};let _;const J=()=>{_=W(t.getValue("screencastMode.keyboardOverlayTimeout")||800,500,5e3)};Y(),Z(),J(),e.add(t.onDidChangeConfiguration(o=>{o.affectsConfiguration("screencastMode.verticalOffset")&&Z(),o.affectsConfiguration("screencastMode.fontSize")&&Y(),o.affectsConfiguration("screencastMode.keyboardOverlayTimeout")&&J(),o.affectsConfiguration("screencastMode.mouseIndicatorColor")&&p(),o.affectsConfiguration("screencastMode.mouseIndicatorSize")&&X()}));const ee=e.add(new I),oe=e.add(new I),te=e.add(new I),ne=e.add(new I);function re(o,s){s.add(s.add(new b(o,"keydown",!0)).event(i=>ee.fire(i))),s.add(s.add(new b(o,"compositionstart",!0)).event(i=>oe.fire(i))),s.add(s.add(new b(o,"compositionupdate",!0)).event(i=>te.fire(i))),s.add(s.add(new b(o,"compositionend",!0)).event(i=>ne.fire(i)))}for(const{window:o,disposables:s}of se())re(o,s);e.add(ie(({window:o,disposables:s})=>re(o,s)));let w=0,E,K=!1;const H=new be(()=>{c.textContent="",E=void 0,w=0},_);e.add(oe.event(o=>{K=!0})),e.add(te.event(o=>{o.data&&K?(w>20&&(c.innerText="",w=0),E=E??T(c,L("span.key")),E.textContent=o.data):K&&(c.innerText="",T(c,L("span.key",{},"Backspace"))),H.schedule()})),e.add(ne.event(o=>{E=void 0,w++})),e.add(ee.event(o=>{if(o.key==="Process"||/[\uac00-\ud787\u3131-\u314e\u314f-\u3163\u3041-\u3094\u30a1-\u30f4\u30fc\u3005\u3006\u3024\u4e00-\u9fa5]/u.test(o.key)){o.code==="Backspace"||o.code.includes("Key")?K=!0:(E=void 0,K=!1),H.schedule();return}if(o.isComposing)return;const s=t.getValue("screencastMode.keyboardOptions"),i=new ve(o),v=f.softDispatch(i,i.target);if(v.kind===de.KbFound&&v.commandId&&!(s.showSingleEditorCursorMoves??!0)&&["cursorLeft","cursorRight","cursorUp","cursorDown"].includes(v.commandId))return;(i.ctrlKey||i.altKey||i.metaKey||i.shiftKey||w>20||i.keyCode===R.Backspace||i.keyCode===R.Escape||i.keyCode===R.UpArrow||i.keyCode===R.DownArrow||i.keyCode===R.LeftArrow||i.keyCode===R.RightArrow)&&(c.innerText="",w=0);const pe=f.resolveKeyboardEvent(i),$=this._isKbFound(v)&&v.commandId?this.getCommandDetails(v.commandId):void 0;let B=$?.title,z=pe.getLabel();if($&&((s.showCommandGroups??!1)&&$.category&&(B=`${$.category}: ${B} `),this._isKbFound(v)&&v.commandId)){const U=f.lookupKeybindings(v.commandId).filter(me=>me.getLabel()?.endsWith(z??""));U.length>0&&(z=U[U.length-1].getLabel())}(s.showCommands??!0)&&B&&T(c,L("span.title",{},`${B} `)),((s.showKeys??!0)||(s.showKeybindings??!0)&&this._isKbFound(v))&&(z=z?.replace("UpArrow","\u2191")?.replace("DownArrow","\u2193")?.replace("LeftArrow","\u2190")?.replace("RightArrow","\u2192"),T(c,L("span.key",{},z??""))),w++,H.schedule()})),O.disposable=e}_isKbFound(n){return n.kind===de.KbFound}getCommandDetails(n){const r=Ce.getCommand(n);if(r)return{title:typeof r.title=="string"?r.title:r.title.value,category:r.category?typeof r.category=="string"?r.category:r.category.value:void 0};const t=we.getCommand(n);if(t&&t.metadata?.description)return{title:typeof t.metadata.description=="string"?t.metadata.description:t.metadata.description.value}}}class Ue extends k{constructor(){super({id:"workbench.action.logStorage",title:S({key:"logStorage",comment:["A developer only action to log the contents of the storage for the current window."]},"Log Storage Database Contents"),category:h.Developer,f1:!0})}run(n){const r=n.get(le),t=n.get(ce);r.log(),t.info(a("storageLogDialogMessage","The storage database contents have been logged to the developer tools."),a("storageLogDialogDetails","Open developer tools from the menu and select the Console tab."))}}class Ve extends k{constructor(){super({id:"workbench.action.logWorkingCopies",title:S({key:"logWorkingCopies",comment:["A developer only action to log the working copies that exist."]},"Log Working Copies"),category:h.Developer,f1:!0})}async run(n){const r=n.get(Ge),t=n.get(Fe),f=n.get(Re),e=n.get(Be),u=await t.getBackups(),l=["","[Working Copies]",...r.workingCopies.length>0?r.workingCopies.map(c=>`${c.isDirty()?"\u25CF ":""}${c.resource.toString(!0)} (typeId: ${c.typeId||"<no typeId>"})`):["<none>"],"","[Backups]",...u.length>0?u.map(c=>`${c.resource.toString(!0)} (typeId: ${c.typeId||"<no typeId>"})`):["<none>"]];f.info(l.join(`
`)),e.showChannel($e,!0)}}class Q extends k{static SIZE_THRESHOLD=1024*16;constructor(){super({id:"workbench.action.removeLargeStorageDatabaseEntries",title:S("removeLargeStorageDatabaseEntries","Remove Large Storage Database Entries..."),category:h.Developer,f1:!0})}async run(n){const r=n.get(le),t=n.get(Oe),f=n.get(We),e=n.get(ce),u=n.get(Ee),l=[];for(const d of[A.APPLICATION,A.PROFILE,A.WORKSPACE])if(!(d===A.PROFILE&&f.currentProfile.isDefault))for(const m of[q.MACHINE,q.USER])for(const p of r.keys(d,m)){const y=r.get(p,d);y&&(!u.isBuilt||y.length>Q.SIZE_THRESHOLD)&&l.push({key:p,scope:d,target:m,size:y.length,label:p,description:Ke.formatSize(y.length),detail:a("largeStorageItemDetail","Scope: {0}, Target: {1}",d===A.APPLICATION?a("global","Global"):d===A.PROFILE?a("profile","Profile"):a("workspace","Workspace"),m===q.MACHINE?a("machine","Machine"):a("user","User"))})}l.sort((d,m)=>m.size-d.size);const c=await new Promise(d=>{const m=new j,p=m.add(t.createQuickPick());p.items=l,p.canSelectMany=!0,p.ok=!1,p.customButton=!0,p.hideCheckAll=!0,p.customLabel=a("removeLargeStorageEntriesPickerButton","Remove"),p.placeholder=a("removeLargeStorageEntriesPickerPlaceholder","Select large entries to remove from storage"),l.length===0&&(p.description=a("removeLargeStorageEntriesPickerDescriptionNoEntries","There are no large storage entries to remove.")),p.show(),m.add(p.onDidCustom(()=>{d(p.selectedItems),p.hide()})),m.add(p.onDidHide(()=>m.dispose()))});if(c.length===0)return;const{confirmed:x}=await e.confirm({type:"warning",message:a("removeLargeStorageEntriesConfirmRemove","Do you want to remove the selected storage entries from the database?"),detail:a("removeLargeStorageEntriesConfirmRemoveDetail",`{0}

This action is irreversible and may result in data loss!`,c.map(d=>d.label).join(`
`)),primaryButton:a({key:"removeLargeStorageEntriesButtonLabel",comment:["&& denotes a mnemonic"]},"&&Remove")});if(!x)return;const g=new Set;for(const d of c)r.remove(d.key,d.scope),g.add(d.scope);for(const d of g)await r.optimize(d)}}let D,G=new Set;const M=new xe("dirtyWorkingCopies","stopped");class je extends k{constructor(){super({id:"workbench.action.startTrackDisposables",title:S("startTrackDisposables","Start Tracking Disposables"),category:h.Developer,f1:!0,precondition:Me.and(M.isEqualTo("pending").negate(),M.isEqualTo("started").negate())})}run(n){M.bindTo(n.get(F)).set("started"),G.clear(),D=new he,ae(D)}}class Ne extends k{constructor(){super({id:"workbench.action.snapshotTrackedDisposables",title:S("snapshotTrackedDisposables","Snapshot Tracked Disposables"),category:h.Developer,f1:!0,precondition:M.isEqualTo("started")})}run(n){M.bindTo(n.get(F)).set("pending"),G=new Set(D?.computeLeakingDisposables(1e3)?.leaks.map(t=>t.value))}}class qe extends k{constructor(){super({id:"workbench.action.stopTrackDisposables",title:S("stopTrackDisposables","Stop Tracking Disposables"),category:h.Developer,f1:!0,precondition:M.isEqualTo("pending")})}run(n){const r=n.get(ze);if(M.bindTo(n.get(F)).set("stopped"),D){const f=new Set;for(const u of new Set(D.computeLeakingDisposables(1e3)?.leaks)??[])G.has(u.value)&&f.add(u);const e=D.computeLeakingDisposables(1e3,Array.from(f));e&&r.openEditor({resource:void 0,contents:e.details})}ae(null),D=void 0,G.clear()}}C(He),C(O),C(Ue),C(Ve),C(Q),Ae.commit||(C(je),C(Ne),C(qe));const Qe=Pe.as(De.Configuration);Qe.registerConfiguration({id:"screencastMode",order:9,title:a("screencastModeConfigurationTitle","Screencast Mode"),type:"object",properties:{"screencastMode.verticalOffset":{type:"number",default:20,minimum:0,maximum:90,description:a("screencastMode.location.verticalPosition","Controls the vertical offset of the screencast mode overlay from the bottom as a percentage of the workbench height.")},"screencastMode.fontSize":{type:"number",default:56,minimum:20,maximum:100,description:a("screencastMode.fontSize","Controls the font size (in pixels) of the screencast mode keyboard.")},"screencastMode.keyboardOptions":{type:"object",description:a("screencastMode.keyboardOptions.description","Options for customizing the keyboard overlay in screencast mode."),properties:{showKeys:{type:"boolean",default:!0,description:a("screencastMode.keyboardOptions.showKeys","Show raw keys.")},showKeybindings:{type:"boolean",default:!0,description:a("screencastMode.keyboardOptions.showKeybindings","Show keyboard shortcuts.")},showCommands:{type:"boolean",default:!0,description:a("screencastMode.keyboardOptions.showCommands","Show command names.")},showCommandGroups:{type:"boolean",default:!1,description:a("screencastMode.keyboardOptions.showCommandGroups","Show command group names, when commands are also shown.")},showSingleEditorCursorMoves:{type:"boolean",default:!0,description:a("screencastMode.keyboardOptions.showSingleEditorCursorMoves","Show single editor cursor move commands.")}},default:{showKeys:!0,showKeybindings:!0,showCommands:!0,showCommandGroups:!1,showSingleEditorCursorMoves:!0},additionalProperties:!1},"screencastMode.keyboardOverlayTimeout":{type:"number",default:800,minimum:500,maximum:5e3,description:a("screencastMode.keyboardOverlayTimeout","Controls how long (in milliseconds) the keyboard overlay is shown in screencast mode.")},"screencastMode.mouseIndicatorColor":{type:"string",format:"color-hex",default:"#FF0000",description:a("screencastMode.mouseIndicatorColor","Controls the color in hex (#RGB, #RGBA, #RRGGBB or #RRGGBBAA) of the mouse indicator in screencast mode.")},"screencastMode.mouseIndicatorSize":{type:"number",default:20,minimum:20,maximum:100,description:a("screencastMode.mouseIndicatorSize","Controls the size (in pixels) of the mouse indicator in screencast mode.")}}});
