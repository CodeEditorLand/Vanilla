var _=Object.defineProperty;var v=Object.getOwnPropertyDescriptor;var f=(r,e,t,n)=>{for(var i=n>1?void 0:n?v(e,t):e,o=r.length-1,s;o>=0;o--)(s=r[o])&&(i=(n?s(e,t,i):s(i))||i);return n&&i&&_(e,t,i),i},c=(r,e)=>(t,n)=>e(t,n,r);import{ActionViewItem as K}from"../../../../../base/browser/ui/actionbar/actionViewItems.js";import{Action as y}from"../../../../../base/common/actions.js";import{localize as T,localize2 as C}from"../../../../../nls.js";import{Action2 as A,MenuId as u,registerAction2 as N}from"../../../../../platform/actions/common/actions.js";import{ContextKeyExpr as p}from"../../../../../platform/contextkey/common/contextkey.js";import{ExtensionIdentifier as S}from"../../../../../platform/extensions/common/extensions.js";import{IInstantiationService as L}from"../../../../../platform/instantiation/common/instantiation.js";import{ThemeIcon as O}from"../../../../../base/common/themables.js";import{NOTEBOOK_ACTIONS_CATEGORY as x,SELECT_KERNEL_ID as M}from"../controller/coreActions.js";import{getNotebookEditorFromEditorPane as h}from"../notebookBrowser.js";import{selectKernelIcon as m}from"../notebookIcons.js";import{KernelPickerMRUStrategy as k}from"./notebookKernelQuickPickStrategy.js";import{NOTEBOOK_IS_ACTIVE_EDITOR as b,NOTEBOOK_KERNEL_COUNT as D}from"../../common/notebookContextKeys.js";import{INotebookKernelHistoryService as P,INotebookKernelService as g}from"../../common/notebookKernelService.js";import{IEditorService as w}from"../../../../services/editor/common/editorService.js";function R(r,e){let t;if(e!==void 0&&"notebookEditorId"in e){const n=e.notebookEditorId,i=r.visibleEditorPanes.find(o=>h(o)?.getId()===n);t=h(i)}else e!==void 0&&"notebookEditor"in e?t=e?.notebookEditor:t=h(r.activeEditorPane);return t}N(class extends A{constructor(){super({id:M,category:x,title:C("notebookActions.selectKernel","Select Notebook Kernel"),icon:m,f1:!0,precondition:b,menu:[{id:u.EditorTitle,when:p.and(b,p.notEquals("config.notebook.globalToolbar",!0)),group:"navigation",order:-10},{id:u.NotebookToolbar,when:p.equals("config.notebook.globalToolbar",!0),group:"status",order:-10},{id:u.InteractiveToolbar,when:D.notEqualsTo(0),group:"status",order:-10}],metadata:{description:T("notebookActions.selectKernel.args","Notebook Kernel Args"),args:[{name:"kernelInfo",description:"The kernel info",schema:{type:"object",required:["id","extension"],properties:{id:{type:"string"},extension:{type:"string"},notebookEditorId:{type:"string"}}}}]}})}async run(r,e){const t=r.get(L),n=r.get(w),i=R(n,e);if(!i||!i.hasModel())return!1;let o=e&&"id"in e?e.id:void 0,s=e&&"extension"in e?e.extension:void 0;o&&(typeof o!="string"||typeof s!="string")&&(o=void 0,s=void 0);const a=i.textModel,E=r.get(g).getMatchingKernel(a),{selected:l}=E;if(l&&o&&l.id===o&&S.equals(l.extension,s))return!0;const I=o?`${s}/${o}`:void 0;return t.createInstance(k).showQuickPick(i,I)}});let d=class extends K{constructor(t,n,i,o,s){super(void 0,new y("fakeAction",void 0,O.asClassName(m),!0,a=>t.run(a)),{...i,label:!1,icon:!0});this._editor=n;this._notebookKernelService=o;this._notebookKernelHistoryService=s;this._register(n.onDidChangeModel(this._update,this)),this._register(o.onDidAddKernel(this._update,this)),this._register(o.onDidRemoveKernel(this._update,this)),this._register(o.onDidChangeNotebookAffinity(this._update,this)),this._register(o.onDidChangeSelectedNotebooks(this._update,this)),this._register(o.onDidChangeSourceActions(this._update,this)),this._register(o.onDidChangeKernelDetectionTasks(this._update,this))}_kernelLabel;render(t){this._update(),super.render(t),t.classList.add("kernel-action-view-item"),this._kernelLabel=document.createElement("a"),t.appendChild(this._kernelLabel),this.updateLabel()}updateLabel(){this._kernelLabel&&(this._kernelLabel.classList.add("kernel-label"),this._kernelLabel.innerText=this._action.label)}_update(){const t=this._editor.textModel;if(!t){this._resetAction();return}k.updateKernelStatusAction(t,this._action,this._notebookKernelService,this._notebookKernelHistoryService),this.updateClass()}_resetAction(){this._action.enabled=!1,this._action.label="",this._action.class=""}};d=f([c(3,g),c(4,P)],d);export{d as NotebooKernelActionViewItem};
