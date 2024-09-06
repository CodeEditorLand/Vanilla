var Q=Object.defineProperty;var E=Object.getOwnPropertyDescriptor;var g=(L,u,i,e)=>{for(var r=e>1?void 0:e?E(u,i):u,c=L.length-1,n;c>=0;c--)(n=L[c])&&(r=(e?n(u,i,r):n(r))||r);return e&&r&&Q(u,i,r),r},v=(L,u)=>(i,e)=>u(i,e,L);import{EventType as D}from"../../../../../base/browser/dom.js";import{Sequencer as F,timeout as V}from"../../../../../base/common/async.js";import{Emitter as q,Event as T}from"../../../../../base/common/event.js";import{DisposableStore as x}from"../../../../../base/common/lifecycle.js";import{basenameOrAuthority as A,dirname as C}from"../../../../../base/common/resources.js";import{localize as p}from"../../../../../nls.js";import{AccessibleViewProviderId as R,IAccessibleViewService as U}from"../../../../../platform/accessibility/browser/accessibleView.js";import{IInstantiationService as W}from"../../../../../platform/instantiation/common/instantiation.js";import{ILabelService as $}from"../../../../../platform/label/common/label.js";import{IQuickInputService as K,QuickInputHideReason as M}from"../../../../../platform/quickinput/common/quickInput.js";import{PickerEditorState as O}from"../../../../browser/quickaccess.js";import{TerminalLinkQuickPickEvent as j}from"../../../terminal/browser/terminal.js";import{TerminalBuiltinLinkType as S}from"./links.js";import"./terminalLinkManager.js";import{getLinkSuffix as B}from"./terminalLinkParsing.js";let w=class extends x{constructor(i,e,r,c){super();this._labelService=i;this._quickInputService=e;this._accessibleViewService=r;this._editorViewState=this.add(c.createInstance(O))}_editorSequencer=new F;_editorViewState;_instance;_onDidRequestMoreLinks=this.add(new q);onDidRequestMoreLinks=this._onDidRequestMoreLinks.event;async show(i,e){this._instance=i;const r=await Promise.race([e.all,V(500)]),c=typeof r=="object",n=c?r:e.viewport,t=n.wordLinks?await this._generatePicks(n.wordLinks):void 0,o=n.fileLinks?await this._generatePicks(n.fileLinks):void 0,d=n.folderLinks?await this._generatePicks(n.folderLinks):void 0,P=n.webLinks?await this._generatePicks(n.webLinks):void 0,k=[];P&&(k.push({type:"separator",label:p("terminal.integrated.urlLinks","Url")}),k.push(...P)),o&&(k.push({type:"separator",label:p("terminal.integrated.localFileLinks","File")}),k.push(...o)),d&&(k.push({type:"separator",label:p("terminal.integrated.localFolderLinks","Folder")}),k.push(...d)),t&&(k.push({type:"separator",label:p("terminal.integrated.searchLinks","Workspace Search")}),k.push(...t));const s=this._quickInputService.createQuickPick({useSeparators:!0}),f=new x;f.add(s),s.items=k,s.placeholder=p("terminal.integrated.openDetectedLink","Select the link to open, type to filter all links"),s.sortByLabel=!1,s.show(),s.activeItems.length>0&&this._previewItem(s.activeItems[0]);let _=!1;return c||f.add(T.once(s.onDidChangeValue)(async()=>{const a=await e.all;if(_)return;const h=[...a.fileLinks??[],...a.folderLinks??[],...a.webLinks??[]],l=a.wordLinks?await this._generatePicks(a.wordLinks,h):void 0,I=a.fileLinks?await this._generatePicks(a.fileLinks):void 0,y=a.folderLinks?await this._generatePicks(a.folderLinks):void 0,b=a.webLinks?await this._generatePicks(a.webLinks):void 0,m=[];b&&(m.push({type:"separator",label:p("terminal.integrated.urlLinks","Url")}),m.push(...b)),I&&(m.push({type:"separator",label:p("terminal.integrated.localFileLinks","File")}),m.push(...I)),y&&(m.push({type:"separator",label:p("terminal.integrated.localFolderLinks","Folder")}),m.push(...y)),l&&(m.push({type:"separator",label:p("terminal.integrated.searchLinks","Workspace Search")}),m.push(...l)),s.items=m})),f.add(s.onDidChangeActive(async()=>{const[a]=s.activeItems;this._previewItem(a)})),new Promise(a=>{f.add(s.onDidHide(({reason:h})=>{if(this._terminalScrollStateSaved){const l=this._instance?.xterm?.markTracker;l&&(l.restoreScrollState(),l.clear(),this._terminalScrollStateSaved=!1)}h===M.Gesture&&this._editorViewState.restore(),f.dispose(),s.selectedItems.length===0&&this._accessibleViewService.showLastProvider(R.Terminal),a()})),f.add(T.once(s.onDidAccept)(()=>{if(this._terminalScrollStateSaved){const I=this._instance?.xterm?.markTracker;I&&(I.restoreScrollState(),I.clear(),this._terminalScrollStateSaved=!1)}_=!0;const h=new j(D.CLICK),l=s.activeItems?.[0];l&&"link"in l&&l.link.activate(h,l.label),f.dispose(),a()}))})}async _generatePicks(i,e){if(!i)return;const r=new Set,c=new Set,n=[];for(const t of i){let o=t.text;if(!r.has(o)&&(!e||!e.some(d=>d.text===o))){r.add(o);let d;if("uri"in t&&t.uri){if((t.type===S.LocalFile||t.type===S.LocalFolderInWorkspace||t.type===S.LocalFolderOutsideWorkspace)&&(o=A(t.uri),d=this._labelService.getUriLabel(C(t.uri),{relative:!0})),t.type===S.LocalFile&&t.parsedLink?.suffix?.row!==void 0&&(o+=`:${t.parsedLink.suffix.row}`,t.parsedLink?.suffix?.rowEnd!==void 0&&(o+=`-${t.parsedLink.suffix.rowEnd}`),t.parsedLink?.suffix?.col!==void 0&&(o+=`:${t.parsedLink.suffix.col}`,t.parsedLink?.suffix?.colEnd!==void 0&&(o+=`-${t.parsedLink.suffix.colEnd}`))),c.has(o+"|"+(d??"")))continue;c.add(o+"|"+(d??""))}n.push({label:o,link:t,description:d})}}return n.length>0?n:void 0}_previewItem(i){if(!i||!("link"in i)||!i.link)return;const e=i.link;this._previewItemInTerminal(e),!(!("uri"in e)||!e.uri)&&e.type===S.LocalFile&&this._previewItemInEditor(e)}_previewItemInEditor(i){const e=i.parsedLink?i.parsedLink.suffix:B(i.text),r=e?.row===void 0?void 0:{startLineNumber:e.row??1,startColumn:e.col??1,endLineNumber:e.rowEnd,endColumn:e.colEnd};this._editorViewState.set(),this._editorSequencer.queue(async()=>{await this._editorViewState.openTransientEditor({resource:i.uri,options:{preserveFocus:!0,revealIfOpened:!0,ignoreError:!0,selection:r}})})}_terminalScrollStateSaved=!1;_previewItemInTerminal(i){const e=this._instance?.xterm;e&&(this._terminalScrollStateSaved||(e.markTracker.saveScrollState(),this._terminalScrollStateSaved=!0),e.markTracker.revealRange(i.range))}};w=g([v(0,$),v(1,K),v(2,U),v(3,W)],w);export{w as TerminalLinkQuickpick};
