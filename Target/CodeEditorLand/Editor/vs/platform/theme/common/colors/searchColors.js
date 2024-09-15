import * as nls from "../../../../nls.js";
import { registerColor, transparent } from "../colorUtils.js";
import { foreground } from "./baseColors.js";
import {
  editorFindMatchHighlight,
  editorFindMatchHighlightBorder
} from "./editorColors.js";
const searchResultsInfoForeground = registerColor(
  "search.resultsInfoForeground",
  {
    light: foreground,
    dark: transparent(foreground, 0.65),
    hcDark: foreground,
    hcLight: foreground
  },
  nls.localize(
    "search.resultsInfoForeground",
    "Color of the text in the search viewlet's completion message."
  )
);
const searchEditorFindMatch = registerColor(
  "searchEditor.findMatchBackground",
  {
    light: transparent(editorFindMatchHighlight, 0.66),
    dark: transparent(editorFindMatchHighlight, 0.66),
    hcDark: editorFindMatchHighlight,
    hcLight: editorFindMatchHighlight
  },
  nls.localize(
    "searchEditor.queryMatch",
    "Color of the Search Editor query matches."
  )
);
const searchEditorFindMatchBorder = registerColor(
  "searchEditor.findMatchBorder",
  {
    light: transparent(editorFindMatchHighlightBorder, 0.66),
    dark: transparent(editorFindMatchHighlightBorder, 0.66),
    hcDark: editorFindMatchHighlightBorder,
    hcLight: editorFindMatchHighlightBorder
  },
  nls.localize(
    "searchEditor.editorFindMatchBorder",
    "Border color of the Search Editor query matches."
  )
);
export {
  searchEditorFindMatch,
  searchEditorFindMatchBorder,
  searchResultsInfoForeground
};
//# sourceMappingURL=searchColors.js.map
