import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

export default function PageTimeChart({ data }) {
  if (!data || data.length === 0) return <p className="text-gray-400 text-sm">No data yet.</p>;

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis dataKey="page" tick={{ fontSize: 12 }} />
        <YAxis unit="s" tick={{ fontSize: 12 }} />
        <Tooltip formatter={(v) => `${v}s`} />
        <Line type="monotone" dataKey="avgSeconds" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 8 }} name="Avg Time (s)" />
      </LineChart>
    </ResponsiveContainer>
  );
}
