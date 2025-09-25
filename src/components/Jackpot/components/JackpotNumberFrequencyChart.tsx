// src/components/Jackpot/components/JackpotNumberFrequencyChart.tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface NumberFrequency {
  number: number;
  count: number;
}

interface Props {
  hotNumbers: NumberFrequency[];
  coldNumbers: NumberFrequency[];
}

const JackpotNumberFrequencyChart: React.FC<Props> = ({ hotNumbers, coldNumbers }) => {
  const data = [
    ...hotNumbers.map(h => ({ number: h.number, count: h.count, type: 'Hot' })),
    ...coldNumbers.map(c => ({ number: c.number, count: c.count, type: 'Cold' })),
  ];

  return (
    <div className="w-full h-80">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="number" />
          <YAxis allowDecimals={false} />
          <Tooltip formatter={(value, _, { payload }) => [`${value} lần`, payload.type]} />
          <Bar
            dataKey="count"
            barSize={20}
            shape={(props: any) => {
              const { x, y, width, height, payload } = props;
              const fill = payload.type === 'Hot' ? '#ef4444' : '#3b82f6';
              return (
                <rect
                  x={x}
                  y={y}
                  width={width}
                  height={height}
                  fill={fill}
                  rx={4}
                  ry={4}
                />
              );
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default JackpotNumberFrequencyChart;
