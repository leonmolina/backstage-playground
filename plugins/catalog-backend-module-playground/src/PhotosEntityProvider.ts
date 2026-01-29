import { Entity } from '@backstage/catalog-model';
import {
  EntityProvider,
  EntityProviderConnection,
} from '@backstage/plugin-catalog-node';
import {
  LoggerService,
  SchedulerServiceTaskRunner,
} from '@backstage/backend-plugin-api';
import { Photo } from './types';

/**
 * Provides entities from JSON Placeholder photos service.
 */
export class PhotosProvider implements EntityProvider {
  private readonly env: string;
  private connection?: EntityProviderConnection;
  private taskRunner: SchedulerServiceTaskRunner;
  private photosUrl = 'https://jsonplaceholder.typicode.com/photos';
  private logger: LoggerService;

  constructor(
    env: string,
    taskRunner: SchedulerServiceTaskRunner,
    logger: LoggerService,
  ) {
    this.env = env;
    this.taskRunner = taskRunner;
    this.logger = logger;
  }

  getProviderName(): string {
    return `photos-${this.env}`;
  }

  async connect(connection: EntityProviderConnection): Promise<void> {
    this.connection = connection;
    await this.taskRunner.run({
      id: this.getProviderName(),
      fn: async () => {
        await this.run();
      },
    });
  }

  async run(): Promise<void> {
    if (!this.connection) {
      throw new Error('Not initialized');
    }

    const response = await fetch(this.photosUrl);
    const data = (await response.json()) as Array<Photo>;
    this.logger.info(`Fetched ${data.length} photos from JSON Placeholder`);

    const entities: Entity[] = this.photosToEntities(data);
    this.logger.info(`Converted to ${entities.length} entities`);

    await this.connection.applyMutation({
      type: 'full',
      entities: entities.map(entity => ({
        entity,
        locationKey: `photos-provider:${this.env}`,
      })),
    });
  }

  private photosToEntities(data: Array<Photo>): Entity[] {
    return data.map(photo => ({
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Photo',
      metadata: {
        name: `photo-${photo.id}`,
        title: photo.title,
        annotations: {
          'backstage.io/managed-by-location': `url:${this.photosUrl}/${photo.id}`,
          'backstage.io/managed-by-origin-location': `url:${this.photosUrl}/${photo.id}`,
        },
      },
      spec: {
        id: photo.id,
        albumId: photo.albumId,
        title: photo.title,
        url: photo.url,
        thumbnailUrl: photo.thumbnailUrl,
      },
    }));
  }
}
