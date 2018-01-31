// app properties
var $app = {};
$app.context = {
	root: window['contentPath'] != null ? window['contentPath']:'/'
}
var $ctx = $app.context.root;

// service properties
var $svc = {
	addpagenorest : $ctx + 'website/parse/addPageReadNumber.q4w',
	parserest : $ctx + 'website/parse/rest.q4w',
	updaterest : $ctx + 'website/crud/rest.q4w',
	uploadrest : $ctx + 'website/attachment/upload.q4w?',//上传附件地址 
	listfilerest : $ctx + 'website/attachment/listfile.q4w?',//附件列表地址 
	downloadrest : $ctx + 'website/attachment/download.q4w?oid=',
	readimgrest : $ctx + 'website/attachment/readimg.q4w?oid=',
	removefilerest : $ctx + 'website/attachment/removefile.q4w?oid='
}
var layer ;
var WebSiteInit = function(options) {
	// 判断站点类型
	var siteType = $website["siteType"]||"pc";
	// 如果站点是wx版本的，判断用户访问的类型
	if("wx" == siteType){
		var ua = navigator.userAgent.toLowerCase();
        var isWeixin = ua.indexOf('micromessenger') != -1;
        var isAndroid = ua.indexOf('android') != -1;
        var isIos = (ua.indexOf('iphone') != -1) || (ua.indexOf('ipad') != -1);
        if (!isWeixin && !isAndroid && !isIos) {
            document.head.innerHTML = '<title>抱歉，出错了</title><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=0"><link rel="stylesheet" type="text/css" href="/static/css/weui.css">';
            document.body.innerHTML = '<div class="weui_msg"><div class="weui_icon_area"><i class="weui_icon_info weui_icon_msg"></i></div><div class="weui_text_area"><h4 class="weui_msg_title">请在微信客户端打开链接</h4></div></div>';
            return ;
        }
	}else{
		$.WebSite.ajaxLoading(true);
	}
	
	layui.use('layer', function(){
        layer = layui.layer;
		if($page["loginFlag"]){
			if("wx" == siteType && $.WebSite.isWeixinOpen()){
				var user = $.WebSite.getUserInfo();
				if(user == null){
					var redirectUri =  encodeURIComponent($website["domain"] + "wechat/auth2.q4w?" + window.location.href);
					window.location.href="https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + $website["wxAppid"] + "&redirect_uri=" + redirectUri + "&response_type=code&scope=snsapi_userinfo&state=" + $page["id"] + "#wechat_redirect";
					return false;
				}
			}else if($.WebSite.getUser() == null) return false;	
		}
		var defaults = {
			pageId: $page.id||"",
			modules : $modules||[],
			logged: $website.loggedFlag||false
		};
		var options = $.extend(defaults, options);
	
		for(var moduleId in $modules){
			var item = $modules[moduleId];
			// 解析主动加载的模块
			if(item.activeLoadFlag === true){
				$.WebSite.parseModule(item, {});
			}else{
				$("#_view_" + item.randomId).hide();
			}
		}
		// 记录每页的读取数量
		if(options.logged){$.WebSite.addPageReadNumber(options.pageId);}
		window.setTimeout(function () {
			$.WebSite.ajaxLoading(false);
			// 执行模块加载完成后的方法
			onloadModuleMethods();
		}, 500);
    });
};
(function($) {
	"use strict";
	// 基础方法
	var base = {
		getData: function(opts){
            var opt = $.extend({
                cfg: null,
                param: null,
                type : "post",
				dataType : "json",
				async : false,
                rollback: null
            }, opts);
            
			if (opt.cfg) {
				var url = $website.dataParsePath || $svc.parserest;
				var postData = opt.param || {};
		        if (!/^http:\/\/[a-zA-Z0-9]+\.[a-zA-Z0-9]+[\/=\?%\-&_~`@[\]\':+!]*([^<>\"\"])*$/.test(opt.cfg)) {
		           $.extend(postData, {cfg:opt.cfg});
		        }else{
					$.extend(postData, {url:opt.cfg});
				}
				$.ajax({
					url : url,
					type : opt.type,
					dataType : opt.dataType,
					async : opt.async,
					data : $.WebSite.getParameter(postData),
					success : function(data) {
						if (data.code == 1) {
							if(opt.rollback){
								if(typeof opt.rollback === "function"){
									if(data.result== null && typeof data.description === "string"){
										try{
											opt.rollback($.parseJSON(data.description));
										}catch(e){
											$.WebSite.appendToView(item || item.randomId || "msg", "数据转换异常，" + e);
										}
									}
									
								}
							}
						} else {
							$.WebSite.appendToView(item || item.randomId || "msg", "请求异常：" + data.description, refreshFun);
						}
					},
					error : function(XMLHttpRequest, textStatus, errorThrown) {
						$.WebSite.appendToView(item || item.randomId || "msg", errorThrown, refreshFun);
					}
				});
			}
		},
		/**
		 * 解析模块
		 */
		parseModule : function(item, postData, refreshFun) {
			try {
				if(typeof item.parameter === "object"){
					$.extend(item.parameter, postData);
				} else if(item.parameter != ""){
					if($.isEmptyObject(postData)){
						$.extend(postData, eval("(" + (item.parameter||"{}") + ")"));
					}else{
						var v = eval("(" + (item.parameter||"{}") + ")");
						postData = $.extend(v, postData);
					}
				}
				if(typeof postData === "undefined"){
					postData = {};
				}
				// cfg不为空，表示到后台读取数据
				if (item.cfg) {
			        $.WebSite.getData({
			        	cfg: item.cfg,
			        	param: $.WebSite.getParameter(postData),
			        	rollback: function(result){
			        		if((!result)&&(item.cfg != "com.lawyee.japrf.parse.dto.PublicUserDsoDTO#currentUser")){
			        			document.head.innerHTML = '<title>抱歉，出错了</title><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=0"><link rel="stylesheet" type="text/css" href="/static/css/weui.css">';
								document.body.innerHTML = '<div class="weui_msg"><div class="weui_icon_area"><i class="weui_icon_info weui_icon_msg"></i></div><div class="weui_text_area"><h4 class="weui_msg_title">您所访问的页面不存在或数据已下线</h4></div></div>';
								return ;
			        		}
			        		$.extend(postData, result);
							$("body").data(item.randomId, postData);// 将模块数据存于body中，通过$("body").data(item.randomId)可以获取
							$.WebSite.appendToView(item.randomId || "msg", postData, refreshFun);
			        	}
			        });
				} else {
					$("body").data(item.randomId, postData);// 将模块数据存于body中，通过$("body").data(item.randomId)可以获取
					$.WebSite.appendToView(item.randomId || "msg", postData, refreshFun);
				}
			} catch (e) {
				$.WebSite.appendToView(item.randomId || "msg", e.message, refreshFun);
			}
		},
		/**
		 * 刷新模块
		 */
		refreshModule: function(moduleId, postData, refreshFun){
			var item = base.clone($modules[moduleId]);
			if(item){
				$.WebSite.parseModule(item, postData, refreshFun);
				if(typeof window['onloadMethod'+item.randomId] === "function"){
					window['onloadMethod'+item.randomId]();
				}
			}else{
				alert("模块【"+moduleId+"】的配置不存在。");
			}
		},
		/**
		 * 将数据解析的模板
		 */
		appendToView: function(randomId, data, refreshFun){
			if("msg" == randomId){
				$.WebSite.msg({
					msg : data,
					type: 2
				});
				return false;
			}
			if(typeof data === "object"){
				var gettpl = document.getElementById("_tpl_" + randomId).innerHTML;
				laytpl(gettpl).render(data, function(html){
					if(typeof refreshFun === "function"){
						refreshFun(html);
					}else{
						$('#_view_' + randomId).html(html).show();
					}
				});
			} else{
				$('#_view_' + randomId).html(data).show();
			}
		},
		/**
		 * 获取指定模块数据
		 * 
		 * @param randomId
		 *            模块编号
		 */
		getModuleData: function(randomId){
			return $("body").data(randomId);
		},
		/**
		 * 获取指定模块
		 * 
		 * @param randomId
		 *            模块编号
		 */
		getModule: function(randomId){
			return $("#_view_" + randomId);
		},
		/**
		 * 获取url中的参数
		 */
		getParameter : function(opts) {
			var result = {};
			var search = location.search.slice(1);
			var arr = search.split("&");
			for (var i = 0; i < arr.length; i++) {
				var ar = arr[i].split("=");
				result[ar[0]] = unescape(ar[1]);
			}
			
			if(typeof opts === "string"){
				return result[opts]||"";
			}
			$.extend(result, opts);
			return result;
		},
		/**
		 * 增加页面的访问数量
		 */
		addPageReadNumber: function(pageId){
			if(pageId){
				$.post($svc.addpagenorest,{pageId:pageId},function(){});
			}
		},
		/**
		 * 防止重复提交，遮盖层
		 * @param isShow true：打开，false：关闭
		 */
		ajaxLoading: function (isShow) {
            var $obj = top.$('#ajaxLoading_background');
            if (isShow) {
            	if($obj.length <= 0){
            		var _html = '<div id="ajaxLoading_background" style="cursor: progress; position: fixed; top: -50%; left: -50%; width: 200%; height: 200%; z-index: 10000; overflow: hidden; background: rgb(255, 255, 255);"><img src="data:image/gif;base64,R0lGODlhZAAJAKIFAM4xMc5jY86cnM7Ozv///////wAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh+QQFCgAHACwAAAAAZAAJAAADazi6S/zuNTnpiBRLDe31DiGO4UWK34mGatqypxvDpFzTo53jqzn7N+BO2FOVjLrii3hcInnN35OZjAanWKdWur12h1mu2DsGf5VlNHltTlvbbDV8Lq+/7dU8VE/d+0GAFhwMgxUZgYeCIAkAACH5BAUKAAcALAAAAAAJAAkAAAMRCLpM/kTBJ2cE9uY6OWQgkAAAIfkEBQoABwAsAAAAABMACQAAAyQYukvwEAZCK5nAVjD1dZ7TaVjIhaV3eqm2kqA6Wq3FMYwTRQkAIfkEBQoABwAsAAAAAB0ACQAAAzcoukvxEBJAaxUka4LD1h7wZQA2dqMzpWWKjiFrfu8Xj+2pwis+b7XN7ZOj7Ww9ImPpiEQmFksCACH5BAUKAAcALAAAAAAnAAkAAANLOLpL8hCSQGslIGs9iP9EJ4DfGJDeCaBYh4qsyaos4JIwKqM0arM50o7UI/1ejthkhqndQEHQEFQEHXFJ3ZLX9DG+jkhkYrFgNpsEACH5BAUKAAcALAoAAAAnAAkAAANLOLpL8hCSQGslIGs9iP9EJ4DfGJDeCaBYh4qsyaos4JIwKqM0arM50o7UI/1ejthkhqndQEHQEFQEHXFJ3ZLX9DG+jkhkYrFgNpsEACH5BAUKAAcALBQAAAAnAAkAAANLOLpL8hCSQGslIGs9iP9EJ4DfGJDeCaBYh4qsyaos4JIwKqM0arM50o7UI/1ejthkhqndQEHQEFQEHXFJ3ZLX9DG+jkhkYrFgNpsEACH5BAUKAAcALB4AAAAnAAkAAANLOLpL8hCSQGslIGs9iP9EJ4DfGJDeCaBYh4qsyaos4JIwKqM0arM50o7UI/1ejthkhqndQEHQEFQEHXFJ3ZLX9DG+jkhkYrFgNpsEACH5BAUKAAcALCgAAAAnAAkAAANLOLpL8hCSQGslIGs9iP9EJ4DfGJDeCaBYh4qsyaos4JIwKqM0arM50o7UI/1ejthkhqndQEHQEFQEHXFJ3ZLX9DG+jkhkYrFgNpsEACH5BAUKAAcALDIAAAAnAAkAAANLOLpL8hCSQGslIGs9iP9EJ4DfGJDeCaBYh4qsyaos4JIwKqM0arM50o7UI/1ejthkhqndQEHQEFQEHXFJ3ZLX9DG+jkhkYrFgNpsEACH5BAUKAAcALDwAAAAnAAkAAANLOLpL8hCSQGslIGs9iP9EJ4DfGJDeCaBYh4qsyaos4JIwKqM0arM50o7UI/1ejthkhqndQEHQEFQEHXFJ3ZLX9DG+jkhkYrFgNpsEACH5BAUKAAcALEYAAAAdAAkAAAM3OLpL8hCSQGsdJGuCxdZe8GUBNnajM6Vlio4ha37vF4/tqcIrPm+1ze2To+1sPSJj6YhEJhZLAgAh+QQFCgAHACxQAAAAEwAJAAADJDi6S/IQDkIrmcJWMfV1ntNpWMiFpXd6qbaSoDparcUxjBNFCQA7" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; margin: auto;" /></div>';
            	    top.$("body").append(_html);
            	}
                $obj.show();
            } else {
                $obj.fadeOut();
            }
        },
        /**
         * 带提示信息的防止重复提交，遮盖层
		 * @param opt json 对象 {isShow:true/false, msg: "提示文本"}
         */
        loading: function (ops) {//加载动画显示与否
        	if(top.$('#loading_background').length <= 0 ){
        		var _html = '<div id="loading_background" class="loading_background" style="top: -100px;cursor: wait;display: block;width: 100%;height: 100%;opacity: 0;filter: alpha(opacity=0);background: #fff;position: absolute;left: 0;z-index: 20000000;"></div>';
        	    top.$("body").append(_html);
        	}
        	if(top.$('#loading_manage').length <= 0 ){
        		var _html = '<div id="loading_manage" style="display: block; color: #666;font-size: 20px;position: absolute;border: 1px solid #bbb;width: auto;height: 80px;line-height: 78px;padding-left: 80px;background: #fff;cursor: pointer;border-radius: 8px;background-image: url('+"data:image/gif;base64,R0lGODlhPAA8ANU4AP7+/v39/fz8/Pv7+/r6+vf39/n5+fj4+MjIyPb29vX19cnJyfT09PHx8fLy8u3t7crKyubm5u/v7+zs7PPz8+vr6+np6efn5+jo6O7u7svLy/Dw8M3Nzc/Pz+rq6tDQ0MzMzNfX19HR0ePj487OztjY2OTk5OHh4dTU1N3d3eLi4uDg4NnZ2dbW1uXl5dvb29PT09/f39ra2tLS0tXV1d7e3tzc3P///9vtsgAAAAAAAAAAAAAAAAAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQFAAA4ACwAAAAAPAA8AAAG/8CbcEgsGo/IpHLJbDqf0Kh0Sq1ar9isdmsEeL03xOITOk0K3CcgIBgIAgEwQryAQDQlzCGdBAgMBANucHJ0dhogICImCXxEAAMGB4CBAm+FC3UaiBwcJCgYAo5/BQWTgAOEQwAEDA8mMiQgnSQdHykUaQMJvKYHBHFMChcltbYiLQ9bBgwMCgkFBgIAUAQWLB8fIjMwFVkGDhTNCgTUUwkj29wo3lYEDQ7hCgNYFSEwKCg0ElUDDhvwGNDLIkGGvhYvFEwBQEHChg0OCHCRwKJFiBAjAkhJkCGDBAl70jy4WIKFMigDMjx4kKGRIwwlWaQI6YTBhAkPGohydOCEDP8ZL9o1ETChQoUzjoZIePHCRgyJTRRY8OBBgsakNwSYsJEixQYnGTBYsKAQqxAJKWrUiNBkwIULYqGaNbAihl25SRJEiHAhg1kiFlYIZsBkgwsXERz8VXrihAp+SyqYmOxysQIVKkZ4YHJhhGcDi4UYGDH5ApMRmFXsXCzgMGImjRubWwxg714mggXP/gvg7VvcdmOs/hsAg3ELTFSorUHz74CxFiYwidDVRq7QB6h6+BrZho0X0kMrKFqB8BIHTGWYCH3DwYObzZEY+MniRfxRElQ+GJ5kBIsSJYRn1gEfZaBYEw+UcNEKAyUFAAMPgeQEATKE0EILAjoCTgMcXtXrBAYt0EBDCmg4EoAC8ThQohMFsJAPDC4kxQwFNHrohAcowADDDEJtMYACCjQDWhQCxDDDDMicpIUABSQAZAG7PUFBCCKIQIaSV5DSZAL8QfGAlR90AANyWRJwwAGlNEiFBWF2QAIHKlQWxRoEGCDJAWpWYYGbb4LQAgZ4NeHHAATUKc0WE8DQSSIahBBBWUusYYkggdiYBXqMamAHCCWMMAED5TziBRxstDHNKBF8sIkdmSwwxxyijlqqpXxcRgKrmbyKQBFfkBolVgdcEEKruvL6BXtGFFDBCSF04Cqy0EYr7bTUVmvttUMEAQAh+QQFAAA4ACwGAAYAMAAwAAAG/8CbcEgsCguTE2vGAXE6KJspczBar1hhJLRYQCAakJPU6XxEs1TFkG0bATcEovsNj8vnGQxVwhTcbQCCQnNeYGIcZGZoezQtMhMBgG8AAQGDCCAlJg8MBIIEChIXNTSNLSGbCpNDAQICloM3DG4JHjUtqCUsNQ2sAQMDr5asQwMPMbsyMi8SgAEEBMECcMVEBxgszDYpG20BBgbSA9XWRRIx3DU1DljgB+Hk5lcOKusxI39vBgUHBwSS5l2hcCLGihUWAhIZkKBAPwECszRYceKECl9EAiTYmIBAxDYPVKgYEcHjEAMMFCg4oPCjFQIWRpgwgfFGAAY4GQxw2YaCCf8XLjBAvGHAAQUKCcrxtBKgQoQIF2jdUOCgKpulWShcuIAhg80NDRo4GIr1CkwMFiwIMCBhwwapZbFIsODBQwEFGSRI0Bf3CoMKgBk4yED4al8rByYobpDhgeOdh60ccyyhguJIkZkSJlwXcOYrevWmTav0sxC3bi1gWN3SNICwYT1svWDStBABVR0wePA0QgLbxo4i3QDURTvgRHMaUDDTRAXkNw6oVBBshHUThj8HKLBRARwLIk/U/DzAYYIqNxpUXHGBbGQABPwVgDxgxIoYMbx9XmsAXjlk62CXGQADEBCOewackEIKNniQGTDRfFJEBjbY8EIzhxEYDEBGBBC7wQvLdBMXAK8IIMwVCdQgAwsl1KAfT5W48kppRGzAYgkhQLJUjK7QWMQDIYTQAg00RMCXOYIIEgsgDwxJAwowvFABZEgm6SNoMkAJwwwivGDBb20w4EIRshTDwApbiiDCBx2IYIMLDyjwCXwMTDBCCRogQKZAAljQwppsksBBExpo8EUXC8ghBwllFeACCmUISqihECCqqBx9GWCBDIKKUeihliLQQgTulXVASDLMAMIXEHwQwgkVHAlIEAAh+QQFAAA4ACwGAAYAMAAwAAAG/8CbcEgsCg+Pka0lEs1QstVlYzBar9jbAcPicEidz8cJQ9FaoZIqQ8i6i4pTRwMCfTthshldYslqFVVvWAIuHRAQdHYkYGMzZWdpfi82KxIBg0YNJQsLiBoaHS8RGQoDAAADCQ0eKjKTNik1GAWZRCQInYghEQpvSEqyMSsjFLY3ADcIuSgYbbYCEiY1wycqDoOoqMoxvsdDBhMr1iPFbgABAdvfVw4uKiMmLt5WAALp6uxYDBfyERaCjAQQcC+fvisKMESIcCFDsiIBBgwg+PDgFX4XMFhgUAQAAQISMVnM0kCjhwkDiAj4SEBAxZFWBjzw4KECRyEADOgkIBImlv8EFSpMyCBSwIGjBF76FLhhwoMHtW4YKFDggIClbhI8yJABG4AECaj2xGolmoSzERWADUj24oa3BAwwUKDgWdsrBRroLZCAgd+Ud68QcECYLoXDYwMTCXCYggLChJUqxunXr169kxHSVfD2bWYrYMGeRfuZCAC+YDdwzXC1tJAAVKs6ePrggOvXRw8QYDBhQgV6pQXoNGA0qIcNt28M+GhgIE0LHgB/TsUymQQLGDDc/BxRYuuEFy5MSBx4oIABRS0sdGEsMzqCrYU0cOHChAW75fGNJdCvXIbJqOCjyQgqqHBCA4ppY9BirZxATHttaSOZEAWYsEIMMYyAzV3rXEGuAYY1pGBJckRsEKINL7xggW36KBADAuxIYAOKr6zwgHSD8AfDMjB+00AMr5RQQggxVBBVFgy4QAOPy0TAjgImsDBkCzSg0EIMGEhQFyoEKPBAlBx0sgCPISDITgATvBAClSjAMIMIYnRAAgd1gIKImAhwYEJ8+mxRAgptvvkBHnPSaScEnXBwAnAjGVBBDW7CSagXIBxaQgQs3nWABC6kQMMHc5IAAwsqTHBkJkEAACH5BAUAADgALAYABgAwADAAAAb/QJxwSCwOM5Eai0ZrlVIjj4NgrFqvQsvrIxLNYKhmqMSSvWyRzQDLLiZGM1Lnw/2GW+PyOVVTZdptESIcHHJzXmBiZGY2fDErJg2AViwaICCFJDMpFxIJRAUOEy4xNY8nKiMVB5NDHh8QGpYcJRifbRIRK6gjJhgKrRELELEaLa1EDhi9LhERDIDCC8MQK8hFBBImzRe/bDcICNMdGNdVFBbdFhYFVzfv4SIV5lYJFeseD1RVAP03JPPoWSlQwUOFCZKM9Ft4QyAWexMmPLg15EaAi/0csmHw4EGGDQKIBBBwMUBDjVcENMggQUK7IQJiCgCAkk0BCRs2JMQRYIBP/5M12VDQ2cCAkAEEfgZlc6CBAwfAcBggQJXmUiwUslLgaaDrmqsPGYj1eaBsSLBXDDBQoKBrgQIHAqBNqSBBggMFEryd+1DvAbt2+V55+5YtW8FWypYVKxZxla5dtVKw6ljIDapdGTx1UJkIAKpJFTQYva8zAJ8DBBTIueFl55E/DbSUAK0zT5kAAmTY/aezxYsCGjroOIEi4twYhSSIWEGC6X4BKD8o6CGq4BsLKeOg4GHdg698sS8kMqACBgwXdqJ9J94IgwsXnG2dy/5dFSQuXFywHnRefSsGYOCCCSM8s1QFHyCAg31XMECgCipEUtMFJISDgHFWOADhCSvEMJ+BUQ4tYCECEQDiAIelQCHBWa1ggMI0OIRT4iQUjFBDDSnY8IIKDwCiQAQtQDDNNCRYcE0BF+T4ggwskKGCBRskAB4OGbggQwcaECPkAiU4lEEMSzYZQgs0oADDDCJ80EEHJHBwiSzEkOBCTR7YUEIJY5Z5ZpprtummLCSARcADJ5CpJ5pqskkICCxcIJgBG1wQAwswpPkBDS+M0OM1QQAAIfkEBQAAOAAsBgAGADAAMAAABv9AnHBILAoNG4yq9nrZairMgzEwWq9YnKESo7VCJZbMmarFVieVh5JtGwuRFgzlBYvJZrRqZLo0qm5ZGCgiM3N0XyVjNmVnaSYuLhEWDACBRg42HR+FhiEnHg0FQwIHDBIeLpARFxgWGwSXQxUwJJucNh6jbQQOFayuHg8HshgcHLYdLBWAlwEMDxYeFRMTu20XICDHJCMJskUDFBXUDxnXVxUaGtozFuBXCRnmGRIGWA0f6xowE/BYBzbU2+CgGREBLCBA0CDC3z8sBhpsaNDgmxEXCxYoxPCwzQGKDhzcI6KARMYFKzq6KeCAAgUFAYisQIBgAQoFKtsEUMCg50j/HDeC0ryQ0w0BBgoUFLAEFACAoLGKZgFQIIFVQE6d3pDqZkCCAgXu3QgQQCtXnWAPHHBKtuxZo2oNkBVAl+lbLAIM6KXL1+5dKwEICB4gYIBhv3+LABgsQLDgrYmt3DBs2IDjyHj56tWL+QrfUmqJdTbSNsABsAVijh4ytu0BqwkErGaddXGCpFFn1wYwICkDdKNrb+1JgYHq1UFvME1AIeTPzsmDHgnZoBLy6EICOJC4QTTmC9iHFNggQUID2ZEVwKApnVSDDPMYYI5BEwEHnEQKzKtm8e6F+giYYAQADlRDDXBSdbAATSGgVwQBD1TggQUT9CeVCCeR0AAWBUxotAEGHshXFAYfQHCSB20ogAEGF0TgggS5wZPAChooZOIlDLSoyggWOPCPBS2sYyM4Ku6owgkXbPBcPBiwwIE263yAIjgHTDDCkSvEYEYEEzhwjVcSXJDCDB2QcIw2LPj4UAMunJBlDSnY8IIMJYTQAg0owDCDCB98UOYxIkRQlAEZLBHnnCzUeWeee/JZ5gzenDXABhHIKUOiduKp554fvPBOZL14MEIKJdxJAwsxRJCBd5cEAQAh+QQFAAA4ACwGAAYAMAAwAAAG/8CbcEgsCgmUB8Y1GpkiloejIDBar9gbQeJK1WKrk8rpilwwFs8mEci6iwdP6mWzpcBishntqUwyCVVvWAITNiUsMnReYGMmZWd9Ew8PGQ0HAINGDCctIYiKNRcZDAYCAAABBAUMGxOTGRIbDQqCmjcZLDSenycPB28DCQ2xsw4UBLceMCgouzEZA7c3AQcUDQ3HDMlvHjMwzDQRBdNEAgXaDArSWQ8iIt8lE+VWBAzqCYFYFDQf7yUS6F0Rlq/AgTZGBNjo0OFDiwwCCRWYeIBbkQskSDD0EDHLAIMHTBVJMINDxhEd3QwIaYBApiEjQHDgECJByiwACOgkYOvAB/8QQC3cdKOKwIABLy9o0AAihMWhVwQcPSWkBISlEaASFcC1TQEIYDko0IqTq4A2FRYsgMCCrJtUAQIAOKF2AUq3WODKDYFA7Ty8eVEB6ICgMAPAgVEhHiS48cvFOAVDJhoX4eQrleVexmz28eUJhV8oCHB0gOXLIwojWAGgNLvNJVRXyLnT82IGGlSTG2Cgty3ILtQiaCFEgIEDFW3jJUCjbtYbAI5PfI0YQ10OwIR8zHdwsQIaYBecIBKgQAIFCgwsXgEWQoexRAigZ4AMMIalGiC4MAKAFYX/Tw01gQggLMXCb0MIwIADDmSjHlQPoMABUCI4gAUBDW4wCzk3LUO6wkwgVOCGARpKkMEDDFA3TQEjMJQRBxgMcoCJlEwgARvTDFCBDCJ84KJQmhywwQMTVOBBFNu8UUAFNcAwQ48foPDXLQQ0YOSRGFxwwQS0mILKOQ5UoEIJNKDg5JMpUCAQAApMYEGWEbhgwggqrBBDDSnY8AILJYTQQplmtmABguUMQIEHF8Rpggon2ImnnjLw6ScNJYyjlYITzMmoo3m+EGmfK0zwIF4DKCCBBSasgGcKK5jgQQOjahIEACH5BAUAADgALAYABgAwADAAAAb/wJtwSCwKBwmH5FGZPDINSoEQMFqv2NuAMolcMBZP8ynZNBqOBAGQbRcNEtfI5PJixM5MGU2hMNRVblgBEiMnKnN1X2F5ew5+DAoJBwOCVgkXMSuHcxcPUgOBAQIEBwkMkQkJBQdUlkMNJzU1micYDgRuAQQFq6wGrpYZLzYptBEOAq83AAMGBwfAwW0ZMi/EKRMGy0TNBtKhbRssLNYxEtxWAgMEAwMCbFcKLyUlLDEO6Vej7wLw6idahChho4E+LAD8CQgQr0gFGi0EZjiYBUCAi4GIFCiBggaNCxTbWGTYUEgEGChQpCgQUiSAlw0NtJgBA8aElm5gNvQgYsYM/xuVcFYsecOGiKMWhHI78KEpjARKlz3oQDVF1GUjSGiNcNXNCwQrZHDgQGJi1ysTEKgNAWMsBwVnrzBQi6ADBxB4c8U1QoDuAg2ANRDdy4wugsCCCRcBsKDxXwiQ9SoWQsAxBBGQITCYPISB4w8hHN/kfONB5hInHI8gfcNE5hMV6JZgLSPwBJashSjoEBg3TNIX8IJgMQRmxr0ESowFgaE4xsFXLZAYK+KA81EM9yZgoZWEiSIKw8Ud8YHq08Xu2B1XWkFE0w7NjawjQH99SwkhZhxNocxIMwLfGNAfThLIAINPLVAwyDMHsBJUSA+wkNKBD7QhQIO9KGCAfZYcgKlBCC3QkFIFggyQoQKRGAAdFgJIcEIJIIZIoiUmotiHAwwcMCAWcJjwggwswPgCOssIUAADFDjQwAYSSOCAApSQFIABCkhgwQop2PBjkCPAlQ4ABiS5pAQZPDBBBRZgcEEEcqhwwgox1JDlCyk8wOErARTQAJkZnOlBmmu2+WacKcRQgXVCBXCAA2ZW8KeabJrgJpwRbCDZVRcysMEEFqzphQcSMHCpIEEAACH5BAUAADgALAYABgAwADAAAAb/wJtwSCwKBYaCguKgMBSFA0EAMFqv2Jsg4chINptG85lIRA2DQDXLJg4oj8nj4Q2PFeazgZBet68BDBUWHhVydWJOeFEHe3wDVH9WBg8XGISGGRQFU2sAAQIDBI6QAlR+kgwYEZaXEgoDbZ+hpgG2kkIOJiYurA8KAbhCn7ZqqFkNKiO7LhuxwkMAn9LSbRQnJ8oXFNBW1NVZBSMr2BEK3VjgWAEXNTErIwzo80IZKTXuDfSSD0UHMTZSpJiw7w8CDueGeHjxwsYIAwWzpEBAccUQAilkyHghIWKWCxQPFhDygIVJFQI8YiGAImQEISdKyOynEosLigtC3DAQoieL/5E1rzAAsaBogQ0tkqoImqVE0QUVLtCYaoEplhFFIZyIgaLrBqtXHkAYW4IFjLMJwFphMBaCCBgz4j5TS4SAhrsgROgVcYwugLt3Pwj+0FctABCI8w4mQLcIAQ6QSdDoQDlhYyEKIHOA8YKE5wyXh2TwTOLFCM0uQguJQLmDiQeQQchQfSOF4A4PCiQmYZluAhQiBB+4UQLwy8sW4opIIeSChrEtGNMdkALujApCDpAYu+BC4wldYYSACPMpit5BC6Sg0dX7EAUkiiKIofZCUho/i9ykqDZDiZ4tYFeEADrdoI5KDaTAwn8opSONGio5sIJGLNiAXhEPglIYNBucYKTDCxp9xYYtpvQxjwET4JPCh6DJUqIokGx4hQAOXLBCDDUI1JEkAIRCwChSpNEGARR4MIIKJ9yoggPQ9DiKAQcUIGUjMQoRwAAHMJDBKiYcmaQFQHUTAAEHRJmAAgww0cAGEmQQhwcWYHBBBC502Uww9ACAZQFnpunAmm3GUYEHctIZgQTSRaTnAWiqyaabEwwa5wMMzBXUlYxS8CgdG2ySkjBBAAAh+QQFAAA4ACwGAAYAMAAwAAAG/0CccEgsCgMDw6HAPBgIgwDgZqxar7iAQUGhMBSJpuE5GAikVKyaKEg03g4vOOwkQM1n9BoLSGwkEhsNcV8JdE93eVJTe1UEDRMPGYENFAkGZ0QAAZyKAJ83aY04BRMVkRkZFAcCe5ufoKJ7DBYeHqcNBaNDN7GhjQwXGLUVDLtFocmhEWoKERfCFQnHVcoICBZXBxguzx7T1FY31wgkDVYVJiYuFuDhVRUk5CGtRQ0qI+oU71gX5AguihgwoQKfBH5qYiBYsIBEkQwrTpzAQAAhFgUoGC44QURFjBUrHFhco5HEASEbatSIwWykGhoQYl4QEiFFihoHXWKJEBNCCf8cBGwIjXFS5xUFHDQoxeHghdOWRq/IUKphggcZWCdExeIChFd8LMKK3HrFKwcZKUqo1UW2ClIOHGCUCEG37RUSeDu02NvCrpUOgDvQGEzDb5XAglEoHmCYyIAPkEWwgEHZXeMEIjKHqDGjc87GOCR0nlEjQmYRM0HjwEAZRoQMIiCnUI1jhWIUEg5A7jDDst0CIQgbwPECMAkMoCfwXSHEAl4SPxufoBtCqxARcDkg95uBhVoZFYWM8Aqir90DJ2SEzTYEMwilzNt6cIq26JAISmNuj7ohhdAXD1TBQk8dVBAVBSrUYFMEAVTRwAcQMCSCgS4xYMIKMdRwgm9EeKCgEQK/WESBCyeAFMNYV0RwTSigvEPABiaMoEKJ56wRAYub6DFKAApMEIELMapQ4x69fNLJGQCsMYACGWBwwY8mRGDMLr0cOYAdZWQiBAACGJCAAw9U4IEFTkYwgX3HcClAGQSMsUQCCjBAgQMN/PGAKWMOs49FSNihxJtxzlmnBBnceQoFjOmEhBJMwCknnX8U2kAC9WzFJQFLBErIJdQEAQAh+QQFAAA4ACwGAAYAMAAwAAAG/0CccEgsCgECwWBAGCQFAMDNSK1aj4ND4XAwEJrJgDgqvZqNAUNCkdh2v06BOEC+2c9nA2PPLmy9YHJ0dXZTAnhGAwoODhQMfQYDdFM4dmRShTcoIQ2IQwYOGw2NDAkEAWeZdggIJBaeBRkSog0KBACeQzesvBF4CQ8ZshsFqLlDADG8CAtnBRMTwQ0Hx1QXJMwLCx5WBBMV0BsG1VUVItoLHVUAEhYeFQ/U5FYd2hAsVAwYFu4J82YQAkLwRYSAhQsYMDj4Z2ZFQA0fijSIEOHChAEMzdDQwHHEkAERXLiIwCCjGQwaQICIKMSBiZcVjJm0EgIEBw4YhFgYwXPhzP8rF25ykIFjwAkVKkwQ+GlGBImnBxisOHHiFdMrNjpoffAgxooVEq5eiaD1g4kLNWrEKCm2ioQPcFOcSJGihry2RhKI2BsihY2/h/AmmkEYxovDLwRXgcEYhozHRBUbQUEZhQwWmCUbocG5RYoSoAtoHlKghekXKkKo7jQaRwPVIVRgMN2CW+sKoEtY2MCZxonWOExgZtHAQOUQrQ+kgCwkRmOrkjPYOGxCSAUYhG1gVCzAhV8bYXEYaLFXhG3BDdKmWEHEhQi4LPzhNRAhRowaD4qg+KBVheAMJ3ylwjhEYKDVU9AxRcEIKlC1ARU2kHCTCBNcpcAFJjB4XhEOzMCxgUozVDhTAh648FIEopWjEkcf5JSRAh5cEJILbFmBkgYCxaDAPANQ4IEFGMhIAR4X4AiBNjBcUE0BG1TwY0I1nuHBB+ggcAMmZwhwAAUZPPDNO/J50kAJC1h5JQB0DEJEAAKoEYoEXULTwFLVCGACB2eKkQQTBhigxRoMUOBAAxvAKUECuPxjCZpsLkGAn38qEOigG2yQQGAmWdIon1wUAKigChwg01VXNgqpH11IckwQACH5BAUAADgALAYABgAwADAAAAb/QJxwSCwKb4CkEnBr3nAFo3RKFQYE2EBg6bx5EK1ItEomAgSEwSCrVXYRcATnpChXb2gDIc3eJt9xCAskLnZSAQYHB3ppA21PRE0lGnALlgsshkQDBZ2LBo4AZQwuKJcQEB8VmgQKCQkFiwKQhgQXpqgQGhd2BgwKrgkEoppECiuoGhogGGQEFBS/CQPFUxgiyyAgq1MDFA7Q09VUEzDaHDMOUwwNDQ4M1OPkIhwcJDZSBRsb7QbyZBbskejQjIiADRIkbEjwr4yKDhBRMByi4EGGDA4ENCSTgMWHj4WECMjwoOSYjVU8fBAhgoY/HAkqTJjQAGWZAS9m6OQmwUOF/woTbVaxMAMGjBo4BFiw4DOeUCoJWqCYaqAABgwWJDwts4KGV34XLmCgsBVgi7MYHkSIcOFkWSkNQshVgcGFXQJvqRQowTeFCxOA81ZhQVjGiMMjBFORwViGiscqFE95QfmFihOYNUo2aKNzChMrQr/cLORAitMnMMRYzYD0EAY1Yl+YEDvFA9dCJKxY/YDCaRsRcOOwgHkFAwKdX6Q44JqAiccnqJl4wfg2aQeILQjJIIPwCdIBKvw1oQ4Hcr4hrCtmsNbFBacW5Iao4bbsgAdhI9QccuDFWRrBCeaABVdZ4JQQFXg11QR5JeCBB0u1ZsQJU8EQQgZlHZDBTx5IQL5MEQyUAINO6T1lwAYPzPQAXlNkoJMIH9DggU0HNCABSRMwlxKMH3RAggpBVRNAAQ0gdGN9U1jQo48chIABi4YA0Mo3RUqgox0ToEBCPdqEEEEdZAAwwAEKMEAlBaMZ4oANHGijDAQclDDCBE0cAcAVYxaQQJlmiiPPBSKAoAEqliCAxJ14DkBAIp3sqUCa8iTwEKELGJqEFgKosaginRgQwFMHXBBCoYdiqqkBegzwYVkFVLBCqVdgIcAW1QQBADs="+');background-repeat: no-repeat;background-position: 8px 50%;box-shadow: 0 1px 15px rgba(0,0,0,.175);z-index: 20000001;"></div>';
        		top.$("body").append(_html);
        	}
            var ajaxbg = top.$("#loading_background,#loading_manage");
            if (ops.isShow) {
                ajaxbg.show();
            } else {
                if (top.$("#loading_manage").attr('istableloading') == undefined) {
                    ajaxbg.hide();
                    top.$(".ajax-loader").remove();
                }
            }
            // top.$("#loading_manage").html(ops.msg || "正在拼了命为您加载…");
            var w = top.$(window).width();
            var h = top.$(window).height();
            top.$("#loading_manage").css("left", (w - top.$("#loading_manage").width()) / 2 - 54);
            top.$("#loading_manage").css("top", (h - top.$("#loading_manage").height()) / 2);
        },
        /**
         * 系统提示框
		 * @param opt json 对象 {type: 1/2/3/4/5/6, msg: "提示文本"}
         */
        alert: function (opt) {
            if (opt.type == -1) {
                opt.type = 2;
            }
            top.layer.alert(opt.msg, {
                icon: opt.type,
                title: "系统提示"
            });
        },
        /**
         * 系统确认框
		 * @param msg 提示文本
         */
        confirm: function (opt) {
            top.layer.confirm(opt.msg, {
                icon: 7,
                title: "系统提示",
                btn: ['确认', '取消'],
            }, function (e) {
                opt.callBack(true, e);
            }, function (e) {
                opt.callBack(false, e);
            });
        },
        /**
         * 信息提示
		 * @param opt json 对象 {type: 1/2/3/4/5/6, msg: "提示文本"}
         */
        msg: function (opt) {
            if (opt.type == -1) {
                opt.type = 2;
            }
            top.layer.msg(opt.msg, { icon: opt.type, time: 4000, shift: 5 });
        },
        /**
         * 关闭弹窗
		 * @param rollback 关闭后的回调函数
         */
        dialogClose: function (rollback) {
            try {
                var index = top.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
                var $IsdialogClose = top.$("#layui-layer" + index).find('.layui-layer-btn').find("#IsdialogClose");
                var IsClose = $IsdialogClose.is(":checked");
                if ($IsdialogClose.length == 0) {
                    IsClose = true;
                }
                if (IsClose) {
                	if(typeof rollback === "function"){
                		rollback();
                	}
                    top.layer.close(index);
                } else {
                    location.reload();
                }
            } catch (e) {
                alert(e)
            }
        },
        /**
         * tips
         * @param opts
         */
        tips: function(opts){
        	var opt = $.extend({
        		area: ["382px", "auto"],
         	    tips: [3, '#D7000F'],
         	    msg: "还没有设置提示信息",
         	    elem : "document",
         	    time: 4000
        	}, opts);
        	layer.tips(opt.msg, opt.elem, {
        	    area: opt.area,
        	    tips: opt.tips,
        	    time: opt.time
        	});
        },
        pageTitle: function(title){
        	document.title = title||"公共法律服务网";
        },
        removeData: function(opt){
            var opt = $.extend( {
                msg: "注：您确定要删除吗？该操作将无法恢复",
                loading: "正在删除数据...",
                param: [],
                type: "post",
                dataType: "json",
                success: null
            }, opt);
            base.confirm({
                msg:opt.msg,
                callBack: function (r) {
                    if (r) {
                        base.loading({ isShow: true, text: opt.loading });
                        window.setTimeout(function () {
                            var postdata = opt.param;
                            $.ajax({
                            	url: $website.dataCRUDPath || $svc.updaterest,
                                data: postdata,
                                type: opt.type,
                                dataType: opt.dataType,
                                success: function (data) {
                                	if (data != null && data.code == "1") {
                                		base.alert({ msg: data.description||"数据已删除", type: -1 });
                                		if(typeof opt.success === "function"){
                                            opt.success(data);
                                		}
                                    } else {
                                    	base.alert({ msg: data.description||"数据删除失败", type: -1 });
                                    }
                                },
                                error: function (XMLHttpRequest, textStatus, errorThrown) {
                                    base.loading({ isShow: false });
                                    base.msg({ msg: errorThrown, type: -1 });
                                },
                                beforeSend: function () {
                                	base.loading({ isShow: true, text: opt.loading });
                                },
                                complete: function () {
                                	base.loading({ isShow: false });
                                }
                            });
                        }, 500);
                    }
                }
            });
        },
        /**
         * 提交数据
		 * @param opt json 对象
         */
        saveData: function (opt) {
            var opt = $.extend({
                param: [],
                type: "post",
                dataType: "json",
                loading: "正在处理数据...",
                success: function(data) {},
                error: function(XMLHttpRequest, textStatus, errorThrown) {},
                close: true
            }, opt);
            base.loading({ isShow: true, text: opt.loading });
            window.setTimeout(function () {
				var postData = $.extend($.WebSite.getParameter(opt.param), {"siteEnCode": $website["enCode"]});
                $.ajax({
                	url: $website.dataCRUDPath || $svc.updaterest,
                    data: postData,
                    type: opt.type,
                    dataType: opt.dataType,
                    success: function (data) {
                    	if (data != null && data.code == "1") {
                    		base.loading({ isShow: false });
                    		base.msg({ msg: data.description||"数据已经保存", type: 1 });
                    		opt.success(data);
                    		if (opt.close == true) {
                    			base.dialogClose();
                    		}
                    	} else {
                    		base.alert({ msg: data.description||"数据保存失败", type: -1 });
                    		opt.error();
                        }
                    },
                    error: function (XMLHttpRequest, textStatus, errorThrown) {
                        base.loading({ isShow: false });
                        base.msg({ msg: errorThrown.message, type: -1 });
                        opt.error(XMLHttpRequest, textStatus, errorThrown);
                    },
                    beforeSend: function () {
                        base.loading({ isShow: true, text: opt.loading });
                    },
                    complete: function () {
                        base.loading({ isShow: false });
                    }
                });
            }, 500);
        },
        getDataItem: function(id, key){
			var json =  dataItem[id];
			if(key){
				if(!$.isEmptyObject(json)){
					var r = json[key];
					return r;
				}else{
					return "";
				}
			}else{
				return json||{};
			}
        },
        listDataItem: function(parentId){
        	if(dataItem){
        		var dis = new Array();
        		$.each(dataItem, function(i, item){
        			if(item["parentId"] == parentId){
        				dis.push(item);
        			}
        		})
        		return dis;
        	}
        	return [];
        },
        getArea: function(id, key){
			var json =  area[id];
			if(key){
				if(!$.isEmptyObject(json)){
					var r = json[key];
					return r;
				}else{
					return "";
				}
			}else{
				return json||{};
			}
        },
        listArea: function(parentId){
        	if(area){
        		var dis = new Array();
        		$.each(area, function(i, item){
        			if(item["parentId"] == parentId){
        				dis.push(item);
        			}
        		})
        		return dis;
        	}
        	return [];
        },
        // 日期格式化yyyy-
        formatDate : function (v, format) {
            if (!v) return "";
            var d = v;
            if (typeof v === 'string') {
                if (v.indexOf("/Date(") > -1)
                    d = new Date(parseInt(v.replace("/Date(", "").replace(")/", ""), 10));
                else
                    d = new Date(Date.parse(v.replace(/-/g, "/").replace("T", " ").split(".")[0]));// 用来处理出现毫秒的情况，截取掉.xxx，否则会出错
            } else if (typeof v === "number"){
            	d = new Date(v);
            }
            var o = {
                "M+": d.getMonth() + 1,  // month
                "d+": d.getDate(),       // day
                "h+": d.getHours(),      // hour
                "m+": d.getMinutes(),    // minute
                "s+": d.getSeconds(),    // second
                "q+": Math.floor((d.getMonth() + 3) / 3),  // quarter
                "S": d.getMilliseconds() // millisecond
            };
            if (/(y+)/.test(format)) {
                format = format.replace(RegExp.$1, (d.getFullYear() + "").substr(4 - RegExp.$1.length));
            }
            for (var k in o) {
                if (new RegExp("(" + k + ")").test(format)) {
                    format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
                }
            }
            return format;
        },
        /**
         * 字符串加密
         */
        encrypt: function(val){
        	// 密钥
        	var secretKey = $website["enCode"]||"sL9p4mS2mSVTSBzWn4p16Mu7";
        	return DES3.encrypt(val, secretKey);
        },
        reloadCaptcha: function(ele){
        	$(ele).attr("src", $ctx + "website/captcha/image.q4w?" + Math.random());
        },
        getUserInfo : function(){
        	var user = null;
        	$.WebSite.getData({
        		cfg: "com.lawyee.japrf.parse.dto.PublicUserDsoDTO#currentUser",
        		rollback: function(us){
    				user = us;
        		}
        	});
        	return user;
        },
        getUser : function(){
        	var user = $.WebSite.getUserInfo();
			if(user == null){
		        window.location.href = $website["domain"] + $website["home"] + "?" + window.location.href;
			}
        	return user;
        },
        uuid: function(){
        	var guid = "";
            for (var i = 1; i <= 32; i++) {
                var n = Math.floor(Math.random() * 16.0).toString(16);
                guid += n;
                // if ((i == 8) || (i == 12) || (i == 16) || (i == 20)) guid +=
				// "-";
            }
            return guid;
        },
        /**
         * 是否微信访问
         */
        isWeixinOpen: function(){
        	var ua = navigator.userAgent.toLowerCase();
        	if(ua.match(/MicroMessenger/i) == "micromessenger"){
        		return true;
        	}else{
        		return false;
        	}
        },
		/**
		 *验证是否小于等于len位数的字符串
		 */
		isLenStr: function(str, len){
			str = $.trim(str);
			if(str.length > len){
				return false;
			}else{
				return true;
			}
		},
		/**
		 *验证是否小于等于len位数的字符串
		 */
		timeText: function(v, suf){
			if(typeof suf == 'undefined'){
				suf = true;
			}
			if (!v) return "";
            var d = v;
            if (typeof v === 'string') {
                if (v.indexOf("/Date(") > -1)
                    d = new Date(parseInt(v.replace("/Date(", "").replace(")/", ""), 10));
                else
                    d = new Date(Date.parse(v.replace(/-/g, "/").replace("T", " ").split(".")[0]));// 用来处理出现毫秒的情况，截取掉.xxx，否则会出错
            } else if (typeof v === "number"){
            	d = new Date(v);
            }
			var oldTime = d.getTime();
			var newTime = new Date().getTime();
			var diffValue = newTime - oldTime;
			if(diffValue < 0) return "";
			var mh = diffValue/(86400000*360);
			if(mh >= 1) {
			    return parseInt(mh) + " 年" + (suf ? "前" : "");
			}
			var mh = diffValue/(86400000*30);
			if(mh >= 1) {
			    return parseInt(mh) + " 月" + (suf ? "前" : "");
			}
			var w = diffValue/604800000;
			if(w >= 1){
			    return parseInt(w) + " 周" + (suf ? "前" : "");
			}
			var d = diffValue/86400000;
			if(d >= 1){
			    return parseInt(d) + " 天" + (suf ? "前" : "");
			}
			var h = diffValue/3600000;
			if(h >= 1){
			    return parseInt(h) + " 小时" + (suf ? "前" : "");
			}
			var m = diffValue/60000;
			if(m >= 1){
			    return parseInt(m) + " 分钟" + (suf ? "前" : "");
			}
			return "刚刚";
		},
		clone : function(obj){
			var result={};
    	    for(var key in obj){
    	        result[key]=obj[key];
    	    }
    	    return result;
		}
	};
	
	$.WebSite = base;
	/**
	 * 通过元素获取所在模块的编号
	 */
	$.fn.getModuleId = function(){
		var es = $(this).parents("[id^='_view_']:first");
		if(es.length > 0){
			var id = $(es[0]).attr("id");
			return id.substring(6);
		}else{
			return null;
		}
	}
	/**
	 * 长内容缩短显示
	 * opts ： json参数 
	 *  {
	 *  content: "XXXXXXXXXX",
	 *  length: 10,
	 *  ellipsis: "..."
	 *  }
	 */
	$.fn.showShort = function(opts){
		var showEle = $(this);
		var opt = $.extend({
			content: showEle.html(),
			length: 10,
			ellipsis: "..."
        }, opts);
		var eid = "tip-id_" + String(Math.random()).substr(2);
		showEle.attr("tip-id", eid);
		
		// 检查内容是否含有html标签
		var reg = /<[^>]+>/g;
		var html = opt.content;
		if(reg.test(opt.content)){
			html = $(opt.content).html();
		}
		
		if(html.length >= opt.length){
			showEle.html(html.substring(0, opt.length) + opt.ellipsis);
			showEle.mouseover(function(){
				$.WebSite.tips({
					elem: ("[tip-id='" + eid + "']"),
					msg: opt.content
				});
			}).mouseout(function(){
				$(".layui-layer-tips").remove();
			});
		}else{
			showEle.html(html);
		}
	}
	
	/**
	 * 显示地图
	 * opts ： json参数 
	 *  {
	 *  title: "贵州省司法厅",
	 *  address: "都司路130号",
	 *  telephone: "(0851)5831008",
	 *  axis: "", // 默认坐标
	 *  height: "280px", // 展开最大高度
	 *  width: "580px" // 宽度
	 *  }
	 */
	$.fn.showMap = function(opts){
		var $mapAxis = $(this);
		var opt = $.extend({
			title: "贵州省司法厅",
			address: "都司路130号",
			telephone: "(0851)5831008",
			axis: "", // 默认坐标
            // 展开最大高度
            height: "280px",
            // 宽度
            width: "580px"
        }, opts);
		// 检测是否联网
		$.ajax({
			type: "GET",
			cache: false,
			timeout: 800,
			url: "http://www.gz12348.gov.cn:8888/",
			success: function(){
				bulidDom(true);
			},
			error: function(){
				bulidDom(false);
			}
		});
		// 构建dom
		function bulidDom(onlineFlag){
			var maphtml = "";
			if(onlineFlag){
				maphtml += "<div id=\"show-map\" style=\"width:" + opt.width + ";height:" + opt.height + "\"></div>";
			}else {
				maphtml += "<div style=\"width:" + opt.width + ";height:" + opt.height + "\">没有联网</div>";
			}
			$mapAxis.html(maphtml);
			
			if($mapAxis.find("#show-map").length == 1){
				// 设置默认坐标
				var lng = "106.712761" , lat = "26.579543";
				var as = (opt.axis||"").split(",");
				var isAxis = false;
				if(as.length == 2){
					lng = as[0];
					lat = as[1];
					isAxis = true;
				}
				
				var map = new BMap.Map("show-map");          // 创建地图实例  
				map.enableScrollWheelZoom(true);     //开启鼠标滚轮缩放 
				var point = new BMap.Point(lng, lat);  // 创建点坐标  
			    map.centerAndZoom(point, 18); // 初始化地图
				if(isAxis){
					var marker = new BMap.Marker(point); //创建marker对象
				    marker.enableDragging(); //marker可拖拽
				    var infoWindow = function(){
				    	var content = '<div style="margin:0;line-height:20px;padding:2px;">' +
		                '地址：'+(opt.address)+'<br/>电话：'+(opt.telephone)+'<br/>简介：'+(opt.title)+
		              '</div>';
				    	return new BMapLib.SearchInfoWindow(map, content, {
							title  : opt.title,      //标题
							width  : 290,             //宽度
							height : 105,              //高度
							panel  : "panel",         //检索结果面板
							enableAutoPan : true,     //自动平移
							searchTypes   :[
								BMAPLIB_TAB_SEARCH,   //周边检索
								BMAPLIB_TAB_TO_HERE,  //到这里去
								BMAPLIB_TAB_FROM_HERE //从这里出发
							]
						});
				    }
				    marker.addEventListener("click", function(e){
				    	infoWindow().open(marker);
				    });
				   infoWindow().open(marker);
				    map.addOverlay(marker); //在地图中添加marker
				}
			}
		}
	};

	// 自定义jquery事件，监听输入框、文本域的内容变化的事件
	$.event.special.valuechange = {
		teardown: function (namespaces) {
			$(this).unbind('.valuechange');
		},
		handler: function (e) {
			$.event.special.valuechange.triggerChanged($(this));
		},
		add: function (obj) {
			$(this).on('keyup.valuechange cut.valuechange paste.valuechange input.valuechange', obj.selector, $.event.special.valuechange.handler)
		},
		triggerChanged: function (element) {
			var current = element[0].contentEditable === 'true' ? element.html() : element.val() , previous = typeof element.data('previous') === 'undefined' ? element[0].defaultValue : element.data('previous')
			if (current !== previous) {
				element.trigger('valuechange', [element.data('previous')])
				element.data('previous', current)
			}
		}
	}
})(window.jQuery);
/**
 * 
 * @Name : laytpl v1.2 - 精妙的JavaScript模板引擎
 * @Author: 贤心
 * @Date: 2014-10-27
 * @Site：http://sentsin.com/layui/laytpl
 * @License：MIT
 * 
 */

;!function(){var config={open:"{{",close:"}}"};var tool={exp:function(str){return new RegExp(str,"g")},query:function(type,_,__){var types=["#([\\s\\S])+?","([^{#}])*?"][type||0];return exp((_||"")+config.open+types+config.close+(__||""))},escape:function(html){return String(html||"").replace(/&(?!#?[a-zA-Z0-9]+;)/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#39;").replace(/"/g,"&quot;")},error:function(e,tplog){var error="Laytpl Error：";if(window.console){console.error(error+e+"\n"+(tplog||""))}return error+e}};var exp=tool.exp,Tpl=function(tpl){this.tpl=tpl};Tpl.pt=Tpl.prototype;window.errors=0;Tpl.pt.parse=function(tpl,data){var that=this,tplog=tpl;var jss=exp("^"+config.open+"#",""),jsse=exp(config.close+"$","");tpl=tpl.replace(/\s+|\r|\t|\n/g," ").replace(exp(config.open+"#"),config.open+"# ").replace(exp(config.close+"}"),"} "+config.close).replace(/\\/g,"\\\\").replace(/(?="|')/g,"\\").replace(tool.query(),function(str){str=str.replace(jss,"").replace(jsse,"");return'";'+str.replace(/\\/g,"")+';view+="'}).replace(tool.query(1),function(str){var start='"+(';if(str.replace(/\s/g,"")===config.open+config.close){return""}str=str.replace(exp(config.open+"|"+config.close),"");if(/^=/.test(str)){str=str.replace(/^=/,"");start='"+_escape_('}return start+str.replace(/\\/g,"")+')+"'});tpl='"use strict";var view = "'+tpl+'";return view;';try{that.cache=tpl=new Function("d, _escape_",tpl);return tpl(data,tool.escape)}catch(e){delete that.cache;return tool.error(e,tplog)}};Tpl.pt.render=function(data,callback){var that=this,tpl;if(!data){return tool.error("no data")}tpl=that.cache?that.cache(data,tool.escape):that.parse(that.tpl,data);if(!callback){return tpl}callback(tpl)};var laytpl=function(tpl){if(typeof tpl!=="string"){return tool.error("Template not found")}return new Tpl(tpl)};laytpl.config=function(options){options=options||{};for(var i in options){config[i]=options[i]}};laytpl.v="1.2";"function"==typeof define?define(function(){return laytpl}):"undefined"!=typeof exports?module.exports=laytpl:window.laytpl=laytpl}();


function des(key,message,encrypt,mode,iv,padding){var spfunction1=new Array(16843776,0,65536,16843780,16842756,66564,4,65536,1024,16843776,16843780,1024,16778244,16842756,16777216,4,1028,16778240,16778240,66560,66560,16842752,16842752,16778244,65540,16777220,16777220,65540,0,1028,66564,16777216,65536,16843780,4,16842752,16843776,16777216,16777216,1024,16842756,65536,66560,16777220,1024,4,16778244,66564,16843780,65540,16842752,16778244,16777220,1028,66564,16843776,1028,16778240,16778240,0,65540,66560,0,16842756);var spfunction2=new Array(-2146402272,-2147450880,32768,1081376,1048576,32,-2146435040,-2147450848,-2147483616,-2146402272,-2146402304,-2147483648,-2147450880,1048576,32,-2146435040,1081344,1048608,-2147450848,0,-2147483648,32768,1081376,-2146435072,1048608,-2147483616,0,1081344,32800,-2146402304,-2146435072,32800,0,1081376,-2146435040,1048576,-2147450848,-2146435072,-2146402304,32768,-2146435072,-2147450880,32,-2146402272,1081376,32,32768,-2147483648,32800,-2146402304,1048576,-2147483616,1048608,-2147450848,-2147483616,1048608,1081344,0,-2147450880,32800,-2147483648,-2146435040,-2146402272,1081344);var spfunction3=new Array(520,134349312,0,134348808,134218240,0,131592,134218240,131080,134217736,134217736,131072,134349320,131080,134348800,520,134217728,8,134349312,512,131584,134348800,134348808,131592,134218248,131584,131072,134218248,8,134349320,512,134217728,134349312,134217728,131080,520,131072,134349312,134218240,0,512,131080,134349320,134218240,134217736,512,0,134348808,134218248,131072,134217728,134349320,8,131592,131584,134217736,134348800,134218248,520,134348800,131592,8,134348808,131584);var spfunction4=new Array(8396801,8321,8321,128,8396928,8388737,8388609,8193,0,8396800,8396800,8396929,129,0,8388736,8388609,1,8192,8388608,8396801,128,8388608,8193,8320,8388737,1,8320,8388736,8192,8396928,8396929,129,8388736,8388609,8396800,8396929,129,0,0,8396800,8320,8388736,8388737,1,8396801,8321,8321,128,8396929,129,1,8192,8388609,8193,8396928,8388737,8193,8320,8388608,8396801,128,8388608,8192,8396928);var spfunction5=new Array(256,34078976,34078720,1107296512,524288,256,1073741824,34078720,1074266368,524288,33554688,1074266368,1107296512,1107820544,524544,1073741824,33554432,1074266112,1074266112,0,1073742080,1107820800,1107820800,33554688,1107820544,1073742080,0,1107296256,34078976,33554432,1107296256,524544,524288,1107296512,256,33554432,1073741824,34078720,1107296512,1074266368,33554688,1073741824,1107820544,34078976,1074266368,256,33554432,1107820544,1107820800,524544,1107296256,1107820800,34078720,0,1074266112,1107296256,524544,33554688,1073742080,524288,0,1074266112,34078976,1073742080);var spfunction6=new Array(536870928,541065216,16384,541081616,541065216,16,541081616,4194304,536887296,4210704,4194304,536870928,4194320,536887296,536870912,16400,0,4194320,536887312,16384,4210688,536887312,16,541065232,541065232,0,4210704,541081600,16400,4210688,541081600,536870912,536887296,16,541065232,4210688,541081616,4194304,16400,536870928,4194304,536887296,536870912,16400,536870928,541081616,4210688,541065216,4210704,541081600,0,541065232,16,16384,541065216,4210704,16384,4194320,536887312,0,541081600,536870912,4194320,536887312);var spfunction7=new Array(2097152,69206018,67110914,0,2048,67110914,2099202,69208064,69208066,2097152,0,67108866,2,67108864,69206018,2050,67110912,2099202,2097154,67110912,67108866,69206016,69208064,2097154,69206016,2048,2050,69208066,2099200,2,67108864,2099200,67108864,2099200,2097152,67110914,67110914,69206018,69206018,2,2097154,67108864,67110912,2097152,69208064,2050,2099202,69208064,2050,67108866,69208066,69206016,2099200,0,2,69208066,0,2099202,69206016,2048,67108866,67110912,2048,2097154);var spfunction8=new Array(268439616,4096,262144,268701760,268435456,268439616,64,268435456,262208,268697600,268701760,266240,268701696,266304,4096,64,268697600,268435520,268439552,4160,266240,262208,268697664,268701696,4160,0,0,268697664,268435520,268439552,266304,262144,266304,262144,268701696,4096,64,268697664,4096,266304,268439552,64,268435520,268697600,268697664,268435456,262144,268439616,0,268701760,262208,268435520,268697600,268439552,268439616,0,268701760,266240,266240,4160,4160,262208,268435456,268701696);var keys=des_createKeys(key);var m=0,i,j,temp,temp2,right1,right2,left,right,looping;var cbcleft,cbcleft2,cbcright,cbcright2;var endloop,loopinc;var len=message.length;var chunk=0;var iterations=keys.length==32?3:9;if(iterations==3){looping=encrypt?new Array(0,32,2):new Array(30,-2,-2)}else{looping=encrypt?new Array(0,32,2,62,30,-2,64,96,2):new Array(94,62,-2,32,64,2,30,-2,-2)}if(padding==2){message+="        "}else{if(padding==1){temp=8-(len%8);message+=String.fromCharCode(temp,temp,temp,temp,temp,temp,temp,temp);if(temp==8){len+=8}}else{if(!padding){message+="\0\0\0\0\0\0\0\0"}}}result="";tempresult="";if(mode==1){cbcleft=(iv.charCodeAt(m++)<<24)|(iv.charCodeAt(m++)<<16)|(iv.charCodeAt(m++)<<8)|iv.charCodeAt(m++);cbcright=(iv.charCodeAt(m++)<<24)|(iv.charCodeAt(m++)<<16)|(iv.charCodeAt(m++)<<8)|iv.charCodeAt(m++);
m=0}while(m<len){left=(message.charCodeAt(m++)<<24)|(message.charCodeAt(m++)<<16)|(message.charCodeAt(m++)<<8)|message.charCodeAt(m++);right=(message.charCodeAt(m++)<<24)|(message.charCodeAt(m++)<<16)|(message.charCodeAt(m++)<<8)|message.charCodeAt(m++);if(mode==1){if(encrypt){left^=cbcleft;right^=cbcright}else{cbcleft2=cbcleft;cbcright2=cbcright;cbcleft=left;cbcright=right}}temp=((left>>>4)^right)&252645135;right^=temp;left^=(temp<<4);temp=((left>>>16)^right)&65535;right^=temp;left^=(temp<<16);temp=((right>>>2)^left)&858993459;left^=temp;right^=(temp<<2);temp=((right>>>8)^left)&16711935;left^=temp;right^=(temp<<8);temp=((left>>>1)^right)&1431655765;right^=temp;left^=(temp<<1);left=((left<<1)|(left>>>31));right=((right<<1)|(right>>>31));for(j=0;j<iterations;j+=3){endloop=looping[j+1];loopinc=looping[j+2];for(i=looping[j];i!=endloop;i+=loopinc){right1=right^keys[i];right2=((right>>>4)|(right<<28))^keys[i+1];temp=left;left=right;right=temp^(spfunction2[(right1>>>24)&63]|spfunction4[(right1>>>16)&63]|spfunction6[(right1>>>8)&63]|spfunction8[right1&63]|spfunction1[(right2>>>24)&63]|spfunction3[(right2>>>16)&63]|spfunction5[(right2>>>8)&63]|spfunction7[right2&63])}temp=left;left=right;right=temp}left=((left>>>1)|(left<<31));right=((right>>>1)|(right<<31));temp=((left>>>1)^right)&1431655765;right^=temp;left^=(temp<<1);temp=((right>>>8)^left)&16711935;left^=temp;right^=(temp<<8);temp=((right>>>2)^left)&858993459;left^=temp;right^=(temp<<2);temp=((left>>>16)^right)&65535;right^=temp;left^=(temp<<16);temp=((left>>>4)^right)&252645135;right^=temp;left^=(temp<<4);if(mode==1){if(encrypt){cbcleft=left;cbcright=right}else{left^=cbcleft2;right^=cbcright2}}tempresult+=String.fromCharCode((left>>>24),((left>>>16)&255),((left>>>8)&255),(left&255),(right>>>24),((right>>>16)&255),((right>>>8)&255),(right&255));chunk+=8;if(chunk==512){result+=tempresult;tempresult="";chunk=0}}return result+tempresult}function des_createKeys(key){pc2bytes0=new Array(0,4,536870912,536870916,65536,65540,536936448,536936452,512,516,536871424,536871428,66048,66052,536936960,536936964);pc2bytes1=new Array(0,1,1048576,1048577,67108864,67108865,68157440,68157441,256,257,1048832,1048833,67109120,67109121,68157696,68157697);pc2bytes2=new Array(0,8,2048,2056,16777216,16777224,16779264,16779272,0,8,2048,2056,16777216,16777224,16779264,16779272);pc2bytes3=new Array(0,2097152,134217728,136314880,8192,2105344,134225920,136323072,131072,2228224,134348800,136445952,139264,2236416,134356992,136454144);pc2bytes4=new Array(0,262144,16,262160,0,262144,16,262160,4096,266240,4112,266256,4096,266240,4112,266256);pc2bytes5=new Array(0,1024,32,1056,0,1024,32,1056,33554432,33555456,33554464,33555488,33554432,33555456,33554464,33555488);pc2bytes6=new Array(0,268435456,524288,268959744,2,268435458,524290,268959746,0,268435456,524288,268959744,2,268435458,524290,268959746);pc2bytes7=new Array(0,65536,2048,67584,536870912,536936448,536872960,536938496,131072,196608,133120,198656,537001984,537067520,537004032,537069568);pc2bytes8=new Array(0,262144,0,262144,2,262146,2,262146,33554432,33816576,33554432,33816576,33554434,33816578,33554434,33816578);pc2bytes9=new Array(0,268435456,8,268435464,0,268435456,8,268435464,1024,268436480,1032,268436488,1024,268436480,1032,268436488);pc2bytes10=new Array(0,32,0,32,1048576,1048608,1048576,1048608,8192,8224,8192,8224,1056768,1056800,1056768,1056800);pc2bytes11=new Array(0,16777216,512,16777728,2097152,18874368,2097664,18874880,67108864,83886080,67109376,83886592,69206016,85983232,69206528,85983744);pc2bytes12=new Array(0,4096,134217728,134221824,524288,528384,134742016,134746112,16,4112,134217744,134221840,524304,528400,134742032,134746128);pc2bytes13=new Array(0,4,256,260,0,4,256,260,1,5,257,261,1,5,257,261);var iterations=key.length>8?3:1;var keys=new Array(32*iterations);var shifts=new Array(0,0,1,1,1,1,1,1,0,1,1,1,1,1,1,0);var lefttemp,righttemp,m=0,n=0,temp;for(var j=0;j<iterations;j++){left=(key.charCodeAt(m++)<<24)|(key.charCodeAt(m++)<<16)|(key.charCodeAt(m++)<<8)|key.charCodeAt(m++);right=(key.charCodeAt(m++)<<24)|(key.charCodeAt(m++)<<16)|(key.charCodeAt(m++)<<8)|key.charCodeAt(m++);temp=((left>>>4)^right)&252645135;right^=temp;left^=(temp<<4);temp=((right>>>-16)^left)&65535;left^=temp;right^=(temp<<-16);temp=((left>>>2)^right)&858993459;right^=temp;left^=(temp<<2);temp=((right>>>-16)^left)&65535;left^=temp;right^=(temp<<-16);temp=((left>>>1)^right)&1431655765;right^=temp;left^=(temp<<1);temp=((right>>>8)^left)&16711935;left^=temp;right^=(temp<<8);temp=((left>>>1)^right)&1431655765;right^=temp;left^=(temp<<1);temp=(left<<8)|((right>>>20)&240);left=(right<<24)|((right<<8)&16711680)|((right>>>8)&65280)|((right>>>24)&240);right=temp;for(var i=0;i<shifts.length;i++){if(shifts[i]){left=(left<<2)|(left>>>26);right=(right<<2)|(right>>>26)}else{left=(left<<1)|(left>>>27);right=(right<<1)|(right>>>27)}left&=-15;right&=-15;lefttemp=pc2bytes0[left>>>28]|pc2bytes1[(left>>>24)&15]|pc2bytes2[(left>>>20)&15]|pc2bytes3[(left>>>16)&15]|pc2bytes4[(left>>>12)&15]|pc2bytes5[(left>>>8)&15]|pc2bytes6[(left>>>4)&15];
righttemp=pc2bytes7[right>>>28]|pc2bytes8[(right>>>24)&15]|pc2bytes9[(right>>>20)&15]|pc2bytes10[(right>>>16)&15]|pc2bytes11[(right>>>12)&15]|pc2bytes12[(right>>>8)&15]|pc2bytes13[(right>>>4)&15];temp=((righttemp>>>16)^lefttemp)&65535;keys[n++]=lefttemp^temp;keys[n++]=righttemp^(temp<<16)}}return keys}function stringToHexForDES(s){var r="0x";var hexes=new Array("0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f");for(var i=0;i<s.length;i++){r+=hexes[s.charCodeAt(i)>>4]+hexes[s.charCodeAt(i)&15]}return r}function hexToStringForDES(h){var r="";for(var i=(h.substr(0,2)=="0x")?2:0;i<h.length;i+=2){r+=String.fromCharCode(parseInt(h.substr(i,2),16))}return r}function suffix_8Blank(str){for(var i=0;i<8;i++){str+=" "}return str}var DES3={encrypt:function(input,key){if(key){return stringToHexForDES(des(key,suffix_8Blank(input),1,0))}return""}};
