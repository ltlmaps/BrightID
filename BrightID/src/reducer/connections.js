// @flow

import { find, propEq, mergeRight } from 'ramda';
import {
  SET_CONNECTIONS,
  CONNECTIONS_SORT,
  UPDATE_CONNECTIONS,
  DELETE_CONNECTION,
  ADD_CONNECTION,
  ADD_TRUSTED_CONNECTION,
  REMOVE_TRUSTED_CONNECTION,
  HYDRATE_CONNECTIONS,
} from '@/actions';

export const initialState = {
  connections: [],
  trustedConnections: [],
  connectionsSort: '',
};

export const reducer = (
  state: ConnectionsState = initialState,
  action: action,
) => {
  switch (action.type) {
    case SET_CONNECTIONS: {
      return {
        ...state,
        connections: action.connections.slice(0),
      };
    }
    case UPDATE_CONNECTIONS: {
      return {
        ...state,
        connections: state.connections.map<connection>((conn: connection) => {
          const updatedConn = find(propEq('id', conn.id))(action.connections);
          if (!updatedConn) {
            if (conn.status === 'verified') conn.status = 'Deleted';
            return conn;
          } else {
            if (conn.status === 'initiated' || !conn.status)
              conn.status = 'verified';
            return mergeRight(conn, updatedConn);
          }
        }),
      };
    }
    case ADD_CONNECTION: {
      if (!action.connection.id) return state;
      const removeExisting = ({ id }: connection) =>
        id !== action.connection.id;
      console.log('adding connection', action.connection.id);
      return {
        ...state,
        connections: [
          action.connection,
          ...state.connections.filter(removeExisting),
        ],
      };
    }
    case DELETE_CONNECTION: {
      const connections: connection[] = state.connections.filter(
        (conn: connection) => conn.id !== action.id,
      );
      return {
        ...state,
        connections,
      };
    }
    case CONNECTIONS_SORT: {
      return {
        ...state,
        connectionsSort: action.connectionsSort,
      };
    }
    case ADD_TRUSTED_CONNECTION: {
      return {
        ...state,
        trustedConnections: [...state.trustedConnections, action.id],
      };
    }
    case REMOVE_TRUSTED_CONNECTION: {
      const trustedConnections: string[] = state.trustedConnections.filter(
        (id) => id !== action.id,
      );
      return {
        ...state,
        trustedConnections,
      };
    }
    case HYDRATE_CONNECTIONS: {
      if (!action.data.connections || !action.data.trustedConnections)
        return state;

      return { ...action.data };
    }
    default: {
      return state;
    }
  }
};

export default reducer;
