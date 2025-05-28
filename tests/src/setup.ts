import { AppWebsocket } from '@holochain/client';
import { Scenario, dhtSync, pause } from '@holochain/tryorama';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

import { TagsClient } from '../../ui/src/tags-client.js';
import { TagsStore } from '../../ui/src/tags-store.js';

const testHappUrl =
	dirname(fileURLToPath(import.meta.url)) + '/../../workdir/tags_test.happ';

export async function setup(scenario: Scenario, numPlayers = 2) {
	const players = await promiseAllSequential(
		Array.from(new Array(numPlayers)).map(() => () => addPlayer(scenario)),
	);

	// Shortcut peer discovery through gossip and register all agents in every
	// conductor of the scenario.
	await scenario.shareAllAgents();

	await dhtSync(
		players.map(p => p.player),
		players[0].player.cells[0].cell_id[0],
		500,
		240_000,
	);

	console.log('Setup completed!');

	return players;
}

async function addPlayer(scenario: Scenario) {
	const player = await scenario.addPlayerWithApp({
		appBundleSource: {
			type: 'path',
			value: testHappUrl,
		},
	});

	// patchCallZome(player.appWs as AppWebsocket);
	// await player.conductor
	// 	.adminWs()
	// 	.authorizeSigningCredentials(player.cells[0].cell_id);
	const store = new TagsStore(new TagsClient(player.appWs as any, 'tags_test'));
	await store.client.getAllTags();
	return {
		store,
		player,
		startUp: async () => {
			await player.conductor.startUp();
			const port = await player.conductor.attachAppInterface();
			const issued = await player.conductor
				.adminWs()
				.issueAppAuthenticationToken({
					installed_app_id: player.appId,
				});
			const appWs = await player.conductor.connectAppWs(issued.token, port);
			patchCallZome(appWs);
			store.client.client = appWs;
		},
	};
}

async function promiseAllSequential<T>(
	promises: Array<() => Promise<T>>,
): Promise<Array<T>> {
	const results: Array<T> = [];
	for (const promise of promises) {
		results.push(await promise());
	}
	return results;
}

function patchCallZome(appWs: AppWebsocket) {
	const callZome = appWs.callZome;
	appWs.callZome = async req => {
		try {
			const result = await callZome(req);
			return result as any;
		} catch (e) {
			if (
				!e.toString().includes('Socket is not open') &&
				!e.toString().includes('ClientClosedWithPendingRequests')
			) {
				throw e;
			}
		}
	};
}

export async function waitUntil(
	condition: () => Promise<boolean>,
	timeout: number,
) {
	const start = Date.now();
	const isDone = await condition();
	if (isDone) return;
	if (timeout <= 0) throw new Error('timeout');
	await pause(1000);
	return waitUntil(condition, timeout - (Date.now() - start));
}
