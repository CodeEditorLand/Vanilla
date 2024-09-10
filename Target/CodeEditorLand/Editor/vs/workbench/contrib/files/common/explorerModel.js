var I=Object.defineProperty;var y=Object.getOwnPropertyDescriptor;var p=(c,e,r,s)=>{for(var t=s>1?void 0:s?y(e,r):e,i=c.length-1,o;i>=0;i--)(o=c[i])&&(t=(s?o(e,r,t):o(t))||t);return s&&t&&I(e,r,t),t};import{URI as C}from"../../../../base/common/uri.js";import{isEqual as _}from"../../../../base/common/extpath.js";import{posix as u}from"../../../../base/common/path.js";import{ResourceMap as S}from"../../../../base/common/map.js";import{FileSystemProviderCapabilities as g}from"../../../../platform/files/common/files.js";import{rtrim as v,startsWithIgnoreCase as E,equalsIgnoreCase as x}from"../../../../base/common/strings.js";import{coalesce as b}from"../../../../base/common/arrays.js";import{dispose as D}from"../../../../base/common/lifecycle.js";import{memoize as R}from"../../../../base/common/decorators.js";import{Emitter as N}from"../../../../base/common/event.js";import{joinPath as F,isEqualOrParent as P,basenameOrAuthority as L}from"../../../../base/common/resources.js";import{SortOrder as w}from"./files.js";import{ExplorerFileNestingTrie as k}from"./explorerFileNestingTrie.js";import{assertIsDefined as A}from"../../../../base/common/types.js";class ue{constructor(e,r,s,t,i){this.contextService=e;this.uriIdentityService=r;const o=()=>this._roots=this.contextService.getWorkspace().folders.map(n=>new d(n.uri,s,t,i,void 0,!0,!1,!1,!1,n.name));o(),this._listener=this.contextService.onDidChangeWorkspaceFolders(()=>{o(),this._onDidChangeRoots.fire()})}_roots;_listener;_onDidChangeRoots=new N;get roots(){return this._roots}get onDidChangeRoots(){return this._onDidChangeRoots.event}findAll(e){return b(this.roots.map(r=>r.find(e)))}findClosest(e){const r=this.contextService.getWorkspaceFolder(e);if(r){const s=this.roots.find(t=>this.uriIdentityService.extUri.isEqual(t.resource,r.uri));if(s)return s.find(e)}return null}dispose(){D(this._listener)}}const a=class{constructor(e,r,s,t,i,o,n,l,h,m=L(e),f,W=!1){this.resource=e;this.fileService=r;this.configService=s;this.filesConfigService=t;this._parent=i;this._isDirectory=o;this._isSymbolicLink=n;this._readonly=l;this._locked=h;this._name=m;this._mtime=f;this._unknown=W;this._isDirectoryResolved=!1}_isDirectoryResolved;error=void 0;_isExcluded=!1;nestedParent;nestedChildren;get isExcluded(){return this._isExcluded?!0:this._parent?this._parent.isExcluded:!1}set isExcluded(e){this._isExcluded=e}hasChildren(e){return this.hasNests?this.nestedChildren?.some(r=>e(r))??!1:this.isDirectory}get hasNests(){return!!this.nestedChildren?.length}get isDirectoryResolved(){return this._isDirectoryResolved}get isSymbolicLink(){return!!this._isSymbolicLink}get isDirectory(){return!!this._isDirectory}get isReadonly(){return this.filesConfigService.isReadonly(this.resource,{resource:this.resource,name:this.name,readonly:this._readonly,locked:this._locked})}get mtime(){return this._mtime}get name(){return this._name}get isUnknown(){return this._unknown}get parent(){return this._parent}get root(){return this._parent?this._parent.root:this}get children(){return new Map}updateName(e){this._parent?.removeChild(this),this._name=e,this._parent?.addChild(this)}getId(){return this.root.resource.toString()+"::"+this.resource.toString()}toString(){return`ExplorerItem: ${this.name}`}get isRoot(){return this===this.root}static create(e,r,s,t,i,o){const n=new a(t.resource,e,r,s,i,t.isDirectory,t.isSymbolicLink,t.readonly,t.locked,t.name,t.mtime,!t.isFile&&!t.isDirectory);if(n.isDirectory&&(n._isDirectoryResolved=!!t.children||!!o&&o.some(l=>P(l,n.resource)),t.children))for(let l=0,h=t.children.length;l<h;l++){const m=a.create(e,r,s,t.children[l],n,o);n.addChild(m)}return n}static mergeLocalWithDisk(e,r){if(e.resource.toString()!==r.resource.toString())return;const s=e.isDirectory||r.isDirectory;if(!(s&&r._isDirectoryResolved&&!e._isDirectoryResolved)&&(r.resource=e.resource,r.isRoot||r.updateName(e.name),r._isDirectory=e.isDirectory,r._mtime=e.mtime,r._isDirectoryResolved=e._isDirectoryResolved,r._isSymbolicLink=e.isSymbolicLink,r.error=e.error,s&&e._isDirectoryResolved)){const t=new S;r.children.forEach(i=>{t.set(i.resource,i)}),r.children.clear(),e.children.forEach(i=>{const o=t.get(i.resource);o?(a.mergeLocalWithDisk(i,o),r.addChild(o),t.delete(i.resource)):r.addChild(i)}),t.forEach(i=>{i instanceof U&&r.addChild(i)})}}addChild(e){e._parent=this,e.updateResource(!1),this.children.set(this.getPlatformAwareName(e.name),e)}getChild(e){return this.children.get(this.getPlatformAwareName(e))}fetchChildren(e){const r=this.configService.getValue({resource:this.root.resource}).explorer.fileNesting;return r.enabled&&this.nestedChildren?this.nestedChildren:(async()=>{if(!this._isDirectoryResolved){const t=e===w.Modified;this.error=void 0;try{const i=await this.fileService.resolve(this.resource,{resolveSingleChildDescendants:!0,resolveMetadata:t}),o=a.create(this.fileService,this.configService,this.filesConfigService,i,this);a.mergeLocalWithDisk(o,this)}catch(i){throw this.error=i,i}this._isDirectoryResolved=!0}const s=[];if(r.enabled){const t=[],i=[];for(const n of this.children.entries())n[1].nestedParent=void 0,n[1].isDirectory?i.push(n):t.push(n);const o=this.fileNester.nest(t.map(([n])=>n),this.getPlatformAwareName(this.name));for(const[n,l]of t){const h=o.get(n);if(h!==void 0){l.nestedChildren=[];for(const m of h.keys()){const f=A(this.children.get(m));l.nestedChildren.push(f),f.nestedParent=l}s.push(l)}else l.nestedChildren=void 0}for(const[n,l]of i.values())s.push(l)}else this.children.forEach(t=>{s.push(t)});return s})()}_fileNester;get fileNester(){if(!this.root._fileNester){const e=this.configService.getValue({resource:this.root.resource}).explorer.fileNesting,r=Object.entries(e.patterns).filter(s=>typeof s[0]=="string"&&typeof s[1]=="string"&&s[0]&&s[1]).map(([s,t])=>[this.getPlatformAwareName(s.trim()),t.split(",").map(i=>this.getPlatformAwareName(i.trim().replace(/\u200b/g,"").trim())).filter(i=>i!=="")]);this.root._fileNester=new k(r)}return this.root._fileNester}removeChild(e){this.nestedChildren=void 0,this.children.delete(this.getPlatformAwareName(e.name))}forgetChildren(){this.children.clear(),this.nestedChildren=void 0,this._isDirectoryResolved=!1,this._fileNester=void 0}getPlatformAwareName(e){return this.fileService.hasCapability(this.resource,g.PathCaseSensitive)?e:e.toLowerCase()}move(e){this.nestedParent?.removeChild(this),this._parent?.removeChild(this),e.removeChild(this),e.addChild(this),this.updateResource(!0)}updateResource(e){this._parent&&(this.resource=F(this._parent.resource,this.name)),e&&this.isDirectory&&this.children.forEach(r=>{r.updateResource(!0)})}rename(e){this.updateName(e.name),this._mtime=e.mtime,this.updateResource(!0)}find(e){const r=!this.fileService.hasCapability(e,g.PathCaseSensitive);return e&&this.resource.scheme===e.scheme&&x(this.resource.authority,e.authority)&&(r?E(e.path,this.resource.path):e.path.startsWith(this.resource.path))?this.findByPath(v(e.path,u.sep),this.resource.path.length,r):null}findByPath(e,r,s){if(_(v(this.resource.path,u.sep),e,s))return this;if(this.isDirectory){for(;r<e.length&&e[r]===u.sep;)r++;let t=e.indexOf(u.sep,r);t===-1&&(t=e.length);const i=e.substring(r,t),o=this.children.get(this.getPlatformAwareName(i));if(o)return o.findByPath(e,t,s)}return null}};let d=a;p([R],d.prototype,"children",1);class U extends d{constructor(e,r,s,t,i){super(C.file(""),e,r,s,t,i),this._isDirectoryResolved=!0}}export{d as ExplorerItem,ue as ExplorerModel,U as NewExplorerItem};
