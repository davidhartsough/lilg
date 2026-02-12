"use client";

import { useEffect, useState } from "react";

const fullDateTimeOptions: Intl.DateTimeFormatOptions = {
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
};
const timeOnlyOptions: Intl.DateTimeFormatOptions = {
  hour: "numeric",
  minute: "numeric",
};

export default function LocalTime({
  datetime,
  timeOnly = false,
}: {
  datetime: string | number;
  timeOnly?: boolean;
}) {
  const [localTime, setLocalTime] = useState("");
  const [ISOString, setISOString] = useState("");
  useEffect(() => {
    const date = new Date(datetime);
    setLocalTime(
      date.toLocaleString(
        undefined,
        timeOnly ? timeOnlyOptions : fullDateTimeOptions,
      ),
    );
    setISOString(date.toISOString());
  }, [datetime, timeOnly]);
  return localTime ? <time dateTime={ISOString}>{localTime}</time> : null;
}
