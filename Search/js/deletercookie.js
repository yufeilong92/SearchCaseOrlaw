var cookieName = "name"; //保存cookiede名字
var cookieCout = 10; //保存数量
//
//(function() {
//	$("#sava").click(function() {
//		var a = $("#input").val();
//		if(InputIsEmpty(a)) {
//			return;
//		}
//		console.log("输入值==" + a);
//		savacookie(cookieName, a, "/", 7);
//
//	});
//
//	$("#deletel").click(function() {
//		clearCookie();
//	});
//	$("#get").click(function() {
//      alert(11);
//		var array = getArrayCookieData(cookieName);
//		console.log(array);
//		$.each(array, function(i, item) {
//			console.log(i+"===" + item);
//		})
//	})
//
//})()
//保存cookie
function savacookie(cd_name, value, pathCok, isexpiress) {
	var cout = readCookie(cd_name);
	var lists = cout.split(";")
	
	 
	if(lists.length > cookieCout) {
		cookieReplaceData(cd_name, value, pathCok, isexpiress);
		return;
	}
	if (cd_name=="undefined"||cd_name==""||cd_name==null) {
		cd_name=cookieName;
	}

	if(pathCok == null || pathCok == "") {
		pathCok = "/";
	}
	if(isexpiress == null || isexpiress == "") {
		isexpiress = 7; //默认7天过期
	}
	
	 if (isSameValue(cd_name,value)){
	 	console.log("数据相同");
	 	return ;
	 }
//	 console.log("保存值为" + value + "名：" + cd_name);
	var oldCookie = readCookie(cd_name);
	if(typeof(oldCookie) == "undefined" || oldCookie == "") {
		oldCookie = "";
	}
	value = oldCookie + value + ";"
	
	$.cookie(cd_name, value, {　　
		path: pathCok,
		expiress: isexpiress
	});

	console.log(readCookie(cd_name));

}
function isSameValue(cd_name, value){
    var b=false;
    var list = readCookie(cd_name);
	var items = list.split(";");
	
	if(list.length<=0){
		return "";
	}
	for(var i = 0; i < items.length; i++) {
		var item = items[i].trim();
	    if(value==item){
	    	b=true;
	    }
	}
	return b;
	
}
function cookieReplaceData(cd_name, value, pathCok, isexpiress) {
	var oldData = readCookie(cd_name);
	var lists = oldData.split(";")
	if(lists.length < cookieCout + 1) {
		return;
	}
	var newData = ""
	for(var i = 0; i < lists.length; i++) {
		var item = lists[i].trim();
//		console.log(i + "遍历值为" + item);
		if(i == 0) {
			continue;
		} else {
			newData += item + ";";
		}
	}
	newData = newData + (value + ";")
	if(newData.length > 0) {
		newData = newData.substr(0, newData.length - 1);
	}

//	console.log("拼接新数据为:" + newData)

	if(pathCok == null || pathCok == "") {
		pathCok = "/";
	}
	if(isexpiress == null || isexpiress == "") {
		isexpiress = 7; //默认7天过期
	}
	$.cookie(cd_name, newData, {　　
		path: pathCok,
		expiress: isexpiress
	});
//	console.log("替换后的数据:" + readCookie(cd_name));
}

function getArrayCookieData(cd_Name) {
	var list = readCookie(cd_Name);
	var items = list.split(";");
	if(items.length < 0) {
		return "";
	}
//	console.log(items.length)
	var arrylist = new Array;
	for(var i = 0; i < items.length; i++) {
		var item = items[i].trim();
//		console.log(i+"与"+items.length);
		if(i == (items.length-1)) {
			continue;

		} else {
//		   console.log(item);
		    arrylist[i]=item;
		}
	}
	return arrylist;
}

//读取cookie
function readCookie(cd_name) {
//	console.log(cd_name+"222");
	var cokVal = $.cookie(cd_name);
	if(typeof(cokVal) == "undefined") {
		cokVal = "";
	}
	return cokVal;
}

//删除cookie
function clearCookie(cd_name) {
	if (cd_name=="undefind"||cd_name==""||cd_name==null) {
		cd_name=cookieName;
	}
	$.cookie(cd_name, "", {　　
		path: "/",
		expiress: -1
	});
	console.log("删除成功");
}

function InputIsEmpty(str) {
	if(typeof(str) == "undefined" || str == "") {
//		alert("输入框不能为空")
		$.toast("输入框不能为空");
		return true;
	} else {
		return false;
	}

}