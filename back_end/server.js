const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
const router = express.Router();

const userRoutes = require('./routes/userRoutes');
const cvRoutes = require('./routes/cvRoutes');
const requestRoutes = require('./routes/requestRoutes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use('/api/user', userRoutes);
app.use('/api/cv', cvRoutes);
app.use('/api/request', requestRoutes);

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
