import { 
  SignedActionHashed,
  CreateLink,
  Link,
  DeleteLink,
  Delete,
  AppClient, 
  Record, 
  ActionHash, 
  EntryHash, 
  AgentPubKey,
} from '@holochain/client';
import { EntryRecord, ZomeClient } from '@tnesh-stack/utils';

import { TagsSignal } from './types.js';

export class TagsClient extends ZomeClient<TagsSignal> {

  constructor(public client: AppClient, public roleName: string, public zomeName = 'tags') {
    super(client, roleName, zomeName);
  }
}
