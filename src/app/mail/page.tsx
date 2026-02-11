import LocalTime from "@/components/localtime";
import getMail from "@/lib/gmail";
// import styles from "./page.module.css";

export default async function MailPage() {
  console.log("Rendering mail page");
  const threads = await getMail();
  console.log(threads);
  return (
    <ul>
      {threads.map((thread) => (
        <li key={thread.id}>
          <p>{thread.participants.join(", ")}</p>
          <h2>{thread.subject}</h2>
          <p>{thread.snippet}</p>
          <p>
            <LocalTime datetime={thread.date} />
          </p>
        </li>
      ))}
    </ul>
  );
}
