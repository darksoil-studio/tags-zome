import { assert, test } from "vitest";

import { ActionHash, Delete, Record, SignedActionHashed } from "@holochain/client";
import { dhtSync, runScenario } from "@holochain/tryorama";
import { decode } from "@msgpack/msgpack";
import { toPromise } from "@tnesh-stack/signals";
import { EntryRecord } from "@tnesh-stack/utils";
import { cleanNodeDecoding } from "@tnesh-stack/utils/dist/clean-node-decoding.js";

import { sampleTag } from "../../ui/src/mocks.js";
import { Tag } from "../../ui/src/types.js";
import { setup } from "./setup.js";

test("create Tag", async () => {
  await runScenario(async scenario => {
    const [alice, bob] = await setup(scenario);

    // Alice creates a Tag
    const tag: EntryRecord<Tag> = await alice.store.client.createTag(await sampleTag(alice.store.client));
    assert.ok(tag);
  });
});

test("create and read Tag", async () => {
  await runScenario(async scenario => {
    const [alice, bob] = await setup(scenario);

    const sample = await sampleTag(alice.store.client);

    // Alice creates a Tag
    const tag: EntryRecord<Tag> = await alice.store.client.createTag(sample);
    assert.ok(tag);

    // Wait for the created entry to be propagated to the other node.
    await dhtSync(
      [alice.player, bob.player],
      alice.player.cells[0].cell_id[0],
    );

    // Bob gets the created Tag
    const createReadOutput: EntryRecord<Tag> = await toPromise(bob.store.tags.get(tag.actionHash).entry);
    assert.deepEqual(sample, cleanNodeDecoding(createReadOutput.entry));
  });
});
