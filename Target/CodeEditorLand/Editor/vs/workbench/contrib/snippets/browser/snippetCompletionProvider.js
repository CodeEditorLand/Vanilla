var E=Object.defineProperty;var z=Object.getOwnPropertyDescriptor;var v=(l,e,t,n)=>{for(var o=n>1?void 0:n?z(e,t):e,r=l.length-1,s;r>=0;r--)(s=l[r])&&(o=(n?s(e,t,o):s(o))||o);return n&&o&&E(e,t,o),o},d=(l,e)=>(t,n)=>e(t,n,l);import{isPatternInWord as K}from"../../../../base/common/filters.js";import{MarkdownString as j}from"../../../../base/common/htmlContent.js";import{StopWatch as B}from"../../../../base/common/stopwatch.js";import{compare as U,compareSubstring as O}from"../../../../base/common/strings.js";import{Position as $}from"../../../../editor/common/core/position.js";import{Range as y}from"../../../../editor/common/core/range.js";import{CompletionItemInsertTextRule as D,CompletionItemKind as H,CompletionTriggerKind as q}from"../../../../editor/common/languages.js";import{ILanguageService as F}from"../../../../editor/common/languages/language.js";import{ILanguageConfigurationService as G}from"../../../../editor/common/languages/languageConfigurationRegistry.js";import{SnippetParser as J}from"../../../../editor/contrib/snippet/browser/snippetParser.js";import{localize as x}from"../../../../nls.js";import{CommandsRegistry as Q}from"../../../../platform/commands/common/commands.js";import{ISnippetsService as T}from"./snippets.js";import{Snippet as V,SnippetSource as X}from"./snippetsFile.js";const R="_snippet.markAsUsed";Q.registerCommand(R,(l,...e)=>{const t=l.get(T),[n]=e;n instanceof V&&t.updateUsageTimestamp(n)});class f{constructor(e,t){this.snippet=e;this.label={label:e.prefix,description:e.name},this.detail=x("detail.snippet","{0} ({1})",e.description||e.name,e.source),this.insertText=e.codeSnippet,this.extensionId=e.extensionId,this.range=t,this.sortText=`${e.snippetSource===X.Extension?"z":"a"}-${e.prefix}`,this.kind=H.Snippet,this.insertTextRules=D.InsertAsSnippet,this.command={id:R,title:"",arguments:[e]}}label;detail;insertText;documentation;range;sortText;kind;insertTextRules;extensionId;command;resolve(){return this.documentation=new j().appendCodeblock("",J.asInsertText(this.snippet.codeSnippet)),this}static compareByLabel(e,t){return U(e.label.label,t.label.label)}}let C=class{constructor(e,t,n){this._languageService=e;this._snippets=t;this._languageConfigurationService=n}_debugDisplayName="snippetCompletions";async provideCompletionItems(e,t,n){const o=new B,r=t.lineNumber,s=e.getWordAtPosition(t)??{startColumn:t.column,endColumn:t.column,word:""},a=e.getLineContent(t.lineNumber).toLowerCase(),_=a.substring(0,s.startColumn+s.word.length-1),A=this._computeSnippetPositions(e,r,s,_),m=t.column-1,b=n.triggerCharacter?.toLowerCase()??"",S=this._getLanguageIdAtPosition(e,t),W=this._languageConfigurationService.getLanguageConfiguration(S),I=new Set(await this._snippets.getSnippets(S)),g=[];for(const i of I){if(n.triggerKind===q.TriggerCharacter&&!i.prefixLow.startsWith(b))continue;let p;for(const u of A)if(!(u.prefixLow.match(/^\s/)&&!i.prefixLow.match(/^\s/))&&K(u.prefixLow,0,u.prefixLow.length,i.prefixLow,0,i.prefixLow.length)){p=u;break}if(!p)continue;const c=p.startColumn-1,L=i.prefixLow.length-(m-c),k=O(a,i.prefixLow,m,m+L,m-c),N=t.with(void 0,c+1);let w=k===0?t.column+L:t.column;m<a.length&&W.getAutoClosingPairs().autoClosingPairsCloseSingleChar.get(a[m])?.some(h=>h.open===a[N.column-1]&&i.prefix.startsWith(h.open)&&i.prefix[i.prefix.length-1]===h.close)&&w++;const P=y.fromPositions({lineNumber:r,column:p.startColumn},{lineNumber:r,column:w}),M=P.setEndPosition(r,t.column);g.push(new f(i,{replace:P,insert:M})),I.delete(i)}if(!b&&(/\s/.test(a[t.column-2])||!a))for(const i of I){const p=y.fromPositions(t),c=a.indexOf(i.prefixLow,m)===m?p.setEndPosition(t.lineNumber,t.column+i.prefixLow.length):p;g.push(new f(i,{replace:c,insert:p}))}return this._disambiguateSnippets(g),{suggestions:g,duration:o.elapsed()}}_disambiguateSnippets(e){e.sort(f.compareByLabel);for(let t=0;t<e.length;t++){const n=e[t];let o=t+1;for(;o<e.length&&n.label===e[o].label;o++)e[o].label.label=x("snippetSuggest.longLabel","{0}, {1}",e[o].label.label,e[o].snippet.name);o>t+1&&(e[t].label.label=x("snippetSuggest.longLabel","{0}, {1}",e[t].label.label,e[t].snippet.name),t=o)}}resolveCompletionItem(e){return e instanceof f?e.resolve():e}_computeSnippetPositions(e,t,n,o){const r=[];for(let s=1;s<n.startColumn;s++){const a=e.getWordAtPosition(new $(t,s));r.push({startColumn:s,prefixLow:o.substring(s-1),isWord:!!a}),a&&(s=a.endColumn,r.push({startColumn:a.endColumn,prefixLow:o.substring(a.endColumn-1),isWord:!1}))}return(n.word.length>0||r.length===0)&&r.push({startColumn:n.startColumn,prefixLow:o.substring(n.startColumn-1),isWord:!0}),r}_getLanguageIdAtPosition(e,t){e.tokenization.tokenizeIfCheap(t.lineNumber);let n=e.getLanguageIdAtPosition(t.lineNumber,t.column);return this._languageService.getLanguageName(n)||(n=e.getLanguageId()),n}};C=v([d(0,F),d(1,T),d(2,G)],C);export{f as SnippetCompletion,C as SnippetCompletionProvider};
