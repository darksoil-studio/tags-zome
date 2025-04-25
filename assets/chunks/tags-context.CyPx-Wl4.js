import{a as l,e as m}from"./context.DvrcgLzX.js";import{c as g,n as c,t as x}from"./property.DZDbTsbr.js";import{r as h,e as f,c as u,x as y,i as v}from"./tags-client.BwFB5DvR.js";import{t as C}from"./context.Bbm8aEZw.js";import"./range.BGBvaAjV.js";import"./isIterateeCall.CSISAO8W.js";import"./toFinite.RNA9cwvc.js";import"./isSymbol.1Kd0kqul.js";var w=Object.defineProperty,_=Object.getOwnPropertyDescriptor,r=(a,o,n,s)=>{for(var t=s>1?void 0:s?_(o,n):o,p=a.length-1,i;p>=0;p--)(i=a[p])&&(t=(s?i(o,n,t):i(t))||t);return s&&t&&w(o,n,t),t};let e=class extends h{constructor(){super(...arguments),this.zome="tags"}connectedCallback(){if(super.connectedCallback(),!this.store){if(!this.role)throw new Error('<tags-context> must have a role="YOUR_DNA_ROLE" property, eg: <tags-context role="role1">');if(!this.client)throw new Error(`<tags-context> must either:
        a) be placed inside <app-client-context>
          or 
        b) receive an AppClient property (eg. <tags-context .client=\${client}>) 
          or 
        c) receive a store property (eg. <tags-context .store=\${store}>)
      `);this.store=new f(new u(this.client,this.role,this.zome))}}render(){return y`<slot></slot>`}};e.styles=v`
		:host {
			display: contents;
		}
	`;r([g({context:l})],e.prototype,"client",2);r([m({context:C}),c({type:Object})],e.prototype,"store",2);r([c()],e.prototype,"role",2);r([c()],e.prototype,"zome",2);e=r([x("tags-context")],e);export{e as TagsContext};
