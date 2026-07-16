import { useEffect, useState, useCallback } from "react";
import { API } from "../config";
import ActiveUserCard from "../components/ActiveUserCard";
import PageTimeChart from "../components/PageTimeChart";
import MostVisited from "../components/MostVisited";
import EntrySourceChart from "../components/EntrySourceChart";
import NavigationFlow from "../components/NavigationFlow";

export default function DashboardPage() {
  const [overview, setOverview] = useState({});
  const [pageTime, setPageTime] = useState([]);
  const [mostVisited, setMostVisited] = useState([]);
  const [navFlow, setNavFlow] = useState({});
  const [entrySources, setEntrySources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const fetchJson = async (endpoint, setter) => {
      try {
        const res = await fetch(`${API}/${endpoint}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setter(json.data);
      } catch (err) {
        console.error(`Failed to fetch ${endpoint}:`, err);
      }
    };

    await Promise.all([
      fetchJson("overview", (data) => setOverview(data || {})),
      fetchJson("page-time", (data) => setPageTime(data || [])),
      fetchJson("most-visited", (data) => setMostVisited(data || [])),
      fetchJson("navigation-flow", (data) => setNavFlow(data || {})),
      fetchJson("entry-sources", (data) => setEntrySources(data || [])),
    ]);

    setLastUpdated(new Date().toLocaleTimeString());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Analytics Dashboard</h1>
          {lastUpdated && (
            <p className="text-xs text-gray-400 mt-1">Last updated: {lastUpdated}</p>
          )}
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className={`flex items-center gap-2 font-medium px-4 py-2 rounded-lg shadow-sm transition duration-200 text-white
            ${loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
        >
          <span className={loading ? "animate-spin inline-block" : ""}>🔄</span>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow text-center">
          <p className="text-xs text-gray-400 uppercase font-semibold mb-2">Total Sessions</p>
          <p className="text-4xl font-bold text-gray-800">{overview.totalSessions || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow text-center">
          <p className="text-xs text-gray-400 uppercase font-semibold mb-2">Page Views</p>
          <p className="text-4xl font-bold text-gray-800">{overview.totalPageViews || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow text-center">
          <p className="text-xs text-gray-400 uppercase font-semibold mb-2">Avg Duration</p>
          <p className="text-4xl font-bold text-gray-800">{overview.avgDurationSeconds || 0}s</p>
        </div>
        <ActiveUserCard />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="text-base font-semibold text-gray-700 mb-4">Time Spent Per Page</h2>
          <PageTimeChart data={pageTime} />
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="text-base font-semibold text-gray-700 mb-4">Most Visited Pages</h2>
          <MostVisited data={mostVisited} />
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="text-base font-semibold text-gray-700 mb-4">Entry Sources</h2>
          <EntrySourceChart data={entrySources} />
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="text-base font-semibold text-gray-700 mb-4">Navigation Flow</h2>
          <NavigationFlow data={navFlow} />
        </div>
      </div>
    </div>
  );
}
