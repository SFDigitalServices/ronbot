const acronyms = require('./commands/acronym')

if(process.env.NODE_ENV === 'undefined' || process.env.NODE_ENV !== 'production') require('dotenv').config();
const fs = require('fs');
fs.writeFile(process.env.GOOGLE_APPLICATION_CREDENTIALS, process.env.GOOGLE_CONFIG, (err) => {});

acronyms.load();
