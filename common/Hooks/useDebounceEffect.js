/**
 * 为useEffect增加防抖能力
 * deps变化，正常触发effect，同时防抖开始计时
 * deps变化频繁，进行防抖处理，因此flag记录延迟是否结束
 * 组件卸载后，取消防抖函数调用
 */

function useDebounceFn(fn, options) {
  // 保证debounce 中每次取到的fn 都是最新的
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const wait = options?.wait ?? 1000;

  const debounced = useMemo(
    () =>
      debounce(
        (...args) => {
          return fnRef.current(...args);
        },
        wait,
        options
      ),
    []
  );

  useUnmount(() => {
    debounced.cancel();
  });
  return {
    run: debounced,
    cancel: debounced.cancel,
    flush: debounced.flush,
  };
}

function useDebounceEffect(effect, deps, debounceOPtios) {
  const [flag, setFlag] = useState({}); // 记录延迟是否结束
  const { run, cancel } = useDebounceFn(() => {
    setFlag({});
  }, debounceOPtios);

  // 正常deps 变化，执行effect ,同时防抖开始计时
  usEffect(() => {
    return run();
  }, deps);

  useUnmount(cancel); // 组件卸载后，取消防抖函数调用

  useUpdateEffect(effect, [flag]); // 使用useUpdateEffect，只在flag 变化时执行effect
}
