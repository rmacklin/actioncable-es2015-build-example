Switching this app from depending on the CoffeeScript-compiled code of
[actioncable v5.2.1] to the ES2015-compiled code of [rails/rails#34177] shrinks
this app's javascript bundle from `10.6K` to `10.1K`.

To verify this result:

1. Clone the repository:
   ```sh
   git clone git@github.com:rmacklin/actioncable-es2015-build-example.git
   cd actioncable-es2015-build-example
   ```

2. Check out the commit which uses the existing actioncable package and build
   the app:
   ```sh
   git checkout d3706b043ef02bb577aa4fbb74377334d9d075e7
   npm install
   NODE_ENV=production npm run build
   ```
   The compiled bundle (`public/main-5b2c79757f.js`) is 10877 bytes.

3. Check out the commit which uses actioncable from [rails/rails#34177] and
   build the app:
   ```sh
   git checkout b3a4eaa582eccb11273f1cf77c72bf64ad441dbe
   npm install
   NODE_ENV=production npm run build
   ```
   The compiled bundle (`public/main-f67c3b29dc.js`) is 10331 bytes.

[actioncable v5.2.1]: https://github.com/rails/rails/tree/v5.2.1/actioncable
[rails/rails#34177]: https://github.com/rails/rails/pull/34177
