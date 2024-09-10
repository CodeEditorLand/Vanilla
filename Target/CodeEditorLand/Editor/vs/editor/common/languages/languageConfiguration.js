import{CharCode as i}from"../../../base/common/charCode.js";import{StandardTokenType as s}from"../encodedTokenAttributes.js";var l=(e=>(e[e.None=0]="None",e[e.Indent=1]="Indent",e[e.IndentOutdent=2]="IndentOutdent",e[e.Outdent=3]="Outdent",e))(l||{});class c{open;close;_inString;_inComment;_inRegEx;_neutralCharacter=null;_neutralCharacterSearched=!1;constructor(t){if(this.open=t.open,this.close=t.close,this._inString=!0,this._inComment=!0,this._inRegEx=!0,Array.isArray(t.notIn))for(let n=0,r=t.notIn.length;n<r;n++)switch(t.notIn[n]){case"string":this._inString=!1;break;case"comment":this._inComment=!1;break;case"regex":this._inRegEx=!1;break}}isOK(t){switch(t){case s.Other:return!0;case s.Comment:return this._inComment;case s.String:return this._inString;case s.RegEx:return this._inRegEx}}shouldAutoClose(t,n){if(t.getTokenCount()===0)return!0;const r=t.findTokenIndexAtOffset(n-2),e=t.getStandardTokenType(r);return this.isOK(e)}_findNeutralCharacterInRange(t,n){for(let r=t;r<=n;r++){const e=String.fromCharCode(r);if(!this.open.includes(e)&&!this.close.includes(e))return e}return null}findNeutralCharacter(){return this._neutralCharacterSearched||(this._neutralCharacterSearched=!0,this._neutralCharacter||(this._neutralCharacter=this._findNeutralCharacterInRange(i.Digit0,i.Digit9)),this._neutralCharacter||(this._neutralCharacter=this._findNeutralCharacterInRange(i.a,i.z)),this._neutralCharacter||(this._neutralCharacter=this._findNeutralCharacterInRange(i.A,i.Z))),this._neutralCharacter}}class p{autoClosingPairsOpenByStart;autoClosingPairsOpenByEnd;autoClosingPairsCloseByStart;autoClosingPairsCloseByEnd;autoClosingPairsCloseSingleChar;constructor(t){this.autoClosingPairsOpenByStart=new Map,this.autoClosingPairsOpenByEnd=new Map,this.autoClosingPairsCloseByStart=new Map,this.autoClosingPairsCloseByEnd=new Map,this.autoClosingPairsCloseSingleChar=new Map;for(const n of t)o(this.autoClosingPairsOpenByStart,n.open.charAt(0),n),o(this.autoClosingPairsOpenByEnd,n.open.charAt(n.open.length-1),n),o(this.autoClosingPairsCloseByStart,n.close.charAt(0),n),o(this.autoClosingPairsCloseByEnd,n.close.charAt(n.close.length-1),n),n.close.length===1&&n.open.length===1&&o(this.autoClosingPairsCloseSingleChar,n.close,n)}}function o(a,t,n){a.has(t)?a.get(t).push(n):a.set(t,[n])}export{p as AutoClosingPairs,l as IndentAction,c as StandardAutoClosingPairConditional};
