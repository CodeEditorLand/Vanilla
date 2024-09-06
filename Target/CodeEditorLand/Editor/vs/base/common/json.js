var _=(m=>(m[m.None=0]="None",m[m.UnexpectedEndOfComment=1]="UnexpectedEndOfComment",m[m.UnexpectedEndOfString=2]="UnexpectedEndOfString",m[m.UnexpectedEndOfNumber=3]="UnexpectedEndOfNumber",m[m.InvalidUnicode=4]="InvalidUnicode",m[m.InvalidEscapeCharacter=5]="InvalidEscapeCharacter",m[m.InvalidCharacter=6]="InvalidCharacter",m))(_||{}),F=(o=>(o[o.OpenBraceToken=1]="OpenBraceToken",o[o.CloseBraceToken=2]="CloseBraceToken",o[o.OpenBracketToken=3]="OpenBracketToken",o[o.CloseBracketToken=4]="CloseBracketToken",o[o.CommaToken=5]="CommaToken",o[o.ColonToken=6]="ColonToken",o[o.NullKeyword=7]="NullKeyword",o[o.TrueKeyword=8]="TrueKeyword",o[o.FalseKeyword=9]="FalseKeyword",o[o.StringLiteral=10]="StringLiteral",o[o.NumericLiteral=11]="NumericLiteral",o[o.LineCommentTrivia=12]="LineCommentTrivia",o[o.BlockCommentTrivia=13]="BlockCommentTrivia",o[o.LineBreakTrivia=14]="LineBreakTrivia",o[o.Trivia=15]="Trivia",o[o.Unknown=16]="Unknown",o[o.EOF=17]="EOF",o))(F||{}),J=(u=>(u[u.InvalidSymbol=1]="InvalidSymbol",u[u.InvalidNumberFormat=2]="InvalidNumberFormat",u[u.PropertyNameExpected=3]="PropertyNameExpected",u[u.ValueExpected=4]="ValueExpected",u[u.ColonExpected=5]="ColonExpected",u[u.CommaExpected=6]="CommaExpected",u[u.CloseBraceExpected=7]="CloseBraceExpected",u[u.CloseBracketExpected=8]="CloseBracketExpected",u[u.EndOfFileExpected=9]="EndOfFileExpected",u[u.InvalidCommentToken=10]="InvalidCommentToken",u[u.UnexpectedEndOfComment=11]="UnexpectedEndOfComment",u[u.UnexpectedEndOfString=12]="UnexpectedEndOfString",u[u.UnexpectedEndOfNumber=13]="UnexpectedEndOfNumber",u[u.InvalidUnicode=14]="InvalidUnicode",u[u.InvalidEscapeCharacter=15]="InvalidEscapeCharacter",u[u.InvalidCharacter=16]="InvalidCharacter",u))(J||{}),O;(c=>c.DEFAULT={allowTrailingComma:!0})(O||={});function Q(r,c=!1){let n=0;const t=r.length;let l="",b=0,s=16,m=0;function i(a){let u=0,o=0;for(;u<a;){const p=r.charCodeAt(n);if(p>=48&&p<=57)o=o*16+p-48;else if(p>=65&&p<=70)o=o*16+p-65+10;else if(p>=97&&p<=102)o=o*16+p-97+10;else break;n++,u++}return u<a&&(o=-1),o}function f(a){n=a,l="",b=0,s=16,m=0}function x(){const a=n;if(r.charCodeAt(n)===48)n++;else for(n++;n<r.length&&T(r.charCodeAt(n));)n++;if(n<r.length&&r.charCodeAt(n)===46)if(n++,n<r.length&&T(r.charCodeAt(n)))for(n++;n<r.length&&T(r.charCodeAt(n));)n++;else return m=3,r.substring(a,n);let u=n;if(n<r.length&&(r.charCodeAt(n)===69||r.charCodeAt(n)===101))if(n++,(n<r.length&&r.charCodeAt(n)===43||r.charCodeAt(n)===45)&&n++,n<r.length&&T(r.charCodeAt(n))){for(n++;n<r.length&&T(r.charCodeAt(n));)n++;u=n}else m=3;return r.substring(a,u)}function d(){let a="",u=n;for(;;){if(n>=t){a+=r.substring(u,n),m=2;break}const o=r.charCodeAt(n);if(o===34){a+=r.substring(u,n),n++;break}if(o===92){if(a+=r.substring(u,n),n++,n>=t){m=2;break}switch(r.charCodeAt(n++)){case 34:a+='"';break;case 92:a+="\\";break;case 47:a+="/";break;case 98:a+="\b";break;case 102:a+="\f";break;case 110:a+=`
`;break;case 114:a+="\r";break;case 116:a+="	";break;case 117:{const S=i(4);S>=0?a+=String.fromCharCode(S):m=4;break}default:m=5}u=n;continue}if(o>=0&&o<=31)if(N(o)){a+=r.substring(u,n),m=2;break}else m=6;n++}return a}function k(){if(l="",m=0,b=n,n>=t)return b=t,s=17;let a=r.charCodeAt(n);if(B(a)){do n++,l+=String.fromCharCode(a),a=r.charCodeAt(n);while(B(a));return s=15}if(N(a))return n++,l+=String.fromCharCode(a),a===13&&r.charCodeAt(n)===10&&(n++,l+=`
`),s=14;switch(a){case 123:return n++,s=1;case 125:return n++,s=2;case 91:return n++,s=3;case 93:return n++,s=4;case 58:return n++,s=6;case 44:return n++,s=5;case 34:return n++,l=d(),s=10;case 47:{const u=n-1;if(r.charCodeAt(n+1)===47){for(n+=2;n<t&&!N(r.charCodeAt(n));)n++;return l=r.substring(u,n),s=12}if(r.charCodeAt(n+1)===42){n+=2;const o=t-1;let p=!1;for(;n<o;){if(r.charCodeAt(n)===42&&r.charCodeAt(n+1)===47){n+=2,p=!0;break}n++}return p||(n++,m=1),l=r.substring(u,n),s=13}return l+=String.fromCharCode(a),n++,s=16}case 45:if(l+=String.fromCharCode(a),n++,n===t||!T(r.charCodeAt(n)))return s=16;case 48:case 49:case 50:case 51:case 52:case 53:case 54:case 55:case 56:case 57:return l+=x(),s=11;default:for(;n<t&&w(a);)n++,a=r.charCodeAt(n);if(b!==n){switch(l=r.substring(b,n),l){case"true":return s=8;case"false":return s=9;case"null":return s=7}return s=16}return l+=String.fromCharCode(a),n++,s=16}}function w(a){if(B(a)||N(a))return!1;switch(a){case 125:case 93:case 123:case 91:case 34:case 58:case 44:case 47:return!1}return!0}function v(){let a;do a=k();while(a>=12&&a<=15);return a}return{setPosition:f,getPosition:()=>n,scan:c?v:k,getToken:()=>s,getTokenValue:()=>l,getTokenOffset:()=>b,getTokenLength:()=>n-b,getTokenError:()=>m}}function B(r){return r===32||r===9||r===11||r===12||r===160||r===5760||r>=8192&&r<=8203||r===8239||r===8287||r===12288||r===65279}function N(r){return r===10||r===13||r===8232||r===8233}function T(r){return r>=48&&r<=57}var D=(e=>(e[e.nullCharacter=0]="nullCharacter",e[e.maxAsciiCharacter=127]="maxAsciiCharacter",e[e.lineFeed=10]="lineFeed",e[e.carriageReturn=13]="carriageReturn",e[e.lineSeparator=8232]="lineSeparator",e[e.paragraphSeparator=8233]="paragraphSeparator",e[e.nextLine=133]="nextLine",e[e.space=32]="space",e[e.nonBreakingSpace=160]="nonBreakingSpace",e[e.enQuad=8192]="enQuad",e[e.emQuad=8193]="emQuad",e[e.enSpace=8194]="enSpace",e[e.emSpace=8195]="emSpace",e[e.threePerEmSpace=8196]="threePerEmSpace",e[e.fourPerEmSpace=8197]="fourPerEmSpace",e[e.sixPerEmSpace=8198]="sixPerEmSpace",e[e.figureSpace=8199]="figureSpace",e[e.punctuationSpace=8200]="punctuationSpace",e[e.thinSpace=8201]="thinSpace",e[e.hairSpace=8202]="hairSpace",e[e.zeroWidthSpace=8203]="zeroWidthSpace",e[e.narrowNoBreakSpace=8239]="narrowNoBreakSpace",e[e.ideographicSpace=12288]="ideographicSpace",e[e.mathematicalSpace=8287]="mathematicalSpace",e[e.ogham=5760]="ogham",e[e._=95]="_",e[e.$=36]="$",e[e._0=48]="_0",e[e._1=49]="_1",e[e._2=50]="_2",e[e._3=51]="_3",e[e._4=52]="_4",e[e._5=53]="_5",e[e._6=54]="_6",e[e._7=55]="_7",e[e._8=56]="_8",e[e._9=57]="_9",e[e.a=97]="a",e[e.b=98]="b",e[e.c=99]="c",e[e.d=100]="d",e[e.e=101]="e",e[e.f=102]="f",e[e.g=103]="g",e[e.h=104]="h",e[e.i=105]="i",e[e.j=106]="j",e[e.k=107]="k",e[e.l=108]="l",e[e.m=109]="m",e[e.n=110]="n",e[e.o=111]="o",e[e.p=112]="p",e[e.q=113]="q",e[e.r=114]="r",e[e.s=115]="s",e[e.t=116]="t",e[e.u=117]="u",e[e.v=118]="v",e[e.w=119]="w",e[e.x=120]="x",e[e.y=121]="y",e[e.z=122]="z",e[e.A=65]="A",e[e.B=66]="B",e[e.C=67]="C",e[e.D=68]="D",e[e.E=69]="E",e[e.F=70]="F",e[e.G=71]="G",e[e.H=72]="H",e[e.I=73]="I",e[e.J=74]="J",e[e.K=75]="K",e[e.L=76]="L",e[e.M=77]="M",e[e.N=78]="N",e[e.O=79]="O",e[e.P=80]="P",e[e.Q=81]="Q",e[e.R=82]="R",e[e.S=83]="S",e[e.T=84]="T",e[e.U=85]="U",e[e.V=86]="V",e[e.W=87]="W",e[e.X=88]="X",e[e.Y=89]="Y",e[e.Z=90]="Z",e[e.ampersand=38]="ampersand",e[e.asterisk=42]="asterisk",e[e.at=64]="at",e[e.backslash=92]="backslash",e[e.bar=124]="bar",e[e.caret=94]="caret",e[e.closeBrace=125]="closeBrace",e[e.closeBracket=93]="closeBracket",e[e.closeParen=41]="closeParen",e[e.colon=58]="colon",e[e.comma=44]="comma",e[e.dot=46]="dot",e[e.doubleQuote=34]="doubleQuote",e[e.equals=61]="equals",e[e.exclamation=33]="exclamation",e[e.greaterThan=62]="greaterThan",e[e.lessThan=60]="lessThan",e[e.minus=45]="minus",e[e.openBrace=123]="openBrace",e[e.openBracket=91]="openBracket",e[e.openParen=40]="openParen",e[e.percent=37]="percent",e[e.plus=43]="plus",e[e.question=63]="question",e[e.semicolon=59]="semicolon",e[e.singleQuote=39]="singleQuote",e[e.slash=47]="slash",e[e.tilde=126]="tilde",e[e.backspace=8]="backspace",e[e.formFeed=12]="formFeed",e[e.byteOrderMark=65279]="byteOrderMark",e[e.tab=9]="tab",e[e.verticalTab=11]="verticalTab",e))(D||{});function z(r,c){const n=[],t=new Object;let l;const b={value:{},offset:0,length:0,type:"object",parent:void 0};let s=!1;function m(i,f,x,d){b.value=i,b.offset=f,b.length=x,b.type=d,b.colonOffset=void 0,l=b}try{K(r,{onObjectBegin:(i,f)=>{if(c<=i)throw t;l=void 0,s=c>i,n.push("")},onObjectProperty:(i,f,x)=>{if(c<f||(m(i,f,x,"property"),n[n.length-1]=i,c<=f+x))throw t},onObjectEnd:(i,f)=>{if(c<=i)throw t;l=void 0,n.pop()},onArrayBegin:(i,f)=>{if(c<=i)throw t;l=void 0,n.push(0)},onArrayEnd:(i,f)=>{if(c<=i)throw t;l=void 0,n.pop()},onLiteralValue:(i,f,x)=>{if(c<f||(m(i,f,x,U(i)),c<=f+x))throw t},onSeparator:(i,f,x)=>{if(c<=f)throw t;if(i===":"&&l&&l.type==="property")l.colonOffset=f,s=!1,l=void 0;else if(i===","){const d=n[n.length-1];typeof d=="number"?n[n.length-1]=d+1:(s=!0,n[n.length-1]=""),l=void 0}}})}catch(i){if(i!==t)throw i}return{path:n,previousNode:l,isAtPropertyKey:s,matches:i=>{let f=0;for(let x=0;f<i.length&&x<n.length;x++)if(i[f]===n[x]||i[f]==="*")f++;else if(i[f]!=="**")return!1;return f===i.length}}}function M(r,c=[],n=O.DEFAULT){let t=null,l=[];const b=[];function s(i){Array.isArray(l)?l.push(i):t!==null&&(l[t]=i)}return K(r,{onObjectBegin:()=>{const i={};s(i),b.push(l),l=i,t=null},onObjectProperty:i=>{t=i},onObjectEnd:()=>{l=b.pop()},onArrayBegin:()=>{const i=[];s(i),b.push(l),l=i,t=null},onArrayEnd:()=>{l=b.pop()},onLiteralValue:s,onError:(i,f,x)=>{c.push({error:i,offset:f,length:x})}},n),l[0]}function H(r,c=[],n=O.DEFAULT){let t={type:"array",offset:-1,length:-1,children:[],parent:void 0};function l(i){t.type==="property"&&(t.length=i-t.offset,t=t.parent)}function b(i){return t.children.push(i),i}K(r,{onObjectBegin:i=>{t=b({type:"object",offset:i,length:-1,parent:t,children:[]})},onObjectProperty:(i,f,x)=>{t=b({type:"property",offset:f,length:-1,parent:t,children:[]}),t.children.push({type:"string",value:i,offset:f,length:x,parent:t})},onObjectEnd:(i,f)=>{t.length=i+f-t.offset,t=t.parent,l(i+f)},onArrayBegin:(i,f)=>{t=b({type:"array",offset:i,length:-1,parent:t,children:[]})},onArrayEnd:(i,f)=>{t.length=i+f-t.offset,t=t.parent,l(i+f)},onLiteralValue:(i,f,x)=>{b({type:U(i),offset:f,length:x,parent:t,value:i}),l(f+x)},onSeparator:(i,f,x)=>{t.type==="property"&&(i===":"?t.colonOffset=f:i===","&&l(f))},onError:(i,f,x)=>{c.push({error:i,offset:f,length:x})}},n);const m=t.children[0];return m&&delete m.parent,m}function G(r,c){if(!r)return;let n=r;for(const t of c)if(typeof t=="string"){if(n.type!=="object"||!Array.isArray(n.children))return;let l=!1;for(const b of n.children)if(Array.isArray(b.children)&&b.children[0].value===t){n=b.children[1],l=!0;break}if(!l)return}else{const l=t;if(n.type!=="array"||l<0||!Array.isArray(n.children)||l>=n.children.length)return;n=n.children[l]}return n}function R(r){if(!r.parent||!r.parent.children)return[];const c=R(r.parent);if(r.parent.type==="property"){const n=r.parent.children[0].value;c.push(n)}else if(r.parent.type==="array"){const n=r.parent.children.indexOf(r);n!==-1&&c.push(n)}return c}function P(r){switch(r.type){case"array":return r.children.map(P);case"object":{const c=Object.create(null);for(const n of r.children){const t=n.children[1];t&&(c[n.children[0].value]=P(t))}return c}case"null":case"string":case"number":case"boolean":return r.value;default:return}}function W(r,c,n=!1){return c>=r.offset&&c<r.offset+r.length||n&&c===r.offset+r.length}function q(r,c,n=!1){if(W(r,c,n)){const t=r.children;if(Array.isArray(t))for(let l=0;l<t.length&&t[l].offset<=c;l++){const b=q(t[l],c,n);if(b)return b}return r}}function K(r,c,n=O.DEFAULT){const t=Q(r,!1);function l(g){return g?()=>g(t.getTokenOffset(),t.getTokenLength()):()=>!0}function b(g){return g?y=>g(y,t.getTokenOffset(),t.getTokenLength()):()=>!0}const s=l(c.onObjectBegin),m=b(c.onObjectProperty),i=l(c.onObjectEnd),f=l(c.onArrayBegin),x=l(c.onArrayEnd),d=b(c.onLiteralValue),k=b(c.onSeparator),w=l(c.onComment),v=b(c.onError),a=n&&n.disallowComments,u=n&&n.allowTrailingComma;function o(){for(;;){const g=t.scan();switch(t.getTokenError()){case 4:p(14);break;case 5:p(15);break;case 3:p(13);break;case 1:a||p(11);break;case 2:p(12);break;case 6:p(16);break}switch(g){case 12:case 13:a?p(10):w();break;case 16:p(1);break;case 15:case 14:break;default:return g}}}function p(g,y=[],L=[]){if(v(g),y.length+L.length>0){let E=t.getToken();for(;E!==17;){if(y.indexOf(E)!==-1){o();break}else if(L.indexOf(E)!==-1)break;E=o()}}}function S(g){const y=t.getTokenValue();return g?d(y):m(y),o(),!0}function h(){switch(t.getToken()){case 11:{let g=0;try{g=JSON.parse(t.getTokenValue()),typeof g!="number"&&(p(2),g=0)}catch{p(2)}d(g);break}case 7:d(null);break;case 8:d(!0);break;case 9:d(!1);break;default:return!1}return o(),!0}function j(){return t.getToken()!==10?(p(3,[],[2,5]),!1):(S(!1),t.getToken()===6?(k(":"),o(),A()||p(4,[],[2,5])):p(5,[],[2,5]),!0)}function I(){s(),o();let g=!1;for(;t.getToken()!==2&&t.getToken()!==17;){if(t.getToken()===5){if(g||p(4,[],[]),k(","),o(),t.getToken()===2&&u)break}else g&&p(6,[],[]);j()||p(4,[],[2,5]),g=!0}return i(),t.getToken()!==2?p(7,[2],[]):o(),!0}function V(){f(),o();let g=!1;for(;t.getToken()!==4&&t.getToken()!==17;){if(t.getToken()===5){if(g||p(4,[],[]),k(","),o(),t.getToken()===4&&u)break}else g&&p(6,[],[]);A()||p(4,[],[4,5]),g=!0}return x(),t.getToken()!==4?p(8,[4],[]):o(),!0}function A(){switch(t.getToken()){case 3:return V();case 1:return I();case 10:return S(!0);default:return h()}}return o(),t.getToken()===17?n.allowEmptyContent?!0:(p(4,[],[]),!1):A()?(t.getToken()!==17&&p(9,[],[]),!0):(p(4,[],[]),!1)}function U(r){switch(typeof r){case"boolean":return"boolean";case"number":return"number";case"string":return"string";case"object":{if(r){if(Array.isArray(r))return"array"}else return"null";return"object"}default:return"null"}}export{J as ParseErrorCode,O as ParseOptions,_ as ScanError,F as SyntaxKind,W as contains,Q as createScanner,G as findNodeAtLocation,q as findNodeAtOffset,z as getLocation,R as getNodePath,U as getNodeType,P as getNodeValue,M as parse,H as parseTree,K as visit};