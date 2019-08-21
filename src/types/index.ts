import { getBLEDeviceCharacteristics } from "@tarojs/taro";

export default interface IServiceProps {
    /**
      * 蓝牙设备服务的 uuid
      */
    uuid: string
    /**
     * 该服务是否为主服务
     */
    isPrimary: boolean

    characteristics: getBLEDeviceCharacteristics.PromisedPropCharacteristics
}

export interface NotifyProps {
    serviceId: string
    characteristicId: string
}