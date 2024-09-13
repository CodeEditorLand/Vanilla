import{SyntaxKind as i,createScanner as k}from"../../../../base/common/json.js";import{Position as g}from"../../../../editor/common/core/position.js";import{Range as B}from"../../../../editor/common/core/range.js";class C{static hasOpenBrace(e){for(;e.scan()!==i.EOF;)if(e.getToken()===i.OpenBraceToken)return!0;return!1}static offsetToPosition(e,c){let p=0;const S=e.getEOL().length,n=e.getLineCount();for(let r=1;r<=n;r++){const f=e.getLineLength(r)+S,o=p+f;if(o>c)return new g(r,c-p+1);p=o}return new g(n,e.getLineMaxColumn(n))}static insertSnippet(e,c){const p=e.getValueLengthInRange(new B(1,1,c.lineNumber,c.column));let S;(t=>(t[t.INVALID=0]="INVALID",t[t.AFTER_OBJECT=1]="AFTER_OBJECT",t[t.BEFORE_OBJECT=2]="BEFORE_OBJECT"))(S||={});let n=0,r=-1,f=0;const o=k(e.getValue());let T=0,I=0;const l=(a,u)=>{u!==0&&T===1&&I===0?(n=u,r=a,f=u):n!==0&&(n=0,r=o.getTokenOffset())};for(;o.scan()!==i.EOF;){const a=o.getPosition(),u=o.getToken();let s=!1;switch(u){case i.OpenBracketToken:s=!0,T++,l(a,2);break;case i.CloseBracketToken:s=!0,T--,l(a,0);break;case i.CommaToken:s=!0,l(a,2);break;case i.OpenBraceToken:s=!0,I++,l(a,0);break;case i.CloseBraceToken:s=!0,I--,l(a,1);break;case i.Trivia:case i.LineBreakTrivia:s=!0}if(a>=p&&(n!==0||r!==-1)){let t,L;return n!==0?(t=s?a:o.getTokenOffset(),L=n):(t=r,L=f),L===1?{position:this.offsetToPosition(e,t),prepend:",",append:""}:(o.setPosition(t),{position:this.offsetToPosition(e,t),prepend:"",append:this.hasOpenBrace(o)?",":""})}}const O=e.getLineCount();return{position:new g(O,e.getLineMaxColumn(O)),prepend:`
[`,append:"]"}}}export{C as SmartSnippetInserter};
