import React, { useState, useEffect } from "react";
import { Box, Button, IconButton, Typography, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import Header from "../../components/Header";
import Content from "../../components/Content";
import useDevicesData from "../../hooks/useDevicesData";
import axios from "axios";

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const URL = process.env.REACT_APP_API_URL;
  const { isLoading, data: devices } = useDevicesData();
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [layout, setLayout] = useState();

  const handleClick = () => {
    localStorage.setItem("token", "wteef4tq3e45");
    console.log(localStorage.getItem("token"));
  };

  useEffect(() => {
    if (devices && devices.length > 0 && !selectedDeviceId) {
      setSelectedDeviceId(devices[0]._id);
    }
    console.log("ustawienie");
  }, [devices]);

  useEffect(() => {
    console.log("zmieniono urzadzeniue");
  }, [selectedDeviceId]);

  const handleUpdateLayout = async () => {
    const update_data = {
      device_id: selectedDeviceId,
      layout: layout
    }
    console.log(update_data)

    try {
      const response = await axios.put(`${URL}/dashboard/update`, update_data);
      console.log("Response:", response.data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="DASHBOARD" subtitle="Welcome to your dashboard" />

        <Box>
          <Button
            sx={{
              backgroundColor: colors.blueAccent[700],
              color: colors.grey[100],
              fontSize: "14px",
              fontWeight: "bold",
              padding: "10px 20px",
            }}
          >
            <DownloadOutlinedIcon sx={{ mr: "10px" }} onClick={handleClick} />
            Download Reports
          </Button>
        </Box>
      </Box>
      <Box maxWidth="100%" overflow="hidden">
        <Content
          devices={devices}
          selectedDeviceId={selectedDeviceId}
          setSelectedDeviceId={setSelectedDeviceId}
          handleUpdateLayout={handleUpdateLayout}
          setLayout={setLayout}
        />
      </Box>
    </Box>
  );
};

export default Dashboard;
