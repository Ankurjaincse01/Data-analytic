export default function NavigationFlow({ data }) {
  if (!data || !data.links || data.links.length === 0)
    return <p className="text-gray-400 text-sm">No navigation data yet.</p>;

  return (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="bg-gray-100">
          <th className="text-left p-3">From</th>
          <th className="text-left p-3">To</th>
          <th className="text-left p-3">Count</th>
        </tr>
      </thead>
      <tbody>
        {data.links.map((link, i) => (
          <tr key={i} className="border-b border-gray-200 hover:bg-gray-50">
            <td className="p-3">{data.nodes[link.source]?.name}</td>
            <td className="p-3">{data.nodes[link.target]?.name}</td>
            <td className="p-3 font-bold text-blue-600">{link.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
