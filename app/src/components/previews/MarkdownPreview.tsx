import { Typography } from "@mantine/core";
import DOMPurify from "dompurify";
import { marked, Renderer } from "marked";

const renderer = new Renderer();

renderer.link = ({ href, title, text }) => {
  const titleAttr = title ? ` title="${title}"` : "";
  const safeSrc = href && /^(https?:|mailto:|\/|#)/.test(href) ? href : "#blocked";
  return `<a href="${safeSrc}"${titleAttr} target="_blank" rel="noopener noreferrer">${text}</a>`;
};

marked.use({
  gfm: true,
  renderer
});

export function MarkdownPreview({ content }: { content: string }) {
  const dirty = marked.parse(content) as string;
  const clean = DOMPurify.sanitize(dirty, {
    USE_PROFILES: { html: true },
    SANITIZE_DOM: true
  });

  // biome-ignore lint/security/noDangerouslySetInnerHtml: this is required for showing a markdown render
  return <Typography><div dangerouslySetInnerHTML={{ __html: clean }} /></Typography>
}
