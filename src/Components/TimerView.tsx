import React from 'react';
import { observer } from 'mobx-react-lite';
import Timer from './Timer';

interface Props {
  timer: Timer;
}

export const TimerView = observer<Props>(({ timer }) => {
  return <span>Seconds: {timer.secondsPassed}</span>;
});
