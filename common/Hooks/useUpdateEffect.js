// 用于记录当前渲染是否是首次渲染
function useFirstMountState() {
  const isFirst = useRef(true);

  if (isFirst.current) {
    isFirst.current = false;

    return true;
  }

  return isFirst.current;
}

function useUpdateEffect(effect, deps) {
  const isFirstMount = useFirstMountState(); // 是否首次渲染

  useEffect(() => {
    if (!isFirstMount) {
      // 如果不是首次，则执行 effect 函数
      return effect();
    }
  }, deps);
}
