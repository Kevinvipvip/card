const app = getApp();

Page({
  data: {
    nodata: false,

    user: {
      id: 0,
      user_auth: 0,
      nickname: '',
      username: '',
      sex: 0,
      avatar: '',
      share_auth: 0
    },
    combo_list: [],
    cardset_list: [1, 2],

    loading: false
  },
  onLoad() {
  },
  onShow() {
    this.mydetail();
    this.myComboDir();
  },
  // 下拉刷新
  onPullDownRefresh() {
    if (!this.data.loading) {
      this.data.loading = true;

      this.data.combo_list = [];
      this.setData({ nodata: false });

      wx.showNavigationBarLoading();

      let promise1 = new Promise(resolve => {
        this.mydetail(() => {
          resolve();
        });
      });

      let promise2 = new Promise(resolve => {
        this.myComboDir(() => {
          resolve();
        });
      });

      Promise.all([
        promise1, promise2
      ]).then(() => {
        this.data.loading = false;
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();
      });
    }
  },
  // 获取个人信息
  mydetail(complete) {
    app.mydetail(() => {
      this.setData({
        user: {
          id: app.user_data.uid,
          user_auth: app.user_data.user_auth,
          nickname: app.user_data.nickname || '',
          username: app.user_data.username || '',
          sex: app.user_data.sex,
          avatar: app.user_data.avatar,
          tel: app.user_data.tel || '',
          share_auth: app.user_data.share_auth
        }
      });

      if (complete) {
        complete();
      }
    });
  },
  auth(e) {
    if (e.detail.userInfo) {
      wx.showLoading({
        title: '授权中',
        mask: true
      });

      app.userAuth(res => {
        wx.hideLoading();

        if (res) {
          this.mydetail();
        } else {
          app.toast('授权失败，请重新授权');
        }
      });
    }
  },
  // 我的套牌列表
  myComboDir(complete) {
    app.ajax('my/myComboDir', null, res => {
      if (res.length === 0) {
        this.setData({
          combo_list: [],
          nodata: true
        })
      } else {
        app.format_img(res, 'cover');
        this.setData({ combo_list: res });
      }
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  },
  // 删除套牌
  cardComboDel(e) {
    let id = e.currentTarget.dataset.id;
    app.confirm('确认删除套牌？', () => {
      app.ajax('my/cardComboDel', {dir_id: id}, () => {
        this.myComboDir();
      });
    });
  }
});