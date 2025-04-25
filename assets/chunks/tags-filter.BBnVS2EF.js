import{s as h,c as m,n as c,t as u}from"./property.DZDbTsbr.js";import{m as d,l as f}from"./display-error.DmTIafHP.js";import"./chunk.6CGWZTF5.rpSTjUpv.js";import{x as i,r as v}from"./tags-client.BwFB5DvR.js";import{S as g}from"./signal-watcher.BvHXsG5A.js";import{t as y}from"./context.Bbm8aEZw.js";import"./range.BGBvaAjV.js";import"./isIterateeCall.CSISAO8W.js";import"./toFinite.RNA9cwvc.js";import"./isSymbol.1Kd0kqul.js";var x=Object.defineProperty,b=Object.getOwnPropertyDescriptor,o=(t,e,a,l)=>{for(var r=l>1?void 0:l?b(e,a):e,p=t.length-1,n;p>=0;p--)(n=t[p])&&(r=(l?n(e,a,r):n(r))||r);return l&&r&&x(e,a,r),r};let s=class extends g(v){constructor(){super(...arguments),this.activeFilter=new Set,this.multiple=!1}renderTags(t){return t.size===0?i``:i`
			<div class="row" style="gap: 4px; flex: 1">
				${Array.from(t.values()).map(e=>i`<sl-button
							pill
							.variant=${this.activeFilter.has(e)?"primary":"default"}
							@click=${()=>{this.activeFilter.has(e)?this.activeFilter.delete(e):(this.multiple||this.activeFilter.clear(),this.activeFilter.add(e)),this.requestUpdate(),this.dispatchEvent(new CustomEvent("filter-changed",{bubbles:!0,composed:!0,detail:{tags:this.activeFilter}}))}}
							>${e}</sl-button
						>`)}
			</div>
		`}render(){const t=this.tagsStore.allTags.get();switch(t.status){case"pending":return i`<div
					style="display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1;"
				>
					<sl-skeleton style="width: 60px; height: 12px"></sl-skeleton>
					<sl-skeleton style="width: 60px; height: 12px"></sl-skeleton>
					<sl-skeleton style="width: 60px; height: 12px"></sl-skeleton>
				</div>`;case"error":return i`<display-error
					.headline=${d("Error fetching the tags")}
					tooltip
					.error=${t.error}
				></display-error>`;case"completed":return this.renderTags(t.value)}}};s.styles=[h];o([m({context:y,subscribe:!0})],s.prototype,"tagsStore",2);o([c()],s.prototype,"activeFilter",2);o([c({type:Boolean})],s.prototype,"multiple",2);s=o([f(),u("tags-filter")],s);export{s as TagsFilter};
