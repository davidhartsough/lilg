"use client";

import { useEffect, useState } from "react";

export default function LocalTime({ datetime }: { datetime: string | number }) {
  const [localTime, setLocalTime] = useState("");
  const [ISOString, setISOString] = useState("");
  useEffect(() => {
    const date = new Date(datetime);
    setLocalTime(
      date.toLocaleString(undefined, {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        dayPeriod: "short",
      }),
    );
    setISOString(date.toISOString());
  }, [datetime]);
  return localTime ? <time dateTime={ISOString}>{localTime}</time> : null;
}
