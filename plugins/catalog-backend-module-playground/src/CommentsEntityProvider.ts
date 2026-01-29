import { Entity } from '@backstage/catalog-model';
import {
  EntityProvider,
  EntityProviderConnection,
} from '@backstage/plugin-catalog-node';
import {
  LoggerService,
  SchedulerServiceTaskRunner,
} from '@backstage/backend-plugin-api';
import { Comment } from './types';

/**
 * Provides entities from JSON Placeholder comments service.
 */
export class CommentsProvider implements EntityProvider {
  private readonly env: string;
  private connection?: EntityProviderConnection;
  private taskRunner: SchedulerServiceTaskRunner;
  private commentsUrl = 'https://jsonplaceholder.typicode.com/comments';
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
    return `comments-${this.env}`;
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

    const response = await fetch(this.commentsUrl);
    const data = (await response.json()) as Array<Comment>;
    this.logger.info(`Fetched ${data.length} comments from JSON Placeholder`);

    const entities: Entity[] = this.commentsToEntities(data);
    this.logger.info(`Converted to ${entities.length} entities`);

    await this.connection.applyMutation({
      type: 'full',
      entities: entities.map(entity => ({
        entity,
        locationKey: `comments-provider:${this.env}`,
      })),
    });
  }

  private commentsToEntities(data: Array<Comment>): Entity[] {
    return data.map(comment => ({
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Comment',
      metadata: {
        name: `comment-${comment.id}`,
        description: comment.body,
        annotations: {
          'backstage.io/managed-by-location': `url:${this.commentsUrl}/${comment.id}`,
          'backstage.io/managed-by-origin-location': `url:${this.commentsUrl}/${comment.id}`,
        },
      },
      spec: {
        id: comment.id,
        postId: comment.postId,
        name: comment.name,
        email: comment.email,
        body: comment.body,
      },
    }));
  }
}
