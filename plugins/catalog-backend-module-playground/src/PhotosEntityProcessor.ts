import { Entity } from '@backstage/catalog-model';
import { LocationSpec } from '@backstage/plugin-catalog-common';
import {
  CatalogProcessor,
  CatalogProcessorEmit,
  processingResult,
} from '@backstage/plugin-catalog-node';

export class PhotosEntityProcessor implements CatalogProcessor {
  getProcessorName(): string {
    return 'PhotosEntityProcessor';
  }

  async validateEntityKind(entity: Entity): Promise<boolean> {
    return entity.kind === 'Photo';
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
    if (entity.kind === 'Photo' && entity.spec?.albumId) {
      const albumId = entity.spec.albumId as number;
      emit(
        processingResult.relation({
          source: {
            kind: 'Photo',
            namespace: entity.metadata.namespace || 'default',
            name: entity.metadata.name,
          },
          type: 'partOf',
          target: {
            kind: 'Album',
            namespace: 'default',
            name: `album-${albumId}`,
          },
        }),
      );
    }
    return entity;
  }
}
