import{TreeSitterTokenizationRegistry as o}from"../languages.js";import{LineTokens as n}from"../tokens/lineTokens.js";import{StandardTokenType as a}from"../encodedTokenAttributes.js";import"./textModel.js";import"../services/treeSitterParserService.js";import"../textModelEvents.js";import{AbstractTokens as s}from"./tokens.js";import"../tokenizationTextModelPart.js";class z extends s{constructor(e,t,i,r){super(t,i,r);this._treeSitterService=e;this._initialize()}_tokenizationSupport=null;_lastLanguageId;_initialize(){const e=this.getLanguageId();(!this._tokenizationSupport||this._lastLanguageId!==e)&&(this._lastLanguageId=e,this._tokenizationSupport=o.get(e))}getLineTokens(e){const t=this._textModel.getLineContent(e);if(this._tokenizationSupport){const i=this._tokenizationSupport.tokenizeEncoded(e,this._textModel);if(i)return new n(i,t,this._languageIdCodec)}return n.createEmpty(t,this._languageIdCodec)}resetTokenization(e=!0){e&&this._onDidChangeTokens.fire({semanticTokensApplied:!1,ranges:[{fromLineNumber:1,toLineNumber:this._textModel.getLineCount()}]}),this._initialize()}handleDidChangeAttached(){}handleDidChangeContent(e){e.isFlush&&this.resetTokenization(!1)}forceTokenization(e){}hasAccurateTokensForLine(e){return!0}isCheapToTokenize(e){return!0}getTokenTypeIfInsertingCharacter(e,t,i){return a.Other}tokenizeLineWithEdit(e,t){return{mainLineTokens:null,additionalLines:null}}get hasTokens(){return this._treeSitterService.getParseResult(this._textModel)!==void 0}}export{z as TreeSitterTokens};
