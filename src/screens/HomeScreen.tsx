import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  FlatList,
  Alert,
  Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {useNetInfo} from '@react-native-community/netinfo';
import Svg, {Circle, Image, Text as SvgText} from 'react-native-svg';
import LottieView from 'lottie-react-native';
import CustomHeader from '../components/CustomHeader';
import {useDownloadSpeedTest} from '../utils/downloadSpeedTest';
import {useUploadSpeedTest} from '../utils/uploadSpeedTest';
import CustomChart from '../components/CustomChart';
import CustomButton from '../components/CustomButton';
import {COLORS} from '../styles/Colors';
import RNFS from 'react-native-fs';
import {
  createTable,
  getDBConnection,
  insertSpeedTestRecord,
  listSpeedTestHistory,
} from '../services/database';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const radius = 43;
const circumference = 1.5 * Math.PI * radius;
const HomeScreen = ({navigation}) => {
  const [animatedDownloadSpeedData, setAnimatedDownloadSpeedData] = useState([]);
  const [animatedUploadSpeedData, setAnimatedUploadSpeedData] = useState([]);
  const [testCompleted, setTestCompleted] = useState(false);
  const [speedHistory, setSpeedHistory] = useState([]);
  const [ipAddress, setIpAddress] = useState(null);
  const [isConnected, setIsConnected] = useState(null);
  const [linkSpeed, setLinkSpeed] = useState(null);
  const [goButton, setGoButton] = useState(true);
  const netInfo = useNetInfo();
  const [testAgain, setTestAgain] = useState(false);
  const dashArrayAnimation = useRef(new Animated.Value(0)).current;
  const screenWidth = Dimensions.get('window').width;
  const initialWidth = 0.1* screenWidth;
  const maxWidth = 1 * screenWidth;
  const [chartWidth, setChartWidth] = useState(initialWidth);

  const {
    downloadSpeed,
    averageDownSpeed,
    downloadTestsCompleted,
    downloadSpeedData,
    resultDownloadSpeed,
    continueDownloadTest,
    resetDownloadSpeedValues,
    downloadSpeedTest,
    setContinueDownloadTest,
  } = useDownloadSpeedTest();

  const {
    uploadSpeed,
    averageUploadSpeed,
    uploadTestsCompleted,
    uploadSpeedData,
    resultUploadSpeed,
    continueUploadTest,
    uploadSpeedTest,
    resetUploadSpeedValues,
    setContinueUploadTest,
  } = useUploadSpeedTest();
  useEffect(() => {
    // Update animatedDownloadSpeedData whenever downloadSpeedData changes
    setAnimatedDownloadSpeedData([
      { x: 0, y: 0 },
      ...downloadSpeedData.map((speed, index) => ({
        x: index + 1,
        y: parseFloat(speed),
      })),
    ]);
  }, [downloadSpeed]);

  useEffect(() => {
    // Update animatedUploadSpeedData whenever uploadSpeedData changes
    setAnimatedUploadSpeedData([
      { x: 0, y: 0 },
      ...uploadSpeedData.map((speed, index) => ({
        x: index + 1,
        y: parseFloat(speed),
      })),
    ]);
  }, [uploadSpeed]);
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        const db = await getDBConnection();
        await createTable(db);
        console.log('Database initialized');
      } catch (error) {
        console.log('Error initializing database', error);
      }
    };

    initializeDatabase();
  }, []);


  // const createUploadFile = async () => {
  //   const size = 10 * 1024 * 1024;
  //   const path = `${RNFS.DocumentDirectoryPath}/uploadFile.txt`;
  //   const fileExists = await RNFS.exists(path);
  //   if (!fileExists) {
  //     await RNFS.writeFile(path, 'a'.repeat(size), 'utf8');
  //     console.log(`File of size ${size} created at ${path}`);
  //   } else {
  //     console.log(`File already exists at ${path}`);
  //   }
  // };
  useEffect(() => {
    const insertSpeedData = async () => {
      try {
        const db = await getDBConnection();
        if (downloadSpeedData.length > 0 || uploadSpeedData.length > 0) {
          const currentDate = new Date();
          const month = currentDate.getMonth() + 1;
          const day = currentDate.getDate();
          const year = currentDate.getFullYear();
          const hours = currentDate.getHours();

          const minutes = currentDate.getMinutes().toString().padStart(2, '0');

          const formattedDate = `${month}/${day}/${year}`;
          const formattedTime = `${hours}:${minutes}`;

          const formattedDateTime = `${formattedDate}, ${formattedTime}`;
          for (let speed of downloadSpeedData) {
            await insertSpeedTestRecord(
              db,
              formattedDateTime,
              speed,
              'download',
            );
          }
          for (let speed of uploadSpeedData) {
            await insertSpeedTestRecord(db, formattedDateTime, speed, 'upload');
          }
        }
      } catch (error) {
        console.log('Error inserting speed data', error);
      }
    };

    if (testCompleted) {
      insertSpeedData();
    }
  }, [testCompleted, downloadSpeedData, uploadSpeedData]);

  const handleSpeedTest = async () => {
    setGoButton(false);
    // await createUploadFile();
    await downloadSpeedTest();
    await uploadSpeedTest();
    setTestCompleted(true);
  };

  const handleTestAgain = () => {
    resetSpeedValues();
    setTestAgain(!testAgain);
    setGoButton(true);
  };

  const resetSpeedValues = () => {
    setTestCompleted(false);
    resetDownloadSpeedValues();
    resetUploadSpeedValues();
  };

  useEffect(() => {
    if (netInfo.isConnected && !testCompleted) {
      handleTestAgain();
    }
  }, [netInfo.isConnected]);

  const calculateLabelPosition = (index, totalLabels) => {
    const angle = (250 / totalLabels) * index + 155;
    const angleInRadians = angle * (Math.PI / 180);
    const x = 72 + radius * Math.cos(angleInRadians);
    const y = 50 + radius * Math.sin(angleInRadians);
    return {x, y};
  };

  useEffect(() => {
    setIpAddress(netInfo.details?.ipAddress);
    setIsConnected(netInfo.isConnected);
    setLinkSpeed(netInfo.details?.linkSpeed);
  }, [netInfo]);

  useEffect(() => {
    if (downloadTestsCompleted || testCompleted) {
      Animated.timing(dashArrayAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [downloadTestsCompleted, testCompleted]);

  useEffect(() => {
    if (downloadSpeed) {
      Animated.timing(dashArrayAnimation, {
        toValue: circumference * (downloadSpeed / 100),
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [downloadSpeed]);

  useEffect(() => {
    if (uploadSpeed) {
      Animated.timing(dashArrayAnimation, {
        toValue: circumference * (uploadSpeed / 100),
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [uploadSpeed]);

  useEffect(() => {
    let speedDataLength =
      uploadSpeedData.length > 0
        ? uploadSpeedData.length
        : downloadSpeedData.length;

    if (speedDataLength <= 50) {
      const newWidth = initialWidth + speedDataLength * (0.15 * screenWidth);
      // console.log('New Chart Width',newWidth);
      setChartWidth(newWidth > maxWidth ? maxWidth : newWidth);
    } else {
      setChartWidth(maxWidth);
    }
  }, [downloadSpeed, uploadSpeed]);

  const handleOfflineDownloadSpeedTest = () => {
    Alert.alert('Network not Connected');
  };
  const handleStop = () => {
    setContinueDownloadTest(false);
    setContinueUploadTest(false);
    
    setTestCompleted(true);
  };
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <CustomHeader
          title="Velocity"
          iconName={'history'}
          iconSize={30}
          iconColor={'white'}
          onPress={() => navigation.navigate('SpeedTestHistory')}
        />
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Icon name="globe" size={20} color={COLORS.primaryColor} />
              <Text style={styles.infoText}>Ip Address</Text>
            </View>
            <View style={styles.infoItem}>
              <Icon name="tachometer" size={20} color={COLORS.primaryColor} />
              <Text style={styles.infoText}>Link Speed</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoValue}>{ipAddress}</Text>
            <Text style={styles.infoValue}>
              {linkSpeed ? `${linkSpeed} Mbps` : ''}
            </Text>
          </View>
        </View>

        <View style={styles.speedTestContainer}>
          {!isConnected ? (
            <View style={styles.offlineTestContainer}>
              <TouchableOpacity onPress={handleOfflineDownloadSpeedTest}>
                <LottieView
                  style={styles.lottieAnimation}
                  source={require('../assets/animations/offileGoButton.json')}
                  autoPlay
                  loop
                  speed={0.2}
                />
              </TouchableOpacity>
              <Text style={styles.offlineText}>
                Internet is not connected!!
              </Text>
            </View>
          ) : goButton && !testCompleted ? (
            <TouchableOpacity onPress={handleSpeedTest}>
              <LottieView
                style={styles.lottieAnimation}
                source={require('../assets/animations/onlineGoButton.json')}
                autoPlay
                loop
                speed={0.2}
              />
            </TouchableOpacity>
          ) : !downloadSpeed && !goButton ? (
            <View style={styles.loadingContainer}>
              <LottieView
                style={styles.lottieAnimation}
                source={require('../assets/animations/loadingAnimation.json')}
                autoPlay
                loop
                speed={3}
              />
            </View>
          ) : (
            <Svg height="100%" width="100%" viewBox="0 0 150 100">
              {downloadSpeed && (
                <AnimatedCircle
                  cx="74"
                  cy="50"
                  r="52"
                  stroke={COLORS.downloadSpeedColor}
                  strokeWidth="5"
                  strokeDasharray={[dashArrayAnimation, circumference]}
                  strokeDashoffset="-125"
                  transform="rotate(19, 74, 50)"
                />
              )}
              {uploadSpeed && (
                <AnimatedCircle
                  cx="74"
                  cy="50"
                  r="52"
                  stroke={COLORS.uploadSpeedColor}
                  strokeWidth="5"
                  strokeDasharray={[dashArrayAnimation, circumference]}
                  strokeDashoffset="-125"
                  transform="rotate(19, 74, 50)"
                />
              )}
              {downloadSpeed &&
                !uploadSpeed &&
                !testCompleted &&
                !downloadTestsCompleted && (
                  <View>
                    <Image
                      href={require('../assets/images/stop.png')}
                      x="50"
                      y="38"
                      height="13"
                      width="13"
                      onPress={handleStop}
                    />
                    <SvgText
                      x="80"
                      y="45"
                      fontSize="10"
                      fill="white"
                      textAnchor="middle"
                      fontWeight="bold"
                      alignmentBaseline="central">
                      {downloadSpeed}
                    </SvgText>
                  </View>
                )}
              {uploadSpeed && !testCompleted && (
                <View>
                  <Image
                    href={require('../assets/images/stop.png')}
                    x="50"
                    y="38"
                    height="13"
                    width="13"
                    onPress={handleStop}
                  />
                  <SvgText
                    x="80"
                    y="45"
                    fontSize="10"
                    fontWeight="bold"
                    fill="white"
                    textAnchor="middle"
                    alignmentBaseline="central">
                    {uploadSpeed}
                  </SvgText>
                </View>
              )}
              {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(
                (label, index) => {
                  const {x, y} = calculateLabelPosition(index, 11);
                  return (
                    <SvgText
                      key={index}
                      x={x}
                      y={y}
                      fontSize="6"
                      fill="white"
                      textAnchor="middle"
                      alignmentBaseline="central">
                      {' '}
                      {label}
                    </SvgText>
                  );
                },
              )}
            </Svg>
          )}
          {/* {(downloadSpeed &&
            !uploadSpeed &&
            !testCompleted &&
            !downloadTestsCompleted) ||
          (uploadSpeed && !testCompleted) ? (
            <TouchableOpacity
              style={{position: 'absolute', left: 120, top: 122}}
              onPress={handleStop}>
              <Icon name={'stop-circle'} size={30} color={'red'} />
            </TouchableOpacity>
          ) : null} */}
        </View>

        <View style={styles.speedInfoContainer}>
          <View style={styles.speedInfoRow}>
            <View style={styles.speedInfoItem}>
              <Icon
                name="arrow-circle-down"
                size={25}
                color={COLORS.downloadSpeedColor}
              />
              <Text style={styles.speedInfoText}>
                Download Speed:
                {'\n'}
                {downloadTestsCompleted && isConnected ? (
                  <Text
                    style={{
                      fontSize: 40,
                      fontFamily: 'Teko-Regular',
                    }}>
                    {averageDownSpeed}
                  </Text>
                ) : (
                  <Text style={{fontSize: 40}}>N/A</Text>
                )}
                <Text style={styles.speedInfoSubText}> Mbps</Text>
              </Text>
            </View>
            <View style={styles.speedInfoItem}>
              <Icon
                name="arrow-circle-up"
                size={25}
                color={COLORS.uploadSpeedColor}
              />
              <Text style={styles.speedInfoText}>
                Upload Speed:
                {'\n'}
                {uploadTestsCompleted && isConnected ? (
                  <Text
                    style={{
                      fontSize: 40,
                      fontFamily: 'Teko-Regular',
                    }}>
                    {averageUploadSpeed}
                  </Text>
                ) : (
                  <Text style={{fontSize: 40}}>N/A</Text>
                )}
                <Text style={styles.speedInfoSubText}> Mbps</Text>
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.chartContainer}>
          {testCompleted && (
            <View style={styles.chartNavigation}>
              <CustomButton
                onPress={() =>
                  navigation.navigate('ChartScreen', {
                    DownloadSpeed: resultDownloadSpeed,
                    UploadSpeed: resultUploadSpeed,
                    SpeedHistory: speedHistory,
                  })
                }
                title={'Speed Chart'}
                color={COLORS.primaryColor}
                fontSize={16}
                borderBottomWidth={1}
                borderColor={COLORS.primaryColor}
                textStyle={styles.SpeedChartBtn}
              />
              <CustomButton
                onPress={handleTestAgain}
                title={'Test Again'}
                color={'black'}
                fontSize={16}
                bgColor={COLORS.primaryColor}
              />
            </View>
          )}
          <View style={{right: 30}}>
          {isConnected && downloadSpeed && !uploadSpeed && !testCompleted && continueDownloadTest && (
              <CustomChart
                chartWidth={chartWidth}
                height={150}
                animatedSpeedData={animatedDownloadSpeedData}
                stroke={COLORS.downloadSpeedColor}
              />
            )}
            {isConnected && uploadSpeed && !testCompleted && continueUploadTest && (
              <CustomChart
                chartWidth={chartWidth}
                height={150}
                animatedSpeedData={animatedUploadSpeedData}
                stroke={COLORS.uploadSpeedColor}
              />
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundColor,
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.backgroundColor,
    margin: 10,
  },
  infoContainer: {
    flex: 0.1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    flexDirection: 'row',
  },
  infoText: {
    color: 'white',
    fontSize: 16,
    marginHorizontal: 5,
  },
  infoValue: {
    color: 'white',
    fontSize: 16,
  },
  speedTestContainer: {
    flex: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  offlineTestContainer: {
    alignItems: 'center',
  },
  lottieAnimation: {
    height: 200,
    width: 200,
    backgroundColor: 'transparent',
  },
  offlineText: {
    color: 'red',
    fontSize: 16,
  },
  loadingContainer: {
    backgroundColor: 'transparent',
  },
  speedInfoContainer: {
    flex: 0.15,

    justifyContent: 'space-between',
  },
  speedInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  speedInfoItem: {
    flexDirection: 'row',
  },
  speedInfoText: {
    color: 'white',
    fontSize: 16,
    marginHorizontal: 5,
  },
  speedInfoSubText: {
    color: 'grey',
    fontSize: 14,
  },
  chartContainer: {
    flex: 0.25,
  },
  chartStyle: {
    flex: 1,
  },
  chartNavigation: {
    alignItems: 'center',
  },
  SpeedChartBtn: {
    marginBottom: 10,
  },
  testAgainButtonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 8,
  },
  headerText: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 4,
  },
  cellText: {
    flex: 1,
    textAlign: 'center',
    color: 'white',
  },
});

export default HomeScreen;
