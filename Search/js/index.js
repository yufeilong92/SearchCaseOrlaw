//刷新监控
var isRefresh = false;
//保存cookie名字
var saveCookieName = "indexcookie";
//防止历史重复添加
var isShowHistory = true;
//历史按钮点击正常状态
var onClickBtnbg_1 = "background: #C7C7C7;";
//历史按钮点击点后状态
var onClickBtnbg_2 = "background: #66CCFF;";

//搜素条件一（文件类型）
var searchCaseItme1 = "";
//数据源
var arraylist = new Array;
//检索后得数据源
var searchLists = new Array;
//默认加载10个
var number = 10;
//无条件时是否显示
var isShowEmptyView = false;
//历史选择事项
var historyItem = "";
//原件选择事项
var originalItem = "";
//文书选择事项
var bookItem = "";

(function() {

	//	var body = $("#refreshbody");
	var body = $(document.body)
	downRefresh(body);
	//  foushingDate (body);
	//加载更多数据
	loadMoreing();
	getjsonData(false) 
	
	$("#input_search_box").bind('input propertychange',function(){
                //做一些事情
                var val = $(this).val();              
                console.log(val);
                if (val=="") {
                	$("#textclear").css("display","none")
                }else{
                	$("#textclear").css("display","inline")
                }
                
            })
		 
})()


//类型点击
$("#span_case_type").click(function() {

	var parent = showOrHidden();
	if(typeof(parent) == "undefined") {
		return;
	}
//	var a = ['司法案例', '法律法规', '合同范本'];
	var a = ['司法案例', '法律法规'];
	$.each(a, function(i, n) {
		console.log(i + ":" + n)
		var nodeli = document.createElement("li");
		var nodevla = document.createTextNode(n);
		nodeli.setAttribute("id", "addcase");
		nodeli.setAttribute("class", "li_icon")
		nodeli.setAttribute("value", n)
		nodeli.setAttribute("style", "list-style-type: none;")
		nodeli.appendChild(nodevla)
		parent.appendChild(nodeli);

	})

	var b = $("li[id='addcase']");
	for(var i = 0; i < b.length; i++) {
		for(var i = 0; i < b.length; i++) {
			if(b.get(i).tagName == "LI") {
				b.get(i).onclick = function() { //增加单击事件
					console.log("=====");
					document.getElementById("span_case_type").innerHTML = this.innerHTML;
					showOrHidden()

					var dispaly = document.getElementById("nowlyView").style.display
					if(dispaly == "block") {
						return;
					} else {
						refreshBindData(arraylist, true);
					}

				}
			}
		}
	}

})
$("#clearnewly").click(function() {
	newlyHistoryBodyIsShow(false);

})
//历史记录布局
function newlyHistoryBodyIsShow(isShow) {
	var newlybody = document.getElementById("newbody");
	newlybody.style.display = isShow ? "block" : "none";
	if(!isShow) {
		clearCookie(saveCookieName);
	}
}
//显示类型案例view
function showOrHidden() {
	var folatview = document.getElementById("folatCase")
	var parent = document.getElementById("ui_case_type");
	if(folatview.style.display == "none") {
		folatview.style.display = "block";

	} else {
		folatview.style.display = "none";
		$("#ui_case_type").empty();
		return;
	}
	return parent;
}
//搜索事件
$('#js_img_search').click(function() {
	searchEvent();
})
//按钮事件
function keyEvenType(even) {

	var key = even.keyCode;
	if(key != 13) {
		return;
	}
	searchEvent();

}
//搜索触发事件
function searchEvent() {
	var casetype = $("#span_case_type").text();
	if(casetype == "案件类型") {
		casetype = "";
	}
	var input_cotent = $('#input_search_box').val();
	if(InputIsEmpty(input_cotent)) {
		return;
	}
	//	保存记录
	savacookie(saveCookieName, input_cotent, "/", 30);
	isShowHistory = true;
	inputNofocus();
//	console.log("你选择文书类型为：" + searchCaseItme1);
//	console.log("你选择案件类型为：" + casetype);
//	console.log(input_cotent + "输入框的值");
	refreshData(input_cotent, "");

}
//更具搜索显示内容
function refreshData(search1, search2) {
	console.log(arraylist.length)
	if(arraylist.length <= 0) {

		return;
	}
	var a = 0;
	searchLists = clearArrayList(searchLists);
	$.each(arraylist, function(i, item) {
		var casename = item.caseName;
		//		console.log(casename + "||搜素条件==" + search1);
		if(casename.indexOf(search1) >= 0) {
			searchLists[a] = item;
			console.log(item.caseName);
			a++;
		}
	})
	//	console.log(searchLists.length + "||a==" + a)
	refreshBindData(searchLists, true);

}
//刷新数据绑定
function refreshBindData(list, isShowLoadMore) {
	//刷新数据
	if(list.length <= 0) {
		$("#weui-cellshear").empty();
		showOrHiddenView(true);
		isShowEmpty(true);
		isShowEmptyView = true;
		return;
	} else {
		showOrHiddenView(false);
		isShowEmpty(false);
		isShowEmptyView = false;
	}
	//	console.log(list.length + "搜索后数据长度");
	var parent = document.getElementById("weui-cellshear");
	$("#weui-cellshear").empty();
	$.each(list, function(i, item) {
		console.log(item);
		//	console.log(item.caseName);
		bindviewdate(parent, i, item);

	})
	loadMoreIsHidden(isShowLoadMore);
}

//无数据情况显示
function isShowEmpty(isshow) {
	var showEmpty = document.getElementById("showEmpty");
	showEmpty.style.display = isshow ? "block" : "none";
}

function InputIsEmpty(str) {
	if(typeof(str) == "undefined" || str == "") {
		$.toast("输入内容不能为空", "text");
		return true;
	} else {
		return false;
	}

}
//输入框获取焦点事件处理
function inputfocus() {
	//展开和取消按钮
	isFocusShow(true);
	//主布局
	showOrHiddenView(true);
	//历史布局
	newlyViewShowOrHidden(true);
	//不符合条件布局
	if(isShowEmptyView) {
		isShowEmpty(false);
	}

};
//输入框获取焦点事件处理
function inputNofocus() {

	isFocusShow(false);
	showOrHiddenView(false);
	newlyViewShowOrHidden(false);
	if(isShowEmptyView) {
		isShowEmpty(true);
	}

};

//是否获取焦点 --取消/展示按钮
function isFocusShow(isFocus) {
	var cancelbox = document.getElementById("cancelBox")
	var showcase = document.getElementById("showCase");

	cancelbox.style.display = isFocus ? "block" : "none";
	showcase.style.display = isFocus ? "none" : "block";
}

//body隐藏与显示
function showOrHiddenView(isFocus) {
	var RefreshView = document.getElementById("weui-cellshear");

	RefreshView.style.display = isFocus ? "none" : "block";
	loadMoreIsHidden(isFocus);

}
//加载body是否隐藏
function loadMoreIsHidden(isFocus) {
	var LoadView = document.getElementById("loadboy");
	LoadView.style.display = isFocus ? "none" : "block";
}
//推荐布局显示or隐藏
function newlyViewShowOrHidden(isFocus) {
	var newly = document.getElementById("nowlyView");
	newly.style.display = isFocus ? "block" : "none";
	if(!isFocus) {
		$("#historyView").empty();
		isShowHistory = true;
		return;
	}
	if(!isShowHistory) {
		return;
	}
	isShowHistory = false;
	bindhistorylistData();
	bindHotSearchData();
	bindDocumentTypeDate();

}
//绑定历史数据
function bindhistorylistData() {

	var historyList = getArrayCookieData(saveCookieName);

	if(historyList.length <= 0) {
		newlyHistoryBodyIsShow(false);
		$("#historyView").empty();

		return;
	}

	newlyHistoryBodyIsShow(true);
	var historyparent = document.getElementById("historyView")
	$.each(historyList, function(i, item) {
		console.log(item);
		var li_em = document.createElement("li");
		var value = document.createTextNode(item)
		li_em.setAttribute("class", "Hot_search");
		li_em.setAttribute("id", "history_id" + i);
		li_em.appendChild(value);
		historyparent.appendChild(li_em);

	})

	var items = $("li[id^='history_id']");
	onclikBg(items, null);

}
//绑定搜索数据
function bindHotSearchData() {
	var a = ['两高指导性案例', '最高院公布案例', '两高公报案例', '两高发布典型案例', '审判指导参考', '中国审判案例要览', '人民法院案例选编 ', '判案大系', '两高部门及研究机构案例', '人民法院报指导案例', '各省发布典型案例', '其他案例选编'];
	var caseParent = document.getElementById("ui_type_parent");

	$("#ui_type_parent").empty();
	$.each(a, function(i, item) {
		var li_em = document.createElement("li");
		var item_val = document.createTextNode(item);
		li_em.setAttribute("class", "Hot_search");
		li_em.setAttribute("id", "case_id" + i);
		li_em.appendChild(item_val);
		caseParent.appendChild(li_em);

	})
	var casebtn = $("li[id^='case_id']")

	onclikBg_Case(casebtn, null);

}

//文书类型数据绑定
function bindDocumentTypeDate() {
	var a = ["裁决书", "裁定书", "调节书", "支付令", "其他", ]
	var dcmParent = document.getElementById("ui_Document_parent");
	$("#ui_Document_parent").empty();
	$.each(a, function(i, item) {
		var li_em = document.createElement("li");
		var item_val = document.createTextNode(item);
		li_em.setAttribute("class", "Hot_search");
		li_em.setAttribute("id", "doucment_id");
		li_em.appendChild(item_val);
		dcmParent.appendChild(li_em);

	})
	var dcmitme = $("li[id='doucment_id']");
	onclikBg_Document(dcmitme, null);

}

//设置背景点击颜色
function onclikBg_Case(items, j) {
	if(items.length <= 0) {
		return;
	}
	for(var i = 0; i < items.length; i++) {
		if(items.get(i).tagName = "li") {

			if(j == i) {

				items.get(i).setAttribute("style", onClickBtnbg_2);
			} else {
				items.get(i).setAttribute("style", onClickBtnbg_1);
			}
			items.get(i).onclick = function() {
				var a = this.style.background;

				if(originalItem != "" && originalItem != null &&
					originalItem == a) {
					onclikBg_Case(items, null);
					cleartext();
					originalItem = "";

				} else {
					document.getElementById("input_search_box").value = this.innerHTML;
					onclikBg_Case(items, $(this).index());
					var historyitems = $("li[id^='history_id']");
					onclikBg(historyitems, null);
					originalItem = this.style.background;
				}

			}

		}

	}
}
//设置背景点击颜色
function onclikBg_Document(items, j) {
	if(items.length <= 0) {
		return;
	}
	for(var i = 0; i < items.length; i++) {
		if(items.get(i).tagName = "li") {

			if(j == i) {

				items.get(i).setAttribute("style", onClickBtnbg_2);
			} else {
				items.get(i).setAttribute("style", onClickBtnbg_1);
			}

			items.get(i).onclick = function() {
				var a = this.style.background;

				if(bookItem != "" && bookItem != "" &&
					bookItem == a) {
					searchCaseItme1 = "";
					onclikBg_Document(items, null);
					bookItem = "";

				} else {

					searchCaseItme1 = this.innerHTML;
					onclikBg_Document(items, $(this).index());
					bookItem = this.style.background;
				}

			}

		}

	}
}
//设置背景点击颜色
function onclikBg(items, j) {
	if(items.length <= 0) {
		return;
	}
	for(var i = 0; i < items.length; i++) {
		if(items.get(i).tagName = "li") {

			if(j == i) {

				items.get(i).setAttribute("style", onClickBtnbg_2);
			} else {
				items.get(i).setAttribute("style", onClickBtnbg_1);
			}
			items.get(i).onclick = function() {
				var a = this.style.background;
				if(historyItem != "" && historyItem != null &&
					historyItem == a) {
					onclikBg(items, null);
					var casebtn = $("li[id^='case_id']");
					onclikBg_Case(casebtn, null);
					cleartext();
					historyItem = "";

				} else {

					document.getElementById("input_search_box").value = this.innerHTML;
					onclikBg(items, $(this).index());
					var casebtn = $("li[id^='case_id']");
					onclikBg_Case(casebtn, null);
					historyItem = this.style.background;
				}

			}

		}

	}
}
//取消处理
function cancel() {
	inputNofocus()
	cleartext();
}

function showHistory() {
	inputfocus();

}
//清除图标处理
function cleartext() {
	document.getElementById("input_search_box").value = "";
}

//刷新开始
function downRefresh(body) {

	body.pullToRefresh();
	var parent = document.getElementById("weui-cellshear");
	var path = getjsonPath(false);
//	getjsonData(path, parent);
	getjson(path, parent);
	doneRefresh(body);

}
//刷新完成执行
function doneRefresh(body) {

	body.on("pull-to-refresh", function() {
		setTimeout(function() {
			body.pullToRefreshDone();

		}, 2000);
	});

}

function loadMoreing() {
	var loading = false;
	var a = 0;
	$("#showloadOver").hide();
	var bodyload = $(document.body)
	bodyload.infinite().on("infinite", function() {
		if(loading) return;
		loading = true;
		//		console.log("加载中");
		setTimeout(function() {
			var parent = document.getElementById("weui-cellshear");
			var path = getjsonPath(true);
//			getjsonData(path, parent);	
			getjson(path, parent);

			loading = false;
			a++;
			//			console.log('加载完成');
			if(a >= 1) {
				bodyload.destroyInfinite();
				console.log("加载框消失");
				$("#showloading").hide();
				$("#showloadOver").show();
				$("#showloadOver").delay(2000).hide(0)

			} else {
				bodyload.infinite();
				console.log("加载框初始化");
			}
		}, 2000);
	});

};

function getjsonPath(isLoad) {
	return isLoad ? "json/lawcasepage2.json" : "json/lawcasepage1.json";


}

function getjsonData(isFalse,parent) {

    $.ajax({
    	url:getJsonPathData(isFalse),
        type:"GET",
    	async:false,
    	dataType:"json",
    	success:function (data) {
    		console.log(data.data);
    		$.each(data,function (i,items) {
    			
			var isnext = false;
			if(i == "result") {
				//				处理请求失败
				if(items.code != 0) {
					$.toast(items.message, "text");
					isnext = true;
					return;
				}
			}
			if(isnext) {
				return;
			}
		
			if(i == "data") {

				addList(items.list);
			var parent = document.getElementById("weui-cellshear");
				$.each(items.list, function(j, item) {
			
					bindviewdate(parent, j, item);

				});

			}
    		});

    		  
    	},
    	error:function (data) {
    	
    		console.log("错误");
    	}
    	
    })

}


function getJsonPathData(isFalse) {
	return isFalse ? "http://192.168.110.9:8080/demo/website/yfl_demo/data/lawcasepage3.map" : "http://192.168.110.9:8080/demo/website/yfl_demo/data/lawcasepage1.map";

}

//读取json数据
function getjson(path, parent) {
	$.getJSON(path, function(data) {
	
		$.each(data, function(i, items) {
			var isnext = false;
			if(i == "result") {
				//				处理请求失败
				if(items.code != 0) {
					$.toast(items.message, "text");
					isnext = true;
					return;
				}
			}
			if(isnext) {
				return;
			}
		
			if(i == "data") {

				addList(items.list);
				$.each(items.list, function(j, item) {
					bindviewdate(parent, j, item);

				});

			}
		})

	})
}

//获取json数据并且绑定view
function bindviewdate(parent, j, item) {
	var div1 = document.createElement("div");
	div1.setAttribute("class", "weui-cell");
	var div2 = document.createElement("div");
	div2.setAttribute("class", "weui-cell__bd");
	var p1 = document.createElement("p");
	p1.setAttribute("class", "case_title");

	p1.innerHTML = item.caseName;
	var p2 = document.createElement("p");
	var span1 = document.createElement("span");
	span1.setAttribute("class", "text_color_blue")
	span1.innerHTML = "受理单位:";
	var span2 = document.createElement("span");
	span2.innerHTML = item.courtName;
	var p3 = document.createElement("p");
	var span3 = document.createElement("span");
	span3.setAttribute("class", "text_color_blue")
	span3.innerHTML = "案件号:";
	var span3_1 = document.createElement('span');
	span3_1.innerHTML = item.fileNumber;
	var p4 = document.createElement("p");
	var span4 = document.createElement("span");
	span4.setAttribute("class", "text_color_blue")
	span4.innerHTML = "受理时间:";
	var span4_1 = document.createElement("span");
	span4_1.innerHTML = item.judgement;
	div1.appendChild(div2);

	div2.appendChild(p1);

	div2.appendChild(p2);
	p2.appendChild(span1);
	p2.appendChild(span2);

	div2.appendChild(p3);
	p3.appendChild(span3);
	p3.appendChild(span3_1);

	div2.appendChild(p4);
	p4.appendChild(span4);
	p4.appendChild(span4_1);

	parent.appendChild(div1);

}

function clearArrayList(list) {

	if(list.length >= 0) {
		list = [];
	}
	return list;
}

function addList(list) {
	if(arraylist.length <= 0) {
		arraylist = list;
	} else {
		arraylist = arraylist.concat(list);
	}
	//	return arraylist;

}