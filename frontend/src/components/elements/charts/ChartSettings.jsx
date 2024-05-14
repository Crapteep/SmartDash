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

const chartStyle = {
  width: "60%",
  height: "300px",
  border: "1px solid #ccc",
  borderRadius: "4px",
  marginTop: "0px",
  marginBottom: "20px",
  float: "right",
};

const chartTypes = {
  line: [
    "linear",
    "linearClosed",
    "natural",
    "monotone",
    "monotoneX",
    "monotoneY",
    "basis",
    "basisClosed",
    "basisOpen",
    "bumpX",
    "bumpY",
    "bump",
    "step",
    "stepAfter",
    "stepBefore",
  ],
  bar: ["vertical"],
  area: [
    "basis",
    "basisClosed",
    "basisOpen",
    "bumpX",
    "bumpY",
    "bump",
    "linear",
    "linearClosed",
    "natural",
    "monotoneX",
    "monotoneY",
    "monotone",
    "step",
    "stepBefore",
    "stepAfter",
  ],
  scatter: ["circle", "cross", "diamond", "square", "star", "triangle"],
};

const ChartSettings = ({ formData, handleChange, availablePins }) => {
  console.log(formData);
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [selectedPin, setSelectedPin] = useState(null);
  const [pinNumber, setPinNumber] = useState("");
  const [hoveredPin, setHoveredPin] = useState(null);

  const initialChartType = formData.chart_type
    ? formData.chart_type.split(":")[0]
    : "line";
  const initialInterpolationType = formData.chart_type
    ? formData.chart_type.split(":")[1]
    : chartTypes[initialChartType][0];
  const [chartType, setChartType] = useState(initialChartType);
  const [interpolationType, setInterpolationType] = useState(
    initialInterpolationType
  );

  useEffect(() => {
    if (formData.chart_type) {
      const [chart, interpolation] = formData.chart_type.split(":");
      setChartType(chart);
      setInterpolationType(interpolation);
    }
  }, [formData.chart_type]);

  useEffect(() => {
    const connectOption = `${chartType}:${interpolationType}`;
    handleChange("chart_type", connectOption);
  }, [chartType, interpolationType]);

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

  const handleDeletePin = (pinName) => {
    const updatedPins = formData.virtual_pins.filter(
      (pin) => pin.pin !== pinName
    );
    handleChange("virtual_pins", updatedPins);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    console.log(name, value);
    handleChange(name, value);
  };

  const handleChartChange = (event) => {
    const { name, value } = event.target;
    if (name === "chart_type") {
      setChartType(value);
      setInterpolationType(chartTypes[value][0]);
    } else if (name === "interpolation_type") {
      setInterpolationType(value);
    }
  };

  return (
    <>
      <div>
        {!formData.virtual_pins || formData.virtual_pins.length < 5 ? (
          <Tooltip title="Add a new pin" enterDelay={500}>
            <Button onClick={() => handlePinDialogOpen()} color="primary">
              Add pin
            </Button>
          </Tooltip>
        ) : null}
      </div>

      <div
        style={{
          float: "left",
          marginRight: "20px",
          width: "200px",
          marginTop: "10px",
        }}
      >
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
              marginBottom: "20px",
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

      <TextField
        name="widget_title"
        label="Widget title"
        value={formData.widget_title}
        onChange={handleInputChange}
        fullWidth
      />
      <Box my={2} />
      <Grid container spacing={2}>
        <Grid item xs={9}>
          <TextField
            name="xAxisLabel"
            label="X Label"
            value={formData.xAxisLabel}
            onChange={handleInputChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={3}>
          <TextField
            name="xunit"
            label="unit"
            value={formData.xunit}
            onChange={handleInputChange}
            fullWidth
          />
        </Grid>
      </Grid>

      <Box my={2} />
      <Grid container spacing={2}>
        <Grid item xs={9}>
          <TextField
            name="yAxisLabel"
            label="Y Label"
            value={formData.yAxisLabel}
            onChange={handleInputChange}
            fullWidth
          />
        </Grid>

        <Grid item xs={3}>
          <TextField
            name="yunit"
            label="unit"
            value={formData.yunit}
            onChange={handleInputChange}
            fullWidth
          />
        </Grid>
      </Grid>

      <Box my={2} />

      <Grid container spacing={2}>
        <Box my={2} />
        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel>Chart type</InputLabel>
            <Select
              name="chart_type"
              value={chartType}
              onChange={handleChartChange}
              style={{ maxHeight: 200 }}
              MenuProps={{ PaperProps: { style: { maxHeight: 300 } } }}
            >
              {Object.keys(chartTypes).map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel>Interpolation type</InputLabel>
            <Select
              name="interpolation_type"
              value={interpolationType}
              onChange={handleChartChange}
              style={{ maxHeight: 200 }}
              MenuProps={{ PaperProps: { style: { maxHeight: 300 } } }}
            >
              {chartTypes[chartType].map((interpolation) => (
                <MenuItem key={interpolation} value={interpolation}>
                  {interpolation}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      <FormControlLabel
        control={
          <Checkbox
            checked={formData.show_legend}
            onChange={(event) => {
              const customEvent = {
                ...event,
                target: {
                  ...event.target,
                  name: "show_legend",
                  value: event.target.checked,
                },
              };
              handleInputChange(customEvent);
            }}
            name="show_legend"
          />
        }
        label="Show legend"
      />
    </>
  );
};

export default ChartSettings;
