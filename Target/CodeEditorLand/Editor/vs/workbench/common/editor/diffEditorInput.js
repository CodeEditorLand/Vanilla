var b=Object.defineProperty;var T=Object.getOwnPropertyDescriptor;var g=(f,o,e,i)=>{for(var r=i>1?void 0:i?T(o,e):o,n=f.length-1,d;n>=0;n--)(d=f[n])&&(r=(i?d(o,e,r):d(r))||r);return i&&r&&b(o,e,r),r},h=(f,o)=>(e,i)=>o(e,i,f);import{localize as y}from"../../../nls.js";import{AbstractSideBySideEditorInputSerializer as v,SideBySideEditorInput as O}from"./sideBySideEditorInput.js";import{TEXT_DIFF_EDITOR_ID as S,BINARY_DIFF_EDITOR_ID as N,Verbosity as t,isResourceDiffEditorInput as L,EditorInputCapabilities as R}from"../editor.js";import{BaseTextEditorModel as I}from"./textEditorModel.js";import{DiffEditorModel as U}from"./diffEditorModel.js";import{TextDiffEditorModel as B}from"./textDiffEditorModel.js";import{IEditorService as $}from"../../services/editor/common/editorService.js";import{shorten as w}from"../../../base/common/labels.js";import{isResolvedEditorModel as D}from"../../../platform/editor/common/editor.js";let s=class extends O{constructor(e,i,r,n,d,p){super(e,i,r,n,p);this.original=r;this.modified=n;this.forceOpenAsBinary=d}static ID="workbench.editors.diffEditorInput";get typeId(){return s.ID}get editorId(){return this.modified.editorId===this.original.editorId?this.modified.editorId:void 0}get capabilities(){let e=super.capabilities;return this.labels.forceDescription&&(e|=R.ForceDescription),e}cachedModel=void 0;labels=this.computeLabels();computeLabels(){let e,i=!1;if(this.preferredName)e=this.preferredName;else{const a=this.original.getName(),l=this.modified.getName();e=y("sideBySideLabels","{0} \u2194 {1}",a,l),i=a===l}let r,n,d;if(this.preferredDescription)r=this.preferredDescription,n=this.preferredDescription,d=this.preferredDescription;else{r=this.computeLabel(this.original.getDescription(t.SHORT),this.modified.getDescription(t.SHORT)),d=this.computeLabel(this.original.getDescription(t.LONG),this.modified.getDescription(t.LONG));const a=this.original.getDescription(t.MEDIUM),l=this.modified.getDescription(t.MEDIUM);if(typeof a=="string"&&typeof l=="string"&&(a||l)){const[E,M]=w([a,l]);n=this.computeLabel(E,M)}}let p=this.computeLabel(this.original.getTitle(t.SHORT)??this.original.getName(),this.modified.getTitle(t.SHORT)??this.modified.getName()," \u2194 "),u=this.computeLabel(this.original.getTitle(t.MEDIUM)??this.original.getName(),this.modified.getTitle(t.MEDIUM)??this.modified.getName()," \u2194 "),m=this.computeLabel(this.original.getTitle(t.LONG)??this.original.getName(),this.modified.getTitle(t.LONG)??this.modified.getName()," \u2194 ");const c=this.getPreferredTitle();return c&&(p=`${c} (${p})`,u=`${c} (${u})`,m=`${c} (${m})`),{name:e,shortDescription:r,mediumDescription:n,longDescription:d,forceDescription:i,shortTitle:p,mediumTitle:u,longTitle:m}}computeLabel(e,i,r=" - "){if(!(!e||!i))return e===i?i:`${e}${r}${i}`}getName(){return this.labels.name}getDescription(e=t.MEDIUM){switch(e){case t.SHORT:return this.labels.shortDescription;case t.LONG:return this.labels.longDescription;case t.MEDIUM:default:return this.labels.mediumDescription}}getTitle(e){switch(e){case t.SHORT:return this.labels.shortTitle;case t.LONG:return this.labels.longTitle;default:case t.MEDIUM:return this.labels.mediumTitle}}async resolve(){const e=await this.createModel();return this.cachedModel?.dispose(),this.cachedModel=e,this.cachedModel}prefersEditorPane(e){return this.forceOpenAsBinary?e.find(i=>i.typeId===N):e.find(i=>i.typeId===S)}async createModel(){const[e,i]=await Promise.all([this.original.resolve(),this.modified.resolve()]);return i instanceof I&&e instanceof I?new B(e,i):new U(D(e)?e:void 0,D(i)?i:void 0)}toUntyped(e){const i=super.toUntyped(e);if(i)return{...i,modified:i.primary,original:i.secondary}}matches(e){return this===e?!0:e instanceof s?this.modified.matches(e.modified)&&this.original.matches(e.original)&&e.forceOpenAsBinary===this.forceOpenAsBinary:L(e)?this.modified.matches(e.modified)&&this.original.matches(e.original):!1}dispose(){this.cachedModel&&(this.cachedModel.dispose(),this.cachedModel=void 0),super.dispose()}};s=g([h(5,$)],s);class re extends v{createEditorInput(o,e,i,r,n){return o.createInstance(s,e,i,r,n,void 0)}}export{s as DiffEditorInput,re as DiffEditorInputSerializer};
