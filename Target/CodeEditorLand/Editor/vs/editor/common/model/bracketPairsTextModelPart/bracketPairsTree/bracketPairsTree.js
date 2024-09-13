var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CallbackIterable } from "../../../../../base/common/arrays.js";
import { Emitter } from "../../../../../base/common/event.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import {
  BracketInfo,
  BracketPairWithMinIndentationInfo
} from "../../../textModelBracketPairs.js";
import { BackgroundTokenizationState } from "../../../tokenizationTextModelPart.js";
import { AstNodeKind } from "./ast.js";
import { TextEditInfo } from "./beforeEditPositionMapper.js";
import { LanguageAgnosticBracketTokens } from "./brackets.js";
import { combineTextEditInfos } from "./combineTextEditInfos.js";
import {
  lengthAdd,
  lengthGreaterThanEqual,
  lengthLessThan,
  lengthLessThanEqual,
  lengthZero,
  lengthsToRange,
  positionToLength,
  toLength
} from "./length.js";
import { parseDocument } from "./parser.js";
import { DenseKeyProvider } from "./smallImmutableSet.js";
import { FastTokenizer, TextBufferTokenizer } from "./tokenizer.js";
class BracketPairsTree extends Disposable {
  constructor(textModel, getLanguageConfiguration) {
    super();
    this.textModel = textModel;
    this.getLanguageConfiguration = getLanguageConfiguration;
    if (!textModel.tokenization.hasTokens) {
      const brackets = this.brackets.getSingleLanguageBracketTokens(
        this.textModel.getLanguageId()
      );
      const tokenizer = new FastTokenizer(
        this.textModel.getValue(),
        brackets
      );
      this.initialAstWithoutTokens = parseDocument(
        tokenizer,
        [],
        void 0,
        true
      );
      this.astWithTokens = this.initialAstWithoutTokens;
    } else if (textModel.tokenization.backgroundTokenizationState === BackgroundTokenizationState.Completed) {
      this.initialAstWithoutTokens = void 0;
      this.astWithTokens = this.parseDocumentFromTextBuffer(
        [],
        void 0,
        false
      );
    } else {
      this.initialAstWithoutTokens = this.parseDocumentFromTextBuffer(
        [],
        void 0,
        true
      );
      this.astWithTokens = this.initialAstWithoutTokens;
    }
  }
  static {
    __name(this, "BracketPairsTree");
  }
  didChangeEmitter = new Emitter();
  /*
  		There are two trees:
  		* The initial tree that has no token information and is used for performant initial bracket colorization.
  		* The tree that used token information to detect bracket pairs.
  
  		To prevent flickering, we only switch from the initial tree to tree with token information
  		when tokenization completes.
  		Since the text can be edited while background tokenization is in progress, we need to update both trees.
  	*/
  initialAstWithoutTokens;
  astWithTokens;
  denseKeyProvider = new DenseKeyProvider();
  brackets = new LanguageAgnosticBracketTokens(
    this.denseKeyProvider,
    this.getLanguageConfiguration
  );
  didLanguageChange(languageId) {
    return this.brackets.didLanguageChange(languageId);
  }
  onDidChange = this.didChangeEmitter.event;
  queuedTextEditsForInitialAstWithoutTokens = [];
  queuedTextEdits = [];
  //#region TextModel events
  handleDidChangeBackgroundTokenizationState() {
    if (this.textModel.tokenization.backgroundTokenizationState === BackgroundTokenizationState.Completed) {
      const wasUndefined = this.initialAstWithoutTokens === void 0;
      this.initialAstWithoutTokens = void 0;
      if (!wasUndefined) {
        this.didChangeEmitter.fire();
      }
    }
  }
  handleDidChangeTokens({ ranges }) {
    const edits = ranges.map(
      (r) => new TextEditInfo(
        toLength(r.fromLineNumber - 1, 0),
        toLength(r.toLineNumber, 0),
        toLength(r.toLineNumber - r.fromLineNumber + 1, 0)
      )
    );
    this.handleEdits(edits, true);
    if (!this.initialAstWithoutTokens) {
      this.didChangeEmitter.fire();
    }
  }
  handleContentChanged(change) {
    const edits = TextEditInfo.fromModelContentChanges(change.changes);
    this.handleEdits(edits, false);
  }
  handleEdits(edits, tokenChange) {
    const result = combineTextEditInfos(this.queuedTextEdits, edits);
    this.queuedTextEdits = result;
    if (this.initialAstWithoutTokens && !tokenChange) {
      this.queuedTextEditsForInitialAstWithoutTokens = combineTextEditInfos(
        this.queuedTextEditsForInitialAstWithoutTokens,
        edits
      );
    }
  }
  //#endregion
  flushQueue() {
    if (this.queuedTextEdits.length > 0) {
      this.astWithTokens = this.parseDocumentFromTextBuffer(
        this.queuedTextEdits,
        this.astWithTokens,
        false
      );
      this.queuedTextEdits = [];
    }
    if (this.queuedTextEditsForInitialAstWithoutTokens.length > 0) {
      if (this.initialAstWithoutTokens) {
        this.initialAstWithoutTokens = this.parseDocumentFromTextBuffer(
          this.queuedTextEditsForInitialAstWithoutTokens,
          this.initialAstWithoutTokens,
          false
        );
      }
      this.queuedTextEditsForInitialAstWithoutTokens = [];
    }
  }
  /**
   * @pure (only if isPure = true)
   */
  parseDocumentFromTextBuffer(edits, previousAst, immutable) {
    const isPure = false;
    const previousAstClone = isPure ? previousAst?.deepClone() : previousAst;
    const tokenizer = new TextBufferTokenizer(
      this.textModel,
      this.brackets
    );
    const result = parseDocument(
      tokenizer,
      edits,
      previousAstClone,
      immutable
    );
    return result;
  }
  getBracketsInRange(range, onlyColorizedBrackets) {
    this.flushQueue();
    const startOffset = toLength(
      range.startLineNumber - 1,
      range.startColumn - 1
    );
    const endOffset = toLength(
      range.endLineNumber - 1,
      range.endColumn - 1
    );
    return new CallbackIterable((cb) => {
      const node = this.initialAstWithoutTokens || this.astWithTokens;
      collectBrackets(
        node,
        lengthZero,
        node.length,
        startOffset,
        endOffset,
        cb,
        0,
        0,
        /* @__PURE__ */ new Map(),
        onlyColorizedBrackets
      );
    });
  }
  getBracketPairsInRange(range, includeMinIndentation) {
    this.flushQueue();
    const startLength = positionToLength(range.getStartPosition());
    const endLength = positionToLength(range.getEndPosition());
    return new CallbackIterable((cb) => {
      const node = this.initialAstWithoutTokens || this.astWithTokens;
      const context = new CollectBracketPairsContext(
        cb,
        includeMinIndentation,
        this.textModel
      );
      collectBracketPairs(
        node,
        lengthZero,
        node.length,
        startLength,
        endLength,
        context,
        0,
        /* @__PURE__ */ new Map()
      );
    });
  }
  getFirstBracketAfter(position) {
    this.flushQueue();
    const node = this.initialAstWithoutTokens || this.astWithTokens;
    return getFirstBracketAfter(
      node,
      lengthZero,
      node.length,
      positionToLength(position)
    );
  }
  getFirstBracketBefore(position) {
    this.flushQueue();
    const node = this.initialAstWithoutTokens || this.astWithTokens;
    return getFirstBracketBefore(
      node,
      lengthZero,
      node.length,
      positionToLength(position)
    );
  }
}
function getFirstBracketBefore(node, nodeOffsetStart, nodeOffsetEnd, position) {
  if (node.kind === AstNodeKind.List || node.kind === AstNodeKind.Pair) {
    const lengths = [];
    for (const child of node.children) {
      nodeOffsetEnd = lengthAdd(nodeOffsetStart, child.length);
      lengths.push({ nodeOffsetStart, nodeOffsetEnd });
      nodeOffsetStart = nodeOffsetEnd;
    }
    for (let i = lengths.length - 1; i >= 0; i--) {
      const { nodeOffsetStart: nodeOffsetStart2, nodeOffsetEnd: nodeOffsetEnd2 } = lengths[i];
      if (lengthLessThan(nodeOffsetStart2, position)) {
        const result = getFirstBracketBefore(
          node.children[i],
          nodeOffsetStart2,
          nodeOffsetEnd2,
          position
        );
        if (result) {
          return result;
        }
      }
    }
    return null;
  } else if (node.kind === AstNodeKind.UnexpectedClosingBracket) {
    return null;
  } else if (node.kind === AstNodeKind.Bracket) {
    const range = lengthsToRange(nodeOffsetStart, nodeOffsetEnd);
    return {
      bracketInfo: node.bracketInfo,
      range
    };
  }
  return null;
}
__name(getFirstBracketBefore, "getFirstBracketBefore");
function getFirstBracketAfter(node, nodeOffsetStart, nodeOffsetEnd, position) {
  if (node.kind === AstNodeKind.List || node.kind === AstNodeKind.Pair) {
    for (const child of node.children) {
      nodeOffsetEnd = lengthAdd(nodeOffsetStart, child.length);
      if (lengthLessThan(position, nodeOffsetEnd)) {
        const result = getFirstBracketAfter(
          child,
          nodeOffsetStart,
          nodeOffsetEnd,
          position
        );
        if (result) {
          return result;
        }
      }
      nodeOffsetStart = nodeOffsetEnd;
    }
    return null;
  } else if (node.kind === AstNodeKind.UnexpectedClosingBracket) {
    return null;
  } else if (node.kind === AstNodeKind.Bracket) {
    const range = lengthsToRange(nodeOffsetStart, nodeOffsetEnd);
    return {
      bracketInfo: node.bracketInfo,
      range
    };
  }
  return null;
}
__name(getFirstBracketAfter, "getFirstBracketAfter");
function collectBrackets(node, nodeOffsetStart, nodeOffsetEnd, startOffset, endOffset, push, level, nestingLevelOfEqualBracketType, levelPerBracketType, onlyColorizedBrackets, parentPairIsIncomplete = false) {
  if (level > 200) {
    return true;
  }
  whileLoop: while (true) {
    switch (node.kind) {
      case AstNodeKind.List: {
        const childCount = node.childrenLength;
        for (let i = 0; i < childCount; i++) {
          const child = node.getChild(i);
          if (!child) {
            continue;
          }
          nodeOffsetEnd = lengthAdd(nodeOffsetStart, child.length);
          if (lengthLessThanEqual(nodeOffsetStart, endOffset) && lengthGreaterThanEqual(nodeOffsetEnd, startOffset)) {
            const childEndsAfterEnd = lengthGreaterThanEqual(
              nodeOffsetEnd,
              endOffset
            );
            if (childEndsAfterEnd) {
              node = child;
              continue whileLoop;
            }
            const shouldContinue = collectBrackets(
              child,
              nodeOffsetStart,
              nodeOffsetEnd,
              startOffset,
              endOffset,
              push,
              level,
              0,
              levelPerBracketType,
              onlyColorizedBrackets
            );
            if (!shouldContinue) {
              return false;
            }
          }
          nodeOffsetStart = nodeOffsetEnd;
        }
        return true;
      }
      case AstNodeKind.Pair: {
        const colorize = !onlyColorizedBrackets || !node.closingBracket || node.closingBracket.bracketInfo.closesColorized(
          node.openingBracket.bracketInfo
        );
        let levelPerBracket = 0;
        if (levelPerBracketType) {
          let existing = levelPerBracketType.get(
            node.openingBracket.text
          );
          if (existing === void 0) {
            existing = 0;
          }
          levelPerBracket = existing;
          if (colorize) {
            existing++;
            levelPerBracketType.set(
              node.openingBracket.text,
              existing
            );
          }
        }
        const childCount = node.childrenLength;
        for (let i = 0; i < childCount; i++) {
          const child = node.getChild(i);
          if (!child) {
            continue;
          }
          nodeOffsetEnd = lengthAdd(nodeOffsetStart, child.length);
          if (lengthLessThanEqual(nodeOffsetStart, endOffset) && lengthGreaterThanEqual(nodeOffsetEnd, startOffset)) {
            const childEndsAfterEnd = lengthGreaterThanEqual(
              nodeOffsetEnd,
              endOffset
            );
            if (childEndsAfterEnd && child.kind !== AstNodeKind.Bracket) {
              node = child;
              if (colorize) {
                level++;
                nestingLevelOfEqualBracketType = levelPerBracket + 1;
              } else {
                nestingLevelOfEqualBracketType = levelPerBracket;
              }
              continue whileLoop;
            }
            if (colorize || child.kind !== AstNodeKind.Bracket || !node.closingBracket) {
              const shouldContinue = collectBrackets(
                child,
                nodeOffsetStart,
                nodeOffsetEnd,
                startOffset,
                endOffset,
                push,
                colorize ? level + 1 : level,
                colorize ? levelPerBracket + 1 : levelPerBracket,
                levelPerBracketType,
                onlyColorizedBrackets,
                !node.closingBracket
              );
              if (!shouldContinue) {
                return false;
              }
            }
          }
          nodeOffsetStart = nodeOffsetEnd;
        }
        levelPerBracketType?.set(
          node.openingBracket.text,
          levelPerBracket
        );
        return true;
      }
      case AstNodeKind.UnexpectedClosingBracket: {
        const range = lengthsToRange(nodeOffsetStart, nodeOffsetEnd);
        return push(new BracketInfo(range, level - 1, 0, true));
      }
      case AstNodeKind.Bracket: {
        const range = lengthsToRange(nodeOffsetStart, nodeOffsetEnd);
        return push(
          new BracketInfo(
            range,
            level - 1,
            nestingLevelOfEqualBracketType - 1,
            parentPairIsIncomplete
          )
        );
      }
      case AstNodeKind.Text:
        return true;
    }
  }
}
__name(collectBrackets, "collectBrackets");
class CollectBracketPairsContext {
  constructor(push, includeMinIndentation, textModel) {
    this.push = push;
    this.includeMinIndentation = includeMinIndentation;
    this.textModel = textModel;
  }
  static {
    __name(this, "CollectBracketPairsContext");
  }
}
function collectBracketPairs(node, nodeOffsetStart, nodeOffsetEnd, startOffset, endOffset, context, level, levelPerBracketType) {
  if (level > 200) {
    return true;
  }
  let shouldContinue = true;
  if (node.kind === AstNodeKind.Pair) {
    let levelPerBracket = 0;
    if (levelPerBracketType) {
      let existing = levelPerBracketType.get(node.openingBracket.text);
      if (existing === void 0) {
        existing = 0;
      }
      levelPerBracket = existing;
      existing++;
      levelPerBracketType.set(node.openingBracket.text, existing);
    }
    const openingBracketEnd = lengthAdd(
      nodeOffsetStart,
      node.openingBracket.length
    );
    let minIndentation = -1;
    if (context.includeMinIndentation) {
      minIndentation = node.computeMinIndentation(
        nodeOffsetStart,
        context.textModel
      );
    }
    shouldContinue = context.push(
      new BracketPairWithMinIndentationInfo(
        lengthsToRange(nodeOffsetStart, nodeOffsetEnd),
        lengthsToRange(nodeOffsetStart, openingBracketEnd),
        node.closingBracket ? lengthsToRange(
          lengthAdd(
            openingBracketEnd,
            node.child?.length || lengthZero
          ),
          nodeOffsetEnd
        ) : void 0,
        level,
        levelPerBracket,
        node,
        minIndentation
      )
    );
    nodeOffsetStart = openingBracketEnd;
    if (shouldContinue && node.child) {
      const child = node.child;
      nodeOffsetEnd = lengthAdd(nodeOffsetStart, child.length);
      if (lengthLessThanEqual(nodeOffsetStart, endOffset) && lengthGreaterThanEqual(nodeOffsetEnd, startOffset)) {
        shouldContinue = collectBracketPairs(
          child,
          nodeOffsetStart,
          nodeOffsetEnd,
          startOffset,
          endOffset,
          context,
          level + 1,
          levelPerBracketType
        );
        if (!shouldContinue) {
          return false;
        }
      }
    }
    levelPerBracketType?.set(node.openingBracket.text, levelPerBracket);
  } else {
    let curOffset = nodeOffsetStart;
    for (const child of node.children) {
      const childOffset = curOffset;
      curOffset = lengthAdd(curOffset, child.length);
      if (lengthLessThanEqual(childOffset, endOffset) && lengthLessThanEqual(startOffset, curOffset)) {
        shouldContinue = collectBracketPairs(
          child,
          childOffset,
          curOffset,
          startOffset,
          endOffset,
          context,
          level,
          levelPerBracketType
        );
        if (!shouldContinue) {
          return false;
        }
      }
    }
  }
  return shouldContinue;
}
__name(collectBracketPairs, "collectBracketPairs");
export {
  BracketPairsTree
};
//# sourceMappingURL=bracketPairsTree.js.map
