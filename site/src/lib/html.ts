// Post content is rich-text HTML written in the admin editor. Sanitize before rendering.
import sanitizeHtml from 'sanitize-html';
import { API_URL } from './api';

export function renderContent(html: string): string {
  return sanitizeHtml(html ?? '', {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'figure', 'figcaption', 'h1', 'h2', 'iframe', 'u', 's']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
      a: ['href', 'name', 'target', 'rel'],
      '*': ['class', 'style'],
    },
    // style is limited to harmless text/layout properties
    allowedStyles: {
      '*': {
        'text-align': [/^(left|right|center|justify)$/],
        color: [/^#[0-9a-f]{3,8}$/i, /^rgb\(/],
        'font-weight': [/^\w+$/],
        'font-style': [/^\w+$/],
        'text-decoration': [/^[\w\s-]+$/],
      },
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedIframeHostnames: ['www.youtube.com', 'www.youtube-nocookie.com', 'player.vimeo.com'],
    transformTags: {
      // Uploaded images are stored as relative /static/... URLs: make them absolute.
      img: (_tag, attribs) => {
        const src = attribs.src ?? '';
        const abs = /^https?:\/\//i.test(src) ? src : `${API_URL}${src.startsWith('/') ? '' : '/'}${src}`;
        return { tagName: 'img', attribs: { ...attribs, src: abs, loading: 'lazy' } };
      },
      a: (_tag, attribs) =>
        attribs.target === '_blank'
          ? { tagName: 'a', attribs: { ...attribs, rel: 'noopener noreferrer' } }
          : { tagName: 'a', attribs },
    },
  });
}
