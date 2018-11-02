import * as ActionCable from 'actioncable';

let cable = ActionCable.createConsumer('wss://cable.example.com');

cable.subscriptions.create('AppearanceChannel', {
  // normal channel code goes here...
});

