import { Entity } from '@backstage/catalog-model';
import {
  EntityProvider,
  EntityProviderConnection,
} from '@backstage/plugin-catalog-node';
import {
  LoggerService,
  SchedulerServiceTaskRunner,
} from '@backstage/backend-plugin-api';
import { Album } from './types';

/**
 * Provides entities from JSON Placeholder albums service.
 */
export class AlbumsProvider implements EntityProvider {
  private readonly env: string;
  private connection?: EntityProviderConnection;
  private taskRunner: SchedulerServiceTaskRunner;
  private albumsUrl = 'https://jsonplaceholder.typicode.com/albums';
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
    return `albums-${this.env}`;
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

    const response = await fetch(this.albumsUrl);
    const data = (await response.json()) as Array<Album>;
    this.logger.info(`Fetched ${data.length} albums from JSON Placeholder`);

    const entities: Entity[] = this.albumsToEntities(data);
    this.logger.info(`Converted to ${entities.length} entities`);

    await this.connection.applyMutation({
      type: 'full',
      entities: entities.map(entity => ({
        entity,
        locationKey: `albums-provider:${this.env}`,
      })),
    });
  }

  private albumsToEntities(data: Array<Album>): Entity[] {
    return data.map(album => ({
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Album',
      metadata: {
        name: `album-${album.id}`,
        title: album.title,
        annotations: {
          'backstage.io/managed-by-location': `url:${this.albumsUrl}/${album.id}`,
          'backstage.io/managed-by-origin-location': `url:${this.albumsUrl}/${album.id}`,
        },
      },
      spec: {
        id: album.id,
        userId: album.userId,
        title: album.title,
      },
    }));
  }
}
