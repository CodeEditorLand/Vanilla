class B{parent;left;right;color;piece;size_left;lf_left;constructor(e,t){this.piece=e,this.color=t,this.size_left=0,this.lf_left=0,this.parent=this,this.left=this,this.right=this}next(){if(this.right!==l)return N(this.right);let e=this;for(;e.parent!==l&&e.parent.left!==e;)e=e.parent;return e.parent===l?l:e.parent}prev(){if(this.left!==l)return _(this.left);let e=this;for(;e.parent!==l&&e.parent.right!==e;)e=e.parent;return e.parent===l?l:e.parent}detach(){this.parent=null,this.left=null,this.right=null}}var T=(t=>(t[t.Black=0]="Black",t[t.Red=1]="Red",t))(T||{});const l=new B(null,0);l.parent=l,l.left=l,l.right=l,l.color=0;function N(r){for(;r.left!==l;)r=r.left;return r}function _(r){for(;r.right!==l;)r=r.right;return r}function d(r){return r===l?0:r.size_left+r.piece.length+d(r.right)}function s(r){return r===l?0:r.lf_left+r.piece.lineFeedCnt+s(r.right)}function h(){l.parent=l}function a(r,e){const t=e.right;t.size_left+=e.size_left+(e.piece?e.piece.length:0),t.lf_left+=e.lf_left+(e.piece?e.piece.lineFeedCnt:0),e.right=t.left,t.left!==l&&(t.left.parent=e),t.parent=e.parent,e.parent===l?r.root=t:e.parent.left===e?e.parent.left=t:e.parent.right=t,t.left=e,e.parent=t}function i(r,e){const t=e.left;e.left=t.right,t.right!==l&&(t.right.parent=e),t.parent=e.parent,e.size_left-=t.size_left+(t.piece?t.piece.length:0),e.lf_left-=t.lf_left+(t.piece?t.piece.lineFeedCnt:0),e.parent===l?r.root=t:e===e.parent.right?e.parent.right=t:e.parent.left=t,t.right=e,e.parent=t}function m(r,e){let t,o;if(e.left===l?(o=e,t=o.right):e.right===l?(o=e,t=o.left):(o=N(e.right),t=o.right),o===r.root){r.root=t,t.color=0,e.detach(),h(),r.root.parent=l;return}const g=o.color===1;if(o===o.parent.left?o.parent.left=t:o.parent.right=t,o===e?(t.parent=o.parent,f(r,t)):(o.parent===e?t.parent=o:t.parent=o.parent,f(r,t),o.left=e.left,o.right=e.right,o.parent=e.parent,o.color=e.color,e===r.root?r.root=o:e===e.parent.left?e.parent.left=o:e.parent.right=o,o.left!==l&&(o.left.parent=o),o.right!==l&&(o.right.parent=o),o.size_left=e.size_left,o.lf_left=e.lf_left,f(r,o)),e.detach(),t.parent.left===t){const p=d(t),c=s(t);if(p!==t.parent.size_left||c!==t.parent.lf_left){const u=p-t.parent.size_left,C=c-t.parent.lf_left;t.parent.size_left=p,t.parent.lf_left=c,k(r,t.parent,u,C)}}if(f(r,t.parent),g){h();return}let n;for(;t!==r.root&&t.color===0;)t===t.parent.left?(n=t.parent.right,n.color===1&&(n.color=0,t.parent.color=1,a(r,t.parent),n=t.parent.right),n.left.color===0&&n.right.color===0?(n.color=1,t=t.parent):(n.right.color===0&&(n.left.color=0,n.color=1,i(r,n),n=t.parent.right),n.color=t.parent.color,t.parent.color=0,n.right.color=0,a(r,t.parent),t=r.root)):(n=t.parent.left,n.color===1&&(n.color=0,t.parent.color=1,i(r,t.parent),n=t.parent.left),n.left.color===0&&n.right.color===0?(n.color=1,t=t.parent):(n.left.color===0&&(n.right.color=0,n.color=1,a(r,n),n=t.parent.left),n.color=t.parent.color,t.parent.color=0,n.left.color=0,i(r,t.parent),t=r.root));t.color=0,h()}function P(r,e){for(f(r,e);e!==r.root&&e.parent.color===1;)if(e.parent===e.parent.parent.left){const t=e.parent.parent.right;t.color===1?(e.parent.color=0,t.color=0,e.parent.parent.color=1,e=e.parent.parent):(e===e.parent.right&&(e=e.parent,a(r,e)),e.parent.color=0,e.parent.parent.color=1,i(r,e.parent.parent))}else{const t=e.parent.parent.left;t.color===1?(e.parent.color=0,t.color=0,e.parent.parent.color=1,e=e.parent.parent):(e===e.parent.left&&(e=e.parent,i(r,e)),e.parent.color=0,e.parent.parent.color=1,a(r,e.parent.parent))}r.root.color=0}function k(r,e,t,o){for(;e!==r.root&&e!==l;)e.parent.left===e&&(e.parent.size_left+=t,e.parent.lf_left+=o),e=e.parent}function f(r,e){let t=0,o=0;if(e!==r.root){for(;e!==r.root&&e===e.parent.right;)e=e.parent;if(e!==r.root)for(e=e.parent,t=d(e.left)-e.size_left,o=s(e.left)-e.lf_left,e.size_left+=t,e.lf_left+=o;e!==r.root&&(t!==0||o!==0);)e.parent.left===e&&(e.parent.size_left+=t,e.parent.lf_left+=o),e=e.parent}}export{T as NodeColor,l as SENTINEL,B as TreeNode,P as fixInsert,a as leftRotate,N as leftest,m as rbDelete,f as recomputeTreeMetadata,i as rightRotate,_ as righttest,k as updateTreeMetadata};
