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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Tooltip from "@mui/material/Tooltip";

const ButtonSettingsDialogContent = ({ formData, handleChange }) => {
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [selectedPin, setSelectedPin] = useState(null);
  const [pinNumber, setPinNumber] = useState("");
  const [hoveredPin, setHoveredPin] = useState(null);
  const [variant, setVariant] = useState(formData.variant);

  const availablePins = Array.from({ length: 100 }, (_, index) => index + 1);

  const handlePinDialogOpen = () => {
    setSelectedPin(pinNumber);
    setPinDialogOpen(true);
  };
  const handlePinDialogClose = () => {
    setSelectedPin(null);
    setPinDialogOpen(false);
  };

  const handlePinAction = () => {
    handlePin();
  };

  const handlePin = () => {
    handleChange("pin", pinNumber);
    handlePinDialogClose();
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    handleChange(name, value);
  };

  const handleDeletePin = () => {
    handleChange("pin", 0);
  };



  return (
    <>
      <div>
        {formData.pin === 0 && (
          <Tooltip title="Add a new pin" enterDelay={500}>
            <Button onClick={handlePinDialogOpen} color="primary">
              Add pin
            </Button>
          </Tooltip>
        )}
      </div>

      {formData.pin !== 0 && (
        <ListItem
          key={formData.pin}
          onMouseEnter={() => setHoveredPin(pinNumber)}
          onMouseLeave={() => setHoveredPin(null)}
          style={{
            display: "flex",
            alignItems: "center",
            border: "1px solid #ccc",
            borderRadius: "10px",
            marginBottom: "5px",
          }}
        >
          <ListItemText primary={`V${formData.pin}`} />
          {hoveredPin === pinNumber && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Tooltip title="Edit pin" enterDelay={500}>
                <EditIcon onClick={handlePinDialogOpen} />
              </Tooltip>
              <Tooltip title="Delete pin" enterDelay={500}>
                <DeleteIcon onClick={handleDeletePin} />
              </Tooltip>
            </div>
          )}
        </ListItem>
      )}

      <Dialog open={pinDialogOpen} onClose={handlePinDialogClose}>
        <DialogTitle>{selectedPin ? "Edit PIN" : "Add PIN"}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth>
            <InputLabel id="pinNumber-label">
              {pinNumber ? "" : "Select PIN"}
            </InputLabel>
            <Select
              labelId="pinNumber-label"
              value={pinNumber}
              onChange={(e) => setPinNumber(e.target.value)}
              style={{ maxHeight: 200 }}
              MenuProps={{ PaperProps: { style: { maxHeight: 300 } } }}
            >
              {availablePins.map((pin) => (
                <MenuItem key={pin} value={pin}>
                  V{pin}
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

      <Box my={2} />
      <TextField
        name="widgetTitle"
        label="Widget Title"
        value={formData.widgetTitle}
        onChange={handleInputChange}
        fullWidth
      />
      <Box my={2} />


      <FormControl fullWidth>
        <InputLabel>Variant</InputLabel>
        <Select
          value={variant}
          onChange={(event) => {
            const customEvent = { ...event, target: {...event.target, name: "variant"}};
            handleInputChange(customEvent);
            setVariant(event.target.value);
        }}
          style={{ width: "200px", maxHeight: 200 }}
          MenuProps={{ PaperProps: { style: { maxHeight: 300 } } }}
        >
          <MenuItem value="outlined">Outlined</MenuItem>
          <MenuItem value="contained">Contained</MenuItem>
        </Select>

      
      </FormControl>

      <Box my={2} />
      <TextField
        name="text"
        label="Text"
        value={formData.text}
        onChange={handleInputChange}
        fullWidth
      />
      <Box my={2} />
      <TextField
        name="backgroundColor"
        label="Background Color"
        value={formData.backgroundColor}
        onChange={handleInputChange}
        fullWidth
      />
    </>
  );
};

export default ButtonSettingsDialogContent;
