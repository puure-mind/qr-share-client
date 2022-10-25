interface RtcServer {
  urls: string;
  credential?: string;
  username?: string;
}

type RtcServers = RtcServer[];

export const getRtcServers = (): RtcServers => {
  const credential = process.env.REACT_APP_TURN_CREDENTIAL;
  const username = process.env.REACT_APP_TURN_USER;

  // console.log(credential);
  // console.log(username);

  let turn = { urls: 'turn:test.posterc.kz:3478' };
  if (credential != null && username != null) {
    turn = { ...turn, ...{ credential, username } };
  }

  // console.log([{ urls: 'stun:stun.l.google.com:19302' }, { ...turn }]);

  return [{ urls: 'stun:stun.l.google.com:19302' }, { ...turn }];
};
