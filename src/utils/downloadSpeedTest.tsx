import { useState, useEffect, useRef } from 'react';
import RNFetchBlob from 'rn-fetch-blob';
import RNFS from 'react-native-fs';
export const useDownloadSpeedTest = () => {
  const [downloadSpeed, setDownloadSpeed] = useState(null);
  const [averageDownSpeed, setAverageDownSpeed] = useState(0.0);
  const [downloadTestsCompleted, setDownloadTestsCompleted] = useState(false);
  const [downloadSpeedData, setDownloadSpeedData] = useState([]);
  const [resultDownloadSpeed, setResultDownloadSpeed] = useState([]);
  const [speeds, setSpeeds] = useState([]);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [continueDownloadTest, setContinueDownloadTest] = useState(true);
  const continueDownloadTestRef = useRef(continueDownloadTest);
  const fetchRef = useRef(null);
  const lastUpdateTimeRef = useRef(Date.now());
  useEffect(() => {
    continueDownloadTestRef.current = continueDownloadTest;
  }, [continueDownloadTest]);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (fetchRef.current) {
        fetchRef.current.cancel();
      }
    };
  }, []);

  const convertBytesToMbps = (speedInBytes) => {
    return (speedInBytes * 8) / (1024 * 1024);
  };

  const unlinkFile = async (filePath) => {
    if (filePath) {
      try {
        await RNFetchBlob.fs.unlink(filePath);
        console.log(`File at ${filePath} has been unlinked.`);
      } catch (error) {
        console.error(`Error unlinking file at ${filePath}:`, error);
      }
    }
  };

  const downloadSpeedTest = async () => {
    const tempSpeeds = [];
    const urls = [
      'https://parentingmontana.org/wp-content/uploads/2023/02/30-Second-Video-12.mov',
    ];

    console.log('Starting download speed test...');
    for (const url of urls) {
      if (!continueDownloadTestRef.current) {
        console.log('Download test stopped.');
        break;
      }

      const startTime = Date.now();
      let elapsedTime = 0;
      let timeoutOccurred = false;
      let filePath = null;

      try {
        fetchRef.current = RNFetchBlob.config({ fileCache: false }).fetch('GET', url);

        fetchRef.current.progress((received, total) => {
          if (!continueDownloadTestRef.current || timeoutOccurred) {
            fetchRef.current.cancel();
            console.log('Download test stopped.');
            return;
          }

          const currentTime = Date.now();
          const delay = 1000; // 1 second delay

          if (currentTime - lastUpdateTimeRef.current >= delay) {
            elapsedTime = currentTime - startTime;
            const speed = (received / elapsedTime) * 1000;
            const convertedSpeed = convertBytesToMbps(speed);
            tempSpeeds.push(convertedSpeed);
            setDownloadSpeedData((prevData) => [
              ...prevData,
              convertedSpeed.toFixed(2),
            ]);
            setCurrentSpeed(convertedSpeed.toFixed(2));
            setDownloadSpeed(convertedSpeed.toFixed(2));
            console.log(
              `Progress: ${((received / total) * 100).toFixed(2)}%, Speed: ${convertedSpeed.toFixed(2)} Mbps`
            );
            lastUpdateTimeRef.current = currentTime;

            if (elapsedTime >= 10000) {
              fetchRef.current.cancel();
              timeoutOccurred = true;
              console.log('Download TimeOut.');
            }
          }
        });

        const res = await fetchRef.current;
        filePath = res.path();
        console.log('File PATH:', filePath);
        SetDownloadPath(filePath);

        if (!continueDownloadTestRef.current || timeoutOccurred) {
          fetchRef.current.cancel();
          console.log('Download test stopped.');
          break;
        }

        setSpeeds([...tempSpeeds]);

      } catch (err) {
        if (err.message !== 'cancelled') {
   
        }
      }
      if (!continueDownloadTestRef.current) {
        console.log('Download test stopped.');
        break;
      }

      if (filePath) {
        await unlinkFile(filePath);
        console.log('resetting function caleed',filePath);
      }
    }

    setResultDownloadSpeed(tempSpeeds);
    const averageSpeed = tempSpeeds.reduce((a, b) => a + b, 0) / tempSpeeds.length;
    setAverageDownSpeed(averageSpeed.toFixed(2));
    setDownloadTestsCompleted(true);
    console.log('Download speed test completed.');
  };

  const resetDownloadSpeedValues =async () => {
    console.log('Resetting download speed values...');
    setDownloadSpeed(null);
    setAverageDownSpeed(0.0);
    setDownloadTestsCompleted(false);
    setDownloadSpeedData([]);
    setResultDownloadSpeed([]);
    setSpeeds([]);
    setCurrentSpeed(0);
    setContinueDownloadTest(true);
  };

  return {
    downloadSpeed,
    averageDownSpeed,
    downloadTestsCompleted,
    downloadSpeedData,
    resultDownloadSpeed,
    continueDownloadTest,
    speeds,
    currentSpeed,
    downloadSpeedTest,
    resetDownloadSpeedValues,
    setContinueDownloadTest,
  };
};
