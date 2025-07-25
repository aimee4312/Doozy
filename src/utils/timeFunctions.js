export const getTimePassedString = (timestamp) => {
    const timestampMs = timestamp.seconds * 1000 + Math.floor(timestamp.nanoseconds / 1e6);
    const now = new Date();
    const nowMs = now.getTime();
    const timePassedMs = nowMs - timestampMs;
    const timePassedS = Math.floor(timePassedMs / (1000));
    if (timePassedS < 60) {
      if (timePassedS === 1) {
        return `1 second ago`;
      }
      return `${timePassedS} seconds ago`;
    }
    const timePassedM = Math.round(timePassedMs / (1000 * 60));
    if (timePassedM < 60) {
      if (timePassedM === 1) {
        return `1 minute ago`;
      }
      return `${timePassedM} minutes ago`;
    }
    const timePassedH = Math.round(timePassedMs / (1000 * 60 * 60));
    if (timePassedH < 24) {
      if (timePassedH === 1) {
        return `1 hour ago`;
      }
      return `${timePassedH} hours ago`;
    }
    const timePassedD = Math.round(timePassedMs / (1000 * 60 * 60 * 24));
    if (timePassedD < 7) {
      if (timePassedD === 1) {
        return `1 day ago`;
      }
      return `${timePassedD} days ago`;
    }
    const date = new Date(timestampMs);
    return date.toLocaleDateString();
  }