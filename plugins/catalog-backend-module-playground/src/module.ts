import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node/alpha';
import { PostsProvider } from './PostsEntityProvider';
import { PostsEntityProcessor } from './PostsEntityProcessor';
import { CommentsProvider } from './CommentsEntityProvider';
import { CommentsEntityProcessor } from './CommentsEntityProcessor';
import { AlbumsProvider } from './AlbumsEntityProvider';
import { AlbumsEntityProcessor } from './AlbumsEntityProcessor';
import { PhotosProvider } from './PhotosEntityProvider';
import { PhotosEntityProcessor } from './PhotosEntityProcessor';
import { TodosProvider } from './TodosEntityProvider';
import { TodosEntityProcessor } from './TodosEntityProcessor';
import { UsersProvider } from './UsersEntityProvider';
import { UsersEntityProcessor } from './UsersEntityProcessor';

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

        // Posts
        const posts = new PostsProvider('dev', taskRunner, logger);
        catalog.addEntityProvider(posts);
        catalog.addProcessor(new PostsEntityProcessor());

        // Comments
        const comments = new CommentsProvider('dev', taskRunner, logger);
        catalog.addEntityProvider(comments);
        catalog.addProcessor(new CommentsEntityProcessor());

        // Albums
        const albums = new AlbumsProvider('dev', taskRunner, logger);
        catalog.addEntityProvider(albums);
        catalog.addProcessor(new AlbumsEntityProcessor());

        // Photos
        const photos = new PhotosProvider('dev', taskRunner, logger);
        catalog.addEntityProvider(photos);
        catalog.addProcessor(new PhotosEntityProcessor());

        // Todos
        const todos = new TodosProvider('dev', taskRunner, logger);
        catalog.addEntityProvider(todos);
        catalog.addProcessor(new TodosEntityProcessor());

        // Users
        const users = new UsersProvider('dev', taskRunner, logger);
        catalog.addEntityProvider(users);
        catalog.addProcessor(new UsersEntityProcessor());
      },
    });
  },
});
