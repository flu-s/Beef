import type { ButcherShop, Coordinates } from "../types";

const API_BASE_URL = "https://beef-t4x8.onrender.com/api/shops";

export const fetchNearbyShops = async (center: Coordinates): Promise<ButcherShop[]> => {
  try {
    console.log(`Fetching shops for location: ${center.lat}, ${center.lng}`);

    // Call the Spring Boot Controller: @GetMapping("/api/shops")
    // Added a timestamp to prevent caching issues during development
    const response = await fetch(`${API_BASE_URL}?lat=${center.lat}&lng=${center.lng}&_t=${new Date().getTime()}`);

    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }

    const data = await response.json();

    // The Java DTO structure matches our TypeScript interface, so we can cast directly.
    return data as ButcherShop[];

  } catch (error) {
    console.error("Failed to fetch shops from backend:", error);

    // Propagate the error so the UI can handle it (show an alert or error message)
    throw error;
  }
};
