const app = getApp();

Page({
  data: {
    full_loading: true,

    id: 0,
    post: null,  // 筛选条件的post

    card_bg: '',
    card: {}
  },
  onLoad(options) {
    this.data.id = options.id;

    if (options.post) {
      this.data.post = JSON.parse(decodeURIComponent(options.post));
    }

    this.cardDetail(() => {
      this.setData({
        card_bg: app.common.card_bg,
        full_loading: false
      });
    });
  },
  // 卡牌详情
  cardDetail(complete) {
    let post = {
      id: this.data.id
    };

    if (this.data.post) {
      Object.assign(post, this.data.post);
    }

    app.ajax('api/cardDetail', post, res => {
      app.format_img(res, 'pic');
      app.format_img(res, 'cover');
      this.setData({ card: res });
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  },
  // 放大卡牌
  zoom() {
    wx.previewImage({
      current: this.data.card.pic,
      urls: [this.data.card.pic]
    });
  },
  // 跳转
  jump(e) {
    let id = e.currentTarget.dataset.id;
    if (id) {
      if (this.data.post) {
        wx.redirectTo({ url: '/pages/card-detail/card-detail?id=' + id + '&post=' + encodeURIComponent(JSON.stringify(this.data.post)) });
      } else {
        wx.redirectTo({ url: '/pages/card-detail/card-detail?id=' + id });
      }
    }
  },
  // 收藏/取消收藏
  cardCollect() {
    if (!this.data.loading) {
      this.data.loading = true;
      app.ajax('api/cardCollect', { card_id: this.data.id }, res => {
        this.setData({ ['card.collect']: res });
        if (res) {
          app.toast('收藏成功');
        } else {
          app.toast('已取消收藏');
        }
      }, null, () => {
        this.data.loading = false;
      });
    }
  },
  // 分享
  onShareAppMessage() {
    wx.showShareMenu();
    return { path: app.share_path() };
  }
});