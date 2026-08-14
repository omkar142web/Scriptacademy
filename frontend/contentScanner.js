import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getContentDir() {
  const possiblePaths = [
    process.env.CONTENT_DIR,
    path.resolve(process.cwd(), 'content'),
    path.resolve(process.cwd(), '../content'),
    path.resolve(process.cwd(), '../../content'),
    path.resolve(__dirname, 'content'),
    path.resolve(__dirname, '../content'),
    path.resolve(__dirname, '../../content'),
  ].filter(Boolean);

  for (const dirPath of possiblePaths) {
    if (fs.existsSync(dirPath)) {
      return dirPath;
    }
  }

  return possiblePaths[0] || path.resolve(process.cwd(), 'content');
}

const CONTENT_DIR = getContentDir();

/*
  A folder may contain an optional _index.md whose
  frontmatter supplies the folder's title, description
  and order. It is never treated as a lesson.

  README.md files are repository-level documentation
  and are not part of the content hierarchy.
*/
const INDEX_FILE = '_index.md';
const README_FILE = 'readme.md';

/*
  Split a Markdown file into frontmatter metadata and body.

  ---
  title: Data Types
  order: 3
  ---

  # Data Types
  ...
*/
function splitFrontmatter(content) {
  const text = content.replace(/^\uFEFF/, '');
  const lines = text.split(/\r?\n/);

  if (lines[0].trim() !== '---') {
    return { meta: {}, body: text };
  }

  let index = 1;
  const metaLines = [];

  while (index < lines.length && lines[index].trim() !== '---') {
    metaLines.push(lines[index]);
    index += 1;
  }

  if (index >= lines.length) {
    return { meta: {}, body: text };
  }

  return {
    meta: parseMeta(metaLines.join('\n')),
    body: lines.slice(index + 1).join('\n'),
  };
}

/*
  Minimal YAML-ish parser for the metadata we care about:
  title, description and order. Quoted values are supported.
*/
function parseMeta(raw) {
  const meta = {};

  for (const line of raw.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z0-9_-]+)\s*:\s*(.*)\s*$/);

    if (!match) {
      continue;
    }

    let value = match[2].trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (match[1] === 'order') {
      const number = Number(value);
      meta.order = Number.isFinite(number) ? number : null;
    } else {
      meta[match[1]] = value || null;
    }
  }

  return meta;
}

/*
  Convert:

  data-types
  hello-world
  javascript

  into:

  Data Types
  Hello World
  Javascript
*/
function formatTitle(value) {
  return value
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, char =>
      char.toUpperCase()
    );
}

/*
  Order folders and lessons by their `order` metadata first,
  then fall back to title. Items without an order come last.
*/
function compareNodes(a, b) {
  if (a.type !== b.type) {
    return a.type === 'folder' ? -1 : 1;
  }

  const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
  const orderB = b.order ?? Number.MAX_SAFE_INTEGER;

  if (orderA !== orderB) {
    return orderA - orderB;
  }

  return a.title.localeCompare(b.title);
}

function readFileMeta(filePath) {
  try {
    return splitFrontmatter(fs.readFileSync(filePath, 'utf-8')).meta;
  } catch {
    return {};
  }
}

function readIndexMeta(dirPath) {
  const indexPath = path.join(dirPath, INDEX_FILE);

  if (!fs.existsSync(indexPath)) {
    return {};
  }

  return readFileMeta(indexPath);
}

/*
  Build the full content tree.

  Example result (top level is always the domains array):

  [
    {
      type: 'folder',
      name: 'programming',
      slug: 'programming',
      level: 'domain',
      title: 'Programming',
      description: '...',
      children: [ ... ]
    }
  ]
*/
function buildContentTree() {
  if (!fs.existsSync(CONTENT_DIR)) {
    return [];
  }

  return buildChildren(CONTENT_DIR, '');
}

function buildChildren(dirPath, relPath) {
  const folders = [];
  const lessons = [];

  const entries = fs.readdirSync(dirPath, {
    withFileTypes: true,
  });

  for (const entry of entries) {
    if (entry.name.startsWith('.')) {
      continue;
    }

    if (entry.name.toLowerCase() === INDEX_FILE) {
      continue;
    }

    if (entry.name.toLowerCase() === README_FILE) {
      continue;
    }

    const childPath = path.join(dirPath, entry.name);
    const childRel = relPath
      ? `${relPath}/${entry.name}`
      : entry.name;

    if (entry.isDirectory()) {
      folders.push(buildFolder(childPath, childRel));
    } else if (
      entry.isFile() &&
      entry.name.toLowerCase().endsWith('.md')
    ) {
      lessons.push(buildLesson(childPath, childRel));
    }
  }

  return [...folders, ...lessons].sort(compareNodes);
}

function buildFolder(dirPath, relPath) {
  const meta = readIndexMeta(dirPath);
  const name = path.basename(dirPath);
  const depth = relPath.split('/').length;

  return {
    type: 'folder',
    name,
    slug: relPath,
    level: getFolderLevel(depth),
    title: meta.title || formatTitle(name),
    description: meta.description || null,
    order: meta.order ?? null,
    children: buildChildren(dirPath, relPath),
  };
}

function getFolderLevel(depth) {
  if (depth === 1) return 'domain';
  if (depth === 2) return 'subject';
  if (depth === 3) return 'module';
  return 'folder';
}

function buildLesson(filePath, relPath) {
  const meta = readFileMeta(filePath);
  const name = path.basename(filePath).replace(/\.md$/, '');

  return {
    type: 'lesson',
    name,
    slug: relPath.replace(/\.md$/, ''),
    level: 'lesson',
    title: meta.title || formatTitle(name),
    description: meta.description || null,
    order: meta.order ?? null,
  };
}

/*
  Walk a tree and return the node matching the given path parts,
  or null when it does not exist.
*/
function findNode(tree, parts) {
  let nodes = tree;

  for (let i = 0; i < parts.length; i += 1) {
    const node = nodes.find(item => item.name === parts[i]);

    if (!node) {
      return null;
    }

    if (i === parts.length - 1) {
      return node;
    }

    if (node.type !== 'folder') {
      return null;
    }

    nodes = node.children;
  }

  return null;
}

/*
  Get a node (folder or lesson) by its URL slug.
*/
function getNode(slug) {
  const parts = (slug || '').split('/').filter(Boolean);

  if (!parts.length) {
    return null;
  }

  const tree = buildContentTree();
  const node = findNode(tree, parts);

  if (!node) {
    return null;
  }

  return {
    ...node,
    breadcrumbs: buildBreadcrumbs(tree, parts),
  };
}

/*
  Every lesson node in the tree, flattened.
*/
function getAllLessons() {
  const result = [];

  walkLessons(buildContentTree(), result);

  return result;
}

function walkLessons(nodes, result) {
  for (const node of nodes) {
    if (node.type === 'lesson') {
      result.push(node);
    } else {
      walkLessons(node.children, result);
    }
  }
}

/*
  Build the breadcrumb trail for a lesson:
  Programming / JavaScript / Basics / Data Types
*/
function buildBreadcrumbs(tree, parts) {
  const crumbs = [];
  let nodes = tree;
  let pathParts = [];

  for (let i = 0; i < parts.length; i += 1) {
    const node = nodes.find(item => item.name === parts[i]);

    if (!node) {
      break;
    }

    pathParts.push(node.name);

    crumbs.push({
      slug: pathParts.join('/'),
      title: node.title,
    });

    if (node.type !== 'folder') {
      break;
    }

    nodes = node.children;
  }

  return crumbs;
}

function toLink(lesson) {
  return {
    slug: lesson.slug,
    title: lesson.title,
  };
}

/*
  Load a single lesson: Markdown body plus metadata,
  breadcrumbs, and previous/next siblings from the content order.
*/
function getLesson(slug) {
  const parts = (slug || '').split('/').filter(Boolean);

  if (!parts.length) {
    return null;
  }

  const tree = buildContentTree();
  const node = findNode(tree, parts);

  if (!node || node.type !== 'lesson') {
    return null;
  }

  const filePath = path.join(CONTENT_DIR, ...parts) + '.md';

  try {
    const { body } = splitFrontmatter(
      fs.readFileSync(filePath, 'utf-8')
    );

    const moduleNode = findNode(tree, parts.slice(0, -1));

    const lessons = (moduleNode && moduleNode.children
      ? moduleNode.children
      : []
    )
      .filter(child => child.type === 'lesson')
      .sort(compareNodes);

    const index = lessons.findIndex(
      lesson => lesson.slug === node.slug
    );

    return {
      slug: node.slug,
      name: node.name,
      title: node.title,
      description: node.description,
      content: body.replace(/^\s*\r?\n/, ''),
      breadcrumbs: buildBreadcrumbs(tree, parts),
      prev: index > 0 ? toLink(lessons[index - 1]) : null,
      next:
        index >= 0 && index < lessons.length - 1
          ? toLink(lessons[index + 1])
          : null,
    };
  } catch {
    return null;
  }
}

export {
  getAllLessons,
  getLesson,
  getNode,
  buildContentTree,
  formatTitle,
};
