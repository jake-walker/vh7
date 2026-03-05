type SupportedType = "image" | "video" | "audio" | "pdf" | "text" | "markdown" | "unsupported";

export function getPreviewType(mimeType: string, filename?: string): SupportedType {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  if (mimeType === "application/pdf") return "pdf";

  if (mimeType === "text/markdown" || mimeType === "text/x-markdown" || filename?.match(/\.md$/i)) {
    return "markdown";
  }

  if (mimeType.startsWith("text/")) return "text";

  return "unsupported";
}

export function formatBytes(v: number): string {
  let size = `${v} bytes`;
  if (v > 1000000) {
    size = `${(v / 1000000).toFixed(1)} MB`;
  } else if (v > 1000) {
    size = `${(v / 1000).toFixed(1)} KB`;
  }
  return size;
}
