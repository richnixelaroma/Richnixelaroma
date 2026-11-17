const { createApp } = require('./src/app');
const { config } = require('./src/config');
const { initializeData } = require('./src/data/store');

initializeData();
const app = createApp();

app.listen(config.port, () => {
  console.log(`Richnixelaroma server started on port ${config.port}`);
});
