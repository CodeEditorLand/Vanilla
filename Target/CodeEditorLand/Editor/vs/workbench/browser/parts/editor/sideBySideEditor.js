var _=Object.defineProperty;var N=Object.getOwnPropertyDescriptor;var v=(u,o,i,e)=>{for(var t=e>1?void 0:e?N(o,i):o,r=u.length-1,n;r>=0;r--)(n=u[r])&&(t=(e?n(o,i,t):n(t))||t);return e&&t&&_(o,i,t),t},m=(u,o)=>(i,e)=>o(i,e,u);import"vs/css!./media/sidebysideeditor";import{$ as g,clearNode as P,Dimension as I,multibyteAwareBtoa as w}from"../../../../../vs/base/browser/dom.js";import"../../../../../vs/base/browser/ui/sash/sash.js";import{Orientation as s,Sizing as C,SplitView as V}from"../../../../../vs/base/browser/ui/splitview/splitview.js";import"../../../../../vs/base/common/cancellation.js";import{Emitter as D,Event as p,Relay as A}from"../../../../../vs/base/common/event.js";import{DisposableStore as O}from"../../../../../vs/base/common/lifecycle.js";import{isEqual as L}from"../../../../../vs/base/common/resources.js";import{assertIsDefined as E}from"../../../../../vs/base/common/types.js";import{URI as Y}from"../../../../../vs/base/common/uri.js";import{ITextResourceConfigurationService as H}from"../../../../../vs/editor/common/services/textResourceConfiguration.js";import{localize as F}from"../../../../../vs/nls.js";import{IConfigurationService as B}from"../../../../../vs/platform/configuration/common/configuration.js";import"../../../../../vs/platform/editor/common/editor.js";import{IInstantiationService as z}from"../../../../../vs/platform/instantiation/common/instantiation.js";import{Registry as x}from"../../../../../vs/platform/registry/common/platform.js";import{IStorageService as W}from"../../../../../vs/platform/storage/common/storage.js";import{ITelemetryService as M}from"../../../../../vs/platform/telemetry/common/telemetry.js";import{IThemeService as Z}from"../../../../../vs/platform/theme/common/themeService.js";import"../../../../../vs/workbench/browser/editor.js";import{DEFAULT_EDITOR_MIN_DIMENSIONS as l}from"../../../../../vs/workbench/browser/parts/editor/editor.js";import"../../../../../vs/workbench/browser/parts/editor/editorPane.js";import{AbstractEditorWithViewState as U}from"../../../../../vs/workbench/browser/parts/editor/editorWithViewState.js";import{EditorExtensions as G,EditorPaneSelectionCompareResult as b,isEditorPaneWithSelection as R,SideBySideEditor as S,SIDE_BY_SIDE_EDITOR_ID as j}from"../../../../../vs/workbench/common/editor.js";import"../../../../../vs/workbench/common/editor/editorInput.js";import{SideBySideEditorInput as T}from"../../../../../vs/workbench/common/editor/sideBySideEditorInput.js";import{SIDE_BY_SIDE_EDITOR_HORIZONTAL_BORDER as k,SIDE_BY_SIDE_EDITOR_VERTICAL_BORDER as $}from"../../../../../vs/workbench/common/theme.js";import{IEditorGroupsService as K}from"../../../../../vs/workbench/services/editor/common/editorGroupsService.js";import{IEditorService as q}from"../../../../../vs/workbench/services/editor/common/editorService.js";function J(u){const o=u;return typeof o?.primary=="object"&&typeof o.secondary=="object"}let h=class extends U{constructor(i,e,t,r,n,d,a,c,y){super(h.ID,i,h.VIEW_STATE_PREFERENCE_KEY,e,t,n,a,r,c,y);this.configurationService=d;this.registerListeners()}static ID=j;static SIDE_BY_SIDE_LAYOUT_SETTING="workbench.editor.splitInGroupLayout";static VIEW_STATE_PREFERENCE_KEY="sideBySideEditorViewState";get minimumPrimaryWidth(){return this.primaryEditorPane?this.primaryEditorPane.minimumWidth:0}get maximumPrimaryWidth(){return this.primaryEditorPane?this.primaryEditorPane.maximumWidth:Number.POSITIVE_INFINITY}get minimumPrimaryHeight(){return this.primaryEditorPane?this.primaryEditorPane.minimumHeight:0}get maximumPrimaryHeight(){return this.primaryEditorPane?this.primaryEditorPane.maximumHeight:Number.POSITIVE_INFINITY}get minimumSecondaryWidth(){return this.secondaryEditorPane?this.secondaryEditorPane.minimumWidth:0}get maximumSecondaryWidth(){return this.secondaryEditorPane?this.secondaryEditorPane.maximumWidth:Number.POSITIVE_INFINITY}get minimumSecondaryHeight(){return this.secondaryEditorPane?this.secondaryEditorPane.minimumHeight:0}get maximumSecondaryHeight(){return this.secondaryEditorPane?this.secondaryEditorPane.maximumHeight:Number.POSITIVE_INFINITY}set minimumWidth(i){}set maximumWidth(i){}set minimumHeight(i){}set maximumHeight(i){}get minimumWidth(){return this.minimumPrimaryWidth+this.minimumSecondaryWidth}get maximumWidth(){return this.maximumPrimaryWidth+this.maximumSecondaryWidth}get minimumHeight(){return this.minimumPrimaryHeight+this.minimumSecondaryHeight}get maximumHeight(){return this.maximumPrimaryHeight+this.maximumSecondaryHeight}_boundarySashes;onDidCreateEditors=this._register(new D);_onDidChangeSizeConstraints=this._register(new A);onDidChangeSizeConstraints=p.any(this.onDidCreateEditors.event,this._onDidChangeSizeConstraints.event);_onDidChangeSelection=this._register(new D);onDidChangeSelection=this._onDidChangeSelection.event;primaryEditorPane=void 0;secondaryEditorPane=void 0;primaryEditorContainer;secondaryEditorContainer;splitview;splitviewDisposables=this._register(new O);editorDisposables=this._register(new O);orientation=this.configurationService.getValue(h.SIDE_BY_SIDE_LAYOUT_SETTING)==="vertical"?s.VERTICAL:s.HORIZONTAL;dimension=new I(0,0);lastFocusedSide=void 0;registerListeners(){this._register(this.configurationService.onDidChangeConfiguration(i=>this.onConfigurationUpdated(i)))}onConfigurationUpdated(i){i.affectsConfiguration(h.SIDE_BY_SIDE_LAYOUT_SETTING)&&(this.orientation=this.configurationService.getValue(h.SIDE_BY_SIDE_LAYOUT_SETTING)==="vertical"?s.VERTICAL:s.HORIZONTAL,this.splitview&&this.recreateSplitview())}recreateSplitview(){const i=E(this.getContainer()),e=this.getSplitViewRatio();this.splitview&&(this.splitview.el.remove(),this.splitviewDisposables.clear()),this.createSplitView(i,e),this.layout(this.dimension)}getSplitViewRatio(){let i;if(this.splitview){const e=this.splitview.getViewSize(0),t=this.splitview.getViewSize(1);if(Math.abs(e-t)>1){const r=this.splitview.orientation===s.HORIZONTAL?this.dimension.width:this.dimension.height;i=e/r}}return i}createEditor(i){i.classList.add("side-by-side-editor"),this.secondaryEditorContainer=g(".side-by-side-editor-container.editor-instance"),this.primaryEditorContainer=g(".side-by-side-editor-container.editor-instance"),this.createSplitView(i)}createSplitView(i,e){this.splitview=this.splitviewDisposables.add(new V(i,{orientation:this.orientation})),this.splitviewDisposables.add(this.splitview.onDidSashReset(()=>this.splitview?.distributeViewSizes())),this.orientation===s.HORIZONTAL?this.splitview.orthogonalEndSash=this._boundarySashes?.bottom:(this.splitview.orthogonalStartSash=this._boundarySashes?.left,this.splitview.orthogonalEndSash=this._boundarySashes?.right);let t=C.Distribute,r=C.Distribute;if(e){const a=this.splitview.orientation===s.HORIZONTAL?this.dimension.width:this.dimension.height;t=Math.round(a*e),r=a-t,this.splitview.layout(this.orientation===s.HORIZONTAL?this.dimension.width:this.dimension.height)}const n=E(this.secondaryEditorContainer);this.splitview.addView({element:n,layout:a=>this.layoutPane(this.secondaryEditorPane,a),minimumSize:this.orientation===s.HORIZONTAL?l.width:l.height,maximumSize:Number.POSITIVE_INFINITY,onDidChange:p.None},t);const d=E(this.primaryEditorContainer);this.splitview.addView({element:d,layout:a=>this.layoutPane(this.primaryEditorPane,a),minimumSize:this.orientation===s.HORIZONTAL?l.width:l.height,maximumSize:Number.POSITIVE_INFINITY,onDidChange:p.None},r),this.updateStyles()}getTitle(){return this.input?this.input.getName():F("sideBySideEditor","Side by Side Editor")}async setInput(i,e,t,r){const n=this.input;await super.setInput(i,e,t,r),(!n||!i.matches(n))&&(n&&this.disposeEditors(),this.createEditors(i));const{primary:d,secondary:a,viewState:c}=this.loadViewState(i,e,t);if(this.lastFocusedSide=c?.focus,typeof c?.ratio=="number"&&this.splitview){const y=this.splitview.orientation===s.HORIZONTAL?this.dimension.width:this.dimension.height;this.splitview.resizeView(0,Math.round(y*c.ratio))}else this.splitview?.distributeViewSizes();await Promise.all([this.secondaryEditorPane?.setInput(i.secondary,a,t,r),this.primaryEditorPane?.setInput(i.primary,d,t,r)]),typeof e?.target=="number"&&(this.lastFocusedSide=e.target)}loadViewState(i,e,t){const r=J(e?.viewState)?e?.viewState:this.loadEditorViewState(i,t);let n=Object.create(null),d;return e?.target===S.SECONDARY?d={...e}:n={...e},n.viewState=r?.primary,r?.secondary&&(d?d.viewState=r?.secondary:d={viewState:r.secondary}),{primary:n,secondary:d,viewState:r}}createEditors(i){this.secondaryEditorPane=this.doCreateEditor(i.secondary,E(this.secondaryEditorContainer)),this.primaryEditorPane=this.doCreateEditor(i.primary,E(this.primaryEditorContainer)),this.layout(this.dimension),this._onDidChangeSizeConstraints.input=p.any(p.map(this.secondaryEditorPane.onDidChangeSizeConstraints,()=>{}),p.map(this.primaryEditorPane.onDidChangeSizeConstraints,()=>{})),this.onDidCreateEditors.fire(void 0),this.editorDisposables.add(this.primaryEditorPane.onDidFocus(()=>this.onDidFocusChange(S.PRIMARY))),this.editorDisposables.add(this.secondaryEditorPane.onDidFocus(()=>this.onDidFocusChange(S.SECONDARY)))}doCreateEditor(i,e){const t=x.as(G.EditorPane).getEditorPane(i);if(!t)throw new Error("No editor pane descriptor for editor found");const r=t.instantiate(this.instantiationService,this.group);return r.create(e),r.setVisible(this.isVisible()),R(r)&&this.editorDisposables.add(r.onDidChangeSelection(n=>this._onDidChangeSelection.fire(n))),this.editorDisposables.add(r),r}onDidFocusChange(i){this.lastFocusedSide=i,this._onDidChangeControl.fire()}getSelection(){const i=this.getLastFocusedEditorPane();if(R(i)){const e=i.getSelection();if(e)return new f(e,i===this.primaryEditorPane?S.PRIMARY:S.SECONDARY)}}setOptions(i){super.setOptions(i),typeof i?.target=="number"&&(this.lastFocusedSide=i.target),this.getLastFocusedEditorPane()?.setOptions(i)}setEditorVisible(i){this.primaryEditorPane?.setVisible(i),this.secondaryEditorPane?.setVisible(i),super.setEditorVisible(i)}clearInput(){super.clearInput(),this.primaryEditorPane?.clearInput(),this.secondaryEditorPane?.clearInput(),this.disposeEditors()}focus(){super.focus(),this.getLastFocusedEditorPane()?.focus()}getLastFocusedEditorPane(){return this.lastFocusedSide===S.SECONDARY?this.secondaryEditorPane:this.primaryEditorPane}layout(i){this.dimension=i,E(this.splitview).layout(this.orientation===s.HORIZONTAL?i.width:i.height)}setBoundarySashes(i){this._boundarySashes=i,this.splitview&&(this.splitview.orthogonalEndSash=i.bottom)}layoutPane(i,e){i?.layout(this.orientation===s.HORIZONTAL?new I(e,this.dimension.height):new I(this.dimension.width,e))}getControl(){return this.getLastFocusedEditorPane()?.getControl()}getPrimaryEditorPane(){return this.primaryEditorPane}getSecondaryEditorPane(){return this.secondaryEditorPane}tracksEditorViewState(i){return i instanceof T}computeEditorViewState(i){if(!this.input||!L(i,this.toEditorViewStateResource(this.input)))return;const e=this.primaryEditorPane?.getViewState(),t=this.secondaryEditorPane?.getViewState();if(!(!e||!t))return{primary:e,secondary:t,focus:this.lastFocusedSide,ratio:this.getSplitViewRatio()}}toEditorViewStateResource(i){let e,t;if(i instanceof T&&(e=i.primary.resource,t=i.secondary.resource),!(!t||!e))return Y.from({scheme:"sideBySide",path:`${w(t.toString())}${w(e.toString())}`})}updateStyles(){super.updateStyles(),this.primaryEditorContainer&&(this.orientation===s.HORIZONTAL?(this.primaryEditorContainer.style.borderLeftWidth="1px",this.primaryEditorContainer.style.borderLeftStyle="solid",this.primaryEditorContainer.style.borderLeftColor=this.getColor($)??"",this.primaryEditorContainer.style.borderTopWidth="0"):(this.primaryEditorContainer.style.borderTopWidth="1px",this.primaryEditorContainer.style.borderTopStyle="solid",this.primaryEditorContainer.style.borderTopColor=this.getColor(k)??"",this.primaryEditorContainer.style.borderLeftWidth="0"))}dispose(){this.disposeEditors(),super.dispose()}disposeEditors(){this.editorDisposables.clear(),this.secondaryEditorPane=void 0,this.primaryEditorPane=void 0,this.lastFocusedSide=void 0,this.secondaryEditorContainer&&P(this.secondaryEditorContainer),this.primaryEditorContainer&&P(this.primaryEditorContainer)}};h=v([m(1,M),m(2,z),m(3,Z),m(4,W),m(5,B),m(6,H),m(7,q),m(8,K)],h);class f{constructor(o,i){this.selection=o;this.side=i}compare(o){return o instanceof f?this.side!==o.side?b.DIFFERENT:this.selection.compare(o.selection):b.DIFFERENT}restore(o){const i={...o,target:this.side};return this.selection.restore(i)}}export{h as SideBySideEditor};