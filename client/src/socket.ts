// src/socket.ts
import {Socket} from 'phoenix';

const socket = new Socket('ws://localhost:4000/socket', {
  params: {userToken: '123'},
});
socket.connect();

const channel = socket.channel('drawing:lobby', {});

// channel
//   .join()
//   .receive('ok', (response) => {
//     console.log('Joined successfully', response);
//   })
//   .receive('error', (response) => {
//     console.log('Unable to join', response);
//   });

export default channel;
