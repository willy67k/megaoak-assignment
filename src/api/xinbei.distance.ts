import axios from "axios";

export async function getDistanceList(payload: { lat: number; lng: number }) {
  const res = await axios.post("https://enterprise.oakmega.ai/api/v1/server/xinbei/calc-distance", payload);

  return res.data;
}
