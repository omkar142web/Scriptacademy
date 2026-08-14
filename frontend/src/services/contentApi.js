const API_URL = import.meta.env?.VITE_API_URL || '/api';

async function request(path) {
  const response = await fetch(`${API_URL}${path}`);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Request failed: ${path}`);
  }

  return response.json();
}

export async function getContentTree() {
  return request('/content/tree');
}

export async function getNode(path) {
  return request(`/content/node?path=${encodeURIComponent(path)}`);
}

export async function getLesson(path) {
  return request(`/content/lesson?path=${encodeURIComponent(path)}`);
}
