import {createConsumer} from 'actioncable/action_cable';

let cable = createConsumer('wss://cable.example.com');

cable.subscriptions.create('AppearanceChannel', {
  // normal channel code goes here...
});

