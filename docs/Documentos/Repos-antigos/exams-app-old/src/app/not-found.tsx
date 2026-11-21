import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-4">
      <h2 className="text-2xl font-bold">404 - Page Not Found</h2>
      <p className="text-muted-foreground mt-2">
        The page you are looking for does not exist.
      </p>
      <Link
        href="/"
        className="mt-4 rounded bg-black px-4 py-2 text-sm text-white dark:bg-white dark:text-black"
      >
        Return Home
      </Link>
    </div>
  );
}
