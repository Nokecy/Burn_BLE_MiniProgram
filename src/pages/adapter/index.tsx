import { ComponentClass } from 'react'
import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { AtButton } from 'taro-ui';

type PageOwnProps = {
  dispatch?: Function,
}
type IProps = PageOwnProps
type PageState = {}

class Index extends Component<IProps, PageState> {

  config: Config = {
    navigationBarTitleText: '实时日志'
  }

  componentWillUnmount() { }

  componentDidShow() { }

  componentDidHide() { }

  render() {
    return (
      <View>
        <Text>蓝牙适配器已关闭,请打开手机蓝牙</Text>
        <AtButton onClick={() => {
          Taro.navigateTo({ url: '/pages/scan/index' });
        }}>回到首页</AtButton>
      </View>
    )
  }
}

export default Index as ComponentClass<PageOwnProps, PageState>
