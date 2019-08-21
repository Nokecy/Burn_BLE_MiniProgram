import { ComponentClass } from 'react'
import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { connect } from '@tarojs/redux'

import './index.less'

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

  openBluetoothAdapter() {
    if (Taro.openBluetoothAdapter) {
      Taro.openBluetoothAdapter({
        success: function (res) {
          /* 获取本机的蓝牙状态 */
          setTimeout(() => {
            getBluetoothAdapterState()
          }, 1000)
        },
        fail: function (err) {
          // 初始化失败
        }
      })
    } else {

    }
  }

  getBluetoothAdapterState() {
    Taro.getBluetoothAdapterState({
      success: function (res) {
        startBluetoothDevicesDiscovery()
      },
      fail(res) {
        console.log(res)
      }
    })
  }

  startBluetoothDevicesDiscovery() {
    var that = this;
    setTimeout(() => {
      Taro.startBluetoothDevicesDiscovery({
        success: function (res) {
          /* 获取蓝牙设备列表 */
          that.getBluetoothDevices()
        },
        fail(res) {
        }
      })
    }, 1000)
  }

  getBluetoothDevices() {
    var that = this;
    setTimeout(() => {
      Taro.getBluetoothDevices({
        services: [],
        allowDuplicatesKey: false,
        interval: 0,
        success: function (res) {
          if (res.devices.length > 0) {
            if (JSON.stringify(res.devices).indexOf(that.deviceName) !== -1) {
              for (let i = 0; i < res.devices.length; i++) {
                if (that.deviceName === res.devices[i].name) {
                  /* 根据指定的蓝牙设备名称匹配到deviceId */
                  that.deviceId = that.devices[i].deviceId;
                  setTimeout(() => {
                    that.connectTO();
                  }, 2000);
                };
              };
            } else {
            }
          } else {
          }
        },
        fail(res) {
          console.log(res, '获取蓝牙设备列表失败=====')
        }
      })
    }, 2000)
  }

  connectTO() {
    Taro.createBLEConnection({
      deviceId: deviceId,
      success: function (res) {
        that.connectedDeviceId = deviceId;
        /* 4.获取连接设备的service服务 */
        that.getBLEDeviceServices();
        wx.stopBluetoothDevicesDiscovery({
          success: function (res) {
            console.log(res, '停止搜索')
          },
          fail(res) {
          }
        })
      },
      fail: function (res) {
      }
    })
  }

  getBLEDeviceServices() {
    setTimeout(() => {
      wx.getBLEDeviceServices({
        deviceId: that.connectedDeviceId,
        success: function (res) {
          that.services = res.services
          /* 获取连接设备的所有特征值 */
          that.getBLEDeviceCharacteristics()
        },
        fail: (res) => {
        }
      })
    }, 2000)
  }

  getBLEDeviceCharacteristics() {
    setTimeout(() => {
      wx.getBLEDeviceCharacteristics({
        deviceId: connectedDeviceId,
        serviceId: services[2].uuid,
        success: function (res) {
          for (var i = 0; i < res.characteristics.length; i++) {
            if ((res.characteristics[i].properties.notify || res.characteristics[i].properties.indicate) &&
              (res.characteristics[i].properties.read && res.characteristics[i].properties.write)) {
              console.log(res.characteristics[i].uuid, '蓝牙特征值 ==========')
              /* 获取蓝牙特征值 */
              that.notifyCharacteristicsId = res.characteristics[i].uuid
              // 启用低功耗蓝牙设备特征值变化时的 notify 功能
              that.notifyBLECharacteristicValueChange()
            }
          }
        },
        fail: function (res) {
        }
      })
    }, 1000)
  }

  render() {
    return (
      <View className='index'>
        <View><Text>Hello, World</Text></View>
      </View>
    )
  }
}

export default Index as ComponentClass<PageOwnProps, PageState>
