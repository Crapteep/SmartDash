import React from 'react';

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Button
  } from "@mui/material";

  const ConfirmationDialog = ({ open, message, onConfirm, onCancel}) => {
    return (
      <Dialog open={open} onClose={onCancel}>
        <DialogTitle>Delete</DialogTitle>
        <DialogContent>
          <Typography>{message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={onConfirm} color="primary" autoFocus>
            YES
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

export default ConfirmationDialog;