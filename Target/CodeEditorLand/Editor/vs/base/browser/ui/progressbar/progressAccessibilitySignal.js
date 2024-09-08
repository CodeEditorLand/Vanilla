const nullScopedAccessibilityProgressSignalFactory = () => ({
  msLoopTime: -1,
  msDelayTime: -1,
  dispose: () => {
  }
});
let progressAccessibilitySignalSchedulerFactory = nullScopedAccessibilityProgressSignalFactory;
function setProgressAcccessibilitySignalScheduler(progressAccessibilitySignalScheduler) {
  progressAccessibilitySignalSchedulerFactory = progressAccessibilitySignalScheduler;
}
function getProgressAcccessibilitySignalScheduler(msDelayTime, msLoopTime) {
  return progressAccessibilitySignalSchedulerFactory(msDelayTime, msLoopTime);
}
export {
  getProgressAcccessibilitySignalScheduler,
  setProgressAcccessibilitySignalScheduler
};
