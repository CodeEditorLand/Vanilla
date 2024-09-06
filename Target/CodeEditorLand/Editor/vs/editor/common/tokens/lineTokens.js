import"../../../../vs/editor/common/core/position.js";import{ColorId as b,FontStyle as k,MetadataConsts as g,TokenMetadata as d}from"../../../../vs/editor/common/encodedTokenAttributes.js";import"../../../../vs/editor/common/languages.js";import"../../../../vs/editor/common/model.js";class u{_lineTokensBrand=void 0;_tokens;_tokensCount;_text;languageIdCodec;static defaultTokenMetadata=(k.None<<g.FONT_STYLE_OFFSET|b.DefaultForeground<<g.FOREGROUND_OFFSET|b.DefaultBackground<<g.BACKGROUND_OFFSET)>>>0;static createEmpty(e,t){const n=u.defaultTokenMetadata,s=new Uint32Array(2);return s[0]=e.length,s[1]=n,new u(s,e,t)}static createFromTextAndMetadata(e,t){let n=0,s="";const r=new Array;for(const{text:o,metadata:a}of e)r.push(n+o.length,a),n+=o.length,s+=o;return new u(new Uint32Array(r),s,t)}constructor(e,t,n){this._tokens=e,this._tokensCount=this._tokens.length>>>1,this._text=t,this.languageIdCodec=n}equals(e){return e instanceof u?this.slicedEquals(e,0,this._tokensCount):!1}slicedEquals(e,t,n){if(this._text!==e._text||this._tokensCount!==e._tokensCount)return!1;const s=t<<1,r=s+(n<<1);for(let o=s;o<r;o++)if(this._tokens[o]!==e._tokens[o])return!1;return!0}getLineContent(){return this._text}getCount(){return this._tokensCount}getStartOffset(e){return e>0?this._tokens[e-1<<1]:0}getMetadata(e){return this._tokens[(e<<1)+1]}getLanguageId(e){const t=this._tokens[(e<<1)+1],n=d.getLanguageId(t);return this.languageIdCodec.decodeLanguageId(n)}getStandardTokenType(e){const t=this._tokens[(e<<1)+1];return d.getTokenType(t)}getForeground(e){const t=this._tokens[(e<<1)+1];return d.getForeground(t)}getClassName(e){const t=this._tokens[(e<<1)+1];return d.getClassNameFromMetadata(t)}getInlineStyle(e,t){const n=this._tokens[(e<<1)+1];return d.getInlineStyleFromMetadata(n,t)}getPresentation(e){const t=this._tokens[(e<<1)+1];return d.getPresentationFromMetadata(t)}getEndOffset(e){return this._tokens[e<<1]}findTokenIndexAtOffset(e){return u.findIndexInTokensArray(this._tokens,e)}inflate(){return this}sliceAndInflate(e,t,n){return new c(this,e,t,n)}static convertToEndOffset(e,t){const s=(e.length>>>1)-1;for(let r=0;r<s;r++)e[r<<1]=e[r+1<<1];e[s<<1]=t}static findIndexInTokensArray(e,t){if(e.length<=2)return 0;let n=0,s=(e.length>>>1)-1;for(;n<s;){const r=n+Math.floor((s-n)/2),o=e[r<<1];if(o===t)return r+1;o<t?n=r+1:o>t&&(s=r)}return n}withInserted(e){if(e.length===0)return this;let t=0,n=0,s="";const r=new Array;let o=0;for(;;){const a=t<this._tokensCount?this._tokens[t<<1]:-1,i=n<e.length?e[n]:null;if(a!==-1&&(i===null||a<=i.offset)){s+=this._text.substring(o,a);const l=this._tokens[(t<<1)+1];r.push(s.length,l),t++,o=a}else if(i){if(i.offset>o){s+=this._text.substring(o,i.offset);const l=this._tokens[(t<<1)+1];r.push(s.length,l),o=i.offset}s+=i.text,r.push(s.length,i.tokenMetadata),n++}else break}return new u(new Uint32Array(r),s,this.languageIdCodec)}getTokenText(e){const t=this.getStartOffset(e),n=this.getEndOffset(e);return this._text.substring(t,n)}forEach(e){const t=this.getCount();for(let n=0;n<t;n++)e(n)}}class c{_source;_startOffset;_endOffset;_deltaOffset;_firstTokenIndex;_tokensCount;languageIdCodec;constructor(e,t,n,s){this._source=e,this._startOffset=t,this._endOffset=n,this._deltaOffset=s,this._firstTokenIndex=e.findTokenIndexAtOffset(t),this.languageIdCodec=e.languageIdCodec,this._tokensCount=0;for(let r=this._firstTokenIndex,o=e.getCount();r<o&&!(e.getStartOffset(r)>=n);r++)this._tokensCount++}getMetadata(e){return this._source.getMetadata(this._firstTokenIndex+e)}getLanguageId(e){return this._source.getLanguageId(this._firstTokenIndex+e)}getLineContent(){return this._source.getLineContent().substring(this._startOffset,this._endOffset)}equals(e){return e instanceof c?this._startOffset===e._startOffset&&this._endOffset===e._endOffset&&this._deltaOffset===e._deltaOffset&&this._source.slicedEquals(e._source,this._firstTokenIndex,this._tokensCount):!1}getCount(){return this._tokensCount}getStandardTokenType(e){return this._source.getStandardTokenType(this._firstTokenIndex+e)}getForeground(e){return this._source.getForeground(this._firstTokenIndex+e)}getEndOffset(e){const t=this._source.getEndOffset(this._firstTokenIndex+e);return Math.min(this._endOffset,t)-this._startOffset+this._deltaOffset}getClassName(e){return this._source.getClassName(this._firstTokenIndex+e)}getInlineStyle(e,t){return this._source.getInlineStyle(this._firstTokenIndex+e,t)}getPresentation(e){return this._source.getPresentation(this._firstTokenIndex+e)}findTokenIndexAtOffset(e){return this._source.findTokenIndexAtOffset(e+this._startOffset-this._deltaOffset)-this._firstTokenIndex}getTokenText(e){const t=this._firstTokenIndex+e,n=this._source.getStartOffset(t),s=this._source.getEndOffset(t);let r=this._source.getTokenText(t);return n<this._startOffset&&(r=r.substring(this._startOffset-n)),s>this._endOffset&&(r=r.substring(0,r.length-(s-this._endOffset))),r}forEach(e){for(let t=0;t<this.getCount();t++)e(t)}}function y(f,e){const t=e.lineNumber;if(!f.tokenization.isCheapToTokenize(t))return;f.tokenization.forceTokenization(t);const n=f.tokenization.getLineTokens(t),s=n.findTokenIndexAtOffset(e.column-1);return n.getStandardTokenType(s)}export{u as LineTokens,y as getStandardTokenTypeAtPosition};