import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node/alpha';
import { PostsProvider } from './PostsEntityProvider';
import { PostsEntityProcessor } from './PostsEntityProcessor';

export const catalogModulePlayground = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'playground',
  register(reg) {
    reg.registerInit({
      deps: {
        catalog: catalogProcessingExtensionPoint,
        logger: coreServices.logger,
        scheduler: coreServices.scheduler,
      },
      async init({ catalog, scheduler, logger }) {
        const taskRunner = scheduler.createScheduledTaskRunner({
          frequency: { minutes: 1 },
          timeout: { minutes: 1 },
        });
        const posts = new PostsProvider('dev', taskRunner, logger);
        catalog.addEntityProvider(posts);
        catalog.addProcessor(new PostsEntityProcessor());
      },
    });
  },
});
