import f from"assert";import{DisposableStore as h}from"../../../../../base/common/lifecycle.js";import{ensureNoDisposablesAreLeakedInTestSuite as x}from"../../../../../base/test/common/utils.js";import{MetadataConsts as u,StandardTokenType as T}from"../../../../common/encodedTokenAttributes.js";import{EncodedTokenizationResult as y,TokenizationRegistry as S}from"../../../../common/languages.js";import{ILanguageService as B}from"../../../../common/languages/language.js";import{ILanguageConfigurationService as w}from"../../../../common/languages/languageConfigurationRegistry.js";import{LanguageAgnosticBracketTokens as L}from"../../../../common/model/bracketPairsTextModelPart/bracketPairsTree/brackets.js";import{lengthAdd as b,lengthsToRange as M,lengthZero as A}from"../../../../common/model/bracketPairsTextModelPart/bracketPairsTree/length.js";import{DenseKeyProvider as z}from"../../../../common/model/bracketPairsTextModelPart/bracketPairsTree/smallImmutableSet.js";import{TextBufferTokenizer as C,TokenKind as p}from"../../../../common/model/bracketPairsTextModelPart/bracketPairsTree/tokenizer.js";import"../../../../common/model/textModel.js";import{createModelServices as E,instantiateTextModel as v}from"../../testTextModel.js";suite("Bracket Pair Colorizer - Tokenizer",()=>{x(),test("Basic",()=>{const o="testMode1",e=new h,t=E(e),n=t.get(w),a=t.get(B);e.add(a.registerLanguage({id:o}));const r=a.languageIdCodec.encodeLanguageId(o),s=new z,i=c=>new g(c,r,T.Other,!0),k=c=>new g(c,r,T.Comment,!0),d=new K([i(" { } "),i("be"),i("gin end"),i(`
`),i("hello"),k("{"),i("}")]);e.add(S.register(o,d.getTokenizationSupport())),e.add(n.register(o,{brackets:[["{","}"],["[","]"],["(",")"],["begin","end"]]}));const l=e.add(v(t,d.getText(),o));l.tokenization.forceTokenization(l.getLineCount());const I=new L(s,c=>n.getLanguageConfiguration(c)),m=N(new C(l,I));f.deepStrictEqual(O(m,l,s),[{text:" ",bracketId:null,bracketIds:[],kind:"Text"},{text:"{",bracketId:"testMode1:::{",bracketIds:["testMode1:::{"],kind:"OpeningBracket"},{text:" ",bracketId:null,bracketIds:[],kind:"Text"},{text:"}",bracketId:"testMode1:::{",bracketIds:["testMode1:::{"],kind:"ClosingBracket"},{text:" ",bracketId:null,bracketIds:[],kind:"Text"},{text:"begin",bracketId:"testMode1:::begin",bracketIds:["testMode1:::begin"],kind:"OpeningBracket"},{text:" ",bracketId:null,bracketIds:[],kind:"Text"},{text:"end",bracketId:"testMode1:::begin",bracketIds:["testMode1:::begin"],kind:"ClosingBracket"},{text:`
hello{`,bracketId:null,bracketIds:[],kind:"Text"},{text:"}",bracketId:"testMode1:::{",bracketIds:["testMode1:::{"],kind:"ClosingBracket"}]),e.dispose()})});function N(o){const e=new Array;for(;;){const t=o.read();if(!t)break;e.push(t)}return e}function O(o,e,t){const n=new Array;let a=A;for(const r of o)n.push(D(r,a,e,t)),a=b(a,r.length);return n}function D(o,e,t,n){return{text:t.getValueInRange(M(e,b(e,o.length))),bracketId:n.reverseLookup(o.bracketId)||null,bracketIds:n.reverseLookupSet(o.bracketIds),kind:{[p.ClosingBracket]:"ClosingBracket",[p.OpeningBracket]:"OpeningBracket",[p.Text]:"Text"}[o.kind]}}class K{tokensByLine;constructor(e){const t=new Array;let n=new Array;for(const a of e){const r=a.text.split(`
`);let s=!0;for(;r.length>0;)s?s=!1:(t.push(n),n=new Array),r[0].length>0&&n.push(a.withText(r[0])),r.pop()}t.push(n),this.tokensByLine=t}getText(){return this.tokensByLine.map(e=>e.map(t=>t.text).join("")).join(`
`)}getTokenizationSupport(){class e{constructor(n){this.lineNumber=n}clone(){return new e(this.lineNumber)}equals(n){return this.lineNumber===n.lineNumber}}return{getInitialState:()=>new e(0),tokenize:()=>{throw new Error("Method not implemented.")},tokenizeEncoded:(t,n,a)=>{const r=a,s=this.tokensByLine[r.lineNumber],i=new Array;let k=0;for(const d of s)i.push(k,d.getMetadata()),k+=d.text.length;return new y(new Uint32Array(i),new e(r.lineNumber+1))}}}}class g{constructor(e,t,n,a){this.text=e;this.languageId=t;this.tokenType=n;this.hasBalancedBrackets=a}getMetadata(){return(this.languageId<<u.LANGUAGEID_OFFSET|this.tokenType<<u.TOKEN_TYPE_OFFSET)>>>0|(this.hasBalancedBrackets?u.BALANCED_BRACKETS_MASK:0)}withText(e){return new g(e,this.languageId,this.tokenType,this.hasBalancedBrackets)}}export{g as TokenInfo,K as TokenizedDocument};
