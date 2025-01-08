import Taro from '@tarojs/taro'

export const isBeforeYesterday = timeToCheck => {
    // 获取当前时间
    const now = new Date();
    // 获取昨天的日期
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    // 设置昨天的23:59:59
    yesterday.setHours(23, 59, 59, 999);
    // 将要检查的时间转换为Date对象
    const checkTime = new Date(timeToCheck);
    // 比较时间
    return checkTime < yesterday;
};

export const controlShareMenu = (isHide) => {
    if (isHide) {
        Taro.hideShareMenu()
    } else {
        Taro.showShareMenu({
            withShareTicket: true,
        })
    }
}
export const formatDate = (time) => {
    const date = new Date(time);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
  
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }