import { DvaModelBuilder, actionCreatorFactory } from 'dva-model-creator';
import Taro, { getBluetoothAdapterState, startBluetoothDevicesDiscovery, getBLEDeviceServices, getBLEDeviceCharacteristics, createBLEConnection } from '@tarojs/taro';

const actionCreator = actionCreatorFactory("global");
const updateState = actionCreator<any>('updateState');

const openBleAdapter = actionCreator('openBleAdapter');
const connect = actionCreator<{ deviceId: string }>('connect');
const closeConnect = actionCreator('closeConnect');
const notifyValue = actionCreator<{ deviceId: string, serviceId: string, characteristicId: string }>('notifyValue');
const stopNotifyValue = actionCreator<{ deviceId: string, serviceId: string, characteristicId: string }>('stopNotifyValue');
const sendData = actionCreator<{ deviceId: string, serviceId: string, characteristicId: string }>('sendData');

const delay = timeout => new Promise(resolve => setTimeout(resolve, timeout));

export interface Global {
    isAdapterOpen: boolean;//蓝牙是否打开
    devices?: any[];//搜索到的蓝牙列表

    connectedDeviceId?: string;//当前连接蓝牙Id
    connectedServices?: any[]//当前连接的服务列表
    notifys?: any[];//当前监听的服务和特征
}

const model = new DvaModelBuilder<Global>({ isAdapterOpen: false }, "global")

    .case(updateState, (state, payload) => {
        return { ...state, ...payload };
    })

    .takeEvery(openBleAdapter, function* (_payload, { put }) {
        if (Taro.openBluetoothAdapter) {

            const data = yield Taro.openBluetoothAdapter();
            console.log(data);

            const state: getBluetoothAdapterState.Promised = yield Taro.getBluetoothAdapterState();
            console.log("state", state);

            const discovery: startBluetoothDevicesDiscovery.Promised = yield Taro.startBluetoothDevicesDiscovery({ services: [], allowDuplicatesKey: false, });
            console.log("devices", discovery);

        }
    })

    .takeEvery(connect, function* (payload, { put }) {
        const data = yield Taro.createBLEConnection({ deviceId: payload.deviceId, });
        if (true) {
            const bleServicePromised: getBLEDeviceServices.Promised = yield Taro.getBLEDeviceServices({ deviceId: payload.deviceId });

            for (let index = 0; index < bleServicePromised.services.length; index++) {
                const service = bleServicePromised.services[index];

                const characteristicsPromised: getBLEDeviceCharacteristics.Promised = yield Taro.getBLEDeviceCharacteristics({ deviceId: payload.deviceId, serviceId: service.uuid });

                for (var i = 0; i < characteristicsPromised.characteristics.length; i++) {
                    const characteristics = characteristicsPromised[i];
                    if ((characteristics.properties.notify || characteristics.properties.indicate) &&
                        (characteristics.properties.read && characteristics.properties.write)) {
                    }
                }

            }



            const stopData = yield Taro.stopBluetoothDevicesDiscovery({})
        }
    })

    .takeEvery(closeConnect, function* (_payload, { put, select }) {
        const global: Global = yield select((state: any) => state.global);
        const closePromised: createBLEConnection.Promised = yield Taro.closeBLEConnection({ deviceId: global.connectedDeviceId! });
        if (closePromised.errMsg == "ok") {
            put(updateState({ connectedDeviceId: undefined }));
        }
    })

    .takeEvery(notifyValue, function* (payload, { put }) {
        const notifyChange = yield Taro.notifyBLECharacteristicValueChange({ state: true, deviceId: payload.deviceId, serviceId: payload.serviceId, characteristicId: payload.characteristicId });
    })

    .takeEvery(stopNotifyValue, function* (payload, { put }) {
        const stopNotifyValue = yield Taro.notifyBLECharacteristicValueChange({ state: false, deviceId: payload.deviceId, serviceId: payload.serviceId, characteristicId: payload.characteristicId });
    })

    .takeEvery(sendData, function* (payload, { put }) {
        // let that = this;
        // let dataBuffer = new ArrayBuffer(str.length)
        // let dataView = new DataView(dataBuffer)
        // for (var i = 0; i < str.length; i++) {
        //     dataView.setUint8(i, str.charAt(i).charCodeAt())
        // }
        // let dataHex = that.ab2hex(dataBuffer);
        // writeDatas = that.hexCharCodeToStr(dataHex);

        yield Taro.writeBLECharacteristicValue({ deviceId: payload.deviceId, serviceId: payload.serviceId, characteristicId: payload.characteristicId, value: dataBuffer });
    })

    .subscript(() => {

        Taro.onBluetoothAdapterStateChange((res) => {

        });

        Taro.onBLEConnectionStateChange((res) => {
            //重新连接
        });

        Taro.onBluetoothDeviceFound((res) => {
            //parms.devices
            // if (res.devices.length > 0) {
            //     if (JSON.stringify(res.devices).indexOf(that.deviceName) !== -1) {
            //         for (let i = 0; i < res.devices.length; i++) {
            //             if (that.deviceName === res.devices[i].name) {
            //                 /* 根据指定的蓝牙设备名称匹配到deviceId */
            //                 that.deviceId = that.devices[i].deviceId;
            //                 setTimeout(() => {
            //                     that.connectTO();
            //                 }, 2000);
            //             };
            //         };
            //     } else {
            //     }
            // } else {
            // }
        });

        Taro.onBLECharacteristicValueChange((res) => {

        });
    })

    .build();

export default model;
export const actions = {
    connect: connect,
    closeConnect: closeConnect,
    notifyValue: notifyValue,
    sendData: sendData,
    openBleAdapter: openBleAdapter
}