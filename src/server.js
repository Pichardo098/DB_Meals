require('dotenv').config();
const app = require('./app');
const { db } = require('./database/config');
const initModel = require('./models/initModel');

db.authenticate()
  .then(() => console.log('Database connected...'))
  .catch((err) => console.log(err));

initModel();

db.sync()
  .then(() => console.log('Database synced...'))
  .catch((err) => console.log(err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server on running on port ${PORT}`);
});
