import { Entity } from '@backstage/catalog-model';
import { LocationSpec } from '@backstage/plugin-catalog-common';
import {
  CatalogProcessor,
  CatalogProcessorEmit,
} from '@backstage/plugin-catalog-node';

// A processor that reads from the fictional System-X
export class PostsEntityProcessor implements CatalogProcessor {
  // constructor() {}

  getProcessorName(): string {
    return 'PostsEntityProcessor';
  }

  async validateEntityKind(entity: Entity): Promise<boolean> {
    return entity.kind === 'Post';
  }

  async preProcessEntity(
    entity: Entity,
    _location: LocationSpec,
    _emit: CatalogProcessorEmit,
  ): Promise<Entity> {
    // No preprocessing needed for this example
    return entity;
  }

  async postProcessEntity(
    entity: Entity,
    _location: LocationSpec,
    _emit: CatalogProcessorEmit,
  ): Promise<Entity> {
    // No postprocessing needed for this example
    return entity;
  }
}
