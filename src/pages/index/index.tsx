import { ComponentClass } from 'react'
import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { connect } from '@tarojs/redux'
import { Global, actions } from "../../models/global";
import { AtAccordion, AtIcon, AtFab, AtToast, AtInput, AtButton } from 'taro-ui';
import "./index.less";

type PageOwnProps = {
  dispatch?: Function,
  connectLoading?: boolean
}
type IProps = Global & PageOwnProps
type PageState = {
  open?: string
  str?: string
}

@connect(({ global, loading }) => ({
  ...global,
  connectLoading: loading.effects["global/connect"],
}))
class Index extends Component<IProps, PageState> {

  config: Config = {
    navigationBarTitleText: '首页'
  }

  constructor() {
    super(...arguments)
    this.state = {
      open: undefined,
    }
  }

  componentWillReceiveProps(nextProps) {
    console.log(this.props, nextProps)
  }

  componentWillUnmount() { }

  componentDidShow() { }

  componentDidHide() { }

  getCharacteristicProperties = (characteristic: any) => {
    let text = "";
    if (characteristic.properties.broadcast) {
      text += "broadcast，";
    }
    if (characteristic.properties.read) {
      text += "read，";
    }
    if (characteristic.properties.write) {
      text += "write，";
    }
    if (characteristic.properties.notify) {
      text += "notify，";
    }
    if (characteristic.properties.indicate) {
      text += "indicate，";
    }
    if (characteristic.properties.authenticatedSignedWrites) {
      text += "authenticatedSignedWrites，";
    }
    if (characteristic.properties.extendedProperties) {
      text += "extendedProperties，";
    }
    if (characteristic.properties.notifyEncryptionRequired) {
      text += "notifyEncryptionRequired，";
    }
    if (characteristic.properties.indicateEncryptionRequired) {
      text += "indicateEncryptionRequired，";
    }
    return text;
  }

  isNotify = (serviceId: string, characteristicId: string) => {
    const { notifys } = this.props;
    return notifys && notifys!.some(a => a.serviceId == serviceId && a.characteristicId == characteristicId);
  }

  isWrite = (serviceId: string, characteristicId: string) => {
    const { writeCharacteristic } = this.props;
    return writeCharacteristic && writeCharacteristic!.serviceId == serviceId && writeCharacteristic!.characteristicId == characteristicId;
  }

  notifyCharacteristic = (serviceId: string, characteristicId: string) => {
    const { dispatch } = this.props;
    if (this.isNotify(serviceId, characteristicId)) {
      dispatch!(actions.stopNotifyValue({ serviceId: serviceId, characteristicId: characteristicId }));
    } else {
      dispatch!(actions.notifyValue({ serviceId: serviceId, characteristicId: characteristicId }));
    }
  }

  wirteCharacteristic = (serviceId: string, characteristicId: string) => {
    const { dispatch } = this.props;
    dispatch!(actions.updateState({ writeCharacteristic: { serviceId: serviceId, characteristicId: characteristicId } }));
  }

  readCharacteristic = (serviceId: string, characteristicId: string) => {
    const { dispatch } = this.props;
    dispatch!(actions.readData({ serviceId: serviceId, characteristicId: characteristicId }));
  }

  sendData = () => {
    const { dispatch } = this.props;
    dispatch!(actions.sendData({ str: this.state.str! }));
  }

  isShowSubmit = () => {
    const { writeCharacteristic } = this.props;
    return !writeCharacteristic;
  }

  render() {
    const { connectLoading, connectedServices } = this.props
    return (
      <View>
        {
          connectedServices!.map(service => {
            return <AtAccordion title={service.uuid} key={service.uuid} isAnimation={false}
              open={service.uuid == this.state.open}
              onClick={(value: any) => {
                if (value == true) {
                  this.setState({ open: service.uuid })
                } else {
                  this.setState({ open: undefined })
                }
              }}
              customStyle={{ marginLeft: "14px" }}>
              {
                service.characteristics!.map(characteristic => {
                  return <View style={{ marginLeft: "10px" }}>
                    <View><Text style={{ fontWeight: "bold" }}>Characteristics</Text></View>
                    <View className='at-row'>
                      <View className='at-col at-col-8'>
                        <View className="at-row at-row--wrap">
                          <View className='at-col at-col-12' >
                            <Text style={{ fontSize: "13px", color: "#BABABA" }}>uuid: {characteristic.uuid}</Text>
                          </View>
                          <View className='at-col at-col-12'>
                            <Text style={{ fontSize: "13px", color: "#BABABA" }}>属性: {this.getCharacteristicProperties(characteristic)}</Text>
                          </View>
                        </View>
                      </View>
                      <View className='at-col at-col-4'>
                        <View className='at-row at-row__justify--around at-row__align--end' style='height:100%'>
                          {
                            characteristic.properties.read ? <AtIcon value='download' size='20' color='#000'
                              onClick={() => { this.readCharacteristic(service.uuid, characteristic.uuid); }}></AtIcon> : null
                          }

                          {
                            characteristic.properties.write ? <AtIcon value='upload' size='20'
                              onClick={() => { this.wirteCharacteristic(service.uuid, characteristic.uuid) }}
                              color={this.isWrite(service.uuid, characteristic.uuid) ? '#F00' : '#000'}></AtIcon> : null
                          }

                          {
                            characteristic.properties.notify ? <AtIcon value='bell' size='20'
                              onClick={() => { this.notifyCharacteristic(service.uuid, characteristic.uuid) }}
                              color={this.isNotify(service.uuid, characteristic.uuid) ? '#F00' : '#000'}></AtIcon> : null
                          }

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

        <View style={{ position: "fixed", width: "100%", bottom: "16px" }}>
          <AtInput name={"input"} onChange={(value) => {
            this.setState({ str: value.toString() });
          }} placeholder={"输入要发送的数据"}></AtInput>
          <AtButton type={"primary"} disabled={this.isShowSubmit()} onClick={this.sendData}>提交</AtButton>
        </View>

        <AtToast isOpened={connectLoading ? true : false} duration={0} text="重新连接中..." status={"loading"}></AtToast>
      </View>
    )
  }
}

export default Index as ComponentClass<PageOwnProps, PageState>
