import{Disposable as o}from"../../../../../../vs/base/common/lifecycle.js";import{keepObserved as i}from"../../../../../../vs/base/common/observable.js";import"../../../../../../vs/editor/common/encodedTokenAttributes.js";import"../../../../../../vs/editor/common/languages.js";import{nullTokenizeEncoded as r}from"../../../../../../vs/editor/common/languages/nullTokenize.js";import"../../../../../../vs/editor/common/model.js";class x extends o{constructor(e,t,n,u){super();this._encodedLanguageId=e;this._actual=t;this._maxTokenizationLineLength=u;this._register(i(this._maxTokenizationLineLength)),this._register(n)}get backgroundTokenizerShouldOnlyVerifyTokens(){return this._actual.backgroundTokenizerShouldOnlyVerifyTokens}getInitialState(){return this._actual.getInitialState()}tokenize(e,t,n){throw new Error("Not supported!")}tokenizeEncoded(e,t,n){return e.length>=this._maxTokenizationLineLength.get()?r(this._encodedLanguageId,n):this._actual.tokenizeEncoded(e,t,n)}createBackgroundTokenizer(e,t){if(this._actual.createBackgroundTokenizer)return this._actual.createBackgroundTokenizer(e,t)}}export{x as TokenizationSupportWithLineLimit};