const { app } = require('./server');

const port = 3000;

app.listen(port, () => {
  console.info(`server started on ${port}`);
});
