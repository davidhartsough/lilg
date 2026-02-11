import Link from "next/link";

export default function CalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main>
      <header>
        <nav>
          <h1>
            <Link href="/">lil' g</Link> • cal
          </h1>
        </nav>
      </header>
      <section>{children}</section>
    </main>
  );
}
