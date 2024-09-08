import { createDecorator } from "../../../platform/instantiation/common/instantiation.js";
const EDITOR_EXPERIMENTAL_PREFER_TREESITTER = "editor.experimental.preferTreeSitter";
const ITreeSitterParserService = createDecorator("treeSitterParserService");
export {
  EDITOR_EXPERIMENTAL_PREFER_TREESITTER,
  ITreeSitterParserService
};
