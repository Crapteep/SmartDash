import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { addUsedPin } from "../../../redux/actions/pinActions";
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
import {
  resetLabelState,
  resetLabelValue,
} from "../../../redux/actions/labelActions";

const LabelSettings = ({ formData, handleChange, availablePins }) => {
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [selectedPin, setSelectedPin] = useState(null);
  const [pinNumber, setPinNumber] = useState("");
  const [hoveredPin, setHoveredPin] = useState(null);
  const dispatch = useDispatch();
  const [selectedUnit, setSelectedUnit] = useState(formData.unit);

  const unitOptions = [
    { value: "", label: "None" },
    { value: "mm", label: "mm" },
    { value: "cm", label: "cm" },
    { value: "m", label: "m" },
    { value: "m^2", label: "m<sup>2" },
    { value: "m/s", label: "m/s" },
    { value: "m/s^2", label: "m/s&sup2;" },
    { value: "km", label: "km" },
    { value: "km^2", label: "km<sup>2" },
    { value: "km/s", label: "km/s" },
    { value: "km/s^2", label: "km/s&sup2;" },
    { value: "g", label: "g" },
    { value: "kg", label: "kg" },
    { value: "t", label: "t" },
    { value: "s", label: "s" },
    { value: "min", label: "min" },
    { value: "h", label: "h" },
    { value: "day", label: "day" },
    { value: "year", label: "year" },
    { value: "Hz", label: "Hz" },
    { value: "kHz", label: "kHz" },
    { value: "MHz", label: "MHz" },
    { value: "GHz", label: "GHz" },
    { value: "W", label: "W" },
    { value: "kW", label: "kW" },
    { value: "MW", label: "MW" },
    { value: "GW", label: "GW" },
    { value: "°C", label: "°C" },
    { value: "°F", label: "°F" },
    { value: "K", label: "K" },
    { value: "Pa", label: "Pa" },
    { value: "kPa", label: "kPa" },
    { value: "MPa", label: "MPa" },
    { value: "bar", label: "bar" },
    { value: "atm", label: "atm" },
    { value: "mol", label: "mol" },
    { value: "kmol", label: "kmol" },
    { value: "L", label: "L" },
    { value: "m³", label: "m³" },
    { value: "cm³", label: "cm³" },
    { value: "mm³", label: "mm³" },
    { value: "szt", label: "szt." },
  ];

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

  const handleChangePinNumber = (event) => {
    const newPinNumber = event.target.value;
    setPinNumber(newPinNumber);
  };

  const handlePinAction = () => {
    if (selectedPin) {
      handleEditPin(selectedPin, pinNumber);
    } else {
      handleAddPin(pinNumber);
    }
  };

  const handleChangeUnit = (event) => {
    setSelectedUnit(event.target.value);
    console.log(event);
    handleInputChange(event);
  };

  const handleAddPin = () => {
    const pinCount = formData.virtual_pins.length;
    if (pinCount < 1) {
      const selectedPin = availablePins.find((pin) => pin.pin === pinNumber);

      if (selectedPin) {
        handleChange("virtual_pins", [...formData.virtual_pins, selectedPin]);
        dispatch(addUsedPin("label", selectedPin.pin));
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
    handleChange(name, value);
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
              onChange={handleChangePinNumber}
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
            label="alias"
            value={formData.alias}
            onChange={handleInputChange}
            fullWidth
          />
        </Grid>
      </Grid>

      <Box my={2} />

      <Grid container alignItems="center" spacing={2}>
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
              <MenuItem value="center">Center</MenuItem>
              <MenuItem value="right">Right</MenuItem>
              <MenuItem value="left">Left</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel>Unit</InputLabel>
            <Select
              value={selectedUnit}
              onChange={handleChangeUnit}
              name="unit"
              style={{ maxHeight: 200 }}
              MenuProps={{ PaperProps: { style: { maxHeight: 300 } } }}
            >
              {unitOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <span dangerouslySetInnerHTML={{ __html: option.label }} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      <Box my={2} />

      <FormControlLabel
        control={
          <Checkbox
            checked={formData.show_level}
            onChange={(event) => {
              const customEvent = {
                ...event,
                target: {
                  ...event.target,
                  name: "show_level",
                  value: event.target.checked,
                },
              };
              handleInputChange(customEvent);
            }}
            name="show_level"
          />
        }
        label="Show level"
      />

      <Box my={2} />
      {formData.show_level && (
        <>
          <Grid container alignItems="center" spacing={2}>
            <Grid item xs={6}>
              <TextField
                name="min_level"
                label="Min Level"
                type="number"
                value={formData.min_level}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                name="max_level"
                label="Max Level"
                type="number"
                value={formData.max_level}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                name="level_color"
                label="Level Color"
                value={formData.level_color}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Level position</InputLabel>
                <Select
                  value={formData.level_position}
                  onChange={(event) => {
                    const customEvent = {
                      ...event,
                      target: { ...event.target, name: "level_position" },
                    };
                    handleInputChange(customEvent);
                  }}
                  style={{ maxHeight: 200 }}
                  MenuProps={{ PaperProps: { style: { maxHeight: 300 } } }}
                >
                  <MenuItem value="vertical">Vertical</MenuItem>
                  <MenuItem value="horizontal">Horizontal</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </>
      )}
    </>
  );
};

export default LabelSettings;
