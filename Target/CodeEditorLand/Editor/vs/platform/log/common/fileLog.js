var f=Object.defineProperty;var h=Object.getOwnPropertyDescriptor;var c=(s,o,e,i)=>{for(var r=i>1?void 0:i?h(o,e):o,t=s.length-1,l;t>=0;t--)(l=s[t])&&(r=(i?l(o,e,r):l(r))||r);return i&&r&&f(o,e,r),r},g=(s,o)=>(e,i)=>o(e,i,s);import{ThrottledDelayer as p}from"../../../base/common/async.js";import{VSBuffer as u}from"../../../base/common/buffer.js";import{basename as v,dirname as m,joinPath as d}from"../../../base/common/resources.js";import{ByteSize as L,FileOperationResult as I,IFileService as S,whenProviderRegistered as b}from"../../files/common/files.js";import{BufferLogger as y}from"./bufferLog.js";import{AbstractLoggerService as w,AbstractMessageLogger as F,LogLevel as n}from"./log.js";const $=5*L.MB;let a=class extends F{constructor(e,i,r,t){super();this.resource=e;this.donotUseFormatters=r;this.fileService=t;this.setLevel(i),this.flushDelayer=new p(100),this.initializePromise=this.initialize()}initializePromise;flushDelayer;backupIndex=1;buffer="";async flush(){if(!this.buffer)return;await this.initializePromise;let e=await this.loadContent();e.length>$&&(await this.fileService.writeFile(this.getBackupResource(),u.fromString(e)),e=""),this.buffer&&(e+=this.buffer,this.buffer="",await this.fileService.writeFile(this.resource,u.fromString(e)))}async initialize(){try{await this.fileService.createFile(this.resource)}catch(e){if(e.fileOperationResult!==I.FILE_MODIFIED_SINCE)throw e}}log(e,i){this.donotUseFormatters?this.buffer+=i:this.buffer+=`${this.getCurrentTimestamp()} [${this.stringifyLogLevel(e)}] ${i}
`,this.flushDelayer.trigger(()=>this.flush())}getCurrentTimestamp(){const e=t=>t<10?`0${t}`:t,i=t=>t<10?`00${t}`:t<100?`0${t}`:t,r=new Date;return`${r.getFullYear()}-${e(r.getMonth()+1)}-${e(r.getDate())} ${e(r.getHours())}:${e(r.getMinutes())}:${e(r.getSeconds())}.${i(r.getMilliseconds())}`}getBackupResource(){return this.backupIndex=this.backupIndex>5?1:this.backupIndex,d(m(this.resource),`${v(this.resource)}_${this.backupIndex++}`)}async loadContent(){try{return(await this.fileService.readFile(this.resource)).value.toString()}catch{return""}}stringifyLogLevel(e){switch(e){case n.Debug:return"debug";case n.Error:return"error";case n.Info:return"info";case n.Trace:return"trace";case n.Warning:return"warning"}return""}};a=c([g(3,S)],a);class _ extends w{constructor(e,i,r){super(e,i);this.fileService=r}doCreateLogger(e,i,r){const t=new y(i);return b(e,this.fileService).then(()=>t.logger=new a(e,t.getLevel(),!!r?.donotUseFormatters,this.fileService)),t}}export{_ as FileLoggerService};
