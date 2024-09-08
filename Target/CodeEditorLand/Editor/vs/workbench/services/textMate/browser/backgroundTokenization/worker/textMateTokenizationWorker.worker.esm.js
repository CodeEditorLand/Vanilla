import { bootstrapSimpleWorker } from "../../../../../../base/common/worker/simpleWorkerBootstrap.js";
import { create } from "./textMateTokenizationWorker.worker.js";
bootstrapSimpleWorker(create);
