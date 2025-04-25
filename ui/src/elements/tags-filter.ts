import { ActionHash, AgentPubKey, EntryHash, Record } from '@holochain/client';
import { consume } from '@lit/context';
import { localized, msg } from '@lit/localize';
import { mdiInformationOutline } from '@mdi/js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import '@shoelace-style/shoelace/dist/components/skeleton/skeleton.js';
import '@shoelace-style/shoelace/dist/components/tag/tag.js';
import {
	hashProperty,
	sharedStyles,
	wrapPathInSvg,
} from '@darksoil-studio/holochain-elements';
import '@darksoil-studio/holochain-elements/dist/elements/display-error.js';
import { SignalWatcher } from '@darksoil-studio/holochain-signals';
import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { tagsStoreContext } from '../context.js';
import { TagsStore } from '../tags-store.js';

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

	@property()
	activeFilter = new Set<string>();

	@property({ type: Boolean })
	multiple = false;

	renderTags(tags: Set<string>) {
		if (tags.size === 0) {
			return html``;
		}

		return html`
			<div class="row" style="gap: 4px; flex: 1">
				${Array.from(tags.values()).map(
					tag =>
						html`<sl-button
							pill
							.variant=${this.activeFilter.has(tag) ? 'primary' : 'default'}
							@click=${() => {
								if (this.activeFilter.has(tag)) {
									this.activeFilter.delete(tag);
								} else {
									if (!this.multiple) {
										this.activeFilter.clear();
									}
									this.activeFilter.add(tag);
								}

								this.requestUpdate();

								this.dispatchEvent(
									new CustomEvent('filter-changed', {
										bubbles: true,
										composed: true,
										detail: {
											tags: this.activeFilter,
										},
									}),
								);
							}}
							>${tag}</sl-button
						>`,
				)}
			</div>
		`;
	}

	render() {
		const map = this.tagsStore.allTags.get();

		switch (map.status) {
			case 'pending':
				return html`<div
					style="display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1;"
				>
					<sl-skeleton style="width: 60px; height: 12px"></sl-skeleton>
					<sl-skeleton style="width: 60px; height: 12px"></sl-skeleton>
					<sl-skeleton style="width: 60px; height: 12px"></sl-skeleton>
				</div>`;
			case 'error':
				return html`<display-error
					.headline=${msg('Error fetching the tags')}
					tooltip
					.error=${map.error}
				></display-error>`;
			case 'completed':
				return this.renderTags(map.value);
		}
	}

	static styles = [sharedStyles];
}
