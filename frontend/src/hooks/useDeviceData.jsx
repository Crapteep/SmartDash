import { useQuery } from "react-query";
import axios from "axios";

const URL = import.meta.env.VITE_APP_API_URL;

const useDeviceData = () => {
  return useQuery({
    queryKey: "device",
    queryFn: async () => {
      const { data } = await axios.get(`${URL}/device`);
      return data;
    },
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
  });
};

export default useDeviceData;
