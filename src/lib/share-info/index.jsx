import React, { useEffect, Component } from 'react';
import { View } from '@tarojs/components';
import Taro from '@tarojs/taro'
import { Dialog, Image, Button } from '@nutui/nutui-react-taro'
import { Loading } from '@nutui/icons-react-taro';
import { controlShareMenu } from '../../../utils';
import { APP_LOGO } from '../../../store/config';
import './index.scss';

const withShareInfo = (WrappedComponent, options = {}) => {
    class ShareInfoComponent extends Component {
        constructor(props) {
            super(props)
            this.state = {
                showShareDialog: false,
                shareParams: {}
            }
        }
        // 配置转发给朋友
        onShareAppMessage(res) {
            const { imgSrc, prompt } = this.state.shareParams

            // 构建携带参数的路径
            const queryParams = {
                prompt,
                imgSrc,
            }
            const queryString = Object.entries(queryParams)
                .filter(([_, v]) => v)
                .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
                .join('&')
            console.log('queryString', queryString)
            return {
                title: `AI文本生成图像`,
                path: `/pages/text2img/index?${queryString}`,
                imageUrl: queryParams.imgSrc ? 'https://img.pxfe.top/v2/o7gZoJF.png' : APP_LOGO,
            }
        }

        componentDidMount() {
            this.getShareInfo()
        }
        componentWillUnmount() {
            this.setState({
                shareParams: {}
            })
            controlShareMenu()
        }
        getShareInfo = (cb) => {
            // 获取页面参数
            const params = Taro.getCurrentInstance().router.params
            if (params.imgSrc) {
                // 被分享页当前不允许再分享
                controlShareMenu(true)
                // 如果有分享参数，设置状态并自动播放
                const shareParams = {
                    prompt: decodeURIComponent(params.prompt || ''),
                    imgSrc: decodeURIComponent(params.imgSrc || ''),
                }
                this.setState({
                    shareParams
                })
                cb && cb(shareParams)
            } else {
                cb && cb(null)
            }
        }
        showShareDialog = (params) => {
            this.setState({
                showShareDialog: true,
                shareParams: params
            })
        }
        hideShareDialog = () => {
            this.setState({
                showShareDialog: false
            })
        }
        renderShareDialog = () => {
            const onOk = () => {
                this.setState({
                    showShareDialog: false
                })
            }
            const onCancel = () => {
                this.setState({
                    showShareDialog: false
                })
            }
            const footer = <View className="to-share-dialog-footer">
                <View className="to-share-dialog-footer-item" onClick={onCancel}>
                    <View className="to-share-dialog-footer-item-content cancel">取消</View>
                </View>
                <View className="to-share-dialog-footer-item">
                    <View className="to-share-dialog-footer-item-content isOk">
                        <Button openType="share" onClick={onOk}>去分享</Button>
                    </View>
                </View>
            </View>
            return <Dialog
                visible={this.state.showShareDialog}
                title={null}
                className='to-share-dialog'
                footer={footer}
            >
                <>
                    <div
                        className='to-share-dialog-wp'
                    >
                        <div className='to-share-dialog-wp-top'>
                            <Image
                                loading={<Loading className="nut-icon-loading" />}
                                src={'https://img.pxfe.top/v2/pEl6iny.png'}
                                width={260}
                                height={200}
                                style={{ borderRadius: '8px' }}
                            />
                        </div>
                    </div>
                </>
            </Dialog>
        }

        render() {
            const shareProps = {
                getShareInfo: this.getShareInfo,
                showShareDialog: this.showShareDialog,
            }

            return <>
                <WrappedComponent {...this.props} {...shareProps} />
                {this.renderShareDialog()}
            </>
        }
    }
    return ShareInfoComponent
}

export default withShareInfo