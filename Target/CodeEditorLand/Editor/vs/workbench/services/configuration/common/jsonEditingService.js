var m=Object.defineProperty;var v=Object.getOwnPropertyDescriptor;var u=(s,e,r,t)=>{for(var o=t>1?void 0:t?v(e,r):e,i=s.length-1,n;i>=0;i--)(n=s[i])&&(o=(t?n(e,r,o):n(o))||o);return t&&o&&m(e,r,o),o},c=(s,e)=>(r,t)=>e(r,t,s);import{Queue as I}from"../../../../../vs/base/common/async.js";import*as E from"../../../../../vs/base/common/json.js";import{setProperty as g}from"../../../../../vs/base/common/jsonEdit.js";import"../../../../../vs/base/common/jsonFormatter.js";import"../../../../../vs/base/common/lifecycle.js";import"../../../../../vs/base/common/uri.js";import{EditOperation as d}from"../../../../../vs/editor/common/core/editOperation.js";import{Range as h}from"../../../../../vs/editor/common/core/range.js";import{Selection as R}from"../../../../../vs/editor/common/core/selection.js";import"../../../../../vs/editor/common/model.js";import{ITextModelService as x}from"../../../../../vs/editor/common/services/resolverService.js";import*as S from"../../../../../vs/nls.js";import{IFileService as T}from"../../../../../vs/platform/files/common/files.js";import{InstantiationType as M,registerSingleton as y}from"../../../../../vs/platform/instantiation/common/extensions.js";import{IJSONEditingService as w,JSONEditingError as P,JSONEditingErrorCode as p}from"../../../../../vs/workbench/services/configuration/common/jsonEditing.js";import{ITextFileService as O}from"../../../../../vs/workbench/services/textfile/common/textfiles.js";let a=class{constructor(e,r,t){this.fileService=e;this.textModelResolverService=r;this.textFileService=t;this.queue=new I}_serviceBrand;queue;write(e,r){return Promise.resolve(this.queue.queue(()=>this.doWriteConfiguration(e,r)))}async doWriteConfiguration(e,r){const t=await this.resolveAndValidate(e,!0);try{await this.writeToBuffer(t.object.textEditorModel,r)}finally{t.dispose()}}async writeToBuffer(e,r){let t=!1;for(const o of r){const i=this.getEdits(e,o)[0];t=!!i&&this.applyEditsToBuffer(i,e)}if(t)return this.textFileService.save(e.uri)}applyEditsToBuffer(e,r){const t=r.getPositionAt(e.offset),o=r.getPositionAt(e.offset+e.length),i=new h(t.lineNumber,t.column,o.lineNumber,o.column),n=r.getValueInRange(i);if(e.content!==n){const l=n?d.replace(i,e.content):d.insert(t,e.content);return r.pushEditOperations([new R(t.lineNumber,t.column,t.lineNumber,t.column)],[l],()=>[]),!0}return!1}getEdits(e,r){const{tabSize:t,insertSpaces:o}=e.getOptions(),i=e.getEOL(),{path:n,value:l}=r;if(!n.length){const f=JSON.stringify(l,null,o?" ".repeat(t):"	");return[{content:f,length:f.length,offset:0}]}return g(e.getValue(),n,l,{tabSize:t,insertSpaces:o,eol:i})}async resolveModelReference(e){return await this.fileService.exists(e)||await this.textFileService.write(e,"{}",{encoding:"utf8"}),this.textModelResolverService.createModelReference(e)}hasParseErrors(e){const r=[];return E.parse(e.getValue(),r,{allowTrailingComma:!0,allowEmptyContent:!0}),r.length>0}async resolveAndValidate(e,r){const t=await this.resolveModelReference(e),o=t.object.textEditorModel;return this.hasParseErrors(o)?(t.dispose(),this.reject(p.ERROR_INVALID_FILE)):t}reject(e){const r=this.toErrorMessage(e);return Promise.reject(new P(r,e))}toErrorMessage(e){switch(e){case p.ERROR_INVALID_FILE:return S.localize("errorInvalidFile","Unable to write into the file. Please open the file to correct errors/warnings in the file and try again.")}}};a=u([c(0,T),c(1,x),c(2,O)],a),y(w,a,M.Delayed);export{a as JSONEditingService};
