import{ColorId as a,FontStyle as l,MetadataConsts as t,StandardTokenType as r}from"../../../../vs/editor/common/encodedTokenAttributes.js";import{EncodedTokenizationResult as u,Token as i,TokenizationResult as T}from"../../../../vs/editor/common/languages.js";const S=new class{clone(){return this}equals(e){return this===e}};function c(e,n){return new T([new i(0,"",e)],n)}function I(e,n){const o=new Uint32Array(2);return o[0]=0,o[1]=(e<<t.LANGUAGEID_OFFSET|r.Other<<t.TOKEN_TYPE_OFFSET|l.None<<t.FONT_STYLE_OFFSET|a.DefaultForeground<<t.FOREGROUND_OFFSET|a.DefaultBackground<<t.BACKGROUND_OFFSET)>>>0,new u(o,n===null?S:n)}export{S as NullState,c as nullTokenize,I as nullTokenizeEncoded};
