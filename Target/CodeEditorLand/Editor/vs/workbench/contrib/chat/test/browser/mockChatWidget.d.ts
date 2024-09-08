import type { URI } from "../../../../../base/common/uri.js";
import type { IChatWidget, IChatWidgetService } from "../../browser/chat.js";
export declare class MockChatWidgetService implements IChatWidgetService {
    readonly _serviceBrand: undefined;
    /**
     * Returns the most recently focused widget if any.
     */
    readonly lastFocusedWidget: IChatWidget | undefined;
    getWidgetByInputUri(uri: URI): IChatWidget | undefined;
    getWidgetBySessionId(sessionId: string): IChatWidget | undefined;
}
