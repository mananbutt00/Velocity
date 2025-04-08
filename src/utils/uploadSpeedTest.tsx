import {useState, useRef, useEffect} from 'react';
import RNFetchBlob from 'rn-fetch-blob';

export const useUploadSpeedTest = () => {
  const [uploadSpeed, setUploadSpeed] = useState(null);
  const [averageUploadSpeed, setAverageUploadSpeed] = useState(0.0);
  const [uploadTestsCompleted, setUploadTestsCompleted] = useState(false);
  const [uploadSpeedData, setUploadSpeedData] = useState([]);
  const [resultUploadSpeed, setResultUploadSpeed] = useState([]);
  const [speeds, setSpeeds] = useState([]);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [continueUploadTest, setContinueUploadTest] = useState(true);
  const continueUploadTestRef = useRef(continueUploadTest);
  const fetchRef = useRef(null);
  const lastUpdateTimeRef = useRef(Date.now());

  useEffect(() => {
    continueUploadTestRef.current = continueUploadTest;
  }, [continueUploadTest]);

  const convertBytesToMbps = speedInBytes => {
    return (speedInBytes * 8) / (1024 * 1024);
  };

  const uploadSpeedTest = async () => {
    const tempSpeeds = [];
    const sizes = [10 * 1024 * 1024];

    console.log('Starting upload speed test...');

    for (const size of sizes) {
      if (!continueUploadTestRef.current) {
        console.log('Upload test stopped.');
        break;
      }

      const path = 'bundle-assets://uploadFile.txt';
      console.log('Using asset file at', path);

      const startTime = Date.now();
      let uploadElapsedTime = 0;
      let timeoutOccurred = false;

      try {
        fetchRef.current = RNFetchBlob.fetch(
          'POST',
          'https://www.toptal.com/developers/postbin/1729774809542-1192284931894',
          {
            'Content-Type': 'application/octet-stream',
            'Content-Transfer-Encoding': 'base64',
          },
          RNFetchBlob.wrap(path),
        );

        fetchRef.current.uploadProgress((written, total) => {
          if (!continueUploadTestRef.current) {
            fetchRef.current.cancel();
            console.log('Upload test stopped.');
            return;
          }

          const currentTime = Date.now();
          const delay = 1000;

          if (currentTime - lastUpdateTimeRef.current >= delay) {
            uploadElapsedTime = currentTime - startTime;
            const speed = (written / uploadElapsedTime) * 1000;
            const convertedSpeed = convertBytesToMbps(speed);
            tempSpeeds.push(convertedSpeed);
            setUploadSpeedData(prevData => [
              ...prevData,
              convertedSpeed.toFixed(2),
            ]);
            setCurrentSpeed(convertedSpeed.toFixed(2));
            setUploadSpeed(convertedSpeed.toFixed(2));
            console.log(
              `Progress: ${((written / total) * 100).toFixed(
                2,
              )}%, Speed: ${convertedSpeed.toFixed(2)} Mbps`,
            );
            lastUpdateTimeRef.current = currentTime;

            if (uploadElapsedTime >= 20000) {
              fetchRef.current.cancel();
              timeoutOccurred = true;
              console.log('Upload TimeOut.');
            }
          }
        });

        const response = await fetchRef.current;

        if (response.respInfo.status === 200) {
          console.log('Upload successful');
        } else {
          console.error('Upload failed with status:', response.respInfo.status);
        }

        if (!continueUploadTestRef.current || timeoutOccurred) {
          fetchRef.current.cancel();
          console.log('Upload test stopped.');
          break;
        }

        setSpeeds([...tempSpeeds]);
      } catch (err) {
        if (err.message !== 'cancelled') {
          console.error('Upload error', err);
        }
      }

      if (!continueUploadTestRef.current || timeoutOccurred) {
        console.log('Upload test stopped.');
        break;
      }
    }

    setResultUploadSpeed(tempSpeeds);
    const averageSpeed =
      tempSpeeds.reduce((a, b) => a + b, 0) / tempSpeeds.length;
    setAverageUploadSpeed(averageSpeed.toFixed(2));
    setUploadTestsCompleted(true);
    console.log('Upload speed test completed.');
  };

  const resetUploadSpeedValues = () => {
    console.log('Resetting upload speed values...');
    setUploadSpeed(null);
    setAverageUploadSpeed(0.0);
    setUploadTestsCompleted(false);
    setUploadSpeedData([]);
    setResultUploadSpeed([]);
    setSpeeds([]);
    setCurrentSpeed(0);
    setContinueUploadTest(true);
  };

  return {
    uploadSpeed,
    averageUploadSpeed,
    uploadTestsCompleted,
    uploadSpeedData,
    resultUploadSpeed,
    continueUploadTest,
    speeds,
    currentSpeed,
    uploadSpeedTest,
    resetUploadSpeedValues,
    setContinueUploadTest,
  };
};
