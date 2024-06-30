import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Tab, Tabs, useTheme, Button } from "@mui/material";
import HeaderInfo from "../../components/HeaderInfo";
import Datastream from "../datastream";
import DeviceSettings from "../settings/DeviceSettings";
import axios from "axios";
import { tokens } from "../../theme";
import ConfirmationDialog from "../../components/ConfirmDialogForms/ConfirmationDialog";
import InfoDialog from "../../components/ConfirmDialogForms/InfoDialog";
import { useNavigate } from "react-router-dom";
import Notification from "../../components/Notification";
import useDeviceData from "../../hooks/useDeviceData";
import { useQueryClient } from "react-query";
import TaskManager from "./TaskManager";

const Settings = () => {
  const [activeTab, setActiveTab] = useState(0);
  const queryClient = useQueryClient();
  const [deviceSettings, setDeviceSettings] = useState(null);
  const [datastream, setDatastream] = useState(null);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState({
    title: "",
    message: "",
  });

  const { id } = useParams();
  const { data: deviceData, isLoading, isError } = useDeviceData(id);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const URL = import.meta.env.VITE_APP_API_URL;
  const bearerToken = localStorage.getItem("token");

  useEffect(() => {
    if (deviceData) {
      setDeviceSettings(deviceData.settings);
      setDatastream(deviceData.virtual_pins);
    }

  }, [deviceData]);

  const handleChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleUpdateDevice = (updatedFields) => {
    setDeviceSettings((prevData) => ({
      ...prevData,
      ...updatedFields,
    }));
  };

  const handleDeleteClick = (deviceId) => {
    setShowConfirmDialog(true);
  };

  const handleConfirm = () => {
    axios
      .delete(`${URL}/api/v1/devices/delete/${id}`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${bearerToken}`,
        },
      })
      .then((response) => {
        handleSuccessDelete();
      })
      .catch((error) => {
        if (error.response && error.response.status === 422) {
          setNotification({
            type: "error",
            message: "Error when deleting the device (422)",
          });
        } else if (error.response.status === 401) {
          pass;
        }
        handleErrorDelete();
      });

    setShowConfirmDialog(false);
  };

  const handleSuccessDelete = () => {
    setDialogMessage({
      title: "Succes!",
      message: "The device has been removed!",
    });
    setShowInfoDialog(true);
  };
  const handleErrorDelete = () => {
    setDialogMessage({
      title: "Error!",
      message: "The device has not been removed!",
    });

    setShowInfoDialog(true);
  };

  const handleInfoDialogClose = () => {
    // navigate('/devices')
    navigate("/devices");
    setShowInfoDialog(false);
  };

  const handleCancel = () => {
    setShowConfirmDialog(false);
  };

  const closeNotification = () => {
    setNotification(null);
  };

  if (isLoading) {
    return <Box>ładowanie</Box>;
  }

  return (
    <Box m="20px">
      <HeaderInfo
        title="SETTINGS"
        subtitle="Manage your device settings"
      ></HeaderInfo>

      <Box
        display="flex"
        justifyContent="space-between"
        style={{ color: colors.grey[100] }}
      >
        <Tabs
          value={activeTab}
          onChange={handleChange}
          aria-label="settings tabs"
          style={{ display: "flex", color: colors.grey[100] }}
        >
          <Tab
            label="Device Settings"
            sx={{ textTransform: "none" }}
            style={{ fontSize: "0.9rem" }}
          />
          <Tab
            label="Datastream"
            sx={{ textTransform: "none" }}
            style={{ fontSize: "0.9rem" }}
          />
          <Tab
            label="Triggers"
            sx={{ textTransform: "none" }}
            style={{ fontSize: "0.9rem" }}
          />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <DeviceSettings
          deviceData={deviceSettings}
          deviceId={id}
          onUpdate={handleUpdateDevice}
          handleDeleteDevice={handleDeleteClick}
        />
      )}

      {activeTab === 1 && <Datastream pinsData={datastream} deviceId={id} />}

      {activeTab === 2 && (
        // <TaskManager/>
        <Box p={3}>Triggers</Box>
      )}

      {showConfirmDialog && (
        <ConfirmationDialog
          open={showConfirmDialog}
          message="Are you sure you want to remove this device?"
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}

      <InfoDialog
        open={showInfoDialog}
        onClose={handleInfoDialogClose}
        title={dialogMessage.title}
        message={dialogMessage.message}
      />

      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={closeNotification}
        />
      )}
    </Box>
  );
};

export default Settings;
