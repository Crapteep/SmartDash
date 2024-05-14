import React, { useState } from "react";
import { makeStyles } from "@mui/styles";
import Card from "@mui/material/Card";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import CloseIcon from "@mui/icons-material/Close";
import SettingsIcon from "@mui/icons-material/Settings";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material";
import { tokens } from "../theme";
import axios from "axios";

import ButtonSettings from "./elements/buttons/ButtonSettings";
import ChartSettings from "./elements/charts/ChartSettings";
import SwitchSettings from "./elements/buttons/SwitchSettings";
import LabelSettings from "./elements/labels/LabelSettings";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";

const useStyles = makeStyles({
  root: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    display: "flex",
    alignItems: "center",
    padding: "0.5rem",
    flexShrink: 0,
  },
  spacer: {
    flexGrow: 1,
  },
  body: {
    padding: "0rem",
    flexGrow: 1,
  },
});

let count = 0;
export default function Widget({
  id,
  onRemoveItem,
  component: Item,
  element,
  isEditMode,
  setIsDraggable,
  selectedDevice,
  onUpdateSettings,
}) {
  const classes = useStyles();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const URL = import.meta.env.VITE_APP_API_URL;

  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState(element);
  const bearerToken = localStorage.getItem("token");
  const [availablePins, setAvailablePins] = useState([]);
  count++;
  console.log("Widget render number: ", count);

  const handleClickSettings = () => {
    setOpen(true);
    getAvailablePins();
    setIsDraggable(false);
  };

  const getAvailablePins = () => {
    axios
      .get(
        `${URL}/virtual-pins/${selectedDevice._id}/available-pins?q=${element.element_type}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${bearerToken}`,
          },
        }
      )
      .then((response) => {
        setAvailablePins(response.data.pins);
      })
      .catch((error) => {
        if (error.response && error.response.status === 422) {
          console.log("Error when deleting the device (422)");
        } else if (error.response.status === 401) {
          pass;
        }
      });
  };

  const handleChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setIsDraggable(true);
  };
  const handleOnClose = () => {
    console.log("onclose");
    handleCloseDialog();
    setFormData(element);
  };

  const handleUpdateSettings = async () => {
    onUpdateSettings(formData, id);
    handleCloseDialog();
  };
  console.log("element", element);
  return (
    <>
      <Dialog open={open} onClose={handleOnClose}>
        <DialogTitle style={{ fontSize: "20px" }}>Widget settings</DialogTitle>
        <DialogContent>
          {element && element.element_type === "button" ? (
            <ButtonSettings
              formData={formData}
              handleChange={handleChange}
              availablePins={availablePins}
            />
          ) : element && element.element_type === "chart" ? (
            <ChartSettings
              formData={formData}
              handleChange={handleChange}
              availablePins={availablePins}
            />
          ) : element && element.element_type === "switch" ? (
            <SwitchSettings
              formData={formData}
              handleChange={handleChange}
              availablePins={availablePins}
            />
          ) : element && element.element_type === "label" ? (
            <LabelSettings
              formData={formData}
              handleChange={handleChange}
              availablePins={availablePins}
            />
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleOnClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleUpdateSettings} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Card
        className={classes.root}
        style={{ background: colors.primary[400] }}
      >
        <div className={classes.header}>
          <div style={{ flexGrow: 1, overflow: "hidden" }}>
            <Tooltip title={element.widget_title} enterDelay={500}>
              <Typography variant="h6" gutterBottom noWrap>
                {element.widget_title}
              </Typography>
            </Tooltip>
          </div>
          {isEditMode ? (
            <>
              <Tooltip title="Settings" enterDelay={500}>
                <IconButton
                  aria-label="settings"
                  onClick={handleClickSettings}
                  onTouchEnd={handleClickSettings}
                >
                  <SettingsIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete widget" enterDelay={500}>
                <IconButton
                  aria-label="delete"
                  onClick={() => onRemoveItem(id)}
                  onTouchEnd={() => onRemoveItem(id)}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          ) : null}
        </div>
        <div className={classes.body}>
          <Item
            {...element}
            isEditMode={isEditMode}
            handleChange={handleChange}
          />
        </div>
      </Card>
    </>
  );
}
