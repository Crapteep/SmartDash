import { Box, Typography, useTheme, Button } from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import "./index.css";
import { useState } from "react";
import ConfigDialog from "../../components/ConfigDialog";
import ControlPointIcon from "@mui/icons-material/ControlPoint";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import useDevicesData from "../../hooks/useDevicesData";
import ConfirmationDialog from "../../components/ConfirmDialogForms/ConfirmationDialog";
import { useQueryClient } from "react-query";
import axios from "axios";
import InfoDialog from "../../components/ConfirmDialogForms/InfoDialog";
import AddIcon from "@mui/icons-material/Add";
import { Link } from "react-router-dom";
import HeaderInfo from "../../components/HeaderInfo";

const Devices = () => {
  const URL = import.meta.env.VITE_APP_API_URL;
  const bearerToken = localStorage.getItem("token");
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const queryClient = useQueryClient();

  const [showDialog, setShowDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isConfiguration, setIsConfiguration] = useState(false);
  const { isLoading, data } = useDevicesData();
  const [removalDevice, setRemovalDevice] = useState();

  const formDevice = {
    name: "",
    hardware: "",
    configuration: {
      serial_port: "",
    },
    description: "",
  };

  const [dialogMessage, setDialogMessage] = useState({
    title: "",
    message: "",
  });

  const handleConfigureClick = (device) => {
    setIsConfiguration(true);
    setSelectedDevice(device);
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
  };

  const handleAddDeviceClick = () => {
    setIsConfiguration(false);
    setSelectedDevice(formDevice);
    setShowDialog(true);
  };

  const handleDeleteClick = (device_id) => {
    setRemovalDevice(device_id);
    setShowConfirmDialog(true);
  };

  const handleInfoDialogClose = () => {
    setShowInfoDialog(false);
  };

  const handleSuccessDelete = () => {
    queryClient.invalidateQueries("devices");
    setDialogMessage({
      title: "Success!",
      message: "The device has been successfully deleted!",
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

  const handleConfirm = () => {
    axios
      .delete(`${URL}/devices/delete/${removalDevice}`, {
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
          pass;
        } else if (error.response.status === 401) {
          pass;
        }
        handleErrorDelete();
      });

    setShowConfirmDialog(false);
  };

  const handleCancel = () => {
    setShowConfirmDialog(false);
  };
  console.log("laduje");
  if (isLoading) {
    return <Box>ładowanie</Box>;
  }
  return (
    <Box m="20px">
      <HeaderInfo title="DEVICES" subtitle="Configure your devices">
        <Tooltip title={<Typography variant="h6">Add device</Typography>}>
          <IconButton onClick={handleAddDeviceClick} className="btn">
            <ControlPointIcon />
          </IconButton>
        </Tooltip>
      </HeaderInfo>

      <Box
        display="flex"
        flexWrap="wrap"
        justifyContent="center"
        m="40px 0 0 0"
        className="devices-container"
      >
        {data && data.length > 0 ? (
          data?.map((device) => (
            <Link
              to={`/devices/${device._id}`}
              key={device._id}
              style={{ textDecoration: "none" }}
            >
              <div className="card" key={device._id}>
                <div className="content">
                  <Tooltip
                    title={
                      device.name.length > 18 ? (
                        <Typography variant="h6">{device.name}</Typography>
                      ) : null
                    }
                    placement="top"
                  >
                    <Typography
                      variant="h3"
                      color={colors.grey[100]}
                      fontWeight="bold"
                      sx={{
                        m: "10px 0 0 0",
                        maxWidth: "100%",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        cursor: "pointer",
                      }}
                    >
                      {device.name}
                    </Typography>
                  </Tooltip>
                  <Typography
                    color={colors.grey[200]}
                    className="description"
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {device.description}
                  </Typography>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ textAlign: "center" }}>
              <Typography variant="h4">No devices found.</Typography>
              <Box m={2} />
              <IconButton onClick={handleAddDeviceClick}>
                <AddIcon fontSize="large" />
                Add your first device
              </IconButton>
            </div>
          </div>
        )}
      </Box>
      {showDialog && (
        <ConfigDialog
          showDialog={showDialog}
          handleCloseDialog={handleCloseDialog}
          selectedDevice={selectedDevice}
          isConfiguration={isConfiguration}
        />
      )}

      {showConfirmDialog && (
        <ConfirmationDialog
          open={showConfirmDialog}
          message="Are you sure you want to remove this device?"
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}

      {/* Info Dialog */}
      <InfoDialog
        open={showInfoDialog}
        onClose={handleInfoDialogClose}
        title={dialogMessage.title}
        message={dialogMessage.message}
      />
    </Box>
  );
};

export default Devices;
