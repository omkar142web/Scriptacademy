/*
  Lazy Mermaid diagram renderer.

  The `mermaid` package is dynamically imported so the initial bundle
  stays small; diagrams only load when a lesson actually contains one.
*/

import { useEffect, useState } from 'react';

export default function MermaidDiagram({ code }) {
  const [status, setStatus] = useState('loading');
  const [svg, setSvg] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setSvg(null);

    if (!code || !code.trim()) {
      setStatus('error');
      return undefined;
    }

    (async () => {
      try {
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          securityLevel: 'loose',
        });
        const id = `mermaid-${Math.random().toString(36).slice(2, 10)}`;
        const result = await mermaid.render(id, code);
        if (!cancelled) {
          setSvg(result.svg);
          setStatus('ready');
        }
      } catch {
        if (!cancelled) {
          setStatus('error');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [code]);

  if (status === 'loading') {
    return (
      <div className="mermaid-holder" aria-busy="true">
        Rendering diagram…
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="mermaid-holder mermaid-holder--error">
        <pre>{code}</pre>
        <div className="mermaid-holder-error">
          This diagram could not be rendered.
        </div>
      </div>
    );
  }

  return (
    <div
      className="mermaid-holder"
      role="img"
      aria-label="Mermaid diagram"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}