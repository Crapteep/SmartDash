import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { resetNewDataFlag } from "../../../redux/actions/chartActions";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
} from "recharts";

import { Grid, useTheme } from "@mui/material";
import TimeRangeButtons from "./TimeRangeButtons";
import { tokens } from "../../../theme";
import axios from "axios";
import moment from "moment";
import { brighterColor } from "../../../functions/mathFunctions";

const timeRanges = [
  { label: "1m", value: "1m" },
  { label: "30m", value: "30m" },
  { label: "1h", value: "1h" },
  { label: "3h", value: "3h" },
  { label: "12h", value: "12h" },
  { label: "1d", value: "1d" },
  { label: "3d", value: "3d" },
  { label: "7d", value: "7d" },
];

const timeRangesInSeconds = {
  "1m": 60,
  "30m": 1800,
  "1h": 3600,
  "3h": 10800,
  "12h": 43200,
  "1d": 86400,
  "3d": 259200,
  "7d": 604800,
};

function MyChart({
  show_legend,
  xAxisLabel,
  yAxisLabel,
  chart_type,
  virtual_pins = [],
  selected_range = "1d",
  isEditMode,
  _id,
  device_id,
  handleChange,
  xunit,
  yunit,
}) {
  const pinsData = useSelector((state) => state.chart.pinsData);
  const hasNewData = useSelector((state) => state.chart.hasNewData);
  const [zoomState, setZoomState] = useState(() => {
    const storedZoomState = JSON.parse(
      localStorage.getItem(`zoomState_${_id}`)
    );
    return storedZoomState || { startIndex: NaN, endIndex: NaN };
  });
  const [data, setData] = useState(
    virtual_pins &&
      virtual_pins.length > 0 &&
      virtual_pins[0] &&
      virtual_pins[0].archive_data &&
      virtual_pins[0].archive_data.length > 1
      ? virtual_pins[0].archive_data
      : []
  );

  const initialChartType = chart_type ? chart_type.split(":")[0] : "line";
  const initialInterpolationType = chart_type
    ? chart_type.split(":")[1]
    : "linear";

  const URL = import.meta.env.VITE_APP_API_URL;

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  useEffect(() => {
    const adjustedZoomState = {
      startIndex: Math.max(0, Math.min(zoomState.startIndex, data?.length - 1)),
      endIndex: Math.max(0, Math.min(zoomState.endIndex, data?.length - 1)),
    };

    setZoomState(adjustedZoomState);
  }, [data]);

  const fetchArchivePinData = (timeAgo, pinName) => {
    axios
      .get(
        `${URL}/archive-data/${device_id}?pin=${pinName}&time_ago=${timeAgo}`
      )
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        if (error.response && error.response.status === 422) {
          pass;
        } else if (error.response.status === 401) {
          pass;
        }
      });
  };

  const updateSelectedRange = (selectedRange) => {
    const updateData = {
      field: "selected_range",
      value: selectedRange,
    };
    axios
      .patch(`${URL}/elements/${_id}`, updateData)
      .then((response) => {
        pass;
      })
      .catch((error) => {
        if (error.response && error.response.status === 422) {
          pass;
        }
      });
  };

  function removeFirstIfOlder(selected_range, data) {
    let removed = false;
    if (data?.length === 0) return { data, removed };

    const rangeInSeconds = timeRangesInSeconds[selected_range];
    const currentTime = Math.floor(Date.now() / 1000);
    if (currentTime - data[0].timestamp > rangeInSeconds) {
      data.shift();
      removed = true;
    }

    return { data, removed };
  }

  useEffect(() => {
    if (virtual_pins && virtual_pins.length > 0) {
      setData(virtual_pins[0]?.archive_data);
    } else {
      setData([]);
    }
  }, [virtual_pins]);

  useEffect(() => {
    if (
      pinsData &&
      typeof pinsData === "object" &&
      Object.keys(pinsData).length > 0 &&
      virtual_pins.length > 0 &&
      virtual_pins[0].pin
    ) {
      const matchedPin = pinsData[virtual_pins[0].pin];
      const isNewDataAvailable = hasNewData && hasNewData[virtual_pins[0].pin];
      if (matchedPin && isNewDataAvailable) {
        addDataPoint(matchedPin);
      }
    }
  }, [pinsData]);

  const handleBrushChange = (newZoomState) => {
    if (
      newZoomState &&
      newZoomState.startIndex != null &&
      newZoomState.endIndex != null
    ) {
      localStorage.setItem(`zoomState_${_id}`, JSON.stringify(newZoomState));
      setZoomState(newZoomState);
    }
  };

  const addDataPoint = (dataPoint) => {
    const updatedData = [...data, dataPoint];
    const result = removeFirstIfOlder(selected_range, updatedData);

    let newStartIndex = zoomState.startIndex;
    let newEndIndex = zoomState.endIndex;

    if (!result.removed) {
      newEndIndex += 1;
      if (zoomState.startIndex !== 0) {
        newStartIndex += 1;
      }
    }

    newStartIndex = Math.max(
      0,
      Math.min(newStartIndex, result.data.length - 1)
    );
    newEndIndex = Math.max(0, Math.min(newEndIndex, result.data.length - 1));

    const newState = { startIndex: newStartIndex, endIndex: newEndIndex };
    localStorage.setItem(`zoomState_${_id}`, JSON.stringify(newState));
    setZoomState(newState);
    setData(result.data);
  };

  if (isEditMode) {
    return null;
  }

  const handleTimeRangeChange = (timeAgo) => {
    if (virtual_pins && virtual_pins.length > 0) {
      fetchArchivePinData(timeAgo, virtual_pins[0].pin);

      handleBrushChange({ startIndex: NaN, endIndex: NaN });
      updateSelectedRange(timeAgo);
      handleChange("selected_range", timeAgo);
    }
  };

  const formatXAxis = (tickItem) => {
    const date = moment.unix(tickItem);
    return date.format("YYYY-MM-DD HH:mm:ss");
  };

  return (
    <Grid container spacing={0} style={{ height: "100%" }}>
      <Grid item xs={12} style={{ display: "flex", flexDirection: "column" }}>
        <TimeRangeButtons
          timeRanges={timeRanges}
          handleTimeRangeChange={handleTimeRangeChange}
          timeRange={selected_range}
        />

        <ResponsiveContainer width="100%" height="100%">
          {initialChartType === "line" && (
            <LineChart
              data={data && data.length > 0 ? data : []}
              margin={{
                top: 10,
                right: 10,
                left: 20,
                bottom: show_legend ? 5 : 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={formatXAxis}
                type="number"
                unit={xunit}
                domain={[Infinity, -Infinity]}
                label={{ value: xAxisLabel, position: "bottom", offset: 0 }}
              />
              <YAxis
                label={{
                  value: yAxisLabel,
                  angle: -90,
                  position: "left",
                  offset: 10,
                }}
                unit={yunit}
              />
              <Tooltip
                labelFormatter={(value) => {
                  const date = new Date(value * 1000);
                  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
                }}
              />

              {show_legend && <Legend />}

              <Line
                type={initialInterpolationType}
                stroke={virtual_pins[0]?.color}
                dataKey="value"
                dot={false}
                unit={yunit}
                isAnimationActive={false}
                name={virtual_pins[0]?.legend_name}
              />
              <Brush
                data={data}
                dataKey="index"
                ariaLabel="Brush"
                alwaysShowText={false}
                height={20}
                startIndex={zoomState.startIndex}
                endIndex={zoomState.endIndex}
                onChange={(e) => handleBrushChange(e)}
              />
            </LineChart>
          )}

          {initialChartType === "bar" && (
            <BarChart
              data={data && data.length > 0 ? data : []}
              margin={{ top: 10, right: 10, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={formatXAxis}
                type="number"
                unit={xunit}
                domain={[Infinity, -Infinity]}
                label={{ value: xAxisLabel, position: "bottom", offset: 0 }}
              />
              <YAxis
                label={{
                  value: yAxisLabel,
                  angle: -90,
                  position: "left",
                  offset: 10,
                }}
                unit={yunit}
              />
              <Tooltip
                labelFormatter={(value) => {
                  const date = new Date(value * 1000);
                  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
                }}
              />
              {show_legend && <Legend />}
              <Bar
                layout={initialInterpolationType}
                dataKey="value"
                stroke={virtual_pins[0]?.color}
                fill={
                  virtual_pins[0]?.color
                    ? brighterColor(virtual_pins[0]?.color, 0.4)
                    : "defaultColor"
                }
                unit={yunit}
                isAnimationActive={false}
                name={virtual_pins[0]?.legend_name}
              />
              <Brush
                dataKey="timestamp"
                height={20}
                startIndex={zoomState.startIndex}
                endIndex={zoomState.endIndex}
                onChange={(e) => handleBrushChange(e)}
              />
            </BarChart>
          )}

          {initialChartType === "area" && (
            <AreaChart
              data={data && data.length > 0 ? data : []}
              margin={{ top: 10, right: 10, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={formatXAxis}
                type="number"
                unit={xunit}
                domain={[Infinity, -Infinity]}
                label={{ value: xAxisLabel, position: "bottom", offset: 0 }}
              />

              <YAxis
                label={{
                  value: yAxisLabel,
                  angle: -90,
                  position: "left",
                  offset: 10,
                }}
                unit={yunit}
              />
              <Tooltip
                labelFormatter={(value) => {
                  const date = new Date(value * 1000);
                  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
                }}
              />
              {show_legend && <Legend />}
              <Area
                type={initialInterpolationType}
                dataKey="value"
                stroke={virtual_pins[0]?.color}
                fill={
                  virtual_pins[0]?.color
                    ? brighterColor(virtual_pins[0]?.color, 0.4)
                    : "defaultColor"
                }
                unit={yunit}
                isAnimationActive={false}
                name={virtual_pins[0]?.legend_name}
              />
              <Brush
                dataKey="timestamp"
                height={20}
                startIndex={zoomState.startIndex}
                endIndex={zoomState.endIndex}
                onChange={(e) => handleBrushChange(e)}
              />
            </AreaChart>
          )}

          {initialChartType === "scatter" && (
            <ScatterChart
              data={data && data.length > 0 ? data : []}
              margin={{ top: 10, right: 10, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={formatXAxis}
                type="number"
                unit={xunit}
                domain={[Infinity, -Infinity]}
                label={{ value: xAxisLabel, position: "bottom", offset: 0 }}
              />
              <YAxis
                label={{
                  value: yAxisLabel,
                  angle: -90,
                  position: "left",
                  offset: 10,
                }}
                unit={yunit}
              />
              <Tooltip
                labelFormatter={(value) => {
                  const date = new Date(value * 1000);
                  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
                }}
              />
              {show_legend && <Legend />}
              <Scatter
                shape={initialInterpolationType}
                dataKey="value"
                stroke={virtual_pins[0]?.color}
                fill={
                  virtual_pins[0]?.color
                    ? brighterColor(virtual_pins[0]?.color, 0.4)
                    : "defaultColor"
                }
                unit={yunit}
                isAnimationActive={false}
                name={virtual_pins[0]?.legend_name}
              />
              <Brush
                dataKey="timestamp"
                height={20}
                startIndex={zoomState.startIndex}
                endIndex={zoomState.endIndex}
                onChange={(e) => handleBrushChange(e)}
              />
            </ScatterChart>
          )}
        </ResponsiveContainer>
      </Grid>
    </Grid>
  );
}

export default MyChart;
