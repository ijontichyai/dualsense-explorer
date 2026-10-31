// Derived from Anatomy examples/arcade-cabinet/build.mjs and parts.mjs:
// arbitrary-axis prisms, four-tone solids, shared build/live geometry, reserved depth slots.
export function makeScene(k,G,A=null){
const W=960,H=540,base={x:-88,y:-37,w:222,d:77,r:7};
const P=k.fitProjection([...k.boxCorners(base,-12,0),[-80,0,110],[130,0,115]],W,H,{pad:57,azimuth:66,elevation:24});
const V=G.viewOf(P),at=p=>k.iso(p,P),S=(p,o)=>k.solidSvg(p,o),Ln=(d,o)=>k.lineSvg(d,o);
function scene(s){
 const R=A?A.recorder(P):null,items=[];
 function put(name,centre,svg,shape,live=false){
 const it={name,at:centre,svg,shapes:shape?[R?R.solid(shape):shape]:[],piece:'mechanism',live};
 if(R)R.put(it);items.push(it);return shape;
 }
 function box(name,x,y,z,w,d,h,tone='mid',extra='',cut){
 const p={x,y,w,d,r:.7},shape=A?.slab(p,z,h,{name,...(cut?{cut}: {})},3);
 return put(name,[x+w/2,y+d/2,z+h/2],S(k.slabOf(p,z,h,P,3,.5),{tone,inner:extra}),shape);
 }
 function disc(name,c,axis,s0,s1,r,tone='mid',live=false,phase=0,cut){
 const F=G.frameAlong(c,axis),shape=A?.disc(F,s0,s1,r,{name,...(cut?{cut}: {})});
 let extra=Ln(G.circleOf(F,s1,r*.7,P,40),{tone:'lo'});
 return put(name,G.add3(c,G.mul3(axis,(s0+s1)/2)),S(G.disc(s0,s1,r,F,P,{steps:48}),{tone,inner:extra}),shape,live);
 }
 function prism(name,c,poly,a,b,tone='hi',live=true,angle=0,cut){
 const ang=angle*Math.PI/180,F=G.frameOf(c,[0,-1,0],[Math.cos(ang),0,Math.sin(ang)],[-Math.sin(ang),0,Math.cos(ang)]);
 // arcade-cabinet uses the same frame convention for panels and moving parts.
 const shape=A?.prism(F,poly,a,b,{name,...(cut?{cut}: {})});
 const paths=concavePaths(F,poly,a,b);
 return put(name,[c[0],c[1]-(a+b)/2,c[2]],S(paths,{tone,lit:name==='trigger'}),shape,live);
 }
 // Exact concave face renderer adapted from arcade-cabinet/prismPaths (the core's prismOf hulls the fill).
 function concavePaths(F,poly,s0,s1){
 const area=poly.reduce((v,p,i)=>v+p[0]*poly[(i+1)%poly.length][1]-poly[(i+1)%poly.length][0]*p[1],0);
 const ring=area>0?poly:[...poly].reverse();
 const world=(s,p)=>G.add3(G.add3(G.add3(F.o,G.mul3(F.a,s)),G.mul3(F.u,p[0])),G.mul3(F.v,p[1]));
 const near=G.dot3(F.a,V)>0?s1:s0,far=near===s1?s0:s1;
 const n=ring.map(p=>at(world(near,p))),f=ring.map(p=>at(world(far,p))),b=[[],[],[],[],[]];
 const visible=ring.map((p,i)=>{const q=ring[(i+1)%ring.length];return G.dot3(G.unit3(G.add3(G.mul3(F.u,q[1]-p[1]),G.mul3(F.v,p[0]-q[0]))),V)>0});
 const orient=pts=>{const ar=pts.reduce((a,p,i)=>a+p[0]*pts[(i+1)%pts.length][1]-pts[(i+1)%pts.length][0]*p[1],0);return ar<0?[...pts].reverse():pts};
 const path=pts=>k.pathOf(orient(pts),true),faces=[path(n),path(f)],outline=[],crease=[];
 for(let i=0;i<ring.length;i++){
 const j=(i+1)%ring.length,p=ring[i],q=ring[j];
 if(visible[i]){const d=path([n[i],n[j],f[j],f[i]]);faces.push(d);b[G.toneOf(G.unit3(G.add3(G.mul3(F.u,q[1]-p[1]),G.mul3(F.v,p[0]-q[0]))),P)].push(d);outline.push(k.pathOf([f[i],f[j]]));crease.push(k.pathOf([n[i],n[j]]));}
 else outline.push(k.pathOf([n[i],n[j]]));
 if(visible[i]!==visible[(i+ring.length-1)%ring.length])outline.push(k.pathOf([n[i],f[i]]));
 }
 b[G.toneOf(near===s1?F.a:G.mul3(F.a,-1),P)].push(path(n));
 return {fill:faces.join(''),outline:outline.join(''),crease:crease.join(''),top:b[4].join(''),shades:b.slice(0,4).map(x=>x.join(''))};
 }
 function screw(name,x,y,z){disc(name,[x,y,z],[0,0,1],0,1.3,1.6,'hi')}
 // Base, four feet and their pads.
 for(const [i,[x,y]] of k.corners(base,14).entries()){
 disc('foot.pad.'+i,[x,y,-12],[0,0,1],0,1.5,5,'lo');disc('foot.'+i,[x,y,-10.5],[0,0,1],0,4.5,3.6,'lo');
 }
 box('stand.base',base.x,base.y,-6,base.w,base.d,6,'lo',Ln(k.planOutline(k.insetPlan(base,4),0,P),{tone:'faint'}));
 for(const [i,[x,y]] of k.corners(base,9).entries())screw('base.screw.'+i,x,y,0);
 const strip={x:-71,y:29,w:185,d:5,r:1};
 box('ruler',strip.x,strip.y,0,strip.w,strip.d,.6,'lo');const ticks=k.topTicks(-67,110,5,5,29,.6,[1.6,3],P);
 items[items.length-1].svg+=Ln(ticks.minor,{tone:'lo'})+Ln(ticks.major,{tone:'mid'});if(R)R.items[R.items.length-1].svg=items[items.length-1].svg;
 // Rear bearing towers: visible cutaway with front side open.
 for(const [i,[x,z]] of [[0,58],[33,58],[78,92]].entries()){
 box('mount.foot.'+i,x-8,9,0,16,15,4,'lo');
 const shaft= A?.disc(G.frameAlong([x,0,z],[0,1,0]),-7,21,2.1,{name:'shaft.'+i});
 box('mount.tower.'+i,x-5,14,4,10,7,z-4,'mid');
 for(const dx of [-5,5])screw('mount.bolt.'+i+'.'+dx,x+dx,11,4);
 // shaft is split at the support faces so the painter can order it without a cycle.
 disc('shaft.rear.'+i,[x,0,z],[0,1,0],21,23,2.1,'hi');
 disc('shaft.front.'+i,[x,0,z],[0,1,0],i===2?-1:3,10,2.1,'hi');
 if(i<2)disc('shaft.tip.'+i,[x,0,z],[0,1,0],-7,-6,2.1,'hi');
 disc('bearing.'+i,[x,0,z],[0,1,0],10,14,4.5,'mid');
 }
 // Motor body rests on two cradle blocks; all axes are illustrative.
 const MF=G.frameAlong([-70,0,37],[1,0,0]);
 const motorShape=A?.disc(MF,0,30,9,{name:'motor.body'});
 for(const [i,x] of [-67,-47].entries()){
 box('motor.cradle.'+i,x,-11,0,6,22,28,'mid');
 screw('motor.bolt.a.'+i,x+3,-9,28);screw('motor.bolt.b.'+i,x+3,9,28);
 }
 disc('motor.body',[-70,0,37],[1,0,0],0,30,9,'hi');
 disc('motor.cap',[-70,0,37],[1,0,0],-2,0,8,'mid');
 disc('motor.end',[-70,0,37],[1,0,0],30,32,8,'mid');
 disc('motor.shaft',[-70,0,37],[1,0,0],32,42,1.5,'hi');
 // Worm core and a helical raised flight, true prismatic facets in both build and browser.
 disc('worm.core',[-28,0,37],[1,0,0],0,48,2,'hi',true);
 const phase=s.motor*Math.PI/180;
 // Smoothly rotated individual flight segments, with no fictitious involute claim.
 for(let i=0;i<24;i++){
 const a=i*Math.PI/3+phase,b=a+Math.PI/3,x=-28+i*2;
 const F=G.frameOf([x,0,37],[1,0,0],[0,1,0],[0,0,1]);
 const poly=[[2*Math.cos(a),2*Math.sin(a)],[3.2*Math.cos(a),3.2*Math.sin(a)],[3.2*Math.cos(b),3.2*Math.sin(b)],[2*Math.cos(b),2*Math.sin(b)]];
 const shape=A?.prism(F,poly,0,2,{name:'worm.flight.'+i});
 put('worm.flight.'+i,[x+1,0,37],S(G.prismOf(F,poly,0,2,P),{tone:'hi'}),shape,true);
 }
 // Gear teeth deliberately separated: display clearance, no claim of an exact tooth-contact model.
 function gear(name,x,angle,phase0){
 const n=20,poly=[];
 for(let i=0;i<n;i++)for(const [f,r] of [[0,14.1],[.22,16],[.55,16],[.78,14.1]]){
 const a=(i+f)*Math.PI*2/n+phase0;poly.push([r*Math.cos(a),r*Math.sin(a)]);
 }
 const shaft=A?.disc(G.frameAlong([x,0,58],[0,1,0]),-7,14,2.1,{name:'shaft.hole.'+x});
 prism(name,[x,0,58],poly,-3,3,'hi',true,angle);
 disc(name+'.hub',[x,0,58],[0,-1,0],3,6,4.2,'mid',true);
 }
 gear('gear.input',0,-s.wheel,0);gear('gear.output',33,s.wheel,Math.PI/20);
 // Lever on output axle, offset to the front of the gears.
 const L=36.33450651595567,angle=s.arm;
 prism('lever',[33,-7,58],[[-3,-3],[L,0],[-3,3]],0,3,'hi',true,angle,
 null);
 disc('lever.pivot',[33,0,58],[0,-1,0],10,12,3.2,'hi');
 // Trigger shell and heel share one rigid rotation about the pivot.
 const triggerPoly=[[-20,-14],[-14,-16],[-8,-5],[7,-5],[37,-13],[42,-10],[42,-3],[25,4],[5,7],[-5,5],[-8,-4]];
 const bore=A?.disc(G.frameAlong([78,0,92],[0,1,0]),-7,14,2.1,{name:'trigger.bore'});
 prism('trigger',[78,-3,92],triggerPoly,-2,2,'hi',true,-s.trigger);
 prism('trigger.heel',[78,-3,92],[[-18,-12],[-12,-12],[-12,-8],[-18,-8]],2,6,'hi',true,-s.trigger);
 disc('trigger.pin',[78,0,92],[0,-1,0],5,7,3.1,'hi');
 // Passive return represented by a torsion spring at the pivot (conceptual winding).
 const springFrame=G.frameAlong([78,-7,92],[0,-1,0]);
 const meridian=[[0,2.9],[0,4],[2,4],[2,2.9]];
 put('return.spring',[78,-8,92],S(G.lathe(meridian,springFrame,P,{steps:48}),{tone:'mid'}),A?.lathe(springFrame,meridian,{name:'return.spring'}));
 // Bench electronics and connector, purposeful detail without ornamental wiring.
 box('pcb.standoff.a',-76,-25,0,4,4,5,'lo');box('pcb.standoff.b',-42,-25,0,4,4,5,'lo');
 box('pcb',-79,-28,5,44,12,1.6,'mid');box('driver',-67,-25,6.6,12,6,2,'hi');
 box('socket',-47,-25,6.6,9,6,4,'mid');
 for(let i=0;i<6;i++)box('pin.'+i,-77+i*1.5,-26,6.6,.7,4,1,'hi');
 return {P,R,items,W,H,base};
}
return {scene,P,W,H};
}
