import LocalTime from "@/components/localtime";
import getMail from "@/lib/gmail";

export default async function MailPage() {
  const threads = await getMail();
  return (
    <ul>
      {threads.map((thread) => (
        <li key={thread.id}>
          <p>
            <strong>{thread.participants.join(", ")}</strong>
          </p>
          <h2>{thread.subject}</h2>
          <p className="smaller show-line-breaks">
            {thread.snippet
              .replace(/&#39;/g, "'")
              .replace(/\n\s*\n+/g, "\n")
              .split("\n")
              .map((line) => line.replace(/[\p{Z}\p{Cf}\p{Cc}]+/gu, " ").trim())
              .join("\n")
              .replace(/ +/g, " ")}
            {thread.snippet.length > 150 && <span>&hellip;</span>}
          </p>
          <p>
            <LocalTime datetime={thread.date} />
          </p>
        </li>
      ))}
    </ul>
  );
}
