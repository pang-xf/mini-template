import React, { forwardRef, useImperativeHandle } from 'react';
import Taro, { eventCenter } from '@tarojs/taro';
import { View } from '@tarojs/components';
import { inject, observer } from 'mobx-react';
import withAdInfo from '../../lib/ad-info';
import './index.scss';

const Index = inject('counterStore')(
  observer(forwardRef((props, ref) => {
    const { counterStore } = props;
    // 暴露方法给父组件
    useImperativeHandle(ref, () => ({
      afterAdFunc: mockAsyncFunction,
      beforeAdFunc: mockAsyncFunction,
    }), []);

    // 新增下载前校验
    const beforeVerify = type => {
      if (type === 'video') {
        props.showAdInfo()
        return;
      }
      switch (type) {
        case 'video-url':
          copyText(parseData.video_url);
          break;
        case 'img':
          handleDownloadImg();
          break;
        case 'img-url':
          copyText(parseData.cover_url);
          break;
        case 'title':
          copyText(parseData.title);
          break;
        default:
          break;
      }
    };

    const saveLocalVideo = (cb) => {
      if (!videoUrlRef.current) return
      requestSaveVideo(videoUrlRef.current, () => {
        setShowTour(true);
        videoUrlRef.current = null
        cb && cb()
      })
    }

    const download = () => {
      console.log('开始下载', isDownloading);
      if (isDownloading) return;
      setIsDownloading(true);

      const removeStatusCb = () => {
        Taro.hideLoading()
        setDownloadTask(null);
        setDownloadProgress(0);
        setIsDownloading(false);
      }

      downloadFile({
        url: `https://back-parse-2.pxfe.top/video/download?url=${parseData.video_url}`,
        isDownloading,
        setDownloadTask: (task) => {
          setDownloadTask(task)
        },
        setDownloadProgress: (progress) => {
          setDownloadProgress(progress)
        },
        successCb: (path) => {
          console.log('前台-下载成功', path)
          removeStatusCb()
          videoUrlRef.current = path
          // 通知上层组件下载成功
          eventCenter.trigger('downloadSuccess', path);
        },
        removeStatusCb
      })
    };
    const mockAsyncFunction = () => {
      setTimeout(() => {
        // do something
        // 通知上层组件异步成功
        eventCenter.trigger('wrappedCompSuccess');
      }, 1000)
    }
    const actionFunc = () => {
      console.log('action', counterStore.counter);
      Taro.showToast({
        title: '已触发广告后置操作',
        icon: 'none',
      });
    }

    return (
      <View className="index">
        <Button onClick={() => beforeAdFunc()}>点击</Button>
      </View>
    );
  }))
);
export default withAdInfo(Index,
  {
    adUnitId: '您的广告Id-测试的时候请到流量主后台生成真实的广告ID才可预览效果',
    locakKey: 'IndexAd',
    interval: 2, // 每次广告使用2次
    asyncAction: false // 是否异步执行
  }
);