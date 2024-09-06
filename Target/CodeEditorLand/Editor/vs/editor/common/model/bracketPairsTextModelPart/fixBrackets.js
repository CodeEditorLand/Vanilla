import"../../../../../vs/editor/common/languages/languageConfigurationRegistry.js";import{AstNodeKind as r}from"../../../../../vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/ast.js";import{LanguageAgnosticBracketTokens as T}from"../../../../../vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/brackets.js";import{lengthAdd as o,lengthGetColumnCountIfZeroLineCount as l,lengthZero as p}from"../../../../../vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/length.js";import{parseDocument as B}from"../../../../../vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/parser.js";import{DenseKeyProvider as d}from"../../../../../vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/smallImmutableSet.js";import{TextBufferTokenizer as C}from"../../../../../vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/tokenizer.js";import"../../../../../vs/editor/common/tokens/lineTokens.js";function Z(g,i){const k=new d,a=new T(k,e=>i.getLanguageConfiguration(e)),u=new C(new I([g]),a),m=B(u,[],void 0,!0);let c="";const L=g.getLineContent();function t(e,n){if(e.kind===r.Pair)if(t(e.openingBracket,n),n=o(n,e.openingBracket.length),e.child&&(t(e.child,n),n=o(n,e.child.length)),e.closingBracket)t(e.closingBracket,n),n=o(n,e.closingBracket.length);else{const h=a.getSingleLanguageBracketTokens(e.openingBracket.languageId).findClosingTokenText(e.openingBracket.bracketIds);c+=h}else if(e.kind!==r.UnexpectedClosingBracket){if(e.kind===r.Text||e.kind===r.Bracket)c+=L.substring(l(n),l(o(n,e.length)));else if(e.kind===r.List)for(const s of e.children)t(s,n),n=o(n,s.length)}}return t(m,p),c}class I{constructor(i){this.lines=i}getValue(){return this.lines.map(i=>i.getLineContent()).join(`
`)}getLineCount(){return this.lines.length}getLineLength(i){return this.lines[i-1].getLineContent().length}tokenization={getLineTokens:i=>this.lines[i-1]}}export{Z as fixBracketsInLine};
