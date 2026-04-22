import { DomainException } from './domain.exception';

export class EntityNotFoundException extends DomainException {
  constructor(entity: string, id: string) {
    super(`${entity} with ID ${id} not found`);
    this.name = 'EntityNotFoundException';
  }
}
