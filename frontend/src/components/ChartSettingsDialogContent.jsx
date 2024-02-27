import React, { useState, useEffect } from "react";
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
  List,
  ListItem,
  ListItemText,
  Box,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Tooltip from "@mui/material/Tooltip";
import Chart from "./LineChart";


const chartStyle = {
  width: "60%",
  height: "300px",
  border: "1px solid #ccc",
  borderRadius: "4px",
  marginTop: "0px",
  marginBottom: "20px",
  float: "right",
};


const ChartSettingsDialogContent = ({ formData, handleChange }) => {
  const { xAxisLabel, yAxisLabel, showLegend, pins } = formData;
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [selectedPin, setSelectedPin] = useState(null);
  const [pinNumber, setPinNumber] = useState("");
  const [pinColor, setPinColor] = useState("");
  const [legendName, setLegendName] = useState("");
  const [hoveredPin, setHoveredPin] = useState(null);
  const [demoPins, setDemoPins] = useState(pins);

  const availablePins = Array.from({ length: 100 }, (_, index) => index + 1);

  const handlePinDialogOpen = (pinNumber = "", pinColor = "", legendName = "") => {
    setSelectedPin(pinNumber);
    const parsedPinNumber = isNaN(pinNumber) ? "" : parseInt(pinNumber);
    setPinNumber(pinNumber);
    setPinColor(pinColor);
    setLegendName(legendName);
    setPinDialogOpen(true);
  };
  const handlePinDialogClose = () => {
    setSelectedPin(null);
    setPinDialogOpen(false);
  };

  const handlePinAction = () => {
    if (selectedPin) {
      handleEditPin();
    } else {
      handleAddPin();
    }
  };

  const handleAddPin = () => {
    const pinCount = Object.keys(pins).length;
    if (pinCount < 5) {
      const newPin = {
        [pinNumber]: {
          color: pinColor,
          data: [],
          legendName: legendName
        },
      };
      const updatedPins = { ...pins, ...newPin };
      console.log("updated pin", updatedPins);
      handleChange("pins", updatedPins);
      setPinNumber("");
      setPinColor("");

    }
    handlePinDialogClose();
  };



  const setDemoPinsWithData = (updatedPins) => {
    const updatedPinsWithDemoData = JSON.parse(JSON.stringify(updatedPins));
  
    for (const pinNumber in updatedPinsWithDemoData) {
      if (updatedPinsWithDemoData.hasOwnProperty(pinNumber)) {
        const pinData = [];
  
        for (let i = 0; i < 13; i++) {
          const dataPoint = {
            [pins[pinNumber].legendName]: Math.floor(Math.random() * 100),
            time: i,
          };
          pinData.push(dataPoint);
        }
 
        updatedPinsWithDemoData[pinNumber].data = pinData;
      }
    }
  
    setDemoPins(updatedPinsWithDemoData);
    console.log("Piny: ",updatedPinsWithDemoData)
  };
  
  
  useEffect(() => {
    setDemoPinsWithData(pins);
  }, [pins, setDemoPins]);





  const handleEditPin = () => {
    const { [selectedPin]: oldPin, ...remainingPins } = pins;

    const updatedPin = {
      ...remainingPins,
      [pinNumber]: {
        color: pinColor,
        data: oldPin.data,
        legendName: legendName
      },
    };

    handleChange("pins", updatedPin);
    handlePinDialogClose();
  };

  const handleDeletePin = (pinNumber) => {
    const updatedPins = { ...pins };
    delete updatedPins[pinNumber];
    handleChange("pins", updatedPins);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    handleChange(name, value);
  };

  const handleCheckboxChange = (name) => (event) => {
    const value = event.target.checked;
    handleChange(name, value);
  };
  const handleTest = (val) => {
    console.log('vartość: ', val)
  }
  return (
    <>
      <div>
        <Tooltip title="Add a pin to display its data" enterDelay={500}>
          <Button onClick={() => handlePinDialogOpen()} color="primary">
            {" "}
            Add pin
          </Button>
        </Tooltip>
      </div>

      <div
        style={{
          float: "left",
          marginRight: "20px",
          width: "200px",
          marginTop: "10px",
        }}
      >
        <List>
          {Object.keys(pins).map((pinNumber, index) => (
            <ListItem
              key={index}
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
              <ListItemText primary={`V${pinNumber}`} />
              {hoveredPin === pinNumber && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Tooltip title="Edit pin" enterDelay={500}>
                    <EditIcon
                      onClick={() =>
                        handlePinDialogOpen(pinNumber, pins[pinNumber].color, pins[pinNumber].legendName)
                      }
                    />
                  </Tooltip>
                  <Tooltip title="Delete pin" enterDelay={500}>
                    <DeleteIcon onClick={() => handleDeletePin(pinNumber)} />
                  </Tooltip>
                </div>
              )}
            </ListItem>
          ))}
        </List>
      </div>

      <div style={chartStyle}>
        <Chart
          xAxisLabel={xAxisLabel}
          yAxisLabel={yAxisLabel}
          pins={demoPins}
          showLegend={showLegend}
        />
      </div>

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
          <Box my={2} />
          <FormControl fullWidth>
            <InputLabel>Color</InputLabel>
            <Select
              value={pinColor}
              onChange={(e) => setPinColor(e.target.value)}
              style={{ width: "200px", maxHeight: 200}}
              MenuProps={{ PaperProps: { style: { maxHeight: 300 } } }}
            >
              <MenuItem value="#ff0000">Red</MenuItem>
              <MenuItem value="#0000ff">Blue</MenuItem>
              <MenuItem value="#00ff00">Green</MenuItem>
              <MenuItem value="#ffff00">Yellow</MenuItem>
              <MenuItem value="#ff00ff">Purple</MenuItem>
              <MenuItem value="#ffa500">Orange</MenuItem>
              <MenuItem value="#00ffff">Cyan</MenuItem>
              <MenuItem value="#800080">Dark Purple</MenuItem>
              <MenuItem value="#008000">Dark Green</MenuItem>
              <MenuItem value="#ffa07a">Light Salmon</MenuItem>
              <MenuItem value="#ff4500">Orange Red</MenuItem>
              <MenuItem value="#4169e1">Royal Blue</MenuItem>
            </Select>
            <Box my={2} />
            <TextField
            name="legend"
            label="Legend"
            value={legendName}
            onChange={(e) => setLegendName(e.target.value)}
            fullWidth
          />

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

      <TextField
        name="widgetTitle"
        label="Widget title"
        value={formData.widgetTitle}
        onChange={handleInputChange}
        fullWidth
      />
      <Box my={2} />
      <TextField
        name="xAxisLabel"
        label="X Label"
        value={xAxisLabel}
        onChange={handleInputChange}
        fullWidth
      />
      <Box my={2} />
      <TextField
        name="yAxisLabel"
        label="Y Label"
        value={yAxisLabel}
        onChange={handleInputChange}
        fullWidth
      />
      <Box my={2} />

      <div style={{ display: "flex", alignItems: "center" }}>
        <input
          type="checkbox"
          id="showLegendCheckbox"
          checked={showLegend}
          onChange={handleCheckboxChange("showLegend")}
        />
        <label htmlFor="showLegendCheckbox">Show legend</label>
      </div>
    </>
  );
};

export default ChartSettingsDialogContent;
