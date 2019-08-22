import '@tarojs/async-await'
import Taro, { Component, Config } from '@tarojs/taro'
import { Provider } from '@tarojs/redux'
import "./config/taroConfig"
import Index from './pages/index'

import dva from './utils/dva'
import models from './models'
import 'taro-ui/dist/style/index.scss'

import './app.less'
// 如果需要在 h5 环境中开启 React Devtools
// 取消以下注释：
// if (process.env.NODE_ENV !== 'production' && process.env.TARO_ENV === 'h5')  {
//   require('nerv-devtools')
// }

const dvaApp = dva.createApp({
  namespacePrefixWarning: false,
  initialState: {},
  models: models,
});

const store = dvaApp.getStore();

class App extends Component {

  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  config: Config = {
    pages: [
      'pages/loading/index',//加载页
      'pages/scan/index',
      'pages/log/index',
      'pages/adapter/index',
      'pages/index/index',
    ],
    tabBar: {
      color: '#666',
      selectedColor: '#000',
      backgroundColor: '#fff',
      list: [
        {
          pagePath: 'pages/index/index',
          iconPath: 'assets/icons/home.png',
          selectedIconPath: 'assets/icons/home-active.png',
          text: '首页'
        },
        {
          pagePath: 'pages/log/index',
          iconPath: 'assets/icons/report.png',
          selectedIconPath: 'assets/icons/report-active.png',
          text: '实时日志'
        }
      ]
    },
    window: {
      backgroundTextStyle: 'light',
      navigationBarBackgroundColor: '#fff',
      navigationBarTitleText: 'WeChat',
      navigationBarTextStyle: 'black'
    }
  }

  componentDidMount() { }

  componentDidShow() { }

  componentDidHide() { }

  componentDidCatchError() { }

  // 在 App 类中的 render() 函数没有实际作用
  // 请勿修改此函数
  render() {
    return (
      <Provider store={store}>
        <Index />
      </Provider>
    )
  }
}

Taro.render(<App />, document.getElementById('app'))
