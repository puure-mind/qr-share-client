import React, { useContext, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Container,
  TextField,
  Typography,
} from '@mui/material';
import RootStoreContext, { RootContext } from '../../store/RootStoreProvider';
import { useForm, Controller } from 'react-hook-form';

export const SenderView = observer(() => {
  const [search] = useSearchParams();
  const receiverId = search.get('id');
  const rootStore = useContext<RootContext>(RootStoreContext);

  const { control, getValues } = useForm({
    defaultValues: {
      receiver: receiverId,
      files: [],
    },
  });
  if (rootStore === null) return <></>;

  const rtcConnect = (): void => {
    rootStore.sendInvite();
  };

  useEffect(() => {
    receiverId !== null && rootStore.connectToReceiver(receiverId);
    // rtcConnect();

    return () => {
      rootStore.disconnectSignaling();
    };
  }, [receiverId, rootStore]);

  const sendToRemote = (): void => {
    rootStore.sendMessage('hello from sender');
  };

  const reconnect = (): void => {
    const receiver = getValues('receiver');
    if (receiver !== null) rootStore.connectToReceiver(receiver);

    rtcConnect();
  };

  const sendFile = (): void => {
    const files = getValues('files');

    if (files?.length !== 0) {
      void parseFile(files[0]);
    }
  };

  const parseFile = async (file: File): Promise<void> => {
    console.log(file);
    const buffer = await file.arrayBuffer();
    const bytes = new Int8Array(buffer);
    console.log(bytes);
    //
    receiveFile(bytes);
  };

  const receiveFile = (bytes: Int8Array): void => {
    const blob: BlobPart[] = [];
    blob.push(bytes);
    const receivedFile = new File(blob, 'received.jpg');

    const downloadUrl = window.URL.createObjectURL(receivedFile);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = receivedFile.name;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <>
      <Container
        maxWidth={false}
        disableGutters
        sx={{
          height: '100vh',
          backgroundColor: 'grey.500',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Card
          raised
          sx={{
            p: 1,
            width: 0.5,
            height: 0.5,
            display: 'flex',
            flexFlow: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            '&': { borderRadius: '20px' },
          }}
        >
          <CardContent>
            <Box>
              <Typography>{rootStore.signalingStatus}</Typography>
              <Typography>{rootStore.rtcStatus}</Typography>
            </Box>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                py: 2,
              }}
            >
              <Controller
                control={control}
                name='receiver'
                render={({ field }: { field: any }) => (
                  <TextField
                    {...field}
                    label='Receiver Id: '
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
              <Button onClick={reconnect}>Reconnect</Button>
            </Box>
            <Controller
              control={control}
              name='files'
              render={({ field }: { field: any }) => (
                <input
                  type='file'
                  {...field}
                  value={field.value.filename}
                  onChange={(e) => field.onChange(e.target.files)}
                />
              )}
            />
          </CardContent>
          <CardActions>
            <Button onClick={sendToRemote}>Send msg</Button>
            <Button onClick={sendFile}>Send file</Button>
          </CardActions>
        </Card>
      </Container>
    </>
  );
});
