import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {runScene,type SceneContext,type SceneState} from './scene-runtime';

export function mountScene(host:HTMLElement){
  return runScene(host,context=>host.dataset.scene==='particles'?particleLaboratory(context,host):orbitalSculpture(context));
}

function orbitalSculpture({scene,camera,renderer,color}:SceneContext){
  const primary=color('--color-scene-primary');const secondary=color('--color-scene-secondary');
  const white=color('--color-white');
  const room=new RoomEnvironment();const pmrem=new THREE.PMREMGenerator(renderer);const env=pmrem.fromScene(room,.035);room.dispose();scene.environment=env.texture;
  scene.add(new THREE.HemisphereLight(white,secondary,2));
  const key=new THREE.DirectionalLight(white,4.5);key.position.set(3,5,4);scene.add(key);
  const rim=new THREE.DirectionalLight(secondary,3);rim.position.set(-4,1,-2);scene.add(rim);
  const group=new THREE.Group();scene.add(group);
  const metal=new THREE.MeshPhysicalMaterial({color:primary,metalness:.92,roughness:.15,clearcoat:1,clearcoatRoughness:.08,envMapIntensity:2.3});
  const knot:THREE.Mesh<THREE.BufferGeometry,THREE.MeshPhysicalMaterial>=new THREE.Mesh(new THREE.TorusKnotGeometry(1.8,.52,220,32,2,3),metal);group.add(knot);
  const ringMaterial=new THREE.MeshPhysicalMaterial({color:secondary,metalness:.55,roughness:.21,clearcoat:1});
  const ring=new THREE.Mesh(new THREE.TorusGeometry(3,.035,12,180),ringMaterial);ring.rotation.set(1.2,.35,.15);group.add(ring);
  const satellites=new THREE.Group();group.add(satellites);
  for(let i=0;i<5;i++){const bead=new THREE.Mesh(new THREE.SphereGeometry(.12+i*.036,24,18),ringMaterial);const a=i/5*Math.PI*2;bead.position.set(Math.cos(a)*3.2,Math.sin(a)*1.65,Math.sin(a+.4)*1.8);satellites.add(bead);}
  let currentChoice='knot';let deformation=0;
  const shaderState={time:{value:0},morph:{value:0}};
  metal.onBeforeCompile=shader=>{shader.uniforms.uTime=shaderState.time;shader.uniforms.uMorph=shaderState.morph;shader.vertexShader='uniform float uTime; uniform float uMorph;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed += normalize(objectNormal) * sin(position.y * 3.2 + uTime) * uMorph * .18;');};
  return {
    update(state:SceneState){
      if(state.choice!==currentChoice){currentChoice=state.choice;knot.geometry.dispose();knot.geometry=currentChoice==='core'?new THREE.IcosahedronGeometry(2.4,2):currentChoice==='wave'?new THREE.TorusKnotGeometry(1.7,.36,220,28,3,5):new THREE.TorusKnotGeometry(1.8,.52,220,32,2,3);}
      deformation=THREE.MathUtils.lerp(deformation,state.progress,.08);
      const portrait=state.aspect<.9;
      camera.position.set(0,0,Math.max(portrait?14:10,8.3/Math.max(.5,state.aspect)));camera.lookAt(0,0,0);
      group.position.set(portrait?0:1.15,portrait?1.9:1.15,0);
      group.rotation.set(.15+state.pointer.y*.12+state.progress*.35,state.time*.16+state.progress*Math.PI*.7+state.pointer.x*.22,-.22+state.progress*.2);
      satellites.rotation.y=-state.time*.3;
      knot.rotation.z=state.time*.1;
      ring.rotation.z=.15+state.time*.06;
      shaderState.time.value=state.time*.7;shaderState.morph.value=deformation;
    },
    dispose(){env.dispose();pmrem.dispose();}
  };
}

function particleLaboratory({scene,camera,renderer,color}:SceneContext,host:HTMLElement){
  const count=4600;const core=new Float32Array(count*3),wave=new Float32Array(count*3),orbit=new Float32Array(count*3),sizes=new Float32Array(count),seeds=new Float32Array(count);
  const tau=Math.PI*2;const golden=Math.PI*(3-Math.sqrt(5));
  const random=(i:number)=>{const n=Math.sin(i*127.1+311.7)*43758.5453;return n-Math.floor(n);};
  for(let i=0;i<count;i++){
    const y=1-i/(count-1)*2;const radius=Math.sqrt(1-y*y);const angle=golden*i;const r=1.6+random(i)*.42;
    core.set([Math.cos(angle)*radius*r,y*r,Math.sin(angle)*radius*r],i*3);
    const u=(i%80)/79,v=Math.floor(i/80)/Math.ceil(count/80);const x=(u-.5)*7.4,z=(v-.5)*5.2;
    wave.set([x,Math.sin(u*tau*1.5)*.5+Math.cos(v*tau*2)*.6,z],i*3);
    const band=i%3,a=i/count*tau*11,rr=2.5+random(i)*.33;
    const ax=Math.cos(a)*rr,ay=Math.sin(a)*rr,thickness=(random(i+count)-.5)*.12;
    const point=new THREE.Vector3(ax,ay,thickness);point.applyAxisAngle(new THREE.Vector3(1,0,0),band===0?.35:band===1?1.15:-1.05);point.applyAxisAngle(new THREE.Vector3(0,1,0),band*.8);
    orbit.set([point.x,point.y,point.z],i*3);sizes[i]=2.1+random(i+3)*2.4;seeds[i]=random(i+100);
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(core,3));geometry.setAttribute('aWave',new THREE.BufferAttribute(wave,3));geometry.setAttribute('aOrbit',new THREE.BufferAttribute(orbit,3));geometry.setAttribute('aSize',new THREE.BufferAttribute(sizes,1));geometry.setAttribute('aSeed',new THREE.BufferAttribute(seeds,1));
  const primary=color('--color-scene-primary');const secondary=color('--color-scene-secondary');
  const uniforms={uMorph:{value:0},uTime:{value:0},uRatio:{value:renderer.getPixelRatio()},uPrimary:{value:primary},uSecondary:{value:secondary}};
  const material=new THREE.ShaderMaterial({uniforms,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,vertexShader:`
    attribute vec3 aWave; attribute vec3 aOrbit; attribute float aSize; attribute float aSeed;
    uniform float uMorph; uniform float uTime; uniform float uRatio;
    varying float vSeed;
    void main(){
      float first=smoothstep(0.0,1.0,min(uMorph,1.0));float second=smoothstep(0.0,1.0,max(uMorph-1.0,0.0));
      vec3 p=mix(mix(position,aWave,first),aOrbit,second);
      float drift=sin(uTime*.65+aSeed*6.283185);p+=normalize(p+vec3(.01)) * drift * .065;
      p.y+=sin(p.x*1.7+uTime*.8)*.09*first*(1.0-second);
      vec4 mv=modelViewMatrix*vec4(p,1.0);gl_Position=projectionMatrix*mv;
      gl_PointSize=clamp(aSize*uRatio*14.0/-mv.z,1.7,10.0);vSeed=aSeed;
    }`,fragmentShader:`
    uniform vec3 uPrimary;uniform vec3 uSecondary;varying float vSeed;
    void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;float glow=pow(1.0-d*2.0,1.5);vec3 c=mix(uPrimary,uSecondary,step(.75,vSeed));gl_FragColor=vec4(c,glow*.92);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `});
  // Keep shader includes on their own lines so both WebGL compilers resolve them.
  material.fragmentShader=material.fragmentShader.replace(';#include',';\n#include');
  const points=new THREE.Points(geometry,material);points.frustumCulled=false;scene.add(points);
  const phase=host.closest('section')?.querySelector<HTMLElement>('[data-phase]');let morph=0;
  const phaseLabels=JSON.parse(host.dataset.phases||'[]') as string[];
  return {
    update(state:SceneState){
      const target=state.choice==='core'?0:state.choice==='wave'?1:state.choice==='orbit'?2:Math.min(2,state.progress*2.45);
      morph=THREE.MathUtils.lerp(morph,target,state.paused?1:.06);uniforms.uMorph.value=morph;uniforms.uTime.value=state.time;
      camera.position.set(.3,2.4,Math.max(10,8.3/Math.max(.42,state.aspect)));camera.lookAt(0,0,0);
      points.position.y=state.aspect<.9?-.45:0;
      points.rotation.y=state.time*.08+state.progress*.4+state.pointer.x*.08;
      points.rotation.x=-.12+state.pointer.y*.05;
      const index=state.choice==='core'?0:state.choice==='wave'?1:state.choice==='orbit'?2:Math.min(2,Math.floor(state.progress*3));
      if(phase&&phaseLabels[index])phase.textContent=phaseLabels[index];
      host.dataset.morph=morph.toFixed(3);
    }
  };
}
