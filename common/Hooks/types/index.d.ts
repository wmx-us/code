declare interface FormItemType {
  name: string;
  label?: string;
  required?: boolean;
  message?: string;
  placeholder?: string;
}

declare type IsBool = Record<string | number | symbol, boolean>;

declare type SrchData = Record<string | number | symbol, any>;

declare interface SearchFormProps<T> {
  onFinish: (val: T) => void;
  onReset?: () => void;
  [k: string]: any;
}

declare interface ModalProps {
  open: boolean;
  onConfirm: (...set: any) => void;
  onCancel: () => void;
  [k: string]: any;
}

//网络请求接口返回数据
declare type Res<T> = {
  code?: number;
  status?: number;
  message?: string;
  data: {
    data: T[];
    total: number;
    [k: string]: any;
  };
  [k: string]: any;
};

declare type ResData<T> = {
  data: T[];
  total?: number;
  [k: string]: any;
};

declare interface Resolve {
  code?: number;
  message?: string;
  [k: string]: any;
}

declare module "braft-utils";
declare module "file-saver";
declare module "*.xlsx";
declare module "*xlsx";
