export async function getCoordinates(address: string) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`,
    );
    const data = await response.json();
    if (data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        display_name: data[0].display_name,
      };
    }
    console.warn("No coordinates found for:", address);
    return null;
  } catch (err) {
    console.error("Error getting coordinates:", err);
    return null;
  }
}
