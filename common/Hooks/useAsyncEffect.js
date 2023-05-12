// useEffect 本身不支持async 函数，所以不能这样写
useEffect(async () => {
  await getData();
}, []);

// effect 函数应该返回一个销毁函数，如果useeffect 第一个参数传入async函数，返回值则变为Promise
// 导致react在调用销毁函数时候报错
/**
 * 简单的封装
 * @param {fn} effect
 * @param {Array} deps
 */
function useAsyncEffect(effect, deps) {
  useEffect(() => {
    const e = effect();
    async function execute() {
      await e;
    }
    execute();
  }, deps);
}
/**
 *
 * @param {fn} effect
 * @param {Array} deps
 */
function useAsyncEffect(effect, deps) {
  // 判断是否是生成器
  function isGenerator(val) {
    return typeof val[Symbol.asyncIterator] === "function";
  }

  useEffect(() => {
    const e = effect();
    let cancelled = false;

    async function execute() {
      // 增加生成器判断分支
      if (isGenerator(e)) {
        // 无限迭代，直到拿到生成器最终结果
        while (true) {
          const result = await e.next();
          // 迭代过程中，组件已经卸载或者迭代完成，则不再继续
          if (cancelled || result.done) {
            break;
          }
        }
      } else {
        await e;
      }
    }
    execute();

    return () => {
      cancelled = true;
    };
  }, deps);
}
