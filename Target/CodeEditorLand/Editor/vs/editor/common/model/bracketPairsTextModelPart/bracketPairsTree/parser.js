var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import {
  AstNodeKind,
  InvalidBracketAstNode,
  ListAstNode,
  PairAstNode,
  TextAstNode
} from "./ast.js";
import {
  BeforeEditPositionMapper
} from "./beforeEditPositionMapper.js";
import { concat23Trees, concat23TreesOfSameHeight } from "./concat23Trees.js";
import { lengthIsZero, lengthLessThan } from "./length.js";
import { NodeReader } from "./nodeReader.js";
import { SmallImmutableSet } from "./smallImmutableSet.js";
import {
  TokenKind
} from "./tokenizer.js";
function parseDocument(tokenizer, edits, oldNode, createImmutableLists) {
  const parser = new Parser(tokenizer, edits, oldNode, createImmutableLists);
  return parser.parseDocument();
}
__name(parseDocument, "parseDocument");
class Parser {
  constructor(tokenizer, edits, oldNode, createImmutableLists) {
    this.tokenizer = tokenizer;
    this.createImmutableLists = createImmutableLists;
    if (oldNode && createImmutableLists) {
      throw new Error("Not supported");
    }
    this.oldNodeReader = oldNode ? new NodeReader(oldNode) : void 0;
    this.positionMapper = new BeforeEditPositionMapper(edits);
  }
  static {
    __name(this, "Parser");
  }
  oldNodeReader;
  positionMapper;
  _itemsConstructed = 0;
  _itemsFromCache = 0;
  /**
   * Reports how many nodes were constructed in the last parse operation.
   */
  get nodesConstructed() {
    return this._itemsConstructed;
  }
  /**
   * Reports how many nodes were reused in the last parse operation.
   */
  get nodesReused() {
    return this._itemsFromCache;
  }
  parseDocument() {
    this._itemsConstructed = 0;
    this._itemsFromCache = 0;
    let result = this.parseList(SmallImmutableSet.getEmpty(), 0);
    if (!result) {
      result = ListAstNode.getEmpty();
    }
    return result;
  }
  parseList(openedBracketIds, level) {
    const items = [];
    while (true) {
      let child = this.tryReadChildFromCache(openedBracketIds);
      if (!child) {
        const token = this.tokenizer.peek();
        if (!token || token.kind === TokenKind.ClosingBracket && token.bracketIds.intersects(openedBracketIds)) {
          break;
        }
        child = this.parseChild(openedBracketIds, level + 1);
      }
      if (child.kind === AstNodeKind.List && child.childrenLength === 0) {
        continue;
      }
      items.push(child);
    }
    const result = this.oldNodeReader ? concat23Trees(items) : concat23TreesOfSameHeight(items, this.createImmutableLists);
    return result;
  }
  tryReadChildFromCache(openedBracketIds) {
    if (this.oldNodeReader) {
      const maxCacheableLength = this.positionMapper.getDistanceToNextChange(
        this.tokenizer.offset
      );
      if (maxCacheableLength === null || !lengthIsZero(maxCacheableLength)) {
        const cachedNode = this.oldNodeReader.readLongestNodeAt(
          this.positionMapper.getOffsetBeforeChange(
            this.tokenizer.offset
          ),
          (curNode) => {
            if (maxCacheableLength !== null && !lengthLessThan(curNode.length, maxCacheableLength)) {
              return false;
            }
            const canBeReused = curNode.canBeReused(openedBracketIds);
            return canBeReused;
          }
        );
        if (cachedNode) {
          this._itemsFromCache++;
          this.tokenizer.skip(cachedNode.length);
          return cachedNode;
        }
      }
    }
    return void 0;
  }
  parseChild(openedBracketIds, level) {
    this._itemsConstructed++;
    const token = this.tokenizer.read();
    switch (token.kind) {
      case TokenKind.ClosingBracket:
        return new InvalidBracketAstNode(
          token.bracketIds,
          token.length
        );
      case TokenKind.Text:
        return token.astNode;
      case TokenKind.OpeningBracket: {
        if (level > 300) {
          return new TextAstNode(token.length);
        }
        const set = openedBracketIds.merge(token.bracketIds);
        const child = this.parseList(set, level + 1);
        const nextToken = this.tokenizer.peek();
        if (nextToken && nextToken.kind === TokenKind.ClosingBracket && (nextToken.bracketId === token.bracketId || nextToken.bracketIds.intersects(token.bracketIds))) {
          this.tokenizer.read();
          return PairAstNode.create(
            token.astNode,
            child,
            nextToken.astNode
          );
        } else {
          return PairAstNode.create(
            token.astNode,
            child,
            null
          );
        }
      }
      default:
        throw new Error("unexpected");
    }
  }
}
export {
  parseDocument
};
//# sourceMappingURL=parser.js.map
