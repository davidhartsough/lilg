import Link from "next/link";

export default function CalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main>
      <header>
        <h1>
          <Link href="/">lil' g</Link> • cal
        </h1>
      </header>
      <section>{children}</section>
    </main>
  );
}
