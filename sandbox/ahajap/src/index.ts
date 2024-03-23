
import express from 'express';

const app = express();
const PORT = 3000;

app.use(express.json());

app.post('/api/v1/developer', (req, res) => {
  const { content } = req.body;
  console.log(content);
  res.send('Message received');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
