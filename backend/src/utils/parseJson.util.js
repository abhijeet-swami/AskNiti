export const safeParseJSON = (raw) => {
  try {
    return JSON.parse(raw);
  } catch {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start === -1 || end === -1) return null;
    try {
      return JSON.parse(raw.substring(start, end + 1));
    } catch {
      return null;
    }
  }
};
