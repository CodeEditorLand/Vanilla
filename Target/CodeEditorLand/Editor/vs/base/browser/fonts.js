import { isMacintosh, isWindows } from "../common/platform.js";
const DEFAULT_FONT_FAMILY = isWindows ? '"Segoe WPC", "Segoe UI", sans-serif' : isMacintosh ? "-apple-system, BlinkMacSystemFont, sans-serif" : 'system-ui, "Ubuntu", "Droid Sans", sans-serif';
export {
  DEFAULT_FONT_FAMILY
};
