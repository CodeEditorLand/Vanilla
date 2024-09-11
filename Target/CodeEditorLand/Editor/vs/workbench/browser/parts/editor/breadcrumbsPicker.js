var D=Object.defineProperty;var L=Object.getOwnPropertyDescriptor;var p=(l,e,t,r)=>{for(var i=r>1?void 0:r?L(e,t):e,o=l.length-1,s;o>=0;o--)(s=l[o])&&(i=(r?s(e,t,i):s(i))||i);return r&&i&&D(e,t,i),i},c=(l,e)=>(t,r)=>e(t,r,l);import{compareFileNames as O}from"../../../../base/common/comparers.js";import{onUnexpectedError as R}from"../../../../base/common/errors.js";import{Emitter as P}from"../../../../base/common/event.js";import{createMatches as N}from"../../../../base/common/filters.js";import*as U from"../../../../base/common/glob.js";import{DisposableStore as F,MutableDisposable as z,Disposable as H}from"../../../../base/common/lifecycle.js";import{posix as A,relative as M}from"../../../../base/common/path.js";import{basename as V,dirname as $,isEqual as E}from"../../../../base/common/resources.js";import{URI as b}from"../../../../base/common/uri.js";import"./media/breadcrumbscontrol.css";import{IConfigurationService as v}from"../../../../platform/configuration/common/configuration.js";import{FileKind as f,IFileService as B}from"../../../../platform/files/common/files.js";import{IInstantiationService as k}from"../../../../platform/instantiation/common/instantiation.js";import{WorkbenchDataTree as K,WorkbenchAsyncDataTree as j}from"../../../../platform/list/browser/listService.js";import{breadcrumbsPickerBackground as w,widgetBorder as q,widgetShadow as G}from"../../../../platform/theme/common/colorRegistry.js";import{isWorkspace as g,isWorkspaceFolder as d,IWorkspaceContextService as W}from"../../../../platform/workspace/common/workspace.js";import{ResourceLabels as J,DEFAULT_LABELS_CONTAINER as Q}from"../../labels.js";import{BreadcrumbsConfig as X}from"./breadcrumbs.js";import"./breadcrumbsModel.js";import"../../../../base/browser/ui/tree/tree.js";import"../../../../base/browser/ui/list/list.js";import{IThemeService as T}from"../../../../platform/theme/common/themeService.js";import"../../../../base/browser/ui/list/listWidget.js";import{localize as Y}from"../../../../nls.js";import"../../../services/outline/browser/outline.js";import"../../../../platform/editor/common/editor.js";import{IEditorService as Z,SIDE_GROUP as ee}from"../../../services/editor/common/editorService.js";import{ITextResourceConfigurationService as te}from"../../../../editor/common/services/textResourceConfiguration.js";let m=class{constructor(e,t,r,i,o){this.resource=t;this._instantiationService=r;this._themeService=i;this._configurationService=o;this._domNode=document.createElement("div"),this._domNode.className="monaco-breadcrumbs-picker show-file-icons",e.appendChild(this._domNode)}_disposables=new F;_domNode;_arrow;_treeContainer;_tree;_fakeEvent=new UIEvent("fakeEvent");_layoutInfo;_onWillPickElement=new P;onWillPickElement=this._onWillPickElement.event;_previewDispoables=new z;dispose(){this._disposables.dispose(),this._previewDispoables.dispose(),this._onWillPickElement.dispose(),this._domNode.remove(),setTimeout(()=>this._tree.dispose(),0)}async show(e,t,r,i,o){const a=this._themeService.getColorTheme().getColor(w);this._arrow=document.createElement("div"),this._arrow.className="arrow",this._arrow.style.borderColor=`transparent transparent ${a?a.toString():""}`,this._domNode.appendChild(this._arrow),this._treeContainer=document.createElement("div"),this._treeContainer.style.background=a?a.toString():"",this._treeContainer.style.paddingTop="2px",this._treeContainer.style.borderRadius="3px",this._treeContainer.style.boxShadow=`0 0 8px 2px ${this._themeService.getColorTheme().getColor(G)}`,this._treeContainer.style.border=`1px solid ${this._themeService.getColorTheme().getColor(q)}`,this._domNode.appendChild(this._treeContainer),this._layoutInfo={maxHeight:t,width:r,arrowSize:i,arrowOffset:o,inputHeight:0},this._tree=this._createTree(this._treeContainer,e),this._disposables.add(this._tree.onDidOpen(async n=>{const{element:S,editorOptions:C,sideBySide:x}=n;await this._revealElement(S,{...C,preserveFocus:!1},x)})),this._disposables.add(this._tree.onDidChangeFocus(n=>{this._previewDispoables.value=this._previewElement(n.elements[0])})),this._disposables.add(this._tree.onDidChangeContentHeight(()=>{this._layout()})),this._domNode.focus();try{await this._setInput(e),this._layout()}catch(n){R(n)}}_layout(){const e=2*this._layoutInfo.arrowSize,t=Math.min(this._layoutInfo.maxHeight-e,this._tree.contentHeight),r=t+e;this._domNode.style.height=`${r}px`,this._domNode.style.width=`${this._layoutInfo.width}px`,this._arrow.style.top=`-${2*this._layoutInfo.arrowSize}px`,this._arrow.style.borderWidth=`${this._layoutInfo.arrowSize}px`,this._arrow.style.marginLeft=`${this._layoutInfo.arrowOffset}px`,this._treeContainer.style.height=`${t}px`,this._treeContainer.style.width=`${this._layoutInfo.width}px`,this._tree.layout(t,this._layoutInfo.width)}restoreViewState(){}};m=p([c(2,k),c(3,T),c(4,v)],m);class re{getHeight(e){return 22}getTemplateId(e){return"FileStat"}}class ie{getId(e){return b.isUri(e)?e.toString():g(e)?e.id:d(e)?e.uri.toString():e.resource.toString()}}let u=class{constructor(e){this._fileService=e}hasChildren(e){return b.isUri(e)||g(e)||d(e)||e.isDirectory}async getChildren(e){if(g(e))return e.folders;let t;return d(e)?t=e.uri:b.isUri(e)?t=e:t=e.resource,(await this._fileService.resolve(t)).children??[]}};u=p([c(0,B)],u);let h=class{constructor(e,t){this._labels=e;this._configService=t}templateId="FileStat";renderTemplate(e){return this._labels.create(e,{supportHighlights:!0})}renderElement(e,t,r){const i=this._configService.getValue("explorer.decorations"),{element:o}=e;let s,a;d(o)?(s=o.uri,a=f.ROOT_FOLDER):(s=o.resource,a=o.isDirectory?f.FOLDER:f.FILE),r.setFile(s,{fileKind:a,hidePath:!0,fileDecorations:i,matches:N(e.filterData),extraClasses:["picker-item"]})}disposeTemplate(e){e.dispose()}};h=p([c(1,v)],h);class oe{getKeyboardNavigationLabel(e){return e.name}}class se{getWidgetAriaLabel(){return Y("breadcrumbs","Breadcrumbs")}getAriaLabel(e){return e.name}}let I=class{constructor(e,t){this._workspaceService=e;const r=X.FileExcludes.bindTo(t),i=()=>{e.getWorkspace().folders.forEach(o=>{const s=r.getValue({resource:o.uri});if(!s)return;const a={};for(const n in s){if(typeof s[n]!="boolean")continue;const S=n.indexOf("**/")!==0?A.join(o.uri.path,n):n;a[S]=s[n]}this._cachedExpressions.set(o.uri.toString(),U.parse(a))})};i(),this._disposables.add(r),this._disposables.add(r.onDidChange(i)),this._disposables.add(e.onDidChangeWorkspaceFolders(i))}_cachedExpressions=new Map;_disposables=new F;dispose(){this._disposables.dispose()}filter(e,t){if(d(e))return!0;const r=this._workspaceService.getWorkspaceFolder(e.resource);return!r||!this._cachedExpressions.has(r.uri.toString())?!0:!this._cachedExpressions.get(r.uri.toString())(M(r.uri.path,e.resource.path),V(e.resource))}};I=p([c(0,W),c(1,v)],I);class ae{compare(e,t){return d(e)&&d(t)?e.index-t.index:e.isDirectory===t.isDirectory?O(e.name,t.name):e.isDirectory?-1:1}}let y=class extends m{constructor(t,r,i,o,s,a,n){super(t,r,i,o,s);this._workspaceService=a;this._editorService=n}_createTree(t){this._treeContainer.classList.add("file-icon-themable-tree"),this._treeContainer.classList.add("show-file-icons");const r=o=>{this._treeContainer.classList.toggle("align-icons-and-twisties",o.hasFileIcons&&!o.hasFolderIcons),this._treeContainer.classList.toggle("hide-arrows",o.hidesExplorerArrows===!0)};this._disposables.add(this._themeService.onDidFileIconThemeChange(r)),r(this._themeService.getFileIconTheme());const i=this._instantiationService.createInstance(J,Q);return this._disposables.add(i),this._instantiationService.createInstance(j,"BreadcrumbsFilePicker",t,new re,[this._instantiationService.createInstance(h,i)],this._instantiationService.createInstance(u),{multipleSelectionSupport:!1,sorter:new ae,filter:this._instantiationService.createInstance(I),identityProvider:new ie,keyboardNavigationLabelProvider:new oe,accessibilityProvider:this._instantiationService.createInstance(se),showNotFoundMessage:!1,overrideStyles:{listBackground:w}})}async _setInput(t){const{uri:r,kind:i}=t;let o;i===f.ROOT_FOLDER?o=this._workspaceService.getWorkspace():o=$(r);const s=this._tree;await s.setInput(o);let a;for(const{element:n}of s.getNode().children)if(d(n)&&E(n.uri,r)){a=n;break}else if(E(n.resource,r)){a=n;break}a&&(s.reveal(a,.5),s.setFocus([a],this._fakeEvent)),s.domFocus()}_previewElement(t){return H.None}async _revealElement(t,r,i){return!d(t)&&t.isFile?(this._onWillPickElement.fire(),await this._editorService.openEditor({resource:t.resource,options:r},i?ee:void 0),!0):!1}};y=p([c(2,k),c(3,T),c(4,v),c(5,W),c(6,Z)],y);let _=class{constructor(e,t,r){this.comparator=e;this._order=r.getValue(t,"breadcrumbs.symbolSortOrder")}_order;compare(e,t){return this._order==="name"?this.comparator.compareByName(e,t):this._order==="type"?this.comparator.compareByType(e,t):this.comparator.compareByPosition(e,t)}};_=p([c(2,te)],_);class st extends m{_createTree(e,t){const{config:r}=t.outline;return this._instantiationService.createInstance(K,"BreadcrumbsOutlinePicker",e,r.delegate,r.renderers,r.treeDataSource,{...r.options,sorter:this._instantiationService.createInstance(_,r.comparator,void 0),collapseByDefault:!0,expandOnlyOnTwistieClick:!0,multipleSelectionSupport:!1,showNotFoundMessage:!1})}_setInput(e){const t=e.outline.captureViewState();this.restoreViewState=()=>{t.dispose()};const r=this._tree;return r.setInput(e.outline),e.element!==e.outline&&(r.reveal(e.element,.5),r.setFocus([e.element],this._fakeEvent)),r.domFocus(),Promise.resolve()}_previewElement(e){return this._tree.getInput().preview(e)}async _revealElement(e,t,r){return this._onWillPickElement.fire(),await this._tree.getInput().reveal(e,t,r,!1),!0}}export{y as BreadcrumbsFilePicker,st as BreadcrumbsOutlinePicker,m as BreadcrumbsPicker,ae as FileSorter};
