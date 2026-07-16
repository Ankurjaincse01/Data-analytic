import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function MostVisited({ data }) {
  if (!data || data.length === 0) return <p className="text-gray-400 text-sm">No data yet.</p>;

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} layout="vertical">
        <XAxis type="number" tick={{ fontSize: 12 }} />
        <YAxis dataKey="page" type="category" width={80} tick={{ fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey="totalVisits" fill="#8b5cf6" name="Visits" radius={[0,4,4,0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
