import React from 'react';


import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button
} from "@mui/material";

import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

const InfoDialog = ({ open, onClose, title, message, closeDialog, isSuccess }) => {

  const handleOkButton = () => {
    onClose();
    if (isSuccess) {
      closeDialog();
    }
    
  }
  return (
    <Dialog open={open} onClose={handleOkButton}>
      <DialogTitle className="title-container">
        {title}
        <CheckCircleOutlineIcon fontSize="small" className="icon" />
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1">{message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleOkButton} color="primary">
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InfoDialog;
