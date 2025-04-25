import { AppClient } from '@holochain/client';
import { consume, provide } from '@lit/context';
import { appClientContext } from '@darksoil-studio/holochain-elements';
import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { tagsStoreContext } from '../context.js';
import { TagsClient } from '../tags-client.js';
import { TagsStore } from '../tags-store.js';

/**
 * @element tags-context
 */
@customElement('tags-context')
export class TagsContext extends LitElement {
	@consume({ context: appClientContext })
	private client!: AppClient;

	@provide({ context: tagsStoreContext })
	@property({ type: Object })
	store!: TagsStore;

	@property()
	role!: string;

	@property()
	zome = 'tags';

	connectedCallback() {
		super.connectedCallback();
		if (this.store) return;
		if (!this.role) {
			throw new Error(
				`<tags-context> must have a role="YOUR_DNA_ROLE" property, eg: <tags-context role="role1">`,
			);
		}
		if (!this.client) {
			throw new Error(`<tags-context> must either:
        a) be placed inside <app-client-context>
          or 
        b) receive an AppClient property (eg. <tags-context .client=\${client}>) 
          or 
        c) receive a store property (eg. <tags-context .store=\${store}>)
      `);
		}

		this.store = new TagsStore(
			new TagsClient(this.client, this.role, this.zome),
		);
	}

	render() {
		return html`<slot></slot>`;
	}

	static styles = css`
		:host {
			display: contents;
		}
	`;
}
