var y=Object.defineProperty;var v=Object.getOwnPropertyDescriptor;var l=(a,i,t,e)=>{for(var r=e>1?void 0:e?v(i,t):i,n=a.length-1,s;n>=0;n--)(s=a[n])&&(r=(e?s(i,t,r):s(r))||r);return e&&r&&y(i,t,r),r},o=(a,i)=>(t,e)=>i(t,e,a);import{VSBuffer as d}from"../../../../../vs/base/common/buffer.js";import"../../../../../vs/base/common/collections.js";import{ResourceSet as P}from"../../../../../vs/base/common/map.js";import"../../../../../vs/base/common/uri.js";import{localize as S}from"../../../../../vs/nls.js";import{FileOperationError as g,FileOperationResult as U,IFileService as m}from"../../../../../vs/platform/files/common/files.js";import{IInstantiationService as x}from"../../../../../vs/platform/instantiation/common/instantiation.js";import{IUriIdentityService as I}from"../../../../../vs/platform/uriIdentity/common/uriIdentity.js";import{ProfileResourceType as D}from"../../../../../vs/platform/userDataProfile/common/userDataProfile.js";import{API_OPEN_EDITOR_COMMAND_ID as C}from"../../../../../vs/workbench/browser/parts/editor/editorCommands.js";import{TreeItemCollapsibleState as u}from"../../../../../vs/workbench/common/views.js";import{IUserDataProfileService as b}from"../../../../../vs/workbench/services/userDataProfile/common/userDataProfile.js";let p=class{constructor(i,t,e){this.userDataProfileService=i;this.fileService=t;this.uriIdentityService=e}async initialize(i){const t=JSON.parse(i);for(const e in t.snippets){const r=this.uriIdentityService.extUri.joinPath(this.userDataProfileService.currentProfile.snippetsHome,e);await this.fileService.writeFile(r,d.fromString(t.snippets[e]))}}};p=l([o(0,b),o(1,m),o(2,I)],p);let c=class{constructor(i,t){this.fileService=i;this.uriIdentityService=t}async getContent(i,t){const e=await this.getSnippets(i,t);return JSON.stringify({snippets:e})}async apply(i,t){const e=JSON.parse(i);for(const r in e.snippets){const n=this.uriIdentityService.extUri.joinPath(t.snippetsHome,r);await this.fileService.writeFile(n,d.fromString(e.snippets[r]))}}async getSnippets(i,t){const e={},r=await this.getSnippetsResources(i,t);for(const n of r){const s=this.uriIdentityService.extUri.relativePath(i.snippetsHome,n),h=await this.fileService.readFile(n);e[s]=h.value.toString()}return e}async getSnippetsResources(i,t){const e=[];let r;try{r=await this.fileService.resolve(i.snippetsHome)}catch(n){if(n instanceof g&&n.fileOperationResult===U.FILE_NOT_FOUND)return e;throw n}for(const{resource:n}of r.children||[]){if(t?.has(n))continue;const s=this.uriIdentityService.extUri.extname(n);(s===".json"||s===".code-snippets")&&e.push(n)}return e}};c=l([o(0,m),o(1,I)],c);let f=class{constructor(i,t,e){this.profile=i;this.instantiationService=t;this.uriIdentityService=e}type=D.Snippets;handle=this.profile.snippetsHome.toString();label={label:S("snippets","Snippets")};collapsibleState=u.Collapsed;checkbox;excludedSnippets=new P;async getChildren(){const i=await this.instantiationService.createInstance(c).getSnippetsResources(this.profile),t=this;return i.map(e=>({handle:e.toString(),parent:t,resourceUri:e,collapsibleState:u.None,accessibilityInformation:{label:this.uriIdentityService.extUri.basename(e)},checkbox:t.checkbox?{get isChecked(){return!t.excludedSnippets.has(e)},set isChecked(r){r?t.excludedSnippets.delete(e):t.excludedSnippets.add(e)},accessibilityInformation:{label:S("exclude","Select Snippet {0}",this.uriIdentityService.extUri.basename(e))}}:void 0,command:{id:C,title:"",arguments:[e,void 0,void 0]}}))}async hasContent(){return(await this.instantiationService.createInstance(c).getSnippetsResources(this.profile)).length>0}async getContent(){return this.instantiationService.createInstance(c).getContent(this.profile,this.excludedSnippets)}isFromDefaultProfile(){return!this.profile.isDefault&&!!this.profile.useDefaultFlags?.snippets}};f=l([o(1,x),o(2,I)],f);export{c as SnippetsResource,p as SnippetsResourceInitializer,f as SnippetsResourceTreeItem};
