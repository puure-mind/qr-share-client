import React from 'react';
import { Helmet } from 'react-helmet-async';

import { observer } from 'mobx-react-lite';
import { ReceiverView } from './Pages/ReceiverPage/ReceiverView';
import { Routes, Route } from 'react-router-dom';
import { SenderView } from './Pages/SenderPage/SenderView';

const Title = 'QrShare';

const App: React.FC = observer(() => {
  return (
    <>
      <Helmet>
        <title>{Title}</title>
      </Helmet>
      <Routes>
        <Route path='/' element={<ReceiverView />} />
        <Route path='/signaling' element={<SenderView />}>
          <Route path=':id' element={<SenderView />} />
        </Route>
      </Routes>
    </>
  );
});

export default App;
