import React, { forwardRef, useImperativeHandle } from 'react';
import Taro, { eventCenter } from '@tarojs/taro';
import { View } from '@tarojs/components';
import { inject, observer } from 'mobx-react';
import withAdInfo from '../../lib/ad-info';
import { Button, Cell } from "@taroify/core"
import './index.scss';

const Index = inject('counterStore')(
  observer(forwardRef((props, ref) => {
    console.log('*👏👏👏***props****', props);
    const { counterStore } = props;
    // 暴露方法给父组件
    useImperativeHandle(ref, () => ({
      afterAdFunc: afterAdFunc,
      beforeAdFunc: beforeAdFunc,
    }), []);

    const mockAsyncFunction = () => {
      setTimeout(() => {
        // do something
        // 通知上层组件异步成功
        eventCenter.trigger('wrappedCompSuccess');
      }, 1000)
    }
    const afterAdFunc = () => {
      Taro.showToast({
        title: '已触发广告后置操作',
        icon: 'none',
      });
    }
    const beforeAdFunc = () => {
      Taro.showToast({
        title: '已触发广告前置操作',
        icon: 'none',
      });
    }

    return (
      <View className="index">
        <Button color="primary" onClick={() => beforeAdFunc()}>点击</Button>
        <Button color="danger">危险按钮</Button>
        <Cell title="单元格" brief="描述信息">内容</Cell>
      </View>
    );
  }))
);
export default withAdInfo(Index,
  {
    adUnitId: '',
    locakKey: 'IndexAd',
    interval: 2, // 每次广告使用2次
    asyncAction: false // 是否异步执行
  }
);