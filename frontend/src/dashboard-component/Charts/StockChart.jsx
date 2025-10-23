// src/components/Charts/StockChart.jsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const StockChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 12 }} />
        <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#1e293b', 
            border: '1px solid #334155',
            borderRadius: '0.5rem'
          }}
          
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="portfolio" 
          stroke="#3b82f6" 
          strokeWidth={2} 
          dot={false} 
          activeDot={{ r: 6 }} 
          name="Your Portfolio"
        />
        <Line 
          type="monotone" 
          dataKey="benchmark" 
          stroke="#10b981" 
          strokeWidth={2} 
          dot={false} 
          activeDot={{ r: 6 }} 
          name="Nifty 50"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export default StockChart