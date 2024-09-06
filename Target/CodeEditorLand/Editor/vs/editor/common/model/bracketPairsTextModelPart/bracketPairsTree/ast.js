import{BugIndicatingError as k}from"../../../../../../vs/base/common/errors.js";import{CursorColumns as B}from"../../../../../../vs/editor/common/core/cursorColumns.js";import"../../../../../../vs/editor/common/languages/supports/languageBracketsConfiguration.js";import"../../../../../../vs/editor/common/model.js";import{lengthAdd as d,lengthGetLineCount as C,lengthToObj as L,lengthZero as _}from"./length.js";import{SmallImmutableSet as o}from"./smallImmutableSet.js";import"./tokenizer.js";var w=(n=>(n[n.Text=0]="Text",n[n.Bracket=1]="Bracket",n[n.Pair=2]="Pair",n[n.UnexpectedClosingBracket=3]="UnexpectedClosingBracket",n[n.List=4]="List",n))(w||{});class m{_length;get length(){return this._length}constructor(l){this._length=l}}class u extends m{constructor(e,t,i,n,s){super(e);this.openingBracket=t;this.child=i;this.closingBracket=n;this.missingOpeningBracketIds=s}static create(e,t,i){let n=e.length;return t&&(n=d(n,t.length)),i&&(n=d(n,i.length)),new u(n,e,t,i,t?t.missingOpeningBracketIds:o.getEmpty())}get kind(){return 2}get listHeight(){return 0}get childrenLength(){return 3}getChild(e){switch(e){case 0:return this.openingBracket;case 1:return this.child;case 2:return this.closingBracket}throw new Error("Invalid child index")}get children(){const e=[];return e.push(this.openingBracket),this.child&&e.push(this.child),this.closingBracket&&e.push(this.closingBracket),e}canBeReused(e){return!(this.closingBracket===null||e.intersects(this.missingOpeningBracketIds))}flattenLists(){return u.create(this.openingBracket.flattenLists(),this.child&&this.child.flattenLists(),this.closingBracket&&this.closingBracket.flattenLists())}deepClone(){return new u(this.length,this.openingBracket.deepClone(),this.child&&this.child.deepClone(),this.closingBracket&&this.closingBracket.deepClone(),this.missingOpeningBracketIds)}computeMinIndentation(e,t){return this.child?this.child.computeMinIndentation(d(e,this.openingBracket.length),t):Number.MAX_SAFE_INTEGER}}class p extends m{constructor(e,t,i){super(e);this.listHeight=t;this._missingOpeningBracketIds=i}static create23(e,t,i,n=!1){let s=e.length,r=e.missingOpeningBracketIds;if(e.listHeight!==t.listHeight)throw new Error("Invalid list heights");if(s=d(s,t.length),r=r.merge(t.missingOpeningBracketIds),i){if(e.listHeight!==i.listHeight)throw new Error("Invalid list heights");s=d(s,i.length),r=r.merge(i.missingOpeningBracketIds)}return n?new O(s,e.listHeight+1,e,t,i,r):new a(s,e.listHeight+1,e,t,i,r)}static create(e,t=!1){if(e.length===0)return this.getEmpty();{let i=e[0].length,n=e[0].missingOpeningBracketIds;for(let s=1;s<e.length;s++)i=d(i,e[s].length),n=n.merge(e[s].missingOpeningBracketIds);return t?new I(i,e[0].listHeight+1,e,n):new c(i,e[0].listHeight+1,e,n)}}static getEmpty(){return new I(_,0,[],o.getEmpty())}get kind(){return 4}get missingOpeningBracketIds(){return this._missingOpeningBracketIds}cachedMinIndentation=-1;throwIfImmutable(){}makeLastElementMutable(){this.throwIfImmutable();const e=this.childrenLength;if(e===0)return;const t=this.getChild(e-1),i=t.kind===4?t.toMutable():t;return t!==i&&this.setChild(e-1,i),i}makeFirstElementMutable(){if(this.throwIfImmutable(),this.childrenLength===0)return;const t=this.getChild(0),i=t.kind===4?t.toMutable():t;return t!==i&&this.setChild(0,i),i}canBeReused(e){if(e.intersects(this.missingOpeningBracketIds)||this.childrenLength===0)return!1;let t=this;for(;t.kind===4;){const i=t.childrenLength;if(i===0)throw new k;t=t.getChild(i-1)}return t.canBeReused(e)}handleChildrenChanged(){this.throwIfImmutable();const e=this.childrenLength;let t=this.getChild(0).length,i=this.getChild(0).missingOpeningBracketIds;for(let n=1;n<e;n++){const s=this.getChild(n);t=d(t,s.length),i=i.merge(s.missingOpeningBracketIds)}this._length=t,this._missingOpeningBracketIds=i,this.cachedMinIndentation=-1}flattenLists(){const e=[];for(const t of this.children){const i=t.flattenLists();i.kind===4?e.push(...i.children):e.push(i)}return p.create(e)}computeMinIndentation(e,t){if(this.cachedMinIndentation!==-1)return this.cachedMinIndentation;let i=Number.MAX_SAFE_INTEGER,n=e;for(let s=0;s<this.childrenLength;s++){const r=this.getChild(s);r&&(i=Math.min(i,r.computeMinIndentation(n,t)),n=d(n,r.length))}return this.cachedMinIndentation=i,i}}class a extends p{constructor(e,t,i,n,s,r){super(e,t,r);this._item1=i;this._item2=n;this._item3=s}get childrenLength(){return this._item3!==null?3:2}getChild(e){switch(e){case 0:return this._item1;case 1:return this._item2;case 2:return this._item3}throw new Error("Invalid child index")}setChild(e,t){switch(e){case 0:this._item1=t;return;case 1:this._item2=t;return;case 2:this._item3=t;return}throw new Error("Invalid child index")}get children(){return this._item3?[this._item1,this._item2,this._item3]:[this._item1,this._item2]}get item1(){return this._item1}get item2(){return this._item2}get item3(){return this._item3}deepClone(){return new a(this.length,this.listHeight,this._item1.deepClone(),this._item2.deepClone(),this._item3?this._item3.deepClone():null,this.missingOpeningBracketIds)}appendChildOfSameHeight(e){if(this._item3)throw new Error("Cannot append to a full (2,3) tree node");this.throwIfImmutable(),this._item3=e,this.handleChildrenChanged()}unappendChild(){if(!this._item3)throw new Error("Cannot remove from a non-full (2,3) tree node");this.throwIfImmutable();const e=this._item3;return this._item3=null,this.handleChildrenChanged(),e}prependChildOfSameHeight(e){if(this._item3)throw new Error("Cannot prepend to a full (2,3) tree node");this.throwIfImmutable(),this._item3=this._item2,this._item2=this._item1,this._item1=e,this.handleChildrenChanged()}unprependChild(){if(!this._item3)throw new Error("Cannot remove from a non-full (2,3) tree node");this.throwIfImmutable();const e=this._item1;return this._item1=this._item2,this._item2=this._item3,this._item3=null,this.handleChildrenChanged(),e}toMutable(){return this}}class O extends a{toMutable(){return new a(this.length,this.listHeight,this.item1,this.item2,this.item3,this.missingOpeningBracketIds)}throwIfImmutable(){throw new Error("this instance is immutable")}}class c extends p{constructor(e,t,i,n){super(e,t,n);this._children=i}get childrenLength(){return this._children.length}getChild(e){return this._children[e]}setChild(e,t){this._children[e]=t}get children(){return this._children}deepClone(){const e=new Array(this._children.length);for(let t=0;t<this._children.length;t++)e[t]=this._children[t].deepClone();return new c(this.length,this.listHeight,e,this.missingOpeningBracketIds)}appendChildOfSameHeight(e){this.throwIfImmutable(),this._children.push(e),this.handleChildrenChanged()}unappendChild(){this.throwIfImmutable();const e=this._children.pop();return this.handleChildrenChanged(),e}prependChildOfSameHeight(e){this.throwIfImmutable(),this._children.unshift(e),this.handleChildrenChanged()}unprependChild(){this.throwIfImmutable();const e=this._children.shift();return this.handleChildrenChanged(),e}toMutable(){return this}}class I extends c{toMutable(){return new c(this.length,this.listHeight,[...this.children],this.missingOpeningBracketIds)}throwIfImmutable(){throw new Error("this instance is immutable")}}const S=[];class g extends m{get listHeight(){return 0}get childrenLength(){return 0}getChild(l){return null}get children(){return S}flattenLists(){return this}deepClone(){return this}}class X extends g{get kind(){return 0}get missingOpeningBracketIds(){return o.getEmpty()}canBeReused(l){return!0}computeMinIndentation(l,e){const t=L(l),i=(t.columnCount===0?t.lineCount:t.lineCount+1)+1,n=C(d(l,this.length))+1;let s=Number.MAX_SAFE_INTEGER;for(let r=i;r<=n;r++){const b=e.getLineFirstNonWhitespaceColumn(r),N=e.getLineContent(r);if(b===0)continue;const A=B.visibleColumnFromColumn(N,b,e.getOptions().tabSize);s=Math.min(s,A)}return s}}class f extends g{constructor(e,t,i){super(e);this.bracketInfo=t;this.bracketIds=i}static create(e,t,i){return new f(e,t,i)}get kind(){return 1}get missingOpeningBracketIds(){return o.getEmpty()}get text(){return this.bracketInfo.bracketText}get languageId(){return this.bracketInfo.languageId}canBeReused(e){return!1}computeMinIndentation(e,t){return Number.MAX_SAFE_INTEGER}}class P extends g{get kind(){return 3}missingOpeningBracketIds;constructor(l,e){super(e),this.missingOpeningBracketIds=l}canBeReused(l){return!l.intersects(this.missingOpeningBracketIds)}computeMinIndentation(l,e){return Number.MAX_SAFE_INTEGER}}export{w as AstNodeKind,f as BracketAstNode,P as InvalidBracketAstNode,p as ListAstNode,u as PairAstNode,X as TextAstNode};