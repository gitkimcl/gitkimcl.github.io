"use strict";
$("time").attr("title", function () { return $(this).attr("data-title") ?? $(this).attr("data-time") ?? $(this).text(); });
$("data").attr("title", function () { return $(this).attr("data-title") ?? $(this).attr("value") ?? $(this).text(); });
$("span.qm").attr("title", function () { return $(this).attr("data-why") ?? "진위 여부나 단어 선택의 적절성이 확실하지 않음"; });

$("a").before(" "); // hair space
$("a").prepend($(`<span class="before">#</span>`));
$("a.ref > .before").text("ref. #"); // 6-per-em space
$("a.add > .before").text("Add");
$("a.add1 > .before").text("Add1");
$("a.add3 > .before").text("Add3");
$("b.star").prepend("★").append("★");
$("q:not(.exact, .star)").prepend("'").append("'");
$("q.exact").prepend("\"").append("\"");;
$("q.star").prepend("★").append("★");;
$("span.ref.paren").prepend("(").append(" )");
$("s.namu, span.namu").append("(...)");
$("span.qm").text("?");