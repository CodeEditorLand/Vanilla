let t;const o=[];setup(function(){t=this.currentTest}),suiteTeardown(async()=>{await Promise.all(o.map(async s=>{const e=await s.counts,n=Object.entries(s.opts.classes);if(n.length!==e.length)throw new Error(`expected class counts to equal assertions length for ${s.test}`);for(const[r,[i,c]]of n.entries())try{c(e[r])}catch(l){throw new Error(`Unexpected number of ${i} instances (${e[r]}) after "${s.test}":

${l.message}

Snapshot saved at: ${s.file}`)}})),o.length=0});const a=2e4;async function u(s){if(!t)throw new Error("assertSnapshot can only be used when a test is running");if(t.timeout()<a&&t.timeout(a),typeof __analyzeSnapshotInTests>"u")return;const{done:e,file:n}=await __analyzeSnapshotInTests(t.fullTitle(),Object.keys(s.classes));o.push({counts:e,file:n,test:t.fullTitle(),opts:s})}export{u as assertHeap};
