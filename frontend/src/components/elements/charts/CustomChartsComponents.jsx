import React from "react";
import { XAxis, YAxis } from "recharts";

export const CustomXAxis = ({
  dataKey,
  tickFormatter,
  type = "number",
  domain,
  label,
  position = "bottom",
  offset = 0,
}) => {
  return (
    <XAxis
      dataKey={dataKey}
      tickFormatter={tickFormatter}
      type={type}
      domain={domain}
      label={{ value: label, position, offset }}
    />
  );
};

export const CustomYAxis = ({
  label,
  angle = -90,
  position = "left",
  offset = 10,
}) => {
  return <YAxis label={{ value: label, angle, position, offset }} />;
};
