import { Entity } from '@backstage/catalog-model';
import {
  EntityProvider,
  EntityProviderConnection,
} from '@backstage/plugin-catalog-node';
import {
  LoggerService,
  SchedulerServiceTaskRunner,
} from '@backstage/backend-plugin-api';
import { User } from './types';

/**
 * Provides entities from JSON Placeholder users service.
 */
export class UsersProvider implements EntityProvider {
  private readonly env: string;
  private connection?: EntityProviderConnection;
  private taskRunner: SchedulerServiceTaskRunner;
  private usersUrl = 'https://jsonplaceholder.typicode.com/users';
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
    return `users-${this.env}`;
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

    const response = await fetch(this.usersUrl);
    const data = (await response.json()) as Array<User>;
    this.logger.info(`Fetched ${data.length} users from JSON Placeholder`);

    const entities: Entity[] = this.usersToEntities(data);
    this.logger.info(`Converted to ${entities.length} entities`);

    await this.connection.applyMutation({
      type: 'full',
      entities: entities.map(entity => ({
        entity,
        locationKey: `users-provider:${this.env}`,
      })),
    });
  }

  private usersToEntities(data: Array<User>): Entity[] {
    return data.map(user => ({
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'JsonPlaceholderUser',
      metadata: {
        name: `user-${user.id}`,
        title: user.name,
        description: `${user.username} - ${user.email}`,
        annotations: {
          'backstage.io/managed-by-location': `url:${this.usersUrl}/${user.id}`,
          'backstage.io/managed-by-origin-location': `url:${this.usersUrl}/${user.id}`,
        },
      },
      spec: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        website: user.website,
        address: {
          street: user.address.street,
          suite: user.address.suite,
          city: user.address.city,
          zipcode: user.address.zipcode,
          geo: user.address.geo,
        },
        company: {
          name: user.company.name,
          catchPhrase: user.company.catchPhrase,
          bs: user.company.bs,
        },
      },
    }));
  }
}
