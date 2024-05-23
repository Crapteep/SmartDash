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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Tooltip from "@mui/material/Tooltip";
import convertToNumber from "../../../functions/customConverter";

const ButtonSettings = ({ formData, handleChange, availablePins }) => {
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [selectedPin, setSelectedPin] = useState(null);
  const [pinNumber, setPinNumber] = useState("");
  const [hoveredPin, setHoveredPin] = useState(null);
  const [variant, setVariant] = useState(formData.variant);

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
    const { name, value } = event.target;

    if (name === "on_click_value") {
      handleChange(name, convertToNumber(value));
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

        <Box my={2} />

        <Grid item xs={6}>
          <TextField
            name="text"
            label="Text"
            value={formData.text}
            onChange={handleInputChange}
            fullWidth
          />
        </Grid>

        <Grid item xs={6}>
          <TextField
            name="on_click_value"
            label="ON click value"
            value={formData.on_click_value}
            onChange={handleInputChange}
            fullWidth
          />
        </Grid>

        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel>Variant</InputLabel>
            <Select
              value={variant}
              onChange={(event) => {
                const customEvent = {
                  ...event,
                  target: { ...event.target, name: "variant" },
                };
                handleInputChange(customEvent);
                setVariant(event.target.value);
              }}
              style={{ maxHeight: 200 }}
              MenuProps={{ PaperProps: { style: { maxHeight: 300 } } }}
            >
              <MenuItem value="outlined">Outlined</MenuItem>
              <MenuItem value="contained">Contained</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={6}>
          <TextField
            name="background_color"
            label="Background Color"
            value={formData.background_color}
            onChange={handleInputChange}
            fullWidth
          />
        </Grid>
      </Grid>
    </>
  );
};

export default ButtonSettings;
