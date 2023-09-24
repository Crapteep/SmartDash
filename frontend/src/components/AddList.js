import React from "react";
import { makeStyles } from "@mui/styles";
import Popover from "@mui/material/Popover";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const useStyles = makeStyles((theme) => ({
  popup: {
    padding: theme.spacing(2)
  }
}));


const widgetNames = {
  a: "Line Chart",
  b: "Area Chart",
  c: "Bar Chart",
  d: "Scatter Chart",
  e: "Outlined Button",
  f: "Contained Button"
};

export default function AddList({
  items,
  onRemoveItem,
  onAddItem,
  originalItems,
  onSelectionChange
}) {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);

  console.log('items w addlist', items)
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  const handleChange = (e) => {
    const itemName = e.target.name;
    if (e.target.checked) {
      onAddItem(itemName); // Add the item to the state in AddList
      onSelectionChange(itemName, true); // Notify the parent about the change
      console.log('dodano widghet')
    } else {
      onRemoveItem(itemName); // Remove the item from the state in AddList
      onSelectionChange(itemName, false); // Notify the parent about the change
      console.log('usunieto widghet')
    }
  };

  return (
    <>
      <IconButton aria-label="add" onClick={handleClick} aria-describedby={id} style={{
          padding: "2px",
          width: "32px",
          height: "32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
        <AddCircleOutlineIcon style={{fontSize: "20px"}}/>
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center"
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center"
        }}
      >
        <div className={classes.popup}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Select Widgets</FormLabel>
            <FormGroup>
              {originalItems.map((i) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={items.includes(i)}
                      onChange={handleChange}
                      name={i}
                    />
                  }
                  label={widgetNames[i]}
                  key={i}
                />
              ))}
            </FormGroup>
          </FormControl>
        </div>
      </Popover>
    </>
  );
}