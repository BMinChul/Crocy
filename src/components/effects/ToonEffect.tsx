import { EffectComposer, Outline } from '@react-three/postprocessing';

export const ToonEffect = () => {
  return (
    <EffectComposer autoClear={false}>
      <Outline
        blur
        edgeStrength={10}
        width={500}
        visibleEdgeColor={0xffffff} // White outline for "clean" look
        hiddenEdgeColor={0xffffff}
      />
    </EffectComposer>
  );
};
