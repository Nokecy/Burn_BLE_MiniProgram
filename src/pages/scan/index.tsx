import { ComponentClass } from 'react'
import Taro, { Component, Config } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { connect } from '@tarojs/redux'
import { Global, actions } from "../../models/global";
import { AtList, AtListItem, AtToast } from 'taro-ui';

type PageOwnProps = {
  dispatch?: Function,
  connectLoading: boolean
}
type IProps = Global & PageOwnProps
type PageState = {}

@connect(({ global, loading }) => ({
  ...global,
  connectLoading: loading.effects["global/connect"]
}))
class Scan extends Component<IProps, PageState> {

  config: Config = {
    navigationBarTitleText: '扫描',
    enablePullDownRefresh: true,
    onReachBottomDistance: 0
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch!(actions.startScan());
  }

  componentDidShow() { }

  componentDidHide() { }

  onPullDownRefresh() {
    const { dispatch } = this.props;

    dispatch!(actions.startScan());

    Taro.stopPullDownRefresh();
  }

  connectToDevice = (deviceId: string) => {
    const { dispatch } = this.props;
    dispatch!(actions.connect({ deviceId: deviceId }));
  }

  render() {
    const { devices, connectLoading } = this.props;
    return (
      <View>
        <AtList>
          {
            devices!.map((device) => {
              return <AtListItem title={device.name} note={device.deviceId} arrow={"right"} onClick={() => { this.connectToDevice(device.deviceId) }} />
            })
          }
        </AtList>

        <AtToast isOpened={connectLoading ? true : false} duration={0} text="连接中" status={"loading"}></AtToast>
      </View>
    )
  }
}

export default Scan as ComponentClass<PageOwnProps, PageState>
