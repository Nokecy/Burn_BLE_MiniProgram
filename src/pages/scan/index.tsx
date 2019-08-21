import { ComponentClass } from 'react'
import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { connect } from '@tarojs/redux'
import { Global, actions } from "../../models/global";
import { AtList, AtListItem, AtActivityIndicator } from 'taro-ui';

type PageOwnProps = {
  dispatch?: Function,
}
type IProps = Global & PageOwnProps
type PageState = {}

@connect(({ global, loading }) => ({
  ...global,
  openBleAdapterLoading: loading.effects["global/openBleAdapter"]
}))
class Scan extends Component<IProps, PageState> {

  config: Config = {
    navigationBarTitleText: '扫描',
    enablePullDownRefresh: true,
    onReachBottomDistance: 0
  }

  componentWillUnmount() { }

  componentDidShow() { }

  componentDidHide() { }

  onPullDownRefresh() {
    const { dispatch } = this.props;

    dispatch!(actions.startScan());

    Taro.stopPullDownRefresh();
  }

  render() {
    const { devices } = this.props;
    return (
      <View>
        <AtList>
          {
            devices!.map((device) => {
              return <AtListItem title={device.name} note={device.deviceId} arrow={"right"} />
            })
          }
        </AtList>
      </View>
    )
  }
}

export default Scan as ComponentClass<PageOwnProps, PageState>
