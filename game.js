// [정식 배포] 게임 버전 정보
const GAME_VERSION = "1.1.0"; // 복습 단계 시스템 통합

// ──────────────────────────────────────────────
// [i18n] 언어 전환 시스템
// ──────────────────────────────────────────────
const LANG = {
    ko: {
        // 버튼
        btn_back: '돌아가기',
        btn_reward: '보상 받기',
        btn_done: '완료됨',
        btn_confirm: '확인',
        btn_close: '닫기',
        btn_continue: '계속하기',
        btn_quit: '나가기',
        btn_next: '다음 ▶',
        btn_prev: '◀ 이전',
        btn_revive: '부활하기',
        btn_give_up: '🏳️ 포기하기',
        btn_resume: '게임 계속하기',
        btn_start: '시작하기',
        btn_retry: '다시 도전',
        btn_exit: '나가기',

        // 스플래시
        splash_sub: '제사장의 인 맞는 길',
        splash_tap: '아무데나 눌러서 시작',

        // 메뉴
        menu_lang_toggle: '🌐 English',
        menu_kings_step: '👑 왕의 길 -단계',
        menu_guide: '📖 게임 가이드',
        menu_thanks: '👥 감사한 분들',
        menu_home_add: '📱 홈 화면에 추가',
        menu_survey: '📝 설문조사',
        menu_notice: '📢 공지사항',
        menu_report: '🐞 불편 신고',
        menu_data: '💾 기기 변경',

        // 데이터 관리소
        data_modal_title: '💾 데이터 관리소',
        data_export_title: '📤 기록 보관하기 (일일 미션)',
        data_export_desc: '내 진행 상황을 <b>텍스트 파일(.txt)</b>로 만들어 기기에 다운로드합니다.',
        data_export_btn: '🎁 파일로 저장',
        data_import_title: '📥 기록 가져오기',
        data_import_desc: '보관해둔 텍스트 파일을 찾아 불러오거나, 안의 내용을 복사해서 붙여넣으세요.',
        data_import_file_btn: '📁 파일 찾기',
        data_import_paste_btn: '📝 붙여넣기',
        data_reset_title: '⚠️ 모든 데이터 초기화',
        data_reset_desc: '현재 기기의 모든 진행 상황을 완전히 삭제하고 처음부터 다시 시작합니다.',
        data_reset_btn: '🚨 완전 초기화 실행',
        btn_close: '닫기',

        // 게임 가이드
        guide_modal_title: '📖 킹스로드 가이드',
        guide_prev_btn: '◀ 이전',
        guide_p1_title: '🗺️ 전체 여정 흐름',
        guide_p1_html: `<p>킹스로드는 <b>학습 → 복습 → 보스전</b>을 반복하며 말씀을 암기하는 게임입니다.</p><div style="text-align:center; font-size:14px; line-height:2.2; margin:16px 0;">📖 학습 (구절 선택)<br>↓<br>🛡️ 중간점검 (4~7구절마다 점검)<br>↓<br>🐲 보스전 (챕터 전체 점검)<br>↓<br>🔄 복습 → 기억 강화</div><p style="font-size:13px; color:#888;">구절을 선택해 암송을 시작하고, 4~7구절마다 있는 중간점검과 장의 마지막 보스전으로 점검하세요.</p>`,
        guide_p2_title: '📝 암송 단계',
        guide_p2_html: `<p style="font-size:13px; color:#888; margin-bottom:12px;">각 구절은 아래 단계를 순서대로 거쳐 완전히 암기됩니다.</p><ol style="padding-left:20px; line-height:2;"><li><b>읽기</b> — 말씀 전체를 눈으로 읽기</li><li><b>초성 채우기</b> — 초성 힌트로 알맞은 단어 찾기</li><li><b>알맞은 단어 찾기</b> — 세 보기 중 정답 찾기</li><li><b>두루마리 채우기</b> — 시간제한 빈칸 채우기</li><li><b>순서 맞추기</b> — 단어만 보고 순서대로 정렬하기</li><li><b>복습</b> — 2, 5단계만 복습해 기억 강화</li></ol>`,
        guide_p3_title: '⏰ 복습 보너스 타이밍',
        guide_p3_html: `<p style="font-size:13px; color:#888;">복습을 반복할수록 보석이 <b>점점 커집니다.</b> 타이밍이 핵심!</p><div style="font-size:14px; line-height:1; margin:16px 0;"><div style="padding:10px 12px; border-radius:8px; background:rgba(149,165,166,0.1); margin-bottom:8px;"><span style="color:#95a5a6;">📖 <b>최초 클리어</b> → 기본 보석 (×1배)</span></div><div style="padding:10px 12px; border-radius:8px; background:rgba(142,68,173,0.1); margin-bottom:8px;"><span style="color:#8e44ad; font-weight:bold;">🔱 10분 후 복습 → 보석 ×1.5배</span></div><div style="padding:10px 12px; border-radius:8px; background:rgba(41,128,185,0.1); margin-bottom:8px;"><span style="color:#2980b9; font-weight:bold;">⚔️ 1시간 후 복습 → 보석 ×2배</span></div><div style="padding:10px 12px; border-radius:8px; background:rgba(230,126,34,0.1); margin-bottom:8px;"><span style="color:#e67e22; font-weight:bold;">🎁 6시간 후 복습 → 보석 ×5배</span><br><span style="font-size:12px; color:#aaa;">적당한 대기 시간 후에 복습해야 획득!</span></div></div><p style="font-size:12px; color:#aaa;">💡 맵 화면의 '복습 타이밍' 버튼에서 대기 시간이 지났을 때 알려드려요!</p>`,
        guide_p4_title: '💎 보석 & 미션',
        guide_p4_html: `<p><b>보석 획득 방법:</b></p><ul style="padding-left:18px; line-height:1.9; font-size:14px;"><li>학습 & 복습 완료 (보너스 배수 적용)</li><li>실수 없이 완료하면 +10% 추가</li><li>일일 미션 / 주간 미션 클리어</li><li>업적 달성</li><li>성전 자동 생산</li></ul><p style="margin-top:12px;"><b>미션 초기화:</b></p><div style="font-size:13px; color:#666; line-height:1.9;">📅 일일 미션 — 매일 자정 초기화<br>📆 주간 미션 — 매주 월요일 초기화</div>`,
        guide_p5_title: '🏰 성전 & 업적',
        guide_p5_html: `<p><b>성전 건축:</b> 보석을 사용해 성전을 업그레이드하면 방치 생산량이 늘어납니다.</p><p style="margin-top:12px;"><b>업적 7종:</b></p><ul style="padding-left:18px; line-height:1.9; font-size:13px;"><li>🗓️ 누적 출석</li><li>📖 구절 암송 수</li><li>🐲 보스 승리</li><li>💎 누적 보석 획득</li><li>✨ 실수 없는 암송</li><li>🏰 성전 건축 단계</li><li>🌅 새벽 암송 (07시 이전 암송)</li></ul>`,

        // 네비
        nav_home: '홈',
        nav_ranking: '랭킹',
        nav_mission: '미션',
        nav_shop: '상점',
        nav_library: '도감',
        nav_records: '기록실',
        btn_review_timing: '복습 타이밍',
        btn_notif_settings: '알림 설정',

        // 상태/타이머
        status_preparing: '준비 중입니다.',
        status_review_now: '지금 복습 추천!',
        status_review_later: '{time} 후 복습',
        status_review_bonus: '{time} 후 복습 추천(추가 보상)',
        status_today_done: '오늘 완료',
        status_open: '🔓 OPEN',
        status_locked: '🔒 잠금',
        status_new_verses: '🆕 {count}구절 학습 대기',
        status_all_unlocked: '모든 구절 해금!',

        // 게임 레이블
        label_chapter: '제 {num}장',
        label_verse: '{num}절',
        label_score: '승점',
        label_hint: '힌트',
        label_cycle: '사이클',
        label_hearts: '체력',
        label_gems: '보석',
        label_kings_road: '왕의 길',
        label_kings_road_desc: '계시록 순서대로 매일 암기하는 여정',
        label_free_journey: '자유여행',
        label_free_journey_desc: '원하는 구절을 자유롭게 학습',
        mode_select_title: '여정을 선택하세요',
        kings_step_select_title: '👑 왕의 길',
        kings_step_select_subtitle: '암기 단계를 선택하세요',
        kings_step_1_num: '1단계',
        kings_step_1_desc: '하루 1구절 암기',
        kings_step_1_goal: '약 126일만에 1~5장, 205일만에 1~10장 완성',
        kings_step_2_num: '2단계',
        kings_step_2_desc: '하루 2구절 암기',
        kings_step_2_goal: '약 159일만에 1~15장 완성',
        kings_step_3_num: '3단계',
        kings_step_3_desc: '하루 3구절 암기',
        kings_step_3_goal: '약 165일만에 전장 완성',
        btn_back_nav: '← 돌아가기',
        journey_verse: '"이 예언의 말씀을 읽는 자와 듣는 자들과<br>그 가운데 기록한 것을 지키는 자들이<br>복이 있나니 때가 가까움이라"',
        journey_verse_ref: '(계 1:3)',
        btn_amen: '아멘',
        ranking_verse: '"운동장에서 달음질하는 자들이<br>다 달아날찌라도<br>오직 상 얻는 자는 하나인 줄을<br>너희가 알지 못하느냐<br>너희도 얻도록 이와 같이 달음질하라"',
        ranking_verse_ref: '(고전 9:24)',
        kings_header_title: '👑 왕의 길 {step}단계',
        kings_header_info: 'D+{day}일 · {count}구절 해금',
        label_mid_boss: '중간점검',
        label_boss: '보스전',
        label_hardship: '고난',
        label_part: '파트 {cur}/{total}',
        label_next_part: '다음 파트: {count}단어',
        label_chapter_header: '요한계시록 {num}장',
        stage_title_normal: '{ch}장 {v}절',
        stage_title_midboss: '🛡️ 중간 점검 ({ch}장 {start}~{end}절)',
        stage_title_boss: '🐲 BOSS: {ch}장 완전 정복',
        stage_desc_midboss: '{hp}개 절을 한 번에 복습 또는 학습합니다.',
        stage_desc_boss: '붉은 용을 물리치고 {ch}장을 완성하라!',
        label_this_word: '이 말씀',
        label_free: '무료',
        msg_boss_clear: '🐲 [드래곤 토벌] {total}개 스테이지 복습! ({eligible}개 단계 상승)',
        msg_midboss_clear: '🛡️ [중간 점검] {total}개 스테이지 복습! ({eligible}개 단계 상승)',

        // alert 메시지
        alert_ios_install: 'iOS에서는 사파리 브라우저의 공유 버튼(아래 화살표) → "홈 화면에 추가"를 직접 눌러주세요!',
        alert_no_prompt: '설치 프롬프트를 띄울 수 없습니다. 이미 설치했거나 지원하지 않는 환경입니다.',
        alert_welcome_new: "🎉 King's Road v{ver} 정식 버전에 오신 것을 환영합니다!\n\n새로운 시작을 위해 게임 데이터가 초기화되었습니다.",
        alert_mission_reward: '🎁 지난 미션 보상으로\n[승점 {multi}배 {min}분]이 도착했습니다!',
        alert_gems_received: '💎 보석 {count}개를 받았습니다!',
        alert_booster_reserved: '✅ 예약 완료!\n내일 접속 시 [승점 {multi}배 {min}분] 부스터가 자동 적용됩니다.',
        alert_kings_step_changed: '👑 왕의 길 {step}단계로 변경되었습니다.\n내일부터 하루 {step}구절씩 해금됩니다.',
        alert_reward_error: '보상 수령 중 오류가 발생했습니다. 다시 시도해주세요.',
        alert_chapter_locked: '🔒 이전 챕터를 먼저 클리어하여 길을 여세요.',
        alert_verse_locked: '🔒 아직 열리지 않은 구절입니다.\n매일 새로운 구절이 열립니다!',
        alert_spell_incomplete: '주문이 완성되지 않았습니다!\n(현재: {cur} / 필요: {need})',
        alert_attack_fail: '❌ 공격 실패!\n{count}군데가 틀렸습니다.',
        alert_defeat: '💔 패배... 눈앞이 캄캄해집니다.',
        alert_revive_no_gems: '💎 보석이 부족합니다... 부활하려면 {cost}개가 필요합니다.',
        alert_revive_success: '✨ 기적적으로 회복했습니다!\n(보석 -{cost})',
        alert_data_recovered: '✅ 이전 계정 데이터가 자동으로 복구되었습니다!\n\n닉네임: {nick}\n태그: #{tag}',
        alert_data_load_error: '데이터 로드 오류',
        alert_game_switch_error: '게임 전환 중 오류가 발생했습니다. 브라우저 콘솔(F12)을 확인해주세요.',
        alert_no_bread: '🥖 생명의 떡이 없습니다.\n상점에서 구매하세요!',
        alert_hearts_full: '체력이 이미 가득 찼습니다.',
        alert_hearts_restored: '체력이 회복되었습니다. (현재: {cur})',
        alert_hint_no_gems: '💎 보석이 부족합니다! (필요: {cost})',
        alert_hint_read_aloud: '이 단계에서는 큰 소리로 읽는 것이 정답입니다! 📣',
        alert_hint_load_error: '이 구절의 힌트 데이터를 불러올 수 없습니다.',
        hint_btn_label: '💡 힌트',
        hint_confirm: '💎 보석 {cost}개를 소모하여 힌트를 보시겠습니까?',
        hint_modal_header: '💡 힌트 사용 💎{cost}',
        hint_modal_header_free: '💡 힌트 사용 <span style="color:#27ae60; font-weight:bold;">무료</span>',
        hint_step2_current: '현재 단어: ',
        hint_step3_label: '현재 구절',
        hint_step4_fake: '가짜 단어를 찾아 빨갛게 표시합니다.',
        hint_boss_full_verse: '현재 전체 구절',
        hint_boss_current_part: '현재 풀어야 할 파트',
        alert_locked_first_clear: '해당 구절을 1회 이상 클리어하여 잠금을 해제하세요.',
        alert_daily_bonus: '🕊️ [일용할 양식]\n\n성도의 직분을 가진 자에게\n보석 {count}개가 지급되었습니다! 💎\n(현재 보석: {total})',
        alert_booster_stronger: '🔥 더 강력한 {multi}배 부스터가 적용되었습니다!',
        alert_booster_extended: '🔥 부스터 시간이 {min}분 연장되었습니다!',
        alert_booster_started: '⚡ {min}분간 승점 {multi}배 부스터 발동!',
        alert_ranking_out: '현재 랭킹 Top 100 안에 들지 못했습니다.\n분발하세요, 순례자여! 🔥',
        alert_hearts_max_reached: '더 이상 체력을 늘릴 수 없습니다 (순수 최대치 30 도달).',
        alert_buy_hearts_no_gems: '💎 보석이 부족합니다! (필요: {cost})',
        alert_buy_hearts_success: '❤️ 최대 체력이 {max}칸으로 늘어났습니다!',
        alert_buy_no_gems: '💎 보석이 부족합니다!',
        alert_buy_success: '✅ [{name}] 구매 완료! (보유: {count}개)',
        alert_item_none: '아이템이 없습니다! 보급소에서 구매하세요.',
        alert_item_hearts_full: '이미 체력이 가득 찼습니다!',
        alert_item_bread_used: '🍞 생명의 떡을 먹었습니다! (체력 +2)',
        alert_castle_max: '이미 하나님 나라가 완성되었습니다!',
        alert_castle_built: '🎉 건축 완료!\n\n[Lv.{lv} {name}]\n"{desc}"',
        alert_castle_no_gems: '보석이 부족합니다.\n(필요: {need}개 / 보유: {have}개)',
        alert_temple_collected: '💎 성전 공급 보석 {count}개를 수거했습니다!',
        alert_speed_elder: '어르신 모드(느린 속도)로 전환되었습니다.',
        alert_speed_fast: '빠른 속도로 전환되었습니다.',
        alert_speed_normal: '보통 속도로 전환되었습니다.',
        alert_data_reset: '데이터가 완전히 초기화되었습니다.\n게임을 처음부터 다시 시작합니다.',

        // 모달
        modal_quit_title: '전장을 떠나시겠습니까?',
        modal_quit_msg: '지금 나가면 진행 상황이\n저장되지 않을 수 있습니다.',
        modal_revive_title: '쓰러지셨습니까?',
        modal_revive_cost: '보석 {cost}개로 부활',
        modal_exit_title: '앱 종료',

        // 기기 변경/데이터
        alert_life_book_verse: '[제 {ch}장 {v}절]\n\n{text}',
        alert_error_msg: '오류 발생: {msg}',
        alert_no_save_data: '저장할 기록이 없습니다.',
        alert_encrypt_error: '암호화 중 오류가 발생했습니다.',
        alert_file_saved_share: '📥 파일이 기기의 \'다운로드\' 폴더에 저장되었습니다!\n텔레그램이나 카카오톡으로 이 파일을 공유해 보관하세요.\n\n(일일 미션 달성! 보상을 받으세요 🎁)',
        alert_file_saved: '📥 파일이 기기의 \'다운로드\' 폴더에 안전하게 저장되었습니다!\n텔레그램이나 카카오톡으로 이 파일을 공유해 보관하세요.',
        alert_no_code: '입력된 코드가 없습니다.',
        alert_pwd_cancelled: '비밀번호 입력이 취소되었습니다.',
        alert_wrong_account: '❌ 다른 계정의 데이터는 불러올 수 없습니다.\n본인의 저장 코드만 사용해주세요.',
        alert_restore_ok: '✅ 기록 복원 완료!\n게임을 다시 시작합니다.',
        alert_wrong_pwd: '❌ 비밀번호가 틀렸습니다!',
        alert_restore_fail: '❌ 데이터 복구 실패!\n파일이 손상되었거나 복사 과정에서 코드가 일부 누락되었습니다.',
        alert_welcome_tribe: '[{tribe} 지파]의 {nick}님,\n환영합니다! 🙏',
        alert_server_disconnect: '서버에 연결되지 않았습니다. 잠시 후 다시 시도해주세요.',
        alert_tag_not_found: '❌ 해당 태그의 복구 데이터를 찾을 수 없습니다.\n태그를 다시 확인하거나 새 계정으로 시작해주세요.',
        alert_recovery_ok: '✅ 복구 완료!\n\n닉네임: {nick}\n태그: #{tag}\n\n게임을 다시 시작합니다.',
        alert_recovery_error: '복구 중 오류가 발생했습니다. 다시 시도해주세요.',
        alert_achievement: '🎉 [{title}] 달성!\n보상으로 💎보석 {count}개를 받았습니다.',
        alert_multi_device: '🚨 다른 기기에서 로그인이 감지되었습니다.\n계정 보호를 위해 현재 기기의 접속이 차단되고 초기화됩니다.',
        alert_unsaved_changes: '변경사항이 저장되지 않았습니다.',
        alert_training_start_gt_end: '⚠️ 시작 위치가 끝 위치보다 클 수 없습니다.',
        alert_training_repeat_min: '⚠️ 반복 횟수는 1회 이상이어야 합니다.',
        alert_training_no_data: '⚠️ {ch}장의 구절 데이터가 없습니다.',
        alert_training_start_ch_gt_end: '⚠️ 시작 장이 끝 장보다 클 수 없습니다.',
        alert_training_no_verses: '⚠️ 선택한 범위에 해당하는 구절이 없습니다.',
        alert_blank_all_filled: '이미 모든 글자가 맞게 채워져 있습니다.',
        alert_blank_hint_no_gems: '💎 보석이 부족합니다! (필요: {cost})',

        // 게임플레이
        game_hint_instruction: '단어를 터치하여 구절을 완성하세요',
        game_lang_switch_ingame: '스테이지 진행 중에는 언어를 변경할 수 없습니다.',
        lang_switch_confirm: '언어 변경을 위해 앱을 재시작합니다.',
        lang_switch_ok: '네',

        // 홈 화면
        btn_journey: '👑 여정 시작',
        btn_training: '⚔️ 집중 훈련',
        btn_hardship: '⛰️ 고난 길',
        training_title: '⚔️ 집중 훈련소',
        training_notice: '※ 훈련 모드에서는 리그 승점과 보석이 지급되지 않습니다.',
        training_range: '📖 훈련 범위 선택',
        training_start: '시작',
        training_end: '끝',
        training_step: '🏃 훈련 스텝 선택',
        training_cycle: '🔁 반복 사이클',
        training_cycle_desc: '선택한 범위를 한 사이클로 보고 같은 스텝을 반복합니다.',
        training_random: '무작위 순서로 훈련하기',
        training_go: '훈련 시작!',
        home_change: '(변경)',
        home_upgrade_avail: '⬆️ 업그레이드 가능',
        castle_build_locked: '🔒 건축',
        castle_build: '🔨 건축',
        castle_past_badge: '🕰️ 과거의 기록',

        // 프로필 모달
        profile_title: '순례자 등록',
        profile_subtitle: '이름과 소속 부서/지파를 선택하세요.',
        profile_name_tip: '💡 이름을 아래에서 직접 골라보세요! 👇',
        profile_random_name: '🎲 이름 랜덤 변경',
        profile_dept_label: '소속 부서 선택',
        profile_tribe_label: '소속 지파 선택',
        profile_confirm: '✅ 등록 완료',
        profile_tribe_warn: "⚠️ [경고] 지파를 변경하시면 올해 모은 '12지파 대항전 기여도(연간 승점)'가 0점으로 초기화됩니다!\n\n(개인의 누적 승점은 보존되지만, 새로운 지파에서의 기여도는 0부터 다시 쌓아야 합니다.)\n\n정말로 지파를 변경하시겠습니까?",

        // 결과 화면
        result_training_title: '⚔️ 집중 훈련 완료!',
        result_stage_clear: '🎉 STAGE CLEAR!',
        result_boss_clear: '🐲 BOSS CLEAR!',
        result_training_streak: '오늘의 훈련을 무사히 마쳤습니다.',
        result_streak_text: '연속 {days}일째 타오르는 중!',
        result_exp_training: '📝 상태',
        result_exp_gems: '💎 획득',
        result_boss_exp: '🏆 보스 격파',
        result_boss_defeated: '격파!',
        result_continue_training: '홈으로 돌아가기 ▶',
        result_continue: '계속하기 ▶',
        result_msg_training_done: '완료',
        result_msg_training_waiting: '⚔️ 집중 훈련 완료! (보상 없음)',
        result_msg_waiting: '📖 [훈련] 완료! ({gem}💎 최소 보상 - 대기 중)',
        result_msg_first_clear: '📖 [훈련] 첫 학습 완료! ({gem}💎)',
        result_msg_review_done: '📖 [훈련] {step}회차 복습 완료! ({gem}💎)',
        result_msg_perfect_timing: '\n🟢 완벽한 타이밍! 기억이 더 오래갑니다.',
        result_msg_good_timing: '\n🟡 위험했어요! 기억을 간신히 살려냈습니다.',
        result_msg_miss: '📖 [훈련] 복습 완료 (보석 없음)\n🔴 불씨가 식었습니다. 다시 불을 피웁니다.',
        result_msg_no_gem: '📖 [훈련] 완료! (보석 없음 - 대기 중)',
        quote_first_clear: '말씀을 잊지 않고 싶으시다면<br>10분 후 다시 만나보세요.',
        quote_perfect: '적절한 복습 간격입니다.<br>{wait} 후에 복습하세요!(기억 레벨이 오릅니다)',
        quote_good: '거의 다 왔어요!<br>한 번 더 복습해보세요.',
        quote_good_retry: '잘하셨어요!<br>다음 단계로 진행합니다.',
        quote_miss: '괜찮아요! 2번만 더 복습하면<br>다음 단계로 진행됩니다.',
        quote_miss_retry: '잘하셨어요! 한 번만 더 복습하면<br>다음 단계로 진행됩니다.',
        quote_miss_retry_final: '수고하셨어요!<br>다음 단계로 진행합니다.',
        notif_ask: '{wait} 뒤 알려드릴까요?',
        notif_btn: '🔔 알림 예약',
        boss_quote_perfect: ['이 말씀이 이제 당신 안에 있습니다.', '외운 것이 아니라 새긴 것입니다.', '말씀이 마음판에 기록되었습니다.'],
        boss_quote_good: ['거의 다 새겨졌습니다. 조금만 더요.', '윤곽이 보입니다. 다음엔 더 선명해질 거예요.'],
        boss_quote_miss: ['씨앗이 뿌려졌습니다. 물을 주면 자랍니다.', '처음은 누구나 이렇습니다. 시스템을 믿고 따라오세요.'],

        // 미션 UI
        mission_screen_title: '임무',
        mission_title: '📜 왕의 임무',
        mission_subtitle: '성실함이 곧 왕의 자질입니다',

        // 상점
        shop_title: '⛺ 시온 마트',
        shop_subtitle: '여정에 필요한 물품을 구비하세요',
        shop_my_gems: '내 보석',
        shop_heart_name: '굳건한 마음',
        shop_heart_desc: '최대 체력 영구 증가',
        shop_heart_sold_out: '품절 (MAX)',
        shop_heart_done: '완료',
        shop_btn_buy: '구매',
        shop_btn_free: '무료',
        shop_free_once: '무료 1회',
        shop_owned: '보유: {count}개',
        mission_tab_daily: '일일 미션',
        mission_tab_weekly: '주간 미션',
        mission_reset_daily: '🕒 매일 자정에 초기화됩니다',
        mission_reset_weekly: '🕒 매주 월요일 자정에 초기화됩니다',
        mission_btn_done: '완료',
        mission_btn_claim: '보상 받기',
        mission_btn_goto: '바로가기',
        mission_daily_0_title: '매일 접속 시 보상',
        mission_daily_0_desc: '오늘 접속하면 자동으로 완료됩니다.',
        mission_daily_1_title: '새로운 구절 1회 학습',
        mission_daily_1_desc: '새로운 구절을 1회 학습하세요.',
        mission_daily_2_title: '중보/보스 처치 1회',
        mission_daily_2_desc: '중간 점검 또는 보스를 완료하세요.',
        mission_daily_3_title: '데이터 기록 보관',
        mission_daily_3_desc: '텍스트 파일로 기록을 안전하게 보관하세요.',
        mission_weekly_0_title: '주 5일 출석하기',
        mission_weekly_0_desc: '꾸준함이 실력입니다.',
        mission_weekly_1_title: '용 사냥',
        mission_weekly_1_desc: '중간 점검 또는 보스 완료.',
        mission_weekly_2_title: '구절 15회 학습',
        mission_weekly_2_desc: '(주간)누적 15회 학습.',

        // 고난 길 모달
        hardship_title: '고난 길',
        hardship_subtitle: '모드를 고른 뒤 출제 범위를 설정하고 시작합니다.',
        hardship_mode_a_title: '모드 A · 암송의 고난',
        hardship_mode_a_desc: '소리내어 말씀을 암송하고 채점받기',
        hardship_mode_b_title: '모드 B · 주소의 고난',
        hardship_mode_b_desc: '내용을 보고 장·절 맞히기',
        hardship_mode_c_title: '모드 C · 망각의 고난',
        hardship_mode_c_desc: '장·절을 보고 전체 말씀을 입력하기',
        hardship_config_title: '고난 길 설정',
        hardship_config_placeholder: '모드를 선택하세요.',
        hardship_config_range_label: '출제 범위',
        hardship_config_all: '전장 (404절)',
        hardship_config_range: '범위 선택',
        hardship_config_start_ch: '시작 장',
        hardship_config_end_ch: '끝 장',
        hardship_config_summary_all: '전장 {count}절에서 무작위 출제됩니다.',
        hardship_config_summary_range: '{start}장~{end}장, 총 {count}절에서 무작위 출제됩니다.',
        hardship_config_start_btn: '고난 길 시작',
        hardship_order_title: '출제 순서',
        hardship_order_subtitle: '모드 C · 망각의 고난',
        hardship_order_random_title: '무작위 순서',
        hardship_order_random_desc: '구절을 무작위로 섞어 출제합니다',
        hardship_order_seq_title: '순서대로',
        hardship_order_seq_desc: '1장 1절부터 차례로 출제합니다',
        hardship_chapter_option: '{num}장',
        hardship_endurance_title: '암송의 고난',
        hardship_endurance_summary: '소리내어 말씀을 암송하세요.',
        hardship_address_title: '주소의 고난',
        hardship_address_summary: '내용을 보고 장과 절을 맞힙니다.',
        hardship_memory_title: '망각의 고난',
        hardship_memory_summary: '주소만 보고 전체 구절을 인출합니다.',
        hardship_endurance_indicator: '[{label}] 소리내어 말씀을 암송하세요',
        hardship_endurance_speak_btn: '음성인식',
        hardship_endurance_speak_prompt: '아래 버튼을 눌러 말씀을 소리내어 암송하세요.',
        hardship_endurance_listening: '듣는 중...',
        hardship_endurance_score: '{score}% 일치 · {n}절째',
        hardship_endurance_heard: '인식된 음성',
        hardship_endurance_no_support: '이 브라우저는 음성 인식을 지원하지 않습니다.',
        hardship_session_endurance_speech: '이번 세션에서 {count}절을 암송했습니다.',
        hardship_cooldown_today: '오늘 이미 보상을 받은 장입니다. 연습은 가능하지만 보상은 내일부터 다시 받을 수 있어요.',
        hardship_cooldown_result: '오늘 이미 완주한 장입니다. 보상은 내일부터 다시 받을 수 있어요.',
        hardship_endurance_info_title: '📋 암송의 고난 안내',
        hardship_endurance_info_body: '• 말이 끊기면 인식이 종료됩니다. 한 호흡으로 암송하세요.<br>• 정확한 발음이 일치율에 영향을 줍니다.<br>• 80% 이상 → 통과 (만점 승점)<br>• 50~79% → 부분 승점 (절반)<br>• 50% 미만 → 승점 없음<br>• 전체 평균 80% 이상이면 해당 장 스테이지가 클리어됩니다.',
        hardship_endurance_retry: '🔄 다시 읽기',
        hardship_endurance_confirm: '✅ 다음 구절 ▶',
        hardship_btn_reveal: '열기',
        hardship_btn_next_verse: '다음 말씀 ▶',
        hardship_btn_next: '다음 ⏭️',
        hardship_address_indicator: '주소를 맞히세요',
        hardship_address_ask_chapter: '계시록 몇 장인가요?',
        hardship_address_ask_verse: '계시록 {ch}장 몇 절인가요?',
        hardship_address_ch_btn: '{ch}장',
        hardship_address_v_btn: '{v}절',
        hardship_memory_indicator: '주소만 보고 전체 구절을 인출합니다',
        hardship_btn_submit: '정답 확인',
        hardship_btn_reset_input: '입력 초기화',
        hardship_hint_confirm: '💎 보석 {cost}개를 사용해 글자 하나를 보시겠습니까?',
        quit_modal_title: '전장을 떠나시겠습니까?',
        quit_modal_message: '지금 나가면 진행 상황이<br>저장되지 않을 수 있습니다.',
        quit_confirm: '정말 중단하시겠습니까?\n지금까지 진행한 상황은 저장되지 않습니다.',
        hardship_quit_title: '{title}을 종료하시겠습니까?',
        hardship_quit_notice_endurance: '현재 진행 순서는 저장되지 않습니다.',
        hardship_quit_notice_scored: '지금까지 획득한 승점은 저장됩니다. 현재 진행 순서는 저장되지 않습니다.',
        hardship_back_quit_endurance: '지금 나가면 진행 상황이 저장되지 않을 수 있습니다.',
        hardship_back_quit_scored: '지금까지 얻은 승점은 저장되나 진행 상황은 저장되지 않습니다.',
        hardship_kings_btn: '🔥 왕의 고난',
        hardship_endurance_count: '누적 확인 {n}절째입니다.',
        hardship_feedback_correct: '정답입니다. {label} · +{pts}점',
        hardship_feedback_wrong_address: '오답입니다. 정답은 {label}입니다.',
        hardship_feedback_wrong_memory: '오답입니다. 정답 말씀: {text}',
        hardship_step1_indicator: 'Step 1. 한 단어씩 읽으며 \'읽기\'를 눌러 외운 말씀을 확인하세요.<br>확실히 외웠다는 생각이 들 때까지 반복하세요.',
        step1_tip_text: '하나씩 말하며 \'읽기\' 버튼을 눌러보세요',
        step1_voice_btn: '음성인식',
        step1_voice_listening: '듣는 중...',
        step1_voice_pass: '✅ 통과! ({score}%)',
        step1_voice_fail: '❌ {score}% — 다시 도전하거나 건너뛰세요',
        step1_voice_skip: '건너뛰기',
        step1_voice_retry: '다시 말하기',
        step1_voice_no_support: '음성인식 미지원 브라우저입니다',
        step1_info_title: 'ℹ️ Step 1 안내',
        step1_info_body: '• \'읽기\' 버튼을 탭할 때마다 단어가 하나씩 공개됩니다.<br>• 길게 누르면 자동으로 이어서 공개됩니다.<br>• \'음성인식\'으로 전체 구절을 암송할 수 있습니다.<br>• 80% 이상 일치하면 통과, 미달 시 재시도 횟수 제한 없이 도전 가능합니다.',

        // Step 4 스크롤 게임
        step4_indicator: '🔥불타기 전에 빈칸을 채우세요!',
        step4_speed_slow: '🐢 느리게',
        step4_speed_normal: '🚶 보통',
        step4_speed_fast: '🐇 빠르게',
        step4_fill_hint: '아래 카드를 눌러 빈칸을 채우세요',
        step4_skip: '⏩ 빨리 넘기기',

        // Step 5 단어 배열
        step5_indicator: 'Step 5. 단어를 터치하여 문장을 완성하세요',
        step5_placeholder: '단어를 터치하여 문장을 만드세요',
        step5_tip: '💡 <b>팁:</b> 5초간 고민하면 힌트가 나타납니다!',
        step5_insert_on: '끼워<br>ON',
        step5_insert_btn: '끼워<br>넣기',

        // 클리어 결과 alert
        clear_success: '🎉 클리어 성공!',
        clear_first_study: '📖 [훈련] 첫 학습 완료! ({gem}💎)',
        clear_review_nth: '📖 [훈련] {n}회차 복습 완료! ({gem}💎)',
        clear_review_wait: '📖 [훈련] 완료! (10💎 최소 보상 - {time} 후 복습 시 추가 보상)',
        clear_wait_hours: '{h}시간 {m}분',
        clear_wait_hours_only: '{h}시간',
        clear_wait_mins: '{m}분',
        clear_buff_gem: '💎 깨달음 보석 보너스(+{n}%)',
        clear_buff_score: '✨ 깨달음 승점 보너스(+{n}%)',
        clear_buff_wrong: '👼 깨달음 오답 보정({n}회)',
        clear_base_gem_verse: '💎 초회 기본: {gem}개 ({cnt}절 × 10)',
        clear_base_gem: '💎 초회 기본: {gem}개',
        clear_accuracy: '🎯 정확도: {pct}% (오답: {wrong}) → {gem}개',
        clear_castle_bonus: '🏰 성전 보너스: +{gem}개',
        clear_perfect_bonus: '⭐ 퍼펙트 보너스: +{gem}개',
        clear_score: '✨ 승점: +{score}',
        clear_total_gem: '💎 최종 획득: {gem}개',
        clear_repeat_accuracy: '🎯 정확도: {pct}% (오답: {wrong})',
        clear_repeat_perfect: '(💎 퍼펙트 +{gem})',
        clear_repeat_gem: '💎 보석: +{gem} (성전 +{castle})',
        clear_score_blocked_gem: '💎 보석은 정상 지급됩니다.',

        // 토스트 메시지
        toast_progress_saved: '💾 진행 상황 저장됨 (Step {n})',
        toast_notif_disabled: '알림이 해제되었습니다.',
        toast_notif_permission: '알림 권한이 필요합니다. 브라우저 설정에서 허용해주세요.',
        toast_notif_set: '알림이 설정되었습니다. ({times})',
        toast_server_save_fail: '⚠️ 서버 저장에 실패했습니다. 네트워크를 확인 후 다시 시도해주세요.',
        toast_notif_unsupported: '이 브라우저는 알림을 지원하지 않습니다.',
        toast_remind_later: '{label} 뒤 알림을 드릴게요!',

        // 버튼 추가
        btn_save: '저장',
        notif_scheduling: '알림 예약 중',

        // 시간 단위
        label_minutes_unit: '{n}분',
        label_hours_unit: '{n}시간',

        // 복습 알림 오버레이
        forgotten_empty: '구절을 잊을만 할 때 알려드립니다!',
        forgotten_review_step: '- {step}회차 복습 시점',
        forgotten_overlay_title: '🕑 복습하기 좋은 때',
        forgotten_overlay_subtitle: '스테이지를 복습해서 <br>기억을 다지세요!',
        forgotten_overlay_close: '닫기',

        // 토스트 메시지
        toast_read_aloud: '🗣️ 소리내어 읽으면 암기 효과가 2배!',
        toast_read_aloud_quick: '💡 소리내어 읽으면 암기 효과가 2배!',
        toast_boss_mid: '🛡️ 소리 내어 읽으며 용을 물리칩시다!',
        toast_boss_normal: '⚔️ 진리를 나팔같이 외쳐 용을 잡으세요!',
        toast_training_repeat: '⚔️ 집중 훈련: Step {step} 반복 모드',
        toast_hardship_start: '{icon} {title} 시작',

        // 알림 설정 모달
        notif_modal_title: '🔔 알림 설정',
        notif_modal_desc: '매일 지정한 시간에 복습 알림을 보내드립니다.<br>최대 3개까지 설정할 수 있습니다.',
        notif_add_time: '+ 시간 추가',
        notif_save: '저장',
        notif_close: '닫기',

        // 스테이지 진입 애니메이션
        skip_transition: '넘기기 ⏭',

        // 랭킹 / 명예의 전당
        ranking_loading_tribe: '📡 {name} 랭킹 불러오는 중...',
        ranking_loading_zion: '📡 시온성 랭킹 불러오는 중...',
        ranking_loading_weekly_hall: '📡 주간 명예의 전당 불러오는 중...',
        ranking_loading_monthly_hall: '📡 월간 명예의 전당 불러오는 중...',
        ranking_loading: '📡 데이터 불러오는 중...',
        ranking_loading_total_hall: '📡 누적 명예의 전당 불러오는 중...',
        ranking_empty_season: '지난 시즌 기록이 없습니다.<br>(역사가 이제 막 시작되었습니다)',
        ranking_empty_weekly: '아직 기록이 없습니다.<br>첫 번째 주인공이 되어보세요!',
        ranking_empty_total: '아직 누적 랭킹 데이터가 없습니다.<br>잠시 후 다음 스냅샷을 기다려주세요!',
        ranking_load_fail: '데이터를 불러오지 못했습니다.',
        ranking_empty_year_snapshot: '이번 연도 스냅샷 데이터가 없습니다.',
        ranking_empty_year_tribe: '아직 승점을 획득한 지파가 없습니다.',
        ranking_empty_battle: '아직 대항전 데이터가 없습니다.',
        ranking_all_btn: '전체 순위 보기 🔍',
        ranking_no_name: '이름없음',
        ranking_unknown_tribe: '알 수 없음',
        ranking_weekly_hall_title: '지난 주 명예의 전당',
        ranking_monthly_hall_title: '지난 달 명예의 전당',
        label_my_tribe: '내 지파',
        label_my_tribe_ranking: '🧭 내 지파 랭킹',
        label_weekly_rank: '주간 명예',
        label_monthly_rank: '월간 명예',
        label_total_rank: '누적 명예',
        ranking_footer_out: '{mode} 랭킹 100위 밖입니다.',
        ranking_footer_score: '점 (내 점수)',
        ranking_footer_outside: '순위<br>외',
        ranking_board_title: '🏆 킹스로드 랭킹 보드',
        ranking_timer_loading: '⏳ 시간 계산 중...',
        ranking_update_schedule: '🔄 06시, 정오(12:00) · 18시, 자정(00:00)에 업데이트됩니다',
        ranking_find_my_rank: '📍 내 순위 찾기',
        ranking_my_score_panel: '📊 나의 승점 패널',
        ranking_total_score: '👑 누적 승점',
        ranking_weekly_score: '주간 승점 (매주 리셋)',
        ranking_monthly_score: '월간 승점',
        ranking_week_label: '주차:',
        ranking_month_label: '월:',
        ranking_yearly_battle: '⚔️ 2026 12지파 대항전',
        ranking_yearly_battle_full: '⚔️ 2026 12지파 대항전 전체 순위',
        ranking_castle_lv: '🏰 성전 Lv.{lv}',
        ranking_pts: '점',
        label_zion: '시온성',
        label_zion_ranking: '시온성 랭킹',
        ranking_top_percent: '상위<br>{pct}%',
        reward_no_reward_msg: '지파 또는 시온성 랭킹의 참여 인원이<br>100명 미만이어서 이번 주 보상이 없습니다.',
        reward_confirm_btn: '확인',
        reward_last_week_title: '지난 주 랭킹 결과',
        reward_score_label: '승점',
        reward_claim_btn: '💎 {count} 보석 수령하기',
        ranking_medal_gold: '🥇 금메달',
        ranking_medal_silver: '🥈 은메달',
        ranking_medal_bronze: '🥉 동메달',
        ranking_rank_n: '{n}위',
        ranking_yearly_desc: '(각 지파 상위 12,000명 기여도 합산)',
        ranking_snapshot_waiting: '📡 스냅샷을 기다리는 중입니다...',
        ranking_glory_coming: '다가올 영광',
        ranking_glory_desc: '내년 연말정산 이후,<br>이곳에 위대한 역사가 보존됩니다.',
        ranking_reward_notice: '🎁 지파 순위 보상은 해당 주에 <strong style="color:#bdc3c7;">지파원 100명 이상</strong>이 참여해야 지급됩니다.<br>시온성 랭킹 보상은 전체 100명 이상 참여 시 지급됩니다.',
        ranking_tab_weekly: '주간 명예',
        ranking_tab_monthly: '월간 명예',
        ranking_tab_total: '누적 명예의 전당 (All-Time)',
        ranking_tab_weekly_full: '🏛️ 주간 명예의 전당',
        ranking_tab_monthly_full: '📜 월간 명예의 전당',
        ranking_tab_total_full: '💎 누적 명예의 전당 (All-Time)',
        ranking_modal_default_title: '랭킹',
        btn_go_back: '돌아가기',
        btn_chosung: '초성 보기',
        btn_chosung_off: '초성 끄기 👁️',
        btn_ultimate_memory: '궁극의 암기',
        btn_ultimate_memory_off: '힌트 보기',
        hardship_memory_not_filled: '글자 수를 모두 채운 후 정답을 확인하세요.',
        btn_read: '읽기',
        btn_retry_perfect: '다시하기: 눈 감고도 외울 때까지!',
        btn_next_stage: '다음 단계로 ▶',
        btn_remove_wrong: '오답 빼기',
        btn_reset: '🔄 리셋',
        btn_castle_build_cost: '🔨 건설하기 (💎 {cost})',
        btn_castle_build_locked_cost: '🔒 건설 불가 (필요: 💎 {cost})',
        label_cycle_display: '사이클 {cur}/{total}',
        label_verse_range: '{start}절 ~ {end}절',
        label_boss_appear: '🐉 보스 출현',
        label_dragon_hp: '용 HP:',
        btn_reassemble: '다시\n조립',
        btn_attack: '⚔️ 공격하기',
        tower_instruction: '세 단어 중 순서에 맞는 단어를 고르세요!',
        tower_complete: '🎉 완성!',
        tower_wrong: '앗! 다른 단어입니다.',
        tower_pick: '알맞은 단어를 고르세요!',
        step3_indicator: 'Step 3. 다음 빈칸에 들어갈 단어를 고르세요!',
        label_kings_step_btn: '👑 왕의 길 {step}단계',
        label_unlock_timer: '해금까지 {time}',
        toast_server_save_fail_short: '⚠️ 서버 저장 실패: {msg}',
        notif_scheduling_dots: '알림 예약 중...',
        label_score_zero: '승점 0',
        label_progress_verses: '{cur}/{total}절',
        label_score_display: '승점 {score}',
        btn_done_check: '✓ 완료',
        label_revelation_ref: '계시록 {ch}장 {v}절',
        review_status_retry: '⚡ 재시도 하여 다음 단계로!',
        review_status_retry_remain: '🔄 재도전 {n}회 남음',
        review_status_calculating: '계산중',
        review_status_first: '{gem}💎 첫 학습!',
        btn_step1_next: '다 외웠다! 성령 충만! 다음 단계로 ▶',
        review_dot_start: '시작',
        review_dot_10m: '10분 후',
        review_dot_1h: '1시간 후',
        review_dot_6h: '6시간 후',
        review_dot_1d: '1일 후',
        review_dot_3d: '3일 후',
        review_dot_days: '{n}일 후',
        review_dot_hours: '{n}시간 후',
        label_preparing: '준비 중...',

        // 업적
        achievement_conquered: '👑 정복',
        achievement_claim: '받기',
        achievement_in_progress: '진행중',

        // 도감
        library_preparing: '🚧 데이터 준비 중',
        library_title: '📖 도감',
        library_help_what_title: '🎯 도감이란?',
        library_help_what_desc: '각 구절을 여러 번 훈련하면서 <strong>\'도감 점수\'</strong>를 모아갑니다. 점수가 높아질수록 더 강한 보너스를 얻습니다.',
        library_help_score_title: '📊 점수 획득 방식',
        library_help_score_items: '• 구절 1회 클리어: 10점<br>• 구절 5회 이상: 20점<br>• 구절 10회 이상: 30점<br>• 구절 20회 이상: 50점',
        library_help_rank_title: '⭐ 깨달음의 경지 보너스',
        library_help_rank_items: '• 1000점: 보석 5% 추가 획득<br>• 2500점: 오답 1회 무시<br>• 6000점: 보석 10%, 승점 5% 추가<br>• 14000점: 보석 15%, 오답 2회<br>• 20000점: 보석 15% + 오답 3회 + 승점 15%',
        library_current_score: '현재 도감 점수',
        library_rank_label: '깨달음의 경지',
        library_no_buff: '아직 효과 없음',
        library_next_rank: '다음 <b>[{title}]</b>까지 {remain}점 남음',
        library_max_score: '🎉 명예로운 만점! 온전한 결실을 맺으셨습니다!',
        library_mastery: '숙련도: {count}',
        library_buff_gem: '💎 보석 +{n}%',
        library_buff_wrong: '🐛 오답 {n}회',
        library_buff_score: '⭐ 승점 +{n}%',

        // 업적 화면
        achievement_screen_title: '🎖️ 나의 기록실',
        achievement_screen_subtitle: '당신의 여정이 이곳에 기록됩니다.',
        achievement_progress_current: '현재: {val}',
        achievement_progress_target: '목표: {val}',
        achievement_complete: '(완료)',
        milestone_reward: '보상: 💎 보석 {val}개',
        milestone_btn: '멋져요!',
        result_label_time: '⏱️ 시간',
        result_label_accuracy: '🎯 정확도',
        result_label_earned: '💎 획득',

        // 기록실 상세 통계
        record_badge_score: '🧭 누적 승점 {val} pts',
        record_badge_gems: '💎 누적 보석 {val}개',
        record_badge_playtime: '⏱️ 누적 플레이타임 {val}',
        record_detail_title: '📊 나의 상세 기록 보기',
        record_tile_playtime: '플레이타임(누적)',
        record_tile_avg7d: '최근 7일 평균',
        record_tile_normal: '일반 스테이지 클리어',
        record_tile_bossmid: '중간/보스 클리어',
        record_tile_gems: '누적 획득 보석',
        record_tile_score: '누적 획득 승점',
        record_tile_memory: '총 기억레벨 합계',
        record_count: '{n}개',
        record_memory_lv: '{n} Lv',

        // 감사한 분들 / 공지사항 모달
        thanks_modal_title: '감사한 분들',
        notice_modal_title: '📢 공지사항',

        // 복습 모드 선택 모달
        review_mode_title: '학습 모드 선택',
        review_mode_subtitle: '완료한 구절입니다.',
        review_mode_quick_tag: '추천',
        review_mode_quick_title: '빠른 학습 (Step 1, 5)',
        review_mode_quick_desc: '읽기 + 문장 배열 (핵심만!)',
        review_mode_full_title: '전체 학습 (Step 1~5)',
        review_mode_full_desc: '읽기부터 문장 완성까지 꼼꼼하게',

        // 고난 결과
        hardship_result_completed: '🏁 {title} 완주',
        hardship_result_hearts_end: '💀 {title} 종료',
        hardship_result_ended: '⛰️ {title} 종료',
        hardship_session_endurance: '이번 세션에서 {count}절을 확인했습니다.',
        hardship_session_score: '이번 세션 승점 {score}점',
        hardship_result_check: '📘 확인',
        hardship_result_score_label: '🏆 승점',
        hardship_result_back: '맵으로 돌아가기 ▶',
        hardship_gem_summary: '💎 {gem}젬 획득 · {total}개 스테이지 클리어 ({eligible}개 단계 상승)',
        hardship_result_verses: '{count}절',

        // 리그 타이머
        league_timer: '⏰ 이번 리그 종료까지: {time}',
        league_timer_time: '{d}일 {h}시간 {m}분 {s}초',

        // 알림 시스템
        notif_title: '킹스로드 복습 알림',
        notif_daily_body: '오늘의 말씀을 복습할 시간입니다!',
        notif_review_body: '"{title}" 복습할 시간입니다!',
    },
    en: {
        // 버튼
        btn_back: 'Back',
        btn_reward: 'Claim Reward',
        btn_done: 'Completed',
        btn_confirm: 'OK',
        btn_close: 'Close',
        btn_continue: 'Continue',
        btn_quit: 'Quit',
        btn_next: 'Next ▶',
        btn_prev: '◀ Prev',
        btn_revive: 'Revive',
        btn_give_up: '🏳️ Give Up',
        btn_resume: 'Resume Game',
        btn_start: 'Start',
        btn_retry: 'Try Again',
        btn_exit: 'Exit',

        // 스플래시
        splash_sub: 'The Path of the Sealed Priest',
        splash_tap: 'Tap anywhere to begin',

        // 메뉴
        menu_lang_toggle: '🌐 한국어',
        menu_kings_step: '👑 King\'s Road -Step',
        menu_guide: '📖 Game Guide',
        menu_thanks: '👥 Credits',
        menu_home_add: '📱 Add to Home Screen',
        menu_survey: '📝 Survey',
        menu_notice: '📢 Notices',
        menu_report: '🐞 Report Issue',
        menu_data: '💾 Change Device',

        // 데이터 관리소
        data_modal_title: '💾 Data Manager',
        data_export_title: '📤 Save Records (Daily Mission)',
        data_export_desc: 'Download your progress as a <b>text file (.txt)</b> to this device.',
        data_export_btn: '🎁 Save to File',
        data_import_title: '📥 Import Records',
        data_import_desc: 'Find your saved text file and load it, or paste its contents directly.',
        data_import_file_btn: '📁 Find File',
        data_import_paste_btn: '📝 Paste',
        data_reset_title: '⚠️ Reset All Data',
        data_reset_desc: 'Permanently delete all progress on this device and start over from the beginning.',
        data_reset_btn: '🚨 Reset Everything',
        btn_close: 'Close',

        // 게임 가이드
        guide_modal_title: '📖 King\'s Road Guide',
        guide_prev_btn: '◀ Prev',
        guide_p1_title: '🗺️ Journey Overview',
        guide_p1_html: `<p>King's Road is a memorization game where you cycle through <b>Study → Review → Boss</b> to commit Scripture to memory.</p><div style="text-align:center; font-size:14px; line-height:2.2; margin:16px 0;">📖 Study (select a verse)<br>↓<br>🛡️ Checkpoint (every 4–7 verses)<br>↓<br>🐲 Boss Battle (full chapter review)<br>↓<br>🔄 Review → Reinforce Memory</div><p style="font-size:13px; color:#888;">Pick a verse and start reciting. Checkpoints appear every 4–7 verses, and a Boss Battle waits at the end of each chapter.</p>`,
        guide_p2_title: '📝 Recitation Steps',
        guide_p2_html: `<p style="font-size:13px; color:#888; margin-bottom:12px;">Each verse is fully memorized by going through these steps in order.</p><ol style="padding-left:20px; line-height:2;"><li><b>Read</b> — Read the full verse with your eyes</li><li><b>Fill Initials</b> — Find the right word using initial-letter hints</li><li><b>Choose the Word</b> — Pick the correct answer from three options</li><li><b>Fill the Scroll</b> — Fill in the blanks under a time limit</li><li><b>Order the Words</b> — Arrange words in the correct order from memory</li><li><b>Review</b> — Revisit steps 2 & 5 to reinforce memory</li></ol>`,
        guide_p3_title: '⏰ Review Bonus Timing',
        guide_p3_html: `<p style="font-size:13px; color:#888;">The more you review, the <b>bigger the gem reward.</b> Timing is everything!</p><div style="font-size:14px; line-height:1; margin:16px 0;"><div style="padding:10px 12px; border-radius:8px; background:rgba(149,165,166,0.1); margin-bottom:8px;"><span style="color:#95a5a6;">📖 <b>First Clear</b> → Base gems (×1)</span></div><div style="padding:10px 12px; border-radius:8px; background:rgba(142,68,173,0.1); margin-bottom:8px;"><span style="color:#8e44ad; font-weight:bold;">🔱 Review after 10 min → gems ×1.5</span></div><div style="padding:10px 12px; border-radius:8px; background:rgba(41,128,185,0.1); margin-bottom:8px;"><span style="color:#2980b9; font-weight:bold;">⚔️ Review after 1 hr → gems ×2</span></div><div style="padding:10px 12px; border-radius:8px; background:rgba(230,126,34,0.1); margin-bottom:8px;"><span style="color:#e67e22; font-weight:bold;">🎁 Review after 6 hrs → gems ×5</span><br><span style="font-size:12px; color:#aaa;">Must wait the full cooldown to earn the bonus!</span></div></div><p style="font-size:12px; color:#aaa;">💡 The 'Review Timing' button on the map screen will notify you when a cooldown is up!</p>`,
        guide_p4_title: '💎 Gems & Missions',
        guide_p4_html: `<p><b>How to earn gems:</b></p><ul style="padding-left:18px; line-height:1.9; font-size:14px;"><li>Complete studies & reviews (bonus multipliers apply)</li><li>+10% bonus for a perfect run</li><li>Clear daily / weekly missions</li><li>Unlock achievements</li><li>Temple auto-production</li></ul><p style="margin-top:12px;"><b>Mission reset:</b></p><div style="font-size:13px; color:#666; line-height:1.9;">📅 Daily missions — reset at midnight<br>📆 Weekly missions — reset every Monday</div>`,
        guide_p5_title: '🏰 Temple & Achievements',
        guide_p5_html: `<p><b>Temple Construction:</b> Upgrade the temple with gems to increase idle gem production.</p><p style="margin-top:12px;"><b>7 Achievement types:</b></p><ul style="padding-left:18px; line-height:1.9; font-size:13px;"><li>🗓️ Total attendance</li><li>📖 Verses recited</li><li>🐲 Boss victories</li><li>💎 Total gems earned</li><li>✨ Perfect recitations</li><li>🏰 Temple build level</li><li>🌅 Early-morning recitation (before 7 AM)</li></ul>`,

        // 네비
        nav_home: 'Home',
        nav_ranking: 'Ranking',
        nav_mission: 'Mission',
        nav_shop: 'Shop',
        nav_library: 'Library',
        nav_records: 'Records',
        btn_review_timing: 'Review Timing',
        btn_notif_settings: 'Notifications',

        // 상태/타이머
        status_preparing: 'Coming Soon.',
        status_review_now: 'Review Now!',
        status_review_later: 'Review in {time}',
        status_review_bonus: 'Review in {time} (bonus)',
        status_today_done: 'Done Today',
        status_open: '🔓 OPEN',
        status_locked: '🔒 Locked',
        status_new_verses: '🆕 {count} verses ready',
        status_all_unlocked: 'All verses unlocked!',

        // 게임 레이블
        label_chapter: 'Chapter {num}',
        label_verse: 'Verse {num}',
        label_score: 'Score',
        label_hint: 'Hint',
        label_cycle: 'Cycle',
        label_hearts: 'Hearts',
        label_gems: 'Gems',
        label_kings_road: "King's Road",
        label_kings_road_desc: 'A daily memorization journey through Revelation',
        label_free_journey: 'Free Journey',
        label_free_journey_desc: 'Study any verse you want',
        mode_select_title: 'Select Your Journey',
        kings_step_select_title: "👑 King's Road",
        kings_step_select_subtitle: 'Select your memorization pace',
        kings_step_1_num: 'Level 1',
        kings_step_1_desc: '1 verse per day',
        kings_step_1_goal: 'Ch. 1–5 in ~126 days, Ch. 1–10 in ~205 days',
        kings_step_2_num: 'Level 2',
        kings_step_2_desc: '2 verses per day',
        kings_step_2_goal: 'Ch. 1–15 in ~159 days',
        kings_step_3_num: 'Level 3',
        kings_step_3_desc: '3 verses per day',
        kings_step_3_goal: 'Full completion in ~165 days',
        btn_back_nav: '← Back',
        journey_verse: '"Blessed is the one who reads aloud<br>the words of this prophecy, and blessed are those who hear it<br>and take to heart what is written in it,<br>because the time is near."',
        journey_verse_ref: '(Rev 1:3)',
        btn_amen: 'Amen',
        ranking_verse: '"Do you not know that in a race all the runners run,<br>but only one gets the prize?<br>Run in such a way<br>as to get the prize."',
        ranking_verse_ref: '(1 Cor 9:24)',
        kings_header_title: "👑 King's Road Level {step}",
        kings_header_info: 'Day {day} · {count} verses unlocked',
        label_mid_boss: 'Checkpoint',
        label_boss: 'Boss Battle',
        label_hardship: 'Trial',
        label_part: 'Part {cur}/{total}',
        label_next_part: 'Next part: {count} words',
        label_chapter_header: 'Revelation {num}',
        stage_title_normal: 'Rev {ch}:{v}',
        stage_title_midboss: '🛡️ Checkpoint (Rev {ch}:{start}–{end})',
        stage_title_boss: '🐲 BOSS: Conquer Revelation {ch}',
        stage_desc_midboss: 'Review or study {hp} verses at once.',
        stage_desc_boss: 'Defeat the red dragon and complete chapter {ch}!',
        label_this_word: 'this verse',
        label_free: 'Free',
        msg_boss_clear: '🐲 [Dragon Defeated] Reviewed {total} stages! ({eligible} step(s) advanced)',
        msg_midboss_clear: '🛡️ [Checkpoint] Reviewed {total} stages! ({eligible} step(s) advanced)',

        // alert 메시지
        alert_ios_install: 'On iOS Safari, tap the Share button (↑) → "Add to Home Screen".',
        alert_no_prompt: 'Install prompt unavailable. The app may already be installed or your browser does not support it.',
        alert_welcome_new: "🎉 Welcome to King's Road v{ver}!\n\nYour game data has been reset for a fresh start.",
        alert_mission_reward: '🎁 Last mission reward:\n[Score ×{multi} for {min} min] has arrived!',
        alert_gems_received: '💎 You received {count} gems!',
        alert_booster_reserved: '✅ Reserved!\nA [Score ×{multi} for {min} min] booster will activate on your next login.',
        alert_kings_step_changed: "👑 King's Road changed to Step {step}.\nStarting tomorrow, {step} verse(s) will unlock per day.",
        alert_reward_error: 'Error claiming reward. Please try again.',
        alert_chapter_locked: '🔒 Clear the previous chapter first to open the path.',
        alert_verse_locked: '🔒 This verse is not yet unlocked.\nA new verse unlocks each day!',
        alert_spell_incomplete: 'Spell not complete!\n(Current: {cur} / Required: {need})',
        alert_attack_fail: '❌ Attack failed!\n{count} mistake(s) found.',
        alert_defeat: '💔 Defeated... Everything goes dark.',
        alert_revive_no_gems: '💎 Not enough gems. You need {cost} gems to revive.',
        alert_revive_success: '✨ Miraculously recovered!\n(Gems -{cost})',
        alert_data_recovered: '✅ Previous account data restored!\n\nNickname: {nick}\nTag: #{tag}',
        alert_data_load_error: 'Data load error',
        alert_game_switch_error: 'Error switching game. Check the browser console (F12).',
        alert_no_bread: '🥖 No Bread of Life.\nPurchase one from the shop!',
        alert_hearts_full: 'Hearts are already full.',
        alert_hearts_restored: 'Hearts restored. (Current: {cur})',
        alert_hint_no_gems: '💎 Not enough gems! (Required: {cost})',
        alert_hint_read_aloud: 'At this stage, reading aloud is the correct answer! 📣',
        alert_hint_load_error: 'Could not load hint data for this verse.',
        hint_btn_label: '💡 Hint',
        hint_confirm: 'Use {cost} 💎 gems for a hint?',
        hint_modal_header: '💡 Hint 💎{cost}',
        hint_modal_header_free: '💡 Hint <span style="color:#27ae60; font-weight:bold;">Free</span>',
        hint_step2_current: 'Current word: ',
        hint_step3_label: 'Current verse',
        hint_step4_fake: 'Find the fake word — it will be highlighted in red.',
        hint_boss_full_verse: 'Full verse',
        hint_boss_current_part: 'Current part to solve',
        alert_locked_first_clear: 'Clear this verse at least once to unlock.',
        alert_daily_bonus: '🕊️ [Daily Bread]\n\nAs a servant of the saints,\nyou received {count} gems! 💎\n(Current gems: {total})',
        alert_booster_stronger: '🔥 A stronger ×{multi} booster has been applied!',
        alert_booster_extended: '🔥 Booster time extended by {min} minutes!',
        alert_booster_started: '⚡ Score ×{multi} booster active for {min} minutes!',
        alert_ranking_out: 'You are not in the Top 100 ranking.\nKeep going, pilgrim! 🔥',
        alert_hearts_max_reached: 'Cannot increase hearts further (max 30 reached).',
        alert_buy_hearts_no_gems: '💎 Not enough gems! (Required: {cost})',
        alert_buy_hearts_success: '❤️ Max hearts increased to {max}!',
        alert_buy_no_gems: '💎 Not enough gems!',
        alert_buy_success: '✅ [{name}] purchased! (Owned: {count})',
        alert_item_none: 'No items! Purchase from the supply depot.',
        alert_item_hearts_full: 'Hearts are already full!',
        alert_item_bread_used: '🍞 Used Bread of Life! (Hearts +2)',
        alert_castle_max: 'The Kingdom of God is already complete!',
        alert_castle_built: '🎉 Construction complete!\n\n[Lv.{lv} {name}]\n"{desc}"',
        alert_castle_no_gems: 'Not enough gems.\n(Required: {need} / Owned: {have})',
        alert_temple_collected: '💎 Collected {count} temple supply gems!',
        alert_speed_elder: 'Switched to Elder mode (slow speed).',
        alert_speed_fast: 'Switched to fast speed.',
        alert_speed_normal: 'Switched to normal speed.',
        alert_data_reset: 'All data has been reset.\nStarting the game from the beginning.',

        // 모달
        modal_quit_title: 'Leave the Battlefield?',
        modal_quit_msg: 'Progress may not be saved\nif you leave now.',
        modal_revive_title: 'You have fallen!',
        modal_revive_cost: 'Revive for {cost} gems',
        modal_exit_title: 'Exit App',

        // 기기 변경/데이터
        alert_life_book_verse: '[Ch. {ch} v.{v}]\n\n{text}',
        alert_error_msg: 'Error: {msg}',
        alert_no_save_data: 'No saved data to export.',
        alert_encrypt_error: 'Encryption error occurred.',
        alert_file_saved_share: '📥 File saved to your Downloads folder!\nShare it via Telegram or KakaoTalk to keep it safe.\n\n(Daily mission complete! Claim your reward 🎁)',
        alert_file_saved: '📥 File safely saved to your Downloads folder!\nShare it via Telegram or KakaoTalk to keep it safe.',
        alert_no_code: 'No code entered.',
        alert_pwd_cancelled: 'Password entry was cancelled.',
        alert_wrong_account: '❌ This data belongs to a different account.\nPlease use your own save code.',
        alert_restore_ok: '✅ Data restored!\nRestarting the game.',
        alert_wrong_pwd: '❌ Wrong password!',
        alert_restore_fail: '❌ Data recovery failed!\nThe file may be corrupted or the code is incomplete.',
        alert_welcome_tribe: 'Welcome, {nick} of the [{tribe}] tribe!\n🙏',
        alert_server_disconnect: 'Could not connect to server. Please try again later.',
        alert_tag_not_found: '❌ No recovery data found for that tag.\nCheck the tag or start a new account.',
        alert_recovery_ok: '✅ Recovery complete!\n\nNickname: {nick}\nTag: #{tag}\n\nRestarting the game.',
        alert_recovery_error: 'Recovery error. Please try again.',
        alert_achievement: '🎉 [{title}] achieved!\nYou received 💎{count} gems as a reward.',
        alert_multi_device: '🚨 Login detected on another device.\nFor account security, access on this device has been blocked and reset.',
        alert_unsaved_changes: 'Changes have not been saved.',
        alert_training_start_gt_end: '⚠️ Start position cannot be greater than end position.',
        alert_training_repeat_min: '⚠️ Repeat count must be at least 1.',
        alert_training_no_data: '⚠️ No verse data for Chapter {ch}.',
        alert_training_start_ch_gt_end: '⚠️ Start chapter cannot be greater than end chapter.',
        alert_training_no_verses: '⚠️ No verses found in the selected range.',
        alert_blank_all_filled: 'All letters are already correctly filled.',
        alert_blank_hint_no_gems: '💎 Not enough gems! (Required: {cost})',

        // 게임플레이
        game_hint_instruction: 'Tap words to complete the verse',
        game_lang_switch_ingame: 'Cannot change language during a stage.',
        lang_switch_confirm: 'The app will restart to apply the language change.',
        lang_switch_ok: 'OK',

        // 홈 화면
        btn_journey: '👑 Begin Journey',
        btn_training: '⚔️ Focused Training',
        btn_hardship: '⛰️ Hardship Road',
        training_title: '⚔️ Training Center',
        training_notice: '※ League points and gems are not awarded in training mode.',
        training_range: '📖 Select Training Range',
        training_start: 'Start',
        training_end: 'End',
        training_step: '🏃 Select Training Step',
        training_cycle: '🔁 Repeat Cycles',
        training_cycle_desc: 'Repeats the same step over the selected range each cycle.',
        training_random: 'Train in random order',
        training_go: 'Start Training!',
        home_change: '(edit)',
        home_upgrade_avail: '⬆️ Upgrade Ready',
        castle_build_locked: '🔒 Build',
        castle_build: '🔨 Build',
        castle_past_badge: '🕰️ Past Record',

        // 프로필 모달
        profile_title: 'Pilgrim Registration',
        profile_subtitle: 'Choose your name, department, and tribe.',
        profile_name_tip: '💡 Pick your name from the list below! 👇',
        profile_random_name: '🎲 Random Name',
        profile_dept_label: 'Select Department',
        profile_tribe_label: 'Select Tribe',
        profile_confirm: '✅ Confirm',
        profile_tribe_warn: "⚠️ [Warning] Changing your tribe will reset this year's 12-Tribe Battle contribution (yearly score) to 0!\n\n(Your personal accumulated score is preserved, but your contribution in the new tribe starts from 0.)\n\nAre you sure you want to change tribes?",

        // 결과 화면
        result_training_title: '⚔️ Training Complete!',
        result_stage_clear: '🎉 STAGE CLEAR!',
        result_boss_clear: '🐲 BOSS CLEAR!',
        result_training_streak: "Today's training is complete.",
        result_streak_text: '{days} days on fire!',
        result_exp_training: '📝 Status',
        result_exp_gems: '💎 Earned',
        result_boss_exp: '🏆 Boss Defeated',
        result_boss_defeated: 'Defeated!',
        result_continue_training: 'Back to Home ▶',
        result_continue: 'Continue ▶',
        result_msg_training_done: 'Done',
        result_msg_training_waiting: '⚔️ Training Complete! (No reward)',
        result_msg_waiting: '📖 [Training] Complete! ({gem}💎 min reward — waiting)',
        result_msg_first_clear: '📖 [Training] First clear! ({gem}💎)',
        result_msg_review_done: '📖 [Training] Review #{step} complete! ({gem}💎)',
        result_msg_perfect_timing: '\n🟢 Perfect timing! Your memory will last longer.',
        result_msg_good_timing: "\n🟡 Close call! You barely held on to the memory.",
        result_msg_miss: "📖 [Training] Review done (no gems)\n🔴 The flame went out. Let's reignite it.",
        result_msg_no_gem: '📖 [Training] Complete! (no gems — waiting)',
        quote_first_clear: 'Want to remember this verse?<br>Come back in 10 minutes.',
        quote_perfect: 'Great timing!<br>Review again in {wait}. (Memory level goes up!)',
        quote_good: 'Almost there!<br>Try one more review.',
        quote_good_retry: 'Well done!<br>Moving to the next stage.',
        quote_miss: "No worries! Two more reviews<br>and you'll advance.",
        quote_miss_retry: "Well done! One more review<br>and you'll advance.",
        quote_miss_retry_final: 'Great effort!<br>Moving to the next stage.',
        notif_ask: 'Want a reminder in {wait}?',
        notif_btn: '🔔 Set Reminder',
        boss_quote_perfect: ['This Word is now within you.', 'Not memorized — engraved.', 'The Word has been inscribed on your heart.'],
        boss_quote_good: ['Almost engraved. Just a little more.', 'The outline is forming. It will become clearer next time.'],
        boss_quote_miss: ['A seed has been sown. Water it and it will grow.', 'Everyone starts this way. Trust the system and keep going.'],

        // 미션 UI
        mission_screen_title: 'Missions',
        mission_title: '📜 Royal Missions',
        mission_subtitle: 'Faithfulness is the mark of a king',

        // 상점
        shop_title: '⛺ Zion Mart',
        shop_subtitle: 'Stock up for your journey',
        shop_my_gems: 'My Gems',
        shop_heart_name: 'Steadfast Heart',
        shop_heart_desc: 'Permanently increase max hearts',
        shop_heart_sold_out: 'Sold Out (MAX)',
        shop_heart_done: 'Done',
        shop_btn_buy: 'Buy',
        shop_btn_free: 'Free',
        shop_free_once: 'Free ×1',
        shop_owned: 'Owned: {count}',
        mission_tab_daily: 'Daily',
        mission_tab_weekly: 'Weekly',
        mission_reset_daily: '🕒 Resets every day at midnight',
        mission_reset_weekly: '🕒 Resets every Monday at midnight',
        mission_btn_done: 'Done',
        mission_btn_claim: 'Claim',
        mission_btn_goto: 'Go',
        mission_daily_0_title: 'Daily Login Reward',
        mission_daily_0_desc: 'Automatically completed when you log in today.',
        mission_daily_1_title: 'Learn 1 New Verse',
        mission_daily_1_desc: 'Study a new verse once.',
        mission_daily_2_title: 'Defeat Checkpoint/Boss ×1',
        mission_daily_2_desc: 'Complete a checkpoint or boss.',
        mission_daily_3_title: 'Back Up Your Data',
        mission_daily_3_desc: 'Save your records safely as a text file.',
        mission_weekly_0_title: 'Log In 5 Days',
        mission_weekly_0_desc: 'Consistency builds skill.',
        mission_weekly_1_title: 'Dragon Hunt',
        mission_weekly_1_desc: 'Complete a checkpoint or boss.',
        mission_weekly_2_title: 'Study 15 Verses',
        mission_weekly_2_desc: 'Cumulative 15 study sessions this week.',

        // 고난 길 모달
        hardship_title: 'Hardship Road',
        hardship_subtitle: 'Select a mode, set the range, and begin.',
        hardship_mode_a_title: 'Mode A · Trial of Recitation',
        hardship_mode_a_desc: 'Recite verses aloud and get scored',
        hardship_mode_b_title: 'Mode B · Trial of Address',
        hardship_mode_b_desc: 'Read the text and guess the chapter & verse',
        hardship_mode_c_title: 'Mode C · Trial of Forgetting',
        hardship_mode_c_desc: 'See the reference and type the full verse',
        hardship_config_title: 'Hardship Road Settings',
        hardship_config_placeholder: 'Select a mode.',
        hardship_config_range_label: 'Range',
        hardship_config_all: 'Full (404 verses)',
        hardship_config_range: 'Custom Range',
        hardship_config_start_ch: 'Start',
        hardship_config_end_ch: 'End',
        hardship_config_summary_all: 'Random from all {count} verses.',
        hardship_config_summary_range: 'Random from Ch.{start}–{end}, {count} verses total.',
        hardship_config_start_btn: 'Start Hardship Road',
        hardship_order_title: 'Question Order',
        hardship_order_subtitle: 'Mode C · Trial of Forgetting',
        hardship_order_random_title: 'Random Order',
        hardship_order_random_desc: 'Verses shuffled randomly',
        hardship_order_seq_title: 'Sequential',
        hardship_order_seq_desc: 'From Ch.1 v.1 in order',
        hardship_chapter_option: 'Ch.{num}',
        hardship_endurance_title: 'Trial of Recitation',
        hardship_endurance_summary: 'Recite each verse aloud.',
        hardship_address_title: 'Trial of Address',
        hardship_address_summary: 'Read the text and identify the chapter & verse.',
        hardship_memory_title: 'Trial of Forgetting',
        hardship_memory_summary: 'See the reference and recall the full verse.',
        hardship_endurance_indicator: '[{label}] Recite the verse aloud',
        hardship_endurance_speak_btn: '🎤 Speak',
        hardship_endurance_speak_prompt: 'Tap the button below and recite the verse aloud.',
        hardship_endurance_listening: 'Listening...',
        hardship_endurance_score: '{score}% match · verse {n}',
        hardship_endurance_heard: 'Heard',
        hardship_endurance_no_support: 'Speech recognition is not supported in this browser.',
        hardship_session_endurance_speech: 'You recited {count} verses.',
        hardship_cooldown_today: 'You already received rewards for this chapter today. You can practice, but rewards reset tomorrow.',
        hardship_cooldown_result: 'You already completed this chapter today. Rewards are available again tomorrow.',
        hardship_endurance_info_title: '📋 Trial of Recitation Guide',
        hardship_endurance_info_body: '• Recognition stops when you pause. Recite in one breath.<br>• Accurate pronunciation affects your match rate.<br>• 80%+ → Pass (full score)<br>• 50–79% → Partial score (half)<br>• Under 50% → No score<br>• Average 80%+ clears all stages in the chapter.',
        hardship_endurance_retry: '🔄 Try Again',
        hardship_endurance_confirm: '✅ Next Verse ▶',
        hardship_btn_reveal: 'Reveal',
        hardship_btn_next_verse: 'Next Verse ▶',
        hardship_btn_next: 'Next ⏭️',
        hardship_address_indicator: 'Find the reference',
        hardship_address_ask_chapter: 'Which chapter in Revelation?',
        hardship_address_ask_verse: 'Revelation {ch} — which verse?',
        hardship_address_ch_btn: 'Ch.{ch}',
        hardship_address_v_btn: 'v.{v}',
        hardship_memory_indicator: 'See the reference and recall the full verse',
        btn_ultimate_memory: 'Ultimate Recall',
        btn_ultimate_memory_off: 'Show Hints',
        hardship_memory_not_filled: 'Please fill in all characters before checking.',
        hardship_btn_submit: 'Check Answer',
        hardship_btn_reset_input: 'Reset Input',
        hardship_hint_confirm: '💎 Use {cost} gems to reveal one character?',
        quit_modal_title: 'Leave the battle?',
        quit_modal_message: 'Leaving now may not save<br>your progress.',
        quit_confirm: 'Are you sure you want to quit?\nYour progress will not be saved.',
        hardship_quit_title: 'Quit {title}?',
        hardship_quit_notice_endurance: 'Your current progress order will not be saved.',
        hardship_quit_notice_scored: 'Your score so far will be saved. Your current progress order will not be saved.',
        hardship_back_quit_endurance: 'Leaving now may not save your progress.',
        hardship_back_quit_scored: 'Your score will be saved, but your current progress will not.',
        hardship_kings_btn: '🔥 King\'s Trial',
        hardship_endurance_count: 'Confirmed {n} verse(s) so far.',
        hardship_feedback_correct: 'Correct! {label} · +{pts} pts',
        hardship_feedback_wrong_address: 'Wrong. The answer is {label}.',
        hardship_feedback_wrong_memory: 'Wrong. Correct verse: {text}',
        hardship_step1_indicator: 'Step 1. Read each word aloud and tap \'Read\' to confirm.<br>Repeat until you are confident you have memorized it.',
        step1_tip_text: 'Say each word aloud and tap the \'Read\' button.',
        step1_voice_btn: '🎤 Speak it',
        step1_voice_listening: '🎤 Listening...',
        step1_voice_pass: '✅ Passed! ({score}%)',
        step1_voice_fail: '❌ {score}% — try again or skip',
        step1_voice_skip: 'Skip',
        step1_voice_retry: 'Try Again',
        step1_voice_no_support: 'Speech recognition not supported in this browser',
        step1_info_title: 'ℹ️ Step 1 Guide',
        step1_info_body: '• Tap \'Read\' to reveal one word at a time.<br>• Long-press to reveal words automatically.<br>• Tap \'Speak\' to recite the full verse by voice.<br>• 80%+ match passes; you can retry as many times as you like.',

        // Step 4 스크롤 게임
        step4_indicator: '🔥Fill in the blanks before they burn!',
        step4_speed_slow: '🐢 Slow',
        step4_speed_normal: '🚶 Normal',
        step4_speed_fast: '🐇 Fast',
        step4_fill_hint: 'Tap the cards below to fill in the blanks',
        step4_skip: '⏩ Skip Ahead',

        // Step 5 단어 배열
        step5_indicator: 'Step 5. Tap words to complete the sentence',
        step5_placeholder: 'Tap words to build the sentence',
        step5_tip: '💡 <b>Tip:</b> A hint will appear after 5 seconds!',
        step5_insert_on: 'Insert<br>ON',
        step5_insert_btn: 'Insert<br>Mode',

        // 클리어 결과 alert
        clear_success: '🎉 Clear!',
        clear_first_study: '📖 [Training] 1st study complete! ({gem}💎)',
        clear_review_nth: '📖 [Training] Review #{n} complete! ({gem}💎)',
        clear_review_wait: '📖 [Training] Done! (10💎 min. reward — review in {time} for more)',
        clear_wait_hours: '{h}h {m}m',
        clear_wait_hours_only: '{h}h',
        clear_wait_mins: '{m}m',
        clear_buff_gem: '💎 Enlightenment gem bonus (+{n}%)',
        clear_buff_score: '✨ Enlightenment score bonus (+{n}%)',
        clear_buff_wrong: '👼 Enlightenment wrong correction ({n})',
        clear_base_gem_verse: '💎 Base: {gem} ({cnt} verses × 10)',
        clear_base_gem: '💎 Base: {gem}',
        clear_accuracy: '🎯 Accuracy: {pct}% (wrong: {wrong}) → {gem}',
        clear_castle_bonus: '🏰 Temple bonus: +{gem}',
        clear_perfect_bonus: '⭐ Perfect bonus: +{gem}',
        clear_score: '✨ Score: +{score}',
        clear_total_gem: '💎 Total earned: {gem}',
        clear_repeat_accuracy: '🎯 Accuracy: {pct}% (wrong: {wrong})',
        clear_repeat_perfect: '(💎 Perfect +{gem})',
        clear_repeat_gem: '💎 Gems: +{gem} (temple +{castle})',
        clear_score_blocked_gem: '💎 Gems are awarded normally.',

        // 토스트 메시지
        toast_progress_saved: '💾 Progress saved (Step {n})',
        toast_notif_disabled: 'Notifications disabled.',
        toast_notif_permission: 'Notification permission required. Enable it in browser settings.',
        toast_notif_set: 'Notifications set. ({times})',
        toast_server_save_fail: '⚠️ Server save failed. Check your network and try again.',
        toast_notif_unsupported: 'This browser does not support notifications.',
        toast_remind_later: "We'll remind you in {label}!",

        // 버튼 추가
        btn_save: 'Save',
        notif_scheduling: 'Scheduling...',

        // 시간 단위
        label_minutes_unit: '{n} min',
        label_hours_unit: '{n} hr',

        // 복습 알림 오버레이
        forgotten_empty: "We'll let you know when it's time to review!",
        forgotten_review_step: '- Review #{step}',
        forgotten_overlay_title: '🕑 Good Time to Review',
        forgotten_overlay_subtitle: 'Revisit these stages<br>to strengthen your memory!',
        forgotten_overlay_close: 'Close',

        // 토스트 메시지
        toast_read_aloud: '🗣️ Reading aloud doubles your memorization!',
        toast_read_aloud_quick: '💡 Reading aloud doubles your memorization!',
        toast_boss_mid: '🛡️ Read aloud and defeat the dragon!',
        toast_boss_normal: '⚔️ Shout the truth like a trumpet and catch the dragon!',
        toast_training_repeat: '⚔️ Focused Training: Step {step} repeat mode',
        toast_hardship_start: '{icon} {title} start',

        // 알림 설정 모달
        notif_modal_title: '🔔 Notification Settings',
        notif_modal_desc: 'We\'ll send you daily review reminders at your chosen times.<br>You can set up to 3 times.',
        notif_add_time: '+ Add Time',
        notif_save: 'Save',
        notif_close: 'Close',

        // 스테이지 진입 애니메이션
        skip_transition: 'Skip ⏭',

        // 랭킹 / 명예의 전당
        ranking_loading_tribe: '📡 Loading {name} ranking...',
        ranking_loading_zion: '📡 Loading Zion ranking...',
        ranking_loading_weekly_hall: '📡 Loading Weekly Hall of Fame...',
        ranking_loading_monthly_hall: '📡 Loading Monthly Hall of Fame...',
        ranking_loading: '📡 Loading data...',
        ranking_loading_total_hall: '📡 Loading All-Time Hall of Fame...',
        ranking_empty_season: 'No records from last season.<br>(History has just begun)',
        ranking_empty_weekly: 'No records yet.<br>Be the first to make history!',
        ranking_empty_total: 'No all-time ranking data yet.<br>Check back after the next snapshot!',
        ranking_load_fail: 'Failed to load data.',
        ranking_empty_year_snapshot: 'No snapshot data for this year.',
        ranking_empty_year_tribe: 'No tribes have earned points yet.',
        ranking_empty_battle: 'No battle data yet.',
        ranking_all_btn: 'View Full Rankings 🔍',
        ranking_no_name: 'Unnamed',
        ranking_unknown_tribe: 'Unknown',
        ranking_weekly_hall_title: "Last Week's Hall of Fame",
        ranking_monthly_hall_title: "Last Month's Hall of Fame",
        label_my_tribe: 'My Tribe',
        label_my_tribe_ranking: '🧭 My Tribe Ranking',
        label_weekly_rank: 'Weekly',
        label_monthly_rank: 'Monthly',
        label_total_rank: 'All-Time',
        ranking_footer_out: 'Not in Top 100 for {mode} ranking.',
        ranking_footer_score: 'pts (my score)',
        ranking_footer_outside: 'Outside<br>Ranking',
        ranking_board_title: "🏆 King's Road Ranking Board",
        ranking_timer_loading: '⏳ Calculating...',
        ranking_update_schedule: '🔄 Updates at 06:00, 12:00, 18:00, 00:00',
        ranking_find_my_rank: '📍 Find My Rank',
        ranking_my_score_panel: '📊 My Score Panel',
        ranking_total_score: '👑 Total Score',
        ranking_weekly_score: 'Weekly Score (resets weekly)',
        ranking_monthly_score: 'Monthly Score',
        ranking_week_label: 'Week:',
        ranking_month_label: 'Month:',
        ranking_yearly_battle: '⚔️ 2026 12-Tribe Battle',
        ranking_yearly_battle_full: '⚔️ 2026 12-Tribe Battle — Full Rankings',
        ranking_castle_lv: '🏰 Temple Lv.{lv}',
        ranking_pts: 'pts',
        label_zion: 'Zion',
        label_zion_ranking: 'Zion Ranking',
        ranking_top_percent: 'Top<br>{pct}%',
        reward_no_reward_msg: 'Fewer than 100 participants in the tribe or Zion ranking this week — no rewards issued.',
        reward_confirm_btn: 'OK',
        reward_last_week_title: "Last Week's Results",
        reward_score_label: 'Score',
        reward_claim_btn: '💎 Claim {count} Gems',
        ranking_medal_gold: '🥇 Gold',
        ranking_medal_silver: '🥈 Silver',
        ranking_medal_bronze: '🥉 Bronze',
        ranking_rank_n: '#{n}',
        ranking_yearly_desc: '(Top 12,000 per tribe combined)',
        ranking_snapshot_waiting: '📡 Waiting for snapshot...',
        ranking_glory_coming: 'Glory to Come',
        ranking_glory_desc: 'After next year\'s year-end,<br>great history will be preserved here.',
        ranking_reward_notice: '🎁 Tribe ranking rewards require <strong style="color:#bdc3c7;">100+ members</strong> from your tribe to participate that week.<br>Zion ranking rewards require 100+ total participants.',
        ranking_tab_weekly: 'Weekly Hall',
        ranking_tab_monthly: 'Monthly Hall',
        ranking_tab_total: 'All-Time Hall of Fame',
        ranking_tab_weekly_full: '🏛️ Weekly Hall of Fame',
        ranking_tab_monthly_full: '📜 Monthly Hall of Fame',
        ranking_tab_total_full: '💎 All-Time Hall of Fame',
        ranking_modal_default_title: 'Rankings',
        btn_go_back: 'Back',
        btn_chosung: 'Show Initials 💡',
        btn_chosung_off: 'Hide Initials 👁️',
        btn_read: 'Read',
        btn_retry_perfect: 'Retry: Until you know it cold!',
        btn_next_stage: 'Next Stage ▶',
        btn_remove_wrong: 'Remove Wrong',
        btn_reset: '🔄 Reset',
        btn_castle_build_cost: '🔨 Build (💎 {cost})',
        btn_castle_build_locked_cost: '🔒 Cannot Build (Need: 💎 {cost})',
        label_cycle_display: 'Cycle {cur}/{total}',
        label_verse_range: 'v.{start} – v.{end}',
        label_boss_appear: '🐉 Boss Appears',
        label_dragon_hp: 'Dragon HP:',
        btn_reassemble: 'Re-\nassemble',
        btn_attack: '⚔️ Attack!',
        tower_instruction: 'Choose the word that fits in order!',
        tower_complete: '🎉 Complete!',
        tower_wrong: 'Oops! Wrong word.',
        tower_pick: 'Pick the correct word!',
        step3_indicator: 'Step 3. Choose the word that fills the blank!',
        label_kings_step_btn: "👑 King's Road Step {step}",
        label_unlock_timer: 'Unlocks in {time}',
        toast_server_save_fail_short: '⚠️ Server save failed: {msg}',
        notif_scheduling_dots: 'Scheduling...',
        label_score_zero: 'Score 0',
        label_progress_verses: '{cur}/{total} verses',
        label_score_display: 'Score {score}',
        btn_done_check: '✓ Done',
        label_revelation_ref: 'Revelation {ch}:{v}',
        review_status_retry: '⚡ Retry to advance!',
        review_status_retry_remain: '🔄 {n} retries left',
        review_status_calculating: '...',
        review_status_first: '{gem}💎 First time!',
        btn_step1_next: "I've got it! Spirit-filled! Next Stage ▶",
        review_dot_start: 'Start',
        review_dot_10m: '10 min',
        review_dot_1h: '1 hr',
        review_dot_6h: '6 hr',
        review_dot_1d: '1 day',
        review_dot_3d: '3 days',
        review_dot_days: '{n} days',
        review_dot_hours: '{n} hr',
        label_preparing: 'Loading...',

        // 업적
        achievement_conquered: '👑 Conquered',
        achievement_claim: 'Claim',
        achievement_in_progress: 'In Progress',

        // 도감
        library_preparing: '🚧 Loading...',
        library_title: '📖 Collection',
        library_help_what_title: '🎯 What is the Collection?',
        library_help_what_desc: 'As you train each verse repeatedly, you earn <strong>Collection Points</strong>. The higher your score, the stronger the bonuses.',
        library_help_score_title: '📊 How Points Are Earned',
        library_help_score_items: '• 1st clear: 10 pts<br>• 5+ clears: 20 pts<br>• 10+ clears: 30 pts<br>• 20+ clears: 50 pts',
        library_help_rank_title: '⭐ Enlightenment Rank Bonuses',
        library_help_rank_items: '• 1000 pts: +5% gems<br>• 2500 pts: 1 wrong forgiven<br>• 6000 pts: +10% gems, +5% score<br>• 14000 pts: +15% gems, 2 wrong forgiven<br>• 20000 pts: +15% gems, 3 wrong forgiven, +15% score',
        library_current_score: 'Collection Score',
        library_rank_label: 'Enlightenment Rank',
        library_no_buff: 'No effect yet',
        library_next_rank: '{remain} pts until <b>[{title}]</b>',
        library_max_score: '🎉 Perfect score! You have borne full fruit!',
        library_mastery: 'Mastery: {count}',
        library_buff_gem: '💎 Gems +{n}%',
        library_buff_wrong: '🐛 {n} wrong forgiven',
        library_buff_score: '⭐ Score +{n}%',

        // 업적 화면
        achievement_screen_title: '🎖️ My Records',
        achievement_screen_subtitle: 'Your journey is recorded here.',
        achievement_progress_current: 'Current: {val}',
        achievement_progress_target: 'Target: {val}',
        achievement_complete: '(Complete)',
        milestone_reward: 'Reward: 💎 {val} Gems',
        milestone_btn: 'Awesome!',
        result_label_time: '⏱️ Time',
        result_label_accuracy: '🎯 Accuracy',
        result_label_earned: '💎 Earned',

        // 기록실 상세 통계
        record_badge_score: '🧭 Total Score {val} pts',
        record_badge_gems: '💎 Total Gems {val}',
        record_badge_playtime: '⏱️ Total Playtime {val}',
        record_detail_title: '📊 My Detailed Stats',
        record_tile_playtime: 'Playtime (Total)',
        record_tile_avg7d: '7-Day Avg',
        record_tile_normal: 'Normal Stage Clears',
        record_tile_bossmid: 'Mid/Boss Clears',
        record_tile_gems: 'Total Gems Earned',
        record_tile_score: 'Total Score Earned',
        record_tile_memory: 'Total Memory Level',
        record_count: '{n}',
        record_memory_lv: '{n} Lv',

        // 감사한 분들 / 공지사항 모달
        thanks_modal_title: 'Credits',
        notice_modal_title: '📢 Notices',

        // 복습 모드 선택 모달
        review_mode_title: 'Study Mode',
        review_mode_subtitle: 'You have completed this verse.',
        review_mode_quick_tag: 'Recommended',
        review_mode_quick_title: 'Quick Study (Step 1, 5)',
        review_mode_quick_desc: 'Read + Arrange (key steps only!)',
        review_mode_full_title: 'Full Study (Step 1~5)',
        review_mode_full_desc: 'From reading to full completion',

        // 고난 결과
        hardship_result_completed: '🏁 {title} Completed',
        hardship_result_hearts_end: '💀 {title} Ended',
        hardship_result_ended: '⛰️ {title} Ended',
        hardship_session_endurance: 'You confirmed {count} verses this session.',
        hardship_session_endurance_speech: 'You recited {count} verses. Average accuracy: {avg}',
        hardship_session_score: 'Session score: {score} pts',
        hardship_result_check: '📘 Confirmed',
        hardship_result_score_label: '🏆 Score',
        hardship_result_back: 'Back to Map ▶',
        hardship_gem_summary: '💎 {gem} gems · {total} stages cleared ({eligible} leveled up)',
        hardship_result_verses: '{count} verses',

        // 리그 타이머
        league_timer: '⏰ Time until league ends: {time}',
        league_timer_time: '{d}d {h}h {m}m {s}s',

        // 알림 시스템
        notif_title: "King's Road Review",
        notif_daily_body: "Time to review today's verse!",
        notif_review_body: 'Time to review "{title}"!',
    }
};

let currentLang = localStorage.getItem('lang') || 'ko';

function t(key, vars) {
    let str = (LANG[currentLang] && LANG[currentLang][key] !== undefined)
        ? LANG[currentLang][key]
        : (LANG['ko'][key] !== undefined ? LANG['ko'][key] : key);
    if (vars) {
        Object.keys(vars).forEach(k => {
            str = str.replace(new RegExp('\\{' + k + '\\}', 'g'), vars[k]);
        });
    }
    return str;
}

function applyI18nToStaticHTML() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key);
    });
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
        const key = el.getAttribute('data-i18n-html');
        el.innerHTML = t(key);
    });
    document.documentElement.lang = currentLang;
    const langBtn = document.getElementById('lang-toggle-btn');
    if (langBtn) langBtn.textContent = t('menu_lang_toggle');
    const hardshipHintLabel = document.getElementById('common-hardship-hint-label');
    if (hardshipHintLabel) hardshipHintLabel.textContent = t('hint_btn_label');
}

function setLang(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    // 동적 생성 모달/화면 제거 (다음 열 때 새 언어로 재생성)
    const dataModal = document.getElementById('data-modal');
    if (dataModal) dataModal.remove();
    const lifeBookScreen = document.getElementById('life-book-screen');
    if (lifeBookScreen) lifeBookScreen.remove();
    const achievementScreen = document.getElementById('achievement-screen');
    if (achievementScreen) achievementScreen.remove();
    const shopScreen = document.getElementById('shop-screen');
    if (shopScreen && typeof updateShopUI === 'function') updateShopUI();
    applyI18nToStaticHTML();
    if (typeof renderChapterMap === 'function') renderChapterMap();
    if (typeof updateKingsRoadHomeInfo === 'function') updateKingsRoadHomeInfo();
    if (typeof updateMissionUI === 'function') updateMissionUI();
    // 고난 길 config 모달이 열려있으면 챕터 옵션 텍스트 갱신
    const hardshipConfigModal = document.getElementById('hardship-config-modal');
    if (hardshipConfigModal && hardshipConfigModal.style.display !== 'none') {
        const startSel = document.getElementById('hardship-start-chapter');
        const endSel = document.getElementById('hardship-end-chapter');
        if (startSel && endSel) {
            const startVal = startSel.value;
            const endVal = endSel.value;
            startSel.innerHTML = '';
            endSel.innerHTML = '';
            for (let c = 1; c <= 22; c++) {
                const label = t('hardship_chapter_option', { num: c });
                startSel.appendChild(Object.assign(document.createElement('option'), { value: String(c), innerText: label }));
                endSel.appendChild(Object.assign(document.createElement('option'), { value: String(c), innerText: label }));
            }
            startSel.value = startVal;
            endSel.value = endVal;
            updateHardshipConfigRangeUI();
        }
    }
    if (typeof renderMissionList === 'function' && typeof currentMissionTab !== 'undefined') {
        // 미션 탭 버튼 텍스트 갱신
        const tabs = document.querySelectorAll('.mission-tabs .tab-btn');
        if (tabs.length >= 2) {
            tabs[0].textContent = t('mission_tab_daily');
            tabs[1].textContent = t('mission_tab_weekly');
        }
        const missionTitle = document.querySelector('#mission-screen .map-header div');
        if (missionTitle) missionTitle.textContent = t('mission_screen_title');
        renderMissionList(currentMissionTab);
    }
    if (typeof updateCastleView === 'function') updateCastleView();
    if (typeof updateHintButtonLabels === 'function') updateHintButtonLabels();
    // 스테이지 시트가 열려있으면 재렌더링
    const stageSheet = document.getElementById('stage-sheet');
    if (stageSheet && stageSheet.classList.contains('open') && typeof openStageSheet === 'function' && typeof currentOpenChapterData !== 'undefined' && currentOpenChapterData) {
        openStageSheet(currentOpenChapterData);
    }
    // 현재 선택된 게임 모드 버튼 텍스트 갱신
    const _modeKeys = ['btn_journey', 'btn_training', 'btn_hardship'];
    const _journeyBtn = document.getElementById('start-journey-btn');
    if (_journeyBtn && typeof currentGameModeIndex !== 'undefined') {
        _journeyBtn.textContent = t(_modeKeys[currentGameModeIndex] || 'btn_journey');
    }
    // 훈련 모달 드롭다운 갱신 (열려있을 때)
    if (document.getElementById('train-start-chapter')) {
        if (typeof initTrainingChapters === 'function') initTrainingChapters();
    }
}

function toggleLang() {
    const gameScreen = document.getElementById('game-screen');
    if (gameScreen && gameScreen.classList.contains('active')) {
        if (typeof showToast === 'function') showToast(t('game_lang_switch_ingame'));
        else alert(t('game_lang_switch_ingame'));
        return;
    }
    const nextLang = currentLang === 'ko' ? 'en' : 'ko';
    const msg = nextLang === 'en'
        ? 'The app will restart to apply the language change.'
        : '언어 변경을 위해 앱을 재시작합니다.';
    if (!confirm(msg)) return;
    localStorage.setItem('lang', nextLang);
    location.reload();
}
// ──────────────────────────────────────────────

function preloadCastleImage(level) {
    const bp = castleBlueprints[Math.min(level, castleBlueprints.length - 1)];
    if (!bp || !bp.img) return;
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = 'images/' + bp.img;
    link.fetchPriority = 'high';
    document.head.appendChild(link);
}

// 🌟 [추가] 브라우저에 저장된 음소거 상태를 불러옵니다. (앱 전체에서 공유)
let isGlobalMuted = localStorage.getItem('isMuted') === 'true';
let isVoiceRepeat = localStorage.getItem('isVoiceRepeat') === 'true';

function updateVoiceRepeatButtonState(buttonEl) {
    if (!buttonEl) return;
    buttonEl.style.opacity = isVoiceRepeat ? '1' : '0.4';
    buttonEl.style.border = isVoiceRepeat ? '2px solid #f1c40f' : '1px solid #7f8c8d';
}

function updateTempleUpgradeNotification() {
    const badge = document.getElementById('temple-upgrade-noti');
    if (!badge) return;

    const nextBlueprint = castleBlueprints[myCastleLevel + 1];
    const canUpgrade = !!(nextBlueprint && myGems >= nextBlueprint.cost);
    badge.style.display = canUpgrade ? 'block' : 'none';
}

function getChapterTitleHtml(chapterNum) {
    const titles = (currentLang === 'en') ? CHAPTER_TITLES_EN : CHAPTER_TITLES;
    const rawTitle = titles[chapterNum];
    if (Array.isArray(rawTitle)) {
        return rawTitle.join('<br>');
    }
    return rawTitle || t('status_preparing');
}

// [PWA 설치 프롬프트 및 iOS 안내]
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const btn = document.getElementById('add-to-home-btn');
    if (btn) btn.style.display = 'flex';
});

window.addEventListener('DOMContentLoaded', () => {
    applyI18nToStaticHTML();

    const btn = document.getElementById('add-to-home-btn');
    if (btn) {
        // iOS Safari 환경 감지
        const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        if (isIOS && isSafari) {
            btn.style.display = 'flex';
            btn.onclick = function () {
                alert(t('alert_ios_install'));
            };
        } else {
            btn.onclick = async function () {
                if (deferredPrompt) {
                    deferredPrompt.prompt();
                    const { outcome } = await deferredPrompt.userChoice;
                    if (outcome === 'accepted') {
                        btn.style.display = 'none';
                    }
                    deferredPrompt = null;
                } else {
                    alert(t('alert_no_prompt'));
                }
            };
        }
    }

    const repeatBtn = document.getElementById('repeat-toggle-btn');
    if (repeatBtn) {
        updateVoiceRepeatButtonState(repeatBtn);
    }

    updateTempleUpgradeNotification();
});

// [시스템: 경제 및 인벤토리]
let myGems = 0;           // 현재 보유 보석
let myNickname = "순례자";
let myTag = "";
let myPlayerId = "";


/* [수정] 체력 변수 분리 (충돌 방지용) */
let purchasedMaxHearts = 5; // 상점에서 구매한 순수 체력 (이걸 저장합니다)
let maxPlayerHearts = 5;    // 버프가 포함된 실제 게임 체력

let inventory = {
    lifeBread: 0,  // 생명의 떡 개수
};

// [BGM]
let bgmAudio = null;
let bgmEnabled = (localStorage.getItem('kingsRoadBgmOn') !== 'false'); // 기본값: 켜짐

function initBgm() {
    bgmAudio = new Audio('assets/audio/bgm.mp3');
    bgmAudio.loop = true;
    bgmAudio.volume = 0.4;
    updateBgmIcon();
}

function updateBgmIcon() {
    const icon = document.getElementById('bgm-icon');
    if (icon) icon.textContent = bgmEnabled ? '🎵' : '🔇';
}

function toggleBgm() {
    bgmEnabled = !bgmEnabled;
    localStorage.setItem('kingsRoadBgmOn', bgmEnabled);
    if (bgmEnabled) {
        bgmAudio.play().catch(() => {});
    } else {
        bgmAudio.pause();
    }
    updateBgmIcon();
}

function startBgm() {
    if (bgmEnabled && bgmAudio) {
        bgmAudio.currentTime = 0;
        bgmAudio.play().catch(() => {});
    }
}

function stopBgm() {
    if (bgmAudio) bgmAudio.pause();
}

// [시스템: 게임 진행 데이터]
let stageMastery = {}; // ID별 클리어 횟수 저장
let stageClearDate = {}; // verseId → 처음 클리어한 game-day ('YYYY-MM-DD')
let stageLastClear = {}; // ID별 마지막 클리어 시간 (타임스탬프)
let stageNextEligibleTime = {}; // 다음 클리어 가능 시간 (forgetting-curve) [구버전 호환용]
let stageTimedBonus = {}; // 각인 주기 기반 보너스 (때를 따른 양식) [구버전 호환용]
// ★ [v1.1.0 직렬 복습 시스템]
let stageReviewStep = {};      // 각 스테이지의 현재 복습 단계 (1-based)
let stageNextReviewTime = {};  // 다음 복습 가능 시각 (timestamp, 0이면 즉시 가능)
let stagePendingRetry = {};    // 재시도 상태 { type: 'good'|'miss', unlockTime?, remaining? }
let hardshipAddressClearHistory = {}; // 장별 주소의 고난 클리어 기록 { "1": [{correct, total, score, date, duration}, ...] }
let hardshipMemoryClearHistory = {};  // 장별 망각의 고난 클리어 기록 { "1": [{correct, total, score, date, duration}, ...] }
let hardshipEnduranceClearHistory = {}; // 장별 인내의 고난 클리어 기록 { "1": [{avgScore, total, score, date, duration}, ...] }

// ★ [게임 모드 시스템]
let activeMode = 'free'; // 'free' | 'kings'
// 자유여행 데이터 백업 (모드 스왑용)
let _freeStageMastery = {};
let _freeStageClearDate = {};
let _freeStageLastClear = {};
let _freeStageReviewStep = {};
let _freeStageNextReviewTime = {};
// 왕의 길 전용 저장 객체
let kingsRoadData = {
    mastery: {},
    clearDate: {},
    lastClear: {},
    reviewStep: {},
    nextReviewTime: {},
    stepHistory: []
    // stepHistory 항목: { step: 1|2|3, timestamp: Date.now(), baseCount: N }
};

/* ============================================= */

/* (주의) saveGameData의 통합 구현은 아래의 선언부(function saveGameData)에서 관리합니다. */
// 2. 게임 불러오기 (데이터가 없어도 에러 안 나게 방어)
loadGameData = function () {
    const savedString = localStorage.getItem('kingsRoadSave');

    if (!savedString) {
        console.log("📂 저장된 데이터 없음: 신규 시작");
        lastClaimTime = Date.now();
        preloadCastleImage(0);
        return;
    }

    try {
        const parsed = JSON.parse(savedString);

        // ★ 버전 체크: v1.0.0은 마이그레이션, 그 외 구버전은 초기화
        if (!parsed.version || parsed.version !== GAME_VERSION) {
            if (parsed.version === '1.0.0') {
                // v1.0.0 → v1.1.0: 복습 시스템 마이그레이션 (데이터 유지)
                console.log(`🔄 v1.0.0 → v${GAME_VERSION} 마이그레이션 시작`);
            } else {
                console.log(`🔄 게임 버전 업데이트 감지 (${parsed.version || '구버전'} → ${GAME_VERSION})`);
                console.log("📦 데이터를 초기화합니다...");
                localStorage.removeItem('kingsRoadSave');
                alert(t('alert_welcome_new', { ver: GAME_VERSION }));
                lastClaimTime = Date.now();
                return;
            }
        }

        // [기본 복구]
        myCastleLevel = parsed.level || 0;
        preloadCastleImage(myCastleLevel);
        myGems = parsed.gems || 0;
        inventory = parsed.inv || { lifeBread: 0 };
        if (inventory) {
            if (typeof inventory.lifeBread === 'undefined' && typeof inventory.potion !== 'undefined') {
                inventory.lifeBread = inventory.potion;
                delete inventory.potion;
            }
            if (typeof inventory.lifeBread === 'undefined') inventory.lifeBread = 0;
        }
        purchasedMaxHearts = parsed.maxHearts || 5;
        myNickname = parsed.nickname || "순례자";
        myTribe = (parsed.tribe !== undefined) ? parsed.tribe : 0;
        myDept = (parsed.dept !== undefined) ? parsed.dept : 0;
        myTag = String(parsed.tag || "0000");
        myPlayerId = parsed.playerId || "";
        window.currentSessionToken = parsed.sessionToken || "";

        // [진행도 복구]
        stageLastClear = parsed.lastClear || {};
        stageMastery = parsed.mastery || {};
        stageClearDate = parsed.clearDate || {};
        stageMemoryLevels = parsed.memoryLevels || {};
        stageNextEligibleTime = parsed.nextEligibleTime || {}; // 구버전 호환용
        stageTimedBonus = parsed.timedBonus || {}; // 구버전 호환용
        stageReviewStep = parsed.reviewStep || {};
        stageNextReviewTime = parsed.nextReviewTime || {};
        stagePendingRetry = parsed.pendingRetry || {};
        // 마이그레이션: 신규 키가 없고 구버전 데이터가 있으면 변환
        if (Object.keys(stageReviewStep).length === 0 && Object.keys(stageMemoryLevels).length > 0) {
            migrateToSerialReview(parsed);
        }
        if (parsed.leagueData) {
            leagueData = parsed.leagueData;

            // 🌟🌟 [핵심 수술 1단계: 누적 승점 대이동] 🌟🌟
            if (typeof leagueData.totalScore === 'undefined') {
                console.log("🚚 옛날 점수를 누적 승점 금고로 이사합니다...");
                // 1. 기존의 꼬여있던 점수를 누적 점수 금고로 옮겨서 영구 보존!
                leagueData.totalScore = leagueData.myScore || 0;
                // 2. 진짜 이번 주 주간 점수는 0점으로 깨끗하게 새 출발!
                leagueData.myScore = 0;

                // 3. 이사 완료 직후 즉시 서버와 동기화되도록 예약
                localStorage.setItem('forceSyncAfterLoad', 'true');
            }
            // 🌟🌟 [추가] 연간 승점(대항전 기여도) 세팅 🌟🌟
            if (typeof leagueData.yearlyScore === 'undefined') {
                // 올해 처음 시작하는 대항전이므로 현재까지의 누적 점수를 복사해 줌
                leagueData.yearlyScore = 0;
            }
        }
        if (parsed.missions) missionData = parsed.missions;
        if (parsed.boosterData) boosterData = parsed.boosterData;

        // 미션 데이터 구조 보정 (구버전 호환)
        if (!missionData) missionData = {};
        if (!missionData.daily) missionData.daily = {};
        if (!missionData.weekly) missionData.weekly = {};
        if (!Array.isArray(missionData.daily.claimed)) missionData.daily.claimed = [false, false, false];
        if (!Array.isArray(missionData.weekly.claimed)) missionData.weekly.claimed = [false, false, false];

        if (typeof missionData.daily.newClear !== 'number') missionData.daily.newClear = 0;
        if (typeof missionData.daily.differentStages !== 'number') missionData.daily.differentStages = 0;
        if (typeof missionData.daily.checkpointBoss !== 'number') missionData.daily.checkpointBoss = 0;
        if (missionData.daily.claimed.length < 4) missionData.daily.claimed.push(false);
        if (typeof missionData.daily.backup === 'undefined') missionData.daily.backup = 0;
        if (typeof missionData.weekly.attendance !== 'number') missionData.weekly.attendance = 0;
        if (!Array.isArray(missionData.weekly.attendanceLog)) missionData.weekly.attendanceLog = [];
        if (typeof missionData.weekly.dragonKill !== 'number') missionData.weekly.dragonKill = 0;
        if (typeof missionData.weekly.stageClear !== 'number') missionData.weekly.stageClear = 0;

        // [★ 핵심 복구: 업적 및 통계]
        // 저장된 업적 기록이 있으면 덮어쓰고, 없으면 기존(0) 유지
        if (parsed.achievementStatus) {
            achievementStatus = parsed.achievementStatus;
        }

        // 통계 데이터 복구 (별도 키 'stats' 또는 'kingsRoad_stats' 모두 체크)
        if (parsed.stats) {
            Object.assign(userStats, parsed.stats);
        } else {
            const oldStats = localStorage.getItem("kingsRoad_stats");
            if (oldStats) Object.assign(userStats, JSON.parse(oldStats));
        }

        if (parsed.hardshipAddressClearHistory) hardshipAddressClearHistory = parsed.hardshipAddressClearHistory;
        if (parsed.hardshipMemoryClearHistory) hardshipMemoryClearHistory = parsed.hardshipMemoryClearHistory;
        if (parsed.hardshipEnduranceClearHistory) hardshipEnduranceClearHistory = parsed.hardshipEnduranceClearHistory;

        // ★ [게임 모드] 왕의 길 데이터 복구
        if (parsed.kingsMode) {
            kingsRoadData.mastery = parsed.kingsMode.mastery || {};
            kingsRoadData.clearDate = parsed.kingsMode.clearDate || {};
            kingsRoadData.lastClear = parsed.kingsMode.lastClear || {};
            kingsRoadData.reviewStep = parsed.kingsMode.reviewStep || {};
            kingsRoadData.nextReviewTime = parsed.kingsMode.nextReviewTime || {};
            kingsRoadData.stepHistory = parsed.kingsMode.stepHistory || [];
        }
        // 마지막으로 선택한 모드 복원 (기본값 'free')
        activeMode = parsed.activeMode || 'free';
        // 자유여행 데이터를 백업 변수에도 저장
        _freeStageMastery = stageMastery;
        _freeStageClearDate = stageClearDate;
        _freeStageLastClear = stageLastClear;
        _freeStageReviewStep = stageReviewStep;
        _freeStageNextReviewTime = stageNextReviewTime;
        // 왕의 길 모드였으면 전역 변수를 왕의 길 데이터로 스왑
        if (activeMode === 'kings') {
            stageMastery = kingsRoadData.mastery;
            stageClearDate = kingsRoadData.clearDate;
            stageLastClear = kingsRoadData.lastClear;
            stageReviewStep = kingsRoadData.reviewStep;
            stageNextReviewTime = kingsRoadData.nextReviewTime;
        }

        // [기타]
        if (parsed.lastClaimTime) lastClaimTime = parsed.lastClaimTime;
        else { lastClaimTime = Date.now(); saveGameData(); }

        if (parsed.lastPlayed) localStorage.setItem('lastPlayedDate', parsed.lastPlayed);
        if (parsed.streak) localStorage.setItem('streakDays', parsed.streak);

        // [게임 로직 반영]
        // 1. 스테이지 클리어 상태 시각화
        gameData.forEach(chapter => {
            chapter.stages.forEach(stage => {
                if (stageMastery[stage.id] > 0) {
                    stage.cleared = true;
                } else {
                    stage.cleared = false;
                }
                stage.locked = false;
            });
        });

        // 2. 부스터 시간 체크
        if (boosterData && boosterData.active) {
            if (Date.now() < boosterData.endTime) {
                if (typeof startBoosterTimer === 'function') startBoosterTimer();
            } else {
                boosterData.active = false;
                boosterData.multiplier = 1;
            }
        }

        // 3. UI 갱신
        if (typeof updateGemDisplay === 'function') updateGemDisplay();
        if (typeof updateProfileUI === 'function') updateProfileUI();
        if (typeof updateCastleView === 'function') updateCastleView();
        if (typeof recalculateMaxHearts === 'function') recalculateMaxHearts();

        console.log("📂 데이터 불러오기 성공");

    } catch (e) {
        console.error("데이터 로드 실패:", e);
        lastClaimTime = Date.now();
    }
};

/* [시스템] 업적 달성 대기열 (전투 중 방해 금지용) */
var milestoneQueue = [];
var isMilestoneShowing = false;

/* [시스템] 유저 통계 데이터 (기록실용) */
var userStats = {
    loginDays: 0,           // 누적 접속일
    lastLoginDate: "",      // 마지막 접속 날짜
    totalVersesCleared: 0,  // 누적 구절 클리어
    totalBossKilled: 0,     // 보스/중간점검 처치
    totalGemsEarned: 0,     // 누적 획득 보석
    totalScoreEarned: 0,    // 누적 획득 승점
    totalPerfects: 0,       // 퍼펙트 횟수
    maxCastleLevel: 0,      // 성전 최고 레벨
    earlyBirdCounts: 0,     // 새벽 암송 횟수
    accountCreatedAt: 0,    // 계정 생성 시각 (timestamp)
    totalPlaySeconds: 0,    // 누적 플레이타임 (초)
    dailyPlaySeconds: {}    // 일별 플레이타임 (YYYY-MM-DD: seconds)
};

let playSessionStart = null;

function ensurePlaytimeStats() {
    if (!userStats.accountCreatedAt) userStats.accountCreatedAt = Date.now();
    if (typeof userStats.totalPlaySeconds !== 'number') userStats.totalPlaySeconds = 0;
    if (!userStats.dailyPlaySeconds || typeof userStats.dailyPlaySeconds !== 'object') userStats.dailyPlaySeconds = {};
    if (typeof userStats.totalScoreEarned !== 'number') userStats.totalScoreEarned = 0;
}

function getDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function addPlaytimeRange(startMs, endMs) {
    if (!startMs || !endMs || endMs <= startMs) return;
    let cursor = startMs;
    while (cursor < endMs) {
        const currentDate = new Date(cursor);
        const nextDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1);
        const chunkEnd = Math.min(endMs, nextDay.getTime());
        const seconds = Math.floor((chunkEnd - cursor) / 1000);
        const key = getDateKey(currentDate);
        userStats.dailyPlaySeconds[key] = (userStats.dailyPlaySeconds[key] || 0) + seconds;
        userStats.totalPlaySeconds += seconds;
        cursor = chunkEnd;
    }
}

function startPlaySession() {
    if (playSessionStart) return;
    playSessionStart = Date.now();
}

function stopPlaySession() {
    // 🌟 1순위 방어막: 초기화(리셋) 중일 때는 절대 아무 흔적도 남기지 말고 그냥 조용히 퇴장해라!
    if (window.isResetting) return;
    if (!playSessionStart) return;
    const end = Date.now();
    addPlaytimeRange(playSessionStart, end);
    playSessionStart = null;
    saveGameData();
}

function formatDuration(totalSeconds) {
    if (!totalSeconds || totalSeconds <= 0) return "0m";
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
}

function getStageClearCounts() {
    let normal = 0;
    let bossMid = 0;
    const keys = Object.keys(stageMastery || {});
    keys.forEach((id) => {
        if (!stageMastery[id]) return;
        if (id.includes('boss') || id.includes('mid')) {
            bossMid += 1;
            return;
        }
        if (/^\d+-\d+$/.test(id)) normal += 1;
    });
    return { normal, bossMid };
}

function getTotalMemoryLevel() {
    let total = 0;
    // ★ [v1.1.0] stageReviewStep 기준으로 계산 (없으면 구버전 stageMemoryLevels 폴백)
    const source = Object.keys(stageReviewStep || {}).length > 0 ? stageReviewStep : null;
    if (source) {
        Object.keys(source).forEach((id) => {
            if (id.includes('boss')) return;
            total += getMemoryLevelFromStep(source[id] || 1);
        });
    } else {
        Object.keys(stageMemoryLevels || {}).forEach((id) => {
            if (id.includes('boss')) return;
            total += stageMemoryLevels[id] || 0;
        });
    }
    return total;
}

function getAverageDailySecondsLast7Days() {
    if (!userStats.accountCreatedAt) return 0;
    const today = new Date();
    const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
    const startWindow = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
    const startDate = new Date(userStats.accountCreatedAt);
    const startDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const start = startDay > startWindow ? startDay : startWindow;
    if (yesterday < start) return 0;

    let total = 0;
    const dayCount = Math.floor((yesterday - start) / 86400000) + 1;
    const daily = userStats.dailyPlaySeconds || {};
    Object.keys(daily).forEach((key) => {
        if (key >= getDateKey(start) && key <= getDateKey(yesterday)) {
            total += daily[key];
        }
    });

    return dayCount > 0 ? Math.floor(total / dayCount) : 0;
}

function getTotalPlaySecondsNow() {
    const base = (userStats && typeof userStats.totalPlaySeconds === 'number') ? userStats.totalPlaySeconds : 0;
    if (playSessionStart) {
        const extra = Math.floor((Date.now() - playSessionStart) / 1000);
        return base + Math.max(0, extra);
    }
    return base;
}

function isFocusedTrainingSession() {
    return !!(window.isTrainingMode || window.trainingMode === 'training');
}

/* [시스템] 통계 업데이트 매니저 (업적 감지 기능 추가됨) */
function updateStats(type, value = 1) {
    if (typeof userStats === 'undefined') return;
    if (isFocusedTrainingSession() && ['verse_clear', 'boss_kill', 'gem_get', 'perfect', 'earlybird'].includes(type)) return;

    let isChanged = false;

    // 1. 통계 수치 증가 로직 (기존과 동일)
    // ... (기존 switch문 로직 그대로 유지하거나 아래처럼 간단히 작성) ...

    // (편의를 위해 기존 로직을 포함하여 작성합니다)
    switch (type) {
        case 'login':
            const now = new Date();
            const today = now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate();
            if (userStats.lastLoginDate !== today) {
                userStats.loginDays++;
                userStats.lastLoginDate = today;
                isChanged = true;
            }
            break;
        case 'verse_clear': userStats.totalVersesCleared += value; isChanged = true; break;
        case 'boss_kill': userStats.totalBossKilled += value; isChanged = true; break;
        case 'gem_get': userStats.totalGemsEarned += value; isChanged = true; break;
        case 'perfect': userStats.totalPerfects += value; isChanged = true; break;
        case 'castle_levelup':
            if (value > userStats.maxCastleLevel) { userStats.maxCastleLevel = value; isChanged = true; }
            break;
        case 'earlybird': userStats.earlyBirdCounts += value; isChanged = true; break; // earlybird 케이스 추가 필요
    }

    // 새벽 시간(04~07시) 체크 로직은 verse_clear 안에 있던 것 유지 필요
    if (type === 'verse_clear') {
        const h = new Date().getHours();
        if (h >= 4 && h < 7) {
            updateStats('earlybird', 1); // 재귀 호출로 처리
            return; // 재귀 호출 후 아래 로직 중복 실행 방지
        }
    }

    if (isChanged) {
        saveGameData();
        // ★ [핵심] 수치가 변했으니 업적 달성했는지 체크!
        checkAchievementUnlock(type);
    }
}

// [보조] 업적 달성 체크 함수
function checkAchievementUnlock(statType) {
    // achievementStatus와 ACHIEVEMENT_DATA를 사용하여 체크
    // statType 매핑 (통계 키 -> 업적 키)
    // (주의: updateStats의 type과 ACHIEVEMENT_DATA의 키가 약간 다를 수 있음)
    let achKey = statType;
    if (statType === 'gem_get') achKey = 'gem';
    if (statType === 'verse_clear') achKey = 'verse';
    if (statType === 'boss_kill') achKey = 'boss';
    if (statType === 'castle_levelup') achKey = 'castle';
    if (statType === 'earlybird') achKey = 'earlybird';

    const achData = ACHIEVEMENT_DATA[achKey];
    if (!achData) return;

    // 현재 완료된 단계 (예: 0단계 완료)
    const currentTier = achievementStatus[achKey] || 0;

    // 다음 목표 단계가 있는지 확인
    if (currentTier < achData.tiers.length) {
        const targetValue = achData.tiers[currentTier];

        // 내 현재 수치 확인
        const statsMap = {
            login: 'loginDays', verse: 'totalVersesCleared', boss: 'totalBossKilled',
            gem: 'totalGemsEarned', perfect: 'totalPerfects', castle: 'maxCastleLevel', earlybird: 'earlyBirdCounts'
        };
        const myVal = userStats[statsMap[achKey]];

        // ★ [목표 달성!] 
        // 큐에 이미 같은 보상이 들어있는지 확인 (중복 팝업 방지)
        const alreadyInQueue = milestoneQueue.some(q => q.key === achKey && q.tier === currentTier);

        if (myVal >= targetValue && !alreadyInQueue) {
            // 대기열에 추가!
            milestoneQueue.push({
                key: achKey,
                tier: currentTier,
                data: achData
            });
            console.log(`🎉 업적 달성 감지: ${achData.title} (Lv.${currentTier + 1})`);

            // 전투 중이 아니면 바로 보여주기 시도
            tryShowMilestone();
        }
    }
}

/* [시스템: 망각 곡선 및 말씀 숙련도 설정] */
// 레벨별 복습 주기 (Lv.0 -> 1일, Lv.1 -> 3일, Lv.2 -> 7일...)
const FORGETTING_CURVE = [1, 3, 7, 14, 30];

// ★ [v1.1.0] 직렬 복습 시스템: 각 step별 대기 시간과 기본 보석 보상
// step 1이 index 0, waitMs는 "이전 step 클리어로부터 얼마 후에 이 step이 해금되는가"
const REVIEW_SEQUENCE = [
    { waitMs: 0,                          baseGem: 10  }, // step 1: 최초 학습
    { waitMs: 10 * 60 * 1000,            baseGem: 15  }, // step 2: 10분 후
    { waitMs: 60 * 60 * 1000,            baseGem: 20  }, // step 3: 1시간 후
    { waitMs: 6 * 60 * 60 * 1000,        baseGem: 50  }, // step 4: 6시간 후
    { waitMs: 23 * 60 * 60 * 1000,       baseGem: 60  }, // step 5: 23시간(1일) 후
    { waitMs: 71 * 60 * 60 * 1000,       baseGem: 90  }, // step 6: 71시간(3일) 후
    // step 7+: waitMs = 167시간(7일), baseGem = 90 + (step-7)*10
];

// 각 스테이지의 말씀 숙련도를 저장할 객체 (예: { "1-1": 2, "1-2": 0 })
let stageMemoryLevels = {};

/* [시스템] 업적(기록실) 데이터 설정 */
const ACHIEVEMENT_DATA = {
    // 1. 🕯️ 누적 출석 (login)
    login: {
        title: "누적 출석 달성", titleEn: "Attendance Record",
        desc: "성실함이 곧 능력입니다.", descEn: "Faithfulness is your strength.",
        tiers: [1, 3, 7, 14, 30, 50, 100, 365],
        rewards: [50, 100, 300, 500, 1000, 2000, 3000, 5000]
    },
    // 2. 📖 구절 암송 (verse)
    verse: {
        title: "누적 구절 암송", titleEn: "Verses Memorized",
        desc: "일반 훈련(1절)을 완료한 횟수입니다.", descEn: "Number of normal training sessions completed.",
        tiers: [10, 50, 100, 300, 500, 1000, 3000],
        rewards: [100, 300, 500, 1000, 1500, 3000, 5000]
    },
    // 3. 🏆 승리자 (boss)
    boss: {
        title: "중간·보스 승리", titleEn: "Mid/Boss Victories",
        desc: "실전 테스트를 통과한 횟수입니다.", descEn: "Number of battle tests passed.",
        tiers: [1, 5, 10, 30, 50, 100, 200],
        rewards: [200, 500, 1000, 2000, 3000, 5000, 10000]
    },
    // 4. 💎 부자 (gem)
    gem: {
        title: "누적 획득 보석", titleEn: "Gems Collected",
        desc: "지금까지 모은 보석의 총합입니다.", descEn: "Total gems earned so far.",
        tiers: [1000, 5000, 10000, 30000, 50000, 100000, 300000],
        rewards: [100, 300, 500, 1000, 2000, 3000, 5000]
    },
    // 5. ✨ 완벽주의 (perfect)
    perfect: {
        title: "오타 없는 암송", titleEn: "Perfect Recitations",
        desc: "실수 없이(퍼펙트) 클리어한 횟수입니다.", descEn: "Number of flawless (perfect) clears.",
        tiers: [1, 10, 30, 50, 100, 300, 500],
        rewards: [100, 300, 500, 1000, 2000, 3000, 5000]
    },
    // 6. 🏰 성전 건축 (castle)
    castle: {
        title: "성전 건축 단계", titleEn: "Temple Level Reached",
        desc: "나의 성전 레벨 도달 기록입니다.", descEn: "Your highest temple level achieved.",
        tiers: [2, 3, 5, 7, 9, 10, 11],
        rewards: [200, 400, 800, 1500, 2500, 4000, 10000]
    },
    // 7. 🌅 얼리버드 (earlybird)
    earlybird: {
        title: "새벽 암송 달성", titleEn: "Early Bird",
        desc: "새벽(04~07시)에 훈련한 횟수입니다.", descEn: "Number of trainings done at dawn (4–7 AM).",
        tiers: [1, 3, 7, 14, 21, 40, 100],
        rewards: [100, 300, 500, 1000, 2000, 3000, 5000]
    }
};

/* [시스템] 업적 보상 수령 기록 (각 항목별로 몇 단계까지 받았는지 저장) */
var achievementStatus = {
    login: 0,
    verse: 0,
    boss: 0,
    gem: 0,
    perfect: 0,
    castle: 0,
    earlybird: 0
};

// [시스템] 영문+숫자 혼합 4자리 태그 생성 함수 (167만 가지 조합)
function generateRandomTag() {
    // 혼동 문자(O, I, S, Z) 제거
    const chars = "0123456789ABCDEFGHJKMNPQRTUVWXY";
    const banned = ["SHIT","HELL","DAMN","KILL","DEAD","SICK","FUCK","DICK","CRAP","ASS"];
    let result;
    do {
        result = "";
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
    } while (banned.some(w => result.includes(w)) || /^[0-9]+$/.test(result));
    return result;
}

async function generateUniqueTag() {
    if (typeof db === 'undefined' || !db) return generateRandomTag();
    const chars = "0123456789ABCDEFGHJKMNPQRTUVWXY";
    const banned = ["SHIT","HELL","DAMN","KILL","DEAD","SICK","FUCK","DICK","CRAP","ASS"];
    for (let attempt = 0; attempt < 10; attempt++) {
        let candidate = "";
        do {
            candidate = "";
            for (let i = 0; i < 6; i++) {
                candidate += chars.charAt(Math.floor(Math.random() * chars.length));
            }
        } while (banned.some(w => candidate.includes(w)) || /^[0-9]+$/.test(candidate));

        const doc = await db.collection('leaderboard').doc(candidate).get();
        if (!doc.exists) return candidate;
    }
    // 10회 시도 후 실패 시 fallback (사실상 발생 불가)
    return generateRandomTag();
}

/* =========================================
   [시스템: 미션 관리 (일일/주간 통합)]
   ========================================= */
// 미션 데이터 초기화 (구조 변경됨)
let missionData = {
    lastLoginDate: "",      // 일일 초기화용
    weekId: "",             // 주간 초기화용 (예: "2024-W05")

    // 일일 미션 진행도
    daily: {
        loginReward: 0,     // 매일 접속 시 자동 완료
        newClear: 0,        // 신규 훈련 횟수
        differentStages: 0, // 서로 다른 스테이지 클리어 횟수
        checkpointBoss: 0,  // 중보/보스 처치 횟수
        claimed: [false, false, false] // 보상 수령 여부
    },

    // 주간 미션 진행도
    weekly: {
        attendance: 0,      // 주간 출석 일수
        attendanceLog: [],  // 이번 주 출석한 날짜들 ["Mon", "Tue"...] (중복 방지용)
        dragonKill: 0,      // 용/중보/보스 처치 횟수
        stageClear: 0,      // 스테이지 15개 완료 횟수
        claimed: [false, false, false]
    }
};

/* [시스템: 미션 상태 확인 및 초기화] */
function checkMissions() {
    const today = new Date().toDateString(); // "Mon Jan 01 2024"
    const currentWeekId = getWeekId();       // 주차 계산 함수 필요
    let lastMissionDate = localStorage.getItem('lastMissionCheckDate');

    // 1. 일일 미션 초기화 (날짜가 바뀌었으면)
    if (missionData.lastLoginDate !== today) {
        missionData.lastLoginDate = today;
        missionData.daily = {
            loginReward: 0,
            newClear: 0,
            differentStages: 0,
            checkpointBoss: 0,
            backup: 0,
            claimed: [false, false, false, false]
        };
        missionData.daily.loginReward = 1; // 접속 시 즉시 완료
        console.log("📅 새로운 하루가 시작되어 일일 미션이 초기화되었습니다.");

        // 날짜 변경 시 초기화 (stageDailyAttempts 제거)

        // ★ [보상 지급] 전에 예약된 '다음 날' 보상이 있다면 지금 지급
        if (boosterData.nextLoginReward) {
            const reward = boosterData.nextLoginReward;
            activateBooster(reward.multi, reward.min);
            alert(t('alert_mission_reward', { multi: reward.multi, min: reward.min }));
            boosterData.nextLoginReward = null; // 지급 완료 후 삭제
            saveGameData();
        }

        // 주간 출석 체크 (하루에 한 번만)
        updateWeeklyAttendance(today, currentWeekId);
    }

    // 2. 주간 미션 초기화 (주차가 바뀌었으면: 월요일 기준)
    if (missionData.weekId !== currentWeekId) {
        missionData.weekId = currentWeekId;
        missionData.weekly = {
            attendance: 1,          // 월요일 첫 접속이므로 1일 출석
            attendanceLog: [today], // 오늘 날짜 기록
            dragonKill: 0,
            stageClear: 0,
            claimed: [false, false, false]
        };
        console.log("📅 새로운 주가 시작되어 주간 미션이 초기화되었습니다.");
    }

    // 기존 세이브 데이터에 loginReward 필드 없을 때 보정
    if (missionData.daily.loginReward === undefined) {
        missionData.daily.loginReward = 1;
    }

    updateMissionUI();
}

// [보조] 주간 출석 체크 로직 (버그 수정됨)
function updateWeeklyAttendance(today, currentWeek) {
    // 주차가 맞는지 확인
    if (missionData.weekId === currentWeek) {
        // 이미 출석한 날짜인지 기록부(Log)에서 확인
        if (!missionData.weekly.attendanceLog.includes(today)) {
            missionData.weekly.attendanceLog.push(today); // 오늘 날짜 도장 쾅
            missionData.weekly.attendance++;              // 출석 일수 +1
            saveGameData();
        }
    }
}

/* [시스템: 미션 진행도 업데이트 (핵심 기능)] */
// type: 'new'(신규), 'review'(복습), 'dragon'(용)
function updateMissionProgress(type, extraData) {
    if (isFocusedTrainingSession()) return;
    if (type === 'training') type = 'new';
    if (type === 'dragonKill') type = 'dragon';
    if (type === 'review') return;

    // 모든 도감이 열렸는지 체크 (하루 1회만 인정)
    let allOpened = true;
    for (let ch = 1; ch <= 22; ch++) {
        if (bibleData[ch]) {
            for (let idx = 0; idx < bibleData[ch].length; idx++) {
                const sId = `${ch}-${idx + 1}`;
                if (!(stageMastery[sId] && stageMastery[sId] >= 1)) {
                    allOpened = false;
                    break;
                }
            }
            if (!allOpened) break;
        }
    }

    // 👉 저장하는 오늘 날짜 (내 기기의 현지 시간 기준 YYYY-MM-DD 만들기)
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 1 더하기
    const day = String(now.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;

    // 1. 일일 미션: 신규 훈련 or 모든 도감 오픈 시 아무 스테이지든 1회
    if (type === 'new') {
        if (allOpened) {
            if (missionData.daily.anyStageClearDate !== today) {
                missionData.daily.anyStageClearDate = today;
                missionData.daily.newClear = 1; // 하루 1회만 인정
            }
        } else {
            missionData.daily.newClear++;
        }
    }
    // 2. 일일 미션: 다양성 (오늘 처음 클리어하는 스테이지)
    else if (type === 'differentStage') {
        missionData.daily.differentStages = (missionData.daily.differentStages || 0) + 1;
    }
    // 3. 일일 미션: 중보/보스 처치
    else if (type === 'checkpointBoss') {
        missionData.daily.checkpointBoss = (missionData.daily.checkpointBoss || 0) + 1;
    }
    // 4. 주간 미션: 중보/보스 처치 (용 사냥)
    else if (type === 'dragon') {
        missionData.weekly.dragonKill++;
    }

    // 5. 스테이지 클리어 총수 (일반 스테이지에서만)
    if (type === 'new') {
        missionData.weekly.stageClear++;
    }

    saveGameData();
    updateMissionUI();
    // 🌟 [추가 1] 카운트가 올랐으니 배지 상태도 즉시 새로고침!
    if (typeof updateNotificationBadges === 'function') updateNotificationBadges();
}

/* [시스템: 미션 UI 표시 (화면 그리기)] */
function updateMissionUI() {
    const list = document.getElementById('mission-list');
    if (!list) return; // 미션 화면이 없으면 중단

    list.innerHTML = ""; // 기존 목록 초기화

    // ============================================
    // 1. 일일 미션 정의 (신규훈련, 다양성, 중보/보스)
    // ============================================
    const dailyMissions = [
        {
            desc: t('mission_daily_0_title'),
            current: missionData.daily.loginReward || 0,
            target: 1,
            rewardText: "💎 100",
            rewardType: "gem",
            val1: 100, val2: 0,
            claimed: missionData.daily.claimed[0],
            index: 0,
            type: 'daily'
        },
        {
            desc: t('mission_daily_1_title'),
            current: missionData.daily.newClear,
            target: 1,
            rewardText: "💎 300",
            rewardType: "gem",
            val1: 300, val2: 0,
            claimed: missionData.daily.claimed[1],
            index: 1,
            type: 'daily'
        },
        {
            desc: t('mission_daily_2_title'),
            current: missionData.daily.checkpointBoss,
            target: 1,
            rewardText: "💎 500",
            rewardType: "gem",
            val1: 500, val2: 0,
            claimed: missionData.daily.claimed[2],
            index: 2,
            type: 'daily'
        }
    ];

    // ============================================
    // 2. 주간 미션 정의
    // ============================================
    const weeklyMissions = [
        {
            desc: t('mission_weekly_0_title'),
            current: missionData.weekly.attendance,
            target: 5,
            rewardText: "💎 1,000",
            rewardType: "gem",
            val1: 1000, val2: 0,
            claimed: missionData.weekly.claimed[0],
            index: 0,
            type: 'weekly'
        },
        {
            desc: t('mission_weekly_1_title'),
            current: missionData.weekly.dragonKill,
            target: 5,
            rewardText: "💎 3,000",
            rewardType: "gem",
            val1: 3000, val2: 0,
            claimed: missionData.weekly.claimed[1],
            index: 1,
            type: 'weekly'
        },
        {
            desc: t('mission_weekly_2_title'),
            current: missionData.weekly.stageClear,
            target: 15,
            rewardText: "💎 2,000",
            rewardType: "gem",
            val1: 2000, val2: 0,
            claimed: missionData.weekly.claimed[2],
            index: 2,
            type: 'weekly'
        }
    ];

    // ----------------------------------------------------
    // 3. HTML 생성 및 추가 (통합 렌더링)
    // ----------------------------------------------------
    const dailyTitle = document.createElement('div');
    dailyTitle.innerHTML = `<h3 style="margin:10px 0 5px; color:#f1c40f;">☀️ ${t('mission_tab_daily')}</h3>`;
    list.appendChild(dailyTitle);

    dailyMissions.forEach(m => createMissionElement(list, m));

    const weeklyTitle = document.createElement('div');
    weeklyTitle.innerHTML = `<h3 style="margin:20px 0 5px; color:#e67e22;">🏆 ${t('mission_tab_weekly')}</h3>`;
    list.appendChild(weeklyTitle);

    weeklyMissions.forEach(m => createMissionElement(list, m));
}

// [보조] 미션 항목 HTML 만들기
function createMissionElement(parent, m) {
    const item = document.createElement('div');
    item.className = 'mission-item';
    // 스타일: 아이템 박스
    item.style.background = "rgba(255,255,255,0.05)";
    item.style.marginBottom = "8px";
    item.style.padding = "10px";
    item.style.borderRadius = "8px";
    item.style.display = "flex";
    item.style.justifyContent = "space-between";
    item.style.alignItems = "center";

    const isCompleted = m.current >= m.target;
    let btnHtml = "";

    // 버튼 상태 결정
    if (m.claimed) {
        btnHtml = `<button style="background:#7f8c8d; color:#bdc3c7; border:none; padding:5px 10px; border-radius:5px;" disabled>${t('mission_btn_done')}</button>`;
    } else if (isCompleted) {
        btnHtml = `<button id="btn-${m.type}-${m.index}" class="btn-claim-active" style="background:#e74c3c; color:white; border:none; padding:5px 10px; border-radius:5px; cursor:pointer; font-weight:bold; animation: pulse 1s infinite;">${t('mission_btn_claim')}</button>`;
    } else {
        btnHtml = `<button style="background:transparent; color:#7f8c8d; border:1px solid #7f8c8d; padding:5px 10px; border-radius:5px;" disabled>${m.current}/${m.target}</button>`;
    }

    item.innerHTML = `
        <div class="mission-info">
            <div style="font-weight:bold; font-size:0.95rem;">${m.desc}</div>
            <div style="font-size:0.8rem; color:#f39c12; margin-top:3px;">🎁 ${m.rewardText}</div>
        </div>
        ${btnHtml}
    `;
    parent.appendChild(item);

    // 버튼에 클릭 이벤트 연결 (문자열로 넣으면 따옴표 문제가 생기므로 JS로 연결)
    if (isCompleted && !m.claimed) {
        const btn = document.getElementById(`btn-${m.type}-${m.index}`);
        if (btn) {
            btn.onclick = function () {
                claimReward(m.type, m.index, m.rewardType, m.val1, m.val2);
                // 🌟 [추가 2] 보상을 받았으니 배지 상태 새로고침! (빨간 점 끄기)
                if (typeof updateNotificationBadges === 'function') updateNotificationBadges();
            };
        }
    }
}

/* [시스템: 보상 수령 처리 함수] */
function claimReward(type, index, rewardType, value1, value2) {
    // 1. 중복 수령 방지
    let isAlreadyClaimed = (type === 'daily') ? missionData.daily.claimed[index] : missionData.weekly.claimed[index];
    if (isAlreadyClaimed) return;

    // 2. 수령 상태 저장
    if (type === 'daily') {
        missionData.daily.claimed[index] = true;
    } else {
        missionData.weekly.claimed[index] = true;
    }

    // 3. 보상 실제 지급 로직
    if (rewardType === 'gem') {
        // 보석 지급
        myGems += value1;
        updateGemDisplay(); // 상단 보석 UI 갱신 함수
        alert(t('alert_gems_received', { count: value1 }));
        // playSound('coin'); // 효과음이 있다면 주석 해제
    }
    else if (rewardType === 'xp_boost') {
        // 즉시 승점 부스터 발동
        activateBooster(value1, value2); // (배율, 분)
    }
    else if (rewardType === 'next_day_xp') {
        // 내일 보상 예약
        boosterData.nextLoginReward = { multi: value1, min: value2 };
        alert(t('alert_booster_reserved', { multi: value1, min: value2 }));
    }

    // 4. 저장 및 화면 갱신
    saveGameData();
    syncToFirestore(); // [Firestore] 미션 보상 청구
    updateNotificationBadges();
    // ✅ [수정됨] 현재 보고 있는 탭의 화면을 다시 그립니다.
    if (typeof renderMissionList === 'function') {
        renderMissionList(currentMissionTab);
    } else {
        updateMissionUI(); // 혹시 모를 상황을 대비한 예비 코드
    }
}

/* =========================================
   [시스템: 사운드 효과 (Web Audio API)]
   용량 0KB로 효과음을 생성하는 신디사이저입니다.
   ========================================= */
const SoundEffect = {
    ctx: new (window.AudioContext || window.webkitAudioContext)(),

    // ★ [수정] 저장된 설정이 'true'이면 음소거(true), 아니면 기본값 해제(false)
    isMuted: localStorage.getItem('setting_sfx_mute') === 'true',

    toggleMute: function () {
        this.isMuted = !this.isMuted;

        // ★ [추가] 변경된 설정을 저장합니다.
        localStorage.setItem('setting_sfx_mute', this.isMuted);

        return this.isMuted;
    },

    // 소리 재생의 기초 함수
    playTone: function (freq, type, duration, vol = 0.1) {
        if (this.isMuted) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type; // sine, square, sawtooth, triangle
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    },

    // 1. 블록 선택/클릭 소리 (틱!)
    playClick: function () {
        this.playTone(800, 'sine', 0.05, 0.05);
    },

    // 2. 정답 소리 (딩동댕!)
    playCorrect: function () {
        if (this.isMuted) return;
        const now = this.ctx.currentTime;

        // 도-미-솔 (화음 느낌)
        this.createOsc(523.25, 'sine', now, 0.1); // C5
        this.createOsc(659.25, 'sine', now + 0.1, 0.1); // E5
        this.createOsc(783.99, 'sine', now + 0.2, 0.2); // G5
    },

    // 내부용 오실레이터 생성기
    createOsc: function (freq, type, time, dur) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, time);
        gain.gain.setValueAtTime(0.1, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + dur);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(time);
        osc.stop(time + dur);
    },

    // 3. 오답 소리 (삐-! 둔탁하게)
    playWrong: function () {
        if (this.isMuted) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth'; // 톱니파 (거친 소리)
        osc.frequency.setValueAtTime(150, this.ctx.currentTime); // 낮은음
        osc.frequency.linearRampToValueAtTime(100, this.ctx.currentTime + 0.3); // 더 낮아짐

        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
    },

    // 4. 공격 소리 (슈우웅-쾅!)
    playAttack: function () {
        if (this.isMuted) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(800, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.15); // 급격히 떨어짐

        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.15);
    },

    // 5. 클리어 팡파레 (빠바밤!)
    playClear: function () {
        if (this.isMuted) return;
        const now = this.ctx.currentTime;
        // 멜로디
        this.createOsc(523.25, 'square', now, 0.1);       // C5
        this.createOsc(523.25, 'square', now + 0.15, 0.1); // C5
        this.createOsc(523.25, 'square', now + 0.30, 0.1); // C5
        this.createOsc(659.25, 'square', now + 0.45, 0.4); // E5 (길게)
    },
    // 6. 레벨업/퍼펙트 효과음 (띠로리링~)
    playLevelUp: function () {
        if (this.isMuted) return;
        const now = this.ctx.currentTime;
        this.createOsc(523.25, 'sine', now, 0.1); // 도
        this.createOsc(659.25, 'sine', now + 0.1, 0.1); // 미
        this.createOsc(783.99, 'sine', now + 0.2, 0.1); // 솔
        this.createOsc(1046.50, 'sine', now + 0.3, 0.4); // 높은 도
    },

    // 7. 보석 획득 소리 (칭!)
    playGetGem: function () {
        if (this.isMuted) return;
        this.playTone(1200, 'sine', 0.1, 0.1);
    },

    // 8. 구절 공개 소리 - 인내의 고난 (부드러운 페이지 넘김)
    playReveal: function () {
        if (this.isMuted) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.linearRampToValueAtTime(600, now + 0.12);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.08, now + 0.04);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
    },

    // 9. 하트 소모 소리 - 주소/망각의 고난 (둔탁한 충격음)
    playHeartLoss: function () {
        if (this.isMuted) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime;

        osc.type = 'square';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.25);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
    },

    // 10. 힌트 사용 소리 - 망각의 고난 (밝은 동전/벨)
    playHint: function () {
        if (this.isMuted) return;
        const now = this.ctx.currentTime;
        this.createOsc(900, 'sine', now, 0.08);
        this.createOsc(1200, 'sine', now + 0.07, 0.12);
    },

    // 11. 타이핑 소리 - 망각의 고난 (짧은 키보드 클릭, 디바운스 15ms)
    _lastKeystrokeTime: 0,
    playKeyStroke: function () {
        if (this.isMuted) return;
        const now = Date.now();
        if (now - this._lastKeystrokeTime < 15) return;
        this._lastKeystrokeTime = now;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const t = this.ctx.currentTime;

        osc.type = 'square';
        osc.frequency.setValueAtTime(1000, t);

        gain.gain.setValueAtTime(0.05, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.025);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.025);
    }
};

/* =========================================
   [시스템: 음성 파일 음량 정규화]
   음성 MP3 파일을 Web Audio API를 통해 라우팅하여
   파일 간 음량 차이를 균등화하고 효과음과 비슷한
   수준으로 맞춥니다 (DynamicsCompressor 사용).
   ========================================= */
function connectVoiceToAudioContext(audioElem) {
    if (!audioElem || audioElem._voiceConnected) return;
    audioElem._voiceConnected = true;

    try {
        const ctx = SoundEffect.ctx;
        if (ctx.state === 'suspended') ctx.resume();

        const source = ctx.createMediaElementSource(audioElem);

        // 다이나믹 컴프레서: 파일 간 음량 차이 균등화
        const compressor = ctx.createDynamicsCompressor();
        compressor.threshold.setValueAtTime(-24, ctx.currentTime); // -24dBFS 이상 압축
        compressor.knee.setValueAtTime(5, ctx.currentTime);
        compressor.ratio.setValueAtTime(10, ctx.currentTime);      // 압축 비율 10:1
        compressor.attack.setValueAtTime(0.003, ctx.currentTime);  // 3ms
        compressor.release.setValueAtTime(0.2, ctx.currentTime);   // 200ms

        // 압축 후 음량 조정 (효과음 gain 0.1과 유사한 수준으로)
        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(1.2, ctx.currentTime);

        source.connect(compressor);
        compressor.connect(gainNode);
        gainNode.connect(ctx.destination);
    } catch (e) {
        console.warn('음성 정규화 연결 오류:', e);
    }
}

/* [시스템] 12지파 설정 데이터 (보석 이름 복구 완료) */
const TRIBE_DATA = [
    { id: 0, name: "요한", nameEn: "John", core: "#57E3B6", glow: "#009651", gem: "녹보석" },
    { id: 1, name: "베드로", nameEn: "Peter", core: "#8FE3FF", glow: "#00a0e9", gem: "벽옥" },
    { id: 2, name: "부산야고보", nameEn: "B·James", core: "#A5A9FF", glow: "#1d2088", gem: "남보석" },
    { id: 3, name: "안드레", nameEn: "Andrew", core: "#C4F6FF", glow: "#59c3e1", gem: "옥수" },
    { id: 4, name: "다대오", nameEn: "Thaddaeus", core: "#FFB085", glow: "#eb6120", gem: "홍마노" },
    { id: 5, name: "빌립", nameEn: "Philip", core: "#FF8EB9", glow: "#d7005b", gem: "홍보석" },
    { id: 6, name: "시몬", nameEn: "Simon", core: "#FFF59D", glow: "#fdd000", gem: "황옥" },
    { id: 7, name: "바돌로매", nameEn: "Bartholomew", core: "#C2F0E0", glow: "#86cab6", gem: "녹옥" },
    { id: 8, name: "마태", nameEn: "Matthew", core: "#FFE082", glow: "#e39300", gem: "담황옥" },
    { id: 9, name: "맛디아", nameEn: "Matthias", core: "#B4F080", glow: "#6FBA2C", gem: "비취옥" },
    { id: 10, name: "서울야고보", nameEn: "S·James", core: "#78BEFF", glow: "#005dac", gem: "청옥" },
    { id: 11, name: "도마", nameEn: "Thomas", core: "#E09FFF", glow: "#7f1084", gem: "자정" }
];

/* [시스템] 소속 부서 데이터 */
const DEPT_DATA = [
    { id: 0, name: "교역자", nameEn: "Ministers", tag: "교" },
    { id: 1, name: "장로회", nameEn: "Elders", tag: "로" },
    { id: 2, name: "자문회", nameEn: "Advisory", tag: "자" },
    { id: 3, name: "장년회", nameEn: "Adults", tag: "장" },
    { id: 4, name: "부녀회", nameEn: "Women's", tag: "부" },
    { id: 5, name: "청년회", nameEn: "Youth", tag: "청" },
    { id: 6, name: "학생회", nameEn: "Students", tag: "학" },
    { id: 7, name: "유년회", nameEn: "Children", tag: "유" }
];

function hexToRgbString(hex) {
    if (!hex) return null;
    const normalized = hex.replace('#', '').trim();
    if (normalized.length === 3) {
        const r = parseInt(normalized[0] + normalized[0], 16);
        const g = parseInt(normalized[1] + normalized[1], 16);
        const b = parseInt(normalized[2] + normalized[2], 16);
        return `${r}, ${g}, ${b}`;
    }
    if (normalized.length === 6) {
        const r = parseInt(normalized.slice(0, 2), 16);
        const g = parseInt(normalized.slice(2, 4), 16);
        const b = parseInt(normalized.slice(4, 6), 16);
        return `${r}, ${g}, ${b}`;
    }
    return null;
}

function applyHomeThemeByTribe(tribeIdx) {
    const tribe = TRIBE_DATA[tribeIdx] || TRIBE_DATA[0];
    const root = document.documentElement;
    const accent = hexToRgbString(tribe.core);
    const strong = hexToRgbString(tribe.glow);
    if (accent) root.style.setProperty('--home-accent-rgb', accent);
    if (strong) root.style.setProperty('--home-accent-strong-rgb', strong);
    if (accent) root.style.setProperty('--home-btn-a-rgb', accent);
    if (strong) root.style.setProperty('--home-btn-b-rgb', strong);
}

function getTribeName(tribeData) {
    if (!tribeData) return '';
    return currentLang === 'en' ? (tribeData.nameEn || tribeData.name) : tribeData.name;
}
function getDeptName(deptData) {
    if (!deptData) return '';
    return currentLang === 'en' ? (deptData.nameEn || deptData.name) : deptData.name;
}

// 현재 나의 지파 (기본값: 0)
let myTribe = 0;
// 현재 나의 부서 (기본값: 0)
let myDept = 0;

function getDeptTag(deptId) {
    if (deptId === null || typeof deptId === 'undefined') return "";
    const dept = DEPT_DATA[deptId] || DEPT_DATA[0];
    return `<span style="display:inline-block; margin:0 4px; padding:2px 6px; border-radius:6px; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.25); font-size:0.8em; line-height:1;">[${dept.tag}]</span>`;
}

/* [수정] 지파 아이콘 HTML 생성기 (클릭 기능 추가) */
function getTribeIcon(tribeIdx) {
    const tribe = TRIBE_DATA[tribeIdx] || TRIBE_DATA[0];

    // 네온 스타일 (기존 유지)
    const neonStyle = `
        color: ${tribe.core}; 
        text-shadow: 
            0 0 5px ${tribe.glow}, 
            0 0 10px ${tribe.glow}, 
            0 0 20px ${tribe.glow};
        margin-right: 4px; 
        font-size: 1.3em;
        vertical-align: middle;
        display: inline-block;
        cursor: pointer; /* 손가락 모양 커서 추가 */
    `;

    // ★ 핵심: onclick 이벤트 추가
    // event.stopPropagation()은 아이콘을 눌렀을 때 부모 버튼(랭킹 등)이 눌리는 걸 막아줍니다.
    return `<span onclick="showTribeInfo(event, ${tribeIdx})" style="${neonStyle}">✦</span>`;
}

/* [수정] 지파 정보 말풍선 (클릭한 위치에 표시) */
function showTribeInfo(e, id) {
    // 1. 클릭 전파 방지
    if (e) e.stopPropagation();

    const t = TRIBE_DATA[id];
    if (!t) return;

    // 2. 기존 팝업 제거
    const old = document.getElementById('tribe-toast');
    if (old) old.remove();

    // 3. 클릭한 요소(보석)의 위치 계산
    // e.target은 클릭된 <span> 태그입니다.
    const rect = e.target.getBoundingClientRect();
    const targetX = rect.left + (rect.width / 2); // 아이콘의 가로 중심
    const targetY = rect.top; // 아이콘의 윗부분
    const belowY = rect.bottom; // 아이콘의 아랫부분

    // 4. 팝업 생성
    const toast = document.createElement('div');
    toast.id = 'tribe-toast';

    // 스타일: 클릭한 곳 바로 위에 뜨도록 설정
    const toastTop = (targetY - 45 < 8) ? (belowY + 8) : (targetY - 45);

    toast.style.cssText = `
        position: fixed;
        top: ${toastTop}px; /* 상단에 닿으면 아래로 뒤집기 */
        left: ${targetX}px;
        transform: translateX(-50%); /* 정확히 중앙 정렬 */
        
        background-color: rgba(33, 33, 33, 0.95);
        color: white;
        padding: 8px 16px;
        border-radius: 8px;
        border: 1px solid ${t.core};
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        
        z-index: 10000;
        font-size: 0.9rem;
        font-weight: bold;
        white-space: nowrap; /* ★ 글자가 절대 줄바꿈 되지 않게 함 (가로 유지) */
        
        display: flex;
        align-items: center;
        gap: 8px;
        
        animation: bubblePop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        pointer-events: none;
    `;

    // 내용: [보석이름] | [지파이름]
    // 아이콘은 이미 눌렀으니 굳이 팝업 안에 또 안 넣고 글자만 깔끔하게 보여줍니다.
    toast.innerHTML = `
        <span style="color:${t.core}; text-shadow:0 0 5px ${t.glow};">${t.gem}</span>
        <span style="width:1px; height:12px; background:#7f8c8d; opacity:0.5;"></span>
        <span style="color:#ecf0f1;">${t.name} 지파</span>
    `;

    document.body.appendChild(toast);

    // 5. 팝업 애니메이션 (톡 튀어나오는 효과)
    if (!document.getElementById('anim-bubble')) {
        const style = document.createElement('style');
        style.id = 'anim-bubble';
        style.innerHTML = `
            @keyframes bubblePop {
                0% { opacity: 0; transform: translate(-50%, 10px) scale(0.8); }
                100% { opacity: 1; transform: translate(-50%, 0) scale(1); }
            }
            @keyframes bubbleFadeOut {
                0% { opacity: 1; transform: translate(-50%, 0); }
                100% { opacity: 0; transform: translate(-50%, -10px); }
            }
        `;
        document.head.appendChild(style);
    }

    // 6. 1.5초 뒤 사라짐
    setTimeout(() => {
        if (toast) {
            toast.style.animation = "bubbleFadeOut 0.3s forwards"; // 사라지는 애니메이션 적용
            setTimeout(() => { if (toast.parentNode) toast.remove(); }, 300);
        }
    }, 1500);
}


/* [데이터: 성경 전체 데이터베이스] */
const bibleData = {
    1: [
        { text: "예수 그리스도의 계시라 이는 하나님이 그에게 주사 반드시 속히 될 일을 그 종들에게 보이시려고 그 천사를 그 종 요한에게 보내어 지시하신 것이라", chunks: ["예수", "그리스도의", "계시라", "이는", "하나님이", "그에게", "주사", "반드시", "속히", "될", "일을", "그", "종들에게", "보이시려고", "그", "천사를", "그", "종", "요한에게", "보내어", "지시하신", "것이라"] },
        { text: "요한은 하나님의 말씀과 예수 그리스도의 증거 곧 자기의 본 것을 다 증거하였느니라", chunks: ["요한은", "하나님의", "말씀과", "예수", "그리스도의", "증거", "곧", "자기의", "본", "것을", "다", "증거하였느니라"] },
        { text: "이 예언의 말씀을 읽는 자와 듣는 자들과 그 가운데 기록한 것을 지키는 자들이 복이 있나니 때가 가까움이라", chunks: ["이", "예언의", "말씀을", "읽는", "자와", "듣는", "자들과", "그", "가운데", "기록한", "것을", "지키는", "자들이", "복이", "있나니", "때가", "가까움이라"] },
        { text: "요한은 아시아에 있는 일곱 교회에 편지하노니 이제도 계시고 전에도 계시고 장차 오실 이와 그 보좌 앞에 일곱 영과", chunks: ["요한은", "아시아에", "있는", "일곱", "교회에", "편지하노니", "이제도", "계시고", "전에도", "계시고", "장차", "오실", "이와", "그", "보좌", "앞에", "일곱", "영과"] },
        { text: "또 충성된 증인으로 죽은 자들 가운데서 먼저 나시고 땅의 임금들의 머리가 되신 예수 그리스도로 말미암아 은혜와 평강이 너희에게 있기를 원하노라 우리를 사랑하사 그의 피로 우리 죄에서 우리를 해방하시고", chunks: ["또", "충성된", "증인으로", "죽은", "자들", "가운데서", "먼저", "나시고", "땅의", "임금들의", "머리가", "되신", "예수", "그리스도로", "말미암아", "은혜와", "평강이", "너희에게", "있기를", "원하노라", "우리를", "사랑하사", "그의", "피로", "우리", "죄에서", "우리를", "해방하시고"] },
        { text: "그 아버지 하나님을 위하여 우리를 나라와 제사장으로 삼으신 그에게 영광과 능력이 세세토록 있기를 원하노라 아멘", chunks: ["그", "아버지", "하나님을", "위하여", "우리를", "나라와", "제사장으로", "삼으신", "그에게", "영광과", "능력이", "세세토록", "있기를", "원하노라", "아멘"] },
        { text: "볼찌어다 구름을 타고 오시리라 각인의 눈이 그를 보겠고 그를 찌른 자들도 볼터이요 땅에 있는 모든 족속이 그를 인하여 애곡하리니 그러하리라 아멘", chunks: ["볼찌어다", "구름을", "타고", "오시리라", "각인의", "눈이", "그를", "보겠고", "그를", "찌른", "자들도", "볼터이요", "땅에", "있는", "모든", "족속이", "그를", "인하여", "애곡하리니", "그러하리라", "아멘"] },
        { text: "주 하나님이 가라사대 나는 알파와 오메가라 이제도 있고 전에도 있었고 장차 올 자요 전능한 자라 하시더라", chunks: ["주", "하나님이", "가라사대", "나는", "알파와", "오메가라", "이제도", "있고", "전에도", "있었고", "장차", "올", "자요", "전능한", "자라", "하시더라"] },
        { text: "나 요한은 너희 형제요 예수의 환난과 나라와 참음에 동참하는 자라 하나님의 말씀과 예수의 증거를 인하여 밧모라 하는 섬에 있었더니", chunks: ["나", "요한은", "너희", "형제요", "예수의", "환난과", "나라와", "참음에", "동참하는", "자라", "하나님의", "말씀과", "예수의", "증거를", "인하여", "밧모라", "하는", "섬에", "있었더니"] },
        { text: "주의 날에 내가 성령에 감동하여 내 뒤에서 나는 나팔 소리 같은 큰 음성을 들으니", chunks: ["주의", "날에", "내가", "성령에", "감동하여", "내", "뒤에서", "나는", "나팔", "소리", "같은", "큰", "음성을", "들으니"] },
        { text: "가로되 너 보는 것을 책에 써서 에베소, 서머나, 버가모, 두아디라, 사데, 빌라델비아, 라오디게아 일곱 교회에 보내라 하시기로", chunks: ["가로되", "너", "보는", "것을", "책에", "써서", "에베소,", "서머나,", "버가모,", "두아디라,", "사데,", "빌라델비아,", "라오디게아", "일곱", "교회에", "보내라", "하시기로"] },
        { text: "몸을 돌이켜 나더러 말한 음성을 알아 보려고 하여 돌이킬 때에 일곱 금 촛대를 보았는데", chunks: ["몸을", "돌이켜", "나더러", "말한", "음성을", "알아", "보려고", "하여", "돌이킬", "때에", "일곱", "금", "촛대를", "보았는데"] },
        { text: "촛대 사이에 인자 같은 이가 발에 끌리는 옷을 입고 가슴에 금띠를 띠고", chunks: ["촛대", "사이에", "인자", "같은", "이가", "발에", "끌리는", "옷을", "입고", "가슴에", "금띠를", "띠고"] },
        { text: "그 머리와 털의 희기가 흰 양털 같고 눈 같으며 그의 눈은 불꽃 같고", chunks: ["그", "머리와", "털의", "희기가", "흰", "양털", "같고", "눈", "같으며", "그의", "눈은", "불꽃", "같고"] },
        { text: "그의 발은 풀무에 단련한 빛난 주석 같고 그의 음성은 많은 물 소리와 같으며", chunks: ["그의", "발은", "풀무에", "단련한", "빛난", "주석", "같고", "그의", "음성은", "많은", "물", "소리와", "같으며"] },
        { text: "그 오른손에 일곱 별이 있고 그 입에서 좌우에 날선 검이 나오고 그 얼굴은 해가 힘있게 비취는것 같더라", chunks: ["그", "오른손에", "일곱", "별이", "있고", "그", "입에서", "좌우에", "날선", "검이", "나오고", "그", "얼굴은", "해가", "힘있게", "비취는것", "같더라"] },
        { text: "내가 볼때에 그 발앞에 엎드러져 죽은 자 같이 되매 그가 오른손을 내게 얹고 가라사대 두려워 말라 나는 처음이요 나중이니", chunks: ["내가", "볼때에", "그", "발앞에", "엎드러져", "죽은", "자", "같이", "되매", "그가", "오른손을", "내게", "얹고", "가라사대", "두려워", "말라", "나는", "처음이요", "나중이니"] },
        { text: "곧 산 자라 내가 전에 죽었었노라 볼찌어다 이제 세세토록 살아 있어 사망과 음부의 열쇠를 가졌노니", chunks: ["곧", "산", "자라", "내가", "전에", "죽었었노라", "볼찌어다", "이제", "세세토록", "살아", "있어", "사망과", "음부의", "열쇠를", "가졌노니"] },
        { text: "그러므로 네 본 것과 이제 있는 일과 장차 될 일을 기록하라", chunks: ["그러므로", "네", "본", "것과", "이제", "있는", "일과", "장차", "될", "일을", "기록하라"] },
        { text: "네 본 것은 내 오른손에 일곱 별의 비밀과 일곱 금 촛대라 일곱 별은 일곱 교회의 사자요 일곱 촛대는 일곱 교회니라", chunks: ["네", "본", "것은", "내", "오른손에", "일곱", "별의", "비밀과", "일곱", "금", "촛대라", "일곱", "별은", "일곱", "교회의", "사자요", "일곱", "촛대는", "일곱", "교회니라"] }
    ],
    2: [
        { text: "에베소 교회의 사자에게 편지하기를 오른손에 일곱 별을 붙잡고 일곱 금 촛대 사이에 다니시는 이가 가라사대", chunks: ["에베소", "교회의", "사자에게", "편지하기를", "오른손에", "일곱", "별을", "붙잡고", "일곱", "금", "촛대", "사이에", "다니시는", "이가", "가라사대"] },
        { text: "내가 네 행위와 수고와 네 인내를 알고 또 악한 자들을 용납지 아니한 것과 자칭 사도라 하되 아닌 자들을 시험하여 그 거짓된 것을 네가 드러낸 것과", chunks: ["내가", "네", "행위와", "수고와", "네", "인내를", "알고", "또", "악한", "자들을", "용납지", "아니한", "것과", "자칭", "사도라", "하되", "아닌", "자들을", "시험하여", "그", "거짓된", "것을", "네가", "드러낸", "것과"] },
        { text: "또 네가 참고 내 이름을 위하여 견디고 게으르지 아니한 것을 아노라", chunks: ["또", "네가", "참고", "내", "이름을", "위하여", "견디고", "게으르지", "아니한", "것을", "아노라"] },
        { text: "그러나 너를 책망할 것이 있나니 너의 처음 사랑을 버렸느니라", chunks: ["그러나", "너를", "책망할", "것이", "있나니", "너의", "처음", "사랑을", "버렸느니라"] },
        { text: "그러므로 어디서 떨어진 것을 생각하고 회개하여 처음 행위를 가지라 만일 그리하지 아니하고 회개치 아니하면 내가 네게 임하여 네 촛대를 그 자리에서 옮기리라", chunks: ["그러므로", "어디서", "떨어진", "것을", "생각하고", "회개하여", "처음", "행위를", "가지라", "만일", "그리하지", "아니하고", "회개치", "아니하면", "내가", "네게", "임하여", "네", "촛대를", "그", "자리에서", "옮기리라"] },
        { text: "오직 네게 이것이 있으니 네가 니골라당의 행위를 미워하는도다 나도 이것을 미워하노라", chunks: ["오직", "네게", "이것이", "있으니", "네가", "니골라당의", "행위를", "미워하는도다", "나도", "이것을", "미워하노라"] },
        { text: "귀 있는 자는 성령이 교회들에게 하시는 말씀을 들을찌어다 이기는 그에게는 내가 하나님의 낙원에 있는 생명나무의 과실을 주어 먹게 하리라", chunks: ["귀", "있는", "자는", "성령이", "교회들에게", "하시는", "말씀을", "들을찌어다", "이기는", "그에게는", "내가", "하나님의", "낙원에", "있는", "생명나무의", "과실을", "주어", "먹게", "하리라"] },
        { text: "서머나 교회의 사자에게 편지하기를 처음이요 나중이요 죽었다가 살아나신 이가 가라사대", chunks: ["서머나", "교회의", "사자에게", "편지하기를", "처음이요", "나중이요", "죽었다가", "살아나신", "이가", "가라사대"] },
        { text: "내가 네 환난과 궁핍을 아노니 실상은 네가 부요한 자니라 자칭 유대인이라 하는 자들의 훼방도 아노니 실상은 유대인이 아니요 사단의 회라", chunks: ["내가", "네", "환난과", "궁핍을", "아노니", "실상은", "네가", "부요한", "자니라", "자칭", "유대인이라", "하는", "자들의", "훼방도", "아노니", "실상은", "유대인이", "아니요", "사단의", "회라"] },
        { text: "네가 장차 받을 고난을 두려워 말라 볼찌어다 마귀가 장차 너희 가운데서 몇 사람을 옥에 던져 시험을 받게 하리니 너희가 십일 동안 환난을 받으리라 네가 죽도록 충성하라 그리하면 내가 생명의 면류관을 네게 주리라", chunks: ["네가", "장차", "받을", "고난을", "두려워", "말라", "볼찌어다", "마귀가", "장차", "너희", "가운데서", "몇", "사람을", "옥에", "던져", "시험을", "받게", "하리니", "너희가", "십일", "동안", "환난을", "받으리라", "네가", "죽도록", "충성하라", "그리하면", "내가", "생명의", "면류관을", "네게", "주리라"] },
        { text: "귀 있는 자는 성령이 교회들에게 하시는 말씀을 들을찌어다 이기는 자는 둘째 사망의 해를 받지 아니하리라", chunks: ["귀", "있는", "자는", "성령이", "교회들에게", "하시는", "말씀을", "들을찌어다", "이기는", "자는", "둘째", "사망의", "해를", "받지", "아니하리라"] },
        { text: "버가모 교회의 사자에게 편지하기를 좌우에 날선 검을 가진 이가 가라사대", chunks: ["버가모", "교회의", "사자에게", "편지하기를", "좌우에", "날선", "검을", "가진", "이가", "가라사대"] },
        { text: "네가 어디 사는 것을 내가 아노니 거기는 사단의 위가 있는 데라 네가 내 이름을 굳게 잡아서 내 충성된 증인 안디바가 너희 가운데 곧 사단의 거하는 곳에서 죽임을 당할 때에도 나를 믿는 믿음을 저버리지 아니하였도다", chunks: ["네가", "어디", "사는", "것을", "내가", "아노니", "거기는", "사단의", "위가", "있는", "데라", "네가", "내", "이름을", "굳게", "잡아서", "내", "충성된", "증인", "안디바가", "너희", "가운데", "곧", "사단의", "거하는", "곳에서", "죽임을", "당할", "때에도", "나를", "믿는", "믿음을", "저버리지", "아니하였도다"] },
        { text: "그러나 네게 두어가지 책망할 것이 있나니 거기 네게 발람의 교훈을 지키는 자들이 있도다 발람이 발락을 가르쳐 이스라엘 앞에 올무를 놓아 우상의 제물을 먹게 하였고 또 행음하게 하였느니라", chunks: ["그러나", "네게", "두어가지", "책망할", "것이", "있나니", "거기", "네게", "발람의", "교훈을", "지키는", "자들이", "있도다", "발람이", "발락을", "가르쳐", "이스라엘", "앞에", "올무를", "놓아", "우상의", "제물을", "먹게", "하였고", "또", "행음하게", "하였느니라"] },
        { text: "이와 같이 네게도 니골라당의 교훈을 지키는 자들이 있도다", chunks: ["이와", "같이", "네게도", "니골라당의", "교훈을", "지키는", "자들이", "있도다"] },
        { text: "그러므로 회개하라 그리하지 아니하면 내가 네게 속히 임하여 내 입의 검으로 그들과 싸우리라", chunks: ["그러므로", "회개하라", "그리하지", "아니하면", "내가", "네게", "속히", "임하여", "내", "입의", "검으로", "그들과", "싸우리라"] },
        { text: "귀 있는 자는 성령이 교회들에게 하시는 말씀을 들을찌어다 이기는 그에게는 내가 감추었던 만나를 주고 또 흰 돌을 줄터인데 그 돌 위에 새 이름을 기록한 것이 있나니 받는 자 밖에는 그 이름을 알 사람이 없느니라", chunks: ["귀", "있는", "자는", "성령이", "교회들에게", "하시는", "말씀을", "들을찌어다", "이기는", "그에게는", "내가", "감추었던", "만나를", "주고", "또", "흰", "돌을", "줄터인데", "그", "돌", "위에", "새", "이름을", "기록한", "것이", "있나니", "받는", "자", "밖에는", "그", "이름을", "알", "사람이", "없느니라"] },
        { text: "두아디라 교회의 사자에게 편지하기를 그 눈이 불꽃 같고 그 발이 빛난 주석과 같은 하나님의 아들이 가라사대", chunks: ["두아디라", "교회의", "사자에게", "편지하기를", "그", "눈이", "불꽃", "같고", "그", "발이", "빛난", "주석과", "같은", "하나님의", "아들이", "가라사대"] },
        { text: "내가 네 사업과 사랑과 믿음과 섬김과 인내를 아노니 네 나중 행위가 처음것보다 많도다", chunks: ["내가", "네", "사업과", "사랑과", "믿음과", "섬김과", "인내를", "아노니", "네", "나중", "행위가", "처음것보다", "많도다"] },
        { text: "그러나 네게 책망할 일이 있노라 자칭 선지자라 하는 여자 이세벨을 네가 용납함이니 그가 내 종들을 가르쳐 꾀어 행음하게 하고 우상의 제물을 먹게 하는도다", chunks: ["그러나", "네게", "책망할", "일이", "있노라", "자칭", "선지자라", "하는", "여자", "이세벨을", "네가", "용납함이니", "그가", "내", "종들을", "가르쳐", "꾀어", "행음하게", "하고", "우상의", "제물을", "먹게", "하는도다"] },
        { text: "또 내가 그에게 회개할 기회를 주었으되 그 음행을 회개하고자 아니하는도다", chunks: ["또", "내가", "그에게", "회개할", "기회를", "주었으되", "그", "음행을", "회개하고자", "아니하는도다"] },
        { text: "볼찌어다 내가 그를 침상에 던질터이요 또 그로 더불어 간음하는 자들도 만일 그의 행위를 회개치 아니하면 큰 환난 가운데 던지고", chunks: ["볼찌어다", "내가", "그를", "침상에", "던질터이요", "또", "그로", "더불어", "간음하는", "자들도", "만일", "그의", "행위를", "회개치", "아니하면", "큰", "환난", "가운데", "던지고"] },
        { text: "또 내가 사망으로 그의 자녀를 죽이리니 모든 교회가 나는 사람의 뜻과 마음을 살피는 자인줄 알찌라 내가 너희 각 사람의 행위대로 갚아 주리라", chunks: ["또", "내가", "사망으로", "그의", "자녀를", "죽이리니", "모든", "교회가", "나는", "사람의", "뜻과", "마음을", "살피는", "자인줄", "알찌라", "내가", "너희", "각", "사람의", "행위대로", "갚아", "주리라"] },
        { text: "두아디라에 남아 있어 이 교훈을 받지 아니하고 소위 사단의 깊은 것을 알지 못하는 너희에게 말하노니 다른 짐으로 너희에게 지울 것이 없노라", chunks: ["두아디라에", "남아", "있어", "이", "교훈을", "받지", "아니하고", "소위", "사단의", "깊은", "것을", "알지", "못하는", "너희에게", "말하노니", "다른", "짐으로", "너희에게", "지울", "것이", "없노라"] },
        { text: "다만 너희에게 있는 것을 내가 올 때까지 굳게 잡으라", chunks: ["다만", "너희에게", "있는", "것을", "내가", "올", "때까지", "굳게", "잡으라"] },
        { text: "이기는 자와 끝까지 내 일을 지키는 그에게 만국을 다스리는 권세를 주리니", chunks: ["이기는", "자와", "끝까지", "내", "일을", "지키는", "그에게", "만국을", "다스리는", "권세를", "주리니"] },
        { text: "그가 철장을 가지고 저희를 다스려 질그릇 깨뜨리는 것과 같이 하리라 나도 내 아버지께 받은 것이 그러하니라", chunks: ["그가", "철장을", "가지고", "저희를", "다스려", "질그릇", "깨뜨리는", "것과", "같이", "하리라", "나도", "내", "아버지께", "받은", "것이", "그러하니라"] },
        { text: "내가 또 그에게 새벽 별을 주리라", chunks: ["내가", "또", "그에게", "새벽", "별을", "주리라"] },
        { text: "귀 있는 자는 성령이 교회들에게 하시는 말씀을 들을찌어다", chunks: ["귀", "있는", "자는", "성령이", "교회들에게", "하시는", "말씀을", "들을찌어다"] }
    ],
    3: [
        { text: "사데 교회의 사자에게 편지하기를 하나님의 일곱 영과 일곱 별을 가진이가 가라사대 내가 네 행위를 아노니 네가 살았다 하는 이름은 가졌으나 죽은 자로다", chunks: ["사데", "교회의", "사자에게", "편지하기를", "하나님의", "일곱", "영과", "일곱", "별을", "가진이가", "가라사대", "내가", "네", "행위를", "아노니", "네가", "살았다", "하는", "이름은", "가졌으나", "죽은", "자로다"] },
        { text: "너는 일깨워 그 남은바 죽게 된 것을 굳게 하라 내 하나님 앞에 네 행위의 온전한 것을 찾지 못하였노니", chunks: ["너는", "일깨워", "그", "남은바", "죽게", "된", "것을", "굳게", "하라", "내", "하나님", "앞에", "네", "행위의", "온전한", "것을", "찾지", "못하였노니"] },
        { text: "그러므로 네가 어떻게 받았으며 어떻게 들었는지 생각하고 지키어 회개하라 만일 일깨지 아니하면 내가 도적 같이 이르리니 어느 시에 네게 임할는지 네가 알지 못하리라", chunks: ["그러므로", "네가", "어떻게", "받았으며", "어떻게", "들었는지", "생각하고", "지키어", "회개하라", "만일", "일깨지", "아니하면", "내가", "도적", "같이", "이르리니", "어느", "시에", "네게", "임할는지", "네가", "알지", "못하리라"] },
        { text: "그러나 사데에 그 옷을 더럽히지 아니한 자 몇명이 네게 있어 흰 옷을 입고 나와 함께 다니리니 그들은 합당한 자인 연고라", chunks: ["그러나", "사데에", "그", "옷을", "더럽히지", "아니한", "자", "몇명이", "네게", "있어", "흰", "옷을", "입고", "나와", "함께", "다니리니", "그들은", "합당한", "자인", "연고라"] },
        { text: "이기는 자는 이와 같이 흰 옷을 입을 것이요 내가 그 이름을 생명책에서 반드시 흐리지 아니하고 그 이름을 내 아버지 앞과 그 천사들 앞에서 시인하리라", chunks: ["이기는", "자는", "이와", "같이", "흰", "옷을", "입을", "것이요", "내가", "그", "이름을", "생명책에서", "반드시", "흐리지", "아니하고", "그", "이름을", "내", "아버지", "앞과", "그", "천사들", "앞에서", "시인하리라"] },
        { text: "귀 있는 자는 성령이 교회들에게 하시는 말씀을 들을찌어다", chunks: ["귀", "있는", "자는", "성령이", "교회들에게", "하시는", "말씀을", "들을찌어다"] },
        { text: "빌라델비아 교회의 사자에게 편지하기를 거룩하고 진실하사 다윗의 열쇠를 가지신 이 곧 열면 닫을 사람이 없고 닫으면 열 사람이 없는 그이가 가라사대", chunks: ["빌라델비아", "교회의", "사자에게", "편지하기를", "거룩하고", "진실하사", "다윗의", "열쇠를", "가지신", "이", "곧", "열면", "닫을", "사람이", "없고", "닫으면", "열", "사람이", "없는", "그이가", "가라사대"] },
        { text: "볼찌어다 내가 네 앞에 열린 문을 두었으되 능히 닫을 사람이 없으리라 내가 네 행위를 아노니 네가 적은 능력을 가지고도 내 말을 지키며 내 이름을 배반치 아니하였도다", chunks: ["볼찌어다", "내가", "네", "앞에", "열린", "문을", "두었으되", "능히", "닫을", "사람이", "없으리라", "내가", "네", "행위를", "아노니", "네가", "적은", "능력을", "가지고도", "내", "말을", "지키며", "내", "이름을", "배반치", "아니하였도다"] },
        { text: "보라 사단의 회 곧 자칭 유대인이라 하나 그렇지 않고 거짓말 하는 자들 중에서 몇을 네게 주어 저희로 와서 네 발앞에 절하게 하고 내가 너를 사랑하는 줄을 알게 하리라", chunks: ["보라", "사단의", "회", "곧", "자칭", "유대인이라", "하나", "그렇지", "않고", "거짓말", "하는", "자들", "중에서", "몇을", "네게", "주어", "저희로", "와서", "네", "발앞에", "절하게", "하고", "내가", "너를", "사랑하는", "줄을", "알게", "하리라"] },
        { text: "네가 나의 인내의 말씀을 지켰은즉 내가 또한 너를 지키어 시험의 때를 면하게 하리니 이는 장차 온 세상에 임하여 땅에 거하는 자들을 시험할 때라", chunks: ["네가", "나의", "인내의", "말씀을", "지켰은즉", "내가", "또한", "너를", "지키어", "시험의", "때를", "면하게", "하리니", "이는", "장차", "온", "세상에", "임하여", "땅에", "거하는", "자들을", "시험할", "때라"] },
        { text: "내가 속히 임하리니 네가 가진 것을 굳게 잡아 아무나 네 면류관을 빼앗지 못하게 하라", chunks: ["내가", "속히", "임하리니", "네가", "가진", "것을", "굳게", "잡아", "아무나", "네", "면류관을", "빼앗지", "못하게", "하라"] },
        { text: "이기는 자는 내 하나님 성전에 기둥이 되게 하리니 그가 결코 다시 나가지 아니하리라 내가 하나님의 이름과 하나님의 성 곧 하늘에서 내 하나님께로부터 내려 오는 새 예루살렘의 이름과 나의 새 이름을 그이 위에 기록하리라", chunks: ["이기는", "자는", "내", "하나님", "성전에", "기둥이", "되게", "하리니", "그가", "결코", "다시", "나가지", "아니하리라", "내가", "하나님의", "이름과", "하나님의", "성", "곧", "하늘에서", "내", "하나님께로부터", "내려", "오는", "새", "예루살렘의", "이름과", "나의", "새", "이름을", "그이", "위에", "기록하리라"] },
        { text: "귀 있는 자는 성령이 교회들에게 하시는 말씀을 들을찌어다", chunks: ["귀", "있는", "자는", "성령이", "교회들에게", "하시는", "말씀을", "들을찌어다"] },
        { text: "라오디게아 교회의 사자에게 편지하기를 아멘이시요 충성되고 참된 증인이시요 하나님의 창조의 근본이신 이가 가라사대", chunks: ["라오디게아", "교회의", "사자에게", "편지하기를", "아멘이시요", "충성되고", "참된", "증인이시요", "하나님의", "창조의", "근본이신", "이가", "가라사대"] },
        { text: "내가 네 행위를 아노니 네가 차지도 아니하고 더웁지도 아니하도다 네가 차든지 더웁든지 하기를 원하노라", chunks: ["내가", "네", "행위를", "아노니", "네가", "차지도", "아니하고", "더웁지도", "아니하도다", "네가", "차든지", "더웁든지", "하기를", "원하노라"] },
        { text: "네가 이같이 미지근하여 더웁지도 아니하고 차지도 아니하니 내 입에서 너를 토하여 내치리라", chunks: ["네가", "이같이", "미지근하여", "더웁지도", "아니하고", "차지도", "아니하니", "내", "입에서", "너를", "토하여", "내치리라"] },
        { text: "네가 말하기를 나는 부자라 부요하여 부족한 것이 없다 하나 네 곤고한 것과 가련한 것과 가난한 것과 눈 먼것과 벌거벗은 것을 알지 못하도다", chunks: ["네가", "말하기를", "나는", "부자라", "부요하여", "부족한", "것이", "없다", "하나", "네", "곤고한", "것과", "가련한", "것과", "가난한", "것과", "눈", "먼것과", "벌거벗은", "것을", "알지", "못하도다"] },
        { text: "내가 너를 권하노니 내게서 불로 연단한 금을 사서 부요하게 하고 흰 옷을 사서 입어 벌거벗은 수치를 보이지 않게 하고 안약을 사서 눈에 발라 보게 하라", chunks: ["내가", "너를", "권하노니", "내게서", "불로", "연단한", "금을", "사서", "부요하게", "하고", "흰", "옷을", "사서", "입어", "벌거벗은", "수치를", "보이지", "않게", "하고", "안약을", "사서", "눈에", "발라", "보게", "하라"] },
        { text: "무릇 내가 사랑하는 자를 책망하여 징계하노니 그러므로 네가 열심을 내라 회개하라", chunks: ["무릇", "내가", "사랑하는", "자를", "책망하여", "징계하노니", "그러므로", "네가", "열심을", "내라", "회개하라"] },
        { text: "볼찌어다 내가 문밖에 서서 두드리노니 누구든지 내 음성을 듣고 문을 열면 내가 그에게로 들어가 그로 더불어 먹고 그는 나로 더불어 먹으리라", chunks: ["볼찌어다", "내가", "문밖에", "서서", "두드리노니", "누구든지", "내", "음성을", "듣고", "문을", "열면", "내가", "그에게로", "들어가", "그로", "더불어", "먹고", "그는", "나로", "더불어", "먹으리라"] },
        { text: "이기는 그에게는 내가 내 보좌에 함께 앉게 하여주기를 내가 이기고 아버지 보좌에 함께 앉은 것과 같이 하리라", chunks: ["이기는", "그에게는", "내가", "내", "보좌에", "함께", "앉게", "하여주기를", "내가", "이기고", "아버지", "보좌에", "함께", "앉은", "것과", "같이", "하리라"] },
        { text: "귀 있는 자는 성령이 교회들에게 하시는 말씀을 들을찌어다", chunks: ["귀", "있는", "자는", "성령이", "교회들에게", "하시는", "말씀을", "들을찌어다"] }
    ],
    4: [
        { text: "이 일 후에 내가 보니 하늘에 열린 문이 있는데 내가 들은바 처음에 내게 말하던 나팔소리 같은 그 음성이 가로되 이리로 올라오라 이 후에 마땅히 될 일을 내가 네게 보이리라 하시더라", chunks: ["이", "일", "후에", "내가", "보니", "하늘에", "열린", "문이", "있는데", "내가", "들은바", "처음에", "내게", "말하던", "나팔소리", "같은", "그", "음성이", "가로되", "이리로", "올라오라", "이", "후에", "마땅히", "될", "일을", "내가", "네게", "보이리라", "하시더라"] },
        { text: "내가 곧 성령에 감동하였더니 보라 하늘에 보좌를 베풀었고 그 보좌 위에 앉으신 이가 있는데", chunks: ["내가", "곧", "성령에", "감동하였더니", "보라", "하늘에", "보좌를", "베풀었고", "그", "보좌", "위에", "앉으신", "이가", "있는데"] },
        { text: "앉으신 이의 모양이 벽옥과 홍보석 같고 또 무지개가 있어 보좌에 둘렸는데 그 모양이 녹보석 같더라", chunks: ["앉으신", "이의", "모양이", "벽옥과", "홍보석", "같고", "또", "무지개가", "있어", "보좌에", "둘렸는데", "그", "모양이", "녹보석", "같더라"] },
        { text: "또 보좌에 둘려 이십 사 보좌들이 있고 그 보좌들 위에 이십 사 장로들이 흰 옷을 입고 머리에 금 면류관을 쓰고 앉았더라", chunks: ["또", "보좌에", "둘려", "이십", "사", "보좌들이", "있고", "그", "보좌들", "위에", "이십", "사", "장로들이", "흰", "옷을", "입고", "머리에", "금", "면류관을", "쓰고", "앉았더라"] },
        { text: "보좌로부터 번개와 음성과 뇌성이 나고 보좌 앞에 일곱 등불 켠것이 있으니 이는 하나님의 일곱 영이라", chunks: ["보좌로부터", "번개와", "음성과", "뇌성이", "나고", "보좌", "앞에", "일곱", "등불", "켠것이", "있으니", "이는", "하나님의", "일곱", "영이라"] },
        { text: "보좌 앞에 수정과 같은 유리 바다가 있고 보좌 가운데와 보좌 주위에 네 생물이 있는데 앞뒤에 눈이 가득하더라", chunks: ["보좌", "앞에", "수정과", "같은", "유리", "바다가", "있고", "보좌", "가운데와", "보좌", "주위에", "네", "생물이", "있는데", "앞뒤에", "눈이", "가득하더라"] },
        { text: "그 첫째 생물은 사자 같고 그 둘째 생물은 송아지 같고 그 세째 생물은 얼굴이 사람 같고 그 네째 생물은 날아가는 독수리 같은데", chunks: ["그", "첫째", "생물은", "사자", "같고", "그", "둘째", "생물은", "송아지", "같고", "그", "세째", "생물은", "얼굴이", "사람", "같고", "그", "네째", "생물은", "날아가는", "독수리", "같은데"] },
        { text: "네 생물이 각각 여섯 날개가 있고 그 안과 주위에 눈이 가득하더라 그들이 밤낮 쉬지 않고 이르기를 거룩하다 거룩하다 거룩하다 주 하나님 곧 전능하신이여 전에도 계셨고 이제도 계시고 장차 오실 자라 하고", chunks: ["네", "생물이", "각각", "여섯", "날개가", "있고", "그", "안과", "주위에", "눈이", "가득하더라", "그들이", "밤낮", "쉬지", "않고", "이르기를", "거룩하다", "거룩하다", "거룩하다", "주", "하나님", "곧", "전능하신이여", "전에도", "계셨고", "이제도", "계시고", "장차", "오실", "자라", "하고"] },
        { text: "그 생물들이 영광과 존귀와 감사를 보좌에 앉으사 세세토록 사시는 이에게 돌릴 때에", chunks: ["그", "생물들이", "영광과", "존귀와", "감사를", "보좌에", "앉으사", "세세토록", "사시는", "이에게", "돌릴", "때에"] },
        { text: "이십 사 장로들이 보좌에 앉으신 이 앞에 엎드려 세세토록 사시는 이에게 경배하고 자기의 면류관을 보좌 앞에 던지며 가로되", chunks: ["이십", "사", "장로들이", "보좌에", "앉으신", "이", "앞에", "엎드려", "세세토록", "사시는", "이에게", "경배하고", "자기의", "면류관을", "보좌", "앞에", "던지며", "가로되"] },
        { text: "우리 주 하나님이여 영광과 존귀와 능력을 받으시는 것이 합당하오니 주께서 만물을 지으신지라 만물이 주의 뜻대로 있었고 또 지으심을 받았나이다 하더라", chunks: ["우리", "주", "하나님이여", "영광과", "존귀와", "능력을", "받으시는", "것이", "합당하오니", "주께서", "만물을", "지으신지라", "만물이", "주의", "뜻대로", "있었고", "또", "지으심을", "받았나이다", "하더라"] }
    ],
    5: [
        { text: "내가 보매 보좌에 앉으신 이의 오른손에 책이 있으니 안팎으로 썼고 일곱 인으로 봉하였더라", chunks: ["내가", "보매", "보좌에", "앉으신", "이의", "오른손에", "책이", "있으니", "안팎으로", "썼고", "일곱", "인으로", "봉하였더라"] },
        { text: "또 보매 힘 있는 천사가 큰 음성으로 외치기를 누가 책을 펴며 그 인을 떼기에 합당하냐 하니", chunks: ["또", "보매", "힘", "있는", "천사가", "큰", "음성으로", "외치기를", "누가", "책을", "펴며", "그", "인을", "떼기에", "합당하냐", "하니"] },
        { text: "하늘 위에나 땅 위에나 땅 아래에 능히 책을 펴거나 보거나 할 이가 없더라", chunks: ["하늘", "위에나", "땅", "위에나", "땅", "아래에", "능히", "책을", "펴거나", "보거나", "할", "이가", "없더라"] },
        { text: "이 책을 펴거나 보거나 하기에 합당한 자가 보이지 않기로 내가 크게 울었더니", chunks: ["이", "책을", "펴거나", "보거나", "하기에", "합당한", "자가", "보이지", "않기로", "내가", "크게", "울었더니"] },
        { text: "장로 중에 하나가 내게 말하되 울지 말라 유대 지파의 사자 다윗의 뿌리가 이기었으니 이 책과 그 일곱 인을 떼시리라 하더라", chunks: ["장로", "중에", "하나가", "내게", "말하되", "울지", "말라", "유대", "지파의", "사자", "다윗의", "뿌리가", "이기었으니", "이", "책과", "그", "일곱", "인을", "떼시리라", "하더라"] },
        { text: "내가 또 보니 보좌와 네 생물과 장로들 사이에 어린 양이 섰는데 일찍 죽임을 당한것 같더라 일곱 뿔과 일곱 눈이 있으니 이 눈은 온 땅에 보내심을 입은 하나님의 일곱 영이더라", chunks: ["내가", "또", "보니", "보좌와", "네", "생물과", "장로들", "사이에", "어린", "양이", "섰는데", "일찍", "죽임을", "당한것", "같더라", "일곱", "뿔과", "일곱", "눈이", "있으니", "이", "눈은", "온", "땅에", "보내심을", "입은", "하나님의", "일곱", "영이더라"] },
        { text: "어린 양이 나아와서 보좌에 앉으신 이의 오른손에서 책을 취하시니라", chunks: ["어린", "양이", "나아와서", "보좌에", "앉으신", "이의", "오른손에서", "책을", "취하시니라"] },
        { text: "책을 취하시매 네 생물과 이십 사 장로들이 어린 양 앞에 엎드려 각각 거문고와 향이 가득한 금 대접을 가졌으니 이 향은 성도의 기도들이라", chunks: ["책을", "취하시매", "네", "생물과", "이십", "사", "장로들이", "어린", "양", "앞에", "엎드려", "각각", "거문고와", "향이", "가득한", "금", "대접을", "가졌으니", "이", "향은", "성도의", "기도들이라"] },
        { text: "새 노래를 노래하여 가로되 책을 가지시고 그 인봉을 떼기에 합당하시도다 일찍 죽임을 당하사 각 족속과 방언과 백성과 나라 가운데서 사람들을 피로 사서 하나님께 드리시고", chunks: ["새", "노래를", "노래하여", "가로되", "책을", "가지시고", "그", "인봉을", "떼기에", "합당하시도다", "일찍", "죽임을", "당하사", "각", "족속과", "방언과", "백성과", "나라", "가운데서", "사람들을", "피로", "사서", "하나님께", "드리시고"] },
        { text: "저희로 우리 하나님 앞에서 나라와 제사장을 삼으셨으니 저희가 땅에서 왕노릇하리로다 하더라", chunks: ["저희로", "우리", "하나님", "앞에서", "나라와", "제사장을", "삼으셨으니", "저희가", "땅에서", "왕노릇하리로다", "하더라"] },
        { text: "내가 또 보고 들으매 보좌와 생물들과 장로들을 둘러 선 많은 천사의 음성이 있으니 그 수가 만만이요 천천이라", chunks: ["내가", "또", "보고", "들으매", "보좌와", "생물들과", "장로들을", "둘러", "선", "많은", "천사의", "음성이", "있으니", "그", "수가", "만만이요", "천천이라"] },
        { text: "큰 음성으로 가로되 죽임을 당하신 어린 양이 능력과 부와 지혜와 힘과 존귀와 영광과 찬송을 받으시기에 합당하도다 하더라", chunks: ["큰", "음성으로", "가로되", "죽임을", "당하신", "어린", "양이", "능력과", "부와", "지혜와", "힘과", "존귀와", "영광과", "찬송을", "받으시기에", "합당하도다", "하더라"] },
        { text: "내가 또 들으니 하늘 위에와 땅 위에와 땅 아래와 바다 위에와 또 그 가운데 모든 만물이 가로되 보좌에 앉으신 이와 어린 양에게 찬송과 존귀와 영광과 능력을 세세토록 돌릴찌어다 하니", chunks: ["내가", "또", "들으니", "하늘", "위에와", "땅", "위에와", "땅", "아래와", "바다", "위에와", "또", "그", "가운데", "모든", "만물이", "가로되", "보좌에", "앉으신", "이와", "어린", "양에게", "찬송과", "존귀와", "영광과", "능력을", "세세토록", "돌릴찌어다", "하니"] },
        { text: "네 생물이 가로되 아멘 하고 장로들은 엎드려 경배하더라", chunks: ["네", "생물이", "가로되", "아멘", "하고", "장로들은", "엎드려", "경배하더라"] }
    ],

    6: [
        { text: "내가 보매 어린 양이 일곱 인 중에 하나를 떼시는 그 때에 내가 들으니 네 생물 중에 하나가 우뢰소리 같이 말하되 오라 하기로", chunks: ["내가", "보매", "어린", "양이", "일곱", "인", "중에", "하나를", "떼시는", "그", "때에", "내가", "들으니", "네", "생물", "중에", "하나가", "우뢰소리", "같이", "말하되", "오라", "하기로"] },
        { text: "내가 이에 보니 흰 말이 있는데 그 탄 자가 활을 가졌고 면류관을 받고 나가서 이기고 또 이기려고 하더라", chunks: ["내가", "이에", "보니", "흰", "말이", "있는데", "그", "탄", "자가", "활을", "가졌고", "면류관을", "받고", "나가서", "이기고", "또", "이기려고", "하더라"] },
        { text: "둘째 인을 떼실 때에 내가 들으니 둘째 생물이 말하되 오라 하더니", chunks: ["둘째", "인을", "떼실", "때에", "내가", "들으니", "둘째", "생물이", "말하되", "오라", "하더니"] },
        { text: "이에 붉은 다른 말이 나오더라 그 탄 자가 허락을 받아 땅에서 화평을 제하여 버리며 서로 죽이게 하고 또 큰 칼을 받았더라", chunks: ["이에", "붉은", "다른", "말이", "나오더라", "그", "탄", "자가", "허락을", "받아", "땅에서", "화평을", "제하여", "버리며", "서로", "죽이게", "하고", "또", "큰", "칼을", "받았더라"] },
        { text: "세째 인을 떼실 때에 내가 들으니 세째 생물이 말하되 오라 하기로 내가 보니 검은 말이 나오는데 그 탄 자가 손에 저울을 가졌더라", chunks: ["세째", "인을", "떼실", "때에", "내가", "들으니", "세째", "생물이", "말하되", "오라", "하기로", "내가", "보니", "검은", "말이", "나오는데", "그", "탄", "자가", "손에", "저울을", "가졌더라"] },
        { text: "내가 네 생물 사이로서 나는듯하는 음성을 들으니 가로되 한 데나리온에 밀 한되요 한 데나리온에 보리 석되로다 또 감람유와 포도주는 해치 말라 하더라", chunks: ["내가", "네", "생물", "사이로서", "나는듯하는", "음성을", "들으니", "가로되", "한", "데나리온에", "밀", "한되요", "한", "데나리온에", "보리", "석되로다", "또", "감람유와", "포도주는", "해치", "말라", "하더라"] },
        { text: "네째 인을 떼실 때에 내가 네째 생물의 음성을 들으니 가로되 오라 하기로", chunks: ["네째", "인을", "떼실", "때에", "내가", "네째", "생물의", "음성을", "들으니", "가로되", "오라", "하기로"] },
        { text: "내가 보매 청황색 말이 나오는데 그 탄 자의 이름은 사망이니 음부가 그 뒤를 따르더라 저희가 땅 사분 일의 권세를 얻어 검과 흉년과 사망과 땅의 짐승으로써 죽이더라", chunks: ["내가", "보매", "청황색", "말이", "나오는데", "그", "탄", "자의", "이름은", "사망이니", "음부가", "그", "뒤를", "따르더라", "저희가", "땅", "사분", "일의", "권세를", "얻어", "검과", "흉년과", "사망과", "땅의", "짐승으로써", "죽이더라"] },
        { text: "다섯째 인을 떼실 때에 내가 보니 하나님의 말씀과 저희의 가진 증거를 인하여 죽임을 당한 영혼들이 제단 아래 있어", chunks: ["다섯째", "인을", "떼실", "때에", "내가", "보니", "하나님의", "말씀과", "저희의", "가진", "증거를", "인하여", "죽임을", "당한", "영혼들이", "제단", "아래", "있어"] },
        { text: "큰 소리로 불러 가로되 거룩하고 참되신 대주재여 땅에 거하는 자들을 심판하여 우리 피를 신원하여 주지 아니하시기를 어느 때까지 하시려나이까 하니", chunks: ["큰", "소리로", "불러", "가로되", "거룩하고", "참되신", "대주재여", "땅에", "거하는", "자들을", "심판하여", "우리", "피를", "신원하여", "주지", "아니하시기를", "어느", "때까지", "하시려나이까", "하니"] },
        { text: "각각 저희에게 흰 두루마기를 주시며 가라사대 아직 잠시 동안 쉬되 저희 동무 종들과 형제들도 자기처럼 죽임을 받아 그 수가 차기까지 하라 하시더라", chunks: ["각각", "저희에게", "흰", "두루마기를", "주시며", "가라사대", "아직", "잠시", "동안", "쉬되", "저희", "동무", "종들과", "형제들도", "자기처럼", "죽임을", "받아", "그", "수가", "차기까지", "하라", "하시더라"] },
        { text: "내가 보니 여섯째 인을 떼실 때에 큰 지진이 나며 해가 총담 같이 검어지고 온 달이 피 같이 되며", chunks: ["내가", "보니", "여섯째", "인을", "떼실", "때에", "큰", "지진이", "나며", "해가", "총담", "같이", "검어지고", "온", "달이", "피", "같이", "되며"] },
        { text: "하늘의 별들이 무화과나무가 대풍에 흔들려 선 과실이 떨어지는것 같이 땅에 떨어지며", chunks: ["하늘의", "별들이", "무화과나무가", "대풍에", "흔들려", "선", "과실이", "떨어지는것", "같이", "땅에", "떨어지며"] },
        { text: "하늘은 종이 축이 말리는것 같이 떠나가고 각 산과 섬이 제 자리에서 옮기우매", chunks: ["하늘은", "종이", "축이", "말리는것", "같이", "떠나가고", "각", "산과", "섬이", "제", "자리에서", "옮기우매"] },
        { text: "땅의 임금들과 왕족들과 장군들과 부자들과 강한 자들과 각 종과 자주자가 굴과 산 바위틈에 숨어", chunks: ["땅의", "임금들과", "왕족들과", "장군들과", "부자들과", "강한", "자들과", "각", "종과", "자주자가", "굴과", "산", "바위틈에", "숨어"] },
        { text: "산과 바위에게 이르되 우리 위에 떨어져 보좌에 앉으신 이의 낯에서와 어린 양의 진노에서 우리를 가리우라", chunks: ["산과", "바위에게", "이르되", "우리", "위에", "떨어져", "보좌에", "앉으신", "이의", "낯에서와", "어린", "양의", "진노에서", "우리를", "가리우라"] },
        { text: "그들의 진노의 큰 날이 이르렀으니 누가 능히 서리요 하더라", chunks: ["그들의", "진노의", "큰", "날이", "이르렀으니", "누가", "능히", "서리요", "하더라"] }
    ],
    7: [
        { text: "이 일 후에 내가 네 천사가 땅 네 모퉁이에 선 것을 보니 땅의 사방의 바람을 붙잡아 바람으로 하여금 땅에나 바다에나 각종 나무에 불지 못하게 하더라", chunks: ["이", "일", "후에", "내가", "네", "천사가", "땅", "네", "모퉁이에", "선", "것을", "보니", "땅의", "사방의", "바람을", "붙잡아", "바람으로", "하여금", "땅에나", "바다에나", "각종", "나무에", "불지", "못하게", "하더라"] },
        { text: "또 보매 다른 천사가 살아계신 하나님의 인을 가지고 해 돋는 데로부터 올라와서 땅과 바다를 해롭게 할 권세를 얻은 네 천사를 향하여 큰 소리로 외쳐", chunks: ["또", "보매", "다른", "천사가", "살아계신", "하나님의", "인을", "가지고", "해", "돋는", "데로부터", "올라와서", "땅과", "바다를", "해롭게", "할", "권세를", "얻은", "네", "천사를", "향하여", "큰", "소리로", "외쳐"] },
        { text: "가로되 우리가 우리 하나님의 종들의 이마에 인치기까지 땅이나 바다나 나무나 해하지 말라 하더라", chunks: ["가로되", "우리가", "우리", "하나님의", "종들의", "이마에", "인치기까지", "땅이나", "바다나", "나무나", "해하지", "말라", "하더라"] },
        { text: "내가 인맞은 자의 수를 들으니 이스라엘 자손의 각 지파 중에서 인맞은 자들이 십 사만 사천이니", chunks: ["내가", "인맞은", "자의", "수를", "들으니", "이스라엘", "자손의", "각", "지파", "중에서", "인맞은", "자들이", "십", "사만", "사천이니"] },
        { text: "유다 지파 중에 인맞은 자가 일만 이천이요 르우벤 지파 중에 일만 이천이요 갓 지파 중에 일만 이천이요", chunks: ["유다", "지파", "중에", "인맞은", "자가", "일만", "이천이요", "르우벤", "지파", "중에", "일만", "이천이요", "갓", "지파", "중에", "일만", "이천이요"] },
        { text: "아셀 지파 중에 일만 이천이요 납달리 지파 중에 일만 이천이요 므낫세 지파 중에 일만 이천이요", chunks: ["아셀", "지파", "중에", "일만", "이천이요", "납달리", "지파", "중에", "일만", "이천이요", "므낫세", "지파", "중에", "일만", "이천이요"] },
        { text: "시므온 지파 중에 일만 이천이요 레위 지파 중에 일만 이천이요 잇사갈 지파 중에 일만 이천이요", chunks: ["시므온", "지파", "중에", "일만", "이천이요", "레위", "지파", "중에", "일만", "이천이요", "잇사갈", "지파", "중에", "일만", "이천이요"] },
        { text: "스불론 지파 중에 일만 이천이요 요셉 지파 중에 일만 이천이요 베냐민 지파 중에 인맞은 자가 일만 이천이라", chunks: ["스불론", "지파", "중에", "일만", "이천이요", "요셉", "지파", "중에", "일만", "이천이요", "베냐민", "지파", "중에", "인맞은", "자가", "일만", "이천이라"] },
        { text: "이 일 후에 내가 보니 각 나라와 족속과 백성과 방언에서 아무라도 능히 셀 수 없는 큰 무리가 흰 옷을 입고 손에 종려 가지를 들고 보좌 앞과 어린 양 앞에 서서", chunks: ["이", "일", "후에", "내가", "보니", "각", "나라와", "족속과", "백성과", "방언에서", "아무라도", "능히", "셀", "수", "없는", "큰", "무리가", "흰", "옷을", "입고", "손에", "종려", "가지를", "들고", "보좌", "앞과", "어린", "양", "앞에", "서서"] },
        { text: "큰 소리로 외쳐 가로되 구원하심이 보좌에 앉으신 우리 하나님과 어린 양에게 있도다 하니", chunks: ["큰", "소리로", "외쳐", "가로되", "구원하심이", "보좌에", "앉으신", "우리", "하나님과", "어린", "양에게", "있도다", "하니"] },
        { text: "모든 천사가 보좌와 장로들과 네 생물의 주위에 섰다가 보좌 앞에 엎드려 얼굴을 대고 하나님께 경배하여", chunks: ["모든", "천사가", "보좌와", "장로들과", "네", "생물의", "주위에", "섰다가", "보좌", "앞에", "엎드려", "얼굴을", "대고", "하나님께", "경배하여"] },
        { text: "가로되 아멘 찬송과 영광과 지혜와 감사와 존귀와 능력과 힘이 우리 하나님께 세세토록 있을찌로다 아멘 하더라", chunks: ["가로되", "아멘", "찬송과", "영광과", "지혜와", "감사와", "존귀와", "능력과", "힘이", "우리", "하나님께", "세세토록", "있을찌로다", "아멘", "하더라"] },
        { text: "장로 중에 하나가 응답하여 내게 이르되 이 흰옷 입은 자들이 누구며 또 어디서 왔느뇨", chunks: ["장로", "중에", "하나가", "응답하여", "내게", "이르되", "이", "흰옷", "입은", "자들이", "누구며", "또", "어디서", "왔느뇨"] },
        { text: "내가 가로되 내 주여 당신이 알리이다 하니 그가 나더러 이르되 이는 큰 환난에서 나오는 자들인데 어린양의 피에 그 옷을 씻어 희게 하였느니라", chunks: ["내가", "가로되", "내", "주여", "당신이", "알리이다", "하니", "그가", "나더러", "이르되", "이는", "큰", "환난에서", "나오는", "자들인데", "어린양의", "피에", "그", "옷을", "씻어", "희게", "하였느니라"] },
        { text: "그러므로 그들이 하나님의 보좌 앞에 있고 또 그의 성전에서 밤낮 하나님을 섬기매 보좌에 앉으신 이가 그들 위에 장막을 치시리니", chunks: ["그러므로", "그들이", "하나님의", "보좌", "앞에", "있고", "또", "그의", "성전에서", "밤낮", "하나님을", "섬기매", "보좌에", "앉으신", "이가", "그들", "위에", "장막을", "치시리니"] },
        { text: "저희가 다시 주리지도 아니하며 목마르지도 아니하고 해나 아무 뜨거운 기운에 상하지 아니할찌니", chunks: ["저희가", "다시", "주리지도", "아니하며", "목마르지도", "아니하고", "해나", "아무", "뜨거운", "기운에", "상하지", "아니할찌니"] },
        { text: "이는 보좌 가운데 계신 어린 양이 저희의 목자가 되사 생명수 샘으로 인도하시고 하나님께서 저희 눈에서 모든 눈물을 씻어 주실 것임이러라", chunks: ["이는", "보좌", "가운데", "계신", "어린", "양이", "저희의", "목자가", "되사", "생명수", "샘으로", "인도하시고", "하나님께서", "저희", "눈에서", "모든", "눈물을", "씻어", "주실", "것임이러라"] }
    ],
    8: [
        { text: "일곱째 인을 떼실 때에 하늘이 반시 동안쯤 고요하더니", chunks: ["일곱째", "인을", "떼실", "때에", "하늘이", "반시", "동안쯤", "고요하더니"] },
        { text: "내가 보매 하나님 앞에 시위한 일곱 천사가 있어 일곱 나팔을 받았더라", chunks: ["내가", "보매", "하나님", "앞에", "시위한", "일곱", "천사가", "있어", "일곱", "나팔을", "받았더라"] },
        { text: "또 다른 천사가 와서 제단 곁에 서서 금 향로를 가지고 많은 향을 받았으니 이는 모든 성도의 기도들과 합하여 보좌 앞 금단에 드리고자 함이라", chunks: ["또", "다른", "천사가", "와서", "제단", "곁에", "서서", "금", "향로를", "가지고", "많은", "향을", "받았으니", "이는", "모든", "성도의", "기도들과", "합하여", "보좌", "앞", "금단에", "드리고자", "함이라"] },
        { text: "향연이 성도의 기도와 함께 천사의 손으로부터 하나님 앞으로 올라가는지라", chunks: ["향연이", "성도의", "기도와", "함께", "천사의", "손으로부터", "하나님", "앞으로", "올라가는지라"] },
        { text: "천사가 향로를 가지고 단 위의 불을 담아다가 땅에 쏟으매 뇌성과 음성과 번개와 지진이 나더라", chunks: ["천사가", "향로를", "가지고", "단", "위의", "불을", "담아다가", "땅에", "쏟으매", "뇌성과", "음성과", "번개와", "지진이", "나더라"] },
        { text: "일곱 나팔 가진 일곱 천사가 나팔 불기를 예비하더라", chunks: ["일곱", "나팔", "가진", "일곱", "천사가", "나팔", "불기를", "예비하더라"] },
        { text: "첫째 천사가 나팔을 부니 피 섞인 우박과 불이 나서 땅에 쏟아지매 땅의 삼분의 일이 타서 사위고 수목의 삼분의 일도 타서 사위고 각종 푸른 풀도 타서 사위더라", chunks: ["첫째", "천사가", "나팔을", "부니", "피", "섞인", "우박과", "불이", "나서", "땅에", "쏟아지매", "땅의", "삼분의", "일이", "타서", "사위고", "수목의", "삼분의", "일도", "타서", "사위고", "각종", "푸른", "풀도", "타서", "사위더라"] },
        { text: "둘째 천사가 나팔을 부니 불붙는 큰 산과 같은 것이 바다에 던지우매 바다의 삼분의 일이 피가 되고", chunks: ["둘째", "천사가", "나팔을", "부니", "불붙는", "큰", "산과", "같은", "것이", "바다에", "던지우매", "바다의", "삼분의", "일이", "피가", "되고"] },
        { text: "바다 가운데 생명 가진 피조물들의 삼분의 일이 죽고 배들의 삼분의 일이 깨어지더라", chunks: ["바다", "가운데", "생명", "가진", "피조물들의", "삼분의", "일이", "죽고", "배들의", "삼분의", "일이", "깨어지더라"] },
        { text: "세째 천사가 나팔을 부니 횃불 같이 타는 큰 별이 하늘에서 떨어져 강들의 삼분의 일과 여러 물샘에 떨어지니", chunks: ["세째", "천사가", "나팔을", "부니", "횃불", "같이", "타는", "큰", "별이", "하늘에서", "떨어져", "강들의", "삼분의", "일과", "여러", "물샘에", "떨어지니"] },
        { text: "이 별 이름은 쑥이라 물들의 삼분의 일이 쑥이 되매 그 물들이 쓰게 됨을 인하여 많은 사람이 죽더라", chunks: ["이", "별", "이름은", "쑥이라", "물들의", "삼분의", "일이", "쑥이", "되매", "그", "물들이", "쓰게", "됨을", "인하여", "많은", "사람이", "죽더라"] },
        { text: "네째 천사가 나팔을 부니 해 삼분의 일과 달 삼분의 일과 별들의 삼분의 일이 침을 받아 그 삼분의 일이 어두워지니 낮 삼분의 일은 비췸이 없고 밤도 그러하더라", chunks: ["네째", "천사가", "나팔을", "부니", "해", "삼분의", "일과", "달", "삼분의", "일과", "별들의", "삼분의", "일이", "침을", "받아", "그", "삼분의", "일이", "어두워지니", "낮", "삼분의", "일은", "비췸이", "없고", "밤도", "그러하더라"] },
        { text: "내가 또 보고 들으니 공중에 날아가는 독수리가 큰 소리로 이르되 땅에 거하는 자들에게 화, 화, 화가 있으리로다 이 외에도 세 천사의 불 나팔소리를 인함이로다 하더라", chunks: ["내가", "또", "보고", "들으니", "공중에", "날아가는", "독수리가", "큰", "소리로", "이르되", "땅에", "거하는", "자들에게", "화,", "화,", "화가", "있으리로다", "이", "외에도", "세", "천사의", "불", "나팔소리를", "인함이로다", "하더라"] }
    ],
    9: [
        { text: "다섯째 천사가 나팔을 불매 내가 보니 하늘에서 땅에 떨어진 별 하나가 있는데 저가 무저갱의 열쇠를 받았더라", chunks: ["다섯째", "천사가", "나팔을", "불매", "내가", "보니", "하늘에서", "땅에", "떨어진", "별", "하나가", "있는데", "저가", "무저갱의", "열쇠를", "받았더라"] },
        { text: "저가 무저갱을 여니 그 구멍에서 큰 풀무의 연기 같은 연기가 올라오매 해와 공기가 그 구멍의 연기로 인하여 어두워지며", chunks: ["저가", "무저갱을", "여니", "그", "구멍에서", "큰", "풀무의", "연기", "같은", "연기가", "올라오매", "해와", "공기가", "그", "구멍의", "연기로", "인하여", "어두워지며"] },
        { text: "또 황충이 연기 가운데로부터 땅 위에 나오매 저희가 땅에 있는 전갈의 권세와 같은 권세를 받았더라", chunks: ["또", "황충이", "연기", "가운데로부터", "땅", "위에", "나오매", "저희가", "땅에", "있는", "전갈의", "권세와", "같은", "권세를", "받았더라"] },
        { text: "저희에게 이르시되 땅의 풀이나 푸른 것이나 각종 수목은 해하지 말고 오직 이마에 하나님의 인 맞지 아니한 사람들만 해하라 하시더라", chunks: ["저희에게", "이르시되", "땅의", "풀이나", "푸른", "것이나", "각종", "수목은", "해하지", "말고", "오직", "이마에", "하나님의", "인", "맞지", "아니한", "사람들만", "해하라", "하시더라"] },
        { text: "그러나 그들을 죽이지는 못하게 하시고 다섯달 동안 괴롭게만 하게 하시는데 그 괴롭게 함은 전갈이 사람을 쏠 때에 괴롭게 함과 같더라", chunks: ["그러나", "그들을", "죽이지는", "못하게", "하시고", "다섯달", "동안", "괴롭게만", "하게", "하시는데", "그", "괴롭게", "함은", "전갈이", "사람을", "쏠", "때에", "괴롭게", "함과", "같더라"] },
        { text: "그날에는 사람들이 죽기를 구하여도 얻지 못하고 죽고 싶으나 죽음이 저희를 피하리로다", chunks: ["그날에는", "사람들이", "죽기를", "구하여도", "얻지", "못하고", "죽고", "싶으나", "죽음이", "저희를", "피하리로다"] },
        { text: "황충들의 모양은 전쟁을 위하여 예비한 말들 같고 그 머리에 금 같은 면류관 비슷한 것을 썼으며 그 얼굴은 사람의 얼굴 같고", chunks: ["황충들의", "모양은", "전쟁을", "위하여", "예비한", "말들", "같고", "그", "머리에", "금", "같은", "면류관", "비슷한", "것을", "썼으며", "그", "얼굴은", "사람의", "얼굴", "같고"] },
        { text: "또 여자의 머리털 같은 머리털이 있고 그 이는 사자의 이 같으며", chunks: ["또", "여자의", "머리털", "같은", "머리털이", "있고", "그", "이는", "사자의", "이", "같으며"] },
        { text: "또 철흉갑 같은 흉갑이 있고 그 날개들의 소리는 병거와 많은 말들이 전장으로 달려 들어가는 소리 같으며", chunks: ["또", "철흉갑", "같은", "흉갑이", "있고", "그", "날개들의", "소리는", "병거와", "많은", "말들이", "전장으로", "달려", "들어가는", "소리", "같으며"] },
        { text: "또 전갈과 같은 꼬리와 쏘는 살이 있어 그 꼬리에는 다섯달 동안 사람들을 해하는 권세가 있더라", chunks: ["또", "전갈과", "같은", "꼬리와", "쏘는", "살이", "있어", "그", "꼬리에는", "다섯달", "동안", "사람들을", "해하는", "권세가", "있더라"] },
        { text: "저희에게 임금이 있으니 무저갱의 사자라 히브리 음으로 이름은 아바돈이요 헬라 음으로 이름은 아볼루온이더라", chunks: ["저희에게", "임금이", "있으니", "무저갱의", "사자라", "히브리", "음으로", "이름은", "아바돈이요", "헬라", "음으로", "이름은", "아볼루온이더라"] },
        { text: "첫째 화는 지나갔으나 보라 아직도 이 후에 화 둘이 이르리로다", chunks: ["첫째", "화는", "지나갔으나", "보라", "아직도", "이", "후에", "화", "둘이", "이르리로다"] },
        { text: "여섯째 천사가 나팔을 불매 내가 들으니 하나님 앞 금단 네 뿔에서 한 음성이 나서", chunks: ["여섯째", "천사가", "나팔을", "불매", "내가", "들으니", "하나님", "앞", "금단", "네", "뿔에서", "한", "음성이", "나서"] },
        { text: "나팔 가진 여섯째 천사에게 말하기를 큰 강 유브라데에 결박한 네 천사를 놓아 주라 하매", chunks: ["나팔", "가진", "여섯째", "천사에게", "말하기를", "큰", "강", "유브라데에", "결박한", "네", "천사를", "놓아", "주라", "하매"] },
        { text: "네 천사가 놓였으니 그들은 그 년 월 일 시에 이르러 사람 삼분의 일을 죽이기로 예비한 자들이더라", chunks: ["네", "천사가", "놓였으니", "그들은", "그", "년", "월", "일", "시에", "이르러", "사람", "삼분의", "일을", "죽이기로", "예비한", "자들이더라"] },
        { text: "마병대의 수는 이만만이니 내가 그들의 수를 들었노라", chunks: ["마병대의", "수는", "이만만이니", "내가", "그들의", "수를", "들었노라"] },
        { text: "이같이 이상한 가운데 그 말들과 그 탄 자들을 보니 불빛과 자주빛과 유황빛 흉갑이 있고 또 말들의 머리는 사자 머리 같고 그 입에서는 불과 연기와 유황이 나오더라", chunks: ["이같이", "이상한", "가운데", "그", "말들과", "그", "탄", "자들을", "보니", "불빛과", "자주빛과", "유황빛", "흉갑이", "있고", "또", "말들의", "머리는", "사자", "머리", "같고", "그", "입에서는", "불과", "연기와", "유황이", "나오더라"] },
        { text: "이 세 재앙 곧 저희 입에서 나오는 불과 연기와 유황을 인하여 사람 삼분의 일이 죽임을 당하니라", chunks: ["이", "세", "재앙", "곧", "저희", "입에서", "나오는", "불과", "연기와", "유황을", "인하여", "사람", "삼분의", "일이", "죽임을", "당하니라"] },
        { text: "이 말들의 힘은 그 입과 그 꼬리에 있으니 그 꼬리는 뱀 같고 또 꼬리에 머리가 있어 이것으로 해하더라", chunks: ["이", "말들의", "힘은", "그", "입과", "그", "꼬리에", "있으니", "그", "꼬리는", "뱀", "같고", "또", "꼬리에", "머리가", "있어", "이것으로", "해하더라"] },
        { text: "이 재앙에 죽지 않고 남은 사람들은 그 손으로 행하는 일을 회개치 아니하고 오히려 여러 귀신과 또는 보거나 듣거나 다니거나 하지 못하는 금, 은, 동과 목석의 우상에게 절하고", chunks: ["이", "재앙에", "죽지", "않고", "남은", "사람들은", "그", "손으로", "행하는", "일을", "회개치", "아니하고", "오히려", "여러", "귀신과", "또는", "보거나", "듣거나", "다니거나", "하지", "못하는", "금,", "은,", "동과", "목석의", "우상에게", "절하고"] },
        { text: "또 그 살인과 복술과 음행과 도적질을 회개치 아니하더라", chunks: ["또", "그", "살인과", "복술과", "음행과", "도적질을", "회개치", "아니하더라"] }
    ],
    10: [
        { text: "내가 또 보니 힘센 다른 천사가 구름을 입고 하늘에서 내려 오는데 그 머리 위에 무지개가 있고 그 얼굴은 해 같고 그 발은 불기둥 같으며", chunks: ["내가", "또", "보니", "힘센", "다른", "천사가", "구름을", "입고", "하늘에서", "내려", "오는데", "그", "머리", "위에", "무지개가", "있고", "그", "얼굴은", "해", "같고", "그", "발은", "불기둥", "같으며"] },
        { text: "그 손에 펴 놓인 작은 책을 들고 그 오른발은 바다를 밟고 왼발은 땅을 밟고", chunks: ["그", "손에", "펴", "놓인", "작은", "책을", "들고", "그", "오른발은", "바다를", "밟고", "왼발은", "땅을", "밟고"] },
        { text: "사자의 부르짖는것 같이 큰 소리로 외치니 외칠 때에 일곱 우뢰가 그 소리를 발하더라", chunks: ["사자의", "부르짖는것", "같이", "큰", "소리로", "외치니", "외칠", "때에", "일곱", "우뢰가", "그", "소리를", "발하더라"] },
        { text: "일곱 우뢰가 발할 때에 내가 기록하려고 하다가 곧 들으니 하늘에서 소리나서 말하기를 일곱 우뢰가 발한 것을 인봉하고 기록하지 말라 하더라", chunks: ["일곱", "우뢰가", "발할", "때에", "내가", "기록하려고", "하다가", "곧", "들으니", "하늘에서", "소리나서", "말하기를", "일곱", "우뢰가", "발한", "것을", "인봉하고", "기록하지", "말라", "하더라"] },
        { text: "내가 본바 바다와 땅을 밟고 섰는 천사가 하늘을 향하여 오른손을 들고", chunks: ["내가", "본바", "바다와", "땅을", "밟고", "섰는", "천사가", "하늘을", "향하여", "오른손을", "들고"] },
        { text: "세세토록 살아계신 자 곧 하늘과 그 가운데 있는 물건이며 땅과 그 가운데 있는 물건이며 바다와 그 가운데 있는 물건을 창조하신 이를 가리켜 맹세하여 가로되 지체하지 아니하리니", chunks: ["세세토록", "살아계신", "자", "곧", "하늘과", "그", "가운데", "있는", "물건이며", "땅과", "그", "가운데", "있는", "물건이며", "바다와", "그", "가운데", "있는", "물건을", "창조하신", "이를", "가리켜", "맹세하여", "가로되", "지체하지", "아니하리니"] },
        { text: "일곱째 천사가 소리 내는 날 그 나팔을 불게 될 때에 하나님의 비밀이 그 종 선지자들에게 전하신 복음과 같이 이루리라", chunks: ["일곱째", "천사가", "소리", "내는", "날", "그", "나팔을", "불게", "될", "때에", "하나님의", "비밀이", "그", "종", "선지자들에게", "전하신", "복음과", "같이", "이루리라"] },
        { text: "하늘에서 나서 내게 들리던 음성이 또 내게 말하여 가로되 네가 가서 바다와 땅을 밟고 섰는 천사의 손에 펴 놓인 책을 가지라 하기로", chunks: ["하늘에서", "나서", "내게", "들리던", "음성이", "또", "내게", "말하여", "가로되", "네가", "가서", "바다와", "땅을", "밟고", "섰는", "천사의", "손에", "펴", "놓인", "책을", "가지라", "하기로"] },
        { text: "내가 천사에게 나아가 작은 책을 달라 한즉 천사가 가로되 갖다 먹어버리라 네 배에는 쓰나 네 입에는 꿀 같이 달리라 하거늘", chunks: ["내가", "천사에게", "나아가", "작은", "책을", "달라", "한즉", "천사가", "가로되", "갖다", "먹어버리라", "네", "배에는", "쓰나", "네", "입에는", "꿀", "같이", "달리라", "하거늘"] },
        { text: "내가 천사의 손에서 작은 책을 갖다 먹어버리니 내 입에는 꿀 같이 다나 먹은 후에 내 배에서는 쓰게 되더라", chunks: ["내가", "천사의", "손에서", "작은", "책을", "갖다", "먹어버리니", "내", "입에는", "꿀", "같이", "다나", "먹은", "후에", "내", "배에서는", "쓰게", "되더라"] },
        { text: "저가 내게 말하기를 네가 많은 백성과 나라와 방언과 임금에게 다시 예언하여야 하리라 하더라", chunks: ["저가", "내게", "말하기를", "네가", "많은", "백성과", "나라와", "방언과", "임금에게", "다시", "예언하여야", "하리라", "하더라"] }
    ],

    11: [
        { text: "또 내게 지팡이 같은 갈대를 주며 말하기를 일어나서 하나님의 성전과 제단과 그 안에서 경배하는 자들을 척량하되", chunks: ["또", "내게", "지팡이", "같은", "갈대를", "주며", "말하기를", "일어나서", "하나님의", "성전과", "제단과", "그", "안에서", "경배하는", "자들을", "척량하되"] },
        { text: "성전 밖 마당은 척량하지 말고 그냥 두라 이것을 이방인에게 주었은즉 저희가 거룩한 성을 마흔 두달 동안 짓밟으리라", chunks: ["성전", "밖", "마당은", "척량하지", "말고", "그냥", "두라", "이것을", "이방인에게", "주었은즉", "저희가", "거룩한", "성을", "마흔", "두달", "동안", "짓밟으리라"] },
        { text: "내가 나의 두 증인에게 권세를 주리니 저희가 굵은 베옷을 입고 일천 이백 육십 일을 예언하리라", chunks: ["내가", "나의", "두", "증인에게", "권세를", "주리니", "저희가", "굵은", "베옷을", "입고", "일천", "이백", "육십", "일을", "예언하리라"] },
        { text: "이는 이 땅의 주 앞에 섰는 두 감람나무와 두 촛대니", chunks: ["이는", "이", "땅의", "주", "앞에", "섰는", "두", "감람나무와", "두", "촛대니"] },
        { text: "만일 누구든지 저희를 해하고자 한즉 저희 입에서 불이 나서 그 원수를 소멸할찌니 누구든지 해하려 하면 반드시 이와 같이 죽임을 당하리라", chunks: ["만일", "누구든지", "저희를", "해하고자", "한즉", "저희", "입에서", "불이", "나서", "그", "원수를", "소멸할찌니", "누구든지", "해하려", "하면", "반드시", "이와", "같이", "죽임을", "당하리라"] },
        { text: "저희가 권세를 가지고 하늘을 닫아 그 예언을 하는 날 동안 비 오지 못하게 하고 또 권세를 가지고 물을 변하여 피 되게 하고 아무 때든지 원하는 대로 여러가지 재앙으로 땅을 치리로다", chunks: ["저희가", "권세를", "가지고", "하늘을", "닫아", "그", "예언을", "하는", "날", "동안", "비", "오지", "못하게", "하고", "또", "권세를", "가지고", "물을", "변하여", "피", "되게", "하고", "아무", "때든지", "원하는", "대로", "여러가지", "재앙으로", "땅을", "치리로다"] },
        { text: "저희가 그 증거를 마칠 때에 무저갱으로부터 올라오는 짐승이 저희로 더불어 전쟁을 일으켜 저희를 이기고 저희를 죽일터인즉", chunks: ["저희가", "그", "증거를", "마칠", "때에", "무저갱으로부터", "올라오는", "짐승이", "저희로", "더불어", "전쟁을", "일으켜", "저희를", "이기고", "저희를", "죽일터인즉"] },
        { text: "저희 시체가 큰 성길에 있으리니 그 성은 영적으로 하면 소돔이라고도 하고 애굽이라고도 하니 곧 저희 주께서 십자가에 못 박히신 곳이니라", chunks: ["저희", "시체가", "큰", "성길에", "있으리니", "그", "성은", "영적으로", "하면", "소돔이라고도", "하고", "애굽이라고도", "하니", "곧", "저희", "주께서", "십자가에", "못", "박히신", "곳이니라"] },
        { text: "백성들과 족속과 방언과 나라 중에서 사람들이 그 시체를 사흘 반 동안을 목도하며 무덤에 장사하지 못하게 하리로다", chunks: ["백성들과", "족속과", "방언과", "나라", "중에서", "사람들이", "그", "시체를", "사흘", "반", "동안을", "목도하며", "무덤에", "장사하지", "못하게", "하리로다"] },
        { text: "이 두 선지자가 땅에 거하는 자들을 괴롭게 한고로 땅에 거하는 자들이 저희의 죽음을 즐거워하고 기뻐하여 서로 예물을 보내리라 하더라", chunks: ["이", "두", "선지자가", "땅에", "거하는", "자들을", "괴롭게", "한고로", "땅에", "거하는", "자들이", "저희의", "죽음을", "즐거워하고", "기뻐하여", "서로", "예물을", "보내리라", "하더라"] },
        { text: "삼일 반 후에 하나님께로부터 생기가 저희 속에 들어가매 저희가 발로 일어서니 구경하는 자들이 크게 두려워하더라", chunks: ["삼일", "반", "후에", "하나님께로부터", "생기가", "저희", "속에", "들어가매", "저희가", "발로", "일어서니", "구경하는", "자들이", "크게", "두려워하더라"] },
        { text: "하늘로부터 큰 음성이 있어 이리로 올라오라 함을 저희가 듣고 구름을 타고 하늘로 올라가니 저희 원수들도 구경하더라", chunks: ["하늘로부터", "큰", "음성이", "있어", "이리로", "올라오라", "함을", "저희가", "듣고", "구름을", "타고", "하늘로", "올라가니", "저희", "원수들도", "구경하더라"] },
        { text: "그 시에 큰 지진이 나서 성 십분의 일이 무너지고 지진에 죽은 사람이 칠천이라 그 남은 자들이 두려워하여 영광을 하늘의 하나님께 돌리더라", chunks: ["그", "시에", "큰", "지진이", "나서", "성", "십분의", "일이", "무너지고", "지진에", "죽은", "사람이", "칠천이라", "그", "남은", "자들이", "두려워하여", "영광을", "하늘의", "하나님께", "돌리더라"] },
        { text: "둘째 화는 지나갔으나 보라 세째 화가 속히 이르는도다", chunks: ["둘째", "화는", "지나갔으나", "보라", "세째", "화가", "속히", "이르는도다"] },
        { text: "일곱째 천사가 나팔을 불매 하늘에 큰 음성들이 나서 가로되 세상 나라가 우리 주와 그 그리스도의 나라가 되어 그가 세세토록 왕노릇 하시리로다 하니", chunks: ["일곱째", "천사가", "나팔을", "불매", "하늘에", "큰", "음성들이", "나서", "가로되", "세상", "나라가", "우리", "주와", "그", "그리스도의", "나라가", "되어", "그가", "세세토록", "왕노릇", "하시리로다", "하니"] },
        { text: "하나님 앞에 자기 보좌에 앉은 이십 사 장로들이 엎드려 얼굴을 대고 하나님께 경배하여", chunks: ["하나님", "앞에", "자기", "보좌에", "앉은", "이십", "사", "장로들이", "엎드려", "얼굴을", "대고", "하나님께", "경배하여"] },
        { text: "가로되 감사하옵나니 옛적에도 계셨고 시방도 계신 주 하나님 곧 전능하신이여 친히 큰 권능을 잡으시고 왕노릇 하시도다", chunks: ["가로되", "감사하옵나니", "옛적에도", "계셨고", "시방도", "계신", "주", "하나님", "곧", "전능하신이여", "친히", "큰", "권능을", "잡으시고", "왕노릇", "하시도다"] },
        { text: "이방들이 분노하매 주의 진노가 임하여 죽은 자를 심판하시며 종 선지자들과 성도들과 또 무론대소하고 주의 이름을 경외하는 자들에게 상 주시며 또 땅을 망하게 하는 자들을 멸망시키실 때로소이다 하더라", chunks: ["이방들이", "분노하매", "주의", "진노가", "임하여", "죽은", "자를", "심판하시며", "종", "선지자들과", "성도들과", "또", "무론대소하고", "주의", "이름을", "경외하는", "자들에게", "상", "주시며", "또", "땅을", "망하게", "하는", "자들을", "멸망시키실", "때로소이다", "하더라"] },
        { text: "이에 하늘에 있는 하나님의 성전이 열리니 성전 안에 하나님의 언약궤가 보이며 또 번개와 음성들과 뇌성과 지진과 큰 우박이 있더라", chunks: ["이에", "하늘에", "있는", "하나님의", "성전이", "열리니", "성전", "안에", "하나님의", "언약궤가", "보이며", "또", "번개와", "음성들과", "뇌성과", "지진과", "큰", "우박이", "있더라"] }
    ],
    12: [
        { text: "하늘에 큰 이적이 보이니 해를 입은 한 여자가 있는데 그 발 아래는 달이 있고 그 머리에는 열 두 별의 면류관을 썼더라", chunks: ["하늘에", "큰", "이적이", "보이니", "해를", "입은", "한", "여자가", "있는데", "그", "발", "아래는", "달이", "있고", "그", "머리에는", "열", "두", "별의", "면류관을", "썼더라"] },
        { text: "이 여자가 아이를 배어 해산하게 되매 아파서 애써 부르짖더라", chunks: ["이", "여자가", "아이를", "배어", "해산하게", "되매", "아파서", "애써", "부르짖더라"] },
        { text: "하늘에 또 다른 이적이 보이니 보라 한 큰 붉은 용이 있어 머리가 일곱이요 뿔이 열이라 그 여러 머리에 일곱 면류관이 있는데", chunks: ["하늘에", "또", "다른", "이적이", "보이니", "보라", "한", "큰", "붉은", "용이", "있어", "머리가", "일곱이요", "뿔이", "열이라", "그", "여러", "머리에", "일곱", "면류관이", "있는데"] },
        { text: "그 꼬리가 하늘 별 삼분의 일을 끌어다가 땅에 던지더라 용이 해산하려는 여자 앞에서 그가 해산하면 그 아이를 삼키고자 하더니", chunks: ["그", "꼬리가", "하늘", "별", "삼분의", "일을", "끌어다가", "땅에", "던지더라", "용이", "해산하려는", "여자", "앞에서", "그가", "해산하면", "그", "아이를", "삼키고자", "하더니"] },
        { text: "여자가 아들을 낳으니 이는 장차 철장으로 만국을 다스릴 남자라 그 아이를 하나님 앞과 그 보좌 앞으로 올려가더라", chunks: ["여자가", "아들을", "낳으니", "이는", "장차", "철장으로", "만국을", "다스릴", "남자라", "그", "아이를", "하나님", "앞과", "그", "보좌", "앞으로", "올려가더라"] },
        { text: "그 여자가 광야로 도망하매 거기서 일천 이백 육십일 동안 저를 양육하기 위하여 하나님의 예비하신 곳이 있더라", chunks: ["그", "여자가", "광야로", "도망하매", "거기서", "일천", "이백", "육십일", "동안", "저를", "양육하기", "위하여", "하나님의", "예비하신", "곳이", "있더라"] },
        { text: "하늘에 전쟁이 있으니 미가엘과 그의 사자들이 용으로 더불어 싸울쌔 용과 그의 사자들도 싸우나", chunks: ["하늘에", "전쟁이", "있으니", "미가엘과", "그의", "사자들이", "용으로", "더불어", "싸울쌔", "용과", "그의", "사자들도", "싸우나"] },
        { text: "이기지 못하여 다시 하늘에서 저희의 있을 곳을 얻지 못한지라", chunks: ["이기지", "못하여", "다시", "하늘에서", "저희의", "있을", "곳을", "얻지", "못한지라"] },
        { text: "큰 용이 내어 쫓기니 옛 뱀 곧 마귀라고도 하고 사단이라고도 하는 온 천하를 꾀는 자라 땅으로 내어 쫓기니 그의 사자들도 저와 함께 내어 쫓기니라", chunks: ["큰", "용이", "내어", "쫓기니", "옛", "뱀", "곧", "마귀라고도", "하고", "사단이라고도", "하는", "온", "천하를", "꾀는", "자라", "땅으로", "내어", "쫓기니", "그의", "사자들도", "저와", "함께", "내어", "쫓기니라"] },
        { text: "내가 또 들으니 하늘에 큰 음성이 있어 가로되 이제 우리 하나님의 구원과 능력과 나라와 또 그의 그리스도의 권세가 이루었으니 우리 형제들을 참소하던 자 곧 우리 하나님 앞에서 밤낮 참소하던 자가 쫓겨 났고", chunks: ["내가", "또", "들으니", "하늘에", "큰", "음성이", "있어", "가로되", "이제", "우리", "하나님의", "구원과", "능력과", "나라와", "또", "그의", "그리스도의", "권세가", "이루었으니", "우리", "형제들을", "참소하던", "자", "곧", "우리", "하나님", "앞에서", "밤낮", "참소하던", "자가", "쫓겨", "났고"] },
        { text: "또 여러 형제가 어린 양의 피와 자기의 증거하는 말을 인하여 저를 이기었으니 그들은 죽기까지 자기 생명을 아끼지 아니하였도다", chunks: ["또", "여러", "형제가", "어린", "양의", "피와", "자기의", "증거하는", "말을", "인하여", "저를", "이기었으니", "그들은", "죽기까지", "자기", "생명을", "아끼지", "아니하였도다"] },
        { text: "그러므로 하늘과 그 가운데 거하는 자들은 즐거워하라 그러나 땅과 바다는 화 있을찐저 이는 마귀가 자기의 때가 얼마 못된 줄을 알므로 크게 분내어 너희에게 내려 갔음이라 하더라", chunks: ["그러므로", "하늘과", "그", "가운데", "거하는", "자들은", "즐거워하라", "그러나", "땅과", "바다는", "화", "있을찐저", "이는", "마귀가", "자기의", "때가", "얼마", "못된", "줄을", "알므로", "크게", "분내어", "너희에게", "내려", "갔음이라", "하더라"] },
        { text: "용이 자기가 땅으로 내어쫓긴 것을 보고 남자를 낳은 여자를 핍박하는지라", chunks: ["용이", "자기가", "땅으로", "내어쫓긴", "것을", "보고", "남자를", "낳은", "여자를", "핍박하는지라"] },
        { text: "그 여자가 큰 독수리의 두 날개를 받아 광야 자기 곳으로 날아가 거기서 그 뱀의 낯을 피하여 한 때와 두 때와 반 때를 양육 받으매", chunks: ["그", "여자가", "큰", "독수리의", "두", "날개를", "받아", "광야", "자기", "곳으로", "날아가", "거기서", "그", "뱀의", "낯을", "피하여", "한", "때와", "두", "때와", "반", "때를", "양육", "받으매"] },
        { text: "여자의 뒤에서 뱀이 그 입으로 물을 강 같이 토하여 여자를 물에 떠내려 가게 하려 하되", chunks: ["여자의", "뒤에서", "뱀이", "그", "입으로", "물을", "강", "같이", "토하여", "여자를", "물에", "떠내려", "가게", "하려", "하되"] },
        { text: "땅이 여자를 도와 그 입을 벌려 용의 입에서 토한 강물을 삼키니", chunks: ["땅이", "여자를", "도와", "그", "입을", "벌려", "용의", "입에서", "토한", "강물을", "삼키니"] },
        { text: "용이 여자에게 분노하여 돌아가서 그 여자의 남은 자손 곧 하나님의 계명을 지키며 예수의 증거를 가진 자들로 더불어 싸우려고 바다 모래 위에 섰더라", chunks: ["용이", "여자에게", "분노하여", "돌아가서", "그", "여자의", "남은", "자손", "곧", "하나님의", "계명을", "지키며", "예수의", "증거를", "가진", "자들로", "더불어", "싸우려고", "바다", "모래", "위에", "섰더라"] }
    ],
    13: [
        { text: "내가 보니 바다에서 한 짐승이 나오는데 뿔이 열이요 머리가 일곱이라 그 뿔에는 열 면류관이 있고 그 머리들에는 참람된 이름들이 있더라", chunks: ["내가", "보니", "바다에서", "한", "짐승이", "나오는데", "뿔이", "열이요", "머리가", "일곱이라", "그", "뿔에는", "열", "면류관이", "있고", "그", "머리들에는", "참람된", "이름들이", "있더라"] },
        { text: "내가 본 짐승은 표범과 비슷하고 그 발은 곰의 발 같고 그 입은 사자의 입 같은데 용이 자기의 능력과 보좌와 큰 권세를 그에게 주었더라", chunks: ["내가", "본", "짐승은", "표범과", "비슷하고", "그", "발은", "곰의", "발", "같고", "그", "입은", "사자의", "입", "같은데", "용이", "자기의", "능력과", "보좌와", "큰", "권세를", "그에게", "주었더라"] },
        { text: "그의 머리 하나가 상하여 죽게 된 것 같더니 그 죽게 되었던 상처가 나으매 온 땅이 이상히 여겨 짐승을 따르고", chunks: ["그의", "머리", "하나가", "상하여", "죽게", "된", "것", "같더니", "그", "죽게", "되었던", "상처가", "나으매", "온", "땅이", "이상히", "여겨", "짐승을", "따르고"] },
        { text: "용이 짐승에게 권세를 주므로 용에게 경배하며 짐승에게 경배하여 가로되 누가 이 짐승과 같으뇨 누가 능히 이로 더불어 싸우리요 하더라", chunks: ["용이", "짐승에게", "권세를", "주므로", "용에게", "경배하며", "짐승에게", "경배하여", "가로되", "누가", "이", "짐승과", "같으뇨", "누가", "능히", "이로", "더불어", "싸우리요", "하더라"] },
        { text: "또 짐승이 큰 말과 참람된 말 하는 입을 받고 또 마흔 두달 일할 권세를 받으니라", chunks: ["또", "짐승이", "큰", "말과", "참람된", "말", "하는", "입을", "받고", "또", "마흔", "두달", "일할", "권세를", "받으니라"] },
        { text: "짐승이 입을 벌려 하나님을 향하여 훼방하되 그의 이름과 그의 장막 곧 하늘에 거하는 자들을 훼방하더라", chunks: ["짐승이", "입을", "벌려", "하나님을", "향하여", "훼방하되", "그의", "이름과", "그의", "장막", "곧", "하늘에", "거하는", "자들을", "훼방하더라"] },
        { text: "또 권세를 받아 성도들과 싸워 이기게 되고 각 족속과 백성과 방언과 나라를 다스리는 권세를 받으니", chunks: ["또", "권세를", "받아", "성도들과", "싸워", "이기게", "되고", "각", "족속과", "백성과", "방언과", "나라를", "다스리는", "권세를", "받으니"] },
        { text: "죽임을 당한 어린 양의 생명책에 창세 이후로 녹명되지 못하고 이 땅에 사는 자들은 다 짐승에게 경배하리라", chunks: ["죽임을", "당한", "어린", "양의", "생명책에", "창세", "이후로", "녹명되지", "못하고", "이", "땅에", "사는", "자들은", "다", "짐승에게", "경배하리라"] },
        { text: "누구든지 귀가 있거든 들을찌어다", chunks: ["누구든지", "귀가", "있거든", "들을찌어다"] },
        { text: "사로잡는 자는 사로잡힐 것이요 칼로 죽이는 자는 자기도 마땅히 칼에 죽으리니 성도들의 인내와 믿음이 여기 있느니라", chunks: ["사로잡는", "자는", "사로잡힐", "것이요", "칼로", "죽이는", "자는", "자기도", "마땅히", "칼에", "죽으리니", "성도들의", "인내와", "믿음이", "여기", "있느니라"] },
        { text: "내가 보매 또 다른 짐승이 땅에서 올라오니 새끼양 같이 두 뿔이 있고 용처럼 말하더라", chunks: ["내가", "보매", "또", "다른", "짐승이", "땅에서", "올라오니", "새끼양", "같이", "두", "뿔이", "있고", "용처럼", "말하더라"] },
        { text: "저가 먼저 나온 짐승의 모든 권세를 그 앞에서 행하고 땅과 땅에 거하는 자들로 처음 짐승에게 경배하게 하니 곧 죽게 되었던 상처가 나은 자니라", chunks: ["저가", "먼저", "나온", "짐승의", "모든", "권세를", "그", "앞에서", "행하고", "땅과", "땅에", "거하는", "자들로", "처음", "짐승에게", "경배하게", "하니", "곧", "죽게", "되었던", "상처가", "나은", "자니라"] },
        { text: "큰 이적을 행하되 심지어 사람들 앞에서 불이 하늘로부터 땅에 내려 오게 하고", chunks: ["큰", "이적을", "행하되", "심지어", "사람들", "앞에서", "불이", "하늘로부터", "땅에", "내려", "오게", "하고"] },
        { text: "짐승 앞에서 받은바 이적을 행함으로 땅에 거하는 자들을 미혹하며 땅에 거하는 자들에게 이르기를 칼에 상하였다가 살아난 짐승을 위하여 우상을 만들라 하더라", chunks: ["짐승", "앞에서", "받은바", "이적을", "행함으로", "땅에", "거하는", "자들을", "미혹하며", "땅에", "거하는", "자들에게", "이르기를", "칼에", "상하였다가", "살아난", "짐승을", "위하여", "우상을", "만들라", "하더라"] },
        { text: "저가 권세를 받아 그 짐승의 우상에게 생기를 주어 그 짐승의 우상으로 말하게 하고 또 짐승의 우상에게 경배하지 아니하는 자는 몇이든지 다 죽이게 하더라", chunks: ["저가", "권세를", "받아", "그", "짐승의", "우상에게", "생기를", "주어", "그", "짐승의", "우상으로", "말하게", "하고", "또", "짐승의", "우상에게", "경배하지", "아니하는", "자는", "몇이든지", "다", "죽이게", "하더라"] },
        { text: "저가 모든 자 곧 작은 자나 큰 자나 부자나 빈궁한 자나 자유한 자나 종들로 그 오른손에나 이마에 표를 받게 하고", chunks: ["저가", "모든", "자", "곧", "작은", "자나", "큰", "자나", "부자나", "빈궁한", "자나", "자유한", "자나", "종들로", "그", "오른손에나", "이마에", "표를", "받게", "하고"] },
        { text: "누구든지 이 표를 가진 자 외에는 매매를 못하게 하니 이 표는 곧 짐승의 이름이나 그 이름의 수라", chunks: ["누구든지", "이", "표를", "가진", "자", "외에는", "매매를", "못하게", "하니", "이", "표는", "곧", "짐승의", "이름이나", "그", "이름의", "수라"] },
        { text: "지혜가 여기 있으니 총명 있는 자는 그 짐승의 수를 세어 보라 그 수는 사람의 수니 육백 육십 륙이니라", chunks: ["지혜가", "여기", "있으니", "총명", "있는", "자는", "그", "짐승의", "수를", "세어", "보라", "그", "수는", "사람의", "수니", "육백", "육십", "륙이니라"] }
    ],
    14: [
        { text: "또 내가 보니 보라 어린 양이 시온산에 섰고 그와 함께 십 사만 사천이 섰는데 그 이마에 어린 양의 이름과 그 아버지의 이름을 쓴 것이 있도다", chunks: ["또", "내가", "보니", "보라", "어린", "양이", "시온산에", "섰고", "그와", "함께", "십", "사만", "사천이", "섰는데", "그", "이마에", "어린", "양의", "이름과", "그", "아버지의", "이름을", "쓴", "것이", "있도다"] },
        { text: "내가 하늘에서 나는 소리를 들으니 많은 물소리도 같고 큰 뇌성도 같은데 내게 들리는 소리는 거문고 타는 자들의 그 거문고 타는 것 같더라", chunks: ["내가", "하늘에서", "나는", "소리를", "들으니", "많은", "물소리도", "같고", "큰", "뇌성도", "같은데", "내게", "들리는", "소리는", "거문고", "타는", "자들의", "그", "거문고", "타는", "것", "같더라"] },
        { text: "저희가 보좌와 네 생물과 장로들 앞에서 새 노래를 부르니 땅에서 구속함을 얻은 십 사만 사천인 밖에는 능히 이 노래를 배울 자가 없더라", chunks: ["저희가", "보좌와", "네", "생물과", "장로들", "앞에서", "새", "노래를", "부르니", "땅에서", "구속함을", "얻은", "십", "사만", "사천인", "밖에는", "능히", "이", "노래를", "배울", "자가", "없더라"] },
        { text: "이 사람들은 여자로 더불어 더럽히지 아니하고 정절이 있는 자라 어린 양이 어디로 인도하든지 따라가는 자며 사람 가운데서 구속을 받아 처음 익은 열매로 하나님과 어린 양에게 속한 자들이니", chunks: ["이", "사람들은", "여자로", "더불어", "더럽히지", "아니하고", "정절이", "있는", "자라", "어린", "양이", "어디로", "인도하든지", "따라가는", "자며", "사람", "가운데서", "구속을", "받아", "처음", "익은", "열매로", "하나님과", "어린", "양에게", "속한", "자들이니"] },
        { text: "그 입에 거짓말이 없고 흠이 없는 자들이더라", chunks: ["그", "입에", "거짓말이", "없고", "흠이", "없는", "자들이더라"] },
        { text: "또 보니 다른 천사가 공중에 날아가는데 땅에 거하는 자들 곧 여러 나라와 족속과 방언과 백성에게 전할 영원한 복음을 가졌더라", chunks: ["또", "보니", "다른", "천사가", "공중에", "날아가는데", "땅에", "거하는", "자들", "곧", "여러", "나라와", "족속과", "방언과", "백성에게", "전할", "영원한", "복음을", "가졌더라"] },
        { text: "그가 큰 음성으로 가로되 하나님을 두려워하며 그에게 영광을 돌리라 이는 그의 심판하실 시간이 이르렀음이니 하늘과 땅과 바다와 물들의 근원을 만드신 이를 경배하라 하더라", chunks: ["그가", "큰", "음성으로", "가로되", "하나님을", "두려워하며", "그에게", "영광을", "돌리라", "이는", "그의", "심판하실", "시간이", "이르렀음이니", "하늘과", "땅과", "바다와", "물들의", "근원을", "만드신", "이를", "경배하라", "하더라"] },
        { text: "또 다른 천사 곧 둘째가 그 뒤를 따라 말하되 무너졌도다 무너졌도다 큰 성 바벨론이여 모든 나라를 그 음행으로 인하여 진노의 포도주로 먹이던 자로다 하더라", chunks: ["또", "다른", "천사", "곧", "둘째가", "그", "뒤를", "따라", "말하되", "무너졌도다", "무너졌도다", "큰", "성", "바벨론이여", "모든", "나라를", "그", "음행으로", "인하여", "진노의", "포도주로", "먹이던", "자로다", "하더라"] },
        { text: "또 다른 천사 곧 세째가 그 뒤를 따라 큰 음성으로 가로되 만일 누구든지 짐승과 그의 우상에게 경배하고 이마에나 손에 표를 받으면", chunks: ["또", "다른", "천사", "곧", "세째가", "그", "뒤를", "따라", "큰", "음성으로", "가로되", "만일", "누구든지", "짐승과", "그의", "우상에게", "경배하고", "이마에나", "손에", "표를", "받으면"] },
        { text: "그도 하나님의 진노의 포도주를 마시리니 그 진노의 잔에 섞인 것이 없이 부은 포도주라 거룩한 천사들 앞과 어린 양 앞에서 불과 유황으로 고난을 받으리니", chunks: ["그도", "하나님의", "진노의", "포도주를", "마시리니", "그", "진노의", "잔에", "섞인", "것이", "없이", "부은", "포도주라", "거룩한", "천사들", "앞과", "어린", "양", "앞에서", "불과", "유황으로", "고난을", "받으리니"] },
        { text: "그 고난의 연기가 세세토록 올라가리로다 짐승과 그의 우상에게 경배하고 그 이름의 표를 받는 자는 누구든지 밤낮 쉼을 얻지 못하리라 하더라", chunks: ["그", "고난의", "연기가", "세세토록", "올라가리로다", "짐승과", "그의", "우상에게", "경배하고", "그", "이름의", "표를", "받는", "자는", "누구든지", "밤낮", "쉼을", "얻지", "못하리라", "하더라"] },
        { text: "성도들의 인내가 여기 있나니 저희는 하나님의 계명과 예수 믿음을 지키는 자니라", chunks: ["성도들의", "인내가", "여기", "있나니", "저희는", "하나님의", "계명과", "예수", "믿음을", "지키는", "자니라"] },
        { text: "또 내가 들으니 하늘에서 음성이 나서 가로되 기록하라 자금 이후로 주 안에서 죽는 자들은 복이 있도다 하시매 성령이 가라사대 그러하다 저희 수고를 그치고 쉬리니 이는 저희의 행한 일이 따름이라 하시더라", chunks: ["또", "내가", "들으니", "하늘에서", "음성이", "나서", "가로되", "기록하라", "자금", "이후로", "주", "안에서", "죽는", "자들은", "복이", "있도다", "하시매", "성령이", "가라사대", "그러하다", "저희", "수고를", "그치고", "쉬리니", "이는", "저희의", "행한", "일이", "따름이라", "하시더라"] },
        { text: "또 내가 보니 흰구름이 있고 구름 위에 사람의 아들과 같은 이가 앉았는데 그 머리에는 금 면류관이 있고 그 손에는 이한 낫을 가졌더라", chunks: ["또", "내가", "보니", "흰구름이", "있고", "구름", "위에", "사람의", "아들과", "같은", "이가", "앉았는데", "그", "머리에는", "금", "면류관이", "있고", "그", "손에는", "이한", "낫을", "가졌더라"] },
        { text: "또 다른 천사가 성전으로부터 나와 구름 위에 앉은이를 향하여 큰 음성으로 외쳐 가로되 네 낫을 휘둘러 거두라 거둘 때가 이르러 땅에 곡식이 다 익었음이로다 하니", chunks: ["또", "다른", "천사가", "성전으로부터", "나와", "구름", "위에", "앉은이를", "향하여", "큰", "음성으로", "외쳐", "가로되", "네", "낫을", "휘둘러", "거두라", "거둘", "때가", "이르러", "땅에", "곡식이", "다", "익었음이로다", "하니"] },
        { text: "구름 위에 앉으신 이가 낫을 땅에 휘두르매 곡식이 거두어지니라", chunks: ["구름", "위에", "앉으신", "이가", "낫을", "땅에", "휘두르매", "곡식이", "거두어지니라"] },
        { text: "또 다른 천사가 하늘에 있는 성전에서 나오는데 또한 이한 낫을 가졌더라", chunks: ["또", "다른", "천사가", "하늘에", "있는", "성전에서", "나오는데", "또한", "이한", "낫을", "가졌더라"] },
        { text: "또 불을 다스리는 다른 천사가 제단으로부터 나와 이한 낫 가진 자를 향하여 큰 음성으로 불러 가로되 네 이한 낫을 휘둘러 땅의 포도송이를 거두라 그 포도가 익었느니라 하더라", chunks: ["또", "불을", "다스리는", "다른", "천사가", "제단으로부터", "나와", "이한", "낫", "가진", "자를", "향하여", "큰", "음성으로", "불러", "가로되", "네", "이한", "낫을", "휘둘러", "땅의", "포도송이를", "거두라", "그", "포도가", "익었느니라", "하더라"] },
        { text: "천사가 낫을 땅에 휘둘러 땅의 포도를 거두어 하나님의 진노의 큰 포도주 틀에 던지매", chunks: ["천사가", "낫을", "땅에", "휘둘러", "땅의", "포도를", "거두어", "하나님의", "진노의", "큰", "포도주", "틀에", "던지매"] },
        { text: "성 밖에서 그 틀이 밟히니 틀에서 피가 나서 말굴레까지 닿았고 일천 육백 스다디온에 퍼졌더라", chunks: ["성", "밖에서", "그", "틀이", "밟히니", "틀에서", "피가", "나서", "말굴레까지", "닿았고", "일천", "육백", "스다디온에", "퍼졌더라"] }
    ],
    15: [
        { text: "또 하늘에 크고 이상한 다른 이적을 보매 일곱 천사가 일곱 재앙을 가졌으니 곧 마지막 재앙이라 하나님의 진노가 이것으로 마치리로다", chunks: ["또", "하늘에", "크고", "이상한", "다른", "이적을", "보매", "일곱", "천사가", "일곱", "재앙을", "가졌으니", "곧", "마지막", "재앙이라", "하나님의", "진노가", "이것으로", "마치리로다"] },
        { text: "또 내가 보니 불이 섞인 유리 바다 같은 것이 있고 짐승과 그의 우상과 그의 이름의 수를 이기고 벗어난 자들이 유리바다 가에 서서 하나님의 거문고를 가지고", chunks: ["또", "내가", "보니", "불이", "섞인", "유리", "바다", "같은", "것이", "있고", "짐승과", "그의", "우상과", "그의", "이름의", "수를", "이기고", "벗어난", "자들이", "유리바다", "가에", "서서", "하나님의", "거문고를", "가지고"] },
        { text: "하나님의 종 모세의 노래, 어린 양의 노래를 불러 가로되 주 하나님 곧 전능하신이시여 하시는 일이 크고 기이하시도다 만국의 왕이시여 주의 길이 의롭고 참되시도다", chunks: ["하나님의", "종", "모세의", "노래,", "어린", "양의", "노래를", "불러", "가로되", "주", "하나님", "곧", "전능하신이시여", "하시는", "일이", "크고", "기이하시도다", "만국의", "왕이시여", "주의", "길이", "의롭고", "참되시도다"] },
        { text: "주여 누가 주의 이름을 두려워하지 아니하며 영화롭게 하지 아니하오리이까 오직 주만 거룩하시니이다 주의 의로우신 일이 나타났으매 만국이 와서 주께 경배하리이다 하더라", chunks: ["주여", "누가", "주의", "이름을", "두려워하지", "아니하며", "영화롭게", "하지", "아니하오리이까", "오직", "주만", "거룩하시니이다", "주의", "의로우신", "일이", "나타났으매", "만국이", "와서", "주께", "경배하리이다", "하더라"] },
        { text: "또 이 일 후에 내가 보니 하늘에 증거 장막의 성전이 열리며", chunks: ["또", "이", "일", "후에", "내가", "보니", "하늘에", "증거", "장막의", "성전이", "열리며"] },
        { text: "일곱 재앙을 가진 일곱 천사가 성전으로부터 나와 맑고 빛난 세마포 옷을 입고 가슴에 금띠를 띠고", chunks: ["일곱", "재앙을", "가진", "일곱", "천사가", "성전으로부터", "나와", "맑고", "빛난", "세마포", "옷을", "입고", "가슴에", "금띠를", "띠고"] },
        { text: "네 생물 중에 하나가 세세에 계신 하나님의 진노를 가득히 담은 금대접 일곱을 그 일곱 천사에게 주니", chunks: ["네", "생물", "중에", "하나가", "세세에", "계신", "하나님의", "진노를", "가득히", "담은", "금대접", "일곱을", "그", "일곱", "천사에게", "주니"] },
        { text: "하나님의 영광과 능력을 인하여 성전에 연기가 차게 되매 일곱 천사의 일곱 재앙이 마치기까지는 성전에 능히 들어갈 자가 없더라", chunks: ["하나님의", "영광과", "능력을", "인하여", "성전에", "연기가", "차게", "되매", "일곱", "천사의", "일곱", "재앙이", "마치기까지는", "성전에", "능히", "들어갈", "자가", "없더라"] }
    ],

    16: [
        { text: "또 내가 들으니 성전에서 큰 음성이 나서 일곱 천사에게 말하되 너희는 가서 하나님의 진노의 일곱 대접을 땅에 쏟으라 하더라", chunks: ["또", "내가", "들으니", "성전에서", "큰", "음성이", "나서", "일곱", "천사에게", "말하되", "너희는", "가서", "하나님의", "진노의", "일곱", "대접을", "땅에", "쏟으라", "하더라"] },
        { text: "첫째가 가서 그 대접을 땅에 쏟으매 악하고 독한 헌데가 짐승의 표를 받은 사람들과 그 우상에게 경배하는 자들에게 나더라", chunks: ["첫째가", "가서", "그", "대접을", "땅에", "쏟으매", "악하고", "독한", "헌데가", "짐승의", "표를", "받은", "사람들과", "그", "우상에게", "경배하는", "자들에게", "나더라"] },
        { text: "둘째가 그 대접을 바다에 쏟으매 바다가 곧 죽은 자의 피 같이 되니 바다 가운데 모든 생물이 죽더라", chunks: ["둘째가", "그", "대접을", "바다에", "쏟으매", "바다가", "곧", "죽은", "자의", "피", "같이", "되니", "바다", "가운데", "모든", "생물이", "죽더라"] },
        { text: "세째가 그 대접을 강과 물 근원에 쏟으매 피가 되더라", chunks: ["세째가", "그", "대접을", "강과", "물", "근원에", "쏟으매", "피가", "되더라"] },
        { text: "내가 들으니 물을 차지한 천사가 가로되 전에도 계셨고 시방도 계신 거룩하신 이여 이렇게 심판하시니 의로우시도다", chunks: ["내가", "들으니", "물을", "차지한", "천사가", "가로되", "전에도", "계셨고", "시방도", "계신", "거룩하신", "이여", "이렇게", "심판하시니", "의로우시도다"] },
        { text: "저희가 성도들과 선지자들의 피를 흘렸으므로 저희로 피를 마시게 하신 것이 합당하니이다 하더라", chunks: ["저희가", "성도들과", "선지자들의", "피를", "흘렸으므로", "저희로", "피를", "마시게", "하신", "것이", "합당하니이다", "하더라"] },
        { text: "또 내가 들으니 제단이 말하기를 그러하다 주 하나님 곧 전능하신 이시여 심판하시는 것이 참되시고 의로우시도다 하더라", chunks: ["또", "내가", "들으니", "제단이", "말하기를", "그러하다", "주", "하나님", "곧", "전능하신", "이시여", "심판하시는", "것이", "참되시고", "의로우시도다", "하더라"] },
        { text: "네째가 그 대접을 해에 쏟으매 해가 권세를 받아 불로 사람들을 태우니", chunks: ["네째가", "그", "대접을", "해에", "쏟으매", "해가", "권세를", "받아", "불로", "사람들을", "태우니"] },
        { text: "사람들이 크게 태움에 태워진지라 이 재앙들을 행하는 권세를 가지신 하나님의 이름을 훼방하며 또 회개하여 영광을 주께 돌리지 아니하더라", chunks: ["사람들이", "크게", "태움에", "태워진지라", "이", "재앙들을", "행하는", "권세를", "가지신", "하나님의", "이름을", "훼방하며", "또", "회개하여", "영광을", "주께", "돌리지", "아니하더라"] },
        { text: "또 다섯째가 그 대접을 짐승의 보좌에 쏟으니 그 나라가 곧 어두워지며 사람들이 아파서 자기 혀를 깨물고", chunks: ["또", "다섯째가", "그", "대접을", "짐승의", "보좌에", "쏟으니", "그", "나라가", "곧", "어두워지며", "사람들이", "아파서", "자기", "혀를", "깨물고"] },
        { text: "아픈 것과 종기로 인하여 하늘의 하나님을 훼방하고 저희 행위를 회개치 아니하더라", chunks: ["아픈", "것과", "종기로", "인하여", "하늘의", "하나님을", "훼방하고", "저희", "행위를", "회개치", "아니하더라"] },
        { text: "또 여섯째가 그 대접을 큰 강 유브라데에 쏟으매 강물이 말라서 동방에서 오는 왕들의 길이 예비되더라", chunks: ["또", "여섯째가", "그", "대접을", "큰", "강", "유브라데에", "쏟으매", "강물이", "말라서", "동방에서", "오는", "왕들의", "길이", "예비되더라"] },
        { text: "또 내가 보매 개구리 같은 세 더러운 영이 용의 입과 짐승의 입과 거짓 선지자의 입에서 나오니", chunks: ["또", "내가", "보매", "개구리", "같은", "세", "더러운", "영이", "용의", "입과", "짐승의", "입과", "거짓", "선지자의", "입에서", "나오니"] },
        { text: "저희는 귀신의 영이라 이적을 행하여 온 천하 임금들에게 가서 하나님 곧 전능하신이의 큰 날에 전쟁을 위하여 그들을 모으더라", chunks: ["저희는", "귀신의", "영이라", "이적을", "행하여", "온", "천하", "임금들에게", "가서", "하나님", "곧", "전능하신이의", "큰", "날에", "전쟁을", "위하여", "그들을", "모으더라"] },
        { text: "보라 내가 도적 같이 오리니 누구든지 깨어 자기 옷을 지켜 벌거벗고 다니지 아니하며 자기의 부끄러움을 보이지 아니하는 자가 복이 있도다", chunks: ["보라", "내가", "도적", "같이", "오리니", "누구든지", "깨어", "자기", "옷을", "지켜", "벌거벗고", "다니지", "아니하며", "자기의", "부끄러움을", "보이지", "아니하는", "자가", "복이", "있도다"] },
        { text: "세 영이 히브리 음으로 아마겟돈이라 하는 곳으로 왕들을 모으더라", chunks: ["세", "영이", "히브리", "음으로", "아마겟돈이라", "하는", "곳으로", "왕들을", "모으더라"] },
        { text: "일곱째가 그 대접을 공기 가운데 쏟으매 큰 음성이 성전에서 보좌로부터 나서 가로되 되었다 하니", chunks: ["일곱째가", "그", "대접을", "공기", "가운데", "쏟으매", "큰", "음성이", "성전에서", "보좌로부터", "나서", "가로되", "되었다", "하니"] },
        { text: "번개와 음성들과 뇌성이 있고 또 큰 지진이 있어 어찌 큰지 사람이 땅에 있어 옴으로 이같이 큰 지진이 없었더라", chunks: ["번개와", "음성들과", "뇌성이", "있고", "또", "큰", "지진이", "있어", "어찌", "큰지", "사람이", "땅에", "있어", "옴으로", "이같이", "큰", "지진이", "없었더라"] },
        { text: "큰 성이 세 갈래로 갈라지고 만국의 성들도 무너지니 큰 성 바벨론이 하나님 앞에 기억하신바 되어 그의 맹렬한 진노의 포도주 잔을 받으매", chunks: ["큰", "성이", "세", "갈래로", "갈라지고", "만국의", "성들도", "무너지니", "큰", "성", "바벨론이", "하나님", "앞에", "기억하신바", "되어", "그의", "맹렬한", "진노의", "포도주", "잔을", "받으매"] },
        { text: "각 섬도 없어지고 산악도 간데 없더라", chunks: ["각", "섬도", "없어지고", "산악도", "간데", "없더라"] },
        { text: "또 중수가 한 달란트나 되는 큰 우박이 하늘로부터 사람들에게 내리매 사람들이 그 박재로 인하여 하나님을 훼방하니 그 재앙이 심히 큼이러라", chunks: ["또", "중수가", "한", "달란트나", "되는", "큰", "우박이", "하늘로부터", "사람들에게", "내리매", "사람들이", "그", "박재로", "인하여", "하나님을", "훼방하니", "그", "재앙이", "심히", "큼이러라"] }
    ],
    17: [
        { text: "또 일곱 대접을 가진 일곱 천사 중 하나가 와서 내게 말하여 가로되 이리 오라 많은 물위에 앉은 큰 음녀의 받을 심판을 네게 보이리라", chunks: ["또", "일곱", "대접을", "가진", "일곱", "천사", "중", "하나가", "와서", "내게", "말하여", "가로되", "이리", "오라", "많은", "물위에", "앉은", "큰", "음녀의", "받을", "심판을", "네게", "보이리라"] },
        { text: "땅의 임금들도 그로 더불어 음행하였고 땅에 거하는 자들도 그 음행의 포도주에 취하였다 하고", chunks: ["땅의", "임금들도", "그로", "더불어", "음행하였고", "땅에", "거하는", "자들도", "그", "음행의", "포도주에", "취하였다", "하고"] },
        { text: "곧 성령으로 나를 데리고 광야로 가니라 내가 보니 여자가 붉은 빛 짐승을 탔는데 그 짐승의 몸에 참람된 이름들이 가득하고 일곱 머리와 열 뿔이 있으며", chunks: ["곧", "성령으로", "나를", "데리고", "광야로", "가니라", "내가", "보니", "여자가", "붉은", "빛", "짐승을", "탔는데", "그", "짐승의", "몸에", "참람된", "이름들이", "가득하고", "일곱", "머리와", "열", "뿔이", "있으며"] },
        { text: "그 여자는 자주 빛과 붉은 빛 옷을 입고 금과 보석과 진주로 꾸미고 손에 금잔을 가졌는데 가증한 물건과 그의 음행의 더러운 것들이 가득하더라", chunks: ["그", "여자는", "자주", "빛과", "붉은", "빛", "옷을", "입고", "금과", "보석과", "진주로", "꾸미고", "손에", "금잔을", "가졌는데", "가증한", "물건과", "그의", "음행의", "더러운", "것들이", "가득하더라"] },
        { text: "그 이마에 이름이 기록되었으니 비밀이라, 큰 바벨론이라, 땅의 음녀들과 가증한 것들의 어미라 하였더라", chunks: ["그", "이마에", "이름이", "기록되었으니", "비밀이라,", "큰", "바벨론이라,", "땅의", "음녀들과", "가증한", "것들의", "어미라", "하였더라"] },
        { text: "또 내가 보매 이 여자가 성도들의 피와 예수의 증인들의 피에 취한지라 내가 그 여자를 보고 기이히 여기고 크게 기이히 여기니", chunks: ["또", "내가", "보매", "이", "여자가", "성도들의", "피와", "예수의", "증인들의", "피에", "취한지라", "내가", "그", "여자를", "보고", "기이히", "여기고", "크게", "기이히", "여기니"] },
        { text: "천사가 가로되 왜 기이히 여기느냐 내가 여자와 그의 탄바 일곱 머리와 열 뿔 가진 짐승의 비밀을 네게 이르리라", chunks: ["천사가", "가로되", "왜", "기이히", "여기느냐", "내가", "여자와", "그의", "탄바", "일곱", "머리와", "열", "뿔", "가진", "짐승의", "비밀을", "네게", "이르리라"] },
        { text: "네가 본 짐승은 전에 있었다가 시방 없으나 장차 무저갱으로부터 올라와 멸망으로 들어갈 자니 땅에 거하는 자들로서 창세 이후로 생명책에 녹명되지 못한 자들이 이전에 있었다가 시방 없으나 장차 나올 짐승을 보고 기이히 여기리라", chunks: ["네가", "본", "짐승은", "전에", "있었다가", "시방", "없으나", "장차", "무저갱으로부터", "올라와", "멸망으로", "들어갈", "자니", "땅에", "거하는", "자들로서", "창세", "이후로", "생명책에", "녹명되지", "못한", "자들이", "이전에", "있었다가", "시방", "없으나", "장차", "나올", "짐승을", "보고", "기이히", "여기리라"] },
        { text: "지혜 있는 뜻이 여기 있으니 그 일곱 머리는 여자가 앉은 일곱 산이요", chunks: ["지혜", "있는", "뜻이", "여기", "있으니", "그", "일곱", "머리는", "여자가", "앉은", "일곱", "산이요"] },
        { text: "또 일곱 왕이라 다섯은 망하였고 하나는 있고 다른이는 아직 이르지 아니하였으나 이르면 반드시 잠간 동안 계속하리라", chunks: ["또", "일곱", "왕이라", "다섯은", "망하였고", "하나는", "있고", "다른이는", "아직", "이르지", "아니하였으나", "이르면", "반드시", "잠간", "동안", "계속하리라"] },
        { text: "전에 있었다가 시방 없어진 짐승은 여덟째 왕이니 일곱 중에 속한 자라 저가 멸망으로 들어가리라", chunks: ["전에", "있었다가", "시방", "없어진", "짐승은", "여덟째", "왕이니", "일곱", "중에", "속한", "자라", "저가", "멸망으로", "들어가리라"] },
        { text: "네가 보던 열 뿔은 열 왕이니 아직 나라를 얻지 못하였으나 다만 짐승으로 더불어 임금처럼 권세를 일시 동안 받으리라", chunks: ["네가", "보던", "열", "뿔은", "열", "왕이니", "아직", "나라를", "얻지", "못하였으나", "다만", "짐승으로", "더불어", "임금처럼", "권세를", "일시", "동안", "받으리라"] },
        { text: "저희가 한 뜻을 가지고 자기의 능력과 권세를 짐승에게 주더라", chunks: ["저희가", "한", "뜻을", "가지고", "자기의", "능력과", "권세를", "짐승에게", "주더라"] },
        { text: "저희가 어린 양으로 더불어 싸우려니와 어린 양은 만주의 주시요 만왕의 왕이시므로 저희를 이기실터이요 또 그와 함께 있는 자들 곧 부르심을 입고 빼내심을 얻고 진실한 자들은 이기리로다", chunks: ["저희가", "어린", "양으로", "더불어", "싸우려니와", "어린", "양은", "만주의", "주시요", "만왕의", "왕이시므로", "저희를", "이기실터이요", "또", "그와", "함께", "있는", "자들", "곧", "부르심을", "입고", "빼내심을", "얻고", "진실한", "자들은", "이기리로다"] },
        { text: "또 천사가 내게 말하되 네가 본바 음녀의 앉은 물은 백성과 무리와 열국과 방언들이니라", chunks: ["또", "천사가", "내게", "말하되", "네가", "본바", "음녀의", "앉은", "물은", "백성과", "무리와", "열국과", "방언들이니라"] },
        { text: "네가 본바 이 열 뿔과 짐승이 음녀를 미워하여 망하게 하고 벌거벗게 하고 그 살을 먹고 불로 아주 사르리라", chunks: ["네가", "본바", "이", "열", "뿔과", "짐승이", "음녀를", "미워하여", "망하게", "하고", "벌거벗게", "하고", "그", "살을", "먹고", "불로", "아주", "사르리라"] },
        { text: "하나님이 자기 뜻대로 할 마음을 저희에게 주사 한 뜻을 이루게 하시고 저희 나라를 그 짐승에게 주게 하시되 하나님 말씀이 응하기까지 하심이니라", chunks: ["하나님이", "자기", "뜻대로", "할", "마음을", "저희에게", "주사", "한", "뜻을", "이루게", "하시고", "저희", "나라를", "그", "짐승에게", "주게", "하시되", "하나님", "말씀이", "응하기까지", "하심이니라"] },
        { text: "또 네가 본바 여자는 땅의 임금들을 다스리는 큰 성이라 하더라", chunks: ["또", "네가", "본바", "여자는", "땅의", "임금들을", "다스리는", "큰", "성이라", "하더라"] }
    ],
    18: [
        { text: "이 일 후에 다른 천사가 하늘에서 내려오는 것을 보니 큰 권세를 가졌는데 그의 영광으로 땅이 환하여지더라", chunks: ["이", "일", "후에", "다른", "천사가", "하늘에서", "내려오는", "것을", "보니", "큰", "권세를", "가졌는데", "그의", "영광으로", "땅이", "환하여지더라"] },
        { text: "힘센 음성으로 외쳐 가로되 무너졌도다 무너졌도다 큰 성 바벨론이여 귀신의 처소와 각종 더러운 영의 모이는 곳과 각종 더럽고 가증한 새의 모이는 곳이 되었도다", chunks: ["힘센", "음성으로", "외쳐", "가로되", "무너졌도다", "무너졌도다", "큰", "성", "바벨론이여", "귀신의", "처소와", "각종", "더러운", "영의", "모이는", "곳과", "각종", "더럽고", "가증한", "새의", "모이는", "곳이", "되었도다"] },
        { text: "그 음행의 진노의 포도주를 인하여 만국이 무너졌으며 또 땅의 왕들이 그로 더불어 음행하였으며 땅의 상고들도 그 사치의 세력을 인하여 치부하였도다 하더라", chunks: ["그", "음행의", "진노의", "포도주를", "인하여", "만국이", "무너졌으며", "또", "땅의", "왕들이", "그로", "더불어", "음행하였으며", "땅의", "상고들도", "그", "사치의", "세력을", "인하여", "치부하였도다", "하더라"] },
        { text: "또 내가 들으니 하늘로서 다른 음성이 나서 가로되 내 백성아, 거기서 나와 그의 죄에 참예하지 말고 그의 받을 재앙들을 받지 말라", chunks: ["또", "내가", "들으니", "하늘로서", "다른", "음성이", "나서", "가로되", "내", "백성아,", "거기서", "나와", "그의", "죄에", "참예하지", "말고", "그의", "받을", "재앙들을", "받지", "말라"] },
        { text: "그 죄는 하늘에 사무쳤으며 하나님은 그의 불의한 일을 기억하신지라", chunks: ["그", "죄는", "하늘에", "사무쳤으며", "하나님은", "그의", "불의한", "일을", "기억하신지라"] },
        { text: "그가 준 그대로 그에게 주고 그의 행위대로 갑절을 갚아주고 그의 섞은 잔에도 갑절이나 섞어 그에게 주라", chunks: ["그가", "준", "그대로", "그에게", "주고", "그의", "행위대로", "갑절을", "갚아주고", "그의", "섞은", "잔에도", "갑절이나", "섞어", "그에게", "주라"] },
        { text: "그가 어떻게 자기를 영화롭게 하였으며 사치하였든지 그만큼 고난과 애통으로 갚아 주라 그가 마음에 말하기를 나는 여황으로 앉은 자요 과부가 아니라 결단코 애통을 당하지 아니하리라 하니", chunks: ["그가", "어떻게", "자기를", "영화롭게", "하였으며", "사치하였든지", "그만큼", "고난과", "애통으로", "갚아", "주라", "그가", "마음에", "말하기를", "나는", "여황으로", "앉은", "자요", "과부가", "아니라", "결단코", "애통을", "당하지", "아니하리라", "하니"] },
        { text: "그러므로 하루 동안에 그 재앙들이 이르리니 곧 사망과 애통과 흉년이라 그가 또한 불에 살라지리니 그를 심판하신 주 하나님은 강하신 자이심이니라", chunks: ["그러므로", "하루", "동안에", "그", "재앙들이", "이르리니", "곧", "사망과", "애통과", "흉년이라", "그가", "또한", "불에", "살라지리니", "그를", "심판하신", "주", "하나님은", "강하신", "자이심이니라"] },
        { text: "그와 함께 음행하고 사치하던 땅의 왕들이 그 불붙는 연기를 보고 위하여 울고 가슴을 치며", chunks: ["그와", "함께", "음행하고", "사치하던", "땅의", "왕들이", "그", "불붙는", "연기를", "보고", "위하여", "울고", "가슴을", "치며"] },
        { text: "그 고난을 무서워하여 멀리 서서 가로되 화 있도다 화 있도다 큰 성, 견고한 성 바벨론이여 일시간에 네 심판이 이르렀다 하리로다", chunks: ["그", "고난을", "무서워하여", "멀리", "서서", "가로되", "화", "있도다", "화", "있도다", "큰", "성,", "견고한", "성", "바벨론이여", "일시간에", "네", "심판이", "이르렀다", "하리로다"] },
        { text: "땅의 상고들이 그를 위하여 울고 애통하는 것은 다시 그 상품을 사는 자가 없음이라", chunks: ["땅의", "상고들이", "그를", "위하여", "울고", "애통하는", "것은", "다시", "그", "상품을", "사는", "자가", "없음이라"] },
        { text: "그 상품은 금과 은과 보석과 진주와 세마포와 자주 옷감과 비단과 붉은 옷감이요 각종 향목과 각종 상아 기명이요 값진 나무와 진유와 철과 옥석으로 만든 각종 기명이요", chunks: ["그", "상품은", "금과", "은과", "보석과", "진주와", "세마포와", "자주", "옷감과", "비단과", "붉은", "옷감이요", "각종", "향목과", "각종", "상아", "기명이요", "값진", "나무와", "진유와", "철과", "옥석으로", "만든", "각종", "기명이요"] },
        { text: "계피와 향료와 향과 향유와 유향과 포도주와 감람유와 고운 밀가루와 밀과 소와 양과 말과 수레와 종들과 사람의 영혼들이라", chunks: ["계피와", "향료와", "향과", "향유와", "유향과", "포도주와", "감람유와", "고운", "밀가루와", "밀과", "소와", "양과", "말과", "수레와", "종들과", "사람의", "영혼들이라"] },
        { text: "바벨론아 네 영혼의 탐하던 과실이 네게서 떠났으며 맛 있는 것들과 빛난 것들이 다 없어졌으니 사람들이 결코 이것들을 다시 보지 못하리로다", chunks: ["바벨론아", "네", "영혼의", "탐하던", "과실이", "네게서", "떠났으며", "맛", "있는", "것들과", "빛난", "것들이", "다", "없어졌으니", "사람들이", "결코", "이것들을", "다시", "보지", "못하리로다"] },
        { text: "바벨론을 인하여 치부한 이 상품의 상고들이 그 고난을 무서워하여 멀리 서서 울고 애통하여", chunks: ["바벨론을", "인하여", "치부한", "이", "상품의", "상고들이", "그", "고난을", "무서워하여", "멀리", "서서", "울고", "애통하여"] },
        { text: "가로되 화 있도다 화 있도다 큰 성이여 세마포와 자주와 붉은 옷을 입고 금과 보석과 진주로 꾸민 것인데", chunks: ["가로되", "화", "있도다", "화", "있도다", "큰", "성이여", "세마포와", "자주와", "붉은", "옷을", "입고", "금과", "보석과", "진주로", "꾸민", "것인데"] },
        { text: "그러한 부가 일시간에 망하였도다 각 선장과 각처를 다니는 선객들과 선인들과 바다에서 일하는 자들이 멀리 서서", chunks: ["그러한", "부가", "일시간에", "망하였도다", "각", "선장과", "각처를", "다니는", "선객들과", "선인들과", "바다에서", "일하는", "자들이", "멀리", "서서"] },
        { text: "그 불붙는 연기를 보고 외쳐 가로되 이 큰 성과 같은 성이 어디 있느뇨 하며", chunks: ["그", "불붙는", "연기를", "보고", "외쳐", "가로되", "이", "큰", "성과", "같은", "성이", "어디", "있느뇨", "하며"] },
        { text: "티끌을 자기 머리에 뿌리고 울고 애통하여 외쳐 가로되 화 있도다 화 있도다 이 큰 성이여 바다에서 배 부리는 모든 자들이 너의 보배로운 상품을 인하여 치부하였더니 일시간에 망하였도다", chunks: ["티끌을", "자기", "머리에", "뿌리고", "울고", "애통하여", "외쳐", "가로되", "화", "있도다", "화", "있도다", "이", "큰", "성이여", "바다에서", "배", "부리는", "모든", "자들이", "너의", "보배로운", "상품을", "인하여", "치부하였더니", "일시간에", "망하였도다"] },
        { text: "하늘과 성도들과 사도들과 선지자들아 그를 인하여 즐거워하라 하나님이 너희를 신원하시는 심판을 그에게 하셨음이라 하더라", chunks: ["하늘과", "성도들과", "사도들과", "선지자들아", "그를", "인하여", "즐거워하라", "하나님이", "너희를", "신원하시는", "심판을", "그에게", "하셨음이라", "하더라"] },
        { text: "이에 한 힘센 천사가 큰 맷돌 같은 돌을 들어 바다에 던져 가로되 큰 성 바벨론이 이같이 몹시 떨어져 결코 다시 보이지 아니하리로다", chunks: ["이에", "한", "힘센", "천사가", "큰", "맷돌", "같은", "돌을", "들어", "바다에", "던져", "가로되", "큰", "성", "바벨론이", "이같이", "몹시", "떨어져", "결코", "다시", "보이지", "아니하리로다"] },
        { text: "또 거문고 타는 자와 풍류하는 자와 퉁소 부는 자와 나팔 부는 자들의 소리가 결코 다시 네 가운데서 들리지 아니하고 물론 어떠한 세공업자든지 결코 다시 네 가운데서 보이지 아니하고 또 맷돌 소리가 결코 다시 네 가운데서 들리지 아니하고", chunks: ["또", "거문고", "타는", "자와", "풍류하는", "자와", "퉁소", "부는", "자와", "나팔", "부는", "자들의", "소리가", "결코", "다시", "네", "가운데서", "들리지", "아니하고", "물론", "어떠한", "세공업자든지", "결코", "다시", "네", "가운데서", "보이지", "아니하고", "또", "맷돌", "소리가", "결코", "다시", "네", "가운데서", "들리지", "아니하고"] },
        { text: "등불 빛이 결코 다시 네 가운데서 비취지 아니하고 신랑과 신부의 음성이 결코 다시 네 가운데서 들리지 아니하리로다 너의 상고들은 땅의 왕족들이라 네 복술을 인하여 만국이 미혹되었도다", chunks: ["등불", "빛이", "결코", "다시", "네", "가운데서", "비취지", "아니하고", "신랑과", "신부의", "음성이", "결코", "다시", "네", "가운데서", "들리지", "아니하리로다", "너의", "상고들은", "땅의", "왕족들이라", "네", "복술을", "인하여", "만국이", "미혹되었도다"] },
        { text: "선지자들과 성도들과 및 땅 위에서 죽임을 당한 모든 자의 피가 이 성중에서 보였느니라 하더라", chunks: ["선지자들과", "성도들과", "및", "땅", "위에서", "죽임을", "당한", "모든", "자의", "피가", "이", "성중에서", "보였느니라", "하더라"] }
    ],
    19: [
        { text: "이 일 후에 내가 들으니 하늘에 허다한 무리의 큰 음성 같은 것이 있어 가로되 할렐루야 구원과 영광과 능력이 우리 하나님께 있도다", chunks: ["이", "일", "후에", "내가", "들으니", "하늘에", "허다한", "무리의", "큰", "음성", "같은", "것이", "있어", "가로되", "할렐루야", "구원과", "영광과", "능력이", "우리", "하나님께", "있도다"] },
        { text: "그의 심판은 참되고 의로운지라 음행으로 땅을 더럽게 한 큰 음녀를 심판하사 자기 종들의 피를 그의 손에 갚으셨도다 하고", chunks: ["그의", "심판은", "참되고", "의로운지라", "음행으로", "땅을", "더럽게", "한", "큰", "음녀를", "심판하사", "자기", "종들의", "피를", "그의", "손에", "갚으셨도다", "하고"] },
        { text: "두번째 가로되 할렐루야 하더니 그 연기가 세세토록 올라가더라", chunks: ["두번째", "가로되", "할렐루야", "하더니", "그", "연기가", "세세토록", "올라가더라"] },
        { text: "또 이십 사 장로와 네 생물이 엎드려 보좌에 앉으신 하나님께 경배하여 가로되 아멘 할렐루야 하니", chunks: ["또", "이십", "사", "장로와", "네", "생물이", "엎드려", "보좌에", "앉으신", "하나님께", "경배하여", "가로되", "아멘", "할렐루야", "하니"] },
        { text: "보좌에서 음성이 나서 가로되 하나님의 종들 곧 그를 경외하는 너희들아 무론대소하고 다 우리 하나님께 찬송하라 하더라", chunks: ["보좌에서", "음성이", "나서", "가로되", "하나님의", "종들", "곧", "그를", "경외하는", "너희들아", "무론대소하고", "다", "우리", "하나님께", "찬송하라", "하더라"] },
        { text: "또 내가 들으니 허다한 무리의 음성도 같고 많은 물 소리도 같고 큰 뇌성도 같아서 가로되 할렐루야 주 우리 하나님 곧 전능하신 이가 통치하시도다", chunks: ["또", "내가", "들으니", "허다한", "무리의", "음성도", "같고", "많은", "물", "소리도", "같고", "큰", "뇌성도", "같아서", "가로되", "할렐루야", "주", "우리", "하나님", "곧", "전능하신", "이가", "통치하시도다"] },
        { text: "우리가 즐거워하고 크게 기뻐하여 그에게 영광을 돌리세 어린 양의 혼인 기약이 이르렀고 그 아내가 예비하였으니", chunks: ["우리가", "즐거워하고", "크게", "기뻐하여", "그에게", "영광을", "돌리세", "어린", "양의", "혼인", "기약이", "이르렀고", "그", "아내가", "예비하였으니"] },
        { text: "그에게 허락하사 빛나고 깨끗한 세마포를 입게 하셨은즉 이 세마포는 성도들의 옳은 행실이로다 하더라", chunks: ["그에게", "허락하사", "빛나고", "깨끗한", "세마포를", "입게", "하셨은즉", "이", "세마포는", "성도들의", "옳은", "행실이로다", "하더라"] },
        { text: "천사가 내게 말하기를 기록하라 어린 양의 혼인 잔치에 청함을 입은 자들이 복이 있도다 하고 또 내게 말하되 이것은 하나님의 참되신 말씀이라 하기로", chunks: ["천사가", "내게", "말하기를", "기록하라", "어린", "양의", "혼인", "잔치에", "청함을", "입은", "자들이", "복이", "있도다", "하고", "또", "내게", "말하되", "이것은", "하나님의", "참되신", "말씀이라", "하기로"] },
        { text: "내가 그 발 앞에 엎드려 경배하려 하니 그가 나더러 말하기를 나는 너와 및 예수의 증거를 받은 네 형제들과 같이 된 종이니 삼가 그리하지 말고 오직 하나님께 경배하라 예수의 증거는 대언의 영이라 하더라", chunks: ["내가", "그", "발", "앞에", "엎드려", "경배하려", "하니", "그가", "나더러", "말하기를", "나는", "너와", "및", "예수의", "증거를", "받은", "네", "형제들과", "같이", "된", "종이니", "삼가", "그리하지", "말고", "오직", "하나님께", "경배하라", "예수의", "증거는", "대언의", "영이라", "하더라"] },
        { text: "또 내가 하늘이 열린 것을 보니 보라 백마와 탄 자가 있으니 그 이름은 충신과 진실이라 그가 공의로 심판하며 싸우더라", chunks: ["또", "내가", "하늘이", "열린", "것을", "보니", "보라", "백마와", "탄", "자가", "있으니", "그", "이름은", "충신과", "진실이라", "그가", "공의로", "심판하며", "싸우더라"] },
        { text: "그 눈이 불꽃 같고 그 머리에 많은 면류관이 있고 또 이름 쓴 것이 하나가 있으니 자기 밖에 아는 자가 없고", chunks: ["그", "눈이", "불꽃", "같고", "그", "머리에", "많은", "면류관이", "있고", "또", "이름", "쓴", "것이", "하나가", "있으니", "자기", "밖에", "아는", "자가", "없고"] },
        { text: "또 그가 피 뿌린 옷을 입었는데 그 이름은 하나님의 말씀이라 칭하더라", chunks: ["또", "그가", "피", "뿌린", "옷을", "입었는데", "그", "이름은", "하나님의", "말씀이라", "칭하더라"] },
        { text: "하늘에 있는 군대들이 희고 깨끗한 세마포를 입고 백마를 타고 그를 따르더라", chunks: ["하늘에", "있는", "군대들이", "희고", "깨끗한", "세마포를", "입고", "백마를", "타고", "그를", "따르더라"] },
        { text: "그의 입에서 이한 검이 나오니 그것으로 만국을 치겠고 친히 저희를 철장으로 다스리며 또 친히 하나님 곧 전능하신 이의 맹렬한 진노의 포도주 틀을 밟겠고", chunks: ["그의", "입에서", "이한", "검이", "나오니", "그것으로", "만국을", "치겠고", "친히", "저희를", "철장으로", "다스리며", "또", "친히", "하나님", "곧", "전능하신", "이의", "맹렬한", "진노의", "포도주", "틀을", "밟겠고"] },
        { text: "그 옷과 그 다리에 이름 쓴 것이 있으니 만왕의 왕이요 만주의 주라 하였더라", chunks: ["그", "옷과", "그", "다리에", "이름", "쓴", "것이", "있으니", "만왕의", "왕이요", "만주의", "주라", "하였더라"] },
        { text: "또 내가 보니 한 천사가 해에 서서 공중에 나는 모든 새를 향하여 큰 음성으로 외쳐 가로되 와서 하나님의 큰 잔치에 모여", chunks: ["또", "내가", "보니", "한", "천사가", "해에", "서서", "공중에", "나는", "모든", "새를", "향하여", "큰", "음성으로", "외쳐", "가로되", "와서", "하나님의", "큰", "잔치에", "모여"] },
        { text: "왕들의 고기와 장군들의 고기와 장사들의 고기와 말들과 그 탄 자들의 고기와 자유한 자들이나 종들이나 무론대소하고 모든 자의 고기를 먹으라 하더라", chunks: ["왕들의", "고기와", "장군들의", "고기와", "장사들의", "고기와", "말들과", "그", "탄", "자들의", "고기와", "자유한", "자들이나", "종들이나", "무론대소하고", "모든", "자의", "고기를", "먹으라", "하더라"] },
        { text: "또 내가 보매 그 짐승과 땅의 임금들과 그 군대들이 모여 그 말 탄 자와 그의 군대로 더불어 전쟁을 일으키다가", chunks: ["또", "내가", "보매", "그", "짐승과", "땅의", "임금들과", "그", "군대들이", "모여", "그", "말", "탄", "자와", "그의", "군대로", "더불어", "전쟁을", "일으키다가"] },
        { text: "짐승이 잡히고 그 앞에서 이적을 행하던 거짓 선지자도 함께 잡혔으니 이는 짐승의 표를 받고 그의 우상에게 경배하던 자들을 이적으로 미혹하던 자라 이 둘이 산채로 유황불 붙는 못에 던지우고", chunks: ["짐승이", "잡히고", "그", "앞에서", "이적을", "행하던", "거짓", "선지자도", "함께", "잡혔으니", "이는", "짐승의", "표를", "받고", "그의", "우상에게", "경배하던", "자들을", "이적으로", "미혹하던", "자라", "이", "둘이", "산채로", "유황불", "붙는", "못에", "던지우고"] },
        { text: "그 나머지는 말 탄 자의 입으로 나오는 검에 죽으매 모든 새가 그 고기로 배불리우더라", chunks: ["그", "나머지는", "말", "탄", "자의", "입으로", "나오는", "검에", "죽으매", "모든", "새가", "그", "고기로", "배불리우더라"] }
    ],
    20: [
        { text: "또 내가 보매 천사가 무저갱 열쇠와 큰 쇠사슬을 그 손에 가지고 하늘로서 내려와서", chunks: ["또", "내가", "보매", "천사가", "무저갱", "열쇠와", "큰", "쇠사슬을", "그", "손에", "가지고", "하늘로서", "내려와서"] },
        { text: "용을 잡으니 곧 옛 뱀이요 마귀요 사단이라 잡아 일천년 동안 결박하여", chunks: ["용을", "잡으니", "곧", "옛", "뱀이요", "마귀요", "사단이라", "잡아", "일천년", "동안", "결박하여"] },
        { text: "무저갱에 던져 잠그고 그 위에 인봉하여 천년이 차도록 다시는 만국을 미혹하지 못하게 하였다가 그 후에는 반드시 잠간 놓이리라", chunks: ["무저갱에", "던져", "잠그고", "그", "위에", "인봉하여", "천년이", "차도록", "다시는", "만국을", "미혹하지", "못하게", "하였다가", "그", "후에는", "반드시", "잠간", "놓이리라"] },
        { text: "또 내가 보좌들을 보니 거기 앉은 자들이 있어 심판하는 권세를 받았더라 또 내가 보니 예수의 증거와 하나님의 말씀을 인하여 목 베임을 받은 자의 영혼들과 또 짐승과 그의 우상에게 경배하지도 아니하고 이마와 손에 그의 표를 받지도 아니한 자들이 살아서 그리스도로 더불어 천년 동안 왕노릇 하니", chunks: ["또", "내가", "보좌들을", "보니", "거기", "앉은", "자들이", "있어", "심판하는", "권세를", "받았더라", "또", "내가", "보니", "예수의", "증거와", "하나님의", "말씀을", "인하여", "목", "베임을", "받은", "자의", "영혼들과", "또", "짐승과", "그의", "우상에게", "경배하지도", "아니하고", "이마와", "손에", "그의", "표를", "받지도", "아니한", "자들이", "살아서", "그리스도로", "더불어", "천년", "동안", "왕노릇", "하니"] },
        { text: "그 나머지 죽은 자들은 그 천년이 차기까지 살지 못하더라 이는 첫째 부활이라", chunks: ["그", "나머지", "죽은", "자들은", "그", "천년이", "차기까지", "살지", "못하더라", "이는", "첫째", "부활이라"] },
        { text: "이 첫째 부활에 참예하는 자들은 복이 있고 거룩하도다 둘째 사망이 그들을 다스리는 권세가 없고 도리어 그들이 하나님과 그리스도의 제사장이 되어 천년 동안 그리스도로 더불어 왕노릇 하리라", chunks: ["이", "첫째", "부활에", "참예하는", "자들은", "복이", "있고", "거룩하도다", "둘째", "사망이", "그들을", "다스리는", "권세가", "없고", "도리어", "그들이", "하나님과", "그리스도의", "제사장이", "되어", "천년", "동안", "그리스도로", "더불어", "왕노릇", "하리라"] },
        { text: "천년이 차매 사단이 그 옥에서 놓여", chunks: ["천년이", "차매", "사단이", "그", "옥에서", "놓여"] },
        { text: "나와서 땅의 사방 백성 곧 곡과 마곡을 미혹하고 모아 싸움을 붙이리니 그 수가 바다 모래 같으리라", chunks: ["나와서", "땅의", "사방", "백성", "곧", "곡과", "마곡을", "미혹하고", "모아", "싸움을", "붙이리니", "그", "수가", "바다", "모래", "같으리라"] },
        { text: "저희가 지면에 널리 퍼져 성도들의 진과 사랑하시는 성을 두르매 하늘에서 불이 내려와 저희를 소멸하고", chunks: ["저희가", "지면에", "널리", "퍼져", "성도들의", "진과", "사랑하시는", "성을", "두르매", "하늘에서", "불이", "내려와", "저희를", "소멸하고"] },
        { text: "또 저희를 미혹하는 마귀가 불과 유황 못에 던지우니 거기는 그 짐승과 거짓 선지자도 있어 세세토록 밤낮 괴로움을 받으리라", chunks: ["또", "저희를", "미혹하는", "마귀가", "불과", "유황", "못에", "던지우니", "거기는", "그", "짐승과", "거짓", "선지자도", "있어", "세세토록", "밤낮", "괴로움을", "받으리라"] },
        { text: "또 내가 크고 흰 보좌와 그 위에 앉으신 자를 보니 땅과 하늘이 그 앞에서 피하여 간데 없더라", chunks: ["또", "내가", "크고", "흰", "보좌와", "그", "위에", "앉으신", "자를", "보니", "땅과", "하늘이", "그", "앞에서", "피하여", "간데", "없더라"] },
        { text: "또 내가 보니 죽은 자들이 무론 대소하고 그 보좌 앞에 섰는데 책들이 펴 있고 또 다른 책이 펴졌으니 곧 생명책이라 죽은 자들이 자기 행위를 따라 책들에 기록된대로 심판을 받으니", chunks: ["또", "내가", "보니", "죽은", "자들이", "무론", "대소하고", "그", "보좌", "앞에", "섰는데", "책들이", "펴", "있고", "또", "다른", "책이", "펴졌으니", "곧", "생명책이라", "죽은", "자들이", "자기", "행위를", "따라", "책들에", "기록된대로", "심판을", "받으니"] },
        { text: "바다가 그 가운데서 죽은 자들을 내어주고 또 사망과 음부도 그 가운데서 죽은 자들을 내어주매 각 사람이 자기의 행위대로 심판을 받고", chunks: ["바다가", "그", "가운데서", "죽은", "자들을", "내어주고", "또", "사망과", "음부도", "그", "가운데서", "죽은", "자들을", "내어주매", "각", "사람이", "자기의", "행위대로", "심판을", "받고"] },
        { text: "사망과 음부도 불못에 던지우니 이것은 둘째 사망 곧 불못이라", chunks: ["사망과", "음부도", "불못에", "던지우니", "이것은", "둘째", "사망", "곧", "불못이라"] },
        { text: "누구든지 생명책에 기록되지 못한 자는 불못에 던지우더라", chunks: ["누구든지", "생명책에", "기록되지", "못한", "자는", "불못에", "던지우더라"] }
    ],

    21: [
        { text: "또 내가 새 하늘과 새 땅을 보니 처음 하늘과 처음 땅이 없어졌고 바다도 다시 있지 않더라", chunks: ["또", "내가", "새", "하늘과", "새", "땅을", "보니", "처음", "하늘과", "처음", "땅이", "없어졌고", "바다도", "다시", "있지", "않더라"] },
        { text: "또 내가 보매 거룩한 성 새 예루살렘이 하나님께로부터 하늘에서 내려오니 그 예비한 것이 신부가 남편을 위하여 단장한 것 같더라", chunks: ["또", "내가", "보매", "거룩한", "성", "새", "예루살렘이", "하나님께로부터", "하늘에서", "내려오니", "그", "예비한", "것이", "신부가", "남편을", "위하여", "단장한", "것", "같더라"] },
        { text: "내가 들으니 보좌에서 큰 음성이 나서 가로되 보라 하나님의 장막이 사람들과 함께 있으매 하나님이 저희와 함께 거하시리니 저희는 하나님의 백성이 되고 하나님은 친히 저희와 함께 계셔서", chunks: ["내가", "들으니", "보좌에서", "큰", "음성이", "나서", "가로되", "보라", "하나님의", "장막이", "사람들과", "함께", "있으매", "하나님이", "저희와", "함께", "거하시리니", "저희는", "하나님의", "백성이", "되고", "하나님은", "친히", "저희와", "함께", "계셔서"] },
        { text: "모든 눈물을 그 눈에서 씻기시매 다시 사망이 없고 애통하는 것이나 곡하는 것이나 아픈 것이 다시 있지 아니하리니 처음 것들이 다 지나갔음이러라", chunks: ["모든", "눈물을", "그", "눈에서", "씻기시매", "다시", "사망이", "없고", "애통하는", "것이나", "곡하는", "것이나", "아픈", "것이", "다시", "있지", "아니하리니", "처음", "것들이", "다", "지나갔음이러라"] },
        { text: "보좌에 앉으신 이가 가라사대 보라 내가 만물을 새롭게 하노라 하시고 또 가라사대 이 말은 신실하고 참되니 기록하라 하시고", chunks: ["보좌에", "앉으신", "이가", "가라사대", "보라", "내가", "만물을", "새롭게", "하노라", "하시고", "또", "가라사대", "이", "말은", "신실하고", "참되니", "기록하라", "하시고"] },
        { text: "또 내게 말씀하시되 이루었도다 나는 알파와 오메가요 처음과 나중이라 내가 생명수 샘물로 목 마른 자에게 값 없이 주리니", chunks: ["또", "내게", "말씀하시되", "이루었도다", "나는", "알파와", "오메가요", "처음과", "나중이라", "내가", "생명수", "샘물로", "목", "마른", "자에게", "값", "없이", "주리니"] },
        { text: "이기는 자는 이것들을 유업으로 얻으리라 나는 저의 하나님이 되고 그는 내 아들이 되리라", chunks: ["이기는", "자는", "이것들을", "유업으로", "얻으리라", "나는", "저의", "하나님이", "되고", "그는", "내", "아들이", "되리라"] },
        { text: "그러나 두려워하는 자들과 믿지 아니하는 자들과 흉악한 자들과 살인자들과 행음자들과 술객들과 우상 숭배자들과 모든 거짓말 하는 자들은 불과 유황으로 타는 못에 참예하리니 이것이 둘째 사망이라", chunks: ["그러나", "두려워하는", "자들과", "믿지", "아니하는", "자들과", "흉악한", "자들과", "살인자들과", "행음자들과", "술객들과", "우상", "숭배자들과", "모든", "거짓말", "하는", "자들은", "불과", "유황으로", "타는", "못에", "참예하리니", "이것이", "둘째", "사망이라"] },
        { text: "일곱 대접을 가지고 마지막 일곱 재앙을 담은 일곱 천사중 하나가 나아와서 내게 말하여 가로되 이리 오라 내가 신부 곧 어린 양의 아내를 네게 보이리라 하고", chunks: ["일곱", "대접을", "가지고", "마지막", "일곱", "재앙을", "담은", "일곱", "천사중", "하나가", "나아와서", "내게", "말하여", "가로되", "이리", "오라", "내가", "신부", "곧", "어린", "양의", "아내를", "네게", "보이리라", "하고"] },
        { text: "성령으로 나를 데리고 크고 높은 산으로 올라가 하나님께로부터 하늘에서 내려오는 거룩한 성 예루살렘을 보이니", chunks: ["성령으로", "나를", "데리고", "크고", "높은", "산으로", "올라가", "하나님께로부터", "하늘에서", "내려오는", "거룩한", "성", "예루살렘을", "보이니"] },
        { text: "하나님의 영광이 있으매 그 성의 빛이 지극히 귀한 보석 같고 벽옥과 수정 같이 맑더라", chunks: ["하나님의", "영광이", "있으매", "그", "성의", "빛이", "지극히", "귀한", "보석", "같고", "벽옥과", "수정", "같이", "맑더라"] },
        { text: "크고 높은 성곽이 있고 열 두 문이 있는데 문에 열 두 천사가 있고 그 문들 위에 이름을 썼으니 이스라엘 자손 열 두 지파의 이름들이라", chunks: ["크고", "높은", "성곽이", "있고", "열", "두", "문이", "있는데", "문에", "열", "두", "천사가", "있고", "그", "문들", "위에", "이름을", "썼으니", "이스라엘", "자손", "열", "두", "지파의", "이름들이라"] },
        { text: "동편에 세 문, 북편에 세 문, 남편에 세 문, 서편에 세 문이니", chunks: ["동편에", "세", "문,", "북편에", "세", "문,", "남편에", "세", "문,", "서편에", "세", "문이니"] },
        { text: "그 성에 성곽은 열 두 기초석이 있고 그 위에 어린 양의 십 이 사도의 열 두 이름이 있더라", chunks: ["그", "성에", "성곽은", "열", "두", "기초석이", "있고", "그", "위에", "어린", "양의", "십", "이", "사도의", "열", "두", "이름이", "있더라"] },
        { text: "내게 말하는 자가 그 성과 그 문들과 성곽을 척량하려고 금 갈대를 가졌더라", chunks: ["내게", "말하는", "자가", "그", "성과", "그", "문들과", "성곽을", "척량하려고", "금", "갈대를", "가졌더라"] },
        { text: "그 성은 네모가 반듯하여 장광이 같은지라 그 갈대로 그 성을 척량하니 일만 이천 스다디온이요 장과 광과 고가 같더라", chunks: ["그", "성은", "네모가", "반듯하여", "장광이", "같은지라", "그", "갈대로", "그", "성을", "척량하니", "일만", "이천", "스다디온이요", "장과", "광과", "고가", "같더라"] },
        { text: "그 성곽을 척량하매 일백 사십 사 규빗이니 사람의 척량 곧 천사의 척량이라", chunks: ["그", "성곽을", "척량하매", "일백", "사십", "사", "규빗이니", "사람의", "척량", "곧", "천사의", "척량이라"] },
        { text: "그 성곽은 벽옥으로 쌓였고 그 성은 정금인데 맑은 유리 같더라", chunks: ["그", "성곽은", "벽옥으로", "쌓였고", "그", "성은", "정금인데", "맑은", "유리", "같더라"] },
        { text: "그 성의 성곽의 기초석은 각색 보석으로 꾸몄는데 첫째 기초석은 벽옥이요 둘째는 남보석이요 세째는 옥수요 네째는 녹보석이요", chunks: ["그", "성의", "성곽의", "기초석은", "각색", "보석으로", "꾸몄는데", "첫째", "기초석은", "벽옥이요", "둘째는", "남보석이요", "세째는", "옥수요", "네째는", "녹보석이요"] },
        { text: "다섯째는 홍마노요 여섯째는 홍보석이요 일곱째는 황옥이요 여덟째는 녹옥이요 아홉째는 담황옥이요 열째는 비취옥이요 열 한째는 청옥이요 열 둘째는 자정이라", chunks: ["다섯째는", "홍마노요", "여섯째는", "홍보석이요", "일곱째는", "황옥이요", "여덟째는", "녹옥이요", "아홉째는", "담황옥이요", "열째는", "비취옥이요", "열", "한째는", "청옥이요", "열", "둘째는", "자정이라"] },
        { text: "그 열 두 문은 열 두 진주니 문마다 한 진주요 성의 길은 맑은 유리 같은 정금이더라", chunks: ["그", "열", "두", "문은", "열", "두", "진주니", "문마다", "한", "진주요", "성의", "길은", "맑은", "유리", "같은", "정금이더라"] },
        { text: "성안에 성전을 내가 보지 못하였으니 이는 주 하나님 곧 전능하신 이와 및 어린 양이 그 성전이심이라", chunks: ["성안에", "성전을", "내가", "보지", "못하였으니", "이는", "주", "하나님", "곧", "전능하신", "이와", "및", "어린", "양이", "그", "성전이심이라"] },
        { text: "그 성은 해나 달의 비췸이 쓸데 없으니 이는 하나님의 영광이 비취고 어린 양이 그 등이 되심이라", chunks: ["그", "성은", "해나", "달의", "비췸이", "쓸데", "없으니", "이는", "하나님의", "영광이", "비취고", "어린", "양이", "그", "등이", "되심이라"] },
        { text: "만국이 그 빛 가운데로 다니고 땅의 왕들이 자기 영광을 가지고 그리로 들어오리라", chunks: ["만국이", "그", "빛", "가운데로", "다니고", "땅의", "왕들이", "자기", "영광을", "가지고", "그리로", "들어오리라"] },
        { text: "성문들을 낮에 도무지 닫지 아니하리니 거기는 밤이 없음이라", chunks: ["성문들을", "낮에", "도무지", "닫지", "아니하리니", "거기는", "밤이", "없음이라"] },
        { text: "사람들이 만국의 영광과 존귀를 가지고 그리로 들어오겠고", chunks: ["사람들이", "만국의", "영광과", "존귀를", "가지고", "그리로", "들어오겠고"] },
        { text: "무엇이든지 속된 것이나 가증한 일 또는 거짓말 하는 자는 결코 그리로 들어오지 못하되 오직 어린 양의 생명책에 기록된 자들뿐이라", chunks: ["무엇이든지", "속된", "것이나", "가증한", "일", "또는", "거짓말", "하는", "자는", "결코", "그리로", "들어오지", "못하되", "오직", "어린", "양의", "생명책에", "기록된", "자들뿐이라"] }
    ],
    22: [
        { text: "또 저가 수정 같이 맑은 생명수의 강을 내게 보이니 하나님과 및 어린 양의 보좌로부터 나서", chunks: ["또", "저가", "수정", "같이", "맑은", "생명수의", "강을", "내게", "보이니", "하나님과", "및", "어린", "양의", "보좌로부터", "나서"] },
        { text: "길 가운데로 흐르더라 강 좌우에 생명 나무가 있어 열 두가지 실과를 맺히되 달마다 그 실과를 맺히고 그 나무 잎사귀들은 만국을 소성하기 위하여 있더라", chunks: ["길", "가운데로", "흐르더라", "강", "좌우에", "생명", "나무가", "있어", "열", "두가지", "실과를", "맺히되", "달마다", "그", "실과를", "맺히고", "그", "나무", "잎사귀들은", "만국을", "소성하기", "위하여", "있더라"] },
        { text: "다시 저주가 없으며 하나님과 그 어린 양의 보좌가 그 가운데 있으리니 그의 종들이 그를 섬기며", chunks: ["다시", "저주가", "없으며", "하나님과", "그", "어린", "양의", "보좌가", "그", "가운데", "있으리니", "그의", "종들이", "그를", "섬기며"] },
        { text: "그의 얼굴을 볼터이요 그의 이름도 저희 이마에 있으리라", chunks: ["그의", "얼굴을", "볼터이요", "그의", "이름도", "저희", "이마에", "있으리라"] },
        { text: "다시 밤이 없겠고 등불과 햇빛이 쓸데 없으니 이는 주 하나님이 저희에게 비취심이라 저희가 세세토록 왕노릇하리로다", chunks: ["다시", "밤이", "없겠고", "등불과", "햇빛이", "쓸데", "없으니", "이는", "주", "하나님이", "저희에게", "비취심이라", "저희가", "세세토록", "왕노릇하리로다"] },
        { text: "또 그가 내게 말하기를 이 말은 신실하고 참된지라 주 곧 선지자들의 영의 하나님이 그의 종들에게 결코 속히 될 일을 보이시려고 그의 천사를 보내셨도다", chunks: ["또", "그가", "내게", "말하기를", "이", "말은", "신실하고", "참된지라", "주", "곧", "선지자들의", "영의", "하나님이", "그의", "종들에게", "결코", "속히", "될", "일을", "보이시려고", "그의", "천사를", "보내셨도다"] },
        { text: "보라 내가 속히 오리니 이 책의 예언의 말씀을 지키는 자가 복이 있으리라 하더라", chunks: ["보라", "내가", "속히", "오리니", "이", "책의", "예언의", "말씀을", "지키는", "자가", "복이", "있으리라", "하더라"] },
        { text: "이것들을 보고 들은 자는 나 요한이니 내가 듣고 볼 때에 이 일을 내게 보이던 천사의 발앞에 경배하려고 엎드렸더니", chunks: ["이것들을", "보고", "들은", "자는", "나", "요한이니", "내가", "듣고", "볼", "때에", "이", "일을", "내게", "보이던", "천사의", "발앞에", "경배하려고", "엎드렸더니"] },
        { text: "저가 내게 말하기를 나는 너와 네 형제 선지자들과 또 이 책의 말을 지키는 자들과 함께 된 종이니 그리하지 말고 오직 하나님께 경배하라 하더라", chunks: ["저가", "내게", "말하기를", "나는", "너와", "네", "형제", "선지자들과", "또", "이", "책의", "말을", "지키는", "자들과", "함께", "된", "종이니", "그리하지", "말고", "오직", "하나님께", "경배하라", "하더라"] },
        { text: "또 내게 말하되 이 책의 예언의 말씀을 인봉하지 말라 때가 가까우니라", chunks: ["또", "내게", "말하되", "이", "책의", "예언의", "말씀을", "인봉하지", "말라", "때가", "가까우니라"] },
        { text: "불의를 하는 자는 그대로 불의를 하고 더러운 자는 그대로 더럽고 의로운 자는 그대로 의를 행하고 거룩한 자는 그대로 거룩되게 하라", chunks: ["불의를", "하는", "자는", "그대로", "불의를", "하고", "더러운", "자는", "그대로", "더럽고", "의로운", "자는", "그대로", "의를", "행하고", "거룩한", "자는", "그대로", "거룩되게", "하라"] },
        { text: "보라 내가 속히 오리니 내가 줄 상이 내게 있어 각 사람에게 그의 일한대로 갚아 주리라", chunks: ["보라", "내가", "속히", "오리니", "내가", "줄", "상이", "내게", "있어", "각", "사람에게", "그의", "일한대로", "갚아", "주리라"] },
        { text: "나는 알파와 오메가요 처음과 나중이요 시작과 끝이라", chunks: ["나는", "알파와", "오메가요", "처음과", "나중이요", "시작과", "끝이라"] },
        { text: "그 두루마기를 빠는 자들은 복이 있으니 이는 저희가 생명 나무에 나아가며 문들을 통하여 성에 들어갈 권세를 얻으려 함이로다", chunks: ["그", "두루마기를", "빠는", "자들은", "복이", "있으니", "이는", "저희가", "생명", "나무에", "나아가며", "문들을", "통하여", "성에", "들어갈", "권세를", "얻으려", "함이로다"] },
        { text: "개들과 술객들과 행음자들과 살인자들과 우상 숭배자들과 및 거짓말을 좋아하며 지어내는 자마다 성밖에 있으리라", chunks: ["개들과", "술객들과", "행음자들과", "살인자들과", "우상", "숭배자들과", "및", "거짓말을", "좋아하며", "지어내는", "자마다", "성밖에", "있으리라"] },
        { text: "나 예수는 교회들을 위하여 내 사자를 보내어 이것들을 너희에게 증거하게 하였노라 나는 다윗의 뿌리요 자손이니 곧 광명한 새벽별이라 하시더라", chunks: ["나", "예수는", "교회들을", "위하여", "내", "사자를", "보내어", "이것들을", "너희에게", "증거하게", "하였노라", "나는", "다윗의", "뿌리요", "자손이니", "곧", "광명한", "새벽별이라", "하시더라"] },
        { text: "성령과 신부가 말씀하시기를 오라 하시는도다 듣는 자도 오라 할 것이요 목마른 자도 올 것이요 또 원하는 자는 값 없이 생명수를 받으라 하시더라", chunks: ["성령과", "신부가", "말씀하시기를", "오라", "하시는도다", "듣는", "자도", "오라", "할", "것이요", "목마른", "자도", "올", "것이요", "또", "원하는", "자는", "값", "없이", "생명수를", "받으라", "하시더라"] },
        { text: "내가 이 책의 예언의 말씀을 듣는 각인에게 증거하노니 만일 누구든지 이것들 외에 더하면 하나님이 이 책에 기록된 재앙들을 그에게 더하실 터이요", chunks: ["내가", "이", "책의", "예언의", "말씀을", "듣는", "각인에게", "증거하노니", "만일", "누구든지", "이것들", "외에", "더하면", "하나님이", "이", "책에", "기록된", "재앙들을", "그에게", "더하실", "터이요"] },
        { text: "만일 누구든지 이 책의 예언의 말씀에서 제하여 버리면 하나님이 이 책에 기록된 생명 나무와 및 거룩한 성에 참예함을 제하여 버리시리라", chunks: ["만일", "누구든지", "이", "책의", "예언의", "말씀에서", "제하여", "버리면", "하나님이", "이", "책에", "기록된", "생명", "나무와", "및", "거룩한", "성에", "참예함을", "제하여", "버리시리라"] },
        { text: "이것들을 증거하신 이가 가라사대 내가 진실로 속히 오리라 하시거늘 아멘 주 예수여 오시옵소서", chunks: ["이것들을", "증거하신", "이가", "가라사대", "내가", "진실로", "속히", "오리라", "하시거늘", "아멘", "주", "예수여", "오시옵소서"] },
        { text: "주 예수의 은혜가 모든 자들에게 있을찌어다 아멘", chunks: ["주", "예수의", "은혜가", "모든", "자들에게", "있을찌어다", "아멘"] }
    ]
};


/* [시스템] 닉네임 생성 데이터 (총 50개씩, 2500가지 조합) */

const NICK_ADJECTIVES = [
    // 1~20 (기존 자연/성품)
    "푸른", "붉은", "하얀", "황금", "투명한",
    "온유한", "겸손한", "강한", "지혜로운", "신실한",
    "기뻐하는", "기도하는", "감사하는", "순종하는", "담대한",
    "새벽의", "은혜로운", "거룩한", "따뜻한", "빛나는",

    // 21~35 (요한계시록/순례자 테마)
    "이기는", "충성된", "영원한", "불꽃같은", "찬란한",
    "깨어있는", "인내하는", "영광스러운", "존귀한", "흠없는",
    "의로운", "화평한", "정결한", "슬기로운", "택함받은",

    // 🌟 36~50 (새로 추가된 깊이 있는 테마)
    "진실한", "살아있는", "거듭난", "보배로운", "새로운",
    "변함없는", "감춰진", "눈부신", "기다리는", "거침없는",
    "승리하는", "마르지않는", "부르심받은", "처음익은", "아름다운"
];

const NICK_ADJECTIVES_EN = [
    // 1~20
    "Verdant", "Crimson", "Snowy", "Golden", "Crystal",
    "Gentle", "Humble", "Mighty", "Wise", "Faithful",
    "Joyful", "Praying", "Thankful", "Obedient", "Fearless",
    "Dawning", "Gracious", "Holy", "Warm", "Shining",

    // 21~35
    "Victorious", "Loyal", "Eternal", "Blazing", "Radiant",
    "Watchful", "Patient", "Glorious", "Honored", "Blameless",
    "Righteous", "Peaceful", "Pure", "Prudent", "Chosen",

    // 36~50
    "Truthful", "Living", "Reborn", "Precious", "Renewed",
    "Steadfast", "Hidden", "Dazzling", "Waiting", "Unstoppable",
    "Triumphant", "Unfailing", "Called", "Firstfruit", "Beautiful"
];

const NICK_NOUNS = [
    // 1~20 (기존 자연/도구)
    "만나", "무화과", "포도", "감람유", "밀이삭",
    "양", "비둘기", "사자", "독수리", "나귀",
    "방패", "성벽", "물매돌", "지팡이", "등불",
    "시냇물", "종려나무", "백향목", "면류관", "항아리",

    // 21~35 (요한계시록 상징물)
    "흰돌", "일곱별", "금촛대", "생명나무", "새벽별",
    "거문고", "금향로", "두루마리", "유리바다", "흰옷",
    "생명책", "나팔", "보좌", "무지개", "어린양",

    // 🌟 36~50 (새로 추가된 순례자/성경 테마)
    "순례자", "파수꾼", "용사", "나그네", "증인",
    "새예루살렘", "생명수", "반석", "성소", "장막",
    "포도나무", "감람나무", "향기", "인", "만국"
];

const NICK_NOUNS_EN = [
    // 1~20
    "Manna", "Fig", "Grape", "Olive", "Wheat",
    "Sheep", "Dove", "Lion", "Eagle", "Donkey",
    "Shield", "Rampart", "Slingstone", "Staff", "Lantern",
    "Brook", "Palm", "Cedar", "Crown", "Vessel",

    // 21~35
    "Whitestone", "Starlight", "Lampstand", "Lifetree", "Morningstar",
    "Lyre", "Censer", "Scroll", "Crystalsea", "Whiterobe",
    "Lifebook", "Trumpet", "Throne", "Rainbow", "Lamb",

    // 36~50
    "Pilgrim", "Watchman", "Warrior", "Wanderer", "Witness",
    "NewJerusalem", "Lifespring", "Rock", "Sanctuary", "Tabernacle",
    "Vine", "OliveTree", "Fragrance", "Seal", "Nations"
];

// 🌟 1. 현재 선택된 단어를 기억할 전역 변수 추가
window.selectedAdj = "";
window.selectedNoun = "";

/* [기능] 랜덤 닉네임 추출 및 드롭다운 세팅 */
function generateRandomNickname() {
    const adjArr = currentLang === 'en' ? NICK_ADJECTIVES_EN : NICK_ADJECTIVES;
    const nounArr = currentLang === 'en' ? NICK_NOUNS_EN : NICK_NOUNS;
    window.selectedAdj = adjArr[Math.floor(Math.random() * adjArr.length)];
    window.selectedNoun = nounArr[Math.floor(Math.random() * nounArr.length)];

    // 이 함수가 실행되면 드롭다운의 값도 같이 바꿔줍니다.
    const adjSelect = document.getElementById('adj-select');
    const nounSelect = document.getElementById('noun-select');
    if (adjSelect) adjSelect.value = window.selectedAdj;
    if (nounSelect) nounSelect.value = window.selectedNoun;

    updateNicknamePreview(); // 프리뷰 즉시 갱신
}

/* [기능] 실시간 프리뷰 업데이트 */
function updateNicknamePreview() {
    const adjSelect = document.getElementById('adj-select');
    const nounSelect = document.getElementById('noun-select');

    if (adjSelect && nounSelect) {
        window.selectedAdj = adjSelect.value;
        window.selectedNoun = nounSelect.value;

        // ★ [버그 픽스] 부서/지파 선택 함수가 찾는 변수에도 이름을 쥐여줍니다!
        window.tempNickname = window.selectedAdj + " " + window.selectedNoun;
        window.tempName = window.tempNickname;
    }

    // 화면 상단의 까만색 프리뷰 박스 갱신
    const previewBox = document.getElementById('preview-full');
    if (previewBox) {
        previewBox.innerHTML = `${getTribeIcon(window.tempTribe)}${getDeptTag(window.tempDept)} ${window.tempNickname}`;
    }
}

/* [추가] 최종 체력 계산 함수 (버프 적용용) */
function recalculateMaxHearts() {
    // 1. 도감 점수 확인 (15,000점 이상이면 +3 보너스)
    let bonus = 0;

    // 아직 점수 변수가 안 만들어졌을 수도 있으니 안전하게 확인
    if (typeof grandTotalScore !== 'undefined' && grandTotalScore >= 15000) {
        bonus = 3;
    }

    // 2. 최종 체력 = 구매한 체력 + 보너스
    maxPlayerHearts = purchasedMaxHearts + bonus;

    // 3. UI 갱신 (화면의 하트 숫자 바꾸기)
    if (typeof updateBattleUI !== 'undefined') updateBattleUI();
}

// 1. 리그 및 부스터 데이터 초기화
let leagueData = {
    weekId: getWeekId(),
    monthId: getMonthId(),
    myScore: 0,
    myMonthlyScore: 0,
    totalScore: 0,
    yearlyScore: 0, // 🌟 [추가] 올해의 지파 대항전 기여도
    stageLog: {},
};

// ============================================================
// ★ [v1.1.0] 직렬 복습 시스템 핵심 함수
// ============================================================

// step(1-based)에 해당하는 기본 보석 보상 반환
function getReviewBaseGem(step) {
    if (step <= 0) return 0;
    const idx = step - 1;
    if (idx < REVIEW_SEQUENCE.length) return REVIEW_SEQUENCE[idx].baseGem;
    return 90 + (step - 7) * 10; // step 7+
}

// step이 해금되기까지 이전 step으로부터 기다려야 할 시간(ms) 반환
// step 7+: 167 → 355 → 671 → 1343시간 (약 2배씩 증가)
function getReviewWaitMs(step) {
    if (step <= 1) return 0;
    const idx = step - 1; // step 2 → index 1
    if (idx < REVIEW_SEQUENCE.length) return REVIEW_SEQUENCE[idx].waitMs;
    // step 10 이후 대기 시간 (사용자 원안 기준)
    const longWaits = [167, 355, 671, 1343]; // step 7~10
    const n = step - 7; // step 7 → n=0
    const hours = n < longWaits.length
        ? longWaits[n]
        : Math.round(longWaits[longWaits.length - 1] * Math.pow(2, n - (longWaits.length - 1)));
    return hours * 60 * 60 * 1000;
}

// 현재 복습 상태를 통합 반환 (checkMemoryStatus + peekTimedBonus 역할)
// 반환: { step, nextReviewTime, isEligible, remainMs, baseGem, isFirstClear }
function getReviewStatus(stageId) {
    const step = stageReviewStep[stageId] || 1;
    const nextTime = stageNextReviewTime[stageId] || 0;
    const now = Date.now();
    const isFirstClear = (step === 1 && nextTime === 0);
    const isEligible = (now >= nextTime); // nextTime=0이면 항상 가능
    const remainMs = isEligible ? 0 : nextTime - now;
    const baseGem = isEligible ? getReviewBaseGem(step) : 0;
    return { step, nextReviewTime: nextTime, isEligible, remainMs, baseGem, isFirstClear };
}

// 클리어 시 step을 올리고 다음 타이머를 설정. 획득한 보석 수를 반환.
function advanceReviewStep(stageId) {
    const currentStep = stageReviewStep[stageId] || 1;
    const earnedGem = getReviewBaseGem(currentStep);
    const pending = stagePendingRetry[stageId];

    // ── 재시도 중인 경우 ──────────────────────────────────
    if (pending) {
        if (pending.type === 'good') {
            // good 재시도 완료 → 결과 무관하게 다음 단계
            delete stagePendingRetry[stageId];
            const nextStep = currentStep + 1;
            stageReviewStep[stageId] = nextStep;
            const waitMs = getReviewWaitMs(nextStep);
            stageNextReviewTime[stageId] = waitMs > 0 ? Date.now() + waitMs : 0;
            return { earnedGem, outcome: 'good-retry' };

        } else if (pending.type === 'miss') {
            pending.remaining--;
            if (pending.remaining <= 0) {
                // miss 재도전 2회 완료 → 다음 단계
                delete stagePendingRetry[stageId];
                const nextStep = currentStep + 1;
                stageReviewStep[stageId] = nextStep;
                const waitMs = getReviewWaitMs(nextStep);
                stageNextReviewTime[stageId] = waitMs > 0 ? Date.now() + waitMs : 0;
                return { earnedGem: 10, outcome: 'miss-retry-final' };
            } else {
                // 아직 1회 더 필요
                stageNextReviewTime[stageId] = 0;
                return { earnedGem: 10, outcome: 'miss-retry' };
            }
        }
    }

    // ── 일반 클리어 ──────────────────────────────────────
    const strength = currentStep > 1 ? getMemoryStrength(stageId) : null;
    const outcome = (strength === null || strength >= 0.8) ? 'perfect'
                  : strength >= 0.4 ? 'good'
                  : 'miss';

    if (outcome === 'perfect') {
        const nextStep = currentStep + 1;
        stageReviewStep[stageId] = nextStep;
        const waitMs = getReviewWaitMs(nextStep);
        stageNextReviewTime[stageId] = waitMs > 0 ? Date.now() + waitMs : 0;

    } else if (outcome === 'good') {
        stagePendingRetry[stageId] = { type: 'good' };
        stageNextReviewTime[stageId] = 0;

    } else { // miss
        stagePendingRetry[stageId] = { type: 'miss', remaining: 2 };
        stageNextReviewTime[stageId] = 0;
    }

    return { earnedGem: outcome === 'miss' ? 0 : earnedGem, outcome };
}

// ★ [에빙하우스] 현재 기억 강도 계산 (0~1)
// 공식: R = e^(-t/S), t=경과시간(hr), S=안정성(hr, 스텝별 증가)
function getMemoryStrength(stageId) {
    const lastClear = stageLastClear[stageId] || 0;
    if (lastClear === 0) return null;

    const step = stageReviewStep[stageId] || 1;
    // S값 기준: 대복습 완료 직후 안정성이 약 2배 증가한다는 FSRS 이론 적용
    // step 5, 6: 대복습(23hr, 71hr) 완료 후 S를 2배로 상향 → R=80% 여유 구간 확보
    const STABILITY_HOURS = [
        0.747,  // step 1: 10분 후 복습
        4.48,   // step 2: 1시간 후
        26.9,   // step 3: 6시간 후
        103.1,  // step 4: 23시간 후
        206.0,  // step 5: 대복습(23hr) 완료 → S ×2 (R=80%: 46시간 후)
        637.0,  // step 6: 대복습(71hr) 완료 → S ×2 (R=80%: 142시간 후)
    ];

    let S;
    const idx = step - 1;
    if (idx < STABILITY_HOURS.length) {
        S = STABILITY_HOURS[idx];
    } else {
        // step 7+: 다음 복습 대기시간으로 동적 산출
        const waitMs = getReviewWaitMs(step + 1);
        S = (waitMs / 3600000) / 0.2231;
    }

    const elapsedHr = (Date.now() - lastClear) / 3600000;
    return Math.max(0, Math.min(1, Math.exp(-elapsedHr / S)));
}

// Miss 시 복귀할 구간 시작 스텝 반환
function getPhaseStartStep(step) {
    if (step <= 4) return 1;   // step 2~4 Miss → 재학습
    if (step <= 5) return 4;   // step 5 Miss → 23시간 구간 재시작
    if (step <= 6) return 5;   // step 6 Miss → 71시간 구간 재시작
    return 6;                  // step 7+ Miss → 167시간 구간 재시작
}

// 중간점검 스테이지에 속한 서브스테이지 목록 반환 (앞쪽 normal 스테이지들)
function getSubStagesOfMidBoss(chData, midBossStage) {
    const idx = chData.stages.findIndex(s => s.id === midBossStage.id);
    const subs = [];
    for (let i = idx - 1; i >= 0; i--) {
        const s = chData.stages[i];
        if (s.type === 'boss' || s.type === 'mid-boss') break;
        subs.push(s);
    }
    return subs;
}

// 중간점검 소속 서브스테이지들의 평균 기억 강도(0~1) 반환
function getMidBossAvgStrength(chData, midBossStage) {
    const subs = getSubStagesOfMidBoss(chData, midBossStage);
    const cleared = subs.filter(s => stageLastClear[s.id]);
    if (cleared.length === 0) return null;
    const sum = cleared.reduce((acc, s) => acc + (getMemoryStrength(s.id) || 0), 0);
    return sum / cleared.length;
}

// step → 통계/배지 표시용 레벨(0~5) 변환 (getTotalMemoryLevel, mem-badge 호환용)
function getMemoryLevelFromStep(step) {
    if (step <= 1) return 0;
    if (step <= 4) return 1;  // 1단계 진행 중
    if (step <= 5) return 2;  // 2단계
    if (step <= 6) return 3;  // 3단계
    if (step <= 9) return 4;
    return 5;
}

// 구버전(v1.0.0) 데이터를 신규 step 시스템으로 마이그레이션
function migrateToSerialReview(parsed) {
    const oldLevels = parsed.memoryLevels || {};
    const oldBonus  = parsed.timedBonus || {};
    const oldNextTime = parsed.nextEligibleTime || {};
    const newStep = {};
    const newNextTime = {};

    Object.keys(oldLevels).forEach(id => {
        const level = oldLevels[id] || 0;
        const bonus = oldBonus[id] || { remaining: 3, lastClear: 0 };

        let mappedStep;
        if (level === 0) {
            if (bonus.lastClear === 0) {
                mappedStep = 1; // 미클리어
            } else if (bonus.remaining === 3) {
                mappedStep = 1; // 클리어 직후, 10분 대기
            } else if (bonus.remaining === 2) {
                mappedStep = 2; // 10분 완료, 1시간 대기
            } else if (bonus.remaining === 1) {
                mappedStep = 3; // 1시간 완료, 6시간 대기
            } else {
                mappedStep = 4; // 6시간 완료, 23시간 대기
            }
        } else if (level === 1) {
            mappedStep = 5;
        } else if (level === 2) {
            mappedStep = 8;
        } else if (level === 3) {
            mappedStep = 10;
        } else {
            mappedStep = 10 + (level - 3) * 2;
        }

        newStep[id] = mappedStep;

        // 기존 nextEligibleTime이 아직 유효하면 그대로 사용
        if (oldNextTime[id] && oldNextTime[id] > Date.now()) {
            newNextTime[id] = oldNextTime[id];
        } else {
            newNextTime[id] = 0; // 만료됐으면 즉시 가능
        }
    });

    stageReviewStep = newStep;
    stageNextReviewTime = newNextTime;
    console.log(`✅ 마이그레이션 완료: ${Object.keys(newStep).length}개 스테이지 변환됨`);
}

// 스테이지 버튼에 표시할 복습 단계 배지 HTML 생성
function buildReviewBadgeHtml(stageId) {
    const status = getReviewStatus(stageId);
    const step = status.step;

    // 단계 그룹 및 표시할 step strip 정의
    let stepDefs;
    if (step <= 4) {
        stepDefs = [
            { label: t('review_dot_start'), step: 1 },
            { label: t('review_dot_10m'), step: 2 },
            { label: t('review_dot_1h'), step: 3 },
            { label: t('review_dot_6h'), step: 4 },
        ];
    } else if (step <= 5) {
        stepDefs = [
            { label: t('review_dot_1d'), step: 5 },
        ];
    } else if (step <= 6) {
        stepDefs = [
            { label: t('review_dot_3d'), step: 6 },
        ];
    } else {
        // step 7+: 대기 시간 표시
        const waitMs = getReviewWaitMs(step);
        const waitHr = Math.round(waitMs / 3600000);
        const waitLabel = waitHr >= 24 ? t('review_dot_days', { n: Math.round(waitHr / 24) }) : t('review_dot_hours', { n: waitHr });
        stepDefs = [{ label: waitLabel, step }];
    }

    const dotsHtml = stepDefs.map((s, i) => {
        const isDone = s.step < step;
        const isCurrent = s.step === step;
        const cls = isDone ? 'review-dot done' : isCurrent ? 'review-dot current' : 'review-dot future';
        const sep = i > 0 ? '<span class="review-dot-sep">→</span>' : '';
        return `${sep}<span class="${cls}">${s.label}</span>`;
    }).join('');

    // 타이머 or 보상 표시
    let statusHtml;
    const pending = stagePendingRetry[stageId];
    if (pending) {
        if (pending.type === 'good') {
            statusHtml = `<span class="review-ready">${t('review_status_retry')}</span>`;
        } else if (pending.type === 'miss') {
            statusHtml = `<span class="review-ready">${t('review_status_retry_remain', { n: pending.remaining })}</span>`;
        }
    } else if (!status.isEligible) {
        statusHtml = `<span class="review-timer live-timer-review" data-unlock="${status.nextReviewTime}">${t('review_status_calculating')}</span>`;
    } else if (step === 1) {
        statusHtml = `<span class="review-ready">${t('review_status_first', { gem: status.baseGem })}</span>`;
    } else {
        statusHtml = `<span class="review-ready">${status.baseGem}💎 ${t('status_review_now')}</span>`;
    }

    return `<div class="review-badge-strip"><div class="review-dots">${dotsHtml}</div><div class="review-status">${statusHtml}</div></div>`;
}

// ============================================================
// [Forgetting-Curve 냉각 시간 계산] (구버전 호환용, 직접 호출 금지)
// ============================================================
function getNextEligibleTime(memoryLevel) {
    // 메모리 레벨에 따른 냉각 시간 (시간 단위)
    const cooldownHours = {
        0: 23,   // Level 0: 1일 (23시간)
        1: 71,   // Level 1: 3일 (71시간)
        2: 167,  // Level 2: 7일 (167시간)
        3: 335,  // Level 3: 14일 (335시간)
        4: 719,  // Level 4+: 30일 (719시간)
        5: 719
    };

    const hours = cooldownHours[memoryLevel] || 719;
    return Date.now() + (hours * 60 * 60 * 1000);
}

// ============================================================
// [때를 따른 양식 보너스 시스템]
// ============================================================
function getTimedBonus(stageId) {
    // 보너스 데이터 초기화
    if (!stageTimedBonus[stageId]) {
        stageTimedBonus[stageId] = { remaining: 3, lastClear: 0 };
    }

    const bonus = stageTimedBonus[stageId];

    // 각인 주기 체크
    const memStatus = checkMemoryStatus(stageId);

    // 각인 주기 도래 시 자동 리셋 (숙련도에 따라 시작 배율 차등)
    // level 0→1 (1회차): 1.5x에서 시작 (remaining=3)
    // level 1→2 (2회차): 2x에서 시작 (remaining=2)
    // level 2+ (3회차+): 5x에서 시작 (remaining=1)
    if (memStatus.isForgotten) {
        const startRemaining = memStatus.level === 0 ? 3 : memStatus.level === 1 ? 2 : 1;
        if (bonus.remaining < startRemaining) {
            bonus.remaining = startRemaining;
        }
    }

    return bonus;
}

// 소진 없이 현재 받을 수 있는 보너스 레벨 미리 확인 (UI 표시용)
// 반환값: 4=최초(×1), 3=×1.5가능, 2=×2가능, 1=×5가능, 0=대기중/쿨타임
function peekTimedBonus(stageId) {
    const bonus = getTimedBonus(stageId);
    if (bonus.lastClear === 0) return 4;
    if (bonus.remaining === 0) return 0;
    const THRESHOLDS = { 3: 600000, 2: 3600000, 1: 21600000 };
    const elapsed = Date.now() - bonus.lastClear;
    return elapsed >= THRESHOLDS[bonus.remaining] ? bonus.remaining : 0;
}

function consumeTimedBonus(stageId) {
    const bonus = getTimedBonus(stageId);
    const now = Date.now();

    // 최초 클리어 (lastClear=0)
    if (bonus.lastClear === 0) {
        bonus.lastClear = now;
        return 4; // ×1, 10분 후 알림 예약
    }

    // 쿨타임 (모든 보너스 소진)
    if (bonus.remaining === 0) return 0;

    const THRESHOLDS = {
        3: 10 * 60 * 1000,       // remaining=3: 10분 대기 후 ×1.5
        2: 60 * 60 * 1000,       // remaining=2: 1시간 대기 후 ×2
        1: 6 * 60 * 60 * 1000,   // remaining=1: 6시간 대기 후 ×5
    };

    const elapsed = now - bonus.lastClear;
    const threshold = THRESHOLDS[bonus.remaining];

    if (elapsed >= threshold) {
        // 타이밍 OK → 보너스 지급, 단계 소진
        const level = bonus.remaining;
        bonus.remaining--;
        bonus.lastClear = now;
        return level; // 3→×1.5, 2→×2, 1→×5
    } else {
        // 너무 일찍 → ×1, 단계 유지 (lastClear 갱신 안 함)
        return 0;
    }
}

/* [시스템: 미션 및 부스터 데이터] */
let boosterData = {
    active: false,
    endTime: 0,
    multiplier: 1,
    nextLoginReward: null // { multi: 3, min: 15 } 형태 (내일 보상 저장용)
};

/* ✨ [캐시] 랭킹 데이터 클라이언트 캐싱 (1시간 유지) */
let rankingCache = {
    tribes: {}, // { tribeId: { data, timestamp }, ... }
    zion: { data: null, timestamp: 0 },
    weeklyHall: { data: null, timestamp: 0 },
    monthlyHall: { data: null, timestamp: 0 }
};

const RANKING_CACHE_DURATION = 60 * 60 * 1000; // 1시간(ms)

/* [데이터: 챕터 및 스테이지 정보 (자동 생성 시스템 - 버그 수정판)] */
const gameData = [];

function getStageTitle(stage) {
    if (stage.type === 'mid-boss') {
        const parts = stage.id.split('-');
        const ch = parts[0];
        return t('stage_title_midboss', { ch, start: stage.rangeStart, end: stage.rangeEnd });
    }
    if (stage.type === 'boss') {
        const ch = stage.id.replace('-boss', '');
        return t('stage_title_boss', { ch });
    }
    // normal
    const [ch, v] = stage.id.split('-');
    return t('stage_title_normal', { ch, v });
}

function getStageDesc(stage) {
    if (stage.type === 'mid-boss') {
        return t('stage_desc_midboss', { hp: stage.targetVerseCount });
    }
    if (stage.type === 'boss') {
        const ch = stage.id.replace('-boss', '');
        return t('stage_desc_boss', { ch });
    }
    // normal: show first ~15 chars of verse text in current language
    const [ch, v] = stage.id.split('-');
    const verseObj = getVerseData(Number(ch), Number(v) - 1);
    if (verseObj) return verseObj.text.substring(0, 20) + '...';
    return stage.desc;
}

// 언어에 따라 올바른 성경 데이터 반환 (bibleDataEn은 bible_en.js에서 로드)
function getVerseData(ch, vIdx) {
    if (currentLang === 'en' && typeof bibleDataEn !== 'undefined' && bibleDataEn[ch] && bibleDataEn[ch][vIdx]) {
        return bibleDataEn[ch][vIdx];
    }
    return bibleData[ch] ? bibleData[ch][vIdx] : undefined;
}

// ★ 디버그: bibleData 길이 확인
console.log('=== bibleData 장별 길이 확인 ===');
for (let j = 1; j <= 22; j++) {
    if (bibleData[j]) {
        console.log(`장 ${j}: ${bibleData[j].length}절`);
    }
}

// 1장부터 22장까지 반복
for (let i = 1; i <= 22; i++) {
    const chapterVerses = bibleData[i];

    if (chapterVerses) {
        const totalVerses = chapterVerses.length;

        // -------------------------------------------------------
        // [1] 중간 점검 구간(Range) 미리 계산하기 (3~7개 규칙 적용)
        // -------------------------------------------------------
        let midBossRanges = [];
        let start = 1;

        while (start <= totalVerses) {
            let end = start + 4; // 기본 5개씩 (예: 1~5)

            // 남은 구절 개수 확인 (전체 길이 - 현재 끝번호)
            let remaining = totalVerses - end;

            // [규칙 1] 남은 게 3개 미만이면(1, 2개), 현재 구간에 흡수시킨다. (예: 10장 6~10 + 11 -> 6~11)
            if (remaining > 0 && remaining < 3) {
                end = totalVerses;
            }

            // [규칙 2] 계산된 끝번호가 전체보다 크면 전체로 맞춤
            if (end > totalVerses) {
                end = totalVerses;
            }

            // [생성 조건 수정]
            // 1. 구간의 길이가 최소 3개 이상이어야 함.
            // 2. '1절부터 끝절까지' 한 번에 다루는 구간은 제외 (그건 최종 보스니까)
            const isRangeValid = (end - start + 1) >= 3;
            const isWholeChapter = (start === 1 && end === totalVerses);

            if (isRangeValid && !isWholeChapter) {
                midBossRanges.push({ start: start, end: end });
            }

            start = end + 1; // 다음 구간 시작점
        }

        // -------------------------------------------------------
        // [2] 스테이지 객체 생성
        // -------------------------------------------------------
        const chapterObj = {
            id: i,
            title: t('label_chapter_header', { num: i }),
            subtitle: i === 1 ? "계시의 시작" : "진행 중",
            locked: false,
            stages: []
        };

        // 절(Verse)별 스테이지 생성 루프
        chapterVerses.forEach((verse, idx) => {
            const verseNum = idx + 1;

            // 1. 일반 훈련 스테이지 추가
            chapterObj.stages.push({
                id: `${i}-${verseNum}`,
                title: `${i}장 ${verseNum}절`,
                desc: verse.text.substring(0, 15) + "...",
                type: "normal",
                locked: false,
                cleared: false
            });

            // 2. 중간 점검 삽입 타이밍 확인
            // 현재 절(verseNum)이 아까 계산해둔 구간의 '끝(end)'과 일치하는지 확인
            const range = midBossRanges.find(r => r.end === verseNum);

            if (range) {
                // 동적 HP 계산 (끝 - 시작 + 1)
                const hp = range.end - range.start + 1;

                chapterObj.stages.push({
                    id: `${i}-mid-${range.end}`, // ID는 끝 번호 기준
                    title: `🛡️ 중간 점검 (${i}장 ${range.start}~${range.end}절)`,
                    desc: `${hp}개 절을 한 번에 복습 또는 학습합니다.`,
                    type: "mid-boss",
                    targetVerseCount: hp, // ★ 실제 개수만큼 HP 설정!
                    rangeStart: range.start,
                    rangeEnd: range.end,
                    locked: false,
                    cleared: false
                });
            }
        });

        // 3. 최종 보스 추가
        chapterObj.stages.push({
            id: `${i}-boss`,
            title: `🐲 BOSS: ${i}장 완전 정복`,
            desc: `붉은 용을 물리치고 ${i}장을 완성하라!`,
            type: "boss",
            targetVerseCount: totalVerses, // 전체 개수만큼 HP
            locked: false,
            cleared: false
        });

        gameData.push(chapterObj);
    }
    else {
        // 데이터 없는 챕터
        gameData.push({ id: i, title: t('label_chapter_header', { num: i }), subtitle: t('status_preparing'), locked: true, stages: [] });
    }
}

/* [시스템: 성전 데이터 (12단계 최종판)] */
let myCastleLevel = 0;
let viewingCastleLevel = -1;
let lastClaimTime = Date.now(); // 방치형 보상 시간 기록

/* [1단계] 성전 데이터 수정 (생산량 1/4 축소 + reqStage 제거) */
const castleBlueprints = [
    // [Lv.1]
    { level: 1, name: "제사장의 시작", nameEn: "Priest's Beginning", desc: "작은 촛불 하나, 고요한 방.<br>이 공간은 무엇으로 채워지게 될까요?", descEn: "A single candle, a quiet room.<br>What will fill this space?", img: "image_0.webp", cost: 0, prod: 0, cap: 0, bonus: 0 },
    // [Lv.2~4]
    { level: 2, name: "쌓이는 노력", nameEn: "Growing Effort", desc: "바닥에 쌓인 책들만큼<br>당신의 마음에도 말씀이 쌓여갑니다.", descEn: "As books pile up on the floor,<br>so the Word builds in your heart.", img: "image_1.webp", cost: 1000, prod: 5, cap: 40, bonus: 2 },
    { level: 3, name: "첫 번째 책장", nameEn: "First Bookshelf", desc: "어수선하던 생각들이<br>제자리를 찾기 시작합니다.", descEn: "Scattered thoughts begin<br>to find their place.", img: "image_2.webp", cost: 2000, prod: 10, cap: 80, bonus: 4 },
    { level: 4, name: "서재의 모습", nameEn: "A Scholar's Study", desc: "책상 위 가득한 열정과<br>깊어진 지식.", descEn: "Passion fills the desk,<br>and knowledge deepens.", img: "image_3.webp", cost: 3000, prod: 15, cap: 120, bonus: 6 },
    // [Lv.5~8]
    { level: 5, name: "빛의 변화", nameEn: "Changing Light", desc: "벽면에 일곱 금 촛대가<br>불을 밝혔습니다.", descEn: "Seven golden lampstands<br>illuminate the wall.", img: "image_4.webp", cost: 5000, prod: 25, cap: 200, bonus: 8 },
    { level: 6, name: "정결한 옷", nameEn: "Purified Garment", desc: "순백의 두루마기가<br>준비되었습니다.", descEn: "A robe of pure white<br>has been prepared.", img: "image_5.webp", cost: 7000, prod: 35, cap: 280, bonus: 10 },
    { level: 7, name: "생명의 샘", nameEn: "Spring of Life", desc: "메마른 바닥에서<br>맑은 생명수가 터져 나옵니다.", descEn: "From the dry ground,<br>clear living water bursts forth.", img: "image_6.webp", cost: 10000, prod: 45, cap: 360, bonus: 12 },
    { level: 8, name: "자라나는 생명", nameEn: "Growing Life", desc: "물가에 심기운 나무처럼,<br>당신의 믿음에 푸른 싹이 돋아납니다.", descEn: "Like a tree planted by the water,<br>green shoots spring from your faith.", img: "image_7.webp", cost: 13000, prod: 60, cap: 480, bonus: 15 },
    // [Lv.9~12]
    { level: 9, name: "하늘의 보화", nameEn: "Heavenly Treasure", desc: "책장 한편에 반짝이는 보석과<br>면류관이 보이나요?", descEn: "Do you see the jewels and crown<br>gleaming on the shelf?", img: "image_8.webp", cost: 17000, prod: 80, cap: 640, bonus: 18 },
    { level: 10, name: "새 노래", nameEn: "A New Song", desc: "정적을 깨고<br>아름다운 선율이 흐릅니다.", descEn: "Breaking the silence,<br>a beautiful melody flows.", img: "image_9.webp", cost: 21000, prod: 100, cap: 800, bonus: 20 },
    { level: 11, name: "풍성한 결실", nameEn: "Abundant Fruit", desc: "어느새 천장까지 닿은 나무에<br>생명 과실이 가득합니다.", descEn: "A tree reaching the ceiling,<br>laden with the fruit of life.", img: "image_10.webp", cost: 28000, prod: 125, cap: 1000, bonus: 25 },
    { level: 12, name: "열린 문과 영광", nameEn: "Open Door & Glory", desc: "굳게 닫혀있던 문이 열리고<br>영광의 빛이 쏟아집니다!", descEn: "The tightly shut door opens,<br>and the light of glory pours in!", img: "image_11.webp", cost: 37000, prod: 150, cap: 1500, bonus: 30 }
];

// [시스템: 성과 측정 변수]
let stageStartTime = 0; // 시작 시간
let bossStartTime = 0;  // 보스전 시작 시간
let wrongCount = 0;     // 틀린 횟수
let battleHintCount = 0; // 보스전/훈련 중 힌트 사용 횟수
let bossHintCount = 0;   // 보스전 전용 힌트 사용 횟수

/* [시스템: 화면 이동] */
/* [수정] 게임 시작 함수 (사운드 설정 불러오기 적용) */
// ============================================================
// ★ [왕의 길 모드] 핵심 로직
// ============================================================

// 전역 변수 스왑으로 모드 전환 (기존 함수들이 변경 없이 올바른 데이터를 참조하게 됨)
function switchMode(mode) {
    if (mode === activeMode) return;

    if (mode === 'kings') {
        // 현재 자유여행 데이터를 백업
        _freeStageMastery = stageMastery;
        _freeStageClearDate = stageClearDate;
        _freeStageLastClear = stageLastClear;
        _freeStageReviewStep = stageReviewStep;
        _freeStageNextReviewTime = stageNextReviewTime;
        // 왕의 길 데이터로 스왑
        stageMastery = kingsRoadData.mastery;
        stageClearDate = kingsRoadData.clearDate;
        stageLastClear = kingsRoadData.lastClear;
        stageReviewStep = kingsRoadData.reviewStep;
        stageNextReviewTime = kingsRoadData.nextReviewTime;
    } else {
        // 자유여행 데이터로 복원
        stageMastery = _freeStageMastery;
        stageClearDate = _freeStageClearDate;
        stageLastClear = _freeStageLastClear;
        stageReviewStep = _freeStageReviewStep;
        stageNextReviewTime = _freeStageNextReviewTime;
        // 왕의 길 데이터 백업
        kingsRoadData.mastery = kingsRoadData.mastery; // 이미 같은 참조
    }

    activeMode = mode;
    // 맵의 스테이지 클리어 상태 반영
    gameData.forEach(chapter => {
        chapter.stages.forEach(stage => {
            stage.cleared = (stageMastery[stage.id] || 0) > 0;
            stage.locked = false;
        });
    });
    saveGameData();
}

// 왕의 길 단계 설정 (최초 선택 or 변경)
function setKingsRoadStep(newStep) {
    if (kingsRoadData.stepHistory.length === 0) {
        // 최초 설정: { isInitial: true } 플래그로 첫날 +1 적용 여부 구분
        kingsRoadData.stepHistory = [{ step: newStep, timestamp: Date.now(), baseCount: 0, isInitial: true }];
    } else {
        // 단계 변경: 현재 해금 수를 고정하고 내일부터 새 단계 적용
        // 배열은 마지막 항목 1개만 유지 (연타 방지 + 메모리 절약)
        const currentUnlocked = getKingsRoadUnlockedCount();
        // 기존 타임스탬프의 현재 날짜 시작 시점을 유지해 남은 대기 시간 보존
        const oldLast = kingsRoadData.stepHistory[kingsRoadData.stepHistory.length - 1];
        const daysElapsed = Math.floor((Date.now() - oldLast.timestamp) / 86400000);
        const preservedTimestamp = oldLast.timestamp + daysElapsed * 86400000;
        kingsRoadData.stepHistory = [{ step: newStep, timestamp: preservedTimestamp, baseCount: currentUnlocked, isInitial: false }];
    }
    updateKingsStepBtn();
    saveGameData();
}

// 왕의 길 단계 순환 (메뉴 버튼) — 1초 쿨다운으로 연타 방지
let _kingsStepChangeCooldown = false;
function cycleKingsStep() {
    if (kingsRoadData.stepHistory.length === 0) return;
    if (_kingsStepChangeCooldown) return; // 연타 차단
    _kingsStepChangeCooldown = true;
    setTimeout(() => { _kingsStepChangeCooldown = false; }, 1000);

    const currentStep = kingsRoadData.stepHistory[kingsRoadData.stepHistory.length - 1].step;
    const nextStep = currentStep >= 3 ? 1 : currentStep + 1;
    setKingsRoadStep(nextStep);
    alert(t('alert_kings_step_changed', { step: nextStep }));
}

// 메뉴의 왕의 길 단계 버튼 텍스트 갱신
function updateKingsStepBtn() {
    const btn = document.getElementById('kings-step-btn');
    if (!btn) return;
    if (kingsRoadData.stepHistory.length === 0) {
        btn.style.display = 'none';
    } else {
        const step = kingsRoadData.stepHistory[kingsRoadData.stepHistory.length - 1].step;
        btn.style.display = 'flex';
        btn.textContent = t('label_kings_step_btn', { step });
    }
}

// 현재 해금된 일반 스테이지 수 반환
function getKingsRoadUnlockedCount() {
    const history = kingsRoadData.stepHistory;
    if (!history || history.length === 0) return 0;
    const last = history[history.length - 1];
    const daysElapsed = Math.floor((Date.now() - last.timestamp) / 86400000);
    // 최초 설정: day 0에 1×step 즉시 해금 → (daysElapsed + 1) * step
    // 단계 변경:  변경 당일은 보너스 없고 내일부터 → daysElapsed * step
    const bonus = last.isInitial
        ? (daysElapsed + 1) * last.step
        : daysElapsed * last.step;
    return Math.min(last.baseCount + bonus, getTotalNormalStageCount());
}

// 전체 일반 스테이지 수 반환 (캐시)
let _totalNormalStageCount = 0;
function getTotalNormalStageCount() {
    if (_totalNormalStageCount > 0) return _totalNormalStageCount;
    let count = 0;
    gameData.forEach(ch => ch.stages.forEach(s => { if (s.type === 'normal') count++; }));
    _totalNormalStageCount = count;
    return count;
}

// 왕의 길에서 해금된 stage id Set 반환 (normal + 관련 mid-boss/boss 포함)
function getKingsRoadUnlockedSet() {
    const unlockedCount = getKingsRoadUnlockedCount();
    const result = new Set();
    let normalIdx = 0;

    // 각 챕터별 해금 상태를 추적
    const chapterNormalUnlocked = {}; // chapterId → {total: N, unlocked: N}

    gameData.forEach(chapter => {
        const chId = chapter.id;
        const normals = chapter.stages.filter(s => s.type === 'normal');
        chapterNormalUnlocked[chId] = { total: normals.length, unlocked: 0 };

        chapter.stages.forEach(stage => {
            if (stage.type === 'normal') {
                if (normalIdx < unlockedCount) {
                    result.add(stage.id);
                    chapterNormalUnlocked[chId].unlocked++;
                }
                normalIdx++;
            }
        });
    });

    // mid-boss: 구성 절이 모두 해금이면 해금
    gameData.forEach(chapter => {
        chapter.stages.forEach(stage => {
            if (stage.type === 'mid-boss') {
                // id 형식: "X-mid-Y" (1~Y절이 구성 절)
                const match = stage.id.match(/^(\d+)-mid-(\d+)$/);
                if (match) {
                    const chId = parseInt(match[1]);
                    const endVerse = parseInt(match[2]);
                    // 해당 챕터에서 절 번호 1~endVerse 인 일반 스테이지가 모두 해금인지 확인
                    const chData = gameData.find(c => c.id === chId);
                    if (chData) {
                        const componentNormals = chData.stages.filter(s => {
                            if (s.type !== 'normal') return false;
                            const vMatch = s.id.match(/^\d+-(\d+)$/);
                            if (!vMatch) return false;
                            const vNum = parseInt(vMatch[1]);
                            // 이 mid-boss가 어떤 절 범위를 커버하는지 계산
                            // mid-boss 이전의 마지막 mid-boss 끝 절 + 1 부터 endVerse 까지
                            return vNum <= endVerse;
                        });
                        // 이 mid-boss에 속하는 구간만 추출 (이전 mid-boss 이후부터)
                        // 더 간단하게: endVerse까지의 모든 일반 스테이지가 해금이면 해금
                        const allUnlocked = componentNormals.every(s => result.has(s.id));
                        if (allUnlocked && componentNormals.length > 0) result.add(stage.id);
                    }
                }
            } else if (stage.type === 'boss') {
                // boss: 해당 챕터 모든 일반 스테이지가 해금이면 해금
                const chId = chapter.id;
                const info = chapterNormalUnlocked[chId];
                if (info && info.unlocked >= info.total && info.total > 0) {
                    result.add(stage.id);
                }
            }
        });
    });

    return result;
}

// 왕의 길 모드에서 스테이지가 잠금인지 여부
function isKingsRoadLocked(stageId) {
    if (activeMode !== 'kings') return false;
    const unlocked = getKingsRoadUnlockedSet();
    return !unlocked.has(stageId);
}

// === 왕의 길 해금 정보 UI ===

// 다음 해금까지 남은 ms 반환 (전부 해금됐으면 -1)
function getKingsRoadNextUnlockMs() {
    const history = kingsRoadData.stepHistory;
    if (!history || history.length === 0) return -1;
    const total = getTotalNormalStageCount();
    const current = getKingsRoadUnlockedCount();
    if (current >= total) return -1;
    const last = history[history.length - 1];
    const daysElapsed = Math.floor((Date.now() - last.timestamp) / 86400000);
    const nextUnlockTime = last.timestamp + (daysElapsed + 1) * 86400000;
    return Math.max(0, nextUnlockTime - Date.now());
}

// 해금됐지만 한 번도 클리어하지 않은 일반 스테이지 수 반환
function getKingsRoadNewStageCount() {
    if (!kingsRoadData.stepHistory || kingsRoadData.stepHistory.length === 0) return 0;
    const mastery = kingsRoadData.mastery || {};
    const unlocked = getKingsRoadUnlockedSet();
    let count = 0;
    unlocked.forEach(id => {
        // 일반 스테이지만 확인 (mid-boss, boss 제외)
        if (!id.includes('boss') && !id.includes('mid')) {
            if (!(mastery[id] > 0)) count++;
        }
    });
    return count;
}

let _kingsRoadInfoInterval = null;

function updateKingsRoadHomeInfo() {
    if (window.isGamePlaying) return;
    const history = kingsRoadData.stepHistory;
    if (!history || history.length === 0) {
        _updateKingsOverlayBtnInfo(0, -1, false);
        return;
    }

    const newCount = getKingsRoadNewStageCount();
    const msLeft = getKingsRoadNextUnlockMs();

    _updateKingsOverlayBtnInfo(newCount, msLeft, true);
}

function _updateKingsOverlayBtnInfo(newCount, msLeft, hasHistory) {
    const overlayInfoEl = document.getElementById('kings-overlay-info');
    if (!overlayInfoEl) return;

    if (!hasHistory) {
        overlayInfoEl.style.display = 'none';
        return;
    }

    overlayInfoEl.style.display = 'flex';

    const overlayBadgeEl = document.getElementById('kings-overlay-badge');
    if (overlayBadgeEl) {
        if (newCount > 0) {
            overlayBadgeEl.textContent = t('status_new_verses', { count: newCount });
            overlayBadgeEl.style.display = '';
        } else {
            overlayBadgeEl.style.display = 'none';
        }
    }

    const overlayTimerEl = document.getElementById('kings-overlay-timer');
    if (overlayTimerEl) {
        if (msLeft < 0) {
            overlayTimerEl.textContent = '🎉 ' + t('status_all_unlocked');
        } else {
            const h = Math.floor(msLeft / 3600000);
            const m = Math.floor((msLeft % 3600000) / 60000);
            const s = Math.floor((msLeft % 60000) / 1000);
            const pad = n => String(n).padStart(2, '0');
            overlayTimerEl.textContent = t('label_unlock_timer', { time: `${pad(h)}:${pad(m)}:${pad(s)}` });
        }
    }
}

function updateModeSelectReviewCounts() {
    const kingsCount = getReviewCountForMode('kings');
    const freeCount = getReviewCountForMode('free');

    const kingsEl = document.getElementById('kings-btn-review-count');
    if (kingsEl) {
        if (kingsCount > 0) {
            kingsEl.textContent = `📖 ${t('status_review_now')} ${kingsCount}`;
            kingsEl.style.display = '';
        } else {
            kingsEl.style.display = 'none';
        }
    }

    const freeEl = document.getElementById('free-btn-review-count');
    if (freeEl) {
        if (freeCount > 0) {
            freeEl.textContent = `📖 ${t('status_review_now')} ${freeCount}`;
            freeEl.style.display = '';
        } else {
            freeEl.style.display = 'none';
        }
    }
}

function startKingsRoadInfoTimer() {
    if (_kingsRoadInfoInterval) clearInterval(_kingsRoadInfoInterval);
    updateKingsRoadHomeInfo();
    _kingsRoadInfoInterval = setInterval(updateKingsRoadHomeInfo, 1000);
}

// 왕의 길 모드 선택 오버레이 열기
function openModeSelectOverlay() {
    const el = document.getElementById('mode-select-overlay');
    if (el) el.style.display = 'flex';
    updateKingsRoadHomeInfo();
    updateModeSelectReviewCounts();
}

// 왕의 길 모드 선택 오버레이 닫기
function closeModeSelectOverlay() {
    const el = document.getElementById('mode-select-overlay');
    if (el) el.style.display = 'none';
}

// 왕의 길 단계 선택 오버레이 열기
function openKingsStepSelectOverlay() {
    closeModeSelectOverlay();
    const el = document.getElementById('kings-step-select-overlay');
    if (el) el.style.display = 'flex';
}

// 왕의 길 단계 선택 오버레이 닫기
function closeKingsStepSelectOverlay() {
    const el = document.getElementById('kings-step-select-overlay');
    if (el) el.style.display = 'none';
}

// '왕의 길' 버튼 클릭 시
function onClickKingsRoad() {
    closeModeSelectOverlay();
    if (kingsRoadData.stepHistory.length === 0) {
        // 단계 미설정: 단계 선택 화면으로
        openKingsStepSelectOverlay();
    } else {
        // 단계 기설정: 바로 여정 시작
        switchMode('kings');
        proceedToJourneyOverlay();
    }
}

// 단계 선택 완료 후
function onSelectKingsStep(step) {
    closeKingsStepSelectOverlay();
    setKingsRoadStep(step);
    switchMode('kings');
    proceedToJourneyOverlay();
}

// '자유여행' 버튼 클릭 시
function onClickFreeJourney() {
    closeModeSelectOverlay();
    switchMode('free');
    proceedToJourneyOverlay();
}

// 기존 여정 오버레이 + amen 버튼 흐름 진행
function proceedToJourneyOverlay() {
    const overlay = document.getElementById('journey-overlay');
    const amenBtn = document.getElementById('amen-btn');
    if (overlay) overlay.style.display = 'flex';
    if (amenBtn) {
        amenBtn.style.display = 'block';
        amenBtn.style.opacity = '0';
        amenBtn.style.pointerEvents = 'none';
        setTimeout(() => {
            amenBtn.style.opacity = '1';
            amenBtn.style.pointerEvents = 'auto';
        }, 1000);
        amenBtn.onclick = amenAndStartGame;
    }
}

// ============================================================

function startGame() {
    // 모드 선택 오버레이를 먼저 표시
    openModeSelectOverlay();
}

function amenAndStartGame() {
    const overlay = document.getElementById('journey-overlay');
    const amenBtn = document.getElementById('amen-btn');
    // 시각적 피드백만 즉시 처리 (INP 개선: 브라우저가 먼저 페인트할 수 있도록)
    if (overlay) overlay.style.display = 'none';
    if (amenBtn) amenBtn.style.display = 'none';

    // 1. 오디오 권한 획득 (동기 but 빠름)
    if (typeof SoundEffect !== 'undefined' && SoundEffect.ctx.state === 'suspended') {
        SoundEffect.ctx.resume();
    }

    // 3. 효과음 버튼 상태 동기화
    syncSfxButtons();

    // 무거운 작업은 다음 태스크로 미뤄 브라우저가 먼저 페인트하게 함
    setTimeout(() => {
        // 🌟 4. [핵심 수술 2] 여정 시작 시 (Lazy Authentication)
        // 비로소 새로운 출입증을 발급받고 서버에 등록하여 다른 공기계의 접속을 차단합니다!
        try {
            if (typeof db !== 'undefined' && typeof myTag !== 'undefined' && myTag) {
                const newSessionToken = "session_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
                window.currentSessionToken = newSessionToken;

                // 변경된 출입증을 기기에 즉시 저장
                if (typeof saveGameData === 'function') saveGameData();

                // 서버에 새 출입증 신고 (기존 기기 쫓아내기)
                db.collection("leaderboard").doc(myTag).set({
                    sessionToken: newSessionToken,
                    updatedAt: new Date()
                }, { merge: true }).then(() => {
                    if (typeof startSessionGuard === 'function') startSessionGuard();
                    checkPendingReward();
                }).catch(err => console.error("출입증 갱신 지연:", err));
            }
        } catch(e) {
            console.error("출입증 발급 오류 (무시하고 진행):", e && e.message || e);
        }

        // 5. 기억 퀴즈 시도 후 맵 화면으로 이동
        if (typeof showMemoryQuizOverlay === 'function') showMemoryQuizOverlay();
        else if (typeof goMap === 'function') goMap();
    }, 0);
}

/* =====================================================
   [지난 주 보상] pendingReward 확인 → 홈 버튼 표시
   ===================================================== */
function checkPendingReward() {
    if (typeof db === 'undefined' || !db || !myTag) return;

    db.collection('leaderboard').doc(myTag).get().then(doc => {
        if (!doc.exists) return;
        const reward = doc.data().pendingReward;
        if (!reward || !reward.weekId) return;

        // 버튼 표시
        const btn = document.getElementById('last-week-reward-btn');
        if (btn) btn.style.display = 'flex';
    }).catch(err => console.warn('pendingReward 확인 실패:', err));
}

/* 보상 모달 열기 */
function openLastWeekRewardModal() {
    if (typeof db === 'undefined' || !db || !myTag) return;

    db.collection('leaderboard').doc(myTag).get().then(doc => {
        if (!doc.exists) return;
        const reward = doc.data().pendingReward;
        if (!reward) return;

        _showLastWeekRewardModal(reward);
    }).catch(err => console.warn('보상 조회 실패:', err));
}

function _showLastWeekRewardModal(reward) {
    // 기존 모달 제거
    const old = document.getElementById('last-week-reward-modal');
    if (old) old.remove();

    const zionRank   = reward.zionRank;
    const tribeRank  = reward.tribeRank;
    const zionGems   = reward.zionGems  || 0;
    const tribeGems  = reward.tribeGems || 0;
    const totalGems  = reward.totalGems || 0;
    const score      = reward.score     || 0;
    const weekId     = reward.weekId    || '';
    const zionQ      = reward.zionQualified;
    const tribeQ     = reward.tribeQualified;

    // 순위 텍스트 생성
    function rankTxt(rank) {
        if (!rank) return null;
        return `${rank}위`;
    }

    // 보상 행 HTML
    function rewardRow(label, rank, gems, qualified) {
        if (!rank) return '';
        const gemText = qualified
            ? `<span style="color:#f1c40f; font-weight:bold;">+${gems}💎</span>`
            : `<span style="color:#95a5a6; font-size:0.85rem;">인원 미달 (보상 없음)</span>`;
        return `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid rgba(255,255,255,0.08);">
                <div>
                    <div style="font-size:0.8rem; color:#95a5a6;">${label}</div>
                    <div style="font-size:1.5rem; font-weight:bold; color:white;">${rankTxt(rank)}</div>
                </div>
                <div style="text-align:right;">${gemText}</div>
            </div>`;
    }

    const noReward = totalGems === 0;
    const noRewardMsg = noReward ? `
        <div style="margin-top:12px; padding:10px; background:rgba(231,76,60,0.15); border-radius:8px; font-size:0.85rem; color:#e74c3c; text-align:center; line-height:1.5;">
            ${t('reward_no_reward_msg')}
        </div>` : '';

    const claimSection = noReward
        ? `<button onclick="closeLastWeekRewardModal()" style="margin-top:18px; width:100%; padding:12px; background:#7f8c8d; border:none; border-radius:10px; color:white; font-size:1rem; font-weight:bold; cursor:pointer;">${t('reward_confirm_btn')}</button>`
        : `<button onclick="claimWeeklyReward()" style="margin-top:18px; width:100%; padding:12px; background:linear-gradient(135deg,#f39c12,#e67e22); border:none; border-radius:10px; color:white; font-size:1rem; font-weight:bold; cursor:pointer;">${t('reward_claim_btn', { count: totalGems })}</button>`;

    const modal = document.createElement('div');
    modal.id = 'last-week-reward-modal';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:10000;display:flex;justify-content:center;align-items:center;padding:20px;box-sizing:border-box;';
    modal.innerHTML = `
        <div style="background:#2c3e50;border:2px solid #f39c12;border-radius:18px;width:100%;max-width:360px;padding:24px;box-shadow:0 10px 40px rgba(0,0,0,0.9);">
            <div style="text-align:center; margin-bottom:16px;">
                <div style="font-size:2rem;">🏆</div>
                <div style="font-size:1.1rem; color:#f1c40f; font-weight:bold; margin-top:4px;">${t('reward_last_week_title')}</div>
                <div style="font-size:0.8rem; color:#95a5a6; margin-top:2px;">${weekId}</div>
                <div style="margin-top:8px; font-size:0.9rem; color:#bdc3c7;">${t('reward_score_label')} <strong style="color:white;">${score.toLocaleString()}</strong> pts</div>
            </div>
            ${rewardRow(t('label_zion_ranking'), zionRank, zionGems, zionQ)}
            ${rewardRow(t('label_my_tribe_ranking'), tribeRank, tribeGems, tribeQ)}
            ${noRewardMsg}
            ${claimSection}
        </div>`;

    document.body.appendChild(modal);

    // 팡파레
    triggerConfetti();
    if (typeof SoundEffect !== 'undefined' && SoundEffect.playLevelUp) SoundEffect.playLevelUp();
}

function closeLastWeekRewardModal() {
    // 보상 없는 경우(확인 버튼) — pendingReward는 서버에서 삭제해 버튼도 숨김
    if (typeof db !== 'undefined' && db && myTag) {
        db.collection('leaderboard').doc(myTag).update({
            pendingReward: firebase.firestore.FieldValue.delete()
        }).catch(() => {});
    }
    const btn = document.getElementById('last-week-reward-btn');
    if (btn) btn.style.display = 'none';
    const modal = document.getElementById('last-week-reward-modal');
    if (modal) modal.remove();
}

function claimWeeklyReward() {
    if (typeof db === 'undefined' || !db || !myTag) return;

    // 서버에서 pendingReward 읽어 최종 확인 후 보석 지급
    db.collection('leaderboard').doc(myTag).get().then(doc => {
        if (!doc.exists) return;
        const reward = doc.data().pendingReward;
        if (!reward) return;

        const totalGems = reward.totalGems || 0;

        // 1. 서버 필드 삭제 먼저 (중복 수령 방지)
        return db.collection('leaderboard').doc(myTag).update({
            pendingReward: firebase.firestore.FieldValue.delete()
        }).then(() => {
            // 2. 보석 지급
            if (totalGems > 0) addGems(totalGems);

            // 3. UI 정리
            const btn = document.getElementById('last-week-reward-btn');
            if (btn) btn.style.display = 'none';
            const modal = document.getElementById('last-week-reward-modal');
            if (modal) modal.remove();
        });
    }).catch(err => {
        console.error('보상 수령 실패:', err);
        alert(t('alert_reward_error'));
    });
}

function goHome() {
    // 1. 모든 화면 숨기기
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));

    // 2. 홈 화면 켜기
    const homeScreen = document.getElementById('home-screen');
    if (homeScreen) {
        homeScreen.style.display = '';
        homeScreen.classList.add('active');
    }

    // 3. 성전 모습 업데이트
    updateCastleView();

    // ★ 주간 리셋 알림 표시
    const warningEl = document.getElementById('month-end-warning');
    if (warningEl) {
        const now = new Date();
        const isLastDay = isLastDayOfWeek();

        // 일요일이면 알림 표시
        warningEl.style.display = isLastDay ? 'block' : 'none';
    }

    // ★ [추가] 중요! 혹시 열려있을지 모르는 스테이지 시트(하얀 박스)를 닫아줌
    closeStageSheet();
    // 백버튼 표시 상태 갱신 (홈에서는 숨김)
    if (typeof updateBackButtonVisibility === 'function') updateBackButtonVisibility();
    // BGM 재생
    startBgm();
}

function goMap() {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));

    const homeScreen = document.getElementById('home-screen');
    if (homeScreen) {
        homeScreen.style.display = '';
    }

    // ★ [수정] 동적으로 생성된 화면(도감 등) 제거
    const lifeBookScreen = document.getElementById('life-book-screen');
    if (lifeBookScreen) lifeBookScreen.remove();

    document.getElementById('map-screen').classList.add('active');
    if (typeof seasonTimerInterval !== 'undefined' && seasonTimerInterval) {
        clearInterval(seasonTimerInterval);
    }
    // ★ [추가] 맵으로 돌아올 때 맵 재렌더링 (보스 클리어 후 풀밭 배경 즉시 반영)
    if (typeof renderChapterMap === 'function') {
        renderChapterMap();
    }
    setTimeout(drawRiver, 50);
    // 백버튼 표시 상태 갱신 (맵에서는 숨김)
    if (typeof updateBackButtonVisibility === 'function') updateBackButtonVisibility();
    // ★ [추가] 맵으로 돌아올 때 리소스 UI 업데이트 (만나 수령 시 보석 반영)
    if (typeof updateResourceUI === 'function') updateResourceUI();
    // BGM 정지
    stopBgm();
}

// 백버튼(돌아가기) 표시를 현재 활성 화면에 따라 제어
function updateBackButtonVisibility() {
    // 1) 우선 모든 btn-back 숨김 처리
    document.querySelectorAll('.btn-back').forEach(b => b.style.display = 'none');

    // 2) 현재 활성화된 화면 내부의 btn-back 만 보이게 함
    const active = document.querySelector('.screen.active');
    if (!active) return;
    active.querySelectorAll('.btn-back').forEach(b => b.style.display = 'inline-block');
}

// 화면에 돌아가기 버튼이 없으면 생성
function ensureBackButton(screen) {
    if (!screen) return;

    let footer = screen.querySelector('.button-area-static');
    if (!footer) {
        footer = document.createElement('div');
        footer.className = 'button-area-static';
        screen.appendChild(footer);
    }

    let btn = footer.querySelector('.btn-back');
    if (!btn) {
        btn = document.createElement('button');
        btn.className = 'btn-gray btn-back';
        btn.type = 'button';
        btn.textContent = t('btn_go_back');
        btn.onclick = goMap;
        footer.appendChild(btn);
    } else {
        btn.classList.add('btn-gray', 'btn-back');
        if (!btn.textContent || btn.textContent.trim() === '') {
            btn.textContent = t('btn_go_back');
        }
    }
}

/* [시스템: 맵 렌더링 (레이어 완벽 분리 버전)] */
function renderChapterMap() {
    const container = document.getElementById('chapter-list-area');

    // ★ 왕의 길 모드 헤더 표시/갱신
    let kingsHeader = document.getElementById('kings-road-map-header');
    const mapScreen = document.getElementById('map-screen');
    if (activeMode === 'kings' && mapScreen) {
        if (!kingsHeader) {
            kingsHeader = document.createElement('div');
            kingsHeader.id = 'kings-road-map-header';
            kingsHeader.className = 'kings-road-map-header';
            mapScreen.insertBefore(kingsHeader, container);
        }
        const step = kingsRoadData.stepHistory.length > 0
            ? kingsRoadData.stepHistory[kingsRoadData.stepHistory.length - 1].step : '?';
        const startTs = kingsRoadData.stepHistory.length > 0 ? kingsRoadData.stepHistory[0].timestamp : Date.now();
        const dayNum = Math.floor((Date.now() - startTs) / 86400000) + 1;
        const unlockedCount = getKingsRoadUnlockedCount();
        kingsHeader.innerHTML = `
            <span class="kh-title">${t('kings_header_title', { step })}</span>
            <span class="kh-info">${t('kings_header_info', { day: dayNum, count: unlockedCount })}</span>
        `;
        kingsHeader.style.display = 'flex';
    } else if (kingsHeader) {
        kingsHeader.style.display = 'none';
    }

    // 1. 컨테이너 초기화
    container.className = 'river-map-container';
    container.innerHTML = `
        <div id="map-land-area"></div> <svg id="river-svg">
            <path id="river-bank"  class="river-bank"  d="" />
            <path id="river-path"  class="river-path"  d="" />
            <path id="river-hl-1"  class="river-hl river-hl-1" d="" />
            <path id="river-hl-2"  class="river-hl river-hl-2" d="" />
            <path id="river-hl-3"  class="river-hl river-hl-3" d="" />
            <path id="river-hl-4"  class="river-hl river-hl-4" d="" />
        </svg>
    `;

    const landArea = document.getElementById('map-land-area');

    // 2. 챕터별 구역 생성
    gameData.forEach((chapter, index) => {
        // A. 상태 확인
        const bossId = `${chapter.id}-boss`;
        const isChapterClear = stageMastery[bossId] > 0;

        const lastTime = stageLastClear[`chapter-${chapter.id}`] || 0;

        // B. 껍데기 (Wrapper) 생성
        const wrapper = document.createElement('div');
        wrapper.className = 'zone-wrapper';
        if (index % 2 === 0) wrapper.classList.add('left');
        else wrapper.classList.add('right');

        // C. 배경 (Land Background) 생성
        const bg = document.createElement('div');
        let bgClass = 'land-bg barren';
        if (isChapterClear) {
            bgClass = 'land-bg garden';
        }
        bg.className = bgClass;

        // 황무지 마른 풀 장식 (장별 산발 배치)
        if (!isChapterClear) {
            const grassBase = [
                { x: 10, y: 10, s: 1.0, d: 0.0 },
                { x: 72, y: 20, s: 0.8, d: 1.2 },
                { x: 38, y: 15, s: 0.9, d: 0.5 },
                { x: 85, y: 60, s: 0.75,d: 1.8 },
                { x: 20, y: 70, s: 0.85,d: 0.9 },
                { x: 55, y: 75, s: 1.0, d: 2.1 },
                { x: 88, y: 82, s: 0.8, d: 0.3 },
            ];
            const seed = chapter.id;
            grassBase.forEach((f, i) => {
                const ox = ((seed * 17 + i * 31) % 22) - 11; // -11~+11
                const oy = ((seed * 13 + i * 23) % 18) - 9;  // -9~+9
                const x = Math.max(5, Math.min(90, f.x + ox));
                const y = Math.max(5, Math.min(85, f.y + oy));
                const span = document.createElement('span');
                span.className = 'barren-grass';
                span.textContent = '🌾';
                span.style.cssText = `left:${x}%;top:${y}%;font-size:${f.s}rem;animation-delay:${f.d}s`;
                bg.appendChild(span);
            });
        }

        // 풀밭 꽃 장식 (장별 산발 배치)
        if (isChapterClear) {
            const flowerBase = [
                { e: '🌸', x:  8, y: 12, s: 1.1, d: 0.0 },
                { e: '🌼', x: 78, y: 18, s: 0.9, d: 0.7 },
                { e: '🌺', x: 42, y:  8, s: 1.0, d: 1.4 },
                { e: '🌿', x: 15, y: 62, s: 0.85,d: 0.3 },
                { e: '🌷', x: 85, y: 55, s: 1.0, d: 1.8 },
                { e: '🌻', x: 58, y: 72, s: 0.95,d: 0.9 },
                { e: '🌹', x: 28, y: 80, s: 0.8, d: 2.2 },
                { e: '🌸', x: 90, y: 80, s: 0.9, d: 1.1 },
            ];
            const seed = chapter.id;
            flowerBase.forEach((f, i) => {
                const ox = ((seed * 19 + i * 37) % 22) - 11; // -11~+11
                const oy = ((seed * 11 + i * 29) % 18) - 9;  // -9~+9
                const x = Math.max(5, Math.min(90, f.x + ox));
                const y = Math.max(5, Math.min(85, f.y + oy));
                const span = document.createElement('span');
                span.className = 'garden-flower';
                span.textContent = f.e;
                span.style.cssText = `left:${x}%;top:${y}%;font-size:${f.s}rem;animation-delay:${f.d}s`;
                bg.appendChild(span);
            });
        }

        // D. 나무 버튼 (Node) 생성
        const node = document.createElement('div');
        let statusClass = chapter.locked ? 'locked' : 'unlocked';
        if (isChapterClear) statusClass = 'completed';

        node.className = `stage-node ${statusClass}`;
        node.id = `node-${index}`;

        // 아이콘 결정
        let iconChar = "🌱";
        let fruitHTML = "";

        if (!chapter.locked) iconChar = "🌳";

        if (isChapterClear) {
            iconChar = "🌳";
            fruitHTML = `
                <div class="fruit-cluster">
                    <span class="fruit f1">🍎</span>
                    <span class="fruit f2">🍒</span>
                    <span class="fruit f3">🍎</span>
                    <span class="fruit f4">✨</span>
                </div>
            `;
        }

        node.innerHTML = `
            <div class="tree-icon">
                ${iconChar}
                ${fruitHTML}
            </div>
            <div class="stage-label">${t('label_chapter_header', { num: chapter.id })}</div>
        `;

        node.onclick = () => {
            if (!chapter.locked) openStageSheet(chapter);
            else alert(t('alert_chapter_locked'));
        };

        const isLeft = (index % 2 === 0);

        // ★ 핵심: 배경과 나무 노드를 wrapper에 추가
        wrapper.appendChild(bg);   // 1층 (배경)
        wrapper.appendChild(node); // 2층 (나무 노드)

        // ★ 클리어한 장에만 '심화 훈련' 버튼을 나무 반대편에 배치
        // zone-wrapper(position:relative, width:100%) 기준 absolute
        // → 나무가 왼쪽(left zone)이면 버튼은 오른쪽, 나무가 오른쪽(right zone)이면 버튼은 왼쪽
        if (isChapterClear) {
            const hardshipBtn = document.createElement('button');
            hardshipBtn.className = 'chapter-hardship-btn';
            hardshipBtn.innerHTML = t('hardship_kings_btn');
            hardshipBtn.style.cssText = isLeft
                ? 'right: 12%; top: 50%; transform: translateY(-50%);'
                : 'left: 12%; top: 50%; transform: translateY(-50%);';
            hardshipBtn.onclick = (e) => {
                e.stopPropagation();
                openChapterHardship(chapter.id);
            };
            wrapper.appendChild(hardshipBtn);
        }

        landArea.appendChild(wrapper);
    });

    // 3. 강물 그리기 (디바운스 150ms, 이전 리스너 제거 후 재등록)
    if (renderChapterMap._resizeHandler) {
        window.removeEventListener('resize', renderChapterMap._resizeHandler);
    }
    let _resizeTimer;
    renderChapterMap._resizeHandler = function() {
        clearTimeout(_resizeTimer);
        _resizeTimer = setTimeout(drawRiver, 150);
    };
    window.addEventListener('resize', renderChapterMap._resizeHandler);
    setTimeout(drawRiver, 100);
}

/* [시스템: S자 강물 그리기 (Zone 대응 버전)] */
function drawRiver() {
    const svg = document.getElementById('river-svg');
    const path = document.getElementById('river-path');
    const nodes = document.querySelectorAll('.stage-node');
    const container = document.querySelector('.river-map-container');

    if (nodes.length === 0 || !svg || !path || !container || container.offsetParent === null) return;

    // 1. 모든 DOM 읽기를 먼저 수행 (레이아웃 스래싱 방지)
    const scrollH = container.scrollHeight;
    const containerRect = container.getBoundingClientRect();
    const scrollTop = container.scrollTop;
    const nodeRects = Array.from(nodes).map(n => n.getBoundingClientRect());

    // 2. SVG 높이 설정 (읽기 이후 쓰기)
    svg.style.height = `${scrollH}px`;

    // 3. 좌표 수집
    const points = nodeRects.map(rect => ({
        x: (rect.left - containerRect.left) + (rect.width / 2),
        y: (rect.top - containerRect.top) + scrollTop + (rect.height / 2),
    }));

    if (points.length < 2) return;

    // 4. x 오프셋을 적용한 경로 빌더
    function buildPath(ox) {
        let d = `M ${points[0].x + ox} 0 `;
        for (let i = 0; i < points.length - 1; i++) {
            const p1 = points[i];
            const p2 = points[i + 1];
            const midY = (p1.y + p2.y) / 2;
            if (i === 0) d += `L ${p1.x + ox} ${p1.y} `;
            d += `C ${p1.x + ox} ${midY}, ${p2.x + ox} ${midY}, ${p2.x + ox} ${p2.y} `;
        }
        d += `L ${points[points.length - 1].x + ox} ${scrollH}`;
        return d;
    }

    // 5. 경로 적용 (bank와 path는 동일 경로 — 한 번만 빌드)
    const basePath = buildPath(0);
    const bank = document.getElementById('river-bank');
    if (bank) bank.setAttribute('d', basePath);
    path.setAttribute('d', basePath);

    // 물결 4개: 강폭(-16~+16) 안에서 고르게 분산
    const hlOffsets = [-13, -5, +5, +13];
    hlOffsets.forEach((ox, i) => {
        const hl = document.getElementById(`river-hl-${i + 1}`);
        if (hl) hl.setAttribute('d', buildPath(ox));
    });
}

// 전역 변수로 타이머 관리 (창 닫을 때 끄기 위해)
var stageSheetTimer = null;

// 남은 시간을 어댑티브 형식으로 변환 (diff: ms)
function formatAdaptiveTime(diff) {
    if (diff >= 60 * 60 * 1000) {
        const h = Math.floor(diff / (60 * 60 * 1000));
        const m = Math.floor((diff % (60 * 60 * 1000)) / 60000);
        return m > 0 ? `${h}시간 ${m}분` : `${h}시간`;
    } else if (diff >= 10 * 60 * 1000) {
        return `${Math.floor(diff / 60000)}분`;
    } else {
        const mm = Math.floor(diff / 60000);
        const ss = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
        return `${mm}:${ss}`;
    }
}

// [도우미] 스테이지가 속한 챕터 데이터 조회
function getChapterDataByStageId(stageId) {
    const chNum = parseInt(String(stageId).split('-')[0]);
    if (isNaN(chNum)) return null;
    return gameData.find(c => c.id === chNum) || null;
}

// [도우미] 해당 스테이지 구간의 체크포인트(중간점검/보스) ID 찾기
function getSegmentCheckpointStageId(chapterData, stageId) {
    if (!chapterData || !chapterData.stages) return null;
    const idx = chapterData.stages.findIndex(s => s.id === stageId);
    if (idx === -1) return null;

    for (let i = idx + 1; i < chapterData.stages.length; i++) {
        const stage = chapterData.stages[i];
        if (!stage) continue;
        if (stage.type === 'mid-boss' || stage.type === 'boss') return stage.id;
    }

    return null;
}

// [도우미] 중간점검/보스 클리어 시 전체학습 허용 여부
function isFullLearningUnlockedByCheckpoint(stageId) {
    const chapterData = getChapterDataByStageId(stageId);
    if (!chapterData) return false;

    const stage = chapterData.stages.find(s => s.id === stageId);
    if (!stage || stage.type !== 'normal') return false;

    const checkpointId = getSegmentCheckpointStageId(chapterData, stageId);
    if (!checkpointId) return false;

    return (stageMastery[checkpointId] || 0) > 0;
}

// [도우미] 한 번도 진행하지 않은 스테이지인지 확인
function isUnplayedStage(stageId) {
    return !missionData.stageProgress || !missionData.stageProgress[stageId];
}

// [도우미] 스테이지 진행도 스냅샷
function getStageProgressSnapshot(stageId) {
    if (!missionData || !missionData.stageProgress) return null;
    return missionData.stageProgress[stageId] || null;
}

// [도우미] Step 1~5 완료 처리 여부
function isStageFullyLearned(stageId, stageData) {
    const progress = getStageProgressSnapshot(stageId);
    const phase = progress ? progress.phase : 0;
    const hasMastery = (stageMastery && stageMastery[stageId] && stageMastery[stageId] > 0);
    const isCleared = stageData && stageData.cleared;

    if (hasMastery || isCleared || phase >= 3) return true;
    return isFullLearningUnlockedByCheckpoint(stageId);
}

// ★ [도우미] 해당 장의 아직 초회를 받지 않은 mid-boss의 총 절수
function getUnreceivedMidBossVerses(chapterNum) {
    const chData = gameData.find(c => c.id === chapterNum);
    if (!chData) return 0;

    let unreceived = 0;
    chData.stages.forEach(stage => {
        if (stage.type === 'mid-boss') {
            const lastTime = stageLastClear[stage.id] || 0;
            const isClearedToday = lastTime && new Date(lastTime).toDateString() === new Date().toDateString();
            // 초회를 못 받은 mid-boss = 아직 오늘 클리어하지 않은 것
            if (!isClearedToday) {
                unreceived += stage.targetVerseCount || 0;
            }
        }
    });
    return unreceived;
}

// ★ [도우미] 해당 장의 모든 mid-boss 스테이지 ID 목록
function getChapterMidBossIds(chapterNum) {
    const chData = gameData.find(c => c.id === chapterNum);
    if (!chData) return [];
    return chData.stages
        .filter(s => s.type === 'mid-boss')
        .map(s => s.id);
}

let currentOpenChapterData = null;

/* [수정] 스테이지 시트 열기 (각 버튼별 타이머 적용) */
function openStageSheet(chapterData) {
    currentOpenChapterData = chapterData;
    const sheet = document.getElementById('stage-sheet');
    document.getElementById('sheet-chapter-title').innerText = t('label_chapter_header', { num: chapterData.id });

    const list = document.getElementById('stage-list-area');
    list.innerHTML = "";

    // 보스 클리어 멘트 배너 (보류 멘트가 있으면 시트 상단에 표시)
    let quoteBanner = document.getElementById('sheet-quote-banner');
    if (!quoteBanner) {
        quoteBanner = document.createElement('p');
        quoteBanner.id = 'sheet-quote-banner';
        quoteBanner.style.cssText = 'font-style:italic; color:var(--primary-color,#f1c40f); font-size:0.9rem; text-align:center; padding:10px 16px 0; margin:0; line-height:1.6; display:none;';
        list.parentNode.insertBefore(quoteBanner, list);
    }
    if (window._pendingResultQuote) {
        quoteBanner.textContent = window._pendingResultQuote;
        quoteBanner.style.display = 'block';
        window._pendingResultQuote = null;
    } else {
        quoteBanner.textContent = '';
        quoteBanner.style.display = 'none';
    }

    // 이전에 돌아가던 타이머가 있다면 정지 (중복 방지)
    if (stageSheetTimer) clearInterval(stageSheetTimer);

    // ★ 왕의 길 모드: 해금 set 미리 계산
    const kingsUnlockedSet = (activeMode === 'kings') ? getKingsRoadUnlockedSet() : null;

    chapterData.stages.forEach(stage => {
        const item = document.createElement('div');

        // 1. 상태 정보 확인
        const isCleared = (stageMastery[stage.id] || 0) > 0; // stage.cleared는 로드 시에만 갱신되므로 실시간 확인
        const chNum = parseInt(stage.id.split('-')[0]);

        // 배지 및 스타일
        let itemClass = `stage-item ${stage.type === 'boss' ? 'boss' : ''}`;
        if (isCleared) itemClass += ' cleared';

        const lastTime = stageLastClear[stage.id] || 0;
        let isTodayClear = new Date(lastTime).toDateString() === new Date().toDateString();

        // ★ [v1.1.0] 복습 상태 조회
        const stageReviewStatusUI = getReviewStatus(stage.id);
        const isForgotten = stageReviewStatusUI.isEligible && stageReviewStatusUI.step > 1; // 복습 가능 타이밍

        let statusBadgeHtml = "";

        // 1. 오늘 완료 배지
        if (isTodayClear) {
            itemClass += ' today-clear';
            statusBadgeHtml = `<div class="today-badge">${t('status_today_done')}</div>`;
        }
        // 2. 기억 다지기 배지 제거 — review badge strip으로 대체됨

        // 3. 말씀 숙련도 배지 (중간점검은 자체 스텝 없으므로 미표시)
        const memLevelUI = getMemoryLevelFromStep(stageReviewStatusUI.step);
        let levelBadgeHtml = "";
        if (memLevelUI > 0 && stage.type !== 'mid-boss') {
            let colorClass = "mem-lv-low"; // 초록 (Lv.1~2)
            if (memLevelUI >= 5) colorClass = "mem-lv-high"; // 빨강 (Lv.5+)
            else if (memLevelUI >= 3) colorClass = "mem-lv-mid"; // 파랑 (Lv.3~4)

            levelBadgeHtml = `<span class="mem-badge ${colorClass}">Lv.${memLevelUI}</span>`;
        }

        item.className = itemClass;

        // 아이콘
        let iconChar = "🌱";
        if (stage.type === 'boss') iconChar = "🐲";
        else if (stage.type === 'mid-boss') iconChar = "🛡️";
        if (isCleared) iconChar = "🌳";

        // 2. ★ 쿨타임(숙성) 여부 확인 ★
        const progress = getStageProgressSnapshot(stage.id);
        const progressPhase = progress ? progress.phase : 0;
        const isFullStepsComplete = isStageFullyLearned(stage.id, stage);
        const isCoolingDown = !isFullStepsComplete && progress && progress.unlockTime > Date.now();
        const isNormalStage = (stage.type !== 'boss' && stage.type !== 'mid-boss');
        const canChooseReviewMode = isNormalStage;

        // 3. 버튼 오른쪽 표시 (톱니바퀴 vs 재생버튼 vs 타이머)
        let rightSideContent = "";
        let rewardInfo = "";

        if (canChooseReviewMode) {
            rightSideContent = `<div style="font-size:1.2rem; color:#bdc3c7;">⚙️</div>`;
        }
        else if (isCoolingDown) {
            rightSideContent = `<div class="live-timer" data-unlock="${progress.unlockTime}" style="font-size:0.9rem; color:#e74c3c; font-weight:bold; background:#fff0f0; padding:4px 8px; border-radius:12px; border:1px solid #e74c3c;">⏳ 계산중</div>`;
        }
        else {
            rightSideContent = `<div style="font-size:1.2rem; color:#f1c40f;">▶</div>`;
        }

        // ★ [v1.1.0] 복습 단계 배지 (일반 스테이지에만 표시)
        rewardInfo = isNormalStage ? buildReviewBadgeHtml(stage.id) : "";

        // ★ [에빙하우스] 기억 강도 바
        let memoryBarHtml = "";
        if (isCleared && isNormalStage) {
            const strength = getMemoryStrength(stage.id);
            if (strength !== null) {
                const pct = Math.round(strength * 100);
                const colorClass = pct >= 80 ? 'mem-strength-green'
                                 : pct >= 60 ? 'mem-strength-yellow'
                                 : pct >= 40 ? 'mem-strength-orange'
                                 : 'mem-strength-red';
                const flameIcon  = pct >= 60 ? '🔥' : pct >= 40 ? '🕯️' : '💀';
                const flameClass = pct >= 80 ? 'flame-alive' : pct >= 60 ? 'flame-dim' : pct >= 40 ? 'flame-low' : 'flame-ash';
                memoryBarHtml = `<div class="mem-strength-bar-wrap" data-stage-id="${stage.id}"><div class="mem-strength-label"><span class="flame-icon ${flameClass}">${flameIcon}</span> <span class="mem-strength-pct">${pct}%</span></div><div class="mem-strength-track"><div class="mem-strength-fill ${colorClass}" style="width:${pct}%"></div></div></div>`;
            }
        } else if (stage.type === 'mid-boss') {
            // 중간점검: 소속 서브스테이지 평균 기억 강도 표시
            const avgStrength = getMidBossAvgStrength(chapterData, stage);
            if (avgStrength !== null) {
                const pct = Math.round(avgStrength * 100);
                const colorClass = pct >= 80 ? 'mem-strength-green'
                                 : pct >= 60 ? 'mem-strength-yellow'
                                 : pct >= 40 ? 'mem-strength-orange'
                                 : 'mem-strength-red';
                const flameIcon  = pct >= 60 ? '🔥' : pct >= 40 ? '🕯️' : '💀';
                const flameClass = pct >= 80 ? 'flame-alive' : pct >= 60 ? 'flame-dim' : pct >= 40 ? 'flame-low' : 'flame-ash';
                memoryBarHtml = `<div class="mem-strength-bar-wrap" data-mid-boss-id="${stage.id}"><div class="mem-strength-label"><span class="flame-icon ${flameClass}">${flameIcon}</span> 평균 <span class="mem-strength-pct">${pct}%</span></div><div class="mem-strength-track"><div class="mem-strength-fill ${colorClass}" style="width:${pct}%"></div></div></div>`;
            }
        }

        // 4. HTML 조립
        item.innerHTML = `
    ${statusBadgeHtml}
    <div class="stage-icon">${iconChar}</div>
    <div class="stage-info">
        <div class="stage-title">
            ${levelBadgeHtml} ${getStageTitle(stage)}  </div>
        <div class="stage-desc">${getStageDesc(stage)}</div>
        ${rewardInfo}
        ${memoryBarHtml}
    </div>
    ${rightSideContent}
        `;

        // ★ 왕의 길 잠금 처리
        if (kingsUnlockedSet && !kingsUnlockedSet.has(stage.id)) {
            item.classList.add('kings-locked');
            item.innerHTML += `<span class="kings-locked-badge">🔒</span>`;
            item.onclick = () => {
                const daysLeft = 1; // 안내 메시지용
                alert(t('alert_verse_locked'));
            };
            list.appendChild(item);
            return; // 나머지 클릭 이벤트 설정 건너뜀
        }

        // 5. 클릭 이벤트
        item.onclick = () => {
            window.currentStageId = stage.id;

            // [성능] 일반 스테이지 클릭 시 오디오를 미리 로드 (startStageWithTransition 도착 전에 준비)
            if (stage.type !== 'boss' && stage.type !== 'mid-boss') {
                const _m = String(stage.id).match(/^(\d+)(?:-(\d+))?/);
                const _cn = _m ? parseInt(_m[1], 10) : 0;
                const _vn = (_m && _m[2]) ? parseInt(_m[2], 10) : 1;
                const _preload = new Audio(`assets/audio/${_cn}-${_vn}.mp3`);
                _preload.preload = 'auto';
                _preload.load();
                window._preloadedStageAudio = _preload;
            }

            if (stage.type === 'boss' || stage.type === 'mid-boss') {
                startBossBattle(stage.targetVerseCount);
            } else if (canChooseReviewMode) {
                // 모드 선택 창을 띄웁니다.
                // (여기는 일단 그대로 둡니다. 나중에 모드 버튼 안쪽에 애니메이션을 걸어줄 거예요!)
                openModeSelect(stage.id);
            } else {
                startTraining(stage.id, 'full-new');
            }
        };

        list.appendChild(item);
    });

    sheet.classList.add('open');

    // ★ 6. 타이머 작동 시작 (즉시 1회 실행 후 1분마다 갱신) ★
    function updateSheetTimers() {
        const now = Date.now();

        // 숙성 쿨타임 타이머 (live-timer)
        document.querySelectorAll('.live-timer').forEach(el => {
            const unlockTime = parseInt(el.dataset.unlock);
            const diff = unlockTime - now;

            if (diff <= 0) {
                el.innerText = "🔓 OPEN";
                el.style.color = "#2ecc71";
                el.style.borderColor = "#2ecc71";
                el.style.background = "#eafaf1";
            } else {
                const totalMins = Math.floor(diff / 60000);
                const timeStr = totalMins >= 60
                    ? `${Math.floor(totalMins / 60)}시간 ${totalMins % 60 > 0 ? (totalMins % 60) + '분' : ''}`.trim()
                    : (totalMins > 0 ? totalMins + '분' : '1분 미만');
                el.innerText = t('status_review_later', { time: timeStr });
            }
        });

        // 보너스 대기 타이머 (live-timer-bonus) - 구버전 호환용
        document.querySelectorAll('.live-timer-bonus').forEach(el => {
            const unlockTime = parseInt(el.dataset.unlock);
            const diff = unlockTime - now;
            if (diff <= 0) {
                el.innerText = t('status_review_now');
            } else {
                const totalMins = Math.floor(diff / 60000);
                const timeStr = totalMins >= 60
                    ? `${Math.floor(totalMins / 60)}시간 ${totalMins % 60 > 0 ? (totalMins % 60) + '분' : ''}`.trim()
                    : (totalMins > 0 ? totalMins + '분' : '1분 미만');
                el.innerText = t('status_review_later', { time: timeStr });
            }
        });

        // ★ [v1.1.0] 복습 단계 배지 타이머 (live-timer-review)
        document.querySelectorAll('.live-timer-review').forEach(el => {
            const unlockTime = parseInt(el.dataset.unlock);
            const diff = unlockTime - now;
            if (diff <= 0) {
                el.textContent = t('status_review_now');
                el.className = 'review-ready';
            } else {
                const totalMins = Math.floor(diff / 60000);
                const d = Math.floor(totalMins / 1440);
                const h = Math.floor((totalMins % 1440) / 60);
                const m = totalMins % 60;
                let timeStr = '';
                if (d > 0) timeStr += `${d}일 `;
                if (h > 0) timeStr += `${h}시간 `;
                if (m > 0 || timeStr === '') timeStr += `${m}분`;
                el.textContent = t('status_review_bonus', { time: timeStr.trim() });
            }
        });

        // ★ [에빙하우스] 기억 강도 바 업데이트 (일반 스테이지)
        document.querySelectorAll('.mem-strength-bar-wrap[data-stage-id]').forEach(wrap => {
            const sid = wrap.dataset.stageId;
            const strength = getMemoryStrength(sid);
            if (strength === null) return;
            const pct = Math.round(strength * 100);
            const colorClass = pct >= 80 ? 'mem-strength-green'
                             : pct >= 60 ? 'mem-strength-yellow'
                             : pct >= 40 ? 'mem-strength-orange'
                             : 'mem-strength-red';
            const flameIcon  = pct >= 60 ? '🔥' : pct >= 40 ? '🕯️' : '💀';
            const flameClass = pct >= 80 ? 'flame-alive' : pct >= 60 ? 'flame-dim' : pct >= 40 ? 'flame-low' : 'flame-ash';
            const fill = wrap.querySelector('.mem-strength-fill');
            const pctEl = wrap.querySelector('.mem-strength-pct');
            const flameEl = wrap.querySelector('.flame-icon');
            if (fill) { fill.style.width = pct + '%'; fill.className = `mem-strength-fill ${colorClass}`; }
            if (pctEl) pctEl.textContent = pct + '%';
            if (flameEl) { flameEl.textContent = flameIcon; flameEl.className = `flame-icon ${flameClass}`; }
        });

        // ★ [에빙하우스] 기억 강도 바 업데이트 (중간점검 — 서브스테이지 평균)
        document.querySelectorAll('.mem-strength-bar-wrap[data-mid-boss-id]').forEach(wrap => {
            const midBossId = wrap.dataset.midBossId;
            const chNum = parseInt(midBossId.split('-')[0]);
            const chData = gameData.find(c => c.id === chNum);
            if (!chData) return;
            const midBossStage = chData.stages.find(s => s.id === midBossId);
            if (!midBossStage) return;
            const avgStrength = getMidBossAvgStrength(chData, midBossStage);
            if (avgStrength === null) return;
            const pct = Math.round(avgStrength * 100);
            const colorClass = pct >= 80 ? 'mem-strength-green'
                             : pct >= 60 ? 'mem-strength-yellow'
                             : pct >= 40 ? 'mem-strength-orange'
                             : 'mem-strength-red';
            const fill = wrap.querySelector('.mem-strength-fill');
            const pctEl = wrap.querySelector('.mem-strength-pct');
            if (fill) { fill.style.width = pct + '%'; fill.className = `mem-strength-fill ${colorClass}`; }
            if (pctEl) pctEl.textContent = pct + '%';
        });
    }

    updateSheetTimers();
    stageSheetTimer = setInterval(updateSheetTimers, 60000);
}


let selectedStageForMode = null;

/* [수정] 복습 모드 선택 팝업 (Step 6 클리어 후 전용) */
function openModeSelect(stageId) {
    const modal = document.getElementById('mode-select-modal');
    const container = modal.querySelector('.result-card');

    // 팝업 내용 재구성
    container.innerHTML = `
        <div style="text-align: right;">
            <button onclick="closeModeSelect()" style="background:none; border:none; font-size:1.5rem; color:#95a5a6; cursor:pointer;">✕</button>
        </div>
        <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="margin:0; color:#2c3e50;">${t('review_mode_title')}</h2>
        </div>

        <button class="mode-btn" onclick="confirmMode('quick')" style="background:#fff9c4; border:2px solid #f1c40f; color:#d35400; box-shadow: 0 4px 0 #f39c12;">
            <div class="mode-icon">⚡</div>
            <div class="mode-info">
                <div class="mode-tag" style="background:#f1c40f; color:#d35400;">${t('review_mode_quick_tag')}</div>
                <div class="mode-title">${t('review_mode_quick_title')}</div>
                <div class="mode-desc">${t('review_mode_quick_desc')}</div>
            </div>
        </button>

        <button class="mode-btn" onclick="confirmMode('full')" style="background:white; border:2px solid #bdc3c7; color:#7f8c8d; box-shadow: 0 4px 0 #95a5a6;">
            <div class="mode-icon">📖</div>
            <div class="mode-info">
                <div class="mode-title">${t('review_mode_full_title')}</div>
                <div class="mode-desc">${t('review_mode_full_desc')}</div>
            </div>
        </button>
    `;

    window.selectedStageForMode = stageId;
    modal.style.display = 'flex';
}
// =========================================
// [추가] 기억 다지기 스테이지 오버레이 및 추적 함수
// =========================================

// 기억 다지기 스테이지 리스트를 수집하는 함수
function getForgottenStages() {
    const forgottenList = [];
    for (let chapter of gameData) {
        if (!chapter.stages) continue;
        for (let stage of chapter.stages) {
            // 중간점검/보스전 제외
            if (stage.type === 'boss' || stage.type === 'mid-boss') continue;
            const stageId = stage.id;
            const revStatus = getReviewStatus(stageId);
            if (revStatus.step > 1 && revStatus.isEligible) {
                const m = String(stageId).match(/^(\d+)-(\d+)$/);
                const label = m ? t('stage_title_normal', { ch: m[1], v: m[2] }) : stageId;
                forgottenList.push({
                    stageId,
                    label,
                    step: revStatus.step,
                });
            }
        }
    }
    return forgottenList;
}

// 특정 모드의 복습 대기 구절 수를 반환 (모드 전환 없이 조회)
function getReviewCountForMode(mode) {
    let reviewStepMap, nextReviewTimeMap;
    if (mode === activeMode) {
        reviewStepMap = stageReviewStep;
        nextReviewTimeMap = stageNextReviewTime;
    } else if (mode === 'kings') {
        reviewStepMap = kingsRoadData.reviewStep;
        nextReviewTimeMap = kingsRoadData.nextReviewTime;
    } else {
        reviewStepMap = _freeStageReviewStep;
        nextReviewTimeMap = _freeStageNextReviewTime;
    }
    const now = Date.now();
    let count = 0;
    for (const chapter of gameData) {
        if (!chapter.stages) continue;
        for (const stage of chapter.stages) {
            if (stage.type === 'boss' || stage.type === 'mid-boss') continue;
            const step = reviewStepMap[stage.id] || 1;
            const nextTime = nextReviewTimeMap[stage.id] || 0;
            if (step > 1 && now >= nextTime) count++;
        }
    }
    return count;
}

// 기억 다지기 스테이지 오버레이 표시 함수
// 보너스 대기 중인 스테이지 목록 반환 (remaining > 0 이고 아직 대기 시간이 남은 스테이지)
function formatTimeLeft(ms) {
    const min = Math.ceil(ms / 60000);
    if (min < 60) return `${min}분 후`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m > 0 ? `${h}시간 ${m}분 후` : `${h}시간 후`;
}

function openForgottenStagesOverlay() {
    let overlay = document.getElementById('forgotten-stages-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'forgotten-stages-overlay';
        overlay.style = 'display:flex; position:fixed; z-index:9999; top:0; left:0; width:100vw; height:100vh; background:rgba(44,62,80,0.97); color:#f1c40f; flex-direction:column; align-items:center; justify-content:center; font-size:1.2rem; text-align:center;';
        overlay.innerHTML = `
                <div style="max-width:90vw; font-size:1.1em; line-height:1.7; font-weight:bold; color:#fff; text-shadow:0 2px 8px #222; margin-bottom:30px; flex-shrink: 0;">
                    ${t('forgotten_overlay_title')}<br><span style="font-size:0.95em; color:#f1c40f;">${t('forgotten_overlay_subtitle')}</span>
                </div>
                <div id="forgotten-stages-list" style="background:rgba(0,0,0,0.3); padding:20px; border-radius:15px; width:90vw; max-width:600px; min-width:220px; margin-bottom:30px; max-height:50vh; overflow-y:auto; flex-shrink: 0;">
                </div>
                <button onclick="closeForgottenStagesOverlay()" style="background: #f1c40f; color: #2c3e50; font-size:1.1rem; font-weight:bold; padding: 10px 32px; border-radius: 30px; border:none; box-shadow:0 2px 10px #2224; cursor:pointer; margin-top:0; flex-shrink: 0;">${t('forgotten_overlay_close')}</button>
            `;
        document.body.appendChild(overlay);
    } else {
        overlay.style.display = 'flex';
    }
    // 리스트 렌더링
    const listDiv = document.getElementById('forgotten-stages-list');
    const forgottenList = getForgottenStages();
    if (forgottenList.length === 0) {
        listDiv.innerHTML = `<div style="color:#bdc3c7;">${t('forgotten_empty')}</div>`;
        return;
    }
    listDiv.innerHTML = '';
    for (const item of forgottenList) {
        const btn = document.createElement('button');
        btn.innerHTML = `<span style="font-weight:bold; color:#f1c40f;">${item.label}</span><span style="color:#bdc3c7; margin-left:8px;">${t('forgotten_review_step', { step: item.step })}</span>`;
        btn.style = 'display:block; width:100%; background:rgba(241,196,15,0.12); border:1px solid #f1c40f; color:#fff; padding:12px 0; border-radius:12px; margin-bottom:10px; font-size:1.05rem; cursor:pointer; transition:background 0.2s;';
        btn.onclick = function () {
            closeForgottenStagesOverlay();
            openModeSelect(item.stageId);
        };
        listDiv.appendChild(btn);
    }
}

function closeForgottenStagesOverlay() {
    const overlay = document.getElementById('forgotten-stages-overlay');
    if (overlay) overlay.style.display = 'none';
}

// 오버레이를 열 수 있는 버튼을 홈 화면에 추가하려면 아래 함수를 호출하세요:
// openForgottenStagesOverlay();

function confirmMode(mode) {
    if (!window.selectedStageForMode) return;
    const stageId = window.selectedStageForMode;
    closeModeSelect();
    startTraining(stageId, mode);
}

function closeModeSelect() {
    const modal = document.getElementById('mode-select-modal');
    if (modal) {
        modal.style.display = 'none';
    }
    window.selectedStageForMode = null; // 선택 상태 초기화
}

function closeStageSheet() {
    const sheet = document.getElementById('stage-sheet');
    sheet.classList.remove('open');

    // [추가] 타이머 정리 (메모리 누수 방지)
    if (stageSheetTimer) {
        clearInterval(stageSheetTimer);
        stageSheetTimer = null;
    }
}

/* [시스템] 초회/반복 학습 권장 (이전 재도전 보너스 제거) */

/* [2단계] 보스전 보상 정밀 계산 함수 (초회/반복 구분) */
function calculateBossBaseGem(chapterNum) {
    const verses = bibleData[chapterNum]; // 해당 장의 구절 데이터
    if (!verses) return 0;

    let totalGem = 0;
    const today = new Date().setHours(0, 0, 0, 0); // 오늘 날짜 0시 0분

    verses.forEach((v, idx) => {
        const subId = `${chapterNum}-${idx + 1}`;
        const lastTime = stageLastClear[subId] || 0;

        // 해당 스테이지를 '오늘' 깼는지 확인
        const isClearedToday = new Date(lastTime).setHours(0, 0, 0, 0) === today;

        if (isClearedToday) {
            // 같은 날 반복: 기본 보상 10개
            totalGem += 10;
        } else {
            // 새로운 날 초회: 초회 보상 50개
            totalGem += 50;
        }
    });

    return totalGem;
}

/* [기억 상태 확인 함수] stageNextEligibleTime 기준으로 판단 (반복 클리어 시 타이머 초기화 방지) */
function checkMemoryStatus(stageId) {
    // 한 번도 안 깬 경우
    if (!stageLastClear[stageId]) {
        return { level: 0, isForgotten: false, remainTime: null };
    }

    const currentLevel = stageMemoryLevels[stageId] || 0;
    const now = Date.now();

    // stageNextEligibleTime이 설정된 경우: 이를 기준으로 판단 (반복 클리어해도 타이머 유지)
    if (stageNextEligibleTime[stageId]) {
        const remainMs = stageNextEligibleTime[stageId] - now;
        const remainHours = remainMs / (1000 * 60 * 60);
        return {
            level: currentLevel,
            isForgotten: remainHours <= 0,
            remainTime: Math.max(0, remainHours)
        };
    }

    // 하위 호환: 구 저장 데이터에 nextEligibleTime이 없는 경우 stageLastClear로 계산
    const diffHours = (now - stageLastClear[stageId]) / (1000 * 60 * 60);
    let forgettingTime = 23;
    if (currentLevel === 1) forgettingTime = 71;
    else if (currentLevel === 2) forgettingTime = 167;
    else if (currentLevel === 3) forgettingTime = 335;
    else if (currentLevel >= 4) forgettingTime = 719;
    return {
        level: currentLevel,
        isForgotten: diffHours >= forgettingTime,
        remainTime: forgettingTime - diffHours
    };
}

//[시스템: 보스전 로직]//
let currentBossHp, maxBossHp, playerHearts, currentVerseIdx, currentVerseData;
let currentBossParts, currentBossPartIndex, currentBossChunks;

//[2] 보스전 시작 함수 (하트 버그 수정 + 구간 자동 탐지 + 연출 콜백 분리)//
function startBossBattle() {
    window.isGamePlaying = true; // ★ 게임 시작! 스위치 ON

    // 1. 이어하기 데이터 확인
    const savedRaw = localStorage.getItem('kingsRoad_checkpoint');
    let resumeMode = false;
    let savedData = null;

    if (savedRaw) {
        savedData = JSON.parse(savedRaw);
        if (savedData.stageId === window.currentStageId) {
            if (confirm(`💾 지난 기록이 있습니다.\n\n[${savedData.index + 1}번째 구절]부터 이어하시겠습니까?\n(체력: ${savedData.hp} / ${savedData.maxHp})`)) {
                resumeMode = true;
            } else {
                clearCheckpoint();
            }
        }
    }

    // 🌟 [수정됨] 애니메이션에 필요한 '데이터 계산'은 보따리 밖에 둡니다.
    const sId = String(window.currentStageId);
    const parts = sId.split('-');
    const chapterNum = parseInt(parts[0]);

    if (isNaN(chapterNum) || !bibleData[chapterNum]) return;

    const fullChapterData = bibleData[chapterNum];
    let startIndex = 0;
    let endIndex = fullChapterData.length; // 기본값: 전체 (최종보스)

    const chData = gameData.find(c => c.id === chapterNum);

    // 🌟 [핵심 수술] '무조건 5개'라는 하드코딩을 버리고, 지도의 데이터를 그대로 읽어옵니다!
    if (chData && sId.includes('mid')) {
        // 1. 내가 누른 스테이지의 정확한 정보를 지도(chData)에서 찾아옵니다.
        const myStage = chData.stages.find(s => s.id === sId);

        if (myStage) {
            // 2. ID가 "16-mid-21" 형태이므로, 맨 끝 번호(21)를 뽑아냅니다.
            const endVerseNum = parseInt(sId.split('-')[2]);
            endIndex = endVerseNum;

            // 3. 시작 번호는 (끝 번호 - 이번 스테이지의 목표 개수)로 정확하게 역산합니다!
            // 예: 21절에서 끝나는데 타겟이 6개면? -> 인덱스 15 (즉 16절부터 시작)
            startIndex = endIndex - myStage.targetVerseCount;
        }
    }

    // 데이터 잘라내기
    window.currentBattleData = fullChapterData.slice(startIndex, endIndex).map((verse, i) => {
        const enVerse = (typeof bibleDataEn !== 'undefined' && bibleDataEn[chapterNum])
            ? bibleDataEn[chapterNum][startIndex + i] : null;
        return enVerse
            ? Object.assign({}, verse, { textEn: enVerse.text, chunksEn: enVerse.chunks })
            : verse;
    });
    maxBossHp = window.currentBattleData.length;
    window.currentBattleChapter = chapterNum;
    window.currentBattleStartIndex = startIndex;


    // ✂️============== [여기서부터 콜백 보따리를 쌉니다] ==============✂️
    // 화면 조작, UI 업데이트, 실제 전투 시작 로직만 담습니다.
    const startBossAction = () => {
        closeStageSheet();
        document.getElementById('map-screen').classList.remove('active');
        // ★ [버그 픽스] 집중 훈련/고난 길이 남긴 모드 클래스를 모두 벗겨냅니다.
        const gs = document.getElementById('game-screen');
        gs.classList.add('active');
        gs.classList.remove('mode-training', 'is-training-mode', 'mode-hardship');

        const bossAvatar = document.querySelector('.boss-avatar');
        if (bossAvatar) {
            bossAvatar.classList.remove('boss-die-effect');
            bossAvatar.classList.remove('boss-hit-effect');
            // ★ [버그 픽스] 훈련/고난 모드가 설정한 display:none 인라인 스타일을 초기화합니다.
            bossAvatar.style.display = '';
            bossAvatar.style.opacity = "1";
            bossAvatar.style.transform = "scaleX(-1)";
        }

        const field = document.querySelector('.battle-field');
        const control = document.querySelector('.battle-control');
        field.innerHTML = `<div class="verse-indicator" id="verse-index">${t('label_preparing')}</div><div class="answer-zone" id="answer-zone"><span class="placeholder-text" id="placeholder-text">...</span></div>`;
        control.innerHTML = `<div class="block-pool" id="block-pool"></div>`;

        wrongCount = 0;
        battleHintCount = 0;
        bossHintCount = 0;
        bossStartTime = Date.now();

        if (resumeMode && savedData) {
            currentVerseIdx = savedData.index;
            playerHearts = savedData.hp;
            currentBossHp = savedData.bossHp;
            currentBossPartIndex = (typeof savedData.partIndex === 'number') ? savedData.partIndex : 0;
        } else {
            currentVerseIdx = 0;
            currentBossHp = maxBossHp;
            playerHearts = maxPlayerHearts;
            currentBossPartIndex = 0;
        }

        updateBattleUI();
        loadNextVerse();

        if (typeof showReadAloudToast === 'function') {
            if (sId.includes('mid')) {
                showReadAloudToast(t('toast_boss_mid'));
            } else {
                showReadAloudToast(t('toast_boss_normal'));
            }
        }
    }; // ✂️============== [보따리 끝] ==============✂️


    // 🌟 밖에서 미리 계산해둔 변수들을 사용해서 애니메이션을 먼저 틀어줍니다!
    startBossTransition(chapterNum, startIndex + 1, endIndex, sId.includes('mid'), startBossAction);
}

/* [축하 이펙트] 보스 클리어 시 파티클 폭죽 생성 */
function createVictoryParticles() {
    const gameScreen = document.getElementById('game-screen');
    const particleEmojis = ['⭐', '✨', '💛', '🎉', '🏆', '💎'];

    // 2번의 웨이브로 나눠서 생성 (더 화려하게)
    for (let wave = 0; wave < 2; wave++) {
        setTimeout(() => {
            for (let i = 0; i < 15; i++) {
                const particle = document.createElement('div');
                particle.innerHTML = particleEmojis[Math.floor(Math.random() * particleEmojis.length)];

                // 랜덤 위치에서 시작
                const startX = Math.random() * 100; // 0 ~ 100%
                const startY = -10; // 화면 위에서 출발

                particle.style.cssText = `
                    position: fixed;
                    left: ${startX}%;
                    top: ${startY}%;
                    font-size: ${1.5 + Math.random() * 1}rem;
                    pointer-events: none;
                    z-index: 1000;
                    animation: fallDown ${2 + Math.random() * 1}s ease-in forwards;
                    opacity: 1;
                `;

                gameScreen.appendChild(particle);
            }
        }, wave * 300); // 300ms 간격으로 웨이브 생성
    }
}

/* [CSS 인젝션] fallDown 애니메이션 (동적 추가) */
(function injectParticleStyles() {
    if (document.getElementById('particle-style')) return; // 이미 있으면 스킵

    const style = document.createElement('style');
    style.id = 'particle-style';
    style.textContent = `
        @keyframes fallDown {
            0% {
                transform: translateY(0) translateX(0) scale(1);
                opacity: 1;
            }
            50% {
                opacity: 1;
            }
            100% {
                transform: translateY(100vh) translateX(${Math.sin(Math.random() * Math.PI) * 200}px) scale(0);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
})();

/* [수정] loadNextVerse (축하 이펙트 강화 버전) */
function loadNextVerse() {
    if (!window.isGamePlaying) return; // ★ 추가: 나갔으면 중단! (보스전 타이머 방어)
    // 1. 전투 종료 체크 (승리!)
    if (currentVerseIdx >= window.currentBattleData.length) {

        // ★ [추가] 용 사망 연출 시작
        const bossAvatar = document.querySelector('.boss-avatar');
        if (bossAvatar && !bossAvatar.classList.contains('boss-die-effect')) {

            // 1. 사망 애니메이션 클래스 추가
            bossAvatar.classList.add('boss-die-effect');

            // 2. 축하 이펙트 음성 (승리 팡파레 시뮬레이션 - 빠르고 경쾌하게!)
            if (typeof SoundEffect !== 'undefined') {
                // 부드러운 'sine' 대신 밝은 'square'나 'triangle' 사용
                // 0.3(서서히) 대신 0.05(즉각적 타격) 또는 0.1(짧고 경쾌함)으로 변경

                // 빰! 빰! 빰! 빠아암~! (간격도 살짝 타이트하게 당겼습니다)
                SoundEffect.playTone(330, 'square', 0.1, 0.1);  // 미(E)
                setTimeout(() => SoundEffect.playTone(392, 'square', 0.1, 0.1), 80);   // 파(G)
                setTimeout(() => SoundEffect.playTone(494, 'square', 0.1, 0.1), 160);  // 라(A)
                setTimeout(() => SoundEffect.playTone(587, 'square', 0.4, 0.2), 240);  // 시(B) - 마지막은 길게 뻗음
            }

            // 3. 파티클 폭죽 이펙트 생성
            createVictoryParticles();

            // 4. 애니메이션 시간(2초) 뒤에 진짜 승리 처리
            setTimeout(() => {
                const clearedStageId = window.currentStageId;
                const sId = String(window.currentStageId);

                // 저장 데이터 삭제
                clearCheckpoint();

                if (sId.includes('mid')) stageClear('mid-boss');
                else stageClear('boss');

                // 보스 클리어 결과 모달 표시
                showBossClearScreen(clearedStageId);
            }, 2000); // 2초 딜레이 (폭죽 효과 최대 2개 웨이브)

            return; // 함수 여기서 중단 (애니메이션 기다림)
        }
        // 이미 연출 중이면 중복 실행 방지
        return;
    }

    // ▼▼▼ [추가] 5구절 단위 자동 저장 (0번 인덱스 제외) ▼▼▼
    // 예: idx=5(6구절), idx=10(11구절) 시작할 때 저장
    if (currentVerseIdx > 0 && currentVerseIdx % 5 === 0) {
        saveBattleCheckpoint();
    }

    // 2. 화면 구조 복구 (훈련 모드 잔상 제거)
    const field = document.querySelector('.battle-field');
    const control = document.querySelector('.battle-control');

    field.innerHTML = `
        <div class="verse-indicator" id="verse-index">준비 중...</div>
        <div class="answer-zone" id="answer-zone">
            <span class="placeholder-text" id="placeholder-text">${t('game_hint_instruction')}</span>
        </div>
    `;
    control.innerHTML = `<div style="position:relative;"><span class="next-part-badge" id="next-part-badge" style="display:none;"></span><div class="block-pool" id="block-pool"></div></div>`;

    // 3. 데이터 준비
    currentVerseData = window.currentBattleData[currentVerseIdx];

    const verseChunks = (currentVerseData && currentLang === 'en' && currentVerseData.chunksEn && currentVerseData.chunksEn.length)
        ? currentVerseData.chunksEn
        : (currentVerseData && currentVerseData.chunks) ? currentVerseData.chunks : [];
    currentBossParts = splitChunksIntoParts(verseChunks);
    if (currentBossParts.length > 1) {
        if (typeof currentBossPartIndex !== 'number' || currentBossPartIndex < 0) currentBossPartIndex = 0;
        if (currentBossPartIndex >= currentBossParts.length) currentBossPartIndex = 0;
    } else {
        currentBossPartIndex = 0;
    }
    currentBossChunks = currentBossParts[currentBossPartIndex];

    function updateVerseIndicator() {
        const chapterNum = window.currentBattleChapter || 1;
        const verseNum = (window.currentBattleStartIndex || 0) + currentVerseIdx + 1;
        let label = `${t('label_chapter_header', { num: chapterNum })} ${t('label_verse', { num: verseNum })}`;
        if (currentBossParts && currentBossParts.length > 1) {
            label += ` (${t('label_part', { cur: currentBossPartIndex + 1, total: currentBossParts.length })})`;
        }
        const verseEl = document.getElementById('verse-index');
        if (verseEl) verseEl.innerText = label;

        // 다음 파트 배지 업데이트
        const badge = document.getElementById('next-part-badge');
        if (badge) {
            const nextCount = currentBossParts?.[currentBossPartIndex + 1]?.length;
            if (nextCount) {
                badge.textContent = t('label_next_part', { count: nextCount });
                badge.style.display = '';
            } else {
                badge.style.display = 'none';
            }
        }
    }

    // 상단 스테이지 표시 업데이트
    updateVerseIndicator();

    const zone = document.getElementById('answer-zone');
    const pool = document.getElementById('block-pool');

    // 4. 블록 클릭 핸들러
    let selectedBlock = null;
    let insertMode = false;
    let insertSelectedPoolBtn = null;
    let insertBtn = null; // 버튼 생성 후 할당

    function deselect() {
        if (selectedBlock) {
            selectedBlock.classList.remove('selected-block');
            selectedBlock = null;
        }
    }

    function hideInsertMarkers() {
        Array.from(zone.querySelectorAll('.insert-marker')).forEach(m => m.remove());
    }

    function showInsertMarkers() {
        hideInsertMarkers();
        const blocks = Array.from(zone.querySelectorAll('.word-block'));
        if (blocks.length === 0) return;

        function createMarker(refNode) {
            const m = document.createElement('button');
            m.className = 'insert-marker';
            m.textContent = '+';
            m.onclick = (e) => {
                e.stopPropagation();
                if (!insertSelectedPoolBtn) return;
                insertSelectedPoolBtn.classList.remove('error-block', 'correct-block');
                if (refNode && refNode.parentElement === zone) {
                    zone.insertBefore(insertSelectedPoolBtn, refNode);
                } else {
                    zone.appendChild(insertSelectedPoolBtn);
                }
                const ph = document.getElementById('placeholder-text');
                if (ph) ph.style.display = 'none';
                insertSelectedPoolBtn.classList.remove('insert-mode-selected');
                insertSelectedPoolBtn = null;
                hideInsertMarkers();
                SoundEffect.playClick();
                if (insertBtn) updateInsertBtnDisabled();
            };
            return m;
        }

        zone.insertBefore(createMarker(blocks[0]), blocks[0]);
        blocks.forEach((block, i) => {
            block.after(createMarker(blocks[i + 1] || null));
        });
    }

    function setInsertMode(val) {
        insertMode = val;
        if (!val) {
            if (insertSelectedPoolBtn) {
                insertSelectedPoolBtn.classList.remove('insert-mode-selected');
                insertSelectedPoolBtn = null;
            }
            hideInsertMarkers();
        }
        if (insertBtn) updateInsertModeBtn();
    }

    function updateInsertModeBtn() {
        if (insertMode) {
            insertBtn.style.background = '#e67e22';
            insertBtn.style.boxShadow = '0 4px 0 #b7770d';
            insertBtn.style.color = '#fff';
            insertBtn.innerHTML = t('step5_insert_on');
        } else {
            insertBtn.style.background = '';
            insertBtn.style.boxShadow = '';
            insertBtn.style.color = '';
            insertBtn.innerHTML = t('step5_insert_btn');
        }
    }

    function updateInsertBtnDisabled() {
        if (!insertBtn) return;
        const hasBlocks = zone.querySelectorAll('.word-block').length > 0;
        insertBtn.disabled = !hasBlocks;
        if (!hasBlocks && insertMode) setInsertMode(false);
    }

    function handleBossBlockClick(btn) {
        btn.classList.remove('error-block');
        btn.classList.remove('correct-block');

        // ── 끼워넣기 모드: pool 블록만 선택/해제, zone 블록은 무시 ──
        if (insertMode) {
            if (btn.parentElement === pool) {
                if (insertSelectedPoolBtn === btn) {
                    btn.classList.remove('insert-mode-selected');
                    insertSelectedPoolBtn = null;
                    hideInsertMarkers();
                } else {
                    if (insertSelectedPoolBtn) insertSelectedPoolBtn.classList.remove('insert-mode-selected');
                    insertSelectedPoolBtn = btn;
                    btn.classList.add('insert-mode-selected');
                    showInsertMarkers();
                }
            }
            return;
        }

        // ── 일반 모드 ──
        SoundEffect.playClick();
        if (btn.parentElement === pool) {
            const ph = document.getElementById('placeholder-text');
            if (ph) ph.style.display = 'none';
            zone.appendChild(btn);
        } else {
            pool.appendChild(btn);
            if (zone.querySelectorAll('.word-block').length === 0) {
                const ph = document.getElementById('placeholder-text');
                if (ph) ph.style.display = 'block';
            }
        }
        updateInsertBtnDisabled();
    }

    function renderBossBlocks(chunks) {
        setInsertMode(false); // 파트 전환 / 초기 렌더링 시 끼워넣기 OFF
        zone.innerHTML = `<span class="placeholder-text" id="placeholder-text">${t('game_hint_instruction')}</span>`;
        pool.innerHTML = '';
        selectedBlock = null;

        const shuffled = [...chunks].sort((a, b) => a.localeCompare(b, currentLang === 'en' ? 'en' : 'ko'));
        shuffled.forEach(word => {
            const btn = document.createElement('div');
            btn.className = 'word-block';
            btn.innerText = getChosung(word);
            btn.dataset.original = word;
            btn.style.backgroundColor = "#e74c3c"; // 붉은색 계열
            btn.style.color = "#fff";
            btn.style.border = "1px solid #c0392b";
            btn.onclick = () => handleBossBlockClick(btn);
            pool.appendChild(btn);
        });
        updateInsertBtnDisabled(); // 렌더링 후 끼워넣기 버튼 상태 갱신
    }

    // 5. 블록 생성
    renderBossBlocks(currentBossChunks);

    // 6. 공격 버튼(과 다시 조립 버튼) 생성
    const oldBtn = document.getElementById('btn-boss-attack');
    if (oldBtn) oldBtn.remove();

    // 혹시 기존에 남아있을 수 있는 버튼 래퍼도 안전하게 지우기
    const oldWrapper = document.getElementById('boss-btn-wrapper');
    if (oldWrapper) oldWrapper.remove();

    // 💡 [추가] 두 버튼을 담을 가로 정렬 상자 (Wrapper) 만들기
    const btnWrapper = document.createElement('div');
    btnWrapper.id = 'boss-btn-wrapper';
    btnWrapper.style.display = 'flex';
    btnWrapper.style.width = '100%';
    btnWrapper.style.gap = '2%';
    btnWrapper.style.marginTop = '10px';

    // (1) 공격 버튼 설정
    const attackBtn = document.createElement('button');
    attackBtn.id = 'btn-boss-attack';
    attackBtn.className = 'btn-attack';
    attackBtn.innerText = t('btn_attack');
    attackBtn.style.flex = '3 1 0'; // 래퍼 안에서 차지하는 비율 (3/4)

    attackBtn.onclick = () => {
        const currentBlocks = Array.from(zone.querySelectorAll('.word-block'));
        const correctChunks = currentBossChunks;

        // 개수 체크
        if (currentBlocks.length !== correctChunks.length) {
            alert(t('alert_spell_incomplete', { cur: currentBlocks.length, need: correctChunks.length }));
            return;
        }

        let errorCount = 0;
        currentBlocks.forEach((btn, index) => {
            const visibleText = btn.innerText;
            const targetChosung = getChosung(correctChunks[index]);

            if (visibleText === targetChosung) {
                btn.classList.add('correct-block');
                btn.classList.remove('error-block');
            } else {
                btn.classList.add('error-block');
                btn.classList.remove('correct-block');
                errorCount++;
            }
        });

        if (errorCount === 0) {
            // 🔵 성공 로직 시작 시점에 연타 방지 추가!
            // ★ [버그 픽스] 공격 성공 즉시 버튼 비활성화 (보스 & 중간점검 공통 적용)
            attackBtn.disabled = true;
            attackBtn.style.pointerEvents = 'none';
            attackBtn.style.opacity = '0.7'; // 눌렸다는 시각적 표시

            if (currentBossParts && currentBossPartIndex < currentBossParts.length - 1) {
                // 파트가 남았을 경우 (다음 파트로 이동)
                SoundEffect.playAttack();
                currentBossPartIndex += 1;
                currentBossChunks = currentBossParts[currentBossPartIndex];

                // 다음 파트 블록을 그린 후 버튼을 다시 활성화해줘야 다음 공격이 가능합니다.
                setTimeout(() => {
                    renderBossBlocks(currentBossChunks);
                    updateVerseIndicator();
                    deselect();
                    // ★ 다음 파트가 나왔으니 버튼 다시 활성화
                    attackBtn.disabled = false;
                    attackBtn.style.pointerEvents = 'auto';
                    attackBtn.style.opacity = '1';
                }, 100);
                return;
            }

            // 🔵 진짜 성공 (다음 구절로 넘어가는 시점)
            SoundEffect.playAttack();
            triggerBossHitEffect();
            currentBossHp--;
            updateBattleUI();

            attackBtn.innerText = "✨ CRITICAL HIT! ✨";
            attackBtn.style.backgroundColor = "#f1c40f";

            setTimeout(() => {
                currentVerseIdx++;
                currentBossPartIndex = 0;
                loadNextVerse(); // 여기서 다음 구절을 불러오며 버튼이 새로 생성되므로 자연스럽게 초기화됩니다.
            }, 1000);
            deselect();
        } else {
            // 🔴 실패 로직
            SoundEffect.playWrong();
            playerHearts--;
            wrongCount++;
            updateBattleUI();

            alert(t('alert_attack_fail', { count: errorCount }));

            if (playerHearts <= 0) {
                showReviveModal();
            }
            deselect();
        }
    }; // <-- 공격 버튼 onclick 끝

    // (2) 💡 [추가] 다시 조립 버튼 설정
    const resetBtn = document.createElement('button');
    resetBtn.className = 'btn-reset-step5';
    resetBtn.innerHTML = t('btn_reassemble').replace('\n', '<br>');
    resetBtn.style.flex = '1 1 0'; // 래퍼 안에서 차지하는 비율 (1/4)

    resetBtn.onclick = () => {
        setInsertMode(false); // 다시 조립 시 끼워넣기 OFF
        const zone = document.getElementById('answer-zone');
        const pool = document.getElementById('block-pool');

        if (zone && pool) {
            // 1. 정답칸에 올라간 모든 블록을 찾아서
            const blocks = Array.from(zone.querySelectorAll('.word-block'));
            blocks.forEach(block => {
                block.classList.remove('error-block');
                block.classList.remove('correct-block');
                // 2. 대기열(pool)로 물리적으로 돌려보내기
                pool.appendChild(block);
            });

            // 3. 안내 문구 다시 띄우기
            if (!zone.querySelector('#placeholder-text')) {
                zone.innerHTML = `<span class="placeholder-text" id="placeholder-text">${t('game_hint_instruction')}</span>`;
            }
        }
        updateInsertBtnDisabled();
        if (typeof SoundEffect !== 'undefined') SoundEffect.playClick();
    }; // <-- 다시 조립 버튼 onclick 끝

    // ── 끼워넣기 토글 버튼 ──
    insertBtn = document.createElement('button');
    insertBtn.className = 'btn-reset-step5';
    insertBtn.style.flex = '1 1 0';
    updateInsertModeBtn();
    updateInsertBtnDisabled();
    insertBtn.onclick = () => {
        if (insertBtn.disabled) return;
        setInsertMode(!insertMode);
    };

    // (3) 두 버튼을 래퍼에 담고, 최종적으로 화면(battle-control)에 추가
    btnWrapper.appendChild(attackBtn);
    btnWrapper.appendChild(insertBtn);
    btnWrapper.appendChild(resetBtn);

    // 이미 함수 위쪽에서 정의된 control 변수를 그대로 사용합니다. (const 제거)
    if (control) {
        control.appendChild(btnWrapper);
    } else {
        // 혹시 control이 없을 경우를 대비한 안전망
        document.querySelector('.battle-control').appendChild(btnWrapper);
    }
} // <-- loadNextVerse 함수의 진짜 끝!


/* [수정] UI 업데이트 함수 (분할 체력바 + 개선된 보스 표시) */
function updateBattleUI() {
    updateHintButtonLabels();

    if (window.isHardshipMode) {
        updateHardshipHeader();
        return;
    }

    // 1. 보스 체력바 업데이트 (세그먼트 방식)
    if (typeof maxBossHp !== 'undefined' && maxBossHp > 0) {
        const hpContainer = document.querySelector('.hp-container');
        const bossText = document.getElementById('boss-hp-text');

        // ★ 핵심: maxBossHp가 변경되면 항상 새로 생성 (플래그 확인 안 함)
        if (hpContainer) {
            const currentSegmentCount = hpContainer.querySelectorAll('.hp-segment').length;

            // maxBossHp가 일치하지 않으면 새로 생성
            if (currentSegmentCount !== maxBossHp) {
                hpContainer.innerHTML = ''; // 기존 내용 제거

                // 각 구절마다 세그먼트 생성
                for (let i = 0; i < maxBossHp; i++) {
                    const segment = document.createElement('div');
                    segment.className = 'hp-segment';
                    segment.setAttribute('data-index', i);
                    if (i >= currentBossHp) {
                        segment.classList.add('damaged');
                    }
                    // 모든 세그먼트가 동일한 크기를 가지도록 계산: (전체 너비 - gap*개수) / 개수
                    const flexBasis = `calc((100% - ${(maxBossHp - 1) * 1}px) / ${maxBossHp})`;
                    segment.style.flex = `0 0 ${flexBasis}`;
                    segment.style.height = '100%';
                    hpContainer.appendChild(segment);
                }
            } else {
                // 이미 동일한 개수의 세그먼트가 있으면 상태만 업데이트
                const segments = hpContainer.querySelectorAll('.hp-segment');
                segments.forEach((seg, i) => {
                    if (i >= currentBossHp) {
                        seg.classList.add('damaged');
                    } else {
                        seg.classList.remove('damaged');
                    }
                });
            }
        }

        // 텍스트 업데이트 (현재 체력 / 최대 체력)
        if (bossText) bossText.innerText = `${currentBossHp} / ${maxBossHp}`;
    }

    // 2. 데이터 준비
    const lifeBreadCnt = (typeof inventory !== 'undefined' && inventory.lifeBread) ? inventory.lifeBread : 0;
    const heartIcon = playerHearts > 0 ? "❤️" : "💔";
    const isDanger = (playerHearts <= 2);

    // 생명의 떡 버튼 HTML (보스전 전용 - 흰색 숫자)
    const lifeBreadBtnHtml = `
        <span class="hardship-life-bread-btn" onclick="event.stopPropagation(); useBattleItem('lifeBread')"
              style="margin-left:6px;">
            🍞 <span style="margin-left:4px; font-weight:bold; color:#fff;">${lifeBreadCnt}</span>
        </span>
    `;

    // 3. UI 렌더링

    // [A] 보스전 화면 (아이디 player-hearts 유지 중요!)
    const heartDisplay = document.querySelector('.heart-display');
    if (heartDisplay) {
        heartDisplay.innerHTML = `
            <div style="display:flex; align-items:center; justify-content:center;">
                <span style="font-size:1.2rem;">${heartIcon}</span> 
                <span id="player-hearts" style="font-weight:bold; margin-left:5px;">${playerHearts}</span>
                <span style="font-size:0.8rem; color:#bdc3c7; margin-left:3px;"> / ${maxPlayerHearts}</span>
                ${lifeBreadBtnHtml}
            </div>
        `;
        applyDangerEffect(heartDisplay, isDanger);
    }

    // [B] 훈련 모드 헤더 (아이디 training-hearts 유지 중요!)
    const trainingHeartEl = document.getElementById('training-hearts');
    if (trainingHeartEl) {
        const parent = trainingHeartEl.parentElement;
        if (parent) {
            parent.style.display = "flex";
            parent.style.alignItems = "center";
            parent.style.justifyContent = "center";

            // ★ 핵심: 갱신할 때 id="training-hearts"를 반드시 다시 적어줘야 다음에도 찾을 수 있습니다.
            parent.innerHTML = `
                ${heartIcon} <span id="training-hearts" style="margin-left:5px; font-weight:bold; color:#2c3e50;">${playerHearts}</span>
                <span class="hardship-life-bread-btn" onclick="event.stopPropagation(); useBattleItem('lifeBread')" style="margin-left:6px;">🍞 <span style="margin-left:4px; font-weight:bold; color:#111;">${lifeBreadCnt}</span></span>
            `;
            applyDangerEffect(parent, isDanger);
        }
    }
}

// [보조] 위기 상황 효과 함수
function applyDangerEffect(element, isDanger) {
    if (!element) return;
    if (isDanger && playerHearts > 0) {
        element.style.animation = "pulse 0.5s infinite";
        if (element.querySelector('#player-hearts')) element.querySelector('#player-hearts').style.color = "#ff4757";
        if (element.querySelector('#training-hearts')) element.querySelector('#training-hearts').style.color = "#ff4757";
    } else {
        element.style.animation = "none";
        if (element.querySelector('#player-hearts')) element.querySelector('#player-hearts').style.color = "";
        if (element.querySelector('#training-hearts')) element.querySelector('#training-hearts').style.color = "#2c3e50";
    }
}

/* [시스템] 부활 관련 함수 (비용 차등 적용) */
let currentReviveCost = 300; // 현재 부활 비용 저장용 변수

/* [수정] 부활 모달 표시 함수 (ID 불일치 문제 해결) */
function showReviveModal() {
    // 1. 현재 스테이지 ID 확인
    const sId = String(window.currentStageId);

    // 2. 비용 계산 (일반:150, 중간:300, 보스:500)
    if (sId.includes('mid')) {
        currentReviveCost = 300;
    } else if (sId.includes('boss')) {
        currentReviveCost = 500;
    } else {
        currentReviveCost = 150;
    }

    // 3. UI 텍스트 업데이트 (계산원이 가격표를 바꿔치는 부분)

    // (A) 설명글 업데이트
    const descText = document.getElementById('revive-cost-text');
    if (descText) {
        descText.innerText = currentReviveCost;

        // 색상 강조
        if (currentReviveCost >= 500) descText.style.color = "#e74c3c"; // 빨강
        else if (currentReviveCost >= 300) descText.style.color = "#e67e22"; // 주황
        else descText.style.color = "#2c3e50"; // 기본
    }

    // (B) 버튼 텍스트 업데이트 (이 부분이 핵심!)
    const btnText = document.getElementById('revive-btn-cost');
    if (btnText) {
        btnText.innerText = currentReviveCost;
    }

    // 4. 모달 창 띄우기
    const modal = document.getElementById('revive-modal');
    if (modal) {
        modal.style.display = 'flex';
        // 부드럽게 나타나는 효과
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.opacity = '1';
            modal.style.transition = 'opacity 0.3s';
        }, 10);
    }
}

function giveUpBattle() {
    document.getElementById('revive-modal').style.display = 'none';
    alert(t('alert_defeat'));
    quitGame(isFocusedTrainingSession() ? 'home' : 'map');
}

/* [수정] 부활 함수 (Step 4 재시동 기능 탑재) */
function revivePlayer() {
    // 안전장치: 혹시라도 변수가 정의되지 않았을 경우 기본값 300
    const cost = (typeof currentReviveCost !== 'undefined') ? currentReviveCost : 300;

    // 1. 보석 부족 체크
    if (myGems < cost) {
        alert(t('alert_revive_no_gems', { cost }));
        return;
    }

    // 2. 결제 및 부활 처리
    myGems -= cost;
    updateGemDisplay();

    // 체력 완전 회복
    playerHearts = maxPlayerHearts;
    updateBattleUI();

    // 모달(팝업) 닫기
    const modal = document.getElementById('revive-modal');
    if (modal) modal.style.display = 'none';

    // ====================================================
    // [★ 핵심 수리] 멈춰있던 Step 4 엔진 다시 켜기
    // ====================================================
    if (currentStep === 4) {
        // 이미 0.1초 딜레이 같은 건 필요 없으니 바로 출발시킵니다.
        // 이 함수가 두루마리를 다시 내려오게 만듭니다.
        startScrollStep();
    }

    // 효과음 재생
    if (typeof SoundEffect !== 'undefined' && SoundEffect.playLevelUp) {
        SoundEffect.playLevelUp();
    }

    alert(t('alert_revive_success', { cost }));
}

/* [시스템] 자동 저장 및 불러오기 기능 */

// 1. 토스트 알림 띄우기
function showToast(message) {
    const toast = document.getElementById("toast-notification");
    toast.innerText = message;
    toast.className = "show";

    // 2초 뒤에 사라짐
    setTimeout(function () {
        toast.className = toast.className.replace("show", "");
    }, 2000);
}

// 2. 체크포인트 저장 (5구절마다)
function saveBattleCheckpoint() {
    const saveData = {
        stageId: window.currentStageId,   // 현재 스테이지
        index: currentVerseIdx,           // 현재 몇 번째 구절인지
        partIndex: (typeof currentBossPartIndex === 'number') ? currentBossPartIndex : 0,
        hp: playerHearts,                 // ★ 현재 체력 그대로 저장
        maxHp: maxPlayerHearts,
        bossHp: currentBossHp,
        timestamp: Date.now()
    };

    localStorage.setItem('kingsRoad_checkpoint', JSON.stringify(saveData));
    showToast(t('toast_progress_saved', { n: currentVerseIdx + 1 }));
}

// 3. 저장 데이터 삭제 (클리어하거나 죽어서 나갈 때)
function clearCheckpoint() {
    localStorage.removeItem('kingsRoad_checkpoint');
}

/* [수정] 게임 종료/포기 (나가기 시 밀린 팝업 확인 기능 추가) */
function quitGame(destination = 'map') {
    const targetScreen = (destination === 'home') ? 'home' : 'map';
    window.isTrainingMode = false; // 🌟 [추가] 포기하고 나갈 때는 훈련 모드 스위치 확실히 끄기!
    if (typeof resetHardshipSessionState === 'function') {
        resetHardshipSessionState();
    }
    window.isHardshipMode = false;
    window.isGamePlaying = false; // ★ 핵심 방어막: 게임 종료 선언! 유령 타이머 차단!
    window.trainingMode = null;
    // 1. 스크롤 게임 정지 (안전장치)
    if (typeof scrollGame !== 'undefined' && scrollGame.animId) {
        cancelAnimationFrame(scrollGame.animId);
    }
    // ★ [버그 픽스] 찌꺼기 UI 청소 (부서진 하트, 힌트 창 등)
    document.querySelectorAll('.damage-heart-effect').forEach(el => el.remove());
    const hintModal = document.getElementById('hint-modal');
    if (hintModal) hintModal.remove();

    // 2. 전투 화면 정리
    const gameScreen = document.getElementById('game-screen');
    if (gameScreen) {
        gameScreen.classList.remove('active', 'mode-training', 'is-training-mode', 'mode-hardship');
    }
    // ★ [버그 픽스] 훈련/고난 모드가 boss-avatar에 설정한 display:none 인라인 스타일 초기화.
    // 다음에 보스전이 시작될 때 용이 정상적으로 나타나도록 합니다.
    const quitBossAvatar = document.querySelector('.boss-avatar');
    if (quitBossAvatar) quitBossAvatar.style.display = '';

    // 3. 모달 닫기 (안전장치)
    const quitModal = document.getElementById('quit-modal');
    if (quitModal) {
        quitModal.classList.remove('active'); // 통일!
        quitModal.style.display = ''; // 혹시라도 걸려있을지 모를 족쇄(inline style) 해제
    }

    // 4. 전투 데이터 및 진행 상황 완전 초기화
    window.currentBattleData = null;
    window.currentVerseData = null;
    window.currentStageId = null;
    window.currentVerseIdx = 0;
    window.wrongCount = 0;



    // 6. 목적지 화면으로 이동
    if (targetScreen === 'home') {
        if (typeof goHome === 'function') {
            goHome();
        }
    } else {
        if (typeof goMap === 'function') {
            goMap();
        } else {
            document.getElementById('map-screen').classList.add('active');
            if (typeof renderChapterMap === 'function') {
                renderChapterMap(currentChapterId || window.currentBattleChapter || 1);
            }
        }
    }

    // ★ [NEW] 7. 전투 종료 후 밀린 업적 팝업이 있다면 보여줘!
    // 0.5초 뒤에 실행 (화면 전환이 완전히 끝난 뒤 자연스럽게)
    setTimeout(() => {
        if (typeof tryShowMilestone === 'function') {
            tryShowMilestone();
        }
    }, 500);
}

/* [시스템: 성전 화면 업데이트 (이미지 & 버튼 상태)] */
function updateCastleView() {
    // 1. 데이터 가져오기
    const data = castleBlueprints[Math.min(myCastleLevel, castleBlueprints.length - 1)];
    const nextData = castleBlueprints[myCastleLevel + 1]; // 다음 단계 정보

    // 2. 텍스트 & 이미지 업데이트
    document.getElementById('castle-name').innerText = `Lv.${data.level} ${data.name}`;
    document.getElementById('castle-desc').innerHTML = data.desc;

    const imgTag = document.getElementById('castle-img');
    imgTag.src = data.img; // 이미지 파일 연결! (파일 없으면 엑박 대신 🚧 뜸)

    // 3. 건설 버튼 상태 관리 logic
    const btn = document.getElementById('btn-build');

    if (!nextData) {
        // 만렙
        btn.innerText = t('achievement_conquered');
        btn.disabled = true;
        btn.style.background = "#2c3e50";
        btn.style.cursor = "default";
        return;
    }

    const canBuild = myGems >= nextData.cost;

    if (canBuild) {
        btn.innerText = t('btn_castle_build_cost', { cost: nextData.cost });
        btn.disabled = false;
        btn.style.background = "#2ecc71"; // 초록색 (가능)
        btn.style.cursor = "pointer";
        btn.style.boxShadow = "0 4px 0 #27ae60";
        btn.onclick = tryBuildCastle; // 클릭 이벤트 연결
    } else {
        btn.innerText = t('btn_castle_build_locked_cost', { cost: nextData.cost });
        btn.disabled = true;
        btn.style.background = "#95a5a6"; // 회색 (불가)
        btn.style.cursor = "not-allowed";
        btn.style.boxShadow = "none";
    }
}

/* =========================================
   [시스템: 데이터 저장 및 불러오기 (Local Storage)]
   ========================================= */

/* [수정] 게임 저장하기 (닉네임 포함) */
function saveGameData() {
    // 리셋 중에는 저장을 중단합니다.
    if (window.isResetting) {
        console.log('저장 중단: 리셋 플래그 활성화');
        return;
    }

    const saveData = {
        version: GAME_VERSION, // ★ [정식 배포] 버전 정보 추가
        level: myCastleLevel,
        gems: myGems,
        maxHearts: purchasedMaxHearts, // 순수 체력만 저장

        // ★ 닉네임 / 지파 정보 추가
        nickname: myNickname,
        tribe: (typeof myTribe !== 'undefined') ? myTribe : 0,
        dept: (typeof myDept !== 'undefined') ? myDept : 0,
        tag: myTag,
        playerId: myPlayerId,
        // 🌟 [건망증 치료] 저장할 때 현재 인증키를 빼먹지 않도록 꼭 챙겨 넣습니다!
        sessionToken: window.currentSessionToken || (JSON.parse(localStorage.getItem('kingsRoadSave') || "{}")).sessionToken,

        // 나머지 데이터 유지 (항상 자유여행 데이터 저장)
        inv: inventory,
        missions: missionData,
        mastery: activeMode === 'kings' ? _freeStageMastery : stageMastery,
        clearDate: activeMode === 'kings' ? _freeStageClearDate : stageClearDate,
        lastClear: activeMode === 'kings' ? _freeStageLastClear : stageLastClear,
        nextEligibleTime: stageNextEligibleTime, // 구버전 호환용
        timedBonus: stageTimedBonus, // 구버전 호환용
        reviewStep: activeMode === 'kings' ? _freeStageReviewStep : stageReviewStep,
        nextReviewTime: activeMode === 'kings' ? _freeStageNextReviewTime : stageNextReviewTime,
        pendingRetry: stagePendingRetry,
        // dailyAttempts 제거됨
        achievementStatus: achievementStatus,
        memoryLevels: stageMemoryLevels,
        // 통계 데이터 포함
        stats: userStats,
        lastClaimTime: lastClaimTime,
        clearedStages: Object.keys(activeMode === 'kings' ? _freeStageMastery : stageMastery),
        lastPlayed: localStorage.getItem('lastPlayedDate'),
        streak: localStorage.getItem('streakDays'),
        leagueData: leagueData,
        boosterData: boosterData,
        hardshipAddressClearHistory: hardshipAddressClearHistory,
        hardshipMemoryClearHistory: hardshipMemoryClearHistory,
        hardshipEnduranceClearHistory: hardshipEnduranceClearHistory,
        // ★ [게임 모드]
        activeMode: activeMode,
        kingsMode: {
            mastery: kingsRoadData.mastery,
            clearDate: kingsRoadData.clearDate,
            lastClear: kingsRoadData.lastClear,
            reviewStep: kingsRoadData.reviewStep,
            nextReviewTime: kingsRoadData.nextReviewTime,
            stepHistory: kingsRoadData.stepHistory
        },
        updatedAt: Date.now() // [Firestore] 충돌 해결용 타임스탬프
    };

    clearTimeout(window._saveDebounceTimer);
    window._saveDebounceTimer = setTimeout(() => {
        localStorage.setItem('kingsRoadSave', JSON.stringify(saveData));

        const missionModal = document.getElementById('mission-modal');
        const missionScreen = document.getElementById('mission-screen');
        const isMissionOpen = !!(
            (missionModal && missionModal.classList.contains('active')) ||
            (missionScreen && missionScreen.classList.contains('active'))
        );

        if (isMissionOpen) {
            if (typeof renderMissionList === 'function') {
                renderMissionList(currentMissionTab || 'daily');
            } else if (typeof updateMissionUI === 'function') {
                updateMissionUI();
            }
        }
    }, 0);
}


/* =========================================
   Firestore 저장 / 로드
   ========================================= */

/**
 * Firebase 인증 완료 후 한 번 호출.
 * Firestore 데이터와 localStorage 데이터를 비교해 더 최신 데이터를 적용하고,
 * Firestore에 데이터가 없으면 localStorage 데이터를 마이그레이션(1회 업로드)한다.
 */
async function initFirestoreSync() {
    if (typeof db === 'undefined' || !db) return;
    if (typeof myPlayerId === 'undefined' || !myPlayerId) return;

    const remoteData = await loadFromFirestore();
    const localRaw = localStorage.getItem('kingsRoadSave');
    const localData = localRaw ? (() => { try { return JSON.parse(localRaw); } catch(e) { return null; } })() : null;

    // 백업 복원 직후 리로드된 경우 — 로컬 데이터를 서버로 밀어내고 서버 덮어쓰기 건너뜀
    if (localStorage.getItem('forceSyncAfterLoad') === 'true') {
        localStorage.removeItem('forceSyncAfterLoad');
        window.firestoreSyncPending = false;
        if (localData) {
            console.log('[Firestore] 백업 복원 후 강제 업로드: localStorage → Firestore');
            await syncToFirestore();
        }
        return;
    }

    if (!remoteData) {
        // pendingRecovery 확인: 세션 충돌로 초기화된 유저 자동 복구
        const recovered = await checkPendingRecovery();
        if (recovered) return;

        // Firestore에 데이터 없음 → localStorage 데이터 마이그레이션
        window.firestoreSyncPending = false;
        if (localData) {
            console.log('[Firestore] 최초 마이그레이션: localStorage → Firestore');
            await syncToFirestore();
        }
        return;
    }

    // 타임스탬프 비교: 로컬이 더 최신이면 Firestore 덮어쓰기 건너뜀
    const localUpdatedAt  = (localData  && localData.updatedAt)  ? localData.updatedAt  : 0;
    const remoteUpdatedAt = (remoteData && remoteData.updatedAt) ? remoteData.updatedAt : 0;

    if (localUpdatedAt > remoteUpdatedAt) {
        // 로컬이 더 최신 (게임 시작 직후 행동 등) → Firestore로 업로드
        console.log('[Firestore] 로컬 데이터가 더 최신 → Firestore 업로드');
        window.firestoreSyncPending = false;
        await syncToFirestore();
        return;
    }

    // Firestore가 권위(authority) — Firestore 데이터를 적용
    console.log('[Firestore] 서버 데이터 적용 중...');
    localStorage.setItem('kingsRoadSave', JSON.stringify(remoteData));
    window.firestoreSyncPending = false;
    loadGameData();
    if (typeof renderChapterMap === 'function') renderChapterMap();
    if (typeof updateCastleView  === 'function') updateCastleView();
}

/**
 * 세션 충돌로 초기화된 유저의 데이터를 자동 복구한다.
 * Firestore pendingRecovery/{tag} 문서가 있으면 해당 데이터를 현재 계정에 복원한다.
 * @returns {boolean} 복구 성공 여부
 */
async function checkPendingRecovery() {
    if (typeof db === 'undefined' || !db) return false;
    if (typeof myTag === 'undefined' || !myTag || myTag === '0000') return false;

    try {
        const doc = await db.collection('pendingRecovery').doc(myTag).get();
        if (!doc.exists) return false;

        const recoveryData = doc.data();
        // pendingRecovery 메타 필드 제거
        delete recoveryData.pendingRecovery;
        delete recoveryData.recoveryCreatedAt;

        // 현재 세션 토큰으로 교체 (세션 가드 오작동 방지)
        recoveryData.playerId = myPlayerId;
        recoveryData.sessionToken = window.currentSessionToken || recoveryData.sessionToken;
        if (typeof GAME_VERSION !== 'undefined') recoveryData.version = GAME_VERSION;

        console.log('[Recovery] pendingRecovery 발견! 데이터 복구 중...', recoveryData.nickname, recoveryData.tag);

        localStorage.setItem('kingsRoadSave', JSON.stringify(recoveryData));
        window.firestoreSyncPending = false;
        loadGameData();

        // 복구 데이터를 Firestore 현재 계정에 저장
        await syncToFirestore();

        // pendingRecovery 문서 삭제 (1회용)
        await db.collection('pendingRecovery').doc(myTag).delete();

        if (typeof renderChapterMap === 'function') renderChapterMap();
        if (typeof updateCastleView === 'function') updateCastleView();
        if (typeof updateGemDisplay === 'function') updateGemDisplay();
        if (typeof updateResourceUI === 'function') updateResourceUI();
        if (typeof updateProfileUI === 'function') updateProfileUI();

        alert(t('alert_data_recovered', { nick: recoveryData.nickname, tag: recoveryData.tag }));
        return true;
    } catch (e) {
        console.warn('[Recovery] pendingRecovery 복구 실패:', e);
        return false;
    }
}

/**
 * 현재 메모리 상태를 Firestore saves/{myPlayerId} 에 저장한다.
 * - 네트워크가 없거나 db/myPlayerId 미준비 시 조용히 종료.
 * - 기존 saveGameData()는 localStorage 캐시 역할을 계속 수행.
 */
async function syncToFirestore() {
    if (typeof firebase === 'undefined') return;
    if (typeof myPlayerId === 'undefined' || !myPlayerId) return;

    // saveGameData()가 localStorage에 방금 저장한 데이터를 재활용
    const raw = localStorage.getItem('kingsRoadSave');
    if (!raw) return;

    let saveData;
    try { saveData = JSON.parse(raw); } catch (e) { return; }

    try {
        const saveGameDataSecure = firebase.app().functions('asia-northeast3').httpsCallable('saveGameDataSecure');
        await saveGameDataSecure(saveData);
    } catch (e) {
        const errMsg = (e && (e.message || e.code)) ? `${e.code || ''} ${e.message || ''}`.trim() : String(e);
        console.warn('[syncToFirestore] 저장 실패:', errMsg);
        // 저장 실패 시 사용자에게 알림 (데이터 유실 방지)
        const existing = document.getElementById('sync-fail-toast');
        if (existing) existing.remove();
        const toast = document.createElement('div');
        toast.id = 'sync-fail-toast';
        toast.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#c0392b;color:#fff;padding:10px 18px;border-radius:8px;font-size:12px;z-index:99999;text-align:center;max-width:90vw;word-break:break-all;';
        toast.textContent = t('toast_server_save_fail_short', { msg: errMsg });
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 8000);
    }
}

/**
 * Firestore saves/{myPlayerId} 에서 데이터를 불러온다.
 * @returns {Object|null} 저장 데이터 또는 null (문서 없음 / 오류)
 */
async function loadFromFirestore() {
    if (typeof db === 'undefined' || !db) return null;
    if (typeof myPlayerId === 'undefined' || !myPlayerId) return null;

    try {
        const doc = await db.collection('saves').doc(myPlayerId).get();
        if (doc.exists) return doc.data();
        return null;
    } catch (e) {
        console.warn('[loadFromFirestore] 로드 실패:', e);
        return null;
    }
}


/* [수정됨] 통합 자원 UI 업데이트 (지파 색상 반영) */
function updateGemDisplay() {
    // 1. 인벤토리 파악
    const lifeBreadCnt = (typeof inventory !== 'undefined' && inventory.lifeBread) ? inventory.lifeBread : 0;

    // 2. 현재 내 지파 정보 가져오기 (색상 적용을 위해)
    const currentTribe = TRIBE_DATA[myTribe] || TRIBE_DATA[0];

    // 3. 지파 색상에 맞춘 보석 아이콘 생성 (네온 효과)
    // '💎' 대신 지파의 고유 색상(core)으로 빛나는 '✦' 아이콘 사용
    const gemIcon = `<span style="color:${currentTribe.core}; text-shadow:0 0 5px ${currentTribe.glow}; font-size:1.1rem;">💎</span>`;

    // 4. 표시할 HTML 구성 (지파 보석 + 숫자)
    // toLocaleString()을 써서 1,000 단위 쉼표 추가
    const resourceHtml = `${gemIcon} ${myGems.toLocaleString()} <span style="opacity:0.3; margin:0 3px;">|</span> 🍞 ${lifeBreadCnt} <span style="opacity:0.3; margin:0 3px;">|</span> ❤️ ${maxPlayerHearts}`;

    // 5. [맵 화면] 헤더 업데이트 (ID로 안전하게 찾기)
    const mapRes = document.getElementById('header-resources');
    if (mapRes) mapRes.innerHTML = resourceHtml;

    // 6. [상점 화면] 내 보석 업데이트
    const shopRes = document.getElementById('shop-user-gems');
    if (shopRes) shopRes.innerHTML = `${gemIcon} ${myGems.toLocaleString()}`;

    // 7. [홈 화면] 성전 뷰도 같이 갱신 (켜져 있다면)
    const homeScreen = document.getElementById('home-screen');
    if (homeScreen && homeScreen.classList.contains('active') && typeof updateCastleView === 'function') {
        updateCastleView();
    } else {
        updateTempleUpgradeNotification();
    }
}

/* =========================================
   [시스템: 일반 훈련 모드 (6-Step System)]
   ========================================= */

let currentStep = 1; // 1~6단계
let trainingVerseData = null; // 현재 학습 중인 절 데이터
let stepSequence = []; // 이번에 진행할 단계 목록 (예: [1, 2] 또는 [2, 5])
let sequenceIndex = 0; // 목록 중 몇 번째인지 (0, 1, 2...)

// [유틸] 단어 비교용 정규화 (보이지 않는 공백/제로폭 제거)
function normalizeChunkText(text) {
    return String(text)
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

/* [수정] 훈련 시작 함수 (phase 시스템 제거) */
function startTraining(stageId, mode = 'normal') {
    window.isGamePlaying = true; // ★ 게임 시작! 스위치 ON
    const isForceFullNew = (mode === 'full-new');
    // ★ chNum을 여기서 미리 정의 (함수 전체에서 쓰임)
    const m = String(stageId).match(/^(\d+)(?:-(\d+|.+))?/);
    const chNum = m ? parseInt(m[1], 10) : 0;
    const verseNum = (m && m[2] && /^\d+$/.test(m[2])) ? parseInt(m[2], 10) : 1;

    // ============================================
    // [이미 클리어했는지 판단]
    // ============================================
    let stageData = null;
    if (stageMastery[stageId] && stageMastery[stageId] > 0) {
        // 이미 클리어했으면 그냥 진행 (게임은 할 수 있되, 보상은 제한될 수 있음)
    } else {
        const chData = gameData.find(c => c.id === chNum);
        if (chData) {
            stageData = chData.stages.find(s => s.id === stageId);
        }
    }

    // ============================================
    // [복습 모드 판단: Step 1~5 완료했나?]
    // ============================================
    const isFullStepsComplete = isStageFullyLearned(stageId, stageData);
    window.isReplayMode = isFullStepsComplete && !isForceFullNew;

    // ============================================
    // [모드 결정: 복습 vs 전체 학습]
    // ============================================
    const courses = {
        'quick': [1, 5],
        'full': [1, 2, 3, 4, 5],
        'normal': [1, 2, 3, 4, 5],
        'full-new': [1, 2, 3, 4, 5]
    };
    if (window.isReplayMode) {
        stepSequence = courses[mode] || courses['full'];
    } else {
        // 미완료 스테이지: quick은 [1,5], 그 외는 전체
        if (mode === 'quick') {
            stepSequence = [1, 5];
        } else {
            mode = 'full-new';
            stepSequence = [1, 2, 3, 4, 5];
        }
    }

    // ----------------------------------------------------
    // [공통] 게임 초기화 및 시작
    // ----------------------------------------------------
    window.currentStageId = stageId;
    window.trainingMode = mode;
    sequenceIndex = 0;
    currentStep = stepSequence[0];

    // Step 2, Step 5 파트 분할 데이터 완벽 초기화
    window.currentStep2PartIndex = undefined;
    window.step2Parts = undefined;
    window.currentStep5PartIndex = undefined;
    window.step5Parts = undefined;

    // [데이터 로드]
    if (bibleData[chNum] && bibleData[chNum][verseNum - 1]) {
        trainingVerseData = getVerseData(chNum, verseNum - 1);
    } else {
        alert(t('alert_data_load_error')); return;
    }

    // 모드 선택 시트 닫기
    if (typeof closeStageSheet === 'function') closeStageSheet();

    // ✂️============== [안전하게 포장된 화면 전환 콜백] ==============✂️
    const startStageAction = () => {
        try {
            console.log("1. ✅ 애니메이션 종료! 게임 세팅을 시작합니다.");

            // 🌟 시트 닫기를 콜백 안으로 이동 (보스전과 똑같이 꼬임 방지)
            if (typeof closeStageSheet === 'function') closeStageSheet();

            // (맵 숨기기/게임화면 활성화는 startStageWithTransition 호출 전에 이미 완료됨)
            console.log("2. ✅ 화면 클래스 전환 완료");

            if (typeof recalculateMaxHearts === 'function') recalculateMaxHearts();

            // 전역 변수 maxPlayerHearts가 혹시 undefined일 경우를 대비한 안전 장치
            playerHearts = (typeof maxPlayerHearts !== 'undefined') ? maxPlayerHearts : 5;

            if (typeof updateBattleUI === 'function') updateBattleUI();


            stageStartTime = Date.now();
            wrongCount = 0;

            const totalStepEl = document.getElementById('total-step-num');
            if (totalStepEl && typeof stepSequence !== 'undefined') {
                totalStepEl.innerText = stepSequence.length;
            }

            console.log("3. ✅ loadStep 호출 전");
            if (typeof loadStep === 'function') loadStep();

            console.log("4. ✅ 게임 시작 완료! 토스트 띄우기");
            if (typeof mode !== 'undefined') {
                if (mode === 'quick') {
                    showReadAloudToast(t('toast_read_aloud_quick'));
                } else {
                    showReadAloudToast(t('toast_read_aloud'));
                }
            }

        } catch (error) {
            // 🚨 화면이 넘어가지 않고 멈춘다면, 여기서 범인을 정확히 알려줍니다!
            console.error("🚨 startStageAction 실행 중 치명적 에러 발생:", error);
            alert(t('alert_game_switch_error'));
        }
    };

    // [성능] 애니메이션 시작 전에 맵을 숨겨 불필요한 렌더링을 차단
    const _mapScreen = document.getElementById('map-screen');
    const _gameScreen = document.getElementById('game-screen');
    if (_mapScreen) _mapScreen.classList.remove('active');
    if (_gameScreen) {
        _gameScreen.classList.add('active');
        _gameScreen.classList.add('mode-training');
    }

    // 🌟 마지막으로, 잘 싼 보따리를 애니메이션 함수에 던져줍니다.
    startStageWithTransition(chNum, verseNum, startStageAction);
}

// 2. 단계별 화면 로드
function loadStep() {
    if (window._step1FinishTimer) {
        clearTimeout(window._step1FinishTimer);
        window._step1FinishTimer = null;
    }
    const currentOrder = sequenceIndex + 1;
    const totalCount = stepSequence.length || 1; // 0으로 나누기 방지

    // 1. 텍스트 업데이트 (예: Step 1/2)
    const stepNumEl = document.getElementById('current-step-num');
    if (stepNumEl) stepNumEl.innerText = currentOrder;
    updateTrainingCycleIndicator();

    // 2. 진행바 게이지 계산 (전체 단계 수에 비례하여 꽉 차게)
    const percent = (currentOrder / totalCount) * 100;
    const barEl = document.getElementById('step-progress-fill');
    if (barEl) barEl.style.width = `${percent}%`;

    const field = document.querySelector('.battle-field');
    const control = document.querySelector('.battle-control');

    // 화면 초기화
    field.innerHTML = "";
    control.innerHTML = "";

    // 👉 [개선된 코드] 현재 스테이지 ID에서 장과 절을 더 안전하게 뽑아냅니다.
    let verseLabel = "";
    if (window.currentStageId) {
        const stageIdStr = String(window.currentStageId);

        // mid나 boss가 포함되어 있으면 장/절 표시를 하지 않습니다.
        if (!stageIdStr.includes('mid') && !stageIdStr.includes('boss')) {
            if (stageIdStr.includes('-')) {
                const parts = stageIdStr.split('-');
                const chapterNum = parts[0];
                const verseNum = parts[1];
                verseLabel = `<span style="color:#f39c12; font-weight:bold; margin-right:8px;">[계 ${chapterNum}:${verseNum}]</span>`;
            } else {
                verseLabel = `<span style="color:#f39c12; font-weight:bold; margin-right:8px;">[스테이지 ${stageIdStr}]</span>`;
            }
        }
    }

    // ----------------------------------------------------
    // [Step 1] 각인 모드 (속도 조절: 낭독 속도 + 초성 힌트)
    // ----------------------------------------------------
    if (currentStep === 1) {
        field.innerHTML = `
            <div class="verse-indicator">${verseLabel}${t('hardship_step1_indicator')}</div>
            
            <div style="position: relative; margin-bottom: 30px;">
                <div class="reading-card" id="tap-reading-card" 
     style="width: 100%; box-sizing: border-box; cursor:pointer; min-height:150px; display:flex; flex-wrap:wrap; align-content:flex-start; justify-content:center; gap:8px; line-height: 1.8; user-select: none; position: relative; z-index: 2;">
</div>
                <div id="pouring-light" style="position: absolute; top: 100%; left: 50%; transform: translateX(-50%); width: 40px; height: 0; background: linear-gradient(to bottom, #f1c40f 30%, rgba(255,255,255,0)); opacity: 0; transition: all 0.8s ease-in-out; z-index: 1;"></div>
            </div>

            <div style="text-align: center; margin-bottom: 20px;">
                <svg id="head-silhouette" viewBox="0 0 24 24" width="80" height="80" fill="#bdc3c7" style="transition: fill 1s ease, filter 1s ease;">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                </svg>
            </div>
        `;

        // ★ [추가] 1. 초성 추출 도구 (한글: 초성 자모, 영어: 구 앞 첫 글자만)
        const getChosung = (str) => {
            const cho = ["ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
            const hasKorean = [...str].some(c => { const code = c.charCodeAt(0) - 44032; return code > -1 && code < 11172; });
            if (!hasKorean) {
                return str.trim().split(/\s+/).map(w => w[0] || '').join(' ');
            }
            let result = "";
            for (let i = 0; i < str.length; i++) {
                let code = str.charCodeAt(i) - 44032;
                if (code > -1 && code < 11172) result += cho[Math.floor(code / 588)];
                else result += str.charAt(i);
            }
            return result;
        };

        // ★ [추가] 2. 글자수만큼 블록(■)으로 마스킹하는 도구
        const getMasked = (str) => str.replace(/[가-힣a-zA-Z0-9]/g, '■');

        const card = document.getElementById('tap-reading-card');
        window.chunksToReveal = trainingVerseData.chunks;
        window.revealIndex = 0;
        let autoFillInterval = null;
        let isChosungMode = false; // ★ 초성 모드 상태 변수

        // 미리보기 (블라인드 글씨) 생성
        window.chunksToReveal.forEach((chunk, idx) => {
            const span = document.createElement('span');
            // ★ 원본, 초성, 마스킹 데이터를 span 태그 안에 꽁꽁 숨겨둡니다.
            span.dataset.original = chunk;
            span.dataset.chosung = getChosung(chunk);
            span.dataset.masked = getMasked(chunk);

            span.innerText = span.dataset.masked; // 처음엔 완벽히 가림
            span.id = `chunk-${idx}`;
            span.style.color = "#3a4f6a";
            span.style.fontSize = "1.3rem";
            span.style.opacity = "1";
            span.style.transition = "all 0.3s ease-out";
            card.appendChild(span);
        });

        control.innerHTML = `
            <div id="step1-chosung-row" style="display:flex; justify-content:flex-end; margin-bottom:1px;"></div>
            <div id="step1-controls" style="display: flex; gap: 10px; justify-content: center; margin-bottom: 10px;"></div>
            <button class="btn-attack" id="btn-step1-next" onclick="nextStep()" style="display:none; background-color:#2ecc71; margin-top:10px; width: 100%;">${t('btn_step1_next')}</button>
            <div id="step1-info-wrap" style="margin-top:8px;">
                <button class="hardship-endurance-info-btn" id="btn-step1-info" onclick="toggleStep1Info()">${t('step1_info_title')}</button>
                <div id="step1-info-panel" class="hardship-endurance-info-panel" style="display:none;">${t('step1_info_body')}</div>
            </div>
        `;

        const controlsContainer = document.getElementById('step1-controls');

        const chosungBtn = document.createElement('button');
        chosungBtn.id = 'btn-toggle-chosung';
        chosungBtn.style.cssText = 'background:#f39c12; color:#fff; border:none; border-radius:8px; font-size:0.78rem; padding:4px 10px; cursor:pointer; font-weight:bold;';
        chosungBtn.innerText = t('btn_chosung');
        chosungBtn.onclick = () => {
            isChosungMode = !isChosungMode;
            chosungBtn.innerText = isChosungMode ? t('btn_chosung_off') : t('btn_chosung');
            chosungBtn.style.background = isChosungMode ? '#e67e22' : '#f39c12';
            for (let i = window.revealIndex; i < window.chunksToReveal.length; i++) {
                const span = document.getElementById(`chunk-${i}`);
                if (span) span.innerText = isChosungMode ? span.dataset.chosung : span.dataset.masked;
            }
        };
        document.getElementById('step1-chosung-row').appendChild(chosungBtn);

        const fillOneChunk = () => {
            if (window.revealIndex >= window.chunksToReveal.length) {
                stopAutoFill();
                return;
            }

            const span = document.getElementById(`chunk-${window.revealIndex}`);
            if (span) {
                span.innerText = span.dataset.original; // ★ 단어가 공개될 때 숨겨둔 원본 텍스트로 교체!
                span.style.color = "#dce8f5";
                span.style.fontWeight = "bold";
                span.style.opacity = "1";
                span.style.fontSize = "1.5rem";
                span.style.transform = "scale(1.1)";
                setTimeout(() => {
                    span.style.transform = "scale(1)";
                    span.style.fontSize = "1.3rem";
                }, 200);
            }

            window.revealIndex++;

            if (window.revealIndex === window.chunksToReveal.length) {
                finishStep1Effect();
            }
        };

        const startAutoFill = (e) => {
            if (e && e.preventDefault) e.preventDefault();
            fillOneChunk();
            autoFillInterval = setInterval(fillOneChunk, 350);
        };

        const stopAutoFill = (e) => {
            if (e && e.preventDefault) e.preventDefault();
            if (autoFillInterval) {
                clearInterval(autoFillInterval);
                autoFillInterval = null;
            }
        };

        card.style.overflowY = 'hidden';
        card.style.maxHeight = 'none';
        card.style.cursor = 'pointer';
        card.style.padding = '20px 10px';
        card.style.boxSizing = 'border-box';

        const revealBtn = document.createElement('button');
        revealBtn.id = 'btn-reveal';
        revealBtn.className = 'btn-attack';
        revealBtn.style.flex = "1";
        revealBtn.innerText = t('btn_read');

        let longPressTimer = null;
        let longPressActive = false;
        let startX = 0, startY = 0;
        const MOVE_THRESHOLD = 10;

        revealBtn.addEventListener('pointerdown', (ev) => {
            ev.preventDefault();
            try { revealBtn.setPointerCapture && revealBtn.setPointerCapture(ev.pointerId); } catch (e) { }
            startX = ev.clientX; startY = ev.clientY;
            longPressActive = false;
            if (longPressTimer) clearTimeout(longPressTimer);
            longPressTimer = setTimeout(() => {
                longPressActive = true;
                revealBtn.classList.add('active');
                startAutoFill();
            }, 300);
        }, { passive: false });

        revealBtn.addEventListener('pointermove', (ev) => {
            const rect = revealBtn.getBoundingClientRect();
            const MARGIN = 10;
            const inside = (ev.clientX >= rect.left - MARGIN && ev.clientX <= rect.right + MARGIN &&
                ev.clientY >= rect.top - MARGIN && ev.clientY <= rect.bottom + MARGIN);
            if (!inside) {
                if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
                if (longPressActive) {
                    stopAutoFill();
                    longPressActive = false;
                    revealBtn.classList.remove('active');
                }
            }
        }, { passive: true });

        revealBtn.addEventListener('pointerup', (ev) => {
            ev.preventDefault();
            try { revealBtn.releasePointerCapture && revealBtn.releasePointerCapture(ev.pointerId); } catch (e) { }
            if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
            if (longPressActive) {
                stopAutoFill();
                revealBtn.classList.remove('active');
                longPressActive = false;
            } else {
                fillOneChunk();
            }
        });

        revealBtn.addEventListener('pointercancel', (ev) => {
            try { revealBtn.releasePointerCapture && revealBtn.releasePointerCapture(ev.pointerId); } catch (e) { }
            if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
            stopAutoFill();
            longPressActive = false;
            revealBtn.classList.remove('active');
        });

        // ★ [배치] 버튼들을 나란히 배치합니다.
        controlsContainer.appendChild(revealBtn);

        // ── 음성인식 섹션 ──────────────────────────────────────
        const voiceFeedbackDiv = document.createElement('div');
        voiceFeedbackDiv.id = 'step1-voice-feedback';
        voiceFeedbackDiv.style.cssText = 'margin-top:8px; text-align:center; font-size:0.95rem;';
        controlsContainer.parentNode.insertBefore(voiceFeedbackDiv, controlsContainer.nextSibling);

        const revealAll = () => {
            stopAutoFill();
            while (window.revealIndex < window.chunksToReveal.length) {
                const span = document.getElementById(`chunk-${window.revealIndex}`);
                if (span) {
                    span.innerText = span.dataset.original;
                    span.style.color = '#dce8f5';
                    span.style.fontWeight = 'bold';
                    span.style.opacity = '1';
                    span.style.fontSize = '1.3rem';
                }
                window.revealIndex++;
            }
        };

        const showVoiceResult = (score) => {
            voiceFeedbackDiv.innerHTML = '';
            if (score >= 80) {
                SoundEffect.playCorrect && SoundEffect.playCorrect();
                const msg = document.createElement('div');
                msg.style.cssText = 'color:#2ecc71; font-weight:bold; margin-bottom:6px;';
                msg.textContent = t('step1_voice_pass', { score });
                voiceFeedbackDiv.appendChild(msg);
                revealAll();
                setTimeout(() => finishStep1Effect(), 800);
            } else {
                SoundEffect.playWrong && SoundEffect.playWrong();
                const msg = document.createElement('div');
                msg.style.cssText = 'color:#e74c3c; margin-bottom:6px;';
                msg.textContent = t('step1_voice_fail', { score });
                voiceFeedbackDiv.appendChild(msg);

                const btnRow = document.createElement('div');
                btnRow.style.cssText = 'display:flex; gap:8px; justify-content:center;';

                const retryBtn = document.createElement('button');
                retryBtn.className = 'btn-attack';
                retryBtn.style.cssText = 'flex:1; background:#8e44ad;';
                retryBtn.textContent = t('step1_voice_retry');
                retryBtn.onclick = () => { voiceFeedbackDiv.innerHTML = ''; startStep1Speech(); };

                const skipBtn = document.createElement('button');
                skipBtn.className = 'btn-attack';
                skipBtn.style.cssText = 'flex:1; background:#7f8c8d;';
                skipBtn.textContent = t('step1_voice_skip');
                skipBtn.onclick = () => { voiceFeedbackDiv.innerHTML = ''; revealAll(); finishStep1Effect(); };

                btnRow.appendChild(retryBtn);
                btnRow.appendChild(skipBtn);
                voiceFeedbackDiv.appendChild(btnRow);
            }
            micBtn.disabled = false;
            micBtn.textContent = t('step1_voice_btn');
        };

        const startStep1Speech = () => {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                voiceFeedbackDiv.innerHTML = `<span style="color:#e74c3c;">${t('step1_voice_no_support')}</span>`;
                return;
            }
            micBtn.disabled = true;
            micBtn.textContent = t('step1_voice_listening');
            voiceFeedbackDiv.innerHTML = '';

            const recognition = new SpeechRecognition();
            recognition.lang = currentLang === 'en' ? 'en-US' : 'ko-KR';
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;

            let handled = false;
            const handle = (transcript) => {
                if (handled) return;
                handled = true;
                const verseText = (currentLang === 'en' && trainingVerseData.chunksEn && trainingVerseData.chunksEn.length)
                    ? trainingVerseData.chunksEn.join(' ')
                    : trainingVerseData.chunks.join(' ');
                const score = calcEnduranceSpeechScore(transcript, verseText);
                showVoiceResult(score);
            };

            recognition.onresult = (e) => handle(e.results[0][0].transcript);
            recognition.onerror = () => handle('');
            recognition.onnomatch = () => handle('');
            recognition.onend = () => { if (!handled) { handled = true; micBtn.disabled = false; micBtn.textContent = t('step1_voice_btn'); } };
            recognition.start();
        };

        const micBtn = document.createElement('button');
        micBtn.id = 'btn-step1-mic';
        micBtn.className = 'btn-attack';
        micBtn.style.cssText = 'flex:1; background:#8e44ad;';
        micBtn.textContent = t('step1_voice_btn');
        micBtn.onclick = startStep1Speech;
        controlsContainer.appendChild(micBtn);
        // ── 음성인식 섹션 끝 ────────────────────────────────────

        const finishStep1Effect = () => {
            stopAutoFill();
            revealBtn.disabled = true;

            micBtn.style.display = 'none';
            chosungBtn.style.display = 'none';
            voiceFeedbackDiv.innerHTML = '';

            card.style.transition = "box-shadow 0.5s, background 0.5s";
            card.style.boxShadow = "0 0 30px #f1c40f";
            card.style.backgroundColor = "#fff9c4";

            const spans = card.querySelectorAll('span');
            spans.forEach(s => {
                s.style.color = "#d35400";
                s.style.textShadow = "0 0 5px #f1c40f";
            });

            const pouringLight = document.getElementById('pouring-light');
            const headIcon = document.getElementById('head-silhouette');

            pouringLight.style.opacity = "1";
            pouringLight.style.height = "70px";

            setTimeout(() => {
                headIcon.style.fill = "#f1c40f";
                headIcon.style.filter = "drop-shadow(0 0 15px #f1c40f)";
            }, 600);

            // 읽기 버튼 → 다시하기 버튼으로 즉시 교체
            const restartBtn = document.createElement('button');
            restartBtn.className = revealBtn.className;
            restartBtn.style.flex = "1";
            restartBtn.innerText = t('btn_retry_perfect');
            restartBtn.disabled = true;
            restartBtn.onclick = () => { loadStep(); };
            if (revealBtn.parentNode) {
                revealBtn.parentNode.replaceChild(restartBtn, revealBtn);
            }
            setTimeout(() => { restartBtn.disabled = false; }, 1000);

            SoundEffect.playLevelUp();

            window._step1FinishTimer = setTimeout(() => {
                window._step1FinishTimer = null;
                document.getElementById('btn-step1-next').style.display = 'block';
                document.getElementById('btn-step1-next').classList.add('shake-effect');
                pouringLight.style.opacity = "0";
            }, 1500);
        };
    }

    // ----------------------------------------------------
    // [Step 2] 초성 퀴즈 (긴 구절 파트 분할 적용)
    // ----------------------------------------------------
    else if (currentStep === 2) {

        // 1. 최대 표시 단어 개수 설정 (한 화면에 이 개수까지만 보여줍니다. 12~15 추천)
        // 2. 파트 데이터 초기화 (처음 진입했거나, 구절이 바뀌었을 때만)
        if (window.currentStep2PartIndex === undefined) {
            window.currentStep2PartIndex = 0;
            window.step2Parts = splitChunksIntoParts(
                (currentLang === 'en' && trainingVerseData.chunksEn && trainingVerseData.chunksEn.length)
                    ? trainingVerseData.chunksEn : trainingVerseData.chunks);
        }

        // 3. 현재 파트(화면)에 보여줄 데이터만 꺼내오기
        const currentChunks = window.step2Parts[window.currentStep2PartIndex];
        const chunkInitials = currentChunks.map(word => getChosung(word));

        // 상단에 (파트 1/3) 라벨 추가
        let partLabel = "";
        let nextPartBadge = "";
        if (window.step2Parts.length > 1) {
            const nextPartCount = window.step2Parts[window.currentStep2PartIndex + 1]?.length;
            partLabel = ` <span style="color:#e74c3c;">(${t('label_part', { cur: window.currentStep2PartIndex + 1, total: window.step2Parts.length })})</span>`;
            if (nextPartCount) {
                nextPartBadge = `<span class="next-part-badge">${t('label_next_part', { count: nextPartCount })}</span>`;
            }
        }

        field.innerHTML = `
            <div class="verse-indicator">${verseLabel}${partLabel}<br>${currentLang === 'en' ? 'Step 2. Click the matching phrase!' : 'Step 2. 초성에 맞는 단어를 누르세요!'}</div>
            <div class="reading-card" id="initials-display"
                 style="position:relative; max-height:140px; overflow-y:auto; align-content:flex-start; line-height:2.2; display:flex; flex-wrap:wrap; justify-content:center; gap:8px;">
            </div>
        `;

        const display = document.getElementById('initials-display');
        chunkInitials.forEach((initial, idx) => {
            const span = document.createElement('span');
            span.id = `slot-${idx}`;
            span.className = 'initial-slot';
            span.innerText = initial;
            span.style.padding = "5px 10px";
            span.style.borderRadius = "10px";
            span.style.backgroundColor = "#eee";
            span.style.color = "#bdc3c7";
            span.style.transition = "all 0.3s";

            if (idx === 0) {
                span.style.border = "2px solid var(--primary-color)";
                span.style.color = "#2c3e50";
                span.style.fontWeight = "bold";
                span.style.backgroundColor = "white";
            }
            display.appendChild(span);
        });

        control.innerHTML = `<div style="position:relative;">${nextPartBadge}<div class="block-pool" id="block-pool"></div></div>`;
        const pool = document.getElementById('block-pool');

        // 4. 전체가 아닌 '현재 파트'의 단어들만 가나다순으로 정렬하여 버튼 생성
        let shuffledList = [...currentChunks].sort((a, b) => a.localeCompare(b, currentLang === 'en' ? 'en' : 'ko'));
        window.currentSlotIndex = 0;

        shuffledList.forEach(word => {
            const btn = document.createElement('div');
            btn.className = 'word-block';
            btn.innerText = word;

            btn.onclick = function () {
                // 비교할 정답도 현재 파트(currentChunks)에서 가져옵니다
                const correctWord = currentChunks[window.currentSlotIndex];

                if (word === correctWord) {
                    // 🔵 [성공] 정답일 때
                    SoundEffect.playCorrect();

                    const slot = document.getElementById(`slot-${window.currentSlotIndex}`);
                    if (slot) {
                        slot.innerText = correctWord;
                        slot.style.backgroundColor = "var(--primary-color)";
                        slot.style.color = "#2c3e50";
                        slot.style.border = "none";
                        slot.style.fontWeight = "bold";
                        slot.animate([
                            { transform: 'scale(1)' },
                            { transform: 'scale(1.2)' },
                            { transform: 'scale(1)' }
                        ], 300);
                    }

                    this.style.visibility = "hidden";
                    this.onclick = null;

                    // 인덱스 증가
                    window.currentSlotIndex++;

                    // 5. 다음 슬롯, 파트, 단계 이동 판별
                    if (window.currentSlotIndex < currentChunks.length) {
                        // 아직 '현재 파트'에 맞출 단어가 남았음 -> 다음 빈칸 테두리 칠하기
                        const nextSlot = document.getElementById(`slot-${window.currentSlotIndex}`);
                        if (nextSlot) {
                            nextSlot.style.border = "2px solid var(--primary-color)";
                            nextSlot.style.color = "#2c3e50";
                            nextSlot.style.fontWeight = "bold";
                            nextSlot.style.backgroundColor = "white";
                            // 🌟 [수정됨] 한 박자 빠른 자동 스크롤! (다음 빈칸을 기준으로 계산)
                            setTimeout(() => {
                                const display = document.getElementById('initials-display');
                                if (display) {
                                    // '다음 빈칸(nextSlot)'의 바닥 위치를 계산합니다
                                    const nextSlotBottom = nextSlot.offsetTop + nextSlot.offsetHeight;
                                    const displayVisibleBottom = display.scrollTop + display.clientHeight;

                                    // 🌟 다음 빈칸이 화면 맨 아래쪽에 가까워지면(여유 공간이 40px 이하로 남으면) 미리 내림!
                                    if (nextSlotBottom > displayVisibleBottom - 40) {
                                        display.scrollTo({
                                            // 다음 줄이 시원하게 보이도록 넉넉하게 스크롤업
                                            top: display.scrollTop + nextSlot.offsetHeight + 15,
                                            behavior: 'smooth'
                                        });
                                    }
                                }
                            }, 50);
                        }
                    } else {
                        // '현재 파트'를 다 맞췄음! -> 파트 인덱스 1 증가
                        window.currentStep2PartIndex++;

                        if (window.currentStep2PartIndex < window.step2Parts.length) {
                            // 🟢 아직 다음 파트가 남아있다면 화면 다시 그리기
                            setTimeout(() => {
                                loadStep(); // 현재 loadStep 함수를 다시 불러서 새 파트 렌더링
                            }, 300);
                        } else {
                            // 🟢 모든 파트를 다 맞췄다면 → 다시하기 / 다음 단계로 버튼 표시
                            setTimeout(() => {
                                const btnWrap = document.createElement('div');
                                btnWrap.style.cssText = 'display:flex;gap:10px;margin-top:16px;';

                                const retryBtn = document.createElement('button');
                                retryBtn.className = 'btn-attack';
                                retryBtn.style.flex = '1';
                                retryBtn.innerText = t('btn_retry');
                                retryBtn.onclick = () => {
                                    window.currentStep2PartIndex = 0;
                                    loadStep();
                                };

                                const nextBtn = document.createElement('button');
                                nextBtn.className = 'btn-attack';
                                nextBtn.style.cssText = 'flex:1; background-color:#2ecc71;';
                                nextBtn.innerText = t('btn_next_stage');
                                nextBtn.onclick = () => {
                                    window.currentStep2PartIndex = undefined;
                                    window.step2Parts = undefined;
                                    nextStep();
                                };

                                btnWrap.appendChild(retryBtn);
                                btnWrap.appendChild(nextBtn);
                                control.appendChild(btnWrap);
                            }, 500);
                        }
                    }

                } else {
                    // 🔴 [실패] 오답일 때
                    SoundEffect.playWrong();
                    playerHearts--;
                    wrongCount++;
                    updateBattleUI();

                    this.classList.add('error-block', 'shake-effect');

                    // 정답 입력칸(초성 표시 영역) 테두리 오답 피드백
                    const displayEl = document.getElementById('initials-display');
                    if (displayEl) {
                        displayEl.style.outline = '2px solid #e05c3a';
                        displayEl.style.transition = 'outline 0.3s';
                    }

                    const self = this;
                    setTimeout(() => {
                        self.classList.remove('error-block', 'shake-effect');
                        if (displayEl) displayEl.style.outline = '';
                    }, 500);

                    if (playerHearts <= 0) {
                        setTimeout(() => showReviveModal(), 100);
                    }
                }
            };

            pool.appendChild(btn);
        });
    }

    // ----------------------------------------------------
    // [Step 3] 바이블 타워 (선택형/객관식으로 변경)
    // ----------------------------------------------------
    else if (currentStep === 3) {
        // 1. 게임 영역 (타워와 빈칸 기록판만 남김)
        field.innerHTML = `
            <div class="verse-indicator">${verseLabel}${t('step3_indicator')}</div>
            <div id="tower-game-container">
                <div id="tower-text-display"></div>

                <div id="tower-msg">${t('tower_pick')}</div>
            </div>
        `;

        // 2. 하단 컨트롤 영역에 객관식 버튼이 들어갈 공간(풀) 마련!
        control.innerHTML = `<div class="block-pool" id="tower-choices-area"></div>`;

        // 지연 시간 없이 바로 게임 셋업 시작
        initTowerGame();
    }

    // ----------------------------------------------------
    // [Step 4] 예언의 두루마리 (3단계 속도 모드 적용)
    // ----------------------------------------------------
    else if (currentStep === 4) {
        // 안전장치: Step 3에서 넘어왔을 때 타워 게임 멈추기
        if (typeof towerGame !== 'undefined' && towerGame.interval) {
            clearInterval(towerGame.interval);
            towerGame.interval = null;
        }

        // 🌟 [핵심 수정 1] 옛날 isSlowMode를 지우고, speedMode 기본값을 'normal'로 설정합니다.
        // (HTML을 그리기 전에 변수부터 세팅하는 것이 훨씬 안전합니다)
        if (typeof scrollGame === 'undefined') scrollGame = {};
        scrollGame.speedMode = 'normal';

        // 1. 화면 구성 (두루마리 틀 만들기 + 🌟 3버튼 추가)
        field.innerHTML = `
            <div class="verse-indicator">${verseLabel}Step 4. ${t('step4_indicator')}</div>

            <div style="display: flex; justify-content: center; gap: 8px; margin-bottom: 15px;">
                <button id="btn-speed-slow" onclick="changeScrollSpeed('slow')"
                    style="padding: 6px 12px; border-radius: 20px; border: 2px solid #ccc; background: white; color: #7f8c8d; cursor: pointer; font-size: 0.85rem;">
                    ${t('step4_speed_slow')}
                </button>
                <button id="btn-speed-normal" onclick="changeScrollSpeed('normal')"
                    style="padding: 6px 12px; border-radius: 20px; border: 2px solid #27ae60; background: #27ae60; color: white; font-weight: bold; cursor: pointer; font-size: 0.85rem;">
                    ${t('step4_speed_normal')}
                </button>
                <button id="btn-speed-fast" onclick="changeScrollSpeed('fast')"
                    style="padding: 6px 12px; border-radius: 20px; border: 2px solid #ccc; background: white; color: #7f8c8d; cursor: pointer; font-size: 0.85rem;">
                    ${t('step4_speed_fast')}
                </button>
            </div>

            <div id="scroll-game-container">
                <div id="deadline-line"></div>
                <div id="scroll-track">
                </div>
            </div>
        `;

        control.innerHTML = `
            <div style="text-align:center; margin-bottom:10px; color:#bdc3c7;">${t('step4_fill_hint')}</div>
            <div class="block-pool" id="scroll-deck"></div>
            <div style="text-align:center; margin-top:12px;">
                <button id="btn-speed-skip" onclick="skipToEnd()"
                    style="display: none; padding: 10px 24px; border-radius: 20px; border: 2px solid #e74c3c; background: #e74c3c; color: white; font-weight: bold; cursor: pointer; font-size: 0.95rem;">
                    ${t('step4_skip')}
                </button>
            </div>
        `;

        // 2. 게임 시작 (화면 로딩 안정성을 위해 0.1초 뒤 실행)
        setTimeout(startScrollStep, 100);
    }

    // [수정된 Step 5: 오류 수정 & 기능 강화]
    // [수정된 Step 5: 파트 분할 적용 & 기능 강화]
    else if (currentStep === 5) {

        // 👉 2. 파트 데이터 초기화
        if (window.currentStep5PartIndex === undefined) {
            window.currentStep5PartIndex = 0;
            window.step5Parts = splitChunksIntoParts(
                (currentLang === 'en' && trainingVerseData.chunksEn && trainingVerseData.chunksEn.length)
                    ? trainingVerseData.chunksEn : trainingVerseData.chunks);
        }

        // 👉 3. 현재 파트(화면)에 보여줄 데이터만 꺼내오기
        const correctChunks = window.step5Parts[window.currentStep5PartIndex];

        let partLabel = "";
        let nextPartBadge = "";
        if (window.step5Parts.length > 1) {
            const nextPartCount = window.step5Parts[window.currentStep5PartIndex + 1]?.length;
            partLabel = ` <span style="color:#e74c3c;">(${t('label_part', { cur: window.currentStep5PartIndex + 1, total: window.step5Parts.length })})</span>`;
            if (nextPartCount) {
                nextPartBadge = `<span class="next-part-badge">${t('label_next_part', { count: nextPartCount })}</span>`;
            }
        }

        // 4. 화면 구성
        field.innerHTML = `
            <div class="verse-indicator">${verseLabel}${partLabel}<br>${t('step5_indicator')}</div>

            <div class="answer-zone" id="answer-zone" style="min-height: 120px; align-content: flex-start;">
                <span class="placeholder-text" id="placeholder-text">${t('step5_placeholder')}</span>
            </div>

            <div style="margin-top: 10px; font-size: 0.85rem; color: #576574; text-align: center; background-color: rgba(255,255,255,0.8); padding: 8px 15px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                ${t('step5_tip')}
            </div>
        `;

        control.innerHTML = `<div style="position:relative;">${nextPartBadge}<div class="block-pool" id="block-pool"></div></div>`;
        const pool = document.getElementById('block-pool');
        const zone = document.getElementById('answer-zone');

        // 👉 5. 단어 가나다순 정렬
        let list = [...correctChunks].sort((a, b) => a.localeCompare(b, currentLang === 'en' ? 'en' : 'ko'));

        // ── 상태 변수 ──
        let selectedBlock = null;
        let insertMode = false;
        let insertSelectedPoolBtn = null;
        let insertBtn = null; // 버튼 생성 후 할당
        let removeErrorBtn = null; // 오답 빼기 버튼

        // 🌟 [추가] 5초 대기 힌트 시스템
        if (window.step5IdleTimer) clearTimeout(window.step5IdleTimer);

        function checkAndShowHint() {
            document.querySelectorAll('.hint-glow').forEach(el => el.classList.remove('hint-glow'));
            document.querySelectorAll('.error-glow').forEach(el => el.classList.remove('error-glow'));

            const currentBlocks = Array.from(zone.querySelectorAll('.word-block'));
            let firstErrorIndex = -1;

            for (let i = 0; i < currentBlocks.length; i++) {
                const actual = normalizeChunkText(currentBlocks[i].dataset.original);
                const expected = normalizeChunkText(correctChunks[i]);
                if (actual !== expected) { firstErrorIndex = i; break; }
            }

            if (firstErrorIndex !== -1) {
                // 상황 A: 오답 위치 빨갛게 반짝임
                currentBlocks[firstErrorIndex].classList.add('error-glow');
            } else if (currentBlocks.length < correctChunks.length) {
                // 상황 B: 다음에 놓을 단어를 풀에서 파랗게 반짝임
                const nextExpectedWord = correctChunks[currentBlocks.length];
                const targetBlock = Array.from(pool.children).find(b =>
                    b.style.visibility !== 'hidden' &&
                    normalizeChunkText(b.innerText) === normalizeChunkText(nextExpectedWord)
                );
                if (targetBlock) targetBlock.classList.add('hint-glow');
            }
        }

        function resetIdleTimer() {
            if (window.step5IdleTimer) clearTimeout(window.step5IdleTimer);
            document.querySelectorAll('.hint-glow').forEach(el => el.classList.remove('hint-glow'));
            document.querySelectorAll('.error-glow').forEach(el => el.classList.remove('error-glow'));

            const currentBlocks = Array.from(zone.querySelectorAll('.word-block'));
            if (currentBlocks.length < correctChunks.length || currentBlocks.some((b, i) => normalizeChunkText(b.dataset.original) !== normalizeChunkText(correctChunks[i]))) {
                window.step5IdleTimer = setTimeout(checkAndShowHint, 5000);
            }
        }

        function deselect() {
            if (selectedBlock) {
                selectedBlock.classList.remove('selected-block');
                selectedBlock = null;
            }
        }

        // ── 풀 레이아웃 업데이트 ──
        function updatePoolLayout() {
            if ([...pool.children].every(b => b.style.visibility === 'hidden')) {
                pool.style.height = '0px';
                pool.style.margin = '0';
                zone.style.minHeight = '180px';
                zone.style.paddingBottom = '40px';
            } else {
                pool.style.height = '';
                pool.style.margin = '';
                zone.style.minHeight = '120px';
                zone.style.paddingBottom = '';
            }
        }

        // ── answer block 생성 헬퍼 (풀 버튼과 쌍으로 연결) ──
        function buildAnswerBlock(word, poolBtn) {
            const ab = document.createElement('div');
            ab.className = 'word-block';
            ab.innerText = word;
            ab.dataset.original = word;
            ab._poolBtn = poolBtn; // pool 버튼 직접 참조 저장
            ab.style.backgroundColor = "#f1c40f";
            ab.style.color = "#000";
            ab.style.margin = "5px";
            ab.onclick = () => {
                if (insertMode) return; // 끼워넣기 모드에서는 zone 단어 탭 무시
                ab.remove();
                if (removeErrorBtn) { removeErrorBtn.remove(); removeErrorBtn = null; }
                poolBtn.style.visibility = 'visible';
                SoundEffect.playClick();
                resetIdleTimer();
                if (zone.querySelectorAll('.word-block').length === 0) {
                    zone.innerHTML = `<span class="placeholder-text" id="placeholder-text">${t('step5_placeholder')}</span>`;
                }
                setTimeout(() => updatePoolLayout(), 10);
                if (insertBtn) updateInsertBtnDisabled();
            };
            return ab;
        }

        // ── 끼워넣기 마커 ──
        function hideInsertMarkers() {
            Array.from(zone.querySelectorAll('.insert-marker')).forEach(m => m.remove());
        }

        function showInsertMarkers() {
            hideInsertMarkers();
            const blocks = Array.from(zone.querySelectorAll('.word-block'));
            if (blocks.length === 0) return;

            function createMarker(refNode) {
                const m = document.createElement('button');
                m.className = 'insert-marker';
                m.textContent = '+';
                m.onclick = (e) => {
                    e.stopPropagation();
                    if (!insertSelectedPoolBtn) return;
                    const word = insertSelectedPoolBtn.innerText;
                    const ab = buildAnswerBlock(word, insertSelectedPoolBtn);
                    if (refNode && refNode.parentElement === zone) {
                        zone.insertBefore(ab, refNode);
                    } else {
                        zone.appendChild(ab);
                    }
                    insertSelectedPoolBtn.style.visibility = 'hidden';
                    insertSelectedPoolBtn.classList.remove('insert-mode-selected');
                    insertSelectedPoolBtn = null;
                    hideInsertMarkers();
                    SoundEffect.playClick();
                    resetIdleTimer();
                    updateInsertBtnDisabled();
                    tryAutoCheck();
                    setTimeout(() => updatePoolLayout(), 10);
                };
                return m;
            }

            // 첫 번째 블록 앞에 마커
            zone.insertBefore(createMarker(blocks[0]), blocks[0]);
            // 각 블록 뒤에 마커
            blocks.forEach((block, i) => {
                block.after(createMarker(blocks[i + 1] || null));
            });
        }

        // ── 끼워넣기 모드 ON/OFF ──
        function setInsertMode(val) {
            insertMode = val;
            if (!val) {
                if (insertSelectedPoolBtn) {
                    insertSelectedPoolBtn.classList.remove('insert-mode-selected');
                    insertSelectedPoolBtn = null;
                }
                hideInsertMarkers();
            }
            if (insertBtn) updateInsertModeBtn();
        }

        function updateInsertModeBtn() {
            if (insertMode) {
                insertBtn.style.background = '#e67e22';
                insertBtn.style.boxShadow = '0 4px 0 #b7770d';
                insertBtn.style.color = '#fff';
                insertBtn.innerHTML = t('step5_insert_on');
            } else {
                insertBtn.style.background = '';
                insertBtn.style.boxShadow = '';
                insertBtn.style.color = '';
                insertBtn.innerHTML = t('step5_insert_btn');
            }
        }

        // zone이 비어 있으면 끼워넣기 버튼 비활성화
        function updateInsertBtnDisabled() {
            if (!insertBtn) return;
            const hasBlocks = zone.querySelectorAll('.word-block').length > 0;
            insertBtn.disabled = !hasBlocks;
            if (!hasBlocks && insertMode) setInsertMode(false);
        }

        // 오답 빼기 버튼 표시
        function showRemoveErrorBtn() {
            if (removeErrorBtn) return;
            removeErrorBtn = document.createElement('button');
            removeErrorBtn.className = 'btn-remove-errors';
            removeErrorBtn.innerText = t('btn_remove_wrong');
            removeErrorBtn.onclick = () => {
                setInsertMode(false);
                const errorBlocks = Array.from(zone.querySelectorAll('.error-block'));
                errorBlocks.forEach(ab => {
                    if (ab._poolBtn) ab._poolBtn.style.visibility = 'visible';
                    ab.remove();
                });
                // 정답 블록도 error 상태 초기화
                Array.from(zone.querySelectorAll('.correct-block')).forEach(b => {
                    b.classList.remove('correct-block');
                });
                removeErrorBtn.remove();
                removeErrorBtn = null;
                if (typeof SoundEffect !== 'undefined') SoundEffect.playClick();
                resetIdleTimer();
                updateInsertBtnDisabled();
                setTimeout(() => updatePoolLayout(), 10);
            };
            zone.appendChild(removeErrorBtn);
        }

        // zone이 꽉 찼을 때 자동 정답 확인
        function autoCheck() {
            if (window.step5IdleTimer) clearTimeout(window.step5IdleTimer);
            const currentBlocks = Array.from(zone.querySelectorAll('.word-block'));
            let errorCount = 0;
            currentBlocks.forEach((b, index) => {
                const expected = normalizeChunkText(correctChunks[index]);
                const actual = normalizeChunkText(b.dataset.original);
                if (actual === expected) {
                    b.classList.add('correct-block');
                    b.classList.remove('error-block', 'error-glow');
                } else {
                    b.classList.add('error-block');
                    b.classList.remove('correct-block');
                    errorCount++;
                }
            });
            if (errorCount === 0) {
                setInsertMode(false);
                if (typeof SoundEffect !== 'undefined') {
                    SoundEffect.playTone(523.25, 'sine', 0.1, 0.2);
                    setTimeout(() => SoundEffect.playTone(659.25, 'sine', 0.1, 0.2), 80);
                    setTimeout(() => SoundEffect.playTone(783.99, 'sine', 0.6, 0.2), 160);
                }
                window.currentStep5PartIndex++;
                if (window.currentStep5PartIndex < window.step5Parts.length) {
                    setTimeout(() => { loadStep(); }, 500);
                } else {
                    setTimeout(() => {
                        window.currentStep5PartIndex = undefined;
                        window.step5Parts = undefined;
                        nextStep();
                    }, 500);
                }
            } else {
                SoundEffect.playWrong();
                playerHearts--;
                updateBattleUI();
                wrongCount++;
                showRemoveErrorBtn();
                if (playerHearts <= 0) {
                    setTimeout(showReviveModal, 100);
                }
            }
        }

        function tryAutoCheck() {
            const currentBlocks = Array.from(zone.querySelectorAll('.word-block'));
            if (currentBlocks.length === correctChunks.length) {
                autoCheck();
            }
        }

        // 단어 블록 생성
        list.forEach(word => {
            const btn = document.createElement('div');
            btn.className = 'word-block';
            btn.innerText = word;

            btn.onclick = () => {
                if (btn.style.visibility === 'hidden') return;

                // ── 끼워넣기 모드: 선택/해제 후 + 마커 표시 ──
                if (insertMode) {
                    if (insertSelectedPoolBtn === btn) {
                        btn.classList.remove('insert-mode-selected');
                        insertSelectedPoolBtn = null;
                        hideInsertMarkers();
                    } else {
                        if (insertSelectedPoolBtn) insertSelectedPoolBtn.classList.remove('insert-mode-selected');
                        insertSelectedPoolBtn = btn;
                        btn.classList.add('insert-mode-selected');
                        showInsertMarkers();
                    }
                    return;
                }

                // ── 일반 모드: 맨 뒤에 추가 ──
                const placeholder = document.getElementById('placeholder-text');
                if (placeholder) placeholder.remove();

                const answerBlock = buildAnswerBlock(word, btn);
                if (selectedBlock && selectedBlock.parentElement === zone) {
                    zone.insertBefore(answerBlock, selectedBlock);
                    deselect();
                } else {
                    zone.appendChild(answerBlock);
                }
                btn.style.visibility = 'hidden';
                SoundEffect.playClick();
                resetIdleTimer();
                updateInsertBtnDisabled();
                tryAutoCheck();

                setTimeout(() => {
                    answerBlock.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    zone.scrollTop = zone.scrollHeight;
                }, 50);
                setTimeout(() => updatePoolLayout(), 10);
            };
            pool.appendChild(btn);
        });

        // 초기 시작 시 힌트 타이머 가동
        resetIdleTimer();

        zone.onclick = (e) => {
            if (e.target === zone) deselect();
        };

        const btnWrapper = document.createElement('div');
        btnWrapper.style.display = 'flex';
        btnWrapper.style.width = '100%';
        btnWrapper.style.gap = '2%';

        // ── 끼워넣기 토글 버튼 ──
        insertBtn = document.createElement('button');
        insertBtn.className = 'btn-reset-step5';
        insertBtn.style.flex = '1 1 0';
        updateInsertModeBtn();   // insertBtn 할당 직후 초기화
        updateInsertBtnDisabled();
        insertBtn.onclick = () => {
            if (insertBtn.disabled) return;
            setInsertMode(!insertMode);
        };

        // ── 다시하기 버튼 ──
        const resetBtn = document.createElement('button');
        resetBtn.className = 'btn-reset-step5';
        resetBtn.innerText = t('btn_reset');
        resetBtn.style.flex = '1 1 0';
        resetBtn.onclick = () => {
            setInsertMode(false); // 리셋 시 끼워넣기 OFF
            if (removeErrorBtn) { removeErrorBtn.remove(); removeErrorBtn = null; }
            Array.from(zone.querySelectorAll('.word-block')).forEach(block => block.remove());
            if (!zone.querySelector('#placeholder-text')) {
                zone.innerHTML = `<span class="placeholder-text" id="placeholder-text">${t('step5_placeholder')}</span>`;
            }
            Array.from(pool.children).forEach(btn => {
                btn.style.visibility = 'visible';
            });
            pool.style.height = '';
            pool.style.margin = '';
            zone.style.minHeight = '120px';
            zone.style.paddingBottom = '';
            deselect();
            SoundEffect.playClick();
            resetIdleTimer();
            updateInsertBtnDisabled();
        };

        btnWrapper.appendChild(insertBtn);
        btnWrapper.appendChild(resetBtn);
        control.appendChild(btnWrapper);
    }
} // loadStep 끝

// [2. nextStep 함수 교체] (노선도 방식 + 🌟 훈련 모드 분기 추가)
function nextStep() {
    if (!window.isGamePlaying) return; 

    // 🌟 훈련 모드일 때는 스텝을 고정하고 구절만 다음으로 넘깁니다!
    // 🌟 훈련 모드일 때는 스텝을 고정하고 구절만 다음으로 넘깁니다!
    if (window.isTrainingMode) {
        if (window.currentVerseIdx < window.currentBattleData.length - 1) {
            
            window.currentVerseIdx++; // 다음 구절로 인덱스 이동
            syncTrainingVerseState();
            
            loadStep(); // 화면 다시 그리기
        } else if (currentTrainingCycle < trainingRepeatCount) {
            currentTrainingCycle++;
            window.currentTrainingCycle = currentTrainingCycle;
            window.currentVerseIdx = 0;
            playerHearts = (typeof maxPlayerHearts !== 'undefined') ? maxPlayerHearts : playerHearts;
            syncTrainingVerseState();
            loadStep();
        } else {
            // 모든 구절을 다 돌았다면 훈련 종료!
            finishTraining();
        }
        return; 
    }

    // -----------------------------------------
    // (이하 기존 일반 모드 로직 유지)
    // -----------------------------------------
    // 다음 순번으로 이동 (0 -> 1 -> 2...)
    sequenceIndex++;

    // 더 이상 갈 곳이 없으면 종료
    if (sequenceIndex >= stepSequence.length) {
        finishTraining();
    } else {
        // 목록(stepSequence)에 적힌 다음 숫자를 currentStep에 넣음
        currentStep = stepSequence[sequenceIndex];
        loadStep();
    }
}

/* [수정] 훈련 중간 종료 처리 (phase 시스템 제거) */
function finishTraining() {
    // 결과창 표시 전에 현재 스테이지의 보석 예상값을 갱신 (이전 스테이지 잔류값 방지)
    // showClearScreen()은 stageClear()보다 먼저 실행되므로 window._lastClearGem이 이전 스테이지 값일 수 있음
    const sId = window.currentStageId;
    if (!window.isTrainingMode && !window.isHardshipMode && sId) {
        const reviewSt = getReviewStatus(sId);
        if (reviewSt.isEligible) {
            const pending = stagePendingRetry[sId];
            let previewOutcome;
            if (pending) {
                if (pending.type === 'good') {
                    previewOutcome = 'good-retry';
                } else if (pending.type === 'miss') {
                    previewOutcome = pending.remaining === 1 ? 'miss-retry-final' : 'miss-retry';
                }
            } else {
                const strength = reviewSt.step > 1 ? getMemoryStrength(sId) : null;
                previewOutcome = (strength === null || strength >= 0.8) ? 'perfect'
                               : strength >= 0.4 ? 'good'
                               : 'miss';
            }
            const isMissRetry = previewOutcome === 'miss-retry' || previewOutcome === 'miss-retry-final';
            window._lastClearGem = (previewOutcome === 'miss') ? 0
                                 : isMissRetry ? 10
                                 : getReviewBaseGem(reviewSt.step);
            window._lastClearOutcome = previewOutcome;
        } else {
            window._lastClearGem = 10; // 대기 중이어도 최소 10개 보상
            window._lastClearOutcome = 'waiting';
        }
    }
    showClearScreen();
}

// ▼▼▼ [수정된 addGems] UI 갱신 기능 연결 ▼▼▼
function addGems(amount) {
    // 1. 전역 변수 초기화 안전장치
    if (typeof myGems === 'undefined') myGems = 0;

    // 2. 보석 추가
    myGems += amount;

    // 3. ★ 핵심 수정: 게임 내 통합 UI 갱신 함수 호출
    // (이게 있어야 상단 보석 숫자가 바로 바뀝니다!)
    if (typeof updateGemDisplay === 'function') {
        updateGemDisplay();
    }

    // 4. 데이터 저장
    if (typeof saveGameData === 'function') {
        saveGameData();
    }
}
// ▲▲▲ [여기까지] ▲▲▲

/* [유틸: 청크 균등 파트 분할] */
function splitChunksIntoParts(chunks, maxWords = 20) {
    if (chunks.length <= maxWords) return [chunks];
    const numParts = Math.ceil(chunks.length / maxWords);
    const parts = [];
    const base = Math.floor(chunks.length / numParts);
    const extra = chunks.length % numParts;
    let idx = 0;
    for (let i = 0; i < numParts; i++) {
        const size = base + (i < extra ? 1 : 0);
        parts.push(chunks.slice(idx, idx + size));
        idx += size;
    }
    return parts;
}

/* [유틸: 한글 초성 추출기] */
function getChosung(str) {
    const cho = ["ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
    const hasKorean = [...str].some(c => { const code = c.charCodeAt(0) - 44032; return code > -1 && code < 11172; });
    if (!hasKorean) {
        // 영어: 각 단어의 첫 글자만 반환 (한국어 초성과 동등한 난이도)
        return str.trim().split(/\s+/).map(w => w[0] || '').join(' ');
    }
    let result = "";
    for (let i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i) - 44032;
        if (code > -1 && code < 11172) result += cho[Math.floor(code / 588)];
        else result += str.charAt(i);
    }
    return result;
}

/* [수정] 결과 화면 표시 (🌟 훈련 모드 분기 완벽 적용판) */
function showClearScreen() {
    triggerConfetti();
    SoundEffect.playClear();

    // 1. 시간 계산 (훈련 모드에서도 이건 피드백으로 보여줍니다!)
    const endTime = Date.now();
    const duration = Math.floor((stageStartTime ? (endTime - stageStartTime) : 0) / 1000);
    const minutes = Math.floor(duration / 60).toString().padStart(2, '0');
    const seconds = (duration % 60).toString().padStart(2, '0');

    // 2. 정확도 계산 (틀린 횟수 기반)
    let accuracy = Math.max(0, 100 - (wrongCount * 10));

    let displayGem = 0;
    let streakDays = "-"; // 훈련 모드에서는 스트릭 텍스트를 숨기거나 '-'로 표시
    let msg = "";
    let bonusCount = 0; // 때를 따른 양식 잔여 횟수 (훈련 모드에서는 0)
    const isTraining = window.isTrainingMode;

    const resultTitle = document.getElementById('result-title');
    const resultStreakText = document.getElementById('result-streak-text');
    const resultExpLabel = document.getElementById('result-exp-label');
    const resultContinueBtn = document.getElementById('result-continue-btn');

    // 🌟 [핵심 수술] 훈련 모드 vs 일반 모드 분기 처리
    if (isTraining) {
        msg = t('result_msg_training_waiting');
        displayGem = t('result_msg_training_done');
        streakDays = t('result_training_title');

    } else {
        // ============================================================
        // ▼ [일반 모드 전용] 복습 단계 보너스 및 스트릭 업데이트
        // ============================================================
        const sId = window.currentStageId;
        // ★ [v1.1.0] 보석 보상이 있었으면 stageClear에서 advanceReviewStep이 호출됨 → step이 +1된 상태
        // window._lastClearGem에 실제 지급된 보석 수를 저장하도록 stageClear에서 설정
        const earnedGem = (typeof window._lastClearGem === 'number') ? window._lastClearGem : 0;
        const reviewSt = getReviewStatus(sId);
        const completedStep = earnedGem > 0 ? Math.max(1, reviewSt.step - 1) : reviewSt.step;
        let baseGem = earnedGem > 0 ? earnedGem : 0;
        bonusCount = completedStep;

        if (window._lastClearOutcome === 'waiting') {
            msg = t('result_msg_waiting', { gem: baseGem });
        } else if (earnedGem > 0) {
            if (completedStep === 1) {
                msg = t('result_msg_first_clear', { gem: baseGem });
            } else {
                msg = t('result_msg_review_done', { step: completedStep, gem: baseGem });
                const outcome = window._lastClearOutcome;
                if (outcome === 'perfect') msg += t('result_msg_perfect_timing');
                else if (outcome === 'good') msg += t('result_msg_good_timing');
            }
        } else if (window._lastClearOutcome === 'miss') {
            msg = t('result_msg_miss');
        } else {
            msg = t('result_msg_no_gem');
            baseGem = 0;
        }

        displayGem = Math.floor(baseGem * (accuracy / 100));
        
        // 3. 스트릭 업데이트 (일반 모드에서만 진짜로 기록을 올립니다!)
        const streakInfo = updateStreak();
        streakDays = streakInfo.days;
        // ============================================================
    }

    if (resultTitle) {
        resultTitle.innerText = isTraining ? t('result_training_title') : t('result_stage_clear');
    }
    if (resultStreakText) {
        resultStreakText.innerHTML = isTraining
            ? t('result_training_streak')
            : t('result_streak_text', { days: `<span id="streak-days">${streakDays}</span>` });
    }
    if (resultExpLabel) {
        resultExpLabel.innerText = isTraining ? t('result_exp_training') : t('result_exp_gems');
    }
    if (resultContinueBtn) {
        resultContinueBtn.innerText = isTraining ? t('result_continue_training') : t('result_continue');
    }

    // 4. UI 업데이트
    document.getElementById('result-time').innerText = `${minutes}:${seconds}`;
    document.getElementById('result-accuracy').innerText = `${accuracy}%`;
    document.getElementById('result-exp').innerText = isTraining ? `${displayGem}` : `+${displayGem}`;
    if (!isTraining) {
        document.getElementById('streak-days').innerText = streakDays;
    }
    
    // 일반 스테이지: 다음 복습 안내 멘트
    const quoteEl = document.getElementById('result-quote');
    if (quoteEl) {
        let quoteText = '';
        if (!isTraining) {
            const sId = window.currentStageId;
            if (sId) {
                const nextStatus = getReviewStatus(sId);
                const outcome = window._lastClearOutcome;
                if (outcome === 'perfect' && nextStatus.step === 1) {
                    // step 1 클리어 (최초 학습 또는 miss 후 재학습)
                    // advanceReviewStep 호출 전이므로 step이 아직 1
                    quoteText = t('quote_first_clear');
                } else if (outcome === 'perfect') {
                    const waitMs = getReviewWaitMs(nextStatus.step + 1); // advanceReviewStep 호출 전이므로 +1
                    const hr = waitMs / 3600000;
                    let waitLabel;
                    if (hr < 1) waitLabel = currentLang === 'en' ? `${Math.round(waitMs / 60000)} min` : `${Math.round(waitMs / 60000)}분`;
                    else if (hr < 24) waitLabel = currentLang === 'en' ? `${Math.round(hr)} hr` : `${Math.round(hr)}시간`;
                    else waitLabel = currentLang === 'en' ? `${Math.round(hr / 24)} day(s)` : `${Math.round(hr / 24)}일`;
                    quoteText = t('quote_perfect', { wait: waitLabel });
                } else if (outcome === 'good') {
                    quoteText = t('quote_good');
                } else if (outcome === 'good-retry') {
                    quoteText = t('quote_good_retry');
                } else if (outcome === 'miss') {
                    quoteText = t('quote_miss');
                } else if (outcome === 'miss-retry') {
                    quoteText = t('quote_miss_retry');
                } else if (outcome === 'miss-retry-final') {
                    quoteText = t('quote_miss_retry_final');
                }
            }
        }
        quoteEl.innerHTML = quoteText;
        quoteEl.style.display = quoteText ? 'block' : 'none';
    }

    // 알림 예약 버튼 (10분/1시간/6시간 대기 복습만)
    const notifWrap = document.getElementById('result-notif-wrap');
    if (notifWrap) {
        notifWrap.innerHTML = '';
        notifWrap.style.display = 'none';
        if (!isTraining) {
            const sId = window.currentStageId;
            const outcome = window._lastClearOutcome;
            // 알림은 실제로 다음 복습 타이머가 시작되는 시점에만 표시:
            // - perfect: 정상 클리어 → step+1로 타이머 시작
            // - good-retry / miss-retry-final: 재도전 완료 → "다음 단계로 진행합니다" 시점 = 타이머 시작
            // good / miss 는 재도전 대기(타이머=0)이므로 제외
            if (sId && (outcome === 'perfect' || outcome === 'good-retry' || outcome === 'miss-retry-final')) {
                const nextStatus = getReviewStatus(sId);
                // showClearScreen은 advanceReviewStep 호출 전이므로 step이 아직 현재 step
                // → 다음 단계 대기시간은 step+1 기준
                const rawDelayMs = nextStatus.step === 1
                    ? 10 * 60 * 1000
                    : getReviewWaitMs(nextStatus.step + 1);
                const rawHr = rawDelayMs / 3600000;
                // 10분(0.17hr), 1시간, 6시간만 버튼 표시
                const isShortDelay = rawHr <= 6.5;
                if (isShortDelay) {
                    let waitLabel;
                    if (rawHr < 1) waitLabel = `${Math.round(rawDelayMs / 60000)}분`;
                    else waitLabel = `${Math.round(rawHr)}시간`;
                    // 스테이지 제목 가져오기
                    const chData = getChapterDataByStageId(sId);
                    const stageObj = chData && chData.stages ? chData.stages.find(s => s.id === sId) : null;
                    const stageTitle = stageObj ? getStageTitle(stageObj) : t('label_this_word');
                    notifWrap.innerHTML = `
                        <p style="font-size:0.85rem; color:#7f8c8d; margin:0 0 6px;">${t('notif_ask', { wait: waitLabel })}</p>
                        <button onclick="scheduleReviewNotification(${rawDelayMs}, '${stageTitle.replace(/'/g, "\\'")}', this)"
                            style="background:#e8a020; color:white; border:none; padding:9px 20px; border-radius:20px; font-weight:bold; font-size:0.9rem; cursor:pointer;">
                            ${t('notif_btn')}
                        </button>`;
                    notifWrap.style.display = 'block';
                }
            }
        }
    }

    const resultModalEl = document.getElementById('result-modal');
    const existingHistoryEl = resultModalEl && resultModalEl.querySelector('.hardship-history-wrap');
    if (existingHistoryEl) existingHistoryEl.remove();

    // 레이블 i18n 업데이트
    const statLabels = resultModalEl.querySelectorAll('.stat-label');
    if (statLabels[0]) statLabels[0].textContent = t('result_label_time');
    if (statLabels[1]) statLabels[1].textContent = t('result_label_accuracy');

    resultModalEl.classList.add('active');
}

// 스트릭 계산 로직
function updateStreak() {
    const today = new Date().toDateString(); // "Wed Jan 08 2026" 형식
    let lastPlayed = localStorage.getItem('lastPlayedDate');
    let streak = parseInt(localStorage.getItem('streakDays') || 0);

    if (lastPlayed !== today) {
        // 오늘 처음 깸
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (lastPlayed === yesterday.toDateString()) {
            // 어제 하고 오늘 또 함 -> 스트릭 증가!
            streak++;
        } else {
            // 하루 빼먹음 or 처음 -> 1일부터 시작
            streak = 1;
        }

        // 저장
        localStorage.setItem('lastPlayedDate', today);
        localStorage.setItem('streakDays', streak);
    }

    return { days: streak };
}

/* [보스 클리어 결과 모달 표시] */
function showBossClearScreen(clearedStageId) {
    // result-notif-wrap 초기화 (이전 결과 화면의 알림 버튼 잔상 제거)
    const notifWrapBoss = document.getElementById('result-notif-wrap');
    if (notifWrapBoss) { notifWrapBoss.innerHTML = ''; notifWrapBoss.style.display = 'none'; }

    triggerConfetti();
    SoundEffect.playClear();

    const endTime = Date.now();
    const duration = Math.floor((bossStartTime ? (endTime - bossStartTime) : 0) / 1000);
    const minutes = Math.floor(duration / 60).toString().padStart(2, '0');
    const seconds = (duration % 60).toString().padStart(2, '0');
    const accuracy = Math.max(0, 100 - (wrongCount * 10));

    const streakInfo = updateStreak();

    const bq0 = LANG[currentLang].boss_quote_perfect || LANG['ko'].boss_quote_perfect;
    const bq1 = LANG[currentLang].boss_quote_good || LANG['ko'].boss_quote_good;
    const bq4 = LANG[currentLang].boss_quote_miss || LANG['ko'].boss_quote_miss;
    const quotePool = bossHintCount === 0 ? bq0 : bossHintCount <= 3 ? bq1 : bq4;
    const quoteText = quotePool[Math.floor(Math.random() * quotePool.length)];
    bossHintCount = 0;

    const resultTitle = document.getElementById('result-title');
    const resultStreakText = document.getElementById('result-streak-text');
    const resultExpLabel = document.getElementById('result-exp-label');
    const resultContinueBtn = document.getElementById('result-continue-btn');
    const quoteEl = document.getElementById('result-quote');

    if (resultTitle) resultTitle.innerText = t('result_boss_clear');
    if (resultStreakText) resultStreakText.innerHTML = t('result_streak_text', { days: `<span id="streak-days">${streakInfo.days}</span>` });
    if (resultExpLabel) resultExpLabel.innerText = t('result_boss_exp');
    if (resultContinueBtn) {
        resultContinueBtn.innerText = t('result_continue');
        resultContinueBtn.onclick = () => closeBossClearModal(clearedStageId);
    }
    if (quoteEl) {
        quoteEl.textContent = quoteText;
        quoteEl.style.display = 'block';
    }

    const bossStatLabels = document.getElementById('result-modal').querySelectorAll('.stat-label');
    if (bossStatLabels[0]) bossStatLabels[0].textContent = t('result_label_time');
    if (bossStatLabels[1]) bossStatLabels[1].textContent = t('result_label_accuracy');

    document.getElementById('result-time').innerText = `${minutes}:${seconds}`;
    document.getElementById('result-accuracy').innerText = `${accuracy}%`;
    document.getElementById('result-exp').innerText = t('result_boss_defeated');

    const bossResultModal = document.getElementById('result-modal');
    const existingBossHistory = bossResultModal && bossResultModal.querySelector('.hardship-history-wrap');
    if (existingBossHistory) existingBossHistory.remove();
    bossResultModal.classList.add('active');
}

/* [보스 클리어 모달 닫기] */
function closeBossClearModal(clearedStageId) {
    document.getElementById('result-modal').classList.remove('active');
    // 계속하기 버튼을 기본 핸들러로 복원
    const btn = document.getElementById('result-continue-btn');
    if (btn) btn.onclick = closeResultModal;
    quitGame('map');
    openStageSheetForStageId(clearedStageId);
    setTimeout(tryShowMilestone, 500);
}

// 모달 닫고 나가기
// 모달 닫고 나가기 (🌟 훈련 모드 조기 퇴근 완벽 적용판)
function closeResultModal() {
    document.getElementById('result-modal').classList.remove('active');

    // 🌟 [훈련 모드 전용 퇴근 루트]
    if (window.isTrainingMode) {
        quitGame('home');

        // 🌟 [가장 중요] 여기서 함수를 끝냅니다! 아래쪽 일반 보상 코드로 넘어가지 못하게 막습니다.
        return; 
    }
    if (window.isHardshipMode) {
        quitGame(window.hardshipOrigin || 'home');
        return;
    }
    
    // ----------------------------------------------------
    // ▼ (여기서부터는 일반 모드일 때만 실행됩니다) ▼
    // ----------------------------------------------------
    const clearedStageId = window.currentStageId;
    stageClear('normal'); // 보석과 승점 계산!
    quitGame();
    openStageSheetForStageId(clearedStageId);
    setTimeout(tryShowMilestone, 500);

}

// 소리 토글 함수
function syncSfxButtons() {
    const icon = SoundEffect.isMuted ? "🔇" : "🔊";
    document.querySelectorAll('.sfx-toggle-btn').forEach(b => b.innerText = icon);
}

function toggleSound() {
    SoundEffect.toggleMute();
    syncSfxButtons();
}

// 배경음악 제거됨 - 함수 유지 (버튼 참조 오류 방지)

/* [시스템: 성전 보급소 로직] */
function openShop() {
    // 화면 전환
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('shop-screen').classList.add('active');

    updateShopUI();
    ensureBackButton(document.getElementById('shop-screen'));
    // 백버튼 가시성 갱신 (상점에서는 보여야 함)
    if (typeof updateBackButtonVisibility === 'function') updateBackButtonVisibility();
}

/* [시스템: 아이템 사용 로직] */

// 화면에 아이템 개수 갱신하기 (훈련/보스전 모두)
function updateItemButtons() {
    // 보스전 버튼
    const pBtn = document.getElementById('btn-potion-cnt');
    if (pBtn) pBtn.innerText = inventory.lifeBread;

    // 훈련 모드 버튼
    const pBtnT = document.getElementById('btn-potion-cnt-t');
    if (pBtnT) pBtnT.innerText = inventory.lifeBread;
}

// 1. 생명의 떡 사용하기 (누르면 바로 회복)
function useLifeBread() {
    if (inventory.lifeBread <= 0) {
        alert(t('alert_no_bread'));
        return;
    }
    if (playerHearts >= maxPlayerHearts) {
        alert(t('alert_hearts_full'));
        return;
    }

    // 사용 처리
    inventory.lifeBread--;
    playerHearts = Math.min(playerHearts + 3, maxPlayerHearts); // 3칸 회복

    SoundEffect.playCorrect(); // 띠링! 소리
    alert(t('alert_hearts_restored', { cur: playerHearts }));

    updateBattleUI();   // 하트 UI 갱신
    updateItemButtons(); // 생명의 떡 개수 UI 갱신
    saveGameData();     // 저장
}

// 2. 힌트 사용하기 (비용 고정 버전)
let isHintModalOpen = false;
const HINT_COST = 10; // ★ 비용이 증가하지 않도록 상수로 고정합니다.

function getCurrentHintCost() {
    if (window.isHardshipMode) {
        return hardshipState.mode === 'memory' ? HINT_COST : 0;
    }

    return isFocusedTrainingSession() ? 0 : HINT_COST;
}

function updateHintButtonLabels() {
    const hintCost = getCurrentHintCost();
    const hintLabel = hintCost > 0 ? `(💎${hintCost})` : `(${t('label_free')})`;
    const btnLabel = t('hint_btn_label');

    const setHintBtn = (btnId, costId) => {
        const btn = document.getElementById(btnId);
        const costSpan = document.getElementById(costId);
        if (btn) {
            // 텍스트 노드만 교체 (cost span 보존)
            const textNode = [...btn.childNodes].find(n => n.nodeType === 3);
            if (textNode) textNode.textContent = btnLabel + ' ';
        }
        if (costSpan) costSpan.textContent = hintLabel;
    };

    setHintBtn('training-hint-btn', 'training-hint-cost');
    setHintBtn('battle-hint-btn', 'battle-hint-cost');

    const hardshipHintCost = document.getElementById('common-hardship-hint-cost');
    if (hardshipHintCost) hardshipHintCost.textContent = hintLabel;
    const hardshipHintLabelSpan = document.getElementById('common-hardship-hint-label');
    if (hardshipHintLabelSpan) hardshipHintLabelSpan.textContent = btnLabel;
}

function useHint() {
    if (isHintModalOpen) return;

    if (window.isHardshipMode) {
        if (hardshipState.mode !== 'memory') return;
        useHardshipMemoryHint();
        return;
    }

    const hintCost = getCurrentHintCost();
    battleHintCount++; // 힌트 사용 횟수 누적
    // 보스전(훈련/고난 아닐 때)에만 bossHintCount 증가
    if (!window.isTrainingMode && !window.isHardshipMode) bossHintCount++;

    if (hintCost > 0 && myGems < hintCost) {
        alert(t('alert_hint_no_gems', { cost: hintCost }));
        return;
    }

    const screen = document.getElementById('game-screen');
    const isTraining = screen.classList.contains('mode-training');

    if (isTraining && currentStep === 1) {
        alert(t('alert_hint_read_aloud'));
        return;
    }

    // 안내 문구
    if (hintCost > 0) {
        if (!confirm(t('hint_confirm', { cost: hintCost }))) {
            return;
        }
    }

    // 보석 차감 및 입력 비활성화
    if (hintCost > 0) {
        myGems -= hintCost;
        updateGemDisplay();
        saveGameData();
    }
    SoundEffect.playClick();
    disableGameInputs(true);
    isHintModalOpen = true;

    // ★ 누적 비용을 계산하던 찌꺼기 코드(hintCost += 5 등) 완전 제거

    // 힌트 모달 생성 및 표시
    showHintModal({
        cost: hintCost,
        onClose: () => {
            isHintModalOpen = false;
            disableGameInputs(false);
        }
    });
}

function showHintModal({ cost, onClose }) {
    if (document.getElementById('hint-modal')) return;

    let hintText = '';
    const screen = document.getElementById('game-screen');
    const isTraining = screen.classList.contains('mode-training');
    let verse = '';
    let highlightHtml = '';

    if (isTraining) {
        // step5 힌트 undefined 방지
        if (!trainingVerseData || !trainingVerseData.text) {
            alert(t('alert_hint_load_error'));
            if (typeof onClose === 'function') onClose();
            return;
        }
        if (typeof trainingVerseData === 'object' && trainingVerseData.text) {
            verse = trainingVerseData.text;
        }

        if (currentStep === 2 && typeof trainingVerseData.chunks === 'object') {
            const idx = window.currentSlotIndex;
            highlightHtml = trainingVerseData.chunks.map((w, i) =>
                i === idx ? `<span style='background:#ffe066; border-radius:5px;'>${w}</span>` : w
            ).join(' ');
            hintText = `<div style='margin-top:10px;'>${t('hint_step2_current')}${highlightHtml}</div>`;
        } else if (currentStep === 3 && typeof trainingVerseData.text === 'string') {
            const targetSlot = document.querySelector('.blank-slot');
            if (targetSlot) {
                const answer = targetSlot.dataset.answer;
                highlightHtml = trainingVerseData.text.replace(answer, `<span style='background:#ffe066; border-radius:5px;'>${answer}</span>`);
                hintText = `<div style='margin-bottom:8px;'>${t('hint_step3_label')}</div><div style='font-size:1.1rem; color:#2c3e50;'>${highlightHtml}</div>`;
            } else {
                hintText = `<div style='font-size:1.1rem; color:#2c3e50;'>${trainingVerseData.text}</div>`;
            }
        } else if (currentStep === 4) {
            hintText = `<div style='font-size:1.1rem; color:#2c3e50;'>${trainingVerseData.text}</div><div style='margin-top:10px; color:#e74c3c;'>${t('hint_step4_fake')}</div>`;
        } else if (currentStep === 5) {
            hintText = `<div style='font-size:1.1rem; color:#2c3e50;'>${trainingVerseData.text}</div>`;
        } else {
            hintText = `<div style='font-size:1.1rem; color:#2c3e50;'>${trainingVerseData.text}</div>`;
        }
    } else {
        if (typeof currentVerseData === 'object' && currentVerseData.verse) {
            verse = currentVerseData.verse;
        }

        // ★ [버그 픽스] 전체 구절이 아닌 '현재 풀고 있는 파트(currentBossChunks)'를 기준으로 힌트 생성
        let targetChunks = null;
        if (typeof currentBossChunks !== 'undefined' && currentBossChunks && currentBossChunks.length > 0) {
            targetChunks = currentBossChunks;
        } else if (typeof currentVerseData === 'object' && currentVerseData.chunks) {
            targetChunks = currentVerseData.chunks;
        }

        if (targetChunks) {
            const zone = document.getElementById('answer-zone');
            // 'placeholder-text' 같은 안내 문구가 섞여있을 수 있으므로 순수 word-block만 셉니다.
            const currentBlocks = Array.from(zone.querySelectorAll('.word-block')).filter(b => b.id !== 'placeholder-text');
            const idx = currentBlocks.length;

            highlightHtml = targetChunks.map((w, i) =>
                i === idx ? `<span style='background:#ffe066; border-radius:5px; padding:0 3px;'>${w}</span>` : w
            ).join(' ');

            hintText = `
                <div style='margin-bottom:8px; font-weight:bold;'>${t('hint_boss_full_verse')}</div>
                <div style='font-size:1.1rem; color:#2c3e50; margin-bottom:15px;'>${verse}</div>
                <div style='margin-bottom:8px; font-weight:bold; color:#e74c3c;'>${t('hint_boss_current_part')}</div>
                <div style='font-size:1.1rem; color:#2c3e50;'>${highlightHtml}</div>
            `;
        } else {
            hintText = `<div style='font-size:1.1rem; color:#2c3e50;'>${verse}</div>`;
        }
    }

    const modal = document.createElement('div');
    modal.id = 'hint-modal';
    modal.className = 'modal-overlay';
    modal.style.zIndex = 9999;
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="result-card" style="max-width:400px; text-align:center;">
            <div style="text-align:right;">
                <button id="hint-modal-close" style="background:none; border:none; font-size:1.5rem; color:#95a5a6; cursor:pointer;">✕</button>
            </div>
            <div style="margin-bottom:10px; font-size:1.1rem; color:#2c3e50;">
                ${cost > 0 ? t('hint_modal_header', { cost }) : t('hint_modal_header_free')}
            </div>
            <div style="margin-bottom:20px; color:#34495e;">${hintText}</div>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('hint-modal-close').onclick = function () {
        document.body.removeChild(modal);
        if (typeof onClose === 'function') onClose();
    };
}

// 게임 입력/버튼 비활성화 (힌트 모달용)
function disableGameInputs(disable) {
    const btns = document.querySelectorAll('button, input, .word-block');
    btns.forEach(btn => {
        if (disable) {
            btn.setAttribute('disabled', 'disabled');
            btn.style.pointerEvents = 'none';
        } else {
            btn.removeAttribute('disabled');
            btn.style.pointerEvents = '';
        }
    });

    if (!disable) {
        const modalBtns = document.querySelectorAll('#hint-modal button');
        modalBtns.forEach(btn => {
            btn.removeAttribute('disabled');
            btn.style.pointerEvents = '';
        });
    }
}

/* [시스템: 미션 UI & 탭 로직] */
let currentMissionTab = 'daily'; // 현재 보고 있는 탭

/* [시스템: 미션 탭 전환 기능] */
function switchMissionTab(tabName) {
    currentMissionTab = tabName; // 현재 탭 기억

    // 1. 탭 버튼 스타일 업데이트
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => {
        // 버튼의 onclick 속성을 확인해서 현재 탭과 일치하면 활성화
        if (btn.getAttribute('onclick').includes(tabName)) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // 2. 목록 다시 그리기
    renderMissionList(tabName);
}

/* [수정] 미션 목록 렌더링 (초기화 안내 문구 추가) */
function renderMissionList(tabName) {
    const listArea = document.getElementById('mission-list-area');
    if (!listArea) return;

    listArea.innerHTML = ""; // 기존 목록 초기화

    // 1. [추가됨] 초기화 안내 문구 삽입
    const resetInfoText = tabName === 'daily' ? t('mission_reset_daily') : t('mission_reset_weekly');

    const infoDiv = document.createElement('div');
    infoDiv.style.textAlign = "center";
    infoDiv.style.fontSize = "0.85rem";
    infoDiv.style.color = "#7f8c8d"; // 은은한 회색
    infoDiv.style.marginBottom = "15px"; // 목록과의 간격
    infoDiv.style.padding = "5px";
    infoDiv.style.backgroundColor = "rgba(0,0,0,0.1)"; // 살짝 어두운 배경
    infoDiv.style.borderRadius = "10px";
    infoDiv.style.display = "inline-block"; // 글자 크기만큼만 배경 차지

    // 가운데 정렬을 위한 래퍼(Wrapper) 생성
    const wrapperDiv = document.createElement('div');
    wrapperDiv.style.textAlign = "center";
    wrapperDiv.style.width = "100%";

    infoDiv.innerText = resetInfoText;
    wrapperDiv.appendChild(infoDiv);
    listArea.appendChild(wrapperDiv);


    // 2. 미션 내용 정의
    let missions = [];

    if (tabName === 'daily') {
        missions = [
            {
                id: 0,
                title: t('mission_daily_0_title'),
                desc: t('mission_daily_0_desc'),
                target: 1,
                current: missionData.daily.loginReward || 0,
                reward: "💎 100",
                rewardType: 'gem', val1: 100, val2: 0,
                claimed: missionData.daily.claimed[0]
            },
            {
                id: 1,
                title: t('mission_daily_1_title'),
                desc: t('mission_daily_1_desc'),
                target: 1,
                current: missionData.daily.newClear,
                reward: "💎 300",
                rewardType: 'gem', val1: 300, val2: 0,
                claimed: missionData.daily.claimed[1]
            },
            {
                id: 2,
                title: t('mission_daily_2_title'),
                desc: t('mission_daily_2_desc'),
                target: 1,
                current: missionData.daily.checkpointBoss,
                reward: "💎 500",
                rewardType: 'gem', val1: 500, val2: 0,
                claimed: missionData.daily.claimed[2]
            },
            {
                id: 3,
                title: t('mission_daily_3_title'),
                desc: t('mission_daily_3_desc'),
                target: 1,
                current: missionData.daily.backup || 0,
                reward: "💎 100",
                rewardType: 'gem',
                val1: 100, val2: 0,
                claimed: missionData.daily.claimed[3]
            }
        ];
    } else {
        missions = [
            {
                id: 0,
                title: t('mission_weekly_0_title'),
                desc: t('mission_weekly_0_desc'),
                target: 5,
                current: missionData.weekly.attendance,
                reward: "💎 1,000",
                rewardType: 'gem', val1: 1000,
                claimed: missionData.weekly.claimed[0]
            },
            {
                id: 1,
                title: t('mission_weekly_1_title'),
                desc: t('mission_weekly_1_desc'),
                target: 5,
                current: missionData.weekly.dragonKill,
                reward: "💎 3,000",
                rewardType: 'gem', val1: 3000,
                claimed: missionData.weekly.claimed[1]
            },
            {
                id: 2,
                title: t('mission_weekly_2_title'),
                desc: t('mission_weekly_2_desc'),
                target: 15,
                current: missionData.weekly.stageClear,
                reward: "💎 2,000",
                rewardType: 'gem', val1: 2000,
                claimed: missionData.weekly.claimed[2]
            }
        ];
    }

    missions.forEach(m => {
        // 진행도 계산 (100% 넘지 않게)
        const percent = Math.min(100, Math.floor((m.current / m.target) * 100));
        const isComplete = m.current >= m.target;

        // 카드 요소 생성
        const div = document.createElement('div');
        div.className = 'mission-item';

        // 버튼 상태 결정
        let btnHtml = "";
        if (m.claimed) {
            btnHtml = `<button class="btn-claim done">${t('mission_btn_done')}</button>`;
        } else if (isComplete) {
            btnHtml = `<button class="btn-claim ready" onclick="claimReward('${tabName}', ${m.id}, '${m.rewardType}', ${m.val1 || 0}, ${m.val2 || 0})">${t('mission_btn_claim')}</button>`;
        } else {
            if (tabName === 'daily' && m.id === 3) {
                btnHtml = `<button class="btn-claim" style="background:#3498db; color:white; border:none; cursor:pointer;" onclick="openDataSettings()">${t('mission_btn_goto')}</button>`;
            } else {
                btnHtml = `<button class="btn-claim" disabled>${m.current}/${m.target}</button>`;
            }
        }

        div.innerHTML = `
            <div class="mission-info">
                <div class="mission-title">${m.title} <span style="font-size:0.8rem; color:#e67e22; font-weight:normal;">(${m.reward})</span></div>
                <div class="mission-desc">${m.desc}</div>
                <div class="mission-progress-bg">
                    <div class="mission-progress-bar" style="width: ${percent}%"></div>
                </div>
            </div>
            <div>${btnHtml}</div>
        `;

        listArea.appendChild(div);
    });
}

/* [UI: 미션 화면 (하단 버튼 디자인 적용)] */
function openMission() {
    // 화면 전환
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));

    let screen = document.getElementById('mission-screen');
    if (!screen) {
        screen = document.createElement('div');
        screen.id = 'mission-screen';
        screen.className = 'screen';
        // flex 레이아웃 적용
        screen.style.display = 'flex';
        screen.style.flexDirection = 'column';

        screen.innerHTML = `
            <div class="map-header" style="justify-content: center; flex-shrink: 0;">
                <div style="font-weight:bold; font-size:1.3rem;" data-i18n="mission_screen_title">${t('mission_screen_title')}</div>
            </div>

            <div class="mission-list" id="mission-list-area" style="flex: 1; overflow-y: auto; padding: 20px;">
                </div>

            <div class="button-area-static">
        <button class="btn-gray btn-back" onclick="goMap()" data-i18n="btn_back">${t('btn_back')}</button>
    </div>
        `;
        document.body.appendChild(screen);
    }

    ensureBackButton(screen);

    // 화면 켜기 (CSS 클래스 대신 display flex를 직접 줬으므로 active만 추가)
    screen.classList.add('active');

    // 상단 탭 버튼 UI 추가 (헤더 아래에 탭이 있어야 함)
    // 기존 HTML 구조를 살리면서 디자인을 적용하기 위해 재구성
    const listArea = document.getElementById('mission-list-area');

    // 탭 버튼 영역이 없으면 생성 (리스트 위에)
    if (!screen.querySelector('.mission-tabs')) {
        const tabContainer = document.createElement('div');
        tabContainer.className = 'mission-tabs';
        tabContainer.style.cssText = "display:flex; justify-content:center; gap:10px; padding: 10px; background: var(--bg-dark); flex-shrink: 0;";
        tabContainer.innerHTML = `
            <button class="tab-btn active" onclick="switchMissionTab('daily')">${t('mission_tab_daily')}</button>
            <button class="tab-btn" onclick="switchMissionTab('weekly')">${t('mission_tab_weekly')}</button>
        `;
        // 헤더 바로 다음에 삽입
        screen.insertBefore(tabContainer, listArea);
    }

    // 미션 목록 렌더링 시작
    switchMissionTab('daily');
    // 백버튼 가시성 갱신 (미션 화면에서는 보여야 함)
    if (typeof updateBackButtonVisibility === 'function') updateBackButtonVisibility();
}

/* [시스템: 생명책 (도감) 로직 - 통합 점수 & 랭크 시스템] */
let currentLifeBookChapter = 1;

/* [UI: 생명책 화면 (하단 버튼 디자인 적용)] */
function openLifeBook() {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));

    // ★ 매번 새로 생성 (HTML 업데이트 보장)
    let screen = document.getElementById('life-book-screen');
    if (screen) screen.remove();

    screen = document.createElement('div');
    screen.id = 'life-book-screen';
    screen.className = 'screen';
    // flex 레이아웃
    screen.style.display = 'flex';
    screen.style.flexDirection = 'column';

    screen.innerHTML = `
            <div class="life-book-header" style="padding:20px; text-align:center; background:#2c3e50; z-index:10; border-bottom:1px solid rgba(255,255,255,0.1); flex-shrink: 0;">
                <div style="display:flex; align-items:center; justify-content:center; gap:10px;">
                    <h1 style="color:#f1c40f; margin:0;">${t('library_title')}</h1>
                    <button onclick="document.getElementById('life-book-help').classList.toggle('hidden'); document.getElementById('help-icon').textContent = document.getElementById('life-book-help').classList.contains('hidden') ? '❓' : '❌';" style="background:none; border:none; font-size:1.3rem; cursor:pointer; padding:5px; color:#f1c40f;" id="help-icon">❓</button>
                </div>

                <div id="life-book-help" class="hidden" style="background:rgba(52, 73, 94, 0.8); padding:15px; border-radius:10px; margin:10px 0; text-align:left; border-left:3px solid #f1c40f;">
                    <div style="font-size:0.85rem; color:#bdc3c7; line-height:1.6;">
                        <div style="margin-bottom:8px;"><strong style="color:#f1c40f;">${t('library_help_what_title')}</strong></div>
                        <div>${t('library_help_what_desc')}</div>
                        <div style="margin-top:12px; border-top:1px dashed rgba(255,255,255,0.1); padding-top:10px;">
                            <div style="margin-bottom:8px;"><strong style="color:#f1c40f;">${t('library_help_score_title')}</strong></div>
                            <div>${t('library_help_score_items')}</div>
                        </div>
                        <div style="margin-top:12px; border-top:1px dashed rgba(255,255,255,0.1); padding-top:10px;">
                            <div style="margin-bottom:8px;"><strong style="color:#f1c40f;">${t('library_help_rank_title')}</strong></div>
                            <div style="font-size:0.8rem;">${t('library_help_rank_items')}</div>
                        </div>
                    </div>
                </div>

                <div style="background:rgba(0,0,0,0.3); padding:15px; border-radius:15px; margin-top:10px;">
                    <div style="font-size:0.9rem; color:#bdc3c7;">${t('library_current_score')}</div>
                    <div style="font-size:2rem; font-weight:bold; color:#fff; text-shadow:0 0 10px #f1c40f;">
                        <span id="collection-score">0</span> <span style="font-size:1rem;">pts</span>
                    </div>
                    <div style="margin-top:15px; padding-top:15px; border-top:1px dashed rgba(255,255,255,0.1);">
                        <div style="font-size:0.8rem; color:#bdc3c7; margin-bottom:5px;">${t('library_rank_label')}</div>
                        <div id="collection-rank-label" style="font-size:1.5rem; font-weight:bold; color:#95a5a6;"></div>
                        <div id="collection-rank-buff" style="font-size:0.9rem; color:#2ecc71; margin-top:5px;">${t('library_no_buff')}</div>
                    </div>
                </div>
                
                <div id="lb-chapter-selector">
                    </div>
            </div>

            <div id="card-grid" style="flex: 1; overflow-y: auto; padding:15px; display:grid; grid-template-columns: repeat(3, 1fr); gap:10px; align-content: start;">
                </div>

            <div class="button-area-static">
        <button class="btn-gray btn-back" onclick="goMap()">${t('btn_go_back')}</button>
    </div>
        `;

    document.body.appendChild(screen);

    ensureBackButton(screen);
    screen.classList.add('active');

    // 내용 채우기 (기존 함수인 renderLifeBook 호출)
    renderLifeBook();
    // 백버튼 가시성 갱신 (도감 화면에서는 보여야 함)
    if (typeof updateBackButtonVisibility === 'function') updateBackButtonVisibility();
}

/* [시스템: 생명책 (도감) 로직 - 업데이트 버전] */
function renderLifeBook() {
    // 1. 챕터 선택 버튼 그리기 (기존과 동일)
    const selector = document.getElementById('lb-chapter-selector');
    selector.innerHTML = "";
    for (let i = 1; i <= 22; i++) {
        const btn = document.createElement('button');
        btn.className = `lb-chapter-btn ${i === currentLifeBookChapter ? 'active' : ''}`;
        btn.innerText = t('label_chapter', { num: i });
        btn.onclick = () => {
            currentLifeBookChapter = i;
            renderLifeBook();
        };
        selector.appendChild(btn);
    }
    const activeBtn = selector.querySelector('.active');
    if (activeBtn) activeBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });

    // 2. 전체 통합 점수 계산
    let grandTotalScore = 0;
    for (let ch = 1; ch <= 22; ch++) {
        if (bibleData[ch]) {
            bibleData[ch].forEach((v, idx) => {
                const sId = `${ch}-${idx + 1}`;
                const count = stageMastery[sId] || 0;
                if (count >= 20) grandTotalScore += 50;
                else if (count >= 10) grandTotalScore += 30;
                else if (count >= 5) grandTotalScore += 20;
                else if (count >= 1) grandTotalScore += 10;
            });
        }
    }

    // 3. ★ 다음 경지까지 남은 점수 계산 ★
    const nextRank = getNextCollectionRank(grandTotalScore);
    const nextRankTitle = nextRank ? (currentLang === 'en' && nextRank.titleEn ? nextRank.titleEn : nextRank.title) : '';
    const nextGoalText = nextRank
        ? t('library_next_rank', { title: nextRankTitle, remain: (nextRank.min - grandTotalScore).toLocaleString() })
        : t('library_max_score');

    // 4. UI 업데이트
    document.getElementById('collection-score').innerText = grandTotalScore.toLocaleString();

    const rankInfo = getCollectionRank(grandTotalScore);
    const rankLabel = document.getElementById('collection-rank-label');
    const rankBuff = document.getElementById('collection-rank-buff');

    if (rankLabel) {
        // 직분 이름 + 아래에 작은 글씨로 남은 점수 표시
        const rankTitle = (currentLang === 'en' && rankInfo.titleEn) ? rankInfo.titleEn : rankInfo.title;
        rankLabel.innerHTML = `
            ${rankTitle}
            <div style="font-size:0.8rem; color:#7f8c8d; font-weight:normal; margin-top:5px; opacity:0.8;">
                ${nextGoalText}
            </div>
        `;
        rankLabel.style.color = rankInfo.color;

        // 현재 레벨의 보너스 표시
        let buffText = "";
        if (rankInfo.gemBonus > 0 || rankInfo.wrongCorrection > 0 || rankInfo.scoreBonus > 0) {
            let buffItems = [];
            if (rankInfo.gemBonus > 0) buffItems.push(t('library_buff_gem', { n: rankInfo.gemBonus }));
            if (rankInfo.wrongCorrection > 0) buffItems.push(t('library_buff_wrong', { n: rankInfo.wrongCorrection }));
            if (rankInfo.scoreBonus > 0) buffItems.push(t('library_buff_score', { n: rankInfo.scoreBonus }));
            buffText = buffItems.join(" · ");
        } else {
            buffText = t('library_no_buff');
        }
        rankBuff.innerHTML = buffText;
    }

    // 5. 카드 그리드 그리기 (기존과 동일)
    const grid = document.getElementById('card-grid');
    grid.innerHTML = "";
    let targetData = bibleData[currentLifeBookChapter] || [];

    if (targetData.length === 0) {
        grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:50px; color:#7f8c8d;">${t('library_preparing')}</div>`;
    } else {
        targetData.forEach((verse, index) => {
            const verseNum = index + 1;
            const stageId = `${currentLifeBookChapter}-${verseNum}`;
            const count = stageMastery[stageId] || 0;

            if (count === 0) {
                const div = document.createElement('div');
                div.className = 'card-item';
                div.style.background = '#34495e';
                div.style.border = '2px dashed #7f8c8d';
                div.innerHTML = `<div style="font-size:2rem;">🔒</div><div style="color:#7f8c8d; font-size:0.8rem; margin-top:5px;">${t('label_verse', { num: verseNum })}</div>`;
                div.onclick = () => alert(t('alert_locked_first_clear'));
                grid.appendChild(div);
                return;
            }

            let tierClass = 'tier-bronze', tierName = 'Bronze';
            if (count >= 20) { tierClass = 'tier-diamond'; tierName = 'Diamond'; }
            else if (count >= 10) { tierClass = 'tier-gold'; tierName = 'Gold'; }
            else if (count >= 5) { tierClass = 'tier-silver'; tierName = 'Silver'; }

            const card = document.createElement('div');
            card.className = `card-item ${tierClass}`;
            card.innerHTML = `
                <div class="card-num">${currentLifeBookChapter}:${verseNum}</div>
                <div class="card-tier-label">${tierName}</div>
                <div style="font-size:0.7rem; color:#555; margin-top:5px;">${t('library_mastery', { count })}</div>
            `;
            card.onclick = () => {
                alert(t('alert_life_book_verse', { ch: currentLifeBookChapter, v: verseNum, text: verse.text }));
            };
            grid.appendChild(card);
        });
    }
}

// [보조 함수] 점수에 따른 경지 계산 (10단계) - 레벨별 보너스 포함
const COLLECTION_RANKS = [
    { min: 0, title: "좋은 땅에 뿌린 씨", titleEn: "Seed on Good Soil", color: "#95a5a6", gemBonus: 0, wrongCorrection: 0, scoreBonus: 0 },
    { min: 1000, title: "단단한 뿌리", titleEn: "Strong Root", color: "#2ecc71", gemBonus: 5, wrongCorrection: 0, scoreBonus: 0 },
    { min: 2500, title: "수줍은 새싹", titleEn: "Tender Sprout", color: "#7f8c8d", gemBonus: 5, wrongCorrection: 1, scoreBonus: 0 },
    { min: 4000, title: "푸르른 본잎", titleEn: "True Leaves", color: "#27ae60", gemBonus: 5, wrongCorrection: 1, scoreBonus: 5 },
    { min: 6000, title: "곧게 뻗은 줄기", titleEn: "Upright Stem", color: "#3498db", gemBonus: 10, wrongCorrection: 1, scoreBonus: 5 },
    { min: 8500, title: "풍성한 가지", titleEn: "Fruitful Branch", color: "#16a085", gemBonus: 10, wrongCorrection: 2, scoreBonus: 5 },
    { min: 11000, title: "강인한 나무", titleEn: "Mighty Tree", color: "#9b59b6", gemBonus: 10, wrongCorrection: 2, scoreBonus: 10 },
    { min: 14000, title: "간절한 꽃봉오리", titleEn: "Eager Bud", color: "#8e44ad", gemBonus: 15, wrongCorrection: 2, scoreBonus: 10 },
    { min: 17000, title: "눈부신 개화", titleEn: "Radiant Bloom", color: "#f1c40f", gemBonus: 15, wrongCorrection: 3, scoreBonus: 10 },
    { min: 20000, title: "처음 익은 열매", titleEn: "Firstfruits", color: "#e74c3c", gemBonus: 15, wrongCorrection: 3, scoreBonus: 15 }
];

// 현재 도감 점수 계산
function getCurrentCollectionScore() {
    let score = 0;
    for (let ch = 1; ch <= 22; ch++) {
        if (bibleData[ch]) {
            bibleData[ch].forEach((v, idx) => {
                const count = stageMastery[`${ch}-${idx + 1}`] || 0;
                if (count >= 20) score += 50;
                else if (count >= 10) score += 30;
                else if (count >= 5) score += 20;
                else if (count >= 1) score += 10;
            });
        }
    }
    return score;
}

function getCollectionRank(score) {
    for (let i = COLLECTION_RANKS.length - 1; i >= 0; i--) {
        if (score >= COLLECTION_RANKS[i].min) return COLLECTION_RANKS[i];
    }
    return COLLECTION_RANKS[0];
}

function getNextCollectionRank(score) {
    for (let i = 0; i < COLLECTION_RANKS.length; i++) {
        if (score < COLLECTION_RANKS[i].min) return COLLECTION_RANKS[i];
    }
    return null;
}

/* [시스템: 일일 보급 (Daily Reward)] */
function checkDailyReward() {
    // 1. 오늘 날짜 구하기 (YYYY-MM-DD 형식)
    const today = new Date().toISOString().split('T')[0];
    const lastDate = localStorage.getItem('kingsRoad_lastLoginDate');

    // 2. 이미 오늘 보상을 받았으면 패스
    if (lastDate === today) return;

    // 3. 현재 도감 점수 계산
    let currentTotalScore = 0;
    for (let ch = 1; ch <= 22; ch++) {
        if (bibleData[ch]) {
            bibleData[ch].forEach((v, idx) => {
                const count = stageMastery[`${ch}-${idx + 1}`] || 0;
                if (count >= 20) currentTotalScore += 50;
                else if (count >= 10) currentTotalScore += 30;
                else if (count >= 5) currentTotalScore += 20;
                else if (count >= 1) currentTotalScore += 10;
            });
        }
    }

    // 4. [성도] 등급(1000점) 이상인지 확인
    if (currentTotalScore >= 1000) {
        // 보석 지급
        const dailyBonus = 50;
        myGems += dailyBonus;

        // 저장 및 알림
        localStorage.setItem('kingsRoad_lastLoginDate', today);
        saveGameData();
        updateGemDisplay();

        // 환영 메시지
        setTimeout(() => {
            alert(t('alert_daily_bonus', { count: dailyBonus, total: myGems }));
        }, 500);
    } else {
        // 성도가 아니더라도 날짜는 갱신
        localStorage.setItem('kingsRoad_lastLoginDate', today);
    }
}

/* =========================================
   [시스템: 천국 침노 랭킹전 (Kingdom League) & XP 시스템]
   ========================================= */


/* [기능] 시즌 리셋 (새로운 주가 시작되었을 때) */
function resetLeague(newWeekId) {
    console.log(`🔄 새 시즌 감지: ${leagueData.weekId} → ${newWeekId}`);
    leagueData.weekId = newWeekId;
    // stageLog와 myScore는 checkDailyLogin에서 초기화하므로 여기선 weekId만 업데이트
}

/* [수정] calculateScore 함수 (반복 보너스 시스템) */
function calculateScore(stageId, type, verseCount, hearts, isForgotten) {
    let baseScore = 0;
    let bonus = 1.0;
    let isRetry = false;

    // 기본 점수 계산 (현재 하트 기준)
    if (type === 'boss' || type === 'mid-boss') {
        baseScore = verseCount * hearts * 1;  // 보스: hearts × 구절 수
    } else {
        baseScore = hearts * 1;  // 일반: hearts × 1
    }

    // ★ [v1.1.0] 복습 타이밍 점수 보너스 (isEligible = 복습 가능 타이밍)
    // isForgotten 파라미터가 true이면 복습 가능 타이밍으로 판단
    if (isForgotten) {
        const reviewSt = getReviewStatus(stageId);
        const step = reviewSt.step > 1 ? reviewSt.step - 1 : 1; // 방금 advanceReviewStep 했으므로 -1
        if (step >= 4) {
            baseScore = baseScore * 1.5; // 6시간 이상 기다린 복습: 점수 보너스
            isRetry = true;
        } else {
            isRetry = true;
        }
    }

    // ... (이하 부스터 적용 및 저장 로직 그대로 유지) ...

    checkBoosterStatus();
    const finalScore = Math.floor(baseScore * boosterData.multiplier);

    // 🎯 깨끗하게 정리된 누적 로직: 방금 얻은 승점만 순수하게 더해줍니다.
    leagueData.myScore = (leagueData.myScore || 0) + finalScore;
    leagueData.myMonthlyScore = (leagueData.myMonthlyScore || 0) + finalScore;

    // 🌟 [핵심 수술 2단계: 양손잡이 점수 획득]
    leagueData.totalScore = (leagueData.totalScore || 0) + finalScore; // 누적 점수도 영원히 오름!
    // 🌟 [추가] 연간 대항전 기여도에도 점수 더하기!
    leagueData.yearlyScore = (leagueData.yearlyScore || 0) + finalScore;

    if (typeof userStats !== 'undefined') {
        userStats.totalScoreEarned = (userStats.totalScoreEarned || 0) + finalScore;
    }

    saveGameData();

    return {
        score: finalScore,
        bonus: bonus,
        isRetry: isRetry,
        blocked: false,
    };
}

// 4. 부스터 활성화 함수
/* =========================================
   [시스템: 부스터 타이머 관리 로직] 
   ========================================= */

let boosterInterval = null; // 타이머 ID 저장용

// floating booster UI
function initBoosterFloat() {
    const root = document.getElementById('booster-float');
    const btn = document.getElementById('booster-float-btn');
    if (!root || !btn) return;

    let pointerId = null;
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;
    let moved = false;

    const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

    btn.addEventListener('pointerdown', (e) => {
        pointerId = e.pointerId;
        btn.setPointerCapture(pointerId);
        moved = false;

        const rect = root.getBoundingClientRect();
        startX = e.clientX;
        startY = e.clientY;
        startLeft = rect.left;
        startTop = rect.top;

        // disable centering transform after first drag interaction
        root.style.transform = 'none';
    });

    btn.addEventListener('pointermove', (e) => {
        if (pointerId !== e.pointerId) return;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved = true;

        const nextLeft = startLeft + dx;
        const nextTop = startTop + dy;

        const maxLeft = window.innerWidth - root.offsetWidth - 8;
        const maxTop = window.innerHeight - root.offsetHeight - 8;

        root.style.left = clamp(nextLeft, 8, maxLeft) + 'px';
        root.style.top = clamp(nextTop, 8, maxTop) + 'px';
    });

    btn.addEventListener('pointerup', (e) => {
        if (pointerId !== e.pointerId) return;
        btn.releasePointerCapture(pointerId);
        pointerId = null;

        if (!moved) {
            root.classList.toggle('open');
        }
    });
}

// 1. 부스터 활성화 함수 (기존 activateBooster 대체)
function activateBooster(multiplier, minutes) {
    const duration = minutes * 60 * 1000;
    const now = Date.now();

    // 이미 켜져 있으면 시간 연장
    if (boosterData.active && now < boosterData.endTime) {
        if (multiplier > boosterData.multiplier) {
            boosterData.multiplier = multiplier;
            alert(t('alert_booster_stronger', { multi: multiplier }));
        } else {
            alert(t('alert_booster_extended', { min: minutes }));
        }
        boosterData.endTime += duration;
    } else {
        // 새로 시작
        boosterData.active = true;
        boosterData.multiplier = multiplier;
        boosterData.endTime = now + duration;
        alert(t('alert_booster_started', { min: minutes, multi: multiplier }));
    }

    saveGameData();
    startBoosterTimer(); // 타이머 시작!
}

// 2. 타이머 시작 및 UI 갱신 (핵심 함수)
function startBoosterTimer() {
    // 기존 타이머가 돌고 있다면 정지 (중복 방지)
    if (boosterInterval) clearInterval(boosterInterval);

    // 즉시 한 번 실행 (화면 갱신)
    updateBoosterDisplay();

    // 1초마다 갱신
    boosterInterval = setInterval(() => {
        const isRunning = updateBoosterDisplay();
        if (!isRunning) {
            clearInterval(boosterInterval); // 시간 다 되면 타이머 종료
            boosterInterval = null;
        }
    }, 1000);
}

// 3. 화면에 남은 시간 표시
function updateBoosterDisplay() {
    if (document.hidden) return true;
    const now = Date.now();
    const remain = boosterData.endTime - now;

    // A. 부스터가 끝났거나 없을 때
    if (!boosterData.active || remain <= 0) {
        if (boosterData.active) {
            // 막 끝난 순간
            boosterData.active = false;
            boosterData.multiplier = 1;
            saveGameData();
            // 필요하다면 알림: alert("부스터 효과가 종료되었습니다.");
        }

        // 숨기기
        document.querySelectorAll('.booster-badge').forEach(el => el.style.display = 'none');
        const floatRoot = document.getElementById('booster-float');
        if (floatRoot) {
            floatRoot.style.display = 'none';
            floatRoot.classList.remove('open');
        }
        return false; // 타이머 멈춤 신호
    }

    // B. 부스터 진행 중
    const min = Math.floor(remain / 60000);
    const sec = Math.floor((remain % 60000) / 1000).toString().padStart(2, '0');
    const text = `승점 ${boosterData.multiplier}배 (${min}:${sec})`;

    // 플로팅 패널에만 표시
    const floatRoot = document.getElementById('booster-float');
    const floatPanel = document.getElementById('booster-float-panel');
    if (floatRoot && floatPanel) {
        floatRoot.style.display = 'flex';
        floatPanel.textContent = text;
    }

    return true; // 계속 실행
}

function checkBoosterStatus() {
    if (Date.now() > boosterData.endTime) {
        boosterData.multiplier = 1;
    }
}

// init floating booster UI
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBoosterFloat);
} else {
    initBoosterFloat();
}

// 주간 랭킹 카운트 캐시 (지파/전체)
let weeklyRankCounts = {
    weekId: null,
    totalCount: 0,
    tribeCounts: {},
    cutoffTotal: 0,
    cutoffTribes: {}
};

function loadWeeklyRankCounts() {
    if (typeof db === 'undefined' || !db) return;

    db.collection('system_meta').doc('weekly_counts').get()
        .then(doc => {
            if (!doc.exists) return;
            const data = doc.data();
            const currentWeekId = getWeekId();

            if (data.weekId !== currentWeekId) return;

            weeklyRankCounts = {
                weekId: data.weekId,
                totalCount: data.totalCount || 0,
                tribeCounts: data.tribeCounts || {},
                cutoffTotal: data.cutoffTotal || 0,
                cutoffTribes: data.cutoffTribes || {}
            };

            if (document.getElementById('ranking-screen')) {
                updateStickyMyRank(window.lastRankInTop100 === true);
            }
        })
        .catch(err => {
            console.error('❌ 주간 카운트 로드 실패:', err);
        });
}

function getCurrentRankingTotalCount() {
    const mode = window.currentRankingMode || 'tribe';
    if (mode === 'zion') {
        return weeklyRankCounts.totalCount || 0;
    }
    const tribeKey = String(myTribe);
    return (weeklyRankCounts.tribeCounts && weeklyRankCounts.tribeCounts[tribeKey]) || 0;
}

function getCurrentRankingCutoff() {
    const mode = window.currentRankingMode || 'tribe';
    if (mode === 'zion') {
        return weeklyRankCounts.cutoffTotal || 0;
    }
    const tribeKey = String(myTribe);
    return (weeklyRankCounts.cutoffTribes && weeklyRankCounts.cutoffTribes[tribeKey]) || 0;
}

function updateMyScorePanel() {
    const weeklyEl = document.getElementById('my-weekly-score');
    const monthlyEl = document.getElementById('my-monthly-score');
    const totalEl = document.getElementById('my-total-score'); // 🌟 추가
    const weekIdEl = document.getElementById('my-week-id');
    const monthIdEl = document.getElementById('my-month-id');

    if (!weeklyEl || !monthlyEl || !weekIdEl || !monthIdEl) return;

    const weekly = (leagueData && typeof leagueData.myScore === 'number') ? leagueData.myScore : 0;
    const monthly = (leagueData && typeof leagueData.myMonthlyScore === 'number') ? leagueData.myMonthlyScore : 0;
    const total = (leagueData && typeof leagueData.totalScore === 'number') ? leagueData.totalScore : 0; // 🌟 추가
    const weekId = (leagueData && leagueData.weekId) ? leagueData.weekId : getWeekId();
    const monthId = (leagueData && leagueData.monthId) ? leagueData.monthId : getMonthId();

    weeklyEl.textContent = weekly.toLocaleString();
    monthlyEl.textContent = monthly.toLocaleString();
    if (totalEl) totalEl.textContent = total.toLocaleString(); // 🌟 추가
    weekIdEl.textContent = weekId;
    monthIdEl.textContent = monthId;
}

function toggleMyScorePanel() {
    const panel = document.getElementById('my-score-panel');
    if (!panel) return;
    const isOpen = panel.style.display === 'block';
    panel.style.display = isOpen ? 'none' : 'block';
    if (!isOpen) updateMyScorePanel();
}

/* [수정] 랭킹 화면 열기 (팝업 모달 방식 적용) */
function openRankingScreen() {
    // 랭킹 오버레이 먼저 띄우기
    const overlay = document.getElementById('ranking-overlay');
    const amenBtn = document.getElementById('ranking-amen-btn');
    if (overlay) {
        overlay.style.display = 'flex';
    }
    if (amenBtn) {
        amenBtn.style.opacity = '0';
        amenBtn.style.pointerEvents = 'none';
        setTimeout(() => {
            amenBtn.style.opacity = '1';
            amenBtn.style.pointerEvents = 'auto';
        }, 1000);
        amenBtn.onclick = showRankingScreenReal;
    }

    // ====== 랭킹 화면 및 데이터 백그라운드 로딩 ======
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));

    let screen = document.getElementById('ranking-screen');

    if (!screen) {
        screen = document.createElement('div');
        screen.id = 'ranking-screen';
        screen.className = 'screen';
        screen.style.background = "#2c3e50";
        screen.style.overflowY = "auto";
        screen.innerHTML = `
    <div class="map-header" style="flex-direction:column; justify-content:center; border-bottom:1px solid rgba(255,255,255,0.1); padding:15px 10px;">
        <div style="font-weight:bold; font-size:1.2rem; color:white; margin-bottom:5px;">${t('ranking_board_title')}</div>
        <div id="season-timer-display" style="font-size:0.85rem; color:#bdc3c7; font-family:monospace; margin-bottom:10px;">${t('ranking_timer_loading')}</div>
        <div style="font-size:0.8rem; color:#95a5a6; margin-bottom:10px;">${t('ranking_update_schedule')}</div>
        
        <div style="display:flex; flex-direction:row; gap:8px; margin-top:5px; justify-content:center; width:100%; flex-wrap:wrap;">
            <button onclick="scrollToMyRank()" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.3); color: #ecf0f1; padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; cursor: pointer; display: flex; align-items: center; gap: 5px;">
                ${t('ranking_find_my_rank')}
            </button>
            <button onclick="toggleMyScorePanel()" style="background: rgba(241,196,15,0.15); border: 1px solid rgba(241,196,15,0.4); color: #f1c40f; padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; cursor: pointer; display: flex; align-items: center; gap: 5px;">
                ${t('ranking_my_score_panel')}
            </button>
        </div>

        <div id="my-score-panel" style="display:none; margin:10px 0 0 0; width:100%; max-width:320px; background:rgba(0,0,0,0.25); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:10px 12px; color:#ecf0f1; font-size:0.85rem;">
            <div style="display:flex; justify-content:space-between; margin-bottom:8px; padding-bottom:8px; border-bottom:1px dashed rgba(255,255,255,0.2);">
                <span style="color:#f1c40f; font-weight:bold;">${t('ranking_total_score')}</span>
                <span style="font-weight:bold; color:#f1c40f;"><span id="my-total-score">0</span> pts</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                <span>${t('ranking_weekly_score')}</span>
                <span style="font-weight:bold; color:#2ecc71;"><span id="my-weekly-score">0</span> pts</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                <span>${t('ranking_monthly_score')}</span>
                <span style="font-weight:bold; color:#3498db;"><span id="my-monthly-score">0</span> pts</span>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:#95a5a6;">
                <span>${t('ranking_week_label')} <span id="my-week-id">-</span></span>
                <span>${t('ranking_month_label')} <span id="my-month-id">-</span></span>
            </div>
        </div>
    </div>

    <div id="yearly-swipe-area" style="display:flex; overflow-x:auto; scroll-snap-type: x mandatory; gap:15px; padding:15px 5px 20px 5px; margin-top:10px; border-bottom:1px solid rgba(255,255,255,0.1); scrollbar-width: none;">
            <div style="min-width:85%; flex:0 0 auto; scroll-snap-align:center; background:linear-gradient(135deg, #2c3e50, #1a252f); border:2px solid #f39c12; border-radius:15px; padding:15px; box-shadow:0 8px 15px rgba(0,0,0,0.5); position:relative; overflow:hidden;">
                <div style="position:absolute; top:-10px; right:-15px; font-size:6rem; opacity:0.05; pointer-events:none;">🏆</div>
                <div style="text-align:center; font-weight:bold; color:#f1c40f; font-size:1.15rem; margin-bottom:5px; letter-spacing:-0.5px;">${t('ranking_yearly_battle')}</div>
                <div style="font-size:0.75rem; color:#bdc3c7; text-align:center; margin-bottom:15px;">${t('ranking_yearly_desc')}</div>
                <div id="yearly-top3-list" style="display:flex; flex-direction:column; gap:8px;">
                    <div style="text-align:center; padding:10px; color:#95a5a6; font-size:0.85rem;">${t('ranking_snapshot_waiting')}</div>
                </div>
            </div>
            <div style="min-width:85%; flex:0 0 auto; scroll-snap-align:center; background:linear-gradient(135deg, #34495e, #2c3e50); border:1px dashed rgba(255,255,255,0.2); border-radius:15px; padding:15px; opacity:0.8; display:flex; flex-direction:column; justify-content:center; align-items:center;">
                <div style="font-size:2.5rem; margin-bottom:10px;">📜</div>
                <div style="color:#bdc3c7; font-weight:bold; font-size:1.1rem;">${t('ranking_glory_coming')}</div>
                <div style="font-size:0.8rem; color:#95a5a6; text-align:center; margin-top:5px; line-height:1.4;">${t('ranking_glory_desc')}</div>
            </div>
    </div>

    <div style="background:#1a252f; padding:8px 12px; border-bottom:1px solid rgba(255,255,255,0.07); text-align:center;">
        <span style="font-size:0.78rem; color:#7f8c8d; line-height:1.5;">${t('ranking_reward_notice')}</span>
    </div>
    <div id="sticky-tabs-container" style="background: #2c3e50; padding: 10px 5px; border-bottom: 1px solid rgba(255,255,255,0.1); display:grid; grid-template-columns: 1fr 1fr; gap:6px;">
        <button id="tab-tribe" onclick="openRankingModal('tribe', t('label_my_tribe_ranking'))" style="padding:8px 5px; border-radius:8px; border:1px solid rgba(255,255,255,0.15); background:linear-gradient(145deg, rgba(255,255,255,0.05), rgba(0,0,0,0.2)); color:#bdc3c7; font-weight:bold; cursor:pointer; font-size:0.85rem; display:flex; justify-content:center; align-items:center; gap:5px;">
            <span style="font-size:1rem;">🧭</span><span>${t('label_my_tribe')}</span>
        </button>
        <button id="tab-zion" onclick="openRankingModal('zion', '👑 Zion')" style="padding:8px 5px; border-radius:8px; border:1px solid rgba(255,255,255,0.15); background:linear-gradient(145deg, rgba(255,255,255,0.05), rgba(0,0,0,0.2)); color:#bdc3c7; font-weight:bold; cursor:pointer; font-size:0.85rem; display:flex; justify-content:center; align-items:center; gap:5px;">
            <span style="font-size:1rem;">👑</span><span>Zion</span>
        </button>
        <button id="tab-weekly-hall" onclick="openRankingModal('weekly-hall', t('ranking_tab_weekly_full'))" style="padding:8px 5px; border-radius:8px; border:1px solid rgba(255,255,255,0.15); background:linear-gradient(145deg, rgba(255,255,255,0.05), rgba(0,0,0,0.2)); color:#bdc3c7; font-weight:bold; cursor:pointer; font-size:0.85rem; display:flex; justify-content:center; align-items:center; gap:5px;">
            <span style="font-size:1rem;">🏛️</span><span>${t('ranking_tab_weekly')}</span>
        </button>
        <button id="tab-monthly-hall" onclick="openRankingModal('monthly-hall', t('ranking_tab_monthly_full'))" style="padding:8px 5px; border-radius:8px; border:1px solid rgba(255,255,255,0.15); background:linear-gradient(145deg, rgba(255,255,255,0.05), rgba(0,0,0,0.2)); color:#bdc3c7; font-weight:bold; cursor:pointer; font-size:0.85rem; display:flex; justify-content:center; align-items:center; gap:5px;">
            <span style="font-size:1rem;">📜</span><span>${t('ranking_tab_monthly')}</span>
        </button>
        <button id="tab-total-hall" onclick="openRankingModal('total-hall', t('ranking_tab_total_full'))" style="grid-column: 1 / span 2; padding:10px 5px; border-radius:8px; border:1px solid rgba(255,255,255,0.15); background:linear-gradient(145deg, rgba(255,255,255,0.05), rgba(0,0,0,0.2)); color:#bdc3c7; font-weight:bold; cursor:pointer; font-size:0.95rem; display:flex; justify-content:center; align-items:center; gap:6px;">
            <span style="font-size:1.1rem;">💎</span><span>${t('ranking_tab_total')}</span>
        </button>
    </div>

    <div id="ranking-modal-overlay" onclick="if(event.target === this) closeRankingModal()" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.75); z-index:9999; justify-content:center; align-items:center; padding:20px; box-sizing:border-box;">
        <div style="background:#2c3e50; border:2px solid #f39c12; border-radius:15px; width:100%; max-width:400px; height:75vh; display:flex; flex-direction:column; box-shadow:0 10px 30px rgba(0,0,0,0.9); overflow:hidden;">
            <div style="display:flex; justify-content:space-between; align-items:center; padding:15px; background:rgba(0,0,0,0.2); border-bottom:1px solid rgba(255,255,255,0.1);">
                <h3 id="ranking-modal-title" style="margin:0; color:#f1c40f; font-size:1.1rem; font-weight:bold;">${t('ranking_modal_default_title')}</h3>
                <button onclick="closeRankingModal()" style="background:none; border:none; color:#ecf0f1; font-size:1.8rem; cursor:pointer; padding:0 10px; line-height:0.8;">&times;</button>
            </div>
            
            <div id="ranking-list" style="flex:1; overflow-y:auto; padding:10px; background:#1a252f; scrollbar-width: none;">
            </div>

            <div id="modal-my-rank-footer" style="display:none; background: rgba(30, 40, 50, 0.98); border-top: 1px solid rgba(255,255,255,0.1); padding: 12px 15px; flex-shrink: 0; align-items: center;">
            </div>
        </div>
    </div>

    <div class="button-area-static">
        <button class="btn-gray btn-back" onclick="goMap()">${t('btn_go_back')}</button>
    </div>
    `;
        document.body.appendChild(screen);
    }
    screen.classList.add('active');
    startSeasonTimer();
    loadWeeklyRankCounts();
    updateMyScorePanel();
    if (typeof loadYearlyTribeRanking === 'function') loadYearlyTribeRanking();
    if (typeof enableDragToScroll === 'function') enableDragToScroll('yearly-swipe-area');
    if (typeof updateBackButtonVisibility === 'function') updateBackButtonVisibility();
}

function showRankingScreenReal() {
    const overlay = document.getElementById('ranking-overlay');
    const amenBtn = document.getElementById('ranking-amen-btn');
    if (overlay) overlay.style.display = 'none';
    if (amenBtn) {
        amenBtn.style.opacity = '0';
        amenBtn.style.pointerEvents = 'none';
    }
}

/* [추가] 지파/시온성 랭킹 로드 */
function loadTribeRanking() {
    const list = document.getElementById('ranking-list');
    if (!list) return;

    const tribeName = (TRIBE_DATA[myTribe] && TRIBE_DATA[myTribe].name) ? getTribeName(TRIBE_DATA[myTribe]) : t('label_my_tribe');
    list.innerHTML = `<div style="text-align:center; padding:50px; color:#bdc3c7;">${t('ranking_loading_tribe', { name: tribeName })}</div>`;

    window.currentRankingMode = 'tribe';
    loadTribeLeaderboard(myTribe, (data) => renderRankingList(data));
}

function loadZionRanking() {
    const list = document.getElementById('ranking-list');
    if (!list) return;

    list.innerHTML = `<div style="text-align:center; padding:50px; color:#bdc3c7;">${t('ranking_loading_zion')}</div>`;

    window.currentRankingMode = 'zion';
    loadZionLeaderboard((data) => renderRankingList(data));
}
// [추가] 랭킹 데이터 필터링 (독립적인 함수로 바깥에 배치)
function filterAndCleanRanking(ranks) {
    if (!ranks || !Array.isArray(ranks)) return [];
    const seen = new Set();
    return ranks.filter(user => {
        if (!user || typeof user.score !== 'number' || user.score <= 0) return false;
        const key = user.tag || user.name;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

/* [데이터] 주간 지파/시온성 랭킹 로드 (+ 캐싱) */
function loadTribeLeaderboard(tribeId, callback) {
    if (typeof db === 'undefined' || !db) {
        callback([]);
        return;
    }

    const now = Date.now();

    // ✨ 캐시 확인
    if (!rankingCache.tribes[tribeId]) {
        rankingCache.tribes[tribeId] = { data: null, timestamp: 0 };
    }

    const cached = rankingCache.tribes[tribeId];
    if (cached.data && (now - cached.timestamp) < RANKING_CACHE_DURATION) {
        console.log(`📦 캐시 사용 (tribe_${tribeId})`);
        callback(cached.data);
        return;
    }

    const currentWeekId = getWeekId();

    // 📡 서버에서 읽기
    db.collection('ranking_snapshots')
        .doc(currentWeekId)
        .collection('tribes')
        .doc(`tribe_${tribeId}`)
        .get()
        .then(doc => {
            if (!doc.exists) {
                console.warn(`⚠️ Snapshot 아직 준비 중: ${currentWeekId}/tribe_${tribeId}`);
                callback([]);
                return;
            }

            const data = doc.data();
            // 🛡️ 중복 방지 필터 적용!
            const ranks = filterAndCleanRanking(data.ranks || []);

            // ranks 배열을 UI에 맞게 변환
            const transformed = ranks.map((row, index) => {
                return {
                    rank: index + 1,
                    name: row.name || t('ranking_no_name'),
                    score: row.score || 0,
                    tribe: row.tribe !== undefined ? row.tribe : tribeId,
                    dept: row.dept !== undefined ? row.dept : 0,
                    tag: row.tag || "",
                    castle: row.castle || 0,
                    isMe: ((row.name === myNickname || row.nickname === myNickname) && row.tag === myTag)
                };
            });

            // 💾 캐시 저장
            rankingCache.tribes[tribeId] = { data: transformed, timestamp: now };

            callback(transformed);
        })
        .catch(err => {
            console.error("❌ 지파 랭킹 로드 실패:", err);
            callback([]);
        });
}

function loadZionLeaderboard(callback) {
    if (typeof db === 'undefined' || !db) {
        callback([]);
        return;
    }

    const now = Date.now();

    // ✨ 캐시 확인
    if (rankingCache.zion.data && (now - rankingCache.zion.timestamp) < RANKING_CACHE_DURATION) {
        console.log(`📦 캐시 사용 (zion)`);
        callback(rankingCache.zion.data);
        return;
    }

    const currentWeekId = getWeekId();

    // 📡 서버에서 읽기
    db.collection('ranking_snapshots')
        .doc(currentWeekId)
        .collection('tribes')
        .doc('zion')
        .get()
        .then(doc => {
            if (!doc.exists) {
                console.warn(`⚠️ Zion Snapshot 아직 준비 중: ${currentWeekId}/zion`);
                callback([]);
                return;
            }

            const data = doc.data();
            // 🛡️ 중복 방지 필터 적용 (지파 랭킹과 동일하게)
            const ranks = filterAndCleanRanking(data.ranks || []);

            // ranks 배열을 UI에 맞게 변환
            const transformed = ranks.map((row, index) => {
                return {
                    rank: index + 1,
                    name: row.name || t('ranking_no_name'),
                    score: row.score || 0,
                    tribe: row.tribe !== undefined ? row.tribe : 0,
                    dept: row.dept !== undefined ? row.dept : 0,
                    tag: row.tag || "",
                    castle: row.castle || 0,
                    isMe: ((row.name === myNickname || row.nickname === myNickname) && row.tag === myTag)
                };
            });

            // 💾 캐시 저장
            rankingCache.zion = { data: transformed, timestamp: now };

            callback(transformed);
        })
        .catch(err => {
            console.error("❌ 시온성 랭킹 로드 실패:", err);
            callback([]);
        });
}

/* ✨ [NEW] 주간 명예의 전당 로드 */
/* ✨ [NEW] 주간 명예의 전당 로드 (+ 캐싱) */
function loadWeeklyHallOfFame() {
    const list = document.getElementById('ranking-list');
    if (!list) return;

    const now = Date.now();

    // ✨ 캐시 확인
    if (rankingCache.weeklyHall.data && (now - rankingCache.weeklyHall.timestamp) < RANKING_CACHE_DURATION) {
        console.log(`📦 캐시 사용 (weeklyHall)`);
        renderHallOfFameList(rankingCache.weeklyHall.data, t('ranking_weekly_hall_title'));
        return;
    }

    list.innerHTML = `<div style="text-align:center; padding:50px; color:#bdc3c7;">${t('ranking_loading_weekly_hall')}</div>`;

    const lastWeekId = getLastWeekId(); // 지난주 ID

    if (typeof db === 'undefined' || !db) {
        renderHallOfFameList([], t('ranking_weekly_hall_title'));
        return;
    }

    // 📡 서버에서 읽기
    db.collection('ranking_snapshots')
        .doc(lastWeekId)
        .collection('tribes')
        .doc('zion')
        .get()
        .then(doc => {
            if (!doc.exists) {
                console.warn(`⚠️ 주간 명예의 전당 데이터 없음: ${lastWeekId}`);
                renderHallOfFameList([], t('ranking_weekly_hall_title'));
                return;
            }

            const data = doc.data();
            const ranks = data.ranks || [];

            // 💾 캐시 저장
            rankingCache.weeklyHall = { data: ranks, timestamp: now };

            renderHallOfFameList(ranks, t('ranking_weekly_hall_title'));
        })
        .catch(err => {
            console.error("❌ 주간 명예의 전당 로드 실패:", err);
            renderHallOfFameList([], t('ranking_weekly_hall_title'));
        });
}

/* ✨ [NEW] 월간 명예의 전당 로드 (+ 캐싱) */
function loadMonthlyHallOfFame() {
    const list = document.getElementById('ranking-list');
    if (!list) return;

    const now = Date.now();

    // ✨ 캐시 확인
    if (rankingCache.monthlyHall.data && (now - rankingCache.monthlyHall.timestamp) < RANKING_CACHE_DURATION) {
        console.log(`📦 캐시 사용 (monthlyHall)`);
        renderHallOfFameList(rankingCache.monthlyHall.data, t('ranking_monthly_hall_title'));
        return;
    }

    list.innerHTML = `<div style="text-align:center; padding:50px; color:#bdc3c7;">${t('ranking_loading_monthly_hall')}</div>`;

    const lastMonthId = getLastMonthId(); // 지난달 ID

    if (typeof db === 'undefined' || !db) {
        renderHallOfFameList([], t('ranking_monthly_hall_title'));
        return;
    }

    // 📡 서버에서 읽기
    db.collection('ranking_snapshots')
        .doc(lastMonthId)
        .collection('hall')
        .doc('monthly')
        .get()
        .then(doc => {
            if (!doc.exists) {
                console.warn(`⚠️ 월간 명예의 전당 데이터 없음: ${lastMonthId}`);
                renderHallOfFameList([], t('ranking_monthly_hall_title'));
                return;
            }

            const data = doc.data();
            const ranks = data.ranks || [];

            // 💾 캐시 저장
            rankingCache.monthlyHall = { data: ranks, timestamp: now };

            renderHallOfFameList(ranks, t('ranking_monthly_hall_title'));
        })
        .catch(err => {
            console.error("❌ 월간 명예의 전당 로드 실패:", err);
            renderHallOfFameList([], t('ranking_monthly_hall_title'));
        });
}

/* [수정] 내 순위 찾기 (스마트 자동 스크롤) */
function scrollToMyRank() {
    // 1. 모달창(팝업)이 열려있는지 확인합니다.
    const modalOverlay = document.getElementById('ranking-modal-overlay');
    const isModalOpen = modalOverlay && modalOverlay.style.display !== 'none';

    // 2. 모달이 닫혀있다면, 가장 기본인 '내 지파' 랭킹을 자동으로 열어줍니다!
    if (!isModalOpen) {
        // 내 지파 랭킹 모달 열기 함수 실행 (기존에 정의된 함수 호출)
        if (typeof openRankingModal === 'function') {
            openRankingModal('tribe', t('label_my_tribe_ranking'));
        }

        // 데이터 로딩 시간이 쪼금 필요하므로, 0.8초(800ms) 뒤에 내 이름을 찾습니다.
        setTimeout(() => {
            findAndScrollMe();
        }, 800);
        return;
    }

    // 3. 이미 모달이 열려있다면 바로 찾아서 스크롤!
    findAndScrollMe();
}

// 스크롤 및 강조 효과 로직 분리
function findAndScrollMe() {
    const myCard = document.getElementById('my-ranking-card');

    if (myCard) {
        // 부드럽게 화면 중앙으로 끌고 오기
        myCard.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // ✨ Tech Lead UX 포인트: 그냥 스크롤만 되면 심심하니, 내 카드를 반짝! 빛나게 해줍니다.
        myCard.style.transition = "all 0.3s";
        myCard.style.transform = "scale(1.03)";
        myCard.style.boxShadow = "0 0 15px rgba(241, 196, 15, 0.8)"; // 금빛 후광 효과

        // 1초 뒤에 효과 원상복구
        setTimeout(() => {
            myCard.style.transform = "scale(1)";
            myCard.style.boxShadow = "none";
        }, 1000);
    } else {
        alert(t('alert_ranking_out'));
    }
}

/* [기능] 다음 월요일 0시까지 남은 시간 계산 및 표시 */
var seasonTimerInterval = null;

function startSeasonTimer() {
    // 기존 타이머가 돌고 있다면 정지 (중복 방지)
    if (seasonTimerInterval) clearInterval(seasonTimerInterval);

    const timerDisplay = document.getElementById('season-timer-display');
    if (!timerDisplay) return;

    function updateTimer() {
        if (document.hidden) return;
        const now = new Date();

        // 다음 주 월요일 0시 계산
        // (오늘에서 월요일까지 며칠 남았는지 계산)
        const day = now.getDay(); // 0(일) ~ 6(토)
        const daysUntilMonday = (day === 0) ? 1 : (8 - day); // 일요일이면 1일 뒤, 그 외에는 8-요일

        // 다음 월요일 자정 목표 설정
        const nextMonday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilMonday);
        nextMonday.setHours(0, 0, 0, 0);

        // 일요일인데 이미 월요일 날짜로 넘어가는 경우(다음주) 보정
        if (day === 1 && now > nextMonday) {
            nextMonday.setDate(nextMonday.getDate() + 7);
        }

        const diff = nextMonday - now;

        if (diff <= 0) {
            timerDisplay.innerHTML = "🔄 리그 갱신 중...";
            return;
        }

        // 시, 분, 초 변환
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        // 예쁘게 표시
        timerDisplay.innerHTML = t('league_timer', { time: `<span style="color:#f1c40f;">${t('league_timer_time', { d, h, m, s })}</span>` });
    }

    // 즉시 실행 후 1초마다 갱신
    updateTimer();
    seasonTimerInterval = setInterval(updateTimer, 1000);
}
/* [추가] 랭킹 팝업창 열기 */
function openRankingModal(tabName, titleText) {
    const overlay = document.getElementById('ranking-modal-overlay');
    const titleEl = document.getElementById('ranking-modal-title');
    const listEl = document.getElementById('ranking-list');

    if (!overlay || !titleEl || !listEl) return;

    // 창 제목을 바꾸고, 팝업을 화면에 띄웁니다.
    titleEl.innerHTML = titleText;
    listEl.innerHTML = `<div style="text-align:center; padding:50px; color:#bdc3c7;">${t('ranking_loading')}</div>`;
    overlay.style.display = 'flex';

    window.currentRankingMode = tabName;

    // 해당 랭킹의 데이터를 불러옵니다. (id="ranking-list"가 팝업 안에 있으므로 기존 함수들이 완벽히 호환됩니다)
    if (tabName === 'tribe') {
        if (typeof loadTribeRanking === 'function') loadTribeRanking();
    } else if (tabName === 'zion') {
        if (typeof loadZionRanking === 'function') loadZionRanking();
    } else if (tabName === 'weekly-hall') {
        if (typeof loadWeeklyHallOfFame === 'function') loadWeeklyHallOfFame();
    } else if (tabName === 'monthly-hall') {
        if (typeof loadMonthlyHallOfFame === 'function') loadMonthlyHallOfFame();
    } else if (tabName === 'total-hall') {
        if (typeof loadTotalHallRanking === 'function') loadTotalHallRanking();
    } else if (tabName === 'yearly-hall') {
        if (typeof loadYearlyHallOfFame === 'function') loadYearlyHallOfFame();
    }
}

/* [추가] 랭킹 팝업창 닫기 */
function closeRankingModal() {
    const overlay = document.getElementById('ranking-modal-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}
/* [기능] 명예의 전당 리스트 그리기 */
function renderHallOfFameList(data, title) {
    const list = document.getElementById('ranking-list');
    list.innerHTML = "";

    // 상단에 타이틀 표시
    const header = document.createElement('div');
    header.style.textAlign = "center";
    header.style.marginBottom = "20px";
    header.innerHTML = `
        <div style="font-size:0.9rem; color:#f39c12; font-weight:bold;">🏆 HALL OF FAME</div>
        <div style="font-size:1.5rem; color:white; font-weight:bold;">${title}</div>
    `;
    list.appendChild(header);

    if (data.length === 0) {
        list.innerHTML += `<div style="text-align:center; padding:30px; color:#7f8c8d;">${t('ranking_empty_season')}</div>`;
        return;
    }

    data.forEach((user, index) => {
        const rank = index + 1;

        // 1,2,3등 특별 디자인 (메달 카드)
        if (rank <= 3) {
            let trophy = "🥇";
            let trophyColor = "#f1c40f"; // 금
            let glow = "0 0 15px rgba(241, 196, 15, 0.5)";
            let medalText = "GOLD MEDAL";

            if (rank === 2) {
                trophy = "🥈";
                trophyColor = "#bdc3c7";
                glow = "0 0 10px rgba(189, 195, 199, 0.5)";
                medalText = "SILVER MEDAL";
            }
            if (rank === 3) {
                trophy = "🥉";
                trophyColor = "#d35400";
                glow = "0 0 10px rgba(211, 84, 0, 0.5)";
                medalText = "BRONZE MEDAL";
            }

            const card = document.createElement('div');
            card.style.cssText = `
                background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
                border: 2px solid ${trophyColor};
                border-radius: 15px;
                padding: 20px;
                margin-bottom: 15px;
                text-align: center;
                box-shadow: ${glow};
                position: relative;
            `;

            card.innerHTML = `
                <div style="font-size:3rem; margin-bottom:5px;">${trophy}</div>
                <div style="font-size:0.7rem; color:${trophyColor}; font-weight:bold; letter-spacing:1px; margin-bottom:8px;">
                    ${medalText}
                </div>
                <div style="font-size:1.2rem; font-weight:bold; color:white; margin-bottom:5px; display:flex; justify-content:center; align-items:center;">
                    ${getTribeIcon(user.tribe || 0)}${getDeptTag(user.dept)} ${user.name}
                    <span style="font-size:0.8rem; color:#bdc3c7; font-weight:normal; margin-left:6px;">#${user.tag || "0000"}</span>
                </div>
                <div style="font-size:1rem; color:${trophyColor}; font-weight:bold;">
                    ${user.score.toLocaleString()} ${t('ranking_pts')}
                </div>
            `;
            list.appendChild(card);
        }
        // 4~100등: 명예의 전당 리스트
        else {
            const item = document.createElement('div');
            item.style.cssText = `
                display:flex; align-items:center; padding:10px; 
                border-bottom:1px solid rgba(255,255,255,0.1); color:#bdc3c7;
                background: ${rank <= 10 ? 'rgba(241,196,15,0.05)' : 'transparent'};
            `;
            item.innerHTML = `
                <div style="width:40px; font-weight:bold; text-align:center; color:${rank <= 10 ? '#f1c40f' : '#7f8c8d'};">
                    ${rank <= 10 ? '⭐' : ''}${rank}
                </div>
                <div style="flex:1; margin-left:10px;">
                    ${getTribeIcon(user.tribe || 0)}${getDeptTag(user.dept)} ${user.name}
                    <span style="font-size:0.8rem; color:#7f8c8d; margin-left:4px;">#${user.tag || "0000"}</span>
                </div>
                <div style="font-weight:bold; color:#ecf0f1;">${user.score.toLocaleString()}</div>
            `;
            list.appendChild(item);
        }
    });
}

/* [수정] 랭킹 리스트 그리기 (내 순위 인식 버그 완벽 수정) */
function renderRankingList(data) {
    const list = document.getElementById('ranking-list');
    list.innerHTML = "";

    // 1. 내가 리스트(Top 100) 안에 있는지 확인
    let amIInTop100 = false;
    let myActualScore = 0; // 리스트에서 찾은 내 실제 점수를 백업할 변수

    // 헤더 표시
    const mode = window.currentRankingMode || 'tribe';
    const tribeName = (typeof myTribe !== 'undefined' && TRIBE_DATA[myTribe] && TRIBE_DATA[myTribe].name) ? getTribeName(TRIBE_DATA[myTribe]) : t('label_my_tribe');
    const headerTitle = mode === 'zion' ? `👑 ${t('label_zion')} Top 100` : `🧭 ${tribeName} Top 100`;
    const headerDiv = document.createElement('div');
    headerDiv.style.cssText = `padding: 15px; color: #bdc3c7; font-size: 0.9rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.2);`;
    headerDiv.innerHTML = `${headerTitle} <span style="opacity:0.7; margin-left:6px;">(${getWeekId()})</span>`;
    list.appendChild(headerDiv);

    // 데이터가 없을 때 처리
    if (data.length === 0) {
        list.innerHTML += `<div style="text-align:center; padding:30px; color:#bdc3c7;">${t('ranking_empty_weekly')}</div>`;
    }

    // 2. 리스트 그리기
    data.forEach((user, index) => {
        const rank = index + 1;

        // 🌟 [버그 픽스 1] 서버에서 isMe를 누락했더라도, 내 닉네임(name)과 일치하면 무조건 '나'로 강제 인식!
        const isMe = user.isMe || (typeof myNickname !== 'undefined' && user.name === myNickname);

        if (isMe) {
            amIInTop100 = true; // 나를 찾았다! (이제 하단 바가 숨어버립니다)
            myActualScore = user.score || 0; // 리스트에 적힌 내 진짜 점수 확보
        }

        const userTribe = (user.tribe !== undefined) ? user.tribe : 0;

        const bgStyle = isMe
            ? "border: 2px solid #f1c40f; background: rgba(241, 196, 15, 0.15);"
            : "border: 1px solid rgba(255,255,255,0.1); background: rgba(0, 0, 0, 0.3);";

        let rankBadge = `<span style="font-size:1.1rem; color:#bdc3c7; width:25px; text-align:center; font-weight:bold;">${rank}</span>`;
        if (rank === 1) rankBadge = "🥇";
        if (rank === 2) rankBadge = "🥈";
        if (rank === 3) rankBadge = "🥉";

        const item = document.createElement('div');
        item.style.cssText = `${bgStyle} margin-bottom:8px; padding:12px 15px; border-radius:12px; display:flex; align-items:center; color:#ecf0f1;`;

        if (isMe) {
            item.id = 'my-ranking-card'; // 스크롤 이동용 ID 부여
        }

        item.innerHTML = `
            <div style="font-size:1.5rem; margin-right:12px; width:35px; text-align:center;">${rankBadge}</div>
            <div style="flex:1;">
                <div style="display:flex; align-items:center; margin-bottom:4px;">
                    <span style="font-weight:bold; font-size:1.05rem; display:flex; align-items:center; color:#fff;">
                        ${getTribeIcon(userTribe)}${getDeptTag(user.dept)} ${user.name}
                    </span>
                </div>
                <div style="font-size:0.8rem; color:#bdc3c7;">
                    ${t('ranking_castle_lv', { lv: user.castle || 0 })} <span style="opacity:0.5; margin:0 3px;">|</span> <span style="opacity:0.7;">#${user.tag}</span>
                </div>
            </div>
            <div style="text-align:right;">
                <div style="font-weight:bold; color:#f1c40f; font-size:1.1rem;">
                    ${user.score ? user.score.toLocaleString() : 0}
                </div>
                <div style="font-size:0.7rem; color:#95a5a6;">${t('ranking_pts')}</div>
            </div>
        `;
        list.appendChild(item);
    });

    // 3. ★ 핵심: 내가 100위 안에 없으면 하단에 '내 정보 바' 띄우기
    window.lastRankInTop100 = amIInTop100;
    updateModalMyRank(amIInTop100);
}

/* ✨ [NEW] 모달창 내부 전용 하단 고정 바 업데이트 로직 (최종 완성본) */
function updateModalMyRank(amIInTop100) {
    const footer = document.getElementById('modal-my-rank-footer');
    if (!footer) return;

    // 100위 안에 있으면 바를 깔끔하게 숨깁니다
    if (amIInTop100) {
        footer.style.display = 'none';
        return;
    }

    const mode = window.currentRankingMode || 'tribe';

    // 🌟 1. 탭(모드)에 따라 '내 진짜 점수'와 '이름' 골라오기
    let myTargetScore = 0;
    let modeName = "";

    if (mode === 'tribe' || mode === 'zion' || mode === 'weekly-hall') {
        myTargetScore = (typeof leagueData !== 'undefined' && leagueData.myScore) ? leagueData.myScore : 0;
        modeName = (mode === 'tribe') ? t('label_my_tribe') : "Zion";
        if (mode === 'weekly-hall') modeName = t('label_weekly_rank');
    }
    else if (mode === 'monthly-hall') {
        myTargetScore = (typeof leagueData !== 'undefined' && leagueData.myMonthlyScore) ? leagueData.myMonthlyScore : 0;
        modeName = t('label_monthly_rank');
    }
    else if (mode === 'total-hall') {
        myTargetScore = (typeof leagueData !== 'undefined' && leagueData.totalScore) ? leagueData.totalScore : 0;
        modeName = t('label_total_rank');
    }

    // 🌟 2. 주간 랭킹일 때만 전체 인원수 가져오기 (월간/누적은 0으로 고정)
    let totalCount = 0;
    if (mode === 'tribe') {
        const tribeKey = String(typeof myTribe !== 'undefined' ? myTribe : 0);
        totalCount = (typeof weeklyRankCounts !== 'undefined' && weeklyRankCounts.tribeCounts) ? (weeklyRankCounts.tribeCounts[tribeKey] || 0) : 0;
    } else if (mode === 'zion' || mode === 'weekly-hall') {
        totalCount = (typeof weeklyRankCounts !== 'undefined') ? (weeklyRankCounts.totalCount || 0) : 0;
    }

    // 🌟 3. 퍼센트 계산 (전체 인원을 모르는 월간/누적은 무조건 "순위 외"로 표시)
    let rankDisplay = t('ranking_footer_outside');
    if (totalCount > 0) {
        // 인원수가 있으면 퍼센트 계산 (최대 100%)
        const displayPercent = Math.min(100, (100 / totalCount) * 100);
        rankDisplay = `${t('ranking_top_percent', { pct: displayPercent.toFixed(1) })}`;
    }

    const myNicknameDisplay = typeof myNickname !== 'undefined' ? myNickname : '순례자';

    // 4. 모달 푸터에 예쁘게 그리기
    footer.innerHTML = `
        <div style="flex:1;">
            <div style="display:flex; align-items:center; margin-bottom:3px;">
                <span style="font-weight:bold; font-size:1rem; color:white;">
                    ${myNicknameDisplay}
                </span>
            </div>
            <div style="font-size:0.8rem; color:#bdc3c7;">
                ${t('ranking_footer_out', { mode: modeName })}
            </div>
        </div>
        <div style="text-align:right;">
            <div style="display:inline-block; font-size:0.7rem; color:#7f8c8d; border:1px solid rgba(127,140,141,0.6); padding:2px 6px; border-radius:10px; margin-bottom:4px; font-weight:bold;">
                ${rankDisplay.replace('<br>', ' ')}
            </div>
            <div style="font-weight:bold; color:#f1c40f; font-size:1.1rem;">
                ${myTargetScore.toLocaleString()}
            </div>
            <div style="font-size:0.7rem; color:#95a5a6;">${t('ranking_footer_score')}</div>
        </div>
    `;

    // 준비가 다 되면 바를 짠! 하고 보여줍니다
    footer.style.display = 'flex';
}

/* [시스템] 주간 ID 생성기 (월요일 시작, ISO 주차) */
function getWeekId(dateObj) {
    const d = dateObj ? new Date(dateObj) : new Date();
    d.setHours(0, 0, 0, 0);

    // ISO week: 월요일 시작 기준으로 주차 계산
    const day = (d.getDay() + 6) % 7; // 월=0 ... 일=6
    d.setDate(d.getDate() - day + 3); // 해당 주의 목요일로 이동

    const firstThursday = new Date(d.getFullYear(), 0, 4);
    const firstDay = (firstThursday.getDay() + 6) % 7;
    firstThursday.setDate(firstThursday.getDate() - firstDay + 3);

    const weekNumber = 1 + Math.round((d - firstThursday) / (7 * 24 * 60 * 60 * 1000));
    return `${d.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
}

// ===== 더보기 팝업 메뉴 =====
function toggleMoreMenu(btn) {
    const popup = document.getElementById('more-menu-popup');
    const icon = document.getElementById('nav-more-icon');
    const isOpen = popup.classList.toggle('open');
    if (icon) icon.textContent = isOpen ? '▼' : '▲';
}

function closeMoreMenu() {
    const popup = document.getElementById('more-menu-popup');
    const icon = document.getElementById('nav-more-icon');
    if (popup) popup.classList.remove('open');
    if (icon) icon.textContent = '▲';
}

function openShopFromMenu() { closeMoreMenu(); openShop(); }
function openAchievementFromMenu() { closeMoreMenu(); openAchievement(); }


// 팝업 외부 클릭 시 닫기
document.addEventListener('click', function(e) {
    const popup = document.getElementById('more-menu-popup');
    const btn = document.getElementById('nav-more-btn');
    if (popup && popup.classList.contains('open')) {
        if (!popup.contains(e.target) && btn && !btn.contains(e.target)) {
            closeMoreMenu();
        }
    }
});
// ===== 더보기 팝업 메뉴 끝 =====

/* [시스템] 지난주 ID 구하기 */
function getLastWeekId() {
    const today = new Date();
    const lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
    return getWeekId(lastWeek);
}

/* [시스템] 주간 마감 당일인지 확인 (일요일) */
function isLastDayOfWeek() {
    const today = new Date();
    return today.getDay() === 0; // 일요일
}

/* [시스템] 현재 월간 ID 구하기 (YYYYMM 형식) */
function getMonthId(dateObj) {
    const d = dateObj ? new Date(dateObj) : new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${year}${month}`;
}

/* [시스템] 지난달 ID 구하기 */
function getLastMonthId() {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    return getMonthId(lastMonth);
}

/* [시스템] 월간 마감 당일인지 확인 (1일) */
function isFirstDayOfMonth() {
    const today = new Date();
    return today.getDate() === 1;
}

/* [시스템] 출석 및 주간 리그 결산 (핵심 로직) */
function checkDailyLogin() {
    const today = new Date().toDateString();
    const lastDate = localStorage.getItem('lastPlayedDate');

    // 이 스위치가 true가 되면 마지막에 무조건 저장을 실행합니다.
    let needsSave = false;

    // 1. 미션 데이터 안전장치
    if (!missionData) missionData = { weekly: { attendance: 0, claimed: [false, false, false] } };
    if (!missionData.weekly) missionData.weekly = { attendance: 0, claimed: [false, false, false] };

    // 2. 주간 초기화 (새로운 주가 시작되었는지 확인)
    const currentWeekId = getWeekId();

    // 🌟 (1) 미션 주간 초기화 (따로 검사)
    if (missionData.weekId !== currentWeekId) {
        console.log("🔄 미션 주간 리셋");
        missionData.weekId = currentWeekId;
        missionData.weekly.attendance = 0;
        missionData.weekly.claimed = [false, false, false];
        missionData.weekly.dragonKill = 0;
        missionData.weekly.stageClear = 0;
        needsSave = true;
    }

    // 🌟 (2) 승점 주간 초기화 (미션과 완전히 독립적으로 따로 검사!)
    if (leagueData.weekId !== currentWeekId) {
        console.log("🔄 승점 주간 리셋 (엇박자 치료 완료!)");
        leagueData.weekId = currentWeekId;
        leagueData.myScore = 0;
        leagueData.stageLog = {};
        needsSave = true;
    }

    // ✨ NEW: 3. 월간 초기화 (새로운 달이 시작되었는지 확인)
    const currentMonthId = getMonthId(); // 예: "202602"

    if (leagueData.monthId !== currentMonthId) {
        console.log("🔄 새로운 달이 시작되었습니다! (월간 리셋)");

        // (1) 지난달 점수를 백업 필드에 보존 (CF 아카이빙 경쟁조건 방어)
        leagueData.prevMonthId = leagueData.monthId || getLastMonthId();
        leagueData.prevMonthlyScore = leagueData.myMonthlyScore || 0;

        // (2) 월간 데이터 초기화
        leagueData.monthId = currentMonthId;
        leagueData.myMonthlyScore = 0; // 월간 점수 0점부터 다시 시작
        needsSave = true; // 🌟 초기화했으니 저장 필수!
    }

    // 4. 일일 출석 체크
    if (lastDate !== today) {
        // 주간 출석 체크는 반드시 updateWeeklyAttendance로 통일
        const currentWeekId = getWeekId();
        updateWeeklyAttendance(today, currentWeekId);

        // ★ 일일 미션 초기화
        missionData.daily.newClear = 0;
        missionData.daily.differentStages = 0;
        missionData.daily.checkpointBoss = 0;
        missionData.daily.backup = 0;
        missionData.daily.claimed = [false, false, false, false];
        missionData.lastLoginDate = today; // ★ [버그 수정] checkMissions()와 동기화

        localStorage.setItem('lastPlayedDate', today);
        needsSave = true; // 🌟 출석했으니 저장 필수!

    }

    // [버그 수정] needsSave가 true이면 반드시 저장 (자정 지킴이에서 호출 시 데이터 유실 방지)
    if (needsSave) {
        saveGameData();
    }
}

// [3] 스테이지 클리어 함수 (수정됨)
stageClear = function (type) {
    try {
        // 🌟 [핵심 수술] 훈련 모드 철벽 방어막!
        // 훈련 모드일 때는 보석 계산도, 승점 계산도, 저장도 하지 않고 그냥 함수를 조용히 끝냅니다.
        if (window.isTrainingMode) {
            console.log("⚔️ 집중 훈련 완료! (보상 지급을 스킵합니다.)");
            return; // ➔ 여기서 함수가 즉시 종료됩니다! (아래 계산 코드 무시)
        }
        // 🌟 ---------------------------------------------------------
        const sId = String(window.currentStageId);

        // 변수 호이스팅 문제 방지용 선언
        let verseCnt = 1;

        // ★ [v1.1.0] 직렬 복습 상태 조회
        const reviewStatus = getReviewStatus(sId);
        const isEligible = reviewStatus.isEligible;
        const isFirstClear = reviewStatus.isFirstClear;
        // 구버전 호환: calculateScore 등 내부 호환용
        const isForgotten = isEligible; // 복습 가능 타이밍 = 구 isForgotten 역할 (calculateScore 호환용)

        let baseGem = 0;
        let msg = `${t('clear_success')}\n\n`;

        const lastTime = stageLastClear[sId] || 0;
        const isAlreadyClearedToday = new Date(lastTime).setHours(0, 0, 0, 0) === new Date().setHours(0, 0, 0, 0);
        const currentWeekId = (typeof getWeekId === 'function') ? getWeekId() : null;
        const chNum = parseInt(sId.split('-')[0]);

        // [A] 보스 (챕터 전체) — 중간점검과 동일한 편의 트리거 방식
        if (type === 'boss') {
            const chData = gameData.find(c => c.id === chNum);

            // 챕터 내 모든 노멀 스테이지 일괄 처리
            let subGemTotal = 0;
            let eligibleSubCount = 0;
            let totalSubCount = 0;

            if (chData && chData.stages) {
                chData.stages.forEach(targetStage => {
                    if (targetStage.type !== 'normal') return;
                    const subId = targetStage.id;

                    // 클리어 기록 (게임 진행용 — eligible 여부 무관)
                    if (!stageMastery[subId]) stageMastery[subId] = 0;
                    if (!stageClearDate[subId]) stageClearDate[subId] = getMemoryQuizDate();
                    targetStage.cleared = true;
                    stageLastClear[subId] = Date.now(); // 기억 강도 100% 리셋
                    totalSubCount++;

                    // 복습 보상
                    const subStatus = getReviewStatus(subId);
                    if (subStatus.isEligible) {
                        const { earnedGem: earned } = advanceReviewStep(subId);
                        stageMastery[subId]++;
                        subGemTotal += earned;
                        eligibleSubCount++;
                    } else {
                        subGemTotal += 10; // 대기 중 최소 보상
                    }
                });
            }

            baseGem = subGemTotal;
            verseCnt = totalSubCount; // 승점 계산용: 전체 서브스테이지 수 × hearts
            msg += t('msg_boss_clear', { total: totalSubCount, eligible: eligibleSubCount }) + '\n';

            // ★ 미션 업데이트: 보스 처치
            updateMissionProgress('checkpointBoss'); // 일일 미션
            updateMissionProgress('dragon'); // 주간 미션
        }
        // [B] 일반 / 중간점검
        else {
            let maxGem = 0;

            if (type === 'mid-boss') {
                const chData = gameData.find(c => c.id === chNum);

                // 서브스테이지 일괄 처리 (중간점검은 편의 트리거 — 자체 보상 없음)
                let subGemTotal = 0;
                let eligibleSubCount = 0;
                let totalSubCount = 0;

                if (chData && chData.stages) {
                    const myIndexInMap = chData.stages.findIndex(s => s.id === sId);
                    for (let i = myIndexInMap - 1; i >= 0; i--) {
                        const targetStage = chData.stages[i];
                        if (targetStage.type === 'boss' || targetStage.type === 'mid-boss') break;
                        const subId = targetStage.id;

                        // 클리어 기록 (게임 진행용 — eligible 여부 무관)
                        if (!stageMastery[subId]) stageMastery[subId] = 0;
                        if (!stageClearDate[subId]) stageClearDate[subId] = getMemoryQuizDate();
                        targetStage.cleared = true;
                        stageLastClear[subId] = Date.now(); // 기억 강도 100% 리셋 (실제 복습했으므로 항상 적용)
                        totalSubCount++;

                        // 복습 보상
                        const subStatus = getReviewStatus(subId);
                        if (subStatus.isEligible) {
                            const { earnedGem: earned } = advanceReviewStep(subId);
                            stageMastery[subId]++;
                            subGemTotal += earned;
                            eligibleSubCount++;
                        } else {
                            subGemTotal += 10; // 대기 중 최소 보상
                        }
                    }
                }

                maxGem = subGemTotal;
                verseCnt = totalSubCount; // 승점 계산용: 전체 서브스테이지 수 × hearts
                msg += t('msg_midboss_clear', { total: totalSubCount, eligible: eligibleSubCount }) + '\n';

                // ★ 미션 업데이트: 중보 처치
                if (!isAlreadyClearedToday) {
                    updateMissionProgress('checkpointBoss'); // 일일 미션
                }
                updateMissionProgress('dragon'); // 주간 미션 (중보/보스)
            }
            else {
                // ★ [v1.1.0] 일반 스테이지: 직렬 복습 시스템 적용
                verseCnt = 1;

                if (isEligible) {
                    const completingStep = reviewStatus.step;
                    const advResult = advanceReviewStep(sId);
                    maxGem = advResult.earnedGem;
                    window._lastClearOutcome = advResult.outcome;
                    if (completingStep === 1) {
                        msg += `${t('clear_first_study', { gem: maxGem })}\n`;
                    } else {
                        msg += `${t('clear_review_nth', { n: completingStep, gem: maxGem })}\n`;
                    }
                } else {
                    maxGem = 10;
                    const remainMin = Math.ceil(reviewStatus.remainMs / 60000);
                    const timeStr = remainMin >= 60
                        ? t(remainMin % 60 > 0 ? 'clear_wait_hours' : 'clear_wait_hours_only', { h: Math.floor(remainMin / 60), m: remainMin % 60 })
                        : t('clear_wait_mins', { m: remainMin });
                    msg += `${t('clear_review_wait', { time: timeStr })}\n`;
                }

                // ★ 미션 업데이트
                // 복습 모드, 전체 학습 모드, 신규 모드 모두 카운트
                updateMissionProgress('new'); // 스테이지 클리어 시 무조건 카운트

                // 다양성 미션: 오늘 처음 클리어하는 스테이지라면 (복습/전체학습/신규 모두 적용)
                if (!isAlreadyClearedToday) {
                    updateMissionProgress('differentStage');
                }
            }

            baseGem = maxGem;
        }

        // 🌟 '오늘 완료' 뱃지를 위해 클리어 시각은 무조건 갱신
        stageLastClear[sId] = Date.now();

        // ★ [깨달음의 경지 보너스 적용]
        const collectionScore = getCurrentCollectionScore();
        const rankBuff = getCollectionRank(collectionScore);
        let buffMsg = "";

        // 보석 보너스
        if (rankBuff.gemBonus > 0) {
            baseGem = Math.floor(baseGem * (1 + rankBuff.gemBonus / 100));
            buffMsg += `${t('clear_buff_gem', { n: rankBuff.gemBonus })}\n`;
        }

        // ★ [4회 이상 클리어 시 보상 제한]
        let scoreType = (type === 'boss') ? 'boss' : (type === 'mid-boss' ? 'mid-boss' : 'normal');

        // 재도전 보너스가 자동으로 포함됨 (calculateScore 내부에서 보너스 소진)
        const scoreResult = calculateScore(sId, scoreType, verseCnt, playerHearts, isForgotten);

        // ★ 월말 23시 이후 승점 차단 체크
        if (scoreResult.blocked) {
            msg += `\n⚠️ ${scoreResult.blockReason}\n\n`;
            msg += `${t('clear_score_blocked_gem')}\n`;
            scoreResult.score = 0;
        }

        scoreResult.score = Math.floor(scoreResult.score);

        // 승점 보너스 (차단되지 않았을 때만)
        if (!scoreResult.blocked && rankBuff.scoreBonus > 0) {
            scoreResult.score = Math.floor(scoreResult.score * (1 + rankBuff.scoreBonus / 100));
            buffMsg += `${t('clear_buff_score', { n: rankBuff.scoreBonus })}\n`;
        }

        // 정확도 보너스
        let adjustedWrongCount = Math.max(0, wrongCount - rankBuff.wrongCorrection);
        let accuracyRate = (type === 'boss' || type === 'mid-boss')
            ? Math.max(0.1, (100 - (adjustedWrongCount * 5)) / 100)
            : Math.max(0.1, (100 - (adjustedWrongCount * 10)) / 100);

        if (rankBuff.wrongCorrection > 0) {
            buffMsg += `${t('clear_buff_wrong', { n: rankBuff.wrongCorrection })}\n`;
        }

        const baseGemBeforeAccuracy = baseGem; // ★ 정확도 적용 전 값 저장
        baseGem = Math.floor(baseGem * accuracyRate);

        // 성전 보너스
        const currentCastle = castleBlueprints[myCastleLevel];
        const bonusPercent = currentCastle ? currentCastle.bonus : 0;
        let castleBonusGem = Math.floor(baseGem * (bonusPercent / 100));
        let totalGem = baseGem + castleBonusGem;

        // 퍼펙트 보너스
        let perfectBonus = 0;
        if (adjustedWrongCount === 0) {
            perfectBonus = Math.floor(baseGem * 0.1);
            totalGem += perfectBonus;
            if (typeof SoundEffect !== 'undefined') SoundEffect.playLevelUp();
            updateStats('perfect', 1);
        }

        myGems += totalGem;
        updateStats('gem_get', totalGem);
        window._lastClearGem = baseGemBeforeAccuracy; // 결과 모달용 (정확도 적용 전 기본 보석 수)

        if (!stageMastery[sId]) stageMastery[sId] = 0;
        stageMastery[sId]++;
        if (!stageClearDate[sId]) stageClearDate[sId] = getMemoryQuizDate();

        const accPercent = Math.floor(accuracyRate * 100);

        // 깨달음 보너스 메시지 추가
        if (buffMsg) {
            msg += buffMsg;
        }

        // 초회 클리어 시 상세 정보 표시
        if (!isAlreadyClearedToday) {
            msg += `\n━━━━━━━━━━━━━━━━\n`;

            if (type === 'mid-boss' || type === 'boss') {
                msg += `${t('clear_base_gem_verse', { gem: baseGemBeforeAccuracy, cnt: verseCnt })}\n`;
            } else {
                msg += `${t('clear_base_gem', { gem: baseGemBeforeAccuracy })}\n`;
            }

            msg += `${t('clear_accuracy', { pct: accPercent, wrong: adjustedWrongCount, gem: baseGem })}\n`;
            msg += `${t('clear_castle_bonus', { gem: castleBonusGem })}\n`;
            if (perfectBonus > 0) {
                msg += `${t('clear_perfect_bonus', { gem: perfectBonus })}\n`;
            }
            msg += `${t('clear_score', { score: scoreResult.score })}\n`;
            msg += `${t('clear_total_gem', { gem: totalGem })}`;
        } else {
            msg += `${t('clear_repeat_accuracy', { pct: accPercent, wrong: adjustedWrongCount })}\n`;
            if (perfectBonus > 0) {
                msg += `${t('clear_repeat_perfect', { gem: perfectBonus })}\n`;
            }
            msg += `${t('clear_score', { score: scoreResult.score })}\n`;
            msg += `${t('clear_repeat_gem', { gem: totalGem, castle: castleBonusGem })}`;
        }
        if (typeof triggerConfetti === 'function') triggerConfetti();

        /* [3] 클리어 횟수 기록 (함수 맨 끝부분, alert 뜨기 전) */
        if (type === 'boss' || type === 'mid-boss') {
            updateStats('boss_kill', 1);
        } else {
            updateStats('verse_clear', 1);
        }

        alert(msg);
        updateGemDisplay();
        saveGameData();
        syncToFirestore(); // [Firestore] 스테이지 클리어
        updateKingsRoadHomeInfo();
    } catch (error) {
        console.error("클리어 처리 중 오류:", error);
        alert(t('alert_error_msg', { msg: error.message }));
        quitGame(isFocusedTrainingSession() ? 'home' : 'map');
    }
};

//[1] 구간별 보상 계산 함수 (시작/끝 지정 가능)//
function calculateProgressiveReward(chNum, count, startVerse = 1) {
    let totalGem = 0;
    let effectiveVerses = 0;
    let isReduced = false;

    const today = new Date().setHours(0, 0, 0, 0);

    // startVerse부터 count(끝번호)까지 루프
    for (let i = startVerse; i <= count; i++) {
        const subId = `${chNum}-${i}`;
        const lastTime = stageLastClear[subId] || 0;
        const clearedDate = new Date(lastTime).setHours(0, 0, 0, 0);

        if (clearedDate === today) {
            totalGem += 10;
            effectiveVerses += 0.2;
            isReduced = true;
        } else {
            totalGem += 50;
            effectiveVerses += 1.0;
        }
    }

    return { gem: totalGem, effectiveVerses: effectiveVerses, isReduced: isReduced };
}

/* =========================================
   [시스템: 통합 아이템 상점 (최종_완성본)]
   ========================================= */

// 일반 아이템 목록 (가격 고정)
const SHOP_ITEMS = {
    "lifeBread": { name: "생명의 떡", nameEn: "Bread of Life", price: 50, desc: "체력 2칸 회복", descEn: "Restore 2 hearts", icon: "🍞" },
    "booster": { name: "승점 부스터", nameEn: "Score Booster", price: 500, desc: "30분간 승점 2배", descEn: "Score ×2 for 30 min", icon: "⚡" },
    "booster3": { name: "승점 부스터+", nameEn: "Score Booster+", price: 1200, desc: "30분간 승점 3배", descEn: "Score ×3 for 30 min", icon: "⚡" }
};

function getShopTodayKey() {
    return new Date().toDateString();
}

function isLifeBreadFreeAvailable() {
    const lastFreeDate = localStorage.getItem("kingsroad_free_lifebread_date");
    return lastFreeDate !== getShopTodayKey();
}

function markLifeBreadFreeUsed() {
    localStorage.setItem("kingsroad_free_lifebread_date", getShopTodayKey());
}

/* [수정] 통합 상점 구매 함수 (최종 수정판) */
function buyItem(itemType) {
    if (itemType === 'potion') itemType = 'lifeBread';
    // ------------------------------------------
    // [1] 체력 구매 (굳건한 마음) - 가격 3,000 적용
    // ------------------------------------------
    if (itemType === 'heart') {
        // 1. 최대치 제한 확인 (30칸)
        if (purchasedMaxHearts >= 30) {
            alert(t('alert_hearts_max_reached'));
            return;
        }

        // ★ 가격 계산 수정: (현재 - 4) * 3,000
        const heartPrice = (purchasedMaxHearts - 4) * 3000;

        // 2. 보석 부족 확인
        if (myGems < heartPrice) {
            alert(t('alert_buy_hearts_no_gems', { cost: heartPrice }));
            return;
        }

        // 3. 구매 진행
        if (confirm(`💎 ${heartPrice} 보석으로 [굳건한 마음]을 구매하시겠습니까?\n(최대 체력 +1 증가)`)) {
            myGems -= heartPrice;    // 보석 차감
            purchasedMaxHearts++;    // 체력 증가

            recalculateMaxHearts();  // 보너스 포함 최종 체력 재계산

            updateGemDisplay();      // UI 갱신
            updateShopUI();          // 상점 UI 갱신 (가격표 업데이트)
            saveGameData();          // 저장

            alert(t('alert_buy_hearts_success', { max: maxPlayerHearts }));
        }
        return; // 체력 구매 후 함수 종료
    }

    // ------------------------------------------
    // [2] 일반 아이템 (생명의 떡, 부스터) 구매
    // ------------------------------------------
    // SHOP_ITEMS에 정의된 아이템인지 확인
    const item = SHOP_ITEMS[itemType];
    if (!item) return;

    const isFreeLifeBread = (itemType === 'lifeBread') && isLifeBreadFreeAvailable();
    const price = isFreeLifeBread ? 0 : item.price;
    const confirmMsg = isFreeLifeBread
        ? `오늘 무료 1회로 [${item.name}]을 구매하시겠습니까?`
        : `💎 ${price} 보석으로 [${item.name}]을 구매하시겠습니까?`;

    // 가격 확인
    if (price > 0 && myGems < price) {
        alert(t('alert_buy_no_gems'));
        return;
    }

    // 구매 진행
    if (confirm(confirmMsg)) {
        if (price > 0) myGems -= price;

        // 부스터는 즉시 사용, 나머지는 인벤토리에 추가
        if (itemType === 'booster') {
            activateBooster(2, 30); // 2배, 30분
        } else if (itemType === 'booster3') {
            activateBooster(3, 30); // 3배, 30분
        } else {
            if (!inventory) inventory = {};
            inventory[itemType] = (inventory[itemType] || 0) + 1;
            alert(t('alert_buy_success', { name: item.name, count: inventory[itemType] }));
        }

        if (isFreeLifeBread) {
            markLifeBreadFreeUsed();
        }

        updateGemDisplay();
        updateShopUI();
        saveGameData();
        updateResourceUI();
        if (typeof updateNotificationBadges === 'function') updateNotificationBadges();
    }
}

/* [수정] 상점 UI 업데이트 (오류 수정됨) */
updateShopUI = function () {
    let shopScreen = document.getElementById('shop-screen');
    if (!shopScreen) {
        // 화면 생성 로직 (기존과 동일)
        shopScreen = document.createElement('div');
        shopScreen.id = 'shop-screen';
        shopScreen.className = 'screen';
        shopScreen.innerHTML = `
            <div class="map-header" style="justify-content: center;">
                <div style="font-weight:bold; font-size:1.3rem;">${t('shop_title')}</div>
            </div>
            <div class="shop-list" style="flex: 1; overflow-y: auto; padding: 20px; padding-bottom: 20px;"></div>
            <div class="button-area-static">
                <button class="btn-gray btn-back" onclick="goMap()">${t('btn_go_back')}</button>
            </div>
        `;
        document.body.appendChild(shopScreen);
    }

    const list = shopScreen.querySelector('.shop-list');
    list.innerHTML = "";

    // [굳건한 마음] 가격 계산 수정
    const heartPrice = (purchasedMaxHearts - 4) * 3000;
    const isMax = purchasedMaxHearts >= 30;

    const heartDiv = document.createElement('div');
    heartDiv.className = 'shop-item';
    heartDiv.style.cssText = "background:white; padding:15px; border-radius:15px; display:flex; align-items:center; color:black; box-shadow:0 2px 5px rgba(0,0,0,0.1); margin-bottom:10px;";
    heartDiv.innerHTML = `
        <div style="font-size:2.5rem; margin-right:15px;">❤️</div>
        <div style="flex:1;">
            <div style="font-weight:bold; font-size:1.1rem;">${t('shop_heart_name')}</div>
            <div style="font-size:0.8rem; color:#7f8c8d;">${t('shop_heart_desc')}</div>
            <div style="color:#e67e22; font-weight:bold; margin-top:5px;">${isMax ? t('shop_heart_sold_out') : `💎 ${heartPrice}`}</div>
        </div>
        <button onclick="buyItem('heart')" style="background:${isMax ? '#95a5a6' : '#2ecc71'}; border:none; color:white; padding:8px 15px; border-radius:20px; font-weight:bold; cursor:${isMax ? 'default' : 'pointer'};" ${isMax ? 'disabled' : ''}>${isMax ? t('shop_heart_done') : t('shop_btn_buy')}</button>
    `;
    list.appendChild(heartDiv);

    // [일반 아이템]
    ['lifeBread', 'booster', 'booster3'].forEach(key => {
        const item = SHOP_ITEMS[key];
        const count = (inventory && inventory[key]) ? inventory[key] : 0;
        const div = document.createElement('div');
        div.className = 'shop-item';
        div.style.cssText = "background:white; padding:15px; border-radius:15px; display:flex; align-items:center; color:black; box-shadow:0 2px 5px rgba(0,0,0,0.1); margin-bottom:10px;";
        const isFreeLifeBread = (key === 'lifeBread') && isLifeBreadFreeAvailable();
        const priceText = isFreeLifeBread ? t('shop_free_once') : `💎 ${item.price}`;

        let countHtml = (key === 'booster' || key === 'booster3') ? '' : `<div style="font-size:0.8rem; color:#2ecc71; font-weight:bold;">${t('shop_owned', { count })}</div>`;

        const buttonText = (key === 'lifeBread' && isFreeLifeBread) ? t('shop_btn_free') : t('shop_btn_buy');
        const itemName = currentLang === 'en' ? (item.nameEn || item.name) : item.name;
        const itemDesc = currentLang === 'en' ? (item.descEn || item.desc) : item.desc;

        div.innerHTML = `
            <div style="font-size:2.5rem; margin-right:15px;">${item.icon}</div>
            <div style="flex:1;">
                <div style="font-weight:bold; font-size:1.1rem;">${itemName}</div>
                <div style="font-size:0.8rem; color:#7f8c8d;">${itemDesc}</div>
                <div style="color:#e67e22; font-weight:bold; margin-top:5px;">${priceText}</div>
                ${countHtml}
            </div>
            <button onclick="buyItem('${key}')" style="background:#f1c40f; border:none; color:#2c3e50; padding:8px 15px; border-radius:20px; font-weight:bold; cursor:pointer;">${buttonText}</button>
        `;
        list.appendChild(div);
    });

    if (typeof updateNotificationBadges === 'function') updateNotificationBadges();
};

// 3. 전투 중 아이템 사용 함수
function useBattleItem(itemType) {
    if (itemType === 'potion') itemType = 'lifeBread';
    if (!inventory || !inventory[itemType] || inventory[itemType] <= 0) {
        alert(t('alert_item_none'));
        return;
    }

    if (itemType === "lifeBread") {
        if (playerHearts >= maxPlayerHearts) {
            alert(t('alert_item_hearts_full'));
            return;
        }
        playerHearts = Math.min(playerHearts + 2, maxPlayerHearts); // 2칸 회복
        inventory[itemType]--;
        updateResourceUI();
        alert(t('alert_item_bread_used'));
    }

    saveGameData();
    updateBattleUI(); // 화면 갱신
}

/* =========================================
   [시스템: 뒤로가기 방지 및 종료 팝업]
   ========================================= */

// 1. 뒤로가기 키 감지 ("납치" 설정)
window.addEventListener('load', function () {
    // 페이지 로드 시 가짜 히스토리를 하나 쌓음
    history.pushState(null, null, location.href);

    window.onpopstate = function (event) {
        history.pushState(null, null, location.href);

        const gameScreen = document.getElementById('game-screen');
        const homeScreen = document.getElementById('home-screen');

        if (gameScreen.classList.contains('active')) {
            // 전투 중: 나가기 확인 팝업
            openQuitModal();
        } else if (homeScreen.classList.contains('active')) {
            // 홈 화면: 종료 안내 모달
            const exitModal = document.getElementById('exit-confirm-modal');
            if (exitModal && exitModal.classList.contains('active')) {
                cancelExitApp();
            } else {
                openExitConfirmModal();
            }
        } else {
            // 홈이 아닌 다른 화면: 홈으로 이동
            if (typeof goHome === 'function') {
                goHome();
            }
        }
    };
});

// 2. 팝업 열기
function openQuitModal() {
    const modal = document.getElementById('quit-modal');
    const title = document.getElementById('quit-modal-title');
    const message = document.getElementById('quit-modal-message');

    if (title) {
        title.innerText = getQuitModalTitleText();
    }

    if (message) {
        message.innerHTML = getQuitModalMessageHtml();
    }

    if (modal) {
        modal.classList.add('active');
    }
}

// [앱 종료 안내 모달]
function openExitConfirmModal() {
    document.getElementById('exit-confirm-modal').classList.add('active');
}

function cancelExitApp() {
    document.getElementById('exit-confirm-modal').classList.remove('active');
}

// 3. [계속하기] 버튼: 팝업 닫고 게임 계속
function cancelQuit() {
    document.getElementById('quit-modal').classList.remove('active');
}

function getQuitModalTitleText() {
    if (!window.isHardshipMode) {
        return t('quit_modal_title');
    }

    const modeMeta = getHardshipModeMeta(hardshipState.mode);
    return t('hardship_quit_title', { title: modeMeta.title });
}

function getHardshipQuitNoticeText() {
    if (!window.isHardshipMode) return '';

    if (hardshipState.mode === 'endurance') {
        return t('hardship_quit_notice_endurance');
    }

    return t('hardship_quit_notice_scored');
}

function getHardshipBackQuitNoticeText() {
    if (!window.isHardshipMode) return '';

    if (hardshipState.mode === 'endurance') {
        return t('hardship_back_quit_endurance');
    }

    return t('hardship_back_quit_scored');
}

function getQuitModalMessageHtml() {
    if (window.isHardshipMode) {
        return getHardshipBackQuitNoticeText().replace(/\. /g, '.<br>');
    }

    return t('quit_modal_message');
}

/* 🌟 [통합 버그 픽스] 포기 의사를 묻고, 확인 시 자원을 청소하며 나가는 함수 */
function confirmQuit() {
    // 1. 유저에게 의사를 먼저 묻습니다. (첫 번째 함수의 심플한 알림창)
    const quitMessage = window.isHardshipMode
        ? `${getQuitModalTitleText()}\n${getHardshipQuitNoticeText()}`
        : t('quit_confirm');
    const wantsToQuit = confirm(quitMessage);

    // 2. 유저가 '확인'을 눌렀을 때만 청소 및 종료 실행!
    if (wantsToQuit) {

        // (혹시 모를 커스텀 모달이 열려있다면 닫아줍니다)
        const quitModal = document.getElementById('quit-modal');
        if (quitModal) quitModal.classList.remove('active');

        // [청소 1] 타워 게임 다음 스텝 넘어가는 예약 취소
        if (window.towerNextTimeout) {
            clearTimeout(window.towerNextTimeout);
            window.towerNextTimeout = null;
        }

        // [청소 2] 두루마리 게임 애니메이션(무한 루프) 강제 종료!
        if (typeof scrollGame !== 'undefined') {
            scrollGame.isOver = true;
            if (scrollGame.animId) {
                cancelAnimationFrame(scrollGame.animId);
                scrollGame.animId = null;
            }
        }

        // 3. 화면 초기화 및 원래 진입 화면으로 돌아가기 (진짜 종료)
        quitGame(window.isHardshipMode ? (window.hardshipOrigin || 'home') : (isFocusedTrainingSession() ? 'home' : 'map'));
    }
}

/* =========================================
   [Step 3: 바이블 타워 게임 로직 (선택형/객관식으로 완전 개편)]
   ========================================= */
let towerGame = {
    words: [],
    idx: 0,
    locked: false
};

// 타워 게임 초기화
function initTowerGame() {
    towerGame.words = [...trainingVerseData.chunks];
    towerGame.idx = 0;

    const textDisplay = document.getElementById('tower-text-display');

    if (textDisplay) {
        textDisplay.innerHTML = "";
        towerGame.words.forEach((word, index) => {
            const span = document.createElement('span');
            span.innerText = "___";
            span.className = 'tower-word-slot';
            span.id = `tower-word-${index}`;
            textDisplay.appendChild(span);
        });
    }

    document.getElementById('tower-msg').innerText = t('tower_instruction');
    document.getElementById('tower-msg').style.color = "#f0e6c0";

    // 애니메이션 초기화
    spawnTowerStars();

    // 바로 보기 블록 생성
    spawnTowerChoices();
}

// 문제 출제 (객관식 보기 생성)
function spawnTowerChoices() {
    if (!window.isGamePlaying) return; // ★ 추가: 나갔으면 중단!
    towerGame.locked = false; // 새 보기가 나타날 때 잠금 해제
    if (towerGame.idx >= towerGame.words.length) {
        document.getElementById('tower-msg').innerText = t('tower_complete');
        document.getElementById('tower-msg').style.color = "#f1c40f";
        document.getElementById('tower-choices-area').innerHTML = "";

        // ★ 3번 문제를 위한 힌트: 이 setTimeout이 원인입니다!
        window.towerNextTimeout = setTimeout(() => {
            nextStep();
        }, 1500);
        return;
    }

    // 이제 컨트롤 영역에 있는 choices-area를 찾습니다
    const choicesArea = document.getElementById('tower-choices-area');
    choicesArea.innerHTML = "";

    const correctWord = towerGame.words[towerGame.idx];
    let options = [correctWord];

    let wrongCandidates = towerGame.words.filter((w, i) => i !== towerGame.idx && w !== correctWord);
    wrongCandidates = [...new Set(wrongCandidates)];
    wrongCandidates.sort(() => Math.random() - 0.5);

    if (wrongCandidates.length > 0) options.push(wrongCandidates[0]);
    if (wrongCandidates.length > 1) options.push(wrongCandidates[1]);

    const fallbackWords = ["은혜", "말씀", "어린양", "보좌", "생명수"];
    while (options.length < 3) {
        options.push(fallbackWords[Math.floor(Math.random() * fallbackWords.length)]);
        options = [...new Set(options)];
    }

    options.sort(() => Math.random() - 0.5);

    options.forEach(word => {
        const btn = document.createElement('div'); // button에서 div로 변경 (기존 word-block 통일)
        btn.innerText = word;
        btn.className = 'word-block'; // ★ 원래의 예쁜 디자인 클래스 적용!
        // 억지로 넣었던 style.cssText 삭제

        btn.onclick = () => handleTowerChoice(btn, word, correctWord);
        choicesArea.appendChild(btn);
    });

    highlightCurrentBlank();
}

// 플레이어가 블록을 선택했을 때의 판정
function handleTowerChoice(btn, selectedWord, correctWord) {
    if (towerGame.locked) return; // 연타 방지
    towerGame.locked = true;
    const choicesArea = document.getElementById('tower-choices-area');

    if (selectedWord === correctWord) {
        // [정답]
        if (typeof SoundEffect !== 'undefined' && SoundEffect.playCorrect) SoundEffect.playCorrect();

        // 버튼 중심 좌표
        const bRect = btn.getBoundingClientRect();
        const cx = bRect.left + bRect.width / 2;
        const cy = bRect.top  + bRect.height / 2;

        // 버튼 플래시 (초록)
        btn.classList.remove('tower-wrong-flash', 'tower-btn-shake');
        btn.style.backgroundColor = '';
        btn.style.color = '';
        btn.style.boxShadow = '';
        void btn.offsetWidth;
        btn.classList.add('tower-correct-flash');

        // 파티클 + 글로우 링
        spawnTowerParticles(cx, cy);
        spawnGlowRing(cx, cy);

        // 단어를 상단 기록판으로 날려보내기
        flyWordToSlot(btn, correctWord, towerGame.idx);
        towerGame.idx++;
        highlightCurrentBlank();

        // 날아가는 애니메이션 이후 다음 문제 출제
        setTimeout(spawnTowerChoices, 380);

    } else {
        // [오답]
        if (typeof SoundEffect !== 'undefined' && SoundEffect.playWrong) SoundEffect.playWrong();

        // 버튼 중심 좌표
        const bRect = btn.getBoundingClientRect();
        const cx = bRect.left + bRect.width / 2;
        const cy = bRect.top  + bRect.height / 2;

        // 버튼 플래시 (빨강) + shake
        btn.classList.remove('tower-correct-flash');
        btn.style.backgroundColor = '';
        btn.style.color = '';
        btn.style.boxShadow = '';
        void btn.offsetWidth;
        btn.classList.add('tower-wrong-flash', 'tower-btn-shake');

        // 화면 shake
        const gameContainer = document.getElementById('tower-game-container');
        if (gameContainer) {
            gameContainer.classList.add('tower-screen-shake');
            setTimeout(() => gameContainer.classList.remove('tower-screen-shake'), 450);
        }

        document.getElementById('tower-msg').innerText = t('tower_wrong');
        document.getElementById('tower-msg').style.color = "#e74c3c";

        // 틀렸을 때 하트를 깎는 로직이 있다면 여기에 추가 (예: takeDamage())

        // 0.8초 뒤 버튼 원래대로 복구하고 다시 선택하게 함
        setTimeout(() => {
            btn.classList.remove('tower-wrong-flash', 'tower-btn-shake');
            btn.style.backgroundColor = "#ecf0f1";
            btn.style.color = "#2c3e50";
            btn.style.boxShadow = "0 4px 0 #bdc3c7";

            document.getElementById('tower-msg').innerText = t('tower_pick');
            document.getElementById('tower-msg').style.color = "#f0e6c0";

            towerGame.locked = false; // 오답 후 재시도 허용
        }, 800);
    }
}

// 정답 단어를 상단 기록판 슬롯으로 날려보내는 연출
function flyWordToSlot(sourceBtn, word, idx) {
    const slot = document.getElementById(`tower-word-${idx}`);
    if (!slot) return;

    const btnRect  = sourceBtn.getBoundingClientRect();
    const slotRect = slot.getBoundingClientRect();

    // 날아갈 복사본 생성
    const fly = document.createElement('div');
    fly.className = 'flying-word';
    fly.innerText = word;
    fly.style.left = (btnRect.left + btnRect.width  / 2) + 'px';
    fly.style.top  = (btnRect.top  + btnRect.height / 2) + 'px';
    document.body.appendChild(fly);

    // 다음 프레임에서 목적지로 이동 (transition 작동을 위해 rAF 사용)
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            fly.style.left      = (slotRect.left + slotRect.width  / 2) + 'px';
            fly.style.top       = (slotRect.top  + slotRect.height / 2) + 'px';
            fly.style.transform = 'translate(-50%, -50%) scale(0.7)';
            fly.style.opacity   = '0';
        });
    });

    // 도착 직전에 슬롯 채우기, 복사본 제거
    setTimeout(() => {
        slot.innerText = word;
        slot.classList.add('active');
        slot.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        fly.remove();
    }, 220);
}

// ── Step3 애니메이션 헬퍼 함수들 ──

// 별빛 배치
function spawnTowerStars() {
    const container = document.getElementById('tower-game-container');
    if (!container) return;
    container.querySelectorAll('.tower-star').forEach(s => s.remove());
    const count = 20 + Math.floor(Math.random() * 11);
    for (let i = 0; i < count; i++) {
        const s = document.createElement('div');
        s.className = 'tower-star';
        const size = 2 + Math.random() * 3;
        s.style.cssText = `width:${size}px;height:${size}px;left:${Math.random()*100}%;top:${Math.random()*100}%;animation:twinkle ${1.5+Math.random()*2}s ${Math.random()*2}s infinite;`;
        container.appendChild(s);
    }
}

// 현재 채워야 할 빈칸 강조
function highlightCurrentBlank() {
    document.querySelectorAll('.tower-word-slot').forEach((s, i) => {
        s.classList.toggle('current-blank', i === towerGame.idx && !s.classList.contains('active'));
    });
}

// 파티클 효과
function spawnTowerParticles(x, y) {
    const colors = ['#f5c842', '#ffd700', '#ffffff'];
    const count = 10 + Math.floor(Math.random() * 5);
    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = 5 + Math.random() * 5;
        const angle = Math.random() * 360;
        const dist = 40 + Math.random() * 60;
        p.style.cssText = `position:fixed;border-radius:50%;width:${size}px;height:${size}px;left:${x}px;top:${y}px;background:${color};pointer-events:none;z-index:3000;transform:translate(-50%,-50%);transition:transform 0.5s ease-out,opacity 0.5s ease-out;`;
        document.body.appendChild(p);
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const rad = (angle * Math.PI) / 180;
                p.style.transform = `translate(calc(-50% + ${dist * Math.cos(rad)}px), calc(-50% + ${dist * Math.sin(rad)}px))`;
                p.style.opacity = '0';
            });
        });
        setTimeout(() => p.remove(), 520);
    }
}

// 글로우 링
function spawnGlowRing(x, y) {
    const ring = document.createElement('div');
    ring.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:40px;height:40px;border-radius:50%;border:2px solid #f5c842;pointer-events:none;z-index:3000;transform:translate(-50%,-50%) scale(0);opacity:1;transition:transform 0.5s ease-out,opacity 0.5s ease-out;`;
    document.body.appendChild(ring);
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            ring.style.transform = 'translate(-50%,-50%) scale(2.5)';
            ring.style.opacity = '0';
        });
    });
    setTimeout(() => ring.remove(), 520);
}

// [Step 4: 예언의 두루마리 게임 상태 변수]
let scrollGame = {
    animId: null,
    speed: 1.5,
    pos: 0,
    blanks: [],
    nextBlankIdx: 0,
    isOver: false,
    isColliding: false
};

/* [시스템: 성전 화면 업데이트 (과거 보기 기능 추가됨)] */
function updateCastleView() {
    // 1. 뷰어 초기화 (게임 켰을 때 한 번만 내 레벨로 동기화)
    if (viewingCastleLevel === -1) viewingCastleLevel = myCastleLevel;
    if (viewingCastleLevel > myCastleLevel) viewingCastleLevel = myCastleLevel;

    if (!document.getElementById('castle-display')) return;

    // 2. 현재 '보고 있는' 레벨의 데이터 가져오기
    const viewBP = castleBlueprints[viewingCastleLevel];

    // 3. 실제 내 레벨(myCastleLevel)의 다음 단계 데이터 (건설 버튼용)
    const currentBP = castleBlueprints[myCastleLevel];
    const nextBP = castleBlueprints[myCastleLevel + 1];

    // 방치 보상 계산 (실제 레벨 기준)
    const now = Date.now();
    const elapsedSeconds = (now - lastClaimTime) / 1000;
    let produced = Math.floor((currentBP.prod / 3600) * elapsedSeconds);
    if (produced > currentBP.cap) produced = currentBP.cap;
    if (produced < 0) produced = 0;

    const isPast = viewingCastleLevel < myCastleLevel;

    // 이미지 src만 교체 (DOM 재생성 없이)
    const imgEl = document.getElementById('castle-img');
    if (imgEl) {
        if (viewBP.img) {
            imgEl.src = `images/${viewBP.img}`;
            imgEl.alt = viewBP.name;
            imgEl.style.display = '';
        } else {
            imgEl.style.display = 'none';
        }
    }

    // 과거 필터 클래스
    const frameWrap = document.getElementById('castle-frame-wrap');
    if (frameWrap) frameWrap.className = `castle-frame${isPast ? ' memory-filter' : ''}`;

    // 과거 배지
    const pastBadgeEl = document.getElementById('castle-past-badge');
    if (pastBadgeEl) {
        if (isPast) {
            pastBadgeEl.textContent = t('castle_past_badge');
            pastBadgeEl.style.display = '';
        } else {
            pastBadgeEl.style.display = 'none';
        }
    }

    // 레벨 타이틀
    const titleEl = document.getElementById('castle-level-title');
    if (titleEl) {
        titleEl.textContent = `Lv.${viewBP.level} ${currentLang === 'en' && viewBP.nameEn ? viewBP.nameEn : viewBP.name}`;
        titleEl.style.color = isPast ? '#bdc3c7' : '#f1c40f';
    }

    // 설명
    const descEl = document.getElementById('castle-desc');
    if (descEl) {
        descEl.innerHTML = `"${currentLang === 'en' && viewBP.descEn ? viewBP.descEn : viewBP.desc}"`;
    }

    // 네비게이션 화살표 상태
    const prevBtn = document.getElementById('castle-nav-prev');
    const nextBtn = document.getElementById('castle-nav-next');
    if (prevBtn) prevBtn.disabled = viewingCastleLevel <= 0;
    if (nextBtn) nextBtn.disabled = viewingCastleLevel >= myCastleLevel;

    // ===============================================
    // [버튼 행] — LCP 무관하므로 innerHTML 유지
    // ===============================================
    let leftBtnHTML = `<div style="width:50px; height:50px;"></div>`;

    if (!isPast && currentBP.prod > 0) {
        if (produced > 0) {
            leftBtnHTML = `
                <button onclick="claimTempleSupply()" class="btn-pulse" style="width:50px; height:50px; border-radius:10px; border:none; background:#2ecc71; color:#fff; cursor:pointer; padding:0; display:flex; flex-direction:column; align-items:center; justify-content:center; box-shadow:0 3px 0 #27ae60;">
                    <div style="font-size:1.2rem;">💎</div>
                    <div style="font-size:0.6rem; font-weight:bold;">GET</div>
                </button>`;
        } else {
            leftBtnHTML = `
                <button disabled style="width:50px; height:50px; border-radius:10px; border:none; background:#34495e; color:#bdc3c7; padding:0; display:flex; flex-direction:column; align-items:center; justify-content:center;">
                    <div style="font-size:1.2rem;">⏳</div>
                </button>`;
        }
    } else if (isPast) {
        leftBtnHTML = `
            <button onclick="viewingCastleLevel = myCastleLevel; updateCastleView();" style="width:50px; height:50px; border-radius:10px; border:1px dashed rgba(255,255,255,0.3); background:rgba(0,0,0,0.2); color:#bdc3c7; cursor:pointer; display:flex; flex-direction:column; align-items:center; justify-content:center;">
                <div style="font-size:1.2rem;">🔙</div>
            </button>`;
    }

    let rightBtnHTML = `<div style="width:50px; height:50px;"></div>`;

    if (!isPast && myCastleLevel < 11) {
        if (myGems < nextBP.cost) {
            rightBtnHTML = `
                <button style="width:auto; min-width:70px; height:50px; border-radius:10px; border:none; background:#34495e; color:#7f8c8d; padding:0 10px; display:flex; flex-direction:column; align-items:center; justify-content:center; border-bottom:3px solid #2c3e50;">
                    <div style="font-size:0.9rem;">${t('castle_build_locked')}</div>
                    <div style="font-size:0.6rem; margin-top:2px; white-space:nowrap;"><span style="color:#e74c3c;">${myGems.toLocaleString()}</span> / ${nextBP.cost.toLocaleString()} 💎</div>
                </button>`;
        } else {
            rightBtnHTML = `
                <button onclick="upgradeCastle()" class="btn-pulse" style="width:auto; min-width:70px; height:50px; border-radius:10px; border:none; background:#e67e22; color:#fff; cursor:pointer; padding:0 10px; display:flex; flex-direction:column; align-items:center; justify-content:center; box-shadow:0 3px 0 #d35400;">
                    <div style="font-size:0.9rem;">${t('castle_build')}</div>
                    <div style="font-size:0.6rem; margin-top:2px; white-space:nowrap; color:#fde3c0;">${myGems.toLocaleString()} / ${nextBP.cost.toLocaleString()} 💎</div>
                </button>`;
        }
    } else if (isPast) {
        rightBtnHTML = `<div style="width:50px; height:50px; display:flex; align-items:center; justify-content:center; font-size:1.5rem; opacity:0.3;">🔒</div>`;
    }

    const btnRow = document.getElementById('castle-btn-row');
    if (btnRow) {
        btnRow.innerHTML = `
            ${leftBtnHTML}
            <div style="flex:1; background:rgba(0,0,0,0.4); border-radius:10px; border:1px solid rgba(255,255,255,0.1); height:50px; display:flex; flex-direction:column; justify-content:center; align-items:center;">
                <div style="font-size: 0.9rem; color:#fff; font-weight:bold;">
                    💎 <span style="color:#f1c40f;">${produced}</span> / ${currentBP.cap}
                </div>
                <div style="font-size: 0.7rem; color: #95a5a6;">
                    ⚡${currentBP.prod}/H <span style="color:#2ecc71;">(+${currentBP.bonus}%)</span>
                </div>
            </div>
            ${rightBtnHTML}
        `;
    }

    updateTempleUpgradeNotification();
}

// [추가] 뷰어 레벨 변경 함수
function changeViewLevel(delta) {
    const nextLvl = viewingCastleLevel + delta;

    // 범위 체크 (0보다 작거나, 내가 가진 레벨보다 높으면 이동 불가)
    if (nextLvl < 0 || nextLvl > myCastleLevel) return;

    viewingCastleLevel = nextLvl;

    // 효과음 (찰칵 소리나 부드러운 클릭음 추천)
    if (typeof SoundEffect !== 'undefined') SoundEffect.playClick();

    updateCastleView();
}

/* [시스템: 성전 기능 작동 함수] */

// 1. 성전 건축하기
function upgradeCastle() {
    if (myCastleLevel >= 11) { alert(t('alert_castle_max')); return; }

    const nextLevel = myCastleLevel + 1;
    const nextBP = castleBlueprints[nextLevel];

    if (myGems >= nextBP.cost) {
        if (!confirm(`보석 ${nextBP.cost}개를 사용하여\n[Lv.${nextLevel} ${nextBP.name}]을(를) 건축하시겠습니까?`)) return;

        myGems -= nextBP.cost;
        myCastleLevel++;

        // [★추가] 업그레이드 즉시 최신 모습을 보여주기 위해 뷰어 갱신
        viewingCastleLevel = myCastleLevel;

        if (typeof SoundEffect !== 'undefined') SoundEffect.playLevelUp();

        alert(t('alert_castle_built', { lv: myCastleLevel, name: nextBP.name, desc: nextBP.desc.replace(/<br>/g, '\n') }));

        updateStats('castle_levelup', myCastleLevel);
        updateGemDisplay();
        updateCastleView(); // 화면 갱신
        saveGameData();
    } else {
        alert(t('alert_castle_no_gems', { need: nextBP.cost, have: myGems }));
    }
}

// 2. 보석 수거하기
function claimTempleSupply() {
    const currentBP = castleBlueprints[myCastleLevel];
    if (currentBP.prod === 0) return;

    const now = Date.now();
    const elapsedHours = (now - lastClaimTime) / (1000 * 60 * 60);
    let pending = Math.floor(elapsedHours * currentBP.prod);

    if (pending > currentBP.cap) pending = currentBP.cap;
    if (pending <= 0) return;

    myGems += pending;
    lastClaimTime = now;

    if (typeof SoundEffect !== 'undefined') SoundEffect.playGetGem();
    alert(t('alert_temple_collected', { count: pending }));

    updateCastleView(); // 화면 갱신
    updateResourceUI();
    saveGameData();
}

/* ========================================
   [정식 배포 버전 - 치트키 제거됨]
   ======================================== */

// [변경] 두루마리 게임 속도 3단계 조절 (기존 toggleScrollFastMode 대체)
function changeScrollSpeed(mode) {
    scrollGame.speedMode = mode;

    // 1. 버튼 3개 가져오기
    const btnSlow = document.getElementById('btn-speed-slow');
    const btnNormal = document.getElementById('btn-speed-normal');
    const btnFast = document.getElementById('btn-speed-fast');

    // 2. 모든 버튼 스타일 초기화 (비활성화 상태처럼 보이기)
    [btnSlow, btnNormal, btnFast].forEach(btn => {
        if (btn) {
            btn.style.borderColor = '#ccc';
            btn.style.color = '#7f8c8d'; // 회색 글자
            btn.style.fontWeight = 'normal';
        }
    });

    // 3. 선택된 모드에 따라 속도 적용 및 버튼 색상 강조
    if (mode === 'slow') {
        scrollGame.speed = 0.6; // 기존 어르신 모드 속도
        if (btnSlow) {
            btnSlow.style.borderColor = '#e67e22'; // 주황색
            btnSlow.style.color = '#e67e22';
            btnSlow.style.fontWeight = 'bold';
        }
        alert(t('alert_speed_elder'));

    } else if (mode === 'fast') {
        scrollGame.speed = 1.5; // 기존 빠른 모드 속도
        if (btnFast) {
            btnFast.style.borderColor = '#e74c3c'; // 빨간색 (아주 빠름 강조)
            btnFast.style.color = '#e74c3c';
            btnFast.style.fontWeight = 'bold';
        }
        alert(t('alert_speed_fast'));

    } else {
        // normal (보통)
        scrollGame.speed = 1.0; // 0.6과 1.5 사이의 적절한 중간 속도
        if (btnNormal) {
            btnNormal.style.borderColor = '#27ae60'; // 초록색
            btnNormal.style.color = '#27ae60';
            btnNormal.style.fontWeight = 'bold';
        }
        alert(t('alert_speed_normal'));
    }
}

function skipToEnd() {
    scrollGame.speed = 15;
    const skipBtn = document.getElementById('btn-speed-skip');
    if (skipBtn) skipBtn.disabled = true;
}

/* =========================================
   [Step 4] 예언의 두루마리 게임 로직 (NEW)
   ========================================= */
function startScrollStep() {
    if (!window.isGamePlaying) return; // ★ 추가: 나갔으면 중단!
    scrollGame.isOver = false;
    scrollGame.nextBlankIdx = 0;

    // 🌟 [개선] 3단계 속도 설정 (기본값: 보통)
    if (!scrollGame.speedMode) scrollGame.speedMode = 'normal'; // 초기값이 없으면 보통으로 설정

    if (scrollGame.speedMode === 'slow') {
        scrollGame.speed = 0.4; // 1단계: 아주 느리게 (어르신, 구형 기기용)
    } else if (scrollGame.speedMode === 'fast') {
        scrollGame.speed = 1.0; // 3단계: 아주 빠르게 (고인물, 최신 기기용)
    } else {
        scrollGame.speed = 0.7; // 2단계: 보통 속도 (기본값)
    }

    const track = document.getElementById('scroll-track');
    const deck = document.getElementById('scroll-deck');
    const container = document.getElementById('scroll-game-container');

    if (!track || !container) return;

    // 1. 위치 초기화 (오른쪽 끝)
    scrollGame.pos = container.offsetWidth;
    track.style.left = scrollGame.pos + "px";

    // 2. 단어 및 빈칸 생성
    const words = trainingVerseData.chunks;
    const totalWords = words.length;

    // [개선] 전체의 최대 2/3까지만 빈칸으로 설정 (즉, 최소 1/3은 보여줌)
    const maxBlankCount = Math.floor(totalWords * (2 / 3));

    // 일단 모든 인덱스를 담은 후보 배열 생성
    let candidates = words.map((_, i) => i);

    // 긴 단어(3글자 이상)를 우선적으로 빈칸 후보로 올리기 위해 셔플
    candidates.sort(() => Math.random() - 0.5);

    const blankIndices = [];

    for (let i of candidates) {
        const word = words[i];

        // 조건 1: 빈칸 개수가 전체의 2/3를 넘지 않아야 함
        if (blankIndices.length < maxBlankCount) {
            // 조건 2: 확률(60%)이거나 단어가 길 때 (기존 로직 유지하되 한도 제한)
            if (Math.random() > 0.4 || word.length > 2) {
                blankIndices.push(i);
            }
        }
    }

    // 화면 순서대로 정렬
    blankIndices.sort((a, b) => a - b);
    scrollGame.blanks = blankIndices;

    track.innerHTML = "";
    words.forEach((word, idx) => {
        const node = document.createElement('div');
        node.className = 'scroll-node';
        node.innerText = word;
        node.dataset.idx = idx;

        if (blankIndices.includes(idx)) {
            node.classList.add('scroll-blank');

            // ★ [핵심 수정] "???" 대신 초성 함수 사용!
            node.innerText = getChosung(word);

            node.dataset.answer = word;
        }
        track.appendChild(node);
    });

    // 3. 정답 카드 생성
    deck.innerHTML = "";
    const answers = blankIndices.map(i => words[i]);
    const shuffled = [...answers].sort(() => Math.random() - 0.5);

    shuffled.forEach(word => {
        const btn = document.createElement('div');
        btn.className = 'word-block';
        btn.innerText = word;
        btn.onclick = () => handleScrollCardClick(btn, word);
        deck.appendChild(btn);
    });

    // 4. 애니메이션 시작
    if (scrollGame.animId) cancelAnimationFrame(scrollGame.animId);
    scrollGameLoop();
}

function scrollGameLoop() {
    if (!window.isGamePlaying || scrollGame.isOver) return; // ★ 2중 방어막 추가!

    // 이동
    scrollGame.pos -= scrollGame.speed;
    const track = document.getElementById('scroll-track');
    if (track) track.style.left = scrollGame.pos + "px";

    // 충돌 체크
    checkScrollCollision();

    // 반복
    scrollGame.animId = requestAnimationFrame(scrollGameLoop);
}

function checkScrollCollision() {
    const deadline = 60; // 불타는 선 위치
    const nodes = document.querySelectorAll('.scroll-node');

    // 타겟(다음 빈칸) 찾기
    const targetIdx = scrollGame.blanks[scrollGame.nextBlankIdx];

    // [상황 A] 성공 체크
    if (targetIdx === undefined) {
        const lastNode = nodes[nodes.length - 1];
        if (!lastNode) return;
        const rect = lastNode.getBoundingClientRect();
        const container = document.getElementById('scroll-game-container');

        if (rect.right < container.getBoundingClientRect().left) {
            scrollGame.isOver = true;
            cancelAnimationFrame(scrollGame.animId);
            if (typeof nextStep === 'function') nextStep();
        }
        return;
    }

    // [상황 B] 충돌 & 경고 체크
    const targetNode = nodes[targetIdx];
    const rect = targetNode.getBoundingClientRect();
    const container = document.getElementById('scroll-game-container');
    const nodeLeftRel = rect.left - container.getBoundingClientRect().left; // 화면상 빈칸의 위치

    // ★ [추가] 3초 전 경고 계산 로직 ★
    // 1프레임(약 16ms)당 scrollGame.speed 만큼 이동함.
    // 3초 = 약 180프레임. 따라서 3초 동안 이동하는 거리는 (180 * scrollGame.speed)
    const warningDistance = 180 * scrollGame.speed;
    const distanceToDeadline = nodeLeftRel - deadline;

    // 만약 선까지 남은 거리가 3초 거리 안쪽으로 들어왔다면?
    if (distanceToDeadline > 0 && distanceToDeadline <= warningDistance && !targetNode.classList.contains('filled')) {
        // 1. 단어 상자에 붉은색 경고 깜빡임 추가
        targetNode.classList.add('scroll-warning');

        // 2. (선택사항) 아래 버튼 덱에서 정답 버튼도 반짝거리게 힌트 주기
        const correctWord = targetNode.dataset.answer;
        const deckBtns = document.querySelectorAll('#scroll-deck .word-block');
        deckBtns.forEach(btn => {
            if (btn.innerText === correctWord) {
                btn.classList.add('hint-blink');
            }
        });
    } else {
        // 거리가 멀거나 이미 맞춘 경우 경고 제거
        targetNode.classList.remove('scroll-warning');
        const deckBtns = document.querySelectorAll('#scroll-deck .word-block');
        deckBtns.forEach(btn => btn.classList.remove('hint-blink'));
    }


    // 데드라인을 넘었는데 아직 정답을 못 맞췄다면? (기존 충돌 로직)
    if (nodeLeftRel < deadline && targetNode.classList.contains('scroll-blank') && !targetNode.classList.contains('filled')) {

        // 경고 클래스 떼주기
        targetNode.classList.remove('scroll-warning');
        const deckBtns = document.querySelectorAll('#scroll-deck .word-block');
        deckBtns.forEach(btn => btn.classList.remove('hint-blink'));

        if (scrollGame.isColliding) return;
        scrollGame.isColliding = true;

        // 1. 체력 감소
        if (typeof playerHearts !== 'undefined') {
            playerHearts--;
            wrongCount++;
            if (typeof updateBattleUI === 'function') updateBattleUI();
        }

        // 2. 연출
        showDamageEffect();
        if (typeof SoundEffect !== 'undefined') SoundEffect.playWrong();

        // 3. 밀어내기
        const safeDistance = 250;
        const nodeOffset = targetNode.offsetLeft;

        scrollGame.pos = (deadline + safeDistance) - nodeOffset;

        const track = document.getElementById('scroll-track');
        track.style.transition = "left 0.2s cubic-bezier(0.25, 1, 0.5, 1)";
        track.style.left = scrollGame.pos + "px";

        // 4. 충돌 상태 해제 
        setTimeout(() => {
            track.style.transition = "none";
            scrollGame.isColliding = false;
        }, 500);

        // 5. 게임 오버 체크
        if (typeof playerHearts !== 'undefined' && playerHearts <= 0) {
            scrollGame.isOver = true;
            cancelAnimationFrame(scrollGame.animId);
            if (typeof showReviveModal === 'function') setTimeout(showReviveModal, 100);
        }
    }
}

function handleScrollCardClick(btn, word) {
    if (scrollGame.isOver) return;

    const targetIdx = scrollGame.blanks[scrollGame.nextBlankIdx];
    if (targetIdx === undefined) return;

    const nodes = document.querySelectorAll('.scroll-node');
    const targetNode = nodes[targetIdx];
    const correctWord = targetNode.dataset.answer;

    if (word === correctWord) {
        // 힌트 깜빡임 제거
        btn.classList.remove('hint-blink');
        targetNode.classList.remove('scroll-warning');
        // 정답 로직 (기존과 동일)
        if (typeof SoundEffect !== 'undefined') SoundEffect.playCorrect();
        targetNode.classList.add('filled');
        targetNode.innerText = correctWord;
        btn.style.visibility = 'hidden';
        scrollGame.nextBlankIdx++;

        if (scrollGame.nextBlankIdx >= scrollGame.blanks.length) {
            const skipBtn = document.getElementById('btn-speed-skip');
            if (skipBtn) skipBtn.style.display = 'inline-block';
        }

    } else {
        // [오답 로직 수정됨]
        if (typeof playerHearts !== 'undefined') {
            playerHearts--;
            wrongCount++;
            if (typeof updateBattleUI === 'function') updateBattleUI();
        }

        // ★ 오답 시에도 하트 연출 추가
        showDamageEffect();
        if (typeof SoundEffect !== 'undefined') SoundEffect.playWrong();

        btn.style.backgroundColor = "#e74c3c";
        setTimeout(() => btn.style.backgroundColor = "#ecf0f1", 300);

        if (typeof playerHearts !== 'undefined' && playerHearts <= 0) {
            scrollGame.isOver = true;
            cancelAnimationFrame(scrollGame.animId);
            if (typeof showReviveModal === 'function') setTimeout(showReviveModal, 100);
        }
    }
}

// [하트 감소 연출 함수]
function showDamageEffect() {
    // 1. 하트 요소 생성
    const el = document.createElement('div');
    el.innerText = "💔"; // 깨진 하트 (혹은 그냥 ❤️)
    el.className = "damage-heart-effect";
    document.body.appendChild(el);

    // 2. 화면 흔들림 효과 (게임 컨테이너에)
    const container = document.getElementById('scroll-game-container');
    if (container) {
        container.classList.add('shake-screen-hard');
        setTimeout(() => container.classList.remove('shake-screen-hard'), 500);
    }

    // 3. 1.5초 뒤에 하트 요소 삭제 (메모리 정리)
    setTimeout(() => {
        if (el && el.parentNode) el.parentNode.removeChild(el);
    }, 1500);
}

// [수정] 초기 실행 순서 변경
loadGameData();     // 1. 장부(데이터)를 먼저 꺼내고
renderChapterMap(); // 2. 그 내용을 바탕으로 지도를 그림
updateCastleView(); // 3. 성전 모습 업데이트
initBgm();          // 4. BGM 초기화 (홈 화면 배경음악)
updateKingsStepBtn(); // 5. 왕의 길 단계 버튼 상태 초기화

/* =========================================
   [시스템: 텍스트 파일 백업 및 불러오기 (.txt)]
   ========================================= */
function openDataSettings() {
    let modal = document.getElementById('data-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'data-modal';
        modal.className = 'modal-overlay';
        modal.style.zIndex = "9999";

        // 기존 UI에 '데이터 완전 초기화' 구역(빨간색 박스)을 추가했습니다.
        modal.innerHTML = `
            <div class="result-card" style="max-width:350px; text-align:left; background:white; color:#2c3e50; max-height:90vh; overflow-y:auto;">
                <div class="result-header" style="font-size:1.4rem; text-align:center; color:#2c3e50; margin-bottom:5px;">
                    ${t('data_modal_title')}
                </div>

                <div style="margin-bottom:20px; padding:15px; background:#fef9e7; border-radius:10px; border:1px solid #f1c40f;">
                    <h3 style="color:#d35400; margin:0 0 5px 0; font-size:1.1rem;">${t('data_export_title')}</h3>
                    <p style="font-size:0.9rem; color:#7f8c8d; margin-bottom:10px;">
                        ${t('data_export_desc')}
                    </p>
                    <button onclick="shareSaveCodeAndGetReward()" style="width:100%; background:#f39c12; color:white; border:none; padding:15px; border-radius:10px; font-weight:bold; cursor:pointer; font-size:1rem; box-shadow:0 3px 0 #d35400;">
                        ${t('data_export_btn')}
                    </button>
                </div>

                <div style="margin-bottom:20px; padding:15px; background:#e8f8f5; border-radius:10px; border:1px solid #2ecc71;">
                    <h3 style="color:#27ae60; margin:0 0 5px 0; font-size:1.1rem;">${t('data_import_title')}</h3>
                    <p style="font-size:0.9rem; color:#7f8c8d; margin-bottom:10px;">
                        ${t('data_import_desc')}
                    </p>
                    <div style="display:flex; gap:8px;">
                        <button onclick="document.getElementById('import-file-input').click()" style="flex:1; background:#27ae60; color:white; border:none; padding:12px; border-radius:10px; font-weight:bold; cursor:pointer; box-shadow:0 3px 0 #1e8449;">
                            ${t('data_import_file_btn')}
                        </button>
                        <button onclick="importSaveCode()" style="flex:1; background:#2ecc71; color:white; border:none; padding:12px; border-radius:10px; font-weight:bold; cursor:pointer; box-shadow:0 3px 0 #27ae60;">
                            ${t('data_import_paste_btn')}
                        </button>
                    </div>
                    <input type="file" id="import-file-input" accept=".txt, .json" style="display:none;" onchange="importSaveFile(event)">
                </div>

                <div style="margin-bottom:20px; padding:15px; background:#fdedec; border-radius:10px; border:1px solid #e74c3c;">
                    <h3 style="color:#c0392b; margin:0 0 5px 0; font-size:1.1rem;">${t('data_reset_title')}</h3>
                    <p style="font-size:0.9rem; color:#7f8c8d; margin-bottom:10px;">
                        ${t('data_reset_desc')}
                    </p>
                    <button onclick="resetGameData()" style="width:100%; background:#e74c3c; color:white; border:none; padding:12px; border-radius:10px; font-weight:bold; cursor:pointer; box-shadow:0 3px 0 #c0392b;">
                        ${t('data_reset_btn')}
                    </button>
                </div>

                <button onclick="document.getElementById('data-modal').style.display='none'" style="width:100%; background:#95a5a6; color:white; border:none; padding:12px; border-radius:30px; cursor:pointer; font-weight:bold;">
                    ${t('btn_close')}
                </button>
            </div>
        `;
        document.body.appendChild(modal);
    }
    modal.style.display = 'flex';
}

// ── 알림 설정 ──────────────────────────────────────────────────────────────

const FCM_VAPID_KEY = 'BABLNeK2ZuUV6zqT4JwtDNnS1uhSKJY66RD2usuqooL3LpSI0Qlr82qa3PkrWHMcgJNa39TVWOF4GqyixAzN5Yc';
let _fcmToken = null; // 캐시된 토큰

async function initFCM() {
    if (typeof firebase === 'undefined' || !firebase.messaging) return null;
    if (_fcmToken) return _fcmToken; // 이미 취득한 토큰 재사용
    try {
        // firebase-messaging-sw.js가 active 상태가 될 때까지 대기
        if ('serviceWorker' in navigator) {
            await navigator.serviceWorker.ready;
        }
        const messaging = firebase.messaging();
        const token = await messaging.getToken({ vapidKey: FCM_VAPID_KEY });
        if (token) {
            _fcmToken = token;
            await saveFCMTokenToFirestore(token);
        }
        return token;
    } catch (e) {
        console.warn('FCM 토큰 취득 실패:', e);
        return null;
    }
}

async function saveFCMTokenToFirestore(token) {
    if (!myTag || !db) return;
    try {
        await db.collection('leaderboard').doc(String(myTag)).set(
            { fcmToken: token }, { merge: true }
        );
    } catch (e) {
        console.warn('FCM 토큰 Firestore 저장 실패:', e);
    }
}

function startFCMForegroundListener() {
    if (typeof firebase === 'undefined' || !firebase.messaging) return;
    try {
        const messaging = firebase.messaging();
        messaging.onMessage((payload) => {
            if (Notification.permission !== 'granted') return;
            const title = payload.data?.title || '킹스로드 복습 알림';
            const body = payload.data?.body || '';
            new Notification(title, { body, icon: '/icon-192.png', tag: 'review-notif', renotify: true });
        });
    } catch (e) {}
}

function startFCMTokenRefreshListener() {
    if (typeof firebase === 'undefined' || !firebase.messaging) return;
    try {
        const messaging = firebase.messaging();
        // 브라우저가 토큰을 갱신할 때 Firestore도 함께 업데이트
        messaging.onTokenRefresh(async () => {
            try {
                const newToken = await messaging.getToken({ vapidKey: FCM_VAPID_KEY });
                if (newToken) {
                    _fcmToken = newToken;
                    await saveFCMTokenToFirestore(newToken);
                    console.log('FCM 토큰 갱신 완료');
                }
            } catch (e) {
                console.warn('FCM 토큰 갱신 실패:', e);
            }
        });
    } catch (e) {
        // onTokenRefresh가 지원되지 않는 환경(최신 SDK에서는 자동 처리됨)
    }
}

async function openNotificationSettings() {
    // 메뉴 닫기
    const menuPanel = document.getElementById('menu-panel');
    if (menuPanel) menuPanel.style.display = 'none';

    let modal = document.getElementById('notification-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'notification-modal';
        modal.className = 'modal-overlay';
        modal.style.zIndex = '9999';
        modal.innerHTML = `
            <div class="result-card" style="max-width:340px; text-align:left; background:white; color:#2c3e50;">
                <div class="result-header" style="font-size:1.4rem; text-align:center; color:#2c3e50; margin-bottom:16px;">
                    ${t('notif_modal_title')}
                </div>
                <p style="font-size:0.9rem; color:#7f8c8d; margin-bottom:16px;">
                    ${t('notif_modal_desc')}
                </p>
                <div id="notif-time-list" style="display:flex; flex-direction:column; gap:10px; margin-bottom:16px;"></div>
                <button id="notif-add-btn" onclick="notifAddTime()" style="width:100%; background:#3498db; color:white; border:none; padding:11px; border-radius:10px; font-weight:bold; cursor:pointer; margin-bottom:10px;">
                    ${t('notif_add_time')}
                </button>
                <button onclick="notifSave()" style="width:100%; background:#27ae60; color:white; border:none; padding:12px; border-radius:10px; font-weight:bold; cursor:pointer; margin-bottom:8px;">
                    ${t('notif_save')}
                </button>
                <button onclick="document.getElementById('notification-modal').style.display='none'" style="width:100%; background:#95a5a6; color:white; border:none; padding:12px; border-radius:30px; cursor:pointer; font-weight:bold;">
                    ${t('notif_close')}
                </button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    modal.style.display = 'flex';

    // 저장된 알림 시간 불러오기 (localStorage)
    let savedTimes = [];
    try {
        savedTimes = JSON.parse(localStorage.getItem('notifTimes') || '[]');
    } catch (e) { /* 무시 */ }

    const list = document.getElementById('notif-time-list');
    list.innerHTML = '';
    if (savedTimes.length === 0) {
        notifAddTime();
    } else {
        savedTimes.forEach(t => notifAddTime(t));
    }
    notifUpdateAddBtn();
}

function notifAddTime(value = '') {
    const list = document.getElementById('notif-time-list');
    if (!list) return;
    const rows = list.querySelectorAll('.notif-row');
    if (rows.length >= 3) return;

    const row = document.createElement('div');
    row.className = 'notif-row';
    row.style.cssText = 'display:flex; align-items:center; gap:8px;';
    row.innerHTML = `
        <input type="time" value="${value}" style="flex:1; padding:10px; border:1.5px solid #ddd; border-radius:8px; font-size:1rem; color:#2c3e50;">
        <button onclick="this.closest('.notif-row').remove(); notifUpdateAddBtn();" style="background:#e74c3c; color:white; border:none; width:36px; height:36px; border-radius:8px; cursor:pointer; font-size:1.1rem;">✕</button>
    `;
    list.appendChild(row);
    notifUpdateAddBtn();
}

function notifUpdateAddBtn() {
    const list = document.getElementById('notif-time-list');
    const btn = document.getElementById('notif-add-btn');
    if (!list || !btn) return;
    btn.style.display = list.querySelectorAll('.notif-row').length >= 3 ? 'none' : 'block';
}

async function notifSave() {
    const saveBtn = document.querySelector('#notification-modal [onclick="notifSave()"]');
    if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = t('notif_scheduling_dots'); }

    try {
        const rows = document.querySelectorAll('#notif-time-list .notif-row input[type=time]');
        const times = Array.from(rows).map(i => i.value).filter(v => v);

        if (times.length === 0) {
            // 알림 해제
            localStorage.removeItem('notifTimes');
            if (myTag && db) {
                await db.collection('leaderboard').doc(myTag).set(
                    { notificationTimes: [] }, { merge: true }
                );
            }
            document.getElementById('notification-modal').style.display = 'none';
            showToast(t('toast_notif_disabled'));
            return;
        }

        // 알림 권한 요청
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            showToast(t('toast_notif_permission'));
            return;
        }

        // localStorage에 저장 (폴백용)
        localStorage.setItem('notifTimes', JSON.stringify(times));

        // Firestore에 알림 시간 저장 (서버 발송용)
        let firestoreSaved = false;
        if (myTag && db) {
            try {
                await initFCM().catch(() => {}); // 토큰 미리 취득 (권한 허용 직후 null일 수 있음)
                startFCMTokenRefreshListener(); // 권한 허용 직후 갱신 리스너 시작
                const updateData = { notificationTimes: times };
                if (_fcmToken) updateData.fcmToken = _fcmToken;
                await db.collection('leaderboard').doc(String(myTag)).set(updateData, { merge: true });
                firestoreSaved = true;
            } catch (e) {
                console.warn('Firestore 알림 시간 저장 실패:', e);
            }
        }

        document.getElementById('notification-modal').style.display = 'none';
        if (!myTag || !db || firestoreSaved) {
            showToast(t('toast_notif_set', { times: times.join(', ') }));
        } else {
            showToast(t('toast_server_save_fail'));
        }
    } finally {
        if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = t('btn_save'); }
    }
}

// ── 알림 설정 끝 ────────────────────────────────────────────────────────────

// ── 매일 알림 시간 체크 (클라이언트 전용) ────────────────────────────────────
function scheduleNotifTimesViaSW() {
    if (!('serviceWorker' in navigator)) return;
    let times;
    try { times = JSON.parse(localStorage.getItem('notifTimes') || '[]'); } catch(e) { return; }
    if (!times.length) return;
    navigator.serviceWorker.ready.then(reg => {
        if (!reg.active) return;
        const now = new Date();
        times.forEach(timeStr => {
            const [h, m] = timeStr.split(':').map(Number);
            const target = new Date(now);
            target.setHours(h, m, 0, 0);
            if (target <= now) target.setDate(target.getDate() + 1);
            const delayMs = target - now;
            reg.active.postMessage({
                type: 'SCHEDULE_DAILY_NOTIFICATION',
                delayMs,
                title: t('notif_title'),
                body: t('notif_daily_body'),
                timeStr  // tag를 'daily-HH:MM' 형태로 만들기 위해 전달
            });
        });
    });
}

function startNotificationCheck() {
    if (!('Notification' in window)) return;
    // 앱 로드 시 SW에 재예약 (SW가 종료됐을 경우 복구)
    scheduleNotifTimesViaSW();
    setInterval(() => {
        if (Notification.permission !== 'granted') return;
        let times;
        try { times = JSON.parse(localStorage.getItem('notifTimes') || '[]'); } catch (e) { return; }
        if (!times.length) return;
        const now = new Date();
        const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const todayKey = `notif_shown_${now.toDateString()}`;
        let shownToday;
        try { shownToday = JSON.parse(localStorage.getItem(todayKey) || '[]'); } catch (e) { shownToday = []; }
        times.forEach(timeStr => {
            if (timeStr === hhmm && !shownToday.includes(timeStr)) {
                try {
                    new Notification(t('notif_title'), {
                        body: t('notif_daily_body'),
                        icon: '/icon-192.png',
                        tag: 'daily-notification'
                    });
                } catch (e) {}
                shownToday.push(timeStr);
                localStorage.setItem(todayKey, JSON.stringify(shownToday));
            }
        });
    }, 60000);
}
// ── 매일 알림 시간 체크 끝 ────────────────────────────────────────────────────

// ── 복습 알림 예약 (결과 창 일회성 알림) ────────────────────────────────────
async function scheduleReviewNotification(delayMs, stageTitle, btn) {
    if (!('Notification' in window)) {
        showToast(t('toast_notif_unsupported'));
        return;
    }
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
        showToast(t('toast_notif_permission'));
        return;
    }

    // 로딩 상태 표시
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<span class="kr-spinner"></span>${t('notif_scheduling')}`;
        btn.style.background = '#b0b0b0';
    }

    const hr = delayMs / 3600000;
    const label = hr < 1 ? t('label_minutes_unit', { n: Math.round(delayMs / 60000) }) : t('label_hours_unit', { n: Math.round(hr) });

    // FCM 서버 예약 (앱이 꺼져도 작동)
    if (myTag && db) {
        try {
            console.log('[복습알림] FCM 경로 시도. myTag:', myTag, '현재 _fcmToken:', _fcmToken ? '있음' : '없음');
            await initFCM().catch(e => console.warn('[복습알림] initFCM 실패:', e));

            // 토큰이 없으면 Firestore에 기존 토큰이 있는지 확인
            if (!_fcmToken) {
                console.log('[복습알림] 토큰 없음 → Firestore에서 기존 토큰 조회');
                const existingDoc = await db.collection('leaderboard').doc(String(myTag)).get();
                if (existingDoc.exists && existingDoc.data().fcmToken) {
                    _fcmToken = existingDoc.data().fcmToken;
                    console.log('[복습알림] Firestore에서 기존 토큰 획득');
                } else {
                    console.warn('[복습알림] Firestore에도 토큰 없음');
                }
            }

            if (!_fcmToken) {
                // 토큰을 끝내 못 얻으면 SW 폴백으로 진행
                throw new Error('FCM 토큰 없음');
            }

            const notifAt = new Date(Date.now() + delayMs);
            console.log('[복습알림] Firestore 저장 시도. 예약 시각:', notifAt.toLocaleString());
            await db.collection('leaderboard').doc(String(myTag)).set(
                { nextReviewNotifAt: notifAt, nextReviewStage: stageTitle, fcmToken: _fcmToken },
                { merge: true }
            );
            console.log('[복습알림] ✅ Firestore 저장 완료 (FCM 경로)');

            if (btn) {
                btn.innerHTML = '✅ 예약됨';
                btn.disabled = true;
                btn.style.background = '#27ae60';
            }
            showToast(t('toast_remind_later', { label }));
            return;
        } catch (e) {
            console.warn('[복습알림] FCM 복습 알림 예약 실패, 로컬 폴백:', e);
        }
    }

    // 폴백: 로그인 안 됐거나 Firestore 실패 시 (앱이 열려있을 때만 작동)
    const title = t('notif_title');
    const body = t('notif_review_body', { title: stageTitle });
    const notifTag = `review-${Date.now()}`;
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(reg => {
            if (reg.active) reg.active.postMessage({ type: 'SCHEDULE_NOTIFICATION', delayMs, title, body, tag: notifTag });
        }).catch(() => {});
    }
    setTimeout(() => {
        try { new Notification(title, { body, icon: '/icon-192.png', tag: notifTag }); } catch(e) {}
    }, delayMs);

    if (btn) {
        btn.innerHTML = '✅ 예약됨';
        btn.disabled = true;
        btn.style.background = '#27ae60';
    }
    showToast(t('toast_remind_later', { label }));
}
// ── 복습 알림 예약 끝 ────────────────────────────────────────────────────────

// [기능 4] 데이터 완전 초기화 로직 (새로 추가)
function resetGameData() {
    // 1차 경고
    if (confirm("⚠️ 정말로 기기에 저장된 모든 데이터를 삭제하시겠습니까?\n\n(※ 한 번 삭제된 데이터는 파일을 미리 보관해두지 않은 이상 절대 복구할 수 없습니다.)")) {
        // 2차 경고 (실수 방지)
        if (confirm("마지막으로 확인합니다.\n정말로 모든 진행 상황을 지우고 태그 발급부터 다시 시작하시겠습니까?")) {

            window.isResetting = true;
            sessionStorage.setItem('manualReset', 'true'); // 수동 초기화 표시 (복구 팝업 비활성화)

            // 1. 하드디스크(로컬 스토리지) 완벽 소각!
            localStorage.clear();

            // 2. 혹시 모를 로컬 변수 찌꺼기 비우기
            if (typeof myPlayerId !== 'undefined') myPlayerId = "";
            window.currentSessionToken = "";

            // 🌟 3. [핵심 수술] 파이어베이스 익명 로그인 기록(투명 신분증) 소각!
            if (typeof firebase !== 'undefined' && firebase.auth) {
                // signOut()이 완전히 끝난 뒤에(then) 화면을 새로고침 하도록 기다립니다.
                firebase.auth().signOut().then(() => {
                    alert(t('alert_data_reset'));
                    location.reload();
                }).catch((error) => {
                    console.error("로그아웃 에러:", error);
                    // 혹시 에러가 나도 일단 강제 진행
                    alert(t('alert_data_reset'));
                    location.reload();
                });
            } else {
                // 파이어베이스가 연결되지 않은 환경이라면 즉시 새로고침
                alert(t('alert_data_reset'));
                location.reload();
            }
        }
    }
}

// [기능 1] 파일로 저장 및 공유 (안정성 100%: 무조건 기기 다운로드 방식)
function shareSaveCodeAndGetReward() {
    saveGameData();
    const savedData = localStorage.getItem('kingsRoadSave');
    if (!savedData) return alert(t('alert_no_save_data'));

    // 🌟 비밀번호 입력받기
    const pwd = prompt("데이터를 안전하게 보호할 '비밀번호'를 입력하세요.\n(다른 기기에서 불러올 때 이 비밀번호가 필요합니다!)");
    if (!pwd) return; // 취소 시 중단

    // ==========================================
    // 🌟 [버그 픽스] 영국 시간(UTC) 대신 한국 시간(기기 로컬 시간)으로 파일명 생성!
    const now = new Date();
    // 내 기기의 시간대(KST 등)와 UTC의 차이를 계산해서 더해줍니다.
    const localTime = new Date(now.getTime() - (now.getTimezoneOffset() * 60000));
    const today = localTime.toISOString().split('T')[0];
    // ==========================================

    const fileName = `KingsRoad_Backup_${today}.txt`;

    // 🌟 암호화 진행 (앞에 'ENC_'를 붙여 구분)
    let encodedData;
    try {
        encodedData = "ENC_" + CryptoJS.AES.encrypt(savedData, pwd).toString();
    } catch (e) {
        return alert(t('alert_encrypt_error'));
    }

    const file = new File([encodedData], fileName, { type: "text/plain" });

    // 미션 달성 처리 로직 (멘트 살짝 수정)
    const completeMission = () => {
        if (!missionData.daily) missionData.daily = {};
        if (missionData.daily.backup < 1 || !missionData.daily.backup) {
            missionData.daily.backup = 1;
            saveGameData();
            if (typeof updateMissionUI === 'function') updateMissionUI();
            alert(t('alert_file_saved_share'));
        } else {
            alert(t('alert_file_saved'));
        }
    };

    // 🌟 [핵심 수술] 모바일/PC 구분을 없애고 무조건 기기에 '다운로드' 시킵니다.
    // 불안정한 navigator.share 를 제거하여 무한 로딩(프리징) 원천 차단!
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click(); // 몰래 버튼을 눌러서 강제 다운로드 실행!
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    completeMission();
}

// [기능 2] 파일로 불러오기 (로직 단순화)
function importSaveFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        processImportData(e.target.result); // 해독과 정제는 processImportData가 모두 담당
        event.target.value = '';
    };
    reader.readAsText(file, "UTF-8");
}

// [기능 3] 붙여넣기로 불러오기 (넓은 입력창 UI)
function importSaveCode() {
    let inputModal = document.getElementById('import-input-modal');
    if (!inputModal) {
        inputModal = document.createElement('div');
        inputModal.id = 'import-input-modal';
        inputModal.style.position = 'fixed';
        inputModal.style.top = '0';
        inputModal.style.left = '0';
        inputModal.style.width = '100%';
        inputModal.style.height = '100%';
        inputModal.style.backgroundColor = 'rgba(0,0,0,0.6)';
        inputModal.style.zIndex = '10000';
        inputModal.style.display = 'flex';
        inputModal.style.justifyContent = 'center';
        inputModal.style.alignItems = 'center';

        inputModal.innerHTML = `
            <div style="background:white; padding:20px; border-radius:10px; width:90%; max-width:400px; text-align:center; box-sizing:border-box;">
                <h3 style="margin-top:0; color:#27ae60; font-size:1.2rem;">📝 코드 붙여넣기</h3>
                <p style="font-size:0.9rem; color:#7f8c8d; margin-bottom:15px;">복사한 텍스트를 아래 빈칸을 꾹 눌러 붙여넣으세요.</p>
                <textarea id="save-code-textarea" style="width:100%; height:150px; margin-bottom:15px; padding:10px; border:1px solid #bdc3c7; border-radius:5px; resize:none; font-family:monospace; box-sizing:border-box;" placeholder="여기에 전체 코드를 붙여넣으세요..."></textarea>
                <div style="display:flex; gap:10px;">
                    <button id="cancel-import-btn" style="flex:1; padding:12px; border:none; border-radius:8px; background:#e74c3c; color:white; font-weight:bold; cursor:pointer;">취소</button>
                    <button id="confirm-import-btn" style="flex:1; padding:12px; border:none; border-radius:8px; background:#2ecc71; color:white; font-weight:bold; cursor:pointer;">불러오기</button>
                </div>
            </div>
        `;
        document.body.appendChild(inputModal);
    } else {
        inputModal.style.display = 'flex';
    }

    document.getElementById('save-code-textarea').value = ''; // 초기화

    document.getElementById('cancel-import-btn').onclick = function () {
        inputModal.style.display = 'none';
    };

    document.getElementById('confirm-import-btn').onclick = function () {
        const code = document.getElementById('save-code-textarea').value;
        if (!code || code.trim() === "") return alert(t('alert_no_code'));

        inputModal.style.display = 'none';
        processImportData(code); // 통합 처리 함수로 넘김
    };
}

// [공통] 복구 실행 함수 (비밀번호 해독 및 다중 접속 차단 포함)
function processImportData(inputString) {
    try {
        let rawData = inputString.trim();
        let parsedData;

        // 🌟 [보안 추가] 1. 새로운 비밀번호 암호화 데이터(ENC_)인 경우
        if (rawData.startsWith("ENC_")) {
            const pwd = prompt("🔒 이 데이터는 잠겨있습니다.\n저장할 때 설정한 '비밀번호'를 입력하세요:");
            if (!pwd) return alert(t('alert_pwd_cancelled'));

            const encryptedText = rawData.substring(4); // "ENC_" 떼어내기
            const bytes = CryptoJS.AES.decrypt(encryptedText, pwd);
            const decryptedString = bytes.toString(CryptoJS.enc.Utf8);

            if (!decryptedString) throw new Error("비밀번호 불일치");
            parsedData = JSON.parse(decryptedString);
        }
        // 2. 예전 방식(Base64) 데이터 호환 (과거 데이터 살리기)
        else if (!rawData.startsWith('{')) {
            const cleanBase64 = rawData.replace(/\s+/g, '');
            const decoded = decodeURIComponent(atob(cleanBase64));
            parsedData = JSON.parse(decoded.replace(/[\u201C\u201D]/g, '"').replace(/[\u2018\u2019]/g, "'"));
        }
        // 3. 생짜 JSON
        else {
            parsedData = JSON.parse(rawData);
        }

        if (parsedData.gems === undefined) throw new Error("올바른 세이브 데이터가 아닙니다.");

        // 남의 코드 차단: 내 태그가 확정된 상태에서 다른 태그의 코드를 막음
        const isFreshAccount = !myTag || myTag === '0000';
        const isSameTag = parsedData.tag && parsedData.tag === myTag;
        const isSamePlayer = parsedData.playerId && parsedData.playerId === myPlayerId;
        if (!isFreshAccount && !isSameTag && !isSamePlayer) {
            alert(t('alert_wrong_account'));
            return;
        }

        if (confirm("⚠️ 현재 진행 상황을 덮어쓰고,\n선택한 기록으로 되돌리시겠습니까?\n\n(다른 기기의 데이터일 경우 기존 기기의 진행 상황은 지워집니다!)")) {

            if (typeof GAME_VERSION !== 'undefined') parsedData.version = GAME_VERSION;
            window.isResetting = true;

            // 🌟 [핵심 수술 1] 백업 데이터를 덮어씌울 때, 현재 기기의 합법적인 출입증 유지!
            // 이렇게 해야 새로고침 시 서버가 불법 침입으로 오해하지 않고 부드럽게 넘어갑니다.
            parsedData.sessionToken = window.currentSessionToken;
            // 현재 기기의 Firebase UID로 교체 (서버의 playerId === uid 검증 통과)
            if (myPlayerId) parsedData.playerId = myPlayerId;

            // 로컬 스토리지에 안전하게 저장
            localStorage.setItem('kingsRoadSave', JSON.stringify(parsedData));

            // 🌟 [추가] 화면이 새로고침된 직후 자동으로 서버에 점수를 동기화하도록 예약
            localStorage.setItem('forceSyncAfterLoad', 'true');

            // 파이어베이스 통신 없이 즉시 새로고침 (오류 원인 원천 차단!)
            alert(t('alert_restore_ok'));
            location.reload();
        }
    } catch (e) {
        console.error("데이터 복구 에러:", e);
        if (e.message === "비밀번호 불일치") {
            alert(t('alert_wrong_pwd'));
        } else {
            alert(t('alert_restore_fail'));
        }
    }
}

// 화면에 이름과 태그(#0000)를 그려주는 함수
function updateProfileUI() {
    // 1. 메인 화면 큰 닉네임
    const display = document.getElementById('home-nickname-display');
    if (display) {
        const tag = (typeof myTag !== 'undefined' && myTag) ? myTag : "0000";
        // ★ getTribeIcon 사용
        display.innerHTML = `${getTribeIcon(myTribe)}${getDeptTag(myDept)} ${myNickname} <span style="opacity:0.6; font-size:0.85em;">#${tag}</span>`;
    }

    // 2. 상단 작은 닉네임
    const subDisplay = document.getElementById('sub-profile-name');
    if (subDisplay) {
        // 지파 아이콘과 닉네임만 표시 (지파 이름 텍스트 제거)
        subDisplay.innerHTML = `${getTribeIcon(myTribe)}${getDeptTag(myDept)} ${myNickname}`;
    }

    applyHomeThemeByTribe(myTribe);
}

/* [수정] 자원 UI 업데이트 (updateGemDisplay로 통합) */
function updateResourceUI() {
    updateGemDisplay(); // 이제 이 함수가 모든 걸 처리합니다.
}

/* [시스템] 해당 챕터의 보스를 오늘 클리어했는지 확인 */
function isChapterBossClearedToday(chNum) {
    const bossId = `${chNum}-boss`;
    const lastTime = stageLastClear[bossId] || 0;
    if (lastTime === 0) return false;

    const today = new Date().setHours(0, 0, 0, 0);
    const clearDate = new Date(lastTime).setHours(0, 0, 0, 0);

    return today === clearDate;
}

/* [UI 보조] 스테이지 목록에 표시할 예상 보상 계산기 */
function getDisplayRewardInfo(stageId, type, verseCount, isAlreadyClearedToday = false) {
    let maxGem = 0;
    let maxScore = 0;
    let isReduced = false;

    // 1. 보스/중간점검의 정확한 보상 계산
    if (type === 'mid-boss' || type === 'boss') {
        // 최대 하트 기준 계산: verseCount × maxPlayerHearts × 1
        const baseScore = verseCount * maxPlayerHearts * 1;

        if (isAlreadyClearedToday) {
            // 반복 클리어: 기본 승점대로
            maxScore = baseScore;
            maxGem = verseCount * 10; // 반복: 구절 수 × 10
        } else {
            // 초회 클리어: 보너스는 때를 따른 양식에서 처리
            maxScore = baseScore * 5;
            maxGem = verseCount * 10;
        }
    }
    // 2. 일반 스테이지
    else if (type === 'normal') {
        const baseScore = maxPlayerHearts * 1;
        if (isAlreadyClearedToday) {
            maxGem = 10;
            maxScore = baseScore;
        } else {
            maxGem = 50;
            maxScore = baseScore * 5;
        }
    }

    // 3. 패널티 확인 (중간점검 & 보스가 깨졌을 때)
    if (type === 'mid-boss') {
        const chNum = parseInt(stageId.split('-')[0]);
        if (isChapterBossClearedToday(chNum)) {
            // 보스 깼으면 1/5 토막 (표시도 줄여줌)
            maxGem = Math.floor(maxGem * 0.2);
            maxScore = Math.floor(maxScore * 0.2);
            isReduced = true;
        }
    }

    return { gem: maxGem, score: maxScore, isReduced };
}

/* [시스템: 맵 화면 도움말 모달] */
function openStageHelpModal() {
    const modal = document.getElementById('stage-help-modal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeStageHelpModal() {
    const modal = document.getElementById('stage-help-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

/* [수정] 프로필 설정 팝업 (네온 반짝이 + 드롭다운 닉네임 완벽 통합본) */
function openProfileSettings() {
    if (document.getElementById('nickname-modal')) return;

    // 기존 유저의 닉네임을 형용사와 명사로 쪼개서 기억
    if (typeof myNickname !== 'undefined' && myNickname !== "순례자" && myNickname.includes(" ")) {
        const parts = myNickname.split(" ");
        window.selectedAdj = parts[0];
        window.selectedNoun = parts[1];
        window.tempName = myNickname;
        window.isFirstTimeNaming = false;
    } else {
        // 신규 유저 무작위 생성
        const _adjArr = currentLang === 'en' ? NICK_ADJECTIVES_EN : NICK_ADJECTIVES;
        const _nounArr = currentLang === 'en' ? NICK_NOUNS_EN : NICK_NOUNS;
        window.selectedAdj = _adjArr[Math.floor(Math.random() * _adjArr.length)];
        window.selectedNoun = _nounArr[Math.floor(Math.random() * _nounArr.length)];
        window.tempName = window.selectedAdj + " " + window.selectedNoun;
        window.isFirstTimeNaming = true;
    }

    // ★ [버그 픽스] 최초 생성된 이름도 tempNickname에 동기화!
    window.tempNickname = window.tempName;

    // 지파 및 부서 임시 변수 세팅
    window.tempTribe = (typeof myTribe !== 'undefined') ? myTribe : 0;
    window.tempDept = (typeof myDept !== 'undefined') ? myDept : 0;

    const modal = document.createElement('div');
    modal.id = 'nickname-modal';
    modal.className = 'modal-overlay';
    modal.style.zIndex = "9999";

    // 지파 버튼 생성 HTML (네온 스타일)
    let tribeButtonsHtml = `<div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:8px; margin-bottom:20px;">`;
    TRIBE_DATA.forEach((t) => {
        const isSelected = (t.id === window.tempTribe) ?
            `border:2px solid ${t.glow}; transform:scale(1.05); background:#fff;` :
            `border:1px solid #bdc3c7; opacity:0.8; background:#f9f9f9;`;

        const iconStyle = `
            font-size:1.8rem; 
            color:${t.core}; 
            text-shadow: 0 0 5px ${t.glow}, 0 0 15px ${t.glow};
            margin-bottom: 2px;
        `;

        tribeButtonsHtml += `
            <div id="tribe-btn-${t.id}" onclick="selectTribe(${t.id})" 
                 style="border-radius:12px; padding:10px 5px; cursor:pointer; text-align:center; transition:all 0.2s; ${isSelected} box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                <div style="${iconStyle}">✦</div>
                <div style="font-size:0.75rem; color:#2c3e50; font-weight:bold; white-space:nowrap;">${currentLang === 'en' && t.nameEn ? t.nameEn : t.name}</div>
            </div>
        `;
    });
    tribeButtonsHtml += `</div>`;

    // 부서 버튼 생성 HTML
    let deptButtonsHtml = `<div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:8px; margin-bottom:20px;">`;
    DEPT_DATA.forEach((d) => {
        const isSelected = (d.id === window.tempDept) ?
            `border:2px solid #f1c40f; transform:scale(1.03); background:#fff;` :
            `border:1px solid #bdc3c7; opacity:0.85; background:#f9f9f9;`;

        deptButtonsHtml += `
            <div id="dept-btn-${d.id}" onclick="selectDept(${d.id})"
                 style="border-radius:12px; padding:10px 5px; cursor:pointer; text-align:center; transition:all 0.2s; ${isSelected} box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                <div style="font-size:1rem; font-weight:bold; color:#2c3e50;">[${d.tag}]</div>
                <div style="font-size:0.75rem; color:#7f8c8d; font-weight:bold; white-space:nowrap;">${currentLang === 'en' && d.nameEn ? d.nameEn : d.name}</div>
            </div>
        `;
    });
    deptButtonsHtml += `</div>`;

    // 모달창 뼈대 조립
    modal.innerHTML = `
        <div class="result-card" style="max-width:340px; background:#fff; color:#2c3e50; text-align:center; max-height:85vh; overflow-y:auto; padding-bottom: 20px;">
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                <h2 style="color:#2c3e50; margin:0;">${t('profile_title')}</h2>
                <button onclick="cancelProfileRegistration()" style="background:none; border:none; color:#bdc3c7; font-size:1.8rem; cursor:pointer; padding:0; line-height:1;">&times;</button>
            </div>
            <p style="color:#7f8c8d; font-size:0.85rem; margin-bottom:15px;">${t('profile_subtitle')}</p>
            
            <div style="background:#f4f6f7; padding:15px; border-radius:15px; margin-bottom:15px; border:1px solid #ecf0f1;">
    
    <div id="preview-full" style="font-size: 1.3rem; font-weight: bold; color: #2c3e50; margin-bottom:10px; background:#2c3e50; padding:10px; border-radius:10px; color:white;">
        ${getTribeIcon(window.tempTribe)}${getDeptTag(window.tempDept)} ${window.tempName}
    </div>
    
    ${window.isFirstTimeNaming ? `
        <div style="margin-bottom: 12px; margin-top: -2px;">
            <span style="background:#ffeaa7; color:#d35400; padding:4px 10px; border-radius:12px; font-size:0.75rem; font-weight:bold; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                ${t('profile_name_tip')}
            </span>
        </div>
    ` : ''}
    
    <div style="display: flex; gap: 10px; margin-bottom: 15px;">
        <select id="adj-select" onchange="updateNicknamePreview()" style="flex:1; padding:10px; border-radius:10px; border:1px solid #bdc3c7; font-size:1rem; outline:none; background:white; color:#2c3e50; cursor:pointer;">
            ${(currentLang === 'en' ? NICK_ADJECTIVES_EN : NICK_ADJECTIVES).map(adj => `<option value="${adj}">${adj}</option>`).join('')}
        </select>
        <select id="noun-select" onchange="updateNicknamePreview()" style="flex:1; padding:10px; border-radius:10px; border:1px solid #bdc3c7; font-size:1rem; outline:none; background:white; color:#2c3e50; cursor:pointer;">
            ${(currentLang === 'en' ? NICK_NOUNS_EN : NICK_NOUNS).map(noun => `<option value="${noun}">${noun}</option>`).join('')}
        </select>
    </div>

    <button onclick="generateRandomNickname()" style="background:white; border:1px solid #bdc3c7; color:#7f8c8d; padding:8px 15px; border-radius:20px; font-weight:bold; cursor:pointer; font-size:0.85rem;">
        ${t('profile_random_name')}
    </button>
</div>

            <div style="text-align:left; font-size:0.9rem; font-weight:bold; color:#7f8c8d; margin-bottom:10px; margin-left:5px;">${t('profile_dept_label')}</div>
            ${deptButtonsHtml}

            <div style="text-align:left; font-size:0.9rem; font-weight:bold; color:#7f8c8d; margin-bottom:10px; margin-left:5px;">${t('profile_tribe_label')}</div>
            ${tribeButtonsHtml}

            <button onclick="confirmProfile()" style="width:100%; background:#f1c40f; color:#2c3e50; border:none; padding:12px; border-radius:30px; font-weight:bold; cursor:pointer; font-size:1.1rem; box-shadow: 0 4px 0 #d35400;">
                ${t('profile_confirm')}
            </button>
        </div>
    `;

    // 🌟 [필수 복구] 모달 바깥을 누르면 닫히는 기능과 화면에 띄우는 기능
    modal.onclick = function (event) {
        if (event.target === modal) cancelProfileRegistration();
    };
    document.body.appendChild(modal);

    // 모달을 띄우면서 드롭다운에 현재 선택된 단어를 매칭시켜줍니다.
    setTimeout(() => {
        const adjSelect = document.getElementById('adj-select');
        const nounSelect = document.getElementById('noun-select');
        if (adjSelect && window.selectedAdj) adjSelect.value = window.selectedAdj;
        if (nounSelect && window.selectedNoun) nounSelect.value = window.selectedNoun;

        modal.classList.add('active');
    }, 10);
}

/* [기능] 지파 선택 처리 (선택 시 UI 갱신) */
function selectTribe(id) {
    window.tempTribe = id;

    // 모든 버튼 스타일 초기화 후 선택된 것만 강조
    TRIBE_DATA.forEach(t => {
        const btn = document.getElementById(`tribe-btn-${t.id}`);
        if (t.id === id) {
            btn.style.border = `2px solid ${t.glow}`;
            btn.style.transform = "scale(1.05)";
            btn.style.background = "#fff";
            btn.style.opacity = "1";
        } else {
            btn.style.border = "1px solid #bdc3c7";
            btn.style.transform = "scale(1)";
            btn.style.background = "#f9f9f9";
            btn.style.opacity = "0.8";
        }
    });

    updatePreviewText();
}

/* [기능] 부서 선택 처리 (선택 시 UI 갱신) */
function selectDept(id) {
    window.tempDept = id;

    DEPT_DATA.forEach(d => {
        const btn = document.getElementById(`dept-btn-${d.id}`);
        if (!btn) return;
        if (d.id === id) {
            btn.style.border = "2px solid #f1c40f";
            btn.style.transform = "scale(1.03)";
            btn.style.background = "#fff";
            btn.style.opacity = "1";
        } else {
            btn.style.border = "1px solid #bdc3c7";
            btn.style.transform = "scale(1)";
            btn.style.background = "#f9f9f9";
            btn.style.opacity = "0.85";
        }
    });

    updatePreviewText();
}

/* [기능] 이름 랜덤 변경 */
function refreshNickname() {
    window.tempNickname = generateRandomNickname();
    updatePreviewText();
}

/* [기능] 미리보기 텍스트 갱신 헬퍼 */
function updatePreviewText() {
    const preview = document.getElementById('preview-full');
    if (preview) {
        preview.innerHTML = `${getTribeIcon(window.tempTribe)}${getDeptTag(window.tempDept)} ${window.tempNickname}`;
    }
}

/* [기능] 프로필 확정 (저장) + 지파 이적 페널티 */
async function confirmProfile() {
    // 🌟 [핵심 방어막] 최초 가입이 아닌 유저가 지파를 바꿀 때 경고!
    if (myNickname !== "순례자" && myTribe !== window.tempTribe) {
        const warnMsg = t('profile_tribe_warn');
        if (!confirm(warnMsg)) {
            return; // 취소하면 함수 종료 (변경 취소)
        }
        // 확인을 눌렀다면 기여도를 무자비하게 0점으로 초기화!
        if (typeof leagueData !== 'undefined') {
            leagueData.yearlyScore = 0;
            console.log("🚨 지파 변경으로 인해 연간 승점이 0으로 초기화되었습니다.");
        }
    }

    if (window.tempNickname) myNickname = window.tempNickname;
    if (window.tempTribe !== undefined) myTribe = window.tempTribe;
    if (window.tempDept !== undefined) myDept = window.tempDept;

    // 신규 유저(tag 없음)에 한해 중복 없는 tag 생성
    if (!myTag) myTag = await generateUniqueTag();

    // 저장 및 갱신
    saveGameData();
    syncToFirestore(); // [Firestore] 프로필 변경
    updateProfileUI();

    // 메인 화면 갱신
    if (typeof saveMyScoreToServer === 'function') saveMyScoreToServer(); // 서버 전송

    // 팝업 닫기
    const modal = document.getElementById('nickname-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }

    const tribeName = getTribeName(TRIBE_DATA[myTribe]);
    alert(t('alert_welcome_tribe', { tribe: tribeName, nick: myNickname }));

    // 신규 유저에게 게임 가이드 자동 표시
    if (window.isFirstTimeNaming && !localStorage.getItem('hasShownGuide')) {
        localStorage.setItem('hasShownGuide', 'true');
        setTimeout(openGuideModal, 500);
    }
}

/* [시스템] 데이터 경고 팝업 제어 */
function checkDataWarning() {
    // '다시 보지 않기'가 체크되어 있는지 확인
    const isHidden = localStorage.getItem("hideDataWarning");

    // 저장된 값이 없으면 팝업을 보여줌
    if (!isHidden) {
        document.getElementById('data-warning-modal').style.display = 'flex';
    }
}

/* 팝업 닫기 함수 */
function closeWarningModal() {
    const checkbox = document.getElementById('dont-show-again');
    const modal = document.getElementById('data-warning-modal');

    // 체크박스에 체크했으면 영구적으로 숨김 처리
    if (checkbox.checked) {
        localStorage.setItem("hideDataWarning", "true");
    }

    modal.style.display = 'none';
}

// 게임 시작 시 자동 실행 (기존 window.onload 안에 넣거나, 맨 아래에 추가)
// setTimeout을 써서 게임 로딩 0.5초 뒤에 뜨게 하면 더 자연스러움
setTimeout(checkDataWarning, 500);

/* [시스템: 게임 초기화 및 시작] */
window.onload = function () {
    // 1. 저장된 데이터 불러오기 (가장 중요)
    loadGameData();

    // 🌟 [핵심 장전] 서버에 데이터를 쏘기 전에, 방금 불러온 세이브 파일에서 토큰을 꺼내 메모리에 확실히 쥐여줍니다!
    const savedData = JSON.parse(localStorage.getItem('kingsRoadSave') || "{}");
    if (savedData.sessionToken) {
        window.currentSessionToken = savedData.sessionToken;
    }

    // 2. 복구 직후 자동 동기화는 initFirestoreSync()에서 forceSyncAfterLoad 플래그를 보고 처리

    checkMissions(); // [추가] 게임 시작 시 미션 초기화 체크
    updateStats('login');
    startKingsRoadInfoTimer();
    updateNotificationBadges();

    // 4. 화면 UI 갱신
    updateGemDisplay();
    if (typeof updateResourceUI === 'function') updateResourceUI();
    if (typeof updateProfileUI === 'function') updateProfileUI();
    if (typeof updateCastleView === 'function') updateCastleView();
    ensurePlaytimeStats();
    startPlaySession();
    if (!window.playtimeTrackingInitialized) {
        window.playtimeTrackingInitialized = true;

        // 📱 1. 모바일 & 탭 이동 대응: 화면이 안 보일 때 서버에 저장
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                stopPlaySession();

                // 🌟 화면이 가려지는 순간(홈으로 나가기 등), 서버로 데이터를 툭 던져놓습니다.
                if (typeof saveMyScoreToServer === 'function') saveMyScoreToServer();
                console.log("🔒 화면 숨김 감지: 서버에 안전하게 데이터 백업 완료");
            } else {
                startPlaySession();
            }
        });

        // 💻 2. PC 대응: 브라우저 탭을 완전히 닫거나 새로고침할 때 서버에 저장
        window.addEventListener('beforeunload', (event) => {
            stopPlaySession();

            // 🌟 창이 닫히기 직전 마지막으로 서버에 기록을 남깁니다.
            if (typeof saveMyScoreToServer === 'function') saveMyScoreToServer();
        });
    }

    console.log("✅ 게임 로딩 완료!");




    // ▼▼▼ [수정] 최초 1회만 닉네임 설정창 띄우기 ▼▼▼
    if (myNickname === "순례자" && !localStorage.getItem('hasShownProfileSetup')) {
        localStorage.setItem('hasShownProfileSetup', 'true');
        // 수동 초기화는 복구 팝업 없이 바로 프로필 설정
        const isManualReset = sessionStorage.getItem('manualReset') === 'true';
        sessionStorage.removeItem('manualReset');
        if (isManualReset) {
            setTimeout(openProfileSettings, 1000);
        } else {
            // 자동 초기화(세션 충돌 등) 시에만 복구 팝업 제공
            setTimeout(() => {
                const wantRecover = confirm("👋 처음 오셨나요?\n\n이전에 플레이한 기록이 있다면 '확인'을 눌러 복구할 수 있습니다.\n(새로 시작하려면 '취소')");
                if (wantRecover) {
                    openTagRecovery();
                } else {
                    openProfileSettings();
                }
            }, 1000);
        }
    }
};

/**
 * 이전 계정 태그로 데이터 복구
 * pendingRecovery/{tag} 문서를 조회해 현재 계정으로 복원한다.
 */
async function openTagRecovery() {
    if (typeof db === 'undefined' || !db) {
        alert(t('alert_server_disconnect'));
        openProfileSettings();
        return;
    }

    const tag = prompt('🔍 이전 계정의 태그를 입력하세요.\n(예: KWXMKY — # 없이 영문 6자리)');
    if (!tag || tag.trim() === '') {
        openProfileSettings();
        return;
    }

    const cleanTag = tag.trim().toUpperCase();

    try {
        const doc = await db.collection('pendingRecovery').doc(cleanTag).get();
        if (!doc.exists) {
            alert(t('alert_tag_not_found'));
            openProfileSettings();
            return;
        }

        const recoveryData = doc.data();
        delete recoveryData.pendingRecovery;
        delete recoveryData.recoveryCreatedAt;

        recoveryData.playerId = myPlayerId;
        recoveryData.sessionToken = window.currentSessionToken || recoveryData.sessionToken;
        if (typeof GAME_VERSION !== 'undefined') recoveryData.version = GAME_VERSION;

        localStorage.setItem('kingsRoadSave', JSON.stringify(recoveryData));
        localStorage.setItem('forceSyncAfterLoad', 'true');

        await db.collection('pendingRecovery').doc(cleanTag).delete();

        alert(t('alert_recovery_ok', { nick: recoveryData.nickname, tag: recoveryData.tag }));
        location.reload();
    } catch (e) {
        console.error('[openTagRecovery]', e);
        alert(t('alert_recovery_error'));
        openProfileSettings();
    }
}

/* [시스템: 클리어 축하 폭죽 효과 (Confetti)] */
function triggerConfetti() {
    const duration = 1500; // 1.5초 동안 지속
    const end = Date.now() + duration;

    // 캔버스 생성 및 설정
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none'; // 클릭 통과 (게임 방해 X)
    canvas.style.zIndex = '9999'; // 모달보다 위에 뜨도록
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    // 리사이즈 대응
    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    // 파티클 색상 (게임 테마색: 황금, 빨강, 초록, 파랑, 흰색)
    const colors = ['#f1c40f', '#e74c3c', '#2ecc71', '#3498db', '#ffffff'];
    const particles = [];

    // 파티클 생성 함수
    function createParticle() {
        return {
            x: Math.random() * width, // 화면 가로 랜덤 위치
            y: Math.random() * height - height, // 화면 위쪽에서 시작
            r: Math.random() * 10 + 5, // 크기
            color: colors[Math.floor(Math.random() * colors.length)],
            tilt: Math.floor(Math.random() * 10) - 10,
            tiltAngle: 0,
            tiltAngleIncr: (Math.random() * 0.07) + 0.05,
            dy: (Math.random() * 5) + 2, // 떨어지는 속도
            dx: (Math.random() * 2) - 1  // 흔들리는 정도
        };
    }

    // 초기 파티클 150개 생성
    for (let i = 0; i < 150; i++) {
        particles.push(createParticle());
    }

    // 애니메이션 루프
    (function frame() {
        const timeLeft = end - Date.now();

        // 시간이 다 되면 캔버스 지우고 종료
        if (timeLeft <= 0) {
            canvas.style.transition = 'opacity 1s';
            canvas.style.opacity = '0';
            setTimeout(() => canvas.remove(), 1000);
            return;
        }

        ctx.clearRect(0, 0, width, height);

        particles.forEach((p, i) => {
            p.tiltAngle += p.tiltAngleIncr;
            p.y += p.dy; // 아래로 떨어짐
            p.x += Math.sin(p.tiltAngle) * 2; // 좌우로 살랑살랑

            // 바닥에 닿으면 다시 위로 (시간 내에는 계속 순환)
            if (p.y > height) {
                particles[i] = createParticle();
                particles[i].y = -20; // 화면 위에서 다시 시작
            }

            // 그리기 (사각형 종이 모양)
            ctx.beginPath();
            ctx.lineWidth = p.r;
            ctx.strokeStyle = p.color;
            ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
            ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r);
            ctx.stroke();
        });

        requestAnimationFrame(frame);
    }());
}

/* ========================================
   [정식 배포 버전 - 디버그 기능 제거됨]
   ======================================== */

/* =========================================
   [시스템: 업적(나의 기록실) UI 및 로직]
   ========================================= */

// 1. 업적 화면 열기 (수정됨)
function openAchievement() {
    // 다른 화면 끄기
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));

    // 화면이 없으면 생성 (최초 1회)
    let screen = document.getElementById('achievement-screen');
    if (!screen) {
        screen = document.createElement('div');
        screen.id = 'achievement-screen';
        screen.className = 'screen';
        // [유지] 방향 설정은 놔두셔도 됩니다 (CSS로 옮겨도 되지만 여기 둬도 무방)
        screen.style.flexDirection = 'column';
        screen.style.backgroundColor = '#2c3e50';

        screen.innerHTML = `
            <div class="map-header" style="justify-content: center; flex-shrink: 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                <div style="font-weight:bold; font-size:1.3rem; color:#f1c40f;">${t('achievement_screen_title')}</div>
            </div>

            <div style="text-align:center; padding:15px; background:rgba(0,0,0,0.2); color:#bdc3c7; font-size:0.9rem; flex-shrink: 0;">
                ${t('achievement_screen_subtitle')}
            </div>

            <div id="record-summary" style="padding:15px; flex-shrink:0;">
            </div>

            <div id="achievement-list" style="flex: 1; overflow-y: auto; padding: 20px; padding-bottom: 80px;">
                </div>

            <div class="button-area-static">
                <button class="btn-gray btn-back" onclick="goMap()">${t('btn_go_back')}</button>
            </div>
        `;
        document.body.appendChild(screen);
    }

    screen.classList.add('active'); // 여기서 CSS가 display: flex를 적용해줍니다.
    renderMyPlayRecord();
    renderAchievementList(); // 목록 그리기
    // 백버튼 가시성 갱신 (기록실 화면에서는 보여야 함)
    if (typeof updateBackButtonVisibility === 'function') updateBackButtonVisibility();
}

// 2. 업적 목록 그리기 (핵심 로직)
function renderAchievementList() {
    const list = document.getElementById('achievement-list');
    if (!list) return;
    list.innerHTML = "";

    // 통계 변수 매핑 (데이터 키 -> userStats 키)
    const statsMap = {
        login: 'loginDays',
        verse: 'totalVersesCleared',
        boss: 'totalBossKilled',
        gem: 'totalGemsEarned',
        perfect: 'totalPerfects',
        castle: 'maxCastleLevel',
        earlybird: 'earlyBirdCounts'
    };

    // 아이콘 매핑
    const iconMap = {
        login: '🕯️', verse: '📖', boss: '🏆',
        gem: '💎', perfect: '✨', castle: '🏰', earlybird: '🌅'
    };

    // ACHIEVEMENT_DATA 순회
    for (let key in ACHIEVEMENT_DATA) {
        const data = ACHIEVEMENT_DATA[key];
        const currentTierIdx = achievementStatus[key] || 0; // 현재 단계 (0부터 시작)
        const maxTier = data.tiers.length;

        // 현재 내 수치 가져오기
        let myValue = 0;
        if (key === 'castle') {
            myValue = (typeof userStats !== 'undefined' && userStats.maxCastleLevel)
                ? userStats.maxCastleLevel : myCastleLevel;
        } else {
            myValue = (typeof userStats !== 'undefined') ? userStats[statsMap[key]] : 0;
        }
        if (!myValue) myValue = 0;

        // 아이템 박스 생성
        const item = document.createElement('div');

        item.style.cssText = "background:white; border-radius:15px; padding:15px; margin-bottom:15px; display:flex; align-items:center; box-shadow:0 4px 6px rgba(0,0,0,0.1);";

        // 왼쪽 아이콘
        const iconDiv = document.createElement('div');
        iconDiv.style.cssText = "font-size:2rem; margin-right:15px; width:50px; text-align:center;";
        iconDiv.innerText = iconMap[key] || '🏅';

        // 중간 정보
        const infoDiv = document.createElement('div');
        infoDiv.style.flex = "1";

        // 목표 설정
        let target = 0;
        let reward = 0;
        let isMax = false;

        if (currentTierIdx >= maxTier) {
            isMax = true; // 모든 단계 완료
            target = data.tiers[maxTier - 1]; // 마지막 목표 보여줌
        } else {
            target = data.tiers[currentTierIdx];
            reward = data.rewards[currentTierIdx];
        }

        // 진행률 계산
        let percent = Math.min(100, Math.floor((myValue / target) * 100));
        if (isMax) percent = 100;

        // 텍스트 생성
        const dataTitle = (currentLang === 'en' && data.titleEn) ? data.titleEn : data.title;
        const dataDesc = (currentLang === 'en' && data.descEn) ? data.descEn : data.desc;
        let titleHtml = `<div style="font-weight:bold; color:#2c3e50; font-size:1rem;">${dataTitle} <span style="font-size:0.8rem; color:#7f8c8d;">(Lv.${currentTierIdx + 1})</span></div>`;
        if (isMax) titleHtml = `<div style="font-weight:bold; color:#f1c40f; font-size:1rem;">${dataTitle} ${t('achievement_complete')}</div>`;

        let descHtml = `<div style="font-size:0.8rem; color:#95a5a6; margin-bottom:5px;">${dataDesc}</div>`;

        let progressHtml = `
            <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:#7f8c8d; margin-bottom:2px;">
                <span>${t('achievement_progress_current', { val: myValue.toLocaleString() })}</span>
                <span>${t('achievement_progress_target', { val: target.toLocaleString() })}</span>
            </div>
            <div style="width:100%; height:8px; background:#ecf0f1; border-radius:4px; overflow:hidden;">
                <div style="width:${percent}%; height:100%; background:${isMax ? '#2ecc71' : '#f1c40f'}; transition:width 0.5s;"></div>
            </div>
        `;

        infoDiv.innerHTML = titleHtml + descHtml + progressHtml;

        // 오른쪽 버튼
        const btnDiv = document.createElement('div');
        btnDiv.style.marginLeft = "10px";

        if (isMax) {
            btnDiv.innerHTML = `<button disabled style="background:#2ecc71; color:white; border:none; padding:8px 12px; border-radius:10px; font-weight:bold; font-size:0.8rem;">${t('achievement_conquered')}</button>`;
        } else if (myValue >= target) {
            // 보상 받기 가능
            btnDiv.innerHTML = `<button onclick="claimAchievementReward('${key}')" class="btn-pulse" style="background:#e74c3c; color:white; border:none; padding:8px 15px; border-radius:10px; font-weight:bold; cursor:pointer; font-size:0.85rem; box-shadow:0 3px 0 #c0392b;">💎 ${reward}<br>${t('achievement_claim')}</button>`;
        } else {
            // 진행 중
            btnDiv.innerHTML = `<button disabled style="background:#ecf0f1; color:#bdc3c7; border:1px solid #bdc3c7; padding:8px 12px; border-radius:10px; font-size:0.8rem;">${t('achievement_in_progress')}</button>`;
        }

        item.appendChild(iconDiv);
        item.appendChild(infoDiv);
        item.appendChild(btnDiv);
        list.appendChild(item);
    }
}

// 3. 보상 받기 함수
function claimAchievementReward(key) {
    const data = ACHIEVEMENT_DATA[key];
    const currentTierIdx = achievementStatus[key] || 0;

    // 안전 장치
    if (currentTierIdx >= data.tiers.length) return;

    const reward = data.rewards[currentTierIdx];

    // 1. 보상 지급
    if (typeof myGems === 'undefined') myGems = 0;
    myGems += reward;

    // 2. 단계 상승 및 저장
    achievementStatus[key]++;

    // 3. 저장 및 갱신
    if (typeof updateGemDisplay === 'function') updateGemDisplay();
    if (typeof saveGameData === 'function') saveGameData();
    if (typeof syncToFirestore === 'function') syncToFirestore(); // [Firestore] 업적 보상 청구
    updateNotificationBadges();

    // 4. 효과음 및 알림
    if (typeof SoundEffect !== 'undefined') SoundEffect.playLevelUp(); // 또는 playGetGem
    if (typeof triggerConfetti === 'function') triggerConfetti();

    alert(t('alert_achievement', { title: (currentLang === 'en' && data.titleEn) ? data.titleEn : data.title, count: reward }));

    // 5. 리스트 새로고침 (다음 단계 보여주기 위해)
    renderAchievementList();
}

/* [시스템] 알림 배지 상태 업데이트 함수 */
function updateNotificationBadges() {
    // 1. 업적(기록실) 알림 체크
    let hasAchievementReward = false;

    // 모든 업적을 돌면서 '달성했으나 아직 안 받은 보상'이 있는지 확인
    for (let key in ACHIEVEMENT_DATA) {
        const data = ACHIEVEMENT_DATA[key];
        const currentTierIdx = achievementStatus[key] || 0;

        // 마지막 단계가 아니라면 체크
        if (currentTierIdx < data.tiers.length) {
            const target = data.tiers[currentTierIdx];

            // 내 수치 가져오기 (매핑 로직 재사용)
            const statsMap = { login: 'loginDays', verse: 'totalVersesCleared', boss: 'totalBossKilled', gem: 'totalGemsEarned', perfect: 'totalPerfects', castle: 'maxCastleLevel', earlybird: 'earlyBirdCounts' };
            let myValue = 0;
            if (key === 'castle') myValue = (typeof userStats !== 'undefined' && userStats.maxCastleLevel) ? userStats.maxCastleLevel : myCastleLevel;
            else myValue = (typeof userStats !== 'undefined') ? userStats[statsMap[key]] : 0;

            // 목표 달성했으면 알림 ON
            if (myValue >= target) {
                hasAchievementReward = true;
                break; // 하나라도 있으면 충분함
            }
        }
    }

    // 기록실 배지는 사용하지 않음 — 항상 숨김
    const achBadge = document.getElementById('badge-achievement');
    if (achBadge) achBadge.classList.remove('active');

    // 2. 미션 알림 체크
    let hasMissionReward = false;

    // 일일 미션 체크
    if (missionData && missionData.daily) {
        // 하드코딩된 목표치와 비교 (updateMissionUI 로직 참조)
        if ((missionData.daily.loginReward || 0) >= 1 && !missionData.daily.claimed[0]) hasMissionReward = true;
        if (missionData.daily.newClear >= 1 && !missionData.daily.claimed[1]) hasMissionReward = true;
        if (missionData.daily.checkpointBoss >= 1 && !missionData.daily.claimed[2]) hasMissionReward = true;
    }
    // 주간 미션 체크
    if (missionData && missionData.weekly) {
        if (missionData.weekly.attendance >= 5 && !missionData.weekly.claimed[0]) hasMissionReward = true;
        if (missionData.weekly.dragonKill >= 5 && !missionData.weekly.claimed[1]) hasMissionReward = true;
        if (missionData.weekly.stageClear >= 15 && !missionData.weekly.claimed[2]) hasMissionReward = true;
    }

    // 배지 켜기/끄기
    const misBadge = document.getElementById('badge-mission');
    if (misBadge) {
        if (hasMissionReward) misBadge.classList.add('active');
        else misBadge.classList.remove('active');
    }

    // 3. 상점 알림 체크 (일일 무료 생명의 떡)
    const hasFreeLifeBread = (typeof isLifeBreadFreeAvailable === 'function') && isLifeBreadFreeAvailable();
    const shopBadge = document.getElementById('badge-shop');
    if (shopBadge) {
        if (hasFreeLifeBread) shopBadge.classList.add('active');
        else shopBadge.classList.remove('active');
    }

    // 4. 더보기 알림 체크 (상점 무료 생명의 떡 포함)
    const moreBadge = document.getElementById('badge-more');
    if (moreBadge) {
        if (hasFreeLifeBread) moreBadge.classList.add('active');
        else moreBadge.classList.remove('active');
    }
}

/* [기능] 보스 타격 연출 함수 (흔들림 + 데미지 숫자) */
function triggerBossHitEffect() {
    const bossAvatar = document.querySelector('.boss-avatar');

    // 1. 흔들림 효과 (클래스 줬다 뺏기)
    if (bossAvatar) {
        bossAvatar.classList.remove('boss-hit-effect'); // 혹시 있으면 제거
        void bossAvatar.offsetWidth; // 리플로우 강제 (애니메이션 리셋용)
        bossAvatar.classList.add('boss-hit-effect');

        // 애니메이션 끝나면 클래스 제거 (깔끔하게)
        setTimeout(() => {
            bossAvatar.classList.remove('boss-hit-effect');
        }, 500);
    }

    // 2. 데미지 텍스트 띄우기 (머리 위에 -1)
    if (bossAvatar) {
        const damageText = document.createElement('div');
        damageText.className = 'floating-damage';
        damageText.innerText = "-1";

        // 보스 위치 기준으로 좌표 잡기
        const rect = bossAvatar.getBoundingClientRect();
        // 화면 중앙쯤에 배치 (보스 머리 위)
        damageText.style.left = (rect.left + rect.width / 2 - 10) + 'px';
        damageText.style.top = (rect.top) + 'px';

        document.body.appendChild(damageText);

        // 1초 뒤에 텍스트 삭제 (청소)
        setTimeout(() => damageText.remove(), 1000);
    }
}

/* [시스템] 마일스톤 팝업 처리기 */
function tryShowMilestone() {
    // 1. 이미 팝업이 떠 있거나, 대기열이 비었으면 중단
    if (isMilestoneShowing || milestoneQueue.length === 0) return;

    // 2. 현재 전투 화면(game-screen)이면 방해하지 않음 (단, 결과창은 제외)
    const gameScreen = document.getElementById('game-screen');
    const resultModal = document.getElementById('result-modal');

    // 게임 화면이 켜져있는데 결과창은 안 켜져있다? -> 한창 싸우는 중 -> 보류
    if (gameScreen.classList.contains('active') && !resultModal.classList.contains('active')) {
        console.log("⚔️ 전투 중이라 업적 알림을 보류합니다.");
        return;
    }

    // 3. 팝업 표시 시작
    isMilestoneShowing = true;
    const item = milestoneQueue.shift(); // 대기열에서 하나 꺼냄

    // HTML 생성
    const overlay = document.getElementById('milestone-overlay') || createMilestoneOverlay();
    const iconMap = { login: '🕯️', verse: '📖', boss: '🏆', gem: '💎', perfect: '✨', castle: '🏰', earlybird: '🌅' };

    const rewardVal = item.data.rewards[item.tier];
    const milestoneTitle = (currentLang === 'en' && item.data.titleEn) ? item.data.titleEn : item.data.title;
    const milestoneDesc = (currentLang === 'en' && item.data.descEn) ? item.data.descEn : item.data.desc;

    // 내용 채우기
    overlay.innerHTML = `
        <div class="sunburst"></div>
        <div class="milestone-card">
            <div class="milestone-icon">${iconMap[item.key]}</div>
            <div class="milestone-title">LEVEL UP!</div>
            <div style="font-size:1.1rem; font-weight:bold; color:#2c3e50; margin-bottom:5px;">
                ${milestoneTitle}
            </div>
            <div class="milestone-desc">
                ${milestoneDesc}
            </div>

            <div class="milestone-reward">
                ${t('milestone_reward', { val: rewardVal })}
            </div>

            <button class="btn-get-reward" onclick="claimMilestoneReward('${item.key}', ${item.tier}, ${rewardVal})">
                ${t('milestone_btn')}
            </button>
        </div>
    `;

    overlay.style.display = 'flex';

    // 효과음: 팡파레! (기존 playClear보다 더 웅장하게)
    if (typeof SoundEffect !== 'undefined') {
        SoundEffect.playLevelUp(); // 기존 효과음 활용 (또는 새로 만들어도 됨)
    }
    if (typeof triggerConfetti === 'function') triggerConfetti(); // 폭죽 발사!
}

// 오버레이가 없으면 만드는 함수
function createMilestoneOverlay() {
    const div = document.createElement('div');
    div.id = 'milestone-overlay';
    document.body.appendChild(div);
    return div;
}

// 보상 받기 버튼 클릭 시
function claimMilestoneReward(key, tier, reward) {
    // 1. 보상 지급
    if (typeof myGems === 'undefined') myGems = 0;
    myGems += reward;

    // 2. 상태 업데이트
    achievementStatus[key] = tier + 1;

    // 3. 시각적 피드백 즉시 처리 (INP 개선)
    updateGemDisplay();
    const overlay = document.getElementById('milestone-overlay');
    overlay.style.display = 'none';
    isMilestoneShowing = false;

    // 4. 무거운 작업은 다음 태스크로 미뤄 브라우저가 먼저 페인트하게 함
    setTimeout(() => {
        saveGameData();
        syncToFirestore(); // [Firestore] 마일스톤 보상 청구
        updateNotificationBadges(); // 배지 갱신
        tryShowMilestone(); // 다음 대기열 확인 (연속 달성 시 줄줄이 사탕처럼 나옴)
    }, 0);
}

/* [시스템: 데이터 보호 시스템] */

// 페이지 종료/새로고침 직전 강제 저장
// 실수로 창을 닫거나 새로고침했을 때 마지막 순간을 기록합니다.
window.addEventListener("beforeunload", () => {
    saveGameData();
    if (typeof saveMyScoreToServer === 'function') saveMyScoreToServer();
});

// 앱 백그라운드 전환 시 저장 (모바일 홈 버튼, 탭 전환 등)
document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === 'hidden') {
        saveGameData();
    }
});

// [시스템] 스테이지 목록 강제 새로고침 (UI 갱신용)
function reloadCurrentChapterUI() {
    // 현재 선택된 스테이지 ID가 없다면 중단
    if (!window.currentStageId) return;

    // ID에서 챕터 번호 추출 (예: "1-1" -> 1)
    const chNum = parseInt(window.currentStageId.split('-')[0]);

    // 해당 챕터의 데이터를 찾음
    const chData = gameData.find(c => c.id === chNum);

    // 스테이지 시트(목록)를 다시 엽니다 (이 과정에서 버튼 상태가 갱신됨)
    if (chData) {
        openStageSheet(chData);
    }
}

// [시스템] 스테이지 ID로 해당 챕터 시트 열기 (클리어 후 자동 표시용)
function openStageSheetForStageId(stageId) {
    if (!stageId) return;
    const chNum = parseInt(String(stageId).split('-')[0]);
    if (isNaN(chNum)) return;
    const chData = gameData.find(c => c.id === chNum);
    if (chData) {
        openStageSheet(chData);
    }
}

/* =========================================
   [서버 연동] 파이어베이스 점수 저장 및 시온성 심사
   ========================================= */
let lastScorePayloadKey = null;
function saveMyScoreToServer() {
    if (typeof db === 'undefined' || !db || !myTag) return;

    const currentWeekId = leagueData.weekId || getWeekId();
    const currentScore = leagueData.myScore || 0;

    // 👉 [추가된 부분] 월간 ID와 월간 점수도 꼭 챙겨야 합니다!
    const currentMonthId = leagueData.monthId || getMonthId();
    const currentMonthlyScore = leagueData.myMonthlyScore || 0;
    // 🌟 [핵심 수술 3단계: 서버로 보낼 짐싸기]
    const currentTotalScore = leagueData.totalScore || 0;
    const currentYearlyScore = leagueData.yearlyScore || 0; // 🌟 추가

    const payload = {
        nickname: myNickname,
        score: currentScore,
        castleLv: myCastleLevel,
        tribe: myTribe,
        dept: myDept,
        tag: myTag,
        weekId: currentWeekId,
        monthId: currentMonthId,
        myMonthlyScore: currentMonthlyScore,
        totalScore: currentTotalScore, // 👉 누적 승점 항목 추가!
        yearlyScore: currentYearlyScore // 🌟 추가 (이걸 바탕으로 서버가 지파 합산을 합니다)
    };

    // 월 전환 시 이전달 백업 데이터가 있으면 함께 전송 (CF 아카이빙 경쟁조건 방어)
    if (leagueData.prevMonthId && leagueData.prevMonthlyScore > 0) {
        payload.prevMonthId = leagueData.prevMonthId;
        payload.prevMonthlyScore = leagueData.prevMonthlyScore;
    }

    if (typeof lastScorePayloadKey === 'undefined' || lastScorePayloadKey === null) {
        try {
            lastScorePayloadKey = localStorage.getItem("kingsroad_last_score_payload") || "";
        } catch (e) {
            lastScorePayloadKey = "";
        }
    }

    const nextKey = JSON.stringify(payload);

    // ★ 방어막: 데이터가 이전과 똑같다면 파이어베이스에 안 보내고 조용히 함수 종료!
    if (nextKey === lastScorePayloadKey) return;

    // ★ 진짜로 서버에 데이터를 보낼 때만 로그를 띄우도록 위치 변경
    console.log("📡 점수 변동 감지! 서버에 주간 점수 저장 중...");

    db.collection("leaderboard").doc(myTag).set({
        ...payload,
        updatedAt: new Date()
    }, { merge: true })
        .then(() => {
            lastScorePayloadKey = nextKey;
            try {
                localStorage.setItem("kingsroad_last_score_payload", nextKey);
            } catch (e) {
                // Ignore storage errors.
            }
            console.log(`✅ 서버 저장 완료: ${currentScore}점 (${currentWeekId})`);
            // 구형 문서(tag가 숫자로 저장된 것) 1회 자동 삭제
            if (!localStorage.getItem('kingsroad_legacy_cleanup_done') && myTag && myTag !== '0000') {
                const numericTag = parseInt(myTag, 10);
                if (!isNaN(numericTag)) {
                    db.collection('leaderboard')
                        .where('tag', '==', numericTag)
                        .get()
                        .then(snapshot => {
                            snapshot.forEach(doc => {
                                if (doc.id !== myTag) {
                                    doc.ref.delete().catch(() => {});
                                }
                            });
                            localStorage.setItem('kingsroad_legacy_cleanup_done', '1');
                        })
                        .catch(() => {});
                }
            }
        })
        .catch((error) => {
            console.error("❌ 점수 저장 실패:", error);
        });
}

function renderMyPlayRecord() {
    const summary = document.getElementById('record-summary');
    if (!summary) return;
    ensurePlaytimeStats();

    const totalPlaySeconds = getTotalPlaySecondsNow();
    const avgDailySeconds = getAverageDailySecondsLast7Days();
    const counts = getStageClearCounts();
    const totalMemoryLevel = getTotalMemoryLevel();
    const gems = (userStats && typeof userStats.totalGemsEarned === 'number') ? userStats.totalGemsEarned : 0;
    const score = (userStats && typeof userStats.totalScoreEarned === 'number') ? userStats.totalScoreEarned : 0;

    const tile = (icon, label, value, accent) => `
        <div style="background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.12); border-radius:12px; padding:10px; color:#ecf0f1; font-size:0.85rem; box-shadow:0 6px 12px rgba(0,0,0,0.2);">
            <div style="display:flex; align-items:center; gap:6px; color:#95a5a6; font-size:0.75rem; margin-bottom:4px;">
                <span>${icon}</span><span>${label}</span>
            </div>
            <div style="font-weight:bold; font-size:1rem; color:${accent};">${value}</div>
        </div>
    `;

    summary.innerHTML = `
        <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:15px;">
            <div style="background:rgba(241,196,15,0.15); border:1px solid rgba(241,196,15,0.4); color:#f1c40f; padding:6px 10px; border-radius:999px; font-size:0.8rem; font-weight:bold;">
                ${t('record_badge_score', { val: score.toLocaleString() })}
            </div>
            <div style="background:rgba(52,152,219,0.15); border:1px solid rgba(52,152,219,0.4); color:#7fbdf0; padding:6px 10px; border-radius:999px; font-size:0.8rem; font-weight:bold;">
                ${t('record_badge_gems', { val: gems.toLocaleString() })}
            </div>
            <div style="background:rgba(46,204,113,0.15); border:1px solid rgba(46,204,113,0.4); color:#2ecc71; padding:6px 10px; border-radius:999px; font-size:0.8rem; font-weight:bold;">
                ${t('record_badge_playtime', { val: formatDuration(totalPlaySeconds) })}
            </div>
        </div>

        <div class="record-accordion" style="width: 100%; border-radius: 15px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); overflow: hidden;">
            <button class="accordion-header" onclick="toggleAccordion('detail-stats', this)" style="width: 100%; padding: 15px 20px; background: rgba(0,0,0,0.2); color: #f1c40f; border: none; text-align: left; font-size: 1.1rem; font-family: 'Jua', sans-serif; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                <span>${t('record_detail_title')}</span>
                <span class="toggle-icon" style="font-size: 0.9rem; transition: transform 0.3s ease;">▼</span>
            </button>

            <div id="detail-stats" class="accordion-content" style="max-height: 0; overflow: hidden; transition: max-height 0.4s ease-out, padding 0.4s ease; background: rgba(255,255,255,0.02);">
                <div style="display:grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap:10px; padding: 15px 20px;">
                    ${tile("⏱️", t('record_tile_playtime'), formatDuration(totalPlaySeconds), "#f1c40f")}
                    ${tile("📆", t('record_tile_avg7d'), formatDuration(avgDailySeconds), "#7fbdf0")}
                    ${tile("📖", t('record_tile_normal'), t('record_count', { n: counts.normal.toLocaleString() }), "#ecf0f1")}
                    ${tile("🐲", t('record_tile_bossmid'), t('record_count', { n: counts.bossMid.toLocaleString() }), "#ecf0f1")}
                    ${tile("💎", t('record_tile_gems'), t('record_count', { n: gems.toLocaleString() }), "#7fbdf0")}
                    ${tile("🏅", t('record_tile_score'), `${score.toLocaleString()} pts`, "#f1c40f")}
                    ${tile("💜", t('record_tile_memory'), t('record_memory_lv', { n: totalMemoryLevel }), "#b487ff")}
                </div>
            </div>
        </div>
        `;
}

// 🌟 아코디언을 열고 닫는 스위치 함수 (game.js 맨 아래나 적당한 곳에 추가해 주세요)
function toggleAccordion(contentId, btnElement) {
    const content = document.getElementById(contentId);

    // 내용물이 열려있으면 닫고, 닫혀있으면 엽니다
    if (content.style.maxHeight && content.style.maxHeight !== '0px') {
        content.style.maxHeight = '0px';
        content.style.paddingTop = '0px';
        content.style.paddingBottom = '0px';
        btnElement.querySelector('.toggle-icon').style.transform = 'rotate(0deg)';
    } else {
        content.style.maxHeight = '800px'; // 타일들이 다 보일 만큼 넉넉한 높이
        content.style.paddingTop = '0px';
        content.style.paddingBottom = '0px';
        btnElement.querySelector('.toggle-icon').style.transform = 'rotate(180deg)';
    }
}
// 서비스 워커 등록 (앱 설치 조건을 만족시키기 위함)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('서비스 워커 등록 완료!'))
            .catch(err => console.log('서비스 워커 등록 실패:', err));
    });
}

// 매일 알림 시간 체크 시작
startNotificationCheck();

// FCM 토큰 미리 취득 + 갱신 리스너 시작
if (Notification.permission === 'granted') {
    // SW가 준비된 후 실행 (getToken이 SW active 상태를 요구함)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(() => {
            initFCM().catch(() => {});
            startFCMTokenRefreshListener();
            startFCMForegroundListener();
        });
    } else {
        initFCM().catch(() => {});
    }
}

// 🛡️ 다중 기기 동시 접속 차단기 (스마트 감시 버전)
function startSessionGuard() {
    if (typeof db === 'undefined' || !myPlayerId) return;

    console.log("🛡️ 스마트 보안 요원 배치 완료: 실시간 감시를 시작합니다.");

    // 기존에 켜진 카메라가 있다면 끄고 새로 시작 (중복 감시 방지)
    if (window.sessionGuardUnsubscribe) {
        window.sessionGuardUnsubscribe();
    }

    // 파이어베이스 실시간 감시 (onSnapshot)
    // 감시 시작 직후 3초간은 초기 연결/전파 스냅샷을 무시 (모바일에서 여러 스냅샷이 연속 발생하는 경우 대비)
    const _guardStartTime = Date.now();
    window.sessionGuardUnsubscribe = db.collection("leaderboard").doc(myTag).onSnapshot((doc) => {
        if (doc.metadata && doc.metadata.fromCache) return;

        // 감시 시작 후 3초 이내 스냅샷은 자체 쓰기/초기 전파 결과일 수 있으므로 무시
        if (Date.now() - _guardStartTime < 3000) return;

        if (doc.exists) {
            const serverData = doc.data();

            // 🚨 [핵심 보안] 내 메모리의 출입증과 서버의 출입증이 다르면?
            // 누군가 다른 기기에서 '여정 시작'을 눌러서 서버 출입증을 갱신했다는 뜻!
            if (serverData.sessionToken && window.currentSessionToken && serverData.sessionToken !== window.currentSessionToken) {

                console.log("🚨 다른 기기 로그인 감지! 현재 기기를 초기화합니다.");

                // 초기화 전 현재 데이터를 pendingRecovery에 백업 (나중에 태그 입력으로 복구 가능)
                try {
                    if (typeof db !== 'undefined' && db && typeof myTag !== 'undefined' && myTag && myTag !== '0000') {
                        const localRaw = localStorage.getItem('kingsRoadSave');
                        if (localRaw) {
                            const backupData = JSON.parse(localRaw);
                            backupData.pendingRecovery = true;
                            backupData.recoveryCreatedAt = new Date().toISOString();
                            db.collection('pendingRecovery').doc(myTag).set(backupData).catch(() => {});
                        }
                    }
                } catch(e) {}

                window.isResetting = true;
                localStorage.clear();

                if (typeof firebase !== 'undefined' && firebase.auth) {
                    firebase.auth().signOut().catch(e => console.log(e));
                }

                myPlayerId = "";
                window.currentSessionToken = "";
                alert(t('alert_multi_device'));
                window.location.replace(window.location.href.split('?')[0]);
            }
        }
    });
}

let toastTimeout;

// 📢 토스트 알림 띄우기 함수
function showReadAloudToast(message = "🗣️ 소리 내어 읽으면 기억에 2배 더 오래 남아요!") {
    const toast = document.getElementById('read-aloud-toast');
    if (!toast) return;

    toast.innerHTML = message;
    toast.classList.add('show');

    // 기존에 작동 중인 타이머가 있다면 캔슬 (연속해서 뜰 때 깜빡임 방지)
    if (toastTimeout) clearTimeout(toastTimeout);

    // 3초 뒤에 스르륵 사라짐
    toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 1500);
}
// 🌟 [핵심 수술] 유저가 앱을 껐다가 다시 화면으로 돌아올 때마다 날짜 검사!
document.addEventListener("visibilitychange", () => {
    // 화면이 다시 보일 때 (백그라운드에서 깨어났을 때)
    if (document.visibilityState === 'visible') {
        console.log("☀️ 화면이 깨어났습니다. 날짜 변경선을 확인합니다.");

        // 날짜/주차가 바뀌었는지 확인하고, 바뀌었다면 알아서 0점으로 리셋해줍니다.
        if (typeof checkDailyLogin === 'function') {
            checkDailyLogin();
        }
    }
});
// ⏰ 자정 지킴이 (1분마다 몰래 날짜가 바뀌었는지 확인합니다)
setInterval(() => {
    // 🌟 전투 중(게임 플레이 중)에는 방해하지 않고, 맵 화면에 있을 때만 검사!
    if (!window.isGamePlaying) {
        const today = new Date().toDateString();
        const lastDate = localStorage.getItem('lastPlayedDate');

        // 저장된 날짜와 지금 실제 날짜가 다르다? = 자정이 지났다!
        if (lastDate && lastDate !== today) {
            console.log("🕛 자정이 지났습니다! 날짜 변경선 및 주간 리셋을 적용합니다.");

            // 우리가 완벽하게 고쳐둔 출석체크/리셋 함수 실행
            if (typeof checkDailyLogin === 'function') {
                checkDailyLogin();
            }

            // (선택) UI도 바로 갱신해서 유저가 화면에서 바뀐 걸 볼 수 있게 해줍니다.
            if (typeof updateProfileUI === 'function') updateProfileUI();
            if (typeof updateMyScorePanel === 'function') updateMyScorePanel();
        }
    }
}, 60000); // 60000ms = 1분마다 한 번씩 실행

/* [추가] 누적 명예의 전당 랭킹 로드 */
function loadTotalHallRanking() {
    const list = document.getElementById('ranking-list');
    if (!list) return;

    list.innerHTML = `<div style="text-align:center; padding:50px; color:#bdc3c7;">${t('ranking_loading_total_hall')}</div>`;

    if (typeof db === 'undefined' || !db) return;

    // 서버의 'all_time/hall/total' 스냅샷 문서를 읽어옵니다.
    db.collection('ranking_snapshots').doc('all_time')
        .collection('hall').doc('total')
        .get()
        .then(doc => {
            if (!doc.exists) {
                list.innerHTML = `<div style="text-align:center; padding:50px; color:#bdc3c7;">${t('ranking_empty_total')}</div>`;
                return;
            }

            const data = doc.data();
            const ranks = data.ranks || [];

            // 기존 렌더링 UI 변환 로직과 완벽하게 호환됩니다.
            const transformed = ranks.map((row, index) => {
                return {
                    rank: index + 1,
                    name: row.name || t('ranking_no_name'),
                    score: row.score || 0, // 서버에서 예쁘게 변환해준 totalScore 입니다!
                    tribe: row.tribe !== undefined ? row.tribe : 0,
                    dept: row.dept !== undefined ? row.dept : 0,
                    tag: row.tag || "",
                    castle: row.castle || 0,
                    isMe: ((row.name === myNickname || row.nickname === myNickname) && row.tag === myTag)
                };
            });

            // 기존에 만들어두신 리스트 렌더링 함수 호출
            if (typeof renderRankingList === 'function') {
                renderRankingList(transformed);
            }
        })
        .catch(err => {
            console.error("❌ 누적 랭킹 로드 실패:", err);
            list.innerHTML = `<div style="text-align:center; padding:50px; color:#e74c3c;">${t('ranking_load_fail')}</div>`;
        });
}
/* [추가] 연간 대항전 금은동 순위 불러오기 */
function loadYearlyTribeRanking() {
    const listEl = document.getElementById('yearly-top3-list');
    if (!listEl) return;

    if (typeof db === 'undefined' || !db) return;

    db.collection('ranking_snapshots').doc('yearly')
        .collection('tribes').doc('current')
        .get()
        .then(doc => {
            if (!doc.exists) {
                listEl.innerHTML = `<div style="text-align:center; padding:10px; color:#95a5a6; font-size:0.85rem;">${t('ranking_empty_year_snapshot')}</div>`;
                return;
            }

            const data = doc.data();
            const ranks = data.ranks || [];

            // 1, 2, 3등 필터링 (0점 제외)
            const top3 = ranks.filter(r => r.rank <= 3 && r.score > 0);

            if (top3.length === 0) {
                listEl.innerHTML = `<div style="text-align:center; padding:10px; color:#95a5a6; font-size:0.85rem;">${t('ranking_empty_year_tribe')}</div>`;
                return;
            }

            let html = '';
            const medals = { 1: t('ranking_medal_gold'), 2: t('ranking_medal_silver'), 3: t('ranking_medal_bronze') };
            const colors = { 1: '#f1c40f', 2: '#bdc3c7', 3: '#cd7f32' };

            top3.forEach(item => {
                const tribeName = TRIBE_DATA[item.tribeId] ? getTribeName(TRIBE_DATA[item.tribeId]) : t('ranking_unknown_tribe');
                const medalText = medals[item.rank] || t('ranking_rank_n', { n: item.rank });
                const color = colors[item.rank] || '#ecf0f1';

                html += `
                <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.4); padding:8px 12px; border-radius:8px; border-left:4px solid ${color}; margin-bottom: 5px;">
                    <span style="font-weight:bold; color:${color}; font-size:1rem; text-shadow:1px 1px 2px rgba(0,0,0,0.8);">${medalText} : ${tribeName}</span>
                    <span style="font-size:0.9rem; color:#ecf0f1; font-family:monospace; font-weight:bold;">${item.score.toLocaleString()} pts</span>
                </div>
              `;
            });

            html += `
            <button onclick="openRankingModal('yearly-hall', t('ranking_yearly_battle_full'))"
                style="margin-top:10px; padding:8px; width:100%; border-radius:8px; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); color:#bdc3c7; font-size:0.85rem; cursor:pointer; font-weight:bold; transition:all 0.2s;">
                ${t('ranking_all_btn')}
            </button>
          `;

            listEl.innerHTML = html;
        })
        .catch(err => {
            console.error("❌ 연간 대항전 로드 실패:", err);
            listEl.innerHTML = `<div style="text-align:center; color:#e74c3c; font-size:0.85rem;">${t('ranking_load_fail')}</div>`;
        });
}
/* [추가] PC 환경에서 마우스 드래그로 가로 스크롤 가능하게 하는 기능 */
function enableDragToScroll(elementId) {
    const slider = document.getElementById(elementId);
    if (!slider) return;

    let isDown = false;
    let startX;
    let scrollLeft;

    slider.addEventListener('mousedown', (e) => {
        isDown = true;
        slider.style.cursor = 'grabbing';
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
    });
    slider.addEventListener('mouseleave', () => {
        isDown = false;
        slider.style.cursor = 'grab';
    });
    slider.addEventListener('mouseup', () => {
        isDown = false;
        slider.style.cursor = 'grab';
    });
    slider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 1.5; // 스크롤 속도 조절
        slider.scrollLeft = scrollLeft - walk;
    });
}
/* [추가] 12지파 대항전 전체 순위(1~12위) 팝업 리스트 불러오기 */
function loadYearlyHallOfFame() {
    const listEl = document.getElementById('ranking-list');
    if (!listEl) return;

    db.collection('ranking_snapshots').doc('yearly')
        .collection('tribes').doc('current')
        .get()
        .then(doc => {
            if (!doc.exists) {
                listEl.innerHTML = `<div style="text-align:center; padding:50px; color:#bdc3c7;">${t('ranking_empty_battle')}</div>`;
                return;
            }

            const data = doc.data();
            const ranks = data.ranks || [];

            if (ranks.length === 0) {
                listEl.innerHTML = `<div style="text-align:center; padding:50px; color:#bdc3c7;">${t('ranking_empty_year_tribe')}</div>`;
                return;
            }

            let html = '';
            ranks.forEach(item => {
                const tribeName = TRIBE_DATA[item.tribeId] ? getTribeName(TRIBE_DATA[item.tribeId]) : t('ranking_unknown_tribe');

                // 1,2,3등은 메달 아이콘, 4등부터는 회색 숫자
                let medalIcon = '';
                if (item.rank === 1) medalIcon = '🥇';
                else if (item.rank === 2) medalIcon = '🥈';
                else if (item.rank === 3) medalIcon = '🥉';
                else medalIcon = `<span style="display:inline-block; width:24px; text-align:center; color:#7f8c8d; font-size:0.9rem; font-weight:bold;">${item.rank}</span>`;

                // 상위권일수록 배경과 테두리를 화려하게!
                const bgColor = item.rank <= 3 ? 'rgba(241, 196, 15, 0.1)' : 'rgba(255,255,255,0.03)';
                const borderColor = item.rank === 1 ? '#f1c40f' : item.rank === 2 ? '#bdc3c7' : item.rank === 3 ? '#cd7f32' : 'transparent';
                const nameColor = item.rank <= 3 ? '#fff' : '#bdc3c7';

                html += `
                <div style="display:flex; justify-content:space-between; align-items:center; background:${bgColor}; padding:12px 15px; margin-bottom:8px; border-radius:10px; border-left:4px solid ${borderColor};">
                    <div style="display:flex; align-items:center; gap:12px;">
                        <span style="font-size:1.2rem;">${medalIcon}</span>
                        <span style="color:${nameColor}; font-weight:bold; font-size:1rem;">${tribeName}</span>
                    </div>
                    <span style="color:#f1c40f; font-family:monospace; font-weight:bold; font-size:1.05rem;">${item.score.toLocaleString()} pts</span>
                </div>
              `;
            });
            listEl.innerHTML = html;
        })
        .catch(err => {
            console.error("❌ 연간 대항전 전체보기 로드 실패:", err);
            listEl.innerHTML = `<div style="text-align:center; padding:50px; color:#e74c3c;">${t('ranking_load_fail')}</div>`;
        });
}
/* [추가] 순례자 등록(프로필 수정) 취소 함수 */
function cancelProfileRegistration() {
    // 1. 유저에게 친절하게 저장되지 않았음을 알립니다.
    alert(t('alert_unsaved_changes'));

    // 2. 이름표가 'nickname-modal'인 팝업창을 찾습니다.
    const modalEl = document.getElementById('nickname-modal');

    // 3. 팝업창이 존재한다면 부드럽게 화면에서 지워줍니다.
    if (modalEl) {
        // 부드럽게 사라지는 효과를 위해 active 클래스를 먼저 뺍니다.
        modalEl.classList.remove('active');

        // 0.2초(200ms) 뒤에 애니메이션이 끝나면 HTML에서 완전히 삭제합니다.
        setTimeout(() => {
            modalEl.remove();
        }, 200);
    }
}
/* 1. 두루마리 칸(Grid) 자동 생성기 */
function startStageWithTransition(chapterNum, verseNum, startStageCallback) {
    const overlay = document.getElementById('bible-transition-overlay');
    const introHeader = document.getElementById('stage-intro-header');

    const cNum = parseInt(chapterNum, 10);
    const vNum = parseInt(verseNum, 10);

    if (!bibleData[cNum]) return startStageCallback();

    const chapterData = bibleData[cNum];

    // 상단 헤더: 장 제목 + 절 번호 세팅
    if (introHeader) {
        introHeader.innerHTML = `
            <div class="intro-chapter">${t('label_chapter_header', { num: cNum })}</div>
            <div class="intro-subtitle">${getChapterTitleHtml(cNum)}</div>
            <div class="intro-verse-num">${cNum}:${vNum}</div>
        `;
    }

    const targetText = (getVerseData(cNum, vNum - 1) || chapterData[vNum - 1]).text;

    const audioUrl = `assets/audio/${cNum}-${vNum}.mp3`;

    // [성능] 스테이지 클릭 시 미리 로드한 오디오가 있으면 재사용, 없으면 새로 로드
    let preloadedAudio;
    if (window._preloadedStageAudio) {
        preloadedAudio = window._preloadedStageAudio;
        window._preloadedStageAudio = null;
    } else {
        preloadedAudio = new Audio(audioUrl);
        preloadedAudio.preload = 'auto';
        preloadedAudio.load();
    }

    gsap.set(overlay, { opacity: 1, pointerEvents: "auto" });

    let isAudioReady = false;

    preloadedAudio.addEventListener('canplaythrough', () => {
        if (!isAudioReady) {
            isAudioReady = true;
            playScrollTransition(targetText, preloadedAudio, startStageCallback);
        }
    }, { once: true });

    setTimeout(() => {
        if (!isAudioReady) {
            console.warn("오디오 사전 로딩 지연, 애니메이션을 강제로 시작합니다.");
            isAudioReady = true;
            playScrollTransition(targetText, preloadedAudio, startStageCallback);
        }
    }, 1500);
}

/* [시네마틱 + 즉시 스킵 + 음소거 유지] */
function playScrollTransition(targetText, verseAudio, onCompleteCallback) {
    const overlay = document.getElementById('bible-transition-overlay');
    const introHeader = document.getElementById('stage-intro-header');

    let textOverlay = document.getElementById('verse-text-overlay');
    if (!textOverlay) {
        textOverlay = document.createElement('div');
        textOverlay.id = 'verse-text-overlay';
        overlay.appendChild(textOverlay);
    }
    textOverlay.innerText = targetText;
    gsap.set(textOverlay, { opacity: 0, y: 20, scale: 0.9, xPercent: -50, yPercent: -50 });
    if (introHeader) gsap.set(introHeader, { opacity: 0, y: -10 });

    const skipBtn = document.getElementById('skip-transition-btn');
    const muteBtn = document.getElementById('mute-toggle-btn');
    const pauseBtn = document.getElementById('pause-toggle-btn');
    const repeatBtn = document.getElementById('repeat-toggle-btn');
    const tl = gsap.timeline();

    let fallbackTimer;
    let isSkipped = false;
    const readTime = Math.max(3.5, targetText.length * 0.15);

    let audioObj = verseAudio;
    if (typeof verseAudio === 'string') {
        audioObj = new Audio(verseAudio);
    }

    audioObj.muted = isGlobalMuted;
    connectVoiceToAudioContext(audioObj);

    if (muteBtn) {
        muteBtn.style.display = "flex";
        muteBtn.innerText = isGlobalMuted ? "🔇" : "🔊";

        muteBtn.onclick = () => {
            isGlobalMuted = !isGlobalMuted;
            localStorage.setItem('isMuted', isGlobalMuted);
            audioObj.muted = isGlobalMuted;
            muteBtn.innerText = isGlobalMuted ? "🔇" : "🔊";
        };
    }

    let isLooping = isVoiceRepeat;
    audioObj.loop = isLooping;

    if (repeatBtn) {
        repeatBtn.style.display = "flex";
        updateVoiceRepeatButtonState(repeatBtn);

        repeatBtn.onclick = () => {
            isLooping = !isLooping;
            isVoiceRepeat = isLooping;
            localStorage.setItem('isVoiceRepeat', String(isVoiceRepeat));
            audioObj.loop = isLooping;
            updateVoiceRepeatButtonState(repeatBtn);
        };
    }

    if (pauseBtn) {
        pauseBtn.innerText = "⏸";
        pauseBtn.style.display = "none";

        pauseBtn.onclick = () => {
            if (audioObj.paused) {
                audioObj.play();
                pauseBtn.innerText = "⏸";
            } else {
                audioObj.pause();
                pauseBtn.innerText = "▶";
            }
        };
    }

    if (skipBtn) {
        skipBtn.style.display = "block";
        skipBtn.textContent = t('skip_transition');
        skipBtn.onclick = () => {
            if (isSkipped) return;
            isSkipped = true;

            audioObj.pause();
            audioObj.currentTime = 0;
            clearTimeout(fallbackTimer);
            skipBtn.style.display = "none";
            if (muteBtn) muteBtn.style.display = "none";
            if (pauseBtn) pauseBtn.style.display = "none";
            if (repeatBtn) {
                repeatBtn.style.display = "none";
                updateVoiceRepeatButtonState(repeatBtn);
            }
            tl.play("outro");
        };
    }

    tl
        .to(introHeader, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" })
        .to(textOverlay, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "power2.out" }, "+=0.2")

        .call(() => {
            if (isSkipped) return;
            tl.pause();

            audioObj.onended = () => {
                if (isSkipped) return;
                clearTimeout(fallbackTimer);
                if (pauseBtn) pauseBtn.style.display = "none";
                tl.resume();
            };

            const playPromise = audioObj.play();

            if (playPromise !== undefined) {
                playPromise.catch((error) => {
                    console.warn("오디오 재생 불가:", error);
                    if (pauseBtn) pauseBtn.style.display = "none";
                    fallbackTimer = setTimeout(() => {
                        if (isSkipped) return;
                        tl.resume();
                    }, readTime * 1000);
                });
            }

            if (pauseBtn) {
                pauseBtn.innerText = "⏸";
                pauseBtn.style.display = "flex";
            }
        })

        .addLabel("outro", "+=0.01")

        .call(() => {
            if (skipBtn) skipBtn.style.display = "none";
            if (muteBtn) muteBtn.style.display = "none";
            if (pauseBtn) pauseBtn.style.display = "none";
            if (repeatBtn) {
                repeatBtn.style.display = "none";
                updateVoiceRepeatButtonState(repeatBtn);
            }
        })

        .to(introHeader, { opacity: 0, duration: 0.6, ease: "power2.inOut" })
        .to(textOverlay, { opacity: 0, duration: 0.6, ease: "power2.inOut" }, "<")

        .call(() => {
            if (onCompleteCallback) onCompleteCallback();

            const gameScreen = document.getElementById('game-screen');
            if (gameScreen) {
                gsap.fromTo(gameScreen,
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: 1.0, ease: "power2.out", delay: 0.3 }
                );
            }
        })

        .to(overlay, { opacity: 0, duration: 0.6, ease: "power2.inOut" })

        .call(() => {
            if (introHeader) gsap.set(introHeader, { opacity: 0, y: -10 });
            gsap.set(overlay, { pointerEvents: "none" });
        });
}

/* 🌟 보스전/중간점검 전용 애니메이션 */
function startBossTransition(chapterNum, startVerse, endVerse, isMidBoss, onCompleteCallback) {
    const muteBtn = document.getElementById('mute-toggle-btn');
    const pauseBtn = document.getElementById('pause-toggle-btn');
    const repeatBtn = document.getElementById('repeat-toggle-btn');
    const skipBtn = document.getElementById('skip-transition-btn');

    if (muteBtn) muteBtn.style.display = 'none';
    if (pauseBtn) pauseBtn.style.display = 'none';
    if (skipBtn) skipBtn.style.display = 'none';
    if (repeatBtn) {
        repeatBtn.style.display = 'none';
        repeatBtn.style.opacity = '0.4';
        repeatBtn.style.border = '1px solid #7f8c8d';
    }

    const overlay = document.getElementById('bible-transition-overlay');

    let textOverlay = document.getElementById('verse-text-overlay');
    if (!textOverlay) {
        textOverlay = document.createElement('div');
        textOverlay.id = 'verse-text-overlay';
        overlay.appendChild(textOverlay);
    }

    if (isMidBoss) {
        textOverlay.innerHTML = `<span style="color:red; font-size:1.5em;">⚔️ ${t('label_mid_boss')}</span><br/>${t('label_verse_range', { start: startVerse, end: endVerse })}`;
    } else {
        textOverlay.innerHTML = `<span style="color:darkred; font-size:1.5em;">${t('label_boss_appear')}</span><br/>${t('label_chapter_header', { num: chapterNum })}<br>${getChapterTitleHtml(chapterNum)}`;
    }
    gsap.set(textOverlay, { opacity: 0, y: 20, scale: 0.9, xPercent: -50, yPercent: -50 });

    gsap.set(overlay, { opacity: 1, pointerEvents: "auto" });

    const tl = gsap.timeline();

    tl
        .to(textOverlay, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "power2.out" })
        .to(textOverlay, { duration: 1.5 })
        .to(textOverlay, { opacity: 0, duration: 0.8, ease: "power2.inOut" })

        .call(() => {
            if (onCompleteCallback) onCompleteCallback();

            const gameScreen = document.getElementById('game-screen');
            if (gameScreen) {
                gsap.fromTo(gameScreen, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1.0, ease: "power2.out", delay: 0.3 });
            }
        })
        .to(overlay, { opacity: 0, duration: 0.8, ease: "power2.inOut" })
        .call(() => {
            gsap.set(overlay, { pointerEvents: "none" });
        });
}

// 🌟 1. 장별 제목 데이터베이스 (개발자님이 주신 데이터!)
const CHAPTER_TITLES = {
    1: ["계 1:1~8 계시록 전장의 요약과 결론", "계 1:9~20 계시록 사건의 시작과<br>일곱 별과 일곱 금 촛대의 비밀"], // 1장만 배열(두 개)입니다!
    2: "계 2장 일곱 교회 사자에게 보낸 편지",
    3: "계 3장 일곱 교회 사자에게 보낸 편지",
    4: "계 4장 영계 하나님의 보좌와 계열",
    5: "계 5장 일곱 인으로 봉한 책",
    6: "계 6장 배도한 선천 해⋅달⋅별에 대한 심판",
    7: "계 7장 새 창조된 영적 새 이스라엘 열두 지파",
    8: "계 8장 마지막 인과 일곱 나팔",
    9: "계 9장 무저갱의 황충과 범죄한 천사",
    10: "계 10장 하늘에서 온 계시 책과 약속의 목자",
    11: "계 11장 두 증인과 일곱째 나팔",
    12: "계 12장 용과 하나님과의 전쟁",
    13: "계 13장 짐승에게 표 받고 배도한 선민",
    14: "계 14장 처음 익은 열매 시온산 십사만 사천",
    15: "계 15장 만국이 와서 경배할 증거장막 성전",
    16: "계 16장 진노의 일곱 대접",
    17: "계 17장 마귀의 양식 음행의 포도주",
    18: "계 18장 만국을 무너뜨린 사단과의 결혼",
    19: "계 19장 영육 어린양의 혼인 잔치",
    20: "계 20장 순교의 영과 산 자의 첫째 부활",
    21: "계 21장 약속한 새 하늘 새 땅 신천지",
    22: "계 22장 생명나무가 있는 거룩한 성"
};

const CHAPTER_TITLES_EN = {
    1: ["Rev 1:1~8 The summary and conclusion of the entire book of Revelation", "Rev 1:9~20 The beginning of the events of Revelation and the mystery of the 7 stars and the 7 golden lamp stands"],
    2: "Rev 2 The letters sent to the messengers of the seven churches",
    3: "Rev 3 The letters sent to the messengers of the seven churches",
    4: "Rev 4 God's throne and structure in the spiritual world",
    5: "Rev 5 The book sealed with seven seals",
    6: "Rev 6 The Judgment regarding the sun, moon, and stars of the former heaven that betrayed",
    7: "Rev 7 The newly created twelve tribes of New spiritual Israel",
    8: "Rev 8 The last seal and the seven trumpets",
    9: "Rev 9 The locusts from the abyss and the angels who sinned",
    10: "Rev 10 The revealed book from heaven and the promised pastor",
    11: "Rev 11 The two witnesses and the 7th trumpet",
    12: "Rev 12 The war between God and the dragon",
    13: "Rev 13 The chosen people who received the mark of the beast and betrayed",
    14: "Rev 14 The 144000 first fruits of Mt. Zion",
    15: "Rev 15 The temple of the tabernacle of the testimony — the place all nations come to worship",
    16: "Rev 16 The seven bowls of wrath",
    17: "Rev 17 The devil's food — the wine of adulteries",
    18: "Rev 18 The marriage with Satan who destroyed all nations",
    19: "Rev 19 The spirits and flesh of the wedding banquet of the lamb",
    20: "Rev 20 The first resurrection of the spirits of the martyrs and the living",
    21: "Rev 21 Shincheonji — The promised new heaven and new earth",
    22: "Rev 22 The Holy city where the tree of life is"
};

// 🌟 2. 팝업창 제어 변수 및 함수
let currentChapter1Index = 0; // 1장일 때 앞부분(0)인지 뒷부분(1)인지 기억하는 변수

function openChapterTitle(chapterNum) {
    const modal = document.getElementById('chapter-title-modal');
    const chapterHeader = document.getElementById('title-modal-chapter');
    const textContent = document.getElementById('title-modal-text');
    const prevBtn = document.getElementById('title-prev-btn');
    const nextBtn = document.getElementById('title-next-btn');

    chapterHeader.innerText = t('label_chapter_header', { num: chapterNum });

    // 버튼 초기화 (일단 숨김)
    prevBtn.style.display = 'none';
    nextBtn.style.display = 'none';
    prevBtn.onclick = null;
    nextBtn.onclick = null;

    if (chapterNum === 1) {
        // 🌟 1장이면 화살표 버튼을 켜고, 토글(번갈아 보기) 기능을 연결합니다.
        currentChapter1Index = 0; // 항상 1~8절부터 시작
        const titles1 = (currentLang === 'en') ? CHAPTER_TITLES_EN : CHAPTER_TITLES;
        textContent.innerText = titles1[1][currentChapter1Index];

        prevBtn.style.display = 'block';
        nextBtn.style.display = 'block';

        const toggleFunc = () => {
            currentChapter1Index = currentChapter1Index === 0 ? 1 : 0; // 0과 1을 왔다갔다!
            const titlesT = (currentLang === 'en') ? CHAPTER_TITLES_EN : CHAPTER_TITLES;
            textContent.innerText = titlesT[1][currentChapter1Index];
            // 버튼 누를 때 쫀득한 효과 주기
            gsap.fromTo(textContent, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.2 });
        };

        prevBtn.onclick = toggleFunc;
        nextBtn.onclick = toggleFunc;
    } else {
        // 🌟 2장~22장이면 그냥 해당 텍스트만 띄웁니다.
        const titlesN = (currentLang === 'en') ? CHAPTER_TITLES_EN : CHAPTER_TITLES;
        textContent.innerText = titlesN[chapterNum] || t('status_preparing');
    }

    // 모달창 짠! 하고 나타나기
    modal.style.display = 'flex';
    gsap.fromTo(modal.firstElementChild, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.3, ease: "back.out(1.5)" });
}

function closeChapterTitle() {
    const modal = document.getElementById('chapter-title-modal');
    gsap.to(modal.firstElementChild, {
        opacity: 0, y: 30, duration: 0.2, onComplete: () => {
            modal.style.display = 'none';
        }
    });
}

// 🌟 홈 캐러셀 모드 전환 변수
let currentGameModeIndex = 0; // 0: 여정 시작, 1: 집중 훈련, 2: 고난 길

// 🌟 좌우 화살표를 누르면 실행되는 함수
function toggleGameMode(direction) {
    const modes = [
        { text: t('btn_journey'), action: startGame, bg: "" },
        { text: t('btn_training'), action: startTrainingMode, bg: "linear-gradient(to bottom, #2c3e50, #34495e)" },
        { text: t('btn_hardship'), action: openHardshipModeSelect, bg: "linear-gradient(135deg, #5c4634 0%, #2f3b4a 100%)" }
    ];
    
    // 인덱스 변경 (좌우 루프)
    currentGameModeIndex += direction;
    if (currentGameModeIndex < 0) currentGameModeIndex = modes.length - 1;
    if (currentGameModeIndex >= modes.length) currentGameModeIndex = 0;
    
    const currentMode = modes[currentGameModeIndex];
    const btn = document.getElementById('start-journey-btn');
    
    // 버튼 텍스트와 클릭 시 실행될 함수 변경!
    btn.innerHTML = currentMode.text;
    btn.onclick = currentMode.action;
    if (currentMode.bg) {
        btn.style.background = currentMode.bg;
        btn.style.borderBottom = "5px solid #2c3e50";
    } else {
        btn.style.background = ""; // 기본값 복구
        btn.style.borderBottom = "";
    }
    
    // 스르륵 바뀌는 쫀득한 애니메이션 효과
    if (typeof gsap !== 'undefined') {
        gsap.fromTo(btn, { scale: 0.9, opacity: 0.8 }, { scale: 1, opacity: 1, duration: 0.2, ease: "back.out(2)" });
    }
}

// 🌟 훈련 모드 전용 변수
let selectedTrainingStep = 1; // 기본은 Step 1
let selectedTrainingRepeatCount = 1;
let currentTrainingCycle = 1;
let trainingRepeatCount = 1;
const TRAINING_SETTINGS_KEY = 'kingsroad_training_settings';

function getDefaultTrainingSettings() {
    return {
        startChapter: 1,
        startVerse: 1,
        endChapter: 1,
        endVerse: 1,
        step: 1,
        repeatCount: 1,
        randomOrder: false
    };
}

function loadTrainingSettings() {
    try {
        const raw = localStorage.getItem(TRAINING_SETTINGS_KEY);
        if (!raw) return getDefaultTrainingSettings();
        const parsed = JSON.parse(raw);
        // 구버전 저장값 마이그레이션 (chapter → startChapter/endChapter)
        if (parsed.chapter && !parsed.startChapter) {
            parsed.startChapter = parsed.chapter;
            parsed.endChapter = parsed.chapter;
        }
        return {
            ...getDefaultTrainingSettings(),
            ...parsed
        };
    } catch (error) {
        return getDefaultTrainingSettings();
    }
}

function saveTrainingSettings(settings) {
    try {
        localStorage.setItem(TRAINING_SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
        console.warn('집중 훈련 설정 저장 실패:', error);
    }
}

function updateTrainingCycleIndicator() {
    const cycleEl = document.getElementById('training-cycle-indicator');
    if (!cycleEl) return;

    if (!window.isTrainingMode) {
        cycleEl.innerText = t('label_cycle_display', { cur: 1, total: 1 });
        return;
    }

    const currentCycle = window.currentTrainingCycle || currentTrainingCycle || 1;
    const totalCycles = window.trainingRepeatCount || trainingRepeatCount || 1;
    cycleEl.innerText = t('label_cycle_display', { cur: currentCycle, total: totalCycles });
}

function applyTrainingStepSelection() {
    const stepBtns = document.querySelectorAll('.train-step-btn');
    stepBtns.forEach(btn => {
        const step = parseInt(btn.getAttribute('data-step'), 10);
        const isActive = step === selectedTrainingStep;
        btn.style.background = isActive ? '#3498db' : '#7f8c8d';
        btn.classList.toggle('active', isActive);
    });
}

function syncTrainingVerseState() {
    const nextVerseData = window.currentBattleData[window.currentVerseIdx];
    window.trainingVerseData = nextVerseData;
    if (typeof trainingVerseData !== 'undefined') trainingVerseData = nextVerseData;
    window.currentVerseData = nextVerseData;

    window.currentStep2PartIndex = undefined;
    window.step2Parts = undefined;
    window.currentStep5PartIndex = undefined;
    window.step5Parts = undefined;

    const chNum = nextVerseData && nextVerseData.__chapterNum ? nextVerseData.__chapterNum : window.currentBattleChapter;
    const realVerseNum = nextVerseData && nextVerseData.__verseNum
        ? nextVerseData.__verseNum
        : window.trainStartVerse + window.currentVerseIdx;
    window.currentStageId = `${chNum}-${realVerseNum}`;
}

// 1. 훈련 모드 모달 열기 (임시 함수였던 것을 교체!)
function startTrainingMode() {
    const modal = document.getElementById('training-modal');
    modal.style.display = 'flex';
    
    // 모달 애니메이션
    gsap.fromTo(modal.firstElementChild, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.5)" });

    // 장(Chapter) 목록 세팅하기
    initTrainingChapters();
    applyTrainingStepSelection();

    const repeatSelect = document.getElementById('train-repeat-count');
    if (repeatSelect) {
        repeatSelect.value = String(selectedTrainingRepeatCount);
    }

    const randomCheckbox = document.getElementById('train-random-checkbox');
    if (randomCheckbox) {
        randomCheckbox.checked = !!loadTrainingSettings().randomOrder;
    }

    updateTrainingCycleIndicator();
    
    // 스텝 버튼 클릭 이벤트 연결
    const stepBtns = document.querySelectorAll('.train-step-btn');
    stepBtns.forEach(btn => {
        btn.onclick = (e) => {
            selectedTrainingStep = parseInt(e.target.getAttribute('data-step'), 10);
            applyTrainingStepSelection();
        };
    });
}

function closeTrainingModal() {
    const modal = document.getElementById('training-modal');
    gsap.to(modal.firstElementChild, { scale: 0.8, opacity: 0, duration: 0.2, onComplete: () => {
        modal.style.display = 'none';
    }});
}

// 2. 성경 데이터(bibleData)를 바탕으로 장(Chapter) 목록 채우기
function initTrainingChapters() {
    const startChapterSelect = document.getElementById('train-start-chapter');
    const endChapterSelect = document.getElementById('train-end-chapter');
    const savedSettings = loadTrainingSettings();

    startChapterSelect.innerHTML = '';
    endChapterSelect.innerHTML = '';

    for (let i = 1; i <= 22; i++) {
        if (typeof bibleData !== 'undefined' && bibleData[i] && bibleData[i].length > 0) {
            const opt1 = document.createElement('option');
            opt1.value = i;
            opt1.innerText = t('label_chapter', { num: i });
            startChapterSelect.appendChild(opt1);

            const opt2 = document.createElement('option');
            opt2.value = i;
            opt2.innerText = t('label_chapter', { num: i });
            endChapterSelect.appendChild(opt2);
        }
    }

    const savedStart = savedSettings.startChapter || 1;
    const savedEnd = savedSettings.endChapter || savedStart;
    if (bibleData[savedStart]) startChapterSelect.value = String(savedStart);
    if (bibleData[savedEnd]) endChapterSelect.value = String(savedEnd);

    selectedTrainingStep = savedSettings.step || 1;
    selectedTrainingRepeatCount = Math.max(1, parseInt(savedSettings.repeatCount, 10) || 1);

    // 저장된 설정을 기준으로 절(Verse) 목록 업데이트
    updateTrainingStartVerses(savedSettings.startVerse);
    updateTrainingEndVerses(savedSettings.endVerse);
}

// 3a. 시작 장이 바뀔 때 시작 절 목록 업데이트
function updateTrainingStartVerses(preferredVerse) {
    const chapter = parseInt(document.getElementById('train-start-chapter').value, 10);
    const select = document.getElementById('train-start-verse');
    const current = parseInt(preferredVerse || select.value || 1, 10);

    select.innerHTML = '';
    const maxVerses = bibleData[chapter] ? bibleData[chapter].length : 1;
    const safe = Math.min(Math.max(current, 1), maxVerses);

    for (let i = 1; i <= maxVerses; i++) {
        const opt = document.createElement('option');
        opt.value = i;
        opt.innerText = t('label_verse', { num: i });
        if (i === safe) opt.selected = true;
        select.appendChild(opt);
    }

    // 끝 장이 시작 장보다 작아지면 끝 장을 시작 장에 맞춤
    const endChapterSelect = document.getElementById('train-end-chapter');
    if (parseInt(endChapterSelect.value, 10) < chapter) {
        endChapterSelect.value = String(chapter);
        updateTrainingEndVerses();
    }
}

// 3b. 끝 장이 바뀔 때 끝 절 목록 업데이트
function updateTrainingEndVerses(preferredVerse) {
    const startChapter = parseInt(document.getElementById('train-start-chapter').value, 10);
    const endChapterSelect = document.getElementById('train-end-chapter');
    let endChapter = parseInt(endChapterSelect.value, 10);

    // 끝 장이 시작 장보다 작으면 자동 보정
    if (endChapter < startChapter) {
        endChapter = startChapter;
        endChapterSelect.value = String(startChapter);
    }

    const select = document.getElementById('train-end-verse');
    const current = parseInt(preferredVerse || select.value || 1, 10);

    select.innerHTML = '';
    const maxVerses = bibleData[endChapter] ? bibleData[endChapter].length : 1;
    const safe = Math.min(Math.max(current, 1), maxVerses);

    for (let i = 1; i <= maxVerses; i++) {
        const opt = document.createElement('option');
        opt.value = i;
        opt.innerText = t('label_verse', { num: i });
        if (i === safe) opt.selected = true;
        select.appendChild(opt);
    }
}

// 하위 호환용 래퍼 (구형 onchange 참조가 남아 있을 경우 대비)
function updateTrainingVerses(preferredStartVerse, preferredEndVerse) {
    updateTrainingStartVerses(preferredStartVerse);
    updateTrainingEndVerses(preferredEndVerse);
}

// 🌟 [추가] 훈련 모드를 판별하는 핵심 스위치!
window.isTrainingMode = false;
window.trainingTargetStep = 1;

// 🌟 [교체] 모달창에서 [훈련 시작!] 버튼을 눌렀을 때 실행되는 진짜 함수 (엔진 완벽 동기화판)
function executeTraining() {
    const startChapter = parseInt(document.getElementById('train-start-chapter').value);
    const startVerse   = parseInt(document.getElementById('train-start-verse').value);
    const endChapter   = parseInt(document.getElementById('train-end-chapter').value);
    const endVerse     = parseInt(document.getElementById('train-end-verse').value);
    const repeatSelect = document.getElementById('train-repeat-count');
    const repeatCount = repeatSelect ? parseInt(repeatSelect.value, 10) : 1;
    const randomCheckbox = document.getElementById('train-random-checkbox');
    const isRandomOrder = !!(randomCheckbox && randomCheckbox.checked);

    if (startChapter > endChapter || (startChapter === endChapter && startVerse > endVerse)) {
        alert(t('alert_training_start_gt_end'));
        return;
    }

    if (!repeatCount || repeatCount < 1) {
        alert(t('alert_training_repeat_min'));
        return;
    }

    const chapterNum = startChapter; // 하위 호환용

    selectedTrainingRepeatCount = repeatCount;
    saveTrainingSettings({
        startChapter: startChapter,
        startVerse: startVerse,
        endChapter: endChapter,
        endVerse: endVerse,
        step: selectedTrainingStep,
        repeatCount: repeatCount,
        randomOrder: isRandomOrder
    });

    closeTrainingModal();

    // 1. 훈련 모드 스위치 ON
    window.isGamePlaying = true;
    window.isTrainingMode = true;
    window.trainingTargetStep = selectedTrainingStep;
    window.trainingMode = 'training'; // 기타 시스템 에러 방지용 꼬리표
    trainingRepeatCount = repeatCount;
    currentTrainingCycle = 1;
    window.trainingRepeatCount = repeatCount;
    window.currentTrainingCycle = currentTrainingCycle;
    updateTrainingCycleIndicator();

    // 2. 훈련 범위 데이터 장전 (다중 장 지원)
    {
        const verses = [];
        for (let ch = startChapter; ch <= endChapter; ch++) {
            const from = ch === startChapter ? startVerse - 1 : 0;
            const to   = ch === endChapter   ? endVerse       : bibleData[ch].length;
            bibleData[ch].slice(from, to).forEach((verseData, idx) => {
                verses.push({ ...verseData, __chapterNum: ch, __verseNum: from + 1 + idx });
            });
        }
        window.currentBattleData = verses;
    }
    if (isRandomOrder) {
        window.currentBattleData = shuffleHardshipQueue(window.currentBattleData);
    }
    window.currentBattleChapter = chapterNum; // 하위 호환 (startChapter)
    window.currentVerseIdx = 0;
    window.trainStartVerse = startVerse; // 🌟 [추가] 시작 절 번호를 시스템에 기억시킵니다!
    
    // 🌟 3. [핵심 수술 1] 현재 훈련 구절 상태를 엔진에 주입합니다!
    syncTrainingVerseState();

    // 🌟 4. [핵심 수술 2] 스텝을 1개로 고정하고, 화면의 숫자(1/6 등)도 1/1로 강제 업데이트!
    stepSequence = [window.trainingTargetStep]; 
    sequenceIndex = 0;
    currentStep = stepSequence[0];
    
    const totalStepEl = document.getElementById('total-step-num');
    if (totalStepEl) totalStepEl.innerText = stepSequence.length; // 이제 1/1 로 뜹니다!

    // 파트 분할 데이터 초기화 (에러 방지용)
    window.currentStep2PartIndex = undefined;
    window.step2Parts = undefined;
    window.currentStep5PartIndex = undefined;
    window.step5Parts = undefined;

    // 5. 체력 및 찌꺼기 초기화
    playerHearts = (typeof maxPlayerHearts !== 'undefined') ? maxPlayerHearts : 5; 
    earnedGems = 0;
    earnedScore = 0;
    wrongCount = 0;
    stageStartTime = Date.now();
    maxBossHp = undefined; 
    currentBossHp = undefined;

    // 6. 화면 테마 전환 (밝은 배경)
    const homeScreen = document.querySelector('.home-screen') || document.getElementById('home-screen');
    const mapScreen = document.getElementById('map-screen');
    const gameScreen = document.getElementById('game-screen');

    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
    if (homeScreen) homeScreen.style.display = '';
    if (mapScreen) mapScreen.classList.remove('active');
    if (gameScreen) {
        gameScreen.classList.add('active', 'mode-training', 'is-training-mode');
    }

    const bossAvatar = document.querySelector('.boss-avatar');
    if (bossAvatar) bossAvatar.style.display = 'none';

    // 🌟 7. UI 세팅 및 내용물 채워넣기 (일반 시작 로직 완벽 복제)
    if (typeof recalculateMaxHearts === 'function') recalculateMaxHearts();
    if (typeof updateBattleUI === 'function') updateBattleUI();
    if (typeof loadStep === 'function') loadStep(); // 알맹이와 버튼을 그리는 마법의 함수!

    if (typeof showReadAloudToast === 'function') {
        showReadAloudToast(t('toast_training_repeat', { step: window.trainingTargetStep }));
    }
}

/* =========================================
   [시스템: 고난 길 모드]
   ========================================= */

window.isHardshipMode = false;

const HARDSHIP_MODES = {
    endurance: { icon: '🕊️', titleKey: 'hardship_endurance_title', summaryKey: 'hardship_endurance_summary' },
    address:   { icon: '🎯', titleKey: 'hardship_address_title',   summaryKey: 'hardship_address_summary' },
    memory:    { icon: '⌨️', titleKey: 'hardship_memory_title',    summaryKey: 'hardship_memory_summary' }
};

function createEmptyHardshipState() {
    return {
        active: false,
        mode: null,
        queue: [],
        cursor: 0,
        currentVerse: null,
        studiedCount: 0,
        answeredCount: 0,
        score: 0,
        feedback: null,
        locked: false,
        pendingTimeoutId: null,
        revealIndex: 0,
        selectedChapter: 1,
        selectedVerse: 1,
        memorySlots: [],
        revealedHints: [],
        memoryTypedText: '',
        awaitingNext: false,
        speechScores: [],
        lastTranscript: '',
        currentVerseScore: null,
        currentVerseTranscript: '',
        showInfo: false,
        ultimateMemoryMode: false
    };
}

let hardshipState = createEmptyHardshipState();
let selectedHardshipConfigMode = 'endurance';
let selectedHardshipOrderType = 'random'; // 'random' | 'sequential'

const HARDSHIP_VERSES = [];
for (let hardshipChapter = 1; hardshipChapter <= 22; hardshipChapter++) {
    const chapterVerses = bibleData[hardshipChapter] || [];
    const chapterVersesEn = (typeof bibleDataEn !== 'undefined' && bibleDataEn[hardshipChapter]) || [];
    for (let hardshipVerseIndex = 0; hardshipVerseIndex < chapterVerses.length; hardshipVerseIndex++) {
        const verseData = chapterVerses[hardshipVerseIndex];
        const verseDataEn = chapterVersesEn[hardshipVerseIndex];
        HARDSHIP_VERSES.push({
            id: `${hardshipChapter}-${hardshipVerseIndex + 1}`,
            chapter: hardshipChapter,
            verse: hardshipVerseIndex + 1,
            text: verseData.text,
            textEn: verseDataEn ? verseDataEn.text : '',
            verseText: verseData.text,
            chunks: Array.isArray(verseData.chunks) ? verseData.chunks : String(verseData.text || '').split(' '),
            chunksEn: verseDataEn && Array.isArray(verseDataEn.chunks) ? verseDataEn.chunks : (verseDataEn ? String(verseDataEn.text || '').split(' ') : []),
            label: `계 ${hardshipChapter}:${hardshipVerseIndex + 1}`
        });
    }
}

const HARDSHIP_CHURCH_HINTS = {
    '2-29': '두아디라',
    '3-6': '사데',
    '3-13': '빌라델비아',
    '3-22': '라오디게아'
};
for (const verse of HARDSHIP_VERSES) {
    const hint = HARDSHIP_CHURCH_HINTS[verse.id];
    verse.displayText = hint ? `${verse.text} (${hint})` : verse.text;
}

const HARDSHIP_VERSE_MAP = HARDSHIP_VERSES.reduce((accumulator, verse) => {
    accumulator[verse.id] = verse;
    return accumulator;
}, {});

function shuffleHardshipQueue(items) {
    const shuffled = items.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
        const swapIndex = Math.floor(Math.random() * (i + 1));
        const temp = shuffled[i];
        shuffled[i] = shuffled[swapIndex];
        shuffled[swapIndex] = temp;
    }
    return shuffled;
}

function isHardshipFillableChar(character) {
    return /[0-9A-Za-z가-힣]/.test(character);
}

function getHardshipActiveText(verse) {
    if (!verse) return '';
    return (currentLang === 'en' && verse.textEn) ? verse.textEn : verse.text;
}

function hardshipCharsMatch(inputChar, answerChar) {
    if (currentLang === 'en') return inputChar.toLowerCase() === answerChar.toLowerCase();
    return inputChar === answerChar;
}

function getHardshipModeMeta(mode) {
    const m = HARDSHIP_MODES[mode] || HARDSHIP_MODES.endurance;
    return { icon: m.icon, title: t(m.titleKey), summary: t(m.summaryKey) };
}

function isHardshipTypingTargetChar(character) {
    return isHardshipFillableChar(character) || character === ' ';
}

function clearHardshipPendingTimeout() {
    if (hardshipState.pendingTimeoutId) {
        clearTimeout(hardshipState.pendingTimeoutId);
        hardshipState.pendingTimeoutId = null;
    }
}

function proceedHardshipToNextVerse() {
    if (!window.isHardshipMode || !hardshipState.active || !hardshipState.awaitingNext) return;

    hardshipState.awaitingNext = false;
    hardshipState.wrongSlots = [];
    hardshipState.ultimateMemoryMode = false;

    if (playerHearts <= 0 && hardshipState.mode !== 'endurance') {
        finishHardshipSession('hearts');
        return;
    }

    loadNextHardshipVerse();
}

function getHardshipRemainingCount() {
    return Math.max(hardshipState.queue.length - hardshipState.cursor, 0);
}

function buildHardshipFeedbackHtml() {
    if (!hardshipState.feedback) return '';
    return `<div class="hardship-feedback ${hardshipState.feedback.type}">${hardshipState.feedback.message}</div>`;
}

function resetHardshipSessionState() {
    clearHardshipPendingTimeout();
    hardshipState = createEmptyHardshipState();
    window.currentHardshipMode = null;
    window.hardshipOrigin = null;
    const gameScreen = document.getElementById('game-screen');

    const stepIndicator = document.querySelector('.training-header .step-indicator');
    if (stepIndicator) stepIndicator.style.display = '';

    const cycleIndicator = document.getElementById('training-cycle-indicator');
    if (cycleIndicator) {
        cycleIndicator.innerText = t('label_cycle_display', { cur: 1, total: 1 });
        cycleIndicator.style.display = '';
    }

    const commonHeader = document.getElementById('common-hardship-header');
    if (commonHeader) {
        commonHeader.style.display = 'none';
    }

    const hardshipScoreChip = document.getElementById('common-hardship-score');
    if (hardshipScoreChip) {
        hardshipScoreChip.style.display = 'none';
        hardshipScoreChip.textContent = t('label_score_zero');
    }

    const hardshipHintBtn = document.getElementById('common-hardship-hint-btn');
    if (hardshipHintBtn) {
        hardshipHintBtn.style.display = 'none';
        hardshipHintBtn.disabled = false;
    }

    const hardshipHeartWrap = document.getElementById('common-hardship-heart-wrap');
    if (hardshipHeartWrap) {
        hardshipHeartWrap.style.display = 'inline-flex';
        hardshipHeartWrap.classList.remove('is-danger');
    }

    const hardshipHeartCount = document.getElementById('common-hardship-heart-count');
    if (hardshipHeartCount) hardshipHeartCount.textContent = '5';

    const hardshipHeartMax = document.getElementById('common-hardship-heart-max');
    if (hardshipHeartMax) hardshipHeartMax.textContent = '/5';

    const hardshipBreadCount = document.getElementById('common-hardship-life-bread-count');
    if (hardshipBreadCount) hardshipBreadCount.textContent = String((inventory && inventory.lifeBread) || 0);

    const trainingHeartWrap = document.getElementById('training-heart-wrap');
    if (trainingHeartWrap) {
        trainingHeartWrap.style.display = 'flex';
        trainingHeartWrap.style.alignItems = 'center';
        trainingHeartWrap.style.justifyContent = '';
        trainingHeartWrap.style.animation = 'none';
        trainingHeartWrap.innerHTML = '❤️ <span id="training-hearts" style="font-weight:bold; margin-left:5px;">5</span>';
    }

    const field = document.querySelector('.battle-field');
    const control = document.querySelector('.battle-control');
    if (field && window.isHardshipMode) {
        field.innerHTML = '<div class="verse-indicator" id="verse-index">준비 중...</div><div class="answer-zone" id="answer-zone"><span class="placeholder-text" id="placeholder-text">...</span></div>';
    }
    if (control && window.isHardshipMode) {
        control.innerHTML = '<div class="block-pool" id="block-pool"></div>';
    }
}

function openChapterHardship(chapterNum) {
    // 장별 고난 길: 해당 챕터를 강제 고정하고 모드 선택 모달을 엽니다.
    window.hardshipForcedChapter = chapterNum;
    openHardshipModeSelect();
    window.hardshipOrigin = 'map'; // 맵에서 진입했으므로 'home'을 덮어씀
}

function openHardshipModeSelect() {
    window.hardshipOrigin = 'home'; // 기본: 홈 진입
    const modal = document.getElementById('hardship-mode-modal');
    if (modal) modal.style.display = 'flex';
}

function closeHardshipModeSelect() {
    const modal = document.getElementById('hardship-mode-modal');
    if (modal) modal.style.display = 'none';
}

function isHardshipChapterDoneToday(mode, ch) {
    const historyMap = {
        endurance: hardshipEnduranceClearHistory,
        address: hardshipAddressClearHistory,
        memory: hardshipMemoryClearHistory
    };
    const history = (historyMap[mode] || {})[ch];
    if (!history || !history.length) return false;
    const last = history[history.length - 1];
    if (!last || !last.date) return false;
    const d = new Date(last.date);
    const lastStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    return lastStr === getMemoryQuizDate();
}

function refreshHardshipCooldownBadges() {
    const mode = selectedHardshipConfigMode;
    const startSelect = document.getElementById('hardship-start-chapter');
    const endSelect = document.getElementById('hardship-end-chapter');
    if (!startSelect || !endSelect) return;

    [startSelect, endSelect].forEach(sel => {
        Array.from(sel.options).forEach(opt => {
            const ch = parseInt(opt.value, 10);
            const base = t('hardship_chapter_option', { num: ch });
            opt.innerText = isHardshipChapterDoneToday(mode, ch) ? `${base} ✅` : base;
        });
    });
}

function populateHardshipConfigChapterOptions() {
    const startSelect = document.getElementById('hardship-start-chapter');
    const endSelect = document.getElementById('hardship-end-chapter');
    if (!startSelect || !endSelect) return;

    // 옵션이 이미 채워져 있고 언어와 쿨다운 배지도 일치하면 스킵 — refreshHardshipCooldownBadges에서 처리
    const expectedFirst = isHardshipChapterDoneToday(selectedHardshipConfigMode, 1)
        ? `${t('hardship_chapter_option', { num: 1 })} ✅`
        : t('hardship_chapter_option', { num: 1 });
    if (startSelect.options.length === 22 && startSelect.options[0].innerText === expectedFirst) return;

    startSelect.innerHTML = '';
    endSelect.innerHTML = '';

    for (let chapter = 1; chapter <= 22; chapter += 1) {
        const startOption = document.createElement('option');
        startOption.value = String(chapter);
        startOption.innerText = t('hardship_chapter_option', { num: chapter });
        startSelect.appendChild(startOption);

        const endOption = document.createElement('option');
        endOption.value = String(chapter);
        endOption.innerText = t('hardship_chapter_option', { num: chapter });
        endSelect.appendChild(endOption);
    }

    startSelect.value = '1';
    endSelect.value = '22';
    refreshHardshipCooldownBadges();
}

function getHardshipSelectedRangeType() {
    const checked = document.querySelector('input[name="hardship-range-type"]:checked');
    return checked ? checked.value : 'all';
}

function getHardshipVerseIdsByChapterRange(startChapter, endChapter) {
    return HARDSHIP_VERSES
        .filter(verse => verse.chapter >= startChapter && verse.chapter <= endChapter)
        .map(verse => verse.id);
}

function syncHardshipConfigChapterRange() {
    const startSelect = document.getElementById('hardship-start-chapter');
    const endSelect = document.getElementById('hardship-end-chapter');
    if (!startSelect || !endSelect) return;

    let startChapter = parseInt(startSelect.value, 10) || 1;
    let endChapter = parseInt(endSelect.value, 10) || 22;

    if (startChapter > endChapter) {
        if (document.activeElement === startSelect) {
            endChapter = startChapter;
            endSelect.value = String(endChapter);
        } else {
            startChapter = endChapter;
            startSelect.value = String(startChapter);
        }
    }

    updateHardshipConfigRangeUI();
}

function updateHardshipConfigRangeUI() {
    const rangeType = getHardshipSelectedRangeType();
    const startSelect = document.getElementById('hardship-start-chapter');
    const endSelect = document.getElementById('hardship-end-chapter');
    const summary = document.getElementById('hardship-config-summary');

    if (!startSelect || !endSelect || !summary) return;

    const isRangeSelected = rangeType === 'range';
    startSelect.disabled = !isRangeSelected;
    endSelect.disabled = !isRangeSelected;

    const startChapter = parseInt(startSelect.value, 10) || 1;
    const endChapter = parseInt(endSelect.value, 10) || 22;
    const verseIds = isRangeSelected
        ? getHardshipVerseIdsByChapterRange(startChapter, endChapter)
        : getHardshipVerseIdsByChapterRange(1, 22);

    let summaryText = isRangeSelected
        ? t('hardship_config_summary_range', { start: startChapter, end: endChapter, count: verseIds.length })
        : t('hardship_config_summary_all', { count: verseIds.length });

    // 단일 장 선택 시 오늘 쿨다운 안내
    if (isRangeSelected && startChapter === endChapter && isHardshipChapterDoneToday(selectedHardshipConfigMode, startChapter)) {
        summaryText += '\n✅ ' + t('hardship_cooldown_today');
    }
    summary.innerText = summaryText;
    refreshHardshipCooldownBadges();
}

function openHardshipConfigModal(mode) {
    selectedHardshipConfigMode = mode;
    populateHardshipConfigChapterOptions();
    const modeLabel = document.getElementById('hardship-config-mode-label');
    if (modeLabel) {
        modeLabel.innerText = getHardshipModeMeta(mode).title;
    }

    const allRadio = document.querySelector('input[name="hardship-range-type"][value="all"]');
    if (allRadio) allRadio.checked = true;

    const startSelect = document.getElementById('hardship-start-chapter');
    const endSelect = document.getElementById('hardship-end-chapter');
    if (startSelect) startSelect.value = '1';
    if (endSelect) endSelect.value = '22';

    updateHardshipConfigRangeUI();

    const modal = document.getElementById('hardship-config-modal');
    if (modal) modal.style.display = 'flex';
}

function closeHardshipConfigModal() {
    const modal = document.getElementById('hardship-config-modal');
    if (modal) modal.style.display = 'none';
}

function openHardshipOrderModal(mode) {
    selectedHardshipConfigMode = mode;
    const modal = document.getElementById('hardship-order-modal');
    if (modal) modal.style.display = 'flex';
}

function closeHardshipOrderModal() {
    window.hardshipPendingForcedChapter = null; // 맵 진입 취소 시 stale 상태 방지
    const modal = document.getElementById('hardship-order-modal');
    if (modal) modal.style.display = 'none';
}

function selectHardshipOrder(orderType) {
    selectedHardshipOrderType = orderType;
    const pendingChapter = window.hardshipPendingForcedChapter; // closeHardshipOrderModal이 초기화하기 전에 저장
    closeHardshipOrderModal();

    if (pendingChapter != null) {
        // 맵 경로: forced chapter 소비 후 바로 세션 시작
        const verseIds = getHardshipVerseIdsByChapterRange(pendingChapter, pendingChapter);
        if (verseIds.length === 0) {
            alert(t('alert_training_no_data', { ch: pendingChapter }));
            return;
        }
        startHardshipSession(selectedHardshipConfigMode, verseIds, pendingChapter);
    } else {
        // 홈 경로: config 모달로 이동
        openHardshipConfigModal(selectedHardshipConfigMode);
    }
}

function startHardshipFromModal(mode) {
    closeHardshipModeSelect();

    if (mode === 'memory') {
        // 순서 선택 모달 삽입 (forced chapter 있으면 보존)
        if (window.hardshipForcedChapter != null) {
            window.hardshipPendingForcedChapter = window.hardshipForcedChapter;
            window.hardshipForcedChapter = null;
        }
        openHardshipOrderModal(mode);
        return;
    }

    // 나머지 모드는 기존 로직 그대로
    // 장별 고난 길 숏컷으로 진입한 경우: 범위 설정 창 없이 바로 시작
    if (window.hardshipForcedChapter != null) {
        const ch = window.hardshipForcedChapter;
        const verseIds = getHardshipVerseIdsByChapterRange(ch, ch);
        window.hardshipForcedChapter = null;
        if (verseIds.length === 0) {
            alert(t('alert_training_no_data', { ch }));
            return;
        }
        startHardshipSession(mode, verseIds, ch);
    } else {
        openHardshipConfigModal(mode);
    }
}

function startHardshipFromConfig() {
    const rangeType = getHardshipSelectedRangeType();
    const startSelect = document.getElementById('hardship-start-chapter');
    const endSelect = document.getElementById('hardship-end-chapter');
    const startChapter = rangeType === 'range' ? parseInt(startSelect.value, 10) || 1 : 1;
    const endChapter = rangeType === 'range' ? parseInt(endSelect.value, 10) || 22 : 22;

    if (startChapter > endChapter) {
        alert(t('alert_training_start_ch_gt_end'));
        return;
    }

    const selectedVerseIds = getHardshipVerseIdsByChapterRange(startChapter, endChapter);
    if (selectedVerseIds.length === 0) {
        alert(t('alert_training_no_verses'));
        return;
    }

    closeHardshipConfigModal();
    startHardshipSession(selectedHardshipConfigMode, selectedVerseIds);
}

function startHardshipSession(mode, selectedVerseIds, forcedChapter) {
    const modeMeta = getHardshipModeMeta(mode);

    clearHardshipPendingTimeout();
    hardshipState = createEmptyHardshipState();
    hardshipState.active = true;
    hardshipState.mode = mode;
    hardshipState.applyToFree = (window.hardshipOrigin !== 'map');
    hardshipState.rewardBlocked = false; // 세션 중 쿨다운 확정 후 세팅
    if (forcedChapter != null) hardshipState.forcedChapter = forcedChapter;
    const baseIds = Array.isArray(selectedVerseIds) && selectedVerseIds.length > 0
        ? selectedVerseIds
        : HARDSHIP_VERSES.map(verse => verse.id);
    hardshipState.queue = (mode === 'memory' && selectedHardshipOrderType === 'sequential')
        ? baseIds.slice()
        : shuffleHardshipQueue(baseIds);

    if (typeof recalculateMaxHearts === 'function') {
        recalculateMaxHearts();
    }

    window.isGamePlaying = true;
    window.isTrainingMode = false;
    window.isHardshipMode = true;
    window.currentHardshipMode = mode;
    window.trainingMode = 'hardship';

    playerHearts = (typeof maxPlayerHearts !== 'undefined') ? maxPlayerHearts : 5;
    wrongCount = 0;
    stageStartTime = Date.now();
    currentBossHp = undefined;
    maxBossHp = undefined;

    const gameScreen = document.getElementById('game-screen');
    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
    if (gameScreen) {
        gameScreen.classList.add('active', 'mode-training', 'mode-hardship');
        gameScreen.classList.toggle('mode-hardship-memory', mode === 'memory');
    }

    const bossAvatar = document.querySelector('.boss-avatar');
    if (bossAvatar) bossAvatar.style.display = 'none';

    updateBattleUI();
    loadNextHardshipVerse();

    if (typeof showReadAloudToast === 'function') {
        showReadAloudToast(t('toast_hardship_start', { icon: modeMeta.icon, title: modeMeta.title }));
    }
}

function updateHardshipHeader() {
    const commonHeader = document.getElementById('common-hardship-header');
    const titleEl = document.getElementById('common-hardship-title');
    const progressEl = document.getElementById('common-hardship-progress');
    const scoreEl = document.getElementById('common-hardship-score');
    const heartWrap = document.getElementById('common-hardship-heart-wrap');
    const heartCountEl = document.getElementById('common-hardship-heart-count');
    const heartMaxEl = document.getElementById('common-hardship-heart-max');
    const lifeBreadCountEl = document.getElementById('common-hardship-life-bread-count');
    const hintBtn = document.getElementById('common-hardship-hint-btn');

    if (!window.isHardshipMode || !hardshipState.active) {
        if (commonHeader) commonHeader.style.display = 'none';
        return;
    }

    const currentMode = window.currentHardshipMode || hardshipState.mode;
    const modeMeta = getHardshipModeMeta(currentMode);
    const lifeBreadCnt = (typeof inventory !== 'undefined' && inventory.lifeBread) ? inventory.lifeBread : 0;
    const isDanger = playerHearts <= 2;
    const totalCount = hardshipState.queue.length || HARDSHIP_VERSES.length;
    const progressCount = currentMode === 'endurance'
        ? hardshipState.studiedCount
        : hardshipState.answeredCount;

    if (commonHeader) commonHeader.style.display = 'flex';
    if (titleEl) titleEl.textContent = modeMeta.title;
    if (progressEl) progressEl.textContent = t('label_progress_verses', { cur: progressCount, total: totalCount });

    if (scoreEl) {
        if (currentMode === 'endurance') {
            scoreEl.style.display = 'none';
        } else {
            scoreEl.style.display = 'inline-flex';
            scoreEl.textContent = t('label_score_display', { score: hardshipState.score });
        }
    }

    if (heartWrap) {
        heartWrap.style.display = 'inline-flex';
        heartWrap.classList.toggle('is-danger', isDanger);
    }
    if (heartCountEl) heartCountEl.textContent = String(playerHearts);
    if (heartMaxEl) heartMaxEl.textContent = `/${maxPlayerHearts}`;
    if (lifeBreadCountEl) lifeBreadCountEl.textContent = String(lifeBreadCnt);

    if (hintBtn) {
        const shouldShowHint = currentMode === 'memory';
        hintBtn.style.display = shouldShowHint ? 'inline-flex' : 'none';
        hintBtn.disabled = !shouldShowHint;
    }

    updateHintButtonLabels();
}

function loadNextHardshipVerse() {
    clearHardshipPendingTimeout();

    if (!window.isHardshipMode || !hardshipState.active) return;

    if (hardshipState.cursor >= hardshipState.queue.length) {
        finishHardshipSession('completed');
        return;
    }

    const nextVerseId = hardshipState.queue[hardshipState.cursor];
    hardshipState.cursor += 1;
    hardshipState.currentVerse = HARDSHIP_VERSE_MAP[nextVerseId] || null;
    hardshipState.feedback = null;
    hardshipState.locked = false;
    hardshipState.awaitingNext = false;
    hardshipState.revealIndex = 0;
    hardshipState.selectedChapter = hardshipState.forcedChapter || 1;
    hardshipState.selectedVerse = 1;
    hardshipState.addressPhase = null;
    hardshipState.revealedHints = [];
    hardshipState.memoryTypedText = '';

    if (hardshipState.currentVerse) {
        hardshipState.memorySlots = getHardshipActiveText(hardshipState.currentVerse).split('').map(character => {
            return isHardshipFillableChar(character) ? '' : character;
        });
        currentVerseData = hardshipState.currentVerse;
        trainingVerseData = hardshipState.currentVerse;
        window.currentStageId = hardshipState.currentVerse.id;
    }

    renderCurrentHardshipVerse();
    updateBattleUI();
}

function renderCurrentHardshipVerse() {
    if (!window.isHardshipMode || !hardshipState.currentVerse) return;

    if (hardshipState.mode === 'endurance') {
        renderHardshipEnduranceVerse();
        return;
    }

    if (hardshipState.mode === 'address') {
        renderHardshipAddressVerse();
        return;
    }

    renderHardshipMemoryVerse();
}

function toggleStep1Info() {
    const panel = document.getElementById('step1-info-panel');
    const btn = document.getElementById('btn-step1-info');
    if (!panel || !btn) return;
    const isOpen = panel.style.display !== 'none';
    panel.style.display = isOpen ? 'none' : 'block';
    btn.textContent = isOpen ? t('step1_info_title') : '▲ ' + t('step1_info_title');
}

function toggleHardshipEnduranceInfo() {
    hardshipState.showInfo = !hardshipState.showInfo;
    renderHardshipEnduranceVerse();
}

function renderHardshipEnduranceVerse() {
    const hintBtn = document.getElementById('common-hardship-hint-btn');
    if (hintBtn) hintBtn.style.display = 'none';
    const field = document.querySelector('.battle-field');
    const control = document.querySelector('.battle-control');
    if (!field || !control || !hardshipState.currentVerse) return;

    const verse = hardshipState.currentVerse;
    const verseLabel = t('label_revelation_ref', { ch: verse.chapter, v: verse.verse });
    const verseText = getHardshipActiveText(verse);

    const infoHtml = hardshipState.showInfo
        ? `<div class="hardship-endurance-info-panel">${t('hardship_endurance_info_body')}</div>`
        : '';
    const infoToggleHtml = `
        <button class="hardship-endurance-info-btn" onclick="toggleHardshipEnduranceInfo()">
            ${hardshipState.showInfo ? '▲ ' : 'ℹ️ '}${t('hardship_endurance_info_title')}
        </button>
        ${infoHtml}
    `;

    let verseBodyHtml;
    if (hardshipState.locked) {
        const score = hardshipState.currentVerseScore ?? 0;
        const highlightHtml = buildEnduranceHighlightHtml(hardshipState.lastTranscript || '', verseText);
        const transcriptHtml = hardshipState.lastTranscript
            ? `<div class="hardship-endurance-transcript">${t('hardship_endurance_heard')}: <span>"${hardshipState.lastTranscript}"</span></div>`
            : '';
        verseBodyHtml = `
            <div class="hardship-endurance-highlight">${highlightHtml}</div>
            <div class="hardship-speech-score">${score}%</div>
            ${transcriptHtml}
        `;
    } else if (hardshipState.listening) {
        verseBodyHtml = `<div class="hardship-endurance-listening-placeholder">🎤 ${t('hardship_endurance_listening')}</div>`;
    } else {
        verseBodyHtml = `<div class="hardship-endurance-verse-hidden">${t('hardship_endurance_speak_prompt')}</div>`;
    }

    field.innerHTML = `
        <div class="verse-indicator">${t('hardship_endurance_indicator', { label: verseLabel })}</div>
        <div class="hardship-verse-card">
            <div class="hardship-mode-tag">${getHardshipModeMeta('endurance').icon} ${getHardshipModeMeta('endurance').summary}</div>
            ${infoToggleHtml}
            ${verseBodyHtml}
            ${buildHardshipFeedbackHtml()}
        </div>
    `;

    const isListening = !!hardshipState.listening;
    control.innerHTML = hardshipState.locked
        ? `<div class="hardship-control-row">
            <button class="btn-attack" onclick="retryHardshipEnduranceSpeech()" style="background:#6c757d;">
                ${t('hardship_endurance_retry')}
            </button>
            <button class="btn-attack" onclick="confirmHardshipEnduranceVerse()" style="background:#2ecc71;">
                ${t('hardship_endurance_confirm')}
            </button>
           </div>`
        : `<div class="hardship-control-row">
            <button class="btn-attack hardship-mic-btn ${isListening ? 'listening' : ''}"
                onclick="startHardshipEnduranceSpeech()"
                ${isListening ? 'disabled' : ''}>
                ${isListening ? t('hardship_endurance_listening') : t('hardship_endurance_speak_btn')}
            </button>
           </div>`;
}

// ── 인내의 고난 음성인식 유틸 ──────────────────────────────

function normalizeForSpeech(s) {
    return (s || '').replace(/[^가-힣a-zA-Z0-9]/g, '').toLowerCase();
}

function calcEnduranceSpeechScore(transcript, verseText) {
    const a = normalizeForSpeech(transcript);
    const b = normalizeForSpeech(verseText);
    if (!b.length) return 100;
    if (!a.length) return 0;
    // LCS 길이 계산
    const m = a.length, n = b.length;
    const dp = new Uint16Array((m + 1) * (n + 1));
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            dp[i * (n + 1) + j] = a[i - 1] === b[j - 1]
                ? dp[(i - 1) * (n + 1) + (j - 1)] + 1
                : Math.max(dp[(i - 1) * (n + 1) + j], dp[i * (n + 1) + (j - 1)]);
        }
    }
    const lcs = dp[m * (n + 1) + n];
    return Math.min(100, Math.round(lcs / b.length * 100));
}

function buildEnduranceHighlightHtml(transcript, verseText) {
    const normTranscript = normalizeForSpeech(transcript);
    const words = verseText.split(/(\s+)/);
    return words.map(token => {
        if (/^\s+$/.test(token)) return token;
        const normWord = normalizeForSpeech(token);
        if (!normWord) return `<span>${token}</span>`;
        const matched = normWord.length > 0 && normTranscript.includes(normWord);
        return matched
            ? `<span class="speech-word-match">${token}</span>`
            : `<span class="speech-word-miss">${token}</span>`;
    }).join('');
}

// ── 인내의 고난 음성 입력 ──────────────────────────────

function startHardshipEnduranceSpeech() {
    if (!window.isHardshipMode || hardshipState.mode !== 'endurance' || hardshipState.locked) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        hardshipState.locked = true;
        hardshipState.lastTranscript = '';
        hardshipState.speechScores.push(0);
        hardshipState.studiedCount += 1;
        hardshipState.feedback = { type: 'wrong', message: t('hardship_endurance_no_support') };
        renderHardshipEnduranceVerse();
        updateBattleUI();
        return;
    }

    // 듣는 중 상태 표시
    hardshipState.listening = true;
    renderHardshipEnduranceVerse();

    const recognition = new SpeechRecognition();
    recognition.lang = currentLang === 'en' ? 'en-US' : 'ko-KR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        submitHardshipEnduranceSpeech(transcript);
    };
    recognition.onerror = () => submitHardshipEnduranceSpeech('');
    recognition.onnomatch = () => submitHardshipEnduranceSpeech('');
    recognition.onend = () => {
        if (hardshipState.listening) submitHardshipEnduranceSpeech('');
    };

    recognition.start();
    hardshipState._recognition = recognition;
}

function submitHardshipEnduranceSpeech(transcript) {
    if (!hardshipState.listening) return;
    hardshipState.listening = false;
    hardshipState._recognition = null;

    const verseText = getHardshipActiveText(hardshipState.currentVerse);
    const score = calcEnduranceSpeechScore(transcript, verseText);

    // 최고점 채택
    const prevBest = hardshipState.currentVerseScore;
    if (prevBest === null || score > prevBest) {
        hardshipState.currentVerseScore = score;
        hardshipState.currentVerseTranscript = transcript;
    }

    hardshipState.lastTranscript = hardshipState.currentVerseTranscript;
    hardshipState.locked = true;

    const bestScore = hardshipState.currentVerseScore;
    const feedbackType = bestScore >= 80 ? 'correct' : bestScore >= 50 ? 'info' : 'wrong';
    const improved = prevBest !== null && score > prevBest ? ` (↑${prevBest}%→${score}%)` : '';
    hardshipState.feedback = {
        type: feedbackType,
        message: t('hardship_endurance_score', { score: bestScore, n: hardshipState.studiedCount + 1 }) + improved
    };

    if (bestScore >= 80) SoundEffect.playCorrect && SoundEffect.playCorrect();
    else if (bestScore < 50) SoundEffect.playWrong && SoundEffect.playWrong();

    renderHardshipEnduranceVerse();
    updateBattleUI();
}

function retryHardshipEnduranceSpeech() {
    if (!hardshipState.locked) return;
    hardshipState.locked = false;
    hardshipState.feedback = null;
    renderHardshipEnduranceVerse();
    updateBattleUI();
}

function confirmHardshipEnduranceVerse() {
    // 현재 구절 점수를 확정하고 승점 적용 후 다음 구절로
    const score = hardshipState.currentVerseScore ?? 0;
    hardshipState.speechScores.push(score);
    hardshipState.studiedCount += 1;

    // 쿨다운 체크 (forcedChapter 기준, 첫 확정 시 1회만 판단)
    if (!hardshipState.rewardBlocked && hardshipState.forcedChapter != null) {
        hardshipState.rewardBlocked = isHardshipChapterDoneToday('endurance', hardshipState.forcedChapter);
    }

    let earned = 0;
    if (!hardshipState.rewardBlocked) {
        if (score >= 80) earned = playerHearts;
        else if (score >= 50) earned = Math.round(playerHearts * 0.5);
        if (earned > 0) awardHardshipScore(earned);
    }

    // 다음 구절 상태로 초기화
    hardshipState.currentVerseScore = null;
    hardshipState.currentVerseTranscript = '';

    loadNextHardshipVerse();
}

function renderHardshipAddressVerse() {
    const hintBtn = document.getElementById('common-hardship-hint-btn');
    if (hintBtn) hintBtn.style.display = 'none';
    const field = document.querySelector('.battle-field');
    const control = document.querySelector('.battle-control');
    if (!field || !control || !hardshipState.currentVerse) return;

    field.innerHTML = `
        <div class="verse-indicator">${t('hardship_address_indicator')}</div>
        <div class="hardship-verse-card">
            <div class="hardship-mode-tag">${getHardshipModeMeta('address').icon} ${getHardshipModeMeta('address').summary}</div>
            <div class="hardship-verse-text">${(currentLang === 'en' && hardshipState.currentVerse.textEn) ? hardshipState.currentVerse.textEn : (hardshipState.currentVerse.displayText || hardshipState.currentVerse.text)}</div>
            ${buildHardshipFeedbackHtml()}
        </div>
    `;

    // 첫 렌더 시 단계 초기화
    if (!hardshipState.addressPhase) {
        hardshipState.addressPhase = hardshipState.forcedChapter != null ? 'verse' : 'chapter';
    }

    renderHardshipAddressControl(control);
}

function renderHardshipAddressControl(control) {
    if (hardshipState.awaitingNext) {
        // 제출 완료 상태: 요약 + 다음 버튼
        control.innerHTML = `
            <div class="hardship-control-row">
                <button id="hardship-next-btn" class="btn-attack" onclick="proceedHardshipToNextVerse()" style="background:#2ecc71;">${t('hardship_btn_next')}</button>
            </div>
        `;
        return;
    }

    if (hardshipState.addressPhase === 'chapter') {
        let buttonsHtml = '';
        for (let ch = 1; ch <= 22; ch++) {
            buttonsHtml += `<button class="addr-ch-btn" onclick="selectHardshipChapter(${ch})">${t('hardship_address_ch_btn', { ch })}</button>`;
        }
        control.innerHTML = `
            <div class="addr-grid-wrap">
                <div class="addr-grid-label">${t('hardship_address_ask_chapter')}</div>
                <div class="addr-chapter-grid">${buttonsHtml}</div>
            </div>
        `;
    } else {
        const chapter = hardshipState.selectedChapter;
        const maxVerse = bibleData[chapter] ? bibleData[chapter].length : 1;
        let buttonsHtml = '';
        for (let v = 1; v <= maxVerse; v++) {
            buttonsHtml += `<button class="addr-v-btn" onclick="selectHardshipVerse(${v})">${t('hardship_address_v_btn', { v })}</button>`;
        }
        const canGoBack = hardshipState.forcedChapter == null;
        control.innerHTML = `
            <div class="addr-grid-wrap">
                <div class="addr-grid-label">
                    ${canGoBack ? `<button class="addr-back-btn" onclick="backToHardshipChapter()">←</button>` : ''}
                    ${t('hardship_address_ask_verse', { ch: chapter })}
                </div>
                <div class="addr-verse-grid">${buttonsHtml}</div>
            </div>
        `;
    }
}

function selectHardshipChapter(ch) {
    if (hardshipState.locked) return;
    hardshipState.selectedChapter = ch;
    hardshipState.selectedVerse = 1;
    hardshipState.addressPhase = 'verse';
    renderHardshipAddressControl(document.querySelector('.battle-control'));
}

function selectHardshipVerse(v) {
    if (hardshipState.locked) return;
    hardshipState.selectedVerse = v;
    submitHardshipAddressGuess();
}

function backToHardshipChapter() {
    if (hardshipState.locked || hardshipState.forcedChapter != null) return;
    hardshipState.addressPhase = 'chapter';
    renderHardshipAddressControl(document.querySelector('.battle-control'));
}

function awardHardshipScore(points) {
    if (!points || points <= 0) return;

    hardshipState.score += points;
    leagueData.myScore = (leagueData.myScore || 0) + points;
    leagueData.myMonthlyScore = (leagueData.myMonthlyScore || 0) + points;
    leagueData.totalScore = (leagueData.totalScore || 0) + points;
    leagueData.yearlyScore = (leagueData.yearlyScore || 0) + points;
    userStats.totalScoreEarned = (userStats.totalScoreEarned || 0) + points;

    if (typeof updateMyScorePanel === 'function') updateMyScorePanel();
    saveGameData();
}

function submitHardshipAddressGuess() {
    if (!window.isHardshipMode || hardshipState.mode !== 'address' || hardshipState.locked || !hardshipState.currentVerse) return;

    hardshipState.locked = true;
    hardshipState.awaitingNext = true;
    hardshipState.answeredCount += 1;

    const guessedChapter = hardshipState.selectedChapter;
    const guessedVerse = hardshipState.selectedVerse;
    const isCorrect = guessedChapter === hardshipState.currentVerse.chapter && guessedVerse === hardshipState.currentVerse.verse;

    if (isCorrect) {
        const earnedPoints = playerHearts;
        awardHardshipScore(earnedPoints);
        hardshipState.studiedCount += 1;
        hardshipState.feedback = {
            type: 'success',
            message: t('hardship_feedback_correct', { label: t('label_revelation_ref', { ch: hardshipState.currentVerse.chapter, v: hardshipState.currentVerse.verse }), pts: earnedPoints })
        };
        if (typeof SoundEffect !== 'undefined' && SoundEffect.playCorrect) SoundEffect.playCorrect();
        renderHardshipAddressVerse();
        updateBattleUI();
        return;
    }

    playerHearts = Math.max(0, playerHearts - 1);
    wrongCount += 1;
    hardshipState.feedback = {
        type: 'error',
        message: t('hardship_feedback_wrong_address', { label: t('label_revelation_ref', { ch: hardshipState.currentVerse.chapter, v: hardshipState.currentVerse.verse }) })
    };
    if (typeof SoundEffect !== 'undefined' && SoundEffect.playWrong) SoundEffect.playWrong();
    if (typeof SoundEffect !== 'undefined' && SoundEffect.playHeartLoss) SoundEffect.playHeartLoss();
    renderHardshipAddressVerse();
    updateBattleUI();
}

function renderHardshipMemoryVerse() {
    const field = document.querySelector('.battle-field');
    const control = document.querySelector('.battle-control');
    if (!field || !control || !hardshipState.currentVerse) return;

    initializeHardshipMemorySlots();
    const activeValidSlotIndex = getHardshipActiveValidSlotIndex();

    const typingBoardHtml = getHardshipActiveText(hardshipState.currentVerse).split('').map((character, index) => {
        if (!isHardshipTypingTargetChar(character)) {
            const extraClass = character === ' ' ? ' space' : '';
            const displayChar = character === ' ' ? '&nbsp;' : character;
            return `<span class="hardship-fixed-char${extraClass}">${displayChar}</span>`;
        }

        const currentValue = hardshipState.memorySlots[index] || '';
        const isHintRevealed = hardshipState.revealedHints.indexOf(index) !== -1;
        const validSlotIndex = getHardshipValidSlotIndexByVerseIndex(index);
        const isWrong = hardshipState.wrongSlots && hardshipState.wrongSlots.indexOf(index) !== -1;
        const slotClasses = [
            'char-slot',
            'hardship-char-slot',
            !isHintRevealed ? 'is-valid' : '',
            character === ' ' ? 'is-space' : '',
            isHintRevealed ? 'hint-revealed' : '',
            currentValue ? 'filled' : '',
            isWrong ? 'wrong' : '',
            !isHintRevealed && activeValidSlotIndex === validSlotIndex ? 'active' : ''
        ].filter(Boolean).join(' ');
        const displayValue = currentValue || '&nbsp;';
        return `<button type="button" class="${slotClasses}" data-index="${index}" onclick="focusHardshipMemoryHiddenInput()" ontouchstart="focusHardshipMemoryHiddenInput()" ${hardshipState.locked ? 'disabled' : ''}>${displayValue}</button>`;
    }).join('');

    const hiddenInputMaxLength = getHardshipFillableVerseLength();

    const ultimateActive = !!hardshipState.ultimateMemoryMode;

    field.innerHTML = `
        <div class="verse-indicator">${t('hardship_memory_indicator')}</div>
        <div class="hardship-verse-card" onclick="focusHardshipMemoryHiddenInput()" ontouchstart="focusHardshipMemoryHiddenInput()">
            <div class="hardship-mode-tag">[${hardshipState.currentVerse.label}]</div>
            <div class="hardship-typing-board${ultimateActive ? ' hardship-ultimate-active' : ''}" onclick="focusHardshipMemoryHiddenInput()" ontouchstart="focusHardshipMemoryHiddenInput()">${typingBoardHtml}</div>
            <input
                id="hidden-typing-input"
                class="hardship-memory-hidden-input"
                type="text"
                value="${escapeHardshipInputValue(hardshipState.memoryTypedText || '')}"
                maxlength="${hiddenInputMaxLength}"
                autocomplete="off"
                autocapitalize="off"
                spellcheck="false"
                oninput="handleHardshipMemoryInput(event)"
            />
            ${buildHardshipFeedbackHtml()}
        </div>
    `;

    control.innerHTML = `
        <div class="hardship-ultimate-row" style="${hardshipState.awaitingNext ? 'display:none;' : ''}">
            <button id="btn-hardship-ultimate" class="btn-hardship-ultimate${ultimateActive ? ' active' : ''}" onclick="toggleHardshipUltimateMode()" ${hardshipState.locked ? 'disabled' : ''}>${ultimateActive ? t('btn_ultimate_memory_off') : t('btn_ultimate_memory')}</button>
        </div>
        <div class="hardship-control-row">
            <button id="hardship-memory-submit-btn" class="btn-attack" onclick="submitHardshipMemoryGuess()" style="${hardshipState.awaitingNext ? 'display:none;' : ''}" ${hardshipState.locked ? 'disabled' : ''}>${t('hardship_btn_submit')}</button>
            <button id="hardship-next-btn" class="btn-attack" onclick="proceedHardshipToNextVerse()" style="background:#2ecc71; ${hardshipState.awaitingNext ? '' : 'display:none;'}">${t('hardship_btn_next')}</button>
            <button class="btn-reset-step5" onclick="resetHardshipMemoryInputs()" style="${hardshipState.awaitingNext ? 'display:none;' : ''}" ${hardshipState.locked ? 'disabled' : ''}>${t('hardship_btn_reset_input')}</button>
        </div>
    `;

    bindHardshipMemoryInputGuards();

    if (!hardshipState.locked) {
        setTimeout(() => focusHardshipMemoryHiddenInput(), 0);
    }
}

function focusHardshipMemoryHiddenInput() {
    const input = document.getElementById('hidden-typing-input');
    if (!input || hardshipState.locked) return;
    input.focus();
    moveHardshipMemoryCursorToEnd(input);
}

function moveHardshipMemoryCursorToEnd(input) {
    if (!input || typeof input.setSelectionRange !== 'function') return;

    const end = input.value.length;
    input.setSelectionRange(end, end);
}

function bindHardshipMemoryInputGuards() {
    const input = document.getElementById('hidden-typing-input');
    if (!input || input.dataset.guardsBound === 'true') return;

    const blockArrowNavigation = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            if (!hardshipState.locked && !hardshipState.awaitingNext) {
                input.blur();
                submitHardshipMemoryGuess();
            }
            return;
        }

        if (event.key === 'Tab') {
            event.preventDefault();
            return;
        }

        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
            event.preventDefault();
            moveHardshipMemoryCursorToEnd(input);
        }
    };

    const forceCursorToEnd = () => {
        moveHardshipMemoryCursorToEnd(input);
    };

    const onCompositionStart = () => { hardshipState.isComposing = true; };
    const onCompositionEnd = () => {
        hardshipState.isComposing = false;
        if (!window.isHardshipMode || hardshipState.mode !== 'memory' || hardshipState.locked) return;
        hardshipState.memoryTypedText = input.value;
        updateHardshipMemoryBoard();
        moveHardshipMemoryCursorToEnd(input);
    };

    input.addEventListener('keydown', blockArrowNavigation);
    input.addEventListener('click', forceCursorToEnd);
    input.addEventListener('touchend', forceCursorToEnd);
    input.addEventListener('focus', forceCursorToEnd);
    input.addEventListener('compositionstart', onCompositionStart);
    input.addEventListener('compositionend', onCompositionEnd);
    input.dataset.guardsBound = 'true';
}

function escapeHardshipInputValue(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function getHardshipFillableVerseLength() {
    if (!hardshipState.currentVerse) return 0;
    return getHardshipActiveText(hardshipState.currentVerse).length;
}

function getHardshipValidSlotIndexByVerseIndex(verseIndex) {
    if (!hardshipState.currentVerse) return -1;

    let count = 0;
    const activeText = getHardshipActiveText(hardshipState.currentVerse);
    for (let index = 0; index <= verseIndex; index++) {
        const character = activeText.charAt(index);
        if (!isHardshipTypingTargetChar(character)) continue;
        if (hardshipState.revealedHints.indexOf(index) !== -1) continue;
        count += 1;
    }
    return count - 1;
}

function getHardshipActiveValidSlotIndex() {
    const validSlotCount = getHardshipInputTargetCount();
    const currentLength = Array.from(String(hardshipState.memoryTypedText || '')).length;
    return currentLength < validSlotCount ? currentLength : -1;
}

function getHardshipInputTargetCount() {
    if (!hardshipState.currentVerse) return 0;

    let count = 0;
    getHardshipActiveText(hardshipState.currentVerse).split('').forEach((character, index) => {
        if (!isHardshipTypingTargetChar(character)) return;
        if (hardshipState.revealedHints.indexOf(index) !== -1) return;
        count += 1;
    });
    return count;
}

function initializeHardshipMemorySlots() {
    if (!hardshipState.currentVerse) return;

    const activeText = getHardshipActiveText(hardshipState.currentVerse);
    activeText.split('').forEach((character, index) => {
        if (!isHardshipTypingTargetChar(character)) {
            hardshipState.memorySlots[index] = character;
            return;
        }

        if (hardshipState.revealedHints.indexOf(index) !== -1) {
            hardshipState.memorySlots[index] = activeText.charAt(index);
            return;
        }

        hardshipState.memorySlots[index] = '';
    });

    mapHardshipTypedTextToSlots(hardshipState.memoryTypedText || '');
}

function mapHardshipTypedTextToSlots(currentText) {
    if (!hardshipState.currentVerse) return;

    const typedChars = Array.from(String(currentText || ''));
    let typedIndex = 0;
    const activeText = getHardshipActiveText(hardshipState.currentVerse);

    activeText.split('').forEach((character, index) => {
        if (!isHardshipTypingTargetChar(character)) return;
        if (hardshipState.revealedHints.indexOf(index) !== -1) {
            hardshipState.memorySlots[index] = activeText.charAt(index);
            return;
        }

        hardshipState.memorySlots[index] = typedIndex < typedChars.length ? typedChars[typedIndex] : '';
        typedIndex += 1;
    });
}

function updateHardshipMemoryBoard() {
    if (!hardshipState.currentVerse) return;

    initializeHardshipMemorySlots();

    const text = String(hardshipState.memoryTypedText || '');
    const slots = document.querySelectorAll('.char-slot.is-valid');
    let targetScrollSlot = null;

    slots.forEach((slot, index) => {
        if (index < text.length) {
            slot.innerText = text[index];
            slot.classList.add('filled');
        } else {
            slot.innerText = '';
            slot.classList.remove('filled');
        }
        slot.classList.remove('active');
    });

    if (text.length < slots.length && slots[text.length]) {
        slots[text.length].classList.add('active');
        targetScrollSlot = slots[text.length];
    } else if (slots.length > 0) {
        targetScrollSlot = slots[slots.length - 1];
    }

    const submitBtn = document.getElementById('hardship-memory-submit-btn');
    if (submitBtn && !hardshipState.locked && !hardshipState.awaitingNext) {
        submitBtn.disabled = false;
    }

    if (targetScrollSlot && !hardshipState.isComposing) {
        clearTimeout(updateHardshipMemoryBoard._scrollTimer);
        const slotToScroll = targetScrollSlot;
        updateHardshipMemoryBoard._scrollTimer = setTimeout(() => {
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
            if (isIOS && window.visualViewport) {
                // iOS: visualViewport로 키보드 높이 반영한 수동 스크롤
                const container = slotToScroll.closest('.battle-field');
                if (container) {
                    const slotRect = slotToScroll.getBoundingClientRect();
                    const vvTop = window.visualViewport.offsetTop;
                    const vvHeight = window.visualViewport.height;
                    const slotCenter = slotRect.top + slotRect.height / 2;
                    const targetCenter = vvTop + vvHeight / 2;
                    const diff = slotCenter - targetCenter;
                    if (Math.abs(diff) > 40) {
                        container.scrollTop += diff;
                    }
                }
            } else if (typeof slotToScroll.scrollIntoView === 'function') {
                slotToScroll.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 80);
    }
}

function handleHardshipMemoryInput(event) {
    if (!window.isHardshipMode || hardshipState.mode !== 'memory' || hardshipState.locked) return;

    if (typeof SoundEffect !== 'undefined' && SoundEffect.playKeyStroke && !event.isComposing) SoundEffect.playKeyStroke();

    const input = event.target;
    const currentText = input.value;
    const targetLength = Number(input.maxLength) || getHardshipFillableVerseLength();

    hardshipState.memoryTypedText = currentText;
    updateHardshipMemoryBoard();
    moveHardshipMemoryCursorToEnd(input);

    if (currentText.length === targetLength) {
        const submitButton = document.getElementById('hardship-memory-submit-btn');
        if (submitButton && typeof submitButton.scrollIntoView === 'function') {
            submitButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
}

function resetHardshipMemoryInputs() {
    if (!window.isHardshipMode || hardshipState.mode !== 'memory' || hardshipState.locked || !hardshipState.currentVerse) return;

    hardshipState.memoryTypedText = '';

    renderHardshipMemoryVerse();
}

function toggleHardshipUltimateMode() {
    if (!window.isHardshipMode || hardshipState.mode !== 'memory' || hardshipState.locked) return;
    hardshipState.ultimateMemoryMode = !hardshipState.ultimateMemoryMode;

    const board = document.querySelector('.hardship-typing-board');
    const btn = document.getElementById('btn-hardship-ultimate');
    const ultimateRow = document.querySelector('.hardship-ultimate-row');

    if (board) {
        if (hardshipState.ultimateMemoryMode) {
            board.classList.add('hardship-ultimate-active');
        } else {
            board.classList.remove('hardship-ultimate-active');
        }
    }
    if (btn) {
        btn.textContent = hardshipState.ultimateMemoryMode ? t('btn_ultimate_memory_off') : t('btn_ultimate_memory');
        btn.classList.toggle('active', hardshipState.ultimateMemoryMode);
    }
    setTimeout(() => focusHardshipMemoryHiddenInput(), 0);
}

function showHardshipNotFilledAlert() {
    const existingAlert = document.getElementById('hardship-not-filled-alert');
    if (existingAlert) return;

    const verseCard = document.querySelector('.hardship-verse-card');
    if (!verseCard) return;

    const alert = document.createElement('div');
    alert.id = 'hardship-not-filled-alert';
    alert.className = 'hardship-not-filled-alert';
    alert.textContent = t('hardship_memory_not_filled');
    verseCard.appendChild(alert);

    setTimeout(() => {
        if (alert.parentNode) alert.parentNode.removeChild(alert);
    }, 2000);
}

function getNextHardshipHintIndex() {
    if (!hardshipState.currentVerse) return -1;

    const text = getHardshipActiveText(hardshipState.currentVerse);
    for (let index = 0; index < text.length; index++) {
        if (!isHardshipTypingTargetChar(text.charAt(index))) continue;
        if (!hardshipCharsMatch(hardshipState.memorySlots[index] || '', text.charAt(index))) {
            return index;
        }
    }

    return -1;
}

function getHardshipMemoryHintPlan() {
    if (!hardshipState.currentVerse) {
        return { autoSpaces: '', hintIndex: -1 };
    }

    const verseText = getHardshipActiveText(hardshipState.currentVerse);
    let simulatedTypedText = String(hardshipState.memoryTypedText || '');
    const revealedHintSet = new Set(hardshipState.revealedHints || []);

    const findNextIndex = () => {
        let typedIndex = 0;

        for (let index = 0; index < verseText.length; index++) {
            const character = verseText.charAt(index);
            if (!isHardshipTypingTargetChar(character)) continue;

            let currentValue = '';
            if (revealedHintSet.has(index)) {
                currentValue = character;
            } else {
                currentValue = typedIndex < simulatedTypedText.length ? simulatedTypedText.charAt(typedIndex) : '';
                typedIndex += 1;
            }

            if (!hardshipCharsMatch(currentValue, character)) {
                return index;
            }
        }

        return -1;
    };

    let autoSpaces = '';
    let hintIndex = findNextIndex();

    while (hintIndex !== -1 && verseText.charAt(hintIndex) === ' ') {
        autoSpaces += ' ';
        simulatedTypedText += ' ';
        hintIndex = findNextIndex();
    }

    return { autoSpaces, hintIndex };
}

function useHardshipMemoryHint() {
    if (!window.isHardshipMode || hardshipState.mode !== 'memory' || hardshipState.locked) return;

    const hiddenInput = document.getElementById('hidden-typing-input');
    const { autoSpaces, hintIndex } = getHardshipMemoryHintPlan();

    if (hintIndex === -1) {
        alert(t('alert_blank_all_filled'));
        return;
    }

    if (myGems < HINT_COST) {
        alert(t('alert_blank_hint_no_gems', { cost: HINT_COST }));
        return;
    }

    if (!confirm(t('hardship_hint_confirm', { cost: HINT_COST }))) {
        return;
    }

    myGems -= HINT_COST;
    if (typeof SoundEffect !== 'undefined' && SoundEffect.playHint) SoundEffect.playHint();
    if (autoSpaces) {
        hardshipState.memoryTypedText = `${String(hardshipState.memoryTypedText || '')}${autoSpaces}`;

        if (hiddenInput) {
            hiddenInput.value = hardshipState.memoryTypedText;
            hiddenInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    if (hardshipState.revealedHints.indexOf(hintIndex) === -1) {
        hardshipState.revealedHints.push(hintIndex);
    }

    updateGemDisplay();
    saveGameData();
    renderHardshipMemoryVerse();
}

function submitHardshipMemoryGuess() {
    if (!window.isHardshipMode || hardshipState.mode !== 'memory' || hardshipState.locked || !hardshipState.currentVerse) return;

    const filledLength = String(hardshipState.memoryTypedText || '').length;
    const targetLength = getHardshipInputTargetCount();
    if (filledLength < targetLength) {
        showHardshipNotFilledAlert();
        setTimeout(() => focusHardshipMemoryHiddenInput(), 0);
        return;
    }

    const hiddenInput = document.getElementById('hidden-typing-input');
    if (hiddenInput && typeof hiddenInput.blur === 'function') {
        hiddenInput.blur();
    }

    hardshipState.locked = true;
    hardshipState.awaitingNext = true;
    hardshipState.answeredCount += 1;

    const text = getHardshipActiveText(hardshipState.currentVerse);
    let isCorrect = true;
    for (let index = 0; index < text.length; index++) {
        const answerChar = text.charAt(index);
        if (!isHardshipTypingTargetChar(answerChar)) continue;
        if (!hardshipCharsMatch(hardshipState.memorySlots[index] || '', answerChar)) {
            isCorrect = false;
            break;
        }
    }

    if (isCorrect) {
        const earnedPoints = playerHearts * 2;
        awardHardshipScore(earnedPoints);
        hardshipState.studiedCount += 1;
        hardshipState.wrongSlots = [];
        hardshipState.feedback = {
            type: 'success',
            message: t('hardship_feedback_correct', { label: t('label_revelation_ref', { ch: hardshipState.currentVerse.chapter, v: hardshipState.currentVerse.verse }), pts: earnedPoints })
        };
        if (typeof SoundEffect !== 'undefined' && SoundEffect.playCorrect) SoundEffect.playCorrect();
        renderHardshipMemoryVerse();
        updateBattleUI();
        return;
    }

    // 오답 슬롯 인덱스 수집
    hardshipState.wrongSlots = [];
    for (let index = 0; index < text.length; index++) {
        const answerChar = text.charAt(index);
        if (!isHardshipTypingTargetChar(answerChar)) continue;
        if (hardshipState.revealedHints.indexOf(index) !== -1) continue;
        if (!hardshipCharsMatch(hardshipState.memorySlots[index] || '', answerChar)) {
            hardshipState.wrongSlots.push(index);
        }
    }

    playerHearts = Math.max(0, playerHearts - 1);
    wrongCount += 1;
    hardshipState.feedback = {
        type: 'error',
        message: t('hardship_feedback_wrong_memory', { text: (currentLang === 'en' && hardshipState.currentVerse.textEn) ? hardshipState.currentVerse.textEn : hardshipState.currentVerse.text })
    };
    if (typeof SoundEffect !== 'undefined' && SoundEffect.playWrong) SoundEffect.playWrong();
    if (typeof SoundEffect !== 'undefined' && SoundEffect.playHeartLoss) SoundEffect.playHeartLoss();
    renderHardshipMemoryVerse();
    updateBattleUI();
}

function finishHardshipSession(reason) {
    // result-notif-wrap 초기화 (이전 결과 화면의 알림 버튼 잔상 제거)
    const notifWrapHs = document.getElementById('result-notif-wrap');
    if (notifWrapHs) { notifWrapHs.innerHTML = ''; notifWrapHs.style.display = 'none'; }

    clearHardshipPendingTimeout();

    const duration = Math.floor((Date.now() - stageStartTime) / 1000);
    const minutes = String(Math.floor(duration / 60)).padStart(2, '0');
    const seconds = String(duration % 60).padStart(2, '0');
    const accuracy = hardshipState.answeredCount > 0
        ? Math.max(0, Math.round(((hardshipState.answeredCount - wrongCount) / hardshipState.answeredCount) * 100))
        : 100;
    const modeMeta = getHardshipModeMeta(hardshipState.mode);

    const resultTitle = document.getElementById('result-title');
    const resultStreakText = document.getElementById('result-streak-text');
    const resultExpLabel = document.getElementById('result-exp-label');
    const resultContinueBtn = document.getElementById('result-continue-btn');
    const resultTime = document.getElementById('result-time');
    const resultAccuracy = document.getElementById('result-accuracy');
    const resultExp = document.getElementById('result-exp');

    if (reason !== 'hearts') {
        if (typeof triggerConfetti === 'function') triggerConfetti();
        if (typeof SoundEffect !== 'undefined' && SoundEffect.playClear) SoundEffect.playClear();
    }

    if (resultTitle) {
        if (reason === 'completed') resultTitle.innerText = t('hardship_result_completed', { title: modeMeta.title });
        else if (reason === 'hearts') resultTitle.innerText = t('hardship_result_hearts_end', { title: modeMeta.title });
        else resultTitle.innerText = t('hardship_result_ended', { title: modeMeta.title });
    }

    const enduranceAvgScore = hardshipState.mode === 'endurance' && hardshipState.speechScores.length > 0
        ? Math.round(hardshipState.speechScores.reduce((a, b) => a + b, 0) / hardshipState.speechScores.length)
        : null;

    if (resultStreakText) {
        if (hardshipState.mode === 'endurance') {
            resultStreakText.innerHTML = t('hardship_session_endurance_speech', {
                count: `<span id="streak-days">${hardshipState.studiedCount}</span>`
            });
        } else {
            resultStreakText.innerHTML = t('hardship_session_score', { score: `<span id="streak-days">${hardshipState.score}</span>` });
        }
    }

    if (resultExpLabel) {
        resultExpLabel.innerText = hardshipState.mode === 'endurance' ? t('hardship_result_score_label') : t('hardship_result_score_label');
    }

    if (resultContinueBtn) {
        resultContinueBtn.innerText = t('hardship_result_back');
    }

    const hsStatLabels = document.getElementById('result-modal').querySelectorAll('.stat-label');
    if (hsStatLabels[0]) hsStatLabels[0].textContent = t('result_label_time');
    if (hsStatLabels[1]) hsStatLabels[1].textContent = t('result_label_accuracy');

    if (resultTime) resultTime.innerText = `${minutes}:${seconds}`;
    if (resultAccuracy) {
        resultAccuracy.innerText = hardshipState.mode === 'endurance'
            ? `${enduranceAvgScore ?? 0}%`
            : `${accuracy}%`;
    }
    if (resultExp) {
        resultExp.innerText = hardshipState.mode === 'endurance'
            ? `${hardshipState.score}`
            : `${hardshipState.score}`;
    }

    // 암송의 고난 완주 시 평균 80% 이상이면 해당 장 하위 스테이지 클리어 + 보스 클리어 효과
    if (reason === 'completed' && hardshipState.mode === 'endurance' && enduranceAvgScore >= 80) {
        const _enduranceNeedSwap = hardshipState.applyToFree && activeMode === 'kings';
        if (_enduranceNeedSwap) switchMode('free');
        const _enduranceChapters = hardshipState.forcedChapter != null
            ? [hardshipState.forcedChapter]
            : [...new Set(hardshipState.queue.map(id => parseInt(id.split('-')[0], 10)))].sort((a, b) => a - b);
        let _enduranceGemGrand = 0, _enduranceEligGrand = 0, _enduranceTotalGrand = 0, _enduranceAllCooldown = true;
        for (const chNum of _enduranceChapters) {
            if (isHardshipChapterDoneToday('endurance', chNum)) continue;
            _enduranceAllCooldown = false;
            const chData = gameData.find(c => c.id === chNum);
            if (!chData || !chData.stages) continue;
            let subGemTotal = 0, eligibleSubCount = 0, totalSubCount = 0;
            chData.stages.forEach(targetStage => {
                if (targetStage.type !== 'normal') return;
                const subId = targetStage.id;
                if (!stageMastery[subId]) stageMastery[subId] = 0;
                if (!stageClearDate[subId]) stageClearDate[subId] = getMemoryQuizDate();
                targetStage.cleared = true;
                stageLastClear[subId] = Date.now();
                totalSubCount++;
                const subStatus = getReviewStatus(subId);
                if (subStatus.isEligible) {
                    const { earnedGem: earned } = advanceReviewStep(subId);
                    stageMastery[subId]++;
                    subGemTotal += earned;
                    eligibleSubCount++;
                } else {
                    subGemTotal += 10;
                }
            });
            // 보스 클리어 효과
            const bossId = `${chNum}-boss`;
            if (!stageMastery[bossId]) stageMastery[bossId] = 0;
            stageMastery[bossId]++;
            myGems += subGemTotal;
            _enduranceGemGrand += subGemTotal;
            _enduranceEligGrand += eligibleSubCount;
            _enduranceTotalGrand += totalSubCount;
        }
        saveGameData();
        syncToFirestore(); // [Firestore] 암송의 고난 클리어
        if (_enduranceNeedSwap) switchMode('kings');
        if (_enduranceAllCooldown) {
            if (resultStreakText) resultStreakText.innerHTML += `<br><span style="font-size:13px;color:#f39c12;">${t('hardship_cooldown_result')}</span>`;
        } else if (_enduranceTotalGrand > 0 && resultStreakText) {
            resultStreakText.innerHTML += `<br><span style="font-size:13px;color:#aad4ff;">${t('hardship_gem_summary', { gem: _enduranceGemGrand, total: _enduranceTotalGrand, eligible: _enduranceEligGrand })}</span>`;
        }
    }

    // 주소의 고난 / 망각의 고난 완주 시 해당 장 하위 스테이지 클리어 (보스 클리어와 동일 처리)
    if (reason === 'completed' && (hardshipState.mode === 'address' || hardshipState.mode === 'memory')) {
        const _hardshipNeedSwap = hardshipState.applyToFree && activeMode === 'kings';
        if (_hardshipNeedSwap) switchMode('free');
        const _hardshipChapters = hardshipState.forcedChapter != null
            ? [hardshipState.forcedChapter]
            : [...new Set(hardshipState.queue.map(id => parseInt(id.split('-')[0], 10)))].sort((a, b) => a - b);
        let _hardshipGemGrand = 0, _hardshipEligGrand = 0, _hardshipTotalGrand = 0, _hardshipAllCooldown = true;
        for (const chNum of _hardshipChapters) {
            if (isHardshipChapterDoneToday(hardshipState.mode, chNum)) continue;
            _hardshipAllCooldown = false;
            const chData = gameData.find(c => c.id === chNum);
            if (!chData || !chData.stages) continue;
            let subGemTotal = 0, eligibleSubCount = 0, totalSubCount = 0;
            chData.stages.forEach(targetStage => {
                if (targetStage.type !== 'normal') return;
                const subId = targetStage.id;
                if (!stageMastery[subId]) stageMastery[subId] = 0;
                if (!stageClearDate[subId]) stageClearDate[subId] = getMemoryQuizDate();
                targetStage.cleared = true;
                stageLastClear[subId] = Date.now();
                totalSubCount++;
                const subStatus = getReviewStatus(subId);
                if (subStatus.isEligible) {
                    const { earnedGem: earned } = advanceReviewStep(subId);
                    stageMastery[subId]++;
                    subGemTotal += earned;
                    eligibleSubCount++;
                } else {
                    subGemTotal += 10;
                }
            });
            myGems += subGemTotal;
            _hardshipGemGrand += subGemTotal;
            _hardshipEligGrand += eligibleSubCount;
            _hardshipTotalGrand += totalSubCount;
        }
        saveGameData();
        syncToFirestore(); // [Firestore] 하드십 클리어
        if (_hardshipNeedSwap) switchMode('kings');
        if (_hardshipAllCooldown) {
            if (resultStreakText) resultStreakText.innerHTML += `<br><span style="font-size:13px;color:#f39c12;">${t('hardship_cooldown_result')}</span>`;
        } else if (_hardshipTotalGrand > 0 && resultStreakText) {
            resultStreakText.innerHTML += `<br><span style="font-size:13px;color:#aad4ff;">${t('hardship_gem_summary', { gem: _hardshipGemGrand, total: _hardshipTotalGrand, eligible: _hardshipEligGrand })}</span>`;
        }
    }

    // 암송의 고난 완주: 기록 저장 및 결과 화면에 히스토리 표시 (단일 장 및 범위 세션)
    const enduranceHistoryHtml = (() => {
        if (reason !== 'completed' || hardshipState.mode !== 'endurance') return '';
        const avg = enduranceAvgScore ?? 0;
        const sessionDuration = Math.floor((Date.now() - stageStartTime) / 1000);
        const record = {
            avgScore: avg,
            total: hardshipState.queue.length,
            score: hardshipState.score,
            date: Date.now(),
            duration: sessionDuration
        };

        const ch = hardshipState.forcedChapter;
        if (ch != null) {
            // 단일 장 세션
            if (!hardshipEnduranceClearHistory[ch]) hardshipEnduranceClearHistory[ch] = [];
            hardshipEnduranceClearHistory[ch].push(record);
            if (hardshipEnduranceClearHistory[ch].length > 10) hardshipEnduranceClearHistory[ch].shift();
            saveGameData();
            syncToFirestore(); // [Firestore] 인내의 고난 완주 기록

            const history = hardshipEnduranceClearHistory[ch];
            const rows = history.slice().reverse().map((r, i) => {
                const isThis = i === 0;
                const dur = r.duration != null ? r.duration : 0;
                const timeStr = `${String(Math.floor(dur / 60)).padStart(2,'0')}:${String(dur % 60).padStart(2,'0')}`;
                const cleared = r.avgScore >= 80 ? '✅' : '—';
                return `<tr class="${isThis ? 'hardship-history-current' : ''}">
                    <td>${isThis ? '▶' : history.length - i}회</td>
                    <td class="hardship-history-score">${r.avgScore}%</td>
                    <td>${r.score}점</td>
                    <td>${timeStr}</td>
                    <td>${cleared}</td>
                </tr>`;
            }).join('');
            return `<div class="hardship-history-wrap">
                <div class="hardship-history-title">🎤 ${ch}장 암송의 고난 · 최근 ${history.length}회</div>
                <table class="hardship-history-table">
                    <thead><tr><th></th><th>평균</th><th>승점</th><th>시간</th><th>클리어</th></tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>`;
        } else {
            // 범위 세션: 각 챕터에 동일 기록 저장
            const chapters = [...new Set(hardshipState.queue.map(id => parseInt(id.split('-')[0], 10)))].sort((a, b) => a - b);
            let savedCount = 0;
            for (const chNum of chapters) {
                if (!hardshipEnduranceClearHistory[chNum]) hardshipEnduranceClearHistory[chNum] = [];
                hardshipEnduranceClearHistory[chNum].push(record);
                if (hardshipEnduranceClearHistory[chNum].length > 10) hardshipEnduranceClearHistory[chNum].shift();
                savedCount++;
            }
            if (savedCount > 0) {
                saveGameData();
                syncToFirestore(); // [Firestore] 인내의 고난 범위 완주 기록
            }
            if (chapters.length === 0) return '';
            const rangeLabel = chapters.length === 1 ? `${chapters[0]}장` : `${chapters[0]}–${chapters[chapters.length - 1]}장`;
            const dur = sessionDuration;
            const timeStr = `${String(Math.floor(dur / 60)).padStart(2,'0')}:${String(dur % 60).padStart(2,'0')}`;
            const cleared = avg >= 80 ? '✅' : '—';
            return `<div class="hardship-history-wrap">
                <div class="hardship-history-title">🎤 ${rangeLabel} 암송의 고난 범위 세션</div>
                <table class="hardship-history-table">
                    <thead><tr><th>평균</th><th>승점</th><th>시간</th><th>클리어</th></tr></thead>
                    <tbody><tr class="hardship-history-current">
                        <td class="hardship-history-score">${avg}%</td>
                        <td>${record.score}점</td>
                        <td>${timeStr}</td>
                        <td>${cleared}</td>
                    </tr></tbody>
                </table>
            </div>`;
        }
    })();

    // 주소의 고난 완주: 기록 저장 및 결과 화면에 히스토리 표시 (단일 장 및 범위 세션)
    const addressHistoryHtml = (() => {
        if (reason !== 'completed' || hardshipState.mode !== 'address') return '';
        const sessionDuration = Math.floor((Date.now() - stageStartTime) / 1000);
        const record = {
            correct: hardshipState.studiedCount,
            total: hardshipState.queue.length,
            score: hardshipState.score,
            date: Date.now(),
            duration: sessionDuration
        };

        const ch = hardshipState.forcedChapter;
        if (ch != null) {
            if (!hardshipAddressClearHistory[ch]) hardshipAddressClearHistory[ch] = [];
            hardshipAddressClearHistory[ch].push(record);
            if (hardshipAddressClearHistory[ch].length > 10) hardshipAddressClearHistory[ch].shift();
            saveGameData();
            syncToFirestore(); // [Firestore] 주소 고난 완주 기록

            const history = hardshipAddressClearHistory[ch];
            const rows = history.slice().reverse().map((r, i) => {
                const isThis = i === 0;
                const dur = r.duration != null ? r.duration : 0;
                const timeStr = `${String(Math.floor(dur / 60)).padStart(2,'0')}:${String(dur % 60).padStart(2,'0')}`;
                return `<tr class="${isThis ? 'hardship-history-current' : ''}">
                    <td>${isThis ? '▶' : history.length - i}회</td>
                    <td class="hardship-history-score">${r.correct}/${r.total}</td>
                    <td>${r.score}점</td>
                    <td>${timeStr}</td>
                </tr>`;
            }).join('');
            return `<div class="hardship-history-wrap">
                <div class="hardship-history-title">🎯 ${ch}장 주소의 고난 · 최근 ${history.length}회</div>
                <table class="hardship-history-table">
                    <thead><tr><th></th><th>맞힌 수</th><th>승점</th><th>클리어 시간</th></tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>`;
        } else {
            const chapters = [...new Set(hardshipState.queue.map(id => parseInt(id.split('-')[0], 10)))].sort((a, b) => a - b);
            let savedCount = 0;
            for (const chNum of chapters) {
                if (!hardshipAddressClearHistory[chNum]) hardshipAddressClearHistory[chNum] = [];
                hardshipAddressClearHistory[chNum].push(record);
                if (hardshipAddressClearHistory[chNum].length > 10) hardshipAddressClearHistory[chNum].shift();
                savedCount++;
            }
            if (savedCount > 0) { saveGameData(); syncToFirestore(); } // [Firestore] 주소 고난 범위 완주
            if (chapters.length === 0) return '';
            const rangeLabel = chapters.length === 1 ? `${chapters[0]}장` : `${chapters[0]}–${chapters[chapters.length - 1]}장`;
            const dur = sessionDuration;
            const timeStr = `${String(Math.floor(dur / 60)).padStart(2,'0')}:${String(dur % 60).padStart(2,'0')}`;
            return `<div class="hardship-history-wrap">
                <div class="hardship-history-title">🎯 ${rangeLabel} 주소의 고난 범위 세션</div>
                <table class="hardship-history-table">
                    <thead><tr><th>맞힌 수</th><th>승점</th><th>시간</th></tr></thead>
                    <tbody><tr class="hardship-history-current">
                        <td class="hardship-history-score">${record.correct}/${record.total}</td>
                        <td>${record.score}점</td>
                        <td>${timeStr}</td>
                    </tr></tbody>
                </table>
            </div>`;
        }
    })();

    // 망각의 고난 완주: 기록 저장 및 결과 화면에 히스토리 표시 (단일 장 및 범위 세션)
    const memoryHistoryHtml = (() => {
        if (reason !== 'completed' || hardshipState.mode !== 'memory') return '';
        const sessionDuration = Math.floor((Date.now() - stageStartTime) / 1000);
        const record = {
            correct: hardshipState.studiedCount,
            total: hardshipState.queue.length,
            score: hardshipState.score,
            date: Date.now(),
            duration: sessionDuration
        };

        const ch = hardshipState.forcedChapter;
        if (ch != null) {
            if (!hardshipMemoryClearHistory[ch]) hardshipMemoryClearHistory[ch] = [];
            hardshipMemoryClearHistory[ch].push(record);
            if (hardshipMemoryClearHistory[ch].length > 10) hardshipMemoryClearHistory[ch].shift();
            saveGameData();
            syncToFirestore(); // [Firestore] 망각 고난 완주 기록

            const history = hardshipMemoryClearHistory[ch];
            const rows = history.slice().reverse().map((r, i) => {
                const isThis = i === 0;
                const dur = r.duration != null ? r.duration : 0;
                const timeStr = `${String(Math.floor(dur / 60)).padStart(2,'0')}:${String(dur % 60).padStart(2,'0')}`;
                return `<tr class="${isThis ? 'hardship-history-current' : ''}">
                    <td>${isThis ? '▶' : history.length - i}회</td>
                    <td class="hardship-history-score">${r.correct}/${r.total}</td>
                    <td>${r.score}점</td>
                    <td>${timeStr}</td>
                </tr>`;
            }).join('');
            return `<div class="hardship-history-wrap">
                <div class="hardship-history-title">⌨️ ${ch}장 망각의 고난 · 최근 ${history.length}회</div>
                <table class="hardship-history-table">
                    <thead><tr><th></th><th>맞힌 수</th><th>승점</th><th>클리어 시간</th></tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>`;
        } else {
            const chapters = [...new Set(hardshipState.queue.map(id => parseInt(id.split('-')[0], 10)))].sort((a, b) => a - b);
            let savedCount = 0;
            for (const chNum of chapters) {
                if (!hardshipMemoryClearHistory[chNum]) hardshipMemoryClearHistory[chNum] = [];
                hardshipMemoryClearHistory[chNum].push(record);
                if (hardshipMemoryClearHistory[chNum].length > 10) hardshipMemoryClearHistory[chNum].shift();
                savedCount++;
            }
            if (savedCount > 0) { saveGameData(); syncToFirestore(); } // [Firestore] 망각 고난 범위 완주
            if (chapters.length === 0) return '';
            const rangeLabel = chapters.length === 1 ? `${chapters[0]}장` : `${chapters[0]}–${chapters[chapters.length - 1]}장`;
            const dur = sessionDuration;
            const timeStr = `${String(Math.floor(dur / 60)).padStart(2,'0')}:${String(dur % 60).padStart(2,'0')}`;
            return `<div class="hardship-history-wrap">
                <div class="hardship-history-title">⌨️ ${rangeLabel} 망각의 고난 범위 세션</div>
                <table class="hardship-history-table">
                    <thead><tr><th>맞힌 수</th><th>승점</th><th>시간</th></tr></thead>
                    <tbody><tr class="hardship-history-current">
                        <td class="hardship-history-score">${record.correct}/${record.total}</td>
                        <td>${record.score}점</td>
                        <td>${timeStr}</td>
                    </tr></tbody>
                </table>
            </div>`;
        }
    })();

    const resultModal = document.getElementById('result-modal');
    if (resultModal) {
        // result-quote 초기화 (이전 일반 스테이지 복습 문구 잔류 방지)
        const quoteEl = document.getElementById('result-quote');
        if (quoteEl) { quoteEl.innerHTML = ''; quoteEl.style.display = 'none'; }

        const existingHistory = resultModal.querySelector('.hardship-history-wrap');
        if (existingHistory) existingHistory.remove();
        const historyHtml = enduranceHistoryHtml || addressHistoryHtml || memoryHistoryHtml;
        if (historyHtml) {
            const continueBtn = resultModal.querySelector('#result-continue-btn');
            if (continueBtn) {
                continueBtn.insertAdjacentHTML('beforebegin', historyHtml);
            } else {
                resultModal.querySelector('.result-card').insertAdjacentHTML('beforeend', historyHtml);
            }
        }
        resultModal.classList.add('active');
    }
}

// ── 게임 가이드 모달 ──────────────────────────────

function getGuidePages() {
    return [
        { title: t('guide_p1_title'), html: t('guide_p1_html') },
        { title: t('guide_p2_title'), html: t('guide_p2_html') },
        { title: t('guide_p3_title'), html: t('guide_p3_html') },
        { title: t('guide_p4_title'), html: t('guide_p4_html') },
        { title: t('guide_p5_title'), html: t('guide_p5_html') },
    ];
}

let guidePage = 0;

function openGuideModal() {
    guidePage = 0;
    renderGuidePage();
    document.getElementById('guide-modal').style.display = 'flex';
}

function closeGuideModal() {
    document.getElementById('guide-modal').style.display = 'none';
}

function guideChangePage(delta) {
    const pages = getGuidePages();
    guidePage = Math.max(0, Math.min(pages.length - 1, guidePage + delta));
    renderGuidePage();
}

function renderGuidePage() {
    const pages = getGuidePages();
    const page = pages[guidePage];
    const total = pages.length;

    document.getElementById('guide-content').innerHTML =
        `<h3 style="margin-top:0;">${page.title}</h3>${page.html}`;

    document.getElementById('guide-page-label').textContent = `${guidePage + 1} / ${total}`;
    document.getElementById('guide-prev-btn').style.visibility = guidePage === 0 ? 'hidden' : 'visible';

    const nextBtn = document.getElementById('guide-next-btn');
    if (guidePage === total - 1) {
        nextBtn.textContent = t('btn_done_check');
        nextBtn.onclick = closeGuideModal;
    } else {
        nextBtn.textContent = t('btn_next');
        nextBtn.onclick = () => guideChangePage(1);
    }

    document.getElementById('guide-dots').innerHTML =
        pages.map((_, i) =>
            `<span style="display:inline-block; width:8px; height:8px; border-radius:50%; margin:0 3px; background:${i === guidePage ? '#f1c40f' : '#ccc'};"></span>`
        ).join('');
}
// ── 기억하시나요? 퀴즈 ──────────────────────────────────────────────────────
(function () {
    var _quizSessionUsed = [];
    var _currentQuizStageId = null;

    function getMemoryQuizDate() {
        var now = new Date();
        var d;
        if (now.getHours() < 6) {
            d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        } else {
            d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        }
        return d.toISOString().split('T')[0];
    }
    window.getMemoryQuizDate = getMemoryQuizDate;

    function getPreviousMemoryQuizDate() {
        var today = getMemoryQuizDate();
        var d = new Date(today);
        d.setDate(d.getDate() - 1);
        return d.toISOString().split('T')[0];
    }

    function getMemoryQuizCorrectToday() {
        var today = getMemoryQuizDate();
        var savedDate = localStorage.getItem('kingsRoad_memoryQuizDate');
        if (savedDate !== today) {
            localStorage.setItem('kingsRoad_memoryQuizDate', today);
            localStorage.setItem('kingsRoad_memoryQuizCorrect', '{}');
            return {};
        }
        try {
            return JSON.parse(localStorage.getItem('kingsRoad_memoryQuizCorrect') || '{}');
        } catch (e) { return {}; }
    }

    function markQuizCorrect(stageId) {
        var correct = getMemoryQuizCorrectToday();
        correct[stageId] = true;
        localStorage.setItem('kingsRoad_memoryQuizCorrect', JSON.stringify(correct));
    }

    // 타임스탬프를 퀴즈 날짜 문자열(YYYY-MM-DD)로 변환 (오전 6시 이전은 전날로 처리)
    function timestampToQuizDate(ts) {
        var d = new Date(ts);
        var adj;
        if (d.getHours() < 6) {
            adj = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1);
        } else {
            adj = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        }
        return adj.toISOString().split('T')[0];
    }

    function getEligibleQuizVerses() {
        var correct = getMemoryQuizCorrectToday();
        var yesterday = getPreviousMemoryQuizDate();
        // 최초 클리어가 아닌, 어제 클리어한(stageLastClear 기준) 모든 구절 대상
        var allCleared = Object.keys(stageMastery).filter(function (id) {
            if (!/^\d+-\d+$/.test(id)) return false;
            if (!stageLastClear[id]) return false;
            return timestampToQuizDate(stageLastClear[id]) === yesterday;
        });
        var eligible = allCleared.filter(function (id) {
            return !correct[id];
        });
        var filtered = eligible.filter(function (id) { return _quizSessionUsed.indexOf(id) === -1; });
        if (filtered.length === 0 && eligible.length > 0) {
            _quizSessionUsed = [];
            filtered = eligible;
        }
        return filtered;
    }

    var _quizPhase = 'chapter';
    var _selectedQuizChapter = 1;
    var _selectedQuizVerse = 1;

    function renderMemoryQuizAddressControl() {
        var container = document.getElementById('quiz-addr-input');
        if (!container) return;

        if (_quizPhase === 'chapter') {
            var btns = '';
            for (var ch = 1; ch <= 22; ch++) {
                btns += '<button class="addr-ch-btn" onclick="selectMemoryQuizChapter(' + ch + ')">' + ch + '장</button>';
            }
            container.innerHTML =
                '<div class="addr-grid-wrap">' +
                '<div class="addr-grid-label">계시록 몇 장인가요?</div>' +
                '<div class="addr-chapter-grid">' + btns + '</div>' +
                '</div>';
        } else {
            var verseCount = (bibleData[_selectedQuizChapter] && bibleData[_selectedQuizChapter].length) || 1;
            var vbtns = '';
            for (var v = 1; v <= verseCount; v++) {
                vbtns += '<button class="addr-v-btn" onclick="selectMemoryQuizVerse(' + v + ')">' + v + '절</button>';
            }
            container.innerHTML =
                '<div class="addr-grid-wrap">' +
                '<div class="addr-grid-label">' +
                '<button class="addr-back-btn" onclick="backToMemoryQuizChapter()">←</button>' +
                '계시록 <span class="addr-selected-chapter" style="cursor:pointer;" onclick="backToMemoryQuizChapter()">' + _selectedQuizChapter + '장</span> 몇 절인가요?' +
                '</div>' +
                '<div class="addr-verse-grid">' + vbtns + '</div>' +
                '</div>';
        }
    }

    window.selectMemoryQuizChapter = function (ch) {
        _selectedQuizChapter = ch;
        _quizPhase = 'verse';
        renderMemoryQuizAddressControl();
    };

    window.selectMemoryQuizVerse = function (v) {
        _selectedQuizVerse = v;
        handleMemoryQuizSubmit();
    };

    window.backToMemoryQuizChapter = function () {
        _quizPhase = 'chapter';
        renderMemoryQuizAddressControl();
    };

    function populateChapterSelect() {
        _quizPhase = 'chapter';
        _selectedQuizChapter = 1;
        _selectedQuizVerse = 1;
        renderMemoryQuizAddressControl();
    }

    window.showMemoryQuizOverlay = function () {
        _quizSessionUsed = [];
        var eligible = getEligibleQuizVerses();
        if (eligible.length === 0) {
            if (typeof goMap === 'function') goMap();
            return;
        }
        var overlay = document.getElementById('memory-quiz-overlay');
        if (overlay) overlay.style.display = 'flex';

        populateChapterSelect();

        var stageId = eligible[Math.floor(Math.random() * eligible.length)];
        _currentQuizStageId = stageId;
        _quizSessionUsed.push(stageId);
        renderMemoryQuizQuestion(stageId);
    };

    function renderMemoryQuizQuestion(stageId) {
        _currentQuizStageId = stageId;
        var parts = stageId.split('-');
        var chapter = parseInt(parts[0]);
        var verse = parseInt(parts[1]);
        var verseData = bibleData[chapter] && bibleData[chapter][verse - 1];
        var text = verseData ? verseData.text : '';
        // 동일 텍스트 중복 구절(7교회 마지막 절)은 교회 이름을 뒤에 표시
        var CHURCH_NAMES = { '2-29': '두아디라 교회', '3-6': '사데 교회', '3-13': '빌라델비아 교회', '3-22': '라오디게아 교회' };
        if (CHURCH_NAMES[stageId]) text = text + ' (' + CHURCH_NAMES[stageId] + ')';
        document.getElementById('memory-quiz-verse-text').textContent = '\u201c' + text + '\u201d';
        document.getElementById('memory-quiz-question-panel').style.display = '';

        // 카드 초기화
        var card = document.getElementById('quiz-card');
        if (card) card.classList.remove('flipped');
        var backEl = document.getElementById('quiz-card-back');
        if (backEl) backEl.classList.remove('correct', 'incorrect');

        // 컨트롤 표시, 결과 숨김
        var controls = document.getElementById('quiz-controls');
        var resultArea = document.getElementById('quiz-result-area');
        if (controls) controls.style.display = '';
        if (resultArea) resultArea.style.display = 'none';

        // 남은 퀴즈 개수 표시
        var remaining = getEligibleQuizVerses().length;
        var remEl = document.getElementById('quiz-remaining');
        if (remEl) {
            remEl.textContent = remaining <= 1 ? '남은 퀴즈: ' + remaining + '개 (마지막)' : '남은 퀴즈: ' + remaining + '개';
        }

        // 장/절 버튼 그리드 초기화
        _quizPhase = 'chapter';
        _selectedQuizChapter = 1;
        _selectedQuizVerse = 1;
        renderMemoryQuizAddressControl();
    }

    window.handleMemoryQuizSubmit = function () {
        var selectedChapter = _selectedQuizChapter;
        var selectedVerse = _selectedQuizVerse;

        var parts = _currentQuizStageId.split('-');
        var correctChapter = parseInt(parts[0]);
        var correctVerse = parseInt(parts[1]);
        var isCorrect = (selectedChapter === correctChapter && selectedVerse === correctVerse);

        // 뒷면 채우기
        var vd = bibleData[correctChapter] && bibleData[correctChapter][correctVerse - 1];
        document.getElementById('quiz-back-verse').textContent = '\u201c' + (vd ? vd.text : '') + '\u201d';
        document.getElementById('quiz-back-address').textContent = t('label_revelation_ref', { ch: correctChapter, v: correctVerse });

        // 카드 뒤집기
        var card = document.getElementById('quiz-card');
        var backEl = document.getElementById('quiz-card-back');
        if (card) card.classList.add('flipped');
        if (backEl) {
            backEl.classList.remove('correct', 'incorrect');
            backEl.classList.add(isCorrect ? 'correct' : 'incorrect');
        }

        // 컨트롤 숨김, 결과 표시
        var controls = document.getElementById('quiz-controls');
        var resultArea = document.getElementById('quiz-result-area');
        if (controls) controls.style.display = 'none';
        if (resultArea) resultArea.style.display = 'flex';

        var resultText = document.getElementById('memory-quiz-result-text');
        if (isCorrect) {
            myGems += 10;
            updateGemDisplay();
            if (typeof saveGameData === 'function') saveGameData();
            markQuizCorrect(_currentQuizStageId);
            resultText.innerHTML =
                '<span style="color:#f1c40f; font-size:1.8em;">\u2736</span><br>' +
                '<span style="color:#f1c40f;">\uc815\ub2f5\uc785\ub2c8\ub2e4!</span><br>' +
                '<span style="font-size:0.95em; color:#f1c40f;">💎 보석 10개 획득</span>';
        } else {
            resultText.innerHTML =
                '<span style="color:#e74c3c; font-size:1.2em;">\uc544\uc26c\uc6b4\ub370\uc694</span><br>' +
                '<span style="font-size:0.88em; color:#aaa;">\ub0b4\uac00 \uc120\ud0dd: \uacc4\uc2dc\ub85d ' + selectedChapter + '\uc7a5 ' + selectedVerse + '\uc808</span>';
        }
    };

    window.handleMemoryQuizContinue = function () {
        var eligible = getEligibleQuizVerses();
        if (eligible.length === 0) {
            window.handleMemoryQuizStop();
            return;
        }
        var stageId = eligible[Math.floor(Math.random() * eligible.length)];
        _quizSessionUsed.push(stageId);
        renderMemoryQuizQuestion(stageId);
    };

    window.handleMemoryQuizStop = function () {
        var overlay = document.getElementById('memory-quiz-overlay');
        if (overlay) overlay.style.display = 'none';
        if (typeof goMap === 'function') goMap();
    };
})();
