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
  Recursively find every Markdown file.
*/
function scanDirectory(directory, relativePath = '') {
  const entries = fs.readdirSync(directory, {
    withFileTypes: true,
  });

  const result = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.')) {
      continue;
    }

    const fullPath = path.join(directory, entry.name);

    const entryRelativePath = path.join(
      relativePath,
      entry.name
    );

    if (entry.isDirectory()) {
      result.push(
        ...scanDirectory(
          fullPath,
          entryRelativePath
        )
      );
    }

    if (
      entry.isFile() &&
      entry.name.toLowerCase().endsWith('.md')
    ) {
      result.push({
        filePath: fullPath,
        relativePath: entryRelativePath
          .replaceAll('\\', '/'),
        slug: entryRelativePath
          .replaceAll('\\', '/')
          .replace(/\.md$/, ''),
      });
    }
  }

  return result;
}

/*
  Get every Markdown lesson.
*/
function getAllLessons() {
  if (!fs.existsSync(CONTENT_DIR)) {
    return [];
  }

  return scanDirectory(CONTENT_DIR);
}

/*
  Find one lesson by URL path.
*/
function getLesson(slug) {
  const lessons = getAllLessons();

  return lessons.find(
    lesson => lesson.slug === slug
  );
}

/*
  Build a tree from all Markdown files.

  Example:

  programming/
    javascript/
      basics/
        intro
        variables
*/
function buildContentTree() {
  const lessons = getAllLessons();

  const root = {};

  for (const lesson of lessons) {
    const parts = lesson.slug.split('/');

    let current = root;

    parts.forEach((part, index) => {
      const isLesson =
        index === parts.length - 1;

      if (!current[part]) {
        current[part] = isLesson
          ? {
              type: 'lesson',
              slug: lesson.slug,
              title: formatTitle(part),
            }
          : {
              type: 'folder',
              children: {},
            };
      }

      if (!isLesson) {
        current = current[part].children;
      }
    });
  }

  return convertTree(root);
}

/*
  Convert internal object into an array
  that React can easily render.
*/
function convertTree(node) {
  return Object.entries(node)
    .map(([name, value]) => {
      if (value.type === 'lesson') {
        return {
          type: 'lesson',
          name,
          title: value.title,
          slug: value.slug,
        };
      }

      return {
        type: 'folder',
        name,
        title: formatTitle(name),
        children: convertTree(value.children),
      };
    })
    .sort((a, b) => {
      /*
        Folders first, lessons second.
      */
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }

      return a.title.localeCompare(b.title);
    });
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

function readLesson(lesson) {
  if (!lesson) {
    return null;
  }

  return fs.readFileSync(
    lesson.filePath,
    'utf-8'
  );
}

export {
  getAllLessons,
  getLesson,
  readLesson,
  buildContentTree,
};