import"../../../../base/common/cancellation.js";import{toDisposable as n}from"../../../../base/common/lifecycle.js";import"../../../common/diff/documentDiffProvider.js";import{linesDiffComputers as f}from"../../../common/diff/linesDiffComputers.js";import"../../../common/model.js";import"../../../../base/common/event.js";import"../../../browser/widget/diffEditor/diffProviderFactoryService.js";class h{createDiffProvider(){return new m}}class m{computeDiff(o,r,i,c){const e=f.getDefault().computeDiff(o.getLinesContent(),r.getLinesContent(),i);return Promise.resolve({changes:e.changes,quitEarly:e.hitTimeout,identical:o.getValue()===r.getValue(),moves:e.moves})}onDidChange=()=>n(()=>{})}export{h as TestDiffProviderFactoryService};