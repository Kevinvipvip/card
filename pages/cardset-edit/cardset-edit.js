const app = getApp();

Page({
  data: {
    full_loading: true,

    id: 0,
    show_side: false,  // 是否显示侧边栏
    cl_height: 0,  // card-list-wrapper 的高度
    cl2_height: 0,

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
    loading: false,

    dot_num: 0,
    dot_left_origin: 0,
    dot_top_origin: 0,
    dot_left: 0,
    dot_top: 0,
    dot_active: false,

    tab_active: 1,  // 1.主牌 2.备牌
    zhu_list: {},  // 主牌列表
    bei_list: {},  // 备牌列表

    dir_name: '',  // 套牌名称
    show_edit: false,
    show_succ: false,
    new_id: 0  // 创建套牌成功，新套牌id
  },
  onLoad(options) {
    if (options.id) {
      this.setData({ id: options.id });
      wx.setNavigationBarTitle({ title: '编辑套牌' });
      this.myComboDetail(() => {
        this.setData({ dot_num: this._count_dot_num() });

        this.cardParams(() => {
          this.cardList(() => {
            this.setData({ full_loading: false });
          });
        });
      });
    } else {
      wx.setNavigationBarTitle({ title: '创建套牌' });
      this.cardParams(() => {
        this.cardList(() => {
          this.setData({ full_loading: false });
        });
      });
    }
  },
  onReady() {
    const query = wx.createSelectorQuery();

    query.select('.card-box').boundingClientRect(res => {
      this.setData({ cl_height: res.height });
    }).exec();

    setTimeout(() => {
      query.select('.ffffpp').boundingClientRect(res => {
        console.log(res.height, 'cl2_height');

        this.setData({ cl2_height: res.height });
      }).exec();
    }, 500);

    query.select('#dot-num').boundingClientRect(res => {
      this.setData({
        dot_left_origin: res.left,
        dot_top_origin: res.top,
        dot_left: 0,
        dot_top: 0
      });
    }).exec();
  },
  // 套牌详情
  myComboDetail(complete) {
    app.ajax('my/myComboDetail', { dir_id: this.data.id }, res => {
      let zhu_list = {};
      let bei_list = {};
      let combo_key;

      for (let i = 0; i < res.list.length; i++) {
        if (res.list[i].resource === '无') {
          res.list[i].resource = '';
        }

        combo_key = res.list[i].combo_key.split('_');

        if (combo_key[2] === '1') {
          zhu_list[combo_key[1]] = {
            resource: res.list[i].resource,
            card_name: res.list[i].card_name,
            num: res.list[i].num
          };
        } else {
          bei_list[combo_key[1]] = {
            resource: res.list[i].resource,
            card_name: res.list[i].card_name,
            num: res.list[i].num
          };
        }
      }

      this.setData({
        dir_name: res.dir_name,
        zhu_list,
        bei_list
      })
    }, null, () => {
      if (complete) {
        complete();
      }
    });
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
  // 搜索框获得焦点
  search_focus() {
    this.setData({ search_focus: true });
  },
  // 搜索框失去焦点
  search_blur() {
    this.setData({ search_focus: false });
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
        this.format_card(res);

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
  // 处理卡牌列表数据（主牌/备牌按钮是否亮起）
  format_card(card_list) {
    for (let i = 0; i < card_list.length; i++) {
      card_list[i].zhu_active = !!this.data.zhu_list[card_list[i].id];
      card_list[i].bei_active = !!this.data.bei_list[card_list[i].id];
    }
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
  // 打开侧栏
  showModal() {
    this.setData({ show_side: true });
  },
  // 关闭侧栏
  hideModal() {
    this.setData({ show_side: false });
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
  },
  // 滚动到底部
  more_card() {
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
  // 主牌/备牌点击
  pai_btn_click(e) {
    let index = e.currentTarget.dataset.index;
    let type = e.currentTarget.dataset.type;

    let data = this.data;

    let active_field;
    let pai_list;
    let pai_list_field;
    let pai_text;

    if (type === 1) {
      active_field = 'zhu_active';
      pai_list = data.zhu_list;
      pai_list_field = 'zhu_list';
      pai_text = '主牌';
    } else {
      active_field = 'bei_active';
      pai_list = data.bei_list;
      pai_list_field = 'bei_list';
      pai_text = '备牌';
    }

    if (!data.card_list[index][active_field]) {
      this._move_anime(index, type);

      // 处理一下资源牌的特殊值
      let resource;
      switch (data.card_list[index].resource) {
        case -1:
          resource = 'X';
          break;
        case -2:
          resource = '';
          break;
        default:
          resource = data.card_list[index].resource;
          break;
      }

      pai_list[data.card_list[index].id] = {
        resource: resource,
        card_name: data.card_list[index].card_name,
        num: 1
      };
      this.setData({
        [pai_list_field]: pai_list,
        dot_num: this._count_dot_num(),
        [`card_list[${index}].${active_field}`]: true
      });
    } else {
      app.confirm('从套牌' + pai_text + '中删除此牌？', () => {
        delete pai_list[data.card_list[index].id];

        this.setData({
          [pai_list_field]: pai_list,
          dot_num: this._count_dot_num(),
          [`card_list[${index}].${active_field}`]: false
        });
      });
    }
  },
  // 牌移动动画
  _move_anime(index, type) {
    const query = wx.createSelectorQuery();
    query.select((type === 1 ? '#card_zhu_' : '#card_bei_') + index).boundingClientRect(res => {
      this.setData({
        dot_left: res.left + 19.5,
        dot_top: res.top + 6.5,
        dot_active: true
      }, () => {
        wx.nextTick(() => {
          this.setData({
            dot_left: this.data.dot_left_origin,
            dot_top: this.data.dot_top_origin
          }, () => {
            setTimeout(() => {
              this.setData({ dot_active: false });
            }, 420);
          });
        });
      });
    }).exec();
  },
  // 计算 主牌 + 备牌 张数
  _count_dot_num() {
    return Object.keys(this.data.zhu_list).length + Object.keys(this.data.bei_list).length;
  },
  // 切换主牌/备牌
  tab_change(e) {
    let tab = e.currentTarget.dataset.tab;
    this.setData({ tab_active: tab });
  },
  // 卡牌加减
  card_num_change(e) {
    let type = e.currentTarget.dataset.type;
    let num = e.currentTarget.dataset.num;
    let index = e.currentTarget.dataset.index;

    let data = this.data;

    let active_field;
    let pai_list;
    let pai_list_field;
    let pai_text;

    if (type === 1) {
      active_field = 'zhu_active';
      pai_list = data.zhu_list;
      pai_list_field = 'zhu_list';
      pai_text = '主牌';
    } else {
      active_field = 'bei_active';
      pai_list = data.bei_list;
      pai_list_field = 'bei_list';
      pai_text = '备牌';
    }

    // 卡牌现数量
    let amount = pai_list[index].num;

    // 卡牌小于1并减少时删除牌，卡牌等于99并增加时什么也不做
    if (amount === 1 && num === -1) {
      app.confirm('从套牌' + pai_text + '中删除此牌？', () => {
        delete pai_list[index];

        this.setData({
          [pai_list_field]: pai_list,
          dot_num: this._count_dot_num()
        });

        this._un_active(index, type);
      });
    } else if (!(amount === 99 && num === 1)) {
      this.setData({ [pai_list_field + `.${index}.num`]: pai_list[index].num + num });
    }
  },
  // 当卡牌从套牌删除时，对应的主牌/备案按钮变灰（如果此牌仍在卡牌列表中的话）
  _un_active(id, type) {
    for (let i = 0; i < this.data.card_list.length; i++) {
      if (this.data.card_list[i].id === parseInt(id)) {
        if (type === 1) {
          this.setData({ [`card_list[${i}].zhu_active`]: false });
        } else {
          this.setData({ [`card_list[${i}].bei_active`]: false });
        }
        break;
      }
    }
  },
  // 显示创建/编辑套牌弹窗
  show_edit() {
    if (Object.keys(this.data.zhu_list).length === 0) {
      app.modal('主牌不能为空');
    } else {
      this.setData({ show_edit: true });
    }
  },
  // 隐藏创建/编辑套牌弹窗
  hide_edit() {
    this.setData({ show_edit: false });
  },
  // 创建/编辑套牌
  edit_combo() {
    if (!this.data.dir_name.trim()) {
      app.toast('套牌名不能为空');
    } else {
      let post = {
        dir_name: this.data.dir_name,
        combo: JSON.stringify(this._format_card_post())
      };

      let cmd;
      if (this.data.id === 0) {
        cmd = 'my/createCardCombo';
      } else {
        cmd = 'my/cardComboModify';
        post.dir_id = this.data.id;
      }

      app.ajax(cmd, post, res => {
        this.data.new_id = res;
        this.setData({
          show_edit: false,
          show_succ: true
        })
      });
    }
  },
  // 将卡牌整理成
  _format_card_post() {
    let combo = {};
    for (let key in this.data.zhu_list) {
      combo[`c_${key}_1`] = this.data.zhu_list[key].num;
    }
    for (let key in this.data.bei_list) {
      combo[`c_${key}_2`] = this.data.bei_list[key].num;
    }
    return combo;
  },
  // 返回主页
  back_home() {
    wx.switchTab({ url: '/pages/my/my' });
  },
  // 进入详情
  to_detail() {
    if (this.data.id === 0) {
      wx.redirectTo({ url: '/pages/cardset-detail/cardset-detail?id=' + this.data.new_id });
    } else {
      wx.redirectTo({ url: '/pages/cardset-detail/cardset-detail?id=' + this.data.id });
    }
  }
});