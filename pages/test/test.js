const app = getApp();

Page({
  data: {
  },
  onLoad() {
    1394
  },
  showModal(e) {
    this.setData({
      modalName: e.currentTarget.dataset.target
    })
  },
  hideModal(e) {
    this.setData({
      modalName: null
    })
  }
});