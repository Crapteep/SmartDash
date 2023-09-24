import { useQuery } from "react-query";
import axios from "axios";

const URL = process.env.REACT_APP_API_URL;

const useDevicesData = () => {
  return useQuery({
    queryKey: "devices",
    queryFn: async () => {
      const { data } = await axios.get(`${URL}/devices`);
      return data;
    },
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
  });
};

export default useDevicesData;
