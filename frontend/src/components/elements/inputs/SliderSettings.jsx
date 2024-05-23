import React, { useState } from "react";
import {
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ListItem,
  ListItemText,
  Box,
  Grid,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Tooltip from "@mui/material/Tooltip";
import convertToNumber from "../../../functions/customConverter";

const SliderSettings = ({ formData, handleChange, availablePins }) => {
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [selectedPin, setSelectedPin] = useState(null);
  const [pinNumber, setPinNumber] = useState("");
  const [hoveredPin, setHoveredPin] = useState(null);
  const [variant, setVariant] = useState(formData.variant);
  const dataType =
    formData.virtual_pins &&
    formData.virtual_pins[0] &&
    formData.virtual_pins[0].data_type;
  const minRange =
    formData.virtual_pins &&
    formData.virtual_pins[0] &&
    formData.virtual_pins[0].min_range;
  const maxRange =
    formData.virtual_pins &&
    formData.virtual_pins[0] &&
    formData.virtual_pins[0].max_range;

  const handlePinDialogOpen = (pin) => {
    setSelectedPin(pin);
    setPinNumber(pin);
    setPinDialogOpen(true);
  };
  const handlePinDialogClose = () => {
    setSelectedPin(null);
    setPinDialogOpen(false);
    setPinNumber("");
  };

  const handlePinAction = () => {
    if (selectedPin) {
      handleEditPin(selectedPin, pinNumber);
    } else {
      handleAddPin(pinNumber);
    }
    handleChange("step", 1)
  };

  const handleAddPin = () => {
    const pinCount = formData.virtual_pins.length;
    if (pinCount < 1) {
      const selectedPin = availablePins.find((pin) => pin.pin === pinNumber);

      if (selectedPin) {
        handleChange("virtual_pins", [...formData.virtual_pins, selectedPin]);
      } else {
        console.error(
          `Pin ${pinNumber} nie został znaleziony w dostępnych pinach.`
        );
      }
    } else {
      console.warn("Osiągnięto maksymalną liczbę pinów (1).");
    }

    handlePinDialogClose();
  };

  const handleEditPin = (oldPin, newPin) => {
    const editedPinIndex = formData.virtual_pins.findIndex(
      (element) => element.pin === oldPin
    );
    if (editedPinIndex !== -1) {
      const selectedPin = availablePins.find(
        (element) => element.pin === newPin
      );

      if (selectedPin) {
        formData.virtual_pins[editedPinIndex] = {
          ...selectedPin,
        };

        handleChange("virtual_pins", [...formData.virtual_pins]);
      } else {
        console.error(
          `Pin ${pinName} nie został znaleziony w dostępnych pinach.`
        );
      }
    } else {
      console.error(`Nie można znaleźć pinu`);
    }

    handlePinDialogClose();
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    handleChange(name, value)
  };

  const handleDeletePin = (pinName) => {
    const updatedPins = formData.virtual_pins.filter(
      (pin) => pin.pin !== pinName
    );
    handleChange("virtual_pins", updatedPins);
  };

  const isInteger = (value) => {
    return parseFloat(value) === parseInt(value, 10) && !isNaN(value);
  };

  const roundToTwoDecimalPlaces = (value) => {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  };

  const getStep = (dataType, minRange, maxRange) => {
    if (dataType === "float") {
      return "any";
    } else {
      return 1;
    }
  };

  const handleStepChange = (event) => {
    let value = event.target.value;
    if (dataType === "int") {
      value = Math.round(parseFloat(value));
    } else {
      value = roundToTwoDecimalPlaces(parseFloat(value));
    }
    if (value < minRange) {
      value = minRange;
    } else if (value > maxRange) {
      value = maxRange;
    }
    handleChange("step", value)
    formData.step = value;

  };

  return (
    <>
      <div>
        {!formData.virtual_pins || formData.virtual_pins.length === 0 ? (
          <Tooltip title="Add a new pin" enterDelay={500}>
            <Button onClick={() => handlePinDialogOpen()} color="primary">
              Add pin
            </Button>
          </Tooltip>
        ) : null}
      </div>

      {formData.virtual_pins.map((element, index) => (
        <ListItem
          key={index}
          onMouseEnter={() => setHoveredPin(element)}
          onMouseLeave={() => setHoveredPin(null)}
          style={{
            display: "flex",
            alignItems: "center",
            border: "1px solid #ccc",
            borderRadius: "10px",
            marginBottom: "5px",
          }}
        >
          <ListItemText primary={`${element.pin}`} />
          {hoveredPin === element && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Tooltip title="Edit pin" enterDelay={500}>
                <EditIcon onClick={() => handlePinDialogOpen(element.pin)} />
              </Tooltip>
              <Tooltip title="Delete pin" enterDelay={500}>
                <DeleteIcon onClick={() => handleDeletePin(element.pin)} />
              </Tooltip>
            </div>
          )}
        </ListItem>
      ))}

      <Dialog open={pinDialogOpen} onClose={handlePinDialogClose}>
        <DialogTitle>{selectedPin ? "Edit PIN" : "Add PIN"}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth>
            <InputLabel id="pinNumber-label">
              {pinNumber ? "" : "Select PIN"}
            </InputLabel>
            <Select
              labelId="pinNumber-label"
              value={pinNumber || ""}
              onChange={(e) => setPinNumber(e.target.value)}
              style={{ maxHeight: 200 }}
              MenuProps={{ PaperProps: { style: { maxHeight: 300 } } }}
            >
              {availablePins &&
                availablePins.map((pin) => (
                  <MenuItem key={pin._id} value={pin.pin}>
                    {pin.pin}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePinDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handlePinAction} color="primary">
            {selectedPin ? "Edit" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>

      <Box my={4} />

      <Grid container alignItems="center" spacing={2}>
        <Grid item xs={6}>
          <TextField
            name="widget_title"
            label="Widget Title"
            value={formData.widget_title}
            onChange={handleInputChange}
            fullWidth
          />
        </Grid>

        <Grid item xs={6}>
          <TextField
            name="alias"
            label="Alias"
            value={formData.alias}
            onChange={handleInputChange}
            fullWidth
          />
        </Grid>
      </Grid>

      {formData.virtual_pins.length > 0 && (
        <>
          <Box my={2} />
          <Grid container alignItems="center" spacing={2}>
            <Grid item xs={6}>
              <TextField
                name="step"
                label="Handle step"
                value={formData.step}
                onChange={handleStepChange}
                type="number"
                fullWidth
                InputProps={{
                  inputProps: {
                    min: minRange,
                    step: getStep(dataType, minRange, maxRange),
                    max: maxRange,
                  },
                  ...(dataType === "int" && { inputMode: "numeric" }),
                }}
              />
            </Grid>

            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.send_immediately}
                    onChange={(event) => {
                      const customEvent = {
                        ...event,
                        target: {
                          ...event.target,
                          name: "send_immediately",
                          value: event.target.checked,
                        },
                      };
                      handleInputChange(customEvent);
                    }}
                    name="send_immediately"
                  />
                }
                label="Send immediately"
              />
            </Grid>
          </Grid>
        </>
      )}
    </>
  );
};

export default SliderSettings;
