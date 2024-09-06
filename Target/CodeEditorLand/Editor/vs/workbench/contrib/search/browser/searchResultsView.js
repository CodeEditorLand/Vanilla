var W=Object.defineProperty;var G=Object.getOwnPropertyDescriptor;var M=(T,i,r,o)=>{for(var e=o>1?void 0:o?G(i,r):i,t=T.length-1,n;t>=0;t--)(n=T[t])&&(e=(o?n(i,r,e):n(e))||e);return o&&e&&W(i,r,e),e},l=(T,i)=>(r,o)=>i(r,o,T);import*as a from"../../../../../vs/base/browser/dom.js";import{CountBadge as A}from"../../../../../vs/base/browser/ui/countBadge/countBadge.js";import{getDefaultHoverDelegate as O}from"../../../../../vs/base/browser/ui/hover/hoverDelegateFactory.js";import"../../../../../vs/base/browser/ui/list/list.js";import"../../../../../vs/base/browser/ui/list/listWidget.js";import"../../../../../vs/base/browser/ui/tree/compressedObjectTreeModel.js";import"../../../../../vs/base/browser/ui/tree/objectTree.js";import"../../../../../vs/base/browser/ui/tree/tree.js";import{Disposable as C,DisposableStore as g}from"../../../../../vs/base/common/lifecycle.js";import*as q from"../../../../../vs/base/common/path.js";import{isEqual as U}from"../../../../../vs/base/common/resources.js";import*as d from"../../../../../vs/nls.js";import{HiddenItemStrategy as L,MenuWorkbenchToolBar as F}from"../../../../../vs/platform/actions/browser/toolbar.js";import{MenuId as E}from"../../../../../vs/platform/actions/common/actions.js";import{IConfigurationService as R}from"../../../../../vs/platform/configuration/common/configuration.js";import{IContextKeyService as S}from"../../../../../vs/platform/contextkey/common/contextkey.js";import{FileKind as y}from"../../../../../vs/platform/files/common/files.js";import{IHoverService as j}from"../../../../../vs/platform/hover/browser/hover.js";import{IInstantiationService as w}from"../../../../../vs/platform/instantiation/common/instantiation.js";import{ServiceCollection as K}from"../../../../../vs/platform/instantiation/common/serviceCollection.js";import{ILabelService as V}from"../../../../../vs/platform/label/common/label.js";import{defaultCountBadgeStyles as H}from"../../../../../vs/platform/theme/browser/defaultStyles.js";import{IWorkspaceContextService as N}from"../../../../../vs/platform/workspace/common/workspace.js";import"../../../../../vs/workbench/browser/labels.js";import"../../../../../vs/workbench/contrib/search/browser/searchActionsRemoveReplace.js";import{FileMatch as P,FolderMatch as B,FolderMatchNoRoot as J,FolderMatchWorkspaceRoot as Q,Match as $,MatchInNotebook as z}from"../../../../../vs/workbench/contrib/search/browser/searchModel.js";import"../../../../../vs/workbench/contrib/search/browser/searchView.js";import{SearchContext as p}from"../../../../../vs/workbench/contrib/search/common/constants.js";import"../../../../../vs/workbench/services/search/common/search.js";class k{static ITEM_HEIGHT=22;getHeight(i){return k.ITEM_HEIGHT}getTemplateId(i){if(i instanceof B)return I.TEMPLATE_ID;if(i instanceof P)return v.TEMPLATE_ID;if(i instanceof $)return f.TEMPLATE_ID;throw console.error("Invalid search tree element",i),new Error("Invalid search tree element")}}let I=class extends C{constructor(r,o,e,t,n,s){super();this.searchView=r;this.labels=o;this.contextService=e;this.labelService=t;this.instantiationService=n;this.contextKeyService=s}static TEMPLATE_ID="folderMatch";templateId=I.TEMPLATE_ID;renderCompressedElements(r,o,e,t){const n=r.element,s=n.elements[n.elements.length-1],m=n.elements.map(c=>c.name());if(s.resource){const c=s instanceof Q?y.ROOT_FOLDER:y.FOLDER;e.label.setResource({resource:s.resource,name:m},{fileKind:c,separator:this.labelService.getSeparator(s.resource.scheme)})}else e.label.setLabel(d.localize("searchFolderMatch.other.label","Other files"));this.renderFolderDetails(s,e)}renderTemplate(r){const o=new g,e=a.append(r,a.$(".foldermatch")),t=this.labels.create(e,{supportDescriptionHighlights:!0,supportHighlights:!0});o.add(t);const n=new A(a.append(e,a.$(".badge")),{},H),s=a.append(e,a.$(".actionBarContainer")),m=new g;o.add(m);const c=o.add(this.contextKeyService.createScoped(r));p.MatchFocusKey.bindTo(c).set(!1),p.FileFocusKey.bindTo(c).set(!1),p.FolderFocusKey.bindTo(c).set(!0);const u=this._register(this.instantiationService.createChild(new K([S,c]))),h=o.add(u.createInstance(F,s,E.SearchActionMenu,{menuOptions:{shouldForwardArgs:!0},hiddenItemStrategy:L.Ignore,toolbarOptions:{primaryGroup:b=>/^inline/.test(b)}}));return{label:t,badge:n,actions:h,disposables:o,elementDisposables:m,contextKeyService:c}}renderElement(r,o,e){const t=r.element;if(t.resource){const n=this.contextService.getWorkspaceFolder(t.resource);n&&U(n.uri,t.resource)?e.label.setFile(t.resource,{fileKind:y.ROOT_FOLDER,hidePath:!0}):e.label.setFile(t.resource,{fileKind:y.FOLDER,hidePath:this.searchView.isTreeLayoutViewVisible})}else e.label.setLabel(d.localize("searchFolderMatch.other.label","Other files"));p.IsEditableItemKey.bindTo(e.contextKeyService).set(!t.hasOnlyReadOnlyMatches()),e.elementDisposables.add(t.onChange(()=>{p.IsEditableItemKey.bindTo(e.contextKeyService).set(!t.hasOnlyReadOnlyMatches())})),this.renderFolderDetails(t,e)}disposeElement(r,o,e){e.elementDisposables.clear()}disposeCompressedElements(r,o,e,t){e.elementDisposables.clear()}disposeTemplate(r){r.disposables.dispose()}renderFolderDetails(r,o){const e=r.recursiveMatchCount();o.badge.setCount(e),o.badge.setTitleFormat(e>1?d.localize("searchFileMatches","{0} files found",e):d.localize("searchFileMatch","{0} file found",e)),o.actions.context={viewer:this.searchView.getControl(),element:r}}};I=M([l(2,N),l(3,V),l(4,w),l(5,S)],I);let v=class extends C{constructor(r,o,e,t,n,s){super();this.searchView=r;this.labels=o;this.contextService=e;this.configurationService=t;this.instantiationService=n;this.contextKeyService=s}static TEMPLATE_ID="fileMatch";templateId=v.TEMPLATE_ID;renderCompressedElements(r,o,e,t){throw new Error("Should never happen since node is incompressible.")}renderTemplate(r){const o=new g,e=new g;o.add(e);const t=a.append(r,a.$(".filematch")),n=this.labels.create(t);o.add(n);const s=new A(a.append(t,a.$(".badge")),{},H),m=a.append(t,a.$(".actionBarContainer")),c=o.add(this.contextKeyService.createScoped(r));p.MatchFocusKey.bindTo(c).set(!1),p.FileFocusKey.bindTo(c).set(!0),p.FolderFocusKey.bindTo(c).set(!1);const u=this._register(this.instantiationService.createChild(new K([S,c]))),h=o.add(u.createInstance(F,m,E.SearchActionMenu,{menuOptions:{shouldForwardArgs:!0},hiddenItemStrategy:L.Ignore,toolbarOptions:{primaryGroup:b=>/^inline/.test(b)}}));return{el:t,label:n,badge:s,actions:h,disposables:o,elementDisposables:e,contextKeyService:c}}renderElement(r,o,e){const t=r.element;e.el.setAttribute("data-resource",t.resource.toString());const n=this.configurationService.getValue("search").decorations;e.label.setFile(t.resource,{hidePath:this.searchView.isTreeLayoutViewVisible&&!(t.parent()instanceof J),hideIcon:!1,fileDecorations:{colors:n.colors,badges:n.badges}});const s=t.count();e.badge.setCount(s),e.badge.setTitleFormat(s>1?d.localize("searchMatches","{0} matches found",s):d.localize("searchMatch","{0} match found",s)),e.actions.context={viewer:this.searchView.getControl(),element:t},p.IsEditableItemKey.bindTo(e.contextKeyService).set(!t.hasOnlyReadOnlyMatches()),e.elementDisposables.add(t.onChange(()=>{p.IsEditableItemKey.bindTo(e.contextKeyService).set(!t.hasOnlyReadOnlyMatches())})),e.el.parentElement?.parentElement?.querySelector(".monaco-tl-twistie")?.classList.add("force-twistie")}disposeElement(r,o,e){e.elementDisposables.clear()}disposeTemplate(r){r.disposables.dispose()}};v=M([l(2,N),l(3,R),l(4,w),l(5,S)],v);let f=class extends C{constructor(r,o,e,t,n,s){super();this.searchView=r;this.contextService=o;this.configurationService=e;this.instantiationService=t;this.contextKeyService=n;this.hoverService=s}static TEMPLATE_ID="match";templateId=f.TEMPLATE_ID;renderCompressedElements(r,o,e,t){throw new Error("Should never happen since node is incompressible.")}renderTemplate(r){r.classList.add("linematch");const o=a.append(r,a.$("span.matchLineNum")),e=a.append(r,a.$("a.plain.match")),t=a.append(e,a.$("span")),n=a.append(e,a.$("span.findInFileMatch")),s=a.append(e,a.$("span.replaceMatch")),m=a.append(e,a.$("span")),c=a.append(r,a.$("span.actionBarContainer")),u=new g,h=u.add(this.contextKeyService.createScoped(r));p.MatchFocusKey.bindTo(h).set(!0),p.FileFocusKey.bindTo(h).set(!1),p.FolderFocusKey.bindTo(h).set(!1);const b=this._register(this.instantiationService.createChild(new K([S,h]))),D=u.add(b.createInstance(F,c,E.SearchActionMenu,{menuOptions:{shouldForwardArgs:!0},hiddenItemStrategy:L.Ignore,toolbarOptions:{primaryGroup:_=>/^inline/.test(_)}}));return{parent:e,before:t,match:n,replace:s,after:m,lineNumber:o,actions:D,disposables:u,contextKeyService:h}}renderElement(r,o,e){const t=r.element,n=t.preview(),s=this.searchView.model.isReplaceActive()&&!!this.searchView.model.replaceString&&!(t instanceof z&&t.isReadonly());e.before.textContent=n.before,e.match.textContent=n.inside,e.match.classList.toggle("replace",s),e.replace.textContent=s?t.replaceString:"",e.after.textContent=n.after;const m=(n.fullBefore+(s?t.replaceString:n.inside)+n.after).trim().substr(0,999);e.disposables.add(this.hoverService.setupManagedHover(O("mouse"),e.parent,m)),p.IsEditableItemKey.bindTo(e.contextKeyService).set(!(t instanceof z&&t.isReadonly()));const c=t.range().endLineNumber-t.range().startLineNumber,u=c>0?`+${c}`:"",h=this.configurationService.getValue("search").showLineNumbers,b=h?`${t.range().startLineNumber}:`:"";e.lineNumber.classList.toggle("show",c>0||h),e.lineNumber.textContent=b+u,e.disposables.add(this.hoverService.setupManagedHover(O("mouse"),e.lineNumber,this.getMatchTitle(t,h))),e.actions.context={viewer:this.searchView.getControl(),element:t}}disposeTemplate(r){r.disposables.dispose()}getMatchTitle(r,o){const e=r.range().startLineNumber,t=r.range().endLineNumber-r.range().startLineNumber,n=o?d.localize("lineNumStr","From line {0}",e,t)+" ":"",s=t>0?"+ "+d.localize("numLinesStr","{0} more lines",t):"";return n+s}};f=M([l(1,N),l(2,R),l(3,w),l(4,S),l(5,j)],f);let x=class{constructor(i,r){this.searchView=i;this.labelService=r}getWidgetAriaLabel(){return d.localize("search","Search")}getAriaLabel(i){if(i instanceof B){const r=i.allDownstreamFileMatches().reduce((o,e)=>o+e.count(),0);return i.resource?d.localize("folderMatchAriaLabel","{0} matches in folder root {1}, Search result",r,i.name()):d.localize("otherFilesAriaLabel","{0} matches outside of the workspace, Search result",r)}if(i instanceof P){const r=this.labelService.getUriLabel(i.resource,{relative:!0})||i.resource.fsPath;return d.localize("fileMatchAriaLabel","{0} matches in file {1} of folder {2}, Search result",i.count(),i.name(),q.dirname(r))}if(i instanceof $){const r=i,o=this.searchView.model,e=o.isReplaceActive()&&!!o.replaceString,t=r.getMatchString(),n=r.range(),s=r.text().substr(0,n.endColumn+150);return e?d.localize("replacePreviewResultAria","'{0}' at column {1} replace {2} with {3}",s,n.startColumn,t,r.replaceString):d.localize("searchResultAria","'{0}' at column {1} found {2}",s,n.startColumn,t)}return null}};x=M([l(1,V)],x);export{v as FileMatchRenderer,I as FolderMatchRenderer,f as MatchRenderer,x as SearchAccessibilityProvider,k as SearchDelegate};
