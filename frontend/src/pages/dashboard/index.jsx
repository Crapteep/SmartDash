import React, { useState, useEffect } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import useDevicesData from "../../hooks/useDevicesData";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";
import DragDrop from "../../components/DragDrop";
import { useDispatch } from "react-redux";
import { updatePinData } from "../../redux/actions/chartActions";
import {
  updateLabelValue,
  resetLabelState,
} from "../../redux/actions/labelActions";
import { useWebSocket } from "../../hooks/useWebSocket";
import { WebSocketProvider } from "../../providers/WebSocketProvider";

let count = 0;

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const URL = import.meta.env.VITE_APP_API_URL;
  const { isLoading, data: deviceList } = useDevicesData();
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [layout, setLayout] = useState([]);
  const [elements, setElements] = useState([]);
  const [usedPins, setUsedPins] = useState({});
  const dispatch = useDispatch();
  const [token, setToken] = useState("");

  count++;
  // console.log("Aktualizacja dashboard: ", count);

  async function handleData(data) {
    if (Array.isArray(data)) {
      for (const item of data) {
        await handleSingleData(item);
      }
    } else {
      await handleSingleData(data);
    }
  }

  async function handleSingleData(data) {
    // console.log(data);
    const { code, pin, timestamp, value } = data;

    const reducers = [];
    if (usedPins) {
      for (const [reducer, pins] of Object.entries(usedPins)) {
        if (pins && pins.includes(pin)) {
          reducers.push(reducer);
        }
      }
    } else {
      console.error("usedPins is undefined or null");
      return;
    }

    if (reducers.length === 0) {
      console.log(`Pin ${pin} nie istnieje w usedPins.`);
      return;
    }

    for (const reducerName of reducers) {
      switch (reducerName) {
        case "chart":
          console.log("aktualizuje wykres");
          await dispatch(updatePinData(pin, value, timestamp));
          break;
        case "label":
          console.log("aktualizuje label");
          await dispatch(updateLabelValue(pin, value));
          break;
        case "button":
          console.log("aktualizuje button");
          break;
        case "switch":
          console.log("aktualizuje switch");
          break;
        case "slider":
          //  kod dla akcji 'slider'
          break;
        case "diode":
          //  kod dla akcji 'diode'
          break;
        default:
          console.log(`Nieznany reducer: ${reducerName}`);
          break;
      }
    }
  }

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

  const handleUpdateLayout = async () => {
    const updatedElements = elements.map((element) => {
      const transformedVirtualPins = element.virtual_pins.map((pin) => pin.pin);
      return {
        ...element,
        virtual_pins: transformedVirtualPins,
      };
    });

    const update_data = {
      device_id: selectedDevice._id,
      layout: layout,
      elements: updatedElements,
    };

    try {
      const response = await axios.put(`${URL}/dashboard/update`, update_data);
      fetchDeviceLayout(selectedDevice._id);
      fetchUsedPinsData(selectedDevice._id);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  function processResponseData(response) {
    if (response.data !== null) {
      if (response.data.layout !== null) {
        setLayout(response.data.layout);
      } else {
        setLayout([]);
      }

      if (response.data.elements !== null) {
        setElements(response.data.elements);
      } else {
        setElements([]);
      }
    } else {
      setLayout([]);
      setElements([]);
    }
  }

  const fetchUsedPinsData = async (deviceId) => {
    try {
      const response = await axios.get(
        `${URL}/virtual-pins/${deviceId}/used-pins`
      );
      setUsedPins(response.data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchDeviceLayout = async (deviceId) => {
    try {
      const response = await axios.get(`${URL}/dashboard/${deviceId}`);
      processResponseData(response);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleChangeDevice = (deviceId) => {
    setUsedPins({});
    dispatch(resetLabelState());
    const newSelectedDevice = findDeviceById(deviceList, deviceId);
    setSelectedDevice(newSelectedDevice);

    fetchUsedPinsData(newSelectedDevice._id);
    setToken(newSelectedDevice.access_token);
    fetchDeviceLayout(deviceId);

    localStorage.setItem("selected_device", JSON.stringify(newSelectedDevice));
  };

  function findDeviceById(deviceList, deviceId) {
    const foundDevice = deviceList?.find((device) => device._id === deviceId);
    return foundDevice || null;
  }

  const { sendData } = useWebSocket(handleData, token, usedPins);
  return (
    <WebSocketProvider sendData={sendData}>
      <Box m="20px">
        {/* HEADER */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Header title="DASHBOARD" subtitle="Welcome to your dashboard" />
        </Box>

        <Box my={1} />
        <Box maxWidth="100%" overflow="hidden">
          {isLoading ? (
            <CircularProgress />
          ) : deviceList && deviceList.length > 0 && selectedDevice ? (
            <DragDrop
              layout={layout}
              setLayout={setLayout}
              elements={elements}
              setElements={setElements}
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
    </WebSocketProvider>
  );
};

export default Dashboard;
