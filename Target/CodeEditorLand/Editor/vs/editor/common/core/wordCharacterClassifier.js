import{CharCode as s}from"../../../../vs/base/common/charCode.js";import{LRUCache as l}from"../../../../vs/base/common/map.js";import{CharacterClassifier as o}from"../../../../vs/editor/common/core/characterClassifier.js";var g=(e=>(e[e.Regular=0]="Regular",e[e.Whitespace=1]="Whitespace",e[e.WordSeparator=2]="WordSeparator",e))(g||{});class c extends o{intlSegmenterLocales;_segmenter=null;_cachedLine=null;_cachedSegments=[];constructor(t,n){super(0),this.intlSegmenterLocales=n,this.intlSegmenterLocales.length>0?this._segmenter=new Intl.Segmenter(this.intlSegmenterLocales,{granularity:"word"}):this._segmenter=null;for(let e=0,r=t.length;e<r;e++)this.set(t.charCodeAt(e),2);this.set(s.Space,1),this.set(s.Tab,1)}findPrevIntlWordBeforeOrAtOffset(t,n){let e=null;for(const r of this._getIntlSegmenterWordsOnLine(t)){if(r.index>n)break;e=r}return e}findNextIntlWordAtOrAfterOffset(t,n){for(const e of this._getIntlSegmenterWordsOnLine(t))if(!(e.index<n))return e;return null}_getIntlSegmenterWordsOnLine(t){return this._segmenter?this._cachedLine===t?this._cachedSegments:(this._cachedLine=t,this._cachedSegments=this._filterWordSegments(this._segmenter.segment(t)),this._cachedSegments):[]}_filterWordSegments(t){const n=[];for(const e of t)this._isWordLike(e)&&n.push(e);return n}_isWordLike(t){return!!t.isWordLike}}const a=new l(10);function h(i,t){const n=`${i}/${t.join(",")}`;let e=a.get(n);return e||(e=new c(i,t),a.set(n,e)),e}export{g as WordCharacterClass,c as WordCharacterClassifier,h as getMapForWordSeparators};
