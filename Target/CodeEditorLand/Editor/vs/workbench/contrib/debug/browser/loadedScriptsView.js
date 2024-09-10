var V=Object.defineProperty;var N=Object.getOwnPropertyDescriptor;var y=(d,e,t,r)=>{for(var o=r>1?void 0:r?N(e,t):e,i=d.length-1,a;i>=0;i--)(a=d[i])&&(o=(r?a(e,t,o):a(o))||o);return r&&o&&V(e,t,o),o},c=(d,e)=>(t,r)=>e(t,r,d);import*as I from"../../../../nls.js";import"../../../browser/parts/views/viewsViewlet.js";import{normalize as C,isAbsolute as A,posix as T}from"../../../../base/common/path.js";import{ViewPane as M,ViewAction as k}from"../../../browser/parts/views/viewPane.js";import{IInstantiationService as W}from"../../../../platform/instantiation/common/instantiation.js";import{IContextMenuService as H}from"../../../../platform/contextview/browser/contextView.js";import{IKeybindingService as K}from"../../../../platform/keybinding/common/keybinding.js";import{IConfigurationService as $}from"../../../../platform/configuration/common/configuration.js";import{renderViewTree as j}from"./baseDebugView.js";import{IDebugService as U,CONTEXT_LOADED_SCRIPTS_ITEM_TYPE as X,LOADED_SCRIPTS_VIEW_ID as w}from"../common/debug.js";import"../common/debugSource.js";import{IWorkspaceContextService as q}from"../../../../platform/workspace/common/workspace.js";import{IContextKeyService as G,ContextKeyExpr as Y}from"../../../../platform/contextkey/common/contextkey.js";import{normalizeDriveLetter as Z,tildify as J}from"../../../../base/common/labels.js";import{isWindows as Q}from"../../../../base/common/platform.js";import{URI as D}from"../../../../base/common/uri.js";import{ltrim as ee}from"../../../../base/common/strings.js";import{RunOnceScheduler as te}from"../../../../base/common/async.js";import{ResourceLabels as re}from"../../../browser/labels.js";import{FileKind as L}from"../../../../platform/files/common/files.js";import"../../../../base/browser/ui/list/list.js";import{TreeVisibility as b}from"../../../../base/browser/ui/tree/tree.js";import"../../../../base/browser/ui/list/listWidget.js";import{IEditorService as ie}from"../../../services/editor/common/editorService.js";import{WorkbenchCompressibleObjectTree as se}from"../../../../platform/list/browser/listService.js";import{dispose as R}from"../../../../base/common/lifecycle.js";import{createMatches as oe}from"../../../../base/common/filters.js";import{DebugContentProvider as ne}from"../common/debugContentProvider.js";import{ILabelService as ae}from"../../../../platform/label/common/label.js";import{registerAction2 as le,MenuId as de}from"../../../../platform/actions/common/actions.js";import{Codicon as ce}from"../../../../base/common/codicons.js";import{IViewDescriptorService as he}from"../../../common/views.js";import{IOpenerService as pe}from"../../../../platform/opener/common/opener.js";import{IThemeService as ue}from"../../../../platform/theme/common/themeService.js";import{ITelemetryService as me}from"../../../../platform/telemetry/common/telemetry.js";import{IPathService as fe}from"../../../services/path/common/pathService.js";import{TreeFindMode as Ie}from"../../../../base/browser/ui/tree/abstractTree.js";import{IHoverService as Se}from"../../../../platform/hover/browser/hover.js";const P=!0,be=/^[a-zA-Z][a-zA-Z0-9\+\-\.]+:/;class u{constructor(e,t,r=!1){this._parent=e;this._label=t;this.isIncompressible=r;this._showedMoreThanOne=!1}_showedMoreThanOne;_children=new Map;_source;updateLabel(e){this._label=e}isLeaf(){return this._children.size===0}getSession(){if(this._parent)return this._parent.getSession()}setSource(e,t){if(this._source=t,this._children.clear(),t.raw&&t.raw.sources){for(const r of t.raw.sources)if(r.name&&r.path){const o=new u(this,r.name);this._children.set(r.path,o);const i=e.getSource(r);o.setSource(e,i)}}}createIfNeeded(e,t){let r=this._children.get(e);return r||(r=t(this,e),this._children.set(e,r)),r}getChild(e){return this._children.get(e)}remove(e){this._children.delete(e)}removeFromParent(){this._parent&&(this._parent.remove(this._label),this._parent._children.size===0&&this._parent.removeFromParent())}getTemplateId(){return"id"}getId(){const e=this.getParent();return e?`${e.getId()}/${this.getInternalId()}`:this.getInternalId()}getInternalId(){return this._label}getParent(){if(this._parent)return this._parent.isSkipped()?this._parent.getParent():this._parent}isSkipped(){return this._parent?!!this._parent.oneChild():!0}hasChildren(){const e=this.oneChild();return e?e.hasChildren():this._children.size>0}getChildren(){const e=this.oneChild();if(e)return e.getChildren();const t=[];for(const r of this._children.values())t.push(r);return t.sort((r,o)=>this.compare(r,o))}getLabel(e=!0){const t=this.oneChild();if(t){const r=this instanceof S&&e?" \u2022 ":T.sep;return`${this._label}${r}${t.getLabel()}`}return this._label}getHoverLabel(){if(this._source&&this._parent&&this._parent._source)return this._source.raw.path||this._source.raw.name;const e=this.getLabel(!1),t=this.getParent();if(t){const r=t.getHoverLabel();if(r)return`${r}/${e}`}return e}getSource(){const e=this.oneChild();return e?e.getSource():this._source}compare(e,t){return e._label&&t._label?e._label.localeCompare(t._label):0}oneChild(){if(!this._source&&!this._showedMoreThanOne&&this.skipOneChild()){if(this._children.size===1)return this._children.values().next().value;this._children.size>1&&(this._showedMoreThanOne=!0)}}skipOneChild(){return P?this instanceof F:!(this instanceof S)&&!(this instanceof m)}}class S extends u{constructor(t,r){super(t,r.name,!0);this.folder=r}}class F extends u{constructor(t,r,o){super(void 0,"Root");this._pathService=t;this._contextService=r;this._labelService=o}add(t){return this.createIfNeeded(t.getId(),()=>new m(this._labelService,this,t,this._pathService,this._contextService))}find(t){return this.getChild(t.getId())}}class m extends u{constructor(t,r,o,i,a){super(r,o.getLabel(),!0);this._pathService=i;this.rootProvider=a;this._labelService=t,this._session=o}static URL_REGEXP=/^(https?:\/\/[^/]+)(\/.*)$/;_session;_map=new Map;_labelService;getInternalId(){return this._session.getId()}getSession(){return this._session}getHoverLabel(){}hasChildren(){return!0}compare(t,r){const o=this.category(t),i=this.category(r);return o!==i?o-i:super.compare(t,r)}category(t){if(t instanceof S)return t.folder.index;const r=t.getLabel();return r&&/^<.+>$/.test(r)?1e3:999}async addPath(t){let r,o,i=t.raw.path;if(!i)return;this._labelService&&be.test(i)&&(i=this._labelService.getUriLabel(D.parse(i)));const a=m.URL_REGEXP.exec(i);if(a&&a.length===3)o=a[1],i=decodeURI(a[2]);else if(A(i)){const p=D.file(i);r=this.rootProvider?this.rootProvider.getWorkspaceFolder(p):null,r?(i=C(ee(p.path.substring(r.uri.path.length),T.sep)),this.rootProvider.getWorkspace().folders.length>1?i=T.sep+i:r=null):(i=C(i),Q?i=Z(i):i=J(i,(await this._pathService.userHome()).fsPath))}let l=this;i.split(/[\/\\]/).forEach((p,s)=>{if(s===0&&r){const n=r;l=l.createIfNeeded(r.name,h=>new S(h,n))}else s===0&&o?l=l.createIfNeeded(o,n=>new u(n,o)):l=l.createIfNeeded(p,n=>new u(n,p))}),l.setSource(this._session,t),t.raw.path&&this._map.set(t.raw.path,l)}removePath(t){if(t.raw.path){const r=this._map.get(t.raw.path);if(r)return r.removeFromParent(),!0}return!1}}function x(d,e){const t=d.getChildren(),r=e?!e.expanded.has(d.getId()):!(d instanceof m);return{element:d,collapsed:r,collapsible:d.hasChildren(),children:t.map(o=>x(o,e))}}let g=class extends M{constructor(t,r,o,i,a,l,p,s,n,h,f,_,B,O,z,E){super(t,o,r,l,s,a,i,B,O,z,E);this.editorService=p;this.contextService=n;this.debugService=h;this.labelService=f;this.pathService=_;this.loadedScriptsItemType=X.bindTo(s)}treeContainer;loadedScriptsItemType;tree;treeLabels;changeScheduler;treeNeedsRefreshOnVisible=!1;filter;renderBody(t){super.renderBody(t),this.element.classList.add("debug-pane"),t.classList.add("debug-loaded-scripts"),t.classList.add("show-file-icons"),this.treeContainer=j(t),this.filter=new Te;const r=new F(this.pathService,this.contextService,this.labelService);this.treeLabels=this.instantiationService.createInstance(re,{onDidChangeVisibility:this.onDidChangeBodyVisibility}),this._register(this.treeLabels),this.tree=this.instantiationService.createInstance(se,"LoadedScriptsView",this.treeContainer,new ge,[new v(this.treeLabels)],{compressionEnabled:P,collapseByDefault:!0,hideTwistiesOfChildlessElements:!0,identityProvider:{getId:s=>s.getId()},keyboardNavigationLabelProvider:{getKeyboardNavigationLabel:s=>s.getLabel(),getCompressedNodeKeyboardNavigationLabel:s=>s.map(n=>n.getLabel()).join("/")},filter:this.filter,accessibilityProvider:new ve,overrideStyles:this.getLocationBasedColors().listOverrideStyles});const o=s=>this.tree.setChildren(null,x(r,s).children);o(),this.changeScheduler=new te(()=>{this.treeNeedsRefreshOnVisible=!1,this.tree&&o()},300),this._register(this.changeScheduler),this._register(this.tree.onDidOpen(s=>{if(s.element instanceof u){const n=s.element.getSource();if(n&&n.available){const h={startLineNumber:0,startColumn:0,endLineNumber:0,endColumn:0};n.openInEditor(this.editorService,h,s.editorOptions.preserveFocus,s.sideBySide,s.editorOptions.pinned)}}})),this._register(this.tree.onDidChangeFocus(()=>{this.tree.getFocus()instanceof m?this.loadedScriptsItemType.set("session"):this.loadedScriptsItemType.reset()}));const i=()=>{this.isBodyVisible()?this.changeScheduler.schedule():this.treeNeedsRefreshOnVisible=!0},a=async s=>{if(s.capabilities.supportsLoadedSourcesRequest){const n=r.add(s),h=await s.getLoadedSources();for(const f of h)await n.addPath(f);i()}},l=s=>{this._register(s.onDidChangeName(async()=>{const n=r.find(s);n&&(n.updateLabel(s.getLabel()),i())})),this._register(s.onDidLoadedSource(async n=>{let h;switch(n.reason){case"new":case"changed":h=r.add(s),await h.addPath(n.source),i(),n.reason==="changed"&&ne.refreshDebugContent(n.source.uri);break;case"removed":h=r.find(s),h&&h.removePath(n.source)&&i();break;default:this.filter.setFilter(n.source.name),this.tree.refilter();break}}))};this._register(this.debugService.onDidNewSession(l)),this.debugService.getModel().getSessions().forEach(l),this._register(this.debugService.onDidEndSession(({session:s})=>{r.remove(s.getId()),this.changeScheduler.schedule()})),this.changeScheduler.schedule(0),this._register(this.onDidChangeBodyVisibility(s=>{s&&this.treeNeedsRefreshOnVisible&&this.changeScheduler.schedule()}));let p;this._register(this.tree.onDidChangeFindPattern(s=>{if(this.tree.findMode!==Ie.Highlight)if(!p&&s){const n=new Set,h=f=>{f.element&&!f.collapsed&&n.add(f.element.getId());for(const _ of f.children)h(_)};h(this.tree.getNode()),p={expanded:n},this.tree.expandAll()}else!s&&p&&(this.tree.setFocus([]),o(p),p=void 0)})),this.debugService.getModel().getSessions().forEach(s=>a(s))}layoutBody(t,r){super.layoutBody(t,r),this.tree.layout(t,r)}collapseAll(){this.tree.collapseAll()}dispose(){R(this.tree),R(this.treeLabels),super.dispose()}};g=y([c(1,H),c(2,K),c(3,W),c(4,he),c(5,$),c(6,ie),c(7,G),c(8,q),c(9,U),c(10,ae),c(11,fe),c(12,pe),c(13,ue),c(14,me),c(15,Se)],g);class ge{getHeight(e){return 22}getTemplateId(e){return v.ID}}class v{constructor(e){this.labels=e}static ID="lsrenderer";get templateId(){return v.ID}renderTemplate(e){return{label:this.labels.create(e,{supportHighlights:!0})}}renderElement(e,t,r){const o=e.element,i=o.getLabel();this.render(o,i,r,e.filterData)}renderCompressedElements(e,t,r,o){const i=e.element.elements[e.element.elements.length-1],a=e.element.elements.map(l=>l.getLabel());this.render(i,a,r,e.filterData)}render(e,t,r,o){const i={name:t},a={title:e.getHoverLabel()};if(e instanceof S)a.fileKind=L.ROOT_FOLDER;else if(e instanceof m)a.title=I.localize("loadedScriptsSession","Debug Session"),a.hideIcon=!0;else if(e instanceof u){const l=e.getSource();l&&l.uri?(i.resource=l.uri,a.fileKind=L.FILE):a.fileKind=L.FOLDER}a.matches=oe(o),r.label.setResource(i,a)}disposeTemplate(e){e.label.dispose()}}class ve{getWidgetAriaLabel(){return I.localize({comment:["Debug is a noun in this context, not a verb."],key:"loadedScriptsAriaLabel"},"Debug Loaded Scripts")}getAriaLabel(e){return e instanceof S?I.localize("loadedScriptsRootFolderAriaLabel","Workspace folder {0}, loaded script, debug",e.getLabel()):e instanceof m?I.localize("loadedScriptsSessionAriaLabel","Session {0}, loaded script, debug",e.getLabel()):e.hasChildren()?I.localize("loadedScriptsFolderAriaLabel","Folder {0}, loaded script, debug",e.getLabel()):I.localize("loadedScriptsSourceAriaLabel","{0}, loaded script, debug",e.getLabel())}}class Te{filterText;setFilter(e){this.filterText=e}filter(e,t){return this.filterText?e.isLeaf()?e.getLabel().indexOf(this.filterText)>=0?b.Visible:b.Hidden:b.Recurse:b.Visible}}le(class extends k{constructor(){super({id:"loadedScripts.collapse",viewId:w,title:I.localize("collapse","Collapse All"),f1:!1,icon:ce.collapseAll,menu:{id:de.ViewTitle,order:30,group:"navigation",when:Y.equals("view",w)}})}runInView(e,t){t.collapseAll()}});export{g as LoadedScriptsView};
