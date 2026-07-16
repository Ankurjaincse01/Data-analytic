import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { getSessionId, getEntrySource, sendEvent, sendSessionEnd } from "../lib/tracker";

const useTracker = () => {
  const location = useLocation();
  const prevPage = useRef(null);
  const entryTime = useRef(Date.now());
  const sessionId = getSessionId();

  useEffect(() => {
    const currentPage = location.pathname;
    const from = prevPage.current;
    const timeSpent = Date.now() - entryTime.current;

    // Send event: current page + time spent on previous page
    sendEvent({
      sessionId,
      page: currentPage,
      from,
      timeSpent: from ? timeSpent : 0,
      entrySource: getEntrySource(),
      referrer: document.referrer,
      userAgent: navigator.userAgent,
    });

    prevPage.current = currentPage;
    entryTime.current = Date.now();

    // On tab close, send session end
    const handleUnload = () => {
      const finalTime = Date.now() - entryTime.current;
      sendSessionEnd(sessionId, currentPage, finalTime);
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [location.pathname]);
};

export default useTracker;
