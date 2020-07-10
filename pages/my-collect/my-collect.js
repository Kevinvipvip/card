const app = getApp();

Page({
  data: {
    full_loading: true,

    page: 1,
    card_list: [],
    card_flex_pad: [],
    nomore: false,
    nodata: false,
    loading: false
  },
  onLoad() {
    this.myCollectCardList(() => {
      this.setData({ full_loading: false });
    });
  },
  // 我的收藏
  myCollectCardList(complete) {
    let post = {
      page: this.data.page,
      perpage: 12  // 每行3张，4行
    };

    app.ajax('my/myCollectCardList', post, res => {
      if (res.length === 0) {
        if (this.data.page === 1) {
          this.setData({
            card_list: [],
            nodata: true,
            nomore: false,
            card_flex_pad: []
          })
        } else {
          this.setData({
            nodata: false,
            nomore: true
          })
        }
      } else {
        app.format_img(res, 'pic');
        app.format_img(res, 'cover');

        this.setData({ card_list: this.data.card_list.concat(res) }, () => {
          this.setData({ card_flex_pad: app.null_arr(this.data.card_list.length, 3) });
        });
      }
      this.data.page++;
    }, null, () => {
      if (complete) {
        complete()
      }
    });
  },
  // 下拉刷新
  onPullDownRefresh() {
    if (!this.data.loading) {
      this.data.loading = true;
      this.reset();
      wx.showNavigationBarLoading();
      this.myCollectCardList(() => {
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
        this.myCollectCardList(() => {
          wx.hideNavigationBarLoading();
          this.data.loading = false;
        });
      }
    }
  },
  // 重置页数与结果
  reset() {
    this.data.page = 1;
    this.data.card_list = [];
    this.setData({
      nomore: false,
      nodata: false
    });
  },
  // 移出收藏夹
  cardCollect(e) {
    app.confirm('将此牌移出收藏夹？', () => {
      let index = e.currentTarget.dataset.index;

      app.ajax('api/cardCollect', { card_id: this.data.card_list[index].id }, res => {
        this.data.card_list.splice(index, 1);
        this.setData({
          card_list: this.data.card_list,
          card_flex_pad: app.null_arr(this.data.card_list.length, 3)
        });
      });
    });
  }
});