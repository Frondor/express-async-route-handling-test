const express = require('express');
const app = express();
const port = 3000;

/**
 * Resultados de testing esperados:
 * http://localhost:3000/ -> HTML: Hello World!
 * http://localhost:3000/user/1 -> JSON: {id, name}
 * http://localhost:3000/user/2 -> unhandled rejection
 * http://localhost:3000/user/3 -> throw error (crash app)
 * http://localhost:3000/handled/1 -> JSON: {id, name}
 * http://localhost:3000/handled/2 -> HTML: Error view
 * http://localhost:3000/handled/3 -> throw error (crash app)
 */

const findUser = async (id) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id == 1) {
        resolve({ id, name: 'jon' });
      } else if (id == 2) {
        reject(new Error('Unknown User'));
      } else {
        throw new Error('Crash the app');
      }
    }, 500);
  });

const userHandler = async (req, res) => {
  const user = await findUser(req.params.id);
  res.send(user);
};

const asyncHandlerError = async (req, res, next) => {
  throw new Error('Error in async (unhandled rejection)');
};

const syncHandlerError = (req, res, next) => {
  throw new Error('Error in sync (catched by error handler)');
};

const wrap = (fn) => (...args) => fn(...args).catch(args[2]);

app.get('/', (req, res) => res.send('Hello World!'));
app.get('/user/:id', userHandler);
app.get('/handled/:id', wrap(userHandler));
app.get('/unhandled', asyncHandlerError); // not catched by error handler
app.get('/unhandled-patched', wrap(asyncHandlerError)); // catched
app.get('/catched-by-error-handler', syncHandlerError); // catched

/**
 * Error middleware
 */
app.use((err, req, res, next) => {
  console.log('ERROR HANDLER:', err);
  res.send(`
    <h1>Error view</h1>
    <hr>
    <pre>
    ${err.stack}
    </pre>
  `);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
