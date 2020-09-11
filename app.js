const config = require('./config.js');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const port = config.PORT;

const slackEventsRouter = require('./routes/slack-events');
const slacKInteractiveRouter = require('./routes/slack-interactive');
const debugRouter = require('./routes/debug');
const ghostinspectorRouter = require('./routes/ghost-inspector');

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.use('/slack-events', slackEventsRouter);
app.use('/slack-interactive', slacKInteractiveRouter);
app.use('/debug', debugRouter);
app.use('/ghost-inspector', ghostinspectorRouter);

app.use(express.static('public'));

app.set('views', './views');
app.set('view engine', 'pug');

app.get('/', (req, res) => {
  res.send('hi');
});

app.listen(port, () => console.log(`app listening on port ${port}!`));
