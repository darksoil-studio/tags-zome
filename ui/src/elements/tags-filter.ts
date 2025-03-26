import { ActionHash, AgentPubKey, EntryHash, Record } from '@holochain/client';
import { consume } from '@lit/context';
import { localized, msg } from '@lit/localize';
import { mdiInformationOutline } from '@mdi/js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import '@shoelace-style/shoelace/dist/components/spinner/spinner.js';
import {
	hashProperty,
	sharedStyles,
	wrapPathInSvg,
} from '@tnesh-stack/elements';
import '@tnesh-stack/elements/dist/elements/display-error.js';
import { SignalWatcher } from '@tnesh-stack/signals';
import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { tagsStoreContext } from '../context.js';
import { TagsStore } from '../tags-store.js';
import './tag-summary.js';

/**
 * @element tags-filter
 */
@localized()
@customElement('tags-filter')
export class TagsFilter extends SignalWatcher(LitElement) {
	/**
	 * @internal
	 */
	@consume({ context: tagsStoreContext, subscribe: true })
	tagsStore!: TagsStore;

	renderList(hashes: Array<ActionHash>) {
		if (hashes.length === 0) {
			return html` <div
				class="column placeholder center-content"
				style="gap: 8px; flex: 1"
			>
				<sl-icon
					.src=${wrapPathInSvg(mdiInformationOutline)}
					style="font-size: 64px;"
				></sl-icon>
				<span style="text-align: center">${msg('No tags found.')}</span>
			</div>`;
		}

		return html`
			<div class="column" style="gap: 8px; flex: 1">
				${hashes.map(
					hash => html`<tag-summary .tagHash=${hash}></tag-summary>`,
				)}
			</div>
		`;
	}

	render() {
		const map = this.tagsStore.tags.get();

		switch (map.status) {
			case 'pending':
				return html`<div
					style="display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1;"
				>
					<sl-spinner style="font-size: 2rem;"></sl-spinner>
				</div>`;
			case 'error':
				return html`<display-error
					.headline=${msg('Error fetching the tags')}
					.error=${map.error}
				></display-error>`;
			case 'completed':
				return this.renderList(Array.from(map.value.keys()));
		}
	}

	static styles = [sharedStyles];
}
