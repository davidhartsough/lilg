import { getMail } from "@/lib/google";
// import styles from "./page.module.css";

export default async function MailPage() {
  const mailData = await getMail();
  const jsonStr = JSON.stringify(mailData, null, 2);
  return (
    <div>
      <pre>
        <code>{jsonStr}</code>
      </pre>
    </div>
  );
}
