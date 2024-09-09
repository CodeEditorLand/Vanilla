import{CharCode as r}from"../../../base/common/charCode.js";import{illegalState as c}from"../../../base/common/errors.js";import{localize as o}from"../../../nls.js";var T=(e=>(e[e.LParen=0]="LParen",e[e.RParen=1]="RParen",e[e.Neg=2]="Neg",e[e.Eq=3]="Eq",e[e.NotEq=4]="NotEq",e[e.Lt=5]="Lt",e[e.LtEq=6]="LtEq",e[e.Gt=7]="Gt",e[e.GtEq=8]="GtEq",e[e.RegexOp=9]="RegexOp",e[e.RegexStr=10]="RegexStr",e[e.True=11]="True",e[e.False=12]="False",e[e.In=13]="In",e[e.Not=14]="Not",e[e.And=15]="And",e[e.Or=16]="Or",e[e.Str=17]="Str",e[e.QuotedStr=18]="QuotedStr",e[e.Error=19]="Error",e[e.EOF=20]="EOF",e))(T||{});function h(...i){switch(i.length){case 1:return o("contextkey.scanner.hint.didYouMean1","Did you mean {0}?",i[0]);case 2:return o("contextkey.scanner.hint.didYouMean2","Did you mean {0} or {1}?",i[0],i[1]);case 3:return o("contextkey.scanner.hint.didYouMean3","Did you mean {0}, {1} or {2}?",i[0],i[1],i[2]);default:return}}const _=o("contextkey.scanner.hint.didYouForgetToOpenOrCloseQuote","Did you forget to open or close the quote?"),f=o("contextkey.scanner.hint.didYouForgetToEscapeSlash","Did you forget to escape the '/' (slash) character? Put two backslashes before it to escape, e.g., '\\\\/'.");class p{static getLexeme(t){switch(t.type){case 0:return"(";case 1:return")";case 2:return"!";case 3:return t.isTripleEq?"===":"==";case 4:return t.isTripleEq?"!==":"!=";case 5:return"<";case 6:return"<=";case 7:return">=";case 8:return">=";case 9:return"=~";case 10:return t.lexeme;case 11:return"true";case 12:return"false";case 13:return"in";case 14:return"not";case 15:return"&&";case 16:return"||";case 17:return t.lexeme;case 18:return t.lexeme;case 19:return t.lexeme;case 20:return"EOF";default:throw c(`unhandled token type: ${JSON.stringify(t)}; have you forgotten to add a case?`)}}static _regexFlags=new Set(["i","g","s","m","y","u"].map(t=>t.charCodeAt(0)));static _keywords=new Map([["not",14],["in",13],["false",12],["true",11]]);_input="";_start=0;_current=0;_tokens=[];_errors=[];get errors(){return this._errors}reset(t){return this._input=t,this._start=0,this._current=0,this._tokens=[],this._errors=[],this}scan(){for(;!this._isAtEnd();)switch(this._start=this._current,this._advance()){case r.OpenParen:this._addToken(0);break;case r.CloseParen:this._addToken(1);break;case r.ExclamationMark:if(this._match(r.Equals)){const s=this._match(r.Equals);this._tokens.push({type:4,offset:this._start,isTripleEq:s})}else this._addToken(2);break;case r.SingleQuote:this._quotedString();break;case r.Slash:this._regex();break;case r.Equals:if(this._match(r.Equals)){const s=this._match(r.Equals);this._tokens.push({type:3,offset:this._start,isTripleEq:s})}else this._match(r.Tilde)?this._addToken(9):this._error(h("==","=~"));break;case r.LessThan:this._addToken(this._match(r.Equals)?6:5);break;case r.GreaterThan:this._addToken(this._match(r.Equals)?8:7);break;case r.Ampersand:this._match(r.Ampersand)?this._addToken(15):this._error(h("&&"));break;case r.Pipe:this._match(r.Pipe)?this._addToken(16):this._error(h("||"));break;case r.Space:case r.CarriageReturn:case r.Tab:case r.LineFeed:case r.NoBreakSpace:break;default:this._string()}return this._start=this._current,this._addToken(20),Array.from(this._tokens)}_match(t){return this._isAtEnd()||this._input.charCodeAt(this._current)!==t?!1:(this._current++,!0)}_advance(){return this._input.charCodeAt(this._current++)}_peek(){return this._isAtEnd()?r.Null:this._input.charCodeAt(this._current)}_addToken(t){this._tokens.push({type:t,offset:this._start})}_error(t){const s=this._start,n=this._input.substring(this._start,this._current),u={type:19,offset:this._start,lexeme:n};this._errors.push({offset:s,lexeme:n,additionalInfo:t}),this._tokens.push(u)}stringRe=/[a-zA-Z0-9_<>\-\./\\:\*\?\+\[\]\^,#@;"%\$\p{L}-]+/uy;_string(){this.stringRe.lastIndex=this._start;const t=this.stringRe.exec(this._input);if(t){this._current=this._start+t[0].length;const s=this._input.substring(this._start,this._current),n=p._keywords.get(s);n?this._addToken(n):this._tokens.push({type:17,lexeme:s,offset:this._start})}}_quotedString(){for(;this._peek()!==r.SingleQuote&&!this._isAtEnd();)this._advance();if(this._isAtEnd()){this._error(_);return}this._advance(),this._tokens.push({type:18,lexeme:this._input.substring(this._start+1,this._current-1),offset:this._start+1})}_regex(){let t=this._current,s=!1,n=!1;for(;;){if(t>=this._input.length){this._current=t,this._error(f);return}const a=this._input.charCodeAt(t);if(s)s=!1;else if(a===r.Slash&&!n){t++;break}else a===r.OpenSquareBracket?n=!0:a===r.Backslash?s=!0:a===r.CloseSquareBracket&&(n=!1);t++}for(;t<this._input.length&&p._regexFlags.has(this._input.charCodeAt(t));)t++;this._current=t;const u=this._input.substring(this._start,this._current);this._tokens.push({type:10,lexeme:u,offset:this._start})}_isAtEnd(){return this._current>=this._input.length}}export{p as Scanner,T as TokenType};
