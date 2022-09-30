import React, { ReactElement } from 'react';
import { TimerView } from './Components/TimerView';
import Timer from './Components/Timer';

const myTimer: Timer = new Timer();

setInterval(() => {
  myTimer.increase();
}, 1000);

const App: React.FC = (): ReactElement => {
  return (
    <div className='App'>
      <TimerView timer={myTimer} />
    </div>
  );
};

export default App;
