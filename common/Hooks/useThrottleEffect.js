// `useThrottleEffect` 与 `useDebounceEffect` 类似，这里不再陈述
// useEffect 增加节流的能力
function useThrottleEffect(effect, deps, throttleOptions) {
  const [flag, setFlag] = useState({});

  const { run, cancel } = useThrottleFn(() => {
    setFlag({});
  }, options);

  useEffect(() => {
    return run();
  }, deps);

  useUnmount(cancel);

  useUpdateEffect(effect, [flag]);
}
