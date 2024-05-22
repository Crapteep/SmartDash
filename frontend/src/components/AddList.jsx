import React from "react";
import { makeStyles } from "@mui/styles";
import Popover from "@mui/material/Popover";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import FormGroup from "@mui/material/FormGroup";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import Button from "@mui/material/Button";
import { v4 as uuidv4 } from "uuid";

const useStyles = makeStyles((theme) => ({
  popup: {
    padding: theme.spacing(2),
  },
}));

const widgetNames = {
  a: "Chart",
  b: "Button",
  c: "Switch",
  d: "Label",
  e: "Slider"
};

const chartSettings = {
  element_type: "chart",
  widget_title: "Chart",
  alias: "",
  chart_type: "line:linear",
  xAxisLabel: "X Axis",
  yAxisLabel: "Y Axis",
  virtual_pins: [],
  show_legend: false,
  selected_range: "1d",
  xunit: "",
  yunit: "",
};

const buttonSettings = {
  element_type: "button",
  widget_title: "Button",
  alias: "",
  variant: "outlined",
  text: "Click me",
  background_color: "",
  on_click_value: 0,
  virtual_pins: [],
};

const switchSettings = {
  element_type: "switch",
  widget_title: "Switch",
  alias: "",
  on_label: "ON",
  off_label: "OFF",
  label_position: "end",
  on_value: 1,
  off_value: 0,
  checked: false,
  virtual_pins: [],
  show_label: false,
};

const labelSettings = {
  element_type: "label",
  widget_title: "Label",
  alias: "",
  level_color: "#5353ec",
  label_position: "center",
  level_position: "vertical",
  unit: "",
  min_level: 0,
  max_level: 1,
  show_level: false,
  virtual_pins: [],
};

const sliderSettings = {
  element_type: "slider",
  widget_title: "Slider",
  alias: "",
  virtual_pins: [],
  send_immediately: false,
  step: 1
};

const initialLayoutDefaults = {
  chart: {
    w: 10,
    h: 6,
    x: 0,
    y: 0,
    minW: 5,
    minH: 6,
    maxW: 24,
    maxH: 24,
    moved: false,
    static: false,
  },
  button: {
    w: 4,
    h: 3,
    x: 0,
    y: 0,
    minW: 3,
    minH: 3,
    maxW: 24,
    maxH: 24,
    moved: false,
    static: false,
  },
  switch: {
    w: 4,
    h: 4,
    x: 0,
    y: 0,
    minW: 3,
    minH: 4,
    maxW: 24,
    maxH: 6,
    moved: false,
    static: false,
  },
  label: {
    w: 4,
    h: 3,
    x: 0,
    y: 0,
    minW: 3,
    minH: 3,
    maxW: 24,
    maxH: 24,
    moved: false,
    static: false,
  },

  slider: {
    w: 4,
    h: 4,
    x: 0,
    y: 0,
    minW: 4,
    minH: 3,
    maxW: 24,
    maxH: 6,
    moved: false,
    static: false,
  },

};

const widgetSettings = {
  a: { ...chartSettings },
  b: { ...buttonSettings },
  c: { ...switchSettings },
  d: { ...labelSettings },
  e: { ...sliderSettings }
};

const AddList = ({
  originalItems,
  setLayout,
  layout,
  elements,
  setElements,
}) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  const handleAddComponentToLayout = (elementName) => {
    const element_id = generateUniqueId();
    const newLayout = {
      ...initialLayoutDefaults[widgetSettings[elementName].element_type],
      i: elementName,
      element_id: element_id,
    };
    const newElement = {
      ...widgetSettings[elementName],
      element_id: element_id,
    };

    setLayout((prevLayout) => [...prevLayout, newLayout]);
    setElements((prevElements) => [...prevElements, newElement]);
  };

  const generateUniqueId = (layout) => {
    if (!layout) {
      return uuidv4();
    }

    let element_id;
    do {
      element_id = uuidv4();
    } while (layout.some((item) => item.element_id === element_id));

    return element_id;
  };

  return (
    <>
      <Tooltip title="Add new widget" enterDelay={500}>
        <IconButton
          aria-label="add"
          onClick={handleClick}
          aria-describedby={id}
          style={{
            padding: "2px",
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AddCircleOutlineIcon style={{ fontSize: "20px" }} />
        </IconButton>
      </Tooltip>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <div className={classes.popup}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Select Widgets</FormLabel>
            <FormGroup>
              {originalItems.map((i) => (
                <Button
                  key={i}
                  className={classes.button}
                  variant="outlined"
                  onClick={() => handleAddComponentToLayout(i)}
                >
                  {widgetNames[i]}
                </Button>
              ))}
            </FormGroup>
          </FormControl>
        </div>
      </Popover>
    </>
  );
};
export default AddList;
