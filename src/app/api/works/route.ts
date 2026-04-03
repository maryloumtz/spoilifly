import type { WorkFilters } from "@/models/view";
import { getSessionUser } from "@/services/server/auth";
import { getCatalogData } from "@/services/server/catalog";
import { jsonOk } from "@/services/server/http";

function getFilters(url: URL): WorkFilters {
  return {
    search: url.searchParams.get("search") ?? "",
    type: (url.searchParams.get("type") as WorkFilters["type"]) ?? "all",
    category: url.searchParams.get("category") ?? "",
    tag: url.searchParams.get("tag") ?? "",
    level: (url.searchParams.get("level") as WorkFilters["level"]) ?? "all",
    sort: (url.searchParams.get("sort") as WorkFilters["sort"]) ?? "popular",
  };
}

export async function GET(request: Request) {
  const sessionUser = await getSessionUser();
  const data = await getCatalogData(getFilters(new URL(request.url)), sessionUser);
  return jsonOk(data);
}
