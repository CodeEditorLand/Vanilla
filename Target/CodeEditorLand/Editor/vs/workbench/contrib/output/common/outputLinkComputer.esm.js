import { bootstrapSimpleWorker } from "../../../../base/common/worker/simpleWorkerBootstrap.js";
import { create } from "./outputLinkComputer.js";
bootstrapSimpleWorker(create);
