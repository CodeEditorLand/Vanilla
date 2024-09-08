import { userActivityRegistry } from "../common/userActivityRegistry.js";
import { DomActivityTracker } from "./domActivityTracker.js";
userActivityRegistry.add(DomActivityTracker);
