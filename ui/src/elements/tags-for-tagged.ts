import { HoloHash } from '@holochain/client';
import { consume } from '@lit/context';
import { localized, msg, str } from '@lit/localize';
import { mdiMagnify, mdiPlus, mdiTagMultiple } from '@mdi/js';
import { SlInput } from '@shoelace-style/shoelace';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/divider/divider.js';
import '@shoelace-style/shoelace/dist/components/dropdown/dropdown.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import '@shoelace-style/shoelace/dist/components/menu-item/menu-item.js';
import SlMenuItem from '@shoelace-style/shoelace/dist/components/menu-item/menu-item.js';
import '@shoelace-style/shoelace/dist/components/menu/menu.js';
import '@shoelace-style/shoelace/dist/components/skeleton/skeleton.js';
import '@shoelace-style/shoelace/dist/components/tag/tag.js';
import {
	notifyError,
	sharedStyles,
	wrapPathInSvg,
} from '@tnesh-stack/elements';
import '@tnesh-stack/elements/dist/elements/display-error.js';
import { SignalWatcher, joinAsync } from '@tnesh-stack/signals';
import { HashType, getHashType, retype } from '@tnesh-stack/utils';
import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { tagsStoreContext } from '../context.js';
import { TagsStore } from '../tags-store.js';

/**
 * @element tags-for-tagged
 */
@localized()
@customElement('tags-for-tagged')
export class TagsForTagged extends SignalWatcher(LitElement) {
	@property()
	tagged!: HoloHash;

	@property({ attribute: 'hide-manage-menu', type: Boolean })
	hideManageMenu = false;

	get _tagged() {
		return getHashType(this.tagged) === HashType.AGENT
			? retype(this.tagged, HashType.ENTRY)
			: this.tagged;
	}

	/**
	 * @internal
	 */
	@consume({ context: tagsStoreContext, subscribe: true })
	tagsStore!: TagsStore;

	@state()
	filter: string | undefined;

	renderTags(tagsForTagged: Set<string>, allTags: Set<string>) {
		const filteredTags = Array.from(allTags.values()).filter(
			tag => !this.filter || tag.startsWith(this.filter),
		);
		return html`
			<div class="row" style="gap: 8px; flex: 1">
				${Array.from(tagsForTagged.values()).map(
					tag => html`<sl-tag>${tag}</sl-tag>`,
				)}
				${this.hideManageMenu
					? html``
					: html`
							<sl-dropdown>
								<sl-button pill slot="trigger" size="small">
									<sl-icon .src=${wrapPathInSvg(mdiTagMultiple)}> </sl-icon>

									${msg('Manage Tags')}
								</sl-button>
								<sl-menu
									style="padding-top: 0"
									@sl-select=${async (event: CustomEvent) => {
										event.stopPropagation();
										const menuItem = event.detail.item as SlMenuItem;
										const checked = menuItem.checked;
										const tag = event.detail.item.value;
										menuItem.loading = true;
										if (checked) {
											try {
												await this.tagsStore.client.addTag(tag, this._tagged);
											} catch (e) {
												notifyError(msg('Failed to add tag.'));
												console.log(e);
											}
										} else {
											try {
												await this.tagsStore.client.removeTag(
													tag,
													this._tagged,
												);
											} catch (e) {
												notifyError(msg('Failed to remove tag.'));
												console.log(e);
											}
										}
										menuItem.loading = false;
									}}
								>
									<sl-input
										size="small"
										.placeholder=${msg('Filter tags...')}
										@input=${(e: CustomEvent) => {
											this.filter = (e.target as SlInput).value;
										}}
									>
										<sl-icon
											slot="suffix"
											.src=${wrapPathInSvg(mdiMagnify)}
										></sl-icon>
									</sl-input>
									${filteredTags.length === 0 && !this.filter
										? html`
												<span
													class="placeholder"
													style="margin-left: 16px; margin-top: 16px"
													>${msg('No tags found.')}
												</span>
											`
										: filteredTags.map(
												tag =>
													html`<sl-menu-item
														type="checkbox"
														.checked=${tagsForTagged.has(tag)}
														.value=${tag}
														>${tag}</sl-menu-item
													>`,
											)}
									${!!this.filter && !allTags.has(this.filter)
										? html` ${filteredTags.length > 0
													? html` <sl-divider> </sl-divider> `
													: html``}

												<sl-menu-item
													@click=${async () => {
														try {
															await this.tagsStore.client.addTag(
																this.filter!,
																this._tagged,
															);
															this.filter = undefined;
														} catch (e) {
															notifyError(msg('Failed to add tag.'));
															console.log(e);
														}
													}}
												>
													<sl-icon
														slot="prefix"
														.src=${wrapPathInSvg(mdiPlus)}
													></sl-icon>

													${msg(str`Create the "${this.filter}" tag.`)}
												</sl-menu-item>`
										: html``}
								</sl-menu>
							</sl-dropdown>
						`}
			</div>
		`;
	}

	render() {
		const map = joinAsync([
			this.tagsStore.tagsForTagged.get(this._tagged).get(),
			this.tagsStore.allTags.get(),
		]);

		switch (map.status) {
			case 'pending':
				return html`<div
					style="display: flex; flex-direction: row; align-items: center; justify-content: center; flex: 1; gap: 8px"
				>
					<sl-skeleton style="width: 60px; height: 24px"></sl-skeleton>
					<sl-skeleton style="width: 60px; height: 24px"></sl-skeleton>
				</div>`;
			case 'error':
				return html`<display-error
					.headline=${msg('Error fetching the tags')}
					.error=${map.error}
					tooltip
				></display-error>`;
			case 'completed':
				return this.renderTags(map.value[0], map.value[1]);
		}
	}

	static styles = [
		sharedStyles,
		css`
			sl-input::part(base) {
				border: none !important;
				box-shadow: none !important;
			}
		`,
	];
}
