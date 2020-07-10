const app = getApp();

Page({
  data: {
    full_loading: true,

    // 筛选条件
    search: '',
    search_focus: false,

    prop_type: 0,

    card_attr: [],  // 属性
    resource: [
      {
        name: '全部',
        id: -2,
        active: true
      },
      {
        name: '0',
        id: 0,
        active: false
      },
      {
        name: '1',
        id: 1,
        active: false
      },
      {
        name: '2',
        id: 2,
        active: false
      },
      {
        name: '3',
        id: 3,
        active: false
      },
      {
        name: '4',
        id: 4,
        active: false
      },
      {
        name: '5',
        id: 5,
        active: false
      },
      {
        name: '6',
        id: 6,
        active: false
      },
      {
        name: '7+',
        id: 7,
        active: false
      },
      {
        name: 'X',
        id: -1,
        active: false
      }
    ],  // 费用
    card_type: [],  // 类别
    card_camp: [],  // 势力
    card_ability: [],  // 能力
    card_version: [],  // 版本

    // 非版本属性的flex_pad
    card_attr_fp: [],
    resource_fp: [],
    card_type_fp: [],
    card_camp_fp: [],
    card_ability_fp: [],

    // 卡牌
    page: 1,
    card_list: [],
    card_flex_pad: [],
    nomore: false,
    nodata: false,
    loading: false
  },
  onLoad() {
    this.cardParams(() => {
      this.cardList(() => {
        this.setData({ full_loading: false });
      });
    });
  },
  // 搜索框获得焦点
  search_focus() {
    this.setData({ search_focus: true });
  },
  // 搜索框失去焦点
  search_blur() {
    this.setData({ search_focus: false });
  },
  // 卡牌筛选条件
  cardParams(complete) {
    app.ajax('api/cardParams', null, res => {
      for (let key in res) {
        if (key !== 'resource') {
          for (let i = 0; i < res[key].length; i++) {
            res[key][i].active = false;
          }
        }
      }

      res.card_attr.unshift({ id: -2, attr_name: '全部', active: true });
      res.card_type.unshift({ id: -2, type_name: '全部', active: true });
      res.card_camp.unshift({ id: -2, camp_name: '全部', active: true });
      res.card_ability.unshift({ id: -2, ability_name: '全部', active: true });
      res.card_version.unshift({ id: -2, version_name: '全部', active: true });

      this.setData({
        card_attr: res.card_attr,
        card_type: res.card_type,
        card_camp: res.card_camp,
        card_ability: res.card_ability,
        card_version: res.card_version,

        card_attr_fp: app.null_arr(res.card_attr.length, 4),
        resource_fp: app.null_arr(this.data.resource.length, 4),
        card_type_fp: app.null_arr(res.card_type.length, 4),
        card_camp_fp: app.null_arr(res.card_camp.length, 4),
        card_ability_fp: app.null_arr(res.card_ability.length, 4),
      });
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  },
  // 搜索卡牌
  search_card() {
    this.reset();
    this.cardList();
  },
  // 清空搜索框
  clear_search() {
    this.setData({
      search: '',
      search_focus: false
    }, () => {
      this.reset();
      this.cardList();
    });
  },
  // 切换分类
  pt_change(e) {
    let prop_type = e.currentTarget.dataset.prop_type;
    if (this.data.prop_type === prop_type) {
      this.setData({ prop_type: 0 });
    } else {
      this.setData({ prop_type });
    }
  },
  // 隐藏分类
  hide_pt() {
    this.setData({ prop_type: 0 });
  },
  // 选择 属性/费用/类别/势力/能力/版本
  choose_prop(e) {
    let type = e.currentTarget.dataset.type;
    let index = e.currentTarget.dataset.index;

    let prop_list;
    let prop_list_name;

    switch (type) {
      case 1:
        prop_list = this.data.card_attr;
        prop_list_name = 'card_attr';
        break;
      case 2:
        prop_list = this.data.resource;
        prop_list_name = 'resource';
        break;
      case 3:
        prop_list = this.data.card_type;
        prop_list_name = 'card_type';
        break;
      case 4:
        prop_list = this.data.card_camp;
        prop_list_name = 'card_camp';
        break;
      case 5:
        prop_list = this.data.card_ability;
        prop_list_name = 'card_ability';
        break;
      case 6:
        prop_list = this.data.card_version;
        prop_list_name = 'card_version';
        break;
    }

    if (index === 0) {
      if (!prop_list[index].active) {
        this._active_reset(prop_list);
        this.setData({ [prop_list_name]: prop_list }, () => {
          this.reset();
          this.cardList();
        })
      }
    } else {
      this.setData({ [`${prop_list_name}[${index}].active`]: !prop_list[index].active }, () => {
        this.setData({ [`${prop_list_name}[0].active`]: this._no_active(prop_list) }, () => {
          this.reset();
          this.cardList();
        });
      });
    }
  },
  // 重置数组active（将第一个active设为true，其余设为false）
  _active_reset(prop_list) {
    for (let i = 0; i < prop_list.length; i++) {
      prop_list[i].active = i === 0;
    }
  },
  // 如果数组中除第一个外没有一个是active的，则返回true（全部按钮是否亮起）
  _no_active(prop_list) {
    for (let i = 1; i < prop_list.length; i++) {
      if (prop_list[i].active) {
        return false;
      }
    }
    return true;
  },
  // 获取数组中选中的值，若选中全部则返回false
  _get_active(prop_list) {
    if (prop_list[0].active) {
      return [];
    } else {
      let active_arr = [];
      for (let i = 1; i < prop_list.length; i++) {
        if (prop_list[i].active) {
          active_arr.push(prop_list[i].id);
        }
      }
      return active_arr;
    }
  },
  // 卡牌列表
  cardList(complete) {
    let post = {
      page: this.data.page,
      perpage: 12  // 每行3张，4行
    };

    let data = this.data;

    // 是否有关键字
    if (data.search.trim()) {
      post.search = data.search;
    }

    post.attr_id = this._get_active(data.card_attr);
    post.resource = this._get_active(data.resource);
    post.type_id = this._get_active(data.card_type);
    post.camp_id = this._get_active(data.card_camp);
    post.ability_id = this._get_active(data.card_ability);
    post.version_id = this._get_active(data.card_version);

    app.ajax('api/cardList', post, res => {
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
  // 重置页数与结果（筛选用）
  reset() {
    this.data.page = 1;
    this.data.card_list = [];
    this.setData({
      nomore: false,
      nodata: false
    });
  },
  // 下拉刷新
  onPullDownRefresh() {
    if (!this.data.loading) {
      this.data.loading = true;
      this.reset();
      wx.showNavigationBarLoading();
      this.cardList(() => {
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
        this.cardList(() => {
          wx.hideNavigationBarLoading();
          this.data.loading = false;
        });
      }
    }
  },
  bind_input(e) {
    app.bind_input(e, this);
  },
  // 跳转详情
  jump(e) {
    let id = e.currentTarget.dataset.id;

    let post = {};
    let data = this.data;

    if (data.search.trim()) {
      post.search = data.search;
    }
    post.attr_id = this._get_active(data.card_attr);
    post.resource = this._get_active(data.resource);
    post.type_id = this._get_active(data.card_type);
    post.camp_id = this._get_active(data.card_camp);
    post.ability_id = this._get_active(data.card_ability);
    post.version_id = this._get_active(data.card_version);

    wx.navigateTo({ url: '/pages/card-detail/card-detail?id=' + id + '&post=' + encodeURIComponent(JSON.stringify(post)) });
  }
});