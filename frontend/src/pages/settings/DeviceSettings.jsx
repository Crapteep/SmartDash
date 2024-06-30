import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  useTheme,
  Input,
} from "@mui/material";
import Notification from "../../components/Notification";
import { tokens } from "../../theme";
import axios from "axios";

const DeviceSettings = ({
  deviceData,
  deviceId,
  onUpdate,
  handleDeleteDevice,
}) => {
  const [notification, setNotification] = useState(null);
  const [formData, setFormData] = useState(null);
  const [showFullToken, setShowFullToken] = useState(false);
  const [isChanged, setIsChanged] = useState(false);
  const URL = import.meta.env.VITE_APP_API_URL;

  useEffect(() => {
    setFormData(deviceData);
  }, [deviceData]);

  if (!formData) {
    return <div>Loading...</div>;
  }

  const { name, hardware, configuration, access_token, description } = formData;

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name === "serial_port") {
      setFormData({
        ...formData,
        configuration: {
          ...formData.configuration,
          serial_port: parseInt(value),
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
    setIsChanged(true);
  };

  const saveChanges = async () => {
    try {
      const { name, hardware, configuration, description } = formData;
      const dataToSend = {
        name: name,
        hardware: hardware,
        configuration: {
          serial_port: configuration.serial_port,
        },
        description: description,
      };
      const response = await axios.put(
        `${URL}/api/v1/devices/update/${deviceId}`,
        dataToSend
      );
      onUpdate(dataToSend);
      setIsChanged(false);
      setNotification({
        type: "success",
        message: "Successfully saved changes",
      });

    } catch (error) {
      console.error("Error:", error);
      setNotification({
        type: "error",
        message: "Changes have not been saved",
      });
    }
  };

  const cancelChanges = () => {
    setFormData(deviceData);
    setNotification({ type: "info", message: "Changes have been reversed!" });
    setIsChanged(false);
  };

  const copyAccessToken = () => {
    navigator.clipboard
      .writeText(access_token)
      .then(() => {
        setNotification({
          type: "info",
          message: "Access token copied to clipboard!",
        });
      })
      .catch((error) => {
        console.error("Failed to copy access token: ", error);
        setNotification({
          type: "error",
          message: "Failed to copy access token. Please try again.",
        });
      });
  };

  const closeNotification = () => {
    setNotification(null);
  };

  return (
    <Box
      maxWidth="600px"
      mx="auto"
      ml="10%"
      style={{ color: colors.grey[100] }}
    >
      <Box mb={4} />
      <Box mb={2} ml={2}></Box>

      <Box mb={2}>
        <TextField
          label="Device Name"
          name="name"
          value={name}
          fullWidth
          variant="outlined"
          margin="normal"
          onChange={handleFormChange}
        />
      </Box>

      <Box mb={2}>
        <FormControl fullWidth variant="outlined" margin="normal">
          <InputLabel>Hardware</InputLabel>
          <Select
            name="hardware"
            value={hardware}
            label="Hardware"
            onChange={handleFormChange}
          >
            <MenuItem value="arduino">Arduino</MenuItem>
            <MenuItem value="esp32">ESP32</MenuItem>
            <MenuItem value="rpi">Raspberry Pi</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box mb={2}>
        <TextField
          type="number"
          label="Serial Port"
          name="serial_port"
          value={formData.configuration.serial_port}
          fullWidth
          variant="outlined"
          margin="normal"
          onChange={handleFormChange}
        />
      </Box>

      <Box mb={2}>
        <TextField
          label="Description"
          name="description"
          value={description}
          fullWidth
          variant="outlined"
          margin="normal"
          onChange={handleFormChange}
        />
      </Box>

      <Box mb={4}>
        <Typography variant="subtitle1">Device Access Token:</Typography>
        <Box display="flex" alignItems="center">
          <TextField
            value={
              showFullToken
                ? access_token
                : access_token.substr(0, 10) +
                  "*".repeat(access_token.length - 10)
            }
            InputProps={{
              readOnly: true,
            }}
            variant="outlined"
            margin="normal"
            sx={{ mr: 1 }}
          />
          <Button
            variant="contained"
            style={{ color: colors.grey[100], background: colors.primary[400] }}
            onClick={copyAccessToken}
          >
            Copy
          </Button>
        </Box>
      </Box>

      <Typography variant="body2" color="textSecondary">
        Created At: {new Date(deviceData.created_at).toLocaleString()}
      </Typography>
      <Box
        display="flex"
        justifyContent="space-between"
        mt={2}
        alignItems="center"
      >
        <Button
          variant="contained"
          color="error"
          onClick={() => handleDeleteDevice(deviceId)}
          style={{ float: "right", marginRight: "20px" }}
        >
          DELETE
        </Button>
        <Box>
          <Button
            variant="contained"
            style={{
              color: colors.greenAccent[400],
              background: colors.primary[400],
            }}
            sx={{ mr: 2 }}
            onClick={cancelChanges}
            disabled={!isChanged}
          >
            CLEAR
          </Button>
          <Button
            variant="contained"
            onClick={saveChanges}
            disabled={!isChanged}
            style={{ color: colors.grey[100], background: colors.primary[400] }}
          >
            Save changes
          </Button>
        </Box>
      </Box>

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

export default DeviceSettings;
