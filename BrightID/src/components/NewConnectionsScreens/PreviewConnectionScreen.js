// @flow

import React, { useCallback, useState } from 'react';
import {
  Alert,
  BackHandler,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import {
  removeConnectUserData,
  removeConnectQrData,
  clearMyQrData,
} from '@/actions';
import { addNewConnection } from './actions/addNewConnection';
import api from '../../Api/BrightId';

/**
 * Confirm / Preview Connection  Screen of BrightID
 *
==================================================================
 *
 */

export const PreviewConnectionScreen = ({ navigation }) => {
  const dispatch = useDispatch();

  const [userInfo, setUserInfo] = useState({
    connections: 'loading',
    groups: 'loading',
    mutualConnections: 'loading',
    connectionDate: 'loading',
    flagged: false,
  });

  const myConnections = useSelector((state) => state.connections.connections);
  const connectUserData = useSelector(
    (state) => state.connectUserData,
    shallowEqual,
  );

  const reject = useCallback(() => {
    dispatch(removeConnectUserData());
    dispatch(removeConnectQrData());
    dispatch(clearMyQrData());
    navigation.navigate('Home');
    return true;
  }, [dispatch, navigation]);

  const handleConfirmation = async () => {
    await dispatch(addNewConnection());
    dispatch(removeConnectUserData());
    dispatch(removeConnectQrData());
    dispatch(clearMyQrData());
    navigation.navigate('ConnectSuccess');
  };

  useFocusEffect(
    useCallback(() => {
      if (!connectUserData.photo) {
        Alert.alert(
          'Sorry',
          'There was a problem creating a connection',
          [
            {
              text: 'OK',
              onPress: reject,
            },
          ],
          { cancelable: true },
        );
        return;
      }
      const fetchConnectionInfo = async () => {
        try {
          const {
            createdAt,
            groups,
            connections = [],
            flaggers,
          } = await api.getUserInfo(connectUserData.id);
          const mutualConnections = connections.filter(function (el) {
            return myConnections.some((x) => x.id === el.id);
          });
          setUserInfo({
            connections: connections.length,
            groups: groups.length,
            mutualConnections: mutualConnections.length,
            connectionDate: `Created ${moment(
              parseInt(createdAt, 10),
            ).fromNow()}`,
            flagged: flaggers && Object.keys(flaggers).length > 0,
          });
        } catch (err) {
          if (err instanceof Error && err.message === 'User not found') {
            setUserInfo({
              connections: 0,
              groups: 0,
              mutualConnections: 0,
              connectionDate: 'New user',
              flagged: false,
            });
          } else {
            err instanceof Error ? console.warn(err.message) : console.log(err);
          }
        }
      };

      fetchConnectionInfo();

      BackHandler.addEventListener('hardwareBackPress', reject);
      return () => BackHandler.removeEventListener('hardwareBackPress', reject);
    }, [reject]),
  );

  return (
    <SafeAreaView style={styles.container} testID="previewConnectionScreen">
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#fff"
        translucent={false}
        animated={true}
      />
      <View style={styles.questionTextContainer}>
        <Text style={styles.questionText}>Connect with?</Text>
      </View>
      <View style={styles.userContainer}>
        <Image
          source={{ uri: connectUserData.photo }}
          style={styles.photo}
          resizeMode="cover"
          onError={(e) => {
            console.log(e);
          }}
          accessible={true}
          accessibilityLabel="user photo"
        />
        <Text style={styles.connectName}>
          {connectUserData.name}
          {userInfo.flagged && <Text style={styles.flagged}> (flagged)</Text>}
        </Text>
        <Text style={styles.connectedText}>{userInfo.connectionDate}</Text>
      </View>
      <View style={styles.countsContainer}>
        <View>
          <Text id="connectionsCount" style={styles.countsNumberText}>
            {userInfo.connections}
          </Text>
          <Text style={styles.countsDescriptionText}>Connections</Text>
        </View>
        <View>
          <Text id="groupsCount" style={styles.countsNumberText}>
            {userInfo.groups}
          </Text>
          <Text style={styles.countsDescriptionText}>Groups</Text>
        </View>
        <View>
          <Text id="groupsCount" style={styles.countsNumberText}>
            {userInfo.mutualConnections}
          </Text>
          <Text style={styles.countsDescriptionText}>Mutual Connections</Text>
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          testID="rejectConnectionBtn"
          onPress={reject}
          style={styles.rejectButton}
        >
          <Text style={styles.buttonText}>Reject</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="confirmConnectionBtn"
          onPress={handleConfirmation}
          style={styles.confirmButton}
        >
          <Text style={styles.buttonText}>Confirm</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'column',
  },
  questionTextContainer: {
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionText: {
    fontFamily: 'ApexNew-Book',
    fontSize: 26,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlign: 'center',
    color: '#000000',
  },
  userContainer: {
    marginTop: 10,
    paddingBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photo: {
    width: 148,
    height: 148,
    borderRadius: 74,
  },
  connectName: {
    fontFamily: 'ApexNew-Book',
    marginTop: 10,
    fontSize: 26,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlign: 'left',
    color: '#000000',
    textShadowColor: 'rgba(0, 0, 0, 0.32)',
    textShadowOffset: {
      width: 0,
      height: 2,
    },
    textShadowRadius: 4,
  },
  flagged: {
    fontSize: 20,
    color: 'red',
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButton: {
    borderRadius: 3,
    backgroundColor: '#4a90e2',
    flex: 1,
    margin: 10,
    alignItems: 'center',
    justifyContent: 'center',
    height: 51,
  },
  rejectButton: {
    borderRadius: 3,
    backgroundColor: '#f7651c',
    flex: 1,
    margin: 10,
    alignItems: 'center',
    justifyContent: 'center',
    height: 51,
  },
  buttonText: {
    fontFamily: 'ApexNew-Book',
    fontSize: 18,
    fontWeight: '500',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlign: 'left',
    color: '#ffffff',
  },
  countsContainer: {
    borderTopColor: '#e3e1e1',
    borderTopWidth: 1,
    paddingTop: 11,
    justifyContent: 'space-evenly',
    flexDirection: 'row',
    width: '100%',
    marginTop: 8,
    borderBottomColor: '#e3e1e1',
    borderBottomWidth: 1,
    paddingBottom: 11,
  },
  countsDescriptionText: {
    fontFamily: 'ApexNew-Book',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
  },
  countsNumberText: {
    fontFamily: 'ApexNew-Book',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
  },
  connectedText: {
    fontFamily: 'ApexNew-Book',
    fontSize: 14,
    color: '#aba9a9',
    fontStyle: 'italic',
  },
});

export default PreviewConnectionScreen;
