import React, { ReactElement } from 'react';
import { TimerView } from './Components/TimerView';
import { Helmet } from 'react-helmet-async';
import timer from './store/Timer';
import { Box, Container } from '@mui/material';

const Title = 'QrShare';

const App: React.FC = (): ReactElement => {
  return (
    <>
      <Helmet>
        <title>{Title}</title>
      </Helmet>
      <Container maxWidth='xl' disableGutters>
        <Box sx={{ backgroundColor: 'primary.light' }}>
          <TimerView timer={timer} />
        </Box>
      </Container>
    </>
  );
};

export default App;
