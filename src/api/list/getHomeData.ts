"use server";

import { HomeData } from "../@types/home-datatype";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const BEARER_TOKEN = process.env.NEXT_PUBLIC_BEARER_TOKEN;

const fetchData = async (
  url: string,
  options: RequestInit
): Promise<Response> => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Error: ${response.status} ${response.statusText}. ${errorText}`
      );
    }
    return response;
  } catch (error) {
    // Provide more specific error information
    if (error instanceof Error) {
      throw new Error(`Fetch failed: ${error.message}`);
    } else {
      throw new Error(`Fetch failed: Unknown error occurred`);
    }
  }
};

export const getHomeData = async (): Promise<HomeData> => {
  if (!API_URL || !BEARER_TOKEN) {
    console.error("Environment variables check:", {
      API_URL: API_URL ? "✅ Set" : "❌ Missing",
      BEARER_TOKEN: BEARER_TOKEN ? "✅ Set" : "❌ Missing"
    });
    throw new Error(
      "API URL or Bearer token is missing from environment variables."
    );
  }

  console.log("Attempting to fetch from:", `${API_URL}/home-page`);
  
  const response = await fetchData(`${API_URL}/home-page`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${BEARER_TOKEN}`,
      "Content-Type": "application/json",
    },
    next: { revalidate: 86400 },
  });

  try {
    const data: HomeData = await response.json();
    return data;
  } catch (error) {
    console.error("JSON parsing failed:", error);
    throw new Error("Failed to parse response as JSON.");
  }
};

export const fetchAndDestructureData = async () => {
  try {
    const homeData = await getHomeData();

    const {
      top_colleges: topCollegeData,
      top_private_colleges_sections: privateCollegeData,
      top_cities: cityData,
      upcoming_exams: examData,
      news_section: articleData,
      courses_section: courseData,
    } = homeData;

    return {
      topCollegeData,
      privateCollegeData,
      cityData,
      examData,
      articleData,
      courseData,
    };
  } catch {
    throw new Error("Failed to fetch exams");
  }
};
