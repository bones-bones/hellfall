//https://usehooks.com/useKeyPress/

import { useEffect, useState } from 'react';

export const useKeyPress = (targetCode: string) => {
  const [keyPressed, setKeyPressed] = useState<boolean>(false);
  // If pressed key is our target key then set to true
  function downHandler({ code }: KeyboardEvent) {
    if (code === targetCode) {
      setKeyPressed(true);
    }
  }
  // If released key is our target key then set to false
  function upHandler({ code }: KeyboardEvent) {
    if (code === targetCode) {
      setKeyPressed(false);
    }
  }
  // Add event listeners
  useEffect(() => {
    window.addEventListener('keydown', downHandler);
    window.addEventListener('keyup', upHandler);
    // Remove event listeners on cleanup
    return () => {
      window.removeEventListener('keydown', downHandler);
      window.removeEventListener('keyup', upHandler);
    };
  }, []); // Empty array ensures that effect is only run on mount and unmount
  return keyPressed;
};
