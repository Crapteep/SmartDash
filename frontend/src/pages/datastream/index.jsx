import VirtualPinItem from "../../components/VirtualPinItem";
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  useTheme,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Select,
  MenuItem,
} from "@mui/material";
import Header from "../../components/Header";
import Tooltip from "@mui/material/Tooltip";
import ControlPointIcon from "@mui/icons-material/ControlPoint";
import IconButton from "@mui/material/IconButton";
import DataTable from "../../components/DataTable";
import axios from "axios";
import HeaderInfo from "../../components/Header";
import Notification from "../../components/Notification";
import { tokens } from "../../theme";
import ConfirmationDialog from "../../components/ConfirmDialogForms/ConfirmationDialog";
import { useQueryClient } from "react-query";

const Datastream = ({ deviceId, pinsData }) => {
  const [notification, setNotification] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const URL = import.meta.env.VITE_APP_API_URL;
  const bearerToken = localStorage.getItem("token");
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [deleted, setDeleted] = useState(false);
  const [newRow, setNewRow] = useState({
    name: "",
    pin: "",
    dataType: "",
    value: "",
    legend_name: "",
    color: "",
  });
  const queryClient = useQueryClient();
  const [data, setData] = useState([]);

  useEffect(() => {
    const newData = pinsData.map((item, index) => {
      return { ...item, id: index + 1 };
    });
    setData(newData);
  }, [pinsData]);

  const handleDataChange = (newData) => {
    setData(newData);
  };

  const handleAddNewRow = () => {
    const pinData = {
      name: newRow.name,
      pin: newRow.pin,
      dataType: newRow.dataType,
      color: newRow.color,
      value: newRow.value,
      legend_name: newRow.legend_name,
      device_id: deviceId,
    };
    if (["int", "float"].includes(newRow.dataType)) {
      pinData.min_range =
        newRow.dataType === "int"
          ? parseInt(newRow.min)
          : parseFloat(newRow.min);
      pinData.max_range =
        newRow.dataType === "int"
          ? parseInt(newRow.max)
          : parseFloat(newRow.max);

      pinData.legend_name = newRow.legend_name;
    } else {
      pinData.min = newRow.min;
      pinData.max = newRow.max;
    }
    handleCreateVirtualPin(pinData);
  };

  const handleRowAdd = () => {
    setOpen(true);
  };

  const handleDialogClose = () => {
    setOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRow({
      ...newRow,
      [name]: value,
    });
  };

  const handleDataTypeChange = (e) => {
    const { value } = e.target;
    setNewRow({
      ...newRow,
      dataType: value,
      min: "",
      max: "",
      legend_name: "",
    });
  };

  const handleDeleteButtonClick = () => {
    const deletedIds = data
      .filter((row) => selectedRows.includes(row.id))
      .map((row) => row._id);

    handleConfirm(deletedIds);
  };

  const closeNotification = () => {
    setNotification(null);
  };

  const handleCreateVirtualPin = (pinData) => {
    axios
      .post(`${URL}/virtual-pins/new`, pinData, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${bearerToken}`,
        },
      })
      .then((response) => {
        if (response.data) {
          const newId = Math.max(...data.map((row) => row.id), 0) + 1;
          const newData = [...data, { id: newId, ...pinData }];
          setData(newData);
          setNewRow({
            name: "",
            pin: "",
            dataType: "",
            color: "",
            value: "",
            min: "",
            max: "",
            legend_name: "",
          });
          setOpen(false);
          setNotification({
            type: "success",
            message: "New virtual pin was created successfully!",
          });
          queryClient.invalidateQueries(["device", deviceId]);
        } else {
          setNotification({
            type: "error",
            message: "Error! virtual pin not created ",
          });
          console.error("Failed to create new pin:", response.data);
        }
      })
      .catch((error) => {
        if (error.response.status == 422) {
          setNotification({
            type: "error",
            message: `Virtual pin not created (wrong values)`,
          });
        } else if (error.response.status == 409) {
          setNotification({
            type: "error",
            message: `Virtual pin ${pinData.pin} already exists!`,
          });
        }

        console.error("API call error:", error);
      });
  };

  const handleCancel = () => {
    setShowConfirmDialog(false);
  };

  const handleConfirm = (deletedIds) => {
    axios
      .delete(`${URL}/virtual-pins/${deviceId}/delete-virtual-pins`, {
        data: deletedIds,
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${bearerToken}`,
        },
      })
      .then((response) => {
        queryClient.invalidateQueries(["device", deviceId]);
        setNotification({
          type: "success",
          message: "Selected virtual pin(s) were successfully deleted!",
        });
      })
      .catch((error) => {
        if (error.response && error.response.status === 422) {
          setNotification({
            type: "error",
            message: "Error when deleting the virtual pins (422)",
          });
        } else if (error.response.status === 401) {
          pass;
        } else {
          setNotification({
            type: "error",
            message: `An error occurred during pin removal. Error(${error})`,
          });
        }
      });

    setShowConfirmDialog(false);
  };

  return (
    <Box mx="auto">
      <Box display="flex" justifyContent="flex-end">
        <Button
          variant="contained"
          color="error"
          onClick={handleDeleteButtonClick}
          disabled={!enabled}
          style={{
            fontSize: "0.8rem",
            margin: "0 5px",
            height: "30px",
            width: "40px",
          }}
        >
          Delete
        </Button>
        <Button
          variant="contained"
          color="primary"
          style={{
            fontSize: "0.8rem",
            margin: "0 5px",
            color: colors.grey[100],
            background: colors.primary[400],
            height: "30px",
            width: "40px",
          }}
        >
          Update
        </Button>
        <Button
          onClick={handleRowAdd}
          variant="contained"
          color="primary"
          style={{
            fontSize: "0.8rem",
            margin: "0 5px",
            color: colors.grey[100],
            background: colors.primary[400],
            height: "30px",
            width: "40px",
          }}
        >
          Add
        </Button>
      </Box>
      <Box my={1} />
      <Box height="calc(100vh - 250px)" overflow="auto">
        <DataTable
          data={data}
          onDataChange={handleDataChange}
          handleRowAdd={handleRowAdd}
          setSelectedRows={setSelectedRows}
          setEnabled={setEnabled}
        />
      </Box>
      <Dialog open={open} onClose={handleDialogClose}>
        <DialogTitle>Add New PIN</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            name="name"
            label="Name"
            fullWidth
            value={newRow.name}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            id="pin"
            name="pin"
            label="Pin"
            fullWidth
            value={newRow.pin}
            onChange={handleInputChange}
          />
          <Select
            margin="dense"
            id="dataType"
            name="dataType"
            label="Data Type"
            fullWidth
            value={newRow.dataType}
            onChange={handleDataTypeChange}
          >
            <MenuItem value="int">Integer</MenuItem>
            <MenuItem value="str">String</MenuItem>
            <MenuItem value="float">Float</MenuItem>
          </Select>

          {(newRow.dataType === "int" || newRow.dataType === "float") && (
            <>
              <TextField
                margin="dense"
                id="min"
                name="min"
                label="Min"
                type="number"
                fullWidth
                value={newRow.min}
                onChange={handleInputChange}
              />
              <TextField
                margin="dense"
                id="max"
                name="max"
                label="Max"
                type="number"
                fullWidth
                value={newRow.max}
                onChange={handleInputChange}
              />

              <TextField
                margin="dense"
                id="legend_name"
                name="legend_name"
                label="Legend name"
                type="text"
                fullWidth
                value={newRow.legend_name}
                onChange={handleInputChange}
              />
            </>
          )}

          <TextField
            margin="dense"
            id="value"
            name="value"
            label="Value"
            fullWidth
            value={newRow.value}
            onChange={handleInputChange}
          />

          <TextField
            margin="dense"
            id="color"
            name="color"
            label="Color"
            fullWidth
            value={newRow.color}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleAddNewRow}>Add</Button>
        </DialogActions>
      </Dialog>

      {showConfirmDialog && (
        <ConfirmationDialog
          open={showConfirmDialog}
          message="Are you sure you want to remove selected pins?"
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}

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

export default Datastream;
