import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Coordinate } from '@/types/coordinate';

interface CoordinateState {
  coordinates: Coordinate[];
}

type CoordinateAction = 
  | { type: 'ADD_COORDINATE'; payload: Coordinate }
  | { type: 'CLEAR_COORDINATES' };

const initialState: CoordinateState = {
  coordinates: []
};

const CoordinateContext = createContext<{
  state: CoordinateState;
  dispatch: React.Dispatch<CoordinateAction>;
} | undefined>(undefined);

function coordinateReducer(state: CoordinateState, action: CoordinateAction): CoordinateState {
  switch (action.type) {
    case 'ADD_COORDINATE':
      return {
        ...state,
        coordinates: [...state.coordinates, action.payload]
      };
    case 'CLEAR_COORDINATES':
      return {
        ...state,
        coordinates: []
      };
    default:
      return state;
  }
}

export function CoordinateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(coordinateReducer, initialState);

  return (
    <CoordinateContext.Provider value={{ state, dispatch }}>
      {children}
    </CoordinateContext.Provider>
  );
}

export function useCoordinate() {
  const context = useContext(CoordinateContext);
  if (context === undefined) {
    throw new Error('useCoordinate must be used within a CoordinateProvider');
  }
  return context;
} 