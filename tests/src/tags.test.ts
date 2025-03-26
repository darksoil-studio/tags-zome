import { assert, test } from "vitest";

import { ActionHash, EntryHash, Record } from "@holochain/client";
import { dhtSync, runScenario } from "@holochain/tryorama";
import { decode } from "@msgpack/msgpack";
import { toPromise } from "@tnesh-stack/signals";
import { EntryRecord } from "@tnesh-stack/utils";

import { sampleTag } from "../../ui/src/mocks.js";
import { Tag } from "../../ui/src/types.js";
import { setup } from "./setup.js";

test("create a Tag and get tags", async () => {
  await runScenario(async scenario => {
    const [alice, bob] = await setup(scenario);

    // Bob gets tags
    let collectionOutput = await toPromise(bob.store.tags);
    assert.equal(collectionOutput.size, 0);

    // Alice creates a Tag
    const tag: EntryRecord<Tag> = await alice.store.client.createTag(await sampleTag(alice.store.client));
    assert.ok(tag);

    await dhtSync(
      [alice.player, bob.player],
      alice.player.cells[0].cell_id[0],
    );

    // Bob gets tags again
    collectionOutput = await toPromise(bob.store.tags);
    assert.equal(collectionOutput.size, 1);
    assert.deepEqual(tag.actionHash, Array.from(collectionOutput.keys())[0]);
  });
});
