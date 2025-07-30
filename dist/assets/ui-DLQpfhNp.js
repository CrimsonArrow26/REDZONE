import{r as s,R as E,a as Z}from"./router-Dbqbj4KK.js";import{r as be}from"./vendor-Bs7gn1Hv.js";var q={exports:{}},N={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var B;function Re(){if(B)return N;B=1;var e=be(),t=Symbol.for("react.element"),n=Symbol.for("react.fragment"),o=Object.prototype.hasOwnProperty,r=e.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,a={key:!0,ref:!0,__self:!0,__source:!0};function l(i,u,f){var c,d={},m=null,v=null;f!==void 0&&(m=""+f),u.key!==void 0&&(m=""+u.key),u.ref!==void 0&&(v=u.ref);for(c in u)o.call(u,c)&&!a.hasOwnProperty(c)&&(d[c]=u[c]);if(i&&i.defaultProps)for(c in u=i.defaultProps,u)d[c]===void 0&&(d[c]=u[c]);return{$$typeof:t,type:i,key:m,ref:v,props:d,_owner:r.current}}return N.Fragment=n,N.jsx=l,N.jsxs=l,N}var K;function Se(){return K||(K=1,q.exports=Re()),q.exports}var h=Se();function M(e,t,{checkForDefaultPrevented:n=!0}={}){return function(r){if(e?.(r),n===!1||!r.defaultPrevented)return t?.(r)}}function z(e,t=[]){let n=[];function o(a,l){const i=s.createContext(l),u=n.length;n=[...n,l];const f=d=>{const{scope:m,children:v,...b}=d,g=m?.[e]?.[u]||i,y=s.useMemo(()=>b,Object.values(b));return h.jsx(g.Provider,{value:y,children:v})};f.displayName=a+"Provider";function c(d,m){const v=m?.[e]?.[u]||i,b=s.useContext(v);if(b)return b;if(l!==void 0)return l;throw new Error(`\`${d}\` must be used within \`${a}\``)}return[f,c]}const r=()=>{const a=n.map(l=>s.createContext(l));return function(i){const u=i?.[e]||a;return s.useMemo(()=>({[`__scope${e}`]:{...i,[e]:u}}),[i,u])}};return r.scopeName=e,[o,Me(r,...t)]}function Me(...e){const t=e[0];if(e.length===1)return t;const n=()=>{const o=e.map(r=>({useScope:r(),scopeName:r.scopeName}));return function(a){const l=o.reduce((i,{useScope:u,scopeName:f})=>{const d=u(a)[`__scope${f}`];return{...i,...d}},{});return s.useMemo(()=>({[`__scope${t.scopeName}`]:l}),[l])}};return n.scopeName=t.scopeName,n}function W(e,t){if(typeof e=="function")return e(t);e!=null&&(e.current=t)}function J(...e){return t=>{let n=!1;const o=e.map(r=>{const a=W(r,t);return!n&&typeof a=="function"&&(n=!0),a});if(n)return()=>{for(let r=0;r<o.length;r++){const a=o[r];typeof a=="function"?a():W(e[r],null)}}}}function O(...e){return s.useCallback(J(...e),e)}function j(e){const t=we(e),n=s.forwardRef((o,r)=>{const{children:a,...l}=o,i=s.Children.toArray(a),u=i.find(Ie);if(u){const f=u.props.children,c=i.map(d=>d===u?s.Children.count(f)>1?s.Children.only(null):s.isValidElement(f)?f.props.children:null:d);return h.jsx(t,{...l,ref:r,children:s.isValidElement(f)?s.cloneElement(f,void 0,c):null})}return h.jsx(t,{...l,ref:r,children:a})});return n.displayName=`${e}.Slot`,n}var lt=j("Slot");function we(e){const t=s.forwardRef((n,o)=>{const{children:r,...a}=n;if(s.isValidElement(r)){const l=Ae(r),i=Te(a,r.props);return r.type!==s.Fragment&&(i.ref=o?J(o,l):l),s.cloneElement(r,i)}return s.Children.count(r)>1?s.Children.only(null):null});return t.displayName=`${e}.SlotClone`,t}var Ee=Symbol("radix.slottable");function Ie(e){return s.isValidElement(e)&&typeof e.type=="function"&&"__radixId"in e.type&&e.type.__radixId===Ee}function Te(e,t){const n={...t};for(const o in t){const r=e[o],a=t[o];/^on[A-Z]/.test(o)?r&&a?n[o]=(...i)=>{const u=a(...i);return r(...i),u}:r&&(n[o]=r):o==="style"?n[o]={...r,...a}:o==="className"&&(n[o]=[r,a].filter(Boolean).join(" "))}return{...e,...n}}function Ae(e){let t=Object.getOwnPropertyDescriptor(e.props,"ref")?.get,n=t&&"isReactWarning"in t&&t.isReactWarning;return n?e.ref:(t=Object.getOwnPropertyDescriptor(e,"ref")?.get,n=t&&"isReactWarning"in t&&t.isReactWarning,n?e.props.ref:e.props.ref||e.ref)}function Ne(e){const t=e+"CollectionProvider",[n,o]=z(t),[r,a]=n(t,{collectionRef:{current:null},itemMap:new Map}),l=g=>{const{scope:y,children:C}=g,S=E.useRef(null),x=E.useRef(new Map).current;return h.jsx(r,{scope:y,itemMap:x,collectionRef:S,children:C})};l.displayName=t;const i=e+"CollectionSlot",u=j(i),f=E.forwardRef((g,y)=>{const{scope:C,children:S}=g,x=a(i,C),k=O(y,x.collectionRef);return h.jsx(u,{ref:k,children:S})});f.displayName=i;const c=e+"CollectionItemSlot",d="data-radix-collection-item",m=j(c),v=E.forwardRef((g,y)=>{const{scope:C,children:S,...x}=g,k=E.useRef(null),T=O(y,k),A=a(c,C);return E.useEffect(()=>(A.itemMap.set(k,{ref:k,...x}),()=>void A.itemMap.delete(k))),h.jsx(m,{[d]:"",ref:T,children:S})});v.displayName=c;function b(g){const y=a(e+"CollectionConsumer",g);return E.useCallback(()=>{const S=y.collectionRef.current;if(!S)return[];const x=Array.from(S.querySelectorAll(`[${d}]`));return Array.from(y.itemMap.values()).sort((A,P)=>x.indexOf(A.ref.current)-x.indexOf(P.ref.current))},[y.collectionRef,y.itemMap])}return[{Provider:l,Slot:f,ItemSlot:v},b,o]}var L=globalThis?.document?s.useLayoutEffect:()=>{},_e=Z[" useId ".trim().toString()]||(()=>{}),Pe=0;function Y(e){const[t,n]=s.useState(_e());return L(()=>{n(o=>o??String(Pe++))},[e]),e||(t?`radix-${t}`:"")}var Fe=["a","button","div","form","h2","h3","img","input","label","li","nav","ol","p","select","span","svg","ul"],I=Fe.reduce((e,t)=>{const n=j(`Primitive.${t}`),o=s.forwardRef((r,a)=>{const{asChild:l,...i}=r,u=l?n:t;return typeof window<"u"&&(window[Symbol.for("radix-ui")]=!0),h.jsx(u,{...i,ref:a})});return o.displayName=`Primitive.${t}`,{...e,[t]:o}},{});function Oe(e){const t=s.useRef(e);return s.useEffect(()=>{t.current=e}),s.useMemo(()=>(...n)=>t.current?.(...n),[])}var je=Z[" useInsertionEffect ".trim().toString()]||L;function X({prop:e,defaultProp:t,onChange:n=()=>{},caller:o}){const[r,a,l]=Le({defaultProp:t,onChange:n}),i=e!==void 0,u=i?e:r;{const c=s.useRef(e!==void 0);s.useEffect(()=>{const d=c.current;d!==i&&console.warn(`${o} is changing from ${d?"controlled":"uncontrolled"} to ${i?"controlled":"uncontrolled"}. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component.`),c.current=i},[i,o])}const f=s.useCallback(c=>{if(i){const d=De(c)?c(e):c;d!==e&&l.current?.(d)}else a(c)},[i,e,a,l]);return[u,f]}function Le({defaultProp:e,onChange:t}){const[n,o]=s.useState(e),r=s.useRef(n),a=s.useRef(t);return je(()=>{a.current=t},[t]),s.useEffect(()=>{r.current!==n&&(a.current?.(n),r.current=n)},[n,r]),[n,o,a]}function De(e){return typeof e=="function"}var Ue=s.createContext(void 0);function Q(e){const t=s.useContext(Ue);return e||t||"ltr"}var V="rovingFocusGroup.onEntryFocus",qe={bubbles:!1,cancelable:!0},_="RovingFocusGroup",[$,ee,Ve]=Ne(_),[$e,te]=z(_,[Ve]),[ze,Ge]=$e(_),ne=s.forwardRef((e,t)=>h.jsx($.Provider,{scope:e.__scopeRovingFocusGroup,children:h.jsx($.Slot,{scope:e.__scopeRovingFocusGroup,children:h.jsx(He,{...e,ref:t})})}));ne.displayName=_;var He=s.forwardRef((e,t)=>{const{__scopeRovingFocusGroup:n,orientation:o,loop:r=!1,dir:a,currentTabStopId:l,defaultCurrentTabStopId:i,onCurrentTabStopIdChange:u,onEntryFocus:f,preventScrollOnEntryFocus:c=!1,...d}=e,m=s.useRef(null),v=O(t,m),b=Q(a),[g,y]=X({prop:l,defaultProp:i??null,onChange:u,caller:_}),[C,S]=s.useState(!1),x=Oe(f),k=ee(n),T=s.useRef(!1),[A,P]=s.useState(0);return s.useEffect(()=>{const R=m.current;if(R)return R.addEventListener(V,x),()=>R.removeEventListener(V,x)},[x]),h.jsx(ze,{scope:n,orientation:o,dir:b,loop:r,currentTabStopId:g,onItemFocus:s.useCallback(R=>y(R),[y]),onItemShiftTab:s.useCallback(()=>S(!0),[]),onFocusableItemAdd:s.useCallback(()=>P(R=>R+1),[]),onFocusableItemRemove:s.useCallback(()=>P(R=>R-1),[]),children:h.jsx(I.div,{tabIndex:C||A===0?-1:0,"data-orientation":o,...d,ref:v,style:{outline:"none",...e.style},onMouseDown:M(e.onMouseDown,()=>{T.current=!0}),onFocus:M(e.onFocus,R=>{const xe=!T.current;if(R.target===R.currentTarget&&xe&&!C){const H=new CustomEvent(V,qe);if(R.currentTarget.dispatchEvent(H),!H.defaultPrevented){const U=k().filter(w=>w.focusable),ge=U.find(w=>w.active),ke=U.find(w=>w.id===g),Ce=[ge,ke,...U].filter(Boolean).map(w=>w.ref.current);se(Ce,c)}}T.current=!1}),onBlur:M(e.onBlur,()=>S(!1))})})}),oe="RovingFocusGroupItem",re=s.forwardRef((e,t)=>{const{__scopeRovingFocusGroup:n,focusable:o=!0,active:r=!1,tabStopId:a,children:l,...i}=e,u=Y(),f=a||u,c=Ge(oe,n),d=c.currentTabStopId===f,m=ee(n),{onFocusableItemAdd:v,onFocusableItemRemove:b,currentTabStopId:g}=c;return s.useEffect(()=>{if(o)return v(),()=>b()},[o,v,b]),h.jsx($.ItemSlot,{scope:n,id:f,focusable:o,active:r,children:h.jsx(I.span,{tabIndex:d?0:-1,"data-orientation":c.orientation,...i,ref:t,onMouseDown:M(e.onMouseDown,y=>{o?c.onItemFocus(f):y.preventDefault()}),onFocus:M(e.onFocus,()=>c.onItemFocus(f)),onKeyDown:M(e.onKeyDown,y=>{if(y.key==="Tab"&&y.shiftKey){c.onItemShiftTab();return}if(y.target!==y.currentTarget)return;const C=We(y,c.orientation,c.dir);if(C!==void 0){if(y.metaKey||y.ctrlKey||y.altKey||y.shiftKey)return;y.preventDefault();let x=m().filter(k=>k.focusable).map(k=>k.ref.current);if(C==="last")x.reverse();else if(C==="prev"||C==="next"){C==="prev"&&x.reverse();const k=x.indexOf(y.currentTarget);x=c.loop?Ze(x,k+1):x.slice(k+1)}setTimeout(()=>se(x))}}),children:typeof l=="function"?l({isCurrentTabStop:d,hasTabStop:g!=null}):l})})});re.displayName=oe;var Be={ArrowLeft:"prev",ArrowUp:"prev",ArrowRight:"next",ArrowDown:"next",PageUp:"first",Home:"first",PageDown:"last",End:"last"};function Ke(e,t){return t!=="rtl"?e:e==="ArrowLeft"?"ArrowRight":e==="ArrowRight"?"ArrowLeft":e}function We(e,t,n){const o=Ke(e.key,n);if(!(t==="vertical"&&["ArrowLeft","ArrowRight"].includes(o))&&!(t==="horizontal"&&["ArrowUp","ArrowDown"].includes(o)))return Be[o]}function se(e,t=!1){const n=document.activeElement;for(const o of e)if(o===n||(o.focus({preventScroll:t}),document.activeElement!==n))return}function Ze(e,t){return e.map((n,o)=>e[(t+o)%e.length])}var Je=ne,Ye=re;function Xe(e,t){return s.useReducer((n,o)=>t[n][o]??n,e)}var ae=e=>{const{present:t,children:n}=e,o=Qe(t),r=typeof n=="function"?n({present:o.isPresent}):s.Children.only(n),a=O(o.ref,et(r));return typeof n=="function"||o.isPresent?s.cloneElement(r,{ref:a}):null};ae.displayName="Presence";function Qe(e){const[t,n]=s.useState(),o=s.useRef(null),r=s.useRef(e),a=s.useRef("none"),l=e?"mounted":"unmounted",[i,u]=Xe(l,{mounted:{UNMOUNT:"unmounted",ANIMATION_OUT:"unmountSuspended"},unmountSuspended:{MOUNT:"mounted",ANIMATION_END:"unmounted"},unmounted:{MOUNT:"mounted"}});return s.useEffect(()=>{const f=F(o.current);a.current=i==="mounted"?f:"none"},[i]),L(()=>{const f=o.current,c=r.current;if(c!==e){const m=a.current,v=F(f);e?u("MOUNT"):v==="none"||f?.display==="none"?u("UNMOUNT"):u(c&&m!==v?"ANIMATION_OUT":"UNMOUNT"),r.current=e}},[e,u]),L(()=>{if(t){let f;const c=t.ownerDocument.defaultView??window,d=v=>{const g=F(o.current).includes(v.animationName);if(v.target===t&&g&&(u("ANIMATION_END"),!r.current)){const y=t.style.animationFillMode;t.style.animationFillMode="forwards",f=c.setTimeout(()=>{t.style.animationFillMode==="forwards"&&(t.style.animationFillMode=y)})}},m=v=>{v.target===t&&(a.current=F(o.current))};return t.addEventListener("animationstart",m),t.addEventListener("animationcancel",d),t.addEventListener("animationend",d),()=>{c.clearTimeout(f),t.removeEventListener("animationstart",m),t.removeEventListener("animationcancel",d),t.removeEventListener("animationend",d)}}else u("ANIMATION_END")},[t,u]),{isPresent:["mounted","unmountSuspended"].includes(i),ref:s.useCallback(f=>{o.current=f?getComputedStyle(f):null,n(f)},[])}}function F(e){return e?.animationName||"none"}function et(e){let t=Object.getOwnPropertyDescriptor(e.props,"ref")?.get,n=t&&"isReactWarning"in t&&t.isReactWarning;return n?e.ref:(t=Object.getOwnPropertyDescriptor(e,"ref")?.get,n=t&&"isReactWarning"in t&&t.isReactWarning,n?e.props.ref:e.props.ref||e.ref)}var D="Tabs",[tt,ut]=z(D,[te]),ce=te(),[nt,G]=tt(D),ie=s.forwardRef((e,t)=>{const{__scopeTabs:n,value:o,onValueChange:r,defaultValue:a,orientation:l="horizontal",dir:i,activationMode:u="automatic",...f}=e,c=Q(i),[d,m]=X({prop:o,onChange:r,defaultProp:a??"",caller:D});return h.jsx(nt,{scope:n,baseId:Y(),value:d,onValueChange:m,orientation:l,dir:c,activationMode:u,children:h.jsx(I.div,{dir:c,"data-orientation":l,...f,ref:t})})});ie.displayName=D;var le="TabsList",ue=s.forwardRef((e,t)=>{const{__scopeTabs:n,loop:o=!0,...r}=e,a=G(le,n),l=ce(n);return h.jsx(Je,{asChild:!0,...l,orientation:a.orientation,dir:a.dir,loop:o,children:h.jsx(I.div,{role:"tablist","aria-orientation":a.orientation,...r,ref:t})})});ue.displayName=le;var de="TabsTrigger",fe=s.forwardRef((e,t)=>{const{__scopeTabs:n,value:o,disabled:r=!1,...a}=e,l=G(de,n),i=ce(n),u=me(l.baseId,o),f=ve(l.baseId,o),c=o===l.value;return h.jsx(Ye,{asChild:!0,...i,focusable:!r,active:c,children:h.jsx(I.button,{type:"button",role:"tab","aria-selected":c,"aria-controls":f,"data-state":c?"active":"inactive","data-disabled":r?"":void 0,disabled:r,id:u,...a,ref:t,onMouseDown:M(e.onMouseDown,d=>{!r&&d.button===0&&d.ctrlKey===!1?l.onValueChange(o):d.preventDefault()}),onKeyDown:M(e.onKeyDown,d=>{[" ","Enter"].includes(d.key)&&l.onValueChange(o)}),onFocus:M(e.onFocus,()=>{const d=l.activationMode!=="manual";!c&&!r&&d&&l.onValueChange(o)})})})});fe.displayName=de;var pe="TabsContent",ye=s.forwardRef((e,t)=>{const{__scopeTabs:n,value:o,forceMount:r,children:a,...l}=e,i=G(pe,n),u=me(i.baseId,o),f=ve(i.baseId,o),c=o===i.value,d=s.useRef(c);return s.useEffect(()=>{const m=requestAnimationFrame(()=>d.current=!1);return()=>cancelAnimationFrame(m)},[]),h.jsx(ae,{present:r||c,children:({present:m})=>h.jsx(I.div,{"data-state":c?"active":"inactive","data-orientation":i.orientation,role:"tabpanel","aria-labelledby":u,hidden:!m,id:f,tabIndex:0,...l,ref:t,style:{...e.style,animationDuration:d.current?"0s":void 0},children:m&&a})})});ye.displayName=pe;function me(e,t){return`${e}-trigger-${t}`}function ve(e,t){return`${e}-content-${t}`}var dt=ie,ft=ue,pt=fe,yt=ye;/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var ot={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const rt=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase().trim(),p=(e,t)=>{const n=s.forwardRef(({color:o="currentColor",size:r=24,strokeWidth:a=2,absoluteStrokeWidth:l,className:i="",children:u,...f},c)=>s.createElement("svg",{ref:c,...ot,width:r,height:r,stroke:o,strokeWidth:l?Number(a)*24/Number(r):a,className:["lucide",`lucide-${rt(e)}`,i].join(" "),...f},[...t.map(([d,m])=>s.createElement(d,m)),...Array.isArray(u)?u:[u]]));return n.displayName=`${e}`,n};/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const mt=p("AlertCircle",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const vt=p("AlertTriangle",[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z",key:"c3ski4"}],["path",{d:"M12 9v4",key:"juzpu7"}],["path",{d:"M12 17h.01",key:"p32p05"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ht=p("ArrowLeft",[["path",{d:"m12 19-7-7 7-7",key:"1l729n"}],["path",{d:"M19 12H5",key:"x3x0zl"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const xt=p("Bell",[["path",{d:"M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9",key:"1qo2s2"}],["path",{d:"M10.3 21a1.94 1.94 0 0 0 3.4 0",key:"qgo35s"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const gt=p("Calendar",[["rect",{width:"18",height:"18",x:"3",y:"4",rx:"2",ry:"2",key:"eu3xkr"}],["line",{x1:"16",x2:"16",y1:"2",y2:"6",key:"m3sa8f"}],["line",{x1:"8",x2:"8",y1:"2",y2:"6",key:"18kwsl"}],["line",{x1:"3",x2:"21",y1:"10",y2:"10",key:"xt86sb"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const kt=p("Camera",[["path",{d:"M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z",key:"1tc9qg"}],["circle",{cx:"12",cy:"13",r:"3",key:"1vg3eu"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ct=p("Car",[["path",{d:"M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2",key:"5owen"}],["circle",{cx:"7",cy:"17",r:"2",key:"u2ysq9"}],["path",{d:"M9 17h6",key:"r8uit2"}],["circle",{cx:"17",cy:"17",r:"2",key:"axvx0g"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const bt=p("Clock",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polyline",{points:"12 6 12 12 16 14",key:"68esgv"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Rt=p("ExternalLink",[["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}],["polyline",{points:"15 3 21 3 21 9",key:"mznyad"}],["line",{x1:"10",x2:"21",y1:"14",y2:"3",key:"18c3s4"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const St=p("EyeOff",[["path",{d:"M9.88 9.88a3 3 0 1 0 4.24 4.24",key:"1jxqfv"}],["path",{d:"M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68",key:"9wicm4"}],["path",{d:"M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61",key:"1jreej"}],["line",{x1:"2",x2:"22",y1:"2",y2:"22",key:"a6p6uj"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Mt=p("Eye",[["path",{d:"M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z",key:"rwhkz3"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const wt=p("FileText",[["path",{d:"M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z",key:"1nnpy2"}],["polyline",{points:"14 2 14 8 20 8",key:"1ew0cm"}],["line",{x1:"16",x2:"8",y1:"13",y2:"13",key:"14keom"}],["line",{x1:"16",x2:"8",y1:"17",y2:"17",key:"17nazh"}],["line",{x1:"10",x2:"8",y1:"9",y2:"9",key:"1a5vjj"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Et=p("Flame",[["path",{d:"M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z",key:"96xj49"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const It=p("Guitar",[["path",{d:"m20 7 1.7-1.7a1 1 0 0 0 0-1.4l-1.6-1.6a1 1 0 0 0-1.4 0L17 4v3Z",key:"15ixgv"}],["path",{d:"m17 7-5.1 5.1",key:"l9guh7"}],["circle",{cx:"11.5",cy:"12.5",r:".5",key:"1evg0a"}],["path",{d:"M6 12a2 2 0 0 0 1.8-1.2l.4-.9C8.7 8.8 9.8 8 11 8c2.8 0 5 2.2 5 5 0 1.2-.8 2.3-1.9 2.8l-.9.4A2 2 0 0 0 12 18a4 4 0 0 1-4 4c-3.3 0-6-2.7-6-6a4 4 0 0 1 4-4",key:"x9fguj"}],["path",{d:"m6 16 2 2",key:"16qmzd"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Tt=p("Home",[["path",{d:"m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",key:"y5dka4"}],["polyline",{points:"9 22 9 12 15 12 15 22",key:"e2us08"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const At=p("Lock",[["rect",{width:"18",height:"11",x:"3",y:"11",rx:"2",ry:"2",key:"1w4ew1"}],["path",{d:"M7 11V7a5 5 0 0 1 10 0v4",key:"fwvmzm"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Nt=p("LogOut",[["path",{d:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",key:"1uf3rs"}],["polyline",{points:"16 17 21 12 16 7",key:"1gabdz"}],["line",{x1:"21",x2:"9",y1:"12",y2:"12",key:"1uyos4"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _t=p("Mail",[["rect",{width:"20",height:"16",x:"2",y:"4",rx:"2",key:"18n3k1"}],["path",{d:"m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7",key:"1ocrg3"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Pt=p("MapPin",[["path",{d:"M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z",key:"2oe9fu"}],["circle",{cx:"12",cy:"10",r:"3",key:"ilqhr7"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ft=p("Menu",[["line",{x1:"4",x2:"20",y1:"12",y2:"12",key:"1e0a9i"}],["line",{x1:"4",x2:"20",y1:"6",y2:"6",key:"1owob3"}],["line",{x1:"4",x2:"20",y1:"18",y2:"18",key:"yk5zj1"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ot=p("MessageCircle",[["path",{d:"m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z",key:"v2veuj"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const jt=p("Phone",[["path",{d:"M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z",key:"foiqr5"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Lt=p("Plus",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Dt=p("Search",[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["path",{d:"m21 21-4.3-4.3",key:"1qie3q"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ut=p("Send",[["path",{d:"m22 2-7 20-4-9-9-4Z",key:"1q3vgg"}],["path",{d:"M22 2 11 13",key:"nzbqef"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const qt=p("Settings",[["path",{d:"M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z",key:"1qme2f"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Vt=p("Share2",[["circle",{cx:"18",cy:"5",r:"3",key:"gq8acd"}],["circle",{cx:"6",cy:"12",r:"3",key:"w7nqdw"}],["circle",{cx:"18",cy:"19",r:"3",key:"1xt0gg"}],["line",{x1:"8.59",x2:"15.42",y1:"13.51",y2:"17.49",key:"47mynk"}],["line",{x1:"15.41",x2:"8.59",y1:"6.51",y2:"10.49",key:"1n3mei"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $t=p("Shield",[["path",{d:"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10",key:"1irkt0"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const zt=p("Star",[["polygon",{points:"12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2",key:"8f66p6"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Gt=p("ThumbsUp",[["path",{d:"M7 10v12",key:"1qc93n"}],["path",{d:"M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z",key:"y3tblf"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ht=p("Trash2",[["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",key:"4alrt4"}],["path",{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",key:"v07s0e"}],["line",{x1:"10",x2:"10",y1:"11",y2:"17",key:"1uufr5"}],["line",{x1:"14",x2:"14",y1:"11",y2:"17",key:"xtxkd"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Bt=p("TrendingUp",[["polyline",{points:"22 7 13.5 15.5 8.5 10.5 2 17",key:"126l90"}],["polyline",{points:"16 7 22 7 22 13",key:"kwv8wd"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Kt=p("User",[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Wt=p("Users",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87",key:"kshegd"}],["path",{d:"M16 3.13a4 4 0 0 1 0 7.75",key:"1da9ce"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Zt=p("X",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Jt=p("Zap",[["polygon",{points:"13 2 3 14 12 14 11 22 21 10 12 10 13 2",key:"45s27k"}]]);var st="Label",he=s.forwardRef((e,t)=>h.jsx(I.label,{...e,ref:t,onMouseDown:n=>{n.target.closest("button, input, select, textarea")||(e.onMouseDown?.(n),!n.defaultPrevented&&n.detail>1&&n.preventDefault())}}));he.displayName=st;var Yt=he;export{vt as A,xt as B,yt as C,Nt as D,St as E,wt as F,It as G,Tt as H,ft as L,_t as M,jt as P,dt as R,$t as S,pt as T,Kt as U,Zt as X,Jt as Z,lt as a,Yt as b,Mt as c,At as d,Pt as e,gt as f,Wt as g,Lt as h,ht as i,h as j,Ft as k,Bt as l,Rt as m,mt as n,zt as o,bt as p,Dt as q,Ut as r,Ot as s,Gt as t,Vt as u,Et as v,Ct as w,Ht as x,kt as y,qt as z};
