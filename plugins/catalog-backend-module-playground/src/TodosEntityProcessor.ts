import { Entity } from '@backstage/catalog-model';
import { LocationSpec } from '@backstage/plugin-catalog-common';
import {
  CatalogProcessor,
  CatalogProcessorEmit,
  processingResult,
} from '@backstage/plugin-catalog-node';

export class TodosEntityProcessor implements CatalogProcessor {
  getProcessorName(): string {
    return 'TodosEntityProcessor';
  }

  async validateEntityKind(entity: Entity): Promise<boolean> {
    return entity.kind === 'Todo';
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
    emit: CatalogProcessorEmit,
  ): Promise<Entity> {
    if (entity.kind === 'Todo' && entity.spec?.userId) {
      const userId = entity.spec.userId as number;
      emit(
        processingResult.relation({
          source: {
            kind: 'Todo',
            namespace: entity.metadata.namespace || 'default',
            name: entity.metadata.name,
          },
          type: 'ownedBy',
          target: {
            kind: 'JsonPlaceholderUser',
            namespace: 'default',
            name: `user-${userId}`,
          },
        }),
      );
    }
    return entity;
  }
}
