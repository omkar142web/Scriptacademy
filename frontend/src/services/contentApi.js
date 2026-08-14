export async function getContentTree() {
  const response = await fetch(
    '/api/content/tree'
  );

  if (!response.ok) {
    throw new Error(
      'Failed to load content tree'
    );
  }

  return response.json();
}

export async function getLesson(path) {
  const response = await fetch(
    `/api/content/lesson?path=${encodeURIComponent(path)}`
  );

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }

    throw new Error(
      'Failed to load lesson'
    );
  }

  return response.json();
}