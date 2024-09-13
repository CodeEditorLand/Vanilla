import{assertNever as O}from"../../base/common/assert.js";import{Position as d}from"./core/position.js";import{InjectedTextCursorStops as l,PositionAffinity as r}from"./model.js";class m{constructor(t,i,s,n,e){this.injectionOffsets=t;this.injectionOptions=i;this.breakOffsets=s;this.breakOffsetsVisibleColumn=n;this.wrappedTextIndentLength=e}getOutputLineCount(){return this.breakOffsets.length}getMinOutputOffset(t){return t>0?this.wrappedTextIndentLength:0}getLineLength(t){const i=t>0?this.breakOffsets[t-1]:0;let n=this.breakOffsets[t]-i;return t>0&&(n+=this.wrappedTextIndentLength),n}getMaxOutputOffset(t){return this.getLineLength(t)}translateToInputOffset(t,i){t>0&&(i=Math.max(0,i-this.wrappedTextIndentLength));let n=t===0?i:this.breakOffsets[t-1]+i;if(this.injectionOffsets!==null)for(let e=0;e<this.injectionOffsets.length&&n>this.injectionOffsets[e];e++)n<this.injectionOffsets[e]+this.injectionOptions[e].content.length?n=this.injectionOffsets[e]:n-=this.injectionOptions[e].content.length;return n}translateToOutputPosition(t,i=r.None){let s=t;if(this.injectionOffsets!==null)for(let n=0;n<this.injectionOffsets.length&&!(t<this.injectionOffsets[n]||i!==r.Right&&t===this.injectionOffsets[n]);n++)s+=this.injectionOptions[n].content.length;return this.offsetInInputWithInjectionsToOutputPosition(s,i)}offsetInInputWithInjectionsToOutputPosition(t,i=r.None){let s=0,n=this.breakOffsets.length-1,e=0,f=0;for(;s<=n;){e=s+(n-s)/2|0;const c=this.breakOffsets[e];if(f=e>0?this.breakOffsets[e-1]:0,i===r.Left)if(t<=f)n=e-1;else if(t>c)s=e+1;else break;else if(t<f)n=e-1;else if(t>=c)s=e+1;else break}let u=t-f;return e>0&&(u+=this.wrappedTextIndentLength),new h(e,u)}normalizeOutputPosition(t,i,s){if(this.injectionOffsets!==null){const n=this.outputPositionToOffsetInInputWithInjections(t,i),e=this.normalizeOffsetInInputWithInjectionsAroundInjections(n,s);if(e!==n)return this.offsetInInputWithInjectionsToOutputPosition(e,s)}if(s===r.Left){if(t>0&&i===this.getMinOutputOffset(t))return new h(t-1,this.getMaxOutputOffset(t-1))}else if(s===r.Right){const n=this.getOutputLineCount()-1;if(t<n&&i===this.getMaxOutputOffset(t))return new h(t+1,this.getMinOutputOffset(t+1))}return new h(t,i)}outputPositionToOffsetInInputWithInjections(t,i){return t>0&&(i=Math.max(0,i-this.wrappedTextIndentLength)),(t>0?this.breakOffsets[t-1]:0)+i}normalizeOffsetInInputWithInjectionsAroundInjections(t,i){const s=this.getInjectedTextAtOffset(t);if(!s)return t;if(i===r.None){if(t===s.offsetInInputWithInjections+s.length&&p(this.injectionOptions[s.injectedTextIndex].cursorStops))return s.offsetInInputWithInjections+s.length;{let n=s.offsetInInputWithInjections;if(j(this.injectionOptions[s.injectedTextIndex].cursorStops))return n;let e=s.injectedTextIndex-1;for(;e>=0&&this.injectionOffsets[e]===this.injectionOffsets[s.injectedTextIndex]&&!(p(this.injectionOptions[e].cursorStops)||(n-=this.injectionOptions[e].content.length,j(this.injectionOptions[e].cursorStops)));)e--;return n}}else if(i===r.Right||i===r.RightOfInjectedText){let n=s.offsetInInputWithInjections+s.length,e=s.injectedTextIndex;for(;e+1<this.injectionOffsets.length&&this.injectionOffsets[e+1]===this.injectionOffsets[e];)n+=this.injectionOptions[e+1].content.length,e++;return n}else if(i===r.Left||i===r.LeftOfInjectedText){let n=s.offsetInInputWithInjections,e=s.injectedTextIndex;for(;e-1>=0&&this.injectionOffsets[e-1]===this.injectionOffsets[e];)n-=this.injectionOptions[e-1].content.length,e--;return n}O(i)}getInjectedText(t,i){const s=this.outputPositionToOffsetInInputWithInjections(t,i),n=this.getInjectedTextAtOffset(s);return n?{options:this.injectionOptions[n.injectedTextIndex]}:null}getInjectedTextAtOffset(t){const i=this.injectionOffsets,s=this.injectionOptions;if(i!==null){let n=0;for(let e=0;e<i.length;e++){const f=s[e].content.length,u=i[e]+n,c=i[e]+n+f;if(u>t)break;if(t<=c)return{injectedTextIndex:e,offsetInInputWithInjections:u,length:f};n+=f}}}}function p(o){return o==null?!0:o===l.Right||o===l.Both}function j(o){return o==null?!0:o===l.Left||o===l.Both}class g{constructor(t){this.options=t}}class h{outputLineIndex;outputOffset;constructor(t,i){this.outputLineIndex=t,this.outputOffset=i}toString(){return`${this.outputLineIndex}:${this.outputOffset}`}toPosition(t){return new d(t+this.outputLineIndex,this.outputOffset+1)}}export{g as InjectedText,m as ModelLineProjectionData,h as OutputPosition};
