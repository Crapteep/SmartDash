import React, { useState } from "react";
import {
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormControlLabel,
  InputLabel,
  Select,
  MenuItem,
  ListItem,
  ListItemText,
  Box,
  Grid,
  Checkbox,
  Switch,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Tooltip from "@mui/material/Tooltip";

const SwitchSettings = ({ formData, handleChange, availablePins }) => {
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [selectedPin, setSelectedPin] = useState(null);
  const [pinNumber, setPinNumber] = useState("");
  const [hoveredPin, setHoveredPin] = useState(null);

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
          `Pin ${pinNumber} nie został znaleziony w dostępnych pinach.`
        );
      }
    } else {
      console.error(`Nie można znaleźć pinu`);
    }

    handlePinDialogClose();
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    if (name === "on_value" || name === "off_value") {
      const floatValue = parseFloat(value);
      const intValue = parseInt(value, 10);

      if (!isNaN(floatValue) && floatValue.toString() === value) {
        handleChange(name, floatValue);
      } else if (!isNaN(intValue) && intValue.toString() === value) {
        handleChange(name, intValue);
      } else {
        handleChange(name, value);
      }
    } else {
      handleChange(name, value);
    }
  };

  const handleDeletePin = (pinName) => {
    const updatedPins = formData.virtual_pins.filter(
      (pin) => pin.pin !== pinName
    );
    handleChange("virtual_pins", updatedPins);
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

      <Grid container spacing={2}>
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

        <Grid item xs={6}>
          <TextField
            name="on_label"
            label="ON label"
            value={formData.on_label}
            onChange={handleInputChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            name="off_label"
            label="OFF label"
            value={formData.off_label}
            onChange={handleInputChange}
            fullWidth
          />
        </Grid>

        <Grid item xs={6}>
          <TextField
            name="on_value"
            label="ON value"
            value={formData.on_value}
            onChange={handleInputChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            name="off_value"
            label="OFF value"
            value={formData.off_value}
            onChange={handleInputChange}
            fullWidth
          />
        </Grid>

        <Box my={2} />
        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel>Label position</InputLabel>
            <Select
              value={formData.label_position}
              onChange={(event) => {
                const customEvent = {
                  ...event,
                  target: { ...event.target, name: "label_position" },
                };
                handleInputChange(customEvent);
              }}
              style={{ maxHeight: 200 }}
              MenuProps={{ PaperProps: { style: { maxHeight: 300 } } }}
            >
              <MenuItem value="top">Top</MenuItem>
              <MenuItem value="start">Left</MenuItem>
              <MenuItem value="bottom">Bottom</MenuItem>
              <MenuItem value="end">Right</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.show_label}
                onChange={(event) => {
                  const customEvent = {
                    ...event,
                    target: {
                      ...event.target,
                      name: "show_label",
                      value: event.target.checked,
                    },
                  };
                  handleInputChange(customEvent);
                }}
                name="show_label"
              />
            }
            label="Show Label"
          />
        </Grid>
      </Grid>
    </>
  );
};

export default SwitchSettings;
