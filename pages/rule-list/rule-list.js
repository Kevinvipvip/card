const app = getApp();

Page({
  data: {
    full_loading: true,

    page: 1,
    rule_list: [],
    nomore: false,
    nodata: false,
    loading: false
  },
  onLoad() {
    this.ruleList(() => {
      this.setData({ full_loading: false });
    });
  },
  // 新闻公告列表
  ruleList(complete) {
    app.ajax('api/ruleList', null, res => {
      app.format_img(res);
      this._date_format(res);
      this.setData({ rule_list: res });
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  },
  // 格式化时间
  _date_format(rule_list) {
    for (let i = 0; i < rule_list.length; i++) {
      rule_list[i].create_time = rule_list[i].create_time.substr(0, 10);
    }
  },
  // 下拉刷新
  onPullDownRefresh() {
    if (!this.data.loading) {
      this.data.loading = true;

      this.data.page = 1;
      this.data.rule_list = [];
      this.setData({
        nomore: false,
        nodata: false
      });

      wx.showNavigationBarLoading();
      this.ruleList(() => {
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
        this.ruleList(() => {
          wx.hideNavigationBarLoading();
          this.data.loading = false;
        });
      }
    }
  }
});