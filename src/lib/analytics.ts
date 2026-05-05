/**
 * Helper client-side para disparar eventos a Google Analytics 4.
 *
 * El script gtag.js se carga en `src/app/layout.tsx` (afterInteractive).
 * Cuando todavía no terminó de hidratar (o en SSR), `window.gtag` no
 * existe — los call sites pueden invocar igual y este helper hace
 * no-op en silencio.
 *
 * Eventos de catálogo que disparamos:
 * - `search`              { search_term, search_tab }
 * - `view_search_results` { search_term, search_tab, results_count }
 * - `select_item`         { item_id, item_name, item_category, item_list_name }
 *   → cuando alguien clickea una ProductCard del catálogo.
 * - `view_item`           { item_id, item_name, item_category }
 *   → en /catalogo/[slug] (detalle del producto).
 *
 * Estos son los eventos estándar de GA4 (Recommended events for Retail).
 * Verlo después en GA4: Reports → Engagement → Events.
 */

type GtagFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    gtag?: GtagFn;
    dataLayer?: unknown[];
  }
}

function call(...args: unknown[]): void {
  if (typeof window === "undefined") return;
  const fn = window.gtag;
  if (typeof fn !== "function") return;
  try {
    fn(...args);
  } catch {
    // Swallow — analytics nunca debe romper el flujo.
  }
}

export function trackSearch(params: {
  term: string;
  tab: string;
}): void {
  call("event", "search", {
    search_term: params.term,
    search_tab: params.tab,
  });
}

export function trackSearchResults(params: {
  term: string;
  tab: string;
  count: number;
}): void {
  call("event", "view_search_results", {
    search_term: params.term,
    search_tab: params.tab,
    results_count: params.count,
  });
}

export function trackSelectItem(params: {
  id: string;
  name: string;
  category?: string;
  listName?: string;
}): void {
  call("event", "select_item", {
    item_list_name: params.listName ?? "Catalogo",
    items: [
      {
        item_id: params.id,
        item_name: params.name,
        item_category: params.category,
      },
    ],
  });
}

export function trackViewItem(params: {
  id: string;
  name: string;
  category?: string;
}): void {
  call("event", "view_item", {
    items: [
      {
        item_id: params.id,
        item_name: params.name,
        item_category: params.category,
      },
    ],
  });
}
