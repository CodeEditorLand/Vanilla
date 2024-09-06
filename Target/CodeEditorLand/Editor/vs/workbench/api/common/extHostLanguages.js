import{disposableTimeout as v}from"../../../base/common/async.js";import{DisposableStore as h}from"../../../base/common/lifecycle.js";import l from"../../../base/common/severity.js";import"../../../base/common/uriIpc.js";import"../../../platform/extensions/common/extensions.js";import{checkProposedApiEnabled as y}from"../../services/extensions/common/extensions.js";import{MainContext as I}from"./extHost.protocol.js";import"./extHostCommands.js";import"./extHostDocuments.js";import*as d from"./extHostTypeConverters.js";import{LanguageStatusSeverity as p,Range as x,StandardTokenType as b}from"./extHostTypes.js";class Y{constructor(t,r,i,m){this._documents=r;this._commands=i;this._uriTransformer=m;this._proxy=t.getProxy(I.MainThreadLanguages)}_proxy;_languageIds=[];$acceptLanguageIds(t){this._languageIds=t}async getLanguages(){return this._languageIds.slice(0)}async changeLanguage(t,r){await this._proxy.$changeLanguage(t,r);const i=this._documents.getDocumentData(t);if(!i)throw new Error(`document '${t.toString()}' NOT found`);return i.document}async tokenAtPosition(t,r){const i=t.version,m=d.Position.from(r),c=await this._proxy.$tokensAtPosition(t.uri,m),s={type:b.Other,range:t.getWordRangeAtPosition(r)??new x(r.line,r.character,r.line,r.character)};if(!c)return s;const o={range:d.Range.to(c.range),type:d.TokenType.to(c.type)};return!o.range.contains(r)||i!==t.version?s:o}_handlePool=0;_ids=new Set;createLanguageStatusItem(t,r,i){const m=this._handlePool++,c=this._proxy,s=this._ids,o=`${t.identifier.value}/${r}`;if(s.has(o))throw new Error(`LanguageStatusItem with id '${r}' ALREADY exists`);s.add(o);const e={selector:i,id:r,name:t.displayName??t.name,severity:p.Information,command:void 0,text:"",detail:"",busy:!1};let u;const g=new h,n=()=>{if(u?.dispose(),!s.has(o)){console.warn(`LanguageStatusItem (${r}) from ${t.identifier.value} has been disposed and CANNOT be updated anymore`);return}u=v(()=>{g.clear(),this._proxy.$setLanguageStatus(m,{id:o,name:e.name??t.displayName??t.name,source:t.displayName??t.name,selector:d.DocumentSelector.from(e.selector,this._uriTransformer),label:e.text,detail:e.detail??"",severity:e.severity===p.Error?l.Error:e.severity===p.Warning?l.Warning:l.Info,command:e.command&&this._commands.toInternal(e.command,g),accessibilityInfo:e.accessibilityInformation,busy:e.busy})},0)},f={dispose(){g.dispose(),u?.dispose(),c.$removeLanguageStatus(m),s.delete(o)},get id(){return e.id},get name(){return e.name},set name(a){e.name=a,n()},get selector(){return e.selector},set selector(a){e.selector=a,n()},get text(){return e.text},set text(a){e.text=a,n()},set text2(a){y(t,"languageStatusText"),e.text=a,n()},get text2(){return y(t,"languageStatusText"),e.text},get detail(){return e.detail},set detail(a){e.detail=a,n()},get severity(){return e.severity},set severity(a){e.severity=a,n()},get accessibilityInformation(){return e.accessibilityInformation},set accessibilityInformation(a){e.accessibilityInformation=a,n()},get command(){return e.command},set command(a){e.command=a,n()},get busy(){return e.busy},set busy(a){e.busy=a,n()}};return n(),f}}export{Y as ExtHostLanguages};
