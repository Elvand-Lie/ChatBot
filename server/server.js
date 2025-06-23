require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const chatRouter = require('./routes/chat');

const app = express();
app.use(cors());
app.use(express.json());

// simple rate‐limit: 100 reqs per hour per IP
app.use(rateLimit({ windowMs: 60*60*1000, max: 100 }));

// serve frontend
app.use(express.static('public'));

// mount chat endpoint
app.use('/api/chat', chatRouter);

// fallback
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`🛡️  Server listening on ${port}`));
