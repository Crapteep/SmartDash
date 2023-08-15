import React, { useState } from "react";
import Card from "@mui/material/Card";
import { makeStyles } from "@mui/styles";
import {
  useTheme,
  List,
  ListItem,
  ListItemText,
  Select,
  MenuItem,
} from "@mui/material";
import { tokens } from "../theme";
import IconButton from "@mui/material/IconButton";
import SaveIcon from "@mui/icons-material/Save";
import EditIcon from "@mui/icons-material/Edit";
import AddList from "./AddList";


const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(1),
    width: "100%",
    display: "flex",
    justifyContent: "flex-end",
  },
}));
export default function TopBar({
  items,
  onRemoveItem,
  onAddItem,
  originalItems,
  onSelectionChange,
  isEditMode, // Receive isEditMode from props
  handleButtonClick,
  devices,
  selectedDeviceId,
  setSelectedDeviceId
}) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const classes = useStyles();

  const handleDeviceSelect = (event) => {
    setSelectedDeviceId(event.target.value);
    console.log(event.target.value);

  };

  // const handleButtonClick = () => {
  //   onLayoutEdit(); // Call the handleButtonClick function from Content
  // };

  return (
    <Card
      className={classes.root}
      style={{ background: colors.primary[400], padding: "2px", margin: "0px" }}
    >
      {isEditMode ? (
        <AddList
          items={items}
          onRemoveItem={onRemoveItem}
          onAddItem={onAddItem}
          originalItems={originalItems}
          onSelectionChange={onSelectionChange}
        />
      ) : null}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {devices && !isEditMode && (
          <List style={{ margin: 0, padding: 0 }}>
            <ListItem style={{ margin: 0, padding: 0 }}>
              <ListItemText style={{ fontSize: "12px", margin: 0, padding: 0 }}>
                <Select
                  value={selectedDeviceId}
                  onChange={handleDeviceSelect}
                  displayEmpty
                  style={{
                    height: "32px",
                    fontSize: "14px",
                    padding: 0,
                    margin: 0,
                    width: "150px",
                  }}
                >
                  <MenuItem style={{ fontSize: "12px" }} value="" disabled>
                    Select a device
                  </MenuItem>
                  {devices.map((device) => (
                    <MenuItem key={device._id} value={device._id}>
                      {device.name}
                    </MenuItem>
                  ))}
                </Select>
              </ListItemText>
            </ListItem>
          </List>
        )}

        <div style={{ marginLeft: "auto" }}>
          <IconButton
            aria-label="save"
            onClick={handleButtonClick}
            style={{
              padding: "2px",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isEditMode ? (
              <SaveIcon style={{ fontSize: "20px" }} />
            ) : (
              <EditIcon style={{ fontSize: "20px" }} />
            )}
          </IconButton>
        </div>
      </div>
    </Card>
  );
}
