const app = getApp();

Page({
  data: {
    page: 1,  // 1.计算器 2.roll点

    blood1: 30,
    blood2: 30,
    round1: 0,
    round2: 0,

    roll1: 0,
    roll2: 0,
    roll_no: 0,  // 第一次点的roll点是哪个
    when_roll: false,

    blood1_bg: '',
    blood2_bg: ''
  },
  onLoad() {
    this.setData({
      blood1_bg: app.common.blood1,
      blood2_bg: app.common.blood2
    })
  },
  // 返回
  back() {
    wx.navigateBack({ delta: 1 });
  },
  // 血量改变
  blood_change(e) {
    let site = e.currentTarget.dataset.side;
    let num = e.currentTarget.dataset.num;

    if (site === 1) {
      this.data.blood1 += num;
      if (this.data.blood1 < 0) {
        this.data.blood1 = 0;
      } else if (this.data.blood1 > 999) {
        this.data.blood1 = 999;
      }
      this.setData({ blood1: this.data.blood1 });
    } else {
      this.data.blood2 += num;
      if (this.data.blood2 < 0) {
        this.data.blood2 = 0;
      } else if (this.data.blood2 > 999) {
        this.data.blood2 = 999;
      }
      this.setData({ blood2: this.data.blood2 });
    }
  },
  // 回合改变
  round_change(e) {
    let site = e.currentTarget.dataset.side;
    let num = e.currentTarget.dataset.num;

    if (site === 1) {
      this.data.round1 += num;
      if (this.data.round1 < 0) {
        this.data.round1 = 0;
      } else if (this.data.round1 > 99) {
        this.data.round1 = 99;
      }
      this.setData({ round1: this.data.round1 });
    } else {
      this.data.round2 += num;
      if (this.data.round2 < 0) {
        this.data.round2 = 0;
      } else if (this.data.round2 > 99) {
        this.data.round2 = 99;
      }
      this.setData({ round2: this.data.round2 });
    }
  },
  // 重置比分
  reset() {
    app.confirm('是否重置比分？', () => {
      this.setData({
        blood1: 30,
        blood2: 30,
        round1: 0,
        round2: 0
      });
    });
  },
  // 切换页面
  toggle_page() {
    if (this.data.page === 1) {
      this.setData({ page: 2 });
    } else {
      this.setData({
        roll1: 0,
        roll2: 0,
        roll_no: 0,
        when_roll: false,
        page: 1
      });
    }
  },
  // roll点
  roll(e) {
    if (!this.data.when_roll) {
      let no = e.currentTarget.dataset.num;

      if (this.data.roll_no === 0) {
        // 第一次roll点
        this._roll_exe(no);
      } else {
        switch (this.data.roll_no) {
          case 1:
            if (no === 3) {
              this._roll_exe(no);
            }
            break;
          case 2:
            if (no === 4) {
              this._roll_exe(no);
            }
            break;
          case 3:
            if (no === 1) {
              this._roll_exe(no);
            }
            break;
          case 4:
            if (no === 2) {
              this._roll_exe(no);
            }
            break;
        }
      }
    }
  },
  // 执行roll点
  _roll_exe(no) {
    this.setData({ when_roll: true });

    let roll_field = '';
    let max = 0;
    switch (no) {
      case 1:
        roll_field = 'roll1';
        max = 6;
        break;
      case 2:
        roll_field = 'roll1';
        max = 2;
        break;
      case 3:
        roll_field = 'roll2';
        max = 6;
        break;
      case 4:
        roll_field = 'roll2';
        max = 2;
        break;
    }

    if (this.data.roll_no === 0) {
      this.setData({ [roll_field === 'roll1' ? 'roll2' : 'roll1']: 0 });
    }

    let seed = setInterval(() => {
      let temp_roll_value = Math.floor(Math.random() * max) + 1;
      if ([2, 4].indexOf(no) !== -1) {
        temp_roll_value = temp_roll_value === 1 ? '正' : '反';
      }
      this.setData({ [roll_field]: temp_roll_value });
    }, 20);

    setTimeout(() => {
      clearInterval(seed);
      if (this.data.roll_no === 0) {
        this.setData({
          when_roll: false,
          roll_no: no
        });
      } else {
        this.setData({
          when_roll: false,
          roll_no: 0
        });
      }
    }, 1000);
  }
});