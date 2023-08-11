import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import axios from "axios";
import { useQueryClient } from "react-query";
import "./ConfigDialog.css";
import InfoDialog from "../ConfirmDialogForms/InfoDialog";

const ConfigDialog = ({
  showDialog,
  handleCloseDialog,
  selectedDevice,
  isConfiguration,
}) => {
  const URL = process.env.REACT_APP_API_URL;
  const [deviceName, setDeviceName] = useState(selectedDevice.name);
  const [deviceHardware, setDeviceHardware] = useState(selectedDevice.hardware);
  const [deviceConfiguration, setDeviceConfiguration] = useState(
    selectedDevice.configuration
  );

  const queryClient = useQueryClient();

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [dialogMessage, setDialogMessage] = useState({
    title: "",
    message: "",
  });

  const [configForm, setConfigForm] = useState({
    name: selectedDevice.name,
    hardware: selectedDevice.hardware,
    configuration: selectedDevice.configuration,
  });


  const handleSuccessDialogOpen = (event) => {
    console.log('useefect issuccesful')
    if (event) {
      setIsSuccess(true);
      setDialogMessage({
        title: "Success!",
        message: "The device has been successfully created!",
      });

      
      queryClient.invalidateQueries("devices");
    } else {
      setIsSuccess(false);
      setDialogMessage({
        title: "Error",
        message: "Please enter correct data.",
      });
    }

    setShowConfirmDialog(true);
    
  };

  const handleSuccessDialogClose = () => {
    setShowConfirmDialog(false);
  };


  useEffect(() => {
    console.log("useefect form");
    setConfigForm({
      name: deviceName,
      hardware: deviceHardware,
      configuration: deviceConfiguration,
    });
  }, [deviceName, deviceHardware, deviceConfiguration]);


  const handleCreateDevice = (event) => {
    event.preventDefault();
    axios
      .post(`${URL}/devices/create`, configForm, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        handleSuccessDialogOpen(true);
        

      })
      .catch((error) => {
        if (error.response && error.response.status === 422) {
          handleSuccessDialogOpen(false);
        } else if (error.response.status === 401) {
          console.log(error.response.detail);
        }
      });
  };

  const handleUpdateDevice = (event) => {
    event.preventDefault();
    axios
      .post(`${URL}/devices/{device_id/update}`, configForm, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })

      .catch((error) => {
        if (error.response && error.response.status === 401) {
          console.log("error");
        }
      });
      handleCloseDialog();
  };

  return (
    <Dialog open={showDialog} onClose={handleCloseDialog}>
      <DialogTitle variant="h3">
        {isConfiguration
          ? `Microcontroller configuration ${selectedDevice.name}`
          : "Create new device"}
      </DialogTitle>
      <DialogContent>
        <form
          onSubmit={isConfiguration ? handleUpdateDevice : handleCreateDevice}
        >
          <TextField
            fullWidth
            label="Device Name"
            placeholder="Enter device name"
            variant="outlined"
            margin="normal"
            value={deviceName}
            onChange={(event) => setDeviceName(event.target.value)}
          />

          <FormControl fullWidth variant="outlined" margin="normal">
            <InputLabel htmlFor="formParity">Hardware</InputLabel>
            <Select
              id="formParity"
              label="Device Hardware"
              name="deviceHardware"
              value={deviceHardware}
              onChange={(event) => setDeviceHardware(event.target.value)}
            >
              <MenuItem value="Arduino">Arduino</MenuItem>
              <MenuItem value="esp32">ESP32</MenuItem>
              <MenuItem value="raspberry pi">Raspberry Pi</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Serial Port"
            placeholder="Enter serial port"
            variant="outlined"
            margin="normal"
            value={deviceConfiguration.serial_port}
            onChange={(event) =>
              setDeviceConfiguration({
                ...deviceConfiguration,
                serial_port: parseInt(event.target.value, 10),
              })
            }
          />

          <DialogActions>
            <Button onClick={handleCloseDialog} color="primary">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              {isConfiguration ? "Save" : "Create"}
            </Button>
          </DialogActions>
        </form>
      </DialogContent>

      {/* Info Dialog */}
      <InfoDialog
        open={showConfirmDialog}
        onClose={handleSuccessDialogClose}
        title={dialogMessage.title}
        message={dialogMessage.message}
        closeDialog={handleCloseDialog}
        isSuccess={isSuccess}
      />
    </Dialog>
  );
};

export default ConfigDialog;
