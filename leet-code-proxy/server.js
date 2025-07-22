const express = require('express');
const axios = require('axios');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());

app.post('/leetcode-proxy', async (req, res) => {
  try {
    const response = await axios.post('https://leetcode.com/graphql/', req.body, {
      headers: {
        'Content-Type': 'application/json',
        // You may need to include more headers depending on the request
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(4000, () => console.log('Proxy running on http://localhost:4000'));

