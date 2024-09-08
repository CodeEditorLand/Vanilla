import { bootstrapSimpleWorker } from "../../../base/common/worker/simpleWorkerBootstrap.js";
import { create } from "./profileAnalysisWorker.js";
bootstrapSimpleWorker(create);
