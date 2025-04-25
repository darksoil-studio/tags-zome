import{_ as t}from"./tslib.es6.kHcLnhpD.js";import{a as i,n as o,c as s,t as n}from"./property.DZDbTsbr.js";import{e as r,a as p}from"./context.DvrcgLzX.js";import{a as l,b as c,x as a,r as f,i as m}from"./tags-client.BwFB5DvR.js";import{S as x}from"./signal-watcher.BvHXsG5A.js";import"./range.BGBvaAjV.js";import"./isIterateeCall.CSISAO8W.js";import"./toFinite.RNA9cwvc.js";import"./isSymbol.1Kd0kqul.js";const h=i("hc_zome_profiles/store"),d=i("ProfilesProvider");let e=class extends x(f){constructor(){super(...arguments),this.zome="profiles"}connectedCallback(){if(super.connectedCallback(),!this.store){if(!this.role)throw new Error('<profiles-context> must have a role="YOUR_DNA_ROLE" property, eg: <profiles-context role="role1">');if(!this.client)throw new Error(`<profiles-context> must either:
				a) be placed inside <app-client-context>
					or 
				b) receive an AppClient property (eg. <profiles-context .client=\${client}>) 
					or 
				c) receive a store property (eg. <profiles-context .store=\${store}>)`);this.store=new l(new c(this.client,this.role,this.zome))}}render(){return a`<slot></slot>`}};e.styles=m`
		:host {
			display: contents;
		}
	`;t([r({context:h}),r({context:d}),o({type:Object})],e.prototype,"store",void 0);t([s({context:p,subscribe:!0})],e.prototype,"client",void 0);t([o()],e.prototype,"role",void 0);t([o()],e.prototype,"zome",void 0);e=t([n("profiles-context")],e);export{e as ProfilesContext};
