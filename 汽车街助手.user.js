// ==UserScript==
// @name         汽车街助手
// @namespace    http://tampermonkey.net/
// @version      20221214
// @description  汽车街助手杂项，想干啥就干啥
// @author       qingri.cong
// @match        http://*.autostreets.com/*
// @require      https://ajax.aspnetcdn.com/ajax/jQuery/jquery-3.5.1.min.js
// @require      https://cdn.jsdelivr.net/npm/blueimp-md5@2.9.0
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_openInTab
// ==/UserScript==
var study_css = ".egg_study_btn{outline:0;border:0;position:fixed;top:5px;left:5px;padding:8px 20px;border-radius:10px;cursor:pointer;background-color:#fff;color:#d90609;font-size:18px;font-weight:bold;text-align:center;box-shadow:0 0 9px #666777}.egg_manual_btn{transition:0.5s;outline:none;border:none;padding:12px 20px;border-radius:10px;cursor:pointer;background-color:#e3484b;color:rgb(255,255,255);font-size:18px;font-weight:bold;text-align:center;}.egg_auto_btn{transition:0.5s;outline:none;border:none;padding:12px 20px;border-radius:10px;cursor:pointer;background-color:#666777;color:rgb(255,255,255);font-size:18px;font-weight:bold;text-align:center;}.egg_setting_box{position:fixed;top:70px;left:5px;padding:12px 20px;border-radius:10px;background-color:#fff;box-shadow:0 0 9px #666777}.egg_setting_item{margin-top:5px;height:30px;width:140px;font-size:16px;display:flex;justify-items:center;justify-content:space-between}input[type='checkbox'].egg_setting_switch{cursor:pointer;margin:0;outline:0;appearance:none;-webkit-appearance:none;-moz-appearance:none;position:relative;width:40px;height:22px;background:#ccc;border-radius:50px;transition:border-color .3s,background-color .3s}input[type='checkbox'].egg_setting_switch::after{content:'';display:inline-block;width:1rem;height:1rem;border-radius:50%;background:#fff;box-shadow:0,0,2px,#999;transition:.4s;top:3px;position:absolute;left:3px}input[type='checkbox'].egg_setting_switch:checked{background:#fd5052}input[type='checkbox'].egg_setting_switch:checked::after{content:'';position:absolute;left:55%;top:3px}";
var create_new_car_css = ".create_new_car{outline:0;border:0;top:5px;left:5px;padding:6px 16px;;margin:16px 0 0 20px;border-radius:10px;cursor:pointer;background-color:#fff;color:#d90609;font-size:18px;font-weight:bold;text-align:center;box-shadow:0 0 9px #666777}.egg_manual_btn{transition:0.5s;outline:none;border:none;padding:12px 20px;border-radius:10px;cursor:pointer;background-color:#e3484b;color:rgb(255,255,255);font-size:18px;font-weight:bold;text-align:center;}.egg_auto_btn{transition:0.5s;outline:none;border:none;padding:12px 20px;border-radius:10px;cursor:pointer;background-color:#666777;color:rgb(255,255,255);font-size:18px;font-weight:bold;text-align:center;}.egg_setting_box{position:fixed;top:70px;left:5px;padding:12px 20px;border-radius:10px;background-color:#fff;box-shadow:0 0 9px #666777}.egg_setting_item{margin-top:5px;height:30px;width:140px;font-size:16px;display:flex;justify-items:center;justify-content:space-between}input[type='checkbox'].egg_setting_switch{cursor:pointer;margin:0;outline:0;appearance:none;-webkit-appearance:none;-moz-appearance:none;position:relative;width:40px;height:22px;background:#ccc;border-radius:50px;transition:border-color .3s,background-color .3s}input[type='checkbox'].egg_setting_switch::after{content:'';display:inline-block;width:1rem;height:1rem;border-radius:50%;background:#fff;box-shadow:0,0,2px,#999;transition:.4s;top:3px;position:absolute;left:3px}input[type='checkbox'].egg_setting_switch:checked{background:#fd5052}input[type='checkbox'].egg_setting_switch:checked::after{content:'';position:absolute;left:55%;top:3px}";

var study_pop_css = "*{ margin: 0; padding: 0; }.popup-wrap{ position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, .6);align-items: center; justify-content: center; display: flex; }.popup-inner{ width:800px; height: 600px; background-color: #fff; display: flex; flex-direction: column; }.popup-head{ padding: 10px 16px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid#ddd }.popup-head h2{ font-size: 16px; font-weight: 400; }.popup-head button{ font-size: 14px; font-weight: 400; padding: 6px 16px; cursor: pointer; }.popup-content{ padding: 16px; font-size: 14px; color: #333;flex: 1; overflow-y: auto; }";

GM_addStyle(study_css);
GM_addStyle(create_new_car_css);
GM_addStyle(study_pop_css);

//获取当前日期a 
var currDate = new Date().toISOString().split('T')[0];

var JsonReturns = [];
//配置
var settings = [];

//默认情况下, chrome 只允许 window.close 关闭 window.open 打开的窗口,所以我们就要用window.open命令,在原地网页打开自身窗口再关上,就可以成功关闭了
function closeWin() {
    try {
         window.opener = window;
         var win = window.open("","_self");
         win.close();
         top.close();
    } catch (e) {}
}

$(document).ready(async function () {
   let url = window.location.href;
    let url_splits = url.split('/');
    //进入http://*.autostreets.com/* 页面即做一次请求，如果DB中有相关配置，则自动生成组件
    var res = await getHttpData(location.origin + location.pathname)
    //.then(res => {
        //
   // }).catch(() => {
        //
    //});
    console.log('res => ', res)
    // DB有相关配置,res.successful == true 即为表里有相关配置
    if(res.success == true){
        initSetting();
        //提前存储各按钮返回值
        JsonReturns[0]= res.tips_text;
        JsonReturns[1]= res.tips_sql;
        JsonReturns[2]= res.yuque_url;
        //创建"知识点"按钮
        createStartButton();
    }

    // 某些页面特殊配置
    switch(document.domain+document.location.pathname){
        case "admin-uc.autostreets.com/review":
            //todo
            initSetting();
            //创建"自建车辆"按钮
            createNewCar();
             break;
         case "xxxx":
              break;
        default:
            //todo
            createTip();//创建学习提示
            break;
    }
});



//创建学习提示
function createTip() {
    let tipInfo = document.createElement("div");
    //添加样式
    tipInfo.setAttribute("id", "studyTip");
    tipInfo.innerText = "当前页面暂无可参考的知识....";
    tipInfo.style.position = "fixed";
    tipInfo.style.bottom = "15px";
    tipInfo.style.left = "5px";
    tipInfo.style.padding = "12px 14px";
    tipInfo.style.border = "none";
    tipInfo.style.borderRadius = "10px";
    tipInfo.style.backgroundColor = "#222222";
    tipInfo.style.color = "#ffffff";
    tipInfo.style.fontSize = "14px";
    tipInfo.style.fontWeight = "bold";
    //插入节点
    let body = document.getElementsByTagName("body")[0];
    body.append(tipInfo)
}


//初始化配置
function initSetting() {
    try {
        let settingTemp = JSON.parse(GM_getValue('studySetting'));
        if (settingTemp != null) {
            settings = settingTemp;
        } else {
            settings = [true, true, true, true, true, true, true, false];
        }
    } catch (e) {
        //没有则直接初始化
        settings = [true, true, true, true, true, true, true, false];
    }
}

//点击手动学习按钮
function clickManualButton() {
    let manualButton = document.getElementById("manualButton");
    if (manualButton.innerText == "关闭自动答题") {
        manualButton.innerText = "开启自动答题";
        manualButton.className = "egg_manual_btn";
    } else {
        manualButton.innerText = "关闭自动答题";
        manualButton.className = "egg_auto_btn";
    }
}

//创建学习内容弹窗 page:哪个页面； btn_item_index第n个按钮
async function PopUpText(adminxxx,page,btn_item_index) {
    var url = "http://"+adminxxx+"/"+page;
    var resultData = "";
    var res = await getHttpData(url);
    switch(btn_item_index){
        case 0:
            resultData = res.tips_text;
            break;
        case 1:
            resultData = res.tips_sql;
            break;
         case 2:
            resultData = res.yuque_url;
            break;
   }
    return resultData.replace(/\r|\n/ig, '<br/>');
}

//根据页面初始化时从DB读取数据转存在了JsonReturns数组中读值
async function PopUpText2(btn_item_index) {
    return JsonReturns[btn_item_index].replace(/\r|\n/ig, '<br/>');
}

//创建学习内容弹窗 page:哪个页面； btn_item_index第n个按钮
async function createContentPopUp(btn_item_index) {
    let popUp = document.createElement("div");
    var baseInfo = "";
    baseInfo +="<div id = \"studyPopUpDiv\" class=\"popup-wrap\" display = \"block\">        <div class=\"popup-inner\">            <div class=\"popup-head\">                <h2>标题</h2>                <button id=\"close-study-popUp-btn\">关闭</button>            </div>            <div class=\"popup-content\">                <p id = \"popupContent\">1111111111111111</p>                            </div>        </div>    </div>";
    popUp.innerHTML = baseInfo;
    //插入节点
    let body = document.getElementsByTagName("body")[0];
    body.append(popUp);
    document.querySelector('#close-study-popUp-btn').addEventListener("click", clsePopUp, false);
    document.querySelector('#popupContent').innerHTML= await PopUpText2(btn_item_index);
}



//创建“开始学习”按钮和配置
function createStartButton() {
    let base = document.createElement("div");
    var baseInfo = "";
    baseInfo += "<form id=\"settingData\" class=\"egg_menu\" action=\"\" target=\"_blank\" onsubmit=\"return false\"><div  hidden=\"hidden\" class=\"egg_setting_box\"><div id = \"btn-egg=item1\" class=\"egg_setting_item\"><label>业务知识点</label>				</div>		<div id = \"btn-egg=item2\" class=\"egg_setting_item\"> <label>相关sql</label> </div><hr><a id = \"yuqueLink\" style=\"text-decoration: none;\" title=\"当前业务语雀知识点总结\" target=\"blank\" href=\"https://autostreets.yuque.com/staff-evgdxz/vdp49h\"><div style=\"color:#5F5F5F;font-size:14px;\" class=\"egg_setting_item_other\"><label style=\"cursor: pointer;\">更详细的语雀页面</label></div></a></div></form>";
    base.innerHTML = baseInfo;
    let body = document.getElementsByTagName("body")[0];
    body.append(base);
    //添加item的点击事件
    let items = document.getElementsByClassName("egg_setting_item");
    for (let i = 0; i < items.length; i++) {
        items[i].addEventListener("click", function(){ createContentPopUp(i)}, false);
    }
    // 语雀连接
    if(JsonReturns[2]==null){
        document.querySelector('#yuqueLink').addEventListener("click", function(){alert("该页面暂无详细指导文档。")}, false);
        document.querySelector('#yuqueLink').removeAttribute('href');
    }else{
        document.querySelector('#yuqueLink').href = JsonReturns[2];
    }
    let startButton = document.createElement("button");
    startButton.setAttribute("id", "startButton");
    startButton.innerText = "知识点Tip";
    startButton.className = "egg_study_btn egg_menu";
    //添加事件监听
    try {// Chrome、FireFox、Opera、Safari、IE9.0及其以上版本
        startButton.addEventListener("click", start, false);
    } catch (e) {
        try {// IE8.0及其以下版本
            startButton.attachEvent('onclick', start);
        } catch (e) {// 早期浏览器
            console.log("汽车街助手error: 按钮绑定事件失败")
        }
    }
    //插入节点
    body.append(startButton)
}

//创建“自动建车”按钮和配置
function createNewCar() {
    let startButton = document.createElement("button");
    startButton.setAttribute("id", "btn-createNewCar");
    startButton.innerText = "自建车辆";
    startButton.title="点击一次自建5辆车，只对测试、stage生效。";
    startButton.className = "create_new_car cls-createNewCar";
    startButton.addEventListener("click", fun_createNewCar, false);
    let btn_vin = document.getElementsByClassName('addbtn query_btn_2')[0];
    let parent = btn_vin.parentNode;
    parent.insertBefore(startButton, btn_vin);
}

//保存配置
function saveSetting() {
    let form = document.getElementById("settingData");
    let formData = new FormData(form);
    settings[0] = (formData.get('0') != null);
    settings[1] = (formData.get('1') != null);
    settings[6] = (formData.get('6') != null);
    settings[2] = (formData.get('2') != null);
    settings[5] = (formData.get('5') != null);
    settings[7] = (formData.get('7') != null);//运行时是否要隐藏
    GM_setValue('studySetting', JSON.stringify(settings));
}
//是否显示目录
function showMenu(isShow = true) {
    let items = document.getElementsByClassName("egg_menu");
    for (let i = 0; i < items.length; i++) {
        items[i].style.display = isShow ? "block" : "none";
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//开始
async function start() {
    //保存配置
    console.log("初始化...")
    saveSetting();
    let loggedBox = document.querySelectorAll("a[class='logged-link']")[0];
    console.log("检查是否登录...")
    ///alert("还没想好这地方要干啥");
    if (document.querySelector('.egg_setting_box').style.display == 'block'){
        document.querySelector('.egg_setting_box').style.display = 'none'
    }else{
        document.querySelector('.egg_setting_box').style.display = 'block'
    }

    return false;
}

//关闭弹窗
async function clsePopUp() {
    //保存配置
    document.getElementById("studyPopUpDiv").remove()
}

//http获取数据
async function getHttpData(url = '') {
    // url = 'http://10.50.10.33:8000/qcj/queryAutostreetsTips?url=admin-auction.autostreets.com/panel/123';
    url = `http://10.50.10.33:8000/qcj/queryAutostreetsTips?url=${url}`
    console.log('url => ', url)

  return await fetch(url, {
    method: 'get',
  }).then(res => res.json());
}

//自建新车
function fun_createNewCar() {
    let url_test = 'http://cinew.autostreets.com/job/JmeterJob/buildWithParameters?token=autoPublish&ScriptName=EQS-v4.0评估录入及审核&ThreadCount=5&Environment=84';
    let url_stage = 'http://cinew.autostreets.com/job/JmeterJob/buildWithParameters?token=autoPublish&ScriptName=EQS-v4.0评估录入及审核&ThreadCount=5&Environment=stage';
    //const response =  fetch(url);
    fetch(url_test, {
    method: 'get',
  }).then(res => res.json());

    fetch(url_stage, {
    method: 'get',
  }).then(res => res.json());

    alert("请求已发出，毋须重复操作！")
}


