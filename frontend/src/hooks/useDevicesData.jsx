import { useQuery } from "react-query";
import axios from "axios";

const URL = import.meta.env.VITE_APP_API_URL;

const useDevicesData = () => {
  return useQuery({
    queryKey: "devices",
    queryFn: async () => {
      const { data } = await axios.get(`${URL}/api/v1/devices/`);
      return data;
    },
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
  });
};

export default useDevicesData;
