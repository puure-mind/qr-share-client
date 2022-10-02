import React, { ReactElement } from 'react';
import { Helmet } from 'react-helmet-async';
import { Box, Card, CardMedia, Container } from '@mui/material';

const Title = 'QrShare';

const App: React.FC = (): ReactElement => {
  return (
    <>
      <Helmet>
        <title>{Title}</title>
      </Helmet>
      <Container maxWidth='xl' disableGutters sx={{ height: '100vh' }}>
        <Box
          sx={{
            backgroundColor: 'primary.main',
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Card
            raised
            sx={{
              p: 1,
              boxSizing: 'border-box',
              width: 0.5,
              height: 0.5,
              '&': { borderRadius: '20px' },
            }}
          >
            <CardMedia component='img' height='140' image='' />
          </Card>
          {/* <TimerView timer={timer} /> */}
        </Box>
      </Container>
    </>
  );
};

export default App;
