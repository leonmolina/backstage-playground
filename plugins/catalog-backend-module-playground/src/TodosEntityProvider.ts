import { Entity } from '@backstage/catalog-model';
import {
  EntityProvider,
  EntityProviderConnection,
} from '@backstage/plugin-catalog-node';
import {
  LoggerService,
  SchedulerServiceTaskRunner,
} from '@backstage/backend-plugin-api';
import { Todo } from './types';

/**
 * Provides entities from JSON Placeholder todos service.
 */
export class TodosProvider implements EntityProvider {
  private readonly env: string;
  private connection?: EntityProviderConnection;
  private taskRunner: SchedulerServiceTaskRunner;
  private todosUrl = 'https://jsonplaceholder.typicode.com/todos';
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
    return `todos-${this.env}`;
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

    const response = await fetch(this.todosUrl);
    const data = (await response.json()) as Array<Todo>;
    this.logger.info(`Fetched ${data.length} todos from JSON Placeholder`);

    const entities: Entity[] = this.todosToEntities(data);
    this.logger.info(`Converted to ${entities.length} entities`);

    await this.connection.applyMutation({
      type: 'full',
      entities: entities.map(entity => ({
        entity,
        locationKey: `todos-provider:${this.env}`,
      })),
    });
  }

  private todosToEntities(data: Array<Todo>): Entity[] {
    return data.map(todo => ({
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Todo',
      metadata: {
        name: `todo-${todo.id}`,
        title: todo.title,
        annotations: {
          'backstage.io/managed-by-location': `url:${this.todosUrl}/${todo.id}`,
          'backstage.io/managed-by-origin-location': `url:${this.todosUrl}/${todo.id}`,
        },
      },
      spec: {
        id: todo.id,
        userId: todo.userId,
        title: todo.title,
        completed: todo.completed,
      },
    }));
  }
}
