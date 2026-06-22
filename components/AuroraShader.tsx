"use client";
import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ScreenQuad } from "@react-three/drei";
import * as THREE from "three";

/* Flowing aurora — a single full-screen shader plane (one draw call). Used as a
   progressive-enhancement accent over the CSS aurora; disabled on low power. */
const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = position.xy * 0.5 + 0.5;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uRes;
  uniform vec3 cA; uniform vec3 cB; uniform vec3 cC;

  // hash + value-noise + fbm
  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
  float noise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    float a = hash(i), b = hash(i+vec2(1,0)), c = hash(i+vec2(0,1)), d = hash(i+vec2(1,1));
    vec2 u = f*f*(3.0-2.0*f);
    return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
  }
  float fbm(vec2 p){
    float v = 0.0, a = 0.5;
    for(int i=0;i<5;i++){ v += a*noise(p); p *= 2.0; a *= 0.5; }
    return v;
  }

  void main(){
    vec2 uv = vUv;
    float asp = uRes.x / max(uRes.y, 1.0);
    vec2 p = vec2(uv.x*asp, uv.y);
    float t = uTime * 0.05;

    // flowing field
    float n = fbm(p*2.2 + vec2(t, t*0.6));
    float m = fbm(p*1.3 - vec2(t*0.8, t*0.4) + n);

    // soft horizontal aurora bands, brighter near the top
    float band = smoothstep(0.15, 0.95, m + uv.y*0.5);
    float glow = pow(band, 1.6);

    vec3 col = mix(cA, cB, smoothstep(0.2, 0.8, n));
    col = mix(col, cC, smoothstep(0.4, 1.0, m));
    col *= glow;

    // vignette + fade to transparent so the page bg shows through low areas
    float fade = smoothstep(0.0, 0.55, uv.y) * 0.9 + 0.1;
    float alpha = clamp(glow * fade, 0.0, 1.0) * 0.85;
    gl_FragColor = vec4(col, alpha);
  }
`;

function Plane() {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
      cA: { value: new THREE.Color("#2b53d6") }, // cobalt
      cB: { value: new THREE.Color("#9d7bff") }, // violet
      cC: { value: new THREE.Color("#2dd4cf") }, // teal
    }),
    []
  );

  useFrame((state) => {
    if (mat.current) {
      mat.current.uniforms.uTime.value = state.clock.elapsedTime;
      mat.current.uniforms.uRes.value.set(state.size.width, state.size.height);
    }
  });

  return (
    <ScreenQuad>
      <shaderMaterial
        ref={mat}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </ScreenQuad>
  );
}

export default function AuroraShader() {
  return (
    <Canvas
      gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
      dpr={[1, 1.5]}
      style={{ width: "100%", height: "100%" }}
      aria-hidden="true"
    >
      <Plane />
    </Canvas>
  );
}
