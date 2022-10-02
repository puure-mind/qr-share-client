import React, { ReactElement } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Container,
  Typography,
} from '@mui/material';
import { Link, BrowserRouter as Router } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
const Title = 'QrShare';

const App: React.FC = (): ReactElement => {
  return (
    <>
      <Helmet>
        <title>{Title}</title>
      </Helmet>
      <Router>
        <Container
          maxWidth={false}
          disableGutters
          sx={{
            height: '100vh',
            backgroundColor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box
            sx={{
              width: 0.5,
              height: 0.7,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Card
              raised
              sx={{
                p: 1,
                width: 1,
                height: 1,
                display: 'flex',
                flexFlow: 'column',
                justifyContent: 'center',
                '&': { borderRadius: '20px' },
              }}
            >
              <CardMedia
                component='div'
                sx={{ flexGrow: 0.7, pt: 1, width: 1, height: 0.7 }}
              >
                <QRCodeSVG
                  value='https://socket.io/docs/v4/'
                  style={{
                    width: '100%',
                    height: '100%',
                  }}
                />
              </CardMedia>
              <CardContent sx={{ flexGrow: 0.1 }}>
                <Typography variant='h4' textAlign='center'>
                  personal link:{' '}
                  <Link to='socket.io/docs/v4/'>socket.io/docs/v4/</Link>
                </Typography>
              </CardContent>
              <CardActions
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  flexGrow: 0.2,
                }}
              >
                <Button size='large' variant='contained'>
                  Go
                </Button>
              </CardActions>
            </Card>
          </Box>
        </Container>
      </Router>
    </>
  );
};

export default App;
