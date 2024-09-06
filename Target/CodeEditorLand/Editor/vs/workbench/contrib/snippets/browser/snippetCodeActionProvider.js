var C=Object.defineProperty;var A=Object.getOwnPropertyDescriptor;var u=(s,t,e,i)=>{for(var o=i>1?void 0:i?A(t,e):t,n=s.length-1,r;n>=0;n--)(r=s[n])&&(o=(i?r(t,e,o):r(o))||o);return i&&o&&C(t,e,o),o},p=(s,t)=>(e,i)=>t(e,i,s);import{DisposableStore as f}from"../../../../base/common/lifecycle.js";import"../../../../editor/common/core/range.js";import{Selection as _}from"../../../../editor/common/core/selection.js";import"../../../../editor/common/languages.js";import"../../../../editor/common/model.js";import{ILanguageFeaturesService as h}from"../../../../editor/common/services/languageFeatures.js";import{CodeActionKind as c}from"../../../../editor/contrib/codeAction/common/types.js";import{localize as l}from"../../../../nls.js";import{IConfigurationService as y}from"../../../../platform/configuration/common/configuration.js";import{IInstantiationService as k}from"../../../../platform/instantiation/common/instantiation.js";import"../../../common/contributions.js";import{ApplyFileSnippetAction as w}from"./commands/fileTemplateSnippets.js";import{getSurroundableSnippets as b,SurroundWithSnippetEditorAction as I}from"./commands/surroundWithSnippet.js";import{ISnippetsService as S}from"./snippets.js";import"./snippetsFile.js";let a=class{constructor(t){this._snippetService=t}static _MAX_CODE_ACTIONS=4;static _overflowCommandCodeAction={kind:c.SurroundWith.value,title:l("more","More..."),command:{id:I.options.id,title:I.options.title.value}};async provideCodeActions(t,e){if(e.isEmpty())return;const i=_.isISelection(e)?e.getPosition():e.getStartPosition(),o=await b(this._snippetService,t,i,!1);if(!o.length)return;const n=[];for(const r of o){if(n.length>=a._MAX_CODE_ACTIONS){n.push(a._overflowCommandCodeAction);break}n.push({title:l("codeAction","{0}",r.name),kind:c.SurroundWith.value,edit:v(t,e,r)})}return{actions:n,dispose(){}}}};a=u([p(0,S)],a);let d=class{constructor(t){this._snippetService=t}static _MAX_CODE_ACTIONS=4;static _overflowCommandCodeAction={title:l("overflow.start.title","Start with Snippet"),kind:c.SurroundWith.value,command:{id:w.Id,title:""}};providedCodeActionKinds=[c.SurroundWith.value];async provideCodeActions(t){if(t.getValueLength()!==0)return;const e=await this._snippetService.getSnippets(t.getLanguageId(),{fileTemplateSnippets:!0,includeNoPrefixSnippets:!0}),i=[];for(const o of e){if(i.length>=d._MAX_CODE_ACTIONS){i.push(d._overflowCommandCodeAction);break}i.push({title:l("title","Start with: {0}",o.name),kind:c.SurroundWith.value,edit:v(t,t.getFullModelRange(),o)})}return{actions:i,dispose(){}}}};d=u([p(0,S)],d);function v(s,t,e){return{edits:[{versionId:s.getVersionId(),resource:s.uri,textEdit:{range:t,text:e.body,insertAsSnippet:!0}}]}}let m=class{_store=new f;constructor(t,e,i){const o="editor.snippets.codeActions.enabled",n=new f,r=()=>{n.clear(),i.getValue(o)&&(n.add(e.codeActionProvider.register("*",t.createInstance(a))),n.add(e.codeActionProvider.register("*",t.createInstance(d))))};r(),this._store.add(i.onDidChangeConfiguration(g=>g.affectsConfiguration(o)&&r())),this._store.add(n)}dispose(){this._store.dispose()}};m=u([p(0,k),p(1,h),p(2,y)],m);export{m as SnippetCodeActions};
