import React, { Component } from 'react';
import { View } from '@tarojs/components';
import Taro, { eventCenter } from '@tarojs/taro'
import { isBeforeYesterday } from '../../utils';

const INITIAL_OPTIONS = () => ({
    needNumberToShow: 0, // 限制使用几次后展示广告，与interval互斥
    interval: 0, // 限制每次广告后有效功能的次数，与needNumberToShow互斥
    locakKey: '', // 本地存储当前功能项key
    asyncAction: false, // 是否异步前置操作（可减少用户等待时间）
})
const withAdInfo = (WrappedComponent, options = INITIAL_OPTIONS()) => {
    class AdInfoComponent extends Component {
        constructor(props) {
            super(props)
            this.state = {
                videoAd: null,
                adLooked: false,
            }
            this.wrappedCompRef = React.createRef();
        }

        componentDidMount() {
            // 每天第一次打开清空限制
            this.judgeIsTimeOut();
            if (options.adUnitId) {
                this.loadAd();
            }
            eventCenter.on('wrappedCompSuccess', this.handleAdSuccess);
        }
        componentWillUnmount() {
            const { videoAd } = this.state;
            videoAd && videoAd.destroy();
            eventCenter.off('wrappedCompSuccess', this.handleAdSuccess);
        }
        handleAdSuccess = () => {
            const { videoAd, adLooked } = this.state;
            // 有广告判断是否看完
            if (videoAd && !adLooked) {
                return;
            }
            const afterAdFunc = this.wrappedCompRef.current?.afterAdFunc;
            afterAdFunc && afterAdFunc(this.setLocalInfo);
        }
        judgeIsTimeOut = () => {
            const localKey = options.locakKey || '';
            if (!localKey) return false;
            const detailAdInfo = Taro.getStorageSync(localKey) || {};
            // 判断当前时间是否是昨天或者昨天以前的
            if (detailAdInfo.time && isBeforeYesterday(detailAdInfo.time)) {
                Taro.removeStorageSync(localKey);
            }
        }
        setLocalInfo = () => {
            const localKey = options.locakKey || '';
            if (!localKey) return false;
            let detailAdInfo = Taro.getStorageSync(localKey) || {
                time: new Date().getTime(),
                type: 'detailAd',
                num: 0
            };
            detailAdInfo = {
                ...detailAdInfo,
                time: new Date().getTime(),
                num: (detailAdInfo.num || 0) + 1
            }
            if (detailAdInfo.num > options.needNumberToShow) {
                detailAdInfo.currentDayLooked = true;
            }
            Taro.setStorageSync(localKey, detailAdInfo);
        }
        loadAd = () => {
            const _this = this;
            const videoAd = Taro.createRewardedVideoAd({
                adUnitId: options.adUnitId,
            });
            videoAd.onLoad(() => {
                this.setState({ videoAd })
            });
            videoAd.onError(err => {
                this.setState({ adLooked: true })
            });
            const handleClose = res => {
                if (res.isEnded) {
                    _this.setState({ adLooked: true }, _this.handleAdSuccess)
                } else {
                    eventCenter.trigger('lookAdUnEnded');
                }
            };
            videoAd.onClose(handleClose);
        }
        beforeAdFunc = () => {
            this.wrappedCompRef.current && this.wrappedCompRef.current.beforeAdFunc();
        }
        getIsLimit = () => {
            const localKey = options.locakKey || '';
            // 是否间隔显示
            const interval = options.interval || 0;
            const detailAdInfo = Taro.getStorageSync(localKey) || {};
            console.log('detailAdInfo', detailAdInfo)
            console.log('detailAdInfo', detailAdInfo)
            let isLimit = false;
            if (interval) {
                // 下载次数是否超过可用间隔次数 且 没有看过广告
                isLimit = (detailAdInfo.num || 0) % interval === 0;
            } else {
                // 下载次数是否超过needNumberToShow 且 没有看过广告
                isLimit = options.needNumberToShow ? ((detailAdInfo.num || 0) >= options.needNumberToShow) && !detailAdInfo.currentDayLooked : !detailAdInfo.currentDayLooked;
            }
            console.log('getIsLimit', isLimit)
            return isLimit
        }
        showAdInfo = () => {
            const { videoAd } = this.state;
            // 有广告实例并且大于限制条件 需要限制
            if (videoAd && this.getIsLimit()) {
                this.setState({ visible: true })
            } else {
                // 没有广告实例 或者 无限制时间 直接放行
                this.setState({ adLooked: true }, this.beforeAdFunc)
            }
        }
        onOk = () => {
            const { videoAd } = this.state;
            this.setState({ visible: false, adLooked: false })
            // 触发前置操作
            if (options.asyncAction) {
                this.beforeAdFunc();
            }
            const _this = this
            if (videoAd) {
                videoAd.show().catch(() => {
                    // 失败重试
                    videoAd.load()
                        .then(() => videoAd.show())
                        .catch(err => {
                            console.error('激励视频 广告显示失败', err)
                            _this.setState({ adLooked: true })
                        })
                })
            }
        }
        renderAdInfo = () => {
            const _this = this;
            const { visible } = this.state;
            const cancel = () => {
                _this.setState({ visible: false })
            }
            if (!visible) return null;
            Taro.showModal({
                title: '提示',
                content: '观看一次广告即可解锁当日两次功能使用，感谢您的支持',
                success: function (res) {
                    if (res.confirm) {
                        _this.onOk()
                    } else if (res.cancel) {
                        cancel()
                    }
                },
                fail: function (res) {
                    cancel()
                }
            })
            return <View />
        }

        render() {
            const { forwardedRef: ref, ...rest } = this.props;

            const adProps = {
                showAdInfo: this.showAdInfo,
            }
            return <>
                <WrappedComponent
                    {...rest}
                    {...adProps}
                    ref={(node) => {
                        this.wrappedCompRef.current = node;
                        if (ref) {
                            if (typeof ref === 'function') {
                                ref(node);
                            } else {
                                ref.current = node;
                            }
                        }
                    }}
                />
                {this.renderAdInfo()}
            </>
        }
    }
    return React.forwardRef((props, ref) => {
        return <AdInfoComponent {...props} forwardedRef={ref} />;
    });
}

export default withAdInfo;