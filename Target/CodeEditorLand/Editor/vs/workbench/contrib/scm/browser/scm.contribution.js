import{getActiveElement as w,isActiveElement as _}from"../../../../../vs/base/browser/dom.js";import{Codicon as L}from"../../../../../vs/base/common/codicons.js";import{KeyCode as a,KeyMod as d}from"../../../../../vs/base/common/keyCodes.js";import{ModesRegistry as q}from"../../../../../vs/editor/common/languages/modesRegistry.js";import{Context as k}from"../../../../../vs/editor/contrib/suggest/browser/suggest.js";import{localize as e,localize2 as y}from"../../../../../vs/nls.js";import{MenuId as K,MenuRegistry as E}from"../../../../../vs/platform/actions/common/actions.js";import{CommandsRegistry as T,ICommandService as x}from"../../../../../vs/platform/commands/common/commands.js";import{Extensions as F,ConfigurationScope as H}from"../../../../../vs/platform/configuration/common/configurationRegistry.js";import{ContextKeyExpr as o,IContextKeyService as C}from"../../../../../vs/platform/contextkey/common/contextkey.js";import{SyncDescriptor as S}from"../../../../../vs/platform/instantiation/common/descriptors.js";import{InstantiationType as M,registerSingleton as A}from"../../../../../vs/platform/instantiation/common/extensions.js";import"../../../../../vs/platform/instantiation/common/instantiation.js";import{KeybindingsRegistry as c,KeybindingWeight as m}from"../../../../../vs/platform/keybinding/common/keybindingsRegistry.js";import{IListService as z,WorkbenchList as j}from"../../../../../vs/platform/list/browser/listService.js";import{Registry as p}from"../../../../../vs/platform/registry/common/platform.js";import{registerIcon as Q}from"../../../../../vs/platform/theme/common/iconRegistry.js";import{registerWorkbenchContribution2 as $,Extensions as P,WorkbenchPhase as Y}from"../../../../../vs/workbench/common/contributions.js";import{Extensions as G,ViewContainerLocation as J}from"../../../../../vs/workbench/common/views.js";import{SCMHistoryViewPane as X}from"../../../../../vs/workbench/contrib/scm/browser/scmHistoryViewPane.js";import{SCMRepositoriesViewPane as Z}from"../../../../../vs/workbench/contrib/scm/browser/scmRepositoriesViewPane.js";import{ContextKeys as N,SCMViewPane as ee}from"../../../../../vs/workbench/contrib/scm/browser/scmViewPane.js";import{SCMViewPaneContainer as oe}from"../../../../../vs/workbench/contrib/scm/browser/scmViewPaneContainer.js";import{SCMViewService as te}from"../../../../../vs/workbench/contrib/scm/browser/scmViewService.js";import{isSCMRepository as ie}from"../../../../../vs/workbench/contrib/scm/browser/util.js";import{SCMWorkingSetController as B}from"../../../../../vs/workbench/contrib/scm/browser/workingSet.js";import{IQuickDiffService as re}from"../../../../../vs/workbench/contrib/scm/common/quickDiff.js";import{QuickDiffService as ne}from"../../../../../vs/workbench/contrib/scm/common/quickDiffService.js";import{HISTORY_VIEW_PANE_ID as se,ISCMService as h,ISCMViewService as ce,REPOSITORIES_VIEW_PANE_ID as ae,VIEW_PANE_ID as u,VIEWLET_ID as de}from"../../../../../vs/workbench/contrib/scm/common/scm.js";import{SCMService as me}from"../../../../../vs/workbench/contrib/scm/common/scmService.js";import{MANAGE_TRUST_COMMAND_ID as ue,WorkspaceTrustContext as v}from"../../../../../vs/workbench/contrib/workspace/common/workspace.js";import{LifecyclePhase as W}from"../../../../../vs/workbench/services/lifecycle/common/lifecycle.js";import{IViewsService as b}from"../../../../../vs/workbench/services/views/common/viewsService.js";import{SCMActiveRepositoryController as le,SCMActiveResourceContextKeyController as pe}from"./activity.js";import{DirtyDiffWorkbenchController as fe}from"./dirtydiffDecorator.js";q.registerLanguage({id:"scminput",extensions:[],aliases:[],mimetypes:["text/x-scm-input"]}),p.as(P.Workbench).registerWorkbenchContribution(fe,W.Restored);const I=Q("source-control-view-icon",L.sourceControl,e("sourceControlViewIcon","View icon of the Source Control view.")),R=p.as(G.ViewContainersRegistry).registerViewContainer({id:de,title:y("source control","Source Control"),ctorDescriptor:new S(oe),storageId:"workbench.scm.views.state",icon:I,alwaysUseContainerInfo:!0,order:2,hideIfEmpty:!0},J.Sidebar,{doNotRegisterOpenCommand:!0}),f=p.as(G.ViewsRegistry);f.registerViewWelcomeContent(u,{content:e("no open repo","No source control providers registered."),when:"default"}),f.registerViewWelcomeContent(u,{content:e("no open repo in an untrusted workspace","None of the registered source control providers work in Restricted Mode."),when:o.and(o.equals("scm.providerCount",0),v.IsEnabled,v.IsTrusted.toNegated())}),f.registerViewWelcomeContent(u,{content:`[${e("manageWorkspaceTrustAction","Manage Workspace Trust")}](command:${ue})`,when:o.and(o.equals("scm.providerCount",0),v.IsEnabled,v.IsTrusted.toNegated())}),f.registerViews([{id:u,name:y("source control","Source Control"),ctorDescriptor:new S(ee),canToggleVisibility:!0,canMoveView:!0,weight:40,order:-999,containerIcon:I,openCommandActionDescriptor:{id:R.id,mnemonicTitle:e({key:"miViewSCM",comment:["&& denotes a mnemonic"]},"Source &&Control"),keybindings:{primary:0,win:{primary:d.CtrlCmd|d.Shift|a.KeyG},linux:{primary:d.CtrlCmd|d.Shift|a.KeyG},mac:{primary:d.WinCtrl|d.Shift|a.KeyG}},order:2}}],R),f.registerViews([{id:ae,name:y("source control repositories","Source Control Repositories"),ctorDescriptor:new S(Z),canToggleVisibility:!0,hideByDefault:!0,canMoveView:!0,weight:20,order:-1e3,when:o.and(o.has("scm.providerCount"),o.notEquals("scm.providerCount",0)),containerIcon:I}],R),f.registerViews([{id:se,name:y("source control history","Source Control Graph"),ctorDescriptor:new S(X),canToggleVisibility:!0,canMoveView:!0,weight:40,order:2,when:o.and(o.has("scm.providerCount"),o.notEquals("scm.providerCount",0)),containerIcon:I}],R),p.as(P.Workbench).registerWorkbenchContribution(le,W.Restored),p.as(P.Workbench).registerWorkbenchContribution(pe,W.Restored),$(B.ID,B,Y.AfterRestored),p.as(F.Configuration).registerConfiguration({id:"scm",order:5,title:e("scmConfigurationTitle","Source Control"),type:"object",scope:H.RESOURCE,properties:{"scm.diffDecorations":{type:"string",enum:["all","gutter","overview","minimap","none"],enumDescriptions:[e("scm.diffDecorations.all","Show the diff decorations in all available locations."),e("scm.diffDecorations.gutter","Show the diff decorations only in the editor gutter."),e("scm.diffDecorations.overviewRuler","Show the diff decorations only in the overview ruler."),e("scm.diffDecorations.minimap","Show the diff decorations only in the minimap."),e("scm.diffDecorations.none","Do not show the diff decorations.")],default:"all",description:e("diffDecorations","Controls diff decorations in the editor.")},"scm.diffDecorationsGutterWidth":{type:"number",enum:[1,2,3,4,5],default:3,description:e("diffGutterWidth","Controls the width(px) of diff decorations in gutter (added & modified).")},"scm.diffDecorationsGutterVisibility":{type:"string",enum:["always","hover"],enumDescriptions:[e("scm.diffDecorationsGutterVisibility.always","Show the diff decorator in the gutter at all times."),e("scm.diffDecorationsGutterVisibility.hover","Show the diff decorator in the gutter only on hover.")],description:e("scm.diffDecorationsGutterVisibility","Controls the visibility of the Source Control diff decorator in the gutter."),default:"always"},"scm.diffDecorationsGutterAction":{type:"string",enum:["diff","none"],enumDescriptions:[e("scm.diffDecorationsGutterAction.diff","Show the inline diff Peek view on click."),e("scm.diffDecorationsGutterAction.none","Do nothing.")],description:e("scm.diffDecorationsGutterAction","Controls the behavior of Source Control diff gutter decorations."),default:"diff"},"scm.diffDecorationsGutterPattern":{type:"object",description:e("diffGutterPattern","Controls whether a pattern is used for the diff decorations in gutter."),additionalProperties:!1,properties:{added:{type:"boolean",description:e("diffGutterPatternAdded","Use pattern for the diff decorations in gutter for added lines.")},modified:{type:"boolean",description:e("diffGutterPatternModifed","Use pattern for the diff decorations in gutter for modified lines.")}},default:{added:!1,modified:!0}},"scm.diffDecorationsIgnoreTrimWhitespace":{type:"string",enum:["true","false","inherit"],enumDescriptions:[e("scm.diffDecorationsIgnoreTrimWhitespace.true","Ignore leading and trailing whitespace."),e("scm.diffDecorationsIgnoreTrimWhitespace.false","Do not ignore leading and trailing whitespace."),e("scm.diffDecorationsIgnoreTrimWhitespace.inherit","Inherit from `diffEditor.ignoreTrimWhitespace`.")],description:e("diffDecorationsIgnoreTrimWhitespace","Controls whether leading and trailing whitespace is ignored in Source Control diff gutter decorations."),default:"false"},"scm.alwaysShowActions":{type:"boolean",description:e("alwaysShowActions","Controls whether inline actions are always visible in the Source Control view."),default:!1},"scm.countBadge":{type:"string",enum:["all","focused","off"],enumDescriptions:[e("scm.countBadge.all","Show the sum of all Source Control Provider count badges."),e("scm.countBadge.focused","Show the count badge of the focused Source Control Provider."),e("scm.countBadge.off","Disable the Source Control count badge.")],description:e("scm.countBadge","Controls the count badge on the Source Control icon on the Activity Bar."),default:"all"},"scm.providerCountBadge":{type:"string",enum:["hidden","auto","visible"],enumDescriptions:[e("scm.providerCountBadge.hidden","Hide Source Control Provider count badges."),e("scm.providerCountBadge.auto","Only show count badge for Source Control Provider when non-zero."),e("scm.providerCountBadge.visible","Show Source Control Provider count badges.")],markdownDescription:e("scm.providerCountBadge","Controls the count badges on Source Control Provider headers. These headers appear in the Source Control view when there is more than one provider or when the {0} setting is enabled, and in the Source Control Repositories view.","`#scm.alwaysShowRepositories#`"),default:"hidden"},"scm.defaultViewMode":{type:"string",enum:["tree","list"],enumDescriptions:[e("scm.defaultViewMode.tree","Show the repository changes as a tree."),e("scm.defaultViewMode.list","Show the repository changes as a list.")],description:e("scm.defaultViewMode","Controls the default Source Control repository view mode."),default:"list"},"scm.defaultViewSortKey":{type:"string",enum:["name","path","status"],enumDescriptions:[e("scm.defaultViewSortKey.name","Sort the repository changes by file name."),e("scm.defaultViewSortKey.path","Sort the repository changes by path."),e("scm.defaultViewSortKey.status","Sort the repository changes by Source Control status.")],description:e("scm.defaultViewSortKey","Controls the default Source Control repository changes sort order when viewed as a list."),default:"path"},"scm.autoReveal":{type:"boolean",description:e("autoReveal","Controls whether the Source Control view should automatically reveal and select files when opening them."),default:!0},"scm.inputFontFamily":{type:"string",markdownDescription:e("inputFontFamily","Controls the font for the input message. Use `default` for the workbench user interface font family, `editor` for the `#editor.fontFamily#`'s value, or a custom font family."),default:"default"},"scm.inputFontSize":{type:"number",markdownDescription:e("inputFontSize","Controls the font size for the input message in pixels."),default:13},"scm.inputMaxLineCount":{type:"number",markdownDescription:e("inputMaxLines","Controls the maximum number of lines that the input will auto-grow to."),minimum:1,maximum:50,default:10},"scm.inputMinLineCount":{type:"number",markdownDescription:e("inputMinLines","Controls the minimum number of lines that the input will auto-grow from."),minimum:1,maximum:50,default:1},"scm.alwaysShowRepositories":{type:"boolean",markdownDescription:e("alwaysShowRepository","Controls whether repositories should always be visible in the Source Control view."),default:!1},"scm.repositories.sortOrder":{type:"string",enum:["discovery time","name","path"],enumDescriptions:[e("scm.repositoriesSortOrder.discoveryTime","Repositories in the Source Control Repositories view are sorted by discovery time. Repositories in the Source Control view are sorted in the order that they were selected."),e("scm.repositoriesSortOrder.name","Repositories in the Source Control Repositories and Source Control views are sorted by repository name."),e("scm.repositoriesSortOrder.path","Repositories in the Source Control Repositories and Source Control views are sorted by repository path.")],description:e("repositoriesSortOrder","Controls the sort order of the repositories in the source control repositories view."),default:"discovery time"},"scm.repositories.visible":{type:"number",description:e("providersVisible","Controls how many repositories are visible in the Source Control Repositories section. Set to 0, to be able to manually resize the view."),default:10},"scm.showActionButton":{type:"boolean",markdownDescription:e("showActionButton","Controls whether an action button can be shown in the Source Control view."),default:!0},"scm.showInputActionButton":{type:"boolean",markdownDescription:e("showInputActionButton","Controls whether an action button can be shown in the Source Control input."),default:!0},"scm.workingSets.enabled":{type:"boolean",description:e("scm.workingSets.enabled","Controls whether to store editor working sets when switching between source control history item groups."),default:!1},"scm.workingSets.default":{type:"string",enum:["empty","current"],enumDescriptions:[e("scm.workingSets.default.empty","Use an empty working set when switching to a source control history item group that does not have a working set."),e("scm.workingSets.default.current","Use the current working set when switching to a source control history item group that does not have a working set.")],description:e("scm.workingSets.default","Controls the default working set to use when switching to a source control history item group that does not have a working set."),default:"current"},"scm.compactFolders":{type:"boolean",description:e("scm.compactFolders","Controls whether the Source Control view should render folders in a compact form. In such a form, single child folders will be compressed in a combined tree element."),default:!0}}}),c.registerCommandAndKeybindingRule({id:"scm.acceptInput",metadata:{description:e("scm accept","Source Control: Accept Input"),args:[]},weight:m.WorkbenchContrib,when:o.has("scmRepository"),primary:d.CtrlCmd|a.Enter,handler:t=>{const l=t.get(C).getContext(w()).getValue("scmRepository");if(!l)return Promise.resolve(null);const s=t.get(h).getRepository(l);if(!s?.provider.acceptInputCommand)return Promise.resolve(null);const g=s.provider.acceptInputCommand.id,V=s.provider.acceptInputCommand.arguments;return t.get(x).executeCommand(g,...V||[])}}),c.registerCommandAndKeybindingRule({id:"scm.clearInput",weight:m.WorkbenchContrib,when:o.and(o.has("scmRepository"),k.Visible.toNegated()),primary:a.Escape,handler:async t=>{const r=t.get(h),n=t.get(C).getContext(w()).getValue("scmRepository");(n?r.getRepository(n):void 0)?.input.setValue("",!0)}});const U={description:{description:e("scm view next commit","Source Control: View Next Commit"),args:[]},weight:m.WorkbenchContrib,handler:t=>{const r=t.get(C),i=t.get(h),n=r.getContext(w()).getValue("scmRepository");(n?i.getRepository(n):void 0)?.input.showNextHistoryValue()}},O={description:{description:e("scm view previous commit","Source Control: View Previous Commit"),args:[]},weight:m.WorkbenchContrib,handler:t=>{const r=t.get(C),i=t.get(h),n=r.getContext(w()).getValue("scmRepository");(n?i.getRepository(n):void 0)?.input.showPreviousHistoryValue()}};c.registerCommandAndKeybindingRule({...U,id:"scm.viewNextCommit",when:o.and(o.has("scmRepository"),o.has("scmInputIsInLastPosition"),k.Visible.toNegated()),primary:a.DownArrow}),c.registerCommandAndKeybindingRule({...O,id:"scm.viewPreviousCommit",when:o.and(o.has("scmRepository"),o.has("scmInputIsInFirstPosition"),k.Visible.toNegated()),primary:a.UpArrow}),c.registerCommandAndKeybindingRule({...U,id:"scm.forceViewNextCommit",when:o.has("scmRepository"),primary:d.Alt|a.DownArrow}),c.registerCommandAndKeybindingRule({...O,id:"scm.forceViewPreviousCommit",when:o.has("scmRepository"),primary:d.Alt|a.UpArrow}),T.registerCommand("scm.openInIntegratedTerminal",async(t,...r)=>{if(!r||r.length===0)return;const i=t.get(x),l=t.get(z);let n=r.length===1?r[0]:void 0;if(!n){const s=l.lastFocusedList,g=s?.getHTMLElement();if(s instanceof j&&g&&_(g)){const[V]=s.getFocus(),D=s.element(V);ie(D)&&(n=D.provider)}}n?.rootUri&&await i.executeCommand("openInIntegratedTerminal",n.rootUri)}),T.registerCommand("scm.openInTerminal",async(t,r)=>{if(!r||!r.rootUri)return;await t.get(x).executeCommand("openInTerminal",r.rootUri)}),E.appendMenuItem(K.SCMSourceControl,{group:"100_end",command:{id:"scm.openInTerminal",title:e("open in external terminal","Open in External Terminal")},when:o.and(o.equals("scmProviderHasRootUri",!0),o.or(o.equals("config.terminal.sourceControlRepositoriesKind","external"),o.equals("config.terminal.sourceControlRepositoriesKind","both")))}),E.appendMenuItem(K.SCMSourceControl,{group:"100_end",command:{id:"scm.openInIntegratedTerminal",title:e("open in integrated terminal","Open in Integrated Terminal")},when:o.and(o.equals("scmProviderHasRootUri",!0),o.or(o.equals("config.terminal.sourceControlRepositoriesKind","integrated"),o.equals("config.terminal.sourceControlRepositoriesKind","both")))}),c.registerCommandAndKeybindingRule({id:"workbench.scm.action.focusPreviousInput",weight:m.WorkbenchContrib,when:N.RepositoryVisibilityCount.notEqualsTo(0),handler:async t=>{const i=await t.get(b).openView(u);i&&i.focusPreviousInput()}}),c.registerCommandAndKeybindingRule({id:"workbench.scm.action.focusNextInput",weight:m.WorkbenchContrib,when:N.RepositoryVisibilityCount.notEqualsTo(0),handler:async t=>{const i=await t.get(b).openView(u);i&&i.focusNextInput()}}),c.registerCommandAndKeybindingRule({id:"workbench.scm.action.focusPreviousResourceGroup",weight:m.WorkbenchContrib,handler:async t=>{const i=await t.get(b).openView(u);i&&i.focusPreviousResourceGroup()}}),c.registerCommandAndKeybindingRule({id:"workbench.scm.action.focusNextResourceGroup",weight:m.WorkbenchContrib,handler:async t=>{const i=await t.get(b).openView(u);i&&i.focusNextResourceGroup()}}),A(h,me,M.Delayed),A(ce,te,M.Delayed),A(re,ne,M.Delayed);