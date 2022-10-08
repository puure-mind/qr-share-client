interface RtcServer {
  urls: string;
  credential?: string;
  username?: string;
}

type RtcServers = RtcServer[];

export const getRtcServers = (): RtcServers => {
  const turnCredentials = process.env.REACT_APP_TURN_CREDENTIALS;
  let turn = { urls: 'turn:test.posterc.kz:3478' };
  if (turnCredentials != null) {
    turn = { ...turn, ...JSON.parse(turnCredentials) };
  }

  return [{ urls: 'stun:stun.l.google.com:19302' }, { ...turn }];
};
