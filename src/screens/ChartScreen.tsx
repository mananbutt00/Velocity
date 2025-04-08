import {View, Text, StyleSheet, Dimensions} from 'react-native';
import React from 'react';
import {LineChart} from 'react-native-chart-kit';

const ChartScreen = ({navigation, route}) => {
  const {DownloadSpeed, UploadSpeed} = route.params;
  const labels = DownloadSpeed.map((_, index) => (index + 1).toString());
 
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={{flex: 0.05}}>
          <Text style={styles.heading}>Speed Chart</Text>
        </View>
        <View style={{flex: 0.35}}>
          <LineChart
            data={{
              labels:labels,
              datasets: [
                {
                  data: DownloadSpeed,
                  color: () => 'green',
                  strokeWidth: 2,
                },
                {
                  data: UploadSpeed,
                  color: () => '#00FFFF',
                  strokeWidth: 2,
                },
              ],
            }}
            withInnerLines={false}
            withOuterLines={true}
            withVerticalLines={true}
            withHorizontalLines={true}
            width={Dimensions.get('window').width - 20}
            height={220}
            yAxisSuffix=""
            yAxisInterval={1}
            chartConfig={{
              backgroundColor: 'black',
              backgroundGradientFrom: 'black',
              backgroundGradientTo: '#33FFF9',
              decimalPlaces: 2,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16,
                // Adjust grid lines
                gridColor: 'transparent', // Remove vertical and horizontal grid lines
                gridLineWidth: 0,
              },
              propsForDots: {
                r: '4',
              },
              fillShadowGradientOpacity: 0,
            }}
            bezier
            style={{
              borderRadius: 16,
            }}
          />
        </View>

        <View
          style={{
            flex: 0.15,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <View style={{flexDirection: 'column'}}>
            <Text style={{color: 'white', fontSize: 16, marginBottom: 10}}>
              Downloading Speed:
            </Text>
            <Text style={{color: 'white', fontSize: 16}}>Uploading Speed:</Text>
          </View>
          <View style={{flexDirection: 'column', marginLeft: 50}}>
            <View
              style={{
                backgroundColor: 'green',
                borderRadius: 25,
                height: 15,
                width: 15,
                marginBottom: 10,
              }}></View>
            <View
              style={{
                backgroundColor: '#00FFFF',
                borderRadius: 25,
                height: 15,
                width: 15,
              }}></View>
          </View>
        </View>
        <View style={{flex: 0.45}}></View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  content: {
    flex: 1,
    backgroundColor: 'black',
    margin: 10,
  },
  heading: {
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'white',
    fontSize: 20,
  },
});

export default ChartScreen;
