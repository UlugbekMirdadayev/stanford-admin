const CustomTooltip = ({ active, payload, coordinate, icon }) => {
  if (active && payload?.length) {
    const { x, y } = coordinate; // koordinatalar: x - bar markazi, y - bar tepa nuqtasi

    return (
      <div
        style={{
          left: x,
          top: y - 40,
        }}
        className="tooltip-custome"
      >
        <ul>
          <li>
            {icon}
            <span>{payload[0].value}%</span>
          </li>
        </ul>
      </div>
    );
  }

  return null;
};

export default CustomTooltip;
