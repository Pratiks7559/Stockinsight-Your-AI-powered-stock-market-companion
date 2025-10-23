// // components/VolumeChart.jsx
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// const VolumeChart = ({ selectedStock, timeRange }) => {
//   // Generate volume data
//   const generateVolumeData = () => {
//     const points = timeRange === '1D' ? 24 : 
//                   timeRange === '5D' ? 40 : 
//                   timeRange === '1M' ? 30 : 
//                   timeRange === '6M' ? 26 : 52;
    
//     return Array.from({ length: points }, (_, i) => {
//       const baseVolume = 1000000 + Math.random() * 9000000;
//       const priceChange = Math.random() > 0.5 ? 1 : -1;
      
//       const date = new Date();
//       if (timeRange === '1D') {
//         date.setHours(date.getHours() - (points - i));
//       } else {
//         date.setDate(date.getDate() - (points - i));
//       }
      
//       return {
//         name: timeRange === '1D' ? date.toLocaleTimeString() : date.toLocaleDateString(),
//         volume: baseVolume,
//         color: priceChange > 0 ? '#10b981' : '#ef4444'
//       };
//     });
//   };

//   const data = generateVolumeData();

//   return (
//     <div className="bg-slate-800 rounded-xl shadow-lg p-4 md:p-6">
//       <h2 className="text-xl font-semibold mb-4">Volume</h2>
      
//       <div className="h-40">
//         <ResponsiveContainer width="100%" height="100%">
//           <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
//             <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
//             <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} />
//             <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
//             <Tooltip 
//               formatter={(value) => [`${(value / 1000000).toFixed(2)}M`, 'Volume']}
//               contentStyle={{ 
//                 backgroundColor: '#1e293b', 
//                 border: '1px solid #334155',
//                 borderRadius: '0.5rem'
//               }}
//             />
//             <Bar dataKey="volume" fill="#8884d8">
//               {data.map((entry, index) => (
//                 <rect 
//                   key={`bar-${index}`} 
//                   fill={entry.color} 
//                 />
//               ))}
//             </Bar>
//           </BarChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// };

// export default VolumeChart;
// frontend/components/VolumeChart.jsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const VolumeChart = ({ data, height = 150 }) => {
  const chartData = data.map(item => ({
    ...item,
    volumeColor: item.c >= item.o ? '#10B981' : '#EF4444'
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData}>
        <XAxis 
          dataKey="t" 
          tick={false}
          axisLine={false}
        />
        <YAxis 
          orientation="right"
          stroke="#6B7280"
        />
        <Tooltip
          contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
          labelFormatter={(value) => new Date(value).toLocaleDateString()}
          formatter={(value) => [value.toLocaleString(), 'Volume']}
        />
        <Bar 
          dataKey="v" 
          fill="#8884d8"
          shape={(props) => {
            const { fill, x, y, width, height, payload } = props;
            return (
              <rect
                x={x}
                y={y}
                width={width}
                height={height}
                fill={payload.volumeColor}
              />
            );
          }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default VolumeChart;