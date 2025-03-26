import {
	ActionHash,
	AgentPubKey,
	EntryHash,
	HoloHash,
	NewEntryAction,
	Record,
} from '@holochain/client';
import {
	AsyncComputed,
	AsyncSignal,
	allRevisionsOfEntrySignal,
	collectionSignal,
	deletedLinksSignal,
	deletesForEntrySignal,
	fromPromise,
	immutableEntrySignal,
	joinAsync,
	latestVersionOfEntrySignal,
	liveLinksSignal,
	mapCompleted,
	pipe,
	uniquify,
} from '@tnesh-stack/signals';
import {
	EntryRecord,
	HashType,
	MemoHoloHashMap,
	MemoMap,
	decodePath,
	retype,
	slice,
} from '@tnesh-stack/utils';

import { TagsClient } from './tags-client.js';
import { Tag } from './types.js';

export class TagsStore {
	constructor(public client: TagsClient) {}

	/** Tags */

	allTags = mapCompleted(
		collectionSignal(this.client, () => this.client.getAllTags(), 'TagsPath'),
		tags => new Set(tags.map(l => decodePath([l.tag]))),
	);

	tagsForTagged = new MemoHoloHashMap(hash =>
		mapCompleted(
			liveLinksSignal(
				this.client,
				hash,
				() => this.client.getTagsForTagged(hash),
				'TaggedToTags',
			),
			links => new Set(links.map(l => l.tag.toString())),
		),
	);

	private tagPathHash = new MemoMap((tag: string) =>
		fromPromise(() => this.client.tagPathHash(tag)),
	);

	taggedsForTag = new MemoMap((tag: string) =>
		pipe(
			this.tagPathHash.get(tag),
			hash =>
				liveLinksSignal(
					this.client,
					hash,
					() => this.client.getTaggedsForTag(tag),
					'TagToTaggeds',
				),
			links => links.map(l => l.target),
		),
	);

	taggedsForAllTags(tags: Set<string>): AsyncSignal<Array<HoloHash>> {
		return new AsyncComputed(() => {
			const maps = joinAsync(
				Array.from(tags.values()).map(tag => this.taggedsForTag.get(tag).get()),
			);
			if (maps.status !== 'completed') return maps;

			const hashes = uniquify(([] as HoloHash[]).concat(...maps.value));

			return {
				status: 'completed',
				value: hashes,
			};
		});
	}

	taggedsForAnyTags(tags: Set<string>): AsyncSignal<Array<HoloHash>> {
		return new AsyncComputed(() => {
			const maps = joinAsync(
				Array.from(tags.values()).map(tag => this.taggedsForTag.get(tag).get()),
			);
			if (maps.status !== 'completed') return maps;

			const hashes = uniquify(([] as HoloHash[]).concat(...maps.value));

			return {
				status: 'completed',
				value: hashes,
			};
		});
	}
}
