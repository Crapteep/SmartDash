import React from "react";
import { makeStyles } from "@mui/styles";
import Card from "@mui/material/Card";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import { colors, useTheme } from "@mui/material";
import { tokens } from "../theme";

const useStyles = makeStyles({
  root: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    display: "flex",
    alignItems: "center",
    padding: "0.5rem",
    flexShrink: 0, // Prevent the header from shrinking
  },
  spacer: {
    flexGrow: 1,
  },
  body: {
    padding: "0.5rem",
    flexGrow: 1,
  },
});

const widgetNames = {
  a: "Line Chart",
  b: "Area Chart",
  c: "Bar Chart",
  d: "Scatter Chart",
  e: "Outlined Button",
  f: "Contained Button",
};

export default function Widget({ id, onRemoveItem, component: Item, isEditMode }) {
  const classes = useStyles();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Card
      className={classes.root}
      style={{ background: colors.primary[400] }}
    >
      <div className={classes.header}>
        <div style={{ flexGrow: 1, overflow: "hidden" }}>
          <Typography variant="h6" gutterBottom noWrap>
            {widgetNames[id]}
          </Typography>
        </div>
        {isEditMode ? (
          <IconButton aria-label="delete" onClick={() => onRemoveItem(id)}>
          <CloseIcon fontSize="small" />
        </IconButton>
        ): null}
        
      </div>
      <div className={classes.body}>
        <Item />
      </div>
    </Card>
  );
}
