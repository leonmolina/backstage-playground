import { Entity } from '@backstage/catalog-model';
import { LocationSpec } from '@backstage/plugin-catalog-common';
import {
  CatalogProcessor,
  CatalogProcessorEmit,
  processingResult,
} from '@backstage/plugin-catalog-node';

export class CommentsEntityProcessor implements CatalogProcessor {
  getProcessorName(): string {
    return 'CommentsEntityProcessor';
  }

  async validateEntityKind(entity: Entity): Promise<boolean> {
    return entity.kind === 'Comment';
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
    if (entity.kind === 'Comment' && entity.spec?.postId) {
      const postId = entity.spec.postId as number;
      emit(
        processingResult.relation({
          source: {
            kind: 'Comment',
            namespace: entity.metadata.namespace || 'default',
            name: entity.metadata.name,
          },
          type: 'partOf',
          target: {
            kind: 'Post',
            namespace: 'default',
            name: `post-${postId}`,
          },
        }),
      );
    }
    return entity;
  }
}
