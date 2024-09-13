var g=Object.defineProperty;var v=Object.getOwnPropertyDescriptor;var p=(r,i,t,e)=>{for(var o=e>1?void 0:e?v(i,t):i,s=r.length-1,n;s>=0;s--)(n=r[s])&&(o=(e?n(i,t,o):n(o))||o);return e&&o&&g(i,t,o),o},a=(r,i)=>(t,e)=>i(t,e,r);import{VSBuffer as l}from"../../../../base/common/buffer.js";import{Event as h}from"../../../../base/common/event.js";import{parse as y}from"../../../../base/common/json.js";import{assertIsDefined as O}from"../../../../base/common/types.js";import{FileSystemProviderCapabilities as T,FileType as P,IFileService as b}from"../../../../platform/files/common/files.js";import{IInstantiationService as D}from"../../../../platform/instantiation/common/instantiation.js";import{IStorageService as R,StorageScope as m,StorageTarget as f}from"../../../../platform/storage/common/storage.js";import{TRUSTED_DOMAINS_CONTENT_STORAGE_KEY as d,TRUSTED_DOMAINS_STORAGE_KEY as C,readTrustedDomains as E}from"./trustedDomains.js";const F="trustedDomains",_={type:P.File,ctime:Date.now(),mtime:Date.now(),size:0},u=`// Links matching one or more entries in the list below can be opened without link protection.
// The following examples show what entries can look like:
// - "https://microsoft.com": Matches this specific domain using https
// - "https://microsoft.com:8080": Matches this specific domain on this port using https
// - "https://microsoft.com:*": Matches this specific domain on any port using https
// - "https://microsoft.com/foo": Matches https://microsoft.com/foo and https://microsoft.com/foo/bar,
//   but not https://microsoft.com/foobar or https://microsoft.com/bar
// - "https://*.microsoft.com": Match all domains ending in "microsoft.com" using https
// - "microsoft.com": Match this specific domain using either http or https
// - "*.microsoft.com": Match all domains ending in "microsoft.com" using either http or https
// - "http://192.168.0.1: Matches this specific IP using http
// - "http://192.168.0.*: Matches all IP's with this prefix using http
// - "*": Match all domains using either http or https
//
`,I=`//
// You can use the "Manage Trusted Domains" command to open this file.
// Save this file to apply the trusted domains rules.
`,A=`[
	// "https://microsoft.com"
]`;function U(r,i,t){let e=u;return r.length>0?(e+=`// By default, VS Code trusts "localhost" as well as the following domains:
`,r.forEach(o=>{e+=`// - "${o}"
`})):e+=`// By default, VS Code trusts "localhost".
`,e+=I,e+=t?`
// Currently configuring trust for ${t}
`:"",i.length===0?e+=A:e+=JSON.stringify(i,null,2),e}let c=class{constructor(i,t,e){this.fileService=i;this.storageService=t;this.instantiationService=e;this.fileService.registerProvider(F,this)}static ID="workbench.contrib.trustedDomainsFileSystemProvider";capabilities=T.FileReadWrite;onDidChangeCapabilities=h.None;onDidChangeFile=h.None;stat(i){return Promise.resolve(_)}async readFile(i){let t=this.storageService.get(d,m.APPLICATION);const e=i.fragment,{defaultTrustedDomains:o,trustedDomains:s}=await this.instantiationService.invokeFunction(E);return(!t||t.indexOf(u)===-1||t.indexOf(I)===-1||t.indexOf(e??"")===-1||[...o,...s].some(S=>!O(t).includes(S)))&&(t=U(o,s,e)),l.fromString(t).buffer}writeFile(i,t,e){try{const o=l.wrap(t).toString(),s=y(o);this.storageService.store(d,o,m.APPLICATION,f.USER),this.storageService.store(C,JSON.stringify(s)||"",m.APPLICATION,f.USER)}catch{}return Promise.resolve()}watch(i,t){return{dispose(){}}}mkdir(i){return Promise.resolve(void 0)}readdir(i){return Promise.resolve(void 0)}delete(i,t){return Promise.resolve(void 0)}rename(i,t,e){return Promise.resolve(void 0)}};c=p([a(0,b),a(1,R),a(2,D)],c);export{c as TrustedDomainsFileSystemProvider};
