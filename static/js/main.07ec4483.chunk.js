(this.webpackJsonpgenomegraph=this.webpackJsonpgenomegraph||[]).push([[0],{64:function(e,t,a){e.exports=a(78)},69:function(e,t,a){},77:function(e,t,a){},78:function(e,t,a){"use strict";a.r(t);var n=a(0),r=a.n(n),c=a(19),o=a.n(c),l=(a(69),a(15)),i=a.n(l),u=a(38),s=a(7),m=a(84),f=a(57);function d(e){var t=e.data,a=e.onHide;return r.a.createElement(m.a,{show:!0,onHide:a},r.a.createElement(m.a.Header,{closeButton:!0},r.a.createElement(m.a.Title,null,"Feature details")),r.a.createElement(m.a.Body,null,r.a.createElement("div",null,"Attributes"),Object.entries(t).filter((function(e){return!["source","target","linkNum","tags"].includes(e[0])})).map((function(e){var t=Object(s.a)(e,2),a=t[0],n=t[1];return r.a.createElement("div",{key:"".concat(a,"_").concat(n),style:{display:"flex",maxHeight:150,margin:3}},r.a.createElement("div",{style:{backgroundColor:"#dda",minWidth:100}},a),r.a.createElement("div",{style:{wordBreak:"break-word",overflow:"auto"}},String(n)))})),r.a.createElement("hr",null),t.tags&&Object.keys(t.tags).length?r.a.createElement(r.a.Fragment,null,r.a.createElement("div",null,"Tags"),Object.entries(t.tags).map((function(e){var t=Object(s.a)(e,2),a=t[0],n=t[1];return r.a.createElement("div",{key:"".concat(a,"_").concat(n),style:{display:"flex",maxHeight:150,margin:3}},r.a.createElement("div",{style:{backgroundColor:"#dda",minWidth:100}},a),r.a.createElement("div",{style:{wordBreak:"break-word",overflow:"auto"}},String(n)))}))):null,r.a.createElement(m.a.Footer,null,r.a.createElement(f.a,{variant:"secondary",onClick:a},"Close"))))}var h=a(53),g=a(26),p=a(51),E=a(10),b=i.a.mark(k),v=i.a.mark(O);function k(e,t){var a,n,r,c,o;return i.a.wrap((function(l){for(;;)switch(l.prev=l.next){case 0:a=e[0].linkNum,n=[],c=0;case 3:if(!(c<e.length)){l.next=17;break}if(o=e[c],a===o.linkNum){l.next=11;break}if(!r.id){l.next=9;break}return l.next=9,{links:n,original:r};case 9:n=[],a=o.linkNum;case 11:r=t[c],n.push([o.source.x,o.source.y]),n.push([o.target.x,o.target.y]);case 14:c++,l.next=3;break;case 17:case"end":return l.stop()}}),b)}function O(e,t){var a,n,r;return i.a.wrap((function(c){for(;;)switch(c.prev=c.next){case 0:a=0;case 1:if(!(a<e.length)){c.next=10;break}if(n=e[a],(r=t[a]).id){c.next=7;break}return c.next=7,{links:[[n.source.x,n.source.y],[n.target.x,n.target.y]],original:r};case 7:a++,c.next=1;break;case 10:case"end":return c.stop()}}),v)}var w=r.a.forwardRef((function(e,t){var a=Object(n.useRef)(),c=e.graph,o=e.drawPaths,l=void 0!==o&&o,i=e.settings,u=e.color,s=void 0===u?"Rainbow":u,m=e.width,f=void 0===m?2e3:m,d=e.height,b=void 0===d?1e3:d,v=e.onFeatureClick,w=void 0===v?function(){console.log("no feature click configured")}:v,j=i.chunkSize,x=void 0===j?1e3:j,y=i.numSteps,S=void 0===y?500:y,C=i.sequenceThickness,T=void 0===C?10:C,H=i.linkThickness,B=void 0===H?2:H,M=i.strength,G=void 0===M?-50:M;console.log(x,S,G);var L=Object(n.useMemo)((function(){return function(e,t){for(var a={nodes:[],links:[]},n={},r=0;r<(e.paths||{}).length;r++)for(var c=e.paths[r],o=c.path.split(","),l=0;l<o.length-1;l++){var i="".concat(o[l],"_").concat(o[l+1]);n[i]?n[i].push(c.name):n[i]=[c.name]}for(var u=0;u<e.nodes.length;u++){var s=e.nodes[u],m=s.id,f=s.sequence,d=Object(p.a)(s,["id","sequence"]),h=[],E="*"===f?d.tags.LN:f.length;h.push(Object(g.a)({},d,{id:"".concat(m,"-start")}));for(var b=t;b<E-t;b+=t)h.push(Object(g.a)({},d,{id:"".concat(m,"-").concat(b)}));h.push(Object(g.a)({},d,{id:"".concat(m,"-end")}));for(var v=0;v<h.length-1;v++){var k=h[v].id,O=h[v+1].id;a.links.push(Object(g.a)({},d,{source:k,target:O,id:m,length:E,sequence:f,linkNum:u}))}a.nodes=a.nodes.concat(h)}for(var w=0;w<e.links.length;w++){var j=e.links[w],x=j.strand1,y=j.strand2,S=j.source,C=j.target,T=Object(p.a)(j,["strand1","strand2","source","target"]),H=n["".concat(S).concat(x,"_").concat(C).concat(y)]||[],B=S===C,M=Object(g.a)({source:"".concat(S,"-").concat("+"===x?"end":"start"),target:"".concat(C,"-").concat("+"===y?"start":"end")},T);B&&(M.loop=!0),H.length&&(M.paths=H),a.links.push(M)}return a}(c,x)}),[x,c]),N=Object(n.useMemo)((function(){var e={};return(c.paths||[]).forEach((function(t,a){e[t.name]=E.schemeCategory10[a]})),e}),[c.paths]),q=Object(n.useMemo)((function(){for(var e=L.links.map((function(e){return Object.create(e)})),t=L.nodes.map((function(e){return Object.create(e)})),a=0,n=0;n<L.links.length;n++)a=Math.max(a,(L.links[n].sequence||{}).length||0);for(var r=E.forceSimulation(t).force("link",E.forceLink(e).id((function(e){return e.id})).distance((function(e){return e.sequence?1:10}))).force("charge",E.forceManyBody().strength(G)).force("center",E.forceCenter(f/2,b/2)),c=0;c<S;++c)r.tick();return e}),[L.links,L.nodes,b,S,G,f]);Object(n.useEffect)((function(){E.select(t.current).call(E.zoom().extent([[0,0],[f,b]]).scaleExtent([.1,8]).on("zoom",(function(){E.select(a.current).attr("transform",E.event.transform)})))}),[b,t,f]);var W=Object(h.a)(k(q,L.links)),F=Object(h.a)(O(q,L.links)),z={};return W.forEach((function(e){var t=e.original,a=t.source,n=t.target,r=t.linkNum;a.endsWith("start")?(z[a]={source:q[r].target,target:q[r].source},z[n]={target:q[r].target,source:q[r].source}):(z[a]={source:q[r].source,target:q[r].target},z[n]={target:q[r].source,source:q[r].target})})),l&&!F[0].original.paths?r.a.createElement("h1",null,"no paths found"):r.a.createElement("svg",{width:"100%",height:"100%",ref:t,viewBox:[0,0,f,b].toString()},r.a.createElement("g",{ref:a},F.map((function(e){var t=e.links[0][0],a=e.links[0][1],n=e.links[1][0],c=e.links[1][1];if(l){var o=z[e.original.source],i=o.source,u=o.target,s=z[e.original.target],m=s.source,f=s.target,d=Math.sqrt(Math.pow(u.y-i.y,2)+Math.pow(u.x-i.x,2)),h=Math.sqrt(Math.pow(f.y-m.y,2)+Math.pow(f.x-m.x,2));return e.original.paths.map((function(o,l){var s=(60+50*l)/d,g=(60+50*l)/h,p=(1-s)*i.x+s*u.x,b=(1-s)*i.y+s*u.y,v=(1-g)*m.x+g*f.x,k=(1-g)*m.y+g*f.y,O=E.path();return O.moveTo(t,a),O.bezierCurveTo(p,b,v,k,n,c),r.a.createElement("path",{key:O.toString(),d:O,strokeWidth:B,stroke:N[o],fill:"none",onClick:function(){return w(e.original)}})}))}var g,p=E.line().context(null),b=e.links[0][0],v=e.links[0][1],k=e.links[1][0],O=e.links[1][1],j=k-b,x=O-v,y=Math.sqrt(j*j+x*x),S=y,C=y,T=0,H=0;return e.original.loop?(T=90,H=1,S=-30,C=-20,k+=1,O+=1,g="M".concat(b,",").concat(v,"A").concat(S,",").concat(C," ").concat(T,",").concat(H,",").concat(0," ").concat(k,",").concat(O)):g=p(e.links),r.a.createElement("path",{key:g.toString(),d:g,strokeWidth:B,stroke:"black",fill:"none",onClick:function(){return w(e.original)}})})),W.map((function(e,t){var a=E.line().context(null)(e.links);return r.a.createElement("path",{key:a.toString(),d:a,title:e.id,strokeWidth:T,stroke:s.startsWith("Just")?s.replace("Just","").toLowerCase():E.hsl(E["interpolate".concat(s)](t/W.length)).darker(),fill:"none",onClick:function(){return w(e.original)}},r.a.createElement("title",null,e.id))}))))})),j=a(85),x=a(50),y=a(52);var S=a(58),C=a.n(S),T=r.a.forwardRef((function(e,t){var a=e.onColorChange,n=e.onPathDraw,c=e.color;return r.a.createElement("div",null,r.a.createElement("p",null,"Settings"),r.a.createElement(j.a.Group,null,r.a.createElement(j.a.Label,null,"Color"),r.a.createElement(j.a.Control,{value:c,onChange:function(e){return a(e.target.value)},as:"select"},r.a.createElement("option",null,"JustGrey"),r.a.createElement("option",null,"Turbo"),r.a.createElement("option",null,"Rainbow"),r.a.createElement("option",null,"Spectral"),r.a.createElement("option",null,"Viridis"),r.a.createElement("option",null,"RdYlBu")),r.a.createElement("br",null),r.a.createElement(f.a,{onClick:function(){return C()(function(e){var t="http://www.w3.org/2000/xmlns/";e=e.cloneNode(!0);for(var a="".concat(window.location.href,"#"),n=document.createTreeWalker(e,NodeFilter.SHOW_ELEMENT,null,!1);n.nextNode();){var r,c=Object(y.a)(n.currentNode.attributes);try{for(c.s();!(r=c.n()).done;){var o=r.value;o.value.includes(a)&&(o.value=o.value.replace(a,"#"))}}catch(i){c.e(i)}finally{c.f()}}e.setAttributeNS(t,"xmlns","http://www.w3.org/2000/svg"),e.setAttributeNS(t,"xmlns:xlink","http://www.w3.org/1999/xlink");var l=(new window.XMLSerializer).serializeToString(e);return new Blob([l],{type:"image/svg+xml"})}(t.current))}},"Export SVG"),r.a.createElement(j.a.Group,{onChange:function(e){n(e.target.checked)}},r.a.createElement(j.a.Check,{type:"checkbox",label:"Draw paths"}))))})),H=a(83),B=a(59),M=a(87),G=a(88),L=a(86);function N(e){var t=e.onHide,a=e.settings,c=e.onSettings,o=Object(n.useState)(a.numSteps),l=Object(s.a)(o,2),i=l[0],u=l[1],d=Object(n.useState)(a.chunkSize),h=Object(s.a)(d,2),p=h[0],E=h[1],b=Object(n.useState)(a.strength),v=Object(s.a)(b,2),k=v[0],O=v[1],w=Object(n.useState)(a.sequenceThickness),x=Object(s.a)(w,2),y=x[0],S=x[1],C=Object(n.useState)(a.linkThickness),T=Object(s.a)(C,2),M=T[0],G=T[1];return r.a.createElement(m.a,{show:!0,onHide:t,size:"lg"},r.a.createElement(m.a.Header,{closeButton:!0},r.a.createElement(m.a.Title,null,"Settings")),r.a.createElement(m.a.Body,null,r.a.createElement(j.a,{onSubmit:function(e){e.preventDefault(),c(Object(g.a)({},a,{chunkSize:p,numSteps:i,strength:k,sequenceThickness:y,linkThickness:M})),t()}},r.a.createElement(j.a.Group,{as:H.a},r.a.createElement(j.a.Label,{column:!0,sm:"4"},"Number of simulation steps"),r.a.createElement(B.a,null,r.a.createElement(j.a.Control,{column:!0,type:"input",value:i,onChange:function(e){return u(+e.target.value)}}))),r.a.createElement(j.a.Group,{as:H.a},r.a.createElement(j.a.Label,{column:!0,sm:"4"},"Sequence chunk size"),r.a.createElement(B.a,null,r.a.createElement(j.a.Control,{column:!0,type:"input",value:p,onChange:function(e){return E(+e.target.value)}}))),r.a.createElement(j.a.Group,{as:H.a},r.a.createElement(j.a.Label,{column:!0,sm:"4"},"Force directed layout strength"),r.a.createElement(B.a,null,r.a.createElement(j.a.Control,{column:!0,type:"input",value:k,onChange:function(e){return O(+e.target.value)}}))),r.a.createElement(j.a.Group,{as:H.a},r.a.createElement(j.a.Label,{column:!0,sm:"4"},"Edge thickness"),r.a.createElement(B.a,null,r.a.createElement(j.a.Control,{column:!0,type:"input",value:y,onChange:function(e){return S(+e.target.value)}}))),r.a.createElement(j.a.Group,{as:H.a},r.a.createElement(j.a.Label,{column:!0,sm:"4"},"Link thickness"),r.a.createElement(B.a,null,r.a.createElement(j.a.Control,{column:!0,type:"input",value:M,onChange:function(e){return G(+e.target.value)}}))),r.a.createElement(f.a,{type:"submit"},"Submit"))))}function q(e){var t=e.onHide;return r.a.createElement(m.a,{show:!0,onHide:t},r.a.createElement(m.a.Header,{closeButton:!0},r.a.createElement(m.a.Title,null,"graphgenome browser")),r.a.createElement(m.a.Body,null,r.a.createElement("p",null,"This is a small demo of browsing a simple graph genomes. The samples are provided via GFA format"),r.a.createElement("p",null,"Contact ",r.a.createElement("a",{href:"mainto:colin.diesh@gmail.com"},"Colin Diesh")),r.a.createElement("p",null,"Thanks to the BCC2020 pangenome team, and"," ",r.a.createElement("a",{href:"https://github.com/rrwick/Bandage"},"Bandage")," for inspiration."),r.a.createElement("p",null,"Sample data from GFA-spec repo (MT.gfa), Andrea Guarracino (path example), and gfalint (Shaun Jackman)"),r.a.createElement("a",{href:"https://github.com/cmdcolin/graphgenomeviewer"},"GitHub")))}function W(e){var t=e.onHide,a=e.onData,c=Object(n.useState)(),o=Object(s.a)(c,2),l=o[0],i=o[1];return r.a.createElement(m.a,{show:!0,onHide:t},r.a.createElement(m.a.Header,{closeButton:!0},r.a.createElement(m.a.Title,null,"graphgenome browser")),r.a.createElement(m.a.Body,null,r.a.createElement(j.a,{onSubmit:function(){a(l),t()}},r.a.createElement(j.a.Group,null,r.a.createElement(j.a.Label,null,"Enter URL"),r.a.createElement(j.a.Control,{type:"input",value:l,onChange:function(e){return i(e.target.value)}})),r.a.createElement(f.a,{type:"submit"},"Submit"))))}function F(e){var t=e.onHide,a=e.onGraph,c=Object(n.useRef)();return r.a.createElement(m.a,{show:!0,onHide:t},r.a.createElement(m.a.Header,{closeButton:!0},r.a.createElement(m.a.Title,null,"Open file")),r.a.createElement(m.a.Body,null,r.a.createElement(j.a,{onSubmit:function(){var e=Object(u.a)(i.a.mark((function e(n){var r;return i.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return n.preventDefault(),e.next=3,c.current.files[0].text();case 3:r=e.sent,a(r),t();case 6:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}()},r.a.createElement(j.a.Group,null,r.a.createElement(j.a.Label,null,"Open file"),r.a.createElement(j.a.Control,{ref:c,type:"file"})),r.a.createElement(f.a,{type:"submit"},"Submit"))))}function z(e){var t=e.onData,a=e.settings,c=e.onGraph,o=e.onSettings,l=Object(n.useState)(),i=Object(s.a)(l,2),u=i[0],m=i[1],f=Object(n.useState)(),d=Object(s.a)(f,2),h=d[0],g=d[1],p=Object(n.useState)(),E=Object(s.a)(p,2),b=E[0],v=E[1],k=Object(n.useState)(),O=Object(s.a)(k,2),w=O[0],j=O[1];return r.a.createElement(r.a.Fragment,null,r.a.createElement(M.a,{bg:"light",expand:"lg"},r.a.createElement(M.a.Brand,{href:"#home"},"graphgenome browser"),r.a.createElement(M.a.Toggle,{"aria-controls":"basic-navbar-nav"}),r.a.createElement(M.a.Collapse,{id:"basic-navbar-nav"},r.a.createElement(G.a,{className:"mr-auto"},r.a.createElement(L.a,{title:"File",id:"basic-nav-dropdown"},r.a.createElement(L.a.Item,{onClick:function(){return v(!0)}},"Open URL"),r.a.createElement(L.a.Item,{onClick:function(){return j(!0)}},"Open file")),r.a.createElement(L.a,{title:"Examples",id:"basic-nav-dropdown"},r.a.createElement(L.a.Item,{onClick:function(){return t("MT.gfa")}},"MT GFA-spec example"),r.a.createElement(L.a.Item,{onClick:function(){return t("toy_pangenome.gfa")}},"Paths example"),r.a.createElement(L.a.Item,{onClick:function(){return t("big1.gfa")}},"Big1"),r.a.createElement(L.a.Item,{onClick:function(){return t("ir1.gfa")}},"Ir1")),r.a.createElement(G.a.Link,{onClick:function(){g(!0)}},"Settings"),r.a.createElement(G.a.Link,{onClick:function(){m(!0)}},"About")))),u?r.a.createElement(q,{onHide:function(){return m(!1)}}):null,h?r.a.createElement(N,{settings:a,onHide:function(){return g(!1)},onSettings:o}):null,b?r.a.createElement(W,{onData:t,onHide:function(){return v(!1)}}):null,w?r.a.createElement(F,{onGraph:c,onHide:function(){return j(!1)}}):null)}a(76),a(77);var R=function(){var e=Object(n.useState)(),t=Object(s.a)(e,2),a=t[0],c=t[1],o=Object(n.useState)("MT.gfa"),l=Object(s.a)(o,2),m=l[0],f=l[1],h=Object(n.useState)(),g=Object(s.a)(h,2),p=g[0],E=g[1],b=Object(n.useState)(),v=Object(s.a)(b,2),k=v[0],O=v[1],j=Object(n.useState)("Rainbow"),S=Object(s.a)(j,2),C=S[0],H=S[1],B=Object(n.useState)(!1),M=Object(s.a)(B,2),G=M[0],L=M[1],N=Object(n.useState)({strength:-50,chunkSize:1e3,numSteps:1e3,sequenceThickness:10,linkThickness:2}),q=Object(s.a)(N,2),W=q[0],F=q[1],R=Object(n.useRef)();Object(n.useEffect)((function(){Object(u.a)(i.a.mark((function e(){var t,a;return i.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,e.next=3,fetch(m);case 3:if((t=e.sent).ok){e.next=6;break}throw new Error("Failed to fetch ".concat(t.statusText));case 6:return e.next=8,t.text();case 8:a=e.sent,E(a),O(void 0),e.next=17;break;case 13:e.prev=13,e.t0=e.catch(0),console.error(e.t0),O(e.t0.message);case 17:case"end":return e.stop()}}),e,null,[[0,13]])})))()}),[m]);var D=Object(n.useMemo)((function(){return p?function(e){var t,a={nodes:[],links:[],paths:[]},n=Object(y.a)(e.split("\n"));try{for(n.s();!(t=n.n()).done;){var r=t.value;if(r.startsWith("S")){for(var c=r.split("\t"),o=Object(x.a)(c),l=o[1],i=o[2],u=o.slice(3),m={},f=0;f<u.length;f++){var d=u[f].split(":"),h=Object(s.a)(d,3),g=h[0],p=h[1],E=h[2];"i"===p?m[g]=+E:"Z"===p&&(m[g]=E)}a.nodes.push({id:l,sequence:i,tags:m})}else if(r.startsWith("L")){for(var b=r.split("\t"),v=Object(x.a)(b),k=v[1],O=v[2],w=v[3],j=v[4],S=v[5],C=v.slice(6),T={},H=0;H<C.length;H++){var B=C[H].split(":"),M=Object(s.a)(B,3),G=M[0],L=M[1],N=M[2];"i"===L?T[G]=+N:"Z"===L&&(T[G]=N)}a.links.push({source:k,target:w,strand1:O,strand2:j,cigar:S,tags:T})}else if(r.startsWith("P")){var q=r.split("\t"),W=Object(x.a)(q),F=W[1],z=W[2],R=W.slice(3);a.paths.push({name:F,path:z,rest:R})}}}catch(D){n.e(D)}finally{n.f()}return a}(p):void 0}),[p]);return r.a.createElement("div",null,r.a.createElement(z,{onData:function(e){f(e)},onGraph:function(e){E(e)},onSettings:function(e){F(e)},settings:W}),a?r.a.createElement(d,{data:a,onModal:function(e){c(e)},onHide:function(){c(void 0)}}):null,r.a.createElement("div",{className:"flexcontainer"},r.a.createElement("div",{id:"sidebar",className:"sidebar"},r.a.createElement(T,{ref:R,color:C,onColorChange:function(e){return H(e)},onPathDraw:function(e){return L(e)}})),r.a.createElement("div",{className:"body"},k?r.a.createElement("div",{style:{color:"red"}},k):null,D?r.a.createElement(w,{graph:D,ref:R,color:C,drawPaths:G,onFeatureClick:function(e){c(e)},settings:W}):null)))};Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));o.a.render(r.a.createElement(r.a.StrictMode,null,r.a.createElement(R,null)),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(e){e.unregister()})).catch((function(e){console.error(e.message)}))}},[[64,1,2]]]);
//# sourceMappingURL=main.07ec4483.chunk.js.map