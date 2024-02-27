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
import { v4 as uuidv4 } from 'uuid';


const useStyles = makeStyles((theme) => ({
  popup: {
    padding: theme.spacing(2),
  },
}));

const widgetNames = {
  a: "Line Chart",
  b: "Area Chart",
  c: "Bar Chart",
  d: "Scatter Chart",
  e: "Outlined Button",
  f: "Contained Button",
};

const chartSettings = {
  type: "chart",
  widgetTitle: "Chart",
  xAxisLabel: "X Axis",
  yAxisLabel: "Y Axis",
  pins: {},
  showLegend: false
}

const buttonSettings = {
  type: "button",
  widgetTitle: "Button",
  variant: "outlined",
  text: "Click me",
  backgroundColor: "",
  pin: 0,
}

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
};

const widgetSettings = {
  a: { ...chartSettings},
  b: { ...chartSettings},
  c: { ...chartSettings},
  d: { ...chartSettings},
  e: { ...buttonSettings},
  f: { ...buttonSettings},
}


const AddList = ({
  originalItems,
  setLayout,
  layout,
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
    const instanceId = generateUniqueId();
    console.log('ELEMENT NAME', elementName)
    const newLayout = {
      ...initialLayoutDefaults[widgetSettings[elementName].type],
      i: elementName,
      instanceId: instanceId,
      settings: widgetSettings[elementName],
    }
    setLayout((prevLayout) => [...prevLayout, newLayout]);
    console.log('przed dodaniem', newLayout)
  };

  const generateUniqueId = () => {
    let newInstanceId;
    do {
      newInstanceId = uuidv4();
    } while (layout.some(item => item.instanceId === newInstanceId));
    return newInstanceId;
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
}
export default AddList;