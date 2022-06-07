const config = require('./config.js');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const port = config.PORT;

const slackEventsRouter = require('./routes/slack-events');
const slacKInteractiveRouter = require('./routes/slack-interactive');
const debugRouter = require('./routes/debug');
const ghostinspectorRouter = require('./routes/ghost-inspector');
const webhooksRouter = require('./routes/webhooks');
const buildsRouter = require('./routes/builds');

const acronyms = require('./commands/acronym')

app.use(bodyParser.json({limit: '50mb'})); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.use('/slack-events', slackEventsRouter);
app.use('/slack-interactive', slacKInteractiveRouter);
app.use('/debug', debugRouter);
app.use('/ghost-inspector', ghostinspectorRouter);
app.use('/webhooks', webhooksRouter);
app.use('/builds', buildsRouter);

app.use('/favicon.ico', express.static('images/favicon.ico'));
app.use(express.static('public'));

app.set('views', './views');
app.set('view engine', 'pug');

app.get('/', (req, res) => {
  res.send('hi');
});

acronyms.load()

app.listen(port, () => console.log(`app listening on port ${port}!`));
