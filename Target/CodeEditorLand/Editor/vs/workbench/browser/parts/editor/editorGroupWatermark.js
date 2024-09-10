var W=Object.defineProperty;var K=Object.getOwnPropertyDescriptor;var f=(c,a,r,n)=>{for(var e=n>1?void 0:n?K(a,r):a,o=c.length-1,s;o>=0;o--)(s=c[o])&&(e=(n?s(a,r,e):s(e))||e);return n&&e&&W(a,r,e),e},l=(c,a)=>(r,n)=>a(r,n,c);import{localize as i}from"../../../../nls.js";import{Disposable as L,DisposableStore as D}from"../../../../base/common/lifecycle.js";import{isMacintosh as I,isWeb as O,OS as T}from"../../../../base/common/platform.js";import{IKeybindingService as M}from"../../../../platform/keybinding/common/keybinding.js";import{IWorkspaceContextService as R,WorkbenchState as U}from"../../../../platform/workspace/common/workspace.js";import{IConfigurationService as q}from"../../../../platform/configuration/common/configuration.js";import{append as d,clearNode as w,$ as h,h as b}from"../../../../base/browser/dom.js";import{KeybindingLabel as N}from"../../../../base/browser/ui/keybindingLabel/keybindingLabel.js";import{CommandsRegistry as _}from"../../../../platform/commands/common/commands.js";import{ContextKeyExpr as u,IContextKeyService as A}from"../../../../platform/contextkey/common/contextkey.js";import{defaultKeybindingLabelStyles as H}from"../../../../platform/theme/browser/defaultStyles.js";import{editorForeground as m,registerColor as P,transparent as S}from"../../../../platform/theme/common/colorRegistry.js";P("editorWatermark.foreground",{dark:S(m,.6),light:S(m,.68),hcDark:m,hcLight:m},i("editorLineHighlight","Foreground color for the labels in the editor watermark."));const v={text:i("watermark.showCommands","Show All Commands"),id:"workbench.action.showCommands"},z={text:i("watermark.quickAccess","Go to File"),id:"workbench.action.quickOpen"},V={text:i("watermark.openFile","Open File"),id:"workbench.action.files.openFile",mac:!1},Y={text:i("watermark.openFolder","Open Folder"),id:"workbench.action.files.openFolder",mac:!1},$={text:i("watermark.openFileFolder","Open File or Folder"),id:"workbench.action.files.openFileFolder",mac:!0},j={text:i("watermark.openRecent","Open Recent"),id:"workbench.action.openRecent"},B={text:i("watermark.newUntitledFile","New Untitled Text File"),id:"workbench.action.files.newUntitledFile",mac:!0},J={text:i("watermark.findInFiles","Find in Files"),id:"workbench.action.findInFiles"},Q={text:i({key:"watermark.toggleTerminal",comment:["toggle is a verb here"]},"Toggle Terminal"),id:"workbench.action.terminal.toggleTerminal",when:u.equals("terminalProcessSupported",!0)},X={text:i("watermark.startDebugging","Start Debugging"),id:"workbench.action.debug.start",when:u.equals("terminalProcessSupported",!0)},Z={text:i({key:"watermark.toggleFullscreen",comment:["toggle is a verb here"]},"Toggle Full Screen"),id:"workbench.action.toggleFullScreen"},G={text:i("watermark.showSettings","Show Settings"),id:"workbench.action.openSettings"},x=[v,V,Y,$,j,B],F=[v,z,J,X,Q,Z,G];let g=class extends L{constructor(r,n,e,o,s){super();this.keybindingService=n;this.contextService=e;this.contextKeyService=o;this.configurationService=s;const t=b(".editor-group-watermark",[b(".letterpress"),b(".shortcuts@shortcuts")]);d(r,t.root),this.shortcuts=t.shortcuts,this.registerListeners(),this.workbenchState=e.getWorkbenchState(),this.render()}shortcuts;transientDisposables=this._register(new D);enabled=!1;workbenchState;keybindingLabels=new Set;registerListeners(){this._register(this.configurationService.onDidChangeConfiguration(e=>{e.affectsConfiguration("workbench.tips.enabled")&&this.render()})),this._register(this.contextService.onDidChangeWorkbenchState(e=>{this.workbenchState!==e&&(this.workbenchState=e,this.render())}));const r=[...x,...F].filter(e=>e.when!==void 0).map(e=>e.when),n=new Set;r.forEach(e=>e.keys().forEach(o=>n.add(o))),this._register(this.contextKeyService.onDidChangeContext(e=>{e.affectsSome(n)&&this.render()}))}render(){const r=this.configurationService.getValue("workbench.tips.enabled");if(r===this.enabled||(this.enabled=r,this.clear(),!r))return;const n=d(this.shortcuts,h(".watermark-box")),o=(this.workbenchState!==U.EMPTY?F:x).filter(t=>!("when"in t)||this.contextKeyService.contextMatchesRules(t.when)).filter(t=>!("mac"in t)||t.mac===(I&&!O)).filter(t=>!!_.getCommand(t.id)).filter(t=>!!this.keybindingService.lookupKeybinding(t.id)),s=()=>{w(n),this.keybindingLabels.forEach(t=>t.dispose()),this.keybindingLabels.clear();for(const t of o){const p=this.keybindingService.lookupKeybinding(t.id);if(!p)continue;const k=d(n,h("dl")),C=d(k,h("dt"));C.textContent=t.text;const E=d(k,h("dd")),y=new N(E,T,{renderUnboundKeybindings:!0,...H});y.set(p),this.keybindingLabels.add(y)}};s(),this.transientDisposables.add(this.keybindingService.onDidUpdateKeybindings(s))}clear(){w(this.shortcuts),this.transientDisposables.clear()}dispose(){super.dispose(),this.clear(),this.keybindingLabels.forEach(r=>r.dispose())}};g=f([l(1,M),l(2,R),l(3,A),l(4,q)],g);export{g as EditorGroupWatermark};
