import{CharCode as V}from"../../../base/common/charCode.js";import{illegalArgument as X}from"../../../base/common/errors.js";import"../../../base/common/event.js";import"../../../base/common/lifecycle.js";import{isChrome as Q,isEdge as H,isFirefox as J,isLinux as Z,isMacintosh as $,isSafari as ee,isWeb as L,isWindows as te}from"../../../base/common/platform.js";import{isFalsyOrWhitespace as ne}from"../../../base/common/strings.js";import{localize as f}from"../../../nls.js";import{createDecorator as re}from"../../instantiation/common/instantiation.js";import{Scanner as I,TokenType as o}from"./scanner.js";const l=new Map;l.set("false",!1),l.set("true",!0),l.set("isMac",$),l.set("isLinux",Z),l.set("isWindows",te),l.set("isWeb",L),l.set("isMacNative",$&&!L),l.set("isEdge",H),l.set("isFirefox",J),l.set("isChrome",Q),l.set("isSafari",ee);function Ne(i,e){if(l.get(i)!==void 0)throw X("contextkey.setConstant(k, v) invoked with already set constant `k`");l.set(i,e)}const se=Object.prototype.hasOwnProperty;var ie=(a=>(a[a.False=0]="False",a[a.True=1]="True",a[a.Defined=2]="Defined",a[a.Not=3]="Not",a[a.Equals=4]="Equals",a[a.NotEquals=5]="NotEquals",a[a.And=6]="And",a[a.Regex=7]="Regex",a[a.NotRegex=8]="NotRegex",a[a.Or=9]="Or",a[a.In=10]="In",a[a.NotIn=11]="NotIn",a[a.Greater=12]="Greater",a[a.GreaterEquals=13]="GreaterEquals",a[a.Smaller=14]="Smaller",a[a.SmallerEquals=15]="SmallerEquals",a))(ie||{});const oe={regexParsingWithErrorRecovery:!0},ae=f("contextkey.parser.error.emptyString","Empty context key expression"),ue=f("contextkey.parser.error.emptyString.hint","Did you forget to write an expression? You can also put 'false' or 'true' to always evaluate to false or true, respectively."),pe=f("contextkey.parser.error.noInAfterNot","'in' after 'not'."),B=f("contextkey.parser.error.closingParenthesis","closing parenthesis ')'"),le=f("contextkey.parser.error.unexpectedToken","Unexpected token"),xe=f("contextkey.parser.error.unexpectedToken.hint","Did you forget to put && or || before the token?"),ce=f("contextkey.parser.error.unexpectedEOF","Unexpected end of expression"),ye=f("contextkey.parser.error.unexpectedEOF.hint","Did you forget to put a context key?");class m{constructor(e=oe){this._config=e}static _parseError=new Error;_scanner=new I;_tokens=[];_current=0;_parsingErrors=[];get lexingErrors(){return this._scanner.errors}get parsingErrors(){return this._parsingErrors}parse(e){if(e===""){this._parsingErrors.push({message:ae,offset:0,lexeme:"",additionalInfo:ue});return}this._tokens=this._scanner.reset(e).scan(),this._current=0,this._parsingErrors=[];try{const t=this._expr();if(!this._isAtEnd()){const r=this._peek(),n=r.type===o.Str?xe:void 0;throw this._parsingErrors.push({message:le,offset:r.offset,lexeme:I.getLexeme(r),additionalInfo:n}),m._parseError}return t}catch(t){if(t!==m._parseError)throw t;return}}_expr(){return this._or()}_or(){const e=[this._and()];for(;this._matchOne(o.Or);){const t=this._and();e.push(t)}return e.length===1?e[0]:y.or(...e)}_and(){const e=[this._term()];for(;this._matchOne(o.And);){const t=this._term();e.push(t)}return e.length===1?e[0]:y.and(...e)}_term(){if(this._matchOne(o.Neg)){const e=this._peek();switch(e.type){case o.True:return this._advance(),c.INSTANCE;case o.False:return this._advance(),h.INSTANCE;case o.LParen:{this._advance();const t=this._expr();return this._consume(o.RParen,B),t?.negate()}case o.Str:return this._advance(),v.create(e.lexeme);default:throw this._errExpectedButGot("KEY | true | false | '(' expression ')'",e)}}return this._primary()}_primary(){const e=this._peek();switch(e.type){case o.True:return this._advance(),y.true();case o.False:return this._advance(),y.false();case o.LParen:{this._advance();const t=this._expr();return this._consume(o.RParen,B),t}case o.Str:{const t=e.lexeme;if(this._advance(),this._matchOne(o.RegexOp)){const n=this._peek();if(!this._config.regexParsingWithErrorRecovery){if(this._advance(),n.type!==o.RegexStr)throw this._errExpectedButGot("REGEX",n);const u=n.lexeme,s=u.lastIndexOf("/"),p=s===u.length-1?void 0:this._removeFlagsGY(u.substring(s+1));let x;try{x=new RegExp(u.substring(1,s),p)}catch{throw this._errExpectedButGot("REGEX",n)}return R.create(t,x)}switch(n.type){case o.RegexStr:case o.Error:{const u=[n.lexeme];this._advance();let s=this._peek(),p=0;for(let g=0;g<n.lexeme.length;g++)n.lexeme.charCodeAt(g)===V.OpenParen?p++:n.lexeme.charCodeAt(g)===V.CloseParen&&p--;for(;!this._isAtEnd()&&s.type!==o.And&&s.type!==o.Or;){switch(s.type){case o.LParen:p++;break;case o.RParen:p--;break;case o.RegexStr:case o.QuotedStr:for(let g=0;g<s.lexeme.length;g++)s.lexeme.charCodeAt(g)===V.OpenParen?p++:n.lexeme.charCodeAt(g)===V.CloseParen&&p--}if(p<0)break;u.push(I.getLexeme(s)),this._advance(),s=this._peek()}const x=u.join(""),d=x.lastIndexOf("/"),k=d===x.length-1?void 0:this._removeFlagsGY(x.substring(d+1));let P;try{P=new RegExp(x.substring(1,d),k)}catch{throw this._errExpectedButGot("REGEX",n)}return y.regex(t,P)}case o.QuotedStr:{const u=n.lexeme;this._advance();let s=null;if(!ne(u)){const p=u.indexOf("/"),x=u.lastIndexOf("/");if(p!==x&&p>=0){const d=u.slice(p+1,x),k=u[x+1]==="i"?"i":"";try{s=new RegExp(d,k)}catch{throw this._errExpectedButGot("REGEX",n)}}}if(s===null)throw this._errExpectedButGot("REGEX",n);return R.create(t,s)}default:throw this._errExpectedButGot("REGEX",this._peek())}}if(this._matchOne(o.Not)){this._consume(o.In,pe);const n=this._value();return y.notIn(t,n)}switch(this._peek().type){case o.Eq:{this._advance();const n=this._value();if(this._previous().type===o.QuotedStr)return y.equals(t,n);switch(n){case"true":return y.has(t);case"false":return y.not(t);default:return y.equals(t,n)}}case o.NotEq:{this._advance();const n=this._value();if(this._previous().type===o.QuotedStr)return y.notEquals(t,n);switch(n){case"true":return y.not(t);case"false":return y.has(t);default:return y.notEquals(t,n)}}case o.Lt:return this._advance(),w.create(t,this._value());case o.LtEq:return this._advance(),q.create(t,this._value());case o.Gt:return this._advance(),T.create(t,this._value());case o.GtEq:return this._advance(),A.create(t,this._value());case o.In:return this._advance(),y.in(t,this._value());default:return y.has(t)}}case o.EOF:throw this._parsingErrors.push({message:ce,offset:e.offset,lexeme:"",additionalInfo:ye}),m._parseError;default:throw this._errExpectedButGot(`true | false | KEY 
	| KEY '=~' REGEX 
	| KEY ('==' | '!=' | '<' | '<=' | '>' | '>=' | 'in' | 'not' 'in') value`,this._peek())}}_value(){const e=this._peek();switch(e.type){case o.Str:case o.QuotedStr:return this._advance(),e.lexeme;case o.True:return this._advance(),"true";case o.False:return this._advance(),"false";case o.In:return this._advance(),"in";default:return""}}_flagsGYRe=/g|y/g;_removeFlagsGY(e){return e.replaceAll(this._flagsGYRe,"")}_previous(){return this._tokens[this._current-1]}_matchOne(e){return this._check(e)?(this._advance(),!0):!1}_advance(){return this._isAtEnd()||this._current++,this._previous()}_consume(e,t){if(this._check(e))return this._advance();throw this._errExpectedButGot(t,this._peek())}_errExpectedButGot(e,t,r){const n=f("contextkey.parser.error.expectedButGot",`Expected: {0}
Received: '{1}'.`,e,I.getLexeme(t)),u=t.offset,s=I.getLexeme(t);return this._parsingErrors.push({message:n,offset:u,lexeme:s,additionalInfo:r}),m._parseError}_check(e){return this._peek().type===e}_peek(){return this._tokens[this._current]}_isAtEnd(){return this._peek().type===o.EOF}}class y{static false(){return c.INSTANCE}static true(){return h.INSTANCE}static has(e){return K.create(e)}static equals(e,t){return N.create(e,t)}static notEquals(e,t){return S.create(e,t)}static regex(e,t){return R.create(e,t)}static in(e,t){return O.create(e,t)}static notIn(e,t){return z.create(e,t)}static not(e){return v.create(e)}static and(...e){return C.create(e,null,!0)}static or(...e){return E.create(e,null,!0)}static greater(e,t){return T.create(e,t)}static greaterEquals(e,t){return A.create(e,t)}static smaller(e,t){return w.create(e,t)}static smallerEquals(e,t){return q.create(e,t)}static _parser=new m({regexParsingWithErrorRecovery:!1});static deserialize(e){return e==null?void 0:this._parser.parse(e)}}function Se(i){const e=new m({regexParsingWithErrorRecovery:!1});return i.map(t=>(e.parse(t),e.lexingErrors.length>0?e.lexingErrors.map(r=>({errorMessage:r.additionalInfo?f("contextkey.scanner.errorForLinterWithHint","Unexpected token. Hint: {0}",r.additionalInfo):f("contextkey.scanner.errorForLinter","Unexpected token."),offset:r.offset,length:r.lexeme.length})):e.parsingErrors.length>0?e.parsingErrors.map(r=>({errorMessage:r.additionalInfo?`${r.message}. ${r.additionalInfo}`:r.message,offset:r.offset,length:r.lexeme.length})):[]))}function Te(i,e){const t=i?i.substituteConstants():void 0,r=e?e.substituteConstants():void 0;return!t&&!r?!0:!t||!r?!1:t.equals(r)}function _(i,e){return i.cmp(e)}class c{static INSTANCE=new c;type=0;constructor(){}cmp(e){return this.type-e.type}equals(e){return e.type===this.type}substituteConstants(){return this}evaluate(e){return!1}serialize(){return"false"}keys(){return[]}map(e){return this}negate(){return h.INSTANCE}}class h{static INSTANCE=new h;type=1;constructor(){}cmp(e){return this.type-e.type}equals(e){return e.type===this.type}substituteConstants(){return this}evaluate(e){return!0}serialize(){return"true"}keys(){return[]}map(e){return this}negate(){return c.INSTANCE}}class K{constructor(e,t){this.key=e;this.negated=t}static create(e,t=null){const r=l.get(e);return typeof r=="boolean"?r?h.INSTANCE:c.INSTANCE:new K(e,t)}type=2;cmp(e){return e.type!==this.type?this.type-e.type:D(this.key,e.key)}equals(e){return e.type===this.type?this.key===e.key:!1}substituteConstants(){const e=l.get(this.key);return typeof e=="boolean"?e?h.INSTANCE:c.INSTANCE:this}evaluate(e){return!!e.getValue(this.key)}serialize(){return this.key}keys(){return[this.key]}map(e){return e.mapDefined(this.key)}negate(){return this.negated||(this.negated=v.create(this.key,this)),this.negated}}class N{constructor(e,t,r){this.key=e;this.value=t;this.negated=r}static create(e,t,r=null){if(typeof t=="boolean")return t?K.create(e,r):v.create(e,r);const n=l.get(e);return typeof n=="boolean"?t===(n?"true":"false")?h.INSTANCE:c.INSTANCE:new N(e,t,r)}type=4;cmp(e){return e.type!==this.type?this.type-e.type:b(this.key,this.value,e.key,e.value)}equals(e){return e.type===this.type?this.key===e.key&&this.value===e.value:!1}substituteConstants(){const e=l.get(this.key);if(typeof e=="boolean"){const t=e?"true":"false";return this.value===t?h.INSTANCE:c.INSTANCE}return this}evaluate(e){return e.getValue(this.key)==this.value}serialize(){return`${this.key} == '${this.value}'`}keys(){return[this.key]}map(e){return e.mapEquals(this.key,this.value)}negate(){return this.negated||(this.negated=S.create(this.key,this.value,this)),this.negated}}class O{constructor(e,t){this.key=e;this.valueKey=t}static create(e,t){return new O(e,t)}type=10;negated=null;cmp(e){return e.type!==this.type?this.type-e.type:b(this.key,this.valueKey,e.key,e.valueKey)}equals(e){return e.type===this.type?this.key===e.key&&this.valueKey===e.valueKey:!1}substituteConstants(){return this}evaluate(e){const t=e.getValue(this.valueKey),r=e.getValue(this.key);return Array.isArray(t)?t.includes(r):typeof r=="string"&&typeof t=="object"&&t!==null?se.call(t,r):!1}serialize(){return`${this.key} in '${this.valueKey}'`}keys(){return[this.key,this.valueKey]}map(e){return e.mapIn(this.key,this.valueKey)}negate(){return this.negated||(this.negated=z.create(this.key,this.valueKey)),this.negated}}class z{constructor(e,t){this.key=e;this.valueKey=t;this._negated=O.create(e,t)}static create(e,t){return new z(e,t)}type=11;_negated;cmp(e){return e.type!==this.type?this.type-e.type:this._negated.cmp(e._negated)}equals(e){return e.type===this.type?this._negated.equals(e._negated):!1}substituteConstants(){return this}evaluate(e){return!this._negated.evaluate(e)}serialize(){return`${this.key} not in '${this.valueKey}'`}keys(){return this._negated.keys()}map(e){return e.mapNotIn(this.key,this.valueKey)}negate(){return this._negated}}class S{constructor(e,t,r){this.key=e;this.value=t;this.negated=r}static create(e,t,r=null){if(typeof t=="boolean")return t?v.create(e,r):K.create(e,r);const n=l.get(e);return typeof n=="boolean"?t===(n?"true":"false")?c.INSTANCE:h.INSTANCE:new S(e,t,r)}type=5;cmp(e){return e.type!==this.type?this.type-e.type:b(this.key,this.value,e.key,e.value)}equals(e){return e.type===this.type?this.key===e.key&&this.value===e.value:!1}substituteConstants(){const e=l.get(this.key);if(typeof e=="boolean"){const t=e?"true":"false";return this.value===t?c.INSTANCE:h.INSTANCE}return this}evaluate(e){return e.getValue(this.key)!=this.value}serialize(){return`${this.key} != '${this.value}'`}keys(){return[this.key]}map(e){return e.mapNotEquals(this.key,this.value)}negate(){return this.negated||(this.negated=N.create(this.key,this.value,this)),this.negated}}class v{constructor(e,t){this.key=e;this.negated=t}static create(e,t=null){const r=l.get(e);return typeof r=="boolean"?r?c.INSTANCE:h.INSTANCE:new v(e,t)}type=3;cmp(e){return e.type!==this.type?this.type-e.type:D(this.key,e.key)}equals(e){return e.type===this.type?this.key===e.key:!1}substituteConstants(){const e=l.get(this.key);return typeof e=="boolean"?e?c.INSTANCE:h.INSTANCE:this}evaluate(e){return!e.getValue(this.key)}serialize(){return`!${this.key}`}keys(){return[this.key]}map(e){return e.mapNot(this.key)}negate(){return this.negated||(this.negated=K.create(this.key,this)),this.negated}}function F(i,e){if(typeof i=="string"){const t=parseFloat(i);isNaN(t)||(i=t)}return typeof i=="string"||typeof i=="number"?e(i):c.INSTANCE}class T{constructor(e,t,r){this.key=e;this.value=t;this.negated=r}static create(e,t,r=null){return F(t,n=>new T(e,n,r))}type=12;cmp(e){return e.type!==this.type?this.type-e.type:b(this.key,this.value,e.key,e.value)}equals(e){return e.type===this.type?this.key===e.key&&this.value===e.value:!1}substituteConstants(){return this}evaluate(e){return typeof this.value=="string"?!1:parseFloat(e.getValue(this.key))>this.value}serialize(){return`${this.key} > ${this.value}`}keys(){return[this.key]}map(e){return e.mapGreater(this.key,this.value)}negate(){return this.negated||(this.negated=q.create(this.key,this.value,this)),this.negated}}class A{constructor(e,t,r){this.key=e;this.value=t;this.negated=r}static create(e,t,r=null){return F(t,n=>new A(e,n,r))}type=13;cmp(e){return e.type!==this.type?this.type-e.type:b(this.key,this.value,e.key,e.value)}equals(e){return e.type===this.type?this.key===e.key&&this.value===e.value:!1}substituteConstants(){return this}evaluate(e){return typeof this.value=="string"?!1:parseFloat(e.getValue(this.key))>=this.value}serialize(){return`${this.key} >= ${this.value}`}keys(){return[this.key]}map(e){return e.mapGreaterEquals(this.key,this.value)}negate(){return this.negated||(this.negated=w.create(this.key,this.value,this)),this.negated}}class w{constructor(e,t,r){this.key=e;this.value=t;this.negated=r}static create(e,t,r=null){return F(t,n=>new w(e,n,r))}type=14;cmp(e){return e.type!==this.type?this.type-e.type:b(this.key,this.value,e.key,e.value)}equals(e){return e.type===this.type?this.key===e.key&&this.value===e.value:!1}substituteConstants(){return this}evaluate(e){return typeof this.value=="string"?!1:parseFloat(e.getValue(this.key))<this.value}serialize(){return`${this.key} < ${this.value}`}keys(){return[this.key]}map(e){return e.mapSmaller(this.key,this.value)}negate(){return this.negated||(this.negated=A.create(this.key,this.value,this)),this.negated}}class q{constructor(e,t,r){this.key=e;this.value=t;this.negated=r}static create(e,t,r=null){return F(t,n=>new q(e,n,r))}type=15;cmp(e){return e.type!==this.type?this.type-e.type:b(this.key,this.value,e.key,e.value)}equals(e){return e.type===this.type?this.key===e.key&&this.value===e.value:!1}substituteConstants(){return this}evaluate(e){return typeof this.value=="string"?!1:parseFloat(e.getValue(this.key))<=this.value}serialize(){return`${this.key} <= ${this.value}`}keys(){return[this.key]}map(e){return e.mapSmallerEquals(this.key,this.value)}negate(){return this.negated||(this.negated=T.create(this.key,this.value,this)),this.negated}}class R{constructor(e,t){this.key=e;this.regexp=t}static create(e,t){return new R(e,t)}type=7;negated=null;cmp(e){if(e.type!==this.type)return this.type-e.type;if(this.key<e.key)return-1;if(this.key>e.key)return 1;const t=this.regexp?this.regexp.source:"",r=e.regexp?e.regexp.source:"";return t<r?-1:t>r?1:0}equals(e){if(e.type===this.type){const t=this.regexp?this.regexp.source:"",r=e.regexp?e.regexp.source:"";return this.key===e.key&&t===r}return!1}substituteConstants(){return this}evaluate(e){const t=e.getValue(this.key);return this.regexp?this.regexp.test(t):!1}serialize(){const e=this.regexp?`/${this.regexp.source}/${this.regexp.flags}`:"/invalid/";return`${this.key} =~ ${e}`}keys(){return[this.key]}map(e){return e.mapRegex(this.key,this.regexp)}negate(){return this.negated||(this.negated=M.create(this)),this.negated}}class M{constructor(e){this._actual=e}static create(e){return new M(e)}type=8;cmp(e){return e.type!==this.type?this.type-e.type:this._actual.cmp(e._actual)}equals(e){return e.type===this.type?this._actual.equals(e._actual):!1}substituteConstants(){return this}evaluate(e){return!this._actual.evaluate(e)}serialize(){return`!(${this._actual.serialize()})`}keys(){return this._actual.keys()}map(e){return new M(this._actual.map(e))}negate(){return this._actual}}function W(i){let e=null;for(let t=0,r=i.length;t<r;t++){const n=i[t].substituteConstants();if(i[t]!==n&&e===null){e=[];for(let u=0;u<t;u++)e[u]=i[u]}e!==null&&(e[t]=n)}return e===null?i:e}class C{constructor(e,t){this.expr=e;this.negated=t}static create(e,t,r){return C._normalizeArr(e,t,r)}type=6;cmp(e){if(e.type!==this.type)return this.type-e.type;if(this.expr.length<e.expr.length)return-1;if(this.expr.length>e.expr.length)return 1;for(let t=0,r=this.expr.length;t<r;t++){const n=_(this.expr[t],e.expr[t]);if(n!==0)return n}return 0}equals(e){if(e.type===this.type){if(this.expr.length!==e.expr.length)return!1;for(let t=0,r=this.expr.length;t<r;t++)if(!this.expr[t].equals(e.expr[t]))return!1;return!0}return!1}substituteConstants(){const e=W(this.expr);return e===this.expr?this:C.create(e,this.negated,!1)}evaluate(e){for(let t=0,r=this.expr.length;t<r;t++)if(!this.expr[t].evaluate(e))return!1;return!0}static _normalizeArr(e,t,r){const n=[];let u=!1;for(const s of e)if(s){if(s.type===1){u=!0;continue}if(s.type===0)return c.INSTANCE;if(s.type===6){n.push(...s.expr);continue}n.push(s)}if(n.length===0&&u)return h.INSTANCE;if(n.length!==0){if(n.length===1)return n[0];n.sort(_);for(let s=1;s<n.length;s++)n[s-1].equals(n[s])&&(n.splice(s,1),s--);if(n.length===1)return n[0];for(;n.length>1;){const s=n[n.length-1];if(s.type!==9)break;n.pop();const p=n.pop(),x=n.length===0,d=E.create(s.expr.map(k=>C.create([k,p],null,r)),null,x);d&&(n.push(d),n.sort(_))}if(n.length===1)return n[0];if(r){for(let s=0;s<n.length;s++)for(let p=s+1;p<n.length;p++)if(n[s].negate().equals(n[p]))return c.INSTANCE;if(n.length===1)return n[0]}return new C(n,t)}}serialize(){return this.expr.map(e=>e.serialize()).join(" && ")}keys(){const e=[];for(const t of this.expr)e.push(...t.keys());return e}map(e){return new C(this.expr.map(t=>t.map(e)),null)}negate(){if(!this.negated){const e=[];for(const t of this.expr)e.push(t.negate());this.negated=E.create(e,this,!0)}return this.negated}}class E{constructor(e,t){this.expr=e;this.negated=t}static create(e,t,r){return E._normalizeArr(e,t,r)}type=9;cmp(e){if(e.type!==this.type)return this.type-e.type;if(this.expr.length<e.expr.length)return-1;if(this.expr.length>e.expr.length)return 1;for(let t=0,r=this.expr.length;t<r;t++){const n=_(this.expr[t],e.expr[t]);if(n!==0)return n}return 0}equals(e){if(e.type===this.type){if(this.expr.length!==e.expr.length)return!1;for(let t=0,r=this.expr.length;t<r;t++)if(!this.expr[t].equals(e.expr[t]))return!1;return!0}return!1}substituteConstants(){const e=W(this.expr);return e===this.expr?this:E.create(e,this.negated,!1)}evaluate(e){for(let t=0,r=this.expr.length;t<r;t++)if(this.expr[t].evaluate(e))return!0;return!1}static _normalizeArr(e,t,r){let n=[],u=!1;if(e){for(let s=0,p=e.length;s<p;s++){const x=e[s];if(x){if(x.type===0){u=!0;continue}if(x.type===1)return h.INSTANCE;if(x.type===9){n=n.concat(x.expr);continue}n.push(x)}}if(n.length===0&&u)return c.INSTANCE;n.sort(_)}if(n.length!==0){if(n.length===1)return n[0];for(let s=1;s<n.length;s++)n[s-1].equals(n[s])&&(n.splice(s,1),s--);if(n.length===1)return n[0];if(r){for(let s=0;s<n.length;s++)for(let p=s+1;p<n.length;p++)if(n[s].negate().equals(n[p]))return h.INSTANCE;if(n.length===1)return n[0]}return new E(n,t)}}serialize(){return this.expr.map(e=>e.serialize()).join(" || ")}keys(){const e=[];for(const t of this.expr)e.push(...t.keys());return e}map(e){return new E(this.expr.map(t=>t.map(e)),null)}negate(){if(!this.negated){const e=[];for(const t of this.expr)e.push(t.negate());for(;e.length>1;){const t=e.shift(),r=e.shift(),n=[];for(const u of U(t))for(const s of U(r))n.push(C.create([u,s],null,!1));e.unshift(E.create(n,null,!1))}this.negated=E.create(e,this,!0)}return this.negated}}class G extends K{static _info=[];static all(){return G._info.values()}_defaultValue;constructor(e,t,r){super(e,null),this._defaultValue=t,typeof r=="object"?G._info.push({...r,key:e}):r!==!0&&G._info.push({key:e,description:r,type:t!=null?typeof t:void 0})}bindTo(e){return e.createKey(this.key,this._defaultValue)}getValue(e){return e.getContextKeyValue(this.key)}toNegated(){return this.negate()}isEqualTo(e){return N.create(this.key,e)}notEqualsTo(e){return S.create(this.key,e)}}const Ae=re("contextKeyService");function D(i,e){return i<e?-1:i>e?1:0}function b(i,e,t,r){return i<t?-1:i>t?1:e<r?-1:e>r?1:0}function Y(i,e){if(i.type===0||e.type===1)return!0;if(i.type===9)return e.type===9?j(i.expr,e.expr):!1;if(e.type===9){for(const t of e.expr)if(Y(i,t))return!0;return!1}if(i.type===6){if(e.type===6)return j(e.expr,i.expr);for(const t of i.expr)if(Y(t,e))return!0;return!1}return i.equals(e)}function j(i,e){let t=0,r=0;for(;t<i.length&&r<e.length;){const n=i[t].cmp(e[r]);if(n<0)return!1;n===0&&t++,r++}return t===i.length}function U(i){return i.type===9?i.expr:[i]}export{C as ContextKeyAndExpr,K as ContextKeyDefinedExpr,N as ContextKeyEqualsExpr,y as ContextKeyExpr,ie as ContextKeyExprType,c as ContextKeyFalseExpr,A as ContextKeyGreaterEqualsExpr,T as ContextKeyGreaterExpr,O as ContextKeyInExpr,S as ContextKeyNotEqualsExpr,v as ContextKeyNotExpr,z as ContextKeyNotInExpr,M as ContextKeyNotRegexExpr,E as ContextKeyOrExpr,R as ContextKeyRegexExpr,q as ContextKeySmallerEqualsExpr,w as ContextKeySmallerExpr,h as ContextKeyTrueExpr,Ae as IContextKeyService,m as Parser,G as RawContextKey,Te as expressionsAreEqualWithConstantSubstitution,Y as implies,Ne as setConstant,Se as validateWhenClauses};
