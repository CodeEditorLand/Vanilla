var y=Object.defineProperty;var h=Object.getOwnPropertyDescriptor;var m=(s,e,i,t)=>{for(var o=t>1?void 0:t?h(e,i):e,n=s.length-1,r;n>=0;n--)(r=s[n])&&(o=(t?r(e,i,o):r(o))||o);return t&&o&&y(e,i,o),o},F=(s,e)=>(i,t)=>e(i,t,s);import{NotSupportedError as f}from"../../../../../vs/base/common/errors.js";import{Event as I}from"../../../../../vs/base/common/event.js";import{Disposable as u}from"../../../../../vs/base/common/lifecycle.js";import"../../../../../vs/base/common/uri.js";import{FilePermission as g,FileSystemProviderCapabilities as S,FileSystemProviderErrorCode as c,FileType as v}from"../../../../../vs/platform/files/common/files.js";import{ChangeType as R,decodeEditSessionFileContent as w,EDIT_SESSIONS_SCHEME as C,IEditSessionsStorageService as b}from"../../../../../vs/workbench/contrib/editSessions/common/editSessions.js";let a=class{constructor(e){this.editSessionsStorageService=e}static SCHEMA=C;capabilities=S.Readonly+S.FileReadWrite;async readFile(e){const i=/(?<ref>[^/]+)\/(?<folderName>[^/]+)\/(?<filePath>.*)/.exec(e.path.substring(1));if(!i?.groups)throw c.FileNotFound;const{ref:t,folderName:o,filePath:n}=i.groups,r=await this.editSessionsStorageService.read("editSessions",t);if(!r)throw c.FileNotFound;const p=JSON.parse(r.content),l=p.folders.find(d=>d.name===o)?.workingChanges.find(d=>d.relativeFilePath===n);if(!l||l.type===R.Deletion)throw c.FileNotFound;return w(p.version,l.contents).buffer}async stat(e){const i=await this.readFile(e),t=Date.now();return{type:v.File,permissions:g.Readonly,mtime:t,ctime:t,size:i.byteLength}}onDidChangeCapabilities=I.None;onDidChangeFile=I.None;watch(e,i){return u.None}async mkdir(e){}async readdir(e){return[]}async rename(e,i,t){}async delete(e,i){}async writeFile(){throw new f}};a=m([F(0,b)],a);export{a as EditSessionsFileSystemProvider};
