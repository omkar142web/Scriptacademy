const express = require('express');
const cors = require('cors');

const {
  getLesson,
  readLesson,
  buildContentTree,
} = require('./contentScanner');

const app = express();

app.use(cors());
app.use(express.json());

/*
  Health check
*/
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
  });
});

/*
  Get entire content structure.

  React uses this to build
  the sidebar automatically.
*/
app.get('/api/content/tree', (req, res) => {
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
  Get a specific Markdown lesson.

  Example:

  /api/content/lesson?path=programming/javascript/basics/intro
*/
app.get('/api/content/lesson', (req, res) => {
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

    const content = readLesson(lesson);

    res.json({
      slug: lesson.slug,
      content,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: 'Failed to load lesson',
    });
  }
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(
    `Backend running at http://localhost:${PORT}`
  );
});