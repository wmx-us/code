/**
 * 函数参数
 * @param  networkRequest   网络请求
 * @param  addParams        添加参数
 * 返回参数
 * @returnParams
 * @param  parame           请求参数
 * @param  setParame        设置参数
 * @param  data             请求成功数据
 * @param  trigger          重新请求的开关
 * @param  loading          请求状态
 */
import { useEffect, useState } from "react";
const Index = <T>(
  networkRequest: (params: Record<string, any>) => Promise<Res<T>>,
  addParams?: Record<string, any>
) => {
  const [data, setData] = useState<ResData<T>>();
  const [params, setParams] = useState<SrchData>({ page: 1, page_size: 10 }); // 分页参数
  const [trigger, setTrigger] = useState<boolean>(false); //
  const [loading, setLoading] = useState<boolean>(false); // loading 参数
  useEffect(() => {
    sendRequest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, trigger]);

  async function sendRequest() {
    try {
      setLoading(true);
      const res: Res<T> = await networkRequest({ ...params, ...addParams });
      if (res?.code === 200) {
        setData(res?.data);
      } else {
        //常见错误：例如约定的成功返回值code不为0
        console.error(res);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  return [params, setParams, data, trigger, setTrigger, loading] as [
    Record<string, any>,
    React.Dispatch<React.SetStateAction<Record<string, any>>>,
    ResData<T>,
    boolean,
    React.Dispatch<React.SetStateAction<boolean>>,
    boolean
  ];
};
export default Index;
