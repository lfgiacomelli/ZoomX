import * as Font from 'expo-font';
import { useEffect, useState } from 'react';

export default function useInterFont() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function loadFont() {
      await Font.loadAsync({
        Light: require('@fonts/Inter_18pt-Light.ttf'),
      });
      setLoaded(true);
    }

    loadFont();
  }, []);

  return loaded;
}
