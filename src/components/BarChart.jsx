import { useState } from "react";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import CustomBar from "./CustomBar";
import { BarActive, BarRedActive } from "../assets/icons";
import CustomTooltip from "./CustomTooltip";
import CustomTick from "./CustomTick";

const data = [
  { month: "Yan", percent: 25 },
  { month: "Fev", percent: 30 },
  { month: "Mar", percent: 20 },
  { month: "Apr", percent: 35 }, // Kirimda eng yuqori bu oy bo'lishi mumkin
  { month: "May", percent: 28 },
  { month: "Iyun", percent: 32 },
  { month: "Iyul", percent: 26 },
  { month: "Avg", percent: 31 },
  { month: "Sen", percent: 22 },
  { month: "Okt", percent: 27 },
  { month: "Noy", percent: 24 },
  { month: "Dek", percent: 29 },
];

const getMaxIndex = (data) => {
  return data.reduce(
    (maxIdx, item, idx, arr) =>
      item.percent > arr[maxIdx].percent ? idx : maxIdx,
    0
  );
};

const KirimChart = ({ data: chartData, total }) => {
  const newData = data.map((_, index) => ({
    ..._,
    percent: chartData[index]
  }))
  const [activeIndex, setActiveIndex] = useState(getMaxIndex(newData));
  const [hovered, setHovered] = useState(false);
  return (
    <div className="chart-container" style={{ height: 300 }}>
      <h3>Kirim: {total?.toLocaleString()} so'm</h3>
      <p>Oylik hisobotlar</p>
      <ResponsiveContainer>
        <BarChart
          data={newData}
          onMouseMove={() => {
            setHovered(true);
          }}
          onMouseLeave={() => {
            setHovered(false);
          }}
        >
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={(props) => (
              <CustomTick {...props} activeIndex={activeIndex} />
            )}
          />
          <Tooltip
            content={<CustomTooltip icon={<BarActive />} />}
            cursor={false}
          />
          <Bar
            dataKey="percent"
            radius={[8, 8, 8, 8]}
            className="custom-bar"
            shape={(props) => (
              <CustomBar
                {...props}
                isActive={activeIndex === props.index}
                shadow="drop-shadow(0px 8px 12px rgba(135, 145, 233, 0.3))"
                fill={
                  activeIndex === props.index
                    ? "#218838"
                    : hovered
                      ? "#3f8cff0d"
                      : "#218838"
                }
              // fill="#218838"
              />
            )}
            onMouseOver={(_, index) => setActiveIndex(index)}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const ChiqimChart = ({ data: chartData, total }) => {
  const newData = data.map((_, index) => ({
    ..._,
    percent: chartData[index]
  }))
  const [activeIndex, setActiveIndex] = useState(getMaxIndex(newData));
  const [hovered, setHovered] = useState(false);
  return (
    <div className="chart-container" style={{ height: 300 }}>
      <h3>Chiqim: {total?.toLocaleString()} so'm</h3>
      <p>Oylik hisobotlar</p>
      <ResponsiveContainer>
        <BarChart
          data={newData}
          onMouseMove={() => {
            setHovered(true);
          }}
          onMouseLeave={() => {
            setHovered(false);
          }}
        >
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={(props) => (
              <CustomTick {...props} activeIndex={activeIndex} />
            )}
          />
          <Tooltip
            content={<CustomTooltip icon={<BarRedActive />} />}
            cursor={false}
          />
          <Bar
            radius={[8, 8, 8, 8]}
            dataKey="percent"
            shape={(props) => (
              <CustomBar
                {...props}
                isActive={activeIndex === props.index}
                shadow="drop-shadow(0px 8px 12px rgba(135, 145, 233, 0.3))"
                fill={
                  activeIndex === props.index
                    ? "#FF0004"
                    : hovered
                      ? "#3f8cff0d"
                      : "#FF0004"
                }
              // fill="#FF0004"
              />
            )}
            onMouseOver={(_, index) => setActiveIndex(index)}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export { KirimChart, ChiqimChart };
