import React from "react";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import { useDispatch } from 'react-redux';
import { sendData } from '../../redux/actions/buttonActions'


export default function MyButton({ variant, text, backgroundColor, pin, uppercase=false }) {

  
const containerStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100%",
};



const buttonStyle = {
  height: "99%",
  marginBottom: "20px",
  marginLeft: "10px",
  marginRight: "10px",
  backgroundColor: backgroundColor
};

const dispatch = useDispatch();


const handleButtonClick = () => {
  const dataToSend = {
    topic: 'write',
    pin: pin,
    data: 1
  };
  console.log('klikam w przycisk oraz dane:', dataToSend)
  dispatch(sendData(dataToSend));
};


  return (
    <div style={containerStyle}>
      <Tooltip title={text} enterDelay={500}>
      <Button variant={variant} style={buttonStyle} onClick={handleButtonClick} fullWidth>
        <Typography variant="h6" gutterBottom noWrap style={{ textTransform: uppercase ? 'uppercase' : 'none' }}>
         {text}
        </Typography>
      </Button>
      </Tooltip>
    </div>
  );
}