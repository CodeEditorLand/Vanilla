var c=Object.defineProperty;var u=Object.getOwnPropertyDescriptor;var d=(m,n,e,t)=>{for(var i=t>1?void 0:t?u(n,e):n,o=m.length-1,r;o>=0;o--)(r=m[o])&&(i=(t?r(n,e,i):r(i))||i);return t&&i&&c(n,e,i),i},a=(m,n)=>(e,t)=>n(e,t,m);import{coalesce as g}from"../../../../../../base/common/arrays.js";import{DisposableStore as p,MutableDisposable as f}from"../../../../../../base/common/lifecycle.js";import{EDITOR_FONT_DEFAULTS as v}from"../../../../../../editor/common/config/editorOptions.js";import{IConfigurationService as T}from"../../../../../../platform/configuration/common/configuration.js";import{IContextKeyService as I}from"../../../../../../platform/contextkey/common/contextkey.js";import{IInstantiationService as _}from"../../../../../../platform/instantiation/common/instantiation.js";import{IThemeService as y}from"../../../../../../platform/theme/common/themeService.js";import{ICommentService as C}from"../../../../comments/browser/commentService.js";import{CommentThreadWidget as E}from"../../../../comments/browser/commentThreadWidget.js";import{CellContentPart as S}from"../cellPart.js";let h=class extends S{constructor(e,t,i,o,r,s,l){super();this.notebookEditor=e;this.container=t;this.contextKeyService=i;this.themeService=o;this.commentService=r;this.configurationService=s;this.instantiationService=l;this.container.classList.add("review-widget"),this._register(this._commentThreadWidget=new f),this._register(this.themeService.onDidColorThemeChange(this._applyTheme,this)),this._applyTheme()}_commentThreadWidget;currentElement;_commentThreadDisposables=this._register(new p);async initialize(e){this.currentElement!==e&&(this.currentElement=e,await this._updateThread())}async _createCommentTheadWidget(e,t){this._commentThreadDisposables.clear(),this._commentThreadWidget.value=this.instantiationService.createInstance(E,this.container,this.notebookEditor,e,this.notebookEditor.textModel.uri,this.contextKeyService,this.instantiationService,t,void 0,void 0,{codeBlockFontFamily:this.configurationService.getValue("editor").fontFamily||v.fontFamily},void 0,{actionRunner:()=>{},collapse:()=>{}});const i=this.notebookEditor.getLayoutInfo();await this._commentThreadWidget.value.display(i.fontInfo.lineHeight,!0),this._applyTheme(),this._commentThreadDisposables.add(this._commentThreadWidget.value.onDidResize(()=>{this.currentElement&&this._commentThreadWidget.value&&(this.currentElement.commentHeight=this._calculateCommentThreadHeight(this._commentThreadWidget.value.getDimensions().height))}))}_bindListeners(){this.cellDisposables.add(this.commentService.onDidUpdateCommentThreads(async()=>this._updateThread()))}async _updateThread(){if(!this.currentElement)return;const e=await this._getCommentThreadForCell(this.currentElement);if(!this._commentThreadWidget.value&&e){await this._createCommentTheadWidget(e.owner,e.thread),this.container.style.top=`${this.currentElement.layoutInfo.commentOffset}px`,this.currentElement.commentHeight=this._calculateCommentThreadHeight(this._commentThreadWidget.value.getDimensions().height);return}if(this._commentThreadWidget.value){if(!e){this._commentThreadDisposables.clear(),this._commentThreadWidget.value=void 0,this.currentElement.commentHeight=0;return}await this._commentThreadWidget.value.updateCommentThread(e.thread),this.currentElement.commentHeight=this._calculateCommentThreadHeight(this._commentThreadWidget.value.getDimensions().height)}}_calculateCommentThreadHeight(e){const t=this.notebookEditor.getLayoutInfo(),i=Math.ceil(t.fontInfo.lineHeight*1.2),o=t.fontInfo.lineHeight,r=Math.round(o/3),s=Math.round(o/9)*2;return i+e+r+s+8}async _getCommentThreadForCell(e){if(this.notebookEditor.hasModel()){const t=g(await this.commentService.getNotebookComments(e.uri));for(const i of t)for(const o of i.threads)return{owner:i.uniqueOwner,thread:o}}return null}_applyTheme(){const e=this.themeService.getColorTheme(),t=this.notebookEditor.getLayoutInfo().fontInfo;this._commentThreadWidget.value?.applyTheme(e,t)}didRenderCell(e){this.initialize(e),this._bindListeners()}prepareLayout(){this.currentElement&&this._commentThreadWidget.value&&(this.currentElement.commentHeight=this._calculateCommentThreadHeight(this._commentThreadWidget.value.getDimensions().height))}updateInternalLayoutNow(e){this.currentElement&&this._commentThreadWidget.value&&(this.container.style.top=`${e.layoutInfo.commentOffset}px`)}};h=d([a(2,I),a(3,y),a(4,C),a(5,T),a(6,_)],h);export{h as CellComments};
