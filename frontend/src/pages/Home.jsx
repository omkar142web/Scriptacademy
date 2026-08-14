import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <main className="page">
      <h1>Scriptacademy</h1>

      <p>
        Learn programming and computer
        science.
      </p>

      <Link to="/programming">
        Browse Programming
      </Link>
    </main>
  );
}