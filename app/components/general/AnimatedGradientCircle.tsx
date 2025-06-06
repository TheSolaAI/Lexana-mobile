import { FC, useMemo, useEffect } from 'react';
import { View, ViewStyle } from 'react-native';
import {
  Canvas,
  Fill,
  Skia,
  Shader,
  useClock,
  vec,
} from '@shopify/react-native-skia';
import { useWindowDimensions } from 'react-native';
import { useAppTheme } from '@/utils/useAppTheme';
import {
  useDerivedValue,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';

/**
 * Type of speaker, which influences the gradient colors and animation
 */
export type SpeakerType = 'none' | 'user' | 'assistant';

/**
 * Props for the AnimatedGradientCircle component
 */
interface AnimatedGradientCircleProps {
  /**
   * Size of the circle as a fraction of the screen width (0-1)
   * @default 0.5
   */
  size?: number;

  /**
   * Who is currently speaking, affecting colors and animation
   * @default 'none'
   */
  speaker: SpeakerType;

  /**
   * Custom style for the container
   */
  style?: ViewStyle;

  /**
   * Intensity of the animation (0-1)
   * @default 1
   */
  intensity?: number;
}

const shaderSource = `
  uniform float time;
  uniform vec2 resolution;
  uniform float base_intensity;
  uniform float anim_intensity;
  uniform vec4 color1;
  uniform vec4 color2;
  uniform vec4 color3;
  uniform float radius_factor;

  // 2D Simplex Noise by Stefan Gustavson
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  vec4 main(vec2 pos) {
    vec2 uv = pos / resolution;
    float aspectRatio = resolution.x / resolution.y;
    uv.x *= aspectRatio;

    float effective_intensity = base_intensity + anim_intensity;

    float t = time * 0.08 * (1.0 + effective_intensity * 0.5);
    
    float zoom = 1.8 + effective_intensity * 1.0;
    float noise1 = snoise(vec3(uv * zoom, t));
    float noise2 = snoise(vec3(uv * zoom * 1.2, t * 1.1));
    
    float combinedNoise = (noise1 + noise2) * 0.5;
    combinedNoise = (combinedNoise + 1.0) * 0.5;

    vec4 c1 = mix(color1, color2, smoothstep(0.3, 0.6, combinedNoise));
    vec4 finalColor = mix(c1, color3, smoothstep(0.4, 0.7, combinedNoise));
    
    float dist = distance(pos, resolution * 0.5);
    float radius = (resolution.x * radius_factor) / 2.0;
    
    float edge_blur = 30.0 + 20.0 * effective_intensity;
    float soft_edge = 1.0 - smoothstep(radius - edge_blur, radius, dist);

    return finalColor * soft_edge;
  }
`;

const effect = Skia.RuntimeEffect.Make(shaderSource);

/**
 * A beautiful animated gradient circle that responds to speaking state
 */
export const AnimatedGradientCircle: FC<AnimatedGradientCircleProps> = ({
  size = 0.5,
  speaker = 'none',
  style,
  intensity = 1,
}) => {
  const { width, height } = useWindowDimensions();
  const { theme } = useAppTheme();
  const clock = useClock();

  const canvasSize = Math.min(width, height);

  const colorConfigs = useMemo(
    () => ({
      none: {
        colors: [
          theme.colors.primary + '90',
          theme.colors.textDim + '60',
          theme.colors.background + 'A0',
        ],
        intensity: 0.1,
      },
      user: {
        colors: [
          theme.colors.primary,
          theme.colors.textDim,
          theme.colors.surface,
        ],
        intensity: 0,
      },
      assistant: {
        colors: [
          theme.colors.primary + '50',
          theme.colors.background + '30',
          theme.colors.primaryDark,
        ],
        intensity: 0,
      },
    }),
    [theme]
  );

  const initialConfig = colorConfigs[speaker];
  const baseIntensity = useSharedValue(initialConfig.intensity);
  const color1 = useSharedValue(Array.from(Skia.Color(initialConfig.colors[0])));
  const color2 = useSharedValue(Array.from(Skia.Color(initialConfig.colors[1])));
  const color3 = useSharedValue(Array.from(Skia.Color(initialConfig.colors[2])));

  useEffect(() => {
    const newConfig = colorConfigs[speaker];
    const animConfig = { duration: 1200, easing: Easing.out(Easing.quad) };

    baseIntensity.value = withTiming(newConfig.intensity, animConfig);
    color1.value = withTiming(
      Array.from(Skia.Color(newConfig.colors[0])),
      animConfig
    );
    color2.value = withTiming(
      Array.from(Skia.Color(newConfig.colors[1])),
      animConfig
    );
    color3.value = withTiming(
      Array.from(Skia.Color(newConfig.colors[2])),
      animConfig
    );
  }, [speaker, colorConfigs]);

  const uniforms = useDerivedValue(
    () => ({
      time: clock.value / 1000, // time in seconds
      resolution: vec(canvasSize, canvasSize),
      base_intensity: baseIntensity.value,
      anim_intensity: intensity,
      color1: color1.value,
      color2: color2.value,
      color3: color3.value,
      radius_factor: size,
    }),
    [clock, canvasSize, size, intensity]
  );

  if (!effect) {
    return null; // Shader is compiling
  }

  return (
    <View style={[{ alignItems: 'center', justifyContent: 'center' }, style]}>
      <Canvas style={{ height: canvasSize, width: canvasSize }}>
        <Fill>
          <Shader source={effect} uniforms={uniforms} />
        </Fill>
      </Canvas>
    </View>
  );
};
