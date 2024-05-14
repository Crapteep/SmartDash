import { useQuery } from "react-query";
import axios from "axios";

const URL = import.meta.env.VITE_APP_API_URL;

const useUsedPinsData = (deviceId) => {
  return useQuery({
    queryKey: ["used-pins", deviceId],
    queryFn: async () => {
      const { data } = await axios.get(
        `${URL}/virtual-pins/${deviceId}/used-pins`
      );
      return data;
    },
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
  });
};

export default useUsedPinsData;
