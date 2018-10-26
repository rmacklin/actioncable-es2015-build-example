This is a demo repository to show the benefits of publishing [actioncable]'s
source code along with its compiled code.

It is based on the [webpack-esnext-boilerplate] repository which demostrates the
techniques described in Philip Walton's article:
[Deploying ES2015+ Code in Production Today].

Switching this app from depending on actioncable's compiled code to its source
code shrinks this app's javascript bundle for modern browsers from `10.6K` to
`7.4K`.

To verify this result:

1. Clone the repository and install its dependencies:
   ```sh
   git clone git@github.com:rmacklin/actioncable-es2015-build-example.git
   cd actioncable-es2015-build-example
   ```

2. Check out the commit which uses the existing actioncable package and build
   the app:
   ```sh
   git checkout 90a4ddbc76962a174ccae3e15bda5f32b7143c86
   npm install
   NODE_ENV=production npm run build
   ```
   The compiled bundle (`public/main-5b2c79757f.js`) is 10877 bytes.

3. Check out the commit which uses actioncable's source code and build the
   app:
   ```sh
   git checkout 278154577d85e9e8f3231b1d268d12f8a3fd49af
   npm install
   NODE_ENV=production npm run build
   ```
   The compiled bundle (`public/main-c688365013.js`) is 8354 bytes.

4. Check out the commit which directly imports `createConsumer` and build the
   app:
   ```sh
   git checkout d494d6bf160042ca218bf3bd7aae6c1929492e0b
   NODE_ENV=production npm run build
   ```
   The compiled bundle (`public/main-1b880f4692.js`) is 7625 bytes.

[actioncable]: https://github.com/rails/rails/tree/v5.2.1/actioncable
[Deploying ES2015+ Code in Production Today]: https://philipwalton.com/articles/deploying-es2015-code-in-production-today/
[webpack-esnext-boilerplate]: https://github.com/philipwalton/webpack-esnext-boilerplate
