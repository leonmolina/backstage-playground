import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';

export const catalogModulePlayground = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'playground',
  register(reg) {
    reg.registerInit({
      deps: { logger: coreServices.logger },
      async init({ logger }) {
        logger.info('Hello World!');
      },
    });
  },
});
