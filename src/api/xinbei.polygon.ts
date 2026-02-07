import axios from "axios";

export async function getPolygons(directory: string) {
  const res = await axios.get("https://enterprise.oakmega.ai/api/v1/server/xinbei/geolocation-json", { params: { directory } });

  return res.data;
}
