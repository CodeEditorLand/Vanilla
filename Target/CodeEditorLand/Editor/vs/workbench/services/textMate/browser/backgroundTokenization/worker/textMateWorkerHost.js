import"../../../../../../../vs/base/common/uri.js";import"../../../../../../../vs/base/common/worker/simpleWorker.js";import"../../../../../../../vs/workbench/services/textMate/browser/backgroundTokenization/worker/textMateTokenizationWorker.worker.js";class t{static CHANNEL_NAME="textMateWorkerHost";static getChannel(e){return e.getChannel(t.CHANNEL_NAME)}static setChannel(e,r){e.setChannel(t.CHANNEL_NAME,r)}}export{t as TextMateWorkerHost};
