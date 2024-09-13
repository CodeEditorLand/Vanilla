var G=Object.defineProperty;var J=Object.getOwnPropertyDescriptor;var z=(u,e,a,n)=>{for(var l=n>1?void 0:n?J(e,a):e,h=u.length-1,k;h>=0;h--)(k=u[h])&&(l=(n?k(e,a,l):k(l))||l);return n&&l&&G(e,a,l),l},M=(u,e)=>(a,n)=>e(a,n,u);import{Toggle as X}from"../../../../base/browser/ui/toggle/toggle.js";import{fromNow as Y}from"../../../../base/common/date.js";import{Disposable as Z,DisposableStore as ee}from"../../../../base/common/lifecycle.js";import{OperatingSystem as te,isMacintosh as H}from"../../../../base/common/platform.js";import{ThemeIcon as O}from"../../../../base/common/themables.js";import{URI as oe}from"../../../../base/common/uri.js";import{IModelService as ie}from"../../../../editor/common/services/model.js";import{ITextModelService as re}from"../../../../editor/common/services/resolverService.js";import{localize as y}from"../../../../nls.js";import{AccessibleViewProviderId as ne,IAccessibleViewService as se}from"../../../../platform/accessibility/browser/accessibleView.js";import{IInstantiationService as ae}from"../../../../platform/instantiation/common/instantiation.js";import{showWithPinnedItems as me}from"../../../../platform/quickinput/browser/quickPickPin.js";import{IQuickInputService as ce}from"../../../../platform/quickinput/common/quickInput.js";import{IStorageService as le}from"../../../../platform/storage/common/storage.js";import{TerminalCapability as B}from"../../../../platform/terminal/common/capabilities/capabilities.js";import{collapseTildePath as de}from"../../../../platform/terminal/common/terminalEnvironment.js";import{asCssVariable as Q,inputActiveOptionBackground as ue,inputActiveOptionBorder as pe,inputActiveOptionForeground as fe}from"../../../../platform/theme/common/colorRegistry.js";import{IEditorService as ge}from"../../../services/editor/common/editorService.js";import{getCommandHistory as $,getDirectoryHistory as V,getShellFileHistory as he}from"../common/history.js";import{TerminalStorageKeys as ye}from"../common/terminalStorageKeys.js";import{terminalStrings as w}from"../common/terminalStrings.js";import{commandHistoryFuzzySearchIcon as Ie,commandHistoryOutputIcon as ve,commandHistoryRemoveIcon as ke}from"./terminalIcons.js";async function D(u,e,a,n,l,h){if(!e.xterm)return;const k=u.get(ge),p=u.get(ae),E=u.get(ce),K=u.get(le),N=u.get(se),U=`${ye.PinnedRecentCommandsPrefix}.${e.shellType}`;let C,s=[];const I=new Set,x={iconClass:O.asClassName(ke),tooltip:y("removeCommand","Remove from Command History")},R={iconClass:O.asClassName(ve),tooltip:y("viewCommandOutput","View Command Output"),alwaysVisible:!1};if(n==="command"){let m=function(i){return i.replace(/\r?\n/g,"\u23CE").replace(/\s\s\s+/g,"\u22EF")};var Se=m;C=H?y("selectRecentCommandMac","Select a command to run (hold Option-key to edit the command)"):y("selectRecentCommand","Select a command to run (hold Alt-key to edit the command)");const t=e.capabilities.get(B.CommandDetection),o=t?.commands,c=t?.executingCommand;if(c&&I.add(c),o&&o.length>0){for(const i of o){const f=i.command.trim();if(f.length===0||I.has(f))continue;let v=de(i.cwd,e.userHome,e.os===te.Windows?"\\":"/");i.exitCode&&(i.exitCode===-1?v+=" failed":v+=` exitCode: ${i.exitCode}`),v=v.trim();const W=[R],b=s.length>0?s[s.length-1]:void 0;if(b?.type!=="separator"&&b?.label===f){b.id=i.timestamp.toString(),b.description=v;continue}s.push({label:m(f),rawLabel:f,description:v,id:i.timestamp.toString(),command:i,buttons:i.hasOutput()?W:void 0}),I.add(f)}s=s.reverse()}c&&s.unshift({label:m(c),rawLabel:c,description:t.cwd}),s.length>0&&s.unshift({type:"separator",label:w.currentSessionCategory});const S=p.invokeFunction($),L=[];for(const[i,f]of S.entries)!I.has(i)&&f.shellType===e.shellType&&(L.unshift({label:m(i),rawLabel:i,buttons:[x]}),I.add(i));L.length>0&&s.push({type:"separator",label:w.previousSessionCategory},...L);const q=await p.invokeFunction(he,e.shellType),A=[];for(const i of q)I.has(i)||A.unshift({label:m(i),rawLabel:i});A.length>0&&s.push({type:"separator",label:y("shellFileHistoryCategory","{0} history",e.shellType)},...A)}else{C=H?y("selectRecentDirectoryMac","Select a directory to go to (hold Option-key to edit the command)"):y("selectRecentDirectory","Select a directory to go to (hold Alt-key to edit the command)");const t=e.capabilities.get(B.CwdDetection)?.cwds||[];if(t&&t.length>0){for(const m of t)s.push({label:m,rawLabel:m});s=s.reverse(),s.unshift({type:"separator",label:w.currentSessionCategory})}const o=p.invokeFunction(V),c=[];for(const[m,S]of o.entries)(S===null||S.remoteAuthority===e.remoteAuthority)&&!t.includes(m)&&c.unshift({label:m,rawLabel:m,buttons:[x]});c.length>0&&s.push({type:"separator",label:w.previousSessionCategory},...c)}if(s.length===0)return;const d=new ee,T=d.add(new X({title:"Fuzzy search",icon:Ie,isChecked:l==="fuzzy",inputActiveOptionBorder:Q(pe),inputActiveOptionForeground:Q(fe),inputActiveOptionBackground:Q(ue)}));d.add(T.onChange(()=>{p.invokeFunction(D,e,a,n,T.checked?"fuzzy":"contiguous",r.value)}));const _=d.add(p.createInstance(g)),r=d.add(E.createQuickPick({useSeparators:!0})),j=s;r.items=[...j],r.sortByLabel=!1,r.placeholder=C,r.matchOnLabelMode=l||"contiguous",r.toggles=[T],d.add(r.onDidTriggerItemButton(async t=>{if(t.button===x)n==="command"?p.invokeFunction($)?.remove(t.item.label):p.invokeFunction(V)?.remove(t.item.label);else if(t.button===R){const o=t.item.command,c=o?.getOutput();if(c&&o?.command){const m=await _.provideTextContent(oe.from({scheme:g.scheme,path:`${o.command}... ${Y(o.timestamp,!0)}`,fragment:c,query:`terminal-output-${o.timestamp}-${e.instanceId}`}));m&&await k.openEditor({resource:m.uri})}}await p.invokeFunction(D,e,a,n,l,h)})),d.add(r.onDidChangeValue(async t=>{t||await p.invokeFunction(D,e,a,n,l,t)}));let P=!1;function F(){P=!1,e.xterm?.markTracker.restoreScrollState(),e.xterm?.markTracker.clear()}return d.add(r.onDidChangeActive(async()=>{const t=e.xterm;if(!t)return;const[o]=r.activeItems;if(o)if("command"in o&&o.command&&o.command.marker){P||(t.markTracker.saveScrollState(),P=!0);const c=o.command.getPromptRowCount(),m=o.command.getCommandRowCount();t.markTracker.revealRange({start:{x:1,y:o.command.marker.line-(c-1)+1},end:{x:e.cols,y:o.command.marker.line+(m-1)+1}})}else F()})),d.add(r.onDidAccept(async()=>{const t=r.activeItems[0];let o;n==="cwd"?o=`cd ${await e.preparePathForShell(t.rawLabel)}`:o=t.rawLabel,r.hide(),e.runCommand(o,!r.keyMods.alt),r.keyMods.alt&&e.focus(),F()})),d.add(r.onDidHide(()=>F())),h&&(r.value=h),new Promise(t=>{a.set(!0),d.add(me(K,U,r,!0)),d.add(r.onDidHide(()=>{a.set(!1),N.showLastProvider(ne.Terminal),t(),d.dispose()}))})}let g=class extends Z{constructor(a,n){super();this._modelService=n;this._register(a.registerTextModelContentProvider(g.scheme,this))}static scheme="TERMINAL_OUTPUT";async provideTextContent(a){const n=this._modelService.getModel(a);return n&&!n.isDisposed()?n:this._modelService.createModel(a.fragment,null,a,!1)}};g=z([M(0,re),M(1,ie)],g);export{D as showRunRecentQuickPick};
