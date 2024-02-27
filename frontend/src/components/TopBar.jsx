import React, { useState, memo } from "react";
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
import Tooltip from "@mui/material/Tooltip";
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
 const TopBar = ({
  deviceList,
  selectedDevice,
  setLayout,
  layout,
  originalItems, 
  isEditMode,
  handleButtonClick,
  
  
  handleChangeDevice
}) =>{

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const classes = useStyles();

  const handleDeviceSelect = (event) => {
    handleChangeDevice(event.target.value);
  };


  return (
    <Card
      className={classes.root}
      style={{ background: colors.primary[400], padding: "2px", margin: "0px" }}
    >
      {isEditMode ? (
        <AddList
          setLayout={setLayout}
          layout={layout}
          originalItems={originalItems}
          
        />
      ) : null}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {deviceList && !isEditMode && (
          <List style={{ margin: 0, padding: 0 }}>
            <ListItem style={{ margin: 0, padding: 0 }}>
              <ListItemText style={{ fontSize: "12px", margin: 0, padding: 0 }}>
                <Select
                  value={selectedDevice._id}
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
                  {deviceList.map((device) => (
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
          <Tooltip title={isEditMode ? "Save dashboard" : "Edit dashboard"} enterDelay={500}>
          <IconButton
            aria-label= {isEditMode ? "save": "edit"}
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
          </Tooltip>
        </div>
        
      </div>
    </Card>
  );
}
export default TopBar