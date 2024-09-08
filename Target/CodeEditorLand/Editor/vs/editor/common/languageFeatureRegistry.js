import { Emitter } from "../../base/common/event.js";
import { toDisposable } from "../../base/common/lifecycle.js";
import {
  score
} from "./languageSelector.js";
import { shouldSynchronizeModel } from "./model.js";
function isExclusive(selector) {
  if (typeof selector === "string") {
    return false;
  } else if (Array.isArray(selector)) {
    return selector.every(isExclusive);
  } else {
    return !!selector.exclusive;
  }
}
class MatchCandidate {
  constructor(uri, languageId, notebookUri, notebookType, recursive) {
    this.uri = uri;
    this.languageId = languageId;
    this.notebookUri = notebookUri;
    this.notebookType = notebookType;
    this.recursive = recursive;
  }
  equals(other) {
    return this.notebookType === other.notebookType && this.languageId === other.languageId && this.uri.toString() === other.uri.toString() && this.notebookUri?.toString() === other.notebookUri?.toString() && this.recursive === other.recursive;
  }
}
class LanguageFeatureRegistry {
  constructor(_notebookInfoResolver) {
    this._notebookInfoResolver = _notebookInfoResolver;
  }
  _clock = 0;
  _entries = [];
  _onDidChange = new Emitter();
  onDidChange = this._onDidChange.event;
  register(selector, provider) {
    let entry = {
      selector,
      provider,
      _score: -1,
      _time: this._clock++
    };
    this._entries.push(entry);
    this._lastCandidate = void 0;
    this._onDidChange.fire(this._entries.length);
    return toDisposable(() => {
      if (entry) {
        const idx = this._entries.indexOf(entry);
        if (idx >= 0) {
          this._entries.splice(idx, 1);
          this._lastCandidate = void 0;
          this._onDidChange.fire(this._entries.length);
          entry = void 0;
        }
      }
    });
  }
  has(model) {
    return this.all(model).length > 0;
  }
  all(model) {
    if (!model) {
      return [];
    }
    this._updateScores(model, false);
    const result = [];
    for (const entry of this._entries) {
      if (entry._score > 0) {
        result.push(entry.provider);
      }
    }
    return result;
  }
  allNoModel() {
    return this._entries.map((entry) => entry.provider);
  }
  ordered(model, recursive = false) {
    const result = [];
    this._orderedForEach(
      model,
      recursive,
      (entry) => result.push(entry.provider)
    );
    return result;
  }
  orderedGroups(model) {
    const result = [];
    let lastBucket;
    let lastBucketScore;
    this._orderedForEach(model, false, (entry) => {
      if (lastBucket && lastBucketScore === entry._score) {
        lastBucket.push(entry.provider);
      } else {
        lastBucketScore = entry._score;
        lastBucket = [entry.provider];
        result.push(lastBucket);
      }
    });
    return result;
  }
  _orderedForEach(model, recursive, callback) {
    this._updateScores(model, recursive);
    for (const entry of this._entries) {
      if (entry._score > 0) {
        callback(entry);
      }
    }
  }
  _lastCandidate;
  _updateScores(model, recursive) {
    const notebookInfo = this._notebookInfoResolver?.(model.uri);
    const candidate = notebookInfo ? new MatchCandidate(
      model.uri,
      model.getLanguageId(),
      notebookInfo.uri,
      notebookInfo.type,
      recursive
    ) : new MatchCandidate(
      model.uri,
      model.getLanguageId(),
      void 0,
      void 0,
      recursive
    );
    if (this._lastCandidate?.equals(candidate)) {
      return;
    }
    this._lastCandidate = candidate;
    for (const entry of this._entries) {
      entry._score = score(
        entry.selector,
        candidate.uri,
        candidate.languageId,
        shouldSynchronizeModel(model),
        candidate.notebookUri,
        candidate.notebookType
      );
      if (isExclusive(entry.selector) && entry._score > 0) {
        if (recursive) {
          entry._score = 0;
        } else {
          for (const entry2 of this._entries) {
            entry2._score = 0;
          }
          entry._score = 1e3;
          break;
        }
      }
    }
    this._entries.sort(LanguageFeatureRegistry._compareByScoreAndTime);
  }
  static _compareByScoreAndTime(a, b) {
    if (a._score < b._score) {
      return 1;
    } else if (a._score > b._score) {
      return -1;
    }
    if (isBuiltinSelector(a.selector) && !isBuiltinSelector(b.selector)) {
      return 1;
    } else if (!isBuiltinSelector(a.selector) && isBuiltinSelector(b.selector)) {
      return -1;
    }
    if (a._time < b._time) {
      return 1;
    } else if (a._time > b._time) {
      return -1;
    } else {
      return 0;
    }
  }
}
function isBuiltinSelector(selector) {
  if (typeof selector === "string") {
    return false;
  }
  if (Array.isArray(selector)) {
    return selector.some(isBuiltinSelector);
  }
  return Boolean(selector.isBuiltin);
}
export {
  LanguageFeatureRegistry
};
