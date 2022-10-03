import React, { useContext } from 'react';
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
import { Link, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { observer } from 'mobx-react-lite';
import RootStoreContext from './store/RootStoreProvider';
import { RootStore } from './store/rootStore';

const Title = 'QrShare';

const App: React.FC = observer(() => {
  const navigate = useNavigate();
  const rootStore = useContext<RootStore>(RootStoreContext);

  const refreshLink = (): void => {
    rootStore.refreshLink();
  };

  const goToLink = (): void => {
    navigate(rootStore.link);
    rootStore.testConnection();
  };

  return (
    <>
      <Helmet>
        <title>{Title}</title>
      </Helmet>

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
                value={rootStore.link}
                style={{
                  width: '100%',
                  height: '100%',
                }}
              />
            </CardMedia>
            <CardContent sx={{ flexGrow: 0.1 }}>
              <Typography variant='h4' textAlign='center'>
                personal link:
                <Link to={rootStore.link}>{rootStore.link}</Link>
              </Typography>
              <Typography>{rootStore.connectionAnswer}</Typography>
            </CardContent>
            <CardActions
              sx={{
                display: 'flex',
                justifyContent: 'center',
                flexGrow: 0.2,
              }}
            >
              <Button onClick={goToLink} size='large' variant='contained'>
                Go
              </Button>
              <Button
                onClick={refreshLink}
                size='large'
                variant='contained'
                color='secondary'
              >
                Refresh
              </Button>
            </CardActions>
          </Card>
        </Box>
      </Container>
    </>
  );
});

export default App;
