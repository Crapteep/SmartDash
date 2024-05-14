import React, { useEffect, useState } from "react";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import { withStyles } from "@mui/styles";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import { useWebSocketContext } from "../../../providers/WebSocketProvider";

export default function MySwitch({
  on_value,
  off_value,
  on_label,
  off_label,
  label_position,
  show_label,
  checked,
  virtual_pins = [],
  uppercase = false,
  isEditMode,
}) {
  const [switchColor, setSwitchColor] = useState("primary");
  const [isChecked, setIsChecked] = useState(checked);
  const { sendData } = useWebSocketContext();
  const containerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    width: "100%",
  };

  const labelStyle = {
    fontSize: "inherit",
  };

  const CustomSwitch = withStyles({
    switchBase: {
      "&$checked": {
        color: switchColor,
      },
      "&$checked + $track": {
        backgroundColor: switchColor,
      },
    },
    checked: {},
    track: {},
  })(Switch);

  useEffect(() => {
    if (
      virtual_pins &&
      virtual_pins[0] &&
      virtual_pins[0].color &&
      virtual_pins[0].color !== ""
    ) {
      setSwitchColor(virtual_pins[0].color);
    }
  }, [virtual_pins]);

  const handleSwitchChange = (event) => {
    setIsChecked(event.target.checked);
    if (virtual_pins && virtual_pins[0] && virtual_pins[0].pin) {
      const value = event.target.checked ? on_value : off_value;

      let valueToSend;
      if (virtual_pins[0].data_type === "int") {
        valueToSend = parseInt(value);
      } else if (virtual_pins[0].data_type === "float") {
        valueToSend = parseFloat(value);
      }

      const dataToSend = {
        code: 1,
        pin: virtual_pins[0].pin,
        value: valueToSend,
      };
      sendData(dataToSend);
    }
  };

  const getLabel = (checked) => {
    return checked ? on_label : off_label;
  };

  return (
    <div style={containerStyle}>
      <FormControl component="fieldset">
        <FormGroup aria-label="position" row>
          <FormControlLabel
            style={{ transform: "scale(1.5)" }}
            value="start"
            control={
              <CustomSwitch
                checked={isChecked}
                onChange={handleSwitchChange}
                disabled={isEditMode}
              />
            }
            label={
              show_label ? (
                <Typography style={labelStyle}>
                  {getLabel(isChecked)}
                </Typography>
              ) : null
            }
            labelPlacement={show_label ? label_position || "bottom" : undefined}
          />
        </FormGroup>
      </FormControl>
    </div>
  );
}
