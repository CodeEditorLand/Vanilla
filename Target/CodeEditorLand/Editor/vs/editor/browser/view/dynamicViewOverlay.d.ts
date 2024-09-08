import { ViewEventHandler } from "../../common/viewEventHandler.js";
import type { RenderingContext } from "./renderingContext.js";
export declare abstract class DynamicViewOverlay extends ViewEventHandler {
    abstract prepareRender(ctx: RenderingContext): void;
    abstract render(startLineNumber: number, lineNumber: number): string;
}
