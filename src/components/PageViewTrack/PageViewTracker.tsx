import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { usePostHog } from "posthog-js/react";

function PostHogPageviewTracker() {
  const loc = useLocation();
  const postHog = usePostHog();

  useEffect(() => {
    if (postHog) postHog.capture("$pageview");
  }, [loc, postHog]);

  return null;
}

export default PostHogPageviewTracker;
