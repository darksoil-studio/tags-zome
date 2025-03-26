import{s as d,c as f,t as u}from"./property.DjMIfHzf.js";import{w as p,m as c,a as g,b as v,l as x}from"./display-error.D2blCEtj.js";import{S as y}from"./chunk.36O46B5H.B6pDE26X.js";import{x as s,r as h}from"./tags-client.CZBvxcOm.js";import{S}from"./signal-watcher.aQj-1mBv.js";import{t as b}from"./context.MajadpEQ.js";import"./range.BGBvaAjV.js";import"./isIterateeCall.CSISAO8W.js";import"./toFinite.RNA9cwvc.js";import"./isSymbol.1Kd0kqul.js";y.define("sl-spinner");var $=Object.defineProperty,w=Object.getOwnPropertyDescriptor,m=(e,r,o,i)=>{for(var t=i>1?void 0:i?w(r,o):r,a=e.length-1,l;a>=0;a--)(l=e[a])&&(t=(i?l(r,o,t):l(t))||t);return i&&t&&$(r,o,t),t};let n=class extends S(h){renderTags(e){return e.size===0?s` <div
				class="column placeholder center-content"
				style="gap: 8px; flex: 1"
			>
				<sl-icon
					.src=${p(g)}
					style="font-size: 64px;"
				></sl-icon>
				<span style="text-align: center">${c("No tags found.")}</span>
			</div>`:s`
			<div class="column" style="gap: 8px; flex: 1">
				${Array.from(e.values()).map(r=>s`<sl-button variant="text" @click=${()=>this.dispatchEvent(new CustomEvent("tag-clicked",{bubbles:!0,composed:!0,detail:{tag:r}}))}>
							<sl-icon slot="prefix" .src=${p(v)}></sl-icon>${r}
						</div>`)}
			</div>
		`}render(){const e=this.tagsStore.allTags.get();switch(e.status){case"pending":return s`<div
					style="display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1;"
				>
					<sl-spinner style="font-size: 2rem;"></sl-spinner>
				</div>`;case"error":return s`<display-error
					.headline=${c("Error fetching the tags")}
					.error=${e.error}
				></display-error>`;case"completed":return this.renderTags(e.value)}}};n.styles=[d];m([f({context:b,subscribe:!0})],n.prototype,"tagsStore",2);n=m([x(),u("tags-list")],n);export{n as TagsList};
