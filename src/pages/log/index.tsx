import { ComponentClass } from 'react'
import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { connect } from '@tarojs/redux'

type PageOwnProps = {}

type PageState = {}

@connect(({ counter }) => ({
  ...counter
}))
class Index extends Component {

  config: Config = {
    navigationBarTitleText: '首页'
  }

  componentWillReceiveProps(nextProps) {
    console.log(this.props, nextProps)
  }

  componentWillUnmount() { }

  componentDidShow() { }

  componentDidHide() { }

  render() {
    return (
      <View className='index'>
        <View><Text>Hello, World</Text></View>
      </View>
    )
  }
}

export default Index as ComponentClass<PageOwnProps, PageState>
