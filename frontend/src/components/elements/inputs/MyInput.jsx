import React, { useState, useEffect } from "react";
import Typography from "@mui/material/Typography";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import { useWebSocketContext } from "../../../providers/WebSocketProvider";
import { Box } from "@mui/material";
const calculateWidth = (maxRange) => {
  const digits = maxRange.toString().length;
  return 50 * (digits + 1);
};

export default function InputSwitch({
  virtual_pins = [],
  isEditMode,
  send_immediately,
}) {
  const { sendData } = useWebSocketContext();
  const [inputValue, setInputValue] = useState('');
  const [pendingValue, setPendingValue] = useState('');
  const [previousValue, setPreviousValue] = useState('');
  const [error, setError] = useState("");
  const [inputType, setInputType] = useState("text");

  const maxRange = virtual_pins[0]?.max_range || 0;
  const minRange = virtual_pins[0]?.min_range || 0;
  const labelWidth = calculateWidth(maxRange);

  useEffect(() => {
    const initialValue = virtual_pins[0]?.value || '';
    setInputValue(initialValue);
    setPendingValue(initialValue);
    setPreviousValue(initialValue);

    const newInputType = virtual_pins[0]
      ? virtual_pins[0].data_type === "int" || virtual_pins[0].data_type === "float"
        ? "number"
        : "text"
      : "text";
    setInputType(newInputType);
  }, [virtual_pins]);

  
  const containerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    width: "100%",
    boxSizing: "border-box",
  };

  const inputContainerStyle = {
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

  const handleInputChange = (event) => {
    const newValue = event.target.value;
    if (inputType === "number" && (newValue < minRange || newValue > maxRange)) {
      setError(`The value must be between ${minRange} and ${maxRange}`);
    } else {
      setError("");
      setInputValue(newValue);

      if (send_immediately) {
        sendValue(newValue);
      } else {
        setPendingValue(newValue);
      }
    }
  };

  const handleCommit = (value) => {
    if (!send_immediately && value !== previousValue) {
      sendValue(value);
      setPreviousValue(value);
    }
  };
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      sendValue(pendingValue);
      setPreviousValue(pendingValue);
    }
  };

  const handleBlur = (event) => {
    const blurredValue = event.target.value;
    handleCommit(blurredValue);
  };


  const sendValue = (value) => {
    if (virtual_pins && virtual_pins[0] && virtual_pins[0].pin) {
      let valueToSend;
      if (virtual_pins[0].data_type === "int") {
        valueToSend = parseInt(value);
      } else if (virtual_pins[0].data_type === "float") {
        valueToSend = parseFloat(value);
      } else if (virtual_pins[0].data_type == "str") {
        valueToSend = value.toString()
      }

      const dataToSend = {
        code: 1,
        pin: virtual_pins[0].pin,
        value: valueToSend,
      };
      sendData(dataToSend);
    }
  };

  const getInputProps = () => {
    console.log(inputType)
    if (inputType === "number") {
      return {
        min: minRange,
        max: maxRange,
        step: virtual_pins[0]?.step || 1,
      };
    }
    return {};
  };

  return (
    <Box sx={containerStyle}>
      <FormControl component="fieldset" sx={{ width: '100%', maxWidth: '500px' }}>
        <FormGroup aria-label="position" row>
        <FormControlLabel
            sx={{
              ...inputContainerStyle,
              '& .MuiFormControlLabel-label': {
                fontSize: {
                  xs: '24px',
                  sm: '28px',
                  md: '32px',
                  lg: '36px',
                },
                width: `${labelWidth}px`,
                textAlign: "right",
              },
            }}
            value="start"
            control={
              <TextField
                type={inputType}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onBlur={(event) => handleBlur(event)}
                inputProps={getInputProps()}
                disabled={isEditMode}
                error={Boolean(error)}
                helperText={error}
                sx={{
                    flexGrow: 1,
                    width: "100%",
                    boxSizing: "border-box",
                    marginLeft: "15px",
                    marginRight: "-5px",
                    marginBottom: "5px",
                    '& .MuiInputBase-input': {
                      fontSize: {
                        xs: '18px',
                        sm: '20px',
                        md: '22px',
                        lg: '24px',
                      },
                      padding: {
                        xs: '8px',
                        sm: '10px',
                        md: '12px',
                        lg: '14px',
                      },
                    },
                  }}
                />
            }
          />
        </FormGroup>
      </FormControl>
    </Box>
  );
}
