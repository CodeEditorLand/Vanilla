var N=Object.defineProperty;var q=Object.getOwnPropertyDescriptor;var E=(a,c,r,o)=>{for(var i=o>1?void 0:o?q(c,r):c,d=a.length-1,s;d>=0;d--)(s=a[d])&&(i=(o?s(c,r,i):s(i))||i);return o&&i&&N(c,r,i),i},P=(a,c)=>(r,o)=>c(r,o,a);import{localize as e}from"../../../../nls.js";import{isFalsyOrWhitespace as k}from"../../../../base/common/strings.js";import*as x from"../../../../base/common/resources.js";import{ExtensionsRegistry as S}from"../../extensions/common/extensionsRegistry.js";import{ContextKeyExpr as U}from"../../../../platform/contextkey/common/contextkey.js";import{MenuId as t,MenuRegistry as C}from"../../../../platform/actions/common/actions.js";import{Disposable as L,DisposableStore as F}from"../../../../base/common/lifecycle.js";import{ThemeIcon as R}from"../../../../base/common/themables.js";import{index as A}from"../../../../base/common/arrays.js";import{isProposedApiEnabled as $}from"../../extensions/common/extensions.js";import{Extensions as G}from"../../extensionManagement/common/extensionFeatures.js";import{Registry as H}from"../../../../platform/registry/common/platform.js";import{SyncDescriptor as K}from"../../../../platform/instantiation/common/descriptors.js";import{platform as z}from"../../../../base/common/process.js";import{MarkdownString as j}from"../../../../base/common/htmlContent.js";import{IKeybindingService as J}from"../../../../platform/keybinding/common/keybinding.js";const O=[{key:"commandPalette",id:t.CommandPalette,description:e("menus.commandPalette","The Command Palette"),supportsSubmenus:!1},{key:"touchBar",id:t.TouchBarContext,description:e("menus.touchBar","The touch bar (macOS only)"),supportsSubmenus:!1},{key:"editor/title",id:t.EditorTitle,description:e("menus.editorTitle","The editor title menu")},{key:"editor/title/run",id:t.EditorTitleRun,description:e("menus.editorTitleRun","Run submenu inside the editor title menu")},{key:"editor/context",id:t.EditorContext,description:e("menus.editorContext","The editor context menu")},{key:"editor/context/copy",id:t.EditorContextCopy,description:e("menus.editorContextCopyAs","'Copy as' submenu in the editor context menu")},{key:"editor/context/share",id:t.EditorContextShare,description:e("menus.editorContextShare","'Share' submenu in the editor context menu"),proposed:"contribShareMenu"},{key:"explorer/context",id:t.ExplorerContext,description:e("menus.explorerContext","The file explorer context menu")},{key:"explorer/context/share",id:t.ExplorerContextShare,description:e("menus.explorerContextShare","'Share' submenu in the file explorer context menu"),proposed:"contribShareMenu"},{key:"editor/title/context",id:t.EditorTitleContext,description:e("menus.editorTabContext","The editor tabs context menu")},{key:"editor/title/context/share",id:t.EditorTitleContextShare,description:e("menus.editorTitleContextShare","'Share' submenu inside the editor title context menu"),proposed:"contribShareMenu"},{key:"debug/callstack/context",id:t.DebugCallStackContext,description:e("menus.debugCallstackContext","The debug callstack view context menu")},{key:"debug/variables/context",id:t.DebugVariablesContext,description:e("menus.debugVariablesContext","The debug variables view context menu")},{key:"debug/toolBar",id:t.DebugToolBar,description:e("menus.debugToolBar","The debug toolbar menu")},{key:"debug/createConfiguration",id:t.DebugCreateConfiguration,proposed:"contribDebugCreateConfiguration",description:e("menus.debugCreateConfiguation","The debug create configuration menu")},{key:"notebook/variables/context",id:t.NotebookVariablesContext,description:e("menus.notebookVariablesContext","The notebook variables view context menu")},{key:"menuBar/home",id:t.MenubarHomeMenu,description:e("menus.home","The home indicator context menu (web only)"),proposed:"contribMenuBarHome",supportsSubmenus:!1},{key:"menuBar/edit/copy",id:t.MenubarCopy,description:e("menus.opy","'Copy as' submenu in the top level Edit menu")},{key:"scm/title",id:t.SCMTitle,description:e("menus.scmTitle","The Source Control title menu")},{key:"scm/sourceControl",id:t.SCMSourceControl,description:e("menus.scmSourceControl","The Source Control menu")},{key:"scm/sourceControl/title",id:t.SCMSourceControlTitle,description:e("menus.scmSourceControlTitle","The Source Control title menu"),proposed:"contribSourceControlTitleMenu"},{key:"scm/resourceState/context",id:t.SCMResourceContext,description:e("menus.resourceStateContext","The Source Control resource state context menu")},{key:"scm/resourceFolder/context",id:t.SCMResourceFolderContext,description:e("menus.resourceFolderContext","The Source Control resource folder context menu")},{key:"scm/resourceGroup/context",id:t.SCMResourceGroupContext,description:e("menus.resourceGroupContext","The Source Control resource group context menu")},{key:"scm/change/title",id:t.SCMChangeContext,description:e("menus.changeTitle","The Source Control inline change menu")},{key:"scm/inputBox",id:t.SCMInputBox,description:e("menus.input","The Source Control input box menu"),proposed:"contribSourceControlInputBoxMenu"},{key:"scm/history/title",id:t.SCMHistoryTitle,description:e("menus.scmHistoryTitle","The Source Control History title menu"),proposed:"contribSourceControlHistoryTitleMenu"},{key:"scm/historyItem/context",id:t.SCMChangesContext,description:e("menus.historyItemContext","The Source Control history item context menu"),proposed:"contribSourceControlHistoryItemMenu"},{key:"statusBar/remoteIndicator",id:t.StatusBarRemoteIndicatorMenu,description:e("menus.statusBarRemoteIndicator","The remote indicator menu in the status bar"),supportsSubmenus:!1},{key:"terminal/context",id:t.TerminalInstanceContext,description:e("menus.terminalContext","The terminal context menu")},{key:"terminal/title/context",id:t.TerminalTabContext,description:e("menus.terminalTabContext","The terminal tabs context menu")},{key:"view/title",id:t.ViewTitle,description:e("view.viewTitle","The contributed view title menu")},{key:"viewContainer/title",id:t.ViewContainerTitle,description:e("view.containerTitle","The contributed view container title menu"),proposed:"contribViewContainerTitle"},{key:"view/item/context",id:t.ViewItemContext,description:e("view.itemContext","The contributed view item context menu")},{key:"comments/comment/editorActions",id:t.CommentEditorActions,description:e("commentThread.editorActions","The contributed comment editor actions"),proposed:"contribCommentEditorActionsMenu"},{key:"comments/commentThread/title",id:t.CommentThreadTitle,description:e("commentThread.title","The contributed comment thread title menu")},{key:"comments/commentThread/context",id:t.CommentThreadActions,description:e("commentThread.actions","The contributed comment thread context menu, rendered as buttons below the comment editor"),supportsSubmenus:!1},{key:"comments/commentThread/additionalActions",id:t.CommentThreadAdditionalActions,description:e("commentThread.actions","The contributed comment thread context menu, rendered as buttons below the comment editor"),supportsSubmenus:!1,proposed:"contribCommentThreadAdditionalMenu"},{key:"comments/commentThread/title/context",id:t.CommentThreadTitleContext,description:e("commentThread.titleContext","The contributed comment thread title's peek context menu, rendered as a right click menu on the comment thread's peek title."),proposed:"contribCommentPeekContext"},{key:"comments/comment/title",id:t.CommentTitle,description:e("comment.title","The contributed comment title menu")},{key:"comments/comment/context",id:t.CommentActions,description:e("comment.actions","The contributed comment context menu, rendered as buttons below the comment editor"),supportsSubmenus:!1},{key:"comments/commentThread/comment/context",id:t.CommentThreadCommentContext,description:e("comment.commentContext","The contributed comment context menu, rendered as a right click menu on the an individual comment in the comment thread's peek view."),proposed:"contribCommentPeekContext"},{key:"commentsView/commentThread/context",id:t.CommentsViewThreadActions,description:e("commentsView.threadActions","The contributed comment thread context menu in the comments view"),proposed:"contribCommentsViewThreadMenus"},{key:"notebook/toolbar",id:t.NotebookToolbar,description:e("notebook.toolbar","The contributed notebook toolbar menu")},{key:"notebook/kernelSource",id:t.NotebookKernelSource,description:e("notebook.kernelSource","The contributed notebook kernel sources menu"),proposed:"notebookKernelSource"},{key:"notebook/cell/title",id:t.NotebookCellTitle,description:e("notebook.cell.title","The contributed notebook cell title menu")},{key:"notebook/cell/execute",id:t.NotebookCellExecute,description:e("notebook.cell.execute","The contributed notebook cell execution menu")},{key:"interactive/toolbar",id:t.InteractiveToolbar,description:e("interactive.toolbar","The contributed interactive toolbar menu")},{key:"interactive/cell/title",id:t.InteractiveCellTitle,description:e("interactive.cell.title","The contributed interactive cell title menu")},{key:"issue/reporter",id:t.IssueReporter,description:e("issue.reporter","The contributed issue reporter menu"),proposed:"contribIssueReporter"},{key:"testing/item/context",id:t.TestItem,description:e("testing.item.context","The contributed test item menu")},{key:"testing/item/gutter",id:t.TestItemGutter,description:e("testing.item.gutter.title","The menu for a gutter decoration for a test item")},{key:"testing/profiles/context",id:t.TestProfilesContext,description:e("testing.profiles.context.title","The menu for configuring testing profiles.")},{key:"testing/item/result",id:t.TestPeekElement,description:e("testing.item.result.title","The menu for an item in the Test Results view or peek.")},{key:"testing/message/context",id:t.TestMessageContext,description:e("testing.message.context.title","A prominent button overlaying editor content where the message is displayed")},{key:"testing/message/content",id:t.TestMessageContent,description:e("testing.message.content.title","Context menu for the message in the results tree")},{key:"extension/context",id:t.ExtensionContext,description:e("menus.extensionContext","The extension context menu")},{key:"timeline/title",id:t.TimelineTitle,description:e("view.timelineTitle","The Timeline view title menu")},{key:"timeline/item/context",id:t.TimelineItemContext,description:e("view.timelineContext","The Timeline view item context menu")},{key:"ports/item/context",id:t.TunnelContext,description:e("view.tunnelContext","The Ports view item context menu")},{key:"ports/item/origin/inline",id:t.TunnelOriginInline,description:e("view.tunnelOriginInline","The Ports view item origin inline menu")},{key:"ports/item/port/inline",id:t.TunnelPortInline,description:e("view.tunnelPortInline","The Ports view item port inline menu")},{key:"file/newFile",id:t.NewFile,description:e("file.newFile","The 'New File...' quick pick, shown on welcome page and File menu."),supportsSubmenus:!1},{key:"webview/context",id:t.WebviewContext,description:e("webview.context","The webview context menu")},{key:"file/share",id:t.MenubarShare,description:e("menus.share","Share submenu shown in the top level File menu."),proposed:"contribShareMenu"},{key:"editor/inlineCompletions/actions",id:t.InlineCompletionsActions,description:e("inlineCompletions.actions","The actions shown when hovering on an inline completion"),supportsSubmenus:!1,proposed:"inlineCompletionsAdditions"},{key:"editor/inlineEdit/actions",id:t.InlineEditActions,description:e("inlineEdit.actions","The actions shown when hovering on an inline edit"),supportsSubmenus:!1,proposed:"inlineEdit"},{key:"editor/content",id:t.EditorContent,description:e("merge.toolbar","The prominent button in an editor, overlays its content"),proposed:"contribEditorContentMenu"},{key:"editor/lineNumber/context",id:t.EditorLineNumberContext,description:e("editorLineNumberContext","The contributed editor line number context menu")},{key:"mergeEditor/result/title",id:t.MergeInputResultToolbar,description:e("menus.mergeEditorResult","The result toolbar of the merge editor"),proposed:"contribMergeEditorMenus"},{key:"multiDiffEditor/resource/title",id:t.MultiDiffEditorFileToolbar,description:e("menus.multiDiffEditorResource","The resource toolbar in the multi diff editor"),proposed:"contribMultiDiffEditorMenus"},{key:"diffEditor/gutter/hunk",id:t.DiffEditorHunkToolbar,description:e("menus.diffEditorGutterToolBarMenus","The gutter toolbar in the diff editor"),proposed:"contribDiffEditorGutterToolBarMenus"},{key:"diffEditor/gutter/selection",id:t.DiffEditorSelectionToolbar,description:e("menus.diffEditorGutterToolBarMenus","The gutter toolbar in the diff editor"),proposed:"contribDiffEditorGutterToolBarMenus"}];var g;(w=>{function a(n){return typeof n.command=="string"}w.isMenuItem=a;function c(n,m){return typeof n.command!="string"?(m.error(e("requirestring","property `{0}` is mandatory and must be of type `string`","command")),!1):n.alt&&typeof n.alt!="string"?(m.error(e("optstring","property `{0}` can be omitted or must be of type `string`","alt")),!1):n.when&&typeof n.when!="string"?(m.error(e("optstring","property `{0}` can be omitted or must be of type `string`","when")),!1):n.group&&typeof n.group!="string"?(m.error(e("optstring","property `{0}` can be omitted or must be of type `string`","group")),!1):!0}w.isValidMenuItem=c;function r(n,m){return typeof n.submenu!="string"?(m.error(e("requirestring","property `{0}` is mandatory and must be of type `string`","submenu")),!1):n.when&&typeof n.when!="string"?(m.error(e("optstring","property `{0}` can be omitted or must be of type `string`","when")),!1):n.group&&typeof n.group!="string"?(m.error(e("optstring","property `{0}` can be omitted or must be of type `string`","group")),!1):!0}w.isValidSubmenuItem=r;function o(n,m){if(!Array.isArray(n))return m.error(e("requirearray","submenu items must be an array")),!1;for(const y of n)if(a(y)){if(!c(y,m))return!1}else if(!r(y,m))return!1;return!0}w.isValidItems=o;function i(n,m){return typeof n!="object"?(m.error(e("require","submenu items must be an object")),!1):typeof n.id!="string"?(m.error(e("requirestring","property `{0}` is mandatory and must be of type `string`","id")),!1):typeof n.label!="string"?(m.error(e("requirestring","property `{0}` is mandatory and must be of type `string`","label")),!1):!0}w.isValidSubmenu=i;const d={type:"object",required:["command"],properties:{command:{description:e("vscode.extension.contributes.menuItem.command","Identifier of the command to execute. The command must be declared in the 'commands'-section"),type:"string"},alt:{description:e("vscode.extension.contributes.menuItem.alt","Identifier of an alternative command to execute. The command must be declared in the 'commands'-section"),type:"string"},when:{description:e("vscode.extension.contributes.menuItem.when","Condition which must be true to show this item"),type:"string"},group:{description:e("vscode.extension.contributes.menuItem.group","Group into which this item belongs"),type:"string"}}},s={type:"object",required:["submenu"],properties:{submenu:{description:e("vscode.extension.contributes.menuItem.submenu","Identifier of the submenu to display in this item."),type:"string"},when:{description:e("vscode.extension.contributes.menuItem.when","Condition which must be true to show this item"),type:"string"},group:{description:e("vscode.extension.contributes.menuItem.group","Group into which this item belongs"),type:"string"}}},f={type:"object",required:["id","label"],properties:{id:{description:e("vscode.extension.contributes.submenu.id","Identifier of the menu to display as a submenu."),type:"string"},label:{description:e("vscode.extension.contributes.submenu.label","The label of the menu item which leads to this submenu."),type:"string"},icon:{description:e({key:"vscode.extension.contributes.submenu.icon",comment:["do not translate or change `\\$(zap)`, \\ in front of $ is important."]},"(Optional) Icon which is used to represent the submenu in the UI. Either a file path, an object with file paths for dark and light themes, or a theme icon references, like `\\$(zap)`"),anyOf:[{type:"string"},{type:"object",properties:{light:{description:e("vscode.extension.contributes.submenu.icon.light","Icon path when a light theme is used"),type:"string"},dark:{description:e("vscode.extension.contributes.submenu.icon.dark","Icon path when a dark theme is used"),type:"string"}}}]}}};w.menusContribution={description:e("vscode.extension.contributes.menus","Contributes menu items to the editor"),type:"object",properties:A(O,n=>n.key,n=>({markdownDescription:n.proposed?e("proposed",'Proposed API, requires `enabledApiProposal: ["{0}"]` - {1}',n.proposed,n.description):n.description,type:"array",items:n.supportsSubmenus===!1?d:{oneOf:[d,s]}})),additionalProperties:{description:"Submenu",type:"array",items:{oneOf:[d,s]}}},w.submenusContribution={description:e("vscode.extension.contributes.submenus","Contributes submenu items to the editor"),type:"array",items:f};function u(n,m){return n?k(n.command)?(m.error(e("requirestring","property `{0}` is mandatory and must be of type `string`","command")),!1):!b(n.title,m,"title")||n.shortTitle&&!b(n.shortTitle,m,"shortTitle")?!1:n.enablement&&typeof n.enablement!="string"?(m.error(e("optstring","property `{0}` can be omitted or must be of type `string`","precondition")),!1):!(n.category&&!b(n.category,m,"category")||!p(n.icon,m)):(m.error(e("nonempty","expected non-empty value.")),!1)}w.isValidCommand=u;function p(n,m){return typeof n>"u"||typeof n=="string"||typeof n.dark=="string"&&typeof n.light=="string"?!0:(m.error(e("opticon","property `icon` can be omitted or must be either a string or a literal like `{dark, light}`")),!1)}function b(n,m,y){return typeof n>"u"?(m.error(e("requireStringOrObject","property `{0}` is mandatory and must be of type `string` or `object`",y)),!1):typeof n=="string"&&k(n)?(m.error(e("requirestring","property `{0}` is mandatory and must be of type `string`",y)),!1):typeof n!="string"&&(k(n.original)||k(n.value))?(m.error(e("requirestrings","properties `{0}` and `{1}` are mandatory and must be of type `string`",`${y}.value`,`${y}.original`)),!1):!0}const M={type:"object",required:["command","title"],properties:{command:{description:e("vscode.extension.contributes.commandType.command","Identifier of the command to execute"),type:"string"},title:{description:e("vscode.extension.contributes.commandType.title","Title by which the command is represented in the UI"),type:"string"},shortTitle:{markdownDescription:e("vscode.extension.contributes.commandType.shortTitle","(Optional) Short title by which the command is represented in the UI. Menus pick either `title` or `shortTitle` depending on the context in which they show commands."),type:"string"},category:{description:e("vscode.extension.contributes.commandType.category","(Optional) Category string by which the command is grouped in the UI"),type:"string"},enablement:{description:e("vscode.extension.contributes.commandType.precondition","(Optional) Condition which must be true to enable the command in the UI (menu and keybindings). Does not prevent executing the command by other means, like the `executeCommand`-api."),type:"string"},icon:{description:e({key:"vscode.extension.contributes.commandType.icon",comment:["do not translate or change `\\$(zap)`, \\ in front of $ is important."]},"(Optional) Icon which is used to represent the command in the UI. Either a file path, an object with file paths for dark and light themes, or a theme icon references, like `\\$(zap)`"),anyOf:[{type:"string"},{type:"object",properties:{light:{description:e("vscode.extension.contributes.commandType.icon.light","Icon path when a light theme is used"),type:"string"},dark:{description:e("vscode.extension.contributes.commandType.icon.dark","Icon path when a dark theme is used"),type:"string"}}}]}}};w.commandsContribution={description:e("vscode.extension.contributes.commands","Contributes commands to the command palette."),oneOf:[M,{type:"array",items:M}]}})(g||={});const D=new F,_=S.registerExtensionPoint({extensionPoint:"commands",jsonSchema:g.commandsContribution,activationEventsGenerator:(a,c)=>{for(const r of a)r.command&&c.push(`onCommand:${r.command}`)}});_.setHandler(a=>{function c(r,o){if(!g.isValidCommand(r,o.collector))return;const{icon:i,enablement:d,category:s,title:f,shortTitle:l,command:h}=r;let u;i&&(typeof i=="string"?u=R.fromString(i)??{dark:x.joinPath(o.description.extensionLocation,i),light:x.joinPath(o.description.extensionLocation,i)}:u={dark:x.joinPath(o.description.extensionLocation,i.dark),light:x.joinPath(o.description.extensionLocation,i.light)});const p=C.getCommand(h);p&&(p.source?o.collector.info(e("dup1","Command `{0}` already registered by {1} ({2})",r.command,p.source.title,p.source.id)):o.collector.info(e("dup0","Command `{0}` already registered",r.command))),D.add(C.addCommand({id:h,title:f,source:{id:o.description.identifier.value,title:o.description.displayName??o.description.name},shortTitle:l,tooltip:f,category:s,precondition:U.deserialize(d),icon:u}))}D.clear();for(const r of a){const{value:o}=r;if(Array.isArray(o))for(const i of o)c(i,r);else c(o,r)}});const T=new Map,V=S.registerExtensionPoint({extensionPoint:"submenus",jsonSchema:g.submenusContribution});V.setHandler(a=>{T.clear();for(const c of a){const{value:r,collector:o}=c;for(const[,i]of Object.entries(r)){if(!g.isValidSubmenu(i,o))continue;if(!i.id){o.warn(e("submenuId.invalid.id","`{0}` is not a valid submenu identifier",i.id));continue}if(T.has(i.id)){o.info(e("submenuId.duplicate.id","The `{0}` submenu was already previously registered.",i.id));continue}if(!i.label){o.warn(e("submenuId.invalid.label","`{0}` is not a valid submenu label",i.label));continue}let d;i.icon&&(typeof i.icon=="string"?d=R.fromString(i.icon)||{dark:x.joinPath(c.description.extensionLocation,i.icon)}:d={dark:x.joinPath(c.description.extensionLocation,i.icon.dark),light:x.joinPath(c.description.extensionLocation,i.icon.light)});const s={id:t.for(`api:${i.id}`),label:i.label,icon:d};T.set(i.id,s)}}});const W=new Map(O.map(a=>[a.key,a])),B=new F,v=new Map,Q=S.registerExtensionPoint({extensionPoint:"menus",jsonSchema:g.menusContribution,deps:[V]});Q.setHandler(a=>{B.clear(),v.clear();for(const c of a){const{value:r,collector:o}=c;for(const i of Object.entries(r)){if(!g.isValidItems(i[1],o))continue;let d=W.get(i[0]);if(!d){const s=T.get(i[0]);s&&(d={key:i[0],id:s.id,description:""})}if(d){if(d.proposed&&!$(c.description,d.proposed)){o.error(e("proposedAPI.invalid",`{0} is a proposed menu identifier. It requires 'package.json#enabledApiProposals: ["{1}"]' and is only available when running out of dev or with the following command line switch: --enable-proposed-api {2}`,i[0],d.proposed,c.description.identifier.value));continue}for(const s of i[1]){let f;if(g.isMenuItem(s)){const l=C.getCommand(s.command),h=s.alt&&C.getCommand(s.alt)||void 0;if(!l){o.error(e("missing.command","Menu item references a command `{0}` which is not defined in the 'commands' section.",s.command));continue}s.alt&&!h&&o.warn(e("missing.altCommand","Menu item references an alt-command `{0}` which is not defined in the 'commands' section.",s.alt)),s.command===s.alt&&o.info(e("dupe.command","Menu item references the same command as default and alt-command")),f={command:l,alt:h,group:void 0,order:void 0,when:void 0}}else{if(d.supportsSubmenus===!1){o.error(e("unsupported.submenureference","Menu item references a submenu for a menu which doesn't have submenu support."));continue}const l=T.get(s.submenu);if(!l){o.error(e("missing.submenu","Menu item references a submenu `{0}` which is not defined in the 'submenus' section.",s.submenu));continue}let h=v.get(d.id.id);if(h||(h=new Set,v.set(d.id.id,h)),h.has(l.id.id)){o.warn(e("submenuItem.duplicate","The `{0}` submenu was already contributed to the `{1}` menu.",s.submenu,i[0]));continue}h.add(l.id.id),f={submenu:l.id,icon:l.icon,title:l.label,group:void 0,order:void 0,when:void 0}}if(s.group){const l=s.group.lastIndexOf("@");l>0?(f.group=s.group.substr(0,l),f.order=Number(s.group.substr(l+1))||void 0):f.group=s.group}if(d.id===t.ViewContainerTitle&&!s.when?.includes("viewContainer == workbench.view.debug")){o.error(e("viewContainerTitle.when","The {0} menu contribution must check {1} in its {2} clause.","`viewContainer/title`","`viewContainer == workbench.view.debug`",'"when"'));continue}f.when=U.deserialize(s.when),B.add(C.appendMenuItem(d.id,f))}}}}});let I=class extends L{constructor(r){super();this._keybindingService=r}type="table";shouldRender(r){return!!r.contributes?.commands}render(r){const i=(r.contributes?.commands||[]).map(u=>({id:u.command,title:u.title,keybindings:[],menus:[]})),d=A(i,u=>u.id),s=r.contributes?.menus||{};for(const u in s)for(const p of s[u])if(p.command){let b=d[p.command];b?b.menus.push(u):(b={id:p.command,title:"",keybindings:[],menus:[u]},d[b.id]=b,i.push(b))}if((r.contributes?.keybindings?Array.isArray(r.contributes.keybindings)?r.contributes.keybindings:[r.contributes.keybindings]:[]).forEach(u=>{const p=this.resolveKeybinding(u);if(!p)return;let b=d[u.command];b?b.keybindings.push(p):(b={id:u.command,title:"",keybindings:[p],menus:[]},d[b.id]=b,i.push(b))}),!i.length)return{data:{headers:[],rows:[]},dispose:()=>{}};const l=[e("command name","ID"),e("command title","Title"),e("keyboard shortcuts","Keyboard Shortcuts"),e("menuContexts","Menu Contexts")],h=i.sort((u,p)=>u.id.localeCompare(p.id)).map(u=>[new j().appendMarkdown(`\`${u.id}\``),typeof u.title=="string"?u.title:u.title.value,u.keybindings,new j().appendMarkdown(`${u.menus.map(p=>`\`${p}\``).join("&nbsp;")}`)]);return{data:{headers:l,rows:h},dispose:()=>{}}}resolveKeybinding(r){let o;switch(z){case"win32":o=r.win;break;case"linux":o=r.linux;break;case"darwin":o=r.mac;break}return this._keybindingService.resolveUserBinding(o??r.key)[0]}};I=E([P(0,J)],I),H.as(G.ExtensionFeaturesRegistry).registerExtensionFeature({id:"commands",label:e("commands","Commands"),access:{canToggle:!1},renderer:new K(I)});export{_ as commandsExtensionPoint};
