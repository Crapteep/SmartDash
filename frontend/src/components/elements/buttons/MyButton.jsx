import React, { useState } from "react";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import { useWebSocketContext } from "../../../providers/WebSocketProvider";

export default function MyButton({
  variant,
  text,
  background_color,
  on_click_value,
  virtual_pins,
  uppercase = false,
  isEditMode,
}) {
  const { sendData } = useWebSocketContext();

  const containerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  };

  const buttonStyle = {
    height: "99%",
    marginBottom: "20px",
    marginLeft: "10px",
    marginRight: "10px",
    backgroundColor: background_color,
    position: "relative",
    overflow: "hidden",
  };

  const [fontSize, setFontSize] = useState(16);

  const handleButtonClick = () => {
    if (virtual_pins && virtual_pins[0] && virtual_pins[0].pin) {
      let valueToSend;
      if (virtual_pins[0].data_type === "int") {
        valueToSend = parseInt(on_click_value);
      } else if (virtual_pins[0].data_type === "float") {
        valueToSend = parseFloat(on_click_value);
      }

      const dataToSend = {
        code: 1,
        pin: virtual_pins[0].pin,
        value: valueToSend,
      };
      sendData(dataToSend);
    }
  };

  return (
    <div style={containerStyle}>
      <Tooltip title={text} enterDelay={500}>
        <Button
          variant={variant}
          style={buttonStyle}
          onClick={handleButtonClick}
          fullWidth
          disabled={isEditMode}
        >
          <Typography
            variant="h6"
            gutterBottom
            noWrap
            style={{
              textTransform: uppercase ? "uppercase" : "none",
              fontSize: `${fontSize}px`,
            }}
          >
            {text}
          </Typography>
        </Button>
      </Tooltip>
    </div>
  );
}
