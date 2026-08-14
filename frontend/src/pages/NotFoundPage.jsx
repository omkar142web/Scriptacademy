import { NotFoundState } from '../components/PageState';

export default function NotFoundPage() {
  return (
    <main className="page">
      <NotFoundState
        title="Page Not Found"
        message="The page you're looking for doesn't exist."
        backTo="/"
        backLabel="Back to Home"
      />
    </main>
  );
}