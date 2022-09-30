import React from 'react';
import { observer } from 'mobx-react-lite';
import Timer from '../store/Timer';

interface Props {
  timer: typeof Timer;
}

export const TimerView = observer<Props>(({ timer }) => {
  return <span>Seconds: {timer.secondsPassed}</span>;
});
