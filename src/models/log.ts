import { DvaModelBuilder, actionCreatorFactory } from 'dva-model-creator';

interface LogProps {
    title: string
    value?: string
}

export interface Log {
    logs?: LogProps[];//蓝牙是否打开
}

const actionCreator = actionCreatorFactory("logs");
const updateState = actionCreator<Log>('updateState');
const addLog = actionCreator<{ log: LogProps }>('addLog');
const clear = actionCreator('clear');

const model = new DvaModelBuilder<Log>({ logs: [] }, "logs")

    .case(updateState, (state, payload) => {
        return { ...state, ...payload };
    })

    .takeEvery(addLog, function* (payload, { put, select }) {
        const log: Log = yield select((state: any) => state.logs);
        let logs = [...log.logs!, payload.log];
        yield put(updateState({ logs: logs }));
    })

    .takeEvery(clear, function* (_payload, { put }) {
        yield put(updateState({ logs: [] }));
    })

    .build();

export default model;
export const actions = {
    updateState: updateState,
    addLog: addLog,
    clear: clear
}