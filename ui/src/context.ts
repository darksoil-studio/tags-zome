import { createContext } from '@lit/context';

import { TagsStore } from './tags-store.js';

export const tagsStoreContext = createContext<TagsStore>('tags/store');
