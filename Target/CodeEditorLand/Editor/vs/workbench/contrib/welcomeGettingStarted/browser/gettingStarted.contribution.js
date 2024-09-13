var q=Object.defineProperty;var F=Object.getOwnPropertyDescriptor;var O=(t,e,o,r)=>{for(var n=r>1?void 0:r?F(e,o):e,s=t.length-1,a;s>=0;s--)(a=t[s])&&(n=(r?a(e,o,n):a(n))||n);return r&&n&&q(e,o,n),n},w=(t,e)=>(o,r)=>e(o,r,t);import{KeyCode as K}from"../../../../base/common/keyCodes.js";import{DisposableStore as Q}from"../../../../base/common/lifecycle.js";import{OperatingSystem as b,isLinux as B,isMacintosh as z,isWindows as H}from"../../../../base/common/platform.js";import{localize as c,localize2 as g}from"../../../../nls.js";import{AccessibleViewRegistry as L}from"../../../../platform/accessibility/browser/accessibleViewRegistry.js";import{Categories as N}from"../../../../platform/action/common/actionCommonCategories.js";import{Action2 as u,MenuId as _,registerAction2 as f}from"../../../../platform/actions/common/actions.js";import{CommandsRegistry as j,ICommandService as M}from"../../../../platform/commands/common/commands.js";import{Extensions as J,ConfigurationScope as E}from"../../../../platform/configuration/common/configurationRegistry.js";import{ContextKeyExpr as X,IContextKeyService as G,RawContextKey as Y}from"../../../../platform/contextkey/common/contextkey.js";import{SyncDescriptor as Z}from"../../../../platform/instantiation/common/descriptors.js";import{IInstantiationService as $}from"../../../../platform/instantiation/common/instantiation.js";import{KeybindingWeight as ee}from"../../../../platform/keybinding/common/keybindingsRegistry.js";import{IQuickInputService as te}from"../../../../platform/quickinput/common/quickInput.js";import{Registry as I}from"../../../../platform/registry/common/platform.js";import{EditorPaneDescriptor as oe}from"../../../browser/editor.js";import{workbenchConfigurationNodeBase as re}from"../../../common/configuration.js";import{WorkbenchPhase as x,registerWorkbenchContribution2 as C}from"../../../common/contributions.js";import{EditorExtensions as D}from"../../../common/editor.js";import{IEditorGroupsService as ie}from"../../../services/editor/common/editorGroupsService.js";import{IEditorService as P,SIDE_GROUP as R}from"../../../services/editor/common/editorService.js";import{IExtensionManagementServerService as ne}from"../../../services/extensionManagement/common/extensionManagement.js";import{IExtensionService as se}from"../../../services/extensions/common/extensions.js";import{IRemoteAgentService as ce}from"../../../services/remote/common/remoteAgentService.js";import{ExtensionsInput as ae}from"../../extensions/common/extensionsInput.js";import{GettingStartedInputSerializer as de,GettingStartedPage as v,inWelcomeContext as le}from"./gettingStarted.js";import{GettingStartedAccessibleView as pe}from"./gettingStartedAccessibleView.js";import{GettingStartedInput as p}from"./gettingStartedInput.js";import{IWalkthroughsService as W}from"./gettingStartedService.js";import{StartupPageEditorResolverContribution as T,StartupPageRunnerContribution as V}from"./startupPage.js";import*as Le from"./gettingStartedIcons.js";f(class extends u{constructor(){super({id:"workbench.action.openWalkthrough",title:g("miWelcome","Welcome"),category:N.Help,f1:!0,menu:{id:_.MenubarHelpMenu,group:"1_welcome",order:1},metadata:{description:g("minWelcomeDescription","Opens a Walkthrough to help you get started in VS Code.")}})}run(t,e,o){const r=t.get(ie),n=t.get($),s=t.get(P),a=t.get(M);if(e){const i=typeof e=="string"?e:e.category,d=typeof e=="string"?void 0:e.category+"#"+e.step;if(!i&&!d){s.openEditor({resource:p.RESOURCE,options:{preserveFocus:o??!1}},o?R:void 0);return}for(const l of r.groups)if(l.activeEditor instanceof p){l.activeEditorPane.makeCategoryVisibleWhenAvailable(i,d);return}const U=s.findEditors({typeId:p.ID,editorId:void 0,resource:p.RESOURCE});for(const{editor:l,groupId:k}of U)if(l instanceof p){const A=r.getGroup(k);if(!l.selectedCategory&&A){l.selectedCategory=i,l.selectedStep=d,A.openEditor(l,{revealIfOpened:!0});return}}const S=s.activeEditor;if(d&&S instanceof p&&S.selectedCategory===i){a.executeCommand("walkthroughs.selectStep",d);return}if(S instanceof ae)r.activeGroup.replaceEditors([{editor:S,replacement:n.createInstance(p,{selectedCategory:i,selectedStep:d})}]);else{const l={selectedCategory:i,selectedStep:d,preserveFocus:o??!1};s.openEditor({resource:p.RESOURCE,options:l},o?R:void 0).then(k=>{k?.makeCategoryVisibleWhenAvailable(i,d)})}}else s.openEditor({resource:p.RESOURCE,options:{preserveFocus:o??!1}},o?R:void 0)}}),I.as(D.EditorFactory).registerEditorSerializer(p.ID,de),I.as(D.EditorPane).registerEditorPane(oe.create(v,v.ID,c("welcome","Welcome")),[new Z(p)]);const y=g("welcome","Welcome");f(class extends u{constructor(){super({id:"welcome.goBack",title:g("welcome.goBack","Go Back"),category:y,keybinding:{weight:ee.EditorContrib,primary:K.Escape,when:le},precondition:X.equals("activeEditor","gettingStartedPage"),f1:!0})}run(t){const o=t.get(P).activeEditorPane;o instanceof v&&o.escape()}}),j.registerCommand({id:"walkthroughs.selectStep",handler:(t,e)=>{const r=t.get(P).activeEditorPane;r instanceof v&&r.selectStepLoose(e)}}),f(class extends u{constructor(){super({id:"welcome.markStepComplete",title:c("welcome.markStepComplete","Mark Step Complete"),category:y})}run(t,e){if(!e)return;t.get(W).progressStep(e)}}),f(class extends u{constructor(){super({id:"welcome.markStepIncomplete",title:c("welcome.markStepInomplete","Mark Step Incomplete"),category:y})}run(t,e){if(!e)return;t.get(W).deprogressStep(e)}}),f(class extends u{constructor(){super({id:"welcome.showAllWalkthroughs",title:g("welcome.showAllWalkthroughs","Open Walkthrough..."),category:y,f1:!0})}async getQuickPickItems(t,e){return(await e.getWalkthroughs()).filter(r=>t.contextMatchesRules(r.when)).map(r=>({id:r.id,label:r.title,detail:r.description,description:r.source}))}async run(t){const e=t.get(M),o=t.get(G),r=t.get(te),n=t.get(W),s=t.get(se),a=new Q,i=a.add(r.createQuickPick());i.canSelectMany=!1,i.matchOnDescription=!0,i.matchOnDetail=!0,i.placeholder=c("pickWalkthroughs","Select a walkthrough to open"),i.items=await this.getQuickPickItems(o,n),i.busy=!0,a.add(i.onDidAccept(()=>{const d=i.selectedItems[0];d&&e.executeCommand("workbench.action.openWalkthrough",d.id),i.hide()})),a.add(i.onDidHide(()=>a.dispose())),await s.whenInstalledExtensionsRegistered(),n.onDidAddWalkthrough(async()=>{i.items=await this.getQuickPickItems(o,n)}),i.show(),i.busy=!1}});const h=new Y("workspacePlatform",void 0,c("workspacePlatform","The platform of the current workspace, which in remote or serverless contexts may be different from the platform of the UI"));let m=class{constructor(e,o,r){this.extensionManagementServerService=e;this.remoteAgentService=o;this.contextService=r;this.remoteAgentService.getEnvironment().then(n=>{const s=n?.os,a=s===b.Macintosh?"mac":s===b.Windows?"windows":s===b.Linux?"linux":void 0;a?h.bindTo(this.contextService).set(a):this.extensionManagementServerService.localExtensionManagementServer?z?h.bindTo(this.contextService).set("mac"):B?h.bindTo(this.contextService).set("linux"):H&&h.bindTo(this.contextService).set("windows"):this.extensionManagementServerService.webExtensionManagementServer&&h.bindTo(this.contextService).set("webworker")})}static ID="workbench.contrib.workspacePlatform"};m=O([w(0,ne),w(1,ce),w(2,G)],m);const me=I.as(J.Configuration);me.registerConfiguration({...re,properties:{"workbench.welcomePage.walkthroughs.openOnInstall":{scope:E.MACHINE,type:"boolean",default:!0,description:c("workbench.welcomePage.walkthroughs.openOnInstall","When enabled, an extension's walkthrough will open upon install of the extension.")},"workbench.startupEditor":{scope:E.RESOURCE,type:"string",enum:["none","welcomePage","readme","newUntitledFile","welcomePageInEmptyWorkbench","terminal"],enumDescriptions:[c({comment:["This is the description for a setting. Values surrounded by single quotes are not to be translated."],key:"workbench.startupEditor.none"},"Start without an editor."),c({comment:["This is the description for a setting. Values surrounded by single quotes are not to be translated."],key:"workbench.startupEditor.welcomePage"},"Open the Welcome page, with content to aid in getting started with VS Code and extensions."),c({comment:["This is the description for a setting. Values surrounded by single quotes are not to be translated."],key:"workbench.startupEditor.readme"},"Open the README when opening a folder that contains one, fallback to 'welcomePage' otherwise. Note: This is only observed as a global configuration, it will be ignored if set in a workspace or folder configuration."),c({comment:["This is the description for a setting. Values surrounded by single quotes are not to be translated."],key:"workbench.startupEditor.newUntitledFile"},"Open a new untitled text file (only applies when opening an empty window)."),c({comment:["This is the description for a setting. Values surrounded by single quotes are not to be translated."],key:"workbench.startupEditor.welcomePageInEmptyWorkbench"},"Open the Welcome page when opening an empty workbench."),c({comment:["This is the description for a setting. Values surrounded by single quotes are not to be translated."],key:"workbench.startupEditor.terminal"},"Open a new terminal in the editor area.")],default:"welcomePage",description:c("workbench.startupEditor","Controls which editor is shown at startup, if none are restored from the previous session.")},"workbench.welcomePage.preferReducedMotion":{scope:E.APPLICATION,type:"boolean",default:!1,deprecationMessage:c("deprecationMessage","Deprecated, use the global `workbench.reduceMotion`."),description:c("workbench.welcomePage.preferReducedMotion","When enabled, reduce motion in welcome page.")}}}),C(m.ID,m,x.AfterRestored),C(T.ID,T,x.BlockRestore),C(V.ID,V,x.AfterRestored),L.register(new pe);export{h as WorkspacePlatform,Le as icons};
