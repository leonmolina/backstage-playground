import { Entity } from '@backstage/catalog-model';
import { LocationSpec } from '@backstage/plugin-catalog-common';
import {
  CatalogProcessor,
  CatalogProcessorEmit,
} from '@backstage/plugin-catalog-node';

export class UsersEntityProcessor implements CatalogProcessor {
  getProcessorName(): string {
    return 'UsersEntityProcessor';
  }

  async validateEntityKind(entity: Entity): Promise<boolean> {
    return entity.kind === 'JsonPlaceholderUser';
  }

  async preProcessEntity(
    entity: Entity,
    _location: LocationSpec,
    _emit: CatalogProcessorEmit,
  ): Promise<Entity> {
    return entity;
  }

  async postProcessEntity(
    entity: Entity,
    _location: LocationSpec,
    _emit: CatalogProcessorEmit,
  ): Promise<Entity> {
    // Relations are emitted from the dependent entities (Posts, Albums, Todos)
    // The reverse relations (ownedBy) are automatically created by Backstage
    return entity;
  }
}
