import React, { useState } from "react";
import {
  Box,
  IconButton,
  Tooltip,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import {
  ControlPoint as ControlPointIcon,
  Delete,
  Edit,
} from "@mui/icons-material";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles({
  root: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    marginBottom: "8px",
  },
  name: {
    fontWeight: "bold",
  },
  value: {
    maxWidth: "200px",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  iconButton: {
    color: "#ccc",
  },
});

const VirtualPinItem = ({
  name,
  pin,
  data_type,
  value,
  min_range,
  max_range,
  onRemove,
  onEdit,
}) => {
  const classes = useStyles();

  const [open, setOpen] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = () => {
    onEdit(name, editValue);
    setOpen(false);
  };

  const renderValue = () => {
    switch (data_type) {
      case "String":
        return value;
      case "Integer":
      case "Double":
        return `Value: ${value} | Min: ${min_range} | Max: ${max_range}`;
      default:
        return "Unknown data type";
    }
  };

  return (
    <div className={classes.root}>
      <Typography variant="body1" className={classes.name}>
        {name}
      </Typography>
      <Typography variant="body1" className={classes.value}>
        {renderValue()}
      </Typography>
      <div>
        <IconButton className={classes.iconButton} onClick={onRemove}>
          <Delete />
        </IconButton>
        <IconButton
          className={classes.iconButton}
          onClick={() => setOpen(true)}
        >
          <Edit />
        </IconButton>
      </div>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Edit {name}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Value"
            type={
              data_type === "Integer" || data_type === "Double"
                ? "number"
                : "text"
            }
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default VirtualPinItem;
