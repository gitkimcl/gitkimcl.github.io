let subj_to_color = {"all":"all-solid", "first": "first-solid", "second":"second-solid", "kor":"red", "mat":"green", "soc":"yellow", "eng":"purple", "phy":"blue", "che":"bright-red", "sci":"lime", "inf":"gray", "mola":"ghudegy"};
let subj_to_idx = {"kor":0, "mat":1, "soc":2, "eng":3, "phy":4, "che":5, "sci":6, "inf":7};
let rel_to_color = {"1":"ruby", "2":"ruby", "3":"diamond", "4":"platinum", "5":"gold", "6":"silver", "7":"silver", "8":"bronze", "9":"bronze", "?":"ghudegy"};
let abs_to_color = {"A":"diamond", "B":"platinum", "C":"gold", "D":"silver", "E":"bronze", "?":"ghudegy"};
let abs_to_color_dark = {"A":"diamond", "B":"platinum-dark", "C":"gold-dark", "D":"silver-dark", "E":"bronze-dark", "?":"ghudegy-dark"};

let page = "all";
let locked = true;

window.setTimeout(load_new_data, 10);

function change_page(to) {
    if (locked || page==to) {
        return;
    }
    locked = true;
    $(".s_button_active").removeClass("s_button_active");
    $(`#s_${to}`).addClass("s_button_active");
    page = to;

    $(".info_box").css("opacity", "0%");
    window.setTimeout(load_new_data, 300);
}

function load_new_data() {
    $(".info_box").remove();
    $(".info_line").remove();

    try {
        if (page == "all") {
            for (let i=0; i<4; i++) {
                let cur_line = new_info_line();
                cur_line.append(new_info_box(all_data[i*2].sum));
                cur_line.append(new_info_box(all_data[i*2+1].sum));
                $("#infos").append(cur_line);
            }
        } else if (page == "first") {
            let cur_line = new_info_line();
            for (let i=0; i<4; i++) {
                cur_line.append(new_info_box(all_data[i].first));
            }
            $("#infos").append(cur_line);
            cur_line = new_info_line();
            for (let i=4; i<8; i++) {
                cur_line.append(new_info_box(all_data[i].first));
            }
            $("#infos").append(cur_line)
        } else if (page == "second") {
            let cur_line = new_info_line();
            for (let i=0; i<4; i++) {
                cur_line.append(new_info_box(all_data[i].second));
            }
            $("#infos").append(cur_line);
            cur_line = new_info_line();
            for (let i=4; i<8; i++) {
                cur_line.append(new_info_box(all_data[i].second));
            }
            $("#infos").append(cur_line)
        } else {
            let data = all_data[subj_to_idx[page]];
            let cur_line = new_info_line();
            cur_line.append(new_info_box(data.sum));
            cur_line.append(new_info_box(data.eval[0]));
            cur_line.append(new_info_box(data.eval[1]));
            $("#infos").append(cur_line);
            cur_line = new_info_line();
            cur_line.append(new_info_box(data.first));
            cur_line.append(new_info_box(data.second));
            cur_line.append(new_info_box(data.eval[2]));
            cur_line.append(new_info_box(data.eval[3]));
            $("#infos").append(cur_line);
            // 수행평가가 5개 이상이면 님이 코드 추가하면 됨
        }
    } finally {
        window.setTimeout(make_data_appear, 50);
    }
}

function make_data_appear() {
    $(".info_box").css("opacity", "100%");
    window.setTimeout(unlock, 300);
}

function unlock() {
    locked = false;
}

function new_info_line() {
    return $(`<div class="info_line">`);
}

function new_info_box(data) {
    if (data === undefined) return $(`<div class="info_ghost_box"></div>`); // 써보고 싶었음
    if (data.type == "sum") {
        return new_sum_box(data.args);
    } else if (data.type == "exam") {
        return new_exam_box(data.args);
    } else if (data.type == "eval") {
        return new_eval_box(data.args);
    }
    return $(`<div class="info_ghost_box"></div>`);
}

function new_exam_box(data) {
    data = $.extend({title:"????", ratio:"??", subj:"mola", score:"48", rel_grade:"?", abs_grade:"?", abs_diff:"??", abs_left:"0", abs_right:"100"}, data);

    result = $(`<div class="info_box info_exam_box" style="
    opacity: 0%;

    --color-title: var(--color-${subj_to_color[data.subj]});
    --color-score: var(--color-title);
    --color-rel: var(--color-${rel_to_color[data.rel_grade]});
    --color-abs: var(--color-${abs_to_color[data.abs_grade]});
    --color-abs-dark: var(--color-${abs_to_color_dark[data.abs_grade]});

    --data-title: '${data.title}';
    --data-ratio: '${data.ratio}';
    --data-score: '${data.score}';
    --data-rel: '${data.rel_grade}등급';
    --data-abs: '${data.abs_grade}';
    --data-abs-diff: '${data.abs_diff}';
    --data-abs-left: '${data.abs_left}';
    --data-abs-right: '${data.abs_right}';
    --data-line: ${data.abs_right ? (data.score-data.abs_left)*100/(data.abs_right-data.abs_left) : 100}%;

    --img-rel: var(--img-${rel_to_color[data.rel_grade]});
    --img-abs: var(--img-${abs_to_color[data.abs_grade]});">
        <span class="info_title"></span>
        <span class="info_exam_score"></span>
        <span class="info_exam_glow info_exam_rel_glow">
            <img class="info_exam_img info_exam_rel_img"/>
        </span>
        <span class="info_exam_data info_exam_rel_data"></span>
        <span class="info_exam_glow info_exam_abs_glow">
            <img class="info_exam_img info_exam_abs_img"/>
        </span>
        <span class="info_exam_data info_exam_abs_data"></span>
        <span class="info_exam_abs_line"></span>
    </div>`);

    if (data.big) {
        result.addClass("info_big_box");
    }

    return result;
}

function new_eval_box(data) {
    data = $.extend({title:"????", ratio:"??", subj:"mola", score:"48", grade:"?", grade_diff:"??", grade_left:"0", grade_right:"100"}, data);

    result = $(`<div class="info_box info_eval_box" style="
    opacity: 0%;

    --color-title: var(--color-${abs_to_color[data.grade]});
    --color-score: var(--color-title);
    --color-score-dark: var(--color-${abs_to_color_dark[data.grade]});
    
    --data-title: '${data.title}';
    --data-ratio: '${data.ratio}';
    --data-score: '${data.score}';
    --data-grade: '${data.grade}';
    --data-grade-diff: '${data.grade_diff}';
    --data-grade-left: '${data.grade_left}';
    --data-grade-right: '${data.grade_right}';
    --data-line: ${data.grade_right ? (data.score-data.grade_left)*100/(data.grade_right-data.grade_left) : 100}%;
    
    --img-score: var(--img-${abs_to_color[data.grade]});">
        <span class="info_title"></span>
        <span class="info_eval_score"></span>
        <span class="info_eval_glow">
            <img class="info_eval_img"/>
        </span>
        <span class="info_eval_data"></span>
        <span class="info_eval_line"></span>
    </div>`);

    if (data.big) {
        result.addClass("info_big_box");
    }

    return result;
}

function new_sum_box(data) {
    data = $.extend({subj:"mola",title:"????", abs_grade:"?",rel_grade:"?",abs_diff:"??", more:[]}, data);
    result = $(`<div class="info_box info_sum_box" style="
    opacity: 0%;
    --color-subj: var(--color-${subj_to_color[data.subj]});
    --color-abs: var(--color-${abs_to_color[data.abs_grade]});
    --color-rel: var(--color-${rel_to_color[data.rel_grade]});

    --data-title: '${data.title}';
    --data-abs-grade: '${data.abs_grade}';
    --data-abs-diff: '${data.abs_diff}';
    --data-rel-grade: '${data.rel_grade}등급';

    --img-score: var(--img-${rel_to_color[data.rel_grade]});">
        <span class="info_sum_title"></span>
        <span class="info_sum_abs_score"></span>
        <span class="info_sum_glow">
            <img class="info_sum_img"/>
        </span>
        <span class="info_sum_rel_grade"></span>
        <span class="info_sum_sep"></span>
        <div class="info_sum_more"></div>
    </div>`);

    if (data.big) {
        result.addClass("info_big_sum_box");
    }

    for (e in data.more) {
        result.children(".info_sum_more").append($(`<div class="info_sum_row" style="
        --color-grade: var(--color-${abs_to_color[data.more[e].grade]});

        --data-title: '${data.more[e].title}';
        --data-ratio: '${data.more[e].ratio}';
        --data-abs-diff: '${data.more[e].diff}';
        ">
        <span class="info_sum_row_name"></span>
        <span class="info_sum_row_data"></span>
        </div>`));
    }
    return result;
}