import {openDatabase} from 'react-native-sqlite-storage';

export const getDBConnection = async () => {
  return openDatabase({name: 'xSpeedTest.db', location: 'default'});
};

export const createTable = async db => {
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS speedTestHistory (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              date TEXT,
              speed REAL,
              type TEXT
            )`,
      [],
      (tx, result) => {
        console.log('speedTestHistory table created');
      },
      (tx, error) => {
        console.log('error', error);
      },
    );
  });
};

export const insertSpeedTestRecord = async (db, date, speed, type) => {
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO speedTestHistory ( date, speed, type) VALUES (?, ?, ?)',
      [date, speed, type],
      (tx, result) => {
        console.log(
          'Record inserted into speedTestHistory',
          result.rowsAffected,
        );
      },
      (tx, error) => {
        console.log('Error inserting into speedTestHistory', error);
      },
    );
  });
};

export const listSpeedTestHistory = async db => {
  return new Promise((resolve, reject) => {
    let sql = 'SELECT * FROM speedTestHistory';
    const speedHistory = [];
    db.transaction(tx => {
      tx.executeSql(
        sql,
        [],
        (tx, resultSet) => {
          var length = resultSet.rows.length;
          for (var i = 0; i < length; i++) {
            speedHistory.push(resultSet.rows.item(i));
          }
          resolve(speedHistory);
        },
        (tx, error) => {
          console.log('Error fetching speed test history', error);
          reject([]);
        },
      );
    });
  });
};

export const deleteRecords = async db => {
  const deleteQuery = `
    DELETE FROM speedTestHistory
  `;
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        deleteQuery,
        [],
        (tx, result) => {
          console.log('Deleted successfully', result);
          resolve(result);
        },
        (tx, error) => {
          console.error('Failed to delete records', error);
          reject(error);
        },
      );
    });
  });
};
