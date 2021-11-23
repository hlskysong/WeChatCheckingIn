/**
 * 检查无障碍服务是否已经启用
 * auto.waitFor()则会在在无障碍服务启动后继续运行
 * https://docs.hamibot.com/reference/widgetsBasedAutomation
 */
const { chanUrl, barkUrl, stepInterval, quickChecking, checkingTime } =
  hamibot.env
auto.waitFor()

// 唤醒设备并解锁
// home()
device.wakeUp()
let { height, width } = device
let x = width / 2
let y1 = (height / 3) * 2
let y2 = height / 3
swipe(x, y1, x + 5, y2, 500)

sleep(3000)
toastLog('拉起企业微信,准备打卡。。。')
app.launch("com.tencent.wework");

let quick = false
if (quickChecking == 1 || quickChecking == '1') {
  quick = quickChecking * 1 == 1
  let checkingHour = checkingTime.split(':')[0]
  let checkingMin = checkingTime.split(':')[1]
  let currentHour = new Date().getHours()
  let currentMin = new Date().getMinutes()
  if (currentHour > checkingHour * 1) {
    // 迟到或者下班卡
    quick = false
  } else if (currentMin <= checkingMin * 1 && quick) {
    quick = true
  } else {
    // 迟到或者下班卡
    quick = false
  }
}

if (quick) {
  check()
} else {
  // 切换到 工作台
  stepClick('工作台')
  // 切换到打卡页
  stepClick('打卡')
}

function stepClick(matchStr) {
  console.log('正在匹配 --- ', matchStr)
  sleep(stepInterval)
  let step = text(matchStr).findOne(1000)
  if (step) {
    console.log('匹配成功')
    // let stepLeft = step.bounds().left + 15
    // let stepTop = step.bounds().top + 10
    // console.log(stepLeft, stepTop)
    if (matchStr !== '打卡') {
      // click(stepLeft, stepTop)
      while (!click(matchStr));
    } else {
      while (!click('打卡'));
      sleep(stepInterval)
      signAction()
    }
  } else if (matchStr == '打卡') {
    console.log('滑动屏幕再次匹配')
    let { height, width } = device
    let x = width / 2
    let y1 = (height / 3) * 2
    let y2 = height / 3
    let swipeResult = swipe(x, y1, x + 5, y2, 500)
    if (swipeResult) {
      sleep(stepInterval / 2)
      stepClick(matchStr)
    }
  } else {
    console.log('匹配失败,后退再次匹配')
    back()
    sleep(stepInterval)
    stepClick(matchStr)
  }
}

// 打卡
function signAction() {
  toastLog('signAction 开始执行')
  let signIn = text('上班打卡').findOne(1000)
  let signOut = text('下班打卡').findOne(1000)
  if (signIn) {
    let stepLeft = signIn.bounds().left + 10
    let stepTop = signIn.bounds().top + 10
    click(stepLeft, stepTop)
    check()
  } else if (signOut) {
    let stepLeft = signOut.bounds().left + 10
    let stepTop = signOut.bounds().top + 10
    click(stepLeft, stepTop)
    check()
  } else {
    toastLog('打卡未完成,正在检查打卡状态')
    check()
  }
}

// 判断打卡是否完成
function check() {
  sleep(stepInterval)
  let msg = ''
  let flagIn =
    textEndsWith('上班·正常').findOne(1000) ||
    textStartsWith('上班自动打卡·正常').findOne(1000)
  let flagIn2 = textStartsWith('迟到打卡').findOne(1000)
  let flagOut =
    textEndsWith('下班·正常').findOne(1000) ||
    textStartsWith('今日打卡已完成').findOne(1000)
  let flagInAdvance =
    textStartsWith('你早退了').findOne(1000) &&
    textEndsWith('确认打卡').findOne(1000)

  if (flagIn) {
    toastLog('打卡完成')
    msg = '上班打卡成功'
  } else if (flagIn2) {
    toastLog('打卡完成')
    msg = '迟到打卡 完成'
  } else if (flagOut) {
    toastLog('打卡完成')
    msg = '下班打卡成功'
  } else if (flagInAdvance) {
    toastLog('已经打过上班卡了!')
    msg = '已经打过上班卡了!'
  } else {
    toastLog('打卡失败!')
    msg = '打卡失败!'
  }

  let dd = new Date()
  let years = dd.getFullYear()
  let mouths = dd.getMonth() + 1
  let days = dd.getDate()
  let hours = dd.getHours()
  let minutes = dd.getMinutes()
  mouths = mouths < 10 ? '0' + mouths : mouths
  days = days < 10 ? '0' + days : days
  hours = hours < 10 ? '0' + hours : hours
  minutes = minutes < 10 ? '0' + minutes : minutes
  let formatDate =
    years + '-' + mouths + '-' + days + ' ' + hours + ':' + minutes

  if (chanUrl && chanUrl.trim() !== '') {
    let url = chanUrl + '?text=' + msg + formatDate
    http.get(url)
  }

  if (barkUrl && barkUrl.trim() !== '') {
    let url = barkUrl + msg + '/' + formatDate
    http.get(url)
  }

  hamibot.postMessage(formatDate + ' ' + msg)
  hamibot.exit()
}

// ----------------------------------------
// 下面是第一版
// ----------------------------------------
// sleep(1000)
// while (!click('工作台'));
// console.log('切换到工作台')

// sleep(1000)
// while (!click('打卡'));
// console.log('切换到打卡')

// sleep(1000)
// while (!click('班打卡')) sleep(1000)
// if (text('打卡成功').findOne()) {
//   toastLog('打卡成功')
// } else {
//   toastLog('打卡失败')
// }
