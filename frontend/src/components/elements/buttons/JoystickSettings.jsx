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
  Switch,
  Slider,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Tooltip from "@mui/material/Tooltip";
import convertToNumber from "../../../functions/customConverter";

const JoystickSettings = ({ formData, handleChange, availablePins }) => {
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
          `Pin ${pinName} nie został znaleziony w dostępnych pinach.`
        );
      }
    } else {
      console.error(`Nie można znaleźć pinu`);
    }

    handlePinDialogClose();
  };

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    const newValue = type === "checkbox" ? checked : value;
    handleChange(name, newValue);
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

      <Box my={2} />
      <Grid container alignItems="center" spacing={2}>
        <Grid item xs={6}>
          <TextField
            name="background_color"
            label="Background color"
            value={formData.background_color}
            onChange={handleInputChange}
            type="text"
            fullWidth
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            name="color"
            label="Joystick color"
            value={formData.color}
            onChange={handleInputChange}
            fullWidth
          />
        </Grid>
      </Grid>

      <Box my={2} />
      <Grid container alignItems="center" spacing={2}>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel id="mode">Mode</InputLabel>
            <Select
              labelId="mode"
              name="mode"
              value={formData.mode}
              onChange={handleInputChange}
            >
              <MenuItem value="static">Static</MenuItem>
              <MenuItem value="dynamic">Dynamic</MenuItem>
              <MenuItem value="semi">Semi</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <Grid container alignItems="center" spacing={2}>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Switch
                    name="lock_x"
                    color="primary"
                    checked={formData.lock_x}
                    onChange={handleInputChange}
                  />
                }
                label="Lock X"
              />
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Switch
                    name="lock_y"
                    color="primary"
                    checked={formData.lock_y}
                    onChange={handleInputChange}
                  />
                }
                label="Lock Y"
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
        
      <Box my={2} />
      <Typography gutterBottom>Size</Typography>
      <Slider
        value={formData.size}
        onChange={(event, newValue) => {
          handleInputChange({
            target: {
              name: "size",
              value: newValue,
            },
          });
        }}
        valueLabelDisplay="auto"
        step={1}
        marks
        min={20}
        max={150}
        name="size"
      />

<Box my={1} />
      <FormControlLabel
        control={
          <Checkbox
            checked={formData.rest_joystick}
            onChange={handleInputChange}
            name="rest_joystick"
          />
        }
        label="Rest Joystick"
      />
    </>
  );
};

export default JoystickSettings;
