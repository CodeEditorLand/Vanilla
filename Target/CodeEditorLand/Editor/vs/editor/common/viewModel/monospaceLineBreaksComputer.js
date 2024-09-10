import{CharCode as D}from"../../../base/common/charCode.js";import*as w from"../../../base/common/strings.js";import{WrappingIndent as T,EditorOption as Q}from"../config/editorOptions.js";import{CharacterClassifier as Y}from"../core/characterClassifier.js";import{LineInjectedText as Z}from"../textModelEvents.js";import{ModelLineProjectionData as y}from"../modelLineProjectionData.js";class X{static create(e){return new X(e.get(Q.wordWrapBreakBeforeCharacters),e.get(Q.wordWrapBreakAfterCharacters))}classifier;constructor(e,t){this.classifier=new z(e,t)}createLineBreaksComputer(e,t,r,n,o){const E=[],P=[],f=[];return{addRequest:(u,h,i)=>{E.push(u),P.push(h),f.push(i)},finalize:()=>{const u=e.typicalFullwidthCharacterWidth/e.typicalHalfwidthCharacterWidth,h=[];for(let i=0,M=E.length;i<M;i++){const L=P[i],I=f[i];I&&!I.injectionOptions&&!L?h[i]=ee(this.classifier,I,E[i],t,r,u,n,o):h[i]=te(this.classifier,E[i],L,t,r,u,n,o)}return G.length=0,q.length=0,h}}}}var $=(n=>(n[n.NONE=0]="NONE",n[n.BREAK_BEFORE=1]="BREAK_BEFORE",n[n.BREAK_AFTER=2]="BREAK_AFTER",n[n.BREAK_IDEOGRAPHIC=3]="BREAK_IDEOGRAPHIC",n))($||{});class z extends Y{constructor(e,t){super(0);for(let r=0;r<e.length;r++)this.set(e.charCodeAt(r),1);for(let r=0;r<t.length;r++)this.set(t.charCodeAt(r),2)}get(e){return e>=0&&e<256?this._asciiMap[e]:e>=12352&&e<=12543||e>=13312&&e<=19903||e>=19968&&e<=40959?3:this._map.get(e)||this._defaultValue}}let G=[],q=[];function ee(c,e,t,r,n,o,E,P){if(n===-1)return null;const f=t.length;if(f<=1)return null;const u=P==="keepAll",h=e.breakOffsets,i=e.breakOffsetsVisibleColumn,M=U(t,r,n,o,E),L=n-M,I=G,_=q;let A=0,p=0,B=0,d=n;const x=h.length;let s=0;if(s>=0){let g=Math.abs(i[s]-d);for(;s+1<x;){const C=Math.abs(i[s+1]-d);if(C>=g)break;g=C,s++}}for(;s<x;){let g=s<0?0:h[s],C=s<0?0:i[s];p>g&&(g=p,C=B);let b=0,l=0,W=0,k=0;if(C<=d){let a=C,K=g===0?D.Null:t.charCodeAt(g-1),v=g===0?0:c.get(K),V=!0;for(let O=g;O<f;O++){const R=O,m=t.charCodeAt(O);let N,j;if(w.isHighSurrogate(m)?(O++,N=0,j=2):(N=c.get(m),j=H(m,a,r,o)),R>p&&J(K,v,m,N,u)&&(b=R,l=a),a+=j,a>d){R>p?(W=R,k=a-j):(W=O+1,k=a),a-l>L&&(b=0),V=!1;break}K=m,v=N}if(V){A>0&&(I[A]=h[h.length-1],_[A]=i[h.length-1],A++);break}}if(b===0){let a=C,K=t.charCodeAt(g),v=c.get(K),V=!1;for(let O=g-1;O>=p;O--){const R=O+1,m=t.charCodeAt(O);if(m===D.Tab){V=!0;break}let N,j;if(w.isLowSurrogate(m)?(O--,N=0,j=2):(N=c.get(m),j=w.isFullWidthCharacter(m)?o:1),a<=d){if(W===0&&(W=R,k=a),a<=d-L)break;if(J(m,N,K,v,u)){b=R,l=a;break}}a-=j,K=m,v=N}if(b!==0){const O=L-(k-l);if(O<=r){const R=t.charCodeAt(W);let m;w.isHighSurrogate(R)?m=2:m=H(R,k,r,o),O-m<0&&(b=0)}}if(V){s--;continue}}if(b===0&&(b=W,l=k),b<=p){const a=t.charCodeAt(p);w.isHighSurrogate(a)?(b=p+2,l=B+2):(b=p+1,l=B+H(a,B,r,o))}for(p=b,I[A]=b,B=l,_[A]=l,A++,d=l+L;s<0||s<x&&i[s]<l;)s++;let F=Math.abs(i[s]-d);for(;s+1<x;){const a=Math.abs(i[s+1]-d);if(a>=F)break;F=a,s++}}return A===0?null:(I.length=A,_.length=A,G=e.breakOffsets,q=e.breakOffsetsVisibleColumn,e.breakOffsets=I,e.breakOffsetsVisibleColumn=_,e.wrappedTextIndentLength=M,e)}function te(c,e,t,r,n,o,E,P){const f=Z.applyInjectedText(e,t);let u,h;if(t&&t.length>0?(u=t.map(l=>l.options),h=t.map(l=>l.column-1)):(u=null,h=null),n===-1)return u?new y(h,u,[f.length],[],0):null;const i=f.length;if(i<=1)return u?new y(h,u,[f.length],[],0):null;const M=P==="keepAll",L=U(f,r,n,o,E),I=n-L,_=[],A=[];let p=0,B=0,d=0,x=n,s=f.charCodeAt(0),g=c.get(s),C=H(s,0,r,o),b=1;w.isHighSurrogate(s)&&(C+=1,s=f.charCodeAt(1),g=c.get(s),b++);for(let l=b;l<i;l++){const W=l,k=f.charCodeAt(l);let F,a;w.isHighSurrogate(k)?(l++,F=0,a=2):(F=c.get(k),a=H(k,C,r,o)),J(s,g,k,F,M)&&(B=W,d=C),C+=a,C>x&&((B===0||C-d>I)&&(B=W,d=C-a),_[p]=B,A[p]=d,p++,x=d+I,B=0),s=k,g=F}return p===0&&(!t||t.length===0)?null:(_[p]=i,A[p]=C,new y(h,u,_,A,L))}function H(c,e,t,r){return c===D.Tab?t-e%t:w.isFullWidthCharacter(c)||c<32?r:1}function S(c,e){return e-c%e}function J(c,e,t,r,n){return t!==D.Space&&(e===2&&r!==2||e!==1&&r===1||!n&&e===3&&r!==2||!n&&r===3&&e!==1)}function U(c,e,t,r,n){let o=0;if(n!==T.None){const E=w.firstNonWhitespaceIndex(c);if(E!==-1){for(let f=0;f<E;f++){const u=c.charCodeAt(f)===D.Tab?S(o,e):1;o+=u}const P=n===T.DeepIndent?2:n===T.Indent?1:0;for(let f=0;f<P;f++){const u=S(o,e);o+=u}o+r>t&&(o=0)}}return o}export{X as MonospaceLineBreaksComputerFactory};
