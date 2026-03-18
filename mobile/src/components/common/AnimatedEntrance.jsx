import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

export default function AnimatedEntrance({
  children,
  delay = 0,
  duration = 420,
  translateY = 18,
  scaleFrom = 0.98,
  style,
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(translateY)).current;
  const scale = useRef(new Animated.Value(scaleFrom)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translate, {
        toValue: 0,
        duration,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, duration, opacity, scale, translate]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity,
          transform: [{ translateY: translate }, { scale }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
