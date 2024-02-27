import React, { useState, useEffect, useRef } from "react";
import { Box, Button, Typography, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import useDevicesData from "../../hooks/useDevicesData";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";
import DragDrop from "../../components/DragDrop";
import { useSelector, useDispatch } from 'react-redux';
import { updatePinData } from "../../redux/actions/chartActions";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { clearSendData } from"../../redux/actions/buttonActions"


const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const URL = import.meta.env.VITE_APP_API_URL;
  const { isLoading, data: deviceList } = useDevicesData();
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [layout, setLayout] = useState([]);
  const [copied, setCopied] = useState(false);

  const dispatch = useDispatch();
  const sendData = useSelector(state => state.button.sendData);
  const [token, setToken] = useState("");
  const ws = useRef(null);

  useEffect(() => {
    if (!isLoading && deviceList && deviceList.length > 0) {
      const retrievedDevice = JSON.parse(
        localStorage.getItem("selected_device")
      );
      if (retrievedDevice !== null) {
        const retrievedDeviceId = retrievedDevice._id;
        const foundDevice = deviceList.find(
          (device) => device._id === retrievedDeviceId
        );
        if (foundDevice) {
          handleChangeDevice(retrievedDeviceId);
        } else {
          handleChangeDevice(deviceList[0]._id);
        }
      } else {
        handleChangeDevice(deviceList[0]._id);
      }
    }
  }, [deviceList, isLoading]);

  useEffect(() => {
    if (token !== "") {
      const URLWithoutProtocol = URL.replace(/^https?:\/\//, "");
      ws.current = new WebSocket(`ws://${URLWithoutProtocol}/ws/?token=${token}`);

      ws.current.onopen = () => {
        console.log("WebSocket connected");
      };

      ws.current.onmessage = (event) => {
        const newData = JSON.parse(event.data);
        dispatch(updatePinData(newData.pin, newData.data, newData.interval));
      };

      return () => {
        ws.current.close();
      };
    }
  }, [token]);

  useEffect(() => {
    if (sendData) {
      console.log('wysyłam dane', sendData)
      ws.current.send(JSON.stringify(sendData));
      dispatch(clearSendData());
    }
  }, [sendData]);


  

  {
    /*Update layoutu w bazie danych*/
  }
  const handleUpdateLayout = async () => {
    console.log("layout przed update", layout);
    const update_data = {
      device_id: selectedDevice._id,
      layout: layout,
    };

    try {
      const response = await axios.put(`${URL}/dashboard/update`, update_data);
      console.log("Response:", response.data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchDeviceLayout = async (deviceId) => {
    try {
      const response = await axios.get(`${URL}/dashboard/${deviceId}`);
      console.log("Odopowiedz serwera", response.data);
      if (response.data !== null) {
        setLayout(response.data);
      } else {
        setLayout([]);
      }
      console.log("po ustawieniu z serwera", response.data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  {
    /*Funckja ustawiająca nowe urządzenie*/
  }
  const handleChangeDevice = (deviceId) => {
    const newSelectedDevice = findDeviceById(deviceList, deviceId);
    setSelectedDevice(newSelectedDevice);
    setToken(newSelectedDevice.access_token);
    fetchDeviceLayout(deviceId);
    localStorage.setItem("selected_device", JSON.stringify(newSelectedDevice));
    console.log(selectedDevice);
  };

  function findDeviceById(deviceList, deviceId) {
    const foundDevice = deviceList?.find((device) => device._id === deviceId);
    return foundDevice || null;
  }


  const handleCopyClick = () => {

  }

  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="DASHBOARD" subtitle="Welcome to your dashboard" />
      </Box>
      <Box display="flex" justifyContent="flex-start">
        <CopyToClipboard text={selectedDevice && selectedDevice.access_token}>
          <Button
            variant="outlined"
            style={{ background: colors.primary[400] }}
            onClick={() => {
              setCopied(true);
              setTimeout(() => {
                setCopied(false);
              }, 1000);
            }}
          >
            <Typography
              variant="h6"
              gutterBottom
              noWrap
              style={{ textTransform: "none" }}
            >
              Copy device acces token
            </Typography>
          </Button>
        </CopyToClipboard>
        {copied ? <Typography style={{ marginLeft: 10, marginTop: 10}}>Copied!</Typography> : null}
      </Box>

      <Box my={1} />
      <Box maxWidth="100%" overflow="hidden">
        {isLoading ? (
          <CircularProgress />
        ) : deviceList && deviceList.length > 0 && selectedDevice ? (
          <DragDrop
            layout={layout}
            setLayout={setLayout}
            deviceList={deviceList}
            selectedDevice={selectedDevice}
            handleUpdateLayout={handleUpdateLayout}
            handleChangeDevice={handleChangeDevice}
          />
        ) : (
          <Typography>No devices found. </Typography>
        )}
      </Box>
    </Box>
  );
};

export default Dashboard;
