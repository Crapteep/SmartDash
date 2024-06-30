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

const TaskManager = ({ tasksData }) => {
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
  const [newTask, setNewTask] = useState({
    name: "",
    description: "",
    type: "",
  });
  const queryClient = useQueryClient();
  const [data, setData] = useState([]);

  useEffect(() => {
    setData(tasksData);
  }, [tasksData]);

  const handleDataChange = (newData) => {
    setData(newData);
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
      .post(`${URL}/api/v1/virtual-pins/new`, pinData, {
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
  return (
    <Box mx="auto">
      {/* Buttons for task management */}
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
      {/* Dialog for adding a new task */}
      <Dialog open={open} onClose={handleDialogClose}>
        <DialogTitle>Add New Task</DialogTitle>
        <DialogContent>
          {/* Input fields for task details */}
          <TextField
            autoFocus
            margin="dense"
            id="name"
            name="name"
            label="Name"
            fullWidth
            value={newTask.name}
            onChange={handleInputChange}
          />
          {/* Add more input fields as needed */}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleAddNewTask}>Add</Button>
        </DialogActions>
      </Dialog>

      {showConfirmDialog && (
        <ConfirmationDialog
          open={showConfirmDialog}
          message="Are you sure you want to remove selected tasks?"
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

export default TaskManager;
