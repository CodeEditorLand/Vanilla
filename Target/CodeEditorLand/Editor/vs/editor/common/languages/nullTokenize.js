import{Token as l,TokenizationResult as r,EncodedTokenizationResult as u}from"../languages.js";import{FontStyle as i,ColorId as a,StandardTokenType as T,MetadataConsts as t}from"../encodedTokenAttributes.js";const S=new class{clone(){return this}equals(e){return this===e}};function c(e,n){return new r([new l(0,"",e)],n)}function I(e,n){const o=new Uint32Array(2);return o[0]=0,o[1]=(e<<t.LANGUAGEID_OFFSET|T.Other<<t.TOKEN_TYPE_OFFSET|i.None<<t.FONT_STYLE_OFFSET|a.DefaultForeground<<t.FOREGROUND_OFFSET|a.DefaultBackground<<t.BACKGROUND_OFFSET)>>>0,new u(o,n===null?S:n)}export{S as NullState,c as nullTokenize,I as nullTokenizeEncoded};
