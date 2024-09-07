import{deepEqual as n}from"assert";import{isLinux as x,isMacintosh as L,isWindows as P}from"../../../../base/common/platform.js";import{ensureNoDisposablesAreLeakedInTestSuite as S}from"../../../../base/test/common/utils.js";import{massageMessageBoxOptions as t}from"../../common/dialogs.js";import T from"../../../product/common/product.js";import"../../../product/common/productService.js";suite("Dialog",()=>{function e({options:s,buttonIndeces:o},a,c,u,m){n(s.buttons,a),n(s.defaultId,c),n(s.cancelId,u),n(o,m)}test("massageMessageBoxOptions",()=>{const s={_serviceBrand:void 0,...T,nameLong:"Test"},o=t({buttons:["1"],message:"message"},s);n(o.options.title,"Test"),n(o.options.message,"message"),n(o.options.noLink,!0);const a=t({buttons:["1"],cancelId:void 0,message:"message"},s),c=t({buttons:["1"],cancelId:0,message:"message"},s),u=t({buttons:["1"],cancelId:1,message:"message"},s),m=t({buttons:["1"],cancelId:-1,message:"message"},s),g=t({buttons:["1","2"],cancelId:void 0,message:"message"},s),l=t({buttons:["1","2"],cancelId:0,message:"message"},s),d=t({buttons:["1","2"],cancelId:1,message:"message"},s),i=t({buttons:["1","2"],cancelId:2,message:"message"},s),r=t({buttons:["1","2"],cancelId:-1,message:"message"},s),I=t({buttons:["1","2","3"],cancelId:void 0,message:"message"},s),b=t({buttons:["1","2","3"],cancelId:0,message:"message"},s),B=t({buttons:["1","2","3"],cancelId:1,message:"message"},s),f=t({buttons:["1","2","3"],cancelId:2,message:"message"},s),C=t({buttons:["1","2","3"],cancelId:3,message:"message"},s),p=t({buttons:["1","2","3"],cancelId:-1,message:"message"},s),_=t({buttons:["1","2","3","4"],cancelId:void 0,message:"message"},s),v=t({buttons:["1","2","3","4"],cancelId:0,message:"message"},s),N=t({buttons:["1","2","3","4"],cancelId:1,message:"message"},s),M=t({buttons:["1","2","3","4"],cancelId:2,message:"message"},s),h=t({buttons:["1","2","3","4"],cancelId:3,message:"message"},s),w=t({buttons:["1","2","3","4"],cancelId:4,message:"message"},s),O=t({buttons:["1","2","3","4"],cancelId:-1,message:"message"},s);P?(e(a,["1"],0,0,[0]),e(c,["1"],0,0,[0]),e(u,["1"],0,1,[0]),e(m,["1"],0,-1,[0]),e(g,["1","2"],0,1,[0,1]),e(l,["2","1"],0,1,[1,0]),e(d,["1","2"],0,1,[0,1]),e(i,["1","2"],0,2,[0,1]),e(r,["1","2"],0,-1,[0,1]),e(I,["1","2","3"],0,2,[0,1,2]),e(b,["2","3","1"],0,2,[1,2,0]),e(B,["1","3","2"],0,2,[0,2,1]),e(f,["1","2","3"],0,2,[0,1,2]),e(C,["1","2","3"],0,3,[0,1,2]),e(p,["1","2","3"],0,-1,[0,1,2]),e(_,["1","2","3","4"],0,3,[0,1,2,3]),e(v,["2","3","4","1"],0,3,[1,2,3,0]),e(N,["1","3","4","2"],0,3,[0,2,3,1]),e(M,["1","2","4","3"],0,3,[0,1,3,2]),e(h,["1","2","3","4"],0,3,[0,1,2,3]),e(w,["1","2","3","4"],0,4,[0,1,2,3]),e(O,["1","2","3","4"],0,-1,[0,1,2,3])):L?(e(a,["1"],0,0,[0]),e(c,["1"],0,0,[0]),e(u,["1"],0,1,[0]),e(m,["1"],0,-1,[0]),e(g,["1","2"],0,1,[0,1]),e(l,["2","1"],0,1,[1,0]),e(d,["1","2"],0,1,[0,1]),e(i,["1","2"],0,2,[0,1]),e(r,["1","2"],0,-1,[0,1]),e(I,["1","3","2"],0,1,[0,2,1]),e(b,["2","1","3"],0,1,[1,0,2]),e(B,["1","2","3"],0,1,[0,1,2]),e(f,["1","3","2"],0,1,[0,2,1]),e(C,["1","2","3"],0,3,[0,1,2]),e(p,["1","2","3"],0,-1,[0,1,2]),e(_,["1","4","2","3"],0,1,[0,3,1,2]),e(v,["2","1","3","4"],0,1,[1,0,2,3]),e(N,["1","2","3","4"],0,1,[0,1,2,3]),e(M,["1","3","2","4"],0,1,[0,2,1,3]),e(h,["1","4","2","3"],0,1,[0,3,1,2]),e(w,["1","2","3","4"],0,4,[0,1,2,3]),e(O,["1","2","3","4"],0,-1,[0,1,2,3])):x&&(e(a,["1"],0,0,[0]),e(c,["1"],0,0,[0]),e(u,["1"],0,1,[0]),e(m,["1"],0,-1,[0]),e(g,["2","1"],1,0,[1,0]),e(l,["1","2"],1,0,[0,1]),e(d,["2","1"],1,0,[1,0]),e(i,["2","1"],1,2,[1,0]),e(r,["2","1"],1,-1,[1,0]),e(I,["2","3","1"],2,1,[1,2,0]),e(b,["3","1","2"],2,1,[2,0,1]),e(B,["3","2","1"],2,1,[2,1,0]),e(f,["2","3","1"],2,1,[1,2,0]),e(C,["3","2","1"],2,3,[2,1,0]),e(p,["3","2","1"],2,-1,[2,1,0]),e(_,["3","2","4","1"],3,2,[2,1,3,0]),e(v,["4","3","1","2"],3,2,[3,2,0,1]),e(N,["4","3","2","1"],3,2,[3,2,1,0]),e(M,["4","2","3","1"],3,2,[3,1,2,0]),e(h,["3","2","4","1"],3,2,[2,1,3,0]),e(w,["4","3","2","1"],3,4,[3,2,1,0]),e(O,["4","3","2","1"],3,-1,[3,2,1,0]))}),S()});