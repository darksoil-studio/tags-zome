import { 
  collectionSignal, 
  liveLinksSignal, 
  deletedLinksSignal, 
  allRevisionsOfEntrySignal,
  latestVersionOfEntrySignal, 
  immutableEntrySignal, 
  deletesForEntrySignal, 
  AsyncComputed,
  pipe,
} from "@tnesh-stack/signals";
import { slice, HashType, retype, EntryRecord, MemoHoloHashMap } from "@tnesh-stack/utils";
import { NewEntryAction, Record, ActionHash, EntryHash, AgentPubKey } from '@holochain/client';

import { TagsClient } from './tags-client.js';

export class TagsStore {

  constructor(public client: TagsClient) {}
  
}
