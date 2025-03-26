import {
	ActionHash,
	AgentPubKey,
	AppClient,
	CreateLink,
	Delete,
	DeleteLink,
	EntryHash,
	HoloHash,
	Link,
	Record,
	SignedActionHashed,
} from '@holochain/client';
import { EntryRecord, ZomeClient } from '@tnesh-stack/utils';

import { Tag } from './types.js';
import { TagsSignal } from './types.js';

export class TagsClient extends ZomeClient<TagsSignal> {
	constructor(
		public client: AppClient,
		public roleName: string,
		public zomeName = 'tags',
	) {
		super(client, roleName, zomeName);
	}

	async addTag(tag: string, hash: HoloHash) {
		await this.callZome('add_tag', {
			tag,
			hash,
		});
	}

	async removeTag(tag: string, hash: HoloHash) {
		await this.callZome('remove_tag', {
			tag,
			hash,
		});
	}

	async getAllTags(): Promise<Array<Link>> {
		return this.callZome('get_all_tags', undefined);
	}

	async getTagsForTagged(hash: HoloHash): Promise<Array<Link>> {
		return this.callZome('get_tags_for_tagged', hash);
	}

	async getTaggedsForTag(tag: string): Promise<Array<Link>> {
		return this.callZome('get_taggeds_for_tag', tag);
	}

	async tagPathHash(tag: string): Promise<EntryHash> {
		return this.callZome('tag_path_hash', tag);
	}
}
