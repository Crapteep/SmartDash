import React, { useEffect, useState, useRef } from "react";
import Tooltip from "@mui/material/Tooltip";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import { getContrastColor } from "../../../functions/mathFunctions";
import { useSelector } from "react-redux";

const unitOptions = [
  { value: "", label: "None" },
  { value: "mm", label: "mm" },
  { value: "cm", label: "cm" },
  { value: "m", label: "m" },
  { value: "m^2", label: "m<sup>2" },
  { value: "m/s", label: "m/s" },
  { value: "m/s^2", label: "m/s&sup2;" },
  { value: "km", label: "km" },
  { value: "km^2", label: "km<sup>2" },
  { value: "km/s", label: "km/s" },
  { value: "km/s^2", label: "km/s&sup2;" },
  { value: "g", label: "g" },
  { value: "kg", label: "kg" },
  { value: "t", label: "t" },
  { value: "s", label: "s" },
  { value: "min", label: "min" },
  { value: "h", label: "h" },
  { value: "day", label: "day" },
  { value: "year", label: "year" },
  { value: "Hz", label: "Hz" },
  { value: "kHz", label: "kHz" },
  { value: "MHz", label: "MHz" },
  { value: "GHz", label: "GHz" },
  { value: "W", label: "W" },
  { value: "kW", label: "kW" },
  { value: "MW", label: "MW" },
  { value: "GW", label: "GW" },
  { value: "°C", label: "°C" },
  { value: "°F", label: "°F" },
  { value: "K", label: "K" },
  { value: "Pa", label: "Pa" },
  { value: "kPa", label: "kPa" },
  { value: "MPa", label: "MPa" },
  { value: "bar", label: "bar" },
  { value: "atm", label: "atm" },
  { value: "mol", label: "mol" },
  { value: "kmol", label: "kmol" },
  { value: "L", label: "L" },
  { value: "m³", label: "m³" },
  { value: "cm³", label: "cm³" },
  { value: "mm³", label: "mm³" },
  { value: "szt", label: "szt." },
];

function getLabelByValue(value) {
  if (value === "") return "";
  const option = unitOptions.find((option) => option.value === value);
  return option ? option.label : "";
}

const unitStyle = {
  fontSize: "0.5em",
};

function UnitDisplay({ value, unit }) {
  const unitLabel = getLabelByValue(unit);
  const formattedUnit = unitLabel.replace(/\^(\d+)/g, "<sup>$1</sup>");
  return (
    <>
      <span>{value} </span>
      <span
        style={unitStyle}
        dangerouslySetInnerHTML={{ __html: formattedUnit }}
      />
    </>
  );
}

export default function MyLabel({
  label_position,
  min_level,
  max_level,
  level_position,
  show_level,
  level_color,
  virtual_pins,
  unit,
  uppercase = false,
}) {
  const [pin, setPin] = useState(virtual_pins?.[0]?.pin || null);
  const [value, setValue] = useState(virtual_pins?.[0]?.value || 0);
  const [fontSize, setFontSize] = useState("3em");
  const containerRef = useRef(null);

  const calculateFillPercentage = () => {
    const range = max_level - min_level;
    const normalizedValue =
      Math.min(Math.max(value, min_level), max_level) - min_level;
    return `${(normalizedValue / range) * 100}%`;
  };

  

  const alignStyle = {
    left: "flex-start",
    center: "center",
    right: "flex-end",
  };

  const marginStyle = {
    left: "20px",
    center: "0",
    right: "20px",
  };

  const paddingStyle = {
    left: "0",
    center: "0",
    right: "0",
  };

  const labelData = useSelector((state) => state.label.pinData);

  useEffect(() => {
    if (virtual_pins && virtual_pins.length > 0) {
      const firstPin = virtual_pins[0];
      if (firstPin.pin !== undefined && firstPin.pin !== "") {
        setPin(firstPin.pin);
        setValue(firstPin.value);
      }
    }
  }, [virtual_pins]);

  useEffect(() => {
    if (labelData?.pinNumber === pin) {
      setValue(labelData.value);
    }
  }, [labelData]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      const resizeObserver = new ResizeObserver(() => {
        const { offsetHeight } = container;
        setFontSize(`${Math.sqrt(offsetHeight) * 5}px`);
      });

      resizeObserver.observe(container);

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, []);

  const labelStyle = {
    fontSize: fontSize,
    textTransform: uppercase ? "uppercase" : "none",
    color:
      show_level === false
        ? "primary"
        : getContrastColor(level_color || "#0c66ee"),
    position: "relative",
    zIndex: 1,
  };

  return (
    <div
      ref={containerRef}
      style={{
        display: "flex",
        justifyContent: alignStyle[label_position],
        alignItems: "center",
        height: "100%",
        width: "100%",
        position: "relative",
      }}
    >
      {show_level && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 0,
          }}
        >
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width:
                level_position === "horizontal"
                  ? calculateFillPercentage()
                  : "100%",
              height:
                level_position === "vertical"
                  ? calculateFillPercentage()
                  : "100%",
              backgroundColor: level_color || "#5353ec",
              zIndex: 1,
            }}
          ></div>
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: level_position === "horizontal" ? "100%" : "100%",
              height: level_position === "vertical" ? "100%" : "100%",
              backgroundColor: "#DFDDDD",
              zIndex: 0,
            }}
          ></div>
        </div>
      )}

      <Tooltip title={value} enterDelay={500}>
        <FormControl
          component="fieldset"
          style={{
            marginLeft: marginStyle[label_position],
            marginRight: marginStyle[label_position],
            paddingLeft: paddingStyle[label_position],
            paddingRight: paddingStyle[label_position],
          }}
        >
          <FormLabel style={labelStyle} component="legend">
            <div>
              <UnitDisplay value={value} unit={unit} />
            </div>
          </FormLabel>
        </FormControl>
      </Tooltip>
    </div>
  );
}
