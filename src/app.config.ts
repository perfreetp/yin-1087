export default defineAppConfig({
  pages: [
    'pages/migrate/index',
    'pages/select/index',
    'pages/progress/index',
    'pages/backup/index',
    'pages/recovery/index',
    'pages/family-detail/index',
    'pages/report/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#28A745',
    navigationBarTitleText: '家庭换机助手',
    navigationBarTextStyle: 'white',
    backgroundColor: '#F0F7F4'
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#28A745',
    backgroundColor: '#FFFFFF',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/migrate/index',
        text: '换机向导'
      },
      {
        pagePath: 'pages/select/index',
        text: '资料选择'
      },
      {
        pagePath: 'pages/progress/index',
        text: '传输进度'
      },
      {
        pagePath: 'pages/backup/index',
        text: '家庭备份'
      },
      {
        pagePath: 'pages/recovery/index',
        text: '找回中心'
      }
    ]
  }
})
