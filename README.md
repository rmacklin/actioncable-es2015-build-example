This is a demo repository to show the benefits of publishing [actioncable]'s
source code along with its compiled code.

It is based on the [webpack-esnext-boilerplate] repository which demostrates the
techniques described in Philip Walton's article:
[Deploying ES2015+ Code in Production Today].

Switching this app from depending on actioncable's compiled code to its source
code shrinks this app's javascript bundle for modern browsers from `10.6K` to
`7.4K`.

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

3. Check out the commit which uses actioncable's compiled code from
   [rails/rails#34370] and build the app:
   ```sh
   git checkout a38e750e2a8865fb221b89aaa8139f2df1748735
   npm install
   NODE_ENV=production npm run build
   ```
   The compiled bundle (`public/main-53b26e8172.js`) is 10203 bytes.

4. Check out the commit which uses actioncable's source code and build the
   app:
   ```sh
   git checkout 3e4aa2cac00e7363144bd2ed4a2e0400e82f3dfa
   NODE_ENV=production npm run build
   ```
   The compiled bundle (`public/main-d63fd732fc.js`) is 7602 bytes.

[actioncable]: https://github.com/rails/rails/tree/v5.2.1/actioncable
[Deploying ES2015+ Code in Production Today]: https://philipwalton.com/articles/deploying-es2015-code-in-production-today/
[rails/rails#34370]: https://github.com/rails/rails/pull/34370
[webpack-esnext-boilerplate]: https://github.com/philipwalton/webpack-esnext-boilerplate
