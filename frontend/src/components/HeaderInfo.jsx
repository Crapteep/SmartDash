// DevicesHeader.js

import React from "react";
import { Box } from "@mui/material";
import Header from "./Header";

const DevicesHeader = ({ title, subtitle, children }) => {
  return (
    <Box display="flex" alignItems="center" justifyContent="space-between">
      <Header title={title} subtitle={subtitle} />

      {children}
    </Box>
  );
};

export default DevicesHeader;
