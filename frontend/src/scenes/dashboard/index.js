import React, { useState, useEffect } from "react";
import { Box, Button, IconButton, Typography, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import Header from "../../components/Header";
import Content from "../../components/Content";
import useDevicesData from "../../hooks/useDevicesData";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";
import { useQueryClient } from "react-query";
import DragDrop from "../../components/DragDrop";

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const URL = process.env.REACT_APP_API_URL;
  const queryClient = useQueryClient();
  const { isLoading, data: deviceList } = useDevicesData();
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [layout, setLayout] = useState(null);
  const [itemList, setItemList] = useState(null);

  useEffect(() => {
    if (!isLoading && deviceList && deviceList.length > 0 && selectedDevice === null) {
      setSelectedDevice(deviceList[1]);
    }

    if (selectedDevice !== null && layout == null) {
      const selectedLayout = selectedDevice.dashboard.layout;
      console.log('selected layout', selectedLayout)
      setLayout(selectedLayout)
      const iValues = (selectedLayout && selectedLayout.md) ? selectedLayout.md.map(item => item.i) : [];

      console.log('ivalues', iValues)
      setItemList(iValues);
}
    
  }, [deviceList, selectedDevice, isLoading]);

  const handleUpdateLayout = async () => {
    console.log('layout przed update', layout)
    const update_data = {
      device_id: selectedDevice._id,
      layout: layout,
    };

    try {
      const response = await axios.put(`${URL}/dashboard/update`, update_data);
      console.log("Response:", response.data);
      queryClient.invalidateQueries("devices");
    } catch (error) {
      console.error("Error:", error);
    }
  };
  const updateSelectedDeviceData = (newSelectedDevice) => {
    if (newSelectedDevice) {
      const newLayout = newSelectedDevice.dashboard.layout;
      setLayout(newLayout);

      const newItemList = newLayout && newLayout.md ? newLayout.md.map((item) => item.i) : [];
      setItemList(newItemList);
    }
  }


  const handleChangeDevice = (deviceId) => {
    const newSelectedDevice = findDeviceById(deviceList, deviceId);
    setSelectedDevice(newSelectedDevice);
    updateSelectedDeviceData(newSelectedDevice);
  };

  function findDeviceById(deviceList, deviceId) {
    const foundDevice = deviceList?.find((device) => device._id === deviceId);
    return foundDevice || null;
  }

  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="DASHBOARD" subtitle="Welcome to your dashboard" />
      </Box>
      <Box maxWidth="100%" overflow="hidden">
        {isLoading ? (
          <CircularProgress />
        ) : deviceList &&
          deviceList.length > 0 &&
          selectedDevice &&
          itemList ? (
          <Content
            deviceList={deviceList}
            selectedDevice={selectedDevice}
            handleUpdateLayout={handleUpdateLayout}
            layout={layout}
            setLayout={setLayout}
            itemList={itemList}
            handleChangeDevice={handleChangeDevice}
          />
          // <DragDrop
          // layout={layout}
          // itemList={itemList}
          // deviceList={deviceList}
          // selectedDevice={selectedDevice}
          // handleUpdateLayout={handleUpdateLayout}
          // setLayout={setLayout}
          // handleChangeDevice={handleChangeDevice}
          // />
        ) : (
          
          <Typography>No devices found. {console.log(itemList)}   </Typography>
        )}
      </Box>
    </Box>
  );
};

export default Dashboard;
