import { useContext } from 'react';
import { AppStateContext, AppStateContextType } from '../contexts/AppStateContext';

export const useAppState = (): AppStateContextType => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};

export default useAppState;
// Comment: Type safety hooks make context interaction clean and uniform
