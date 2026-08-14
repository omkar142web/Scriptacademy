import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { getContentTree } from '../services/contentApi';

function TreeNode({ item }) {
  if (item.type === 'lesson') {
    return (
      <Link
        to={`/${item.slug}`}
        className="sidebar-link"
      >
        {item.title}
      </Link>
    );
  }

  return (
    <div className="sidebar-folder">
      <div className="sidebar-folder-title">
        {item.title}
      </div>

      <div className="sidebar-children">
        {item.children.map(child => (
          <TreeNode
            key={
              child.slug ||
              child.name
            }
            item={child}
          />
        ))}
      </div>
    </div>
  );
}

export default function Sidebar() {
  const [tree, setTree] = useState([]);
  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function loadTree() {
      try {
        const data =
          await getContentTree();

        setTree(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadTree();
  }, []);

  if (loading) {
    return (
      <aside className="sidebar">
        Loading...
      </aside>
    );
  }

  return (
    <aside className="sidebar">
      {tree.map(item => (
        <TreeNode
          key={item.name}
          item={item}
        />
      ))}
    </aside>
  );
}