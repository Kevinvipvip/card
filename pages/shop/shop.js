const app = getApp();

Page({
  data: {
    full_loading: true,

    show_cart: false,  // 是否显示购物车

    // 筛选条件
    search: '',
    search_focus: false,

    prop_type: 0,
    cate_ai: 0,  // cate active index
    cate_list: [],
    version_ai: 0,  // version active index
    version_list: [],

    // 商品
    page: 1,
    goods_list: [],
    goods_flex_pad: [],
    nomore: false,
    nodata: false,
    loading: false
  },
  onLoad() {
    this.goodsList(() => {
      this.setData({ full_loading: false });
    });

    this.cateList();
    this.versionList();
    this.cartList();
  },
  // 获取分类
  cateList(complete) {
    app.ajax('shop/cateList', null, res => {
      res.unshift({ id: 0, cate_name: '全部' });
      this.setData({ cate_list: res });
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  },
  // 获取版本
  versionList(complete) {
    app.ajax('shop/versionList', null, res => {
      res.unshift({ id: 0, version_name: '全部' });
      this.setData({ version_list: res });
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  },
  // 商品列表
  goodsList(complete) {
    let post = {
      page: this.data.page,
      perpage: 10
    };

    let data = this.data;

    // 是否有关键字
    if (data.search.trim()) {
      post.search = data.search;
    }

    // 是否选择分类
    if (data.cate_ai !== 0) {
      post.cate_id = data.cate_list[data.cate_ai].id;
    }

    // 是否选择版本
    if (this.data.version_ai !== 0) {
      post.version_id = data.version_list[data.version_ai].id;
    }

    app.ajax('shop/goodsList', post, res => {
      if (res.length === 0) {
        if (this.data.page === 1) {
          this.setData({
            goods_list: [],
            nodata: true,
            nomore: false,
            goods_flex_pad: []
          })
        } else {
          this.setData({
            nodata: false,
            nomore: true
          })
        }
      } else {
        app.format_img(res, 'cover');

        this.setData({ goods_list: this.data.goods_list.concat(res) }, () => {
          this.setData({ goods_flex_pad: app.null_arr(this.data.goods_list.length, 2) });
        });
      }
      this.data.page++;
    }, null, () => {
      if (complete) {
        complete()
      }
    });
  },
  // 搜索商品
  search_shop() {
    this.reset();
    this.goodsList();
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
      this.goodsList();
    });
  },
  // 切换筛选条件
  tab_change(e) {
    let prop_type = e.currentTarget.dataset.prop_type;
    if (this.data.prop_type === prop_type) {
      this.setData({ prop_type: 0 });
    } else {
      this.setData({ prop_type });
    }
  },
  // 隐藏筛选条件
  hide_tab() {
    this.setData({ prop_type: 0 });
  },
  // 选择分类/版本
  choose_prop(e) {
    let type = e.currentTarget.dataset.type;
    let index = e.currentTarget.dataset.index;

    if (type === 1) {
      this.setData({cate_ai: index});
    } else {
      this.setData({version_ai: index});
    }

    this.setData({prop_type: 0});

    this.reset();
    this.goodsList();
  },
  // 重置页数与结果（筛选用）
  reset() {
    this.data.page = 1;
    this.data.goods_list = [];
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
      this.goodsList(() => {
        this.data.loading = false;
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();

        this.cartList();
      });
    }
  },
  // 上拉加载
  onReachBottom() {
    if (!this.data.nomore && !this.data.nodata) {
      if (!this.data.loading) {
        this.data.loading = true;
        wx.showNavigationBarLoading();
        this.goodsList(() => {
          wx.hideNavigationBarLoading();
          this.data.loading = false;
        });
      }
    }
  },
  bind_input(e) {
    app.bind_input(e, this);
  },
  // 购物车列表（用来判断是否显示购物车icon）
  cartList() {
    app.ajax('shop/cartList', null, res => {
      this.setData({ show_cart: res.length > 0 });
    });
  },
});