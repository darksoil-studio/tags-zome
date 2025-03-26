import { ActionHash, Record } from '@holochain/client';
import { dhtSync, runScenario } from '@holochain/tryorama';
import { decode } from '@msgpack/msgpack';
import { toPromise } from '@tnesh-stack/signals';
import { EntryRecord, HashType, retype } from '@tnesh-stack/utils';
import { assert, test } from 'vitest';

import { sampleTag } from '../../ui/src/mocks.js';
import { Tag } from '../../ui/src/types.js';
import { setup } from './setup.js';

test('link a Tag to a Tagged', async () => {
	await runScenario(async scenario => {
		const [alice, bob] = await setup(scenario);

		const targetAddress = retype(alice.player.agentPubKey, HashType.ENTRY);

		const tag = 'coolpeoplw';

		// Bob gets the links, should be empty
		let linksOutput = await toPromise(bob.store.taggedsForTag.get(tag));
		assert.equal(linksOutput.length, 0);

		// Alice creates a link from Tag to Tagged
		await alice.store.client.addTag(tag, targetAddress);

		// Wait for the created entry to be propagated to the other node.
		await dhtSync([alice.player, bob.player], alice.player.cells[0].cell_id[0]);

		// Bob gets the links again
		linksOutput = await toPromise(bob.store.taggedsForTag.get(tag));
		assert.equal(linksOutput.length, 1);
		assert.deepEqual(targetAddress, linksOutput[0]);

		// Bob gets the links in the inverse direction
		let inverseLinksOutput = await toPromise(
			bob.store.tagsForTagged.get(targetAddress),
		);
		assert.equal(inverseLinksOutput.size, 1);
		assert.deepEqual(inverseLinksOutput[0], tag);

		await alice.store.client.removeTag(tag, targetAddress);

		// Wait for the created entry to be propagated to the other node.
		await dhtSync([alice.player, bob.player], alice.player.cells[0].cell_id[0]);

		// Bob gets the links again
		linksOutput = await toPromise(bob.store.taggedsForTag.get(tag));
		assert.equal(linksOutput.length, 0);

		// Bob gets the deleted links
		let deletedLinksOutput = await toPromise(bob.store.taggedsForTag.get(tag));
		assert.equal(deletedLinksOutput.length, 1);

		// Bob gets the links in the inverse direction
		inverseLinksOutput = await toPromise(
			bob.store.tagsForTagged.get(targetAddress),
		);
		assert.equal(inverseLinksOutput.size, 0);
	});
});
