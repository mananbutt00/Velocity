import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  ImageComponent,
  TouchableOpacity,
  Alert,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {
  listSpeedTestHistory,
  getDBConnection,
  deleteRecords,
  createTable,
} from '../services/database';

import Icon from 'react-native-vector-icons/FontAwesome';

const SpeedTestHistory = ({navigation}) => {
  const [speedHistory, setSpeedHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getHistory = async () => {
      try {
        const db = await getDBConnection();
        await createTable(db);
        const data = await listSpeedTestHistory(db);
        setSpeedHistory(data);
      } catch (error) {
        console.error('Error fetching speed test history', error);
      } finally {
        setLoading(false);
      }
    };
    getHistory();
  }, []);

  const handleAlert = () => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete previous records?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async () => {
            await handleDeleteRecord();
            await reloadHistory();
          },
        },
      ],
    );
  };

  const handleDeleteRecord = async () => {
    try {
      const db = await getDBConnection();
      await deleteRecords(db);
    } catch (error) {
      console.error('Error deleting records', error);
    }
  };

  const reloadHistory = async () => {
    setLoading(true);
    try {
      const db = await getDBConnection();
      const data = await listSpeedTestHistory(db);
      setSpeedHistory(data);
    } catch (error) {
      console.error('Error reloading speed test history', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={{flex: 1}}>
          <View
            style={{
              flex: 0.1,
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
            <View></View>
            <Text style={styles.heading}>SpeedTestHistory</Text>
            <TouchableOpacity onPress={handleAlert}>
              <Icon name="trash-o" color={'white'} size={25} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{flex: 0.9}}>
            <View style={styles.tableHeader}>
              <Text style={styles.headerText}>Date</Text>
              <Text style={styles.headerText}>Speed</Text>
              <Text style={styles.headerText}>Type</Text>
            </View>
            {loading ? (
              <ActivityIndicator size="large" color="#ffffff" />
            ) : speedHistory.length === 0 ? (
              <Text style={styles.noRecordsText}>No records found</Text>
            ) : (
              speedHistory.map((record, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.cellText}>{record.date}</Text>
                  <Text style={styles.cellText}>{record.speed}</Text>
                  <Text style={styles.cellText}>{record.type}</Text>
                </View>
              ))
            )}
          </ScrollView>
        </View>
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
    color: 'white',
    marginVertical: 10,
  },
  heading: {
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'white',
    fontSize: 20,
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
    marginVertical: 10,
  },
  noRecordsText: {
    textAlign: 'center',
    color: 'white',
    marginTop: 20,
  },
});

export default SpeedTestHistory;
