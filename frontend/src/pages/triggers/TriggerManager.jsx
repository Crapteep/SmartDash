import React, { useState, useEffect } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  Typography
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { green, red } from "@mui/material/colors";
import axios from "axios";
import Notification from "../../components/Notification";

const TriggerManager = ({ deviceId }) => {
  const [triggers, setTriggers] = useState([]);
  const [open, setOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [triggerToDelete, setTriggerToDelete] = useState(null);
  const [newTrigger, setNewTrigger] = useState({ pin: "", interval: "" });
  const [notification, setNotification] = useState(null);
  const URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchTriggers();
  }, []);

  const fetchTriggers = async () => {
    try {
      const response = await axios.get(`${URL}/api/v1/triggers/${deviceId}`);
      setTriggers(response.data);
    } catch (error) {
      setTriggers([]);
      showNotification("info", "No triggers available");
    }
  };

  const handleCreateTrigger = async () => {
    try {
      await axios.post(`${URL}/api/v1/triggers/${deviceId}`, newTrigger);
      setOpen(false);
      setNewTrigger({ pin: "", interval: "" });
      fetchTriggers();
      showNotification("success", "Trigger was created");
    } catch (error) {
      if (error.response) {
        if (error.response.status === 404) {
          showNotification("error", "The specified pin does not exist");
        } else if (error.response.status === 422) {
          const errorDetails = error.response.data.detail;
          let errorMessage = "Incorrect data:";
          errorDetails.forEach((detail) => {
            if (detail.loc.includes("interval")) {
              if (detail.type === "type_error.integer") {
                errorMessage += " The interval must be an integer.";
              } else if (detail.type === "value_error.number.not_ge") {
                errorMessage += ` The interval must be greater than or equal to ${detail.ctx.limit_value}.`;
              }
            }
            // Możesz dodać więcej warunków dla innych pól i typów błędów
          });
          showNotification("error", errorMessage);
        } else {
          showNotification(
            "error",
            "An error occurred while creating a trigger"
          );
        }
      } else {
        showNotification("error", "Unable to connect to the server");
      }
    }
  };

  const handleDeleteTrigger = async () => {
    if (!triggerToDelete) return;
    try {
      await axios.delete(`${URL}/api/v1/triggers/${triggerToDelete}`);
      fetchTriggers();
      setDeleteConfirmOpen(false);
      showNotification("success", "Trigger has been removed");
    } catch (error) {
      showNotification("error", "Error while removing trigger");
    }
  };

  const handleToggleTrigger = async (pin, currentState) => {
    try {
      await axios.put(
        `${URL}/api/v1/triggers/${deviceId}/${pin}?new_state=${!currentState}`
      );
      setTriggers((prevTriggers) =>
        prevTriggers.map((trigger) =>
          trigger.pin === pin ? { ...trigger, running: !currentState } : trigger
        )
      );
      showNotification("success", "Trigger state has been changed");
    } catch (error) {
      showNotification("error", "Error when changing trigger state");
    }
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
  };

  const closeNotification = () => {
    setNotification(null);
  };

  return (
    <Box>
      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={() => setOpen(true)}
        sx={{marginLeft: 2}}
      >
        ADD TRIGGER
      </Button>
      <List>
        {triggers.map((trigger) => (
          <ListItem
            key={trigger._id}
            secondaryAction={
              <>
                <Switch
                  checked={trigger.running}
                  onChange={() =>
                    handleToggleTrigger(trigger.pin, trigger.running)
                  }
                  color="primary"
                />
                <IconButton
                  edge="end"
                  onClick={() => {
                    setTriggerToDelete(trigger._id);
                    setDeleteConfirmOpen(true);
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </>
            }
            sx={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <Box
              component="span"
              sx={{
                display: "inline-block",
                width: 12,
                height: 12,
                borderRadius: "50%",
                bgcolor: trigger.running ? green[500] : red[500],
                mr: 2,
              }}
            />
            <ListItemText
              primary={
                <Typography variant="body1">
                  Pin: {trigger.pin} | Code: {trigger.code} | Interval:{" "}
                  {trigger.interval}
                </Typography>
              }
            />
          </ListItem>
        ))}
      </List>

      {/* Dialog do tworzenia nowego triggera */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add new Trigger</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Pin"
            type="text"
            fullWidth
            value={newTrigger.pin}
            onChange={(e) =>
              setNewTrigger({ ...newTrigger, pin: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Interval"
            type="number"
            fullWidth
            value={newTrigger.interval}
            onChange={(e) =>
              setNewTrigger({ ...newTrigger, interval: e.target.value })
            }
            inputProps={{ min: 0.1, step: 0.1 }}
            error={parseFloat(newTrigger.interval) < 0.1}
            helperText={
              parseFloat(newTrigger.interval) < 0.1
                ? "Interval must be greater than or equal to 0.1"
                : ""
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateTrigger}>Create</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog potwierdzający usunięcie triggera */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Confirm deletion</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this trigger?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteTrigger} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Komponent powiadomień */}
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

export default TriggerManager;
