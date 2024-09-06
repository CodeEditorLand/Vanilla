import{onUnexpectedError as R}from"../../../../../vs/base/common/errors.js";import*as p from"../../../../../vs/base/common/strings.js";import{EditorAutoIndentStrategy as l}from"../../../../../vs/editor/common/config/editorOptions.js";import{IndentAction as o}from"../../../../../vs/editor/common/languages/languageConfiguration.js";class a{_brackets;_regExpRules;constructor(t){t=t||{},t.brackets=t.brackets||[["(",")"],["{","}"],["[","]"]],this._brackets=[],t.brackets.forEach(e=>{const n=a._createOpenBracketRegExp(e[0]),i=a._createCloseBracketRegExp(e[1]);n&&i&&this._brackets.push({open:e[0],openRegExp:n,close:e[1],closeRegExp:i})}),this._regExpRules=t.onEnterRules||[]}onEnter(t,e,n,i){if(t>=l.Advanced)for(let r=0,c=this._regExpRules.length;r<c;r++){const s=this._regExpRules[r];if([{reg:s.beforeText,text:n},{reg:s.afterText,text:i},{reg:s.previousLineText,text:e}].every(g=>g.reg?(g.reg.lastIndex=0,g.reg.test(g.text)):!0))return s.action}if(t>=l.Brackets&&n.length>0&&i.length>0)for(let r=0,c=this._brackets.length;r<c;r++){const s=this._brackets[r];if(s.openRegExp.test(n)&&s.closeRegExp.test(i))return{indentAction:o.IndentOutdent}}if(t>=l.Brackets&&n.length>0){for(let r=0,c=this._brackets.length;r<c;r++)if(this._brackets[r].openRegExp.test(n))return{indentAction:o.Indent}}return null}static _createOpenBracketRegExp(t){let e=p.escapeRegExpCharacters(t);return/\B/.test(e.charAt(0))||(e="\\b"+e),e+="\\s*$",a._safeRegExp(e)}static _createCloseBracketRegExp(t){let e=p.escapeRegExpCharacters(t);return/\B/.test(e.charAt(e.length-1))||(e=e+"\\b"),e="^\\s*"+e,a._safeRegExp(e)}static _safeRegExp(t){try{return new RegExp(t)}catch(e){return R(e),null}}}export{a as OnEnterSupport};
