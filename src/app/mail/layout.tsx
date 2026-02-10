import Link from "next/link";

export default function MailLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main>
      <header>
        <h1>
          <Link href="/">lil' g</Link> • mail
        </h1>
      </header>
      <section>{children}</section>
    </main>
  );
}
