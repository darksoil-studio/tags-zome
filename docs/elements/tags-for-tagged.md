# `<tags-for-tagged>`

## Usage

0. If you haven't already, [go through the setup for the module](/setup).

1. Import the `<tags-for-tagged>` element somewhere in the javascript side of your web-app like this:

```js
import '@darksoil-studio/tags/dist/elements/tags-for-tagged.js'
```

2. Use it in the html side of your web-app like this:

::: code-group
```html [Lit]
<tags-for-tagged .tagged=${ tagged }>
</tags-for-tagged>
```

```html [React]
<tags-for-tagged tagged={ tagged }>
</tags-for-tagged>
```

```html [Angular]
<tags-for-tagged [tagged]="tagged">
</tags-for-tagged>
```

```html [Vue]
<tags-for-tagged :tagged="tagged">
</tags-for-tagged>
```

```html [Svelte]
<tags-for-tagged tagged={encodeHashToBase64(tagged)}>
</tags-for-tagged>
```
:::

> [!WARNING]
> Like all the elements in this module, `<tags-for-tagged>` needs to be placed inside an initialized `<tags-context>`.

## Demo

Here is an interactive demo of the element:

<element-demo>
</element-demo>

<script setup>
import { onMounted } from "vue";
import { ProfilesClient, ProfilesStore } from '@darksoil-studio/profiles-zome';
import { demoProfiles, ProfilesZomeMock } from '@darksoil-studio/profiles-zome/dist/mocks.js';
import { decodeHashFromBase64, encodeHashToBase64, fakeActionHash, fakeAgentPubKey } from '@holochain/client';
import { render } from "lit";
import { html, unsafeStatic } from "lit/static-html.js";

import { TagsZomeMock } from "../../ui/src/mocks.ts";
import { TagsStore } from "../../ui/src/tags-store.ts";
import { TagsClient } from "../../ui/src/tags-client.ts";

onMounted(async () => {
  // Elements need to be imported on the client side, not the SSR side
  // Reference: https://vitepress.dev/guide/ssr-compat#importing-in-mounted-hook
  await import('@api-viewer/docs/lib/api-docs.js');
  await import('@api-viewer/demo/lib/api-demo.js');
  await import('@darksoil-studio/profiles-zome/dist/elements/profiles-context.js');
  if (!customElements.get('tags-context')) await import('../../ui/src/elements/tags-context.ts');
  if (!customElements.get('tags-for-tagged')) await import('../../ui/src/elements/tags-for-tagged.ts');

  const profiles = await demoProfiles();
  const myPubKey = Array.from(profiles.keys())[0];

  const profilesMock = new ProfilesZomeMock(profiles, myPubKey);
  const profilesStore = new ProfilesStore(new ProfilesClient(profilesMock, "tags_test"));

  const mock = new TagsZomeMock();
  const client = new TagsClient(mock, "tags_test");

  const store = new TagsStore(client);

  render(html`
    <profiles-context .store=${profilesStore}>
      <tags-context .store=${store}>
        <api-demo src="custom-elements.json" only="tags-for-tagged" exclude-knobs="store">
          <template data-element="tags-for-tagged" data-target="host">
            <tags-for-tagged tagged="${unsafeStatic(encodeHashToBase64(myPubKey))}"></tags-for-tagged>
          </template>
        </api-demo>
      </tags-context>
    </profiles-context>
  `, document.querySelector('element-demo'))
  })


</script>

## API Reference

`<tags-for-tagged>` is a [custom element](https://web.dev/articles/custom-elements-v1), which means that it can be used in any web app or website. Here is the reference for its API:

<api-docs src="custom-elements.json" only="tags-for-tagged">
</api-docs>
