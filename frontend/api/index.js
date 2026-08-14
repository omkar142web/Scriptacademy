import express from 'express';
import cors from 'cors';

import {
  getLesson,
  getNode,
  buildContentTree,
} from '../contentScanner.js';

const app = express();

app.use(cors());
app.use(express.json());

/*
  Health check
*/
app.get(['/api/health', '/health'], (req, res) => {
  res.json({
    status: 'ok',
  });
});

/*
  Get the entire content structure.

  React uses this to build the sidebar automatically.
*/
app.get(['/api/content/tree', '/content/tree'], (req, res) => {
  try {
    const tree = buildContentTree();

    res.json(tree);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: 'Failed to scan content',
    });
  }
});

/*
  Get a single node (domain, subject or module) by its path.

  Example:

  /api/content/node?path=programming/javascript
*/
app.get(['/api/content/node', '/content/node'], (req, res) => {
  try {
    const slug = req.query.path;

    if (!slug) {
      return res.status(400).json({
        error: 'Missing node path',
      });
    }

    const node = getNode(slug);

    if (!node) {
      return res.status(404).json({
        error: 'Node not found',
      });
    }

    res.json(node);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: 'Failed to load node',
    });
  }
});

/*
  Get a specific Markdown lesson, including its metadata,
  breadcrumbs and previous/next siblings.

  Example:

  /api/content/lesson?path=programming/javascript/basics/data-types
*/
app.get(['/api/content/lesson', '/content/lesson'], (req, res) => {
  try {
    const slug = req.query.path;

    if (!slug) {
      return res.status(400).json({
        error: 'Missing lesson path',
      });
    }

    const lesson = getLesson(slug);

    if (!lesson) {
      return res.status(404).json({
        error: 'Lesson not found',
      });
    }

    res.json(lesson);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: 'Failed to load lesson',
    });
  }
});

export default app;
