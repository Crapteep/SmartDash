import React, { useState } from "react";
import { Button, useTheme } from "@mui/material";
import { tokens } from "../../../theme";

const TimeRangeButtons = ({ timeRanges, handleTimeRangeChange, timeRange }) => {
  const [selectedRange, setSelectedRange] = useState(timeRange);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const handleChange = (rangeValue) => {
    if (rangeValue !== selectedRange) {
      handleTimeRangeChange(rangeValue);
    }
    setSelectedRange(rangeValue);
  };

  return (
    <>
      <div style={{ display: "flex", flexWrap: "warp", marginLeft: "10px" }}>
        {timeRanges.map((range) => (
          <Button
            key={range.value}
            style={{
              fontSize: "8px",
              height: "20px",
              minWidth: "30px",
              backgroundColor:
                selectedRange === range.value ? colors.grey[800] : "inherit",
            }}
            onClick={() => handleChange(range.value)}
          >
            {range.label}
          </Button>
        ))}
      </div>
    </>
  );
};

export default TimeRangeButtons;
