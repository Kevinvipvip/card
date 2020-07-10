var WxParse = require('../../wxParse/wxParse.js');
const app = getApp();

Page({
  data: {
    full_loading: true,

    id: 0,
    article: {}
  },
  onLoad(options) {
    this.data.id = options.id;
    this.articleDetail(() => {
      this.setData({ full_loading: false });
    });
  },
  articleDetail(complete) {
    app.ajax('api/articleDetail', { id: this.data.id }, res => {
      this.setData({ article: res });

      let rich_text = app.rich_handle(res.content);
      WxParse.wxParse('rich_text', 'html', rich_text, this);
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  }
});