import { ComponentClass } from 'react'
import Taro, { Component, Config } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { connect } from '@tarojs/redux'
import { Global, actions } from "../../models/global";
import { AtAccordion, AtIcon } from 'taro-ui';
import "./index.less";

type PageOwnProps = {
  dispatch?: Function,
}
type IProps = Global & PageOwnProps
type PageState = {}

@connect(({ global, loading }) => ({
  ...global,
  openBleAdapterLoading: loading.effects["global/openBleAdapter"]
}))
class Index extends Component<IProps, PageState> {

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
    const { connectedServices } = this.props
    return (
      <View>
        {
          connectedServices!.map(service => {
            return <AtAccordion title={service.uuid} open={true}>
              {
                service.characteristics!.map(characteristic => {
                  return <View>
                    <View className='at-row'>
                      <View className='at-col at-col-9'>
                        <View className="at-row at-row--wrap">
                          <View className='at-col at-col-12'>{characteristic.uuid}</View>
                          <View className='at-col at-col-12'>{characteristic.properties.read}</View>
                        </View>
                      </View>
                      <View className='at-col at-col-3'>
                        <View className='at-row at-row__align--center' style='height:100%'>
                          <AtIcon value='download' size='30' color='#F00'></AtIcon>
                          <AtIcon value='upload' size='30' color='#F00'></AtIcon>
                          <AtIcon value='download' size='30' color='#F00'></AtIcon>
                        </View>
                      </View>
                    </View>
                    <View className='recheck-line'></View>
                  </View>
                })
              }
            </AtAccordion>
          })
        }
      </View>
    )
  }
}

export default Index as ComponentClass<PageOwnProps, PageState>
