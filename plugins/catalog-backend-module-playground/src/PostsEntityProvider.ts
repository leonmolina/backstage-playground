import { Entity } from '@backstage/catalog-model';
import {
  EntityProvider,
  EntityProviderConnection,
} from '@backstage/plugin-catalog-node';
import {
  LoggerService,
  SchedulerServiceTaskRunner,
} from '@backstage/backend-plugin-api';
import { Post } from './types';

/**
 * Provides entities from JSON Placeholder posts service.
 * Based on https://backstage.io/docs/features/software-catalog/external-integrations#creating-an-entity-provider
 */
export class PostsProvider implements EntityProvider {
  private readonly env: string;
  private connection?: EntityProviderConnection;
  private taskRunner: SchedulerServiceTaskRunner;
  private postsUrl = 'https://jsonplaceholder.typicode.com/posts';
  private logger: LoggerService

  /** [1] */
  constructor(
    env: string,
    taskRunner: SchedulerServiceTaskRunner,
    logger: LoggerService
  ) {
    this.env = env;
    this.taskRunner = taskRunner;
    this.logger = logger;
  }

  /** [2] */
  getProviderName(): string {
    return `posts-${this.env}`;
  }

  /** [3] */
  async connect(connection: EntityProviderConnection): Promise<void> {
    this.connection = connection;
    await this.taskRunner.run({
      id: this.getProviderName(),
      fn: async () => {
        await this.run();
      },
    });
  }

  /** [4] */
  async run(): Promise<void> {
    if (!this.connection) {
      throw new Error('Not initialized');
    }

    const response = await fetch(
      `https://jsonplaceholder.typicode.com/posts`,
    );
    const data = await response.json() as Array<Post>;
    this.logger.info(`Fetched ${data.length} posts from JSON Placeholder`);

    /** [5] */
    const entities: Entity[] = this.postsToEntities(data);
    this.logger.info(`Converted to ${entities.length} entities`);

    /** [6] */
    await this.connection.applyMutation({
      type: 'full',
      entities: entities.map(entity => ({
        entity,
        locationKey: `posts-provider:${this.env}`,
      })),
    });
  }

  private postsToEntities(data: Array<Post>): Entity[] {
    return data.map(post => ({
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Post',
      metadata: {
        name: `post-${post.id}`,
        description: post.body,
        annotations: {
          'backstage.io/managed-by-location': `url:${this.postsUrl}/${post.id}`,
          'backstage.io/managed-by-origin-location': `url:${this.postsUrl}/${post.id}`,
        },
      },
      spec: {
        id: post.id,
        title: post.title,
        content: post.body,
      },
    }));
  }
}
