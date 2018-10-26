import * as ActionCable from 'actioncable/action_cable';

let cable = ActionCable.createConsumer('wss://cable.example.com');

cable.subscriptions.create('AppearanceChannel', {
  // normal channel code goes here...
});

