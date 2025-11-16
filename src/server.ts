import { createApp } from './app';
import { logger } from './utils/logger';

const PORT = process.env.PORT || 3001;

const app = createApp();

app.listen(PORT, () => {
  logger.info(`Server is running on http://localhost:${PORT}`);
});

