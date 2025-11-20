import { useState, useEffect, useRef } from 'react';
import { jobsAPI } from '../services/api';

export const useJobPolling = (jobId, options = {}) => {
  const { 
    onComplete, 
    onError, 
    interval = 2000,
    enabled = true 
  } = options;
  
  const [job, setJob] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!jobId || !enabled) {
      setIsPolling(false);
      return;
    }

    setIsPolling(true);
    setError(null);
    
    // Initial fetch
    const fetchJob = async () => {
      try {
        const response = await jobsAPI.get(jobId);
        const jobData = response.data;
        setJob(jobData);

        if (jobData.status === 'completed') {
          setIsPolling(false);
          onComplete?.(jobData);
        } else if (jobData.status === 'failed') {
          setIsPolling(false);
          setError(jobData);
          onError?.(jobData);
        }
      } catch (err) {
        setIsPolling(false);
        setError(err);
        onError?.(err);
      }
    };

    fetchJob();

    // Set up polling interval
    intervalRef.current = setInterval(fetchJob, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [jobId, enabled, interval, onComplete, onError]);

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPolling(false);
  };

  return { job, isPolling, error, stopPolling };
};

