import React from "react";
import Button from "@mui/material/Button";

const containerStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100%",
};



export default function OutlinedButton() {
  return (
    <div style={containerStyle}>
      <Button variant="contained">
        Contained
      </Button>
    </div>
  );
}