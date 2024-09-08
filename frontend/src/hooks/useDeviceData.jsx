import { useQuery } from "react-query";
import axios from "axios";

const URL = import.meta.env.VITE_API_URL;

const useDeviceData = (deviceId) => {
  return useQuery({
    queryKey: ["device", deviceId],
    queryFn: async () => {
      const { data } = await axios.get(`${URL}/api/v1/devices/${deviceId}`);
      return data;
    },
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
  });
};

export default useDeviceData;
