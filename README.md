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

3. Check out the commit which uses actioncable's source code and build the
   app:
   ```sh
   git checkout 96b88c2ea65ed4df40c1d9fa55caf994e6fd3307
   npm install
   NODE_ENV=production npm run build
   ```
   The compiled bundle (`public/main-4e3b9aaeca.js`) is 8315 bytes.

4. Check out the commit which imports the tree-shaking-friendly source and
   build the app:
   ```sh
   git checkout e4a4adc6588e8a91333411bbe9536d9e904b80fe
   NODE_ENV=production npm run build
   ```
   The compiled bundle (`public/main-0e93a28de4.js`) is 7602 bytes.

[actioncable]: https://github.com/rails/rails/tree/v5.2.1/actioncable
[Deploying ES2015+ Code in Production Today]: https://philipwalton.com/articles/deploying-es2015-code-in-production-today/
[webpack-esnext-boilerplate]: https://github.com/philipwalton/webpack-esnext-boilerplate
