import { useEffect } from 'react';
import BaseModel from '../BaseModel';

/**
 * helper useEffect style hook to subscribe/unsubscribe to/from model events
 */
export default function useModelEvent(
  model: typeof BaseModel,
  eventName: string,
  fn: (...args: any) => void,
  deps: React.DependencyList = [],
) {
  return useEffect(() => {
    model.events.on(eventName, fn);

    return () => {
      model.events.off(eventName, fn);
    };
  }, deps);
}
