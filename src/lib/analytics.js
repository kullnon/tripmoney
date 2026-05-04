import { supabase } from '../supabase';

function getVisitorId() {
  let id = localStorage.getItem('tm-visitor-id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('tm-visitor-id', id);
  }
  return id;
}

function getExternalReferrer() {
  try {
    if (!document.referrer) return null;
    const ref = new URL(document.referrer);
    if (ref.origin === window.location.origin) return null;
    return ref.hostname;
  } catch {
    return null;
  }
}

function getCountryHint() {
  // Use language tag country suffix as a geo proxy (e.g. "en-US" → "US")
  try {
    const lang = navigator.language || '';
    const parts = lang.split('-');
    return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : null;
  } catch {
    return null;
  }
}

export function trackPageview(path) {
  try {
    const visitorId = getVisitorId();
    supabase.rpc('track_pageview', {
      p_path: path,
      p_visitor_id: visitorId,
      p_referrer: getExternalReferrer(),
      p_country: getCountryHint(),
    }).catch(() => {});
  } catch {
    // never block render
  }
}
