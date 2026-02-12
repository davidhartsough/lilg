import LocalTime from "@/components/localtime";
import getMail from "@/lib/gmail";

export default async function MailPage() {
  console.log("Rendering mail page");
  const threads = await getMail();
  console.log(threads);
  return (
    <ul>
      {threads.map((thread) => (
        <li key={thread.id}>
          <p>
            <strong>{thread.participants.join(", ")}</strong>
          </p>
          <h2>{thread.subject}</h2>
          <p className="smaller">
            {thread.snippet.replace(/&#39;/g, "'").trim()}
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
