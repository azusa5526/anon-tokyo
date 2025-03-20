import router from './index';
import { driver } from 'driver.js';

router.beforeEach(async (to) => {
  const driverInstance = driver();
  if (driverInstance.isActive()) {
    driverInstance.destroy();
  }
});
