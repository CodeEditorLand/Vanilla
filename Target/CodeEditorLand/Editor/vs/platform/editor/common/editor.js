import"../../../../vs/base/common/lifecycle.js";import"../../../../vs/base/common/uri.js";function b(t){const r=t;return typeof r?.resolve=="function"&&typeof r?.isResolved=="function"}var s=(e=>(e[e.ACTIVATE=1]="ACTIVATE",e[e.RESTORE=2]="RESTORE",e[e.PRESERVE=3]="PRESERVE",e))(s||{}),i=(n=>(n[n.PICK=0]="PICK",n[n.EXCLUSIVE_ONLY=1]="EXCLUSIVE_ONLY",n))(i||{}),d=(n=>(n[n.API=0]="API",n[n.USER=1]="USER",n))(d||{}),a=(o=>(o[o.Center=0]="Center",o[o.CenterIfOutsideViewport=1]="CenterIfOutsideViewport",o[o.NearTop=2]="NearTop",o[o.NearTopIfOutsideViewport=3]="NearTopIfOutsideViewport",o))(a||{}),I=(e=>(e.PROGRAMMATIC="api",e.NAVIGATION="code.navigation",e.JUMP="code.jump",e))(I||{});export{s as EditorActivation,d as EditorOpenSource,i as EditorResolution,a as TextEditorSelectionRevealType,I as TextEditorSelectionSource,b as isResolvedEditorModel};
