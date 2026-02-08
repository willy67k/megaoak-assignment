import axios from "axios";

export async function getDistanceList(payload: { lat: number; lng: number }) {
  const res = await axios.post(`${import.meta.env.VITE_API_BASE}/api/v1/server/xinbei/calc-distance`, payload);

  return res.data;
}
