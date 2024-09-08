import { bootstrapSimpleWorker } from "../../../../base/common/worker/simpleWorkerBootstrap.js";
import { create } from "./languageDetectionSimpleWorker.js";
bootstrapSimpleWorker(create);
