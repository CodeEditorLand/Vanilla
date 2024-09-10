import{TrackedRangeStickiness as S}from"../model.js";var W=(i=>(i.EditorHintDecoration="squiggly-hint",i.EditorInfoDecoration="squiggly-info",i.EditorWarningDecoration="squiggly-warning",i.EditorErrorDecoration="squiggly-error",i.EditorUnnecessaryDecoration="squiggly-unnecessary",i.EditorUnnecessaryInlineDecoration="squiggly-inline-unnecessary",i.EditorDeprecatedInlineDecoration="squiggly-inline-deprecated",i))(W||{}),G=(t=>(t[t.Black=0]="Black",t[t.Red=1]="Red",t))(G||{}),X=(s=>(s[s.ColorMask=1]="ColorMask",s[s.ColorMaskInverse=254]="ColorMaskInverse",s[s.ColorOffset=0]="ColorOffset",s[s.IsVisitedMask=2]="IsVisitedMask",s[s.IsVisitedMaskInverse=253]="IsVisitedMaskInverse",s[s.IsVisitedOffset=1]="IsVisitedOffset",s[s.IsForValidationMask=4]="IsForValidationMask",s[s.IsForValidationMaskInverse=251]="IsForValidationMaskInverse",s[s.IsForValidationOffset=2]="IsForValidationOffset",s[s.StickinessMask=24]="StickinessMask",s[s.StickinessMaskInverse=231]="StickinessMaskInverse",s[s.StickinessOffset=3]="StickinessOffset",s[s.CollapseOnReplaceEditMask=32]="CollapseOnReplaceEditMask",s[s.CollapseOnReplaceEditMaskInverse=223]="CollapseOnReplaceEditMaskInverse",s[s.CollapseOnReplaceEditOffset=5]="CollapseOnReplaceEditOffset",s[s.IsMarginMask=64]="IsMarginMask",s[s.IsMarginMaskInverse=191]="IsMarginMaskInverse",s[s.IsMarginOffset=6]="IsMarginOffset",s[s.MIN_SAFE_DELTA=-1073741824]="MIN_SAFE_DELTA",s[s.MAX_SAFE_DELTA=1073741824]="MAX_SAFE_DELTA",s))(X||{});function h(n){return(n.metadata&1)>>>0}function f(n,e){n.metadata=n.metadata&254|e<<0}function p(n){return(n.metadata&2)>>>1===1}function d(n,e){n.metadata=n.metadata&253|(e?1:0)<<1}function F(n){return(n.metadata&4)>>>2===1}function B(n,e){n.metadata=n.metadata&251|(e?1:0)<<2}function x(n){return(n.metadata&64)>>>6===1}function V(n,e){n.metadata=n.metadata&191|(e?1:0)<<6}function P(n){return(n.metadata&24)>>>3}function R(n,e){n.metadata=n.metadata&231|e<<3}function U(n){return(n.metadata&32)>>>5===1}function w(n,e){n.metadata=n.metadata&223|(e?1:0)<<5}function de(n,e){R(n,e)}class j{metadata;parent;left;right;start;end;delta;maxEnd;id;ownerId;options;cachedVersionId;cachedAbsoluteStart;cachedAbsoluteEnd;range;constructor(e,t,r){this.metadata=0,this.parent=this,this.left=this,this.right=this,f(this,1),this.start=t,this.end=r,this.delta=0,this.maxEnd=r,this.id=e,this.ownerId=0,this.options=null,B(this,!1),V(this,!1),R(this,S.NeverGrowsWhenTypingAtEdges),w(this,!1),this.cachedVersionId=0,this.cachedAbsoluteStart=t,this.cachedAbsoluteEnd=r,this.range=null,d(this,!1)}reset(e,t,r,o){this.start=t,this.end=r,this.maxEnd=r,this.cachedVersionId=e,this.cachedAbsoluteStart=t,this.cachedAbsoluteEnd=r,this.range=o}setOptions(e){this.options=e;const t=this.options.className;B(this,t==="squiggly-error"||t==="squiggly-warning"||t==="squiggly-info"),V(this,this.options.glyphMarginClassName!==null),R(this,this.options.stickiness),w(this,this.options.collapseOnReplaceEdit)}setCachedOffsets(e,t,r){this.cachedVersionId!==r&&(this.range=null),this.cachedVersionId=r,this.cachedAbsoluteStart=e,this.cachedAbsoluteEnd=t}detach(){this.parent=null,this.left=null,this.right=null}}const l=new j(null,0,0);l.parent=l,l.left=l,l.right=l,f(l,0);class fe{root;requestNormalizeDelta;constructor(){this.root=l,this.requestNormalizeDelta=!1}intervalSearch(e,t,r,o,a,u){return this.root===l?[]:z(this,e,t,r,o,a,u)}search(e,t,r,o){return this.root===l?[]:y(this,e,t,r,o)}collectNodesFromOwner(e){return Z(this,e)}collectNodesPostOrder(){return $(this)}insert(e){L(this,e),this._normalizeDeltaIfNecessary()}delete(e){q(this,e),this._normalizeDeltaIfNecessary()}resolveNode(e,t){const r=e;let o=0;for(;e!==this.root;)e===e.parent.right&&(o+=e.parent.delta),e=e.parent;const a=r.start+o,u=r.end+o;r.setCachedOffsets(a,u,t)}acceptReplace(e,t,r,o){const a=Q(this,e,e+t);for(let u=0,i=a.length;u<i;u++){const c=a[u];q(this,c)}this._normalizeDeltaIfNecessary(),Y(this,e,e+t,r),this._normalizeDeltaIfNecessary();for(let u=0,i=a.length;u<i;u++){const c=a[u];c.start=c.cachedAbsoluteStart,c.end=c.cachedAbsoluteEnd,K(c,e,e+t,r,o),c.maxEnd=c.end,L(this,c)}this._normalizeDeltaIfNecessary()}getAllInOrder(){return y(this,0,!1,0,!1)}_normalizeDeltaIfNecessary(){this.requestNormalizeDelta&&(this.requestNormalizeDelta=!1,H(this))}}function H(n){let e=n.root,t=0;for(;e!==l;){if(e.left!==l&&!p(e.left)){e=e.left;continue}if(e.right!==l&&!p(e.right)){t+=e.delta,e=e.right;continue}e.start=t+e.start,e.end=t+e.end,e.delta=0,M(e),d(e,!0),d(e.left,!1),d(e.right,!1),e===e.parent.right&&(t-=e.parent.delta),e=e.parent}d(n.root,!1)}var J=(r=>(r[r.MarkerDefined=0]="MarkerDefined",r[r.ForceMove=1]="ForceMove",r[r.ForceStay=2]="ForceStay",r))(J||{});function C(n,e,t,r){return n<t?!0:n>t||r===1?!1:r===2?!0:e}function K(n,e,t,r,o){const a=P(n),u=a===S.AlwaysGrowsWhenTypingAtEdges||a===S.GrowsOnlyWhenTypingBefore,i=a===S.NeverGrowsWhenTypingAtEdges||a===S.GrowsOnlyWhenTypingBefore,c=t-e,g=r,N=Math.min(c,g),m=n.start;let b=!1;const k=n.end;let I=!1;e<=m&&k<=t&&U(n)&&(n.start=e,b=!0,n.end=e,I=!0);{const v=o?1:c>0?2:0;!b&&C(m,u,e,v)&&(b=!0),!I&&C(k,i,e,v)&&(I=!0)}if(N>0&&!o){const v=c>g?2:0;!b&&C(m,u,e+N,v)&&(b=!0),!I&&C(k,i,e+N,v)&&(I=!0)}{const v=o?1:0;!b&&C(m,u,t,v)&&(n.start=e+g,b=!0),!I&&C(k,i,t,v)&&(n.end=e+g,I=!0)}const _=g-c;b||(n.start=Math.max(0,m+_)),I||(n.end=Math.max(0,k+_)),n.start>n.end&&(n.end=n.start)}function Q(n,e,t){let r=n.root,o=0,a=0,u=0,i=0;const c=[];let g=0;for(;r!==l;){if(p(r)){d(r.left,!1),d(r.right,!1),r===r.parent.right&&(o-=r.parent.delta),r=r.parent;continue}if(!p(r.left)){if(a=o+r.maxEnd,a<e){d(r,!0);continue}if(r.left!==l){r=r.left;continue}}if(u=o+r.start,u>t){d(r,!0);continue}if(i=o+r.end,i>=e&&(r.setCachedOffsets(u,i,0),c[g++]=r),d(r,!0),r.right!==l&&!p(r.right)){o+=r.delta,r=r.right;continue}}return d(n.root,!1),c}function Y(n,e,t,r){let o=n.root,a=0,u=0,i=0;const c=r-(t-e);for(;o!==l;){if(p(o)){d(o.left,!1),d(o.right,!1),o===o.parent.right&&(a-=o.parent.delta),M(o),o=o.parent;continue}if(!p(o.left)){if(u=a+o.maxEnd,u<e){d(o,!0);continue}if(o.left!==l){o=o.left;continue}}if(i=a+o.start,i>t){o.start+=c,o.end+=c,o.delta+=c,(o.delta<-1073741824||o.delta>1073741824)&&(n.requestNormalizeDelta=!0),d(o,!0);continue}if(d(o,!0),o.right!==l&&!p(o.right)){a+=o.delta,o=o.right;continue}}d(n.root,!1)}function Z(n,e){let t=n.root;const r=[];let o=0;for(;t!==l;){if(p(t)){d(t.left,!1),d(t.right,!1),t=t.parent;continue}if(t.left!==l&&!p(t.left)){t=t.left;continue}if(t.ownerId===e&&(r[o++]=t),d(t,!0),t.right!==l&&!p(t.right)){t=t.right;continue}}return d(n.root,!1),r}function $(n){let e=n.root;const t=[];let r=0;for(;e!==l;){if(p(e)){d(e.left,!1),d(e.right,!1),e=e.parent;continue}if(e.left!==l&&!p(e.left)){e=e.left;continue}if(e.right!==l&&!p(e.right)){e=e.right;continue}t[r++]=e,d(e,!0)}return d(n.root,!1),t}function y(n,e,t,r,o){let a=n.root,u=0,i=0,c=0;const g=[];let N=0;for(;a!==l;){if(p(a)){d(a.left,!1),d(a.right,!1),a===a.parent.right&&(u-=a.parent.delta),a=a.parent;continue}if(a.left!==l&&!p(a.left)){a=a.left;continue}i=u+a.start,c=u+a.end,a.setCachedOffsets(i,c,r);let m=!0;if(e&&a.ownerId&&a.ownerId!==e&&(m=!1),t&&F(a)&&(m=!1),o&&!x(a)&&(m=!1),m&&(g[N++]=a),d(a,!0),a.right!==l&&!p(a.right)){u+=a.delta,a=a.right;continue}}return d(n.root,!1),g}function z(n,e,t,r,o,a,u){let i=n.root,c=0,g=0,N=0,m=0;const b=[];let k=0;for(;i!==l;){if(p(i)){d(i.left,!1),d(i.right,!1),i===i.parent.right&&(c-=i.parent.delta),i=i.parent;continue}if(!p(i.left)){if(g=c+i.maxEnd,g<e){d(i,!0);continue}if(i.left!==l){i=i.left;continue}}if(N=c+i.start,N>t){d(i,!0);continue}if(m=c+i.end,m>=e){i.setCachedOffsets(N,m,a);let I=!0;r&&i.ownerId&&i.ownerId!==r&&(I=!1),o&&F(i)&&(I=!1),u&&!x(i)&&(I=!1),I&&(b[k++]=i)}if(d(i,!0),i.right!==l&&!p(i.right)){c+=i.delta,i=i.right;continue}}return d(n.root,!1),b}function L(n,e){if(n.root===l)return e.parent=l,e.left=l,e.right=l,f(e,0),n.root=e,n.root;ee(n,e),E(e.parent);let t=e;for(;t!==n.root&&h(t.parent)===1;)if(t.parent===t.parent.parent.left){const r=t.parent.parent.right;h(r)===1?(f(t.parent,0),f(r,0),f(t.parent.parent,1),t=t.parent.parent):(t===t.parent.right&&(t=t.parent,A(n,t)),f(t.parent,0),f(t.parent.parent,1),D(n,t.parent.parent))}else{const r=t.parent.parent.left;h(r)===1?(f(t.parent,0),f(r,0),f(t.parent.parent,1),t=t.parent.parent):(t===t.parent.left&&(t=t.parent,D(n,t)),f(t.parent,0),f(t.parent.parent,1),A(n,t.parent.parent))}return f(n.root,0),e}function ee(n,e){let t=0,r=n.root;const o=e.start,a=e.end;for(;;)if(re(o,a,r.start+t,r.end+t)<0)if(r.left===l){e.start-=t,e.end-=t,e.maxEnd-=t,r.left=e;break}else r=r.left;else if(r.right===l){e.start-=t+r.delta,e.end-=t+r.delta,e.maxEnd-=t+r.delta,r.right=e;break}else t+=r.delta,r=r.right;e.parent=r,e.left=l,e.right=l,f(e,1)}function q(n,e){let t,r;if(e.left===l?(t=e.right,r=e,t.delta+=e.delta,(t.delta<-1073741824||t.delta>1073741824)&&(n.requestNormalizeDelta=!0),t.start+=e.delta,t.end+=e.delta):e.right===l?(t=e.left,r=e):(r=te(e.right),t=r.right,t.start+=r.delta,t.end+=r.delta,t.delta+=r.delta,(t.delta<-1073741824||t.delta>1073741824)&&(n.requestNormalizeDelta=!0),r.start+=e.delta,r.end+=e.delta,r.delta=e.delta,(r.delta<-1073741824||r.delta>1073741824)&&(n.requestNormalizeDelta=!0)),r===n.root){n.root=t,f(t,0),e.detach(),O(),M(t),n.root.parent=l;return}const o=h(r)===1;if(r===r.parent.left?r.parent.left=t:r.parent.right=t,r===e?t.parent=r.parent:(r.parent===e?t.parent=r:t.parent=r.parent,r.left=e.left,r.right=e.right,r.parent=e.parent,f(r,h(e)),e===n.root?n.root=r:e===e.parent.left?e.parent.left=r:e.parent.right=r,r.left!==l&&(r.left.parent=r),r.right!==l&&(r.right.parent=r)),e.detach(),o){E(t.parent),r!==e&&(E(r),E(r.parent)),O();return}E(t),E(t.parent),r!==e&&(E(r),E(r.parent));let a;for(;t!==n.root&&h(t)===0;)t===t.parent.left?(a=t.parent.right,h(a)===1&&(f(a,0),f(t.parent,1),A(n,t.parent),a=t.parent.right),h(a.left)===0&&h(a.right)===0?(f(a,1),t=t.parent):(h(a.right)===0&&(f(a.left,0),f(a,1),D(n,a),a=t.parent.right),f(a,h(t.parent)),f(t.parent,0),f(a.right,0),A(n,t.parent),t=n.root)):(a=t.parent.left,h(a)===1&&(f(a,0),f(t.parent,1),D(n,t.parent),a=t.parent.left),h(a.left)===0&&h(a.right)===0?(f(a,1),t=t.parent):(h(a.left)===0&&(f(a.right,0),f(a,1),A(n,a),a=t.parent.left),f(a,h(t.parent)),f(t.parent,0),f(a.left,0),D(n,t.parent),t=n.root));f(t,0),O()}function te(n){for(;n.left!==l;)n=n.left;return n}function O(){l.parent=l,l.delta=0,l.start=0,l.end=0}function A(n,e){const t=e.right;t.delta+=e.delta,(t.delta<-1073741824||t.delta>1073741824)&&(n.requestNormalizeDelta=!0),t.start+=e.delta,t.end+=e.delta,e.right=t.left,t.left!==l&&(t.left.parent=e),t.parent=e.parent,e.parent===l?n.root=t:e===e.parent.left?e.parent.left=t:e.parent.right=t,t.left=e,e.parent=t,M(e),M(t)}function D(n,e){const t=e.left;e.delta-=t.delta,(e.delta<-1073741824||e.delta>1073741824)&&(n.requestNormalizeDelta=!0),e.start-=t.delta,e.end-=t.delta,e.left=t.right,t.right!==l&&(t.right.parent=e),t.parent=e.parent,e.parent===l?n.root=t:e===e.parent.right?e.parent.right=t:e.parent.left=t,t.right=e,e.parent=t,M(e),M(t)}function T(n){let e=n.end;if(n.left!==l){const t=n.left.maxEnd;t>e&&(e=t)}if(n.right!==l){const t=n.right.maxEnd+n.delta;t>e&&(e=t)}return e}function M(n){n.maxEnd=T(n)}function E(n){for(;n!==l;){const e=T(n);if(n.maxEnd===e)return;n.maxEnd=e,n=n.parent}}function re(n,e,t,r){return n===t?e-r:n-t}export{W as ClassName,j as IntervalNode,fe as IntervalTree,G as NodeColor,l as SENTINEL,h as getNodeColor,re as intervalCompare,K as nodeAcceptEdit,M as recomputeMaxEnd,de as setNodeStickiness};
