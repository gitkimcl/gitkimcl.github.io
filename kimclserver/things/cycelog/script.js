"use strict";
$("time").attr("title", function () { return $(this).attr("data-time"); });
$("data").attr("title", function () { return $(this).attr("value"); });