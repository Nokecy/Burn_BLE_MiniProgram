import { DvaModelBuilder, actionCreatorFactory, SubscriptionAPI } from 'dva-model-creator';
import Taro, {
    startBluetoothDevicesDiscovery, getBLEDeviceServices,
    getBLEDeviceCharacteristics, createBLEConnection, onBluetoothDeviceFound, notifyBLECharacteristicValueChange, readBLECharacteristicValue
} from '@tarojs/taro';
import IServiceProps, { NotifyProps } from "../types";
import { ab2hex, hexCharCodeToStr } from "../utils/common";
import { actions as logActions } from "./log";

export interface Global {
    isAdapterOpen?: boolean;//蓝牙是否打开
    isScaning?: boolean;//是否正在扫描

    devices?: onBluetoothDeviceFound.ParamParamPropDevices;//搜索到的蓝牙列表

    connectedDeviceId?: string;//当前连接蓝牙Id
    connectedServices?: IServiceProps[]//当前连接的服务列表
    notifys?: NotifyProps[];//当前监听的服务和特征
    writeCharacteristic?: NotifyProps//当前写入的服务和特征
}

const actionCreator = actionCreatorFactory("global");
const updateState = actionCreator<Global>('updateState');

const openBleAdapter = actionCreator('openBleAdapter');
const startScan = actionCreator('startScan');
const stopScan = actionCreator('stopScan');
const findDevices = actionCreator<{ devices: any[] }>('findDevices');
const connect = actionCreator<{ deviceId: string }>('connect');
const closeConnect = actionCreator('closeConnect');
const reConnect = actionCreator('reConnect');
const notifyValue = actionCreator<{ serviceId: string, characteristicId: string }>('notifyValue');
const stopNotifyValue = actionCreator<{ serviceId: string, characteristicId: string }>('stopNotifyValue');
const sendData = actionCreator<{ str: string }>('sendData');
const readData = actionCreator<{ serviceId: string, characteristicId: string }>('readData');

const delay = (timeout: number) => new Promise(resolve => setTimeout(resolve, timeout));

const model = new DvaModelBuilder<Global>({
    isAdapterOpen: false, isScaning: false, devices: [],connectedServices:[]
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

        yield put(logActions.addLog({ log: { title: "开始扫描" } }));

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

            yield put(logActions.addLog({ log: { title: "停止扫描" } }));
        }
    })

    .takeEvery(findDevices, function* (_payload, { put, select }) {
        const global: Global = yield select((state: any) => state.global);
        let devices = [...global.devices!, ..._payload.devices];
        yield put(updateState({ devices: devices }));
    })

    .takeEvery(connect, function* (payload, { put }) {

        yield put(logActions.addLog({ log: { title: "开始连接设备" } }));

        const createConnectionPromised: createBLEConnection.Promised = yield Taro.createBLEConnection({ deviceId: payload.deviceId, });
        if (createConnectionPromised.errMsg === "createBLEConnection:ok") {
            const services: IServiceProps[] = [];

            yield put(logActions.addLog({ log: { title: "连接成功,开始查找服务" } }));

            const bleServicePromised: getBLEDeviceServices.Promised = yield Taro.getBLEDeviceServices({ deviceId: payload.deviceId });

            for (let index = 0; index < bleServicePromised.services.length; index++) {
                const service = bleServicePromised.services[index];
                const characteristicsPromised: getBLEDeviceCharacteristics.Promised = yield Taro.getBLEDeviceCharacteristics({ deviceId: payload.deviceId, serviceId: service.uuid });

                const serviceProps: IServiceProps = { uuid: service.uuid, isPrimary: service.isPrimary, characteristics: characteristicsPromised.characteristics };

                services.push(serviceProps);
            }

            yield put(updateState({ connectedDeviceId: payload.deviceId, connectedServices: services }));

            yield put(logActions.addLog({ log: { title: "查找服务完成" } }));

            Taro.switchTab({ url: '/pages/index/index' });
        }
    })

    .takeEvery(reConnect, function* (_payload, { put, select }) {
        const global: Global = yield select((state: any) => state.global);
        yield put(logActions.addLog({ log: { title: "正在重新连接设备" } }));

        if (global.connectedDeviceId) {
            yield put(connect({ deviceId: global.connectedDeviceId! }))
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
            deviceId: global.connectedDeviceId!,
            serviceId: payload.serviceId,
            characteristicId: payload.characteristicId
        });
        if (notifyChange.errMsg === "notifyBLECharacteristicValueChange:ok") {

            yield put(logActions.addLog({ log: { title: "监听成功", value: `serviceId--${payload.serviceId} characteristicId--${payload.characteristicId}` } }));

            const notifys = global.notifys ? [...global.notifys!] : [];
            notifys.push({ serviceId: payload.serviceId, characteristicId: payload.characteristicId });
            yield put(updateState({ notifys: notifys }));
        }
    })

    .takeEvery(stopNotifyValue, function* (payload, { put, select }) {
        const global: Global = yield select((state: any) => state.global);
        const stopNotifyValue: notifyBLECharacteristicValueChange.Promised = yield Taro.notifyBLECharacteristicValueChange({
            state: false,
            deviceId: global.connectedDeviceId!,
            serviceId: payload.serviceId,
            characteristicId: payload.characteristicId
        });
        if (stopNotifyValue.errMsg === "notifyBLECharacteristicValueChange:ok") {

            yield put(logActions.addLog({ log: { title: "取消监听", value: `serviceId--${payload.serviceId} characteristicId--${payload.characteristicId}` } }));

            let notifys = global.notifys ? [...global.notifys!] : [];
            notifys = notifys.filter(a => a.serviceId != payload.serviceId && a.characteristicId == payload.characteristicId);
            yield put(updateState({ notifys: notifys }));
        }
    })

    .takeEvery(sendData, function* (payload, { put, select }) {
        const global: Global = yield select((state: any) => state.global);
        let str = payload.str;

        let typedArray = new Uint8Array(str!.match(/[\da-f]{2}/gi)!.map(function (h) {
            return parseInt(h, 16)
        }));
        let dataBuffer = typedArray.buffer;
        let dataHex = ab2hex(dataBuffer);

        console.log("16进制", dataHex);

        const writeCharacteristic = global.writeCharacteristic!;
        yield Taro.writeBLECharacteristicValue({ deviceId: global.connectedDeviceId!, serviceId: writeCharacteristic.serviceId, characteristicId: writeCharacteristic.characteristicId, value: dataBuffer });

        yield put(logActions.addLog({ log: { title: "发送数据", value: str } }));

    })

    .takeEvery(readData, function* (payload, { select }) {
        const global: Global = yield select((state: any) => state.global);
        const data: readBLECharacteristicValue.Promised = yield Taro.readBLECharacteristicValue({ deviceId: global.connectedDeviceId!, serviceId: payload.serviceId, characteristicId: payload.characteristicId });
    })

    .subscript((api: SubscriptionAPI, _done: Function) => {

        Taro.onBluetoothAdapterStateChange((_res) => {
            if (!_res.available) {
                api.dispatch(updateState({
                    devices: [],
                    connectedDeviceId: undefined,
                    connectedServices: [],
                    notifys: [],
                    writeCharacteristic: undefined
                }))
                Taro.navigateTo({ url: '/pages/adapter/index' });
            }
        });

        Taro.onBLEConnectionStateChange((_res) => {
            if (!_res.connected) {
                api.dispatch(reConnect());
            }
        });

        Taro.onBluetoothDeviceFound((res) => {
            api.dispatch(findDevices({ devices: res.devices }));
        });

        Taro.onBLECharacteristicValueChange((res) => {
            console.log(`characteristic ${res.characteristicId} has changed, now is ${res.value}`)
            console.log(ab2hex(res.value))

            api.dispatch(logActions.addLog({ log: { title: `读取数据`, value: ab2hex(res.value) } }));
        });
    })

    .build();

export default model;
export const actions = {
    updateState: updateState,
    openBleAdapter: openBleAdapter,
    startScan: startScan,
    stopScan: stopScan,

    connect: connect,
    closeConnect: closeConnect,
    notifyValue: notifyValue,
    stopNotifyValue: stopNotifyValue,
    sendData: sendData,
    readData: readData,
}