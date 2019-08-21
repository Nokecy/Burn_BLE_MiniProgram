import { ComponentClass } from 'react'
import Taro, { Component, Config } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { AtToast } from 'taro-ui'
import { connect } from '@tarojs/redux'
import { Global, actions } from "../../models/global";

type PageOwnProps = {
  dispatch?: Function,
  openBleAdapterLoading?: boolean
}

type PageState = {}

type IProps = Global & PageOwnProps

@connect(({ global, loading }) => ({
  ...global,
  openBleAdapterLoading: loading.effects["global/openBleAdapter"]
}))
class Index extends Component<IProps, PageState> {
  config: Config = {
    navigationBarTitleText: '加载中'
  }

  componentDidMount() {
    this.props.dispatch!(actions.openBleAdapter());
  }

  componentWillReceiveProps(_nextProps) { }

  componentWillUnmount() { }

  componentDidShow() { }

  componentDidHide() { }

  render() {
    const { openBleAdapterLoading } = this.props;
    return (
      <View style={{ height: "100%", width: "100%" }}>
        <AtToast isOpened={openBleAdapterLoading ? true : false} duration={0} text="加载中" status={"loading"}></AtToast>
      </View>
    )
  }
}

export default Index as ComponentClass<any, any>
