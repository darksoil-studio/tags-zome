import {
	ActionHash,
	AgentPubKey,
	AppClient,
	Delete,
	EntryHash,
	Link,
	NewEntryAction,
	Record,
	SignedActionHashed,
	decodeHashFromBase64,
	fakeActionHash,
	fakeAgentPubKey,
	fakeDnaHash,
	fakeEntryHash,
} from '@holochain/client';
import {
	AgentPubKeyMap,
	HashType,
	HoloHashMap,
	ZomeMock,
	decodeEntry,
	fakeCreateAction,
	fakeDeleteEntry,
	fakeEntry,
	fakeRecord,
	fakeUpdateEntry,
	hash,
	pickBy,
} from '@tnesh-stack/utils';

import { TagsClient } from './tags-client.js';
import { Tag } from './types.js';

export class TagsZomeMock extends ZomeMock implements AppClient {
	constructor(myPubKey?: AgentPubKey) {
		super('tags_test', 'tags', 'tags_test_app', myPubKey);
	}
	/** Tag */
	tags = new HoloHashMap<
		ActionHash,
		{
			deletes: Array<SignedActionHashed<Delete>>;
			revisions: Array<Record>;
		}
	>();

	async create_tag(tag: Tag): Promise<Record> {
		const entryHash = hash(tag, HashType.ENTRY);
		const record = await fakeRecord(
			await fakeCreateAction(entryHash),
			fakeEntry(tag),
		);

		this.tags.set(record.signed_action.hashed.hash, {
			deletes: [],
			revisions: [record],
		});

		return record;
	}

	async get_tag(tagHash: ActionHash): Promise<Record | undefined> {
		const tag = this.tags.get(tagHash);
		return tag ? tag.revisions[0] : undefined;
	}

	async get_tags(): Promise<Array<Link>> {
		const records: Record[] = Array.from(this.tags.values()).map(
			r => r.revisions[r.revisions.length - 1],
		);
		const base = await fakeEntryHash();
		return Promise.all(
			records.map(async record => ({
				base,
				target: record.signed_action.hashed.hash,
				author: record.signed_action.hashed.content.author,
				timestamp: record.signed_action.hashed.content.timestamp,
				zome_index: 0,
				link_type: 0,
				tag: new Uint8Array(),
				create_link_hash: await fakeActionHash(),
			})),
		);
	}
}

export async function sampleTag(
	client: TagsClient,
	partialTag: Partial<Tag> = {},
): Promise<Tag> {
	return {
		...{
			name: 'Lorem ipsum 2',
		},
		...partialTag,
	};
}
