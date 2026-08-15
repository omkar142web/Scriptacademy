/*
  Custom remark plugins used by the Markdown renderer.

  They extend the base parser (remark-parse + remark-gfm) with
  constructs that are common in learning content:

  - GitHub-style alerts: `> [!NOTE]`, `> [!TIP]`, ...
  - Highlight spans: `==text==`
  - Emoji shortcodes: `:rocket:`, `:bulb:`, ...

  Content stays pure Markdown; all presentation happens in CSS.
*/

import { visit } from 'unist-util-visit';

/*
  Keep fenced-code metadata (`\`\`\`js title="app.js"`) across rehype-raw.

  remark-rehype stores the fence meta on `node.data.meta` of the `code`
  element, but `rehype-raw` re-parses the tree and drops custom `data`
  fields. This plugin runs before rehype-raw and copies the meta onto an
  HTML data attribute so it survives.
*/
export function rehypePreserveCodeMeta() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName === 'code' && node.data && node.data.meta) {
        node.properties.dataCodeMeta = node.data.meta;
      }
    });
  };
}

/*
  Collect every heading in the rendered document so the lesson page
  can build an "On this page" table of contents.

  Must run after `rehype-slug`, which assigns the `id` each heading
  links to. The collected items are written onto `targetRef.current`.
*/
function collectText(node) {
  if (node.type === 'text') return node.value;
  if (node.type === 'element') {
    return (node.children || []).map(collectText).join('');
  }
  return '';
}

export function rehypeCollectHeadings(targetRef) {
  return () => (tree) => {
    const items = [];

    visit(tree, 'element', (node) => {
      const match = /^h([1-6])$/.exec(node.tagName || '');
      if (!match || !node.properties?.id) return;

      const text = collectText(node).trim();
      if (!text) return;

      items.push({
        id: node.properties.id,
        depth: Number(match[1]),
        text,
      });
    });

    targetRef.current = items;
  };
}

const ALERT_TYPES = {
  NOTE: 'note',
  TIP: 'tip',
  IMPORTANT: 'important',
  WARNING: 'warning',
  CAUTION: 'caution',
};

/*
  Convert `> [!NOTE] ...` blockquotes into styled alert callouts.

  The marker is stripped from the first paragraph and the blockquote
  is annotated so it renders as `<blockquote class="md-alert md-alert-note">`.
*/
export function remarkAlerts() {
  return (tree) => {
    visit(tree, 'blockquote', (node) => {
      const first = node.children.find(
        (child) => child.type === 'paragraph',
      );
      if (!first) return;

      const text = first.children.find(
        (child) => child.type === 'text',
      );
      if (!text) return;

      const match = /^\s*\[!([A-Z]+)\]\s?/.exec(text.value);
      if (!match || !ALERT_TYPES[match[1]]) return;

      const type = ALERT_TYPES[match[1]];

      text.value = text.value.slice(match[0].length).replace(/^\s+/, '');

      // Drop the marker paragraph entirely when it held nothing else.
      const empty = (child) =>
        child.children.every(
          (inner) => inner.type === 'text' && inner.value.trim() === '',
        );
      node.children = node.children.filter(
        (child) => child !== first || !empty(first),
      );

      node.data = {
        hProperties: {
          className: ['md-alert', `md-alert-${type}`],
          'data-alert': match[1].toLowerCase(),
        },
      };
    });
  };
}

/*
  Convert `==highlighted==` into `<mark>` elements.

  `mark` is not part of the base Markdown spec, so we transform the
  parsed tree and let mdast-to-hast render it as an HTML `<mark>`.
*/
export function remarkMark() {
  return (tree) => {
    visit(tree, 'text', (node, index, parent) => {
      if (!parent) return;

      const parts = node.value.split(/(==[^=\n]+==)/g);
      if (parts.length === 1) return;

      const nodes = [];
      for (const part of parts) {
        if (!part) continue;

        const match = /^==([^=\n]+)==$/.exec(part);
        if (match) {
          nodes.push({
            type: 'mark',
            data: { hName: 'mark' },
            children: [{ type: 'text', value: match[1] }],
          });
        } else {
          nodes.push({ type: 'text', value: part });
        }
      }

      parent.children.splice(index, 1, ...nodes);
    });
  };
}

/*
  Replace GitHub-style `:shortcode:` emoji with real emoji characters.

  Only plain text nodes are touched; code blocks and URLs are skipped
  because they are stored as `code` / `inlineCode` node values, never
  as text children.
*/
export function remarkEmoji() {
  return (tree) => {
    visit(tree, 'text', (node) => {
      node.value = node.value.replace(
        /:([a-zA-Z0-9_+]+):/g,
        (match, key) => EMOJI[key] || match,
      );
    });
  };
}

const EMOJI = {
  rocket: '🚀',
  warning: '⚠️',
  white_check_mark: '✅',
  x: '❌',
  bulb: '💡',
  bug: '🐛',
  fire: '🔥',
  tada: '🎉',
  sparkles: '✨',
  heart: '❤️',
  bookmark: '🔖',
  key: '🔑',
  lock: '🔒',
  unlock: '🔓',
  eyes: '👀',
  zap: '⚡',
  memo: '📝',
  book: '📖',
  page_facing_up: '📄',
  package: '📦',
  pushpin: '📌',
  hourglass: '⏳',
  alarm_clock: '⏰',
  thinking: '🤔',
  raised_hands: '🙌',
  thumbsup: '👍',
  thumbsdown: '👎',
  clap: '👏',
  loudspeaker: '📢',
  flag: '🚩',
  checkered_flag: '🏁',
  trophy: '🏆',
  medal: '🏅',
  star: '⭐',
  dizzy: '💫',
  construction: '🚧',
  question: '❓',
  exclamation: '❗',
  chart_with_upwards_trend: '📈',
  bar_chart: '📊',
  scroll: '📜',
  hammer: '🔨',
  wrench: '🔧',
  link: '🔗',
  paperclip: '📎',
  scissors: '✂️',
  telephone: '☎️',
  email: '✉️',
  calendar: '📅',
  clock3: '🕒',
  soon: '🔜',
  interrobang: '⁉️',
  heavy_check_mark: '✔️',
  heavy_multiplication_x: '✖️',
  arrow_right: '➡️',
  arrow_left: '⬅️',
  arrow_up: '⬆️',
  arrow_down: '⬇️',
  check: '✅',
  info: 'ℹ️',
  cd: '💿',
  computer: '💻',
  display: '🖥️',
  file_folder: '📁',
  open_file_folder: '📂',
  repeat: '🔁',
  fast_forward: '⏩',
  rewind: '⏪',
  pause_button: '⏸️',
  play_button: '▶️',
  stop_button: '⏹️',
  world_map: '🗺️',
  brain: '🧠',
  pencil: '✏️',
  open_book: '📖',
  speech_balloon: '💬',
  question_mark: '❓',
  light_bulb: '💡',
};