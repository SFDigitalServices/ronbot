const config = require('./config.js');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const port = config.PORT;

const slackEventsRouter = require('./routes/slack-events');
const slacKInteractiveRouter = require('./routes/slack-interactive');

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.get('/', (req, res) => {
  res.send('hi');
});

app.use('/slack-events', slackEventsRouter);
app.use('/slack-interactive', slacKInteractiveRouter);

app.listen(port, () => console.log(`app listening on port ${port}!`));