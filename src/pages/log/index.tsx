import { ComponentClass } from 'react'
import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { connect } from '@tarojs/redux'
import { Log, actions } from "../../models/log";
import { AtList, AtListItem, AtFab } from 'taro-ui';

type PageOwnProps = {
  dispatch?: Function,
}
type IProps = Log & PageOwnProps
type PageState = {}

@connect(({ logs }) => ({
  ...logs
}))
class Index extends Component<IProps, PageState> {

  config: Config = {
    navigationBarTitleText: '实时日志'
  }

  componentWillUnmount() { }

  componentDidShow() { }

  componentDidHide() { }

  onButtonClick = () => {
    const { dispatch } = this.props;
    dispatch!(actions.clear());
  }

  render() {
    const { logs } = this.props;
    return (
      <View>
        <AtList>
          {
            logs!.map(log => {
              return <AtListItem title={log.title} note={log.value} />;
            })
          }
        </AtList>

        <View style={{ position: "fixed", bottom: "16px", right: "16px" }}>
          <AtFab onClick={this.onButtonClick}>
            <Text className='at-fab__icon at-icon at-icon-close'></Text>
          </AtFab>
        </View>
      </View>
    )
  }
}

export default Index as ComponentClass<PageOwnProps, PageState>
