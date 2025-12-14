const express = require('express');
const cors = require('cors');
const app = express();
const port = 3030;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Maze Game Server Running');
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
