import { DvaModelBuilder, actionCreatorFactory, SubscriptionAPI } from 'dva-model-creator';
import Taro, {
    startBluetoothDevicesDiscovery, getBLEDeviceServices,
    getBLEDeviceCharacteristics, createBLEConnection, onBluetoothDeviceFound, notifyBLECharacteristicValueChange
} from '@tarojs/taro';
import IServiceProps, { NotifyProps } from "../types";
import { ab2hex, hexCharCodeToStr } from "../utils/common";
export interface Global {
    isAdapterOpen?: boolean;//蓝牙是否打开
    isScaning?: boolean;//是否正在扫描

    devices?: onBluetoothDeviceFound.ParamParamPropDevices;//搜索到的蓝牙列表

    connectedDeviceId?: string;//当前连接蓝牙Id
    connectedServices?: IServiceProps[]//当前连接的服务列表
    notifys?: NotifyProps[];//当前监听的服务和特征
}

const actionCreator = actionCreatorFactory("global");
const updateState = actionCreator<Global>('updateState');

const openBleAdapter = actionCreator('openBleAdapter');
const startScan = actionCreator('startScan');
const stopScan = actionCreator('stopScan');
const connect = actionCreator<{ deviceId: string }>('connect');
const closeConnect = actionCreator('closeConnect');
const notifyValue = actionCreator<{ deviceId: string, serviceId: string, characteristicId: string }>('notifyValue');
const stopNotifyValue = actionCreator<{ deviceId: string, serviceId: string, characteristicId: string }>('stopNotifyValue');
const sendData = actionCreator<{ deviceId: string, serviceId: string, characteristicId: string, str: string }>('sendData');

const delay = (timeout: number) => new Promise(resolve => setTimeout(resolve, timeout));

const model = new DvaModelBuilder<Global>({
    isAdapterOpen: false, isScaning: false, devices: []
}, "global")

    .case(updateState, (state, payload) => {
        return { ...state, ...payload };
    })

    .takeEvery(openBleAdapter, function* (_payload, { }) {
        if (Taro.openBluetoothAdapter) {

            const data = yield Taro.openBluetoothAdapter();
            console.log(data);

            const discovery: startBluetoothDevicesDiscovery.Promised = yield Taro.startBluetoothDevicesDiscovery({ services: [], allowDuplicatesKey: false, });
            console.log("devices", discovery);

            Taro.navigateTo({ url: '/pages/scan/index' });
        }
    })

    .takeEvery(startScan, function* (_payload, { put, call }) {
        Taro.showNavigationBarLoading();

        const discoveryPromised: startBluetoothDevicesDiscovery.Promised = yield Taro.startBluetoothDevicesDiscovery({ services: [], allowDuplicatesKey: false, });

        if (discoveryPromised.errMsg === "startBluetoothDevicesDiscovery:ok") {
            yield put(updateState({ isScaning: true, devices: [] }));

            yield call(delay, 5000);

            yield put(stopScan());
        }
    })

    .takeEvery(stopScan, function* (_payload, { put }) {
        const discoveryPromised: startBluetoothDevicesDiscovery.Promised = yield Taro.stopBluetoothDevicesDiscovery();

        if (discoveryPromised.errMsg == "stopBluetoothDevicesDiscovery:ok") {
            yield put(updateState({ isScaning: false }));

            Taro.hideNavigationBarLoading();
        }
    })

    .takeEvery(connect, function* (payload, { put }) {
        const createConnectionPromised: createBLEConnection.Promised = yield Taro.createBLEConnection({ deviceId: payload.deviceId, });
        if (createConnectionPromised.errMsg === "createBLEConnection:ok") {
            const services: IServiceProps[] = [];
            const bleServicePromised: getBLEDeviceServices.Promised = yield Taro.getBLEDeviceServices({ deviceId: payload.deviceId });

            for (let index = 0; index < bleServicePromised.services.length; index++) {
                const service = bleServicePromised.services[index];
                const characteristicsPromised: getBLEDeviceCharacteristics.Promised = yield Taro.getBLEDeviceCharacteristics({ deviceId: payload.deviceId, serviceId: service.uuid });

                const serviceProps: IServiceProps = { uuid: service.uuid, isPrimary: service.isPrimary, characteristics: characteristicsPromised.characteristics };

                services.push(serviceProps);
            }

            yield put(updateState({ connectedDeviceId: payload.deviceId, connectedServices: services }));

            Taro.navigateTo({ url: '/pages/index/index' });
        }
    })

    .takeEvery(closeConnect, function* (_payload, { put, select }) {
        const global: Global = yield select((state: any) => state.global);
        const closePromised: createBLEConnection.Promised = yield Taro.closeBLEConnection({ deviceId: global.connectedDeviceId! });
        if (closePromised.errMsg == "closeBLEConnection:ok") {
            yield put(updateState({ connectedDeviceId: undefined, connectedServices: [] }));
        }
    })

    .takeEvery(notifyValue, function* (payload, { put, select }) {
        const global: Global = yield select((state: any) => state.global);
        const notifyChange: notifyBLECharacteristicValueChange.Promised = yield Taro.notifyBLECharacteristicValueChange({
            state: true,
            deviceId: payload.deviceId,
            serviceId: payload.serviceId,
            characteristicId: payload.characteristicId
        });
        if (notifyChange.errMsg === "notifyBLECharacteristicValueChange:ok") {
            const notifys = [...global.notifys!];
            notifys.push({ serviceId: payload.serviceId, characteristicId: payload.characteristicId });
            yield put(updateState({ notifys: notifys }));
        }
    })

    .takeEvery(stopNotifyValue, function* (payload, { put, select }) {
        const global: Global = yield select((state: any) => state.global);
        const stopNotifyValue: notifyBLECharacteristicValueChange.Promised = yield Taro.notifyBLECharacteristicValueChange({
            state: false,
            deviceId: payload.deviceId,
            serviceId: payload.serviceId,
            characteristicId: payload.characteristicId
        });
        if (stopNotifyValue.errMsg === "notifyBLECharacteristicValueChange:ok") {
            let notifys = [...global.notifys!];
            notifys = notifys.filter(a => a.serviceId != payload.serviceId && a.characteristicId == payload.characteristicId);
            yield put(updateState({ notifys: notifys }));
        }
    })

    .takeEvery(sendData, function* (payload, { }) {
        let str = payload.str;
        let dataBuffer = new ArrayBuffer(str.length)
        let dataView = new DataView(dataBuffer)
        for (var i = 0; i < str.length; i++) {
            dataView.setUint8(i, str.charAt(i).charCodeAt(0))
        }
        let dataHex = ab2hex(dataBuffer);
        let writeDatas = hexCharCodeToStr(dataHex);

        yield Taro.writeBLECharacteristicValue({ deviceId: payload.deviceId, serviceId: payload.serviceId, characteristicId: payload.characteristicId, value: dataBuffer });
    })

    .subscript((api: SubscriptionAPI, _done: Function) => {

        Taro.onBluetoothAdapterStateChange((_res) => {

        });

        Taro.onBLEConnectionStateChange((_res) => {
            //重新连接
        });

        Taro.onBluetoothDeviceFound((res) => {
            api.dispatch(updateState({ devices: res.devices }));
        });

        Taro.onBLECharacteristicValueChange((_res) => {

        });
    })

    .build();

export default model;
export const actions = {
    openBleAdapter: openBleAdapter,
    startScan: startScan,
    stopScan: stopScan,

    connect: connect,
    closeConnect: closeConnect,
    notifyValue: notifyValue,
    sendData: sendData,
}