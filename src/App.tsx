import React, { ReactElement } from 'react';
import { TimerView } from './Components/TimerView';
import Timer from './Components/Timer';
import { Helmet } from 'react-helmet';

const myTimer: Timer = new Timer();

const Title = 'QrShare';

setInterval(() => {
  myTimer.increase();
}, 1000);

const App: React.FC = (): ReactElement => {
  return (
    <>
      <Helmet>
        <title>{Title}</title>
      </Helmet>
      <div className='App'>
        <TimerView timer={myTimer} />
      </div>
    </>
  );
};

export default App;
