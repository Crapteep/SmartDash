import React, { useState, useRef, useEffect } from "react";
import { makeStyles } from "@mui/styles";
import Card from "@mui/material/Card";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import CloseIcon from "@mui/icons-material/Close";
import SettingsIcon from "@mui/icons-material/Settings";
import Typography from "@mui/material/Typography";
import { colors, useTheme } from "@mui/material";
import { tokens } from "../theme";
import axios from "axios";
import { useQueryClient } from "react-query";
import { updatePinData } from "../redux/actions/chartActions";
import { useSelector, connect} from "react-redux";

import ButtonSettingsDialogContent from "./ButtonSettingsDialogContent";
import ChartSettingsDialogContent from "./ChartSettingsDialogContent";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { pink } from "@mui/material/colors";

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
    flexShrink: 0, // Prevent the header from shrinking
  },
  spacer: {
    flexGrow: 1,
  },
  body: {
    padding: "0rem",
    flexGrow: 1,
  },
});

export default function Widget({
  id,
  onRemoveItem,
  component: Item,
  settings,
  isEditMode,
  setIsDraggable,
  selectedDevice,
  onUpdateSettings,
}) {
  const classes = useStyles();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const URL = import.meta.env.VITE_APP_API_URL;
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState(settings);

  

  const handleClickSettings = () => {
    setOpen(true);
    setIsDraggable(false);
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
    setFormData(settings);
  };

  const handleUpdateSettings = async () => {
    try {
      console.log(URL);
      const deviceId = selectedDevice._id;
      const response = await axios.patch(
        `${URL}/dashboard/${deviceId}/settings/${id}`,
        formData
      );
      queryClient.invalidateQueries("device");
      onUpdateSettings(formData, id);
      console.log("Response:", response.data);
      handleCloseDialog();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={handleOnClose}>
        <DialogTitle style={{fontSize: '20px'}}>Widget settings</DialogTitle>
        <DialogContent>
          {/* Wyświetl odpowiednią zawartość formularza w zależności od typu widgetu */}
          {settings.type === "button" ? (
            <ButtonSettingsDialogContent
              formData={formData}
              handleChange={handleChange}
            />
          ) : settings.type === "chart" ? (
            <ChartSettingsDialogContent
              formData={formData}
              handleChange={handleChange}
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
          <Tooltip title={settings.widgetTitle} enterDelay={500}>
            <Typography variant="h6" gutterBottom noWrap>
              {settings.widgetTitle}
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
          <Item {...settings} isEditMode={isEditMode}/>
        </div>
      </Card>
    </>
  );
}
