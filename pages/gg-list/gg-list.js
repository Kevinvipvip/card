const app = getApp();

Page({
  data: {
    full_loading: true,

    page: 1,
    article_list: [],
    nomore: false,
    nodata: false,
    loading: false
  },
  onLoad() {
    this.articleList(() => {
      this.setData({ full_loading: false });
    });
  },
  // 新闻公告列表
  articleList(complete) {
    let post = {
      page: this.data.page,
      perpage: 20
    };

    app.ajax('api/articleList', post, res => {
      if (res.length === 0) {
        if (this.data.page === 1) {
          this.setData({
            article_list: [],
            nodata: true,
            nomore: false
          })
        } else {
          this.setData({
            nodata: false,
            nomore: true
          })
        }
      } else {
        app.format_img(res.list);
        this._date_format(res.list);
        this.setData({ article_list: this.data.article_list.concat(res.list) });
      }
      this.data.page++;
    }, null, () => {
      if (complete) {
        complete();
      }
    });
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

      this.data.page = 1;
      this.data.article_list = [];
      this.setData({
        nomore: false,
        nodata: false
      });

      wx.showNavigationBarLoading();
      this.articleList(() => {
        this.data.loading = false;
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();
      });
    }
  },
  // 上拉加载
  onReachBottom() {
    if (!this.data.nomore && !this.data.nodata) {
      if (!this.data.loading) {
        this.data.loading = true;
        wx.showNavigationBarLoading();
        this.articleList(() => {
          wx.hideNavigationBarLoading();
          this.data.loading = false;
        });
      }
    }
  }
});