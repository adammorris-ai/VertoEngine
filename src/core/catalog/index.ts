import { registry } from '../registry/NodeRegistry';
import { generateNode } from './Generator';
import { allEntries } from './entries';

export function registerCatalogNodes() {
  allEntries.forEach(entry => {
    registry.register(generateNode(entry));
  });
}
