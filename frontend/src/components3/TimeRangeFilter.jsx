// // components/TimeRangeFilter.jsx
// const TimeRangeFilter = ({ timeRange, setTimeRange }) => {
//   const timeRanges = ['1D', '5D', '1M', '6M', '1Y'];

//   return (
//     <div>
//       <label className="block text-sm font-medium text-gray-300 mb-1">Time Range</label>
//       <div className="flex gap-2">
//         {timeRanges.map(range => (
//           <button
//             key={range}
//             onClick={() => setTimeRange(range)}
//             className={`px-3 py-1 rounded-lg ${
//               timeRange === range 
//                 ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white' 
//                 : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
//             }`}
//           >
//             {range}
//           </button>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default TimeRangeFilter;
// frontend/components/TimeRangeFilter.jsx
const TimeRangeFilter = ({ selectedRange, onRangeChange }) => {
  const timeRanges = [
    { value: '1D', label: '1 Day' },
    { value: '5D', label: '5 Days' },
    { value: '1M', label: '1 Month' },
    { value: '6M', label: '6 Months' },
    { value: '1Y', label: '1 Year' }
  ];

  return (
    <div className="bg-slate-800 rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-4">Time Range</h3>
      <div className="grid grid-cols-3 gap-2">
        {timeRanges.map((range) => (
          <button
            key={range.value}
            onClick={() => onRangeChange(range.value)}
            className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              selectedRange === range.value
                ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white'
                : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TimeRangeFilter;