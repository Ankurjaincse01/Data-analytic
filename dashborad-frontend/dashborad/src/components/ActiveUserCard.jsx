import { useEffect, useState } from "react";
import socket from "../socket";

export default function ActiveUserCard() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    socket.on("activeUsers", (n) => setCount(n));
    return () => socket.off("activeUsers");
  }, []);

  return (
    <div className="bg-green-50 border border-green-300 rounded-xl p-5 text-center">
      <p className="text-xs font-semibold text-green-600 uppercase tracking-wide"> Active Users</p>
      <p className="text-5xl font-bold text-green-700 mt-2">{count}</p>
      <p className="text-xs text-green-400 mt-1">Live via Socket.IO</p>
    </div>
  );
}
