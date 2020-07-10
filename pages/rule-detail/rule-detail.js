var WxParse = require('../../wxParse/wxParse.js');
const app = getApp();

Page({
  data: {
    id: 0
  },
  onLoad(options) {
    this.data.id = options.id;
    this.gameRule();
  },
  gameRule() {
    app.ajax('api/ruleDetail', {id: this.data.id}, res => {
      let rich_text = app.rich_handle(res.content);
      WxParse.wxParse('rich_text', 'html', rich_text, this);
    });
  }
});