import { useEffect, useState } from 'react';
import axios from 'axios';

const useAPI = (
  config = {
    url: '',
    method: 'GET',
    headers: {},
    data: {},
    params: {},
    withCredentials:false
  },
  shouldFire = true
) => {
  const [parameters, setParameters] = useState(config);
  const [fire, setFire] = useState(shouldFire);
  const [isLoading, setIsLoading] = useState(shouldFire);
  const [data, setData] = useState(null);
  const [dataReady, setDataReady] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (fire) {
      setIsLoading(true);
      (async () => {
        await executeRequest();
      })();
    }
  }, [fire]);
  const executeRequest = async () => {
    try {
      const response = await axios.request({
        ...parameters,        
        proxy: false,        
      });
      setData(response.data);
      setDataReady(true);
    } catch (e) {
      console.log(e);
      if (e.message === 'Network Error') {
        alert(
          `${e}`
        );
        setError(
          'Sorry We have a problem reaching the servers, please confirm that you are using the VPN otherwise contact ICOSTs support'
        );
      }
      if (e.response) {
        setError(e.response.data.Error);
        console.log(e.response.data);
        console.log(e.response.status);
        console.log(e.response.headers);
      }
    } finally {
      setFire(false);
      setIsLoading(false);

    }
  };
  const reset = () => {
    setData(null);
    setIsLoading(false);
    setFire(false);
    setParameters(config);
    setDataReady(false);
  };
  return {
    isLoading,
    data,
    error,
    reset,
    fire,
    setParameters,
    setFire,
    setIsLoading,
    setError,
    dataReady,
    parameters,
  };
};
export default useAPI;
