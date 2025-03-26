import { assert, test } from "vitest";

import { ActionHash, Record } from "@holochain/client";
import { dhtSync, runScenario } from "@holochain/tryorama";
import { decode } from "@msgpack/msgpack";
import { toPromise } from "@tnesh-stack/signals";
import { EntryRecord } from "@tnesh-stack/utils";

import { setup } from "./setup.js";

import { sampleTag } from "../../ui/src/mocks.js";
import { sampleTagged } from "../../ui/src/mocks.js";
import { Tag } from "../../ui/src/types.js";
import { Tagged } from "../../ui/src/types.js";

test("link a Tag to a Tagged", async () => {
  await runScenario(async scenario => {
    const [alice, bob] = await setup(scenario);

    const baseRecord: EntryRecord<Tag> = await alice.store.client.createTag(await sampleTag(alice.store.client));
    const baseAddress = baseRecord.entryHash;
    const targetRecord: EntryRecord<Tagged> = await alice.store.client.createTagged(
      await sampleTagged(alice.store.client),
    );
    const targetAddress = targetRecord.actionHash;

    // Bob gets the links, should be empty
    let linksOutput = await toPromise(bob.store.taggedsForTag.get(baseAddress).live);
    assert.equal(linksOutput.size, 0);

    // Alice creates a link from Tag to Tagged
    await alice.store.client.addTaggedForTag(baseAddress, targetAddress);

    // Wait for the created entry to be propagated to the other node.
    await dhtSync(
      [alice.player, bob.player],
      alice.player.cells[0].cell_id[0],
    );

    // Bob gets the links again
    linksOutput = await toPromise(bob.store.taggedsForTag.get(baseAddress).live);
    assert.equal(linksOutput.size, 1);
    assert.deepEqual(targetAddress, Array.from(linksOutput.keys())[0]);

    // Bob gets the links in the inverse direction
    let inverseLinksOutput = await toPromise(bob.store.tagsForTagged.get(targetAddress).live);
    assert.equal(inverseLinksOutput.size, 1);
    assert.deepEqual(baseAddress, Array.from(inverseLinksOutput.keys())[0]);

    await alice.store.client.deleteTaggedForTag(baseAddress, targetAddress);

    // Wait for the created entry to be propagated to the other node.
    await dhtSync(
      [alice.player, bob.player],
      alice.player.cells[0].cell_id[0],
    );

    // Bob gets the links again
    linksOutput = await toPromise(bob.store.taggedsForTag.get(baseAddress).live);
    assert.equal(linksOutput.size, 0);

    // Bob gets the deleted links
    let deletedLinksOutput = await toPromise(bob.store.taggedsForTag.get(baseAddress).deleted);
    assert.equal(deletedLinksOutput.size, 1);

    // Bob gets the links in the inverse direction
    inverseLinksOutput = await toPromise(bob.store.tagsForTagged.get(targetAddress).live);
    assert.equal(inverseLinksOutput.size, 0);

    deletedLinksOutput = await toPromise(bob.store.tagsForTagged.get(targetAddress).deleted);
    assert.equal(deletedLinksOutput.size, 1);
  });
});
