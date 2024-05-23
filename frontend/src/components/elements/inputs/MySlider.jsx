import React, { useState} from "react";
import Slider from "@mui/material/Slider";
import Typography from "@mui/material/Typography";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import { useWebSocketContext } from "../../../providers/WebSocketProvider";

const calculateWidth = (maxRange) => {
  const digits = maxRange.toString().length;
  return 50 * (digits + 1);
};

export default function SliderSwitch({
  virtual_pins = [],
  isEditMode,
  step,
  send_immediately,
}) {
  const { sendData } = useWebSocketContext();

  const [sliderValue, setSliderValue] = useState(virtual_pins[0]?.value || 0);
  const [pendingValue, setPendingValue] = useState();
  const maxRange = virtual_pins[0]?.max_range || 0;
  const labelWidth = calculateWidth(maxRange);

  const containerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    width: "100%",
    boxSizing: "border-box",
  };

  const sliderContainerStyle = {
    display: "flex",
    alignItems: "center",
    width: "100%",
    boxSizing: "border-box",
  };
  const labelStyle = {
    fontSize: "32px",
    width: `${labelWidth}px`,
    textAlign: "right",
  };

  const handleSliderChange = (event, newValue) => {
    setSliderValue(newValue);

    if (send_immediately) {
      sendValue(newValue);
    } else {
      setPendingValue(newValue);
    }
  };

  const handleCommit = () => {
    if (!send_immediately) {
      sendValue(pendingValue);
    }
  };

  const sendValue = (value) => {
    if (virtual_pins && virtual_pins[0] && virtual_pins[0].pin) {
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

  return (
    <div style={containerStyle}>
      <FormControl component="fieldset">
        <FormGroup aria-label="position" row>
          <FormControlLabel
            style={sliderContainerStyle}
            value="start"
            control={
              <Slider
                value={sliderValue}
                onChange={handleSliderChange}
                onChangeCommitted={send_immediately ? null : handleCommit}
                step={step}
                min={virtual_pins[0]?.min_range}
                max={maxRange}
                aria-labelledby="continuous-slider"
                style={{
                  flexGrow: 1,
                  width: "1000px",
                  boxSizing: "border-box",
                  marginLeft: "35px",
                  marginRight: "15px",
                }}
                disabled={isEditMode}
              />
            }
            label={<Typography style={labelStyle}>{sliderValue}</Typography>}
          />
        </FormGroup>
      </FormControl>
    </div>
  );
}
