const app = getApp();

Page({
  data: {
    full_loading: true,

    slide_list: [],  // 轮播图列表
    article_list: [],  // 新闻公告列表
    goods_list: [],  // 推荐商品列表
    goods_flex_pad: [],

    loading: false
  },
  onLoad() {
    // 检测小程序更新
    app.mp_update();

    let promise1 = new Promise(resolve => {
      this.slideList(() => {
        resolve();
      });
    });

    let promise2 = new Promise(resolve => {
      this.articleList(() => {
        resolve();
      });
    });

    Promise.all([
      promise1, promise2
    ]).then(() => {
      this.setData({ full_loading: false });
    });

    this.recommendGoodsList();
  },
  // 获取首页轮播图
  slideList(complete) {
    app.ajax('api/slideList', null, res => {
      app.format_img(res);
      this.setData({ slide_list: res });
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  },
  // 新闻公告列表
  articleList(complete) {
    app.ajax('api/articleList', null, res => {
      app.format_img(res.list);
      this._date_format(res.list);
      this.setData({ article_list: res.list });
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  },
  // 推荐商品列表
  recommendGoodsList(complete) {
    app.ajax('api/recommendGoodsList', { perpage: 4 }, res => {
      app.format_img(res, 'cover');
      this.setData({
        goods_list: res,
        goods_flex_pad: app.null_arr(res.length, 2)
      });
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  },
  // 跳页
  jump(e) {
    if (e.currentTarget.dataset.url) {
      app.jump(e);
    }
  },
  // 格式化时间
  _date_format(article_list) {
    for (let i = 0; i < article_list.length; i++) {
      article_list[i].create_time = article_list[i].create_time.substr(0, 10);
    }
  },
  // 下拉刷新
  onPullDownRefresh() {
    if (!this.data.loading) {
      this.data.loading = true;

      wx.showNavigationBarLoading();

      let promise1 = new Promise(resolve => {
        this.slideList(() => {
          resolve();
        });
      });

      let promise2 = new Promise(resolve => {
        this.articleList(() => {
          resolve();
        });
      });

      let promise3 = new Promise(resolve => {
        this.recommendGoodsList(() => {
          resolve();
        });
      });

      Promise.all([
        promise1, promise2, promise3
      ]).then(() => {
        this.data.loading = false;
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();
      });
    }
  },
  // 分享
  onShareAppMessage() {
    wx.showShareMenu();
    return { path: app.share_path() };
  }
});