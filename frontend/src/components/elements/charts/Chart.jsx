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
  const [zoomState, setZoomState] = useState();
  const [data, setData] = useState(
    virtual_pins &&
      virtual_pins.length > 0 &&
      virtual_pins[0] &&
      virtual_pins[0].archive_data &&
      virtual_pins[0].archive_data.length > 1
      ? virtual_pins[0].archive_data
      : null
  );

  const initialChartType = chart_type ? chart_type.split(":")[0] : "line";
  const initialInterpolationType = chart_type
    ? chart_type.split(":")[1]
    : "linear";

  const URL = import.meta.env.VITE_APP_API_URL;

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

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

  useEffect(() => {
    const storedZoomState = JSON.parse(localStorage.getItem("zoomState"));
    if (storedZoomState) {
      if (storedZoomState.endIndex > data?.length) {
        const newZoomState = {
          startIndex: 0,
          endIndex: data?.length - 1,
        };
        setZoomState(newZoomState);
      } else {
        setZoomState(storedZoomState);
      }
    }
  }, []);

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
      console.log(matchedPin, isNewDataAvailable);
      if (matchedPin && isNewDataAvailable) {
        addDataPoint(matchedPin);
      }
    }
  }, [pinsData]);

  const handleBrushChange = (newZoomState) => {
    localStorage.setItem("zoomState", JSON.stringify(newZoomState));
    setZoomState(newZoomState);
    // setCurrentZoomState(newZoomState);
    // localStorage.setItem("zoomState", JSON.stringify(newZoomState));
    // setZoomState(newZoomState);
  };

  const addDataPoint = (dataPoint) => {
    if (!Array.isArray(data)) {
      setData([dataPoint]);
    } else {
      setData([...data, dataPoint]);
    }

    // let newStartIndex = zoomState.startIndex;
    // if (zoomState.startIndex !== 0) {
    //   newStartIndex += 1;
    // }

    // const newState = {
    //   startIndex: newStartIndex,
    //   endIndex: zoomState.endIndex + 1,
    // };
    // localStorage.setItem("zoomState", JSON.stringify(newState));
    // setZoomState(newState);
  };

  if (isEditMode) {
    return null;
  }

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
                dataKey="index"
                height={20}
                // startIndex={
                //   zoomState &&
                //   zoomState.startIndex !== undefined &&
                //   zoomState.startIndex < data?.length
                //     ? zoomState.startIndex
                //     : NaN
                // }
                // endIndex={
                //   zoomState &&
                //   zoomState.endIndex !== undefined &&
                //   zoomState.endIndex < data?.length &&
                //   zoomState.endIndex >= zoomState.startIndex
                //     ? zoomState.endIndex
                //     : NaN
                // }
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
                dataKey="index"
                height={20}
                // startIndex={
                //   zoomState &&
                //   zoomState.startIndex !== undefined &&
                //   zoomState.startIndex < data?.length
                //     ? zoomState.startIndex
                //     : NaN
                // }
                // endIndex={
                //   zoomState &&
                //   zoomState.endIndex !== undefined &&
                //   zoomState.endIndex < data?.length &&
                //   zoomState.endIndex >= zoomState.startIndex
                //     ? zoomState.endIndex
                //     : NaN
                // }
                onChange={(e) => handleBrushChange(e)}
              />
            </BarChart>
          )}

          {initialChartType === "area" && (
            <AreaChart
              data={data && data.length > 0 ? data : []}
              margin={{ top: 10, right: 10, left: 20, bottom: 20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                dataKey="timestamp"
                tickFormatter={formatXAxis}
                type="number"
                domain={[Infinity, -Infinity]}
                label={{ value: xAxisLabel, position: "bottom", offset: 0 }}
              />
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
                dataKey="index"
                height={20}
                // startIndex={
                //   zoomState &&
                //   zoomState.startIndex !== undefined &&
                //   zoomState.startIndex < data?.length
                //     ? zoomState.startIndex
                //     : NaN
                // }
                // endIndex={
                //   zoomState &&
                //   zoomState.endIndex !== undefined &&
                //   zoomState.endIndex < data?.length &&
                //   zoomState.endIndex >= zoomState.startIndex
                //     ? zoomState.endIndex
                //     : NaN
                // }
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
                dataKey="index"
                height={20}
                // startIndex={
                //   zoomState &&
                //   zoomState.startIndex !== undefined &&
                //   zoomState.startIndex < data?.length
                //     ? zoomState.startIndex
                //     : NaN
                // }
                // endIndex={
                //   zoomState &&
                //   zoomState.endIndex !== undefined &&
                //   zoomState.endIndex < data?.length &&
                //   zoomState.endIndex >= zoomState.startIndex
                //     ? zoomState.endIndex
                //     : NaN
                // }
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
