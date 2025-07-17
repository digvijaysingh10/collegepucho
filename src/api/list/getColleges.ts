import { CollegesResponseDTO } from "../@types/college-list";

const createQueryString = (params: Record<string, string | number>): string =>
  new URLSearchParams(
    Object.entries(params).reduce((acc, [key, value]) => {
      acc[key] = String(value);
      return acc;
    }, {} as Record<string, string>)
  ).toString();

export const getColleges = async ({
  limit = 10,
  page,
  filters = {},
}: {
  limit?: number;
  page: number;
  filters?: Record<string, string>;
}): Promise<CollegesResponseDTO> => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const BEARER_TOKEN = process.env.NEXT_PUBLIC_BEARER_TOKEN;

  if (!API_URL || !BEARER_TOKEN) {
    console.error(
      "⚠️ Missing API URL or Bearer token. Check environment variables."
    );
    throw new Error("API URL or Bearer token is missing.");
  }

  const queryParams: Record<string, string | number> = { limit, page };
  if (filters.city_id) queryParams.city_id = filters.city_id;
  if (filters.state_id) queryParams.state_id = filters.state_id;
  if (filters.stream_id) queryParams.stream_id = filters.stream_id;

  // const requestUrl = `${API_URL}/college-info?${createQueryString(queryParams)}`;
  const requestUrl = `${API_URL}/college-info/filteredColleges?page=1&operation_url=https%3A%2F%2Fwww.kollegeapply.com%2Fcolleges`;

  try {
    const response = await fetch(requestUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Fetch failed with status ${response.status}`);
    }

    const data = await response.json();

    return {
      filter_section: {
        city_filter: data.filter_section?.city_filter ?? [],
        state_filter: data.filter_section?.state_filter ?? [],
        stream_filter: data.filter_section?.stream_filter ?? [],
        type_of_institute_filter:
          data.filter_section?.type_of_institute_filter ?? [],
        specialization_filter: data.filter_section?.specialization_filter ?? [],
      },
      colleges: data.colleges ?? [],
      total_colleges_count: data.total_colleges_count ?? 0,
    };
  } catch {
    throw new Error("Failed to fetch colleges data.");
  }
};
