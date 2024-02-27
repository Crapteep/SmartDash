import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { resetNewDataFlag } from "../redux/actions/chartActions";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";


function Chart(props) {
  const { showLegend, xAxisLabel, yAxisLabel, pins, isEditMode } = props;
  const dispatch = useDispatch();
  const pinsData = useSelector((state) => state.chart.pinsData);
  const hasNewData = useSelector((state) => state.chart.hasNewData);
  const [pinsSettings, setPinsSettings] = useState([]);
  const [xAxisDomain, setXAxisDomain] = useState([0, 50]);

  useEffect(() => {
    const initialPinsSettings = Object.keys(pins).map((pinKey) => ({
      name: pinKey,
      color: pins[pinKey].color,
      data: pins[pinKey].data,
      legendName: pins[pinKey].legendName,
      time: 0,
    }));
    setPinsSettings(initialPinsSettings);
  }, [pins]);

  useEffect(() => {
    Object.keys(pins).forEach((pinKey) => {
      const isNewDataAvailable = hasNewData && hasNewData[pinKey];

      if (isNewDataAvailable) {
        const updatedData = pinsData[pinKey].data;
        const lastTime =
          pinsSettings.find((pin) => pin.name === pinKey)?.time || 0;
        console.log("lasttime;", lastTime);
        const interval = pinsData[pinKey].interval;
        const newTime = lastTime + interval;

        let updatedPinsSettings = pinsSettings.map((pin) => {
          if (pin.name === pinKey) {
            let newData = [
              ...pin.data,
              {
                [pin.legendName]: updatedData,
                time: newTime,
              },
            ];

            return {
              ...pin,
              data: newData,
              time: newTime,
            };
          }
          return pin;
        });

        setPinsSettings(updatedPinsSettings);
        dispatch(resetNewDataFlag(pinKey));
        console.log(pinsSettings);
      }
    });
  }, [pinsData]);

  const updateXAxisDomain = () => {
    let minStartTime = Infinity;
    let maxEndTime = -Infinity;
  
    pinsSettings.forEach(pin => {
      const pinStartTime = pin.data.length > 0 ? pin.data[0].time : Infinity;
      const pinEndTime = pin.data.length > 0 ? pin.data[pin.data.length - 1].time : -Infinity;
  
      minStartTime = Math.min(minStartTime, pinStartTime);
      maxEndTime = Math.max(maxEndTime, pinEndTime);
    });
  
    const threshold = 50;
  
    if (maxEndTime - minStartTime > threshold) {
      const updatedPinsSettings = pinsSettings.map(pin => {
        const newData = pin.data.filter(d => d.time >= maxEndTime - threshold);
        return { ...pin, data: newData };
      });
      setPinsSettings(updatedPinsSettings);
    }
  
    setXAxisDomain([minStartTime, maxEndTime]);
  };
  
  useEffect(() => {
    updateXAxisDomain();
  }, [pinsSettings]);


  if (isEditMode) {
    return null;
  }
  return (
    <ResponsiveContainer width="99%" height="99%">
      <LineChart
        data={pinsSettings}
        margin={{
          top: 10,
          right: 10,
          left: 20,
          bottom: showLegend ? 5 : 20,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="time"
          type="number"
          domain={xAxisDomain}
          label={{ value: xAxisLabel, position: "bottom", offset: 0 }}
        />
        <YAxis
          label={{
            value: yAxisLabel,
            angle: -90,
            position: "left",
            offset: 10,
          }}
        />
        <Tooltip />
        {showLegend && <Legend />}
        {pinsSettings.map((pin, index) => {
          if (pin.data.length > 0) {
            return (
              <Line
                key={index}
                data={pin.data}
                type="monotone"
                stroke={pin.color}
                dataKey={pin.legendName}
                dot={false}
                isAnimationActive={false}
              />
            );
          } else {
            return null;
          }
        })}
      </LineChart>
    </ResponsiveContainer>
  );
}

export default Chart;
